import React from "react";
import Link from "next/link";

export const Navbar: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
              I
            </div>
            <div>
              <span className="font-bold text-lg text-slate-100 tracking-tight">Invariant</span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-normal">
                Continuous Verification
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center space-x-6 text-sm">
          <Link href="/" className="text-slate-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <a
            href="https://github.com/HackToBerFest-VVCE/t2c2-invictus"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
};
