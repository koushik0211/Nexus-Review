import { useState } from 'react';
import { analyzePR } from '../services/api';

export const useAnalyzePR = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const executeAnalysis = async (e) => {
    if (e) e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await analyzePR(url);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError('');
    setUrl('');
  };

  return {
    url,
    setUrl,
    loading,
    result,
    error,
    executeAnalysis,
    reset,
  };
};
