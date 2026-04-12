import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <span className="footer-logo gradient-text">GLAMR</span>
            <p className="footer-brand-desc">
              The operating system for beauty professionals. Split-phase scheduling,
              portfolio-driven discovery, deposits, and packages — finally in one place.
            </p>
          </div>

          {/* Product */}
          <div>
            <span className="footer-col-title">Product</span>
            <ul className="footer-links">
              <li><a href="/#features"     className="footer-link">Features</a></li>
              <li><Link href="/explore"    className="footer-link">Explore Artists</Link></li>
              <li><Link href="/auth/register" className="footer-link">Get Started Free</Link></li>
              <li><Link href="/auth/login" className="footer-link">Log In</Link></li>
            </ul>
          </div>

          {/* For Business */}
          <div>
            <span className="footer-col-title">For Business</span>
            <ul className="footer-links">
              <li><a href="/#for-business" className="footer-link">Solo Artists</a></li>
              <li><a href="/#for-business" className="footer-link">Studios</a></li>
              <li><a href="/#for-business" className="footer-link">Salon Chains</a></li>
              <li><a href="/#for-business" className="footer-link">Pricing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <span className="footer-col-title">Company</span>
            <ul className="footer-links">
              <li><Link href="#" className="footer-link">About</Link></li>
              <li><Link href="#" className="footer-link">Blog</Link></li>
              <li><Link href="#" className="footer-link">Privacy Policy</Link></li>
              <li><Link href="#" className="footer-link">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} GLAMR. All rights reserved.</p>
          <p className="footer-copy">Built for beauty professionals.</p>
        </div>
      </div>
    </footer>
  );
}
