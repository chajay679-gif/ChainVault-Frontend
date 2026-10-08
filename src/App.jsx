import React, { useState, useEffect } from 'react';
import { 
  Shield, Sun, Moon, FilePlus, FileSearch, LayoutDashboard, 
  Upload, FileText, LogIn, Lock, Home
} from 'lucide-react';
import { registerDocument, verifyFile, fetchDocuments, revokeDocument } from './services/api';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [theme, setTheme] = useState('dark');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [documents, setDocuments] = useState([]);

  // Auth & Security States
  const [authStep, setAuthStep] = useState('register');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form states
  const [regTitle, setRegTitle] = useState('');
  const [regIssuer, setRegIssuer] = useState('University Registrar');
  const [regFile, setRegFile] = useState(null);
  const [regResult, setRegResult] = useState(null);

  const [verifyFileInput, setVerifyFileInput] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (isAuthenticated) loadDocuments();
  }, [theme, isAuthenticated]);

  const loadDocuments = async () => {
    try {
      const res = await fetchDocuments();
      setDocuments(res.data);
    } catch (err) { console.error("Error fetching docs", err); }
  };

  const handleProtectedAction = (targetView) => {
    if (!isAuthenticated) {
      alert("Security Enforcement: You must register and complete OTP verification before accessing platform features.");
      setCurrentView('login');
    } else {
      setCurrentView(targetView);
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!agreeTerms) return alert("You must agree to the file sharing agreement to proceed.");
    setAuthStep('otp');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === '123456' || otp.length === 6) {
      setIsAuthenticated(true);
      setCurrentView('dashboard');
    } else {
      alert("Invalid OTP code. Enter 123456 to test.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regFile) return alert("Select a file!");
    const formData = new FormData();
    formData.append('file', regFile);
    formData.append('title', regTitle);
    formData.append('issuer', regIssuer);

    try {
      const res = await registerDocument(formData);
      setRegResult(res.data);
      loadDocuments();
    } catch (err) { alert("Registration failed"); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyFileInput) return alert("Select a file!");
    const formData = new FormData();
    formData.append('file', verifyFileInput);

    try {
      const res = await verifyFile(formData);
      setVerifyResult(res.data);
      setCurrentView('verify-result');
    } catch (err) { alert("Verification failed"); }
  };

  const handleRevoke = async (id) => {
    if (!confirm("Revoke this document on the ledger?")) return;
    try {
      await revokeDocument(id);
      loadDocuments();
      alert("Document revoked on ledger");
    } catch (err) { alert("Revocation failed"); }
  };

  // LANDING PAGE VIEW
  if (currentView === 'landing') {
    return (
      <div className="landing-wrapper">
        <nav className="top-nav">
          <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Shield size={26} color="#f59e0b" fill="#f59e0b" />
            <span>ChainVault</span>
          </div>
          <div className="nav-items">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
            <button onClick={() => handleProtectedAction('dashboard')}>Features</button>
            <button onClick={() => handleProtectedAction('ledger')}>Ledger</button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="btn-login" onClick={() => setCurrentView('login')}>Login</button>
            <button className="btn-get-started" style={{ background: '#2563eb', color: '#fff', padding: '8px 18px', borderRadius: 6, border: 'none', fontWeight: 600, cursor: 'pointer' }} onClick={() => setCurrentView('login')}>Get Started</button>
          </div>
        </nav>

        <section className="hero-centered-container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: 20, color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, marginBottom: 20 }}>
            <Lock size={12} /> SECURE YOUR ASSETS
          </div>

          <h1 className="hero-main-title">
            One Fraudulent Record Can Ruin Everything.<br />
            <span className="gold-text">Secure Your Digital Identity Before It's Too Late.</span>
          </h1>

          <p className="hero-desc">
            In an era of AI manipulation and document forgery, unverified files are liabilities. ChainVault anchors your credentials on an immutable ledger so your trust is never compromised.
          </p>

          <div className="hero-buttons-center">
            <button className="btn-blue-register" onClick={() => handleProtectedAction('register')}>
              Register a Document →
            </button>
            <button className="btn-green-verify" onClick={() => handleProtectedAction('verify')}>
              Verify a Document
            </button>
          </div>
        </section>
      </div>
    );
  }

  // LOGIN / REGISTRATION WITH SECURITY & OTP
  if (currentView === 'login') {
    return (
      <div className="auth-split-container">
        <div className="auth-left-panel">
          <div className="brand" onClick={() => setCurrentView('landing')}>
            <Shield size={26} color="#f59e0b" fill="#f59e0b" />
            <span>ChainVault</span>
          </div>
          <div>
            <h1>Zero-Trust Document Security</h1>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
              Access to ChainVault requires mandatory identity verification and explicit consent to safeguard cryptographic hashes.
            </p>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>© 2026 ChainVault Platform. All rights reserved.</div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-card">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle-red">Complete authentication to enter your vault</p>

            {authStep === 'register' ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@domain.com" required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" required />
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '16px 0', textAlign: 'left' }}>
                  <input type="checkbox" id="terms" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} style={{ marginTop: 3 }} />
                  <label htmlFor="terms" style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                    I agree to the <strong>User Agreement</strong> and explicitly consent to share file byte signatures with ChainVault for verification.
                  </label>
                </div>

                <button type="submit" style={{ width: '100%', background: '#2563eb', color: '#fff', padding: 12, borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Send OTP Verification Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                  <label>Enter 6-Digit OTP Sent to {email}</label>
                  <input className="form-input" type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 123456" maxLength={6} required />
                </div>
                <button type="submit" style={{ width: '100%', background: '#16a34a', color: '#fff', padding: 12, borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Verify OTP & Access Vault
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // SIDEBAR FOR PROTECTED PAGES
  const renderSidebar = () => (
    <aside className="sidebar">
      <div>
        <div className="brand" onClick={() => setCurrentView('landing')}>
          <Shield size={24} color="#f59e0b" fill="#f59e0b" />
          <span>ChainVault</span>
        </div>
        <div className="sidebar-menu">
          <div className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
            <LayoutDashboard size={18} /> Analytics Dashboard
          </div>
          <div className={`nav-item ${currentView === 'register' ? 'active' : ''}`} onClick={() => setCurrentView('register')}>
            <FilePlus size={18} /> Register Document
          </div>
          <div className={`nav-item ${currentView === 'verify' || currentView === 'verify-result' ? 'active' : ''}`} onClick={() => setCurrentView('verify')}>
            <FileSearch size={18} /> Verify Document
          </div>
          <div className={`nav-item ${currentView === 'ledger' ? 'active' : ''}`} onClick={() => setCurrentView('ledger')}>
            <FileText size={18} /> Ledger Explorer
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="nav-item" onClick={() => setCurrentView('landing')} style={{ color: '#38bdf8' }}>
          <Home size={18} /> Back to Home
        </div>
        <div className="nav-item" onClick={() => { setIsAuthenticated(false); setCurrentView('landing'); }} style={{ color: '#ef4444' }}>
          <LogIn size={18} /> Sign Out
        </div>
      </div>
    </aside>
  );

  // PAGE 3: VERIFY DOCUMENT
  if (currentView === 'verify') {
    return (
      <div className="app-layout">
        {renderSidebar()}
        <main className="main-content">
          <h2 className="page-title">Verify Document</h2>
          <div className="workspace-card" style={{ maxWidth: 700, margin: '0 auto' }}>
            <form onSubmit={handleVerify}>
              <div className="upload-dropzone">
                <FileSearch size={38} color="#2563eb" style={{ marginBottom: 12 }} />
                {!verifyFileInput ? (
                  <div>
                    <input type="file" id="fileInput" onChange={e => setVerifyFileInput(e.target.files[0])} style={{ display: 'none' }} required />
                    <label htmlFor="fileInput" style={{ background: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', display: 'inline-block' }}>
                      Choose File
                    </label>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '1rem' }}>✓ Selected: {verifyFileInput.name}</p>
                    <button type="button" onClick={() => setVerifyFileInput(null)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.8rem', cursor: 'pointer', marginTop: 8 }}>
                      Remove & Choose Different File
                    </button>
                  </div>
                )}
              </div>
              <button type="submit" style={{ width: '100%', background: '#2563eb', color: '#fff', padding: 12, borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Verify Document Authenticity
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // PAGE 4: PROVENANCE LEDGER
  if (currentView === 'ledger') {
    return (
      <div className="app-layout">
        {renderSidebar()}
        <main className="main-content">
          <h2 className="page-title">Provenance Ledger</h2>
          <div className="workspace-card">
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr><th>ID</th><th>Title</th><th>Issuer</th><th>SHA-256 Hash</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td>#{doc.id}</td>
                      <td style={{ fontWeight: 600 }}>{doc.title}</td>
                      <td>{doc.issuerUsername}</td>
                      <td><code>{doc.sha256Hash.substring(0, 20)}...</code></td>
                      <td>
                        <button style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }} onClick={() => handleRevoke(doc.id)}>Revoke</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // OTHER WORKSPACE PAGES
  if (currentView === 'dashboard') {
    return (
      <div className="app-layout">
        {renderSidebar()}
        <main className="main-content">
          <h2 className="page-title">Good Morning, Admin 👋</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}><span>Total Documents</span><h3>1,284</h3></div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}><span>Verified Today</span><h3 style={{ color: '#38bdf8' }}>152</h3></div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}><span>Revoked Hashes</span><h3 style={{ color: '#ef4444' }}>21</h3></div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}><span>Active Issuers</span><h3 style={{ color: '#22c55e' }}>341</h3></div>
          </div>
        </main>
      </div>
    );
  }

  if (currentView === 'register') {
    return (
      <div className="app-layout">
        {renderSidebar()}
        <main className="main-content">
          <h2 className="page-title">Register Document</h2>
          <div className="workspace-card" style={{ maxWidth: 700, margin: '0 auto' }}>
            <form onSubmit={handleRegister}>
              <div className="form-group"><label>Document Title</label><input className="form-input" type="text" value={regTitle} onChange={e => setRegTitle(e.target.value)} required /></div>
              <div className="form-group"><label>Issuing Authority</label><input className="form-input" type="text" value={regIssuer} onChange={e => setRegIssuer(e.target.value)} required /></div>
              <div className="upload-dropzone"><Upload size={38} color="#2563eb" /><p>{regFile ? regFile.name : "Select document file"}</p><input type="file" onChange={e => setRegFile(e.target.files[0])} style={{ marginTop: 12 }} required /></div>
              <button type="submit" style={{ width: '100%', background: '#2563eb', color: '#fff', padding: 12, borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}>Submit to Blockchain Ledger</button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return null;
}