
import React from 'react';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { useProfile } from '@/hooks/useProfile';

export const UserProfile = () => {
  const { profile } = useProfile();

  return <UserProfileDropdown profile={profile} />;
};
