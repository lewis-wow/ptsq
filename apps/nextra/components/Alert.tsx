import { ReactNode } from 'react';

export type AlertProps = {
  title: ReactNode;
  children?: ReactNode;
};

export const Alert = ({ title, children }: AlertProps) => (
  <div
    className="bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 rounded-lg p-4 dark:bg-yellow-800/10 dark:border-yellow-900 dark:text-yellow-500"
    role="alert"
  >
    <div className="flex">
      <div className="flex-shrink-0">
        <svg
          className="flex-shrink-0 h-4 w-4 mt-0.5"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      </div>
      <div className="ms-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="mt-1 text-sm text-yellow-700">{children}</div>
      </div>
    </div>
  </div>
);
