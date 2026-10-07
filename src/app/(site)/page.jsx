import Hero from "@/components/sections/Hero/Hero";
import About from "@/components/sections/About/About";
import Expertise from "@/components/sections/Expertise/Expertise";
import Insights from "@/components/sections/Insights/Insights";
import { posts } from "@/lib/storage";
import { formatDate } from "@/lib/format";

export default async function HomePage() {
  const latestPosts = await posts.listPublished({ limit: 6 });
  const insights = latestPosts.map(({ slug, type, title, publishedAt, excerpt }) => ({ slug, type, title, date: formatDate(publishedAt), excerpt }));
  return (
    <>
      <Hero />
      <About />
      <Expertise />
      <Insights insights={insights} />
    </>
  );
}
