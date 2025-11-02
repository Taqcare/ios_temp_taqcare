
import React from 'react';
import { Card } from "@/components/ui/card";
import { Bell, Moon, Globe, ChevronRight, User } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

const PreferencesSection = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState(true);
  const [languageOpen, setLanguageOpen] = React.useState(false);

  const handleToggleDarkMode = (checked: boolean) => {
    toggleTheme();
    const message = checked 
      ? (language === 'pt' ? "Modo escuro ativado!" : "Dark mode activated!")
      : (language === 'pt' ? "Modo claro ativado!" : "Light mode activated!");
    
    toast.success(message);
  };

  const toggleNotifications = (checked: boolean) => {
    setNotifications(checked);
    toast.success(checked ? t('toast.notificationsOn') : t('toast.notificationsOff'));
  };

  const changeLanguage = (lang: 'pt' | 'en') => {
    setLanguage(lang);
    setLanguageOpen(false);
    toast.success(t('toast.languageChanged'));
  };

  const languages = [
    { code: 'pt' as const, name: 'Português (Brasil)' },
    { code: 'en' as const, name: 'English (US)' }
  ];

  return (
    <>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-6 mb-2">{t('preferences.title')}</h3>

      {/* Skin Info Card */}
      <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <Button 
          variant="ghost" 
          className="w-full py-4 px-4 flex items-center justify-between gap-4 text-sm font-normal hover:bg-gray-50 dark:hover:bg-gray-700 rounded-none border-0 h-auto"
          onClick={() => navigate('/profile/skin-info')}
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary-light dark:bg-primary-dark rounded-full p-2">
              <User className="w-5 h-5 text-primary dark:text-[#F8FAFB]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Informações da Pele</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Tom de pele e cor do cabelo</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Button>
      </Card>

      {/* Notifications Card */}
      <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary-light dark:bg-primary-dark rounded-full p-2">
              <Bell className="w-5 h-5 text-primary dark:text-[#F8FAFB]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('preferences.notifications')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('preferences.notificationsDesc')}</p>
            </div>
          </div>
          <Switch 
            checked={notifications} 
            onCheckedChange={toggleNotifications}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </Card>

      {/* Dark Mode Card */}
      <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary-light dark:bg-primary-dark rounded-full p-2">
              <Moon className="w-5 h-5 text-primary dark:text-[#F8FAFB]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('preferences.theme')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('preferences.themeDesc')}</p>
            </div>
          </div>
          <Switch 
            checked={theme === 'dark'} 
            onCheckedChange={handleToggleDarkMode}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </Card>

      {/* Language Card */}
      <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full py-4 px-4 flex items-center justify-between gap-4 text-sm font-normal hover:bg-gray-50 dark:hover:bg-gray-700 rounded-none border-0 h-auto"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary-light dark:bg-primary-dark rounded-full p-2">
                  <Globe className="w-5 h-5 text-primary dark:text-[#F8FAFB]" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('preferences.language')}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'pt' ? 'Português (Brasil)' : 
                     language === 'en' ? 'English (US)' : 
                     language}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-0 bg-white dark:bg-gray-800 border rounded-lg shadow-lg">
            <div className="p-2">
              <h3 className="text-sm font-semibold p-2 border-b dark:border-gray-700 mb-1 dark:text-gray-200">{t('language.select')}</h3>
              <div className="space-y-1">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    className={`w-full justify-start px-2 py-1.5 text-sm dark:text-gray-200 dark:hover:bg-gray-700 ${language === lang.code ? 'bg-primary-light dark:bg-primary-dark text-primary font-medium' : ''}`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    {lang.name}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </Card>
    </>
  );
};

export default PreferencesSection;
