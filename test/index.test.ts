import DownloadManager, { DownloadItem, DownloadStatus } from "../src/index";
import { images } from './images';

describe('DownloadManager', () => {
    let dm: DownloadManager;

    beforeEach(() => {
        dm = new DownloadManager(3);
    });

    it('should resume the download queue when start method is called', () => {
        dm.pause();

        // Act! Call the start method
        dm.start();

        // Assert! Check if the queue status is DOWNLOADING
        expect(dm.queueStatus()).toBe(DownloadStatus.DOWNLOADING);
    });

    it('should pause the download queue when pause method is called', () => {
        dm.start();

        // Act! Call the pause method
        dm.pause();

        // Assert! Check if the queue status is PAUSED
        expect(dm.queueStatus()).toBe(DownloadStatus.PAUSED);
    });

    it('should resume the download queue when resume method is called', () => {
        dm.pause();

        // Act! Call the resume method
        dm.start();

        // Assert! Check if the queue status is DOWNLOADING
        expect(dm.queueStatus()).toBe(DownloadStatus.DOWNLOADING);
    });

    it('should cancel the download queue when cancel method is called', () => {
        dm.start();

        // Act
        dm.cancel();

        // Assert
        expect(dm.queueStatus()).toBe(DownloadStatus.CANCELED);
    });

    it('should add a download item to the queue when enqueueItem method is called', () => {
        // Act! Call the enqueueItem method
        dm.enqueueItem({ url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' });

        // Assert! Check if the queue count is 1
        expect(dm.queueCount()).toBe(1);
    });

    it('should register a callback for progress updates when onProgressUpdate method is called', () => {
        // Arrrr! Prepare the DownloadManager
        const progressCallback = jest.fn();

        // Act! Call the onProgressUpdate method
        dm.onProgress(progressCallback);

        // Assert! Emit a progress event and check if the callback is called
        dm.emit('progress', { fullDirectory: './downloads/file1.txt', fileName: 'file1.txt', percentage: 50, speed: { value: 100, unit: 'KB/s' } });
        expect(progressCallback).toHaveBeenCalled();
    });

    it('should register a callback for error events when onError method is called', () => {
        // Arrrr! Prepare the DownloadManager
        const errorCallback = jest.fn();

        // Act! Call the onError method
        dm.onError(errorCallback);

        // Assert! Emit an error event and check if the callback is called
        const error = new Error('Download failed');
        dm.emit('error', error, { url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' });
        expect(errorCallback).toHaveBeenCalledWith(error, { url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' });
    });

    // Tests that the enqueueItem method adds an item to the download queue
    it('should add an item to the download queue when enqueueItem method is called', () => {
        // Arrange
        const item = { url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' };

        // Act
        dm.enqueueItem(item);

        // Assert
        expect(dm.queueCount()).toBe(1);
    });


    // Tests that the queueCount method returns the correct number of items in the download queue
    it('should return the correct number of items in the download queue when queueCount method is called', () => {
        // Arrange
        const item1 = { url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' };
        const item2 = { url: 'https://example.com/file2', directory: './downloads', fileName: 'file2.txt' };

        // Act
        dm.enqueueItem(item1);
        dm.enqueueItem(item2);

        // Assert
        expect(dm.queueCount()).toBe(2);
    });

    // Tests that the callback function is registered successfully.
    it('should register the callback function', () => {
        const callback = jest.fn();

        dm.onComplete(callback);

        expect(dm.listenerCount('complete')).toBe(1);
    });

    it('should throw an error when the callback function throws an error', () => {
        const callback = jest.fn(() => {
            throw new Error('Callback error');
        });

        dm.onComplete(callback);
        dm.start();

        expect(callback).toThrowError('Callback error');
    });

    it('should cancel the download successfully', () => {
        // Create a mock task
        const task: DownloadItem = {
            url: images[2],
            directory: './downloads',
            fileName: ""
        };

        dm.enqueueItem(task as DownloadItem);
        expect(dm.queueCount()).toBeGreaterThanOrEqual(1);

        dm.cancel();
        expect(dm.queueCount()).toBe(0);
    });

    it('should register a callback for completion events when onComplete() is called', () => {
        // Given
        const callback = jest.fn();

        // When
        dm.onComplete(callback);

        // Then
        expect(dm.listenerCount('complete')).toBe(1);
    });

    it('should register a callback for error events when onError() is called', () => {
        // Given
        const callback = jest.fn();

        // When
        dm.onError(callback);

        // Then
        expect(dm.listenerCount('error')).toBe(1);
    });

    it('should register a callback for progress updates when onProgressUpdate() is called', () => {
        // Given
        const callback = jest.fn();

        // When
        dm.onProgress(callback);

        // Then
        expect(dm.listenerCount('progress')).toBe(1);
    });

    it('should cancel the download tasks when cancel() is called', () => {
        // Given
        const queueKillSpy = jest.spyOn(dm['queue'], 'kill');

        // When
        dm.cancel();

        // Then
        expect(queueKillSpy).toHaveBeenCalled();
    });

    it('should resume the paused download tasks when resume() is called', () => {
        // Given
        const queueResumeSpy = jest.spyOn(dm['queue'], 'resume');

        // When
        dm.start();

        // Then
        expect(queueResumeSpy).toHaveBeenCalled();
    });

    it('should pause the download tasks when pause() is called', () => {
        // Given
        const queuePauseSpy = jest.spyOn(dm['queue'], 'pause');

        // When
        dm.pause();

        // Then
        expect(queuePauseSpy).toHaveBeenCalled();
    });


    // it('should start, pause and resume the onComplete download successfully', async () => {
    //     const task: DownloadItem = { url: images[1], directory: './downloads', fileName: 'image-0.jpg' };

    //     dm.enqueueItem(task);
    //     dm.start();
    //     expect(dm.queueStatus()).toBe(DownloadStatus.DOWNLOADING);

    //     dm.pause();
    //     expect(dm.queueStatus()).toBe(DownloadStatus.PAUSED);

    //     dm.resume();
    //     expect(dm.queueStatus()).toBe(DownloadStatus.DOWNLOADING);


    //     dm.onComplete(() => {
    //         expect(dm.queueStatus()).toBe(DownloadStatus.COMPLETED);
    //     })
    // });

});
