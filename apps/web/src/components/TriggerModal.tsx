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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-lg border border-[#30363d] bg-[#161b22] shadow-2xl text-[#c9d1d9] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#21262d]/50">
          <div className="flex items-center space-x-2">
            <span className="text-[#3fb950] font-mono text-base font-bold">▶</span>
            <h3 className="font-semibold text-sm text-[#f0f6fc]">
              Trigger Invariant Verification Run
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#f0f6fc] text-lg font-mono leading-none p-1 rounded"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[#8b949e]">
            Dispatches an isolated verification job through the FastAPI backend
            to execute and assert requirements declared in <code className="text-[#58a6ff]">INVARIANT.md</code>.
          </p>

          {errorMsg && (
            <div className="p-3 text-xs bg-[#da3633]/15 border border-[#da3633]/40 text-[#f85149] rounded-md font-mono">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-[#c9d1d9] mb-1">
                Repository Identifier
              </label>
              <input
                type="text"
                value={repoId}
                onChange={(e) => setRepoId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md font-mono text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-[#c9d1d9] mb-1">
                Workspace Path
              </label>
              <input
                type="text"
                value={workspacePath}
                onChange={(e) => setWorkspacePath(e.target.value)}
                placeholder="examples/inventory-api"
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md font-mono text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-[#c9d1d9] mb-1">
                Specification File Path
              </label>
              <input
                type="text"
                value={specPath}
                onChange={(e) => setSpecPath(e.target.value)}
                placeholder="examples/inventory-api/INVARIANT.md"
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md font-mono text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#c9d1d9] mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md font-mono text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-[#c9d1d9] mb-1">
                  Commit SHA
                </label>
                <input
                  type="text"
                  value={commitSha}
                  onChange={(e) => setCommitSha(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md font-mono text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer buttons with Apple Liquid Effect */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#30363d]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-apple-liquid btn-apple-secondary px-3.5 py-1.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-apple-liquid btn-apple-green px-4 py-1.5 text-xs space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin text-xs">↻</span>
                  <span>Executing...</span>
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
