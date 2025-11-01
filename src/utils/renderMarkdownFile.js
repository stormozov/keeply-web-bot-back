// =============================================================================
// Утилита для рендеринга markdown-файлов
// =============================================================================

import { readFileSync, statSync } from 'fs';
import { defaultSchema } from 'hast-util-sanitize';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

// Кэш для хранения рендеринга markdown-файлов
let cachedHtml = null;
let lastModified = null;

const customSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a || []), 'target', 'rel'],
  },
};

// Используем unified для рендеринга markdown-файлов
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeExternalLinks, {
    target: '_blank',
    rel: ['noopener', 'noreferrer'],
  })
  .use(rehypeSanitize, customSchema)
  .use(rehypeStringify);

/**
 * Рендерит markdown-файл в HTML с помощью unified
 * 
 * @param {string} filePath - Путь к markdown-файлу
 * @returns {Promise<string>} HTML-контент
 * 
 * @throws {Error} Если произошла ошибка при чтении или рендеринге
 */
export const renderMarkdownFile = async (filePath) => {
  try {
    const markdown = readFileSync(filePath, 'utf8');
    const file = await processor.process(markdown);
    return String(file);
  } catch (error) {
    throw new Error(
      `Failed to read or render markdown file: ${filePath}. Error: ${error.message}`
    );
  }
};

/**
 * Рендерит markdown-файл в HTML с использованием кэша
 * 
 * @param {string} filePath - Путь к markdown-файлу
 * @returns {Promise<string>} HTML-контент
 * 
 * @throws {Error} Если произошла ошибка при чтении или рендеринге
 * 
 * @see {@link renderMarkdownFile} - Функция рендеринга markdown-файлов
 */
export const renderMarkdownFileCached = async (filePath) => {
  const stats = statSync(filePath);
  console.log(stats);
  if (!cachedHtml || stats.mtime > lastModified) {
    cachedHtml = await renderMarkdownFile(filePath);
    lastModified = stats.mtime;
  }
  return cachedHtml;
};
