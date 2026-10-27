import { execSync } from 'child_process';

console.log('Triggering database seeding via Prisma...');
try {
  execSync('pnpm --filter @smartspend/api prisma:seed', { stdio: 'inherit' });
  console.log('Seeding completed successfully.');
} catch (error) {
  console.error('Seeding error:', error);
  process.exit(1);
}
