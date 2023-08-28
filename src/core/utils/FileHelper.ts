import fs from 'fs';

class FileHelper {
    /**
     * Ensures that a directory exists. If the directory does not exist, it will be created recursively.
     *
     * @param {string} directory - The path of the directory to ensure.
     * @return {Promise<void>} A promise that resolves when the directory is ensured.
     */
    static async ensureDir(directory: string): Promise<void> {
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

    // /**
    // * Ensures that a file with the given fileName exists.
    // *
    // * @param {string} fileName - The name of the file to ensure.
    // * @return {Promise<void>} - A promise that resolves when the file exists, or rejects with an error.
    // */
    // static async ensureFile(fileName: string): Promise<void> {
    //     try {
    //         await fs.promises.access(fileName, fs.promises.constants.F_OK);
    //     } catch (error: any) {
    //         throw error;
    //     }
    // }

    /**
     * Returns the file name from a given URL.
     *
     * @param {string} url - The URL from which to extract the file name.
     * @return {string | undefined} The extracted file name, or undefined if the URL does not contain a file name.
     */
    static getFileName(url: string): string | undefined {
        return url.split('/').pop()?.split('?').shift();
    }

}

export { FileHelper };
