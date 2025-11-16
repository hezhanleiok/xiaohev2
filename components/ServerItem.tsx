import React from 'react';
import { ServerConfig, Protocol } from '../types';
import { WifiIcon, ShareIcon } from './icons';

interface ServerItemProps {
  server: ServerConfig;
  isSelected: boolean;
  isConnected: boolean;
  onSelect: (id: string) => void;
  onShare: (server: ServerConfig) => void;
}

const getProtocolColor = (protocol: Protocol) => {
  switch (protocol) {
    case Protocol.VLESS: return 'bg-purple-500';
    case Protocol.VMess: return 'bg-blue-500';
    case Protocol.Trojan: return 'bg-red-500';
    case Protocol.Shadowsocks: return 'bg-green-500';
    case Protocol.Socks: return 'bg-orange-500';
    case Protocol.SSR: return 'bg-pink-500';
    case Protocol.Clash: return 'bg-teal-500';
    default: return 'bg-gray-500';
  }
};

const getLatencyColor = (latency: ServerConfig['latency']) => {
  if (typeof latency === 'number') {
    if (latency < 200) return 'text-v2-green';
    if (latency < 500) return 'text-v2-yellow';
    return 'text-v2-red';
  }
  if (latency === '超时') return 'text-v2-red';
  return 'text-v2-light-text-secondary dark:text-v2-dark-text-secondary';
};

const getFlagEmoji = (countryCode?: string): string => {
  if (!countryCode || countryCode.length !== 2) return '';
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '';
  }
};


export const ServerItem: React.FC<ServerItemProps> = ({ server, isSelected, isConnected, onSelect, onShare }) => {
  const borderColor = isSelected ? 'border-v2-blue' : 'border-transparent';
  const connectedColor = isConnected ? 'border-v2-green' : borderColor;

  return (
    <div
      onClick={() => onSelect(server.id)}
      className={`flex items-center p-3 bg-v2-light-card dark:bg-v2-dark-card rounded-lg mb-2 cursor-pointer border-l-4 transition-all duration-200 ${connectedColor} hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-v2-light-text dark:text-v2-dark-text font-semibold text-base truncate">
          <span className="mr-2" role="img" aria-label={server.countryCode}>{getFlagEmoji(server.countryCode)}</span>
          {server.remarks}
        </p>
        <div className="flex items-center text-sm text-v2-light-text-secondary dark:text-v2-dark-text-secondary mt-1 space-x-2">
          <span className={`px-2 py-0.5 text-xs font-bold text-white rounded ${getProtocolColor(server.protocol)}`}>
            {server.protocol}
          </span>
          <span className="truncate">{server.address}:{server.port}</span>
           {server.tlsFragmentation && (
            <span className="text-xs bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">TLS分片</span>
           )}
        </div>
      </div>
      <div className="flex items-center space-x-2 pl-2">
        <span className={`font-mono text-base ${getLatencyColor(server.latency)}`}>
          {typeof server.latency === 'number' ? `${server.latency}ms` : server.latency}
        </span>
        <WifiIcon className={`w-5 h-5 ${getLatencyColor(server.latency)}`} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(server);
          }}
          className="p-1 rounded-full text-v2-light-text-secondary dark:text-v2-dark-text-secondary hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-v2-light-text dark:hover:text-v2-dark-text transition-colors"
          aria-label="分享节点"
        >
          <ShareIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};