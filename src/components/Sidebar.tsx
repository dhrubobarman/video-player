import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { X, Upload, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoData } from '@/Types';
import { generateThumbnail, formatBytes, createFileDataFromFile } from '@/utils';

type SidebarProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedVideo: React.Dispatch<React.SetStateAction<VideoData | null>>;
  files: VideoData[];
  setFiles: React.Dispatch<React.SetStateAction<VideoData[]>>;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number | null>>;
} & React.HTMLAttributes<HTMLDivElement>;

const Sidebar = ({ open, setOpen, className, setSelectedVideo, files, setFiles, setCurrentIndex, ...rest }: SidebarProps) => {
  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileData = await createFileDataFromFile(e);
    if (!fileData) return;
    setFiles((prev) => [...prev, ...fileData]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(files[index].src);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <aside
      className={cn(
        'bg-card fixed bottom-0 right-0 top-0 z-10 w-[var(--sidebar-w)] overflow-y-auto overflow-x-hidden border-l transition-transform',
        open ? 'right-0' : 'translate-x-[var(--sidebar-w)]',
        className
      )}
      {...rest}
    >
      <div className="mb-3 border-b p-3">
        <Button size={'icon'} variant={'secondary'} onClick={() => setOpen(false)} className="ml-auto flex h-8 w-8">
          <X />
        </Button>
      </div>
      <div className="space-y-2 p-3">
        {files.length === 0 ? (
          <p className="text-center text-gray-500">No files selected</p>
        ) : (
          files.map((file, index) => (
            <div key={file.src} className="group relative" title={file.name}>
              <img src={file.thumbnail} alt={file.name} className="aspect-video w-full rounded" />
              <div className="bg-accent/50 absolute bottom-0 left-0 right-0 p-1">
                <p className="line-clamp-2 text-sm">{file.name}</p>
                <span className="text-xs font-semibold text-gray-500">Size: {formatBytes(file.size)}</span>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setSelectedVideo(file);
                  setCurrentIndex(index);
                }}
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100"
              >
                <span className="sr-only">Play</span>
                <Play />
              </button>
              <Button
                size={'icon'}
                variant={'secondary'}
                onClick={() => removeFile(index)}
                className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100"
              >
                <X />
              </Button>
            </div>
          ))
        )}
        <>
          <Input type="file" accept="video/*" multiple={true} id={'file-input'} className="sr-only" onChange={handleSelectFiles}></Input>
          <Button asChild className="bg-card group !mt-3 min-h-[150px] w-full border-4 transition-all hover:opacity-50">
            <label htmlFor="file-input" className="cursor-pointer">
              <Upload size={50} className="text-primary group-hover:text-secondary transition-colors" />
            </label>
          </Button>
        </>
      </div>
    </aside>
  );
};

export default Sidebar;
