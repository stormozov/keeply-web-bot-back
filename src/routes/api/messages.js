// =============================================================================
// API-маршруты для работы с сообщениями '/api/messages'
// =============================================================================

import Router from '@koa/router';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MIME_TO_EXT } from '../../configs/fileTypes.js';
import { organizeUploadedFiles } from '../../services/fileService.js';
import { addMessage, clearAllMessages, deleteMessage, readMessages } from '../../services/messageService.js';
import { logger } from '../../utils/logger.js';
import { UPLOADS_DIR } from '../../utils/paths.js';

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
  try {
    const messages = readMessages();
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const offset = parseInt(ctx.query.offset) || 0;
    const limit = parseInt(ctx.query.limit) || 10;
    const total = messages.length;
    const start = Math.max(0, total - offset - limit);
    const end = Math.max(0, total - offset);

    ctx.body = { success: true, data: messages.slice(start, end) };
  } catch (error) {
    logger.error('Error fetching messages:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: 'Ошибка при получении сообщений' };
  }
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
  try {
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
      ctx.body = { success: false, error: 'Отсутствуют текст или файлы' };
      return;
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

    ctx.body = { success: true, data: [newMessage] };
  } catch (error) {
    logger.error('Error processing message upload:', error);
  }
});

/**
 * Асинхронный обработчик запроса на удаление сообщения по его ID
 *
 * @param {Object} ctx - Объект контекста запроса (Koa.js)
 * @param {Object} ctx.params - Параметры маршрута
 * @param {string} ctx.params.id - ID сообщения для удаления
 *
 * @description
 * 1. Извлекает ID сообщения из параметров маршрута
 * 2. Вызывает функцию удаления сообщения
 * 3. Если сообщение найдено и удалено, возвращает статус 200
 * 4. Если сообщение не найдено, возвращает статус 404
 * 5. Логирует результат операции
 *
 * @example
 * DELETE /api/messages/123
 * // Удаляет сообщение с ID 123
 *
 * @throws {404} Если сообщение с указанным ID не найдено
 *
 * @see {@link deleteMessage} - Функция удаления сообщения из хранилища
 */
router.delete(`${API_PATH}/:id`, async (ctx) => {
  const { id } = ctx.params;

  logger.info(`Attempting to delete message with ID: ${id}`);

  const success = deleteMessage(id);

  if (success) {
    ctx.status = 200;
    ctx.body = { success: true, message: 'Сообщение успешно удалено' };
    logger.info(`Message with ID ${id} deleted successfully`);
  } else {
    ctx.status = 404;
    ctx.body = { success: false, error: 'Сообщение не найдено' };
    logger.warn(`Message with ID ${id} not found`);
  }
});

/**
 * Асинхронный обработчик запроса на очистку всех сообщений
 *
 * @param {Object} ctx - Объект контекста запроса (Koa.js)
 *
 * @description
 * 1. Вызывает функцию очистки всех сообщений и их вложений
 * 2. Если очистка прошла успешно, возвращает статус 200
 * 3. Если произошла ошибка, возвращает статус 500
 * 4. Логирует результат операции
 *
 * @example
 * DELETE /api/messages
 * // Очищает все сообщения и файлы
 *
 * @throws {500} Если произошла ошибка при очистке
 *
 * @see {@link clearAllMessages} - Функция очистки всех сообщений из хранилища
 */
router.delete(API_PATH, async (ctx) => {
  logger.info('Attempting to clear all messages');

  const success = clearAllMessages();

  if (success) {
    ctx.status = 200;
    ctx.body = { success: true, message: 'Все сообщения успешно очищены' };
    logger.info('All messages cleared successfully');
  } else {
    ctx.status = 500;
    ctx.body = { success: false, error: 'Ошибка при очистке сообщений' };
    logger.error('Failed to clear all messages');
  }
});

/**
 * Асинхронный обработчик запроса на получение файла по его пути
 *
 * @param {Object} ctx - Контекст запроса Koa.js
 * @param {Object} ctx.params - Параметры маршрута
 * @param {string} ctx.params.messageId - ID сообщения
 * @param {string} ctx.params.subdir - Поддиректория (images, videos, etc.)
 * @param {string} ctx.params.filename - Имя файла
 *
 * @description
 * 1. Валидирует параметры пути для предотвращения directory traversal
 * 2. Проверяет существование файла
 * 3. Устанавливает безопасные заголовки для предотвращения выполнения скриптов
 * 4. Отправляет файл клиенту
 *
 * @example
 * GET /api/uploads/123e4567-e89b-12d3-a456-426614174000/images/abc123.jpg
 *
 * @throws {400} Если параметры пути недействительны
 * @throws {404} Если файл не найден
 *
 * @see {@link UPLOADS_DIR} - Директория хранения файлов
 */
router.get('/uploads/:messageId/:subdir/:filename', async (ctx) => {
  const { messageId, subdir, filename } = ctx.params;

  // Валидация параметров для предотвращения directory traversal
  const validMessageId = /^[a-f0-9\-]{36}$/.test(messageId);
  const validSubdir = /^[a-z]+$/.test(subdir);
  const validFilename = /^[a-f0-9\-]+\.[a-z0-9]+$/.test(filename);

  if (!validMessageId || !validSubdir || !validFilename) {
    ctx.status = 400;
    ctx.body = { success: false, error: 'Недействительные параметры запроса' };
    logger.warn(`Invalid upload request parameters: ${messageId}/${subdir}/${filename}`);
    return;
  }

  // Формируем безопасный путь к файлу
  const filePath = path.join(UPLOADS_DIR, messageId, subdir, filename);

  // Проверяем существование файла
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
  } catch (err) {
    ctx.status = 404;
    ctx.body = { success: false, error: 'Файл не найден' };
    logger.warn(`File not found: ${filePath}`);
    return;
  }

  // Получаем информацию о файле
  const stat = await fs.promises.stat(filePath);

  // Определяем MIME-тип по расширению файла
  const ext = path.extname(filename).toLowerCase();
  const mimeType = Object
    .keys(MIME_TO_EXT)
    .find(key => MIME_TO_EXT[key] === ext) || 'application/octet-stream';

  // Устанавливаем безопасные заголовки
  ctx.set('Content-Type', mimeType);
  ctx.set('Content-Length', stat.size);
  ctx.set('Content-Disposition', `inline; filename="${filename}"`); // inline для отображения в браузере
  ctx.set('X-Content-Type-Options', 'nosniff'); // Предотвращает MIME sniffing
  ctx.set('Cache-Control', 'private, max-age=3600'); // Кеширование на 1 час

  // Отправляем файл
  ctx.body = fs.createReadStream(filePath);

  logger.info(`Served file: ${filePath}`);
});

export default router;
