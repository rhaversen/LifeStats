/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-unused-expressions */
// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import UserModel, { type IUser } from '../../app/models/User.js'
import TrackModel, { type ITrack } from '../../app/models/Track.js'

// Setup test environment
import '../testSetup.js'

describe('Track Model', function () {
    let user: IUser

    beforeEach(async function () {
        user = new UserModel({
            userName: 'TestUser',
            email: 'test@test.com',
            password: 'password'
        })
        await user.save()
    })

    describe('Creating a track must fill out default fields', function () {
        describe('Date', function () {
            let track: ITrack

            beforeEach(async function () {
                track = new TrackModel({
                    trackName: 'TEST_TRACK',
                    userId: user._id
                })
            })

            it('should fill out date', async function () {
                await track.save()
                expect(track.date).to.be.a('date')
            })

            it('should set correct date', async function () {
                await track.save()
                expect(track.date.getTime()).to.be.closeTo(new Date().getTime(), 1000)
            })

            it('should set date before saving', async function () {
                expect(track.date).to.be.a('date')
            })
        })

        describe('createdAt', function () {
            let track: ITrack

            beforeEach(async function () {
                track = new TrackModel({
                    trackName: 'TEST_TRACK',
                    userId: user._id
                })
            })

            it('should fill out createdAt', async function () {
                await track.save()
                expect(track.createdAt).to.be.a('date')
            })

            it('should set correct date', async function () {
                await track.save()
                expect(track.createdAt.getTime()).to.be.closeTo(new Date().getTime(), 1000)
            })
        })
    })

    describe('required fields', function () {
        it('should require trackName', async function () {
            const track = new TrackModel({
                userId: user._id
            })
            await track.save().catch((err) => {
                expect(err).to.not.be.null
            })
        })

        it('should require userId', async function () {
            const track = new TrackModel({
                trackName: 'TEST_TRACK'
            })
            await track.save().catch((err) => {
                expect(err).to.not.be.null
            })
        })
    })

    describe('trackName validation', function () {
        it('should allow a valid trackName', async function () {
            const track = new TrackModel({
                trackName: 'TEST_TRACK',
                userId: user._id
            })
            await track.save()
            expect(track.trackName).to.equal('TEST_TRACK')
        })

        it('should not allow an invalid trackName', async function () {
            const track = new TrackModel({
                trackName: 'INVALID_TRACK_NAME_ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                userId: user._id
            })
            await track.save().catch((err) => {
                expect(err).to.not.be.null
            })
        })
    })

    describe('data validation', function () {
        it('should allow no data', async function () {
            const track = new TrackModel({
                trackName: 'DATA_TRACK_1',
                userId: user._id
            })
            await track.save()
            expect(track.data).to.be.undefined
        })

        it('should allow valid data', async function () {
            const track = new TrackModel({
                trackName: 'DATA_TRACK_1',
                userId: user._id,
                data: {
                    dataField1: 1,
                    dataField2: 'string',
                    dataField3: true
                }
            })
            await track.save()
            expect(Object.fromEntries(track.data as Map<string, unknown>)).to.deep.equal({
                dataField1: 1,
                dataField2: 'string',
                dataField3: true
            })
        })

        it('should allow valid data with number enum', async function () {
            const track = new TrackModel({
                trackName: 'DATA_TRACK_3',
                userId: user._id,
                data: {
                    dataField1: 1
                }
            })
            await track.save()
            expect(Object.fromEntries(track.data as Map<string, unknown>)).to.deep.equal({
                dataField1: 1
            })
        })

        it('should allow valid data with string enum', async function () {
            const track = new TrackModel({
                trackName: 'DATA_TRACK_2',
                userId: user._id,
                data: {
                    dataField1: 'Low'
                }
            })
            await track.save()
            expect(Object.fromEntries(track.data as Map<string, unknown>)).to.deep.equal({
                dataField1: 'Low'
            })
        })

        it('should allow valid data with boolean enum', async function () {
            const track = new TrackModel({
                trackName: 'DATA_TRACK_1',
                userId: user._id,
                data: {
                    dataField3: true
                }
            })
            await track.save()
            expect(Object.fromEntries(track.data as Map<string, unknown>)).to.deep.equal({
                dataField1: true
            })
        })

        it('should allow valid data with min/max', async function () {
            const track = new TrackModel({
                trackName: 'DATA_TRACK_4',
                userId: user._id,
                data: {
                    dataField1: 3
                }
            })
            await track.save()
            expect(Object.fromEntries(track.data as Map<string, unknown>)).to.deep.equal({
                dataField1: 3
            })
        })

        it('should allow partial data with number', async function () {
            const track = new TrackModel({
                trackName: 'DATA_TRACK_1',
                userId: user._id,
                data: {
                    dataField1: 1
                }
            })
            await track.save()
            expect(Object.fromEntries(track.data as Map<string, unknown>)).to.deep.equal({
                dataField1: 1
            })
        })

        it('should allow partial data with string', async function () {
            const track = new TrackModel({
                trackName: 'DATA_TRACK_1',
                userId: user._id,
                data: {
                    dataField2: 'string'
                }
            })
            await track.save()
            expect(Object.fromEntries(track.data as Map<string, unknown>)).to.deep.equal({
                dataField2: 'string'
            })
        })

        it('should allow partial data with boolean', async function () {
            const track = new TrackModel({
                trackName: 'DATA_TRACK_1',
                userId: user._id,
                data: {
                    dataField3: true
                }
            })
            await track.save()
            expect(Object.fromEntries(track.data as Map<string, unknown>)).to.deep.equal({
                dataField3: true
            })
        })

        it('should allow data with string enum', async function () {
            const track = new TrackModel({
                trackName: 'DATA_TRACK_2',
                userId: user._id,
                data: {
                    dataField1: 'Low'
                }
            })
            await track.save()
            expect(Object.fromEntries(track.data as Map<string, unknown>)).to.deep.equal({
                dataField1: 'Low'
            })
        })

        it('should allow data with number enum', async function () {
            const track = new TrackModel({
                trackName: 'DATA_TRACK_3',
                userId: user._id,
                data: {
                    dataField1: 1
                }
            })
            await track.save()
            expect(Object.fromEntries(track.data as Map<string, unknown>)).to.deep.equal({
                dataField1: 1
            })
        })

        it('should allow data with number min/max', async function () {
            const track = new TrackModel({
                trackName: 'DATA_TRACK_4',
                userId: user._id,
                data: {
                    dataField1: 3
                }
            })
            await track.save()
            expect(Object.fromEntries(track.data as Map<string, unknown>)).to.deep.equal({
                dataField1: 3
            })
        })

        it('should not allow number below min', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_4',
                    userId: user._id,
                    data: {
                        dataField1: 0
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow number above max', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_4',
                    userId: user._id,
                    data: {
                        dataField1: 6
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow multiple enum values', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_2',
                    userId: user._id,
                    data: {
                        dataField1: ['Low', 'High']
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow string in number', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_1',
                    userId: user._id,
                    data: {
                        dataField1: 'string'
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow boolean in number', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_1',
                    userId: user._id,
                    data: {
                        dataField1: true
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow number in string', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_1',
                    userId: user._id,
                    data: {
                        dataField2: 1
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow boolean in string', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_1',
                    userId: user._id,
                    data: {
                        dataField2: true
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow number in boolean', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_1',
                    userId: user._id,
                    data: {
                        dataField3: 1
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow string in boolean', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_1',
                    userId: user._id,
                    data: {
                        dataField3: 'string'
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow string in min/max', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_4',
                    userId: user._id,
                    data: {
                        dataField1: 'string'
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow number in min/max', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_4',
                    userId: user._id,
                    data: {
                        dataField1: 1
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow boolean in min/max', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_4',
                    userId: user._id,
                    data: {
                        dataField1: true
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow invalid data field', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_1',
                    userId: user._id,
                    data: {
                        invalidDataField: 'test'
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow valid data with invalid trackName', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'INVALID_TRACK_NAME_ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                    userId: user._id,
                    data: {
                        dataField1: 1,
                        dataField2: 'string',
                        dataField3: true
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow invalid data with valid trackName', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_1',
                    userId: user._id,
                    data: {
                        invalidDataField: 'test'
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow valid data with invalid data', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'DATA_TRACK_1',
                    userId: user._id,
                    data: {
                        dataField1: 'string',
                        dataField2: 'string',
                        dataField3: 'string'
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })

        it('should not allow data with no data trackType', async function () {
            let errorOccurred = false
            try {
                const track = new TrackModel({
                    trackName: 'NO_DATA_TRACK',
                    userId: user._id,
                    data: {
                        dataField1: 1,
                        dataField2: 'string',
                        dataField3: true
                    }
                })
                await track.save()
            } catch (err) {
                errorOccurred = true
            }
            expect(errorOccurred).to.be.true
        })
    })
})
