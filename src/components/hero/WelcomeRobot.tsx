import { useEffect, useRef, useState } from "react";

export function WelcomeRobot() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const audioPlayed = useRef(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("devionic-welcome");
    if (alreadySeen) {
      setDismissed(true);
      return;
    }

    const showTimer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem("devionic-welcome", "1");

      // Play a friendly synthesized welcome chime
      if (!audioPlayed.current) {
        audioPlayed.current = true;
        try {
          const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.5]; // C major arpeggio
            notes.forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, now + i * 0.12);
              gain.gain.setValueAtTime(0, now + i * 0.12);
              gain.gain.linearRampToValueAtTime(0.08, now + i * 0.12 + 0.04);
              gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now + i * 0.12);
              osc.stop(now + i * 0.12 + 0.4);
            });
            setTimeout(() => ctx.close(), 1200);
          }
        } catch {
          // Audio autoplay blocked or unsupported — silently ignore
        }
      }

      // Leave automatically after 4.5 seconds
      const leaveTimer = setTimeout(() => {
        setLeaving(true);
        setTimeout(() => setDismissed(true), 700);
      }, 4500);

      return () => clearTimeout(leaveTimer);
    }, 900);

    return () => clearTimeout(showTimer);
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-end gap-3 transition-all duration-700 ease-out ${
        visible && !leaving ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
      }`}
      aria-live="polite"
    >
      {/* Speech bubble */}
      <div className="relative max-w-[220px] rounded-2xl rounded-br-none border border-primary/25 bg-[#0b1221]/95 px-4 py-3 shadow-2xl shadow-primary/10 backdrop-blur">
        <p className="text-sm font-semibold text-foreground">
          Welcome to <span className="text-primary">Devionic!</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Let&apos;s build something amazing together.
        </p>
        <span className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rotate-45 border-b border-r border-primary/25 bg-[#0b1221]/95" />
      </div>

      {/* Robot avatar */}
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 shadow-[0_0_24px_oklch(0.82_0.16_180_/_0.35)] backdrop-blur animate-float-robot">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className="h-11 w-11"
          aria-hidden
        >
          {/* Head */}
          <rect x="14" y="12" width="36" height="28" rx="8" fill="oklch(0.92 0.05 190)" />
          {/* Eyes */}
          <circle cx="26" cy="26" r="4" fill="oklch(0.2 0.02 220)" className="animate-robot-blink" />
          <circle cx="38" cy="26" r="4" fill="oklch(0.2 0.02 220)" className="animate-robot-blink" />
          {/* Antenna */}
          <line x1="32" y1="12" x2="32" y2="4" stroke="oklch(0.82 0.16 180)" strokeWidth="2" />
          <circle cx="32" cy="4" r="2.5" fill="oklch(0.82 0.16 180)" className="animate-pulse-glow" />
          {/* Mouth */}
          <path d="M24 36 Q32 40 40 36" stroke="oklch(0.2 0.02 220)" strokeWidth="2" strokeLinecap="round" />
          {/* Body */}
          <path d="M22 40 L18 56 H46 L42 40" fill="oklch(0.82 0.16 180 / 0.25)" stroke="oklch(0.82 0.16 180)" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
