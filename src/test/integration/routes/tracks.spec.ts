/* eslint-disable @typescript-eslint/no-unused-expressions */
// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Third-party libraries
import { expect } from 'chai'
import { type Response } from 'superagent'

// Own modules
import { chaiAppServer as agent } from '../../testSetup.js'
import UserModel, { type IUser } from '../../../app/models/User.js'
import TrackModel, { type ITrack } from '../../../app/models/Track.js'

describe('POST api/v1/tracks', function () {
    describe('Post a new track', function () {
        let testUser: IUser
        let accessToken: string
        const track = {
            trackType: 'TEST_TRACK',
            duration: 60000,
            date: new Date(2020, 4, 15)
        }

        beforeEach(async function () {
            testUser = new UserModel({
                userName: 'TestUser',
                email: 'test@test.com',
                password: 'password'
            })
            await testUser.save()
            accessToken = testUser.accessToken
        })

        it('should create a track', async function () {
            await agent.post('/v1/tracks').send({ ...track, accessToken })
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(1)
            expect(allTracks[0].trackType).to.equal(track.trackType)
        })

        it('should set the duration of the track', async function () {
            await agent.post('/v1/tracks').send({ ...track, accessToken })
            const foundTrack = await TrackModel.findOne({}).exec() as ITrack
            expect(foundTrack.duration).to.equal(track.duration)
        })

        it('should set the date of the track', async function () {
            await agent.post('/v1/tracks').send({ ...track, accessToken })
            const foundTrack = await TrackModel.findOne({}).exec() as ITrack
            expect(new Date(foundTrack.date).getTime()).to.equal(track.date.getTime())
        })

        it('should respond with status code 201', async function () {
            const res = await agent.post('/v1/tracks').send({ ...track, accessToken })
            expect(res).to.have.status(201)
        })

        it('should respond with the track', async function () {
            const res = await agent.post('/v1/tracks').send({ ...track, accessToken })
            expect(res.body.trackType).to.equal(track.trackType)
        })

        it('should add the user to the track', async function () {
            await agent.post('/v1/tracks').send({ ...track, accessToken })
            const foundUser = await UserModel.findOne({}).exec() as IUser
            const foundTrack = await TrackModel.findOne({}).exec() as ITrack
            expect(foundTrack.userId.toString()).to.equal(foundUser._id.toString())
        })

        it('should not create a track if accessToken is invalid', async function () {
            const res = await agent.post('/v1/tracks').send({ ...track, accessToken: 'invalidAccessToken' })
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(0)
            expect(res).to.have.status(404)
        })

        it('should set the date to the current date if not provided', async function () {
            await agent.post('/v1/tracks').send({ trackType: track.trackType, accessToken })
            const foundTrack = await TrackModel.findOne({}).exec() as ITrack
            expect(new Date(foundTrack.date).getTime()).to.be.closeTo(new Date().getTime(), 1000)
        })

        it('should set the duration to 0 if not provided', async function () {
            await agent.post('/v1/tracks').send({ trackType: track.trackType, accessToken })
            const foundTrack = await TrackModel.findOne({}).exec() as ITrack
            expect(foundTrack.duration).to.equal(0)
        })

        it('should set the duration to null if not provided', async function () {
            await agent.post('/v1/tracks').send({ trackType: track.trackType, accessToken, duration: null })
            const foundTrack = await TrackModel.findOne({}).exec() as ITrack
            expect(foundTrack.duration).to.be.null
        })
    })
})

describe('DELETE api/v1/tracks/last', function () {
    let testUserA: IUser
    let testTrackA1: ITrack

    beforeEach(async function () {
        testUserA = new UserModel({
            userName: 'TestUser',
            email: 'test@test.com',
            password: 'password'
        })
        await testUserA.save()
        testTrackA1 = new TrackModel({
            trackType: 'TEST_TRACK_A1',
            userId: testUserA._id
        })
        await testTrackA1.save()
    })

    describe('Delete a track', function () {
        let res: Response

        beforeEach(async function () {
            res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
        })

        it('should delete a track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(0)
        })

        it('should respond with status code 204', async function () {
            expect(res).to.have.status(204)
        })

        it('should have an empty body', async function () {
            expect(res.body).to.be.empty
        })
    })

    describe('Delete last created track with earlier date (timeOffset)', function () {
        let earlierDateTrack: ITrack

        beforeEach(async function () {
            earlierDateTrack = new TrackModel({
                trackType: 'EARLIER_DATE_TRACK',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // A week ago
                userId: testUserA._id
            })
            await earlierDateTrack.save()
            await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
        })

        it('should delete the newest created track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks[0].trackType).to.equal('TEST_TRACK_A1')
        })
    })

    describe('Invalid accessToken', function () {
        let res: Response

        beforeEach(async function () {
            res = await agent.delete('/v1/tracks/last').send({ accessToken: 'invalidAccessToken' })
        })

        it('should not delete track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(1)
        })

        it('should respond with status code 400', async function () {
            expect(res).to.have.status(404)
        })
    })

    describe('No accessToken', function () {
        let res: Response

        beforeEach(async function () {
            res = await agent.delete('/v1/tracks/last').send({})
        })

        it('should not delete track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(1)
        })

        it('should respond with status code 400', async function () {
            expect(res).to.have.status(400)
        })
    })

    describe('Empty accessToken', function () {
        let res: Response

        beforeEach(async function () {
            res = await agent.delete('/v1/tracks/last').send({ accessToken: '' })
        })

        it('should not delete track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(1)
        })

        it('should respond with status code 400', async function () {
            expect(res).to.have.status(400)
        })
    })

    describe('Multiple tracks', function () {
        beforeEach(async function () {
            const newTrack = new TrackModel({
                trackType: 'NEW_TRACK',
                userId: testUserA._id
            })
            await newTrack.save()
            await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
        })

        it('should delete a single track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(1)
        })

        it('should delete last track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks[0].trackType).to.equal('TEST_TRACK_A1')
        })

        it('should respond with status code 204', async function () {
            const res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
            expect(res).to.have.status(204)
        })

        it('should have an empty body', async function () {
            const res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
            expect(res.body).to.be.empty
        })
    })

    describe('No tracks', function () {
        let res: Response

        beforeEach(async function () {
            await TrackModel.deleteMany({}).exec()
            res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
        })

        it('should not delete a track', async function () {
            const allTracks = await TrackModel.find({}).exec()
            expect(allTracks.length).to.equal(0)
        })

        it('should respond with status code 204', async function () {
            expect(res).to.have.status(204)
        })

        it('should have an empty body', async function () {
            expect(res.body).to.be.empty
        })
    })

    describe('Multiple users', function () {
        let testUserB: IUser
        let testTrackB1: ITrack

        beforeEach(async function () {
            testUserB = new UserModel({
                userName: 'TestUserB',
                email: 'testB@test.com',
                password: 'password'
            })
            await testUserB.save()
            testTrackB1 = new TrackModel({
                trackType: 'TEST_TRACK_B1',
                userId: testUserB._id
            })
            await testTrackB1.save()
        })

        describe('No tracks', function () {
            let res: Response

            beforeEach(async function () {
                await TrackModel.deleteMany({}).exec()
                res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
            })

            it('should not delete a track', async function () {
                const allTracks = await TrackModel.find({}).exec()
                expect(allTracks.length).to.equal(0)
            })

            it('should respond with status code 204', async function () {
                expect(res).to.have.status(204)
            })

            it('should have an empty body', async function () {
                expect(res.body).to.be.empty
            })
        })

        describe('Single track', function () {
            let res: Response

            beforeEach(async function () {
                res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
            })

            it('should delete a track', async function () {
                const testUserATracks = await TrackModel.find({ userId: testUserA._id }).exec()
                expect(testUserATracks.length).to.equal(0)
            })

            it('should not delete any tracks of the other user', async function () {
                const testUserBTracks = await TrackModel.find({ userId: testUserB._id }).exec()
                expect(testUserBTracks.length).to.equal(1)
            })

            it('should respond with status code 204', async function () {
                expect(res).to.have.status(204)
            })

            it('should have an empty body', async function () {
                expect(res.body).to.be.empty
            })
        })

        describe('Multiple tracks', function () {
            let testTrackA2: ITrack
            let testTrackB2: ITrack
            let res: Response

            beforeEach(async function () {
                testTrackA2 = new TrackModel({
                    trackType: 'TEST_TRACK_A2',
                    userId: testUserA._id
                })
                await testTrackA2.save()
                testTrackB2 = new TrackModel({
                    trackType: 'TEST_TRACK_B2',
                    userId: testUserB._id
                })
                await testTrackB2.save()
                res = await agent.delete('/v1/tracks/last').send({ accessToken: testUserA.accessToken })
            })

            it('should delete a single track', async function () {
                const testUserATracks = await TrackModel.find({ userId: testUserA._id }).exec()
                expect(testUserATracks.length).to.equal(1)
            })

            it('should delete the last track', async function () {
                const testUserATracks = await TrackModel.find({ userId: testUserA._id }).exec()
                expect(testUserATracks[0].trackType).to.equal('TEST_TRACK_A1')
            })

            it('should not delete any tracks of the other user', async function () {
                const testUserBTracks = await TrackModel.find({ userId: testUserB._id }).exec()
                expect(testUserBTracks.length).to.equal(2)
            })

            it('should respond with status code 204', async function () {
                expect(res).to.have.status(204)
            })

            it('should have an empty body', async function () {
                expect(res.body).to.be.empty
            })
        })
    })
})
