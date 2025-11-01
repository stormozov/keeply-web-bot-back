// =============================================================================
// Конфигурация Koa-приложения
// =============================================================================

import Koa from 'koa';
import {
  corsMiddleware,
  errorHandlerMiddleware,
  fileValidationMiddleware,
  koaBodyMiddleware,
  loggerMiddleware
} from './middleware/index.js';
import apiRoutes from './routes/api/index.js';
import { initDirectories } from './services/initDirsService.js';

const app = new Koa();

// Инициализация директорий и файлов
initDirectories();

// Глобальный обработчик ошибок
app.use(errorHandlerMiddleware);

// Middleware
app.use(loggerMiddleware);
app.use(corsMiddleware);
app.use(koaBodyMiddleware);
app.use(fileValidationMiddleware);

// API routes
app.use(apiRoutes.routes());

export default app;
