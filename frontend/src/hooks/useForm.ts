import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => void | Promise<void>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof T]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof T];
        return newErrors;
      });
    }
  }, [errors]);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setError(name, error);
  }, [setError]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setValue,
    setError,
    setFieldError,
    reset
  };
};

