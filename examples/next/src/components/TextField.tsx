import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  ReactNode,
  useId,
} from 'react';

export type TextFieldProps = {
  type?: 'text' | 'email' | 'search';
  label?: ReactNode;
  placeholder?: string;
  name: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ type, label, placeholder, name, onChange, onBlur }, ref) => {
    const elementId = useId();

    return (
      <div>
        <label
          htmlFor={elementId}
          className="block text-sm font-medium mb-2 dark:text-white"
        >
          {label}
        </label>
        <input
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          type={type ?? 'text'}
          id={elementId}
          className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
          placeholder={placeholder}
        />
      </div>
    );
  },
);

TextField.displayName = 'TextField';
