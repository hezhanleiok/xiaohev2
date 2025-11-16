import React, { useState, useEffect } from 'react';
import { ServerConfig, Protocol } from '../types';
import { Modal } from './Modal';
import { ClipboardIcon, LinkIcon, PencilSquareIcon, QrCodeIcon } from './icons';

declare const Html5Qrcode: any;

interface AddServerModalProps {
    onClose: () => void; 
    onAddServers: (servers: ServerConfig[]) => Promise<void>;
}

export const AddServerModal: React.FC<AddServerModalProps> = ({ onClose, onAddServers }) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    // Clear feedback when tab changes
    setFeedback('');
  }, [activeTab]);

  const parseVmessLink = (link: string): ServerConfig | null => {
    try {
      if (!link.startsWith('vmess://')) return null;
      const b64 = link.substring(8);
      const decoded = atob(b64);
      const config = JSON.parse(decoded);
      
      return {
        id: crypto.randomUUID(),
        remarks: config.ps || config.add,
        protocol: Protocol.VMess,
        address: config.add,
        port: Number(config.port),
        group: config.group || '导入分组',
        latency: 'N/A',
        tlsFragmentation: config.tls === 'tls',
      };
    } catch (e) {
      console.error('Failed to parse VMess link', e);
      return null;
    }
  };

  const processImportContent = async (content: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setFeedback('正在处理...');
    try {
      const lines = content.split(/[\r\n]+/).filter(line => line.trim() !== '');
      // A more robust parser would check for other protocols like vless, trojan, etc.
      const servers: ServerConfig[] = lines.map(parseVmessLink).filter((s): s is ServerConfig => s !== null);

      if (servers.length > 0) {
        await onAddServers(servers);
        setFeedback(`${servers.length} 个服务器导入成功!`);
        setTimeout(onClose, 1500);
      } else {
        setFeedback('未找到有效的服务器信息。');
      }
    } catch (e) {
      console.error(e);
      setFeedback('导入失败，请检查内容格式。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClipboardImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        await processImportContent(text);
      } else {
        setFeedback('剪贴板为空。');
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      setFeedback('无法读取剪贴板。请授予权限。');
    }
  };
  
  const handleUrlImport = async () => {
    if (!urlInput) {
      setFeedback('请输入订阅URL。');
      return;
    }
    setIsProcessing(true);
    setFeedback('正在从URL导入...');
    try {
      // NOTE: This direct fetch can be blocked by CORS policy on the subscription server.
      const response = await fetch(urlInput);
      if (!response.ok) throw new Error(`HTTP 错误! 状态: ${response.status}`);
      const rawData = await response.text();
      let content = rawData;
      try {
        // Try decoding if it's base64, otherwise use as is.
        content = atob(rawData);
      } catch (e) { /* Not base64, proceed with raw data */ }
      await processImportContent(content);
    } catch (e) {
      console.error(e);
      setFeedback('从URL导入失败。请检查链接或服务器的CORS策略。');
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newServer: ServerConfig = {
      id: crypto.randomUUID(),
      remarks: formData.get('remarks') as string || '新服务器',
      protocol: formData.get('protocol') as Protocol,
      address: formData.get('address') as string,
      port: Number(formData.get('port')),
      group: formData.get('group') as string || '手动添加',
      latency: 'N/A',
      tlsFragmentation: formData.get('tlsFragmentation') === 'on',
    };
    setIsProcessing(true);
    setFeedback('正在添加...');
    await onAddServers([newServer]);
    setFeedback('服务器已添加!');
    setTimeout(onClose, 1000);
  };

  const QrScanner = () => {
      useEffect(() => {
          let html5QrCode: any;
          try {
              html5QrCode = new Html5Qrcode("qr-reader");
          } catch(e) {
              console.error(e);
              setFeedback("无法初始化QR扫描器。");
              return;
          }

          const startScanner = () => {
              html5QrCode.start(
                  { facingMode: "environment" },
                  { fps: 10, qrbox: { width: 250, height: 250 } },
                  (decodedText: string) => {
                      html5QrCode.stop();
                      processImportContent(decodedText);
                  },
                  (errorMessage: string) => { /* ignore */ }
              ).catch((err: any) => {
                  console.error("QR Scanner start failed:", err);
                  setFeedback("无法启动摄像头。请检查权限。");
              });
          };

          startScanner();

          return () => {
              if (html5QrCode && html5QrCode.isScanning) {
                  html5QrCode.stop().catch((err: any) => console.log("QR stop failed", err));
              }
          };
      }, []);

      return (
          <div>
              <div id="qr-reader" className="w-full border border-v2-light-border dark:border-v2-dark-border rounded-lg overflow-hidden"></div>
              <p className="text-center text-sm text-v2-light-text-secondary dark:text-v2-dark-text-secondary mt-2">
                将二维码放入框内即可自动扫描
              </p>
          </div>
      );
  };

  const tabs = [
    { id: 'clipboard', name: '剪贴板', icon: ClipboardIcon },
    { id: 'url', name: 'URL', icon: LinkIcon },
    { id: 'qr', name: '扫码', icon: QrCodeIcon },
    { id: 'manual', name: '手动', icon: PencilSquareIcon },
  ];

  const inputClasses = "w-full p-2 border rounded-md bg-transparent border-v2-light-border dark:border-v2-dark-border focus:ring-v2-blue focus:border-v2-blue disabled:opacity-50";
  const selectClasses = `${inputClasses} appearance-none`;
  const labelClasses = "block text-sm font-medium mb-1 text-v2-light-text-secondary dark:text-v2-dark-text-secondary";
  const buttonClasses = "w-full bg-v2-blue text-white py-2.5 rounded-lg hover:bg-opacity-90 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed";

  return (
    <Modal isOpen={true} onClose={onClose} title="添加服务器">
      <div className="flex border-b border-v2-light-border dark:border-v2-dark-border mb-4">
        {tabs.map(tab => (
           <button 
             key={tab.id} 
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${activeTab === tab.id ? 'border-v2-blue text-v2-blue' : 'border-transparent text-v2-light-text-secondary dark:text-v2-dark-text-secondary hover:border-gray-300 dark:hover:border-gray-500 hover:text-v2-light-text dark:hover:text-v2-dark-text'}`}
           >
             <tab.icon className="w-5 h-5"/>
             {tab.name}
           </button>
        ))}
      </div>
      <div>
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div><label className={labelClasses}>备注</label><input name="remarks" placeholder="香港精品线路" required className={inputClasses} disabled={isProcessing}/></div>
            <div><label className={labelClasses}>地址</label><input name="address" placeholder="server.address.com" required className={inputClasses} disabled={isProcessing}/></div>
            <div><label className={labelClasses}>端口</label><input name="port" type="number" placeholder="443" required className={inputClasses} disabled={isProcessing}/></div>
            <div><label className={labelClasses}>协议</label><select name="protocol" defaultValue={Protocol.VLESS} className={selectClasses} disabled={isProcessing}>
              {Object.values(Protocol).map(p => <option key={p} value={p}>{p}</option>)}
            </select></div>
            <div><label className={labelClasses}>分组</label><input name="group" placeholder="手动添加" className={inputClasses} disabled={isProcessing}/></div>
            <div className="flex items-center gap-2 pt-2">
              <input id="tls" name="tlsFragmentation" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-v2-blue focus:ring-v2-blue" disabled={isProcessing}/>
              <label htmlFor="tls" className="text-sm">启用TLS分片</label>
            </div>
            <button type="submit" className={buttonClasses} disabled={isProcessing}>保存</button>
          </form>
        )}
        {activeTab === 'clipboard' && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-v2-light-text-secondary dark:text-v2-dark-text-secondary">将自动检测剪贴板中的订阅链接或节点信息。</p>
            <button onClick={handleClipboardImport} className={buttonClasses} disabled={isProcessing}>从剪贴板导入</button>
          </div>
        )}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <input placeholder="输入订阅URL" className={inputClasses} value={urlInput} onChange={e => setUrlInput(e.target.value)} disabled={isProcessing}/>
            <button onClick={handleUrlImport} className={buttonClasses} disabled={isProcessing}>从URL导入</button>
          </div>
        )}
        {activeTab === 'qr' && <QrScanner />}
        {feedback && <p className="text-center text-sm mt-4">{feedback}</p>}
      </div>
    </Modal>
  );
};