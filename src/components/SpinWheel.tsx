import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WheelItem {
  id: string;
  text: string;
  color: string;
  probability: number;
}

interface SpinWheelProps {
  items: WheelItem[];
  onSpin: (winner: WheelItem) => void;
  isSpinning: boolean;
}

export default function SpinWheel({ items, onSpin, isSpinning }: SpinWheelProps) {
    const [rotation, setRotation] = useState(0); // degrees
    const [selected, setSelected] = useState<number | null>(null);
    const wheelRef = useRef<HTMLDivElement | null>(null);

    const segmentAngle = useMemo(() => 360 / items.length, [items.length]);

    // Helper: compute the final rotation so the center of `index` lands exactly at the top arrow.
    // Explanation: segments are laid out clockwise; to bring a segment center at 0deg (top),
    // we rotate the wheel by (360 - (index*segmentAngle + segmentAngle/2)) degrees.
    const computeFinalRotation = useCallback((index: number, spins = 6) => {
        const centerOfSegment = index * segmentAngle + segmentAngle / 2;
        const targetDeg = (360 - centerOfSegment) % 360;
        // add full spins to make it feel good and a tiny random offset for realism
        const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.2); // +/- small fraction
        return spins * 360 + targetDeg + randomOffset;
    }, [segmentAngle]);

    // Start spin and set the final selected index explicitly so highlight is consistent
    const spinTo = useCallback((index: number) => {
        if (isSpinning) return;
        setIsSpinning(true);
        setSelected(index); // mark which one we intend to land on (keeps highlight accurate)
        const final = computeFinalRotation(index, 6);
        // Force GPU acceleration and use a smooth easing for the transition
        if (wheelRef.current) {
            const el = wheelRef.current;
            el.style.transition = "transform 4s cubic-bezier(.22,.98,.2,.99)"; // smooth easing
            el.style.willChange = "transform";
            // Setting transform via style to ensure the transition happens smoothly on the GPU
            requestAnimationFrame(() => {
                el.style.transform = `rotate(${final}deg) translateZ(0)`;
            });
        }
        setRotation(final);

        // listen for transition end once
        const handler = () => {
            if (wheelRef.current) {
                wheelRef.current.style.transition = "";
                wheelRef.current.style.willChange = "";
            }
            setIsSpinning(false);
            // Normalize final rotation into [0,360) and compute landed index defensively from the index we used.
            // We already set `selected` to the index we moved to; that's the canonical result.
            onSpin(items[index]);
            if (wheelRef.current) wheelRef.current.removeEventListener("transitionend", handler);
        };
        if (wheelRef.current) wheelRef.current.addEventListener("transitionend", handler);
    }, [computeFinalRotation, isSpinning, onSpin]);

    return (
        <div className="flex flex-col items-center space-y-8">
      <div className="relative">
        {/* Fixed Pointer - positioned outside wheel rim */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-primary drop-shadow-xl"></div>
        </div>
        
        {/* Wheel */}
        <div className="wheel-glow">
          <div
                className="wheel"
                ref={wheelRef}
                // keep an inline transform to reflect current rotation if code renders without transition
                style={{
                    transform: `rotate(${rotation}deg) translateZ(0)`,
                    // ensure hardware acceleration and smoothness while idle
                    willChange: isSpinning ? "transform" : "auto",
                }}
            >
                {items.map((label, i) => {
                    const rotateDeg = i * segmentAngle;
                    const isActive = selected === i;
                    return (
                        <div
                            key={label}
                            className={`segment ${isActive ? "active" : ""}`}
                            style={{
                                transform: `rotate(${rotateDeg}deg) skewY(${90 - segmentAngle}deg)`,
                            }}
                        >
                            <span
                                style={{
                                    transform: `skewY(${-(90 - segmentAngle)}deg) rotate(${segmentAngle / 2}deg)`,
                                }}
                            >
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      <Button
        onClick={() => spinTo(Math.floor(Math.random() * items.length))}
        disabled={isSpinning || items.length === 0}
        size="lg"
        className="gradient-primary hover:scale-105 transition-smooth font-bold text-lg px-12 py-4 shadow-2xl"
      >
        {isSpinning ? "Spinning..." : "SPIN THE WHEEL!"}
      </Button>
    </div>
    );
}