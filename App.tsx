import React, { useState, useMemo, useEffect } from 'react';
import { ConnectionStatus, ServerConfig, SortBy } from './types';
import { useServerManager } from './hooks/useServerManager';
import { ServerList } from './components/ServerList';
import { ControlPanel } from './components/ControlPanel';
import { SettingsModal } from './components/SettingsModal';
import { ShareModal } from './components/ShareModal';
import { AddServerModal } from './components/AddServerModal';
import { AboutModal } from './components/AboutModal';
import { PlusIcon, Cog6ToothIcon } from './components/icons';

const App: React.FC = () => {
  const {
    servers,
    loading,
    addServers,
    updateServer,
    deleteServer,
    testLatency,
    testGroupLatency,
  } = useServerManager();
  
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.DEFAULT);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [serverToShare, setServerToShare] = useState<ServerConfig | null>(null);

  // MOCK Connection state, as browser cannot connect directly
  const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED);
  const [activeServerId, setActiveServerId] = useState<string|null>(null);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme) return storedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if ((!selectedServerId || !servers.find(s => s.id === selectedServerId)) && servers.length > 0) {
        setSelectedServerId(servers[0].id);
    }
    if(servers.length === 0) {
      setSelectedServerId(null);
    }
  }, [servers, selectedServerId]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleSelectServer = (id: string) => {
    if (connectionStatus === ConnectionStatus.DISCONNECTED) {
      setSelectedServerId(id);
    }
  };

  const handleConnect = () => {
    if (!selectedServerId) return;

    if (connectionStatus === ConnectionStatus.DISCONNECTED) {
      console.log("Simulating connection to:", selectedServerId);
      setConnectionStatus(ConnectionStatus.CONNECTING);
      setTimeout(() => {
        setConnectionStatus(ConnectionStatus.CONNECTED);
        setActiveServerId(selectedServerId);
      }, 1000);
    } else {
      console.log("Simulating disconnection.");
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      setActiveServerId(null);
    }
    console.warn("This is a UI simulation. No real network connection is established in the browser.");
  };
  
  const handleTestAll = async () => {
    setIsTesting(true);
    await Promise.all(servers.map(server => testLatency(server.id, updateServer)));
    setIsTesting(false);
  };
  
  const handleTestGroup = async (groupName: string) => {
    setIsTesting(true);
    await testGroupLatency(groupName, updateServer);
    setIsTesting(false);
  };

  const sortedServers = useMemo(() => {
    const sorted = [...servers];
    switch(sortBy) {
        case SortBy.LATENCY:
            sorted.sort((a, b) => {
                const latA = typeof a.latency === 'number' ? a.latency : Infinity;
                const latB = typeof b.latency === 'number' ? b.latency : Infinity;
                if (latA === latB) return a.remarks.localeCompare(b.remarks);
                return latA - latB;
            });
            break;
        case SortBy.NAME:
            sorted.sort((a, b) => a.remarks.localeCompare(b.remarks));
            break;
    }
    return sorted;
  }, [servers, sortBy]);

  const handleSort = () => {
    const nextSort = {
      [SortBy.DEFAULT]: SortBy.LATENCY,
      [SortBy.LATENCY]: SortBy.NAME,
      [SortBy.NAME]: SortBy.DEFAULT,
    }[sortBy];
    setSortBy(nextSort);
  };

  const selectedServer = servers.find(s => s.id === selectedServerId);

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
        <div className="bg-v2-light-card dark:bg-v2-dark-card p-8 rounded-2xl shadow-lg max-w-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-v2-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-2xl font-bold mt-4">欢迎使用</h2>
            <p className="text-v2-light-text-secondary dark:text-v2-dark-text-secondary mt-2">
                您的服务器列表为空。请点击右上角的“+”号来添加您的第一个服务器。
            </p>
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 w-full bg-v2-blue text-white py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all font-semibold shadow-md flex items-center justify-center gap-2"
            >
                <PlusIcon className="w-5 h-5"/>
                添加服务器
            </button>
        </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-10">正在从本地加载配置...</div>;
    }
    if (servers.length === 0) {
        return <WelcomeScreen />;
    }
    return (
       <ServerList
          servers={sortedServers}
          selectedServerId={selectedServerId}
          activeServerId={activeServerId}
          onSelectServer={handleSelectServer}
          onShareServer={setServerToShare}
          onTestGroup={handleTestGroup}
        />
    );
  }

  return (
    <div className="bg-v2-light-bg dark:bg-v2-dark-bg text-v2-light-text dark:text-v2-dark-text min-h-screen font-sans flex flex-col transition-colors duration-300">
      <header className="bg-v2-light-card/80 dark:bg-v2-dark-card/80 backdrop-blur-sm sticky top-0 z-10 border-b border-v2-light-border dark:border-v2-dark-border">
        <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-xl font-bold">xiaohev2</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsAddModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="添加服务器">
              <PlusIcon className="w-6 h-6" />
            </button>
            <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="设置">
              <Cog6ToothIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col max-w-4xl w-full mx-auto relative">
        <div className="flex-grow overflow-y-auto">
            {renderContent()}
        </div>
        {servers.length > 0 && (
            <ControlPanel
              connectionStatus={connectionStatus}
              isTesting={isTesting}
              sortBy={sortBy}
              onTestAll={handleTestAll}
              onSort={handleSort}
              onConnect={handleConnect}
              selectedServerExists={!!selectedServer}
            />
        )}
      </main>

      <ShareModal server={serverToShare} onClose={() => setServerToShare(null)} />
      {isAddModalOpen && <AddServerModal onClose={() => setIsAddModalOpen(false)} onAddServers={addServers} />}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        theme={theme} 
        setTheme={setTheme}
        onShowAbout={() => {
            setSettingsOpen(false);
            setIsAboutModalOpen(true);
        }}
       />
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
    </div>
  );
};

export default App;