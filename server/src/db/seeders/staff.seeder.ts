import { Staff } from '../models/Staff.js';

export async function seedStaff() {
  const existing = await Staff.count();
  if (existing >= 4) return; // assume seeded
  await Staff.bulkCreate([
    {
      name: 'Bob',
      role: 'Owner',
      bio: 'Founder and master mechanic.',
      photoUrl: '',
      active: true,
    },
    {
      name: 'Alex',
      role: 'Mechanic',
      bio: 'Expert in diagnostics and repairs.',
      photoUrl: '',
      active: true,
    },
    {
      name: 'Jamie',
      role: 'Mechanic',
      bio: 'Suspension and brakes specialist.',
      photoUrl: '',
      active: true,
    },
    {
      name: 'Casey',
      role: 'Reception',
      bio: 'Keeps the shop running smoothly.',
      photoUrl: '',
      active: true,
    },
  ]);
}
