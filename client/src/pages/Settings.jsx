import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Bell, 
  LogOut, 
  Check, 
  Sparkles,
  Smartphone,
  Save
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Card3DTilt from '../components/3d/Card3DTilt';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { user, updateProfile, updatePreferences, logout } = useAuth();
  const navigate = useNavigate();

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  // Notification Preferences State
  const [emailNotifs, setEmailNotifs] = useState(user?.preferences?.emailNotifications ?? true);
  const [smsNotifs, setSmsNotifs] = useState(user?.preferences?.smsNotifications ?? false);
  const [defaultReminders, setDefaultReminders] = useState(
    user?.preferences?.defaultReminders || [30, 15, 7, 1]
  );

  const toggleReminder = (days) => {
    setDefaultReminders((prev) =>
      prev.includes(days) ? prev.filter((d) => d !== days) : [...prev, days].sort((a, b) => b - a)
    );
  };

  const onProfileSave = async (data) => {
    setIsSavingProfile(true);
    await updateProfile(data);
    setIsSavingProfile(false);
  };

  const onPreferencesSave = async () => {
    await updatePreferences({
      emailNotifications: emailNotifs,
      smsNotifications: smsNotifs,
      defaultReminders,
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brown-50 tracking-tight">
          Vault & Account <span className="gold-gradient-text">Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-brown-300 mt-1">
          Manage your personal profile and multi-channel notification dispatchers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* 1. Profile Section */}
        <Card3DTilt maxTilt={2} className="glass-card rounded-3xl p-6 sm:p-7 border border-gold-500/20 shadow-3d-card">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-brown-800/80">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-400 shadow-gold-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brown-50">Profile Information</h2>
              <p className="text-xs text-brown-300">Your account identity and primary contact email</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brown-200 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-brown-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="settings-name"
                    {...registerProfile('name')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brown-200 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brown-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="settings-email"
                    disabled
                    {...registerProfile('email')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm opacity-70 cursor-not-allowed"
                    placeholder="jane@example.com"
                  />
                </div>
                <span className="text-[10px] text-brown-400 mt-1 block">
                  Managed via Google Authentication
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                id="save-profile-btn"
                disabled={isSavingProfile}
                className="px-5 py-2.5 rounded-xl text-xs font-bold btn-gold-glow flex items-center gap-2 cursor-pointer shadow-gold-sm"
              >
                {isSavingProfile ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-brown-950/40 border-t-brown-950 rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-brown-950" />
                )}
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </Card3DTilt>

        {/* 2. Notification Preferences */}
        <Card3DTilt maxTilt={2} className="glass-card rounded-3xl p-6 sm:p-7 border border-gold-500/20 shadow-3d-card">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-brown-800/80">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-400 shadow-gold-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brown-50">Notification & Expiry Reminders</h2>
              <p className="text-xs text-brown-300">Choose how and when DocAlert alerts you about upcoming deadlines</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setEmailNotifs(!emailNotifs)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  emailNotifs 
                    ? 'bg-gold-500/10 border-gold-500/40 shadow-gold-sm' 
                    : 'bg-brown-900/40 border-brown-800 hover:border-brown-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brown-100">Email Dispatches</h4>
                    <p className="text-[11px] text-brown-400">Send reminder emails with PDF links</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  emailNotifs ? 'bg-gold-500 border-gold-400 text-brown-950' : 'border-brown-700 bg-brown-950'
                }`}>
                  {emailNotifs && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div 
                onClick={() => setSmsNotifs(!smsNotifs)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  smsNotifs 
                    ? 'bg-gold-500/10 border-gold-500/40 shadow-gold-sm' 
                    : 'bg-brown-900/40 border-brown-800 hover:border-brown-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brown-100">SMS / Push Alerts</h4>
                    <p className="text-[11px] text-brown-400">Urgent mobile notifications</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  smsNotifs ? 'bg-gold-500 border-gold-400 text-brown-950' : 'border-brown-700 bg-brown-950'
                }`}>
                  {smsNotifs && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>

            {/* Default Alert Schedule Chips */}
            <div>
              <label className="block text-xs font-semibold text-brown-200 mb-2">
                Default Reminder Intervals for New Items
              </label>
              <div className="flex flex-wrap gap-2">
                {[60, 30, 15, 7, 3, 1].map((days) => {
                  const isSelected = defaultReminders.includes(days);
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => toggleReminder(days)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-gold-500 text-brown-950 font-bold shadow-gold-sm border border-gold-400'
                          : 'bg-brown-900/70 text-brown-300 border border-gold-500/20 hover:border-gold-500/40'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{days} Days Prior</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                id="save-preferences-btn"
                onClick={onPreferencesSave}
                className="px-5 py-2.5 rounded-xl text-xs font-bold btn-gold-glow flex items-center gap-2 cursor-pointer shadow-gold-sm"
              >
                <Save className="w-3.5 h-3.5 text-brown-950" />
                <span>Save Notification Rules</span>
              </button>
            </div>
          </div>
        </Card3DTilt>

        {/* 3. Account Session */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-red-500/20 shadow-3d-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-red-400">Account Session</h3>
            <p className="text-xs text-brown-400 mt-0.5">
              Safely end your session across this device.
            </p>
          </div>

          <button
            type="button"
            id="settings-logout-btn"
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-950/60 hover:bg-red-950 text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Vault</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
