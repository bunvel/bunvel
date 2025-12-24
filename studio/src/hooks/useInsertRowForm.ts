import { QUERY_URL } from '@/lib/constant';
import { format } from 'date-fns';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { TableTab } from './useTableExplorer';

type FormFieldType = 'text' | 'number' | 'boolean' | 'date' | 'json' | 'textarea';

interface FormField {
  name: string;
  type: FormFieldType;
  required: boolean;
  defaultValue: any;
  dbType: string;
  label?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface UseInsertRowFormProps {
  tab: TableTab;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function useInsertRowForm({ tab, onSubmit }: UseInsertRowFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form fields based on table columns
  const formFields: FormField[] = tab.columns.map((column) => {
    const dbType = (tab.columnTypes[column] || '').toLowerCase();
    const isNullable = true; // You might want to get this from database metadata
    
    let type: FormFieldType = 'text';
    let defaultValue: any = '';
    let options;

    if (dbType.includes('bool')) {
      type = 'boolean';
      defaultValue = false;
      options = [
        { value: 'true', label: 'True' },
        { value: 'false', label: 'False' },
      ];
    } else if (dbType.includes('int') || dbType.includes('numeric') || dbType.includes('float') || dbType.includes('double')) {
      type = 'number';
      defaultValue = '';
    } else if (dbType.includes('date') || dbType.includes('time')) {
      type = 'date';
      defaultValue = '';
    } else if (dbType.includes('json') || dbType.includes('jsonb')) {
      type = 'json';
      defaultValue = '';
    } else if (dbType.includes('text') || dbType.includes('varchar')) {
      type = 'text';
      defaultValue = '';
    }

    return {
      name: column,
      type,
      required: !isNullable,
      defaultValue,
      dbType,
      label: column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      ...(type === 'boolean' ? { options } : {}),
    };
  });

  // Initialize form data when tab changes
  useEffect(() => {
    const initialData: Record<string, any> = {};
    formFields.forEach((field) => {
      initialData[field.name] = field.defaultValue;
    });
    setFormData(initialData);
    setErrors({});
  }, [tab.id]);

  // Validate form field
  const validateField = (name: string, value: any): string | null => {
    const field = formFields.find((f) => f.name === name);
    if (!field) return null;

    if (field.required && (value === null || value === undefined || value === '')) {
      return 'This field is required';
    }

    if (field.type === 'number' && value !== '' && isNaN(Number(value))) {
      return 'Please enter a valid number';
    }

    if (field.type === 'json' && value) {
      try {
        JSON.parse(value);
      } catch (e) {
        return 'Invalid JSON';
      }
    }

    return null;
  };

  // Handle input change
  const handleChange = useCallback((name: string, value: any) => {
    const field = formFields.find((f) => f.name === name);
    if (!field) return;

    let processedValue = value;

    // Process value based on field type
    switch (field.type) {
      case 'number':
        processedValue = value === '' ? null : Number(value);
        break;
      case 'boolean':
        processedValue = value === 'true' || value === true;
        break;
      case 'date':
        processedValue = value ? new Date(value).toISOString() : null;
        break;
      case 'json':
        try {
          processedValue = value ? JSON.parse(value) : null;
        } catch {
          // If JSON is invalid, keep the raw value for editing
          processedValue = value;
        }
        break;
      default:
        processedValue = value === '' ? null : value;
    }

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Validate and update errors
    const error = validateField(name, processedValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error || '',
    }));
  }, [formFields]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    let isValid = true;

    formFields.forEach((field) => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    if (!isValid) return;

    // Filter out empty values
    const dataToSubmit = Object.entries(formData).reduce<Record<string, any>>(
      (acc, [key, value]) => {
        if (value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    try {
      setIsSubmitting(true);
      await onSubmit(dataToSubmit);
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get input props for a field
  const getInputProps = (field: FormField) => {
    const value = formData[field.name] ?? '';
    const error = errors[field.name];

    switch (field.type) {
      case 'boolean':
        return {
          type: 'select' as const,
          value: value ? 'true' : 'false',
          onChange: (val: string) => handleChange(field.name, val === 'true'),
          options: field.options || [
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ],
          error,
        };

      case 'date':
        const dateValue = value ? format(new Date(value), 'yyyy-MM-dd') : '';
        return {
          type: 'date' as const,
          value: dateValue,
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            handleChange(field.name, e.target.value),
          error,
        };

      case 'json':
        const jsonValue =
          typeof value === 'string' ? value : JSON.stringify(value, null, 2);
        return {
          type: 'textarea' as const,
          value: jsonValue,
          onChange: (e: ChangeEvent<HTMLTextAreaElement>) =>
            handleChange(field.name, e.target.value),
          error,
        };

      case 'number':
        return {
          type: 'number' as const,
          value: value === null || value === undefined ? '' : value,
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            handleChange(field.name, e.target.value),
          step: field.dbType === 'integer' ? '1' : 'any',
          error,
        };

      default:
        return {
          type: 'text' as const,
          value: value || '',
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            handleChange(field.name, e.target.value),
          error,
        };
    }
  };

  const insertRow = useCallback(async (data: Record<string, any>) => {
    try {
      const response = await fetch(QUERY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `INSERT INTO "${tab.schema}"."${tab.table}" (${Object.keys(data)
            .map((k) => `"${k}"`)
            .join(', ')})
            VALUES (${Object.entries(data).map(([key, value]) => {
              const columnType = tab.columnTypes[key]?.toLowerCase();
              
              if (value === null || value === undefined) {
                return 'NULL';
              }
              
              if (columnType?.includes('json')) {
                return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
              }
              
              if (value instanceof Date) {
                return `'${value.toISOString()}'::timestamp`;
              }
              
              if (typeof value === 'string') {
                return `'${value.replace(/'/g, "''")}'`;
              }
              
              if (typeof value === 'boolean') {
                return value ? 'true' : 'false';
              }
              
              return value;
            }).join(', ')})
            RETURNING *`,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      await onSubmit(data);
      return true;
    } catch (error) {
      console.error('Error inserting row:', error);
      throw error;
    }
  }, [tab.schema, tab.table, tab.columnTypes, onSubmit]);

  return {
    formData,
    formFields,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    getInputProps,
    insertRow,
  };
}

export type { FormField, FormFieldType };
