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

    // Retrieve the data fields specification for the given track type
    const fields = trackTypes[trackName]?.dataFields

    // If no dataFields defined, only empty data is valid
    if (Object.keys(fields).length === 0) return data.size === 0

    // Validate each data field against its specification
    for (const [key, value] of data) {
        const spec = fields[key]
        if (typeof spec === 'undefined') return false // Field not defined in specification

        if (spec instanceof Array) {
            // Handle array type
            if (!spec.includes(value)) return false
        } else if (spec === Number) {
            // Handle number type
            if (typeof value !== 'number') return false
        } else if (spec === String) {
            // Handle string type
            if (typeof value !== 'string') return false
        } else if (spec === Boolean) {
            // Handle boolean type
            if (typeof value !== 'boolean') return false
        } else if (typeof spec === 'object') {
            // Handle number type with min and max
            if (spec.min !== undefined && spec.max !== undefined) {
                if (typeof value !== 'number') return false
                if (value < spec.min || value > spec.max) return false
            } else {
                // Unexpected object type
                return false
            }
        } else {
            // Unexpected specification type
            return false
        }
    }

    // All checks passed
    return true
}

// Compile the schema into a model
const TrackModel = model<ITrack>('Track', trackSchema)

export default TrackModel
