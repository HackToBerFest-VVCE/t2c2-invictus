import React from "react";
import { X, CheckCircle2, Terminal, Clock, Cpu } from "lucide-react";
import { PipelineStage } from "../../data/ivieMockData";

interface IviePipelineStageModalProps {
  stage: PipelineStage | null;
  onClose: () => void;
}

export const IviePipelineStageModal: React.FC<IviePipelineStageModalProps> = ({
  stage,
  onClose,
}) => {
  if (!stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl max-w-xl w-full overflow-hidden text-[#c9d1d9]">
        <div className="p-4 px-5 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-[#f0f6fc]">
              Pipeline Stage: {stage.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#8b949e] block">
                Execution Duration
              </span>
              <span className="font-mono text-xs font-semibold text-[#f0f6fc] flex items-center space-x-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{stage.duration}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#8b949e] block">
                Stage Metrics
              </span>
              <span className="font-mono text-xs font-semibold text-[#f0f6fc] flex items-center space-x-1 mt-0.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>{stage.metrics}</span>
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="font-semibold text-xs text-[#f0f6fc]">Stage Summary</span>
            <p className="text-[#c9d1d9] leading-relaxed bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
              {stage.details}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-semibold text-xs text-[#f0f6fc] flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Simulated Verification Engine Telemetry</span>
            </span>
            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] font-mono text-[11px] text-[#8b949e] space-y-1">
              <p className="text-emerald-400">[info] Stage initiated: {stage.name}</p>
              <p>[info] Parsed AST delta: src/checkout-service.git (tree hash a82f19c)</p>
              <p>[trace] Contract evaluation completed with exit code 0 ({stage.duration})</p>
              <p className="text-indigo-400">[success] Verification state materialized into IVIE engine memory</p>
            </div>
          </div>
        </div>

        <div className="p-3 px-5 border-t border-[#30363d] bg-[#0d1117] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-[#21262d] text-xs font-medium text-[#c9d1d9] hover:text-[#f0f6fc] border border-[#30363d]"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
