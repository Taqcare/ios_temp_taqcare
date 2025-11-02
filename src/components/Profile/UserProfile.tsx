
import React from 'react';
import UserInfo from './UserInfo';
import PreferencesSection from './PreferencesSection';
import SecuritySection from './SecuritySection';
import { useLanguage } from '@/contexts/LanguageContext';

const UserProfile = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('profile.settings')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.personalize')}</p>
      </header>

      {/* Personal Information */}
      <UserInfo />
      
      {/* Preferences Section */}
      <PreferencesSection />
      
      {/* Security Section */}
      <SecuritySection />
    </div>
  );
};

export default UserProfile;
