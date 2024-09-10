import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoData } from '@/Types';
import { createFileDataFromFile, formatBytes } from '@/utils';
import { Play, Upload } from 'lucide-react';
import React from 'react';

type VideoGridProps = {
  files: VideoData[];
  setSelectedVideo: React.Dispatch<React.SetStateAction<VideoData | null>>;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number | null>>;
  currentIndex: number | null;
  setFiles: React.Dispatch<React.SetStateAction<VideoData[]>>;
};

const VideoGrid = ({ files, setSelectedVideo, currentIndex, setCurrentIndex, setFiles }: VideoGridProps) => {
  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileData = await createFileDataFromFile(e);
    if (!fileData) return;
    setFiles((prev) => [...prev, ...fileData]);
  };

  // const removeFile = (index: number) => {
  //   URL.revokeObjectURL(files[index].src);
  //   setFiles((prev) => prev.filter((_, i) => i !== index));
  // };

  return (
    <div className="my-10 mt-4 min-h-[200px] rounded border">
      {files.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2 rounded-md p-10 pb-0 pt-[50px]">
          {files.map((file, index) => (
            <div
              key={index}
              className="group cursor-pointer overflow-hidden rounded-md border"
              onClick={() => {
                setSelectedVideo(file);
                setCurrentIndex(index);
              }}
            >
              <div className="flex min-w-0 gap-2">
                <div className="relative aspect-video w-[80px] flex-shrink-0 border-r">
                  <img className="h-full object-cover" src={file.thumbnail} />
                  <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100"></span>
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                    <Play />
                  </span>
                </div>
                <div className="min-w-0 flex-shrink p-2">
                  <h6 className="line-clamp-2 text-sm">{file.name}</h6>
                  <p className="text-xs font-semibold text-gray-500">Size: {formatBytes(file.size)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="py-10 text-center">
        <Input type="file" accept="video/*" multiple={true} id={'file-input'} className="sr-only" onChange={handleSelectFiles}></Input>
        <Button
          asChild
          className="bg-card ring-primary group !mt-3 h-[150px] w-[300px] rounded-md border-4 ring-4 ring-offset-0 transition-all hover:opacity-50"
        >
          <label htmlFor="file-input" className="cursor-pointer">
            <Upload size={50} className="text-primary group-hover:text-secondary transition-colors" />
          </label>
        </Button>
      </div>
    </div>
  );
};

export default VideoGrid;
