import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/db.js'

const router = Router()

// Validation schemas
const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = RegisterSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Set JWT in httpOnly cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    })

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }

    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Set JWT in httpOnly cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    })

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }

    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

// Get current user endpoint
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.cookies.auth_token

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Auth check error:', error)
    res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    })
  }
})

export default router
