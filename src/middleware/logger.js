// =============================================================================
// Middleware конфигурация логирования
// =============================================================================

import koaPinoLogger from 'koa-pino-logger';
import { logger } from '../utils/logger.js';

/**
 * Мидлвэр для логирования HTTP-запросов и ошибок в приложении Koa 
 * с использованием Pino
 * 
 * @module loggerMiddleware
 * @description
 * Интеграция библиотеки [koa-pino-logger](https://github.com/pinojs/koa) 
 * с настроенным логгером. Записывает информацию о каждом HTTP-запросе 
 * (метод, URL, статус, время выполнения) и ошибках в журналы.
 * 
 * @param {Object} options - Опции конфигурации мидлвэра
 * @param {Object} options.logger - Экземпляр логгера Pino для записи данных
 * 
 * @example
 * // Использование в Koa-приложении
 * import Koa from 'koa';
 * import { loggerMiddleware } from './logger';
 * 
 * const app = new Koa();
 * app.use(loggerMiddleware);
 * 
 * @see {@link https://github.com/pinojs/koa} - Документация коа-pino-логгера
 */
export const loggerMiddleware = koaPinoLogger({ logger });
