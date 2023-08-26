# dl-stream

## Summary
The `DownloadManager` class is responsible for managing the download stream. It uses the `Functions` class to handle file-related operations and the `async` library for task queuing and concurrency control.

## Example Usage
```javascript
const downloadManager = new DownloadManager(3); // Create a new DownloadManager with a concurrency of 3
downloadManager.enqueueTask({ url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' }); // Enqueue a download task
downloadManager.enqueueTask({ url: 'https://example.com/file2', directory: './downloads', fileName: 'file2.txt' });
downloadManager.start(); // Start the download stream
downloadManager.onProgressUpdate((progress) => {
  console.log(`Download progress: ${progress.percentage}%`);
});
downloadManager.onComplete(() => {
  console.log('All downloads completed');
});
```

## Code Analysis
### Main functionalities
- Manages the download stream by queuing and processing download tasks.
- Handles file-related operations using the `Functions` class.
- Uses the `async` library for task queuing and concurrency control.
- Emits events for progress updates and completion of downloads.
___
### Methods
- `constructor(concurrency: number = 1, displayLog: boolean = false)`: Initializes a new instance of the `DownloadManager` class with the specified concurrency and display log settings.
- `start()`: Starts the download stream by resuming the task queue.
- `pause()`: Pauses the download stream by pausing the task queue.
- `resume()`: Resumes the download stream by resuming the task queue.
- `cancel()`: Cancels the download stream by killing the task queue.
- `enqueueTask(item: DownloadItem)`: Enqueues a download task to the task queue.
- `onProgressUpdate(callback: (progress: DownloadProgress) => void)`: Registers a callback function to be called when a progress update event is emitted.
- `onError(callback: (error: Error, task: DownloadItem) => void)`: Registers a callback function to be called when an error event is emitted.
- `onComplete(callback: () => void)`: Registers a callback function to be called when a complete event is emitted.
- `queueCount()`: Returns the number of tasks in the task queue.
- `queueStatus()`: Returns the current status of the download stream.
___
### Fields
- `queue: async.QueueObject<DownloadItem>`: The task queue object from the `async` library.
- `status: DownloadStatus`: The current status of the download stream.
- `fnc: Functions`: An instance of the `Functions` class for handling file-related operations.
- `_displayLog: boolean`: A flag indicating whether to display log messages.
___
