import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";

export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
