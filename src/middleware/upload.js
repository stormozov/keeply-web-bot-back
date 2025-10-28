// =============================================================================
// Middleware конфигурация загрузки файлов
// =============================================================================

import koaBody from 'koa-body';
import { KOA_BODY_CONFIG } from '../configs/koa-body.js';
import {
  cleanupInvalidFile,
  extractFiles,
  getFileName,
  respondWithValidationError,
} from '../services/fileService.js';
import { validateFile } from '../services/validateService.js';
import { logger } from '../utils/logger.js';
import { UPLOADS_DIR } from '../utils/paths.js';

const koaBodyFn = koaBody.default || koaBody;

/**
 * Мидлвэр для обработки тел запросов в приложении Koa с поддержкой загрузки файлов
 *
 * @module koaBodyMiddleware
 * @description
 * Настраивает парсинг multipart/form-data через библиотеку formidable:
 * - Включает поддержку multipart (для файлов и формы)
 * - Выполняет глубокую валидацию файлов по содержимому после загрузки
 * - Логирует ошибки загрузки
 * - Сохраняет файлы в указанную директорию
 *
 * @param {Object} options - Конфигурация middleware
 * @param {boolean} options.multipart - Включение/выключение парсинга multipart
 * @param {Object} options.formidable - Настройки библиотеки formidable
 * @param {string} options.formidable.uploadDir - Директория для сохранения загруженных файлов
 * @param {boolean} options.formidable.keepExtensions - Сохранять расширения файлов
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
    maxFileSize: KOA_BODY_CONFIG.formidable.maxFileSize,
    maxTotalFileSize: KOA_BODY_CONFIG.formidable.maxTotalFileSize,
  },
  onError: (error, ctx) => {
    logger.error({
      err: error,
      name: error.name,
      message: error.message,
      stack: error.stack,
      ctxUrl: ctx.url,
      ctxMethod: ctx.method,
    }, 'Koa body middleware error');
    throw error;
  }
});

/**
 * Middleware для глубокой валидации загруженных файлов по содержимому
 *
 * @param {Object} ctx - Контекст Koa
 * @param {Function} next - Следующий middleware
 *
 * @description
 * Выполняет асинхронную валидацию каждого загруженного файла по магическим байтам.
 * Если файл не проходит валидацию, удаляет временный файл и возвращает ошибку.
 * Добавляет информацию о реальном MIME-типе в объект файла.
 *
 * @throws {400} Если файл не проходит валидацию по содержимому
 */
export const fileValidationMiddleware = async (ctx, next) => {
  const files = extractFiles(ctx.request.files);
  if (files.length === 0) return await next();

  for (const file of files) {
    if (!file.filepath) continue;

    const validationResult = await validateFile(file.filepath);
    if (validationResult.isValid) {
      file.realMimetype = validationResult.detectedMimeType;
      logger.info(`File validated successfully: ${getFileName(file)} (${validationResult.detectedMimeType})`);
      continue;
    }

    // Обработка невалидного файла
    await cleanupInvalidFile(file.filepath);
    respondWithValidationError(ctx, file, validationResult.error);
    return;
  }

  await next();
};
