import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/ToastProvider";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "KaamSetu",
  description: "Worker and employer service platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("kaamsetu-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <ToastProvider>
          <ConfirmProvider>
            <Navbar />

            <div className="app-layout">
              <Sidebar />

              <main className="main-content">
                {children}
              </main>
            </div>
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}