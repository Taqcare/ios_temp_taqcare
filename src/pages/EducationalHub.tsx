
import React from 'react';
import { PackageOpen, Zap, Shield } from "lucide-react";
import TipCard from '@/components/EducationalHub/TipCard';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";

const EducationalHub = () => {
  const { t } = useLanguage();

  const tips = [
    {
      id: 1,
      title: t('education.tip1.title'),
      description: t('education.tip1.description'),
      icon: <PackageOpen className="h-6 w-6" />,
    },
    {
      id: 2,
      title: t('education.tip2.title'),
      description: t('education.tip2.description'),
      icon: <Zap className="h-6 w-6" />,
    },
    {
      id: 3,
      title: t('education.tip3.title'),
      description: t('education.tip3.description'),
      icon: <Shield className="h-6 w-6" />,
    },
  ];

  return (
    <div className="pb-16 bg-gradient-to-b from-primary-light to-white dark:from-gray-800 dark:to-gray-900 min-h-screen">
      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-ipl-black dark:text-white mb-2">{t('education.title')}</h1>
            <p className="text-gray-600 dark:text-gray-300">{t('education.subtitle')}</p>
          </div>
          
          {/* Seção de vídeo em destaque */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">{t('education.tutorialTitle')}</h2>
            <div className="aspect-w-16 aspect-h-9 shadow-lg rounded-lg overflow-hidden">
              <div className="relative pb-[56.25%] h-0 overflow-hidden max-w-full">
                <iframe 
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/TxiDlW3Km40"
                  title="Tutorial Ivi Air"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen>
                </iframe>
              </div>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
              {t('education.tutorialDesc')}
            </p>
          </div>
          
          {/* Cards de passo a passo */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">{t('education.stepByStepTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tips.map((tip) => (
                <TipCard
                  key={tip.id}
                  title={tip.title}
                  description={tip.description}
                  icon={tip.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default EducationalHub;
