// Node.js built-in modules

// Third-party libraries
import { type NextFunction, type Request, type Response } from 'express'
import mongoose from 'mongoose'

// Own modules
import TrackModel from '../models/Track.js'
import UserModel from '../models/User.js'
import logger from '../utils/logger.js'

export async function createTrack (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Creating track')

    const {
        accessToken,
        trackType,
        date,
        duration,
        data
    } = req.body as Record<string, unknown>

    const user = await UserModel.findOne({ accessToken })

    if (user === null) {
        res.status(404).json({ error: 'accessToken is not valid.' })
        return
    }

    try {
        const newTrack = await TrackModel.create({
            trackType,
            date,
            userId: user._id,
            duration,
            data
        })

        res.status(201).json(newTrack)
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ error: error.message })
        } else {
            next(error)
        }
    }
}

export async function deleteLastTrack (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Deleting last track')

    const {
        accessToken
    } = req.body as {
        accessToken?: unknown
    }

    if (typeof accessToken !== 'string' || accessToken === '') {
        res.status(400).json({ error: 'accessToken must be a non-empty string.' })
        return
    }

    const user = await UserModel.findOne({ accessToken })

    if (user === null) {
        res.status(404).json({ error: 'accessToken is not valid.' })
        return
    }

    // Find and delete the last track created by the user
    await TrackModel.findOneAndDelete({ userId: user._id }).sort({ createdAt: -1 })

    res.status(204).send()
}
