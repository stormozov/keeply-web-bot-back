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

/**
 * Обработчик GET-запроса для получения списка сообщений с поддержкой пагинации
 * 
 * @param {Object} ctx - Контекст запроса Koa.js
 * @param {Object} ctx.query - Параметры запроса
 * @param {string|number} [ctx.query.offset=0] - Смещение для пагинации
 * @param {string|number} [ctx.query.limit=10] - Максимальное количество
 * возвращаемых сообщений
 * 
 * @description
 * 1. Читает все сообщения из хранилища
 * 2. Сортирует их по времени создания (от старых к новым)
 * 3. Реализует пагинацию:
 *    - Рассчитывает начальный и конечный индексы на основе offset и limit
 *    - Возвращает только указанную порцию сообщений (от новых к старым)
 * 
 * @example
 * // Получить первые 5 сообщений
 * GET /api/messages?offset=0&limit=5
 * 
 * // Получить следующие 5 сообщений (с 6 по 10)
 * GET /api/messages?offset=5&limit=5
 * 
 * @see readMessages - Функция чтения сообщений из файла
 * @see API_PATH - Константа пути API (определяется отдельно)
 */
router.get(API_PATH, async (ctx) => {
  const messages = readMessages();
  messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const offset = parseInt(ctx.query.offset) || 0;
  const limit = parseInt(ctx.query.limit) || 10;
  const total = messages.length;
  const start = Math.max(0, total - offset - limit);
  const end = Math.max(0, total - offset);

  ctx.body = messages.slice(start, end);
});

/**
 * Асинхронный обработчик запроса на отправку сообщения с файлами
 * 
 * @param {Object} ctx - Объект контекста запроса (Koa.js)
 * @param {Object} ctx.request.body - Данные тела запроса
 * @param {string} [ctx.request.body.message] - Текстовое сообщение (опционально)
 * @param {Array<File>} [ctx.request.body.files] - Массив загруженных файлов
 * (опционально)
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

  addMessage(newMessage);

  ctx.body = [newMessage];
});

export default router;
