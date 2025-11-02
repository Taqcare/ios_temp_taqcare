import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '@/contexts/LanguageContext';

const RatingPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const { language } = useLanguage();

  const texts = {
    pt: {
      title: 'Você está gostando do TaqCare?',
      description: 'Sua opinião é muito importante para nós! Avalie nosso app e nos ajude a melhorar.',
      rate: 'Avaliar',
      later: 'Lembrar mais tarde',
      thanks: 'Obrigado pela avaliação!'
    },
    en: {
      title: 'Enjoying TaqCare?',
      description: 'Your opinion matters to us! Rate our app and help us improve.',
      rate: 'Rate Now',
      later: 'Remind me later',
      thanks: 'Thanks for your rating!'
    }
  };

  const t = texts[language] || texts.pt;

  useEffect(() => {
    // Verificar se deve mostrar o prompt
    const hasRated = localStorage.getItem('hasRatedApp');
    const lastPromptDate = localStorage.getItem('lastRatingPromptDate');
    const sessionCount = parseInt(localStorage.getItem('appSessionCount') || '0');
    
    // Incrementar contador de sessões
    localStorage.setItem('appSessionCount', (sessionCount + 1).toString());

    // Mostrar depois de 5 sessões, se não tiver avaliado ainda
    if (!hasRated && sessionCount >= 5) {
      // Se nunca mostrou, ou se já passou 7 dias desde último prompt
      if (!lastPromptDate) {
        setIsOpen(true);
      } else {
        const daysSinceLastPrompt = (Date.now() - parseInt(lastPromptDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastPrompt >= 7) {
          setIsOpen(true);
        }
      }
    }
  }, []);

  const handleStarClick = (star: number) => {
    setSelectedStar(star);
  };

  const handleRate = () => {
    if (selectedStar === 0) return;

    // Marcar como avaliado
    localStorage.setItem('hasRatedApp', 'true');
    
    // Abrir loja apropriada
    const platform = Capacitor.getPlatform();
    let storeUrl = '';

    if (platform === 'android') {
      // Substitua pelo seu package name real
      storeUrl = 'market://details?id=app.lovable.8512ec2f5d474eaaa1c5940dfa732e25';
    } else if (platform === 'ios') {
      // Substitua pelo seu app ID real quando tiver
      storeUrl = 'https://apps.apple.com/app/idYOUR_APP_ID';
    } else {
      // Web fallback
      storeUrl = 'https://www.taqcare.com';
    }

    // Abrir URL
    window.open(storeUrl, '_blank');
    
    setIsOpen(false);
  };

  const handleLater = () => {
    // Salvar data do prompt para mostrar novamente em 7 dias
    localStorage.setItem('lastRatingPromptDate', Date.now().toString());
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {t.title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {t.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center gap-2 py-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                size={40}
                className={`transition-colors ${
                  star <= (hoveredStar || selectedStar)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleRate}
            disabled={selectedStar === 0}
            className="w-full"
          >
            {t.rate}
          </Button>
          <Button
            onClick={handleLater}
            variant="ghost"
            className="w-full"
          >
            {t.later}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingPrompt;
