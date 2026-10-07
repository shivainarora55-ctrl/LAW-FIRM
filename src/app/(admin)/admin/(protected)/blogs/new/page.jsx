import PageHeading from "@/components/portal/PageHeading/PageHeading";
import BlogForm from "@/components/admin/BlogForm/BlogForm";

export const metadata = { title: "New Post" };
export default function NewBlogPage() { return <><PageHeading title="New article or blog" description="Draft the post in Markdown and preview it before publishing." /><BlogForm /></>; }
