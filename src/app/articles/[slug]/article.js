export const ARTICLES = [
  {
    slug: "what-to-do-after-a-cheque-bounces",
    type: "Article",
    title: "What to Do After a Cheque Bounces",
    date: "12 Sep 2026",
    excerpt: "The notice deadlines under Section 138 and the steps that protect your claim.",
  },
  {
    slug: "reporting-online-fraud-quickly",
    type: "Article",
    title: "Reporting Online Fraud: The First Hour Matters",
    date: "28 Aug 2026",
    excerpt: "Where to report, what evidence to keep and how banks can freeze transactions.",
  },
  {
    slug: "bail-basics-explained",
    type: "Article",
    title: "Bail Basics Explained in Plain Language",
    date: "10 Aug 2026",
    excerpt: "Anticipatory bail, regular bail and what courts look at before granting either.",
  },
];

export function getArticle(slug) {
  return ARTICLES.find((article) => article.slug === slug);
}
