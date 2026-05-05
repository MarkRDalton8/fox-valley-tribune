'use client';

import { useEffect } from 'react';

/**
 * Runs once on mount for each page load (true MPA — full reloads on every navigation).
 * Sets Piano content metadata before calling tp.experience.execute(), ensuring
 * Composer evaluates experiences with the correct section and tags already in place.
 */
export default function PianoInit({ section, tags = [], contentCreator }) {
  useEffect(() => {
    const tp = window.tp || [];

    if (section) tp.push(['setContentSection', section]);
    if (tags.length) tp.push(['setTags', tags]);
    if (contentCreator) tp.push(['setContentCreator', contentCreator]);

    tp.push(['init', function () {
      window.tp.experience.execute();
    }]);
  }, []);

  return null;
}
