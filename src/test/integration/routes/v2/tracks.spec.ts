/* eslint-disable @typescript-eslint/no-unused-expressions */
// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Third-party libraries
import { expect } from 'chai'
import { type Response } from 'superagent'

// Own modules
import { chaiAppServer as agent } from '../../../testSetup.js'
import UserModel, { type IUser } from '../../../../app/models/User.js'
import TrackModel from '../../../../app/models/Track.js'

describe('GET api/v2/tracks', function () {
    let userA: IUser
    let userB: IUser
    let sessionCookie: string

    const userAFields = {
        userName: 'TestUser1',
        email: 'test1@test.com',
        password: 'password'
    }

    const userBFields = {
        userName: 'TestUser2',
        email: 'test2@test.com',
        password: 'password'
    }

    beforeEach(async function () {
        userA = await UserModel.create(userAFields)
        userB = await UserModel.create(userBFields)

        await TrackModel.insertMany([
            { trackType: 'TEST_TRACK_A1', userId: userA._id, date: new Date(Date.UTC(2020, 4, 14)) },
            { trackType: 'TEST_TRACK_A1', userId: userA._id, date: new Date(Date.UTC(2020, 4, 15)) },
            { trackType: 'TEST_TRACK_A2', userId: userA._id, date: new Date(Date.UTC(2020, 4, 16)) },
            { trackType: 'TEST_TRACK_A3', userId: userA._id, date: new Date(Date.UTC(2020, 4, 17)) },
            { trackType: 'TEST_TRACK_B1', userId: userB._id },
            { trackType: 'TEST_TRACK_B2', userId: userB._id }
        ])

        // Login userA
        const logInRes = await agent.post('/v1/auth/login-local').send(userAFields)

        // Save session cookie
        sessionCookie = logInRes.headers['set-cookie']
    })

    describe('Fetch all tracks', function () {
        let res: Response

        beforeEach(async function () {
            res = await agent.get('/v2/tracks').set('Cookie', sessionCookie)
        })

        it('should respond with status code 200', async function () {
            expect(res).to.have.status(200)
        })

        it('should respond with an array of tracks', async function () {
            expect(res.body).to.be.an('array')
        })

        it('should respond with the correct number of tracks', async function () {
            expect(res.body).to.have.length(4)
        })

        it('should respond with all tracks of the user', async function () {
            expect(res.body[0].trackType).to.equal('TEST_TRACK_A1')
            expect(res.body[1].trackType).to.equal('TEST_TRACK_A1')
            expect(res.body[2].trackType).to.equal('TEST_TRACK_A2')
            expect(res.body[3].trackType).to.equal('TEST_TRACK_A3')
        })

        it('should not respond with any track of other users', async function () {
            for (const track of res.body) {
                expect(track.trackType).to.not.include('B')
            }
        })
    })

    describe('Fetch tracks with query', function () {
        describe('Track name query', function () {
            let res: Response

            beforeEach(async function () {
                res = await agent.get('/v2/tracks?trackType=TEST_TRACK_A1').set('Cookie', sessionCookie)
            })

            it('should respond with status code 200', async function () {
                expect(res).to.have.status(200)
            })

            it('should respond with an array of tracks', async function () {
                expect(res.body).to.be.an('array')
            })

            it('should respond with the correct number of tracks', async function () {
                expect(res.body).to.have.length(2)
            })

            it('should respond with all tracks of the user', async function () {
                expect(res.body[0].trackType).to.equal('TEST_TRACK_A1')
                expect(res.body[1].trackType).to.equal('TEST_TRACK_A1')
            })

            it('should not respond with any track of other users', async function () {
                for (const track of res.body) {
                    expect(track.trackType).to.not.include('B')
                }
            })

            it('should not respond with any track that does not match the query', async function () {
                for (const track of res.body) {
                    expect(track.trackType).to.not.include('2')
                }
            })
        })

        describe('Date query', function () {
            describe('From date query', function () {
                let res: Response

                beforeEach(async function () {
                    res = await agent.get('/v2/tracks?fromDate=2020-05-16').set('Cookie', sessionCookie)
                })

                it('should respond with status code 200', async function () {
                    expect(res).to.have.status(200)
                })

                it('should respond with an array of tracks', async function () {
                    expect(res.body).to.be.an('array')
                })

                it('should respond with the correct number of tracks', async function () {
                    expect(res.body).to.have.length(2)
                })

                it('should respond with all tracks of the user', async function () {
                    expect(res.body[0].trackType).to.equal('TEST_TRACK_A2')
                    expect(res.body[1].trackType).to.equal('TEST_TRACK_A3')
                })

                it('should not respond with any track of other users', async function () {
                    for (const track of res.body) {
                        expect(track.trackType).to.not.include('B')
                    }
                })

                it('should not respond with any track that does not match the query', async function () {
                    for (const track of res.body) {
                        expect(track.trackType).to.not.include('1')
                    }
                })

                it('should not respond with any track that is older than the query', async function () {
                    for (const track of res.body) {
                        expect(new Date(track.date as Date).getTime()).to.be.at.least(new Date('2020-05-16').getTime())
                    }
                })
            })

            describe('To date query', function () {
                let res: Response

                beforeEach(async function () {
                    res = await agent.get('/v2/tracks?toDate=2020-05-16').set('Cookie', sessionCookie)
                })

                it('should respond with status code 200', async function () {
                    expect(res).to.have.status(200)
                })

                it('should respond with an array of tracks', async function () {
                    expect(res.body).to.be.an('array')
                })

                it('should respond with the correct number of tracks', async function () {
                    expect(res.body).to.have.length(3)
                })

                it('should respond with all tracks of the user that match the query', async function () {
                    expect(res.body[0].trackType).to.equal('TEST_TRACK_A1')
                    expect(res.body[1].trackType).to.equal('TEST_TRACK_A1')
                    expect(res.body[2].trackType).to.equal('TEST_TRACK_A2')
                })

                it('should not respond with any track of other users', async function () {
                    for (const track of res.body) {
                        expect(track.trackType).to.not.include('B')
                    }
                })

                it('should not respond with any track that does not match the query', async function () {
                    for (const track of res.body) {
                        expect(track.trackType).to.not.include('3')
                    }
                })

                it('should not respond with any track that is newer than the query', async function () {
                    for (const track of res.body) {
                        expect(new Date(track.date as Date).getTime()).to.be.at.most(new Date('2020-05-16').getTime())
                    }
                })
            })
        })
    })

    describe('Combined query', function () {
        let res: Response

        beforeEach(async function () {
            res = await agent.get('/v2/tracks?trackType=TEST_TRACK_A1&fromDate=2020-05-15').set('Cookie', sessionCookie)
        })

        it('should respond with status code 200', async function () {
            expect(res).to.have.status(200)
        })

        it('should respond with an array of tracks', async function () {
            expect(res.body).to.be.an('array')
        })

        it('should respond with the correct number of tracks', async function () {
            expect(res.body).to.have.length(1)
        })

        it('should respond with all tracks of the user that match the query', async function () {
            expect(res.body[0].trackType).to.equal('TEST_TRACK_A1')
        })

        it('should not respond with any track of other users', async function () {
            for (const track of res.body) {
                expect(track.trackType).to.not.include('B')
            }
        })

        it('should not respond with any track that does not match the query', async function () {
            for (const track of res.body) {
                expect(track.trackType).to.not.include('2')
            }
        })

        it('should not respond with any track that is older than the query', async function () {
            for (const track of res.body) {
                expect(new Date(track.date as Date).getTime()).to.be.at.least(new Date('2020-05-15').getTime())
            }
        })

        describe('No match', function () {
            let res: Response

            beforeEach(async function () {
                res = await agent.get('/v2/tracks?trackType=TEST_TRACK_A1&fromDate=2020-05-16').set('Cookie', sessionCookie)
            })

            it('should respond with status code 204', async function () {
                expect(res).to.have.status(204)
            })

            it('should not respond with an array of tracks', async function () {
                expect(res.body).to.be.empty
            })

            it('should not respond with any tracks', async function () {
                expect(JSON.stringify(res.body)).to.not.include('trackType')
            })
        })
    })

    describe('Query with no match', function () {
        describe('trackType query', function () {
            let res: Response

            beforeEach(async function () {
                res = await agent.get('/v2/tracks?trackType=nonExistingTrack').set('Cookie', sessionCookie)
            })

            it('should respond with status code 204', async function () {
                expect(res).to.have.status(204)
            })

            it('should not respond with an array of tracks', async function () {
                expect(res.body).to.be.empty
            })

            it('should not respond with any tracks', async function () {
                expect(JSON.stringify(res.body)).to.not.include('trackType')
            })
        })

        describe('fromDate query', function () {
            let res: Response

            beforeEach(async function () {
                res = await agent.get('/v2/tracks?fromDate=2020-05-18').set('Cookie', sessionCookie)
            })

            it('should respond with status code 204', async function () {
                expect(res).to.have.status(204)
            })

            it('should not respond with an array of tracks', async function () {
                expect(res.body).to.be.empty
            })

            it('should not respond with any tracks', async function () {
                expect(JSON.stringify(res.body)).to.not.include('trackType')
            })
        })

        describe('toDate query', function () {
            let res: Response

            beforeEach(async function () {
                res = await agent.get('/v2/tracks?toDate=2020-05-13').set('Cookie', sessionCookie)
            })

            it('should respond with status code 204', async function () {
                expect(res).to.have.status(204)
            })

            it('should not respond with an array of tracks', async function () {
                expect(res.body).to.be.empty
            })

            it('should not respond with any tracks', async function () {
                expect(JSON.stringify(res.body)).to.not.include('trackType')
            })
        })
    })
})
