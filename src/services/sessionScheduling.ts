import { addDays } from 'date-fns';

// Novo sistema: 2 sessões por semana (intervalo de 3-4 dias)
export const SESSIONS_PER_WEEK = 2;
export const DAYS_BETWEEN_SESSIONS = 3; // 3 dias entre sessões (2x por semana)
export const TOTAL_SESSIONS = 24; // 3 meses × 8 sessões por mês
export const TOTAL_WEEKS = 12; // 3 meses

// Calcula a próxima data de sessão baseada na última sessão completada
export const calculateNextSessionDate = (lastSessionDate?: Date | string): Date => {
  if (!lastSessionDate) {
    // Se não há sessão anterior, começar amanhã
    return addDays(new Date(), 1);
  }
  
  const lastDate = new Date(lastSessionDate);
  // Próxima sessão: 3 dias após a última
  return addDays(lastDate, DAYS_BETWEEN_SESSIONS);
};

// Gera cronograma sugerido para as próximas sessões
export const generateSessionSchedule = (
  startDate: Date = new Date(),
  sessionsCount: number = TOTAL_SESSIONS
): Date[] => {
  const schedule: Date[] = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < sessionsCount; i++) {
    schedule.push(new Date(currentDate));
    currentDate = addDays(currentDate, DAYS_BETWEEN_SESSIONS);
  }
  
  return schedule;
};

// Calcula quantas sessões devem ter sido feitas até hoje
export const getExpectedSessionsUntilToday = (
  startDate: Date,
  currentDate: Date = new Date()
): number => {
  const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const expectedSessions = Math.floor(daysDiff / DAYS_BETWEEN_SESSIONS) + 1;
  return Math.min(expectedSessions, TOTAL_SESSIONS);
};

// Verifica se o usuário está em dia com as sessões
export const isUserOnTrack = (
  completedSessions: number,
  startDate: Date,
  currentDate: Date = new Date()
): { onTrack: boolean; sessionsAhead: number; sessionsBehind: number } => {
  const expectedSessions = getExpectedSessionsUntilToday(startDate, currentDate);
  const difference = completedSessions - expectedSessions;
  
  return {
    onTrack: difference >= -1, // Permite 1 sessão de atraso
    sessionsAhead: Math.max(0, difference),
    sessionsBehind: Math.max(0, -difference)
  };
};