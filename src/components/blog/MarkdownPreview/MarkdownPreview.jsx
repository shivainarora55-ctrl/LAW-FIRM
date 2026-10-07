"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownPreview({ markdown }) {
  return <article className="prose prose-sm max-w-none text-brand-black [&_a]:text-brand-red [&_a]:underline [&_h1]:mt-6 [&_h1]:text-2xl [&_h2]:mt-5 [&_h2]:text-xl [&_p]:my-3 [&_ul]:my-3 [&_ol]:my-3"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{ a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> }}>{markdown}</ReactMarkdown></article>;
}
