import { hash } from "bcryptjs";
import { db } from "../src/lib/db";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "change-me-please";

  const passwordHash = await hash(password, 10);

  const admin = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin",
      passwordHash,
      isAdmin: true,
    },
  });

  console.log(`Seeded admin user: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
