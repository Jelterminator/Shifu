import { useCallback, useState } from 'react';
import { ModelLoader } from '../services/ai/ModelLoader';

export interface ModelLoaderHook {
  loadModel: (url: string, fileName: string) => Promise<string | null>;
  loading: boolean;
  progress: number;
  error: string | null;
  modelPath: string | null;
}

export const useModelLoader = (): ModelLoaderHook => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [modelPath, setModelPath] = useState<string | null>(null);

  const loadModel = useCallback(async (url: string, fileName: string): Promise<string | null> => {
    setLoading(true);
    setProgress(0);
    setError(null);
    try {
      const path = await ModelLoader.ensureModel(url, fileName, p => {
        setProgress(p);
      });
      setModelPath(path);
      return path;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load model';
      setError(message);
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
