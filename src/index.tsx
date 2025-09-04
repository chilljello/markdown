import React from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from './components/router';
import './styles/main.scss';

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Router />);
}
