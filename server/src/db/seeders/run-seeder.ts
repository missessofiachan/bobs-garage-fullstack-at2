import { seedUsers } from './user.seeder.js';
import { sequelize } from '../../config/sequelize.js';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connection OK for seeder');

    if (process.env.NODE_ENV === 'development') {
      console.log('Running sequelize.sync() for seeder (development only)');
      await sequelize.sync();
    }

    await seedUsers();
    console.log('User seed complete');
  } catch (err) {
    console.error('User seed failed:', err);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch (e) {
      // ignore
    }
    process.exit(0);
  }
}

run();
