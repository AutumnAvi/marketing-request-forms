export interface Section {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RequestForm {
  id: string;
  sectionId: string;
  title: string;
  slug: string;
  description: string;
  asanaEmbedUrl: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Catalog {
  version: 1;
  sections: Section[];
  forms: RequestForm[];
}

export type SectionInput = {
  name: string;
  slug?: string;
  description?: string;
  order?: number;
  visible?: boolean;
};

export type FormInput = {
  sectionId: string;
  title: string;
  slug?: string;
  description?: string;
  asanaEmbedUrl: string;
  order?: number;
  active?: boolean;
};

export type SectionPatch = Partial<SectionInput>;
export type FormPatch = Partial<FormInput>;

export interface SectionWithForms extends Section {
  forms: RequestForm[];
}
