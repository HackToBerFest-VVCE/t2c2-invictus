import React, { useState } from "react";
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertOctagon,
  Info,
  ExternalLink,
  Code,
  X,
} from "lucide-react";
import { TestEvidenceItem, Finding } from "../../data/ivieMockData";

interface IvieTestEvidenceProps {
  testEvidence: TestEvidenceItem[];
  findings: Finding[];
  onSelectFindingById: (findingId: string) => void;
}

export const IvieTestEvidence: React.FC<IvieTestEvidenceProps> = ({
  testEvidence,
  findings,
  onSelectFindingById,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedTest, setSelectedTest] = useState<TestEvidenceItem | null>(null);

  const filteredTests = testEvidence.filter((test) => {
    const matchesSearch =
      test.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testScenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.findingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.input.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || test.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-5">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] tracking-tight">
            Targeted Test Evidence
          </h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Synthesized boundary test traces and behavioral assertions used to verify bug hypotheses.
          </p>
        </div>

        {/* Persistent Demo Notice */}
        <div className="px-3 py-1.5 rounded-md bg-indigo-950/30 border border-indigo-500/30 text-indigo-300 text-xs font-mono flex items-center space-x-2 self-start sm:self-auto">
          <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>Demo Mode: Test results are simulated fixtures</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-lg border border-[#30363d] bg-[#161b22] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8b949e]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search test traces by ID, scenario, input, or finding..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-[#8b949e] font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span>Execution Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#c9d1d9] focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All ({testEvidence.length})</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
            <option value="Inconclusive">Inconclusive</option>
            <option value="Not Executed">Not Executed</option>
          </select>
        </div>
      </div>

      {/* Tests Table */}
      <div className="rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1117] text-[#8b949e] font-mono text-[11px] border-b border-[#30363d] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">Test ID</th>
                <th className="py-2.5 px-3.5">Related Finding</th>
                <th className="py-2.5 px-3.5">Test Scenario</th>
                <th className="py-2.5 px-3.5">Input Payload</th>
                <th className="py-2.5 px-3.5">Expected Behavior</th>
                <th className="py-2.5 px-3.5">Simulated Outcome</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d] font-sans">
              {filteredTests.map((test) => (
                <tr
                  key={test.id}
                  onClick={() => setSelectedTest(test)}
                  className="hover:bg-[#1f242c] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3.5 font-mono font-bold text-amber-400 whitespace-nowrap">
                    {test.id}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-xs text-indigo-400 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFindingById(test.findingId);
                      }}
                      className="hover:underline flex items-center space-x-1"
                    >
                      <span>{test.findingId}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </button>
                  </td>

                  <td className="py-3 px-3.5 font-semibold text-[#f0f6fc] max-w-xs truncate">
                    {test.testScenario}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-[#8b949e] max-w-xs truncate">
                    {test.input}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-[#c9d1d9] max-w-xs truncate">
                    {test.expectedResult}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-rose-300 max-w-xs truncate">
                    {test.actualResult}
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {test.status === "Failed" ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-950/40 text-rose-400 border border-rose-500/30">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        <span>Failed</span>
                      </span>
                    ) : test.status === "Passed" ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Passed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                        <HelpCircle className="w-3 h-3" />
                        <span>{test.status}</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTest(test);
                      }}
                      className="px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-[#ffffff] text-[11px] font-medium border border-[#30363d]"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Details Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-[#c9d1d9]">
            <div className="p-4 px-5 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-[#f0f6fc]">
                  Test Trace: {selectedTest.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTest(null)}
                className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8b949e] block">
                    Scenario
                  </span>
                  <span className="font-semibold text-sm text-[#f0f6fc]">
                    {selectedTest.testScenario}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const fid = selectedTest.findingId;
                    setSelectedTest(null);
                    onSelectFindingById(fid);
                  }}
                  className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-mono flex items-center space-x-1"
                >
                  <span>Finding: {selectedTest.findingId}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5 font-mono">
                <span className="text-[10px] uppercase text-[#8b949e] block">
                  Simulated Input Data
                </span>
                <pre className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] text-indigo-300 overflow-x-auto">
                  <code>{selectedTest.input}</code>
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
                  <span className="text-emerald-400 font-semibold block text-[10px] uppercase">
                    Expected Invariant Result:
                  </span>
                  <p className="text-emerald-200">{selectedTest.expectedResult}</p>
                </div>
                <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
                  <span className="text-rose-400 font-semibold block text-[10px] uppercase">
                    Simulated Actual Outcome:
                  </span>
                  <p className="text-rose-200">{selectedTest.actualResult}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-xs text-[#f0f6fc]">
                  Evidence Evaluation Synthesis
                </span>
                <p className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] leading-relaxed">
                  {selectedTest.explanation}
                </p>
              </div>
            </div>

            <div className="p-3 px-5 border-t border-[#30363d] bg-[#0d1117] flex justify-end">
              <button
                onClick={() => setSelectedTest(null)}
                className="px-3.5 py-1.5 rounded-md bg-[#21262d] text-xs font-medium text-[#c9d1d9] hover:text-[#f0f6fc] border border-[#30363d]"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
