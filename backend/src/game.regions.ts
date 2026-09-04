import express from 'express'
import { prisma } from './prisma'

const router = express.Router()

// GET /api/games/:id/regions
router.get('/:id/regions', async (req, res) => {
  try {
    const gameId = Number(req.params.id)
    const regions = await prisma.region.findMany({ where: { gameId } })
    return res.json(regions)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Bölgeler alınamadı' })
  }
})

export default router
