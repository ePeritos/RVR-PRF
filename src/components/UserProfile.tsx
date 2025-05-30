
import React, { useState } from 'react';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';
import { useProfile } from '@/hooks/useProfile';

export const UserProfile = () => {
  const [open, setOpen] = useState(false);
  const { profile, setProfile, loading, saveProfile } = useProfile();

  const handleEditProfile = () => {
    console.log('Clicou em editar perfil - abrindo dialog');
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveProfile(profile);
    if (success) {
      setOpen(false);
    }
  };

  return (
    <>
      <UserProfileDropdown 
        profile={profile} 
        onEditProfile={handleEditProfile} 
      />
      
      <ProfileEditDialog
        open={open}
        onOpenChange={setOpen}
        profile={profile}
        setProfile={setProfile}
        onSave={handleSave}
        loading={loading}
      />
    </>
  );
};
