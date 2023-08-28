interface DownloadProgress {
    fullDirectory: string;
    fileName: string;
    percentage: number;
    speed: { value: number, unit: string };
}

export { DownloadProgress };
