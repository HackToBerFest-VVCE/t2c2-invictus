import type { AppProps } from "next/app";
import "../styles/globals.css";
import { Navbar } from "../components/Navbar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Component {...pageProps} />
      </main>
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Invariant Continuous Verification Platform &bull; Team INVICTUS &bull; HackToBerFest-VVCE
      </footer>
    </div>
  );
}
