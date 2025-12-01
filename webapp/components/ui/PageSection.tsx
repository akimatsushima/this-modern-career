import React from 'react';
import clsx from 'clsx';

interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
}

const PageSection: React.FC<PageSectionProps> = ({ as: Component = 'section', className, children, ...rest }) => {
  return (
    <Component
      className={clsx('px-6 md:px-20 max-w-3xl mx-auto text-left', className)}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default PageSection;
