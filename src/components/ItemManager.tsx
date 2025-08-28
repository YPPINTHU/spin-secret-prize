import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

interface WheelItem {
  id: string;
  text: string;
  color: string;
  probability: number;
}

interface ItemManagerProps {
  items: WheelItem[];
  onItemsChange: (items: WheelItem[]) => void;
  showProbabilities?: boolean;
}

const DEFAULT_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
];

export const ItemManager = ({ items, onItemsChange, showProbabilities = false }: ItemManagerProps) => {
  const [newItemText, setNewItemText] = useState("");

  const addItem = () => {
    if (!newItemText.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    if (items.length >= 12) {
      toast.error("Maximum 12 items allowed");
      return;
    }

    const newItem: WheelItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      color: DEFAULT_COLORS[items.length % DEFAULT_COLORS.length],
      probability: showProbabilities ? 10 : 100 / (items.length + 1)
    };

    // Redistribute probabilities equally if not in admin mode
    if (!showProbabilities) {
      const equalProbability = 100 / (items.length + 1);
      const updatedItems = items.map(item => ({
        ...item,
        probability: equalProbability
      }));
      onItemsChange([...updatedItems, newItem]);
    } else {
      onItemsChange([...items, newItem]);
    }

    setNewItemText("");
    toast.success("Item added!");
  };

  const removeItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    
    // Redistribute probabilities equally if not in admin mode
    if (!showProbabilities && updatedItems.length > 0) {
      const equalProbability = 100 / updatedItems.length;
      const redistributedItems = updatedItems.map(item => ({
        ...item,
        probability: equalProbability
      }));
      onItemsChange(redistributedItems);
    } else {
      onItemsChange(updatedItems);
    }
    
    toast.success("Item removed!");
  };

  const updateItemColor = (id: string, color: string) => {
    onItemsChange(items.map(item => 
      item.id === id ? { ...item, color } : item
    ));
  };

  const updateItemProbability = (id: string, probability: number) => {
    if (probability < 0 || probability > 100) return;
    
    onItemsChange(items.map(item => 
      item.id === id ? { ...item, probability } : item
    ));
  };

  const updateItemText = (id: string, text: string) => {
    onItemsChange(items.map(item => 
      item.id === id ? { ...item, text } : item
    ));
  };

  const totalProbability = items.reduce((sum, item) => sum + item.probability, 0);

  return (
    <Card className="glass-card p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Enter item name..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addItem()}
          className="flex-1"
        />
        <Button 
          onClick={addItem}
          className="gradient-secondary hover:scale-105 transition-smooth"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {showProbabilities && (
        <div className="text-sm text-muted-foreground">
          Total Probability: {totalProbability.toFixed(1)}%
          {totalProbability !== 100 && (
            <span className="text-destructive ml-2">
              (Should equal 100%)
            </span>
          )}
        </div>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-3 p-3 rounded-lg bg-card/50 border border-border/30"
          >
            <input
              type="color"
              value={item.color}
              onChange={(e) => updateItemColor(item.id, e.target.value)}
              className="w-8 h-8 rounded border-none cursor-pointer"
            />
            
            <Input
              value={item.text}
              onChange={(e) => updateItemText(item.id, e.target.value)}
              className="flex-1"
            />
            
            {showProbabilities && (
              <div className="flex items-center space-x-1">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={item.probability}
                  onChange={(e) => updateItemProbability(item.id, parseFloat(e.target.value) || 0)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            )}
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeItem(item.id)}
              className="hover:scale-105 transition-smooth"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No items added yet.</p>
          <p className="text-sm">Add some items to get started!</p>
        </div>
      )}
    </Card>
  );
};