import React from 'react';
import clsx from 'clsx';

interface ScrollStepCardProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
}

const ScrollStepCard: React.FC<ScrollStepCardProps> = ({ step, className, children, ...rest }) => {
  return (
    <div
      data-step={step}
      className={clsx(
        'scroll-step min-h-[60vh] md:h-[80vh] flex items-center justify-center md:justify-end px-4 md:px-12 pointer-events-none',
        className
      )}
    >
      <div className="w-full md:max-w-sm p-6 md:p-8 md:bg-white/80 md:backdrop-blur-xl md:border md:border-slate-200 md:rounded-lg md:shadow-2xl pointer-events-auto mr-0 md:mr-10">
        {children}
      </div>
    </div>
  );
};

export default ScrollStepCard;
