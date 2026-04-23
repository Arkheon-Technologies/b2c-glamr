import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// ─── Fixed UUIDs for deterministic seeding ──────────────────────────
const IDS = {
  // Users
  owner: randomUUID(),
  customer: randomUUID(),
  // Businesses
  sala: randomUUID(),
  glow: randomUUID(),
  barber: randomUUID(),
  // Locations
  salaLoc: randomUUID(),
  glowLoc: randomUUID(),
  barberLoc: randomUUID(),
  // Staff
  staff: Array.from({ length: 8 }, () => randomUUID()),
  // Verticals
  verticals: {
    hair: randomUUID(),
    nails: randomUUID(),
    skin: randomUUID(),
    lashes: randomUUID(),
    brows: randomUUID(),
    barber: randomUUID(),
    makeup: randomUUID(),
    spa: randomUUID(),
  },
};

async function main() {
  console.log('🌱 Seeding GLAMR database…');

  // ─── Clean ────────────────────────────────────────────────────
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE users, businesses, business_locations, beauty_verticals,
      staff_members, technician_profiles, services, service_staff, schedules,
      appointments, reviews, customer_profiles, customer_business_stats,
      cancellation_policies, loyalty_tiers, referrals, refresh_tokens
    CASCADE
  `);

  // ─── Verticals ────────────────────────────────────────────────
  const verticals = [
    { id: IDS.verticals.hair, slug: 'hair', name: 'Hair', icon: 'scissors', displayOrder: 1 },
    { id: IDS.verticals.nails, slug: 'nails', name: 'Nails', icon: 'palette', displayOrder: 2 },
    { id: IDS.verticals.skin, slug: 'skin', name: 'Skin', icon: 'sparkles', displayOrder: 3 },
    { id: IDS.verticals.lashes, slug: 'lashes', name: 'Lashes', icon: 'eye', displayOrder: 4 },
    { id: IDS.verticals.brows, slug: 'brows', name: 'Brows', icon: 'eyebrow', displayOrder: 5 },
    { id: IDS.verticals.barber, slug: 'barber', name: 'Barber', icon: 'barber', displayOrder: 6 },
    { id: IDS.verticals.makeup, slug: 'makeup', name: 'Makeup', icon: 'makeup', displayOrder: 7 },
    { id: IDS.verticals.spa, slug: 'spa', name: 'Spa', icon: 'spa', displayOrder: 8 },
  ];
  await prisma.beautyVertical.createMany({ data: verticals.map(v => ({ ...v, schemaConfig: {} })) });
  console.log('  ✓ 8 beauty verticals');

  // ─── Users ────────────────────────────────────────────────────
  // Using a simple hash for "password123" — in prod use bcrypt
  const passwordHash = '$2a$10$9CWrZ/3kQCYOOG24tIPByuWwMHqMiOWmKt4Q9MMWIzhfdHEZ0jfvG';

  await prisma.user.createMany({
    data: [
      {
        id: IDS.owner,
        email: 'andrei@glamr.ro',
        emailVerified: true,
        passwordHash,
        fullName: 'Andrei Popescu',
        phone: '+40721000001',
        phoneVerified: true,
        locale: 'ro',
        timezone: 'Europe/Bucharest',
      },
      {
        id: IDS.customer,
        email: 'elena.marin@email.com',
        emailVerified: true,
        passwordHash,
        fullName: 'Elena Marin',
        phone: '+40712345678',
        phoneVerified: true,
        locale: 'en',
        timezone: 'Europe/Bucharest',
      },
    ],
  });

  await prisma.customerProfile.create({
    data: {
      userId: IDS.customer,
      totalBookings: 12,
      referralCode: 'ELENA50',
    },
  });
  console.log('  ✓ 2 users (owner + customer)');

  // ─── Businesses ───────────────────────────────────────────────
  const businesses = [
    {
      id: IDS.sala, ownerId: IDS.owner, name: 'Sala Studio', slug: 'sala-studio',
      businessType: 'studio', description: 'Premium hair & nail studio in the heart of Bucharest. Editorial-quality styling for the modern professional.',
      verticals: ['hair', 'nails'], isVerified: true, totalBookings: 847,
    },
    {
      id: IDS.glow, ownerId: IDS.owner, name: 'Glow Aesthetics', slug: 'glow-aesthetics',
      businessType: 'studio', description: 'Advanced skin treatments, lash extensions, and brow sculpting. Clinical precision meets beauty artistry.',
      verticals: ['skin', 'lashes', 'brows'], isVerified: true, totalBookings: 523,
    },
    {
      id: IDS.barber, ownerId: IDS.owner, name: 'The Barber Collective', slug: 'the-barber-collective',
      businessType: 'barbershop', description: 'Old-school barbering meets modern grooming. Cuts, fades, hot towel shaves, and beard sculpting.',
      verticals: ['barber'], isVerified: false, totalBookings: 312,
    },
  ];
  await prisma.business.createMany({ data: businesses });

  // Locations
  await prisma.businessLocation.createMany({
    data: [
      {
        id: IDS.salaLoc, businessId: IDS.sala, addressLine1: 'Strada Victoriei 42',
        city: 'Bucharest', neighborhood: 'Sector 1', countryCode: 'RO',
        latitude: 44.4396, longitude: 26.0963, timezone: 'Europe/Bucharest', isPrimary: true,
      },
      {
        id: IDS.glowLoc, businessId: IDS.glow, addressLine1: 'Bulevardul Aviatorilor 15',
        city: 'Bucharest', neighborhood: 'Sector 1', countryCode: 'RO',
        latitude: 44.4554, longitude: 26.0853, timezone: 'Europe/Bucharest', isPrimary: true,
      },
      {
        id: IDS.barberLoc, businessId: IDS.barber, addressLine1: 'Calea Moșilor 78',
        city: 'Bucharest', neighborhood: 'Sector 3', countryCode: 'RO',
        latitude: 44.4350, longitude: 26.1120, timezone: 'Europe/Bucharest', isPrimary: true,
      },
    ],
  });
  console.log('  ✓ 3 businesses with locations');

  // ─── Staff ────────────────────────────────────────────────────
  const staffData = [
    // Sala Studio
    { idx: 0, biz: IDS.sala, loc: IDS.salaLoc, name: 'Maria Ionescu', role: 'senior_stylist', specs: ['balayage', 'color correction', 'bridal'], slug: 'maria-ionescu', rating: 4.92 },
    { idx: 1, biz: IDS.sala, loc: IDS.salaLoc, name: 'Cristina Dragomir', role: 'nail_technician', specs: ['gel extensions', 'nail art', 'manicure'], slug: 'cristina-dragomir', rating: 4.85 },
    { idx: 2, biz: IDS.sala, loc: IDS.salaLoc, name: 'Ana Florescu', role: 'stylist', specs: ['cuts', 'blowouts', 'keratin'], slug: 'ana-florescu', rating: 4.78 },
    // Glow Aesthetics
    { idx: 3, biz: IDS.glow, loc: IDS.glowLoc, name: 'Dr. Ioana Preda', role: 'aesthetician', specs: ['chemical peels', 'microneedling', 'LED therapy'], slug: 'ioana-preda', rating: 4.95 },
    { idx: 4, biz: IDS.glow, loc: IDS.glowLoc, name: 'Raluca Marinescu', role: 'lash_artist', specs: ['classic lashes', 'volume lashes', 'mega volume'], slug: 'raluca-marinescu', rating: 4.88 },
    { idx: 5, biz: IDS.glow, loc: IDS.glowLoc, name: 'Diana Enache', role: 'brow_specialist', specs: ['microblading', 'brow lamination', 'tinting'], slug: 'diana-enache', rating: 4.82 },
    // The Barber Collective
    { idx: 6, biz: IDS.barber, loc: IDS.barberLoc, name: 'Alexandru Radu', role: 'master_barber', specs: ['skin fades', 'hot towel shave', 'beard design'], slug: 'alexandru-radu', rating: 4.90 },
    { idx: 7, biz: IDS.barber, loc: IDS.barberLoc, name: 'Mihai Stoica', role: 'barber', specs: ['classic cuts', 'buzz cuts', 'beard trim'], slug: 'mihai-stoica', rating: 4.75 },
  ];

  // Create user accounts for each staff member
  for (const s of staffData) {
    const userId = randomUUID();
    await prisma.user.create({
      data: {
        id: userId, email: `${s.slug}@glamr.ro`, emailVerified: true, passwordHash,
        fullName: s.name, locale: 'ro', timezone: 'Europe/Bucharest',
      },
    });
    await prisma.staffMember.create({
      data: {
        id: IDS.staff[s.idx], userId, businessId: s.biz, locationId: s.loc,
        role: s.role, displayName: s.name, isActive: true,
      },
    });
    await prisma.technicianProfile.create({
      data: {
        staffId: IDS.staff[s.idx], bio: `Specialist in ${s.specs.join(', ')}.`,
        specializations: s.specs, languages: ['ro', 'en'], slug: s.slug,
        avgRating: s.rating, bookingCount: Math.floor(Math.random() * 200) + 50,
      },
    });
  }
  console.log('  ✓ 8 staff members with profiles');

  // ─── Schedules (Mon–Sat 09–19) ────────────────────────────────
  for (const staffId of IDS.staff) {
    const schedules = [];
    for (let day = 1; day <= 6; day++) {
      schedules.push({
        schedulableType: 'staff', schedulableId: staffId,
        dayOfWeek: day, startTime: '09:00', endTime: '19:00', isBreak: false,
      });
      // Lunch break
      schedules.push({
        schedulableType: 'staff', schedulableId: staffId,
        dayOfWeek: day, startTime: '13:00', endTime: '14:00', isBreak: true,
      });
    }
    await prisma.schedule.createMany({ data: schedules });
  }
  console.log('  ✓ Staff schedules (Mon–Sat 09:00–19:00)');

  // ─── Services ─────────────────────────────────────────────────
  const svc = (biz: string, loc: string, vert: string, name: string, dur: number, price: number, proc = 0, fin = 0, desc = '') => ({
    id: randomUUID(), businessId: biz, locationId: loc, verticalId: vert,
    name, description: desc || `Professional ${name.toLowerCase()} service.`,
    durationActiveMin: dur, durationProcessingMin: proc, durationFinishMin: fin,
    priceType: 'fixed' as const, priceCents: price * 100, currency: 'RON',
    isActive: true, displayOrder: 0,
  });

  const V = IDS.verticals;
  const services = [
    // Sala — Hair
    svc(IDS.sala, IDS.salaLoc, V.hair, 'Women\'s Cut & Blow-dry', 45, 180, 0, 15),
    svc(IDS.sala, IDS.salaLoc, V.hair, 'Men\'s Cut', 30, 100),
    svc(IDS.sala, IDS.salaLoc, V.hair, 'Balayage', 60, 450, 30, 20, 'Hand-painted highlights for a natural sun-kissed look.'),
    svc(IDS.sala, IDS.salaLoc, V.hair, 'Full Color', 30, 280, 35, 15),
    svc(IDS.sala, IDS.salaLoc, V.hair, 'Keratin Treatment', 45, 520, 60, 15, 'Smoothing keratin treatment for frizz-free hair up to 3 months.'),
    svc(IDS.sala, IDS.salaLoc, V.hair, 'Bridal Updo', 90, 350, 0, 0, 'Bespoke bridal hairstyling with trial included.'),
    svc(IDS.sala, IDS.salaLoc, V.hair, 'Blow-dry & Style', 30, 120),
    svc(IDS.sala, IDS.salaLoc, V.hair, 'Olaplex Treatment', 20, 150, 30, 10),
    // Sala — Nails
    svc(IDS.sala, IDS.salaLoc, V.nails, 'Classic Manicure', 30, 80),
    svc(IDS.sala, IDS.salaLoc, V.nails, 'Gel Manicure', 45, 120),
    svc(IDS.sala, IDS.salaLoc, V.nails, 'Gel Extensions', 75, 200, 0, 0, 'Full set of sculpted gel nail extensions.'),
    svc(IDS.sala, IDS.salaLoc, V.nails, 'Nail Art (per nail)', 10, 25),
    svc(IDS.sala, IDS.salaLoc, V.nails, 'Classic Pedicure', 40, 100),
    svc(IDS.sala, IDS.salaLoc, V.nails, 'Gel Pedicure', 50, 140),
    // Glow — Skin
    svc(IDS.glow, IDS.glowLoc, V.skin, 'HydraFacial', 60, 380, 0, 0, 'Deep cleansing, exfoliation, extraction, hydration, and antioxidant protection.'),
    svc(IDS.glow, IDS.glowLoc, V.skin, 'Chemical Peel', 30, 280, 0, 10),
    svc(IDS.glow, IDS.glowLoc, V.skin, 'Microneedling', 45, 420, 0, 15, 'Collagen induction therapy for skin rejuvenation.'),
    svc(IDS.glow, IDS.glowLoc, V.skin, 'LED Light Therapy', 30, 180),
    svc(IDS.glow, IDS.glowLoc, V.skin, 'Deep Cleansing Facial', 60, 250),
    // Glow — Lashes
    svc(IDS.glow, IDS.glowLoc, V.lashes, 'Classic Lash Extensions', 90, 280, 0, 0, 'Natural-looking individual lash extensions.'),
    svc(IDS.glow, IDS.glowLoc, V.lashes, 'Volume Lash Extensions', 120, 380),
    svc(IDS.glow, IDS.glowLoc, V.lashes, 'Lash Lift & Tint', 45, 180),
    svc(IDS.glow, IDS.glowLoc, V.lashes, 'Lash Infill', 60, 180),
    // Glow — Brows
    svc(IDS.glow, IDS.glowLoc, V.brows, 'Brow Lamination', 45, 200),
    svc(IDS.glow, IDS.glowLoc, V.brows, 'Microblading', 120, 800, 0, 0, 'Semi-permanent brow tattooing with natural hair strokes.'),
    svc(IDS.glow, IDS.glowLoc, V.brows, 'Brow Tint & Shape', 25, 80),
    // Barber
    svc(IDS.barber, IDS.barberLoc, V.barber, 'Classic Haircut', 30, 80),
    svc(IDS.barber, IDS.barberLoc, V.barber, 'Skin Fade', 40, 100),
    svc(IDS.barber, IDS.barberLoc, V.barber, 'Buzz Cut', 20, 60),
    svc(IDS.barber, IDS.barberLoc, V.barber, 'Hot Towel Shave', 30, 90),
    svc(IDS.barber, IDS.barberLoc, V.barber, 'Beard Trim & Shape', 20, 60),
    svc(IDS.barber, IDS.barberLoc, V.barber, 'Haircut + Beard Combo', 50, 140),
    svc(IDS.barber, IDS.barberLoc, V.barber, 'Kids Haircut', 20, 50),
    svc(IDS.barber, IDS.barberLoc, V.barber, 'Hair & Scalp Treatment', 30, 120),
  ];
  await prisma.service.createMany({ data: services });

  // Assign staff to services
  const staffServices: { serviceId: string; staffId: string }[] = [];
  for (const s of services) {
    const bizStaff = staffData.filter(st => st.biz === s.businessId);
    for (const st of bizStaff) {
      staffServices.push({ serviceId: s.id, staffId: IDS.staff[st.idx] });
    }
  }
  await prisma.serviceStaff.createMany({ data: staffServices });
  console.log(`  ✓ ${services.length} services with staff assignments`);

  // ─── Cancellation Policies ────────────────────────────────────
  const policies = [
    { id: randomUUID(), businessId: IDS.sala, name: 'Standard', freeCancelHours: 24, lateCancelFeePct: 50, noShowFeePct: 100, description: 'Free cancellation 24h before. 50% fee for late cancellation.' },
    { id: randomUUID(), businessId: IDS.glow, name: 'Standard', freeCancelHours: 48, lateCancelFeePct: 50, noShowFeePct: 100, description: 'Free cancellation 48h before for skin treatments.' },
    { id: randomUUID(), businessId: IDS.barber, name: 'Flexible', freeCancelHours: 2, lateCancelFeePct: 0, noShowFeePct: 100, description: 'Free cancellation up to 2h before.' },
  ];
  await prisma.cancellationPolicy.createMany({ data: policies });

  // ─── Loyalty Tiers ────────────────────────────────────────────
  for (const bizId of [IDS.sala, IDS.glow, IDS.barber]) {
    await prisma.loyaltyTier.createMany({
      data: [
        { businessId: bizId, tierName: 'bronze', minBookings: 0, discountPct: 0, perks: {} },
        { businessId: bizId, tierName: 'silver', minBookings: 5, discountPct: 5, perks: { priority_booking: true } },
        { businessId: bizId, tierName: 'gold', minBookings: 15, discountPct: 10, perks: { priority_booking: true, free_addon: true } },
        { businessId: bizId, tierName: 'platinum', minBookings: 30, discountPct: 15, perks: { priority_booking: true, free_addon: true, vip_access: true } },
      ],
    });
  }
  console.log('  ✓ Cancellation policies + loyalty tiers');

  // ─── Appointments ─────────────────────────────────────────────
  const now = new Date();
  const day = (offset: number, hour: number, min = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(hour, min, 0, 0);
    return d;
  };

  const appointments = [
    // Upcoming
    { biz: IDS.sala, loc: IDS.salaLoc, svc: services[0], staff: 0, start: day(1, 10), dur: 60, status: 'confirmed' },
    { biz: IDS.sala, loc: IDS.salaLoc, svc: services[2], staff: 0, start: day(3, 14), dur: 110, status: 'confirmed' },
    { biz: IDS.glow, loc: IDS.glowLoc, svc: services[14], staff: 3, start: day(2, 11), dur: 60, status: 'confirmed' },
    { biz: IDS.barber, loc: IDS.barberLoc, svc: services[27], staff: 6, start: day(5, 15), dur: 40, status: 'confirmed' },
    // Past completed
    { biz: IDS.sala, loc: IDS.salaLoc, svc: services[0], staff: 0, start: day(-3, 10), dur: 60, status: 'completed' },
    { biz: IDS.sala, loc: IDS.salaLoc, svc: services[8], staff: 1, start: day(-5, 14), dur: 30, status: 'completed' },
    { biz: IDS.sala, loc: IDS.salaLoc, svc: services[4], staff: 0, start: day(-10, 11), dur: 120, status: 'completed' },
    { biz: IDS.glow, loc: IDS.glowLoc, svc: services[14], staff: 3, start: day(-7, 10), dur: 60, status: 'completed' },
    { biz: IDS.glow, loc: IDS.glowLoc, svc: services[19], staff: 4, start: day(-14, 13), dur: 90, status: 'completed' },
    { biz: IDS.glow, loc: IDS.glowLoc, svc: services[23], staff: 5, start: day(-21, 15), dur: 45, status: 'completed' },
    { biz: IDS.barber, loc: IDS.barberLoc, svc: services[26], staff: 6, start: day(-4, 10), dur: 30, status: 'completed' },
    { biz: IDS.barber, loc: IDS.barberLoc, svc: services[29], staff: 7, start: day(-8, 16), dur: 30, status: 'completed' },
    // Cancelled / no-show
    { biz: IDS.sala, loc: IDS.salaLoc, svc: services[5], staff: 2, start: day(-2, 10), dur: 90, status: 'cancelled_by_customer' },
    { biz: IDS.glow, loc: IDS.glowLoc, svc: services[16], staff: 3, start: day(-6, 14), dur: 45, status: 'no_show' },
  ];

  const appointmentIds: string[] = [];
  for (const a of appointments) {
    const id = randomUUID();
    appointmentIds.push(id);
    const endAt = new Date(a.start.getTime() + a.dur * 60000);
    await prisma.appointment.create({
      data: {
        id, businessId: a.biz, locationId: a.loc, serviceId: a.svc.id,
        staffId: IDS.staff[a.staff], customerId: IDS.customer,
        startAt: a.start, endAt, status: a.status, bookingSource: 'marketplace',
      },
    });
  }
  console.log(`  ✓ ${appointments.length} appointments`);

  // ─── Reviews (for completed appointments) ─────────────────────
  const completedAppts = appointments
    .map((a, i) => ({ ...a, id: appointmentIds[i] }))
    .filter(a => a.status === 'completed');

  const reviewTexts = [
    'Absolutely amazing experience! Maria transformed my hair beautifully.',
    'Perfect gel manicure, Cristina is incredibly detailed.',
    'The keratin treatment changed my life. So smooth and manageable now.',
    'Best HydraFacial I\'ve ever had. My skin is glowing!',
    'Raluca\'s lash work is incredible. So natural looking.',
    'Diana nailed the brow lamination. They look amazing!',
    'Clean fade, great atmosphere. Alex knows his craft.',
    'Quick and precise beard trim. Will definitely come back.',
  ];

  for (let i = 0; i < completedAppts.length; i++) {
    const a = completedAppts[i];
    await prisma.review.create({
      data: {
        appointmentId: a.id, businessId: a.biz,
        technicianId: IDS.staff[a.staff], customerId: IDS.customer,
        ratingOverall: i < 6 ? 5 : 4,
        ratingSkill: i < 5 ? 5 : 4,
        ratingClean: 5,
        ratingValue: i < 4 ? 5 : 4,
        text: reviewTexts[i] || 'Great service, highly recommend!',
        isVerified: true,
      },
    });
  }
  console.log(`  ✓ ${completedAppts.length} reviews`);

  // ─── Customer-Business Stats ──────────────────────────────────
  await prisma.customerBusinessStat.createMany({
    data: [
      { customerId: IDS.customer, businessId: IDS.sala, bookingCount: 8, totalSpentCents: 215000, loyaltyTier: 'silver', firstBookingAt: day(-90, 10), lastBookingAt: day(-3, 10), tags: ['regular', 'balayage-lover'] },
      { customerId: IDS.customer, businessId: IDS.glow, bookingCount: 4, totalSpentCents: 126000, loyaltyTier: 'bronze', firstBookingAt: day(-60, 10), lastBookingAt: day(-7, 10), tags: ['skincare'] },
    ],
  });

  // ─── Referral ─────────────────────────────────────────────────
  const referredUser = await prisma.user.create({
    data: {
      email: 'sofia.tanase@email.com', emailVerified: true, passwordHash,
      fullName: 'Sofia Tănase', locale: 'ro', timezone: 'Europe/Bucharest',
    },
  });
  await prisma.referral.create({
    data: {
      referrerId: IDS.customer, referredId: referredUser.id, businessId: IDS.sala,
      referralCode: 'ELENA50', referrerCreditCents: 5000, referredCreditCents: 5000, status: 'completed',
    },
  });
  console.log('  ✓ Customer stats + referrals');

  // ─── Summary ──────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!');
  console.log('   Login credentials (all accounts): password123');
  console.log('   Owner:    andrei@glamr.ro');
  console.log('   Customer: elena.marin@email.com');
  console.log(`   Businesses: sala-studio, glow-aesthetics, the-barber-collective`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
