import path from 'node:path';
import fs from 'node:fs/promises';
import { sequelize } from '../../config/sequelize.js';
import { Staff } from '../models/Staff.js';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'staff');
    const files = (await fs.readdir(UPLOAD_DIR)).filter(f => f.match(/\.(png|jpe?g|webp|gif|svg)$/i));
    console.log(`Found ${files.length} upload files`);
    const staff = await Staff.findAll({ order: [['id', 'ASC']] });
    console.log(`Found ${staff.length} staff rows`);
    const base = 'http://localhost:4000';
    for (let i = 0; i < Math.min(files.length, staff.length); i++) {
      const s = staff[i];
      const file = files[i];
      const publicUrl = `${base}/uploads/staff/${file}`;
      console.log(`Setting staff ${s.id} photoUrl -> ${publicUrl}`);
      // eslint-disable-next-line no-await-in-loop
      await s.update({ photoUrl: publicUrl });
    }
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Failed', err);
    process.exit(1);
  }
}

// Run immediately when executed with tsx
run();
