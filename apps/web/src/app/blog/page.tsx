import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — glamr.",
  description: "Stories, guides, and industry news from the glamr team.",
};

const POSTS = [
  {
    tag: "Industry",
    title: "The state of beauty bookings in Romania — 2026 report",
    excerpt: "We analysed 180,000 bookings made on glamr over the past 12 months. Here's what we learned about how Romanians book beauty appointments.",
    date: "Apr 18, 2026",
    mins: "9 min read",
    featured: true,
  },
  {
    tag: "For business",
    title: "How Salon Lumina went from 3 to 11 staff in 18 months",
    excerpt: "A behind-the-scenes look at how a mid-size Bucharest salon used data to make every hiring decision.",
    date: "Apr 10, 2026",
    mins: "7 min read",
    featured: false,
  },
  {
    tag: "Product",
    title: "Introducing bulk messaging: reach your whole client list in one tap",
    excerpt: "Studio plan users can now send personalised messages to segments of their client base directly from glamr.",
    date: "Apr 3, 2026",
    mins: "3 min read",
    featured: false,
  },
  {
    tag: "For clients",
    title: "How to find the right lash technician — and what to ask before you book",
    excerpt: "A practical checklist from our community of certified lash artists.",
    date: "Mar 27, 2026",
    mins: "5 min read",
    featured: false,
  },
  {
    tag: "Industry",
    title: "Why no-shows are a systemic problem — and how deposits change everything",
    excerpt: "Across glamr studios, salons that collect a deposit see 73% fewer no-shows. The data is clear.",
    date: "Mar 19, 2026",
    mins: "6 min read",
    featured: false,
  },
];

export default function BlogPage() {
  const [featured, ...rest] = POSTS;
  return (
    <main className="page-container py-20 space-y-16">
      <section className="space-y-2">
        <p className="small-meta text-[var(--ink-4)]">― journal</p>
        <h1 className="page-title text-[var(--ink)]">Stories from glamr</h1>
      </section>

      {/* Featured post */}
      <div className="card p-8 space-y-4">
        <span className="badge badge-plum text-[9px]">{featured.tag}</span>
        <h2 className="text-[22px] font-display text-[var(--ink)] leading-snug max-w-xl">{featured.title}</h2>
        <p className="text-[14px] text-[var(--ink-3)] leading-relaxed max-w-2xl">{featured.excerpt}</p>
        <div className="flex items-center gap-4 pt-1">
          <span className="text-[11px] text-[var(--ink-4)] font-mono">{featured.date}</span>
          <span className="text-[11px] text-[var(--ink-4)] font-mono">{featured.mins}</span>
        </div>
      </div>

      {/* Post grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {rest.map((post) => (
          <div key={post.title} className="card p-6 space-y-3 cursor-pointer hover:border-[var(--plum)] transition-colors">
            <span className="badge badge-plum text-[9px]">{post.tag}</span>
            <h3 className="text-[16px] font-medium text-[var(--ink)] leading-snug">{post.title}</h3>
            <p className="text-[13px] text-[var(--ink-3)] leading-relaxed">{post.excerpt}</p>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] text-[var(--ink-4)] font-mono">{post.date}</span>
              <span className="text-[11px] text-[var(--ink-4)] font-mono">{post.mins}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[13px] text-[var(--ink-4)]">More articles coming soon. <Link href="mailto:press@glamr.ro" className="underline hover:text-[var(--ink-2)]">Subscribe for updates</Link>.</p>
    </main>
  );
}
