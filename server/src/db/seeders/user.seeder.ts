import { User } from '../models/User.js';
import { hashPassword } from '../../utils/hash.js';

export async function seedUsers() {
  const passwordHash = await hashPassword('admin1234');
  await User.create({
    email: 'admin@bobs-garage.com',
    passwordHash,
    role: 'admin',
  });
  // Add more users as needed
}

// Optionally, call this function directly if running as a script
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('User seed complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error('User seed failed:', err);
      process.exit(1);
    });
}
