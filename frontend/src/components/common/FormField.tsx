import React from 'react';
import Input from '../ui/Input';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  placeholder,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={className}>
      <Input
        id={name}
        name={name}
        type={type}
        label={label}
        value={value}
        onChange={onChange}
        error={error}
        helperText={helperText}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};

export default FormField;

