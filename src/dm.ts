import fs from 'fs';
import axios, { AxiosResponse } from 'axios';
import { EventEmitter } from 'events';
import async from 'async';

interface DownloadItem {
    url: string;
    directory?: string;
    fileName?: string;
}

interface DownloadProgress {
    fullDirectory: string;
    fileName: string;
    percentage: number;
    speed: { value: number, unit: string }
}

enum DownloadStatus {
    QUEUED = "queued",
    DOWNLOADING = "downloading",
    PAUSED = "paused",
    COMPLETED = "completed",
    FAILED = "failed"
}

class DownloadManager extends EventEmitter {
    private queue!: async.QueueObject<DownloadItem>;
    private status: DownloadStatus = DownloadStatus.QUEUED;

    private _displayLog = false;

    constructor(concurrency: number = 1, displayLog: boolean = false) {
        super();

        this._displayLog = displayLog;
        concurrency = Math.max(1, concurrency);

        this.initializeQueue(concurrency);
    }

    private initializeQueue(concurrency: number) {
        this.queue = async.queue(this.downloadItem.bind(this), concurrency);
        this.queue.pause();
        this.queue.drain(this.handleQueueDrain.bind(this));
        this.queue.error(this.handleQueueError.bind(this));
    }

    public formatSpeed(bytes: number): { value: number; unit: string; } {
        const BYTES_PER_KB = 1024;
        const UNITS = ["B/s", "KB/s", "MB/s", "GB/s"];

        let speed = Math.floor(bytes);
        let unitIndex = 0;

        if (speed >= BYTES_PER_KB) {
            unitIndex = speed >= BYTES_PER_KB ** 3 ? 3 : speed >= BYTES_PER_KB ** 2 ? 2 : 1;
            speed /= BYTES_PER_KB ** unitIndex;
        }

        return {
            value: parseFloat(speed.toFixed(2)),
            unit: UNITS[unitIndex],
        };
    }

    /**
     * Generates a unique ID by combining the current timestamp with a random string.
     *
     * @return {string} The generated unique ID.
     */
    public generateUniqueId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    /**
     * Retrieves the file name from a given URL.
     *
     * @param {string} url - The URL from which to extract the file name.
     * @return {string} The extracted file name, or a generated unique file name if the URL does not contain one.
     */
    private getFileName(url: string): string {
        return url.split('/').pop()?.split('?').shift() || `file_${this.generateUniqueId()}`;
    }

    /**
     * Ensures that the keyvalues directory exists.
     * If it does not exist, then it is created.
     *
     * @returns A promise which resolves when the keyvalues dir exists.
     * @internal
     */
    private ensureDir(directory: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.stat(directory, (error) => {
                if (error) {
                    if (error.code === 'ENOENT') {
                        fs.mkdir(directory, { recursive: true }, (err) => {
                            err ? reject(err) : resolve();
                        });
                    } else {
                        reject(error);
                    }
                } else {
                    resolve();
                }
            });
        });
    }

    /**
    * Ensures that a file with the given fileName exists.
    *
    * @param {string} fileName - The name of the file to ensure.
    * @return {Promise<void>} - A promise that resolves when the file exists, or rejects with an error.
    */
    private async ensureFile(fileName: string): Promise<void> {
        try {
            await fs.promises.access(fileName, fs.promises.constants.F_OK);
        } catch (error: any) {
            throw error;
        }
    }

    public async ensureDirFile(task: DownloadItem): Promise<DownloadItem> {
        const { fileName, directory } = task;

        task.fileName = fileName || task.url.split('/').pop()?.split('?').shift(); ///this.getFileName(task.url);
        task.directory = directory || './downloads';

        //await this.ensureFile(task.fileName)
        await this.ensureDir(task.directory);

        return task;
    }
    private consoleLog(message?: any, logError: boolean = false, ...optionalParams: any[]) {
        if (!this._displayLog) return;

        if (logError) {
            console.error(message, optionalParams);
        } else {
            console.log(message, optionalParams);
        }
    }

    private async downloadItem(item: DownloadItem, callback: (error?: any | null) => void) {
        this.status = DownloadStatus.DOWNLOADING;
        item = await this.ensureDirFile(item);

        if (!item.fileName) {
            throw new Error("FILE_NOT_FOUND");
        }

        const progress: DownloadProgress = {
            fullDirectory: `${item.directory}/${item.fileName}`,
            fileName: item.fileName!,
            percentage: 0,
            speed: { value: 0, unit: '' },
        };

        const writerStream = fs.createWriteStream(progress.fullDirectory);
        let downloadedSize = 0;

        try {
            const response: AxiosResponse<any> = await axios.get(item.url, { responseType: 'stream' });

            const totalSize = parseInt(response.headers['content-length'] || "1", 10);
            const startTime = Date.now();

            response.data.pipe(writerStream);

            response.data.on("data", (chunk: Buffer) => {
                downloadedSize += chunk.length;
                const elapsedTime = (Date.now() - startTime) / 1000;
                const speed = downloadedSize / elapsedTime;
                progress.speed = this.formatSpeed(speed);
                progress.percentage = (downloadedSize / totalSize) * 100;

                this.emitProgressUpdate(progress);
            });

            response.data.on("end", () => {
                this.consoleLog(`Download of ${item.fileName} completed`);
                writerStream.destroy();
                this.emitProgressUpdate(progress);
                callback();
            });
        } catch (error) {
            writerStream.destroy();
            //this.handleQueueError((error, item)
            callback(error);
        }
    }

    start() {
        this.status = DownloadStatus.DOWNLOADING;
        this.queue.resume();
    }

    pause() {
        this.status = DownloadStatus.PAUSED;
        this.queue.pause();
    }

    resume() {
        this.status = DownloadStatus.DOWNLOADING;
        this.queue.resume();
    }

    cancel() {
        this.queue.kill();
    }

    enqueueItem(item: DownloadItem) {
        this.queue.push(item);
    }

    private emitProgressUpdate(progress: DownloadProgress) {
        this.emit('progress', progress);
    }

    onProgressUpdate(callback: (progress: DownloadProgress) => void) {
        this.on('progress', callback);
    }

    private handleQueueError(error: Error, item: DownloadItem) {
        this.consoleLog(`Error downloading ${item.fileName}:`, true, error.message);
        this.status = DownloadStatus.FAILED;
        this.emit('error', error, item);
    }

    onError(callback: (error: Error, item: DownloadItem) => void) {
        this.on('error', callback);
    }

    private handleQueueDrain() {
        this.consoleLog(">>> All downloads completed! <<<")
        this.status = DownloadStatus.COMPLETED;
        this.emit('complete');
    }

    onComplete(callback: () => void) {
        this.on('complete', callback);
    }

    queueCount() {
        return this.queue.length();
    }

    queueStatus() {
        return this.status;
    }
}

export { DownloadManager };
