-- Create table for wheel configurations
CREATE TABLE public.wheel_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'My Wheel',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wheel_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a demo app)
CREATE POLICY "Anyone can view wheel configurations" 
ON public.wheel_configurations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create wheel configurations" 
ON public.wheel_configurations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update wheel configurations" 
ON public.wheel_configurations 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete wheel configurations" 
ON public.wheel_configurations 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_wheel_configurations_updated_at
BEFORE UPDATE ON public.wheel_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();