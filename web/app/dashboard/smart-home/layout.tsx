import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Home",
};

export default function SmartHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
