
import { Capacitor } from '@capacitor/core';

export interface SessionNotification {
  id: number;
  date: Date;
  title: string;
  body: string;
}

export const scheduleSessionNotification = async (notification: SessionNotification): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      // Request permission to send notifications
      const permissionStatus = await LocalNotifications.requestPermissions();
      if (!permissionStatus.display || permissionStatus.display === 'denied') {
        console.error('Notification permission denied');
        return;
      }
      
      // Create notification options
      const options = {
        notifications: [
          {
            id: notification.id,
            title: notification.title,
            body: notification.body,
            schedule: {
              at: notification.date,
              allowWhileIdle: true,
            }
          }
        ]
      };
      
      // Schedule the notification
      await LocalNotifications.schedule(options);
      console.log('Notification scheduled successfully for date:', notification.date);
    } else {
      // Para web, usar Web Notifications API
      if ('Notification' in window && Notification.permission === 'granted') {
        // Calcular delay até a data desejada
        const delay = notification.date.getTime() - new Date().getTime();
        
        if (delay > 0) {
          setTimeout(() => {
            new Notification(notification.title, {
              body: notification.body,
              icon: '/favicon.ico'
            });
          }, delay);
        }
      }
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

export const cancelSessionNotification = async (notificationId: number): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
      console.log('Notification cancelled successfully, ID:', notificationId);
    }
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

// Nova função para calcular e agendar lembretes da próxima sessão
export const scheduleUpcomingSessionReminders = (specialDays: Array<{date: Date; type: string}>) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Encontrar próximas sessões agendadas
  const upcomingSessions = specialDays
    .filter(day => {
      const sessionDate = new Date(day.date);
      sessionDate.setHours(0, 0, 0, 0);
      return day.type === 'scheduled' && sessionDate > today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (upcomingSessions.length > 0) {
    const nextSession = upcomingSessions[0];
    const nextSessionDate = new Date(nextSession.date);
    
    // Agendar lembretes para 3, 2 e 1 dia antes
    const reminderDays = [3, 2, 1];
    
    reminderDays.forEach((daysBefore, index) => {
      const reminderDate = new Date(nextSessionDate);
      reminderDate.setDate(reminderDate.getDate() - daysBefore);
      reminderDate.setHours(19, 0, 0, 0); // 19:00 (7 PM)
      
      // Só agendar se a data for no futuro
      if (reminderDate > new Date()) {
        const daysText = daysBefore === 1 ? 'amanhã' : `em ${daysBefore} dias`;
        
        scheduleSessionNotification({
          id: 200000 + index, // IDs únicos para lembretes antecipados
          date: reminderDate,
          title: 'Lembrete de Sessão IPL',
          body: `Você tem uma sessão de tratamento agendada para ${daysText}. Prepare-se!`
        });
      }
    });
    
    return true;
  }
  
  return false;
};

// Nova função para agendar lembrete baseado na sugestão do próximo dia
export const scheduleNextSuggestedSessionReminder = (lastCompletedDate: Date) => {
  // Calcular próxima data sugerida (2 sessões por semana = 3 dias entre sessões)
  const nextSuggestedDate = new Date(lastCompletedDate);
  nextSuggestedDate.setDate(nextSuggestedDate.getDate() + 3);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Só agendar se a data sugerida for no futuro
  if (nextSuggestedDate > today) {
    // Agendar lembrete para 1 dia antes da data sugerida (dado o intervalo menor)
    const reminderDate = new Date(nextSuggestedDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(18, 0, 0, 0); // 18:00 (6 PM)
    
    if (reminderDate > new Date()) {
      scheduleSessionNotification({
        id: 300000, // ID único para lembrete de sugestão
        date: reminderDate,
        title: 'Hora da Próxima Sessão!',
        body: `Amanhã é um bom dia para sua próxima sessão de tratamento IPL. Que tal agendar?`
      });
    }
    
    return true;
  }
  
  return false;
};

export const checkForTodaysSessionAndNotify = (specialDays: Array<{date: Date; type: string}>) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  const scheduledSessions = specialDays.filter(day => {
    const sessionDate = new Date(day.date);
    sessionDate.setHours(0, 0, 0, 0);
    return day.type === 'scheduled' && 
           sessionDate.getDate() === today.getDate() &&
           sessionDate.getMonth() === today.getMonth() &&
           sessionDate.getFullYear() === today.getFullYear();
  });
  
  if (scheduledSessions.length > 0) {
    const now = new Date();
    const todayBase = new Date();
    todayBase.setHours(0, 0, 0, 0);
    
    // Schedule multiple notifications throughout the day
    const scheduleTimedNotifications = () => {
      const notificationTimes = [
        new Date(todayBase.getFullYear(), todayBase.getMonth(), todayBase.getDate(), 9, 0, 0, 0),
        new Date(todayBase.getFullYear(), todayBase.getMonth(), todayBase.getDate(), 12, 0, 0, 0),
        new Date(todayBase.getFullYear(), todayBase.getMonth(), todayBase.getDate(), 16, 0, 0, 0),
      ];
      
      notificationTimes.forEach((time, index) => {
        if (time > now) {
          scheduleSessionNotification({
            id: 100000 + index,
            date: time,
            title: 'Sessão de Tratamento Hoje',
            body: 'Você tem uma sessão agendada para hoje. Não esqueça de atualizar seu status após realizá-la.'
          });
        }
      });
    };
    
    // Agendar notificações ao longo do dia
    scheduleTimedNotifications();
    
    // Se todas as notificações já passaram, enviar uma imediatamente
    const lastScheduledTime = new Date(todayBase.getFullYear(), todayBase.getMonth(), todayBase.getDate(), 16, 0, 0, 0);
    if (now > lastScheduledTime) {
      // Agendar notificação imediata (1 minuto a partir de agora)
      const immediateNotification = new Date(now.getTime() + 60000);
      scheduleSessionNotification({
        id: 100100,
        date: immediateNotification,
        title: 'Sessão de Tratamento Hoje',
        body: 'Você tem uma sessão agendada para hoje. Não esqueça de atualizar seu status após realizá-la.'
      });
    }
    
    // Agendar lembretes para próximas sessões
    scheduleUpcomingSessionReminders(specialDays);
    
    return true;
  }
  
  // Mesmo se não houver sessão hoje, verificar próximas sessões
  scheduleUpcomingSessionReminders(specialDays);
  
  // Verificar se há sessões completadas recentes para sugerir próxima
  const recentCompletedSessions = specialDays
    .filter(day => day.type === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (recentCompletedSessions.length > 0) {
    scheduleNextSuggestedSessionReminder(new Date(recentCompletedSessions[0].date));
  }
  
  return false;
};
