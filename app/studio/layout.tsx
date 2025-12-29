import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Studio | Digitaltableteur",
  description: "Sanity.io content management studio for Digitaltableteur.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
