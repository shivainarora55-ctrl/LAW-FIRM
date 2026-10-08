export const BLOGS = [
  {
    slug: "before-you-buy-property",
    type: "Blog",
    title: "Five Checks Before You Buy Property",
    date: "30 Sep 2026",
    excerpt: "Title, encumbrances, approvals and the documents every buyer should see first.",
  },
  {
    slug: "first-legal-consultation-checklist",
    type: "Blog",
    title: "What to Bring to Your First Legal Consultation",
    date: "15 Sep 2026",
    excerpt: "A short checklist that saves time and helps your lawyer give better advice.",
  },
  {
    slug: "rental-agreement-mistakes",
    type: "Blog",
    title: "Common Rental Agreement Mistakes",
    date: "02 Sep 2026",
    excerpt: "Clauses landlords and tenants often overlook, and how they lead to disputes.",
  },
];

export function getBlog(slug) {
  return BLOGS.find((blog) => blog.slug === slug);
}
