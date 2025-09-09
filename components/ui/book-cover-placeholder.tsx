import React from 'react';

interface BookCoverPlaceholderProps {
  title: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BookCoverPlaceholder({ title, className = '', size = 'md' }: BookCoverPlaceholderProps) {
  const sizeClasses = {
    sm: 'w-16 h-20',
    md: 'w-24 h-32',
    lg: 'w-32 h-40'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md flex items-center justify-center p-2 text-white font-semibold text-center`}
    >
      <div className={`${textSizeClasses[size]} leading-tight`}>
        {title.split(' ').slice(0, 3).join(' ')}
        {title.split(' ').length > 3 && '...'}
      </div>
    </div>
  );
}
