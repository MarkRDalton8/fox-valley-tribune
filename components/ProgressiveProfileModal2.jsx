'use client';

import { useState, useEffect } from 'react';
import { COLORS } from '../lib/data';

const RESOURCE_ID = 'RAF1LL2';
const PAGEVIEW_THRESHOLD = 5;
const PAGEVIEW_KEY = 'fvt_pageviews';
const FORM1_DONE_KEY = 'fvt_ppf1_done';

export default function ProgressiveProfileModal2() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [dept, setDept] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const pageviews = parseInt(localStorage.getItem(PAGEVIEW_KEY) || '0', 10);
    if (pageviews < PAGEVIEW_THRESHOLD) return;
    if (!localStorage.getItem(FORM1_DONE_KEY)) return; // wait for form 1 first

    window.tp = window.tp || [];
    window.tp.push(['init', function () {
      if (!window.tp.pianoId.getUser()) return;
      window.tp.api.callApi('/access/check', { rid: RESOURCE_ID }, function (response) {
        if (response?.access?.granted) setVisible(true);
      });
    }]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!industry || !companySize.trim() || !dept) {
      setError('Please fill in all fields.');
      return;
    }
    setSaving(true);
    setError('');

    const uid = window.tp?.pianoId?.getUser()?.uid;
    if (!uid) { setSaving(false); setError('Not logged in.'); return; }

    fetch('/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, fields: { INDUSTRY: industry, 'COMPANY-SIZE': companySize, DEPT: dept } }),
    })
      .then(r => r.json())
      .then(data => {
        setSaving(false);
        if (data?.errors?.length || data?.error) {
          console.error('[PPF2]', data.errors || data.error);
          setError('Something went wrong. Please try again.');
        } else {
          localStorage.setItem('fvt_ppf2_done', '1');
          setSubmitted(true);
        }
      })
      .catch(() => { setSaving(false); setError('Network error. Please try again.'); });
  };

  if (!visible) return null;

  const sectionColor = COLORS.sectionLocalPolitics;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'white', maxWidth: 480, width: '90%',
        padding: '40px', position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <button
          onClick={() => setVisible(false)}
          style={{
            position: 'absolute', top: 12, right: 16, background: 'none',
            border: 'none', fontSize: 24, color: '#bbb', cursor: 'pointer', lineHeight: 1,
          }}
        >×</button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: sectionColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: 'white', fontSize: 24,
            }}>✓</div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28, color: COLORS.dark, margin: '0 0 12px',
            }}>Your profile is complete!</h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, margin: '0 0 28px' }}>
              Thanks for helping us understand our readers better. View your full profile in My Account.
            </p>
            <a
              href="/account"
              style={{
                display: 'inline-block', background: COLORS.primary, color: 'white',
                padding: '12px 28px', textDecoration: 'none', fontSize: 14,
                fontWeight: 700, letterSpacing: '0.5px',
              }}
            >View My Account →</a>
          </div>
        ) : (
          <>
            <div style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '2.5px', color: sectionColor, marginBottom: 14,
              borderBottom: `3px solid ${sectionColor}`, paddingBottom: 10,
            }}>Local Politics — Reader Profile</div>

            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 26, color: COLORS.dark, margin: '0 0 10px', lineHeight: 1.3,
            }}>One more thing — tell us about your work</h2>

            <p style={{ fontSize: 14, color: '#666', margin: '0 0 28px', lineHeight: 1.65 }}>
              A little more context helps us deliver the local politics coverage most relevant to you.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '1px', color: '#444', marginBottom: 7,
                }}>Industry / Vertical</label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 13px', fontSize: 15,
                    border: '1px solid #ddd', outline: 'none', background: 'white',
                    boxSizing: 'border-box', fontFamily: 'Georgia, serif', cursor: 'pointer',
                  }}
                >
                  <option value="">Select your industry…</option>
                  <option value="Food & Beverage">Food &amp; Beverage</option>
                  <option value="Security">Security</option>
                  <option value="Building & Construction">Building &amp; Construction</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Packaging">Packaging</option>
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '1px', color: '#444', marginBottom: 7,
                }}>Company Size</label>
                <input
                  type="text"
                  value={companySize}
                  onChange={e => setCompanySize(e.target.value)}
                  placeholder="e.g. 250"
                  style={{
                    width: '100%', padding: '11px 13px', fontSize: 15,
                    border: '1px solid #ddd', outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'Georgia, serif',
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '1px', color: '#444', marginBottom: 7,
                }}>Department / Function</label>
                <select
                  value={dept}
                  onChange={e => setDept(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 13px', fontSize: 15,
                    border: '1px solid #ddd', outline: 'none', background: 'white',
                    boxSizing: 'border-box', fontFamily: 'Georgia, serif', cursor: 'pointer',
                  }}
                >
                  <option value="">Select your department…</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              {error && (
                <p style={{ color: '#c0392b', fontSize: 13, margin: '-12px 0 16px' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%', background: COLORS.primary, color: 'white',
                  border: 'none', padding: '14px', fontSize: 14, fontWeight: 800,
                  cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: '0.5px',
                  opacity: saving ? 0.7 : 1, textTransform: 'uppercase',
                }}
              >{saving ? 'Saving...' : 'Save My Profile'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
