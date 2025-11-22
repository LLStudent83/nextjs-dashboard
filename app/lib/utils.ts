import { Revenue } from './definitions';
import type { ZodObject, ZodRawShape, infer as zInfer } from 'zod';

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (dateStr: string, locale: string = 'en-US') => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

export const getYekaterinburgDate = (): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    // en-CA даёт именно YYYY-MM-DD
    timeZone: 'Asia/Yekaterinburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date());
};

/**
 * Извлекает и валидирует данные из FormData по заданной схеме Zod.
 * Собирает только поля, присутствующие в схеме, игнорируя остальные.
 *
 * @template T - Тип схемы Zod, расширяющий ZodRawShape
 * @param {FormData} formData - Объект FormData из запроса
 * @param {ZodObject<T>} schema - Схема Zod для валидации данных
 * @returns {zInfer<ZodObject<T>>} Объект с данными, соответствующий схеме
 * @throws {ZodError} Выбрасывает ошибку Zod при несоответствии данных схеме
 */
export function getFormData<T extends ZodRawShape>(
  formData: FormData,
  schema: ZodObject<T>,
): zInfer<ZodObject<T>> {
  const rawData: Record<string, unknown> = {};

  // Собираем все ключи из схемы и берём значения из FormData
  for (const key of Object.keys(schema.shape)) {
    const value = formData.get(key);
    rawData[key] = value;
  }
  // Безопасный парсинг с выбросом ошибки, если валидация не прошла
  return schema.parse(rawData);
}
