import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import Section from "@/components/ui/Section/Section";
import { posts } from "@/lib/storage";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await posts.findPublishedBySlug(slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function InsightArticlePage({ params }) {
  const { slug } = await params;
  const post = await posts.findPublishedBySlug(slug);
  if (!post) notFound();
  return (
    <>
      <Section tone="white" className="border-b border-line">
        <div className="max-w-3xl"><Link href="/insights" className="text-sm text-muted transition-colors hover:text-brand-red">All insights</Link><p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">{post.type} · {formatDate(post.publishedAt)}</p><h1 className="mt-3 text-3xl font-medium sm:text-4xl lg:text-5xl">{post.title}</h1><p className="mt-4 text-lg leading-relaxed text-muted">{post.excerpt}</p>{post.coverImage && <div className="relative mt-8 aspect-[16/9] max-h-[34rem] w-full"><Image src={post.coverImage} alt="" fill unoptimized className="object-cover" /></div>}</div>
      </Section>
      <Section tone="white" className="!pt-8"><article className="prose prose-lg max-w-3xl text-brand-black [&_a]:text-brand-red [&_a]:underline [&_h1]:mt-8 [&_h1]:text-3xl [&_h2]:mt-7 [&_h2]:text-2xl [&_p]:my-5"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{ a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> }}>{post.body}</ReactMarkdown></article></Section>
    </>
  );
}
