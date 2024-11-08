import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import "./globals.css";
import QueryProviders from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import "react-datepicker/dist/react-datepicker.css";
import LiveBlockProvider from "@/components/providers/liveblock-provider";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-lexical/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Task Flow",
  description: "Streamline tasks, simplify projects",
  icons: {
    icon: "/assets/icons/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background font-sans antialiased",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LiveBlockProvider>
            <QueryProviders>
              <Toaster />
              {children}
            </QueryProviders>
          </LiveBlockProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
