import { useState } from "react";

type Screen = "splash" | "success" | "register" | "login" | "loginError";

const screenLabels: Array<{ key: Screen; label: string }> = [
  { key: "splash", label: "Splash" },
  { key: "success", label: "Success" },
  { key: "register", label: "Register" },
  { key: "login", label: "Login" },
  { key: "loginError", label: "Login Error" },
];

function LogoCard() {
  return (
    <div className="logo-card">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="0" y="0" width="64" height="64" rx="18" fill="url(#logoGradient)" />
        <path d="M15 34h10l4-9 7 16 5-8h8" fill="none" stroke="#EAFEFF" strokeWidth="4.2" strokeLinecap="round" />
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="#34E4D2" />
            <stop offset="100%" stopColor="#0C948A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function SplashScreen() {
  return (
    <section className="screen-frame splash">
      <div className="status-bar">9:41</div>
      <div className="splash-center">
        <LogoCard />
        <h1 className="brand-title">Afyametrix</h1>
        <p className="muted-text center">Disease surveillance for frontline health workers</p>
        <div className="tiny-divider" />
        <p className="highlight-text">Smarter surveillance. Faster response.</p>
      </div>
    </section>
  );
}

function SuccessScreen() {
  return (
    <section className="screen-frame success">
      <div className="status-bar">9:41</div>
      <div className="badge-top">Account created</div>
      <div className="pulse-wrap">
        <div className="ring ring-1" />
        <div className="ring ring-2" />
        <div className="ring ring-3" />
        <div className="shield">✓</div>
      </div>
      <h2 className="hero-title">
        You&apos;re in, <span>Amina!</span>
      </h2>
      <p className="muted-text center">
        Your account is ready. You can now help detect, report, and respond to disease signals faster.
      </p>
      <div className="profile-card">
        <div className="initials">AW</div>
        <div>
          <strong>Amina Wanjiku</strong>
          <p>Community Health Worker · Kisumu County</p>
        </div>
        <span className="verified">Verified</span>
      </div>
      <div className="action-stack">
        <button className="list-action">Report unusual symptoms</button>
        <button className="list-action">View local disease alerts</button>
        <button className="list-action">Submit verified field updates</button>
      </div>
      <button className="primary-button">Enter dashboard</button>
    </section>
  );
}

function RegisterScreen() {
  return (
    <section className="screen-frame register">
      <div className="status-bar">9:41</div>
      <div className="top-logo-stack">
        <LogoCard />
        <h2 className="hero-title small">
          Create <span>Afyametrix</span> Account
        </h2>
        <p className="muted-text center">Disease surveillance access for frontline health teams</p>
      </div>
      <div className="steps">
        <span>Personal</span>
        <span>Work details</span>
        <span>Security</span>
      </div>
      <div className="form-panel">
        <label>Full Name</label>
        <input placeholder="e.g. Amina Wanjiku" />
        <label>Phone Number</label>
        <input placeholder="+254 7XX XXX XXX" />
        <label>Email Address</label>
        <input placeholder="worker@health.go.ke" />
        <label>Role / Cadre</label>
        <input placeholder="Select your cadre..." />
      </div>
    </section>
  );
}

function LoginScreen({ error }: { error: boolean }) {
  return (
    <section className={`screen-frame login ${error ? "login-error" : ""}`}>
      <div className="status-bar">9:41</div>
      {error && (
        <div className="error-banner">
          <strong>Login Failed — 2 of 3 attempts used</strong>
          <p>Incorrect email or password. Account locks after 3 failed attempts.</p>
        </div>
      )}
      <div className="top-logo-stack">
        <LogoCard />
        <p className="mini-brand">Afyametrix</p>
      </div>
      <h2 className="hero-title left">
        Welcome <span>back.</span>
      </h2>
      <p className="muted-text left">Sign in to continue monitoring disease signals in your area.</p>
      <div className="form-panel thin">
        <label>Email Address</label>
        <input defaultValue={error ? "amina.w@gmail" : "worker@health.go.ke"} />
        {error && <p className="field-error">No account found with this email address.</p>}
        <label>Password</label>
        <input defaultValue="••••••••••" />
        {error && <p className="field-error">Incorrect password. 1 attempt remaining.</p>}
      </div>
      <a className="text-link" href="#">
        Forgot password?
      </a>
      <button className={`primary-button ${error ? "danger" : ""}`}>{error ? "Sign in failed" : "Sign in"}</button>
    </section>
  );
}

export function App() {
  const [screen, setScreen] = useState<Screen>("splash");

  return (
    <main className="preview-page">
      <header className="preview-header">
        <h1>Afyametrix Mobile UI Preview</h1>
        <p>Figma onboarding and login screens wired for quick visual iteration.</p>
      </header>
      <nav className="screen-nav">
        {screenLabels.map((item) => (
          <button
            key={item.key}
            type="button"
            className={screen === item.key ? "nav-pill active" : "nav-pill"}
            onClick={() => setScreen(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {screen === "splash" && <SplashScreen />}
      {screen === "success" && <SuccessScreen />}
      {screen === "register" && <RegisterScreen />}
      {screen === "login" && <LoginScreen error={false} />}
      {screen === "loginError" && <LoginScreen error />}
    </main>
  );
}
