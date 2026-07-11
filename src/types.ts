export type BarkLevel = 'critical' | 'active' | 'timeSensitive' | 'passive';

export interface BarkPushOptions {
  title?: string;
  subtitle?: string;
  body: string;
  device_key?: string;
  device_keys?: string[];
  level?: BarkLevel;
  volume?: string;
  badge?: number;
  call?: '1';
  autoCopy?: '1';
  copy?: string;
  sound?: string;
  icon?: string;
  group?: string;
  ciphertext?: string;
  isArchive?: '1';
  ttl?: number;
  url?: string;
  action?: 'none';
}

export interface BarkResponse<T = unknown> {
  code?: number;
  message?: string;
  timestamp?: number;
  data?: T;
  [key: string]: unknown;
}

export interface BarkClientOptions {
  baseUrl?: string;
  deviceKey?: string;
  timeout?: number;
  headers?: HeadersInit;
  fetch?: typeof globalThis.fetch;
}
