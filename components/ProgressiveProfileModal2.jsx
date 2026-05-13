'use client';

import { useState, useEffect } from 'react';
import { COLORS } from '../lib/data';

const SECTION_COLOR = '#92400E';

const INDUSTRY_OPTIONS = [
  'Food & Beverage',
  'Security',
  'Building & Construction',
  'Manufacturing',
  'Packaging',
];

const DEPT_OPTIONS = [
  'Marketing',
  'Sales',
  'Engineering',
  'Finance',
  'Operations',
  'HR',
];

export default function ProgressiveProfileModal2() {
  const [visible, setVisible] = useState(false);
  const [uid, setUid] = useState(null);
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [dept, setDept] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('piano_pp_form1_done')) return;
    if (localStorage.getItem('piano_pp_form2_done')) return;

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
    if (!industry || !dept) {
      setError('Please select an industry and department.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const fields = {
        INDUSTRY: JSON.stringify([industry]),
        DEPT: JSON.stringify([dept]),
      };
      if (companySize) {
        fields['COMPANY-SIZE'] = companySize;
      }

      const res = await fetch('/api/piano-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, fields }),
      });
      if (!res.ok) throw new Error('Update failed');
      localStorage.setItem('piano_pp_form2_done', '1');
      setVisible(false);
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  function dismiss() {
    localStorage.setItem('piano_pp_form2_done', '1');
    setVisible(false);
  }

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
          One more thing…
        </h2>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 24px', lineHeight: 1.6 }}>
          A few more details help us surface the local politics coverage most relevant to you.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 18 }}>
            <span style={labelStyle}>Industry / Vertical</span>
            <select
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select...</option>
              {INDUSTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: 18 }}>
            <span style={labelStyle}>Department / Function</span>
            <select
              value={dept}
              onChange={e => setDept(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select...</option>
              {DEPT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: 24 }}>
            <span style={labelStyle}>Company Size <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></span>
            <input
              type="number"
              value={companySize}
              onChange={e => setCompanySize(e.target.value)}
              placeholder="e.g. 500"
              min="50"
              max="10000"
              step="10"
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
              {submitting ? 'Saving...' : 'Submit'}
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
