import type { Metadata } from "next";
import "./globals.css";
import SidebarLayout from "@/src/components/sidebar";
import { EngineProvider } from "@/src/context/EngineContext";

export const metadata: Metadata = {
    title: "ParaSecure Paradox",
    description: "Sovereign Structural Transformer Engine",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <EngineProvider>
                    <SidebarLayout credits={{ name: "Natnael Ermiyas", role: "Young Innovator & Developer" }}>
                        {children}
                    </SidebarLayout>
                </EngineProvider>
            </body>
        </html>
    );
}
