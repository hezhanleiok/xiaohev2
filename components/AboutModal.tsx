
import React from 'react';
import { Modal } from './Modal';
import { LinkIcon } from './icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="关于 xiaohev2">
      <div className="space-y-4 text-sm">
        <div className="text-center">
          <img src="/logo192.png" alt="App Logo" className="w-20 h-20 mx-auto mb-2 rounded-xl" />
          <p className="font-bold text-base">xiaohev2</p>
          <p className="text-v2-light-text-secondary dark:text-v2-dark-text-secondary">版本 v1.0.0</p>
        </div>
        <p className="text-v2-light-text-secondary dark:text-v2-dark-text-secondary">
          一个简洁、美观的客户端界面，所有数据安全存储在本地。
        </p>
        <div className="border-t border-v2-light-border dark:border-v2-dark-border pt-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <LinkIcon className="w-4 h-4 mr-2" />
            开源地址
          </h3>
          <p className="text-v2-light-text-secondary dark:text-v2-dark-text-secondary">
            本项目为开源项目，您可以在以下地址找到源代码。
          </p>
          <a 
            href="https://github.com/your-username/your-repo" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-v2-blue hover:underline break-all"
          >
            https://github.com/your-username/your-repo
          </a>
        </div>
        <button 
          onClick={onClose} 
          className="w-full mt-4 bg-v2-blue text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
        >
          关闭
        </button>
      </div>
    </Modal>
  );
};