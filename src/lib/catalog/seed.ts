import type { Catalog } from "./types";

export const CREATIVE_REQUEST_EMBED_URL =
  "https://form.asana.com/?k=sA5VMfv_ii_J0XNFf9PawA&d=1218331939650540&embed=true";

const SEEDED_AT = "2026-09-24T00:00:00.000Z";

/**
 * The catalog written on first boot (or by `npm run seed`) when no
 * `data/catalog.json` exists yet. Stable ids keep links reproducible.
 */
export const seedCatalog: Catalog = {
  version: 1,
  sections: [
    {
      id: "sec_creative",
      name: "Creative",
      slug: "creative",
      description:
        "Design, copy, video and brand asset requests handled by the creative team.",
      order: 1,
      visible: true,
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
    },
  ],
  forms: [
    {
      id: "form_creative_request",
      sectionId: "sec_creative",
      title: "Creative Request Form",
      slug: "creative-request-form",
      description:
        "Request new creative work — decks, one-pagers, social graphics, landing pages, video edits and campaign assets.",
      asanaEmbedUrl: CREATIVE_REQUEST_EMBED_URL,
      order: 1,
      active: true,
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
    },
  ],
};
