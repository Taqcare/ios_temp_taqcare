
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, CalendarPlus, CheckCircle, XCircle, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserTreatmentSessions, saveTreatmentSession, deleteTreatmentSession, SessionStatus } from "@/services/treatmentSessions";
import { 
  checkForTodaysSessionAndNotify, 
  scheduleUpcomingSessionReminders, 
  scheduleNextSuggestedSessionReminder 
} from "@/services/notifications";
import ProgressGallery, { ProgressGalleryRef } from "@/components/ProgressGallery";

// Types
type SessionType = 'scheduled' | 'completed' | 'missed';

interface SpecialDay {
  date: Date;
  type: SessionType;
}

const TreatmentPlanner = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [photoGalleryOpen, setPhotoGalleryOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState<Date | null>(null);
  const progressGalleryRef = useRef<ProgressGalleryRef>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  
  // Fetch user's treatment sessions from Supabase
  const { data: userSessions, isLoading } = useQuery({
    queryKey: ['treatmentSessions', user?.id],
    queryFn: () => user?.id ? getUserTreatmentSessions(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  // Convert fetched sessions to SpecialDay format for rendering
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  
  // Update specialDays when user sessions are loaded
  useEffect(() => {
    if (userSessions && userSessions.length > 0) {
      const formattedSessions: SpecialDay[] = userSessions.map(session => {
        // Create a new date object from the session_date string
        // This fixes timezone issues by ensuring we don't lose the date during conversion
        const dateStr = session.session_date as string;
        const [year, month, day] = dateStr.split('-').map(Number);
        const sessionDate = new Date(year, month - 1, day); // month is 0-indexed in JS
        
        return {
          date: sessionDate,
          type: session.status as SessionType
        };
      });
      
      setSpecialDays(formattedSessions);
      
      // Check if there's a session today and send notifications
      checkForTodaysSessionAndNotify(formattedSessions);
      
      // Agendar lembretes para próximas sessões
      scheduleUpcomingSessionReminders(formattedSessions);
      
      // Verificar sessões completadas recentes para sugerir próxima
      const recentCompletedSessions = formattedSessions
        .filter(day => day.type === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (recentCompletedSessions.length > 0) {
        scheduleNextSuggestedSessionReminder(new Date(recentCompletedSessions[0].date));
      }
    }
  }, [userSessions]);

  // Save session mutation
  const saveMutation = useMutation({
    mutationFn: (sessionData: { date: Date; type: SessionStatus }) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return saveTreatmentSession({
        user_id: user.id,
        session_date: sessionData.date,
        status: sessionData.type,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch sessions after mutation
      queryClient.invalidateQueries({ queryKey: ['treatmentSessions', user?.id] });
    },
    onError: (error) => {
      console.error("Failed to save session:", error);
      toast.error("Failed to save session", {
        description: "Please try again later"
      });
    }
  });

  // Delete session mutation
  const deleteMutation = useMutation({
    mutationFn: (date: Date) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return deleteTreatmentSession(user.id, date);
    },
    onSuccess: () => {
      // Invalidate and refetch sessions after mutation
      queryClient.invalidateQueries({ queryKey: ['treatmentSessions', user?.id] });
    },
    onError: (error) => {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session", {
        description: "Please try again later"
      });
    }
  });

  // Helper to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  const handleOpenPhotoGallery = () => {
    progressGalleryRef.current?.openAddPhotoDrawer();
  };

  const handleSessionStatusChange = (type: SessionType) => {
    if (!currentDay || !user?.id) return;
    
    // Find if this day already has a status
    const existingDayIndex = specialDays.findIndex(
      (day) => isSameDay(day.date, currentDay)
    );
    
    // Create a copy of the array to modify
    let updatedDays = [...specialDays];
    
    if (existingDayIndex !== -1) {
      // Update existing day
      updatedDays[existingDayIndex] = { 
        ...updatedDays[existingDayIndex], 
        type 
      };
    } else {
      // Add new day
      updatedDays.push({
        date: currentDay,
        type,
      });
    }
    
    // Update local state immediately for UI feedback
    setSpecialDays(updatedDays);
    
    // Save to Supabase
    saveMutation.mutate({ date: currentDay, type });
    
    // Show appropriate message based on session type
    const messages = {
      scheduled: t('schedule.sessionScheduled'),
      completed: t('schedule.sessionCompleted'),
      missed: t('schedule.sessionMissed'),
    };
    
    // Show a toast notification based on the session type
    if (type === 'completed') {
      toast.success(messages[type] || "Status atualizado", {
        description: `${t('schedule.selectedDate')} ${format(currentDay, 'dd/MM/yyyy')}`,
        action: {
          label: t('schedule.addPhoto'),
          onClick: handleOpenPhotoGallery
        },
        icon: <ImagePlus className="h-4 w-4" />,
        duration: 8000, // Show for longer (8 seconds) to give user time to click
      });
      
      // Agendar lembrete para próxima sessão sugerida
      scheduleNextSuggestedSessionReminder(currentDay);
    } else if (type === 'scheduled') {
      toast.success(messages[type] || "Status atualizado", {
        description: `${t('schedule.selectedDate')} ${format(currentDay, 'dd/MM/yyyy')}`
      });
      
      // Agendar lembretes para esta sessão
      scheduleUpcomingSessionReminders(updatedDays);
    } else {
      toast.success(messages[type] || "Status atualizado", {
        description: `${t('schedule.selectedDate')} ${format(currentDay, 'dd/MM/yyyy')}`
      });
    }
    
    setDialogOpen(false);
  };

  // New function to clear a session
  const handleClearSession = () => {
    if (!currentDay || !user?.id) return;
    
    // Find if this day has a status
    const existingDayIndex = specialDays.findIndex(
      (day) => isSameDay(day.date, currentDay)
    );
    
    // If there's no session for this day, simply close the dialog
    if (existingDayIndex === -1) {
      setDialogOpen(false);
      return;
    }
    
    // Create a copy of the array to modify
    let updatedDays = [...specialDays];
    
    // Remove the day from the local state
    updatedDays = updatedDays.filter((day) => !isSameDay(day.date, currentDay));
    
    // Update local state immediately for UI feedback
    setSpecialDays(updatedDays);
    
    // Delete from Supabase
    deleteMutation.mutate(currentDay);
    
    // Show a success toast
    toast.success(t('schedule.statusRemoved'), {
      description: `${t('schedule.selectedDate')} ${format(currentDay, 'dd/MM/yyyy')}`
    });
    
    setDialogOpen(false);
  };
  
  // Custom day renderer for the calendar
  const renderDay = (day: Date) => {
    const specialDay = specialDays.find((sd) => isSameDay(sd.date, day));
    
    if (!specialDay) return null;
    
    // Based on the session type, render appropriate indicator
    switch(specialDay.type) {
      case 'scheduled':
        return <div className="absolute bottom-0 left-0 w-full flex justify-center">
          <CalendarPlus size={12} className="text-blue-500" />
        </div>;
      case 'completed':
        return <div className="absolute bottom-0 left-0 w-full flex justify-center">
          <CheckCircle size={12} className="text-green-500" />
        </div>;
      case 'missed':
        return <div className="absolute bottom-0 left-0 w-full flex justify-center">
          <XCircle size={12} className="text-red-500" />
        </div>;
      default:
        return null;
    }
  };

  // Handle date click to open the dialog
  const handleDateClick = (day: Date | undefined) => {
    if (day) {
      // Create a new date with the same year, month, and day to avoid timezone issues
      const selectedDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      setCurrentDay(selectedDay);
      setDialogOpen(true);
    }
  };

  // Get the appropriate locale for date formatting
  const dateLocale = language === 'en' ? enUS : ptBR;

  return (
    <>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {t('schedule.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="w-full flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  // Create a new date with the same year, month, and day to avoid timezone issues
                  const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                  setSelectedDate(newDate);
                  handleDateClick(newDate);
                }
              }}
              className="rounded-md border shadow-sm w-full max-w-sm"
              locale={dateLocale}
              formatters={{
                formatCaption: (date, options) => {
                  return format(date, 'MMMM yyyy', { locale: dateLocale });
                },
              }}
              components={{
                DayContent: (props) => {
                  return (
                    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                      <span className="pointer-events-none">{props.date.getDate()}</span>
                      {renderDay(props.date)}
                    </div>
                  );
                },
              }}
              showOutsideDays={true}
              disabled={{ before: new Date(2023, 0, 1) }}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm">{t('schedule.scheduled')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">{t('schedule.completed')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">{t('schedule.missed')}</span>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('schedule.manage')}</DialogTitle>
            <DialogDescription>
              {currentDay ? `${t('schedule.selectedDate')} ${format(currentDay, 'dd/MM/yyyy')}` : t('schedule.selectOption')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="flex gap-2 items-center justify-start text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => handleSessionStatusChange('scheduled')}
              >
                <CalendarPlus size={16} />
                <span>{t('schedule.scheduleSession')}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex gap-2 items-center justify-start text-green-500 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleSessionStatusChange('completed')}
              >
                <CheckCircle size={16} />
                <span>{t('schedule.markCompleted')}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex gap-2 items-center justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleSessionStatusChange('missed')}
              >
                <XCircle size={16} />
                <span>{t('schedule.markMissed')}</span>
              </Button>

              <Button 
                variant="outline" 
                className="flex gap-2 items-center justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                onClick={handleClearSession}
              >
                <Trash2 size={16} />
                <span>{t('schedule.clearStatus')}</span>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('schedule.cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Gallery Dialog */}
      <Dialog open={photoGalleryOpen} onOpenChange={setPhotoGalleryOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImagePlus className="w-5 h-5" />
              Galeria de Progresso
            </DialogTitle>
            <DialogDescription>
              Adicione fotos para acompanhar seu progresso no tratamento
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProgressGallery ref={progressGalleryRef} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TreatmentPlanner;
