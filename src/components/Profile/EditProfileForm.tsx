
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import PersonalInfoForm from './PersonalInfoForm';
import PasswordChangeForm from './PasswordChangeForm';
import DeleteAccountSection from './DeleteAccountSection';

const EditProfileForm = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="pl-0 mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={() => navigate('/profile')}
      >
        <ArrowLeft size={16} />
        {t('editProfile.back')}
      </Button>

      <PersonalInfoForm />
      <PasswordChangeForm />
      <DeleteAccountSection />
    </div>
  );
};

export default EditProfileForm;
