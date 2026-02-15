import { useCallback, useState } from 'react';
import { ModelLoader } from '../services/ModelLoader';

export const useModelLoader = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [modelPath, setModelPath] = useState<string | null>(null);

  const loadModel = useCallback(async (url: string, fileName: string) => {
    setLoading(true);
    setProgress(0);
    setError(null);
    try {
      const path = await ModelLoader.ensureModel(url, fileName, p => {
        setProgress(p);
      });
      setModelPath(path);
      return path;
    } catch (err: any) {
      setError(err.message || 'Failed to load model');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loadModel,
    loading,
    progress,
    error,
    modelPath,
  };
};
