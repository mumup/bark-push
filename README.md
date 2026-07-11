# bark-push

一个基于 Bark Server API V2 的 Node.js TypeScript SDK。零运行时依赖，支持 ESM 与 CommonJS，需要 Node.js 18+。

## 安装

```bash
pnpm add bark-push
```

## 使用

```ts
import { BarkClient } from 'bark-push';

const bark = new BarkClient({
  // 官方服务默认是 https://api.day.app，也可以换成自建服务
  baseUrl: 'https://api.day.app',
  deviceKey: process.env.BARK_DEVICE_KEY,
});

await bark.push({
  title: '构建完成',
  body: '应用已经成功部署',
  sound: 'minuet',
  group: 'deploy',
  url: 'https://example.com/build/123',
});
```

批量推送：

```ts
await bark.push({
  body: '这是一条批量通知',
  device_keys: ['device-key-1', 'device-key-2'],
  level: 'timeSensitive',
});
```

自定义配置及状态接口：

```ts
const bark = new BarkClient({
  baseUrl: 'https://bark.example.com',
  timeout: 5_000, // 设为 0 可关闭超时
  headers: { authorization: 'Bearer token' },
});

await bark.ping();
await bark.health();
await bark.info();
```

HTTP 非 2xx 响应会抛出 `BarkError`，其中包含 `status` 和服务端 `response`。

## 开发

```bash
pnpm install
pnpm check
```

字段及接口依据 [Bark Server API V2](https://github.com/Finb/bark-server/blob/master/docs/API_V2.md)。
