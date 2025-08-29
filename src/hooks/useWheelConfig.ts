import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const useWheelConfig = () => {
  const [loading, setLoading] = useState(false);
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);

  const saveConfiguration = async (name: string, items: WheelItem[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wheel_configurations')
        .insert([{ name, items: items as any }])
        .select()
        .single();

      if (error) throw error;

      setCurrentConfigId(data.id);
      toast.success('Configuration saved!');
      return data;
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (id: string, name: string, items: WheelItem[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wheel_configurations')
        .update({ name, items: items as any })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Configuration updated!');
      return data;
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error('Failed to update configuration');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguration = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wheel_configurations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setCurrentConfigId(data.id);
      return {
        ...data,
        items: data.items as unknown as WheelItem[]
      } as WheelConfig;
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast.error('Failed to load configuration');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadAllConfigurations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wheel_configurations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data.map(config => ({
        ...config,
        items: config.items as unknown as WheelItem[]
      })) as WheelConfig[];
    } catch (error) {
      console.error('Error loading configurations:', error);
      toast.error('Failed to load configurations');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteConfiguration = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('wheel_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (currentConfigId === id) {
        setCurrentConfigId(null);
      }
      
      toast.success('Configuration deleted!');
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast.error('Failed to delete configuration');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    currentConfigId,
    saveConfiguration,
    updateConfiguration,
    loadConfiguration,
    loadAllConfigurations,
    deleteConfiguration,
  };
};