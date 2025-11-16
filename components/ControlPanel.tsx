
import React from 'react';
import { ConnectionStatus, SortBy } from '../types';
import { ZapIcon, ChevronUpDownIcon, PowerIcon, ShieldCheckIcon } from './icons';

interface ControlPanelProps {
  connectionStatus: ConnectionStatus;
  isTesting: boolean;
  sortBy: SortBy;
  onTestAll: () => void;
  onSort: () => void;
  onConnect: () => void;
  selectedServerExists: boolean;
}

const getConnectButtonClass = (status: ConnectionStatus) => {
  switch (status) {
    case ConnectionStatus.CONNECTED:
      return 'bg-v2-green text-white';
    case ConnectionStatus.CONNECTING:
      return 'bg-v2-yellow text-white animate-pulse';
    case ConnectionStatus.DISCONNECTED:
      return 'bg-v2-blue text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getConnectButtonText = (status: ConnectionStatus) => {
  switch (status) {
    case ConnectionStatus.CONNECTED:
      return '已连接';
    case ConnectionStatus.CONNECTING:
      return '连接中...';
    case ConnectionStatus.DISCONNECTED:
      return '连接';
    default:
      return '连接';
  }
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
  connectionStatus,
  isTesting,
  sortBy,
  onTestAll,
  onSort,
  onConnect,
  selectedServerExists
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-v2-light-card/80 dark:bg-v2-dark-card/80 backdrop-blur-sm border-t border-v2-light-border dark:border-v2-dark-border p-4">
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
        <button
          onClick={onTestAll}
          disabled={isTesting}
          className="flex flex-col items-center justify-center p-2 text-v2-light-text-secondary dark:text-v2-dark-text-secondary hover:text-v2-light-text dark:hover:text-v2-dark-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-20"
        >
          <ZapIcon className="w-6 h-6" />
          <span className="text-xs mt-1">{isTesting ? '测试中...' : '测试延迟'}</span>
        </button>
        <button onClick={onSort} className="flex flex-col items-center justify-center p-2 text-v2-light-text-secondary dark:text-v2-dark-text-secondary hover:text-v2-light-text dark:hover:text-v2-dark-text transition-colors w-20">
          <ChevronUpDownIcon className="w-6 h-6" />
          <span className="text-xs mt-1">{sortBy}</span>
        </button>
        <button
          onClick={onConnect}
          disabled={!selectedServerExists}
          className={`flex-grow flex items-center justify-center h-16 rounded-full text-xl font-bold transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:hover:scale-100 ${getConnectButtonClass(connectionStatus)}`}
        >
          {connectionStatus === ConnectionStatus.CONNECTED ? <ShieldCheckIcon className="w-8 h-8 mr-2" /> : <PowerIcon className="w-8 h-8 mr-2" />}
          {getConnectButtonText(connectionStatus)}
        </button>
      </div>
    </div>
  );
};