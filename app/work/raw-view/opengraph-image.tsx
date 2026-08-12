import { OG_SIZE } from "../../lib/og-image-utils";
import { workOgImage } from "../workOgImage";

export const runtime = "edge";
export const alt = "Raw View, Digitaltableteur Work";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return workOgImage("raw-view", "Raw View");
}
