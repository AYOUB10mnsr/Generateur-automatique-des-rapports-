import React from 'react';

function Card({ children, className = '', glass = false, interactive = true, ...props }) {
  const baseStyle = glass
    ? 'glass rounded-2xl p-6 dark:glass-dark'
    : 'rounded-2xl bg-white border border-slate-200 shadow-soft p-6 dark:bg-slate-900 dark:border-slate-700';

  const hoverStyle = interactive ? 'hover:shadow-soft-lg transition-smooth' : '';

  return (
    <div className={`${baseStyle} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
