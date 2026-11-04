import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { OperationLoadingIndicator } from '../loading/OperationLoadingIndicator';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'amber' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  disabled,
  className = '',
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  const baseClasses =
    'relative inline-flex items-center justify-center font-medium select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-antah-teal/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-subtle gap-2',
    lg: 'text-base px-6 py-3 rounded-panel gap-2.5 shadow-soft-sm font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-antah-teal text-white hover:bg-antah-teal-hover shadow-soft-xs hover:shadow-teal-glow transition-colors duration-150',
    secondary:
      'bg-white text-antah-navy border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-soft-xs transition-colors duration-150',
    amber:
      'bg-antah-amber text-white hover:bg-antah-amber-hover shadow-soft-xs hover:shadow-amber-glow transition-colors duration-150',
    outline:
      'bg-transparent text-antah-navy border border-slate-200/90 hover:bg-slate-50 hover:border-antah-navy/20 transition-colors duration-150',
    ghost:
      'bg-transparent text-antah-slate hover:text-antah-navy hover:bg-slate-100/70 transition-colors duration-150',
    danger:
      'bg-antah-rose text-white hover:bg-antah-rose-hover shadow-soft-xs transition-colors duration-150',
  };

  const motionProps = shouldReduceMotion || disabled || isLoading
    ? {}
    : {
        whileHover: { y: -1, transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] } },
        whileTap: { scale: 0.98, transition: { duration: 0.1 } },
      };

  return (
    <motion.button
      {...(motionProps as any)}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...(props as any)}
    >
      {isLoading ? (
        <OperationLoadingIndicator
          label="Processing..."
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </motion.button>
  );
};
