import { forwardRef, type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = forwardRef<HTMLInputElement, Props>(
  ({ label, error, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        ref={ref}
        {...props}
        className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition ${
          error ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
        } ${props.className ?? ''}`}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
);

FormInput.displayName = 'FormInput';
export default FormInput;
