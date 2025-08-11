import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSignIn(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage('Signed in. Redirecting...');
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      setMessage(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setMessage('Sign up successful. Please check your email to confirm, then sign in.');
    } catch (err) {
      setMessage(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <Link to="/" className="button button--link">← Back</Link>
      <div className="card">
        <h2>Sign in</h2>
        <form onSubmit={handleSignIn}>
          <div style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="email">Email</label><br />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="password">Password</label><br />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="button" disabled={loading} type="submit">
              {loading ? 'Working…' : 'Sign in'}
            </button>
            <button className="button" disabled={loading} onClick={handleSignUp}>
              {loading ? 'Working…' : 'Sign up'}
            </button>
          </div>
        </form>
        {message && (
          <p style={{ marginTop: '0.5rem', color: message.includes('failed') ? '#cc2936' : '#138a36' }}>{message}</p>
        )}
      </div>
    </div>
  );
}


