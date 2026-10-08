import { notFound } from "next/navigation";
import Article from "./article";
import { ARTICLES, getArticle } from "./article.js";

export function generateStaticParams() {
  return ARTICLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  return article ? { title: article.title, description: article.excerpt } : {};
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) notFound();

  return <Article article={article} />;
}
