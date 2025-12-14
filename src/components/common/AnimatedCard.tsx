import React, { memo } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedCard = memo<AnimatedCardProps>(function AnimatedCard({
  children,
  delay = 0,
  className = '',
  ...motionProps
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
        delay
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={`bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl ${className}`}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
});

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const FadeIn = memo<FadeInProps>(function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className = ''
}) {
  const directionOffset = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { y: 0, x: 20 },
    right: { y: 0, x: -20 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer = memo<StaggerContainerProps>(function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className = ''
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

export const StaggerItem = memo<{ children: React.ReactNode; className?: string }>(
  function StaggerItem({ children, className = '' }) {
    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              type: 'spring',
              damping: 20,
              stiffness: 300
            }
          }
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);

interface PulseProps {
  children: React.ReactNode;
  isActive?: boolean;
  color?: 'green' | 'yellow' | 'red' | 'blue';
  className?: string;
}

export const Pulse = memo<PulseProps>(function Pulse({
  children,
  isActive = true,
  color = 'green',
  className = ''
}) {
  const colorClasses = {
    green: 'shadow-green-500/50',
    yellow: 'shadow-yellow-500/50',
    red: 'shadow-red-500/50',
    blue: 'shadow-blue-500/50'
  };

  return (
    <motion.div
      animate={
        isActive
          ? {
              boxShadow: [
                `0 0 0 0 ${colorClasses[color]}`,
                `0 0 0 8px transparent`
              ]
            }
          : {}
      }
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const CountUp = memo<CountUpProps>(function CountUp({
  value,
  prefix = '',
  suffix = '',
  duration = 1,
  className = ''
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {prefix}
      </motion.span>
      <motion.span
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
      >
        {value.toLocaleString()}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {suffix}
      </motion.span>
    </motion.span>
  );
});
