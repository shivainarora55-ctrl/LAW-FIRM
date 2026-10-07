import { ARTICLES } from "@/app/articles/[slug]/article.js";
import { BLOGS } from "@/app/blogs/[slug]/blog.js";

export const INSIGHTS = [...ARTICLES, ...BLOGS];
