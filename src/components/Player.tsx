import { Button } from '@/components/ui/button';
import CircularProgress from '@/components/ui/CircularProgress';
import { Slider } from '@/components/ui/slider';
import VolumeButton from '@/components/VolumeButton';
import { cn } from '@/lib/utils';
import { VideoData } from '@/Types';
import { formatTime, generateThumbnailsAtIntervals, getThumbnailAtCurrentTime } from '@/utils';
import { Pause, Play } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type VideoElementAttributes = Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'controls'>;
type PlayerProps = {
  videoData: VideoData | null;
  videoClassName?: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} & VideoElementAttributes;

let timeout: NodeJS.Timeout;
const TIMEOUT_TIME = 200000000;
const speedSelectorOptions = [0.5, 0.25, 1, 1.25, 1.5, 2];
const thumbnailInterval = 30;

const Player = ({ videoData, className, videoClassName, open, setOpen, ...rest }: PlayerProps) => {
  const { src } = videoData || {};
  const playerRef = useRef<HTMLVideoElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [seekingThumnails, setSeekingThumnails] = useState<string[]>([]);

  useEffect(() => {
    if (!src) return;
    const setThumbNails = () => {
      generateThumbnailsAtIntervals(src, thumbnailInterval)
        .then((thumbnails) => setSeekingThumnails(thumbnails))
        .catch((e) => console.error(e));
    };
    setThumbNails();
  }, [src]);

  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    progress: 0,
    speed: 1,
    isMuted: false,
    volume: 100
  });

  useEffect(() => {
    const updateProgress = () => {
      if (playerRef.current) {
        setPlayerState({ ...playerState, progress: playerRef.current.currentTime });
      }
    };
    playerRef.current?.addEventListener('timeupdate', updateProgress);
  }, [playerState, src]);

  const handleSpeedChange = (speed: number) => {
    if (playerRef.current) {
      playerRef.current.playbackRate = speed;
      setPlayerState({ ...playerState, speed });
    }
  };

  const handleMuteToggle = () => {
    if (playerState.isMuted) {
      handleVolumeChange(100);
    } else {
      handleVolumeChange(0);
    }
  };

  const handleVolumeChange = (volume: number) => {
    if (playerRef.current) {
      const value = volume / 100;
      const player = playerRef.current;
      player.muted = value === 0;
      player.volume = value;
      setPlayerState({ ...playerState, isMuted: player.muted, volume: volume });
    }
  };

  const handleSeek = (value: number) => {
    if (playerRef.current) {
      const seekTime = value;
      playerRef.current.currentTime = seekTime;
      setPlayerState((prev) => ({ ...prev, progress: value }));
    }
  };

  const handlePause = useCallback(() => {
    if (playerRef.current && src) {
      playerRef.current.pause();
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, [src]);

  const handlePlay = useCallback(() => {
    if (playerRef.current && src) {
      playerRef.current.play();
      setPlayerState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, [src]);

  const handlePlayPause = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      if (playerRef.current) {
        if (playerRef.current.paused) {
          handlePlay();
        } else {
          handlePause();
        }
      }
    },
    [handlePause, handlePlay]
  );

  const hideControls = useCallback(() => {
    clearTimeout(timeout);
    if (src) {
      timeout = setTimeout(() => {
        setControlsVisible(false);
      }, TIMEOUT_TIME);
    }
  }, [src]);

  const handleMouseEnter = () => {
    clearTimeout(timeout);
    setControlsVisible(true);
  };

  const handleMouseLeave = () => {
    hideControls();
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    hideControls();
  };

  useEffect(() => {
    if (src) handlePlay();
  }, [handlePlay, src]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!playerRef.current) return;
      if (e.key === ' ') {
        handlePlayPause();
      }
      if (e.key === 'ArrowLeft') {
        handleSeek(playerRef?.current.currentTime - 5);
      }
      if (e.key === 'ArrowRight') {
        handleSeek(playerRef?.current.currentTime + 5);
      }
    };
    if (src) {
      document.addEventListener('keydown', (e) => handleKeyPress(e));
    }
    return () => document.removeEventListener('keydown', (e) => handleKeyPress(e));
  }, [handlePlayPause, src]);

  const handleSeekingThumbnail = (time: number) => {
    const thumbnail = getThumbnailAtCurrentTime(seekingThumnails, thumbnailInterval, time);
    return (
      <div className="pt-2 text-center">
        <div className="bg-secondary mb-2 rounded">
          {thumbnail ? (
            <img className="aspect-video w-40 rounded border-2" src={thumbnail || ''} />
          ) : (
            <div className="flex aspect-video w-40 items-center justify-center">
              <CircularProgress />
            </div>
          )}
        </div>

        <span className="">{formatTime(time)}</span>
      </div>
    );
  };

  return (
    <div className={cn('flex-grow', className)}>
      <div className="relative" onMouseEnter={handleMouseEnter} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <video
          ref={playerRef}
          className={cn('aspect-video w-full cursor-pointer rounded', videoClassName)}
          onClick={handlePlayPause}
          src={src}
          {...rest}
        ></video>
        {controlsVisible && (
          <>
            <Button className="fixed right-2 top-2 z-10" onClick={() => setOpen(!open)}>
              {open ? 'Close' : 'Open'}
            </Button>
            <div className="absolute bottom-0 left-0 right-0 flex h-20 flex-wrap items-center justify-between bg-black/50">
              <div className="w-full">
                <Slider
                  value={[playerState.progress]}
                  className="z-10 cursor-pointer"
                  max={playerRef.current?.duration || 0}
                  onMouseDown={handlePause}
                  onMouseUp={handlePlay}
                  tooltipFormatter={handleSeekingThumbnail}
                  onValueChange={(e) => {
                    const value = e[0];
                    handleSeek(value);
                  }}
                />
              </div>
              <div>
                {formatTime(playerState.progress)} / {formatTime(playerRef.current?.duration)}
              </div>
              <div className="mx-auto flex gap-2">
                {speedSelectorOptions.map((s) => (
                  <Button
                    key={s}
                    className={cn(playerState.speed === s && 'bg-accent')}
                    size={'icon'}
                    variant={'ghost'}
                    onClick={() => handleSpeedChange(s)}
                  >
                    {s}x
                  </Button>
                ))}
              </div>
              <div>
                <VolumeButton
                  handleMuteToggle={handleMuteToggle}
                  handleVolumeChange={handleVolumeChange}
                  isMuted={playerState.isMuted}
                  volume={playerState.volume}
                />
              </div>
            </div>
            <Button
              size={'icon'}
              variant={'ghost'}
              className="absolute left-1/2 top-1/2 h-auto w-auto rounded-full p-5 [transform:translate(-50%,-100%)]"
              onClick={handlePlayPause}
            >
              {playerState.isPlaying ? <Pause size={40} /> : <Play size={40} />}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Player;
