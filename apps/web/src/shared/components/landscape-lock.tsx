import { RotateCcw } from "lucide-react";

export function LandscapeLock() {
  return (
    <div className="landscape-prompt fixed inset-0 z-[9999] flex-col items-center justify-center bg-blue-500 p-8 text-center text-white sm:hidden">
      <RotateCcw className="mb-8 h-24 w-24 animate-spin-slow" />
      <h2 className="mb-4 font-bold text-3xl">Gira tu pantalla</h2>
      <p className="text-xl">
        Para dibujar mejor, gira tu dispositivo para usarlo en modo horizontal.
      </p>

      <style>{`
        .landscape-prompt { display: none; }
        @media screen and (max-width: 900px) and (orientation: portrait) {
          .landscape-prompt { display: flex !important; }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
