import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/20 font-label text-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-20 max-w-screen-2xl mx-auto">
        {/* Brand */}
        <div className="flex flex-col gap-6">
          <span className="text-xl font-headline font-black tracking-tighter text-primary">GLAMR</span>
          <p className="text-on-surface-variant font-light leading-relaxed normal-case text-xs">
            The definitive operating system for high-performance beauty studios.
            Engineered for precision scheduling and portfolio-driven discovery.
          </p>
        </div>

        {/* Structure */}
        <div className="flex flex-col gap-4">
          <p className="font-headline font-bold uppercase tracking-widest text-xs text-primary mb-2">Structure</p>
          <Link href="/#features" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Platform</Link>
          <Link href="/#business" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Business Logic</Link>
          <Link href="/#pricing" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Pricing Tiers</Link>
          <Link href="/explore" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Explore Artists</Link>
          <Link href="/portfolio" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Portfolio Gallery</Link>
          <Link href="/queue" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Join Queue</Link>
          <Link href="/studio/queue" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Studio Queue</Link>
          <Link href="/studio/portfolio" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Studio Portfolio</Link>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-4">
          <p className="font-headline font-bold uppercase tracking-widest text-xs text-primary mb-2">Resources</p>
          <Link href="#" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Terms of Service</Link>
          <Link href="#" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Accessibility</Link>
          <Link href="#" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">API Reference</Link>
        </div>

        {/* Account */}
        <div className="flex flex-col gap-4">
          <p className="font-headline font-bold uppercase tracking-widest text-xs text-primary mb-2">Account</p>
          <Link href="/auth/login"    className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Sign In</Link>
          <Link href="/auth/register" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Register</Link>
          <Link href="/explore" className="text-on-surface-variant uppercase tracking-widest text-[10px] hover:text-primary-fixed transition-colors">Book Now</Link>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-outline-variant/20 px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4 max-w-screen-2xl mx-auto">
        <p className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
          © {new Date().getFullYear()} GLAMR. All rights reserved.
        </p>
        <p className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
          Built for beauty professionals.
        </p>
      </div>
    </footer>
  );
}
