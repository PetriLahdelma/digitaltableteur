import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

const brandImage =
  process.env.NODE_ENV === "production"
    ? "./storybook_logo.svg"
    : "/storybook_logo.svg";

addons.setConfig({
  theme: create({
    base: "dark",
    brandTitle: "Digitaltableteur",
    brandUrl: "https://digitaltableteur.com",
    brandImage,
    brandTarget: "_self",
  }),
});
