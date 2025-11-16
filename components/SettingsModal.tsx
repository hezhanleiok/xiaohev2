
import React from 'react';
import { SunIcon, MoonIcon } from './icons';
import { Modal } from './Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  setTheme: (theme: 'light' | 'dark') => void;
  onShowAbout: () => void;
}
  
export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    theme, 
    setTheme, 
    onShowAbout 
}) => {
    
  const SettingRow: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="flex items-center justify-between py-3">
        <span className="font-medium">{title}</span>
        <div>{children}</div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="设置">
        <div className="space-y-2 divide-y divide-v2-light-border dark:divide-v2-dark-border">
            <div className="py-2">
                <h3 className="font-semibold text-base mb-2 pt-2">外观</h3>
                <SettingRow title="主题">
                    <div className="flex items-center gap-2 rounded-full bg-v2-light-bg dark:bg-v2-dark-bg p-1 border border-v2-light-border dark:border-v2-dark-border">
                        <button 
                            onClick={() => setTheme('light')}
                            className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-v2-blue text-white shadow' : 'text-v2-light-text-secondary dark:text-v2-dark-text-secondary'}`}
                            aria-label="浅色主题"
                        >
                            <SunIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setTheme('dark')}
                            className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-v2-blue text-white shadow' : 'text-v2-light-text-secondary dark:text-v2-dark-text-secondary'}`}
                             aria-label="深色主题"
                        >
                            <MoonIcon className="w-5 h-5" />
                        </button>
                    </div>
                </SettingRow>
            </div>
             <div className="py-2">
                <h3 className="font-semibold text-base mb-2 pt-2">通用</h3>
                 <SettingRow title="关于">
                    <button onClick={onShowAbout} className="text-v2-blue hover:underline text-sm font-medium">
                        查看信息
                    </button>
                </SettingRow>
            </div>
        </div>
    </Modal>
  );
};