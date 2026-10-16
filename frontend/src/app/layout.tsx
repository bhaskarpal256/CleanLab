import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CleanLab Resume — Smart Resume Customizer & ATS Tailor",
  description: "Intelligently tailor your resume to any Job Description with AI. Rewrite summaries, optimize experience bullets, discover missing keywords, and export ATS-ready PDF/DOCX.",
  keywords: ["resume customizer", "AI resume builder", "ATS optimizer", "job description matcher", "CleanLab Resume"],
  authors: [{ name: "Full-Stack Developer Candidate" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body
        className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
