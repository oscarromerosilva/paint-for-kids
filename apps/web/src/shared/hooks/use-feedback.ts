import { useCallback } from "react";

export function useFeedback() {
  const triggerVibration = useCallback(
    (type: "light" | "medium" | "heavy" = "light") => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        switch (type) {
          case "light":
            navigator.vibrate(15);
            break;
          case "medium":
            navigator.vibrate(30);
            break;
          case "heavy":
            navigator.vibrate([40, 30, 40]);
            break;
        }
      }
    },
    [],
  );

  const playAudio = useCallback((type: "tap" | "success" | "clear" = "tap") => {
    try {
      if (typeof window === "undefined") return;
      const AudioContext =
        window.AudioContext ||
        (
          window as unknown as {
            webkitAudioContext?: typeof window.AudioContext;
          }
        ).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Magical bell instrument
      const playBell = (
        freq: number,
        startDelay: number,
        duration: number,
        wave: OscillatorType = "sine",
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = wave;
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + startDelay;
        // Percussive envelope: fast attack, slow exponential release
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      if (type === "tap") {
        // A cute 'bloop' bubble sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "success") {
        // Magical ascending fairy wand chime (C6, E6, G6, C7)
        const notes = [1046.5, 1318.51, 1567.98, 2093.0];
        notes.forEach((freq, idx) => {
          playBell(freq, idx * 0.08, 0.4, "sine");
        });
      } else if (type === "clear") {
        // Magical descending sweep/chime (C7, G6, E6, C6)
        const notes = [2093.0, 1567.98, 1318.51, 1046.5];
        notes.forEach((freq, idx) => {
          playBell(freq, idx * 0.1, 0.5, "triangle");
        });
      }
    } catch (e) {
      console.warn("Audio feedback failed:", e);
    }
  }, []);

  return { triggerVibration, playAudio };
}
