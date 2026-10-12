const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const inlineAssetUrl = (key: string): string =>
  `${API_BASE.replace(/\/+$/, '')}/assets/inline?key=${encodeURIComponent(key)}`;
