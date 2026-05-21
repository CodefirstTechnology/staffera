import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DB seeding routine...');

  // Reset database tables
  await prisma.chatMessage.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.userSubscription.deleteMany({});
  await prisma.subscriptionPlan.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned database tables successfully.');

  // Create Users with hashed passwords
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      fullname: 'Super Admin',
      mobile: '+15559999999',
      email: 'admin@staffera.com',
      role: 'ADMIN',
      passwordHash: defaultPasswordHash,
    },
  });

  const customer = await prisma.user.create({
    data: {
      fullname: 'Jane Doe',
      mobile: '+15550000000',
      email: 'jane@gmail.com',
      role: 'CUSTOMER',
      profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdslEMlpOldzUqQ7bsTgu1rnT6COfIFD5lslMTg-bH18tD4qxObsAdkitf_sHvuiusB6-0EnqalbbqCFUFr8h6dJdActlf4rBwiuEQ0Xr1nWQcBoqZFhYmu2DfzPHcGQr9oFUlAd6RIbC4NQr3dB4HegNutWbTz9HrhEhp0HWOaD1pWq1OtfAYMj0-Utp_oOPAPCXT1bhe_E4IJCrVWlZvpbd4lIteLTfAwdCVueKmrl9Exm3zmJcF4W7SLxB8jTD2sLv8wc2RFea9',
      passwordHash: defaultPasswordHash,
    },
  });

  // Provision Customer Default Address
  const customerAddress = await prisma.address.create({
    data: {
      userId: customer.id,
      latitude: 19.0760, // Mumbai coordinates
      longitude: 72.8777,
      fullAddress: 'Flat 402, Sea Breeze Apts, Bandra West, Mumbai, MH, 400050',
      addressType: 'HOME',
      isDefault: true,
    },
  });

  // Create Customer default Wallet with balance for bookings testing
  await prisma.wallet.create({
    data: {
      userId: customer.id,
      balance: 1500.00,
    },
  });

  const partner = await prisma.user.create({
    data: {
      fullname: 'Alex Green (Pro)',
      mobile: '+15551111111',
      email: 'alex.pro@staffera.com',
      role: 'PARTNER',
      profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdslEMlpOldzUqQ7bsTgu1rnT6COfIFD5lslMTg-bH18tD4qxObsAdkitf_sHvuiusB6-0EnqalbbqCFUFr8h6dJdActlf4rBwiuEQ0Xr1nWQcBoqZFhYmu2DfzPHcGQr9oFUlAd6RIbC4NQr3dB4HegNutWbTz9HrhEhp0HWOaD1pWq1OtfAYMj0-Utp_oOPAPCXT1bhe_E4IJCrVWlZvpbd4lIteLTfAwdCVueKmrl9Exm3zmJcF4W7SLxB8jTD2sLv8wc2RFea9',
      passwordHash: defaultPasswordHash,
    },
  });

  await prisma.wallet.create({
    data: {
      userId: partner.id,
      balance: 0.00,
    },
  });

  console.log('👤 Provisioned credentialed accounts.');

  // Create Service Categories
  const cleaningCat = await prisma.category.create({
    data: {
      name: 'House Cleaning',
      iconName: 'cleaning_services',
      description: 'Full house disinfection, sanitization, and wiping.',
    },
  });

  const kitchenCat = await prisma.category.create({
    data: {
      name: 'Kitchen Help',
      iconName: 'skillet',
      description: 'Expert home-style cooking assistant services.',
    },
  });

  const laundryCat = await prisma.category.create({
    data: {
      name: 'Laundry & Ironing',
      iconName: 'local_laundry_service',
      description: 'Premium stain removal, folding, and steam pressing.',
    },
  });

  const deepCleaningCat = await prisma.category.create({
    data: {
      name: 'Deep Cleaning',
      iconName: 'mop',
      description: 'Intense micro-dusting, scrubbing, and sanitizing.',
    },
  });

  console.log('🗂 Seeded core categories.');

  // Seed deep cleaning service to match dashboard design screenshots
  const deepCleaningService = await prisma.service.create({
    data: {
      categoryId: deepCleaningCat.id,
      title: 'Full Home Deep Cleaning',
      description: 'High-density micro-dusting, window vacuuming, kitchen kitchen grease stain removals, bathroom scrubbings, and floor disinfections using hospital-grade disinfecants.',
      durationMins: 240,
      basePrice: 599.00,
      discountPrice: 479.00, // 20% discount matching promotional offers banner!
      checklist: [
        'Dusting of ceilings, fixtures, and window panes',
        'Scrubbing and descaling of bathroom wall tiles',
        'Degreasing kitchen exhaust and counters',
        'Intense vacuuming of sofas, mattresses, and carpets',
        'Mopping of all hard flooring using sanitized solutions'
      ],
    },
  });

  // Seed some other basic services for explore services section
  await prisma.service.create({
    data: {
      categoryId: cleaningCat.id,
      title: 'Quick Home Mopping',
      description: 'Standard dust sweep and wet floor mop.',
      durationMins: 60,
      basePrice: 199.00,
      checklist: ['Floor sweeping', 'Floor mopping with floor cleaner', 'Emptying home trash cans'],
    },
  });

  await prisma.service.create({
    data: {
      categoryId: kitchenCat.id,
      title: 'Dinner Meal Preparation',
      description: 'Prep and cooking of up to three home dishes.',
      durationMins: 90,
      basePrice: 299.00,
      checklist: ['Veggie/meat cutting', 'Cooking dishes according to instructions', 'Cleaning kitchen counters'],
    },
  });

  console.log('🛠 Seeded service catalogs.');

  // Create Subscription Plans matching subscription screens
  const gold1Month = await prisma.subscriptionPlan.create({
    data: {
      name: 'StaffEra Gold 1 Month',
      price: 199.00,
      durationDays: 30,
      benefits: [
        'Zero delivery fees on all premium matchings',
        '10% extra discount on top of category promos',
        'Priority assignment matching queue triggers'
      ],
    },
  });

  const gold3Month = await prisma.subscriptionPlan.create({
    data: {
      name: 'StaffEra Gold 3 Months',
      price: 499.00,
      durationDays: 90,
      benefits: [
        'Zero delivery fees on all premium matchings',
        '10% extra discount on top of category promos',
        'Priority assignment matching queue triggers',
        'Complimentary wellness home visit session'
      ],
    },
  });

  console.log('💳 Seeded StaffEra Gold Subscription plans.');
  console.log('🎉 Seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('🔥 DB seeding routine failed with exception:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
