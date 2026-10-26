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
      <header className="border-b border-[#30363d] bg-[#161b22] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Brand Bar */}
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Left: GitHub-style breadcrumb */}
            <div className="flex items-center space-x-3 min-w-0">
              <Link href="/" className="flex items-center space-x-2 text-[#f0f6fc] group">
                <div className="w-8 h-8 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center font-mono font-bold text-xs text-[#58a6ff]">
                  inv
                </div>
                <span className="font-semibold text-sm text-[#f0f6fc] hidden sm:inline">
                  Invariant
                </span>
              </Link>

              <span className="text-[#8b949e]">/</span>

              <div className="flex items-center space-x-1.5 text-xs text-[#8b949e] truncate">
                <span className="hover:text-[#58a6ff] cursor-pointer hidden md:inline">
                  HackToBerFest-VVCE
                </span>
                <span className="hidden md:inline text-[#8b949e]">/</span>
                <Link
                  href="/"
                  className="font-semibold text-[#f0f6fc] hover:text-[#58a6ff] transition-colors truncate"
                >
                  t2c2-invictus
                </Link>
                <span className="text-[11px] px-2 py-0.2 rounded-full border border-[#30363d] text-[#8b949e] ml-1">
                  Public
                </span>
              </div>
            </div>

            {/* Right: Backend health indicator & Apple Liquid Button */}
            <div className="flex items-center space-x-3">
              <div
                title={
                  health.connected
                    ? `FastAPI Backend Online (v${health.version || "0.1.0"}) at http://localhost:8000`
                    : "FastAPI Backend is currently unreachable at http://localhost:8000"
                }
                className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-md text-xs font-mono border border-[#30363d] bg-[#0d1117]"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    health.connected ? "bg-[#3fb950]" : "bg-[#f85149]"
                  }`}
                />
                <span className="text-[#8b949e]">
                  Backend:{" "}
                  <strong className={health.connected ? "text-[#3fb950]" : "text-[#f85149]"}>
                    {health.connected ? "FastAPI :8000" : "Offline (:8000)"}
                  </strong>
                </span>
              </div>

              {/* Apple OS Liquid Green Button */}
              <button
                onClick={() => setIsTriggerOpen(true)}
                className="btn-apple-liquid btn-apple-green px-3.5 py-1.5 text-xs space-x-1.5"
              >
                <span>▶</span>
                <span>Run Verification</span>
              </button>

              <a
                href="https://github.com/HackToBerFest-VVCE/t2c2-invictus"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
                title="View on GitHub"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
            </div>
          </div>

          {/* GitHub Subnav Tabs */}
          <nav className="flex space-x-6 border-t border-[#30363d]/60 text-xs font-medium">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-3 inline-flex items-center space-x-2 border-b-2 transition-colors ${
                    isActive
                      ? "border-[#f78166] text-[#f0f6fc] font-semibold"
                      : "border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#8b949e]"
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
