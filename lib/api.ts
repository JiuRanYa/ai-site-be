export function getApiUrl(path: string): string {
  const baseUrl = process.env.API_URL || '';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
} 