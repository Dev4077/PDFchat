const { CreditPack } = require("../models/CreditPack");

const DEFAULT_PACKS = [
  {
    name: "Starter",
    priceCents: 900,
    credits: 1000,
    sortOrder: 1,
    active: true,
  },
  {
    name: "Pro",
    priceCents: 2900,
    credits: 3500,
    sortOrder: 2,
    active: true,
  },
  {
    name: "Business",
    priceCents: 9900,
    credits: 13000,
    sortOrder: 3,
    active: true,
  },
];

async function seedCreditPacks() {
  const count = await CreditPack.countDocuments();
  if (count > 0) return { seeded: false, count };

  await CreditPack.insertMany(DEFAULT_PACKS);
  return { seeded: true, count: DEFAULT_PACKS.length };
}

module.exports = { seedCreditPacks, DEFAULT_PACKS };
