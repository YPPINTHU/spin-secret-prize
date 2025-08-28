import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles } from "lucide-react";

interface WheelItem {
  id: string;
  text: string;
  color: string;
  probability: number;
}

interface WinnerModalProps {
  winner: WheelItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WinnerModal = ({ winner, isOpen, onClose }: WinnerModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && winner) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, winner]);

  if (!winner) return null;

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full animate-bounce-in"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: winner.color,
              }}
            />
          ))}
        </div>
      )}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-card border-primary/50 max-w-md">
          <div className="text-center space-y-6 p-6">
            <div className="animate-bounce-in">
              <Trophy className="w-16 h-16 mx-auto text-primary animate-pulse-glow" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                🎉 Winner! 🎉
              </h2>
              <div 
                className="text-2xl font-bold p-4 rounded-lg border-2 animate-fade-in-up"
                style={{ 
                  backgroundColor: `${winner.color}20`,
                  borderColor: winner.color,
                  color: winner.color
                }}
              >
                {winner.text}
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>Congratulations!</span>
              <Sparkles className="w-4 h-4" />
            </div>
            
            <Button
              onClick={onClose}
              className="gradient-secondary hover:scale-105 transition-smooth w-full"
            >
              Spin Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};