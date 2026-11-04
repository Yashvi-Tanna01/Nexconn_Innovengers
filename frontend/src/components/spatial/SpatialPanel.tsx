import React from 'react';

interface SpatialPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'hud';
  children: React.ReactNode;
  className?: string;
}

export const SpatialPanel: React.FC<SpatialPanelProps> = ({
  variant = 'glass',
  children,
  className = '',
  ...props
}) => {
  const styles = {
    glass:
      'backdrop-blur-xl bg-white/80 border border-white/80 rounded-2xl shadow-[0_12px_40px_rgba(11,19,43,0.06)] transition-all duration-200',
    solid:
      'bg-white border border-slate-200/90 rounded-2xl shadow-soft-md transition-all duration-200',
    hud:
      'backdrop-blur-md bg-slate-900/85 text-white border border-white/20 rounded-2xl shadow-soft-lg',
  };

  return (
    <div className={`${styles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

