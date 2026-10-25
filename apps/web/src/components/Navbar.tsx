import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { checkBackendHealth } from "../services/api";
import { BackendHealth } from "../types";
import { TriggerModal } from "./TriggerModal";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [health, setHealth] = useState<BackendHealth>({
    status: "checking",
    service: "invariant-api",
    connected: false,
  });
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);

  const loadHealth = () => {
    checkBackendHealth().then((h) => setHealth(h));
  };

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: "Verification Runs", href: "/" },
    { label: "Repositories", href: "/repositories" },
    { label: "Specification", href: "/spec" },
  ];

  return (
    <>
      <header className="border-b border-white/[0.08] bg-[#0c121e]/70 backdrop-blur-2xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Repo Brand with Liquid Glass Badge */}
            <div className="flex items-center space-x-3.5 min-w-0">
              <Link href="/" className="flex items-center space-x-2.5 text-[#f0f6fc] group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 p-[1px] shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
                  <div className="w-full h-full rounded-[7px] bg-[#0c121e]/90 backdrop-blur-sm flex items-center justify-center font-mono font-bold text-xs text-white">
                    inv
                  </div>
                </div>
                <span className="font-semibold text-sm tracking-tight text-white hidden sm:inline">
                  Invariant
                </span>
              </Link>

              <span className="text-white/20">/</span>

              <div className="flex items-center space-x-1.5 text-xs text-[#8b949e] truncate">
                <span className="hover:text-indigo-300 transition-colors cursor-pointer hidden md:inline">
                  HackToBerFest-VVCE
                </span>
                <span className="hidden md:inline text-white/20">/</span>
                <Link
                  href="/"
                  className="font-medium text-[#f0f6fc] hover:text-indigo-400 transition-colors truncate"
                >
                  t2c2-invictus
                </Link>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[#8b949e] ml-1">
                  Public
                </span>
              </div>
            </div>

            {/* Right: Live Backend Indicator & Actions */}
            <div className="flex items-center space-x-3">
              <div
                title={
                  health.connected
                    ? `FastAPI Backend Online (v${health.version || "0.1.0"}) at http://localhost:8000`
                    : "FastAPI Backend is currently unreachable at http://localhost:8000. Start the backend with: python -m uvicorn services.api.app.main:app --port 8000"
                }
                className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-inner"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    health.connected
                      ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"
                      : "bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                  }`}
                />
                <span className="text-white/70">
                  Backend:{" "}
                  <strong className={health.connected ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                    {health.connected ? "FastAPI :8000" : "Offline (:8000)"}
                  </strong>
                </span>
              </div>

              <button
                onClick={() => setIsTriggerOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border border-emerald-400/30 shadow-[0_4px_18px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>▶</span>
                <span>Run Verification</span>
              </button>

              <a
                href="https://github.com/HackToBerFest-VVCE/t2c2-invictus"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg border border-white/5 bg-white/[0.02] text-[#8b949e] hover:text-white hover:border-white/20 transition-all"
                title="View on GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Sub Navigation Glass Tabs */}
          <nav className="flex space-x-6 border-t border-white/[0.06] text-xs font-medium">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-3 inline-flex items-center space-x-2 border-b-2 transition-all ${
                    isActive
                      ? "border-indigo-400 text-white font-semibold drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                      : "border-transparent text-white/60 hover:text-white hover:border-white/30"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <TriggerModal
        isOpen={isTriggerOpen}
        onClose={() => setIsTriggerOpen(false)}
        onSuccess={() => {
          if (router.pathname === "/") {
            router.replace(router.asPath);
          }
        }}
      />
    </>
  );
};
