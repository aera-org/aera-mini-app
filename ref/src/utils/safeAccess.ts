/**
 * Safely access nested object properties
 * @param obj The object to access
 * @param path The path to the property (e.g., 'user.data.name')
 * @param defaultValue Default value if property doesn't exist
 * @returns The property value or default value
 */
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  try {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }

    return result !== undefined ? result : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely access array element
 * @param arr The array to access
 * @param index The index to access
 * @param defaultValue Default value if index is out of bounds
 * @returns The array element or default value
 */
export const safeGetArray = <T>(
  arr: T[] | undefined | null,
  index: number,
  defaultValue: T
): T => {
  if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
    return defaultValue;
  }
  const element = arr[index];
  return element !== undefined ? element : defaultValue;
};

/**
 * Safely access object property with type checking
 * @param obj The object to access
 * @param key The key to access
 * @param defaultValue Default value if property doesn't exist
 * @returns The property value or default value
 */
export const safeGetKey = <T, K extends keyof T>(
  obj: T | undefined | null,
  key: K,
  defaultValue: T[K]
): T[K] => {
  if (obj == null || typeof obj !== 'object') {
    return defaultValue;
  }

  const value = obj[key];
  return value !== undefined ? value : defaultValue;
};

/**
 * Check if a value is a valid string
 * @param value The value to check
 * @returns True if value is a non-empty string
 */
export const isValidString = (value: any): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Check if a value is a valid number
 * @param value The value to check
 * @returns True if value is a valid number
 */
export const isValidNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};
