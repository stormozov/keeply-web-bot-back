import fs from 'fs';

/**
 * Синхронное чтение и парсинг JSON файла
 *
 * @param {string} filePath - Полный путь к JSON файлу
 * @returns {Object|Array} Распарсенный объект или массив из JSON
 * @throws {Error} Если файл не найден, не может быть прочитан или JSON
 * некорректен
 *
 * @example
 * const data = readJsonFile('/path/to/file.json');
 * console.log(data); // { key: 'value' }
 */
export const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(
      `Failed to read or parse JSON file: ${filePath}. Error: ${error.message}`
    );
  }
};
