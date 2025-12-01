import React from 'react';
import clsx from 'clsx';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ className, children, disabled, ...rest }) => {
  const baseClasses =
    'w-full md:w-full px-1 md:px-2 py-2 md:py-3 rounded-lg font-bold text-[10px] md:text-sm transition-all shadow-lg uppercase tracking-wide whitespace-normal flex items-center justify-center leading-tight';

  const enabledClasses = 'bg-gradient-to-br from-orange-500 to-orange-700 text-white hover:-translate-y-0.5 hover:shadow-orange-500/30';
  const disabledClasses = 'bg-slate-700 text-slate-400 scale-95 ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-800';

  return (
    <button
      className={clsx(baseClasses, disabled ? disabledClasses : enabledClasses, className)}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
