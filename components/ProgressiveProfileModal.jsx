'use client';

import { useState, useEffect } from 'react';
import { COLORS } from '../lib/data';

const RESOURCE_ID = 'RAF1LL2';

export default function ProgressiveProfileModal() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [jobLevel, setJobLevel] = useState('');
  const [company, setCompany] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.tp = window.tp || [];
    window.tp.push(['init', function () {
      const user = window.tp.pianoId.getUser();
      if (!user) return;

      window.tp.api.callApi('/access/check', { rid: RESOURCE_ID }, function (response) {
        if (response?.access?.granted) {
          setVisible(true);
        }
      });
    }]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobLevel.trim() || !company.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setSaving(true);
    setError('');

    window.tp.api.callApi('/publisher/user/update', {
      custom_fields: JSON.stringify({ job_level: jobLevel, COMPANY: company }),
    }, function (response) {
      setSaving(false);
      if (response?.code === 0 || response?.user) {
        setSubmitted(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    });
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
            }}>Thanks for sharing!</h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, margin: '0 0 28px' }}>
              Your profile has been updated. You can review and edit your details anytime in My Account.
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
            }}>Help us cover the stories that matter to you</h2>

            <p style={{ fontSize: 14, color: '#666', margin: '0 0 28px', lineHeight: 1.65 }}>
              As a Tribune subscriber, your perspective shapes our coverage. Tell us a bit about yourself.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '1px', color: '#444', marginBottom: 7,
                }}>Job Title</label>
                <input
                  type="text"
                  value={jobLevel}
                  onChange={e => setJobLevel(e.target.value)}
                  placeholder="e.g. Policy Analyst"
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
                }}>Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Kane County Government"
                  style={{
                    width: '100%', padding: '11px 13px', fontSize: 15,
                    border: '1px solid #ddd', outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'Georgia, serif',
                  }}
                />
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
