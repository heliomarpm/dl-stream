import fs from 'node:fs';
import crypto from "crypto";
import { DownloadItem } from './interfaces';


export const uuidv4 = (): string => crypto.randomBytes(16).toString("hex");

export class Helpers {

    /**
     * Formats the speed in bytes to a more readable format with units.
     *
     * @param {number} bytes - The speed in bytes.
     * @return {{value: number, unit: string}} - An object containing the formatted speed value and unit.
     */
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

}
