import { useState } from 'react';
import styles from '../styles/Home.module.css';

const AMENITIES = [
  'In-unit laundry', 'Parking', 'Pet friendly', 'Gym',
  'AC / heating', 'Dishwasher', 'Furnished', 'Utilities included', 'Near transit'
];
const TYPES = ['Apartment', 'House', 'Studio', 'Condo', 'No preference'];
const COMMUTES = ['Walking (5–10 min)', 'Biking (10–20 min)', 'Transit (20–40 min)', 'Drive (any)'];

export default function Home() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    university: '', city: '', moveIn: '', lease: '',
    budget: 1200, roommates: 2,
    amenities: [], housingType: '', commute: '', notes: ''
  });

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function toggleAmenity(a) {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a]
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/housing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
      setStep(3);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Finding your best housing options...</p>
        <p className={styles.sub}>Scanning listings, calculating splits, building your plan</p>
      </div>
    </div>
  );

  if (results) return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your housing matches</h1>

      <div className={styles.summaryBar}>
        <span><b>Location:</b> {results.summary.city}</span>
        <span><b>Price range:</b> {results.summary.priceRange}</span>
        <span><b>Best area:</b> {results.summary.bestNeighborhood}</span>
        <span>{results.summary.marketNote}</span>
      </div>

      <h2 className={styles.sectionTitle}>Recommended listings</h2>
      {results.listings.map((l, i) => {
        const perPerson = Math.round(l.monthlyRent / (form.roommates + 1));
        const utilities = Math.round(perPerson * 0.12);
        return (
          <div key={i} className={styles.listingCard}>
            <div className={styles.listingHeader}>
              <div>
                <div className={styles.listingName}>{l.name}</div>
                <div className={styles.listingAddress}>{l.address}</div>
              </div>
              <div className={styles.listingPrice}>${l.monthlyRent.toLocaleString()}/mo</div>
            </div>
            <div className={styles.pills}>
              <span className={styles.pill}>{l.bedrooms}BR / {l.bathrooms}BA</span>
              <span className={styles.pill}>{l.sqft} sqft</span>
              <span className={styles.pill}>{l.distanceToCampus} to campus</span>
              <span className={`${styles.pill} ${styles.pillBlue}`}>{l.source}</span>
            </div>
            <div className={styles.highlights}>
              {l.highlights.map((h, j) => (
                <span key={j} className={styles.tag}>{h}</span>
              ))}
            </div>
            <div className={styles.splitRow}>
              <div className={styles.splitBox}>
                <div className={styles.splitVal}>${perPerson.toLocaleString()}</div>
                <div className={styles.splitLabel}>Per person / mo</div>
              </div>
              <div className={styles.splitBox}>
                <div className={styles.splitVal}>${utilities.toLocaleString()}</div>
                <div className={styles.splitLabel}>Est. utilities</div>
              </div>
              <div className={styles.splitBox}>
                <div className={styles.splitVal}>${(perPerson + utilities).toLocaleString()}</div>
                <div className={styles.splitLabel}>All-in estimate</div>
              </div>
            </div>
          </div>
        );
      })}

      <h2 className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>Your action plan</h2>
      <div className={styles.card}>
        {results.actionPlan.map((s, i) => (
          <div key={i} className={styles.actionStep}>
            <div className={styles.actionNum}>{i + 1}</div>
            <div>{s}</div>
          </div>
        ))}
      </div>

      <p className={styles.disclaimer}>
        Listings are AI-generated based on your inputs and real market patterns.
        Always verify availability directly on Zillow, Apartments.com, or with landlords.
      </p>
      <button className={styles.resetBtn} onClick={() => { setResults(null); setStep(1); }}>
        ← Start over
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <span className={styles.badge}>AI-powered housing search</span>
        <h1 className={styles.title}>Find your college home</h1>
        <p className={styles.subtitle}>
          Tell us what you need. Get personalized listings, rent splits, and a move-in plan.
        </p>
      </div>

      <div className={styles.stepRow}>
        {['Your details', 'Preferences', 'Results'].map((label, i) => (
          <div key={i} className={`${styles.stepItem} ${step === i + 1 ? styles.stepActive : ''}`}>
            <div className={styles.stepDot}>{i + 1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className={styles.card}>
          <div className={styles.sectionTitle}>Basic info</div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>University / college</label>
              <input
                value={form.university}
                onChange={e => set('university', e.target.value)}
                placeholder="e.g. UC Davis"
              />
            </div>
            <div className={styles.formGroup}>
              <label>City or neighborhood</label>
              <input
                value={form.city}
                onChange={e => set('city', e.target.value)}
                placeholder="e.g. Davis, CA"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Move-in date</label>
              <input
                type="date"
                value={form.moveIn}
                onChange={e => set('moveIn', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Lease length</label>
              <select value={form.lease} onChange={e => set('lease', e.target.value)}>
                <option value="">Select...</option>
                <option>Month-to-month</option>
                <option>6 months</option>
                <option>12 months</option>
                <option>Academic year (9 mo)</option>
              </select>
            </div>
            <div className={`${styles.formGroup} ${styles.full}`}>
              <label>Monthly budget per person: <b>${form.budget}</b></label>
              <input
                type="range" min="400" max="3000" step="50"
                value={form.budget}
                onChange={e => set('budget', Number(e.target.value))}
              />
              <div className={styles.rangeLabels}><span>$400</span><span>$3,000</span></div>
            </div>
            <div className={`${styles.formGroup} ${styles.full}`}>
              <label>
                Roommates: <b>{form.roommates === 0 ? 'Living alone' : `${form.roommates} roommate${form.roommates > 1 ? 's' : ''}`}</b>
              </label>
              <input
                type="range" min="0" max="5" step="1"
                value={form.roommates}
                onChange={e => set('roommates', Number(e.target.value))}
              />
              <div className={styles.rangeLabels}><span>Solo</span><span>5 roommates</span></div>
            </div>
          </div>
          <button className={styles.btnPrimary} onClick={() => setStep(2)}>
            Next: Preferences →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className={styles.card}>
          <div className={styles.sectionTitle}>What matters to you</div>

          <div className={styles.formGroup}>
            <label>Must-have amenities</label>
            <div className={styles.tagRow}>
              {AMENITIES.map(a => (
                <span
                  key={a}
                  className={`${styles.tag} ${form.amenities.includes(a) ? styles.tagSelected : ''}`}
                  onClick={() => toggleAmenity(a)}
                >{a}</span>
              ))}
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
            <label>Housing type</label>
            <div className={styles.tagRow}>
              {TYPES.map(t => (
                <span
                  key={t}
                  className={`${styles.tag} ${form.housingType === t ? styles.tagSelected : ''}`}
                  onClick={() => set('housingType', t)}
                >{t}</span>
              ))}
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
            <label>Max commute to campus</label>
            <div className={styles.tagRow}>
              {COMMUTES.map(c => (
                <span
                  key={c}
                  className={`${styles.tag} ${form.commute === c ? styles.tagSelected : ''}`}
                  onClick={() => set('commute', c)}
                >{c}</span>
              ))}
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
            <label>Anything else? (deal-breakers, vibe, lifestyle)</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="e.g. quiet neighborhood, no basement units, close to coffee shops..."
              rows={3}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.btnPrimary} onClick={handleSubmit}>
            Find my housing options →
          </button>
          <button className={styles.resetBtn} onClick={() => setStep(1)}>← Back</button>
        </div>
      )}
    </div>
  );
}