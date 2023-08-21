export interface DownloadItem {
    url: string;
    directory: string;
    fileName: string;
}

export interface DownloadProgress {
    fullDirectory: string;
    fileName: string;
    percentage: number;
    speed: { value: number, unit: string }
}

export type DownloadStatus = 'queued' | 'downloading' | 'paused' | 'completed' | 'failed' | 'cancel';
