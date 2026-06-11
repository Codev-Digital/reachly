
'use client';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'large', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'font-manier font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer';
  
  const variantClasses = {
    primary: 'bg-accent text-text-white hover:brightness-110 active:scale-95',
    outline: 'border-2 border-accent text-accent hover:bg-accent hover:text-white active:scale-95',
    ghost: 'text-text-light hover:text-accent active:scale-95',
  };
  
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

