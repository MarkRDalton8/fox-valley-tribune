'use client';

import { useState, useEffect } from 'react';
import { COLORS } from '../lib/data';

const SECTION_COLOR = '#92400E';

const JOB_LEVEL_OPTIONS = [
  'CEO',
  'Other C-Level',
  'Executive leadership (VP, SVP, EVP)',
  'Director',
  'Manager',
  'Supervisor',
  'Staff',
  'Student',
  'Consultant',
  'Other',
];

export default function ProgressiveProfileModal() {
  const [visible, setVisible] = useState(false);
  const [uid, setUid] = useState(null);
  const [jobLevel, setJobLevel] = useState('');
  const [company, setCompany] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 8000);
    return () => clearTimeout(t);
  }, [showToast]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('piano_pp_form1_done')) return;

    const tp = window.tp || [];
    tp.push(['init', function () {
      const user = window.tp?.pianoId?.getUser?.();
      if (!user?.uid) return;
      setUid(user.uid);
      setTimeout(() => setVisible(true), 1500);
    }]);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!jobLevel || !company.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/piano-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          fields: {
            job_level: JSON.stringify([jobLevel]),
            COMPANY: company.trim(),
          },
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      localStorage.setItem('piano_pp_form1_done', '1');
      setVisible(false);
      setShowToast(true);
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  function dismiss() {
    localStorage.setItem('piano_pp_form1_done', '1');
    setVisible(false);
  }

  if (showToast) return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1100,
      background: '#1a1a1a', color: '#fff', borderRadius: 6,
      padding: '20px 24px', maxWidth: 360, width: 'calc(100vw - 48px)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.35)', fontSize: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Profile saved</span>
        </div>
        <button onClick={() => setShowToast(false)} style={{
          background: 'none', border: 'none', color: '#aaa', fontSize: 20,
          cursor: 'pointer', lineHeight: 1, padding: 0, marginLeft: 12,
        }}>×</button>
      </div>
      <p style={{ margin: 0, color: '#ccc', lineHeight: 1.55, fontSize: 13 }}>
        Your role and company are now part of your first-party profile. Piano makes this data
        immediately available for content personalization, audience segmentation, and targeted
        campaigns — captured in a single interaction, actionable across every channel.
      </p>
    </div>
  );

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 4, padding: '36px 40px',
        maxWidth: 440, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{ width: 40, height: 4, background: SECTION_COLOR, borderRadius: 2, marginBottom: 20 }} />
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 22, fontWeight: 700, color: COLORS.dark, margin: '0 0 8px',
        }}>
          Help us serve you better
        </h2>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 24px', lineHeight: 1.6 }}>
          Tell us a bit about yourself so we can personalize your Fox Valley Tribune experience.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 18 }}>
            <span style={labelStyle}>Job Title</span>
            <select
              value={jobLevel}
              onChange={e => setJobLevel(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select...</option>
              {JOB_LEVEL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: 24 }}>
            <span style={labelStyle}>Company</span>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Your company name"
              style={{ ...inputStyle, boxSizing: 'border-box' }}
            />
          </label>

          {error && <p style={{ color: '#c00', fontSize: 13, margin: '-8px 0 16px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
            <button type="button" onClick={dismiss} style={skipStyle}>
              Skip
            </button>
            <button type="submit" disabled={submitting} style={{
              ...btnStyle, background: SECTION_COLOR, opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.5px', color: '#444', marginBottom: 6,
};

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #ddd',
  borderRadius: 3, fontSize: 15, color: '#222', background: '#fff',
};

const skipStyle = {
  background: 'none', border: 'none', color: '#999', fontSize: 14,
  cursor: 'pointer', padding: '10px 0',
};

const btnStyle = {
  color: '#fff', border: 'none', padding: '10px 24px',
  borderRadius: 3, fontSize: 14, fontWeight: 700, cursor: 'pointer',
};
