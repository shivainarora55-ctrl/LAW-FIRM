import Link from "next/link";

const VARIANTS = {
  solid: "bg-brand-black text-white hover:bg-brand-red active:bg-brand-red-dark",
  outline:
    "border-2 border-brand-black text-brand-black hover:border-brand-red hover:bg-brand-red hover:text-white active:bg-brand-red-dark",
  red: "bg-brand-red text-white hover:bg-brand-red-dark active:bg-brand-red-dark",
};

const SIZES = {
  md: "px-5 py-3 text-sm",
  lg: "px-7 py-4 text-base",
};

export default function Button({ href, variant = "solid", size = "md", className = "", children, ...props }) {
  const styles = `inline-flex min-h-11 items-center justify-center gap-2 rounded-md font-semibold tracking-wide transition-colors duration-200 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (href) {
    const external = /^(tel:|mailto:|http)/.test(href);
    return external ? (
      <a href={href} className={styles} {...props}>{children}</a>
    ) : (
      <Link href={href} className={styles} {...props}>{children}</Link>
    );
  }
  return <button className={styles} {...props}>{children}</button>;
}
