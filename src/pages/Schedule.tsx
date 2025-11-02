
import React from 'react';
import TreatmentPlanner from '@/components/Schedule/TreatmentPlanner';
import IplIntensityGuide from '@/components/Profile/IplIntensityGuide';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const Schedule = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6 sm:py-8 pb-20 flex justify-center">
          <div className="w-full max-w-2xl space-y-6">
            <TreatmentPlanner />
            <IplIntensityGuide />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default Schedule;
