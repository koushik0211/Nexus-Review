import { useState } from 'react';
import { analyzePR, resumeAnalysis } from '../services/api';

export const useAnalyzePR = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);

  // AI Provider Settings
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [apiKey, setApiKey] = useState('');

  // HITL States
  const [hitlPending, setHitlPending] = useState(false);
  const [hitlData, setHitlData] = useState(null);
  const [threadId, setThreadId] = useState(null);

  const executeAnalysis = async (e) => {
    if (e) e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setResult(null);
    setLogs([]); 
    setHitlPending(false);
    setHitlData(null);
    setThreadId(null);

    try {
      const data = await analyzePR(
        url, 
        { provider, model, api_key: apiKey }, 
        (msg) => setLogs((prev) => [...prev, msg]),
        (hitlFindings, tId) => {
          setHitlData(hitlFindings);
          setThreadId(tId);
          setHitlPending(true);
          // Don't disable loading here yet, handle it in finally or manually
        }
      );
      
      // If data is null, it hit the HITL breakpoint
      if (data) {
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      // Need a way to not clear loading if HITL is pending
      // But state updates are batched, so hitlPending might not be true immediately in this closure.
      // We can just rely on the fact that if data is null, we hit HITL.
    }
  };

  // Fix finally block
  const executeAnalysisWrapper = async (e) => {
    let hitBreakpoint = false;
    if (e) e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setResult(null);
    setLogs([]); 
    setHitlPending(false);
    setHitlData(null);
    setThreadId(null);

    try {
      const data = await analyzePR(
        url, 
        { provider, model, api_key: apiKey }, 
        (msg) => setLogs((prev) => [...prev, msg]),
        (hitlFindings, tId) => {
          setHitlData(hitlFindings);
          setThreadId(tId);
          setHitlPending(true);
          hitBreakpoint = true;
        }
      );
      
      if (data) {
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      if (!hitBreakpoint) {
        setLoading(false);
      } else {
        setLoading(false); // We want to show the HITL board instead of loader
      }
    }
  }

  const submitHitlFeedback = async (editedFindings) => {
    setHitlPending(false);
    setLoading(true);
    setLogs(prev => [...prev, '\n[System] Sending curated findings back to AI...']);

    try {
      const data = await resumeAnalysis(
        threadId, 
        editedFindings, 
        { provider, model, api_key: apiKey }, 
        (message) => setLogs(prev => [...prev, message])
      );
      
      if (data) {
        setResult(data);
      }
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
    setLogs([]);
    setHitlPending(false);
    setHitlData(null);
    setThreadId(null);
  };

  return {
    url,
    setUrl,
    provider,
    setProvider,
    model,
    setModel,
    apiKey,
    setApiKey,
    loading,
    result,
    error,
    logs,
    hitlPending,
    hitlData,
    executeAnalysis: executeAnalysisWrapper,
    submitHitlFeedback,
    reset,
  };
};
