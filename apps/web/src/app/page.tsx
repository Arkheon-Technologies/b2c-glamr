export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center" style={{ background: 'var(--background)' }}>
      <main className="flex flex-col items-center gap-8 px-6 animate-fadeIn">
        <div className="flex flex-col items-center gap-2">
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-outfit), Outfit, system-ui, sans-serif' }}
          >
            <span className="gradient-text">GLAMR</span>
          </h1>
          <p
            className="text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            The operating system for beauty professionals
          </p>
        </div>

        <div className="flex gap-4">
          <a
            href="/auth/login"
            className="btn btn-primary btn-lg"
          >
            Get Started
          </a>
          <a
            href="/explore"
            className="btn btn-secondary btn-lg"
          >
            Explore
          </a>
        </div>

        <div className="flex gap-6 mt-8">
          {[
            { label: 'Split-Phase Scheduling', icon: '⏱' },
            { label: 'Artist Portfolios', icon: '📸' },
            { label: 'Walk-In Queue', icon: '🚶' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="card flex flex-col items-center gap-2 p-6 text-center"
              style={{ minWidth: 160 }}
            >
              <span className="text-2xl">{feature.icon}</span>
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
