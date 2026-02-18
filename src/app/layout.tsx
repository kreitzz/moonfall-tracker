import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DmModeProvider } from "@/components/DmModeProvider";
import { RevealProvider } from "@/components/RevealProvider";
import NavBar from "@/components/NavBar";
import { getCampaign } from "@/lib/campaign";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shadows of Moonfall — Campaign Tracker",
  description: "An interactive tracker for Shadows of Moonfall.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const campaign = getCampaign();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-black dark:bg-black dark:text-white`}>
        <DmModeProvider>
          <RevealProvider>
            <NavBar partyName={campaign.meta.partyName} />
          <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
          <footer className="border-t border-black/10 py-10 text-center text-sm text-black/60 dark:border-white/10 dark:text-white/60">
            <div className="mx-auto max-w-6xl px-4">
              <div className="font-medium">{campaign.meta.partyName}</div>
              <div className="mt-1">Campaign tracker scaffold — generated {campaign.meta.generatedAt}</div>
            </div>
          </footer>
          </RevealProvider>
        </DmModeProvider>
      </body>
    </html>
  );
}
