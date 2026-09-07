import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onClick?: () => void;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 'md', showText = true, onClick }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const textSizes = {
    sm: 'text-base font-bold text-slate-900 tracking-tight',
    md: 'text-lg font-bold tracking-tight text-slate-800',
    lg: 'text-xl font-bold tracking-tight text-slate-800',
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
    >
      <div className={`${iconSizes[size]} rounded-lg overflow-hidden flex items-center justify-center shrink-0`}>
        <img src="/BizSocial_Logo_1.png" alt="BizSocial Logo" className="w-full h-full object-contain rounded-md" />
      </div>
      {showText && <Text className={textSizes[size]}>BizSocial ERP</Text>}
    </div>
  );
};
