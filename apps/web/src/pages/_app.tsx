import type { AppProps } from "next/app";
import "../styles/globals.css";
import { Navbar } from "../components/Navbar";
import { RepoProvider } from "../context/RepoContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RepoProvider>
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Component {...pageProps} />
        </main>

      {/* GitHub-Style Footer */}
      <footer className="border-t border-[#30363d] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Logo + copyright */}
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center font-mono font-bold text-[9px] text-[#58a6ff]">
                inv
              </div>
              <span className="text-xs text-[#8b949e]">
                © 2026 Invariant by INVICTUS
              </span>
            </div>

            {/* Center: Nav links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#8b949e]">
              <a
                href="https://github.com/HackToBerFest-VVCE/t2c2-invictus"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#58a6ff] transition-colors"
              >
                GitHub
              </a>
              <span className="hidden sm:inline text-[#30363d]">·</span>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#58a6ff] transition-colors"
              >
                API Docs
              </a>
              <span className="hidden sm:inline text-[#30363d]">·</span>
              <a
                href="http://localhost:8000/redoc"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#58a6ff] transition-colors"
              >
                ReDoc
              </a>
              <span className="hidden sm:inline text-[#30363d]">·</span>
              <span className="text-[#8b949e]">
                Continuous Software Verification
              </span>
            </nav>

            {/* Right: Status */}
            <div className="flex items-center space-x-2 text-xs text-[#8b949e]">
              <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulseGlow" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </RepoProvider>
  );
}
