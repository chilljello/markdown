import React, { useState, useEffect } from 'react';
import HomePage from '@/app/page';
import DocPage from '@/app/doc';
import DebugPage from '@/app/debug';

type Route = 'home' | 'doc' | 'debug';

export function Router() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [contentToLoad, setContentToLoad] = useState<string | null>(null);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/doc') {
        setCurrentRoute('doc');
      } else if (path === '/debug') {
        setCurrentRoute('debug');
      } else {
        setCurrentRoute('home');
      }
    };

    // Set initial route based on current path
    const path = window.location.pathname;
    if (path === '/doc') {
      setCurrentRoute('doc');
    } else if (path === '/debug') {
      setCurrentRoute('debug');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation function
  const navigate = (route: Route, content?: string) => {
    setCurrentRoute(route);
    if (content) {
      setContentToLoad(content);
    }
    if (route === 'doc') {
      window.history.pushState({}, '', '/doc');
    } else if (route === 'debug') {
      window.history.pushState({}, '', '/debug');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  // Clear content after it's been passed to prevent re-application
  const handleContentLoaded = () => {
    setContentToLoad(null);
  };

  // Render current route
  switch (currentRoute) {
    case 'doc':
      return <DocPage onNavigate={navigate} />;
    case 'debug':
      return <DebugPage />;
    case 'home':
    default:
      return <HomePage onNavigate={navigate} contentToLoad={contentToLoad} onContentLoaded={handleContentLoaded} />;
  }
}
