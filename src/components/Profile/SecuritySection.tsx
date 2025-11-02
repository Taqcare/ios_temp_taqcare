
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Shield, HelpCircle, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import HelpSection from "@/components/HelpSection";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";

const SecuritySection = () => {
  const { t } = useLanguage();
  const [helpOpen, setHelpOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-6 mb-2">{t('security.title')}</h3>

      {/* Privacy Policy Card */}
      <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <Button 
          variant="ghost"
          onClick={() => setPrivacyOpen(true)}
          className="w-full py-4 px-4 flex items-center justify-between gap-4 text-sm font-normal hover:bg-gray-50 dark:hover:bg-gray-700 rounded-none border-0 h-auto"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary-light dark:bg-primary-dark rounded-full p-2">
              <Shield className="w-5 h-5 text-primary dark:text-[#F8FAFB]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('profile.privacy')}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('profile.privacyDesc')}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </Button>
        
        <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-200">{t('privacy.title')}</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                {t('privacy.lastUpdate')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <h4 className="text-sm font-medium dark:text-gray-200">{t('privacy.infoCollected')}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('privacy.infoCollectedDesc')}
              </p>
              
              <h4 className="text-sm font-medium dark:text-gray-200">{t('privacy.infoUsage')}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('privacy.infoUsageDesc')}
              </p>
              
              <h4 className="text-sm font-medium dark:text-gray-200">{t('privacy.sharing')}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('privacy.sharingDesc')}
              </p>
              
              <h4 className="text-sm font-medium dark:text-gray-200">{t('privacy.security')}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('privacy.securityDesc')}
              </p>
              
              <h4 className="text-sm font-medium dark:text-gray-200">{t('privacy.rights')}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('privacy.rightsDesc')}
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setPrivacyOpen(false)} className="bg-primary hover:bg-primary/90 text-white">{t('privacy.close')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Help Center Card */}
      <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <Button 
          variant="ghost"
          onClick={() => setHelpOpen(true)}
          className="w-full py-4 px-4 flex items-center justify-between gap-4 text-sm font-normal hover:bg-gray-50 dark:hover:bg-gray-700 rounded-none border-0 h-auto"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary-light dark:bg-primary-dark rounded-full p-2">
              <HelpCircle className="w-5 h-5 text-primary dark:text-[#F8FAFB]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('profile.help')}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('profile.helpDesc')}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </Button>
        <HelpSection isOpen={helpOpen} onOpenChange={setHelpOpen} />
      </Card>

      {/* About App Card */}
      <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-xl mb-16">
        <Button 
          variant="ghost"
          onClick={() => setAboutOpen(true)}
          className="w-full py-4 px-4 flex items-center justify-between gap-4 text-sm font-normal hover:bg-gray-50 dark:hover:bg-gray-700 rounded-none border-0 h-auto"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary-light dark:bg-primary-dark rounded-full p-2">
              <Info className="w-5 h-5 text-primary dark:text-[#F8FAFB]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('profile.about')}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('about.version')}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </Button>
        
        <Sheet open={aboutOpen} onOpenChange={setAboutOpen}>
          <SheetContent className="sm:max-w-md bg-white dark:bg-gray-800">
            <SheetHeader>
              <SheetTitle className="dark:text-gray-200">Sobre Taqcare</SheetTitle>
              <SheetDescription className="dark:text-gray-400">{t('about.version')}</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 py-6">
              <div className="flex justify-center mb-6">
                <div className="bg-primary-light dark:bg-primary-dark rounded-full p-6">
                  <Info className="w-12 h-12 text-primary dark:text-[#F8FAFB]" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium dark:text-gray-200">{t('about.developedBy')}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Taqcare Team</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium dark:text-gray-200">{t('about.year')}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('about.yearValue')}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium dark:text-gray-200">{t('about.contact')}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">contato@taqcare.com</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium dark:text-gray-200">{t('about.description')}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Taqcare é seu aplicativo completo para tratamentos de depilação IPL, oferecendo orientação personalizada e acompanhamento do seu progresso.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium dark:text-gray-200">{t('about.license')}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('about.licenseText')}</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </Card>
    </>
  );
};

export default SecuritySection;
