import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VERTICALS = [
  { slug: 'hair', name: 'Hair Salon', icon: 'scissors', displayOrder: 1, schemaConfig: { supportsProcessingTime: true, defaultProcessingMin: 30 } },
  { slug: 'barbershop', name: 'Barbershop', icon: 'razor', displayOrder: 2, schemaConfig: { supportsProcessingTime: false } },
  { slug: 'nails', name: 'Nail Studio', icon: 'nail-polish', displayOrder: 3, schemaConfig: { supportsProcessingTime: true, defaultProcessingMin: 15 } },
  { slug: 'cosmetology', name: 'Cosmetology', icon: 'sparkles', displayOrder: 4, schemaConfig: { supportsProcessingTime: true } },
  { slug: 'brows', name: 'Brows & Shaping', icon: 'eye', displayOrder: 5, schemaConfig: { supportsProcessingTime: false } },
  { slug: 'lashes', name: 'Lashes', icon: 'eye-lashes', displayOrder: 6, schemaConfig: { supportsProcessingTime: true, defaultProcessingMin: 5 } },
  { slug: 'makeup', name: 'Makeup Artistry', icon: 'brush', displayOrder: 7, schemaConfig: { supportsProcessingTime: false } },
  { slug: 'massage', name: 'Massage & Bodywork', icon: 'spa', displayOrder: 8, schemaConfig: { supportsProcessingTime: false } },
  { slug: 'body_treatments', name: 'Body Treatments', icon: 'body', displayOrder: 9, schemaConfig: { supportsProcessingTime: true } },
  { slug: 'laser', name: 'Laser & IPL', icon: 'zap', displayOrder: 10, schemaConfig: { requiresMedical: true, patchTestDefault: true } },
  { slug: 'medical_aesthetics', name: 'Medical Aesthetics', icon: 'syringe', displayOrder: 11, schemaConfig: { requiresMedical: true, consentRequired: true } },
  { slug: 'micropigmentation', name: 'Micropigmentation & PMU', icon: 'pen-tool', displayOrder: 12, schemaConfig: { patchTestDefault: true, consentRequired: true } },
  { slug: 'other', name: 'Other Services', icon: 'plus', displayOrder: 99, schemaConfig: {} },
];

async function main() {
  console.log('Seeding beauty verticals...');

  for (const vertical of VERTICALS) {
    await prisma.beautyVertical.upsert({
      where: { slug: vertical.slug },
      update: { name: vertical.name, icon: vertical.icon, displayOrder: vertical.displayOrder, schemaConfig: vertical.schemaConfig },
      create: vertical,
    });
    console.log(`  ✓ ${vertical.name}`);
  }

  console.log(`\nSeeded ${VERTICALS.length} verticals.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
