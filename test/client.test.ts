import { describe, expect, it, vi } from 'vitest';
import { BarkClient, BarkError } from '../src/index.js';

describe('BarkClient', () => {
  it('pushes with the configured device key', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(
      JSON.stringify({ code: 200, message: 'success' }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    ));
    const client = new BarkClient({ baseUrl: 'https://bark.example/', deviceKey: 'key', fetch: fetcher });

    await expect(client.push({ title: 'Hello', body: 'World' })).resolves.toMatchObject({ code: 200 });
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe('https://bark.example/push');
    expect(JSON.parse(String(init?.body))).toEqual({ title: 'Hello', body: 'World', device_key: 'key' });
  });

  it('supports batch pushes', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}'));
    const client = new BarkClient({ fetch: fetcher });
    await client.push({ body: 'hello', device_keys: ['a', 'b'] });
    expect(JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body)).device_keys).toEqual(['a', 'b']);
  });

  it('rejects pushes without a target', async () => {
    await expect(new BarkClient().push({ body: 'hello' })).rejects.toThrow('device_key');
  });

  it('throws BarkError for non-success HTTP responses', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(
      JSON.stringify({ message: 'invalid device key' }), { status: 400 },
    ));
    const promise = new BarkClient({ fetch: fetcher }).push({ body: 'hello', device_key: 'bad' });
    await expect(promise).rejects.toEqual(expect.objectContaining({
      name: 'BarkError', status: 400, message: 'invalid device key',
    }));
  });

  it('handles plain-text misc endpoints', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('pong'));
    await expect(new BarkClient({ fetch: fetcher }).ping()).resolves.toBe('pong');
  });
});
