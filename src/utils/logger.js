// =============================================================================
// Утилита для работы с логгером
// =============================================================================

import pino from 'pino';
import pinoPretty from 'pino-pretty';

const logStream = pinoPretty({
  colorize: true,
  ignore: 'pid,hostname',
});

/**
 * Модуль логирования, инициализированный с использованием библиотеки Pino
 * 
 * @module logger
 * @description
 * Создает и экспортирует экземпляр логгера, который записывает данные 
 * в указанный поток (logStream).
 * 
 * Pino — это высокопроизводительная библиотека логгирования для Node.js, 
 * поддерживающая структурированные логи в формате JSON.
 * 
 * @example
 * // Использование логгера
 * import { logger } from './logger';
 * 
 * logger.info('Сообщение об информационном событии');
 * logger.error('Ошибка при выполнении операции', { error: 'Details' });
 * 
 * @see {@link https://github.com/pinojs/pino} - Официальный репозиторий Pino
 */
export const logger = pino(logStream);
