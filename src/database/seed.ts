import sequelize from '../database';
import { Book } from '../models/Book';

async function seed() {
  await sequelize.sync({ force: true });

  console.log('✔ Seed ejecutado');
  process.exit();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
