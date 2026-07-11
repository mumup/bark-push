import { BarkError } from './error.js';
import type { BarkClientOptions, BarkPushOptions, BarkResponse } from './types.js';

const DEFAULT_BASE_URL = 'https://api.day.app';

export class BarkClient {
  readonly baseUrl: string;
  readonly deviceKey: string | undefined;
  readonly timeout: number;
  private readonly headers: Headers;
  private readonly fetcher: typeof globalThis.fetch;

  constructor(options: BarkClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.deviceKey = options.deviceKey;
    this.timeout = options.timeout ?? 10_000;
    this.headers = new Headers(options.headers);
    this.fetcher = options.fetch ?? globalThis.fetch;

    if (!this.fetcher) throw new TypeError('A fetch implementation is required');
    if (!Number.isFinite(this.timeout) || this.timeout < 0) {
      throw new RangeError('timeout must be a non-negative finite number');
    }
  }

  async push<T = unknown>(options: BarkPushOptions): Promise<BarkResponse<T>> {
    const payload = { ...options };
    if (!payload.device_key && !payload.device_keys && this.deviceKey) {
      payload.device_key = this.deviceKey;
    }
    if (!payload.device_key && (!payload.device_keys || payload.device_keys.length === 0)) {
      throw new TypeError('push requires device_key, device_keys, or a default deviceKey');
    }
    return this.request<BarkResponse<T>>('/push', { method: 'POST', body: JSON.stringify(payload) });
  }

  ping<T = unknown>(): Promise<T> { return this.request<T>('/ping'); }
  health<T = unknown>(): Promise<T> { return this.request<T>('/healthz'); }
  info<T = unknown>(): Promise<T> { return this.request<T>('/info'); }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timer = this.timeout === 0 ? undefined : setTimeout(() => controller.abort(), this.timeout);
    const headers = new Headers(this.headers);
    headers.set('accept', 'application/json, text/plain;q=0.9');
    if (init.body != null) headers.set('content-type', 'application/json; charset=utf-8');

    try {
      const response = await this.fetcher(`${this.baseUrl}${path}`, { ...init, headers, signal: controller.signal });
      const text = await response.text();
      let data: unknown = text;
      if (text) {
        try { data = JSON.parse(text); } catch { /* Bark misc endpoints may return plain text. */ }
      } else {
        data = undefined;
      }
      if (!response.ok) {
        const message = typeof data === 'object' && data !== null && 'message' in data
          ? String(data.message)
          : `Bark request failed with HTTP ${response.status}`;
        throw new BarkError(message, response.status, data);
      }
      return data as T;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
