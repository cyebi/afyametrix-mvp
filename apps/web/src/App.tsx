import { useState } from "react";
import splash from "./Assets/Frame.svg";
import success from "./Assets/Frame-4.svg";
import register from "./Assets/Frame-2.svg";
import login from "./Assets/Frame-1.svg";
import loginError from "./Assets/Frame-3.svg";

type ScreenKey = "splash" | "success" | "register" | "login" | "loginError";

const screens: Array<{ key: ScreenKey; label: string; src: string }> = [
  { key: "splash", label: "Splash", src: splash },
  { key: "success", label: "Success", src: success },
  { key: "register", label: "Register", src: register },
  { key: "login", label: "Login", src: login },
  { key: "loginError", label: "Login Error", src: loginError },
];

export function App() {
  const [active, setActive] = useState<ScreenKey>("splash");
  const current = screens.find((item) => item.key === active) ?? screens[0];

  return (
    <main className="preview-page">
      <header className="preview-header">
        <h1>Afyametrix Android UI Preview</h1>
        <p>Direct Figma-export screen preview for pixel-accurate iteration.</p>
      </header>

      <nav className="screen-nav" aria-label="Screen selector">
        {screens.map((item) => (
          <button
            key={item.key}
            type="button"
            className={item.key === active ? "nav-pill active" : "nav-pill"}
            onClick={() => setActive(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <section className="phone-shell">
        <img className="phone-screen" src={current.src} alt={`Afyametrix ${current.label} screen`} />
      </section>
    </main>
  );
}
