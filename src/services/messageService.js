// =============================================================================
// Сервисы для работы с сообщениями
// =============================================================================

import fs from 'fs';
import { logger } from '../utils/logger.js';
import { MESSAGES_FILE } from '../utils/paths.js';

/**
 * Синхронное чтение списка сообщений из файла JSON
 * 
 * @returns {Array<Object>}
 * - Массив объектов сообщений, если файл существует
 * - Пустой массив, если файл не найден
 * 
 * @description
 * 1. Пытается прочитать содержимое файла messages.json
 * 2. Если файл существует - парсит JSON
 * 3. Если файл не найден или произошла ошибка - возвращает пустой массив
 * 
 * @example
 * const messages = readMessages();
 * console.log(messages); // [ { id: '1', ... }, { id: '2', ... } ]
 */
export const readMessages = () => {
  let messages;

  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    messages = JSON.parse(data);
  } catch (err) {
    logger.info('messages.json not found, returning empty array');
    messages = [];
  }

  return messages;
};

/**
 * Синхронная запись списка сообщений в файл JSON
 * 
 * @param {Array<Object>} messages - Массив объектов сообщений для сохранения
 * 
 * @description
 * 1. Перезаписывает файл messages.json сформатированным JSON-данными
 * 2. Использует отступ в 2 пробела для читаемости
 * 
 * @example
 * writeMessages([{ id: '1', text: 'Hello' }]);
 * // Создаст/обновит файл messages.json с содержимым:
 * // [
 * //   { "id": "1", "text": "Hello" }
 * // ]
 * 
 * @see readMessages - Чтение сообщений
 */
export const writeMessages = (messages) => {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
};

/**
 * Добавление нового сообщения в хранилище
 * 
 * @param {Object} newMessage - Объект сообщения для добавления
 * @param {string} newMessage.id - Уникальный идентификатор сообщения
 * @param {string} newMessage.text - Текстовое содержимое сообщения
 * @param {Date} newMessage.timestamp - Временная метка создания
 * 
 * @returns {Array<Object>} Обновленный список сообщений
 * 
 * @example
 * const newMsg = {
 *   id: '123',
 *   text: 'Привет!',
 *   timestamp: new Date().toISOString()
 * };
 * const allMessages = addMessage(newMsg);
 * 
 * @see {@link readMessages} - Для получения текущего списка
 * @see {@link writeMessages} - Для непосредственного сохранения
 */
export const addMessage = (newMessage) => {
  const messages = readMessages();
  messages.push(newMessage);
  writeMessages(messages);
  return messages;
};

