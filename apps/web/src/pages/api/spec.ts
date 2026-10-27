import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Resolve root INVARIANT.md or example INVARIANT.md
    const possiblePaths = [
      path.resolve(process.cwd(), "../INVARIANT.md"),
      path.resolve(process.cwd(), "INVARIANT.md"),
      path.resolve(process.cwd(), "../examples/inventory-api/INVARIANT.md"),
      path.resolve(process.cwd(), "examples/inventory-api/INVARIANT.md"),
      path.resolve(process.cwd(), "../../INVARIANT.md"),
      path.resolve(process.cwd(), "../../examples/inventory-api/INVARIANT.md"),
    ];

    let foundPath = "";
    let content = "";

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        content = fs.readFileSync(p, "utf-8");
        break;
      }
    }

    if (!content) {
      return res.status(404).json({ error: "INVARIANT.md specification file not found in project workspace." });
    }

    // Extract basic frontmatter/metadata if present
    let specVersion = "1.0.0";
    let targetScope = "Root Specification";
    const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (fmMatch) {
      const fm = fmMatch[1];
      const vMatch = fm.match(/spec_version:\s*"?([^"\n]+)"?/);
      if (vMatch) specVersion = vMatch[1];
      const tMatch = fm.match(/target_system:\s*"?([^"\n]+)"?/);
      if (tMatch) targetScope = tMatch[1];
    }

    return res.status(200).json({
      filePath: path.relative(process.cwd(), foundPath),
      specVersion,
      targetScope,
      content,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load specification file" });
  }
}
