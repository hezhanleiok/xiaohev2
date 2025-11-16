export enum Protocol {
  VMess = 'VMess',
  VLESS = 'VLESS',
  Shadowsocks = 'Shadowsocks',
  Trojan = 'Trojan',
  Socks = 'Socks',
  HTTP = 'HTTP',
  SSR = 'SSR',
  Clash = 'Clash',
}

export interface ServerConfig {
  id: string;
  remarks: string;
  protocol: Protocol;
  address: string;
  port: number;
  group?: string;
  latency: number | 'N/A' | '测试中...' | '超时';
  tlsFragmentation?: boolean;
  countryCode?: string;
}

export interface Subscription {
  id: string;
  name: string;
  url?: string;
  servers: ServerConfig[];
  lastUpdated?: string;
  enabled: boolean;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
}

export enum SortBy {
  DEFAULT = '默认排序',
  LATENCY = '按延迟',
  NAME = '按名称',
}