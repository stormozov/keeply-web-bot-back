// =============================================================================
// API-маршруты для работы с сообщениями '/api/messages'
// =============================================================================

import Router from '@koa/router';
import { v4 as uuidv4 } from 'uuid';
import { MAX_FILE_SIZE } from '../../configs/constants.js';
import { organizeUploadedFiles } from '../../services/fileService.js';
import { addMessage, readMessages } from '../../services/messageService.js';
import { logger } from '../../utils/logger.js';

const router = new Router();
const API_PATH = '/api/messages';

router.get(API_PATH, async (ctx) => {
  const messages = readMessages();
  messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const offset = parseInt(ctx.query.offset) || 0;
  const limit = parseInt(ctx.query.limit) || 10;
  const total = messages.length;
  const start = Math.max(0, total - offset - limit);
  const end = total - offset;

  ctx.body = messages.slice(start, end);
});

/**
 * Асинхронный обработчик запроса на отправку сообщения с файлами
 * 
 * @async
 * @function
 * @param {Object} ctx - Объект контекста запроса (Koa.js)
 * @param {Object} ctx.request.body - Данные тела запроса
 * @param {string} [ctx.request.body.message] - Текстовое сообщение (опционально)
 * @param {Array<File>} [ctx.request.body.files] - Массив загруженных файлов (опционально)
 * 
 * @description
 * 1. Проверяет наличие текстового сообщения или файлов
 * 2. Логирует полученные данные
 * 3. Организует загруженные файлы в структурированный формат
 * 4. Создает новый объект сообщения с уникальным идентификатором
 * 5. Добавляет сообщение в общий список
 * 6. Возвращает обновленный список сообщений в ответе
 * 
 * @example
 * // POST-запрос с данными:
 * {
 *   "message": "Привет!",
 *   "files": [файл1, файл2]
 * }
 * 
 * @throws {400} Если отсутствуют и текст, и файлы
 * 
 * @see {@link organizeUploadedFiles} - Функция организации файлов
 * @see {@link addMessage} addMessage - Функция добавления сообщения в хранилище
 */
router.post(API_PATH, async (ctx) => {
  const { message } = ctx.request.body;

  // Собираем все загруженные файлы из всех полей формы
  const uploadedFiles = [];
  if (ctx.request.files) {
    for (const key in ctx.request.files) {
      const file = ctx.request.files[key];
      if (Array.isArray(file)) {
        uploadedFiles.push(...file);
      } else {
        uploadedFiles.push(file);
      }
    }
  }

  // Проверка обязательных параметров
  if (!message && uploadedFiles.length === 0) {
    ctx.status = 400;
    ctx.body = { error: 'Отсутствуют текст или файлы' };
    return;
  }

  // Проверка размера каждого файла
  for (const file of uploadedFiles) {
    if (file.size > MAX_FILE_SIZE) {
      ctx.status = 413; // Payload Too Large
      ctx.body = {
        error: `Файл "${file.originalFilename || file.name}" превышает допустимый размер (максимум 10 МБ)`,
      };

      logger.warn(`File upload rejected: ${file.originalFilename || file.name} too large (${file.size} bytes)`);
      return;
    }
  }

  logger.info(`Received message: ${message || 'No text, files only'}`);

  const { files, messageId } = organizeUploadedFiles(uploadedFiles);
  const newMessage = {
    id: messageId || uuidv4(),
    message: message || '',
    files,
    timestamp: new Date().toISOString(),
  };

  // Обновленный список всех сообщений
  const allMessages = addMessage(newMessage);
  ctx.body = allMessages;
});

export default router;
