import cors from '@koa/cors';
import Router from '@koa/router';
import Koa from 'koa';
import pinoLogger from 'koa-pino-logger';
import pino from 'pino';
import pinoPretty from 'pino-pretty';

// Создаём настоящий логгер
const logStream = pinoPretty({
  colorize: true,
  ignore: 'pid,hostname',
});
const logger = pino(logStream); // ← это настоящий логгер

// Создаём Koa-приложение
const app = new Koa();
const router = new Router();

// Константы
const PORT = 7070;
const BOT_FUNCTION_NOT_AVAILABLE = 'Функция недоступна';

// Настройки доступности функций бота
export const botCapabilities = {
  messaging: {
    sendText: {
      availableState: 'true',
      limit: 1000,
      hasTooltip: false,
      tooltip: '',
    },
    sendAttachments: {
      availableState: 'false',
      limit: 1,
      types: ['image', 'video', 'audio'],
      hasTooltip: true,
      tooltip: BOT_FUNCTION_NOT_AVAILABLE,
    },
  },

  search: {
    searchMessages: {
      availableState: 'false',
      hasTooltip: true,
      tooltip: BOT_FUNCTION_NOT_AVAILABLE,
    },
  },

  ui: {
    buttonHelp: {
      availableState: 'false',
      hasTooltip: true,
      tooltip: BOT_FUNCTION_NOT_AVAILABLE,
    },
    buttonFavorites: {
      availableState: 'false',
      hasTooltip: true,
      tooltip: BOT_FUNCTION_NOT_AVAILABLE,
    },
    buttonAttachments: {
      availableState: 'false',
      hasTooltip: true,
      tooltip: BOT_FUNCTION_NOT_AVAILABLE,
    },
    buttonSettings: {
      availableState: 'false',
      hasTooltip: true,
      tooltip: BOT_FUNCTION_NOT_AVAILABLE,
    },
  },
};

// Подключаем Koa-логгер с нашим экземпляром
app.use(pinoLogger({ logger }));

// CORS
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Endpoint: GET /api/capabilities
router.get('/api/capabilities',
  async (ctx) => {
    ctx.body = botCapabilities;
    ctx.status = 200;
  }
);

// Endpoint: GET /api/test
router.get('/api/test',
  async (ctx) => {
    ctx.body = { message: 'Hello Test' };
    ctx.status = 200;
  }
);

// Маршрутизация
app.use(router.routes());

// Запуск
app.listen(PORT, () => {
  logger.info(`Server is listening on port ${PORT}`);
});
