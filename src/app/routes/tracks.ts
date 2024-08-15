// Node.js built-in modules

// Third-party libraries
import Router from 'express'

// Own modules
import asyncErrorHandler from '../utils/asyncErrorHandler.js'

// Controller functions
import { createTrack, deleteLastTrack } from '../controllers/tracksController.js'

// Destructuring and global variables
const router = Router()

/**
 * @route POST api/v1/tracks
 * @desc Post a new track
 * @access Public
 * @param {string} req.body.accessToken The access token required to authenticate the request.
 * @param {string} req.body.TrackType The type of the track to be created.
 * @param {number} [req.body.date] The date of the track.
 * @param {number} [req.body.duration] The duration of the track.
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

export default router
