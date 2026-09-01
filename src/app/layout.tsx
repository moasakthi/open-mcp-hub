import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";

const firaSans = Fira_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "open-mcp-hub",
  description: "Centralized registry and catalog for MCP servers and their tools.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html lang="en" className={`dark ${firaSans.variable} ${firaCode.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          {session?.user ? (
            <AppShell user={{ email: session.user.email, isAdmin: session.user.isAdmin }}>{children}</AppShell>
          ) : (
            <div className="flex flex-1 flex-col">{children}</div>
          )}
        </TooltipProvider>
      </body>
    </html>
  );
}
