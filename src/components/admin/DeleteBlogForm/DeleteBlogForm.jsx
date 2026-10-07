"use client";

import { deleteBlogPost } from "@/actions/admin";

export default function DeleteBlogForm({ postId }) {
  return (
    <form action={deleteBlogPost} className="mt-8 border-t border-line pt-5">
      <input type="hidden" name="postId" value={postId} />
      <button type="submit" onClick={(event) => { if (!window.confirm("Delete this post? This cannot be undone.")) event.preventDefault(); }} className="min-h-11 border border-brand-red px-4 text-sm font-medium text-brand-red transition-colors hover:bg-brand-red hover:text-white">Delete post</button>
    </form>
  );
}
