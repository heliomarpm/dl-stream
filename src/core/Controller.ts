import { createWriteStream } from 'fs';
import axios, { AxiosResponse } from 'axios';
import { DownloadItem, DownloadProgress } from './interfaces';
import { ConsoleLog, FileHelper, SpeedFormatter } from './utils';
import { EventEmitter } from 'events';


class Controller {
    private events: EventEmitter;
	private consoleLog: ConsoleLog;

    /**
     * Initializes the `Controller` instance with an optional flag to enable logging.
     * @param displayLog Flag indicating whether to display log messages. Default is false.
     */
    constructor(displayLog: boolean = false) {
		this.consoleLog = new ConsoleLog(displayLog);
        this.events = new EventEmitter();
    }

    /**
     * Emits the progress event with the given progress object.
     * @param progress The progress object to emit.
     */
    private emitProgress(progress: DownloadProgress) {
        this.events.emit('progress', progress);
    }

    /**
     * Ensures that the directory and file exist in the given DownloadItem.
     * @param item The DownloadItem object.
     * @returns The updated DownloadItem object.
     * @throws Error if the file name is not found.
     */
    private async ensureDirFile(item: DownloadItem): Promise<DownloadItem> {
        const { fileName, directory } = item;

        item.fileName = fileName || FileHelper.getFileName(item.url);
        item.directory = directory || './downloads';

        if (!item.fileName) {
            throw new Error("FILE_NOT_FOUND");
        }

        await FileHelper.ensureDir(item.directory);
        return item;
    }

    /**
     * Downloads a file from the given URL specified in the DownloadItem object.
     * @param item The DownloadItem object.
     * @returns A promise that resolves when the download is completed.
     * @throws Error if an error occurs during the download.
     */
    async downloadFile(item: DownloadItem): Promise<void> {
        item = await this.ensureDirFile(item);

        const progress: DownloadProgress = {
            fullDirectory: `${item.directory}/${item.fileName}`,
            fileName: item.fileName!,
            percentage: 0,
            speed: { value: 0, unit: '' },
        };

        const writerStream = createWriteStream(progress.fullDirectory);

        try {
            const response: AxiosResponse<any> = await axios.get(item.url, { responseType: 'stream' });
            response.data.pipe(writerStream);

            let downloadedBytes = 0;
            const totalBytes = parseInt(response.headers['content-length'] || "1", 10);
            const startTime = Date.now();

            response.data.on("data", (chunk: Buffer) => {
                downloadedBytes += chunk.length;
                const elapsedTime = Date.now() - startTime;
                const bytesPerSecond = downloadedBytes / (elapsedTime / 1000);
                progress.speed = SpeedFormatter.formatUnit(bytesPerSecond);
                progress.percentage = (downloadedBytes / totalBytes) * 100;

                this.emitProgress(progress);
            });

            response.data.on("end", () => {
                this.consoleLog.show(`Download of ${item.fileName} completed`);
                writerStream.end();
            });

        } catch (error) {
            writerStream.destroy();
            throw error;
        }
    }

    onProgress(callback: (progress: DownloadProgress) => void) {
        this.events.on('progress', callback);
	}
}

export { Controller };
