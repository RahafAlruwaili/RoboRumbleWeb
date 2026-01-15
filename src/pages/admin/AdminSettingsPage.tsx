import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Settings, Calendar, Bell, Lock, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompetitionSettings {
  name: string;
  date: string;
  registration_start: string;
  registration_end: string;
  max_teams: number;
}

interface RegistrationSettings {
  is_open: boolean;
  allow_team_editing: boolean;
  auto_accept: boolean;
}

interface NotificationSettings {
  email_enabled: boolean;
  new_registration_alerts: boolean;
}

const AdminSettingsPage = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [competition, setCompetition] = useState<CompetitionSettings>({
    name: 'RoboRumble 2024',
    date: '2024-03-15',
    registration_start: '2024-01-01',
    registration_end: '2024-02-01',
    max_teams: 50,
  });

  const [registration, setRegistration] = useState<RegistrationSettings>({
    is_open: true,
    allow_team_editing: true,
    auto_accept: false,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_enabled: true,
    new_registration_alerts: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value');

      if (error) throw error;

      data?.forEach((setting: { key: string; value: unknown }) => {
        if (setting.key === 'competition') {
          setCompetition(setting.value as CompetitionSettings);
        } else if (setting.key === 'registration') {
          setRegistration(setting.value as RegistrationSettings);
        } else if (setting.key === 'notifications') {
          setNotifications(setting.value as NotificationSettings);
        }
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
      toast.error(language === 'ar' ? 'خطأ في تحميل الإعدادات' : 'Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      // Save competition settings (upsert to create if not exists)
      const { error: compError } = await supabase
        .from('system_settings')
        .upsert({ key: 'competition', value: JSON.parse(JSON.stringify(competition)) }, { onConflict: 'key' });

      if (compError) throw compError;

      // Save registration settings (upsert to create if not exists)
      const { error: regError } = await supabase
        .from('system_settings')
        .upsert({ key: 'registration', value: JSON.parse(JSON.stringify(registration)) }, { onConflict: 'key' });

      if (regError) throw regError;

      // Save notification settings (upsert to create if not exists)
      const { error: notifError } = await supabase
        .from('system_settings')
        .upsert({ key: 'notifications', value: JSON.parse(JSON.stringify(notifications)) }, { onConflict: 'key' });

      if (notifError) throw notifError;

      toast.success(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error(language === 'ar' ? 'خطأ في حفظ الإعدادات' : 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Mode Label + Back Button */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="text-red-500 font-semibold">
            {language === 'ar' ? 'وضع الإدارة' : 'Admin Mode'}
          </span>
        </div>
        <Link to="/admin">
          <Button variant="outline">
            <ArrowRight className="w-4 h-4 me-2 rtl:rotate-180" />
            {language === 'ar' ? 'العودة للإدارة' : 'Back to Admin'}
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-primary">
          {language === 'ar' ? 'إعدادات النظام' : 'System Settings'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إدارة إعدادات المسابقة والنظام' : 'Manage competition and system settings'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competition Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {language === 'ar' ? 'إعدادات المسابقة' : 'Competition Settings'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'تواريخ وإعدادات المسابقة' : 'Competition dates and settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'تاريخ بدء التسجيل' : 'Registration Start Date'}</Label>
              <Input
                type="date"
                value={competition.registration_start}
                onChange={(e) => setCompetition({ ...competition, registration_start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'تاريخ نهاية التسجيل' : 'Registration End Date'}</Label>
              <Input
                type="date"
                value={competition.registration_end}
                onChange={(e) => setCompetition({ ...competition, registration_end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'تاريخ المسابقة' : 'Competition Date'}</Label>
              <Input
                type="date"
                value={competition.date}
                onChange={(e) => setCompetition({ ...competition, date: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Registration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {language === 'ar' ? 'إعدادات التسجيل' : 'Registration Settings'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'التحكم في التسجيل والقبول' : 'Control registration and acceptance'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{language === 'ar' ? 'فتح التسجيل' : 'Open Registration'}</Label>
              <Switch
                checked={registration.is_open}
                onCheckedChange={(checked) => setRegistration({ ...registration, is_open: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{language === 'ar' ? 'السماح بتعديل الفرق' : 'Allow Team Editing'}</Label>
              <Switch
                checked={registration.allow_team_editing}
                onCheckedChange={(checked) => setRegistration({ ...registration, allow_team_editing: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{language === 'ar' ? 'القبول التلقائي' : 'Auto Accept Teams'}</Label>
              <Switch
                checked={registration.auto_accept}
                onCheckedChange={(checked) => setRegistration({ ...registration, auto_accept: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'إدارة الإشعارات والتنبيهات' : 'Manage notifications and alerts'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{language === 'ar' ? 'إشعارات البريد' : 'Email Notifications'}</Label>
              <Switch
                checked={notifications.email_enabled}
                onCheckedChange={(checked) => setNotifications({ ...notifications, email_enabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{language === 'ar' ? 'تنبيهات التسجيل الجديد' : 'New Registration Alerts'}</Label>
              <Switch
                checked={notifications.new_registration_alerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, new_registration_alerts: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {language === 'ar' ? 'إعدادات عامة' : 'General Settings'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'إعدادات عامة للنظام' : 'General system settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'اسم المسابقة' : 'Competition Name'}</Label>
              <Input
                value={competition.name}
                onChange={(e) => setCompetition({ ...competition, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الحد الأقصى للفرق' : 'Max Teams'}</Label>
              <Input
                type="number"
                value={competition.max_teams}
                onChange={(e) => setCompetition({ ...competition, max_teams: parseInt(e.target.value) || 50 })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 me-2 animate-spin" />
          ) : (
            <Settings className="w-4 h-4 me-2" />
          )}
          {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;