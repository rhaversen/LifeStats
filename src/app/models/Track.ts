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
    data?: Map<string, unknown> // The data of the track (A single track)

    // Timestamps
    createdAt: Date
    updatedAt: Date
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

function validateData (trackName: ITrack['trackName'], data?: Map<string, unknown>): boolean {
    // No data is always valid
    if (data === undefined || data === null) return true

    const fields: Record<string, any> = trackTypes[trackName]

    if (Object.keys(fields).length === 0) {
        logger.debug('No data track type found for:', trackName)
        return false
    }

    for (const key in data) {
        if (key.startsWith('$') || key.startsWith('_')) {
            // Ignore internal and metadata fields
            continue
        }
        if (!(key in fields)) {
            logger.debug('Invalid data field:', key)
            return false
        }
        const fieldType = fields[key]
        const value = data.get(key)

        if (Array.isArray(fieldType)) {
            if (!fieldType.includes(value)) {
                logger.debug('Value', value, 'not allowed for field', key)
                return false
            }
        } else if (typeof value !== typeof fieldType) {
            logger.debug('Type mismatch for field', key, ': expected', fieldType, ', got', typeof value)
            return false
        }
    }

    // Data is valid
    return true
}

// Compile the schema into a model
const TrackModel = model<ITrack>('Track', trackSchema)

export default TrackModel
