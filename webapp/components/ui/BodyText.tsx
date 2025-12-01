import React from 'react';
import clsx from 'clsx';

interface BodyTextProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const BodyText: React.FC<BodyTextProps> = ({ className, children, ...rest }) => {
  return (
    <p
      className={clsx('text-lg md:text-xl text-slate-600 leading-relaxed mb-6 font-light', className)}
      {...rest}
    >
      {children}
    </p>
  );
};

export default BodyText;
