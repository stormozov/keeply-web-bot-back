// =============================================================================
// Сервисы для работы с файловой системой
// =============================================================================

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  getExtensionFromMime,
  getSubdirByRealMimetype
} from '../configs/fileTypes.js';
import { UPLOADS_DIR } from '../utils/paths.js';

export const organizeUploadedFiles = (rawFiles) => {
  const files = Array.isArray(rawFiles) ? rawFiles : rawFiles ? [rawFiles] : [];
  if (files.length === 0) return { files: [], messageId: null };

  const messageId = uuidv4();
  const messageDir = path.join(UPLOADS_DIR, messageId);
  fs.mkdirSync(messageDir, { recursive: true });

  const fileGroups = groupFilesByType(files);
  const organizedFiles = [];

  for (const [subdirName, groupFiles] of Object.entries(fileGroups)) {
    organizedFiles.push(...processFileGroup(groupFiles, messageDir, subdirName));
  }

  return { files: organizedFiles, messageId };
};

/**
 * Группирует файлы по их реальным MIME-типам в соответствующие поддиректории
 *
 * @param {Array<Object>} files - Массив объектов файлов с полями mimetype и realMimetype
 * @returns {Object.<string, Array<Object>>} - Объект, где:
 *   - Ключи - названия поддиректорий (из конфигурации)
 *   - Значения - массивы файлов, соответствующих этому типу
 *
 * @description
 * 1. Для каждого файла определяет целевую поддиректорию через getSubdirByRealMimetype
 *    используя реальный MIME-тип из валидации (realMimetype)
 * 2. Создает группы файлов по типам
 * 3. Игнорирует файлы с неопознанными MIME-типами
 *
 * @example
 * // Входные данные:
 * const files = [
 *   { mimetype: 'image/jpeg', realMimetype: 'image/jpeg' },
 *   { mimetype: 'video/mp4', realMimetype: 'video/mp4' },
 *   { mimetype: 'application/pdf', realMimetype: null }
 * ];
 *
 * // Результат:
 * {
 *   images: [{ mimetype: 'image/jpeg', realMimetype: 'image/jpeg' }],
 *   videos: [{ mimetype: 'video/mp4', realMimetype: 'video/mp4' }]
 * }
 *
 * @see {@link getSubdirByRealMimetype} - Определение поддиректории по реальному MIME-типу
 * @see {@link FILE_TYPE_CONFIG} - Конфигурация типов файлов
 */
const groupFilesByType = (files) => {
  return files.reduce((groups, file) => {
    const subdir = getSubdirByRealMimetype(file.realMimetype || file.mimetype);
    if (!subdir) return groups;

    (groups[subdir] ??= []).push(file);
    return groups;
  }, {});
};

/**
 * Перемещает один файл в указанную поддиректорию и возвращает его метаданные.
 * 
 * @param {Object} file - Объект, содержащий информацию о файле.
 * @param {string} file.filepath - Полный путь к файлу.
 * @param {string} file.originalFilename - Имя оригинального файла.
 * @param {string} file.name - Имя файла.
 * @param {string} file.mimetype - MIME-тип файла.
 * @param {number} file.size - Размер файла в байтах.
 * 
 * @param {string} messageDir - Полный путь к директории сообщений.
 * @param {string} subdirName - Имя подпапки для сохранения файлов.
 * 
 * @returns {Object} Объект, содержащий метаданные перемещенного файла.
 */
export const moveSingleFile = (file, messageDir, subdirName) => {
  const realMimetype = file.realMimetype || file.mimetype;
  const ext = getExtensionFromMime(realMimetype);
  const newFilename = uuidv4() + ext;
  const subdirPath = path.join(messageDir, subdirName);
  const newPath = path.join(subdirPath, newFilename);

  // Гарантируем, что подпапка существует
  fs.mkdirSync(subdirPath, { recursive: true });

  // Перемещаем файл
  fs.renameSync(file.filepath, newPath);

  // Возвращаем структурированные данные
  const relativePath = path
    .join(path.basename(messageDir), subdirName, newFilename)
    .replace(/\\/g, '/');

  return {
    filename: relativePath,
    originalname: file.originalFilename || file.name,
    mimetype: file.realMimetype || file.mimetype,
    size: file.size,
    url: `/uploads/${relativePath}`,
  };
};

/**
 * Обрабатывает группу файлов одного типа (images, videos и т.д.)
 * 
 * @param {Array<Object>} files - Массив объектов, содержащий информацию о файлах.
 * @param {string} messageDir - Полный путь к директории сообщений.
 * @param {string} subdirName - Имя подпапки для сохранения файлов.
 * 
 * @returns {Array<Object>} 
 * - Массив объектов, содержащий метаданные перемещенных файлов.
 * - Пустой массив, если нет файлов.
 * 
 * @see {@link moveSingleFile} - Функция перемещения одного файла в под папку
 */
export const processFileGroup = (files, messageDir, subdirName) => {
  if (!files || files.length === 0) return [];
  return files.map((file) => moveSingleFile(file, messageDir, subdirName));
};

/** Извлекает все файлы из объекта files, нормализуя в плоский массив. */
export const extractFiles = (filesObj) => {
  if (!filesObj) return [];
  return Object
    .values(filesObj)
    .flatMap((file) => Array.isArray(file) ? file : [file]);
}

/** Возвращает имя файла для логов или ответа. */
export const getFileName = (file) => {
  return file.originalFilename || file.name || 'unknown';
}

/** Удаляет временный файл и логирует возможную ошибку. */
export const cleanupInvalidFile = async (filepath) => {
  try {
    fs.unlinkSync(filepath);
  } catch (err) {
    logger.warn({ err }, `Failed to remove invalid file: ${filepath}`);
  }
}

/** Формирует ответ об ошибке валидации и логирует его. */
export const respondWithValidationError = (ctx, file, error) => {
  const filename = getFileName(file);
  ctx.status = 400;
  ctx.body = {
    error: `Файл "${filename}" не прошел валидацию: ${error}`,
  };
  logger.warn(`File validation failed for ${filename}: ${error}`);
}
