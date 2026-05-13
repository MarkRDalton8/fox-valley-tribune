'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SubscribeRibbon from './SubscribeRibbon';
import EventBanner from './EventBanner';

const CEO_PAGES = new Set(['/', '/news']);

export default function SmartBanner() {
  const pathname = usePathname();
  const [banner, setBanner] = useState('subscribe'); // 'subscribe' | 'event'

  const isTargetPage = CEO_PAGES.has(pathname);

  useEffect(() => {
    if (!isTargetPage) return;

    const tp = window.tp || [];
    tp.push(['init', async function () {
      const user = window.tp?.pianoId?.getUser?.();
      if (!user?.uid) return;

      try {
        const res = await fetch(`/api/piano-profile?uid=${user.uid}`);
        const data = await res.json();
        const raw = data.custom_fields?.job_level;
        if (!raw) return;

        // Decode JSON-array format stored by Piano: '["CEO"]' → 'CEO'
        let jobLevel = raw;
        try {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length) jobLevel = arr[0];
        } catch {}

        if (jobLevel === 'CEO') setBanner('event');
      } catch {}
    }]);
  }, [isTargetPage]);

  if (isTargetPage && banner === 'event') return <EventBanner />;
  return <SubscribeRibbon />;
}
