// =============================================================================
// Middleware конфигурация загрузки файлов
// =============================================================================

import koaBody from 'koa-body';
import { KOA_BODY_CONFIG } from '../configs/koa-body.js';
import { logger } from '../utils/logger.js';
import { UPLOADS_DIR } from '../utils/paths.js';
import { ALLOWED_FILE_TYPES } from '../configs/fileTypes.js';

const koaBodyFn = koaBody.default || koaBody;

/**
 * Мидлвэр для обработки тел запросов в приложении Koa с поддержкой загрузки файлов
 * 
 * @module koaBodyMiddleware
 * @description
 * Настраивает парсинг multipart/form-data через библиотеку formidable:
 * - Включает поддержку multipart (для файлов и формы)
 * - Ограничивает типы допустимых файлов
 * - Логирует ошибки загрузки
 * - Сохраняет файлы в указанную директорию
 * 
 * @param {Object} options - Конфигурация middleware
 * @param {boolean} options.multipart - Включение/выключение парсинга multipart
 * @param {Object} options.formidable - Настройки библиотеки formidable
 * @param {string} options.formidable.uploadDir - Директория для сохранения загруженных файлов
 * @param {boolean} options.formidable.keepExtensions - Сохранять расширения файлов
 * @param {Function} options.formidable.filter - Функция фильтрации по MIME-типам
 * @param {Function} options.onError - Обработчик ошибок
 * 
 * @example
 * // Использование в Koa-приложении
 * import Koa from 'koa';
 * import { koaBodyMiddleware } from './middleware';
 * 
 * const app = new Koa();
 * app.use(koaBodyMiddleware);
 * 
 * @see {@link https://www.npmjs.com/package/koa-body} - Документация koa-body
 * @see {@link https://github.com/felixge/node-formidable} - Документация formidable
 */
export const koaBodyMiddleware = koaBodyFn({
  multipart: KOA_BODY_CONFIG.multipart,
  formidable: {
    uploadDir: UPLOADS_DIR,
    keepExtensions: KOA_BODY_CONFIG.formidable.keepExtensions,
    filter: (part) => ALLOWED_FILE_TYPES.includes(part.mimetype),
  },
  onError: (error, ctx) => {
    logger.error({ err: error }, 'Koa body middleware error');
    throw error;
  },
});
