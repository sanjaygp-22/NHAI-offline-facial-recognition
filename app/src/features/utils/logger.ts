export function logInfo(message: string): void {
  console.log(message);
}

export function logError(message: string, error?: unknown): void {
  console.error(message, error);
}
