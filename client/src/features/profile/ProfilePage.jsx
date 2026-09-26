import React, { useState, useEffect } from 'react';
import { Camera, Loader2, User, Save, UploadCloud } from 'lucide-react';
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
    <div className="p-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">My Profile</h1>
        <p className="text-[#94A3B8] mt-1">Manage your account settings and profile information.</p>
      </div>

      <div className="bg-[#1A1D27] border border-[#2E3348] rounded-xl p-8">
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#4F6EF7] to-[#7C3AED] flex items-center justify-center border-4 border-[#252836]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
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
              <h3 className="font-medium text-[#F1F5F9]">Profile Photo</h3>
              <p className="text-sm text-[#94A3B8] mt-1">JPG, GIF or PNG. Max size 5MB.</p>
              {uploading && (
                <div className="flex items-center gap-2 mt-2 text-sm text-[#4F6EF7]">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-[#2E3348] w-full" />

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-[#1A1D27] border border-[#2E3348] rounded-lg px-4 py-2.5 text-[#94A3B8] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                Role
              </label>
              <input
                type="text"
                value={user?.role === 'manager' ? 'Manager' : 'Staff'}
                disabled
                className="w-full bg-[#1A1D27] border border-[#2E3348] rounded-lg px-4 py-2.5 text-[#94A3B8] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F1F5F9] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-[#252836] border border-[#2E3348] rounded-lg px-4 py-2.5 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex items-center gap-2 bg-[#4F6EF7] hover:bg-[#435EE0] disabled:bg-[#4F6EF7]/50 text-white px-6 py-2.5 rounded-lg font-medium transition-all"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
