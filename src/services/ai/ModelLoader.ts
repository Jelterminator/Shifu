import * as FileSystem from 'expo-file-system/legacy';

export class ModelLoader {
  private static get modelDir(): string | null {
    const docDir = FileSystem.documentDirectory;
    if (!docDir) {
      console.warn(
        'ModelLoader: FileSystem.documentDirectory is null. Native module might be missing.'
      );
      return null;
    }
    // Ensure trailing slash
    const path = docDir.endsWith('/') ? docDir : docDir + '/';
    return path + 'models/';
  }

  static async initialize(): Promise<void> {
    try {
      const modelDir = this.modelDir;
      if (!modelDir) return;

      const dirInfo = await FileSystem.getInfoAsync(modelDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
      }
    } catch (error) {
      console.warn('ModelLoader: Failed to initialize directory:', error);
    }
  }

  static async ensureModel(
    url: string,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      await this.initialize();

      const modelDir = this.modelDir;
      if (!modelDir) {
        throw new Error('FileSystem.documentDirectory is unavailable');
      }

      // 2. Check Local Cache
      const headers = { 'Cache-Control': 'no-cache' }; // Force check
      const localUri = modelDir + fileName;
      const fileInfo = await FileSystem.getInfoAsync(localUri);

      if (fileInfo.exists) {
        return localUri;
      }

      // Create a resumable download
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        localUri,
        { headers },
        downloadProgress => {
          const progress =
            downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) {
            onProgress(progress);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result && result.uri) {
        return result.uri;
      } else {
        throw new Error('Download failed to return a URI');
      }
    } catch (error) {
      console.error('ModelLoader: Failed to ensure model:', error);
      throw error; // Re-throw so caller knows, but we logged it.
    }
  }

  static async getModelPath(fileName: string): Promise<string | null> {
    try {
      const modelDir = this.modelDir;
      if (!modelDir) return null;

      const localUri = modelDir + fileName;
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      return fileInfo.exists ? localUri : null;
    } catch (error) {
      console.warn('ModelLoader: Failed to check model existence:', error);
      return null;
    }
  }
}
