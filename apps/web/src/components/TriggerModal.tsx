import React, { useState } from "react";
import { useRouter } from "next/router";
import { triggerManualRun } from "../services/api";

interface TriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TriggerModal: React.FC<TriggerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const router = useRouter();
  const [workspacePath, setWorkspacePath] = useState("examples/inventory-api");
  const [specPath, setSpecPath] = useState("examples/inventory-api/INVARIANT.md");
  const [branch, setBranch] = useState("main");
  const [commitSha, setCommitSha] = useState("HEAD");
  const [repoId, setRepoId] = useState("t2c2-invictus");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const run = await triggerManualRun({
        workspace_path: workspacePath,
        spec_path: specPath,
        branch,
        commit_sha: commitSha,
        repository_id: repoId,
      });

      if (onSuccess) onSuccess();
      onClose();
      router.push(`/runs/${run.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to trigger run.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c121e]/90 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-[#c9d1d9] overflow-hidden">
        {/* Header with Liquid Glass Gradient */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center space-x-2.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              ▶
            </span>
            <h3 className="font-semibold text-sm text-white">
              Trigger Invariant Verification Run
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-lg font-mono leading-none p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-[#8b949e] leading-relaxed">
            Dispatches an isolated verification job through the FastAPI backend
            to execute and assert requirements declared in <code className="text-indigo-400 font-mono">INVARIANT.md</code>.
          </p>

          {errorMsg && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg font-mono">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-white/90 mb-1">
                Repository Identifier
              </label>
              <input
                type="text"
                value={repoId}
                onChange={(e) => setRepoId(e.target.value)}
                className="w-full px-3.5 py-2 glass-input rounded-lg font-mono text-[#c9d1d9] focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-white/90 mb-1">
                Workspace Path
              </label>
              <input
                type="text"
                value={workspacePath}
                onChange={(e) => setWorkspacePath(e.target.value)}
                placeholder="examples/inventory-api"
                className="w-full px-3.5 py-2 glass-input rounded-lg font-mono text-[#c9d1d9] focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-white/90 mb-1">
                Specification File Path
              </label>
              <input
                type="text"
                value={specPath}
                onChange={(e) => setSpecPath(e.target.value)}
                placeholder="examples/inventory-api/INVARIANT.md"
                className="w-full px-3.5 py-2 glass-input rounded-lg font-mono text-[#c9d1d9] focus:outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-white/90 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2 glass-input rounded-lg font-mono text-[#c9d1d9] focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-white/90 mb-1">
                  Commit SHA
                </label>
                <input
                  type="text"
                  value={commitSha}
                  onChange={(e) => setCommitSha(e.target.value)}
                  className="w-full px-3.5 py-2 glass-input rounded-lg font-mono text-[#c9d1d9] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08] hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border border-emerald-400/30 shadow-[0_4px_18px_rgba(16,185,129,0.35)] transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin text-xs">↻</span>
                  <span>Executing Verification...</span>
                </>
              ) : (
                <>
                  <span>▶</span>
                  <span>Run Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
