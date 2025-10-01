/**
 * Utility functions for date formatting
 */

/**
 * Formats a date string to a localized date string
 * @param dateString - The date string to format
 * @param fallback - The fallback text to show if date is invalid (default: 'Recently uploaded')
 * @returns Formatted date string or fallback text
 */
export const formatDate = (dateString: string | null | undefined, fallback: string = 'Recently uploaded'): string => {
  if (!dateString || dateString === '') {
    return fallback;
  }
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? fallback : date.toLocaleDateString();
};

/**
 * Formats a date string with a prefix
 * @param dateString - The date string to format
 * @param prefix - The prefix to add before the date (e.g., 'Uploaded')
 * @param fallback - The fallback text to show if date is invalid (default: 'Recently uploaded')
 * @returns Formatted date string with prefix or fallback text
 */
export const formatDateWithPrefix = (dateString: string | null | undefined, prefix: string, fallback: string = 'Recently uploaded'): string => {
  if (!dateString || dateString === '') {
    return fallback;
  }
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? fallback : `${prefix} ${date.toLocaleDateString()}`;
};
