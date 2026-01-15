-- Create system_settings table for storing app configuration
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (public config)
CREATE POLICY "Anyone can view settings"
ON public.system_settings
FOR SELECT
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
ON public.system_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.system_settings (key, value) VALUES
  ('competition', '{"name": "RoboRumble 2024", "date": "2024-03-15", "registration_start": "2024-01-01", "registration_end": "2024-02-01", "max_teams": 50}'),
  ('registration', '{"is_open": true, "allow_team_editing": true, "auto_accept": false}'),
  ('notifications', '{"email_enabled": true, "new_registration_alerts": true}');

-- Add trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();