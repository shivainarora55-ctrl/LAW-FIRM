"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveBlogPost } from "@/actions/admin";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";
import MarkdownPreview from "@/components/blog/MarkdownPreview/MarkdownPreview";

export default function BlogForm({ post = null }) {
  const [state, action] = useActionState(saveBlogPost, null);
  const [body, setBody] = useState(post?.body ?? "");
  const [preview, setPreview] = useState(false);
  if (state?.ok && state.slug) {
    return <div role="status" className="border-l-4 border-brand-red bg-soft-gray p-5"><p>{state.message}</p><Link href={`/admin/blogs/${state.postId}/edit`} className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-brand-red">Continue editing</Link></div>;
  }
  return (
    <form action={action} className="max-w-4xl space-y-5">
      <ActionFeedback state={state} />
      {post && <input type="hidden" name="postId" value={post.id} />}
      <FormField label="Title" name="title" defaultValue={post?.title} minLength={5} maxLength={160} required error={state?.errors?.title} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Type" name="type" as="select" defaultValue={post?.type ?? "Article"} required><option>Article</option><option>Blog</option></FormField>
        <FormField label="Status" name="status" as="select" defaultValue={post?.status ?? "draft"} required><option value="draft">Draft</option><option value="published">Published</option></FormField>
      </div>
      <FormField label="Excerpt" name="excerpt" as="textarea" rows={3} defaultValue={post?.excerpt} maxLength={200} required error={state?.errors?.excerpt} />
      <div><div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="body" className="text-sm font-medium">Article body (Markdown)</label><button type="button" onClick={() => setPreview((value) => !value)} className="min-h-11 px-3 text-sm font-medium text-brand-red hover:text-brand-red-dark">{preview ? "Edit markdown" : "Preview"}</button></div><textarea id="body" name="body" value={body} onChange={(event) => setBody(event.target.value)} rows={16} required minLength={30} className="w-full border border-line bg-white p-3 font-mono text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />{state?.errors?.body && <p className="mt-1 text-sm text-brand-red" aria-live="polite">{state.errors.body}</p>}{preview && <div className="mt-5 border-t border-line pt-5"><MarkdownPreview markdown={body} /></div>}</div>
      <FormField label="Cover image (optional, JPG/PNG/WebP up to 2 MB)" name="coverImage" type="file" accept=".jpg,.jpeg,.png,.webp" />
      {post?.coverImage && <p className="text-xs text-muted">Current cover image: {post.coverImage}</p>}
      <SubmitButton pendingText="Saving post...">Save post</SubmitButton>
    </form>
  );
}
