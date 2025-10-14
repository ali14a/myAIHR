/**
 * Debug utilities for development
 * These functions are only available in development mode
 */

// Type guard to check if we're in development mode
const isDev = import.meta.env.DEV;

/**
 * Debug logger that only works in development
 */
export const debugLog = (message: string, ...args: any[]): void => {
  if (isDev) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};

/**
 * Debug error logger
 */
export const debugError = (message: string, error: any): void => {
  if (isDev) {
    console.error(`[DEBUG ERROR] ${message}`, error);
  }
};

/**
 * Debug warning logger
 */
export const debugWarn = (message: string, ...args: any[]): void => {
  if (isDev) {
    console.warn(`[DEBUG WARN] ${message}`, ...args);
  }
};

/**
 * Debug info logger
 */
export const debugInfo = (message: string, ...args: any[]): void => {
  if (isDev) {
    console.info(`[DEBUG INFO] ${message}`, ...args);
  }
};

/**
 * Debug group logger for organizing related logs
 */
export const debugGroup = (groupName: string, callback: () => void): void => {
  if (isDev) {
    console.group(`[DEBUG GROUP] ${groupName}`);
    callback();
    console.groupEnd();
  }
};

/**
 * Debug timer for performance measurement
 */
export const debugTimer = (label: string): (() => void) => {
  if (isDev) {
    console.time(`[DEBUG TIMER] ${label}`);
    return () => console.timeEnd(`[DEBUG TIMER] ${label}`);
  }
  return () => {}; // No-op in production
};

/**
 * Debug API call logger
 */
export const debugApiCall = (method: string, url: string, data?: any): void => {
  if (isDev) {
    debugLog(`API Call: ${method} ${url}`, data);
  }
};

/**
 * Debug API response logger
 */
export const debugApiResponse = (url: string, response: any, status?: number): void => {
  if (isDev) {
    debugLog(`API Response: ${url} (${status})`, response);
  }
};

/**
 * Debug component render logger
 */
export const debugComponentRender = (componentName: string, props?: any): void => {
  if (isDev) {
    debugLog(`Component Render: ${componentName}`, props);
  }
};

/**
 * Debug state change logger
 */
export const debugStateChange = (stateName: string, oldValue: any, newValue: any): void => {
  if (isDev) {
    debugLog(`State Change: ${stateName}`, { oldValue, newValue });
  }
};

/**
 * Debug hook logger
 */
export const debugHook = (hookName: string, ...args: any[]): void => {
  if (isDev) {
    debugLog(`Hook: ${hookName}`, ...args);
  }
};

/**
 * Debug effect logger
 */
export const debugEffect = (effectName: string, dependencies: any[]): void => {
  if (isDev) {
    debugLog(`Effect: ${effectName}`, { dependencies });
  }
};

/**
 * Debug navigation logger
 */
export const debugNavigation = (from: string, to: string): void => {
  if (isDev) {
    debugLog(`Navigation: ${from} → ${to}`);
  }
};

/**
 * Debug authentication logger
 */
export const debugAuth = (action: string, user?: any): void => {
  if (isDev) {
    debugLog(`Auth: ${action}`, user);
  }
};

/**
 * Debug file upload logger
 */
export const debugFileUpload = (fileName: string, fileSize: number, progress?: number): void => {
  if (isDev) {
    debugLog(`File Upload: ${fileName} (${fileSize} bytes)`, progress ? `${progress}%` : '');
  }
};

/**
 * Debug resume analysis logger
 */
export const debugResumeAnalysis = (resumeId: number, analysis: any): void => {
  if (isDev) {
    debugLog(`Resume Analysis: ${resumeId}`, analysis);
  }
};

/**
 * Debug job matching logger
 */
export const debugJobMatching = (resumeId: number, jobId: number, match: any): void => {
  if (isDev) {
    debugLog(`Job Matching: Resume ${resumeId} vs Job ${jobId}`, match);
  }
};

/**
 * Debug cover letter generation logger
 */
export const debugCoverLetter = (resumeId: number, jobId: number, letter: any): void => {
  if (isDev) {
    debugLog(`Cover Letter: Resume ${resumeId} + Job ${jobId}`, letter);
  }
};

/**
 * Debug performance logger
 */
export const debugPerformance = (operation: string, duration: number): void => {
  if (isDev) {
    debugLog(`Performance: ${operation} took ${duration}ms`);
  }
};

/**
 * Debug network logger
 */
export const debugNetwork = (url: string, method: string, status: number, duration: number): void => {
  if (isDev) {
    debugLog(`Network: ${method} ${url} - ${status} (${duration}ms)`);
  }
};

/**
 * Debug storage logger
 */
export const debugStorage = (action: 'get' | 'set' | 'remove', key: string, value?: any): void => {
  if (isDev) {
    debugLog(`Storage: ${action} ${key}`, value);
  }
};

/**
 * Debug error boundary logger
 */
export const debugErrorBoundary = (error: Error, errorInfo: any): void => {
  if (isDev) {
    debugError('Error Boundary caught error:', error);
    debugError('Error Info:', errorInfo);
  }
};

/**
 * Debug context logger
 */
export const debugContext = (contextName: string, value: any): void => {
  if (isDev) {
    debugLog(`Context: ${contextName}`, value);
  }
};

/**
 * Debug notification logger
 */
export const debugNotification = (type: string, message: string): void => {
  if (isDev) {
    debugLog(`Notification: ${type} - ${message}`);
  }
};

/**
 * Debug form logger
 */
export const debugForm = (formName: string, field: string, value: any): void => {
  if (isDev) {
    debugLog(`Form: ${formName}.${field}`, value);
  }
};

/**
 * Debug validation logger
 */
export const debugValidation = (field: string, isValid: boolean, error?: string): void => {
  if (isDev) {
    debugLog(`Validation: ${field} - ${isValid ? 'Valid' : 'Invalid'}`, error);
  }
};

/**
 * Debug utility to check if debugging is enabled
 */
export const isDebugEnabled = (): boolean => isDev;

/**
 * Debug utility to get current environment
 */
export const getDebugEnvironment = (): string => {
  return import.meta.env.MODE;
};

/**
 * Debug utility to get all environment variables
 */
export const getDebugEnvVars = (): Record<string, string> => {
  if (isDev) {
    return import.meta.env;
  }
  return {};
};
