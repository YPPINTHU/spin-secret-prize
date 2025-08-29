import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

interface WheelItem {
  id: string;
  text: string;
  color: string;
  probability: number;
}

type DatabaseWheelConfig = Database['public']['Tables']['wheel_configurations']['Row'];

interface WheelConfiguration {
  id: string;
  name: string;
  items: WheelItem[];
  created_at: string;
  updated_at: string;
}

export const useWheelData = () => {
  const [currentConfig, setCurrentConfig] = useState<WheelConfiguration | null>(null);
  const [savedConfigs, setSavedConfigs] = useState<WheelConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved configurations
  const loadConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('wheel_configurations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const configs: WheelConfiguration[] = (data || []).map((config: DatabaseWheelConfig) => ({
        ...config,
        items: Array.isArray(config.items) ? config.items as unknown as WheelItem[] : []
      }));
      
      setSavedConfigs(configs);
      
      // If no current config and there are saved configs, load the most recent one
      if (!currentConfig && configs.length > 0) {
        setCurrentConfig(configs[0]);
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
      toast.error('Failed to load saved wheel configurations');
    } finally {
      setIsLoading(false);
    }
  };

  // Save current configuration
  const saveConfiguration = async (name: string, items: WheelItem[]) => {
    try {
      const { data, error } = await supabase
        .from('wheel_configurations')
        .insert([{ name, items: items as any }])
        .select()
        .single();

      if (error) throw error;
      
      const config: WheelConfiguration = {
        ...data,
        items: Array.isArray(data.items) ? data.items as unknown as WheelItem[] : []
      };
      
      setCurrentConfig(config);
      setSavedConfigs(prev => [config, ...prev]);
      toast.success(`Wheel configuration "${name}" saved!`);
      return config;
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save wheel configuration');
      return null;
    }
  };

  // Update existing configuration
  const updateConfiguration = async (id: string, name: string, items: WheelItem[]) => {
    try {
      const { data, error } = await supabase
        .from('wheel_configurations')
        .update({ name, items: items as any })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const config: WheelConfiguration = {
        ...data,
        items: Array.isArray(data.items) ? data.items as unknown as WheelItem[] : []
      };
      
      setCurrentConfig(config);
      setSavedConfigs(prev => prev.map(c => 
        c.id === id ? config : c
      ));
      toast.success(`Wheel configuration "${name}" updated!`);
      return config;
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error('Failed to update wheel configuration');
      return null;
    }
  };

  // Load a specific configuration
  const loadConfiguration = async (id: string) => {
    const config = savedConfigs.find(c => c.id === id);
    if (config) {
      setCurrentConfig(config);
      toast.success(`Loaded "${config.name}"`);
      return config.items;
    }
    return null;
  };

  // Delete a configuration
  const deleteConfiguration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wheel_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSavedConfigs(prev => prev.filter(config => config.id !== id));
      
      // If we deleted the current config, clear it
      if (currentConfig?.id === id) {
        setCurrentConfig(null);
      }
      
      toast.success('Configuration deleted!');
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast.error('Failed to delete configuration');
    }
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  return {
    currentConfig,
    savedConfigs,
    isLoading,
    saveConfiguration,
    updateConfiguration,
    loadConfiguration,
    deleteConfiguration,
    reloadConfigurations: loadConfigurations
  };
};