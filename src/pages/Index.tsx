import { useState } from "react";
import { SpinWheel } from "@/components/SpinWheel";
import { ItemManager } from "@/components/ItemManager";
import { AdminPanel } from "@/components/AdminPanel";
import { WinnerModal } from "@/components/WinnerModal";
import { Sparkles } from "lucide-react";

interface WheelItem {
  id: string;
  text: string;
  color: string;
  probability: number;
}

const Index = () => {
  const [items, setItems] = useState<WheelItem[]>([
    { id: "1", text: "Prize 1", color: "#FF6B6B", probability: 25 },
    { id: "2", text: "Prize 2", color: "#4ECDC4", probability: 25 },
    { id: "3", text: "Prize 3", color: "#45B7D1", probability: 25 },
    { id: "4", text: "Prize 4", color: "#96CEB4", probability: 25 },
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelItem | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleSpin = (winningItem: WheelItem) => {
    setWinner(winningItem);
    setIsSpinning(false);
    setShowWinnerModal(true);
  };

  const handleSpinStart = () => {
    setIsSpinning(true);
    setWinner(null);
  };

  const closeWinnerModal = () => {
    setShowWinnerModal(false);
    setWinner(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-center space-x-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold gradient-primary bg-clip-text text-transparent">
              Spin The Wheel
            </h1>
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Add your items, spin the wheel, and let fate decide! 
            Each spin is exciting and unpredictable.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Wheel Section */}
          <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <SpinWheel 
              items={items}
              onSpin={handleSpin}
              isSpinning={isSpinning}
            />
          </div>

          {/* Controls Section */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <AdminPanel
              isAuthenticated={isAdminAuthenticated}
              onAuthenticate={setIsAdminAuthenticated}
            />
            
            <ItemManager
              items={items}
              onItemsChange={setItems}
              showProbabilities={isAdminAuthenticated}
            />
          </div>
        </div>

        {/* Winner Modal */}
        <WinnerModal
          winner={winner}
          isOpen={showWinnerModal}
          onClose={closeWinnerModal}
        />
      </div>
    </div>
  );
};

export default Index;
