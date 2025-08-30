import { useState, useCallback, useMemo } from 'react';

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

export interface FormActions<T> {
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  setAllErrors: (errors: Partial<Record<keyof T, string>>) => void;
  setAllTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
  resetForm: (data?: Partial<T>) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
}

export type ValidationSchema<T> = {
  [K in keyof T]?: (value: T[K], formData: T) => string | undefined;
};

export function useFormState<T extends Record<string, unknown>>(
  initialData: T,
  validationSchema?: ValidationSchema<T>
): FormState<T> & FormActions<T> {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized computed values
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);

  // Field validation
  const validateField = useCallback((field: keyof T): boolean => {
    if (!validationSchema || !validationSchema[field]) {
      return true;
    }

    const validator = validationSchema[field]!;
    const error = validator(data[field], data);
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    }
  }, [data, validationSchema]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    if (!validationSchema) {
      return true;
    }

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach((field) => {
      const key = field as keyof T;
      const validator = validationSchema[key]!;
      const error = validator(data[key], data);
      
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [data, validationSchema]);

  // Actions
  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Auto-validate on change if field is touched
    if (touched[field]) {
      validateField(field);
    }
  }, [touched, validateField]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, touched = true) => {
    setTouched(prev => ({ ...prev, [field]: touched }));
    
    // Validate field when touched
    if (touched) {
      validateField(field);
    }
  }, [validateField]);

  const setAllErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrors(newErrors);
  }, []);

  const setAllTouched = useCallback((newTouched: Partial<Record<keyof T, boolean>>) => {
    setTouched(newTouched);
  }, []);

  const resetForm = useCallback((newData?: Partial<T>) => {
    const resetData = newData ? { ...initialData, ...newData } : initialData;
    setData(resetData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialData]);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  return {
    // State
    data,
    errors,
    touched,
    isValid,
    isDirty,
    isSubmitting,
    
    // Actions
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setAllErrors,
    setAllTouched,
    resetForm,
    setSubmitting,
    validateField,
    validateForm,
  };
}
