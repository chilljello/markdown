import React, { useState, useEffect } from 'react';
import HomePage from '@/app/page';
import DocPage from '@/app/doc';

type Route = 'home' | 'doc';

export function Router() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/doc') {
        setCurrentRoute('doc');
      } else {
        setCurrentRoute('home');
      }
    };

    // Set initial route based on current path
    const path = window.location.pathname;
    if (path === '/doc') {
      setCurrentRoute('doc');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation function
  const navigate = (route: Route) => {
    setCurrentRoute(route);
    if (route === 'doc') {
      window.history.pushState({}, '', '/doc');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  // Render current route
  switch (currentRoute) {
    case 'doc':
      return <DocPage onNavigate={navigate} />;
    case 'home':
    default:
      return <HomePage onNavigate={navigate} />;
  }
}
