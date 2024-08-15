// Node.js built-in modules

// Third-party libraries
import { type NextFunction, type Request, type Response } from 'express'

// Own modules
import TrackModel from '../models/Track.js'
import { type IUser } from '../models/User.js'
import logger from '../utils/logger.js'

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
