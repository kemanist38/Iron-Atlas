import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(){
  console.log('Seeding regions...')

  // Create or get World Map game
  let game = await prisma.game.findFirst({ where: { name: 'World Map Template' } })
  if (!game) {
    // Find any existing user to be owner
    const owner = await prisma.user.findFirst()
    if (!owner) {
      console.log('No users found. Please create a user first (register endpoint) and then run seed.');
      process.exit(1)
    }
    game = await prisma.game.create({ data: { name: 'World Map Template', ownerId: owner.id } })
    console.log('Created game:', game.id)
  } else {
    console.log('Using existing game:', game.id)
  }

  // Load sample regions data
  const regionsData = require('../../data/regions.sample.json')

  for (const r of regionsData.features) {
    const name = r.properties.name || 'Unknown'
    // Check if region exists
    const exists = await prisma.region.findFirst({ where: { gameId: game.id, name } })
    if (exists) {
      console.log('Region exists, skipping:', name)
      continue
    }
    await prisma.region.create({ data: { gameId: game.id, name, geojson: r } })
    console.log('Seeded region:', name)
  }

  console.log('Seeding complete')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
