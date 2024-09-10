import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type VolumeButtonProps = {
  handleMuteToggle: () => void;
  volume: number;
  isMuted: boolean;
  handleVolumeChange: (volume: number) => void;
};

export default function VolumeButton({ handleMuteToggle, volume, isMuted, handleVolumeChange }: VolumeButtonProps) {
  const [prevVolume, setPrevVolume] = useState(100);

  const toggleMute = () => {
    handleMuteToggle();
    if (isMuted) {
      handleVolumeChange(prevVolume);
    } else {
      setPrevVolume(volume);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0 || isMuted) return <VolumeX />;
    if (volume < 33) return <Volume />;
    if (volume < 67) return <Volume1 />;
    return <Volume2 />;
  };

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2 rounded-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
              {getVolumeIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{isMuted ? 'Unmute' : 'Mute'}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Slider value={[isMuted ? 0 : volume]} max={100} step={1} className="w-32" onValueChange={(val) => handleVolumeChange(val[0])} />
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{isMuted ? 0 : volume}%</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
