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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
                spec_version: {spec?.specVersion || "1.0.0"}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#238636]/15 text-[#3fb950] border border-[#238636]/40">
                scope: {spec?.targetScope || "Root"}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#f0f6fc] mt-2">
              INVARIANT.md Specification Explorer
            </h1>
            <p className="text-xs text-[#8b949e] mt-1">
              Live declarative specification file loaded directly from the project repository.
            </p>
          </div>

          <button
            onClick={() => setIsTriggerOpen(true)}
            className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold rounded-md border border-[#238636] bg-[#238636] text-white hover:bg-[#2ea043] transition-colors"
          >
            Verify Specifications Now
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#8b949e] border border-[#30363d] rounded-md bg-[#161b22] font-mono text-xs">
            <span className="animate-spin inline-block mr-2">↻</span>
            Reading INVARIANT.md from workspace...
          </div>
        ) : errorMsg ? (
          <div className="p-5 text-xs font-mono bg-[#da3633]/15 border border-[#da3633]/40 text-[#f85149] rounded-md">
            {errorMsg}
          </div>
        ) : !spec ? (
          <div className="p-12 text-center border border-[#30363d] rounded-md bg-[#161b22] text-[#8b949e]">
            No specification found.
          </div>
        ) : (
          <div className="border border-[#30363d] rounded-md bg-[#161b22] overflow-hidden">
            <div className="p-3 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between text-xs font-mono text-[#8b949e]">
              <span className="text-[#58a6ff]">{spec.filePath}</span>
              <span>Raw Markdown Source</span>
            </div>
            <div className="p-5 overflow-x-auto">
              <pre className="font-mono text-xs text-[#c9d1d9] leading-relaxed whitespace-pre-wrap">
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
