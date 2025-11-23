import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 disabled:pointer-events-none disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-500 disabled:hover:bg-gray-400 disabled:hover:text-gray-500 disabled:hover:opacity-75 disabled:hover:shadow-none disabled:active:bg-gray-400 disabled:data-[state=pressed]:bg-gray-400',
        className,
      )}
    >
      {children}
    </button>
  );
}
