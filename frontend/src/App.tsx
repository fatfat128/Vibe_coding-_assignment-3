import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelection from './pages/RoleSelection';
import PostItem from './pages/PostItem';
import BrowseItems from './pages/BrowseItems';
import Confirmation from './pages/Confirmation';
import { supabase } from './lib/supabase';
import { createItem, claimItem, uploadPhoto, adminSignup } from './lib/api';
import type { Session } from '@supabase/supabase-js';

function AppContent() {
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [user, setUser] = useState({ email: '', password: '' });
  const [, setRegisterUser] = useState({ name: '', email: '', password: '' });
  const [userRole, setUserRole] = useState<'give' | 'find' | null>(null);

  const [item, setItem] = useState({
    name: '',
    condition: '' as 'Good' | 'Fair' | 'Poor' | '',
    suburb: '',
    pickupWindow: '',
    itemSize: '',
    stillAvailable: 'Yes',
    remarks: '',
    photoFile: null as File | null,
  });

  const [claimedItem, setClaimedItem] = useState<{ name: string; suburb: string } | null>(null);

  // ---- auth bootstrap ----
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- handlers ----
  const handleEmailChange = (email: string) => setUser({ ...user, email });
  const handlePasswordChange = (password: string) => setUser({ ...user, password });

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });
    if (error) {
      alert(`Login failed: ${error.message}`);
      return;
    }
    navigate('/role');
  };

  const handleGoogleLogin = () => {
    alert('Google sign-in not configured for this demo. Use email + password.');
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      // Backend admin signup — creates a confirmed user, bypasses email rate limit
      await adminSignup({
        email,
        password,
        full_name: name,
        consent_given: true,
      });
    } catch (e) {
      alert(`Sign-up failed: ${(e as Error).message}`);
      return;
    }

    // Immediately sign the user in
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      alert(`Account created, but auto-login failed: ${signInErr.message}. Please log in.`);
      navigate('/');
      return;
    }

    setRegisterUser({ name, email, password });
    setUser({ email, password });
    navigate('/role');
  };

  const handleRegisterWithGoogle = () => {
    alert('Google sign-up not configured for this demo. Use email + password.');
  };

  const handleSelectRole = (role: 'give' | 'find') => {
    setUserRole(role);
    navigate(role === 'give' ? '/post' : '/browse');
  };

  const handleItemChange = (field: string, value: string | File | null) => {
    setItem({ ...item, [field]: value });
  };

  const handleSubmitItem = async () => {
    try {
      let photo_url: string | undefined;
      if (item.photoFile) {
        photo_url = await uploadPhoto(item.photoFile);
      }
      await createItem({
        name: item.name,
        condition: item.condition as 'Good' | 'Fair' | 'Poor',
        suburb: item.suburb,
        pickup_window: item.pickupWindow || null,
        item_size: item.itemSize || null,
        still_available: item.stillAvailable === 'Yes',
        remarks: item.remarks || null,
        photo_url: photo_url ?? null,
      });
      navigate('/confirmation');
    } catch (e) {
      alert(`Failed to post item: ${(e as Error).message}`);
    }
  };

  const handleClaimItem = async (claimedItemData: { id: string; name: string; suburb: string }) => {
    try {
      await claimItem(claimedItemData.id);
      setClaimedItem({ name: claimedItemData.name, suburb: claimedItemData.suburb });
      navigate('/confirmation');
    } catch (e) {
      alert(`Failed to claim: ${(e as Error).message}`);
    }
  };

  const handleStartOver = async () => {
    await supabase.auth.signOut();
    setUser({ email: '', password: '' });
    setUserRole(null);
    setItem({
      name: '',
      condition: '',
      suburb: '',
      pickupWindow: '',
      itemSize: '',
      stillAvailable: 'Yes',
      remarks: '',
      photoFile: null,
    });
    setClaimedItem(null);
    navigate('/');
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  // Auth gate inline — no nested component definition (would cause remount per render)
  const gate = (el: React.ReactNode) => (session ? el : <Navigate to="/" replace />);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Login
            email={user.email}
            password={user.password}
            onEmailChange={handleEmailChange}
            onPasswordChange={handlePasswordChange}
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleLogin}
          />
        }
      />
      <Route
        path="/register"
        element={
          <Register
            onRegister={handleRegister}
            onRegisterWithGoogle={handleRegisterWithGoogle}
          />
        }
      />
      <Route path="/role" element={gate(<RoleSelection onSelectRole={handleSelectRole} />)} />
      <Route
        path="/post"
        element={gate(
          <PostItem item={item} onItemChange={handleItemChange} onSubmit={handleSubmitItem} />,
        )}
      />
      <Route path="/browse" element={gate(<BrowseItems onClaimItem={handleClaimItem} />)} />
      <Route
        path="/confirmation"
        element={gate(
          <Confirmation
            userRole={userRole}
            item={item}
            claimedItem={claimedItem}
            onStartOver={handleStartOver}
          />,
        )}
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
