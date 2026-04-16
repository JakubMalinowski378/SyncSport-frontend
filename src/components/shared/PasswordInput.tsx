import { useState, InputHTMLAttributes } from 'react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id?: string;
}

export default function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`input-group ${className || ''}`}>
      <input
        {...props}
        type={showPassword ? 'text' : 'password'}
        className="form-control"
      />
      <button
        className="btn btn-outline-secondary"
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
