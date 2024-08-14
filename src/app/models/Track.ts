// Node.js built-in modules

// Third-party libraries
import { type Document, model, Schema, type Types } from 'mongoose'

// Own modules
import logger from '../utils/logger.js'

const trackTypesModule = await import('../utils/trackTypes.js')

// Destructuring and global variables
const trackTypes = trackTypesModule.trackTypes

export interface ITrack extends Document {
    // Properties
    _id: Types.ObjectId
    trackName: keyof typeof trackTypes // The name of the track
    date: Date // The date the track took place
    duration?: number // The duration of the track in minutes
    userId: Types.ObjectId // The user who created the track
    data?: Record<string, unknown> // The data of the track (A single track)

    // Timestamps
    createdAt: Date
    updatedAt: Date

    // Methods
    validateTrackNameAndData: (trackName: string, data?: Record<string, unknown>) => boolean
}

const trackSchema = new Schema<ITrack>({
    trackName: {
        type: Schema.Types.String,
        required: true,
        enum: Object.keys(trackTypes)
    },
    date: {
        type: Schema.Types.Date,
        required: true,
        default: Date.now
    },
    duration: {
        type: Number,
        required: false,
        default: 0,
        min: [0, 'Duration cannot be negative']
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    data: {
        type: Schema.Types.Map,
        required: false
    }
}, {
    timestamps: true
})

// Adding indexes
trackSchema.index({ userId: 1 })
trackSchema.index({ trackName: 1 })
trackSchema.index({ createdAt: -1 })

// Pre-save middleware
trackSchema.pre('save', function (next) {
    logger.silly('Saving track')
    next()
})

// Adding validation to data
trackSchema.path('data').validate(function (this: ITrack) {
    return validateData(this.trackName, this.data)
}, 'Data is not valid')

export function validateData (trackName: ITrack['trackName'], data?: Record<string, unknown>): boolean {
    // No data is always valid data
    if (data === undefined || data === null) return true

    // Get the allowed keys for the track type
    const allowedKeys = trackTypes[trackName].dataFields as Record<string, unknown>

    // Check if the data has the allowed keys and the correct types
    for (const key in data) {
        // Check if key is allowed
        if (!Object.keys(allowedKeys).includes(key)) return false
        // Check if the type is correct
        if (typeof data[key] !== typeof allowedKeys[key]) return false
    }

    // Data is valid
    return true
}

// Compile the schema into a model
const TrackModel = model<ITrack>('Track', trackSchema)

export default TrackModel
