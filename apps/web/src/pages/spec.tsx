import React, { useState, useEffect } from "react";
import Head from "next/head";
import { TriggerModal } from "../components/TriggerModal";

interface SpecData {
  filePath: string;
  specVersion: string;
  targetScope: string;
  content: string;
}

export default function SpecPage() {
  const [spec, setSpec] = useState<SpecData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/spec")
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to load specification file");
        }
        return res.json();
      })
      .then((data) => setSpec(data))
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Head>
        <title>INVARIANT.md Specification &bull; Invariant</title>
      </Head>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                spec_version: {spec?.specVersion || "1.0.0"}
              </span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                scope: {spec?.targetScope || "Root"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold liquid-title mt-2">
              INVARIANT.md Specification Explorer
            </h1>
            <p className="text-xs text-[#8b949e] mt-1">
              Live declarative specification file loaded directly from the project repository.
            </p>
          </div>

          <button
            onClick={() => setIsTriggerOpen(true)}
            className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border border-emerald-400/30 shadow-[0_4px_18px_rgba(16,185,129,0.35)] transition-all"
          >
            Verify Specifications Now
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#8b949e] liquid-glass rounded-2xl font-mono text-xs space-y-2">
            <span className="animate-spin inline-block mr-2 text-indigo-400 text-base">↻</span>
            <div>Reading INVARIANT.md from workspace...</div>
          </div>
        ) : errorMsg ? (
          <div className="p-6 text-xs font-mono bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl backdrop-blur-md">
            {errorMsg}
          </div>
        ) : !spec ? (
          <div className="p-16 text-center liquid-glass rounded-2xl text-[#8b949e]">
            No specification found.
          </div>
        ) : (
          <div className="liquid-glass rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#8b949e]">
              <span className="text-indigo-400 font-semibold">{spec.filePath}</span>
              <span className="bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/5 text-[11px]">
                Raw Markdown Source
              </span>
            </div>
            <div className="p-6 overflow-x-auto bg-[#070b13]/80">
              <pre className="font-mono text-xs text-white/90 leading-relaxed whitespace-pre-wrap">
                {spec.content}
              </pre>
            </div>
          </div>
        )}
      </div>

      <TriggerModal
        isOpen={isTriggerOpen}
        onClose={() => setIsTriggerOpen(false)}
      />
    </>
  );
}
