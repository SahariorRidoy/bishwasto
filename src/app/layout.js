import "./globals.css";
import "./custom.css";
import { ThemeProvider } from "@/components/common/theme-provider";
import ShopRequestRouteGuard from "@/components/sellerAgreement/ShopRequestRouteGuard";
import HydrateShop from "@/features/hydrateShop";
import { ReduxProvider } from "@/store/ReduxProvider";
import { Toaster } from "react-hot-toast";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Bishwasto",
  description: "A simple and elegant solution for your Business",
  icons: {
    icon: "/favicon1.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} dark:bg-background`} cz-shortcut-listen="true">
        <ReduxProvider>
          <ShopRequestRouteGuard>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster />
              <HydrateShop />
              {children}
            </ThemeProvider>
          </ShopRequestRouteGuard>
        </ReduxProvider>
      </body>
    </html>
  );
}