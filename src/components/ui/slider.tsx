import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';
import { clamp } from '@/utils';

type TooltipProps = {
  tooltipFormatter?: (data: number) => React.ReactNode;
  max: number;
} & React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, TooltipProps>(({ className, tooltipFormatter, ...props }, ref) => {
  const [tooltipPositionData, setToltipPositionData] = React.useState<{ left: number; value: number } | null>(null);

  return (
    <div
      onMouseMove={(e) => {
        const relativeX = e.clientX - e.currentTarget.getBoundingClientRect().left;
        const max = props.max;
        const value = (relativeX / e.currentTarget.getBoundingClientRect().width) * max;
        const left = clamp((relativeX / e.currentTarget.getBoundingClientRect().width) * 100, 0, 100);
        setToltipPositionData({ left, value });
      }}
      onMouseDown={(e) => {
        const relativeX = e.clientX - e.currentTarget.getBoundingClientRect().left;
        const max = props.max;
        const value = (relativeX / e.currentTarget.getBoundingClientRect().width) * max;
        const left = clamp((relativeX / e.currentTarget.getBoundingClientRect().width) * 100, 0, 100);
        setToltipPositionData({ left, value });
      }}
      onMouseLeave={() => {
        setToltipPositionData(null);
      }}
    >
      <SliderPrimitive.Root ref={ref} className={cn('relative flex w-full touch-none select-none items-center', className)} {...props}>
        <SliderPrimitive.Track className="bg-secondary relative h-2 w-full grow rounded-full">
          {tooltipPositionData && tooltipFormatter && (
            <TooltipProvider>
              <Tooltip open delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    className="bg-primary absolute -top-2 left-0 right-0 h-2 w-2 rounded-full"
                    style={{ left: `${tooltipPositionData.left}%` }}
                  ></div>
                </TooltipTrigger>
                <TooltipContent>
                  <div>{tooltipFormatter?.(tooltipPositionData.value)}</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <SliderPrimitive.Range className="bg-primary absolute h-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="border-primary bg-background ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
