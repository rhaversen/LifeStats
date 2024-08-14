// Node.js built-in modules

// Third-party libraries
import Router from 'express'

// Own modules
import asyncErrorHandler from '../utils/asyncErrorHandler.js'

// Controller functions
import { createTrack, deleteLastTrack, getTracksWithQuery } from '../controllers/tracksController.js'
import { ensureAuthenticated } from '../controllers/authController.js'

// Destructuring and global variables
const router = Router()

/**
 * @route POST api/v1/tracks
 * @desc Post a new track
 * @access Public
 * @param {string} req.body.accessToken The access token required to authenticate the request.
 * @param {string} req.body.TrackType The type of the track to be created.
 * @param {number} [req.body.timeOffset] Relative Time Offset (milliseconds).
 * @param {object} [req.body.data] The data of the track.
 * @return {number} res.status The status code of the HTTP response.
 * @return {object} res.body The newly created track.
 */
router.post('/',
    asyncErrorHandler(createTrack)
)

/**
 * @route DELETE api/v1/tracks/last
 * @desc Delete the last created track
 * @access Public
 * @param {string} req.body.accessToken The access token required to authenticate the request.
 * @return {number} res.status The status code of the HTTP response.
 */
router.delete('/last',
    asyncErrorHandler(deleteLastTrack)
)

/**
 * @route GET api/v1/tracks
 * @desc Get tracks with a query
 * @access Private
 * @param {string} req.query.trackType The tracks to be fetched.
 * @param {string} req.query.fromDate The starting date of the tracks to be fetched.
 * @param {string} req.query.toDate The ending date of the tracks to be fetched.
 * @return {number} res.status The status code of the HTTP response.
 * @return {object} res.body The fetched tracks.
 */
router.get('/',
    ensureAuthenticated,
    asyncErrorHandler(getTracksWithQuery)
)

export default router
