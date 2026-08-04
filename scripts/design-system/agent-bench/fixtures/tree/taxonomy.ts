export type TaxonomyNode = {
  id: string;
  label: string;
  children?: TaxonomyNode[];
};

export const taxonomy: TaxonomyNode[] = [
  {
    id: "passeriformes",
    label: "Passeriformes",
    children: [
      { id: "corvidae", label: "Corvidae" },
      { id: "paridae", label: "Paridae" },
      { id: "hirundinidae", label: "Hirundinidae" },
    ],
  },
  {
    id: "falconiformes",
    label: "Falconiformes",
    children: [{ id: "falconidae", label: "Falconidae" }],
  },
  { id: "apodiformes", label: "Apodiformes" },
];
