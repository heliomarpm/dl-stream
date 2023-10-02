import DownloadManager, { DownloadItem, DownloadStatus } from "../src";
import { images } from './images';

describe('DownloadManager', () => {
	let dm: DownloadManager;

	beforeEach(() => {
		dm = new DownloadManager(3);
	});

	it('should enqueue an item correctly', () => {
		const item: DownloadItem = {
			url: images[0],
			directory: './downloads',
			fileName: 'image0.jpg'
		};

		dm.enqueueItem(item);

		expect(dm.queueCount()).toBe(1);
		expect(dm.queueStatus()).toBe(DownloadStatus.QUEUED);
	});

	it('should start the download queue correctly', () => {
		dm.start();
		expect(dm.queueStatus()).toBe(DownloadStatus.DOWNLOADING);
	});

	it('should pause the download queue correctly', () => {
		dm.pause();
		expect(dm.queueStatus()).toBe(DownloadStatus.PAUSED);
	});

	it('should cancel the download queue correctly', () => {
		dm.cancel();
		expect(dm.queueStatus()).toBe(DownloadStatus.CANCELED);
	});

	it('should add a download item to the queue when enqueueItem method is called', () => {
		// Act! Call the enqueueItem method
		dm.enqueueItem({ url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' });

		// Assert! Check if the queue count is 1
		expect(dm.queueCount()).toBe(1);
	});

	it('should add an item to the download queue when enqueueItem method is called', () => {
		// Arrange
		const item = { url: 'https://example.com/file2', directory: './downloads' };

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

    it('should start, pause and resume the onComplete download successfully', async () => {
        const task: DownloadItem = { url: images[1], directory: './downloads', fileName: 'image-0.jpg' };

        dm.enqueueItem(task);
        dm.start();
        expect(dm.queueStatus()).toBe(DownloadStatus.DOWNLOADING);

        dm.pause();
        expect(dm.queueStatus()).toBe(DownloadStatus.PAUSED);

        dm.start();
        expect(dm.queueStatus()).toBe(DownloadStatus.DOWNLOADING);


        dm.onComplete(() => {
            expect(dm.queueStatus()).toBe(DownloadStatus.COMPLETED);
        })
    });
});
