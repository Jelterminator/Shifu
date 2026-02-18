import * as FileSystem from 'expo-file-system/legacy';

const MODEL_DIR = FileSystem.documentDirectory + 'models/';

export class ModelLoader {
  static async initialize(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(MODEL_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
    }
  }

  static async ensureModel(
    url: string,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    await this.initialize();

    // 2. Check Local Cache
    const headers = { 'Cache-Control': 'no-cache' }; // Force check
    const localUri = MODEL_DIR + fileName;
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
  }

  static async getModelPath(fileName: string): Promise<string | null> {
    const localUri = MODEL_DIR + fileName;
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    return fileInfo.exists ? localUri : null;
  }
}
