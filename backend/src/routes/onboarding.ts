import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { OnboardingSchema } from '@crypto-dashboard/shared'
import { prisma } from '../lib/db.js'

const router = Router()

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: any) => {
  const token = req.cookies.auth_token

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No authentication token'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    })
  }
}

// Complete onboarding endpoint
router.post('/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { interestedAssets, investorType, contentPreferences } = OnboardingSchema.parse(req.body)
    const userId = req.user.userId

    // Update user with onboarding preferences
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
        interestedAssets,
        investorType,
        contentPreferences,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        onboardingCompleted: true,
        interestedAssets: true,
        investorType: true,
        contentPreferences: true,
      }
    })

    // Create initial watchlist entries based on interested assets
    const watchlistEntries = interestedAssets.map(symbol => ({
      userId,
      symbol,
    }))

    await prisma.watchlist.createMany({
      data: watchlistEntries,
      skipDuplicates: true,
    })

    // Create default portfolio
    await prisma.portfolio.create({
      data: {
        name: 'My Portfolio',
        description: 'Default portfolio created during onboarding',
        userId,
      }
    })

    res.json({
      success: true,
      user: updatedUser,
      message: 'Onboarding completed successfully'
    })

  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.message
      })
    }

    console.error('Onboarding completion error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Get onboarding status
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingCompleted: true,
        interestedAssets: true,
        investorType: true,
        contentPreferences: true,
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      onboardingCompleted: user.onboardingCompleted,
      preferences: {
        interestedAssets: user.interestedAssets,
        investorType: user.investorType,
        contentPreferences: user.contentPreferences,
      }
    })

  } catch (error) {
    console.error('Onboarding status error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

export default router
