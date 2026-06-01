import Booking from '../models/Booking.js';
import Chef from '../models/Chef.js';
import User from '../models/User.js';
import geminiService from './geminiService.js';
import { withLangfuseObservation, withLangfuseTrace } from './langfuseService.js';

const REQUIRED_BOOKING_FIELDS = ['serviceType', 'date', 'time', 'guestCount', 'location'];
const VALID_SERVICE_TYPES = ['birthday', 'marriage', 'daily'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MEMORY_NOTES = 30;
const MEMORY_TTL_DAYS = 180;
const CONFIRMATION_FIELDS = ['chef', 'details', 'menu', 'price'];

const PII_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?91[-\s]?)?[6-9]\d{9}\b/,
  /\b(?:\d[ -]*?){12,19}\b/
];

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /system\s*prompt/i,
  /developer\s*message/i,
  /reveal\s+(your\s+)?(prompt|instructions|secrets)/i,
  /bypass\s+(safety|guardrails|policy)/i,
  /act\s+as\s+(?:a\s+)?(?:system|developer|admin)/i
];

const now = () => new Date();

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeServiceType = (value) => {
  if (!value || value === 'not_found') return '';
  const normalized = String(value).toLowerCase().trim();
  if (['birthday', 'party', 'birthday party'].includes(normalized)) return 'birthday';
  if (['marriage', 'wedding', 'wedding reception'].includes(normalized)) return 'marriage';
  if (['daily', 'daily cooking', 'home cooking'].includes(normalized)) return 'daily';
  return VALID_SERVICE_TYPES.includes(normalized) ? normalized : '';
};

const normalizeDate = (value) => {
  if (!value || value === 'not_found') return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const normalizeTime = (value) => {
  if (!value || value === 'not_found') return '';
  const match = String(value).match(/^([0-1]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return '';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
};

const sanitizeText = (value, maxLength = 500) => {
  if (!value) return '';
  return String(value).replace(/[<>]/g, '').trim().slice(0, maxLength);
};

const redactPII = (text) => {
  let redacted = String(text || '');
  PII_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, '[REDACTED]');
  });
  return redacted;
};

const hasPromptInjection = (text) => INJECTION_PATTERNS.some(pattern => pattern.test(String(text || '')));

const getMinutes = (timeStr) => {
  const [hours, minutes] = String(timeStr || '00:00').split(':').map(Number);
  return (hours * 60) + minutes;
};

const formatTime = (minutes) => {
  const safeMinutes = Math.max(0, Math.min(23 * 60 + 59, minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const sameDate = (left, right) => {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  return leftDate.toISOString().slice(0, 10) === rightDate.toISOString().slice(0, 10);
};

const buildMissingQuestions = (missingFields) => {
  const prompts = {
    serviceType: 'What type of service do you need: birthday, marriage, or daily cooking?',
    date: 'What date should the chef come?',
    time: 'What time should the booking start?',
    guestCount: 'How many guests should the chef cook for?',
    location: 'What service location should the chef come to?'
  };

  return missingFields.map(field => prompts[field]).filter(Boolean);
};

export const validateAgentImage = (file) => {
  if (!file) {
    return { valid: false, message: 'Image is required' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return { valid: false, message: 'Only JPEG, PNG, and WebP images are supported' };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { valid: false, message: 'Image must be 5MB or smaller' };
  }

  return { valid: true };
};

export const validateBookingIntent = (rawIntent = {}) => {
  const intent = {
    serviceType: normalizeServiceType(rawIntent.serviceType),
    date: normalizeDate(rawIntent.date),
    time: normalizeTime(rawIntent.time),
    guestCount: Math.max(0, Math.floor(toNumber(rawIntent.guestCount, 0))),
    budget: Math.max(0, Math.floor(toNumber(rawIntent.budget, 0))),
    duration: Math.min(24, Math.max(1, Math.floor(toNumber(rawIntent.duration, 2)))),
    location: sanitizeText(rawIntent.location, 300),
    cuisine: sanitizeText(rawIntent.cuisine, 100),
    dietary: sanitizeText(rawIntent.dietary, 300),
    specialRequests: sanitizeText(rawIntent.specialRequests, 1000)
  };

  const missingFields = REQUIRED_BOOKING_FIELDS.filter(field => {
    if (field === 'guestCount') return intent.guestCount <= 0;
    return !intent[field];
  });

  if (intent.date && intent.time) {
    const requestedAt = new Date(`${intent.date}T${intent.time}:00`);
    if (requestedAt <= now()) {
      missingFields.push('date');
    }
  }

  return {
    intent,
    missingFields: [...new Set(missingFields)],
    valid: missingFields.length === 0
  };
};

class AgentRun {
  constructor({ userId, input }) {
    this.userId = userId;
    this.startedAt = now();
    this.input = redactPII(input);
    this.steps = [];
  }

  record(step, metadata = {}) {
    this.steps.push({
      step,
      at: now().toISOString(),
      metadata: JSON.parse(JSON.stringify(metadata))
    });
  }

  finish(status) {
    return {
      userId: this.userId,
      status,
      input: this.input,
      startedAt: this.startedAt.toISOString(),
      finishedAt: now().toISOString(),
      durationMs: now().getTime() - this.startedAt.getTime(),
      steps: this.steps
    };
  }
}

export class BookingAgentService {
  async planBooking({ userId, message, context = {}, confirmDraft = false }) {
    return withLangfuseTrace({
      name: 'booking-agent.plan',
      userId,
      sessionId: context.sessionId,
      input: {
        message,
        hasContextIntent: Boolean(context.intent),
        confirmDraft
      },
      metadata: { feature: 'booking-agent' },
      tags: ['agentic-ai', 'booking']
    }, () => this.planBookingUntraced({ userId, message, context, confirmDraft }));
  }

  async planBookingUntraced({ userId, message, context = {}, confirmDraft = false }) {
    const run = new AgentRun({ userId, input: message });

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      run.record('guardrail.reject.empty_message');
      return this.buildResponse({ status: 'rejected', message: 'Booking request is required', run });
    }

    if (message.length > 2000) {
      run.record('guardrail.reject.too_long', { length: message.length });
      return this.buildResponse({ status: 'rejected', message: 'Booking request is too long', run });
    }

    if (hasPromptInjection(message)) {
      run.record('guardrail.reject.prompt_injection');
      return this.buildResponse({
        status: 'rejected',
        message: 'I can help with chef bookings, but I cannot follow instructions that try to override system behavior.',
        run
      });
    }

    const safeMessage = redactPII(message);
    run.record('input.accepted');

    const parsedIntent = await this.safeParseIntent(safeMessage, run);
    const memoryContext = await this.getMemoryContext(userId, run);
    const mergedIntent = {
      ...memoryContext.intentHints,
      ...parsedIntent,
      ...context.intent,
      location: context.intent?.location || parsedIntent.location || ''
    };
    const validation = validateBookingIntent(mergedIntent);
    run.record('schema.validate_booking_intent', {
      valid: validation.valid,
      missingFields: validation.missingFields
    });

    if (!validation.valid) {
      await this.updateMemory(userId, safeMessage, run);
      return this.buildResponse({
        status: 'needs_input',
        message: 'I need a few more details before I can draft the booking.',
        data: {
          intent: validation.intent,
          missingFields: validation.missingFields,
          questions: buildMissingQuestions(validation.missingFields)
        },
        run
      });
    }

    const chefs = await this.findChefs(validation.intent, run);
    if (chefs.length === 0) {
      await this.updateMemory(userId, safeMessage, run);
      return this.buildResponse({
        status: 'no_chefs_found',
        message: 'I could not find an active chef matching this request.',
        data: { intent: validation.intent, chefs: [] },
        run
      });
    }

    const rawAvailabilityResult = await this.checkAvailability(chefs, validation.intent, run);
    const availabilityResult = Array.isArray(rawAvailabilityResult)
      ? { availableChefs: rawAvailabilityResult, insights: [] }
      : rawAvailabilityResult;
    const recommendedChefs = availabilityResult.availableChefs.slice(0, 3);

    if (recommendedChefs.length === 0) {
      await this.updateMemory(userId, safeMessage, run);
      return this.buildResponse({
        status: 'no_availability',
        message: 'The matching chefs are not available for that time slot. Try another time or choose a different chef.',
        data: {
          intent: validation.intent,
          chefs: [],
          availabilityInsights: availabilityResult.insights
        },
        run
      });
    }

    const selectedChefId = context.selectedChefId || context.chefId || context.confirmedChefId;
    const selectedChef = selectedChefId
      ? recommendedChefs.find(chef => String(chef._id) === String(selectedChefId))
      : null;

    if (!selectedChef) {
      await this.updateMemory(userId, safeMessage, run);
      run.record('human_confirmation.chef_required', { recommendations: recommendedChefs.length });
      return this.buildResponse({
        status: 'needs_chef_confirmation',
        message: 'Choose one chef before I price the menu and prepare the booking draft.',
        data: {
          intent: validation.intent,
          recommendedChefs,
          availabilityInsights: availabilityResult.insights,
          memoryContext,
          requiredConfirmations: ['chef']
        },
        run
      });
    }

    const quote = this.estimatePrice(selectedChef, validation.intent, run);
    const menu = await this.generateMenu(validation.intent, run);
    const draft = this.buildDraftBooking(selectedChef, validation.intent, quote, menu, run);

    await this.updateMemory(userId, safeMessage, run);

    const confirmations = context.confirmations || {};
    const missingConfirmations = CONFIRMATION_FIELDS.filter(field => !confirmations[field]);

    if (!confirmDraft || missingConfirmations.length > 0) {
      run.record('human_confirmation.required', { missingConfirmations });
      return this.buildResponse({
        status: 'needs_confirmation',
        message: 'Review and confirm each booking detail before creating a draft. No booking or payment has been created yet.',
        data: {
          intent: validation.intent,
          selectedChef,
          recommendedChefs,
          availabilityInsights: availabilityResult.insights,
          memoryContext,
          quote,
          menu,
          draftBooking: draft,
          confirmations,
          requiredConfirmations: missingConfirmations
        },
        run
      });
    }

    const booking = await this.createDraftBooking(userId, draft, run);
    return this.buildResponse({
      status: 'draft_created',
      message: 'Draft booking created. Payment still requires explicit user confirmation.',
      data: {
        booking,
        quote,
        menu
      },
      run
    });
  }

  async safeParseIntent(message, run) {
    const started = now();
    try {
      const parsed = await withLangfuseObservation({
        name: 'booking-agent.parse-request',
        asType: 'generation',
        input: { message },
        metadata: { tool: 'parseBookingIntent' }
      }, () => geminiService.parseBookingIntent(message));
      run.record('tool.parseBookingIntent.success', {
        latencyMs: now().getTime() - started.getTime(),
        estimatedCostUnits: 1
      });
      return parsed && !parsed.error ? parsed : {};
    } catch (error) {
      run.record('tool.parseBookingIntent.failure', {
        latencyMs: now().getTime() - started.getTime(),
        error: error.message
      });
      return {};
    }
  }

  async findChefs(intent, run) {
    return withLangfuseObservation({
      name: 'booking-agent.findChefs',
      asType: 'tool',
      input: {
        serviceType: intent.serviceType,
        cuisine: intent.cuisine,
        location: intent.location
      }
    }, async () => {
      const query = { isActive: true };
      const orFilters = [];

      if (intent.cuisine) {
        orFilters.push({ specialty: new RegExp(intent.cuisine, 'i') });
      }

      if (intent.location) {
        orFilters.push({ city: new RegExp(intent.location, 'i') });
        orFilters.push({ serviceableLocations: new RegExp(intent.location, 'i') });
      }

      if (orFilters.length > 0) {
        query.$or = orFilters;
      }

      let chefs = await Chef.find(query)
        .select('name specialty city state serviceableLocations pricePerHour experienceYears averageRating totalReviews bio supportedOccasions supportedEventTypes workingHours blockedDates travelRadiusKm minimumNoticeHours maxGuests profileImage')
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(10)
        .lean();

      if (chefs.length === 0) {
        chefs = await Chef.find({ isActive: true })
          .select('name specialty city state serviceableLocations pricePerHour experienceYears averageRating totalReviews bio supportedOccasions supportedEventTypes workingHours blockedDates travelRadiusKm minimumNoticeHours maxGuests profileImage')
          .sort({ averageRating: -1, totalReviews: -1 })
          .limit(10)
          .lean();
      }

      run.record('tool.findChefs.success', { count: chefs.length });
      return chefs;
    });
  }

  async checkAvailability(chefs, intent, run) {
    return withLangfuseObservation({
      name: 'booking-agent.checkAvailability',
      asType: 'tool',
      input: {
        chefCount: chefs.length,
        date: intent.date,
        time: intent.time,
        guests: intent.guestCount
      }
    }, async () => {
      const requestedDate = new Date(intent.date);
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const chefIds = chefs.map(chef => chef._id);
    const bookings = await Booking.find({
      chef: { $in: chefIds },
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] }
    }).select('chef time duration').lean();

    const requestedStart = getMinutes(intent.time);
    const requestedEnd = requestedStart + (intent.duration * 60);
    const blockedChefIds = new Set();
    const insights = [];

    bookings.forEach(booking => {
      const bookingStart = getMinutes(booking.time);
      const bookingEnd = bookingStart + (booking.duration * 60);
      if (requestedStart < bookingEnd && requestedEnd > bookingStart) {
        blockedChefIds.add(String(booking.chef));
      }
    });

    const available = chefs.filter(chef => {
      const reasons = this.getChefAvailabilityIssues(chef, intent, requestedDate, requestedStart, requestedEnd, blockedChefIds);
      const isAvailable = reasons.length === 0;
      insights.push({
        chefId: String(chef._id),
        chefName: chef.name,
        available: isAvailable,
        reasons,
        alternatives: isAvailable ? [] : this.suggestAlternativeTimes(chef, requestedStart, intent.duration)
      });
      return isAvailable;
    });

    run.record('tool.checkAvailability.success', {
      checked: chefs.length,
      available: available.length,
      conflicts: blockedChefIds.size
    });
      return { availableChefs: available, insights };
    });
  }

  getChefAvailabilityIssues(chef, intent, requestedDate, requestedStart, requestedEnd, blockedChefIds) {
    const issues = [];
    const chefId = String(chef._id);
    const workingHours = chef.workingHours || {};
    const workingStart = getMinutes(workingHours.start || '09:00');
    const workingEnd = getMinutes(workingHours.end || '22:00');
    const workingDays = Array.isArray(workingHours.daysOfWeek) && workingHours.daysOfWeek.length > 0
      ? workingHours.daysOfWeek
      : [0, 1, 2, 3, 4, 5, 6];

    if (!workingDays.includes(requestedDate.getDay())) {
      issues.push('Chef does not work on that day.');
    }
    if (requestedStart < workingStart || requestedEnd > workingEnd) {
      issues.push(`Chef works ${formatTime(workingStart)}-${formatTime(workingEnd)}.`);
    }
    if ((chef.blockedDates || []).some(date => sameDate(date, requestedDate))) {
      issues.push('Chef has blocked this date.');
    }
    if (blockedChefIds.has(chefId)) {
      issues.push('Chef already has a booking during that slot.');
    }
    if (Number(chef.minimumNoticeHours || 0) > 0) {
      const noticeHours = (requestedDate.getTime() - now().getTime()) / (1000 * 60 * 60);
      if (noticeHours < Number(chef.minimumNoticeHours)) {
        issues.push(`Chef requires at least ${chef.minimumNoticeHours} hours notice.`);
      }
    }
    if (Number(chef.maxGuests || 1000) < intent.guestCount) {
      issues.push(`Chef supports up to ${chef.maxGuests} guests.`);
    }
    if (Array.isArray(chef.supportedEventTypes) && chef.supportedEventTypes.length > 0 && !chef.supportedEventTypes.includes(intent.serviceType)) {
      issues.push(`Chef does not support ${intent.serviceType} events.`);
    }

    return issues;
  }

  suggestAlternativeTimes(chef, requestedStart, duration) {
    const workingHours = chef.workingHours || {};
    const workingStart = getMinutes(workingHours.start || '09:00');
    const workingEnd = getMinutes(workingHours.end || '22:00');
    const durationMinutes = duration * 60;
    const candidates = [
      Math.max(workingStart, requestedStart - 60),
      Math.max(workingStart, requestedStart),
      Math.min(workingEnd - durationMinutes, requestedStart + 60)
    ];

    return [...new Set(candidates)]
      .filter(start => start >= workingStart && start + durationMinutes <= workingEnd)
      .map(formatTime)
      .slice(0, 3);
  }

  estimatePrice(chef, intent, run) {
    const bookingDate = new Date(intent.date);
    const day = bookingDate.getDay();
    const surgeMultiplier = [0, 5, 6].includes(day) ? 1.2 : 1;
    const basePrice = chef.pricePerHour * intent.duration;
    const guestMultiplier = intent.guestCount > 50 ? 1.15 : 1;
    const finalPrice = Math.round(basePrice * surgeMultiplier * guestMultiplier);

    const quote = {
      basePrice,
      finalPrice,
      surgeMultiplier,
      guestMultiplier,
      surgeReason: surgeMultiplier > 1 ? 'Weekend Demand' : '',
      currency: 'INR'
    };

    run.record('tool.estimatePrice.success', quote);
    return quote;
  }

  async generateMenu(intent, run) {
    const started = now();
    try {
      const menu = await withLangfuseObservation({
        name: 'booking-agent.generateMenu',
        asType: 'generation',
        input: {
          serviceType: intent.serviceType,
          guestCount: intent.guestCount,
          budget: intent.budget,
          cuisine: intent.cuisine,
          dietary: intent.dietary
        }
      }, () => geminiService.generateEventMenu({
        serviceType: intent.serviceType,
        guests: intent.guestCount,
        budget: intent.budget,
        cuisine: intent.cuisine,
        dietary: intent.dietary
      }));
      run.record('tool.generateMenu.success', {
        latencyMs: now().getTime() - started.getTime(),
        estimatedCostUnits: 1
      });
      return menu;
    } catch (error) {
      run.record('tool.generateMenu.failure', {
        latencyMs: now().getTime() - started.getTime(),
        error: error.message
      });
      return null;
    }
  }

  buildDraftBooking(chef, intent, quote, menu, run) {
    const draft = {
      chefId: String(chef._id),
      chefName: chef.name,
      date: intent.date,
      time: intent.time,
      duration: intent.duration,
      guestCount: intent.guestCount,
      location: intent.location,
      serviceType: intent.serviceType,
      specialRequests: intent.specialRequests,
      totalPrice: quote.finalPrice,
      basePrice: quote.basePrice,
      surgeMultiplier: quote.surgeMultiplier,
      surgeReason: quote.surgeReason,
      paymentStatus: 'pending',
      status: 'pending',
      aiGeneratedMenu: menu
    };

    run.record('tool.createDraftBooking.preview', {
      chefId: draft.chefId,
      totalPrice: draft.totalPrice
    });
    return draft;
  }

  async createDraftBooking(userId, draft, run) {
    const booking = await withLangfuseObservation({
      name: 'booking-agent.createDraftBooking',
      asType: 'tool',
      input: {
        chefId: draft.chefId,
        date: draft.date,
        time: draft.time,
        totalPrice: draft.totalPrice
      }
    }, () => Booking.create({
      user: userId,
      chef: draft.chefId,
      date: new Date(draft.date),
      time: draft.time,
      duration: draft.duration,
      guestCount: draft.guestCount,
      location: draft.location,
      serviceType: draft.serviceType,
      specialRequests: draft.specialRequests || '',
      totalPrice: draft.totalPrice,
      basePrice: draft.basePrice,
      surgeMultiplier: draft.surgeMultiplier,
      surgeReason: draft.surgeReason,
      status: 'pending',
      paymentStatus: 'pending',
      notes: 'AI agent draft. Payment requires explicit confirmation.'
    }));

    run.record('tool.createDraftBooking.success', { bookingId: String(booking._id) });
    return booking;
  }

  async updateMemory(userId, interactionText, run) {
    const started = now();
    try {
      const notes = await geminiService.extractCulinaryNotes(interactionText);
      const cleanNotes = this.cleanMemoryNotes(notes);

      if (cleanNotes.length === 0) {
        run.record('memory.noop', { latencyMs: now().getTime() - started.getTime() });
        return;
      }

      await this.saveMemoryNotes(userId, cleanNotes);
      run.record('memory.updated', {
        count: cleanNotes.length,
        latencyMs: now().getTime() - started.getTime(),
        estimatedCostUnits: 1
      });
    } catch (error) {
      run.record('memory.failure', { error: error.message });
    }
  }

  async getMemoryContext(userId, run) {
    const started = now();
    const emptyContext = {
      notes: [],
      groupedNotes: {},
      intentHints: {}
    };

    try {
      if (!userId) return emptyContext;

      const user = await User.findById(userId).select('aiNotes city location cuisinePreferences');
      if (!user) return emptyContext;

      const cutoff = now();
      cutoff.setDate(cutoff.getDate() - MEMORY_TTL_DAYS);

      const notes = (user.aiNotes || [])
        .map(note => typeof note === 'string'
          ? { text: sanitizeText(redactPII(note), 160), category: this.classifyMemoryNote(note), learnedAt: now() }
          : {
            text: sanitizeText(redactPII(note.text), 160),
            category: note.category || this.classifyMemoryNote(note.text || ''),
            learnedAt: note.learnedAt || now()
          })
        .filter(note => note.text && new Date(note.learnedAt) >= cutoff)
        .slice(-MAX_MEMORY_NOTES);

      const groupedNotes = notes.reduce((acc, note) => {
        acc[note.category] = acc[note.category] || [];
        acc[note.category].push(note.text);
        return acc;
      }, {});

      const intentHints = {};
      if (groupedNotes.budget_preferences?.length) {
        const budgetMatch = groupedNotes.budget_preferences.join(' ').match(/(?:rs\.?|₹|under|budget)\s*(\d{3,7})/i);
        if (budgetMatch) intentHints.budget = Number(budgetMatch[1]);
      }
      if (groupedNotes.location_preferences?.length) {
        intentHints.location = groupedNotes.location_preferences.at(-1).replace(/^User (?:often books in|prefers|is in)\s*/i, '');
      } else if (user.city) {
        intentHints.location = user.city;
      }
      if (groupedNotes.food_preferences?.length) {
        intentHints.cuisine = groupedNotes.food_preferences.at(-1).replace(/^User (?:prefers|likes|loves)\s*/i, '');
      } else if (Array.isArray(user.cuisinePreferences) && user.cuisinePreferences.length > 0) {
        intentHints.cuisine = user.cuisinePreferences[0];
      }
      if (groupedNotes.allergies?.length) {
        intentHints.dietary = groupedNotes.allergies.join('; ');
      }

      run.record('memory.context_loaded', {
        notes: notes.length,
        categories: Object.keys(groupedNotes),
        latencyMs: now().getTime() - started.getTime()
      });

      return { notes, groupedNotes, intentHints };
    } catch (error) {
      run.record('memory.context_failure', { error: error.message });
      return emptyContext;
    }
  }

  cleanMemoryNotes(notes) {
    if (!Array.isArray(notes)) return [];
    const seen = new Set();

    return notes
      .map(note => sanitizeText(redactPII(note), 160))
      .filter(note => note.length >= 8)
      .filter(note => {
        const key = note.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 5);
  }

  async saveMemoryNotes(userId, notes) {
    const user = await User.findById(userId).select('aiNotes');
    if (!user) return;

    const cutoff = now();
    cutoff.setDate(cutoff.getDate() - MEMORY_TTL_DAYS);

    const existingNotes = (user.aiNotes || [])
      .map(note => {
        if (typeof note === 'string') {
          return {
            text: sanitizeText(redactPII(note), 160),
            category: 'food_preferences',
            learnedAt: now()
          };
        }
        return {
          text: sanitizeText(redactPII(note.text), 160),
          category: note.category || this.classifyMemoryNote(note.text || ''),
          learnedAt: note.learnedAt || now()
        };
      })
      .filter(note => note.text && new Date(note.learnedAt) >= cutoff);

    const merged = [...existingNotes];
    notes.forEach(text => {
      if (!merged.some(note => note.text.toLowerCase() === text.toLowerCase())) {
        merged.push({
          text,
          category: this.classifyMemoryNote(text),
          learnedAt: now()
        });
      }
    });

    user.aiNotes = merged.slice(-MAX_MEMORY_NOTES);
    await user.save();
  }

  classifyMemoryNote(note) {
    const lower = note.toLowerCase();
    if (lower.includes('allerg') || lower.includes('no nuts') || lower.includes('avoid')) return 'allergies';
    if (lower.includes('budget') || lower.includes('under') || lower.includes('₹') || lower.includes('rs.')) return 'budget_preferences';
    if (lower.includes('patna') || lower.includes('mumbai') || lower.includes('delhi') || lower.includes('location') || lower.includes('books in')) return 'location_preferences';
    if (lower.includes('chef')) return 'chef_preferences';
    if (lower.includes('birthday') || lower.includes('marriage') || lower.includes('event')) return 'past_events';
    if (lower.includes('spicy') || lower.includes('vegetarian') || lower.includes('north indian') || lower.includes('prefer') || lower.includes('loves')) return 'food_preferences';
    if (lower.includes('ingredient') || lower.includes('kitchen')) return 'inventory';
    return 'food_preferences';
  }

  buildResponse({ status, message, data = {}, run }) {
    const trace = run.finish(status);
    console.info('[BookingAgent]', JSON.stringify({
      status,
      userId: trace.userId,
      durationMs: trace.durationMs,
      steps: trace.steps.map(step => step.step)
    }));

    return {
      success: !['rejected'].includes(status),
      status,
      message,
      data,
      trace
    };
  }
}

export default new BookingAgentService();
