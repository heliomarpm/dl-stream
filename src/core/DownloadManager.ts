import async from 'async';
import { EventEmitter } from 'events';
import { Controller } from './Controller';
import { DownloadItem, DownloadProgress } from './interfaces';
import { DownloadStatus } from './types';
import { ConsoleLog } from './utils';


class DownloadManager {
	private events: EventEmitter;
    private queue!: async.QueueObject<DownloadItem>;
    private status: DownloadStatus = DownloadStatus.QUEUED;
	private consoleLog: ConsoleLog;
    private displayLog: boolean;

	constructor(concurrency: number = 1, displayLog: boolean = false) {
		this.displayLog = displayLog;
		this.consoleLog = new ConsoleLog(displayLog);

		this.events = new EventEmitter();
        this.initializeQueue(concurrency);
	}

    private initializeQueue(concurrency: number) {
        concurrency = Math.max(1, concurrency);

        this.queue = async.queue(this.handleDownload.bind(this), concurrency);
        this.queue.pause();
        this.queue.drain(this.handleQueueDrain.bind(this));
        this.queue.error(this.handleQueueError.bind(this));
    }

    private async handleDownload(item: DownloadItem, callback: (error?: unknown | null, item?: DownloadItem) => void) {
        this.status = DownloadStatus.DOWNLOADING;

		try {
			const controller = new Controller(this.displayLog);
			controller.onProgress((progress: DownloadProgress) => {
			  this.events.emit('progress', progress);
			});
			await controller.downloadFile(item);

            callback();
        } catch (error: unknown) {
            callback(error, item);
        }
    }

    private handleQueueError(error: Error, item: DownloadItem) {
        this.consoleLog.show(`Error downloading ${item.fileName}:`, true, error.message);
        this.status = DownloadStatus.FAILED;
        this.events.emit('error', error, item);
    }

    private handleQueueDrain() {
        this.consoleLog.show(">>> All downloads completed! <<<")
        this.status = DownloadStatus.COMPLETED;
        this.events.emit('complete');
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
        this.events.on('progress', callback);
    }

    onError(callback: (error: Error, item: DownloadItem) => void) {
        this.events.on('error', callback);
    }

    onComplete(callback: () => void) {
        this.events.on('complete', callback);
    }
}

export default DownloadManager;
