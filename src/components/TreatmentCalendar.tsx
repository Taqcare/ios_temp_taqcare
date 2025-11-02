
import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CalendarDays, Bell, BellPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { format } from 'date-fns';

const TreatmentCalendar = () => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (dates) {
      setSelectedDates(dates);
    }
  };

  const handleReminderToggle = () => {
    if (!reminderEnabled && selectedDates.length > 0) {
      setReminderEnabled(true);
      toast.success("Reminders enabled", {
        description: "You'll receive notifications before your scheduled treatments."
      });
    } else if (reminderEnabled) {
      setReminderEnabled(false);
      toast.info("Reminders disabled");
    } else {
      toast.error("Please select at least one treatment date first");
    }
  };

  const handleAddTreatment = () => {
    // This would open a modal to add a new treatment
    toast.info("Feature coming soon", {
      description: "Treatment scheduling will be available in the next update."
    });
  };

  const getNextTreatmentDate = () => {
    const future = selectedDates.filter(date => date > new Date());
    if (future.length > 0) {
      future.sort((a, b) => a.getTime() - b.getTime());
      return format(future[0], 'MMMM d, yyyy');
    }
    return null;
  };

  const nextDate = getNextTreatmentDate();

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center gap-4">
        <CalendarDays className="w-6 h-6 text-primary" />
        <div>
          <CardTitle>Treatment Schedule</CardTitle>
          <p className="text-sm text-gray-600">Plan your treatment sessions</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="w-full flex justify-center">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={handleDateSelect}
            className="rounded-md border bg-white p-3 pointer-events-auto w-full max-w-sm"
          />
        </div>
        
        {nextDate && (
          <div className="mt-4 p-3 bg-primary-light rounded-md w-full max-w-sm">
            <p className="text-sm font-medium">Next treatment:</p>
            <p className="text-primary font-semibold">{nextDate}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleReminderToggle}
        >
          {reminderEnabled ? <Bell className="mr-2 h-4 w-4" /> : <BellPlus className="mr-2 h-4 w-4" />}
          {reminderEnabled ? "Reminders On" : "Enable Reminders"}
        </Button>
        
        <Button 
          size="sm"
          onClick={handleAddTreatment}
        >
          Schedule Treatment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TreatmentCalendar;
