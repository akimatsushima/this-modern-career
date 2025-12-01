import React from 'react';
import clsx from 'clsx';

interface SectionHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3';
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ as: Component = 'h2', className, children, ...rest }) => {
  return (
    <Component
      className={clsx('font-medium tracking-tight text-slate-900', className)}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default SectionHeading;
