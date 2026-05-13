'use client';

import { useEffect } from 'react';

/**
 * Runs once on mount for each page load (true MPA — full reloads on every navigation).
 * Sets Piano content metadata before calling tp.experience.execute(), ensuring
 * Composer evaluates experiences with the correct section and tags already in place.
 */
export default function PianoInit({ section, tags = [], contentCreator }) {
  useEffect(() => {
    window.tp = window.tp || [];

    if (section) window.tp.push(['setContentSection', section]);
    if (tags.length) window.tp.push(['setTags', tags]);
    if (contentCreator) window.tp.push(['setContentCreator', contentCreator]);

    window.tp.push(['init', function () {
      window.tp.experience.execute();
    }]);
  }, []);

  return null;
}
