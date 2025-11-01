// =============================================================================
// Сервис инициализации директорий и файлов
// =============================================================================

import fs from 'fs';
import { DATA_DIR, MESSAGES_FILE, UPLOADS_DIR } from '../utils/paths.js';

/**
 * Инициализация необходимых директорий и файлов при запуске приложения
 *
 * @description
 * Проверяет существование и создает при необходимости:
 * - Папку data/
 * - Папку data/uploads/
 * - Файл data/messages.json с пустым массивом []
 */
export const initDirectories = () => {
  // Создаем папку data/ если не существует
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Создаем папку data/uploads/ если не существует
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Создаем файл data/messages.json с пустым массивом если не существует
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, '[]');
  }
};
