import { createWriteStream } from 'fs';
import axios, { AxiosResponse } from 'axios';
import { DownloadItem, DownloadProgress } from './interfaces';
import { FileHelper, SpeedFormatter } from './utils';
import { EventEmitter } from 'events';

class Controller extends EventEmitter {
    private _displayLog: boolean;

    constructor(displayLog: boolean = false) {
        super();
        this._displayLog = displayLog;
    }

    private emitProgress(progress: DownloadProgress) {
        this.emit('progress', progress);
    }

    private consoleLog(message?: any, logError: boolean = false, ...optionalParams: any[]) {
        if (!this._displayLog) return;

        if (logError) {
            console.error(message, optionalParams);
        } else {
            console.log(message, optionalParams);
        }
    }

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
                const bytesPerSecond = downloadedBytes / (elapsedTime/1000);
                progress.speed = SpeedFormatter.formatUnit(bytesPerSecond);
                progress.percentage = (downloadedBytes / totalBytes) * 100;

                this.emitProgress(progress);
            });

            response.data.on("end", () => {
                this.consoleLog(`Download of ${item.fileName} completed`);
                writerStream.end();
            });

        } catch (error) {
            writerStream.destroy();
            throw error;
        }
    }

    onProgress(callback: (progress: DownloadProgress) => void) {
        this.on('progress', callback);
    }
}

export { Controller };
