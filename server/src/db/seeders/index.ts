import { sequelize } from '../../config/sequelize.js';
import { seedUsers } from './user.seeder.js';
import { seedStaff } from './staff.seeder.js';
import { seedServices } from './service.seeder.js';

async function run() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected.');

    // In development, sync models to ensure tables exist for seeding
    if (process.env.NODE_ENV === 'development') {
      console.log('Syncing database (development mode)...');
      await sequelize.sync();
    }

  console.log('Running user seeder...');
  await seedUsers();
  console.log('Running staff seeder...');
  await seedStaff();
  console.log('Running services seeder...');
  await seedServices();

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

if (require.main === module) run();

export default run;
