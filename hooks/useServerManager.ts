import { useState, useEffect, useCallback } from 'react';
import { ServerConfig } from '../types';

const V2RAY_SERVERS_KEY = 'xiaohev2_servers';

export const useServerManager = () => {
  const [servers, setServers] = useState<ServerConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedServers = localStorage.getItem(V2RAY_SERVERS_KEY);
      if (storedServers) {
        setServers(JSON.parse(storedServers));
      }
    } catch (e) {
      console.error("Failed to load servers from localStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveServers = (newServers: ServerConfig[]) => {
    try {
      setServers(newServers);
      localStorage.setItem(V2RAY_SERVERS_KEY, JSON.stringify(newServers));
    } catch (e) {
      console.error("Failed to save servers to localStorage", e);
    }
  };

  const addServers = async (newServers: ServerConfig[]) => {
    const serversWithGeo = await Promise.all(
      newServers.map(async (server) => {
        if (server.address && !server.countryCode) {
           try {
            // Use a reliable, CORS-friendly geolocation API
            const response = await fetch(`https://freegeoip.app/json/${server.address}`);
            if (response.ok) {
              const data = await response.json();
              return { ...server, countryCode: data.country_code };
            }
          } catch (e) {
            console.warn(`Geolocation lookup failed for ${server.address}`, e);
          }
        }
        return server;
      })
    );
    saveServers([...servers, ...serversWithGeo]);
  };
  
  const updateServer = (updatedServer: ServerConfig) => {
    saveServers(servers.map(s => s.id === updatedServer.id ? updatedServer : s));
  };

  const deleteServer = (serverId: string) => {
    saveServers(servers.filter(s => s.id !== serverId));
  };
  
  // Mock latency test for now, as we can't do it from the browser.
  const testLatency = async (serverId: string, updater: (server: ServerConfig) => void) => {
    let serverToTest = servers.find(s => s.id === serverId);
    if (!serverToTest) return;

    // Set status to "Testing..."
    updater({ ...serverToTest, latency: '测试中...' });

    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

    const randomLatency = Math.random() > 0.1 ? Math.floor(50 + Math.random() * 500) : '超时';
    
    // Update with final latency
    // Re-fetch server from state to avoid race conditions if state updated elsewhere
    const currentServer = servers.find(s => s.id === serverId);
    if (currentServer) {
        updater({ ...currentServer, latency: randomLatency });
    }
  };
  
  const testGroupLatency = async (groupName: string, updater: (server: ServerConfig) => void) => {
      const serversInGroup = servers.filter(s => (s.group || '默认分组') === groupName);
      await Promise.all(serversInGroup.map(server => testLatency(server.id, updater)));
  };

  return { 
    servers,
    loading,
    addServers,
    updateServer,
    deleteServer,
    testLatency,
    testGroupLatency,
  };
};