import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ShieldAlert,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  FileCode,
  ExternalLink,
  Info,
} from "lucide-react";
import { Finding, VerificationStatus, Severity } from "../../data/ivieMockData";
import { StatusBadge, SeverityBadge } from "./IvieBadges";

interface IvieFindingsProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
  onToggleReviewed: (id: string) => void;
  onToggleDismissed: (id: string) => void;
  onToggleConfirmed: (id: string) => void;
}

export const IvieFindings: React.FC<IvieFindingsProps> = ({
  findings,
  onSelectFinding,
  onToggleReviewed,
  onToggleDismissed,
  onToggleConfirmed,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [reviewStateFilter, setReviewStateFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"confidence" | "severity" | "id">("confidence");

  const filteredFindings = useMemo(() => {
    return findings
      .filter((finding) => {
        const matchesSearch =
          finding.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          finding.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          finding.file.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSeverity =
          severityFilter === "All" || finding.severity === severityFilter;

        const matchesStatus =
          statusFilter === "All" || finding.status === statusFilter;

        let matchesReview = true;
        if (reviewStateFilter === "Unreviewed") {
          matchesReview = !finding.reviewed && !finding.dismissed;
        } else if (reviewStateFilter === "Reviewed") {
          matchesReview = finding.reviewed;
        } else if (reviewStateFilter === "Dismissed") {
          matchesReview = finding.dismissed;
        }

        return matchesSearch && matchesSeverity && matchesStatus && matchesReview;
      })
      .sort((a, b) => {
        if (sortBy === "confidence") {
          return b.confidence - a.confidence;
        }
        if (sortBy === "id") {
          return a.id.localeCompare(b.id);
        }
        // Severity order
        const order: Record<Severity, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return order[b.severity] - order[a.severity];
      });
  }, [findings, searchTerm, severityFilter, statusFilter, reviewStateFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-5">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] tracking-tight">
            Findings Explorer
          </h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Browse, triage, and confirm potential bug hypotheses classified by the Invariant Verification Engine.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#8b949e]">
          <span>Showing:</span>
          <span className="font-bold text-[#f0f6fc]">{filteredFindings.length}</span>
          <span>of {findings.length} findings</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-lg border border-[#30363d] bg-[#161b22] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8b949e]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search findings by issue, file path, ID, or description..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#c9d1d9] focus:outline-none focus:border-indigo-500"
            >
              <option value="All">Severity: All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#c9d1d9] focus:outline-none focus:border-indigo-500"
            >
              <option value="All">Status: All</option>
              <option value="Reproduced">Reproduced</option>
              <option value="Strongly Supported">Strongly Supported</option>
              <option value="Potential">Potential</option>
              <option value="Inconclusive">Inconclusive</option>
              <option value="False Positive">False Positive</option>
            </select>

            {/* Review Filter */}
            <select
              value={reviewStateFilter}
              onChange={(e) => setReviewStateFilter(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#c9d1d9] focus:outline-none focus:border-indigo-500"
            >
              <option value="All">Review: All</option>
              <option value="Unreviewed">Unreviewed</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Dismissed">Dismissed</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#c9d1d9] focus:outline-none focus:border-indigo-500"
            >
              <option value="confidence">Sort: Highest Confidence</option>
              <option value="severity">Sort: Highest Severity</option>
              <option value="id">Sort: Finding ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Explanatory Note on Confidence and Status */}
      <div className="flex items-start space-x-2 text-[11px] text-[#8b949e] px-1 italic">
        <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <span>
          Confidence is an illustrative demonstration score, not a calibrated probability. Verification status reflects the simulated evidence available in this demo.
        </span>
      </div>

      {/* Detailed Findings Table */}
      <div className="rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden">
        {filteredFindings.length === 0 ? (
          <div className="p-12 text-center text-[#8b949e] space-y-2">
            <ShieldAlert className="w-8 h-8 text-[#8b949e] mx-auto opacity-40" />
            <p className="font-semibold text-sm text-[#f0f6fc]">No findings match your filter.</p>
            <p className="text-xs">Try resetting search query or status criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0d1117] text-[#8b949e] font-mono text-[11px] border-b border-[#30363d] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">ID</th>
                  <th className="py-2.5 px-3.5">Suspected Issue</th>
                  <th className="py-2.5 px-3.5">Location</th>
                  <th className="py-2.5 px-3.5">Severity</th>
                  <th className="py-2.5 px-3.5">Verification Status</th>
                  <th className="py-2.5 px-3.5 text-right">Confidence</th>
                  <th className="py-2.5 px-3.5 text-center">Triage</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d] font-sans">
                {filteredFindings.map((finding) => (
                  <tr
                    key={finding.id}
                    onClick={() => onSelectFinding(finding)}
                    className={`hover:bg-[#1f242c] transition-colors cursor-pointer group ${
                      finding.dismissed ? "opacity-60 bg-[#0d1117]/40" : ""
                    }`}
                  >
                    <td className="py-3 px-3.5 font-mono font-bold text-indigo-400 whitespace-nowrap">
                      {finding.id}
                    </td>

                    <td className="py-3 px-3.5 max-w-sm">
                      <div className="font-semibold text-[#f0f6fc] group-hover:text-indigo-300 transition-colors flex items-center space-x-1.5">
                        <span className="truncate">{finding.title}</span>
                      </div>
                      <p className="text-[11px] text-[#8b949e] line-clamp-1 mt-0.5">
                        {finding.description}
                      </p>
                    </td>

                    <td className="py-3 px-3.5 font-mono text-[11px] text-[#8b949e] whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <FileCode className="w-3 h-3 text-[#8b949e]" />
                        <span>{finding.file}:{finding.line}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <SeverityBadge severity={finding.severity} />
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <StatusBadge status={finding.status} />
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-bold text-[#f0f6fc] whitespace-nowrap">
                      {finding.confidence}%
                    </td>

                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      {finding.dismissed ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-500/30">
                          Dismissed
                        </span>
                      ) : finding.reviewed ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                          Reviewed
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleReviewed(finding.id);
                          }}
                          title={finding.reviewed ? "Mark as unreviewed" : "Mark as reviewed"}
                          className={`p-1.5 rounded text-xs transition-colors border ${
                            finding.reviewed
                              ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                              : "bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] border-[#30363d]"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleDismissed(finding.id);
                          }}
                          title={finding.dismissed ? "Restore finding" : "Dismiss finding"}
                          className={`p-1.5 rounded text-xs transition-colors border ${
                            finding.dismissed
                              ? "bg-rose-950/40 text-rose-400 border-rose-500/30"
                              : "bg-[#21262d] text-[#8b949e] hover:text-[#f85149] border-[#30363d]"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFinding(finding);
                          }}
                          className="px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-[#ffffff] text-[11px] font-medium border border-[#30363d]"
                        >
                          Inspect →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
