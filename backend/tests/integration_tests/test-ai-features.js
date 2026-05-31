import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key';

const __filename = fileURLToPath(import.meta.url);
const backendDir = path.resolve(path.dirname(__filename), '../..');
const repoDir = path.resolve(backendDir, '..');

const geminiService = (await import('../../services/geminiService.js')).default;

const originalGenerateWithFallback = geminiService.generateWithFallback;
const originalGenAI = geminiService.genAI;

const responseWithText = (text) => ({
  text: () => text
});

const tests = [];

const test = (name, fn) => {
  tests.push({ name, fn });
};

test('parseBookingIntent parses model JSON into booking details', async () => {
  let capturedPrompt = '';
  geminiService.generateWithFallback = async (prompt) => {
    capturedPrompt = prompt;
    return responseWithText(JSON.stringify({
      date: '2026-06-02',
      time: '19:30',
      guestCount: 12,
      serviceType: 'birthday',
      budget: 8000,
      duration: 3
    }));
  };

  const result = await geminiService.parseBookingIntent('Book a birthday chef tomorrow evening for 12 guests under 8000');

  assert.equal(result.serviceType, 'birthday');
  assert.equal(result.guestCount, 12);
  assert.equal(result.budget, 8000);
  assert.match(capturedPrompt, /Extract booking details/);
  assert.match(capturedPrompt, /Book a birthday chef/);
});

test('extractCulinaryNotes returns learned preference notes', async () => {
  geminiService.generateWithFallback = async () => responseWithText(JSON.stringify([
    'User prefers North Indian food',
    'User is allergic to nuts'
  ]));

  const notes = await geminiService.extractCulinaryNotes('I want North Indian food and no nuts');

  assert.deepEqual(notes, [
    'User prefers North Indian food',
    'User is allergic to nuts'
  ]);
});

test('extractCulinaryNotes fails closed to an empty memory update', async () => {
  geminiService.generateWithFallback = async () => {
    throw new Error('model unavailable');
  };

  const notes = await geminiService.extractCulinaryNotes('remember nothing');

  assert.deepEqual(notes, []);
});

test('identifyIngredientsFromImage sends image bytes to a vision-capable model', async () => {
  let modelConfig;
  let payload;

  geminiService.genAI = {
    getGenerativeModel(config) {
      modelConfig = config;
      return {
        async generateContent(parts) {
          payload = parts;
          return {
            response: responseWithText(JSON.stringify(['tomato', 'onion']))
          };
        }
      };
    }
  };

  const ingredients = await geminiService.identifyIngredientsFromImage('base64-image', 'image/png');

  assert.equal(modelConfig.model, 'models/gemini-2.0-flash');
  assert.equal(payload[1].inlineData.data, 'base64-image');
  assert.equal(payload[1].inlineData.mimeType, 'image/png');
  assert.deepEqual(ingredients, ['tomato', 'onion']);
});

test('parseJSONResponse accepts fenced JSON returned by LLMs', () => {
  const parsed = geminiService.parseJSONResponse('```json\n{"ok":true}\n```');

  assert.deepEqual(parsed, { ok: true });
});

test('agentic API routes are registered with authentication and memory hooks', () => {
  const aiRoutes = fs.readFileSync(path.join(backendDir, 'routes/aiRoutes.js'), 'utf8');

  assert.match(aiRoutes, /router\.post\('\/snap-and-cook', verifyToken, upload\.single\('image'\)/);
  assert.match(aiRoutes, /router\.post\('\/parse-booking-intent', verifyToken/);
  assert.match(aiRoutes, /router\.post\('\/chat', verifyToken/);
  assert.match(aiRoutes, /learnUserPreferences\(req\.user\.id/);
  assert.equal((aiRoutes.match(/export default router/g) || []).length, 1);
});

test('user model includes long-term culinary memory field', () => {
  const userModel = fs.readFileSync(path.join(backendDir, 'models/User.js'), 'utf8');

  assert.match(userModel, /aiNotes:\s*{/);
  assert.match(userModel, /type:\s*\[String\]/);
  assert.match(userModel, /default:\s*\[\]/);
});

test('frontend AI dashboard wires new agentic endpoints with auth headers', () => {
  const aiDashboard = fs.readFileSync(
    path.join(repoDir, 'frontend/src/components/ai/UnifiedAIFeatures.jsx'),
    'utf8'
  );

  assert.match(aiDashboard, /buildApiEndpoint\('ai\/snap-and-cook'\)/);
  assert.match(aiDashboard, /buildApiEndpoint\('ai\/parse-booking-intent'\)/);
  assert.match(aiDashboard, /buildApiEndpoint\('ai\/chat'\)/);
  assert.match(aiDashboard, /Authorization: `Bearer \$\{token\}`/);
  assert.match(aiDashboard, /FormData/);
  assert.match(aiDashboard, /Apply to Menu Details/);
});

let failed = 0;

try {
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`PASS ${name}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL ${name}`);
      console.error(error);
    } finally {
      geminiService.generateWithFallback = originalGenerateWithFallback;
      geminiService.genAI = originalGenAI;
    }
  }
} finally {
  geminiService.generateWithFallback = originalGenerateWithFallback;
  geminiService.genAI = originalGenAI;
}

if (failed > 0) {
  console.error(`${failed} AI feature test(s) failed`);
  process.exit(1);
}

console.log(`${tests.length} AI feature tests passed`);
