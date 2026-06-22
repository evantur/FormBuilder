import { useState, useEffect } from 'react';
import { Form } from '../types/form';
import formService from '../services/form.service';

// Custom hook to manage forms data
export const useForms = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await formService.getForms();
      setForms(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch forms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  return { forms, isLoading, error, refetch: fetchForms }; // Expose refetch function so components can trigger manual refresh after actions like delete
};

export const useForm = (id: string) => {
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await formService.getFormById(id);
        setForm(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch form');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchForm();
    }
  }, [id]);

  return { form, isLoading, error };
};
