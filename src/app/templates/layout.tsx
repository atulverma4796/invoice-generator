import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Saved Invoices",
  robots: { index: false, follow: false },
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
