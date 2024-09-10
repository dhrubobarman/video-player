import Player from '@/components/Player';
import Sidebar from '@/components/Sidebar';
import VideoGrid from '@/components/VIdeoGrid';
import { VideoData } from '@/Types';
import { useState } from 'react';

function App() {
  const [open, setOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [files, setFiles] = useState<VideoData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  return (
    <main className="pb-30 pt-5 [--sidebar-w:300px]">
      <div className="container mx-auto px-4">
        <Player videoData={selectedVideo} className="mx-atuo" open={open} setOpen={setOpen} />
        <Sidebar
          setCurrentIndex={setCurrentIndex}
          open={open}
          files={files}
          setFiles={setFiles}
          setSelectedVideo={setSelectedVideo}
          setOpen={setOpen}
        />
        <VideoGrid
          currentIndex={currentIndex}
          files={files}
          setCurrentIndex={setCurrentIndex}
          setFiles={setFiles}
          setSelectedVideo={setSelectedVideo}
        />
      </div>
    </main>
  );
}

export default App;
