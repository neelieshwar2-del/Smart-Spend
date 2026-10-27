import { prisma } from '../src/prisma/client.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding SmartSpend database with default categories and demo user...');

  // 1. Create Default Categories (userId: null)
  const defaultCategories = [
    { name: 'Food & Dining', icon: 'utensils', color: '#F59E0B', type: 'expense', isDefault: true },
    { name: 'Groceries', icon: 'shopping-cart', color: '#10B981', type: 'expense', isDefault: true },
    { name: 'Transport', icon: 'car', color: '#3B82F6', type: 'expense', isDefault: true },
    { name: 'Shopping', icon: 'shopping-bag', color: '#EC4899', type: 'expense', isDefault: true },
    { name: 'Bills & Utilities', icon: 'zap', color: '#8B5CF6', type: 'expense', isDefault: true },
    { name: 'Entertainment', icon: 'film', color: '#F43F5E', type: 'expense', isDefault: true },
    { name: 'Health & Fitness', icon: 'heart', color: '#06B6D4', type: 'expense', isDefault: true },
    { name: 'Education', icon: 'book', color: '#6366F1', type: 'expense', isDefault: true },
    { name: 'Salary', icon: 'briefcase', color: '#22C55E', type: 'income', isDefault: true },
    { name: 'Freelance', icon: 'laptop', color: '#14B8A6', type: 'income', isDefault: true },
    { name: 'Investments', icon: 'trending-up', color: '#84CC16', type: 'income', isDefault: true },
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: cat.type, userId: null },
    });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }

  // 2. Create Demo User
  const demoEmail = 'user@smartspend.app';
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Password123', salt);

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        name: 'Rohan Sharma',
        email: demoEmail,
        passwordHash,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      },
    });
    console.log(`Created demo user: ${demoUser.email} (ID: ${demoUser.id})`);
  } else {
    console.log(`Demo user exists: ${demoUser.email}`);
  }

  // 3. Create Default Monthly Budget for Demo User (₹45,000)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const existingBudget = await prisma.budget.findFirst({
    where: {
      userId: demoUser.id,
      startDate: { lte: now },
      endDate: { gte: now },
      categoryId: null,
    },
  });

  if (!existingBudget) {
    await prisma.budget.create({
      data: {
        userId: demoUser.id,
        name: 'October 2026 Monthly Budget',
        amountLimit: 4500000, // ₹45,000 in paise
        period: 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
      },
    });
    console.log('Created default monthly budget of ₹45,000');
  }

  // 4. Seed Categories map
  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map((c: any) => [c.name, c.id]));

  // 5. Seed Transactions for Demo User if empty
  const txnCount = await prisma.transaction.count({
    where: { userId: demoUser.id },
  });

  if (txnCount === 0) {
    const sampleTransactions = [
      {
        userId: demoUser.id,
        type: 'income',
        amount: 8500000, // ₹85,000
        categoryId: catMap.get('Salary') || categories[0].id,
        title: 'Monthly Salary Credit',
        merchant: 'Razorpay X Payroll',
        paymentMethod: 'Bank Transfer',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 1, 9, 30),
        note: 'October salary credited',
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 45000, // ₹450
        categoryId: catMap.get('Food & Dining') || categories[0].id,
        title: 'Blue Tokai Coffee Roasters',
        merchant: 'Blue Tokai Roasters',
        paymentMethod: 'UPI',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 15),
        note: 'Cold brew and croissant',
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 39000, // ₹390
        categoryId: catMap.get('Transport') || categories[0].id,
        title: 'Uber Premier Ride',
        merchant: 'Uber India',
        paymentMethod: 'UPI',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
        note: 'Ride to office',
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 145000, // ₹1,450
        categoryId: catMap.get('Groceries') || categories[0].id,
        title: 'Blinkit Instant Delivery',
        merchant: 'Blinkit Commerce',
        paymentMethod: 'UPI',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 19, 45),
        note: 'Weekly provisions & fruits',
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 320000, // ₹3,200
        categoryId: catMap.get('Bills & Utilities') || categories[0].id,
        title: 'Electricity & High-speed Wifi',
        merchant: 'Tata Power & ACT',
        paymentMethod: 'Debit Card',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 5, 14, 0),
        note: 'Monthly utilities bill',
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 210000, // ₹2,100
        categoryId: catMap.get('Entertainment') || categories[0].id,
        title: 'PVR IMAX Movie Tickets',
        merchant: 'BookMyShow',
        paymentMethod: 'Credit Card',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 20, 0),
        note: 'Weekend movie with friends',
      },
    ];

    for (const txn of sampleTransactions) {
      await prisma.transaction.create({ data: txn });
    }
    console.log(`Created ${sampleTransactions.length} sample transactions.`);
  }

  // 6. Seed Recurring Subscriptions
  const recurCount = await prisma.recurringRule.count({
    where: { userId: demoUser.id },
  });

  if (recurCount === 0) {
    const nextDueNetflix = new Date(now.getFullYear(), now.getMonth() + 1, 4);
    const nextDueSpotify = new Date(now.getFullYear(), now.getMonth() + 1, 12);

    await prisma.recurringRule.createMany({
      data: [
        {
          userId: demoUser.id,
          title: 'Netflix Premium 4K',
          amount: 64900, // ₹649
          categoryId: catMap.get('Entertainment') || categories[0].id,
          frequency: 'monthly',
          interval: 1,
          nextDueDate: nextDueNetflix,
          isActive: true,
        },
        {
          userId: demoUser.id,
          title: 'Spotify Duo Subscription',
          amount: 14900, // ₹149
          categoryId: catMap.get('Entertainment') || categories[0].id,
          frequency: 'monthly',
          interval: 1,
          nextDueDate: nextDueSpotify,
          isActive: true,
        },
      ],
    });
    console.log('Created sample recurring rules.');
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
