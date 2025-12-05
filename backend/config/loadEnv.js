import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for .env in the backend directory
const envPath = path.join(__dirname, '..', '.env');

const result = dotenv.config({ path: envPath });


