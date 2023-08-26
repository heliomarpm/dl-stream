import { DownloadItem, DownloadManager } from "../src/index";
import { images } from './images';

const dm = new DownloadManager(0);

describe('DownloadManager', () => {
    it('should enqueue a single task successfully', () => {
        // Create a mock task
        const task = { url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' };

        dm.enqueueItem(task);

        expect(dm.queueCount()).toBe(1);
        dm.cancel();
    });

    it('should enqueue multiple tasks successfully', () => {
        // Create mock tasks
        const task1 = { url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' };
        const task2 = { url: 'https://example.com/file2', directory: './downloads', fileName: 'file2.txt' };

        dm.enqueueItem(task1);
        dm.enqueueItem(task2);

        expect(dm.queueCount()).toBe(2);
        dm.cancel();
    });

    it('should start, pause and resume the onComplete download successfully', () => {
        const task: DownloadItem = { url: images[0], directory: './downloads', fileName: 'image-0.jpg' };

        dm.enqueueItem(task as DownloadItem);
        dm.start();

        dm.pause();
        expect(dm.queueStatus()).toBe('paused');

        dm.resume();
        expect(dm.queueStatus()).toBe('downloading');

        dm.onComplete(() => {
            dm.cancel();
            expect(dm.queueCount()).toBe(0);
        })
    });


    it('should cancel the download successfully', () => {
        // Create a mock task
        const task: DownloadItem = {
            url: images[0],
            directory: './downloads',
            fileName: ""
        };

        dm.enqueueItem(task as DownloadItem);
        expect(dm.queueCount()).toBeGreaterThanOrEqual(1);

        dm.cancel();
        expect(dm.queueCount()).toBe(0);
    });


    it('should handle errors during download correctly', () => {
      // Create a mock task with an invalid URL
      const task = { url: 'invalid-url', directory: './downloads', fileName: 'test_error.txt' };

      dm.enqueueItem(task);
      dm.start();

      // Check if an error event is emitted
      dm.onError((error, task) => {
        expect(error).toBeDefined();
        expect(task).toEqual(task);
      });
    });

});
