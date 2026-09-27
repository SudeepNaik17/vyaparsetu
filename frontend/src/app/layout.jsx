import "@/styles/globals.css";
import "@/styles/responsive.css";
import "@/styles/home-assistant.css";
import { AppProvider } from "@/context/AppContext";
export const metadata = {
  title: "VyaparSetu — Bol ke business chalao.",
  description:
    "Voice-first bookkeeping for your kirana store. Frontend preview.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
