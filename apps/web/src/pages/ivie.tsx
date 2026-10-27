import React, { useState } from "react";
import Head from "next/head";
import { IvieSidebar, IvieTab } from "../components/ivie/IvieSidebar";
import { IvieOverview } from "../components/ivie/IvieOverview";
import { IvieRuns } from "../components/ivie/IvieRuns";
import { IvieFindings } from "../components/ivie/IvieFindings";
import { IvieRequirements } from "../components/ivie/IvieRequirements";
import { IvieTestEvidence } from "../components/ivie/IvieTestEvidence";
import { IvieSettings } from "../components/ivie/IvieSettings";
import { IvieChatContext } from "../components/ivie/IvieChatContext";
import { IvieChatContextDrawer } from "../components/ivie/IvieChatContextDrawer";
import { IvieFindingDetailModal } from "../components/ivie/IvieFindingDetailModal";
import {
  Finding,
  VerificationRun,
  VerificationStatus,
  ChatContextFile,
  INITIAL_FINDINGS,
  INITIAL_VERIFICATION_RUNS,
  INITIAL_REQUIREMENTS,
  INITIAL_TEST_EVIDENCE,
  INITIAL_CHAT_CONTEXTS,
} from "../data/ivieMockData";

export default function IviePage() {
  const [activeTab, setActiveTab] = useState<IvieTab>("overview");
  const [selectedRepo, setSelectedRepo] = useState<string>("acme/checkout-service");
  const [findings, setFindings] = useState<Finding[]>(INITIAL_FINDINGS);
  const [runs, setRuns] = useState<VerificationRun[]>(INITIAL_VERIFICATION_RUNS);
  const [requirements] = useState(INITIAL_REQUIREMENTS);
  const [testEvidence] = useState(INITIAL_TEST_EVIDENCE);
  const [chatContexts, setChatContexts] = useState<ChatContextFile[]>(INITIAL_CHAT_CONTEXTS);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [inspectedFinding, setInspectedFinding] = useState<Finding | null>(null);

  const handleAddContext = (newCtx: ChatContextFile) => {
    setChatContexts((prev) => [newCtx, ...prev]);
  };

  const handleDeleteContext = (id: string) => {
    setChatContexts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleFeedHypothesesToFindings = (newFinding: Finding) => {
    setFindings((prev) => [newFinding, ...prev]);
  };

  // Actions for findings state
  const handleToggleReviewed = (id: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, reviewed: !f.reviewed } : f))
    );
    if (inspectedFinding && inspectedFinding.id === id) {
      setInspectedFinding((prev) => (prev ? { ...prev, reviewed: !prev.reviewed } : null));
    }
  };

  const handleToggleConfirmed = (id: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, confirmed: !f.confirmed, dismissed: false } : f))
    );
    if (inspectedFinding && inspectedFinding.id === id) {
      setInspectedFinding((prev) =>
        prev ? { ...prev, confirmed: !prev.confirmed, dismissed: false } : null
      );
    }
  };

  const handleToggleDismissed = (id: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, dismissed: !f.dismissed, confirmed: false } : f))
    );
    if (inspectedFinding && inspectedFinding.id === id) {
      setInspectedFinding((prev) =>
        prev ? { ...prev, dismissed: !prev.dismissed, confirmed: false } : null
      );
    }
  };

  const handleChangeStatus = (id: string, newStatus: VerificationStatus) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    );
    if (inspectedFinding && inspectedFinding.id === id) {
      setInspectedFinding((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleAddRun = (newRun: VerificationRun) => {
    setRuns((prev) => [newRun, ...prev]);
  };

  const handleSelectFindingById = (findingId: string) => {
    const target = findings.find((f) => f.id === findingId);
    if (target) {
      setInspectedFinding(target);
    } else {
      setActiveTab("findings");
    }
  };

  const unreviewedCount = findings.filter((f) => !f.reviewed && !f.dismissed).length;

  return (
    <>
      <Head>
        <title>IVIE — Invariant Verification Intelligence Engine</title>
        <meta
          name="description"
          content="Interactive mockup of IVIE: Invariant Verification Intelligence Engine. Evaluate suspected issues against requirements, code changes, and test evidence."
        />
      </Head>

      <div className="flex bg-[#0d1117] min-h-[calc(100vh-65px)] text-[#c9d1d9] -mx-4 sm:-mx-6 lg:-mx-8 -my-6">
        {/* Left Persistent Sidebar */}
        <IvieSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedRepo={selectedRepo}
          onRepoChange={setSelectedRepo}
          findingsCount={findings.length}
          unreviewedCount={unreviewedCount}
          contextCount={chatContexts.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-6 lg:p-8 overflow-y-auto max-w-7xl">
          {activeTab === "overview" && (
            <IvieOverview
              findings={findings}
              selectedRepo={selectedRepo}
              onSelectFinding={setInspectedFinding}
              onNavigateToRuns={() => setActiveTab("runs")}
              onNavigateToFindings={() => setActiveTab("findings")}
            />
          )}

          {activeTab === "runs" && (
            <IvieRuns
              runs={runs}
              onAddRun={handleAddRun}
              selectedRepo={selectedRepo}
            />
          )}

          {activeTab === "findings" && (
            <IvieFindings
              findings={findings}
              onSelectFinding={setInspectedFinding}
              onToggleReviewed={handleToggleReviewed}
              onToggleDismissed={handleToggleDismissed}
              onToggleConfirmed={handleToggleConfirmed}
            />
          )}

          {activeTab === "requirements" && (
            <IvieRequirements
              requirements={requirements}
              findings={findings}
              onSelectFinding={setInspectedFinding}
            />
          )}

          {activeTab === "evidence" && (
            <IvieTestEvidence
              testEvidence={testEvidence}
              findings={findings}
              onSelectFindingById={handleSelectFindingById}
            />
          )}

          {activeTab === "context" && (
            <IvieChatContext
              chatContexts={chatContexts}
              onAddContext={handleAddContext}
              onDeleteContext={handleDeleteContext}
              onFeedHypothesesToFindings={handleFeedHypothesesToFindings}
            />
          )}

          {activeTab === "settings" && (
            <IvieSettings
              selectedRepo={selectedRepo}
              onRepoChange={setSelectedRepo}
            />
          )}
        </main>
      </div>

      {/* Docked Side Tab & Slide-Out Drawer for Chat Context */}
      <IvieChatContextDrawer
        isOpen={isChatDrawerOpen}
        onOpen={() => setIsChatDrawerOpen(true)}
        onClose={() => setIsChatDrawerOpen(false)}
        chatContexts={chatContexts}
        onAddContext={handleAddContext}
        onFeedHypothesesToFindings={handleFeedHypothesesToFindings}
      />

      {/* Global Finding Detail Modal */}
      <IvieFindingDetailModal
        finding={inspectedFinding}
        onClose={() => setInspectedFinding(null)}
        onToggleReviewed={handleToggleReviewed}
        onToggleConfirmed={handleToggleConfirmed}
        onToggleDismissed={handleToggleDismissed}
        onChangeStatus={handleChangeStatus}
        onNavigateToRequirement={(reqId) => {
          setActiveTab("requirements");
        }}
        onNavigateToTest={(testId) => {
          setActiveTab("evidence");
        }}
      />
    </>
  );
}
