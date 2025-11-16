
import React, { useMemo } from 'react';
import { ServerConfig } from '../types';
import { Modal } from './Modal';

interface ShareModalProps {
  server: ServerConfig | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ server, onClose }) => {
  const shareUrl = useMemo(() => {
    if (!server) return '';
    return `v2rayn://custom?remarks=${server.remarks}&address=${server.address}&port=${server.port}&protocol=${server.protocol}`;
  }, [server]);

  const qrCodeData = useMemo(() => {
      if (!shareUrl) return '';
      return encodeURIComponent(shareUrl);
  }, [shareUrl]);

  if (!server) return null;
  
  return (
    <Modal isOpen={!!server} onClose={onClose} title={`分享节点: ${server.remarks}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="p-2 bg-white border rounded-lg">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${qrCodeData}`} alt="QR Code" width="256" height="256" />
        </div>
        <div className="text-center text-sm text-v2-light-text-secondary dark:text-v2-dark-text-secondary">
          <p>{server.protocol} @ {server.address}:{server.port}</p>
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText(shareUrl)}
          className="w-full bg-v2-blue text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          复制分享链接
        </button>
      </div>
    </Modal>
  );
};