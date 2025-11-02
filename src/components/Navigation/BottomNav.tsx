
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, BookOpen, User, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useLanguage();

  const navItems = [
    {
      name: t('nav.dashboard'),
      path: "/dashboard",
      icon: <Home className="h-6 w-6" />,
    },
    {
      name: t('nav.schedule'),
      path: "/schedule",
      icon: <CalendarDays className="h-6 w-6" />,
    },
    {
      name: "Recompensas",
      path: "/rewards",
      icon: <Gift className="h-6 w-6" />,
    },
    {
      name: t('nav.education'),
      path: "/education",
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      name: t('nav.profile'),
      path: "/profile",
      icon: <User className="h-6 w-6" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentPath === item.path
                ? "text-primary dark:text-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
