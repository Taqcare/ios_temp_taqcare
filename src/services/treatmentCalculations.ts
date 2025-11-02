
export type SkinTone = 
  | 'branco' | 'bege' 
  | 'castanho-claro' | 'castanho-medio' | 'castanho-escuro' 
  | 'castanho-muito-escuro';

export type HairColor = 
  | 'preto' | 'castanho-escuro' | 'castanho-medio' 
  | 'castanho-claro' | 'loiro' | 'ruivo';

interface TreatmentCalculation {
  sessions: number;
  progressPerSession: number;
  efficacy: number; // Percentage of expected hair reduction (0-100)
}

export const getTreatmentCalculation = (
  skinTone: SkinTone, 
  hairColor: HairColor
): TreatmentCalculation => {
  // Novo sistema: 24 sessões (2x por semana durante 3 meses)
  // Progresso fixo por sessão: 100% / 24 = ~4.17%
  const defaultCalculation: TreatmentCalculation = {
    sessions: 24,
    progressPerSession: 4.17,
    efficacy: 80
  };

  // Map skin tones to more manageable values
  const skinToneMap: Record<SkinTone, string> = {
    'branco': 'light',
    'bege': 'light',
    'castanho-claro': 'medium-light',
    'castanho-medio': 'medium',
    'castanho-escuro': 'dark',
    'castanho-muito-escuro': 'very-dark'
  };

  // Map hair colors to more manageable values
  const hairColorMap: Record<HairColor, string> = {
    'preto': 'black',
    'castanho-escuro': 'dark-brown',
    'castanho-medio': 'medium-brown',
    'castanho-claro': 'light-brown',
    'loiro': 'blonde',
    'ruivo': 'red'
  };

  const mappedSkin = skinToneMap[skinTone] || 'medium';
  const mappedHair = hairColorMap[hairColor] || 'black';

  // Novo sistema: todas as combinações têm 24 sessões, apenas a eficácia varia
  const treatmentMatrix: Record<string, Record<string, TreatmentCalculation>> = {
    'light': {
      'black': { sessions: 24, progressPerSession: 4.17, efficacy: 95 },
      'dark-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 90 },
      'medium-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 85 },
      'light-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 80 },
      'blonde': { sessions: 24, progressPerSession: 4.17, efficacy: 75 },
      'red': { sessions: 24, progressPerSession: 4.17, efficacy: 70 }
    },
    'medium-light': {
      'black': { sessions: 24, progressPerSession: 4.17, efficacy: 90 },
      'dark-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 85 },
      'medium-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 80 },
      'light-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 75 },
      'blonde': { sessions: 24, progressPerSession: 4.17, efficacy: 70 },
      'red': { sessions: 24, progressPerSession: 4.17, efficacy: 65 }
    },
    'medium': {
      'black': { sessions: 24, progressPerSession: 4.17, efficacy: 85 },
      'dark-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 80 },
      'medium-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 75 },
      'light-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 70 },
      'blonde': { sessions: 24, progressPerSession: 4.17, efficacy: 65 },
      'red': { sessions: 24, progressPerSession: 4.17, efficacy: 60 }
    },
    'dark': {
      'black': { sessions: 24, progressPerSession: 4.17, efficacy: 75 },
      'dark-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 70 },
      'medium-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 65 },
      'light-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 60 },
      'blonde': { sessions: 24, progressPerSession: 4.17, efficacy: 55 },
      'red': { sessions: 24, progressPerSession: 4.17, efficacy: 50 }
    },
    'very-dark': {
      'black': { sessions: 24, progressPerSession: 4.17, efficacy: 20 },
      'dark-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 20 },
      'medium-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 15 },
      'light-brown': { sessions: 24, progressPerSession: 4.17, efficacy: 15 },
      'blonde': { sessions: 24, progressPerSession: 4.17, efficacy: 10 },
      'red': { sessions: 24, progressPerSession: 4.17, efficacy: 10 }
    }
  };

  try {
    return treatmentMatrix[mappedSkin][mappedHair] || defaultCalculation;
  } catch (error) {
    console.error("Error calculating treatment parameters:", error);
    return defaultCalculation;
  }
};

// Get completed sessions from localStorage or fetch from Supabase
export const getCompletedSessionsCount = async (userId: string): Promise<number> => {
  try {
    // Import here to avoid circular dependencies
    const { getUserTreatmentSessions } = await import('./treatmentSessions');
    
    if (!userId) return 0;
    
    const sessions = await getUserTreatmentSessions(userId);
    
    // Count only completed sessions
    return sessions.filter(session => session.status === 'completed').length;
  } catch (error) {
    console.error("Error fetching completed sessions:", error);
    return 0;
  }
};

// Calculate total progress based on completed sessions and progress per session
export const calculateTotalProgress = (
  completedSessions: number,
  progressPerSession: number
): number => {
  return Math.min(100, completedSessions * progressPerSession);
};
