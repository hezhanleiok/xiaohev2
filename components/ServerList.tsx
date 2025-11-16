
import React, { useState, useEffect, useMemo } from 'react';
import { ServerConfig } from '../types';
import { ServerItem } from './ServerItem';
import { ChevronUpDownIcon, ZapIcon } from './icons';

interface ServerListProps {
  servers: ServerConfig[];
  selectedServerId: string | null;
  activeServerId: string | null;
  onSelectServer: (id: string) => void;
  onShareServer: (server: ServerConfig) => void;
  onTestGroup: (groupName: string) => void;
}

export const ServerList: React.FC<ServerListProps> = ({
  servers,
  selectedServerId,
  activeServerId,
  onSelectServer,
  onShareServer,
  onTestGroup,
}) => {
  
  // FIX: Explicitly type `groupedServers` to ensure correct type inference for `groupServers` later.
  const groupedServers: { [key: string]: ServerConfig[] } = useMemo(() => {
    const groups: { [key: string]: ServerConfig[] } = {};
    servers.forEach(server => {
      const groupName = server.group || '默认分组';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(server);
    });
    return groups;
  }, [servers]);
  
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initially open all groups
    setOpenGroups(new Set(Object.keys(groupedServers)));
  }, [groupedServers]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  if (servers.length === 0) {
    return <div className="text-center text-v2-light-text-secondary dark:text-v2-dark-text-secondary py-10">没有配置服务器，请点击右上角 '+' 添加。</div>;
  }

  return (
    <div className="flex-grow overflow-y-auto px-4 pt-4 pb-32">
      {Object.entries(groupedServers).map(([groupName, groupServers]) => (
        <div key={groupName} className="mb-4 bg-v2-light-card dark:bg-v2-dark-card rounded-lg shadow-md">
          <div
            className="flex justify-between items-center p-3 cursor-pointer border-b border-v2-light-border dark:border-v2-dark-border"
            onClick={() => toggleGroup(groupName)}
          >
            <div className="flex-1">
                <h2 className="text-base font-bold uppercase text-v2-light-text dark:text-v2-dark-text">{groupName} ({groupServers.length})</h2>
            </div>
            <div className="flex items-center space-x-2">
                 <button
                    onClick={(e) => { e.stopPropagation(); onTestGroup(groupName); }}
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-v2-light-text-secondary dark:text-v2-dark-text-secondary"
                    aria-label="测试该组延迟"
                >
                    <ZapIcon className="w-5 h-5"/>
                </button>
                <ChevronUpDownIcon
                    className={`w-5 h-5 transition-transform text-v2-light-text-secondary dark:text-v2-dark-text-secondary ${openGroups.has(groupName) ? 'rotate-180' : ''}`}
                />
            </div>
          </div>
          {openGroups.has(groupName) && (
            <div className="p-2">
              {groupServers.map(server => (
                <ServerItem
                  key={server.id}
                  server={server}
                  isSelected={selectedServerId === server.id}
                  isConnected={activeServerId === server.id}
                  onSelect={onSelectServer}
                  onShare={onShareServer}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};