import type { ReactNode } from "react";
import "./globals.css";
import "../src/marco_frontend/src/shared/styles/App.css";
import "../src/marco_frontend/src/features/ios-interface/styles/Home.css";
import "../src/marco_frontend/src/features/ios-interface/styles/Dock.css";
import "../src/marco_frontend/src/features/ios-interface/styles/GlassDock.css";
import "../src/marco_frontend/src/features/ios-interface/styles/IOSPhotos.css";
import "../src/marco_frontend/src/css/IPadFrame.css";
import "../src/marco_frontend/src/css/Finder.css";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const cvName = (process.env.NEXT_PUBLIC_CV_NAME || "Your Name").trim() || "Your Name";

export const metadata = {
  title: `${cvName} - CV`,
  description: `Curriculum vitae for ${cvName}.`,
  icons: {
    icon: [{ url: "/assets/logo.png", type: "image/png" }],
    shortcut: ["/assets/logo.png"],
    apple: [{ url: "/assets/logo.png" }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
