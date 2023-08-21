import fs from 'fs';
import axios, { AxiosResponse } from 'axios';
import { EventEmitter } from 'events';
import async from 'async';
import { DownloadItem, DownloadProgress, DownloadStatus } from './internal/interfaces';
import { Utils } from './internal/utils';

/**
 * The `DownloadManager` class is responsible for managing the download tasks.
 * It uses the `Utils` class to handle file-related operations and the `async` library for
 * task queuing and concurrency control.
 *
 * @example
 * ```javascript
 * const downloadManager = new DownloadManager(3); // Create a new DownloadManager with a concurrency of 3
 * downloadManager.enqueueTask({ url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' }); // Enqueue a download task
 * downloadManager.enqueueTask({ url: 'https://example.com/file2', directory: './downloads', fileName: 'file2.txt' });
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
export class DownloadManager extends EventEmitter {
    private queue: async.QueueObject<DownloadItem>;
    private status: DownloadStatus = 'queued';
    private utils: Utils;

    public constructor(concurrency: number) {
        super();
        this.utils = new Utils();

        this.queue = async.queue(this.downloadTask.bind(this), concurrency);
        this.queue.pause();
        this.queue.drain(this.handleQueueDrain.bind(this));
        this.queue.error(this.handleQueueError.bind(this));
    }

    // download items
    private async downloadTask(task: DownloadItem, callback: (error?: any | null) => void) {
        this.status = 'downloading';
        task = await this.utils.ensureFileTask(task);

        const progress: DownloadProgress = {
            fullDirectory: `${task.directory}/${task.fileName}`,
            fileName: task.fileName,
            percentage: 0,
            speed: { value: 0, unit: '' }
        }

        const writerStream = fs.createWriteStream(progress.fullDirectory);

        let downloadedSize = 0;

        try {
            const response: AxiosResponse<any> = await axios.get(task.url, { responseType: 'stream' });

            const totalSize = parseInt(response.headers['content-length'] || "1", 10);
            const startTime = Date.now();

            response.data.pipe(writerStream);
            response.data.on("data", (chunk: Buffer) => {
                downloadedSize += chunk.length;
                const elapsedTime = (Date.now() - startTime) / 1000;
                const speed = downloadedSize / elapsedTime;
                progress.speed = this.utils.formatSpeed(speed);
                progress.percentage = (downloadedSize / totalSize) * 100;

                this.emitProgressUpdate(progress);
            });

            response.data.on("end", () => {
                console.log(`Download of ${task.fileName} completed`);
                this.status = 'completed';
                writerStream.end();
                this.emitProgressUpdate(progress);
                callback();
            })
        } catch (error) {
            console.error(`Error downloading ${task.fileName}:`, error);
            this.status = 'failed';
            writerStream.end();
            callback(error);
        }
    }

    start() {
        this.queue.resume();
    }

    pause() {
        this.status = 'paused';
        this.queue.pause();
    }

    resume() {
        this.queue.resume();
    }

    cancel() {
        this.status = 'cancel';
        this.queue.kill();
    }

    enqueueTask(item: DownloadItem) {
        this.queue.push(item);
    }

    // send event by progress and speed download
    private emitProgressUpdate(progress: DownloadProgress) {
        this.emit('progress', progress);
    }
    onProgressUpdate(callback: (progress: DownloadProgress) => void) {
        this.on('progress', callback);
    }

    private handleQueueError(error: Error, task: DownloadItem) {
        this.emit('error', error, task);
    }
    onError(callback: (error: Error, task: DownloadItem) => void) {
        this.on('error', callback);
    }

    // send event on complete download
    private handleQueueDrain() {
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
