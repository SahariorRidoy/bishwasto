import "../globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";


export const metadata = {
  title: "Bishwasto",
  description: "A simple and elegant solution for your Business",
};

export default function RootLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
