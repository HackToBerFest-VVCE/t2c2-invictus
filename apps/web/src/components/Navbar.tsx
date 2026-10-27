import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { checkBackendHealth } from "../services/api";
import { BackendHealth } from "../types";
import { TriggerModal } from "./TriggerModal";
import { useRepo } from "../context/RepoContext";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { activeRepo, setActiveRepo, repositories } = useRepo();
  const [health, setHealth] = useState<BackendHealth>({
    status: "checking",
    service: "invariant-api",
    connected: false,
  });
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const repoDropdownRef = useRef<HTMLDivElement>(null);

  const loadHealth = () => {
    checkBackendHealth().then((h) => setHealth(h));
  };

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (repoDropdownRef.current && !repoDropdownRef.current.contains(e.target as Node)) {
        setIsRepoDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsRepoDropdownOpen(false);
  }, [router.pathname]);

  // Profile comes FIRST as requested!
  const navItems = [
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: "Verification Runs",
      href: "/",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Repositories",
      href: "/repositories",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      label: "Compare Runs",
      href: "/compare",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      label: "Specification",
      href: "/spec",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: "IVIE Engine",
      href: "/ivie",
      icon: (
        <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: "Swagger Docs",
      href: "/docs",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <header className="border-b border-[#30363d] bg-[#161b22] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Brand Bar */}
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Left: Breadcrumb */}
            <div className="flex items-center space-x-3 min-w-0">
              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden btn-pixel btn-pixel-dark text-xs p-1.5"
                aria-label="Toggle navigation"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              <Link href="/" className="flex items-center space-x-2 text-[#f0f6fc] group">
                <div className="w-8 h-8 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center font-mono font-bold text-xs text-[#f0f6fc] group-hover:border-[#8b949e] transition-colors">
                  inv
                </div>
                <span className="font-semibold text-sm text-[#f0f6fc] hidden sm:inline">
                  Invariant
                </span>
              </Link>

              <span className="text-[#8b949e] hidden sm:inline">/</span>

              <div className="hidden sm:flex items-center space-x-1.5 text-xs text-[#8b949e]">
                <Link
                  href="/profile"
                  className="hover:text-[#f0f6fc] cursor-pointer hidden md:inline transition-colors font-mono"
                >
                  srinivas2s
                </Link>
                <span className="hidden md:inline text-[#8b949e]">/</span>

                {/* Interactive Dynamic Repository Selector */}
                <div className="relative inline-flex items-center" ref={repoDropdownRef}>
                  <button
                    onClick={() => setIsRepoDropdownOpen(!isRepoDropdownOpen)}
                    className="flex items-center space-x-1 font-semibold text-[#f0f6fc] hover:text-[#58a6ff] hover:bg-[#21262d] px-1.5 py-0.5 rounded transition-colors group cursor-pointer"
                    title="Switch active repository"
                  >
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                      {activeRepo.name}
                    </span>
                    <svg
                      className={`w-3 h-3 text-[#8b949e] group-hover:text-[#f0f6fc] transition-transform ${
                        isRepoDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ml-1 ${
                      activeRepo.visibility === "Private"
                        ? "text-[#e3b341] bg-[#d29922]/10 border-[#d29922]/30"
                        : "text-[#8b949e] bg-[#21262d]/50 border-[#30363d]"
                    }`}
                  >
                    {activeRepo.visibility}
                  </span>

                  {/* Repository Switcher Dropdown */}
                  {isRepoDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 bg-[#161b22] border border-[#30363d] rounded-md shadow-2xl py-1 z-50">
                      <div className="px-3 py-2 border-b border-[#30363d] text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider flex items-center justify-between">
                        <span>Switch Repository</span>
                        <span className="text-xs font-mono">{repositories.length} repos</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-[#21262d]/50">
                        {repositories.map((repo) => {
                          const isCurrent = repo.name === activeRepo.name;
                          return (
                            <button
                              key={repo.name}
                              onClick={() => {
                                setActiveRepo(repo);
                                setIsRepoDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#21262d] transition-colors ${
                                isCurrent ? "bg-[#1f6feb]/10 text-[#58a6ff]" : "text-[#c9d1d9]"
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate min-w-0 pr-2">
                                <span
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    isCurrent ? "bg-[#58a6ff]" : "bg-[#30363d]"
                                  }`}
                                />
                                <span className={`font-mono truncate ${isCurrent ? "font-semibold text-[#58a6ff]" : ""}`}>
                                  {repo.name}
                                </span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#30363d] text-[#8b949e] flex-shrink-0">
                                {repo.visibility}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Backend health, Buttons, Profile */}
            <div className="flex items-center space-x-3">
              {/* Backend health */}
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
                    health.connected
                      ? "bg-[#3fb950] animate-pulseGlow"
                      : "bg-[#f85149]"
                  }`}
                />
                <span className="text-[#8b949e]">
                  Backend:{" "}
                  <strong className={health.connected ? "text-[#3fb950]" : "text-[#f85149]"}>
                    {health.connected ? "Online" : "Offline"}
                  </strong>
                </span>
              </div>

              {/* Direct Link to Interactive Swagger UI */}
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-mono border border-[#30363d] bg-[#0d1117] text-[#c9d1d9] hover:text-[#f0f6fc] hover:border-[#8b949e] transition-colors"
                title="Open Interactive Swagger UI in a new tab"
              >
                <span>Docs</span>
                <span className="text-[10px]">↗</span>
              </a>

              {/* Notification bell */}
              <button className="btn-pixel btn-pixel-dark p-1.5 hidden md:flex relative pulse-dot" aria-label="Notifications">
                <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* Run Verification Button (Decent Pixel Button with Clean SVG Play Icon) */}
              <button
                onClick={() => setIsTriggerOpen(true)}
                className="btn-pixel btn-pixel-green px-3 py-1.5 text-xs space-x-1.5"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="hidden sm:inline">Run Verification</span>
              </button>

              {/* Repository Link (Clean Monochrome Code Icon, NO Octocat) */}
              <a
                href="https://github.com/HackToBerFest-VVCE/t2c2-invictus"
                target="_blank"
                rel="noreferrer"
                className="btn-pixel btn-pixel-dark p-1.5 text-[#8b949e] hover:text-[#f0f6fc] transition-colors hidden md:flex"
                title="View Repository"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </a>

              {/* Profile Avatar & Dropdown (Srinivas P Photo) */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-1.5 p-0.5 rounded-full hover:ring-1 hover:ring-[#8b949e] transition-all"
                  aria-label="User profile menu"
                >
                  <img
                    src="/profile.jpg"
                    alt="Srinivas P"
                    className="w-7 h-7 rounded-full object-cover border border-[#30363d]"
                  />
                  <svg
                    className={`w-3 h-3 text-[#8b949e] transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="profile-dropdown">
                    {/* User Info - Click to go to Profile */}
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-3 border-b border-[#30363d] hover:bg-[#21262d] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src="/profile.jpg"
                          alt="Srinivas P"
                          className="w-9 h-9 rounded-full object-cover border border-[#30363d] flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff] transition-colors truncate">
                            Srinivas P
                          </div>
                          <div className="text-xs text-[#8b949e] font-mono truncate">
                            srinivas2s
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-[#8b949e] group-hover:text-[#58a6ff] flex items-center space-x-1 transition-colors">
                        <span>View Profile</span>
                        <span>→</span>
                      </div>
                    </Link>

                    {/* Status */}
                    <div className="px-4 py-2 border-b border-[#30363d]">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
                        <span className="text-[#8b949e] font-mono">Verification Active</span>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="profile-dropdown-item font-medium text-[#f0f6fc]"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Team Profile</span>
                      </Link>
                      <Link
                        href="/"
                        className="profile-dropdown-item"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Verification Runs</span>
                      </Link>
                      <Link
                        href="/repositories"
                        className="profile-dropdown-item"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span>Repositories</span>
                      </Link>
                      <Link
                        href="/spec"
                        className="profile-dropdown-item"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Specifications</span>
                      </Link>
                    </div>

                    <div className="profile-dropdown-divider" />

                    {/* Documentation Section */}
                    <div className="py-1">
                      <Link
                        href="/docs"
                        className="profile-dropdown-item"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span>API Documentation</span>
                      </Link>
                      <a
                        href="http://localhost:8000/docs"
                        target="_blank"
                        rel="noreferrer"
                        className="profile-dropdown-item"
                      >
                        <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>Swagger Interactive</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subnav Tabs — Desktop (PROFILE COMES FIRST) */}
          <nav className="hidden lg:flex space-x-1 border-t border-[#30363d]/60 -mb-px">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-3 px-3 inline-flex items-center space-x-2 border-b-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-[#f0f6fc] text-[#f0f6fc] font-semibold"
                      : "border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#8b949e]"
                  }`}
                >
                  <span className="text-[#8b949e]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Subnav (slide-down) */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden border-t border-[#30363d]/60 py-2 space-y-0.5 animate-fadeInUp">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-[#0d1117] text-[#f0f6fc] font-semibold border-l-2 border-[#f0f6fc]"
                        : "text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]"
                    }`}
                  >
                    <span className="text-[#8b949e]">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
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
