// Node.js built-in modules

// Third-party libraries
import { type NextFunction, type Request, type Response } from 'express'
import mongoose from 'mongoose'

// Own modules
import TrackModel from '../models/Track.js'
import UserModel, { type IUser } from '../models/User.js'
import logger from '../utils/logger.js'

export async function createTrack (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Creating track')

    const {
        accessToken,
        trackType,
        timeOffset,
        data
    } = req.body as {
        accessToken?: unknown
        trackType?: unknown
        timeOffset?: unknown
        data?: unknown
    }

    if (typeof trackType !== 'string' || trackType === '') {
        res.status(400).json({ error: 'trackType must be a non-empty string.' })
        return
    }

    if (typeof accessToken !== 'string' || accessToken === '') {
        res.status(400).json({ error: 'accessToken must be a non-empty string.' })
        return
    }

    // If timeOffset is provided, it must be a number
    if (timeOffset !== undefined && typeof timeOffset !== 'number') {
        res.status(400).json({ error: 'timeOffset must be a number.' })
        return
    }

    const date = new Date(Date.now() + (timeOffset ?? 0))

    // Check if the potential date is valid
    if (isNaN(date.getTime())) {
        res.status(400).json({ error: 'Provided timeOffset results in an invalid date.' })
        return
    }

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

export async function getTracksWithQuery (req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.silly('Fetching tracks with query')

    const {
        trackType,
        fromDate,
        toDate
    } = req.query as Record<string, unknown>

    const user = req.user as IUser | undefined

    if (user === undefined) {
        res.status(401).json({ error: 'User not found.' })
        return
    }

    const tracks = await TrackModel.find({
        userId: user._id,
        ...(trackType !== undefined && { trackType }),
        ...(fromDate !== undefined && { date: { $gte: new Date(fromDate as string) } }),
        ...(toDate !== undefined && { date: { $lte: new Date(toDate as string) } })
    })

    if (tracks.length === 0) {
        res.status(204).json({ message: 'No tracks found with the provided query.' })
        return
    }

    res.status(200).send(tracks)
}
