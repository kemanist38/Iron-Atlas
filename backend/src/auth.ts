import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import nodemailer from 'nodemailer'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'change-me'

function createTransporter() {
  const host = process.env.MAIL_HOST
  const port = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 2525
  const user = process.env.MAIL_USER
  const pass = process.env.MAIL_PASS
  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      auth: { user, pass }
    })
  }
  return null
}

const transporter = createTransporter()

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email ve şifre gerekli' })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ error: 'Bu e-posta ile kayıtlı kullanıcı var' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, password: hashed, username } })

    // send welcome / verification email
    const mailOptions = {
      from: 'Iron Atlas <no-reply@iron-atlas.local>',
      to: email,
      subject: 'Iron Atlas - Hoşgeldiniz',
      text: `Merhaba ${username || email},\n\nHesabınız oluşturuldu.`
    }

    if (transporter) {
      transporter.sendMail(mailOptions).catch(err => console.error('Mail gönderme hatası:', err))
    } else {
      console.log('E-posta (geliştirme modunda):', mailOptions)
    }

    return res.json({ id: user.id, email: user.email, username: user.username })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Kayıt sırasında hata' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email ve şifre gerekli' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Hatalı kullanıcı veya şifre' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Hatalı kullanıcı veya şifre' })

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({ token })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Giriş sırasında hata' })
  }
})

// Protected example
function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Yetkilendirme gerekli' })
  const parts = auth.split(' ')
  if (parts.length !== 2) return res.status(401).json({ error: 'Geçersiz token formatı' })
  const token = parts[1]
  try {
    const payload: any = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' })
  }
}

router.get('/me', authMiddleware, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: Number(req.user.userId) } })
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' })
  return res.json({ id: user.id, email: user.email, username: user.username })
})

export default router
