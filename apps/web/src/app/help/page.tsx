import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Centre — glamr.",
  description: "Find answers to common questions about bookings, payments, and the glamr. platform.",
};

const FAQ_SECTIONS = [
  {
    title: "Booking",
    questions: [
      { q: "How do I book an appointment?", a: "Search for a service or studio, select your preferred time slot, and complete the booking form. You'll receive a confirmation email instantly." },
      { q: "Can I reschedule or cancel?", a: "Yes. Go to My Bookings → Upcoming, and tap Reschedule or Cancel. Cancellation policies vary by studio and are shown during booking." },
      { q: "What if I'm running late?", a: "Contact the studio directly through the messaging feature. Most studios accommodate up to 10 minutes late, but this may reduce your service time." },
      { q: "How does the waitlist work?", a: "When your preferred time is unavailable, join the waitlist. You'll be notified automatically if a slot opens up, and you can confirm within 30 minutes." },
    ],
  },
  {
    title: "Payments",
    questions: [
      { q: "What payment methods are accepted?", a: "We accept Visa, Mastercard, and gift cards. Cash payments can be arranged directly with the studio." },
      { q: "When am I charged?", a: "Your card is charged after the appointment is completed. Some studios may require a deposit at booking time." },
      { q: "How do refunds work?", a: "Refunds follow the studio's cancellation policy. If eligible, refunds are processed within 5–10 business days to your original payment method." },
      { q: "What are glamr. gift cards?", a: "Digital gift cards that can be purchased and sent to anyone. They're automatically applied as credit at checkout." },
    ],
  },
  {
    title: "Account",
    questions: [
      { q: "How do I update my profile?", a: "Go to your account page and click Edit to update personal information, beauty profile, and preferences." },
      { q: "How does the loyalty program work?", a: "Earn points for every booking. Points can be redeemed for discounts, upgrades, and gift cards. Higher tiers unlock better rewards." },
      { q: "How do referrals work?", a: "Share your unique referral link. When your friend completes their first booking, you both receive 50 lei credit." },
      { q: "How do I delete my account?", a: "Go to Privacy & data settings and select Delete account. This permanently removes all your data. This action cannot be undone." },
    ],
  },
  {
    title: "For Professionals",
    questions: [
      { q: "How do I register my business?", a: "Click 'For professionals' on the homepage to start the onboarding process. You'll need your business details, service menu, and team information." },
      { q: "What are the platform fees?", a: "glamr. charges a 5% commission on bookings made through the platform. There are no monthly subscription fees." },
      { q: "How do payouts work?", a: "Payouts are processed weekly (every Monday) to your registered bank account. You can view payout history in the Payments section of your dashboard." },
      { q: "How do I manage my team?", a: "Use the Team section in your dashboard to add members, set schedules, assign services, and track performance metrics." },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <header className="text-center mb-12">
        <h1 className="text-[32px] font-display text-[var(--ink)] mb-3">Help Centre</h1>
        <p className="text-[15px] text-[var(--ink-3)] max-w-lg mx-auto">
          Find answers to common questions about using glamr. Can't find what you're looking for?{" "}
          <Link href="mailto:support@glamr.ro" className="text-[var(--plum)] underline">Contact support</Link>.
        </p>
      </header>

      <div className="space-y-10">
        {FAQ_SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-[16px] font-medium text-[var(--ink)] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--plum)]" />
              {section.title}
            </h2>
            <div className="card divide-y divide-[var(--line-2)]">
              {section.questions.map((faq, i) => (
                <details key={i} className="group">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none">
                    <span className="text-[14px] text-[var(--ink)] group-open:font-medium">{faq.q}</span>
                    <span className="text-[var(--ink-4)] shrink-0 ml-4 text-[18px] group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 pb-4 -mt-1">
                    <p className="text-[13px] text-[var(--ink-2)] leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact banner */}
      <div className="card p-8 mt-12 text-center bg-gradient-to-br from-[var(--card)] to-[var(--plum-soft)]">
        <h3 className="text-[20px] font-display text-[var(--ink)] mb-2">Still need help?</h3>
        <p className="text-[14px] text-[var(--ink-3)] mb-5">Our support team is available Mon–Fri, 09:00–18:00 EET.</p>
        <div className="flex justify-center gap-3">
          <Link href="mailto:support@glamr.ro" className="btn btn-primary btn-sm">Email support</Link>
          <Link href="/studio/messages" className="btn btn-ghost btn-sm">Live chat</Link>
        </div>
      </div>
    </div>
  );
}
