import { useCallback, useMemo, useRef } from "react";

import { cn } from "@/shared/shadcn/lib/utils";

type WaveformProps = {
  progress: number; // 0..1
  onSeekStart?: () => void;
  onSeek: (p: number) => void;
  onSeekEnd?: (p: number) => void;
  bars?: number;
  className?: string;
};

const DEFAULT_BARS = 32;

const generateBars = (count: number) =>
  Array.from({ length: count }, (_, i) => {
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const v = seed - Math.floor(seed);
    return 30 + v * 70;
  });

export const Waveform = ({
  progress,
  onSeekStart,
  onSeek,
  onSeekEnd,
  bars = DEFAULT_BARS,
  className,
}: WaveformProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const heights = useMemo(() => generateBars(bars), [bars]);

  const calcProgress = (x: number) => {
    const el = ref.current;
    if (!el) return 0;

    const rect = el.getBoundingClientRect();
    return Math.min(Math.max((x - rect.left) / rect.width, 0), 1);
  };

  const start = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      onSeekStart?.();
      onSeek(calcProgress(e.clientX));
    },
    [onSeek, onSeekStart],
  );

  const move = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      onSeek(calcProgress(e.clientX));
    },
    [onSeek],
  );

  const end = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      onSeekEnd?.(calcProgress(e.clientX));
    },
    [onSeekEnd],
  );

  return (
    <div
      ref={ref}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerLeave={end}
      className={cn(
        "flex h-full cursor-pointer touch-none items-end gap-[2px] select-none",
        className,
      )}
    >
      {heights.map((h, i) => {
        const filled = i / bars < progress;

        return (
          <div
            key={i}
            className={cn(
              "w-[2px] rounded-sm transition-colors duration-150",
              filled ? "bg-primary" : "bg-primary/30",
            )}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
};
