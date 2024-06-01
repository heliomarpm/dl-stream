<div id="top" style="text-align: center; align-items: center;">
<h1>
  <br>📥Download Stream

  [![DeepScan grade][url-deepscan-badge]][url-deepscan]
  [![CodeFactor][url-codefactor-badge]][url-codefactor] 
  ![CodeQL][url-codeql]
  [![NPM version][url-npm-badge]][url-npm]
  [![Downloads][url-downloads-badge]][url-downloads]
  <a href="https://navto.me/heliomarpm" target="_blank"><img src="https://navto.me/assets/navigatetome-brand.png" width="32"/></a>

  ![async](https://img.shields.io/github/package-json/dependency-version/heliomarpm/dl-stream/async)
  ![axios](https://img.shields.io/github/package-json/dependency-version/heliomarpm/dl-stream/axios)

</h1>

<p>
  <!-- PixMe -->
  <a href="https://www.pixme.bio/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="pixme url" src="https://img.shields.io/badge/donate%20on-pixme-1C1E26?style=for-the-badge&labelColor=1C1E26&color=28f4f4"/>
  </a>
  <!-- PayPal -->
  <a href="https://www.paypal.com/donate?business=KBVHLR7Z9V7B2&no_recurring=0&currency_code=USD" target="_blank" rel="noopener noreferrer">
    <img alt="paypal url" src="https://img.shields.io/badge/paypal-1C1E26?style=for-the-badge&labelColor=1C1E26&color=0475fe"/>
  </a>
  <!-- Ko-fi -->
  <a href="https://ko-fi.com/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="kofi url" src="https://img.shields.io/badge/kofi-1C1E26?style=for-the-badge&labelColor=1C1E26&color=ff5f5f"/>
  </a>
  <!-- LiberaPay -->  
  <a href="https://liberapay.com/heliomarpm" target="_blank" rel="noopener noreferrer">
     <img alt="liberapay url" src="https://img.shields.io/badge/liberapay-1C1E26?style=for-the-badge&labelColor=1C1E26&color=f6c915"/>
  </a>
	  <!-- GitHub Sponsors -->
  <a href="https://github.com/sponsors/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="github sponsors url" src="https://img.shields.io/badge/GitHub%20-Sponsor-1C1E26?style=for-the-badge&labelColor=1C1E26&color=db61a2"/>
  </a>
	<!-- Downloads -->
  <!-- <a href="https://github.com/heliomarpm/udemy-downloader-gui/releases" target="_blank" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/dm/@heliomarpm/dl-stream.svg?style=for-the-badge&labelColor=1C1E26&color=2ea043">
  </a> -->
  <!-- License -->
  <!-- <a href="https://github.com/heliomarpm/dl-stream/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
    <img alt="license url" src="https://img.shields.io/badge/license%20-MIT-1C1E26?style=for-the-badge&labelColor=1C1E26&color=61ffca"/>
  </a> -->
</p>
</div>

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


## Dependencies

- [async](caolan.github.io/async/): Async is a utility module which provides straight-forward, powerful functions for working with asynchronous JavaScript.
- [axios](axios-http.com): Promise based HTTP client for the browser and node.js


## Contributing

Please make sure to read the [Contributing Guide](docs/CONTRIBUTING.md) before making a pull request.


Thank you to all the people who already contributed to project!

<a href="https://github.com/heliomarpm/dl-stream/graphs/contributors" target="_blank">
  <img src="https://contrib.rocks/image?repo=heliomarpm/dl-stream" />
</a>

###### Made with [contrib.rocks](https://contrib.rocks).

That said, there's a bunch of ways you can contribute to this project, like by:

- :beetle: Reporting a bug
- :page_facing_up: Improving this documentation
- :rotating_light: Sharing this project and recommending it to your friends
- :dollar: Supporting this project on GitHub Sponsors or Ko-fi
- :star2: Giving a star on this repository


## Donate

If you appreciate that, please consider donating to the Developer.

<p>
  <!-- PixMe -->
  <a href="https://www.pixme.bio/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="pixme url" src="https://img.shields.io/badge/donate%20on-pixme-1C1E26?style=for-the-badge&labelColor=1C1E26&color=28f4f4"/>
  </a>
  <!-- PayPal -->
  <a href="https://www.paypal.com/donate?business=KBVHLR7Z9V7B2&no_recurring=0&currency_code=USD" target="_blank" rel="noopener noreferrer">
    <img alt="paypal url" src="https://img.shields.io/badge/paypal-1C1E26?style=for-the-badge&labelColor=1C1E26&color=0475fe"/>
  </a>
  <!-- Ko-fi -->
  <a href="https://ko-fi.com/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="kofi url" src="https://img.shields.io/badge/kofi-1C1E26?style=for-the-badge&labelColor=1C1E26&color=ff5f5f"/>
  </a>
  <!-- LiberaPay -->  
  <a href="https://liberapay.com/heliomarpm" target="_blank" rel="noopener noreferrer">
     <img alt="liberapay url" src="https://img.shields.io/badge/liberapay-1C1E26?style=for-the-badge&labelColor=1C1E26&color=f6c915"/>
  </a>  
  <!-- GitHub Sponsors -->
  <a href="https://github.com/sponsors/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="github sponsors url" src="https://img.shields.io/badge/GitHub%20-Sponsor-1C1E26?style=for-the-badge&labelColor=1C1E26&color=db61a2"/>
  </a>
</p>

## License

[MIT © Heliomar P. Marques](LICENSE) <a href="#top">🔝</a>


----
[url-npm-badge]: https://img.shields.io/npm/v/@heliomarpm/dl-stream.svg
[url-npm]: https://www.npmjs.com/package/@heliomarpm/dl-stream
[url-downloads-badge]: https://img.shields.io/npm/dm/@heliomarpm/dl-stream.svg
[url-downloads]: http://badge.fury.io/js/@heliomarpm/dl-stream.svg
[url-deepscan-badge]: https://deepscan.io/api/teams/19612/projects/25345/branches/791228/badge/grade.svg
[url-deepscan]: https://deepscan.io/dashboard#view=project&tid=19612&pid=25345&bid=791228
[url-codefactor-badge]: https://www.codefactor.io/repository/github/heliomarpm/dl-stream/badge
[url-codefactor]: https://www.codefactor.io/repository/github/heliomarpm/dl-stream
[url-codeql]: https://github.com/heliomarpm/dl-stream/actions/workflows/codeql.yml/badge.svg 
[url-publish]: https://github.com/heliomarpm/dl-stream/actions/workflows/publish.yml/badge.svg 

