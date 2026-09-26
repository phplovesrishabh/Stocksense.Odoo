import React, { useState, useEffect } from 'react';
import { Camera, Loader2, User, Save, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';

export default function ProfilePage() {
  const { user, initialize } = useAuthStore();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      setMessage({ type: '', text: '' });
      
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Update auth user metadata (for avatar)
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });
      if (authError) throw authError;

      // Update user_profiles (for full name)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Refresh global state
      if (initialize) {
        await initialize();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto w-full flex-1 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-brand-primary" />
          <span className="text-gradient">My Profile</span>
        </h1>
        <p className="text-text-secondary mt-2">Manage your account settings and profile information.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card rounded-2xl p-8"
      >
        {message.text && (
          <div className={`p-4 rounded-xl mb-8 text-sm font-medium ${message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-8">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center border-4 border-background-dark shadow-xl shadow-brand-primary/20">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-full cursor-pointer backdrop-blur-sm">
                <Camera className="w-8 h-8 text-white drop-shadow-md" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            
            <div>
              <h3 className="font-heading font-semibold text-lg text-white">Profile Photo</h3>
              <p className="text-sm text-text-secondary mt-1">JPG, GIF or PNG. Max size 5MB.</p>
              {uploading && (
                <div className="flex items-center gap-2 mt-3 text-sm font-medium text-brand-primary">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Details Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider ml-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-text-secondary cursor-not-allowed font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider ml-1">
                Role
              </label>
              <input
                type="text"
                value={user?.role === 'manager' ? 'Manager' : 'Staff'}
                disabled
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-text-secondary cursor-not-allowed font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-brand-primary uppercase tracking-wider ml-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full glass-input px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
