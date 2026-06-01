import User from '../models/User.js';
import geminiService from './geminiService.js';

export const learnUserPreferences = async (userId, newInteraction) => {
  try {
    const notes = await geminiService.extractCulinaryNotes(newInteraction);
    if (!Array.isArray(notes) || notes.length === 0) return;

    const cleanNotes = notes
      .map(note => String(note || '').trim().slice(0, 160))
      .filter(note => note.length >= 8);

    if (cleanNotes.length === 0) return;

    await User.findByIdAndUpdate(userId, {
      $push: {
        aiNotes: {
          $each: cleanNotes.map(note => ({
            text: note,
            category: 'preference',
            learnedAt: new Date()
          }))
        }
      }
    });
  } catch (error) {
    console.error('[AI Memory] Failed to update user preferences:', error);
  }
};
