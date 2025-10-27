// =============================================================================
// Глобальный обработчик ошибок для Koa-приложения
// =============================================================================

import { logger } from '../utils/logger.js';

/**
 * Глобальный обработчик ошибок
 * 
 * @param {Object} ctx - Контекст Koa
 * @param {Function} next - Следующий middleware
 */
export const errorHandlerMiddleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    logger.error({ err }, 'Unhandled error in request');

    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      error: err.message || 'Внутренняя ошибка сервера',
    };
  }
};
