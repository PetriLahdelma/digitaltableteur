import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import NewThingsCo from "../../src/pages/work/newThingsCo";
import Illustrations from "../../src/pages/work/illustrations";
import GarageJunction from "../../src/pages/work/garageJunction";

const pages: Record<string, React.ComponentType> = {
  "new-things-co": NewThingsCo,
  illustrations: Illustrations,
  "garage-junction": GarageJunction,
};

interface Props {
  project: string;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: Object.keys(pages).map((p) => ({ params: { project: p } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => ({
  props: { project: params!.project as string },
});

export default function ProjectPage({ project }: Props) {
  const Component = pages[project];
  return Component ? <Component /> : null;
}
