// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- Define Product Data ---
  // IMPORTANT: Use the correct relative paths for images served by backend public/images
  const productsToCreate = [
    { id: 1, name: "Cookie Dough Tube", flavor: "Chocolate Chunk", type: "Tube", price: 5.99, description: "Ready-to-bake chocolate chunk cookie dough.", image_url: "/images/chocolateTube.jpg" },
    { id: 2, name: "Cookie Dough Tube", flavor: "Caramel", type: "Tube", price: 5.99, description: "Ready-to-bake caramel cookie dough.", image_url: "/images/caramelTube.jpg" },
    { id: 3, name: "Cookie Dough Bites", flavor: "Chocolate Chunk", type: "Bites", price: 4.99, description: "Edible chocolate chunk cookie dough bites.", image_url: "/images/chocolateBite.jpg" },
    { id: 4, name: "Cookie Dough Bites", flavor: "Caramel", type: "Bites", price: 4.99, description: "Edible caramel cookie dough bites.", image_url: "/images/caramelBite.jpg" },
  ];
  // --- End Product Data ---

  // Upsert products: update if ID exists, create if it doesn't
  for (const p of productsToCreate) {
    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: { // Define what fields to update if it exists (optional)
         name: p.name,
         flavor: p.flavor,
         type: p.type,
         price: p.price,
         description: p.description,
         image_url: p.image_url,
      },
      create: p, // Use the full object if creating new
    });
    console.log(`Created/Updated product with id: ${product.id}`);
  }

  // Optional: Add user seeding here if needed
  // console.log(`Seeding users finished.`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });