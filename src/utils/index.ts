import { VideoData } from '@/Types';

export function formatTime(seconds?: number): string {
  if (!seconds) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours.toString().padStart(2, '0'), minutes.toString().padStart(2, '0'), secs.toFixed(0).toString().padStart(2, '0')].join(':');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatBytes(bytes: number, precision = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(precision)) + ' ' + sizes[i];
}

export const createFileDataFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;
  const tempData: VideoData[] = [];

  for (const file of files) {
    const videoURL = URL.createObjectURL(file);
    const thumbnail = await generateThumbnail(videoURL);

    const data: VideoData = {
      lastModified: file.lastModified,
      name: file.name,
      size: file.size,
      type: file.type,
      src: videoURL,
      thumbnail
    };
    tempData.push(data);
  }
  return tempData;
};

export function generateThumbnail(videoUrl?: string, timeInSeconds: number = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!videoUrl) {
      reject('Video URL is undefined');
      return;
    }

    // Create a video element
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';

    video.addEventListener('loadeddata', () => {
      video.currentTime = timeInSeconds;
    });

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/png');
        resolve(thumbnail);
      } else {
        reject('Failed to get canvas context');
      }
    });

    video.addEventListener('error', (err) => {
      reject(`Error loading video: ${err.message}`);
    });
  });
}

export function getThumbnailAtCurrentTime(thumbnails: string[], interval: number, currentTime: number): string {
  const index = Math.floor(currentTime / interval);
  return thumbnails[Math.min(index, thumbnails.length - 1)];
}

export function generateThumbnailsAtIntervals(videoUrl: string, interval: number): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous'; // Important if the video is from a different origin

    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration;
      const promises: Promise<string>[] = [];

      for (let time = 0; time < duration; time += interval) {
        promises.push(generateThumbnail(videoUrl, time));
      }

      Promise.all(promises)
        .then((thumbnails) => resolve(thumbnails))
        .catch((error) => reject(error));
    });

    video.addEventListener('error', (err) => {
      reject(`Error loading video: ${err.message}`);
    });
  });
}
