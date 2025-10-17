import cors from '@koa/cors';
import Router from '@koa/router';
import fs from 'fs';
import Koa from 'koa';
import pinoLogger from 'koa-pino-logger';
import path from 'path';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { v4 as uuidv4 } from 'uuid';

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

// Middleware для обработки JSON-запросов
app.use(async (ctx, next) => {
  if (ctx.method === 'POST' && ctx.path === '/api/messages') {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      ctx.req.on('data', chunk => data += chunk);
      ctx.req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
      ctx.req.on('error', reject);
    });
    ctx.request.body = body;
  }
  await next();
});

// CORS
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Endpoint: GET /api/capabilities — получение возможностей бота
router.get('/api/capabilities',
  async (ctx) => {
    ctx.body = botCapabilities;
    ctx.status = 200;
  }
);

// Endpoint: GET /api/test — тестовый эндпоинт
router.get('/api/test',
  async (ctx) => {
    ctx.body = { message: 'Hello Test' };
    ctx.status = 200;
  }
);

// Endpoint: GET /api/messages — получение всех сообщений
router.get('/api/messages',
  async (ctx) => {
    const messagesFilePath = path.join(process.cwd(), 'data/messages.json');
    let messages = [];
    try {
      const data = fs.readFileSync(messagesFilePath, 'utf8');
      messages = JSON.parse(data);
    } catch (err) {
      // Если файл не существует, возвращаем пустой массив
      logger.info('messages.json not found, returning empty array');
    }
    ctx.body = messages;
    ctx.status = 200;
  }
);

// Endpoint: POST /api/messages — отправка нового сообщения
router.post('/api/messages',
  async (ctx) => {
    const { message } = ctx.request.body;
    if (!message) {
      ctx.status = 400;
      ctx.body = { error: 'Message is required' };
      return;
    }
    logger.info(`Received message: ${message}`);

    // Путь к файлу messages.json
    const messagesFilePath = path.join(process.cwd(), 'data/messages.json');

    // Читаем существующие сообщения или создаём пустой массив
    let messages = [];
    try {
      const data = fs.readFileSync(messagesFilePath, 'utf8');
      messages = JSON.parse(data);
    } catch (err) {
      // Если файл не существует, messages останется пустым массивом
      logger.info('messages.json not found, creating new file');
    }

    // Добавляем новое сообщение с timestamp
    const newMessage = {
      id: uuidv4(),
      message,
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);

    // Записываем обратно в файл
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));

    // Возвращаем все сообщения
    ctx.body = messages;
    ctx.status = 200;
  }
);

// Маршрутизация
app.use(router.routes());

// Запуск
app.listen(PORT, () => {
  logger.info(`Server is listening on port ${PORT}`);
});
