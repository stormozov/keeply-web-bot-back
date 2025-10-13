const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const pino = require('pino');
const pinoPretty = require('pino-pretty');
const pinoLogger = require('koa-pino-logger');

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

// Подключаем Koa-логгер с нашим экземпляром
app.use(pinoLogger({ logger }));

// CORS
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

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
