import async from 'async';
import { EventEmitter } from 'events';
import { Controller } from './Controller';
import { DownloadItem, DownloadProgress } from './interfaces';
import { DownloadStatus } from './types/DownloadStatus';
import { FileHelper } from './utils';


class DownloadManager extends EventEmitter {
    private queue!: async.QueueObject<DownloadItem>;
    private controller!: Controller;
    private status: DownloadStatus = DownloadStatus.QUEUED;
    private _displayLog;

    constructor(concurrency: number = 1, displayLog: boolean = false) {
        super();

        this._displayLog = displayLog;
        this.initializeController(displayLog);
        this.initializeQueue(concurrency);
    }

    private initializeController(displayLog: boolean) {
        this.controller = new Controller(displayLog);
        this.controller.onProgress((progress: DownloadProgress) => {
            this.emit('progress', progress);
        });
    }

    private initializeQueue(concurrency: number) {
        concurrency = Math.max(1, concurrency);

        this.queue = async.queue(this.handleDownload.bind(this), concurrency);
        this.queue.pause();
        this.queue.drain(this.handleQueueDrain.bind(this));
        this.queue.error(this.handleQueueError.bind(this));
    }

    private async handleDownload(item: DownloadItem, callback: (error?: any | null, item?: DownloadItem) => void) {
        this.status = DownloadStatus.DOWNLOADING;

        try {
            await this.controller.downloadFile(item);
            callback();
        } catch (error: any) {
            callback(error, item);
        }
    }

    private handleQueueError(error: Error, item: DownloadItem) {
        this.consoleLog(`Error downloading ${item.fileName}:`, true, error.message);
        this.status = DownloadStatus.FAILED;
        this.emit('error', error, item);
    }

    private handleQueueDrain() {
        this.consoleLog(">>> All downloads completed! <<<")
        this.status = DownloadStatus.COMPLETED;
        this.emit('complete');
    }

    private consoleLog(message?: any, logError: boolean = false, ...optionalParams: any[]) {
        if (!this._displayLog) return;

        if (logError) {
            console.error(message, optionalParams);
        } else {
            console.log(message, optionalParams);
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

    cancel() {
        this.status = DownloadStatus.CANCELED;
        this.queue.kill();
    }

    enqueueItem(item: DownloadItem) {
        this.queue.push(item);
    }


    queueCount() {
        return this.queue.length();
    }

    queueStatus() {
        return this.status;
    }

    onProgress(callback: (progress: DownloadProgress) => void) {
        this.on('progress', callback);
    }

    onError(callback: (error: Error, item: DownloadItem) => void) {
        this.on('error', callback);
    }

    onComplete(callback: () => void) {
        this.on('complete', callback);
    }
}

export { DownloadManager };
