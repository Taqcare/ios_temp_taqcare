
export type SkinTone = 
  | 'branco' | 'bege' 
  | 'castanho-claro' | 'castanho-medio' | 'castanho-escuro' 
  | 'castanho-muito-escuro';

export type HairColor = 
  | 'preto' | 'castanho-escuro' | 'castanho-medio' 
  | 'castanho-claro' | 'loiro' | 'ruivo';

interface IplIntensityRecommendation {
  initialIntensity: string;
  maxIntensity: string;
  observations: string;
  isRecommended: boolean;
}

export const getIplIntensityRecommendation = (
  skinTone: SkinTone, 
  hairColor: HairColor
): IplIntensityRecommendation => {
  // Map skin tones to Fitzpatrick scale categories
  const skinToneMap: Record<SkinTone, string> = {
    'branco': 'I-II',
    'bege': 'III',
    'castanho-claro': 'IV',
    'castanho-medio': 'V',
    'castanho-escuro': 'VI',
    'castanho-muito-escuro': 'VI'
  };

  const mappedSkin = skinToneMap[skinTone] || 'III';

  // Check for non-recommended combinations first
  if (skinTone === 'castanho-muito-escuro') {
    return {
      initialIntensity: 'Não recomendado',
      maxIntensity: 'Não recomendado',
      observations: 'Tons bem escuros. ❌ Não recomendado para esse tom de pele. Consulte um dermatologista para alternativas seguras.',
      isRecommended: false
    };
  }

  if (hairColor === 'loiro' || hairColor === 'ruivo') {
    return {
      initialIntensity: 'Não recomendado',
      maxIntensity: 'Não recomendado',
      observations: 'Baixa eficácia em cabelos claros. Considere outros métodos de depilação.',
      isRecommended: false
    };
  }

  // Intensity recommendations based on skin tone and hair color - Updated according to reference image
  const intensityMatrix: Record<string, Record<string, IplIntensityRecommendation>> = {
    'I-II': { // Branco - Nível 5-6
      'preto': {
        initialIntensity: 'Nível 5',
        maxIntensity: 'Nível 6',
        observations: 'Pele extremamente sensível ao sol. Comece no nível 5 e aumente para 6 após 2-3 sessões.',
        isRecommended: true
      },
      'castanho-escuro': {
        initialIntensity: 'Nível 5',
        maxIntensity: 'Nível 6',
        observations: 'Pele muito clara. Evite exposição solar e monitore reações.',
        isRecommended: true
      },
      'castanho-medio': {
        initialIntensity: 'Nível 5',
        maxIntensity: 'Nível 6',
        observations: 'Use protetor solar sempre. Aumente gradualmente.',
        isRecommended: true
      },
      'castanho-claro': {
        initialIntensity: 'Nível 4',
        maxIntensity: 'Nível 5',
        observations: 'Eficácia pode ser limitada em cabelos mais claros.',
        isRecommended: true
      }
    },
    'III': { // Bege - Nível 4-5
      'preto': {
        initialIntensity: 'Nível 4',
        maxIntensity: 'Nível 5',
        observations: 'Sensível ao sol, pode ficar levemente bronzeada. Evite exposição solar.',
        isRecommended: true
      },
      'castanho-escuro': {
        initialIntensity: 'Nível 4',
        maxIntensity: 'Nível 5',
        observations: 'Queima com facilidade. Use com cuidado e proteção solar.',
        isRecommended: true
      },
      'castanho-medio': {
        initialIntensity: 'Nível 4',
        maxIntensity: 'Nível 5',
        observations: 'Proceda com cautela, aumentando gradualmente.',
        isRecommended: true
      },
      'castanho-claro': {
        initialIntensity: 'Nível 3',
        maxIntensity: 'Nível 4',
        observations: 'Eficácia limitada em cabelos mais claros.',
        isRecommended: true
      }
    },
    'IV': { // Castanho claro - Nível 3-4
      'preto': {
        initialIntensity: 'Nível 3',
        maxIntensity: 'Nível 4',
        observations: 'Bronzeia gradualmente e queima pouco. Teste em pequena área primeiro.',
        isRecommended: true
      },
      'castanho-escuro': {
        initialIntensity: 'Nível 3',
        maxIntensity: 'Nível 4',
        observations: 'Use com cautela. Monitore reações da pele.',
        isRecommended: true
      },
      'castanho-medio': {
        initialIntensity: 'Nível 3',
        maxIntensity: 'Nível 4',
        observations: 'Bronzeia com facilidade e quase nunca queima.',
        isRecommended: true
      },
      'castanho-claro': {
        initialIntensity: 'Nível 2',
        maxIntensity: 'Nível 3',
        observations: 'Eficácia pode ser limitada. Monitore resultados.',
        isRecommended: true
      }
    },
    'V': { // Castanho médio - Nível 2-3
      'preto': {
        initialIntensity: 'Nível 2',
        maxIntensity: 'Nível 3',
        observations: 'Bronzeia com facilidade e quase nunca queima. Use com cautela.',
        isRecommended: true
      },
      'castanho-escuro': {
        initialIntensity: 'Nível 2',
        maxIntensity: 'Nível 3',
        observations: 'Use com extrema cautela, preferindo sessões mais espaçadas.',
        isRecommended: true
      },
      'castanho-medio': {
        initialIntensity: 'Nível 2',
        maxIntensity: 'Nível 3',
        observations: 'Monitore cuidadosamente para evitar hiperpigmentação.',
        isRecommended: true
      },
      'castanho-claro': {
        initialIntensity: 'Nível 1',
        maxIntensity: 'Nível 2',
        observations: 'Eficácia limitada. Considere consulta profissional.',
        isRecommended: true
      }
    },
    'VI': { // Castanho escuro e muito escuro - Nível 1-2 ou não recomendado
      'preto': {
        initialIntensity: 'Nível 1',
        maxIntensity: 'Nível 2',
        observations: 'Naturalmente bronzeada, raramente queima. Use intensidade mínima.',
        isRecommended: true
      },
      'castanho-escuro': {
        initialIntensity: 'Nível 1',
        maxIntensity: 'Nível 2',
        observations: 'Pele escura. Use com extrema cautela e supervisão profissional.',
        isRecommended: true
      },
      'castanho-medio': {
        initialIntensity: 'Nível 1',
        maxIntensity: 'Nível 1',
        observations: 'Alto risco de hiperpigmentação. Consulte um dermatologista.',
        isRecommended: true
      },
      'castanho-claro': {
        initialIntensity: 'Não recomendado',
        maxIntensity: 'Não recomendado',
        observations: 'Risco muito alto. Consulte um dermatologista.',
        isRecommended: false
      }
    }
  };

  // Default fallback
  const defaultRecommendation: IplIntensityRecommendation = {
    initialIntensity: 'Nível 1',
    maxIntensity: 'Nível 2',
    observations: 'Proceda com cautela. Consulte um profissional para orientação personalizada.',
    isRecommended: true
  };

  try {
    return intensityMatrix[mappedSkin]?.[hairColor] || defaultRecommendation;
  } catch (error) {
    console.error("Error calculating IPL intensity:", error);
    return defaultRecommendation;
  }
};
