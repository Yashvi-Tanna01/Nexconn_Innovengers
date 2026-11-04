import React, { useRef, useState, memo } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'panel' | 'subtle' | 'interactive' | 'level1' | 'level2' | 'level3';
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;
  level?: 1 | 2 | 3;
}

const variantStyles = {
  default: 'spatial-level-2 rounded-2xl',
  level1: 'spatial-level-1 rounded-2xl',
  level2: 'spatial-level-2 rounded-2xl',
  level3: 'spatial-level-3 rounded-2xl',
  panel: 'spatial-level-2 rounded-2xl',
  subtle: 'bg-slate-50/70 border border-slate-200/80 rounded-2xl',
  interactive:
    'spatial-level-2 rounded-2xl cursor-pointer spatial-focus-ring focus:outline-none select-none',
};

// Isolated Tilted Card to prevent overhead on static cards
const TiltCard: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
  level,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Subtle restrained spring tilt (max 1.2 deg)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 350, damping: 30 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 350, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const yPct = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    rotateX.set(-yPct * 1.2);
    rotateY.set(xPct * 1.2);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const effectiveStyle = level ? variantStyles[`level${level}`] : variantStyles[variant];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        !shouldReduceMotion
          ? {
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }
          : undefined
      }
      className={`relative overflow-hidden ${effectiveStyle} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};

export const Card: React.FC<CardProps> = memo(({
  variant = 'default',
  children,
  className = '',
  tilt = false,
  level,
  ...props
}) => {
  if (tilt) {
    return (
      <TiltCard variant={variant} level={level} className={className} {...props}>
        {children}
      </TiltCard>
    );
  }

  const effectiveStyle = level ? variantStyles[`level${level}`] : variantStyles[variant];

  return (
    <div
      className={`relative overflow-hidden ${effectiveStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = memo(({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 pb-3 ${className}`} {...props}>
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = memo(({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-base font-bold text-antah-navy tracking-tight ${className}`} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = memo(({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-antah-slate mt-1 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = memo(({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 pt-0 ${className}`} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = memo(({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 pt-0 flex items-center ${className}`} {...props}>
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';
