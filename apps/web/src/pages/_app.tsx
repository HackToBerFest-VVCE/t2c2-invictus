import type { AppProps } from "next/app";
import "../styles/globals.css";
import { Navbar } from "../components/Navbar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans selection:bg-[#58a6ff]/30 selection:text-[#f0f6fc]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Component {...pageProps} />
      </main>
      <footer className="border-t border-[#30363d] py-6 text-center text-xs text-[#8b949e] font-mono">
        Invariant &bull; Continuous Software Verification Platform &bull; HackToBerFest-VVCE
      </footer>
    </div>
  );
}
