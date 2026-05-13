'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'fvt_pageviews';

export default function PageViewTracker() {
  useEffect(() => {
    const current = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    localStorage.setItem(STORAGE_KEY, current + 1);
  }, []);

  return null;
}
