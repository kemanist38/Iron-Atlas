import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import fetch from 'node-fetch'

const prisma = new PrismaClient()

async function downloadGeoJSON(url: string) {
  console.log('Downloading GeoJSON from', url)
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to download GeoJSON: ' + res.status)
  return await res.json()
}

async function main(){
  console.log('Full-world seeding started')

  // Ensure there is an owner user; if none, create a seeded owner (credentials printed)
  let owner = await prisma.user.findFirst()
  if (!owner) {
    const email = 'seed-owner@example.com'
    const rawPassword = 'ChangeMe123!' // immediately change after seed
    const hashed = await bcrypt.hash(rawPassword, 10)
    owner = await prisma.user.create({ data: { email, password: hashed, username: 'seed-owner' } })
    console.log('Created seed owner:', email, 'password:', rawPassword)
  }

  // Create or get game
  let game = await prisma.game.findFirst({ where: { name: 'World Map Template Full' } })
  if (!game) {
    game = await prisma.game.create({ data: { name: 'World Map Template Full', ownerId: owner.id } })
    console.log('Created game:', game.id)
  } else {
    console.log('Using existing game:', game.id)
  }

  // Download a public countries GeoJSON (Natural Earth / datahub mirror)
  const url = 'https://datahub.io/core/geo-countries/r/countries.geojson'
  const geojson = await downloadGeoJSON(url)
  if (!geojson.features || !Array.isArray(geojson.features)) throw new Error('Invalid GeoJSON')

  for (const f of geojson.features) {
    const name = f.properties?.ADMIN || f.properties?.name || f.properties?.NAME || 'Unknown'
    const exists = await prisma.region.findFirst({ where: { gameId: game.id, name } })
    if (exists) {
      console.log('Region exists, skipping:', name)
      continue
    }
    await prisma.region.create({ data: { gameId: game.id, name, geojson: f } })
    console.log('Seeded region:', name)
  }

  console.log('Full-world seeding complete')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
