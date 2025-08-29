import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, FolderOpen, Trash2 } from 'lucide-react';
import { useWheelData } from '@/hooks/useWheelData';

interface WheelItem {
  id: string;
  text: string;
  color: string;
  probability: number;
}

interface WheelConfigManagerProps {
  items: WheelItem[];
  onItemsChange: (items: WheelItem[]) => void;
}

export const WheelConfigManager = ({ items, onItemsChange }: WheelConfigManagerProps) => {
  const [configName, setConfigName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  
  const {
    currentConfig,
    savedConfigs,
    isLoading,
    saveConfiguration,
    updateConfiguration,
    loadConfiguration,
    deleteConfiguration
  } = useWheelData();

  const handleSave = async () => {
    if (!configName.trim()) return;
    
    if (currentConfig) {
      await updateConfiguration(currentConfig.id, configName, items);
    } else {
      await saveConfiguration(configName, items);
    }
    
    setConfigName('');
    setShowSaveDialog(false);
  };

  const handleLoad = async (configId: string) => {
    const loadedItems = await loadConfiguration(configId);
    if (loadedItems) {
      onItemsChange(loadedItems);
    }
    setShowLoadDialog(false);
  };

  const handleDelete = async (configId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this configuration?')) {
      await deleteConfiguration(configId);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-lg font-semibold">Wheel Configurations</h3>
      
      <div className="flex gap-2">
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setConfigName(currentConfig?.name || '');
                setShowSaveDialog(true);
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              {currentConfig ? 'Update' : 'Save'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentConfig ? 'Update Configuration' : 'Save Configuration'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter configuration name..."
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!configName.trim()}>
                  {currentConfig ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoading || savedConfigs.length === 0}>
              <FolderOpen className="w-4 h-4 mr-2" />
              Load
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Load Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedConfigs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => handleLoad(config.id)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{config.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {config.items.length} items • {new Date(config.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(config.id, e)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {savedConfigs.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No saved configurations found.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {currentConfig && (
        <div className="text-sm text-muted-foreground">
          Current: <span className="font-medium">{currentConfig.name}</span>
        </div>
      )}
    </Card>
  );
};