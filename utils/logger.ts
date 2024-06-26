/**
 * Method to log messages with timestamps
 * @param {string} message the message to log
 * @param {any} optMessage optional message to log
 * @returns {void}
 */
export function log(message: string, optMessage?: any): void {
  const timestamp = new Date().toISOString();
  const optMessageAsString = typeof optMessage === 'object' ? JSON.stringify(optMessage) : optMessage;
  const logMessage = optMessage !== undefined ? `${timestamp} - ${message} ${optMessageAsString}` : `${timestamp} - ${message}`;
  console.log(logMessage);
}
