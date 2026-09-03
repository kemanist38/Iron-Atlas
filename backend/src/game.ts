import express from 'express'
import { prisma } from './prisma'

const router = express.Router()

// Create a new game
router.post('/', async (req, res) => {
  try {
    const { name } = req.body
    const userId = Number((req as any).user?.userId)
    if (!userId) return res.status(401).json({ error: 'Yetkilendirme gerekli' })
    const game = await prisma.game.create({ data: { name, ownerId: userId } })
    // Add owner as player
    await prisma.gamePlayer.create({ data: { gameId: game.id, userId } })
    return res.json(game)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Oyun oluşturulamadı' })
  }
})

// Join game
router.post('/:id/join', async (req, res) => {
  try {
    const gameId = Number(req.params.id)
    const userId = Number((req as any).user?.userId)
    if (!userId) return res.status(401).json({ error: 'Yetkilendirme gerekli' })
    const existing = await prisma.gamePlayer.findFirst({ where: { gameId, userId } })
    if (existing) return res.status(400).json({ error: 'Zaten katılıyorsunuz' })
    const gp = await prisma.gamePlayer.create({ data: { gameId, userId } })
    return res.json(gp)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Oyuna katılamadı' })
  }
})

// Get game
router.get('/:id', async (req, res) => {
  try {
    const gameId = Number(req.params.id)
    const game = await prisma.game.findUnique({ where: { id: gameId }, include: { players: { include: { user: true } }, regions: true, turns: true } })
    if (!game) return res.status(404).json({ error: 'Oyun bulunamadı' })
    return res.json(game)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Oyun alınamadı' })
  }
})

// Submit turn
router.post('/:id/turns', async (req, res) => {
  try {
    const gameId = Number(req.params.id)
    const userId = Number((req as any).user?.userId)
    if (!userId) return res.status(401).json({ error: 'Yetkilendirme gerekli' })
    const gp = await prisma.gamePlayer.findFirst({ where: { gameId, userId } })
    if (!gp) return res.status(403).json({ error: 'Oyuncu olarak katılmanız gerekiyor' })
    const { actions } = req.body
    const turn = await prisma.turn.create({ data: { gameId, playerId: gp.id, actions } })
    // In a later step we'll queue turn resolution
    return res.json(turn)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Tur gönderilemedi' })
  }
})

export default router
