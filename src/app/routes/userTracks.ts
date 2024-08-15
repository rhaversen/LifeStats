// Node.js built-in modules

// Third-party libraries
import Router from 'express'

// Own modules
import asyncErrorHandler from '../utils/asyncErrorHandler.js'

// Controller functions
import { ensureAuthenticated } from '../controllers/authController.js'
import { getTracksWithQuery } from '../controllers/userTracksController.js'

// Destructuring and global variables
const router = Router()

/**
 * @route GET api/v1/userTracks
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
