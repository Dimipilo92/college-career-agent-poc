import fs from "node:fs";
import path from "node:path";
import { experienceCatalog } from "../src/experiences/catalog";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const ids = new Set<string>();

for (const experience of experienceCatalog) {
  if (ids.has(experience.id)) {
    throw new Error(`Duplicate experience id: ${experience.id}`);
  }
  ids.add(experience.id);

  const scaffoldPath = path.join(repositoryRoot, experience.scaffoldPath);
  if (!fs.existsSync(scaffoldPath)) {
    throw new Error(`Missing ${experience.status} scaffold: ${experience.scaffoldPath}`);
  }

  if (experience.status === "delivered" && (!experience.toolName || !experience.resourceUri)) {
    throw new Error(`Delivered experience is missing its MCP registration: ${experience.id}`);
  }
}

console.log(`Scaffold check passed: ${experienceCatalog.length} experience definitions; ${ids.size} unique ids.`);