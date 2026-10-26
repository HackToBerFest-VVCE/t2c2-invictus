import type { AppProps } from "next/app";
import "../styles/globals.css";
import { Navbar } from "../components/Navbar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Component {...pageProps} />
      </main>
      <footer className="border-t border-[#30363d] py-6 text-center text-xs text-[#8b949e]">
        <div className="flex items-center justify-center space-x-2">
          <span>Invariant</span>
          <span>&bull;</span>
          <span>Continuous Software Verification</span>
          <span>&bull;</span>
          <a
            href="https://github.com/HackToBerFest-VVCE/t2c2-invictus"
            target="_blank"
            rel="noreferrer"
            className="text-[#58a6ff] hover:underline"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
