import { useState, useRef, useEffect } from "react";
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

export const SpinWheel = ({ items, onSpin, isSpinning }: SpinWheelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sliceAngle = (2 * Math.PI) / items.length;

    items.forEach((item, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(item.text, radius * 0.7, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const spin = () => {
    if (items.length === 0) {
      toast.error("Add some items to the wheel first!");
      return;
    }

    // Calculate weighted random selection
    const totalProbability = items.reduce((sum, item) => sum + item.probability, 0);
    const random = Math.random() * totalProbability;
    let accumulated = 0;
    let winner = items[0];

    for (const item of items) {
      accumulated += item.probability;
      if (random <= accumulated) {
        winner = item;
        break;
      }
    }

    // Calculate precise rotation to land on winner
    const winnerIndex = items.findIndex(item => item.id === winner.id);
    const sliceAngle = 360 / items.length;
    
    // Calculate the center angle of the winning slice
    const sliceCenterAngle = winnerIndex * sliceAngle + (sliceAngle / 2);
    
    // Add multiple full rotations for visual effect (5-7 rotations)
    const numberOfRotations = 5 + Math.random() * 2;
    
    // Calculate final rotation: full rotations + adjustment to align slice center with top arrow
    // We subtract sliceCenterAngle because we want that slice to be at the top (0 degrees)
    const finalRotation = numberOfRotations * 360 + (360 - sliceCenterAngle);

    setRotation(prev => prev + finalRotation);

    // Trigger winner callback after 5s animation + 200ms end snap
    setTimeout(() => {
      // Add a small snap effect by slightly adjusting rotation for precise alignment
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.transition = 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        // Ensure perfect alignment by normalizing to exact slice center
        const currentRotation = rotation + finalRotation;
        const normalizedRotation = currentRotation - (currentRotation % 360) + (360 - sliceCenterAngle);
        canvas.style.transform = `rotate(${normalizedRotation}deg)`;
        
        // Add winning slice highlight effect
        setTimeout(() => {
          onSpin(winner);
        }, 200);
      }
    }, 5000);
  };

  useEffect(() => {
    drawWheel();
  }, [items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.transform = `rotate(${rotation}deg)`;
    }
  }, [rotation]);

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="relative">
        {/* Fixed Pointer - positioned outside wheel rim */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-primary drop-shadow-xl"></div>
        </div>
        
        {/* Wheel */}
        <div className="wheel-glow">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="transition-transform duration-[5000ms] ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full border-4 border-primary"
          />
        </div>
      </div>

      <Button
        onClick={spin}
        disabled={isSpinning || items.length === 0}
        size="lg"
        className="gradient-primary hover:scale-105 transition-smooth font-bold text-lg px-12 py-4 shadow-2xl"
      >
        {isSpinning ? "Spinning..." : "SPIN THE WHEEL!"}
      </Button>
    </div>
  );
};