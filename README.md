# dl-stream

## Summary
The `DownloadManager` class is responsible for managing download tasks. It uses the `Helpers` class to handle file-related operations and the `async` library for task queuing and concurrency control.

## Example Usage
```javascript
const downloadManager = new DownloadManager(3); // Create a new DownloadManager with a concurrency of 3
downloadManager.enqueueItem({ url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' }); // Enqueue a download task
downloadManager.enqueueItem({ url: 'https://example.com/file2', directory: './downloads', fileName: 'file2.txt' });
downloadManager.start(); // Start the download tasks
downloadManager.onProgress((progress) => {
  console.log(`Download progress: ${progress.percentage}%`);
});
downloadManager.onComplete(() => {
  console.log('All downloads completed');
});
```

## Code Analysis
### Main functionalities
- Manages download tasks, including starting, pausing, resuming, and canceling tasks.
- Uses the `Helpers` class to handle file-related operations.
- Uses the `async` library for task queuing and concurrency control.
- Emits events for progress and completion of downloads.
___
### Methods
- `constructor(concurrency: number = 1, displayLog: boolean = false)`: Initializes a new instance of the `DownloadManager` class with the specified concurrency and display log settings.
- `start()`: Starts the download tasks.
- `pause()`: Pauses the download tasks.
- `resume()`: Resumes the download tasks.
- `cancel()`: Cancels the download tasks.
- `enqueueItem(item: DownloadItem)`: Enqueues a download task.
- `onProgress(callback: (progress: DownloadProgress) => void)`: Registers a callback function to be called when a progress event is emitted.
- `onError(callback: (error: Error, task: DownloadItem) => void)`: Registers a callback function to be called when an error event is emitted.
- `onComplete(callback: () => void)`: Registers a callback function to be called when a complete event is emitted.
- `queueCount()`: Returns the number of tasks in the task queue.
- `queueStatus()`: Returns the current status of the download stream.
___
### Fields
- `queue`: An instance of the `async.QueueObject` class from the `async` library, used for task queuing and concurrency control.
- `status`: The current status of the download tasks.
- `helper`: An instance of the `Helpers` class, used for file-related operations.
- `_displayLog`: A boolean flag indicating whether to display log messages.
___
