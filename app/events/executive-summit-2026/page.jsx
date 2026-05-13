'use client';

import { useState } from 'react';

const GOLD = '#B45309';
const GOLD_LIGHT = '#D97706';
const NAVY = '#1a1a2e';
const NAVY_MID = '#16213e';

const SPEAKERS = [
  {
    name: 'Patricia Dunleavy',
    title: 'Mayor, City of Geneva',
    topic: 'Infrastructure investment and the next decade of Fox Valley growth',
  },
  {
    name: 'Diane Solis',
    title: 'Councilwoman, St. Charles',
    topic: 'Workforce development and attracting talent to the western suburbs',
  },
  {
    name: 'Robert Kaczmarek',
    title: 'President, Kane County Chamber of Commerce',
    topic: 'The regional business landscape: opportunities and headwinds',
  },
];

const AGENDA = [
  { time: '8:00 AM', item: 'Registration & Breakfast' },
  { time: '9:00 AM', item: 'Welcome & Opening Remarks' },
  { time: '9:30 AM', item: 'Keynote: The Future of Fox Valley Business' },
  { time: '10:45 AM', item: 'Panel: Infrastructure & Economic Development' },
  { time: '12:00 PM', item: 'Networking Luncheon' },
  { time: '1:30 PM', item: 'Breakout Sessions' },
  { time: '3:00 PM', item: 'Closing Roundtable: Executive Priorities for 2027' },
  { time: '4:00 PM', item: 'Reception' },
];

export default function ExecutiveSummitPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div style={{ background: '#f9f6f1', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: NAVY, borderBottom: `4px solid ${GOLD}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px 56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 3, background: GOLD }} />
            <span style={{ color: GOLD, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>
              Fox Valley Tribune Events
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 700, color: '#fff',
            margin: '0 0 20px', lineHeight: 1.15,
          }}>
            Fox Valley Executive<br />Leadership Summit
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, marginBottom: 32 }}>
            {[
              { icon: '📅', label: 'Wednesday, May 28, 2026' },
              { icon: '📍', label: 'Herrington Inn & Spa — Geneva, IL' },
              { icon: '🕗', label: '8:00 AM – 4:00 PM' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ color: '#c9c9d8', fontSize: 15 }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ background: GOLD, color: '#fff', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', padding: '5px 14px' }}>
              By Invitation Only
            </span>
            <span style={{ background: 'rgba(255,255,255,0.08)', color: '#c9c9d8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '5px 14px' }}>
              Limited to 80 Seats
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 48, alignItems: 'start' }}>

          {/* Left column */}
          <div>
            {/* About */}
            <section style={{ marginBottom: 52 }}>
              <SectionHeading>About the Summit</SectionHeading>
              <p style={bodyText}>
                The Fox Valley Executive Leadership Summit brings together senior leaders from across Kane County for a day of candid discussion, strategic insight, and high-value networking. Hosted by the Fox Valley Tribune, this invitation-only gathering is designed for CEOs, C-suite executives, and senior leadership driving business in the western suburbs.
              </p>
              <p style={bodyText}>
                Topics span infrastructure investment, workforce dynamics, regional economic development, and the policy environment shaping business in 2026 and beyond. Attendees leave with new connections and a sharper read on where the Fox Valley is headed.
              </p>
            </section>

            {/* Speakers */}
            <section style={{ marginBottom: 52 }}>
              <SectionHeading>Featured Speakers</SectionHeading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {SPEAKERS.map(s => (
                  <div key={s.name} style={{
                    background: '#fff', border: `1px solid #e5e0d8`,
                    borderLeft: `4px solid ${GOLD}`, padding: '20px 24px',
                  }}>
                    <div style={{ fontWeight: 800, color: NAVY, fontSize: 16, marginBottom: 2 }}>{s.name}</div>
                    <div style={{ color: GOLD, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{s.title}</div>
                    <div style={{ color: '#555', fontSize: 14, fontStyle: 'italic' }}>"{s.topic}"</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Agenda */}
            <section>
              <SectionHeading>Day Agenda</SectionHeading>
              <div style={{ background: '#fff', border: '1px solid #e5e0d8' }}>
                {AGENDA.map((row, i) => (
                  <div key={row.time} style={{
                    display: 'flex', gap: 24, padding: '14px 24px',
                    borderTop: i > 0 ? '1px solid #eee' : 'none',
                    background: i % 2 === 0 ? '#fff' : '#faf9f7',
                  }}>
                    <span style={{ color: GOLD, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', width: 80, flexShrink: 0 }}>
                      {row.time}
                    </span>
                    <span style={{ color: '#333', fontSize: 14 }}>{row.item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Registration card */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{
              background: '#fff', border: '1px solid #e5e0d8',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}>
              <div style={{ background: NAVY, padding: '24px', borderBottom: `3px solid ${GOLD}` }}>
                <div style={{ color: GOLD, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 6 }}>
                  Reserve Your Seat
                </div>
                <div style={{ color: '#fff', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700 }}>
                  Executive Summit 2026
                </div>
                <div style={{ color: '#9999b3', fontSize: 13, marginTop: 4 }}>Complimentary for Tribune subscribers</div>
              </div>

              <div style={{ padding: '28px 24px' }}>
                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
                      You're registered
                    </div>
                    <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>
                      A confirmation has been sent to <strong>{email}</strong>. We look forward to seeing you on May 28.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <FormField label="First Name" value={firstName} onChange={setFirstName} required />
                      <FormField label="Last Name" value={lastName} onChange={setLastName} required />
                    </div>
                    <FormField label="Work Email" type="email" value={email} onChange={setEmail} required style={{ marginBottom: 12 }} />
                    <FormField label="Company" value={company} onChange={setCompany} required style={{ marginBottom: 12 }} />
                    <FormField label="Title" value={title} onChange={setTitle} required style={{ marginBottom: 24 }} />
                    <button
                      type="submit"
                      style={{
                        width: '100%', background: GOLD, color: '#fff', border: 'none',
                        padding: '13px', fontSize: 13, fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                      }}
                    >
                      Register Now
                    </button>
                    <p style={{ color: '#999', fontSize: 12, textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>
                      Seating is limited. Registration closes May 21 or when capacity is reached.
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* Venue */}
            <div style={{ background: '#fff', border: '1px solid #e5e0d8', marginTop: 16, padding: '20px 24px' }}>
              <div style={{ fontWeight: 700, color: NAVY, fontSize: 14, marginBottom: 4 }}>Herrington Inn & Spa</div>
              <div style={{ color: '#666', fontSize: 13, lineHeight: 1.6 }}>
                15 S River Ln<br />Geneva, IL 60134<br />
                <span style={{ color: GOLD, fontSize: 12, fontWeight: 600 }}>Complimentary valet parking</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ width: 4, height: 22, background: GOLD, borderRadius: 2 }} />
      <h2 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 22, fontWeight: 700, color: NAVY, margin: 0,
      }}>
        {children}
      </h2>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', required, style: extraStyle }) {
  return (
    <label style={{ display: 'block', ...extraStyle }}>
      <span style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555', marginBottom: 5 }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{
          width: '100%', padding: '9px 11px', border: '1px solid #ddd',
          fontSize: 14, color: '#222', background: '#fafafa', boxSizing: 'border-box',
          outline: 'none',
        }}
      />
    </label>
  );
}

const bodyText = {
  color: '#444', fontSize: 15, lineHeight: 1.8, marginBottom: 16,
  fontFamily: "Georgia, 'Times New Roman', serif",
};
