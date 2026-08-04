export type Species = {
  id: string;
  name: string;
  family: string;
  wingspanCm: number;
};

export const species: Species[] = [
  { id: "apus-apus", name: "Common swift", family: "Apodidae", wingspanCm: 42 },
  { id: "hirundo-rustica", name: "Barn swallow", family: "Hirundinidae", wingspanCm: 33 },
  { id: "falco-peregrinus", name: "Peregrine falcon", family: "Falconidae", wingspanCm: 104 },
  { id: "cygnus-cygnus", name: "Whooper swan", family: "Anatidae", wingspanCm: 225 },
  { id: "parus-major", name: "Great tit", family: "Paridae", wingspanCm: 24 },
  { id: "corvus-corax", name: "Common raven", family: "Corvidae", wingspanCm: 130 },
];
