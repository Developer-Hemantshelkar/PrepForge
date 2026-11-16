import React from 'react';
import { PrepProvider } from '@/context/PrepContext';
import { PrepWorkspace } from '@/components/PrepWorkspace';

export default function HomePage() {
  return (
    <PrepProvider>
      <PrepWorkspace />
    </PrepProvider>
  );
}
