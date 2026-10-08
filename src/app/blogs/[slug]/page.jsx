import { notFound } from "next/navigation";
import Blog from "./blog";
import { BLOGS, getBlog } from "./blog.js";

export function generateStaticParams() {
  return BLOGS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = getBlog(slug);
  return blog ? { title: blog.title, description: blog.excerpt } : {};
}

export default async function BlogPage({ params }) {
  const { slug } = await params;
  const blog = getBlog(slug);

  if (!blog) notFound();

  return <Blog blog={blog} />;
}
