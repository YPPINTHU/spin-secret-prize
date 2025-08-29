import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Download, Trash2, Plus } from 'lucide-react';
import { useWheelConfig } from '@/hooks/useWheelConfig';

interface WheelItem {
  id: string;
  text: string;
  color: string;
  probability: number;
}

interface WheelConfig {
  id: string;
  name: string;
  items: WheelItem[];
  created_at: string;
  updated_at: string;
}

interface SaveLoadPanelProps {
  items: WheelItem[];
  onItemsLoad: (items: WheelItem[]) => void;
}

export const SaveLoadPanel = ({ items, onItemsLoad }: SaveLoadPanelProps) => {
  const [configName, setConfigName] = useState('');
  const [savedConfigs, setSavedConfigs] = useState<WheelConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  
  const {
    loading,
    currentConfigId,
    saveConfiguration,
    updateConfiguration,
    loadConfiguration,
    loadAllConfigurations,
    deleteConfiguration,
  } = useWheelConfig();

  useEffect(() => {
    loadSavedConfigurations();
  }, []);

  const loadSavedConfigurations = async () => {
    try {
      const configs = await loadAllConfigurations();
      setSavedConfigs(configs);
    } catch (error) {
      console.error('Failed to load configurations:', error);
    }
  };

  const handleSave = async () => {
    if (!configName.trim()) {
      return;
    }

    try {
      if (currentConfigId) {
        await updateConfiguration(currentConfigId, configName, items);
      } else {
        await saveConfiguration(configName, items);
      }
      await loadSavedConfigurations();
      setConfigName('');
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const handleLoad = async () => {
    if (!selectedConfigId) return;

    try {
      const config = await loadConfiguration(selectedConfigId);
      onItemsLoad(config.items);
      setConfigName(config.name);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedConfigId) return;

    try {
      await deleteConfiguration(selectedConfigId);
      await loadSavedConfigurations();
      setSelectedConfigId('');
      setConfigName('');
    } catch (error) {
      console.error('Failed to delete configuration:', error);
    }
  };

  const handleNewConfig = () => {
    setConfigName('');
    setSelectedConfigId('');
    onItemsLoad([
      { id: "1", text: "Prize 1", color: "#FF6B6B", probability: 25 },
      { id: "2", text: "Prize 2", color: "#4ECDC4", probability: 25 },
      { id: "3", text: "Prize 3", color: "#45B7D1", probability: 25 },
      { id: "4", text: "Prize 4", color: "#96CEB4", probability: 25 },
    ]);
  };

  return (
    <Card className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold">Save & Load Configurations</h3>
      
      {/* Save Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Configuration name..."
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleSave}
            disabled={loading || !configName.trim()}
            className="gradient-secondary hover:scale-105 transition-smooth"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Load Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select configuration..." />
            </SelectTrigger>
            <SelectContent>
              {savedConfigs.map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  {config.name} - {new Date(config.updated_at).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleLoad}
            disabled={loading || !selectedConfigId}
            variant="outline"
            className="hover:scale-105 transition-smooth"
          >
            <Download className="w-4 h-4 mr-2" />
            Load
          </Button>
          
          <Button 
            onClick={handleDelete}
            disabled={loading || !selectedConfigId}
            variant="destructive"
            size="sm"
            className="hover:scale-105 transition-smooth"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* New Config Button */}
      <Button 
        onClick={handleNewConfig}
        variant="outline"
        className="w-full hover:scale-105 transition-smooth"
      >
        <Plus className="w-4 h-4 mr-2" />
        New Configuration
      </Button>

      {savedConfigs.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <p>No saved configurations yet.</p>
          <p className="text-sm">Save your first wheel configuration!</p>
        </div>
      )}
    </Card>
  );
};