// =============================================================================
// Сервисы для работы с файловой системой
// =============================================================================

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MIME_PREFIXES, PREFIX_TO_SUBDIR } from '../configs/fileTypes.js';
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
 * Группирует файлы по их MIME-типам в соответствующие поддиректории
 * 
 * @param {Array<Object>} files - Массив объектов файлов с полями mimetype
 * @returns {Object.<string, Array<Object>>} - Объект, где:
 *   - Ключи - названия поддиректорий (из конфигурации)
 *   - Значения - массивы файлов, соответствующих этому типу
 * 
 * @description
 * 1. Для каждого файла определяет целевую поддиректорию через getSubdirByMimetype
 * 2. Создает группы файлов по типам
 * 3. Игнорирует файлы с неопознанными MIME-типами
 * 
 * @example
 * // Входные данные:
 * const files = [
 *   { mimetype: 'image/jpeg' },
 *   { mimetype: 'video/mp4' },
 *   { mimetype: 'application/pdf' }
 * ];
 * 
 * // Результат:
 * {
 *   images: [{ mimetype: 'image/jpeg' }],
 *   videos: [{ mimetype: 'video/mp4' }]
 * }
 * 
 * @see {@link getSubdirByMimetype} - Определение поддиректории по MIME-типу
 * @see {@link FILE_TYPE_CONFIG} - Конфигурация типов файлов
 */
const groupFilesByType = (files) => {
  return files.reduce((groups, file) => {
    const subdir = getSubdirByMimetype(file.mimetype);
    if (!subdir) return groups;

    (groups[subdir] ??= []).push(file);
    return groups;
  }, {});
};

/**
 * Определяет поддиректорию для хранения файла по его MIME-типу
 * 
 * @param {string} [mimetype] - MIME-тип файла (например, 'image/jpeg')
 * @returns {string|null}
 * - Поддиректория из конфигурации, если MIME-тип соответствует одному из 
 * допустимых префиксов
 * - null, если MIME-тип не соответствует ни одному из допустимых префиксов
 * 
 * @description
 * 1. Проверяет, передан ли MIME-тип
 * 2. Поиск префикса MIME-типа в списке допустимых префиксов
 * 3. Возвращает соответствующую поддиректорию из конфигурации
 * 
 * @example
 * getSubdirByMimetype('image/jpeg'); // 'images'
 * getSubdirByMimetype('video/mp4');  // 'videos'
 * getSubdirByMimetype('application/pdf'); // null
 * 
 * @see {@link MIME_PREFIXES} - Список допустимых MIME-префиксов
 * @see {@link PREFIX_TO_SUBDIR} - Сопоставление префиксов с поддиректориями
 */
const getSubdirByMimetype = (mimetype) => {
  if (!mimetype) return null;
  const matchedPrefix = MIME_PREFIXES.find((prefix) => mimetype.startsWith(prefix));
  return matchedPrefix ? PREFIX_TO_SUBDIR[matchedPrefix] : null;
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
  const ext = path.extname(file.originalFilename || file.name);
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
    mimetype: file.mimetype,
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
