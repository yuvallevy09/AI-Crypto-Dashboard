import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/db.js'

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        username: string
      }
    }
  }
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.auth_token

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    })
  }
}

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.auth_token

    if (!token) {
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
      }
    }).then(user => {
      if (user) {
        req.user = user
      }
      next()
    }).catch(() => {
      next()
    })
  } catch (error) {
    next()
  }
}
