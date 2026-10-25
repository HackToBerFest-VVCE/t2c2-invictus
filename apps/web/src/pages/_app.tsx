import type { AppProps } from "next/app";
import "../styles/globals.css";
import { Navbar } from "../components/Navbar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="relative min-h-screen bg-[#090d16] text-[#c9d1d9] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white overflow-hidden">
      {/* Ambient Liquid Glowing Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[140px] animate-liquid-slow" />
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-sky-500/12 blur-[150px] animate-liquid-fast" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[140px] animate-liquid-slow" />
      </div>

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Component {...pageProps} />
        </main>
        <footer className="border-t border-white/[0.07] bg-[#090d16]/50 backdrop-blur-md py-6 text-center text-xs text-[#8b949e] font-mono">
          <div className="flex items-center justify-center space-x-2">
            <span>Invariant</span>
            <span>&bull;</span>
            <span className="text-indigo-400">Continuous Software Verification</span>
            <span>&bull;</span>
            <span>HackToBerFest-VVCE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
