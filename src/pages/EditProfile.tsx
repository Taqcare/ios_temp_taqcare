
import React from 'react';
import EditProfileForm from '@/components/Profile/EditProfileForm';
import { useLanguage } from '@/contexts/LanguageContext';

const EditProfile = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 sm:py-8 pb-20">
        <div className="space-y-4 max-w-md mx-auto">
          <header className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('editProfile.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('editProfile.subtitle')}</p>
          </header>
          <EditProfileForm />
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
