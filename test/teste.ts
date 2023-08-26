import {DownloadManager, DownloadItem } from '../src';
import { images } from './images';

const dm = new DownloadManager(2)

// images.forEach(function (url: string) {
//     dm.enqueueTask({ url } as DownloadItem);
// });
dm.enqueueTask({ url: images[0], fileName: "image-0.jpg" } as DownloadItem)
dm.enqueueTask({ url: 'https://github.com/heliomarpm/heliomarpm/raw/master/Setup_QRAuto.exe', fileName: "Install.exe" } as DownloadItem);

console.log('>>> FILA: ', dm.queueCount());
dm.start();
console.log(">>> STATUS: ", dm.queueStatus());

setTimeout(() => {
    dm.pause(); // Pause the downloads after some time
    console.log(">>> STATUS: ", dm.queueStatus());
}, 5000);

setTimeout(() => {
    dm.resume(); // Pause the downloads after some time
    console.log(">>> STATUS: ", dm.queueStatus());
}, 15000);

dm.on('complete', () => {
    console.log('>>> COMPLETE: ', dm.queueCount());
})

dm.onProgressUpdate((process) => {
    console.log(`Downloading ${process.fileName} - Progress: ${process.percentage.toFixed(2)}% - Speed: ${process.speed.value} ${process.speed.unit}`);
});
