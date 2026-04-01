import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import Products from './components/Products';

function App() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      {/* Header Section */}
      <header className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Premium Products
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Browse our collection. Handling the flaky API gracefully is part of the challenge.
        </p>
      </header>

      {/* Controls Section */}
      <section style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', flex: 1, maxWidth: '400px' }}>
          <Search size={20} color="var(--text-muted)" style={{ marginRight: '0.75rem' }} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              outline: 'none',
              width: '100%',
              fontSize: '1rem'
            }}
          />
        </div>

        <select
          className="glass-panel"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            color: 'var(--text-main)',
            outline: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            appearance: 'none',
          }}
        >
          <option value="" style={{ background: 'var(--surface)' }}>All Categories</option>
          <option value="electronics" style={{ background: 'var(--surface)' }}>Electronics</option>
          <option value="clothing" style={{ background: 'var(--surface)' }}>Clothing</option>
          <option value="home" style={{ background: 'var(--surface)' }}>Home</option>
          <option value="outdoors" style={{ background: 'var(--surface)' }}>Outdoors</option>
        </select>
      </section>

      {/* Main Grid Placeholder */}
      <main>
        {/* Placeholder state to visually guide candidate */}
        {/* <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem',
          border: '1px dashed var(--border)',
          borderRadius: '16px',
        }}>
           <Loader2 size={40} color="var(--primary)" className="spin" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
           <style>
             {`
               @keyframes spin {
                 100% { transform: rotate(360deg); }
               }
             `}
           </style>
           <h2 style={{ marginBottom: '0.5rem' }}>Start Building Your Grid!</h2>
           <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px' }}>
             Use <code>src/services/api.ts</code> to fetch the products. Remember to build pagination and handle the network errors that the API frequently throws!
           </p>
        </div> */}
        <Products category={category || undefined} search={debouncedSearch || undefined} />
      </main>
    </div>
  );
}

export default App;
