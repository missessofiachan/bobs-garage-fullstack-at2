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

