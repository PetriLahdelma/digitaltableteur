// Fixture for react-package-locale-subset.test.mjs: one direct key and one
// template-literal prefix.
export const label = (t: (key: string) => string, state: string) =>
  `${t("direct")} ${t(`status.${state}`)}`;
