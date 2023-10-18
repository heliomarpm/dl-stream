// import DownloadManager from '../src/core';
// import { DownloadItem } from '../src/core/interfaces';
// import { images } from './images';

import DownloadManager, { DownloadItem } from "../src";
import { images } from "./images";

const dm = new DownloadManager(2, true)


dm.onComplete( () => {
    console.log('>>> COMPLETE (In Queued): ', dm.queueCount());
})

dm.onProgress((process) => {
    console.log(`Downloading ${process.fileName} - Progress: ${process.percentage.toFixed(2)}% - Speed: ${process.speed.value} ${process.speed.unit}`);
});

dm.onError((error, item) => {
    console.error(">>> ERROR: ", error.message, item);
})

function enqueueImages() {
	images.forEach(function (url: string) {
		dm.enqueueItem({ url } as DownloadItem);
	});
	dm.enqueueItem({ url: images[0], fileName: "image-0.jpg" } as DownloadItem)
}


function start() {
    try {
		enqueueImages();
        dm.enqueueItem({ url: 'https://github.com/heliomarpm/heliomarpm/raw/master/Setup_QRAuto.exe'} as DownloadItem);
        dm.enqueueItem({ url: 'https://example.com/file1', directory: './downloads', fileName: 'file1.txt' });
        dm.enqueueItem({ url: 'https://url_invalidaa.com/', directory: './downloads' });

        console.log('>>> FILA: ', dm.queueCount());
        dm.start();
        console.log(">>> STATUS: ", dm.queueStatus());

        setTimeout(() => {
            dm.pause(); // Pause the downloads after some time
            console.log(">>> STATUS: ", dm.queueStatus());
        }, 5000);

        setTimeout(() => {
            dm.start(); // Pause the downloads after some time
            console.log(">>> STATUS: ", dm.queueStatus());
        }, 15000);

    } catch (error) {
        console.error(">> ERROR: ", error);
    }
}

start();
