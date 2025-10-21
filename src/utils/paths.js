// =============================================================================
// Пути к важным директориям
// =============================================================================

import path from 'path';
import { fileURLToPath } from 'url';

// Получаем путь к директории, где лежит этот файл (src/utils)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Корень проекта — это родительская папка для src/
export const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Пути к важным директориям
export const DATA_DIR = path.join(PROJECT_ROOT, 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
