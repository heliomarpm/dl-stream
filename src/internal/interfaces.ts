export interface DownloadItem {
    url: string;
    directory?: string;
    fileName?: string;
}

export interface DownloadProgress {
    fullDirectory: string;
    fileName: string;
    percentage: number;
    speed: { value: number, unit: string }
}

// export type DownloadStatus = 'queued' | 'downloading' | 'paused' | 'completed' | 'failed' | 'canceled';

export enum DownloadStatus {
    QUEUED = "queued",
    DOWNLOADING = "downloading",
    PAUSED = "paused",
    COMPLETED = "completed",
    FAILED = "failed"
}
