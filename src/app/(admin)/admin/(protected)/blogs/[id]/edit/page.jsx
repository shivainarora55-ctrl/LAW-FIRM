import { notFound } from "next/navigation";
import PageHeading from "@/components/portal/PageHeading/PageHeading";
import BlogForm from "@/components/admin/BlogForm/BlogForm";
import DeleteBlogForm from "@/components/admin/DeleteBlogForm/DeleteBlogForm";
import { posts } from "@/lib/storage";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = await posts.findById(id);
  return { title: post ? `Edit ${post.title}` : "Edit post" };
}

export default async function EditBlogPage({ params }) {
  const { id } = await params;
  const post = await posts.findById(id);
  if (!post) notFound();
  return <><PageHeading title="Edit post" description={`${post.status} · /insights/${post.slug}`} /><BlogForm post={post} /><DeleteBlogForm postId={post.id} /></>;
}
