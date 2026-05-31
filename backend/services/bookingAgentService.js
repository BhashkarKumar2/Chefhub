import Booking from '../models/Booking.js';
import Chef from '../models/Chef.js';
import User from '../models/User.js';
import geminiService from './geminiService.js';

const REQUIRED_BOOKING_FIELDS = ['serviceType', 'date', 'time', 'guestCount', 'location'];
const VALID_SERVICE_TYPES = ['birthday', 'marriage', 'daily'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MEMORY_NOTES = 30;
const MEMORY_TTL_DAYS = 180;

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
    const mergedIntent = {
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

    const availableChefs = await this.checkAvailability(chefs, validation.intent, run);
    const recommendedChefs = availableChefs.slice(0, 3);

    if (recommendedChefs.length === 0) {
      await this.updateMemory(userId, safeMessage, run);
      return this.buildResponse({
        status: 'no_availability',
        message: 'The matching chefs are not available for that time slot.',
        data: { intent: validation.intent, chefs: [] },
        run
      });
    }

    const quote = this.estimatePrice(recommendedChefs[0], validation.intent, run);
    const menu = await this.generateMenu(validation.intent, run);
    const draft = this.buildDraftBooking(recommendedChefs[0], validation.intent, quote, menu, run);

    await this.updateMemory(userId, safeMessage, run);

    if (!confirmDraft) {
      run.record('human_confirmation.required');
      return this.buildResponse({
        status: 'needs_confirmation',
        message: 'Review this draft before creating a booking. No booking or payment has been created yet.',
        data: {
          intent: validation.intent,
          recommendedChefs,
          quote,
          menu,
          draftBooking: draft
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
      const parsed = await geminiService.parseBookingIntent(message);
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
      .select('name specialty city serviceableLocations pricePerHour experienceYears averageRating totalReviews bio supportedOccasions profileImage')
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(10)
      .lean();

    if (chefs.length === 0) {
      chefs = await Chef.find({ isActive: true })
        .select('name specialty city serviceableLocations pricePerHour experienceYears averageRating totalReviews bio supportedOccasions profileImage')
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(10)
        .lean();
    }

    run.record('tool.findChefs.success', { count: chefs.length });
    return chefs;
  }

  async checkAvailability(chefs, intent, run) {
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

    const getMinutes = (timeStr) => {
      const [hours, minutes] = String(timeStr).split(':').map(Number);
      return hours * 60 + minutes;
    };

    const requestedStart = getMinutes(intent.time);
    const requestedEnd = requestedStart + (intent.duration * 60);
    const blockedChefIds = new Set();

    bookings.forEach(booking => {
      const bookingStart = getMinutes(booking.time);
      const bookingEnd = bookingStart + (booking.duration * 60);
      if (requestedStart < bookingEnd && requestedEnd > bookingStart) {
        blockedChefIds.add(String(booking.chef));
      }
    });

    const available = chefs.filter(chef => !blockedChefIds.has(String(chef._id)));
    run.record('tool.checkAvailability.success', {
      checked: chefs.length,
      available: available.length,
      conflicts: blockedChefIds.size
    });
    return available;
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
      const menu = await geminiService.generateEventMenu({
        serviceType: intent.serviceType,
        guests: intent.guestCount,
        budget: intent.budget,
        cuisine: intent.cuisine,
        dietary: intent.dietary
      });
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
    const booking = await Booking.create({
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
    });

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
            category: 'preference',
            learnedAt: now()
          };
        }
        return {
          text: sanitizeText(redactPII(note.text), 160),
          category: note.category || 'preference',
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
    if (lower.includes('allerg')) return 'allergy';
    if (lower.includes('budget')) return 'budget';
    if (lower.includes('spicy') || lower.includes('prefer') || lower.includes('loves')) return 'preference';
    if (lower.includes('ingredient') || lower.includes('kitchen')) return 'inventory';
    return 'preference';
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
