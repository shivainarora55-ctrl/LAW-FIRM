import Container from "@/components/ui/Container/Container";

const TONES = {
  white: "bg-white text-brand-black",
  gray: "bg-soft-gray text-brand-black",
  dark: "bg-brand-black text-white",
};

export default function Section({ id, tone = "white", className = "", style, children }) {
  return (
    <section id={id} style={style} className={`scroll-mt-20 py-16 sm:py-20 lg:py-24 ${TONES[tone]} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}
