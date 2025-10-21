// =============================================================================
// Middleware конфигурация CORS 
// =============================================================================

import cors from '@koa/cors';

/**
 * Опции конфигурации CORS
 */
const options = { origin: '*', credentials: true };

/**
 * Мидлвэр для настройки CORS (Cross-Origin Resource Sharing) в приложении Koa
 * 
 * @module corsMiddleware
 * @description
 * Конфигурация CORS:
 * - Разрешает запросы с любого источника (`origin: '*'`)
 * - Позволяет передавать учетные данные (cookies, заголовки авторизации) 
 * (`credentials: true`)
 * 
 * ⚠️ **Важно:** Использование `origin: '*'` с `credentials: true` может быть 
 * небезопасным, так как это позволяет любому домену отправлять запросы 
 * с учетными данными. В продакшене рекомендуется указывать конкретные 
 * доверенные домены вместо `'*'`.
 * 
 * @example
 * // Использование в Koa-приложении
 * import Koa from 'koa';
 * import { corsMiddleware } from './middleware';
 * 
 * const app = new Koa();
 * app.use(corsMiddleware);
 * 
 * @see {@link https://github.com/koajs/cors} - Документация koa cors
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS} - 
 * Документация CORS
 */
export const corsMiddleware = cors(options);
