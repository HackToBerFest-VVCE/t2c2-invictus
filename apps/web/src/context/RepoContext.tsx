import React, { createContext, useContext, useState, useEffect } from "react";

export interface RepoInfo {
  name: string;
  visibility: "Public" | "Private";
  lang?: string;
  langColor?: string;
  desc?: string;
  forkedFrom?: string | null;
  license?: string | null;
  updated?: string;
  stars?: number;
}

export const USER_REPOSITORIES: RepoInfo[] = [
  {
    name: "t2c2-invictus",
    visibility: "Public",
    desc: "Continuous verification engine for invariants, AST conformance, and schema diffing.",
    lang: "Python",
    langColor: "#3572A5",
    license: "MIT License",
    updated: "Updated today",
    stars: 48,
  },
  {
    name: "pragathi",
    visibility: "Private",
    desc: "Internal development project and verification test suite.",
    lang: "JavaScript",
    langColor: "#f1e05a",
    license: null,
    updated: "Updated 2 days ago",
    stars: 0,
  },
  {
    name: "tiper",
    visibility: "Private",
    desc: "Full-stack analytics dashboard and real-time telemetry service.",
    lang: "JavaScript",
    langColor: "#f1e05a",
    license: null,
    updated: "Updated 4 days ago",
    stars: 0,
  },
  {
    name: "osl-vvce-website",
    visibility: "Public",
    forkedFrom: "osl-vvce/osl-vvce-website",
    desc: "OSL Website",
    lang: "TypeScript",
    langColor: "#3178c6",
    license: "MIT License",
    updated: "Updated 4 days ago",
    stars: 1,
  },
  {
    name: "code-shelf",
    visibility: "Public",
    forkedFrom: "osl-vvce/code-shelf",
    desc: "A centralized project showcase and member directory for students at VVCE. Designed to highlight student innovation and technical expertise through public profiles and project hosting",
    lang: "TypeScript",
    langColor: "#3178c6",
    license: "Apache License 2.0",
    updated: "Updated 4 days ago",
    stars: 2,
  },
  {
    name: "scanr",
    visibility: "Public",
    desc: "High-speed document scanner and optical character recognition pipeline.",
    lang: "Vue",
    langColor: "#41b883",
    license: null,
    updated: "Updated last week",
    stars: 1,
  },
  {
    name: "casefile",
    visibility: "Public",
    desc: "Digital investigation case management and evidence locker system.",
    lang: "TypeScript",
    langColor: "#3178c6",
    license: "MIT License",
    updated: "Updated last week",
    stars: 1,
  },
  {
    name: "neon-runner",
    visibility: "Public",
    desc: "Fast asynchronous job queue and distributed runner engine.",
    lang: "JavaScript",
    langColor: "#f1e05a",
    license: null,
    updated: "Updated last week",
    stars: 0,
  },
  {
    name: "udyog-netra",
    visibility: "Private",
    desc: "Industrial telemetry monitoring and defect detection computer vision model.",
    lang: "JavaScript",
    langColor: "#f1e05a",
    license: null,
    updated: "Updated 2 weeks ago",
    stars: 0,
  },
  {
    name: "Srinivas2s",
    visibility: "Public",
    desc: "Personal GitHub configuration profile and automated workflows.",
    lang: "Markdown",
    langColor: "#8b949e",
    license: null,
    updated: "Updated 2 weeks ago",
    stars: 5,
  },
];

interface RepoContextType {
  activeRepo: RepoInfo;
  setActiveRepo: (repo: RepoInfo | string) => void;
  repositories: RepoInfo[];
}

const RepoContext = createContext<RepoContextType>({
  activeRepo: USER_REPOSITORIES[0],
  setActiveRepo: () => {},
  repositories: USER_REPOSITORIES,
});

export const RepoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRepo, setActiveRepoState] = useState<RepoInfo>(USER_REPOSITORIES[0]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("active_repo");
      if (saved) {
        const found = USER_REPOSITORIES.find((r) => r.name.toLowerCase() === saved.toLowerCase());
        if (found) {
          setActiveRepoState(found);
        }
      }
    }
  }, []);

  const setActiveRepo = (repo: RepoInfo | string) => {
    let resolved: RepoInfo | undefined;
    if (typeof repo === "string") {
      resolved = USER_REPOSITORIES.find((r) => r.name.toLowerCase() === repo.toLowerCase());
      if (!resolved) {
        resolved = {
          name: repo,
          visibility: "Public",
          desc: "Repository connected to Invariant engine.",
          lang: "TypeScript",
          langColor: "#3178c6",
          license: "MIT License",
          updated: "Updated recently",
          stars: 0,
        };
      }
    } else {
      resolved = repo;
    }

    setActiveRepoState(resolved);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_repo", resolved.name);
    }
  };

  return (
    <RepoContext.Provider
      value={{
        activeRepo,
        setActiveRepo,
        repositories: USER_REPOSITORIES,
      }}
    >
      {children}
    </RepoContext.Provider>
  );
};

export const useRepo = () => useContext(RepoContext);
