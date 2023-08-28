import fs from 'fs';
import axios, { AxiosResponse } from 'axios';
import { EventEmitter } from 'events';
import async from 'async';
import { DownloadItem, DownloadProgress, DownloadStatus } from './internal/interfaces';
import { Helpers } from './internal/helpers';

/**
 * The `DownloadManager` class is responsible for managing the download items.
 * It uses the `Utils` class to handle file-related operations and the `async` library for
 * task queuing and concurrency control.
 *
 * @example
 * ```javascript
 * const downloadManager = new DownloadManager(3); // Create a new DownloadManager with a concurrency of 3
 * downloadManager.enqueueItem({ url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' }); // Enqueue a download task
 * downloadManager.enqueueItem({ url: 'https://example.com/file2', directory: './downloads', fileName: 'file2.txt' });
 * downloadManager.start(); // Start the download tasks
 * downloadManager.onProgressUpdate((progress) => {
 *   console.log(`Download progress: ${progress.percentage}%`);
 * });
 * downloadManager.onComplete(() => {
 *   console.log('All downloads completed');
 * });
 * ```
 *
 * @remarks
 * The `DownloadManager` class provides methods for managing download tasks, such as starting, pausing, resuming, and canceling the tasks. It also emits events for progress updates and completion of downloads.
 */
class DownloadManager extends EventEmitter {
    private queue!: async.QueueObject<DownloadItem>;
    private status: DownloadStatus = DownloadStatus.QUEUED;
    private helper: Helpers;

    private _displayLog = false;

    constructor(concurrency: number = 1, displayLog: boolean = false) {
        super();

        this._displayLog = displayLog;
        concurrency = Math.max(1, concurrency);

        this.helper = new Helpers();
        this.initializeQueue(concurrency);
    }

    private initializeQueue(concurrency: number) {
        this.queue = async.queue(this.downloadItem.bind(this), concurrency);
        this.queue.pause();
        this.queue.drain(this.handleQueueDrain.bind(this));
        this.queue.error(this.handleQueueError.bind(this));
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
        item = await this.helper.ensureDirFile(item);

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
                progress.speed = this.helper.formatSpeed(speed);
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
            //this.handleQueueError(error as Error, item)
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
        this.status = DownloadStatus.CANCELED;
        this.queue.kill();
    }

    enqueueItem(item: DownloadItem) {
        this.queue.push(item);
    }

    private emitProgressUpdate(progress: DownloadProgress) {
        this.emit('progress', progress);
    }

    onProgress(callback: (progress: DownloadProgress) => void) {
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
