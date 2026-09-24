/**
 * Writes the seed catalog to disk.
 *
 *   npm run seed          # create data/catalog.json only if it does not exist
 *   npm run seed -- --reset   # overwrite with the pristine seed
 *
 * Honours CATALOG_PATH. Runs on plain Node (type-stripping), no build needed.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { seedCatalog } from "../src/lib/catalog/seed.ts";

const target = process.env.CATALOG_PATH
  ? path.resolve(process.env.CATALOG_PATH)
  : path.join(process.cwd(), "data", "catalog.json");
const reset = process.argv.includes("--reset");

if (existsSync(target) && !reset) {
  console.log(`Catalog already exists at ${target}. Use --reset to overwrite.`);
  process.exit(0);
}

mkdirSync(path.dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(seedCatalog, null, 2) + "\n", "utf8");
console.log(
  `${reset ? "Reset" : "Seeded"} ${target} with ${seedCatalog.sections.length} section(s) and ${seedCatalog.forms.length} form(s).`,
);
