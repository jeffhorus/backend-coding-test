'use strict'

const request = require('supertest')
const expect = require('expect.js')
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')

const app = require('../src/app')(db)
const buildSchemas = require('../src/schemas')

describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err)
      }

      buildSchemas(db)

      done()
    })
  })

  beforeEach(() => {
    db.run(`DELETE FROM Rides`, (err) => {
      if (err) throw err
    });
  })

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done)
    })
  })

  describe('POST /rides', () => {
    describe('startLatitude outside range', () => {
      it('should throw VALIDATION_ERROR', (done) => {
        request(app)
          .post('/rides')
          .send({
            start_lat: 200
          })
          .expect('Content-Type', /json/)
          .expect(200, {
            error_code: 'VALIDATION_ERROR',
            message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
          }, done)
      })
    })

    describe('startLongitude outside range', () => {
      it('should throw VALIDATION_ERROR', (done) => {
        request(app)
          .post('/rides')
          .send({
            start_long: 200
          })
          .expect('Content-Type', /json/)
          .expect(200, {
            error_code: 'VALIDATION_ERROR',
            message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
          }, done)
      })
    })

    describe('endLatitude outside range', () => {
      it('should throw VALIDATION_ERROR', (done) => {
        request(app)
          .post('/rides')
          .send({
            end_lat: 200
          })
          .expect('Content-Type', /json/)
          .expect(200, {
            error_code: 'VALIDATION_ERROR',
            message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
          }, done)
      })
    })

    describe('endLongitude outside range', () => {
      it('should throw VALIDATION_ERROR', (done) => {
        request(app)
          .post('/rides')
          .send({
            end_long: 200
          })
          .expect('Content-Type', /json/)
          .expect(200, {
            error_code: 'VALIDATION_ERROR',
            message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
          }, done)
      })
    })

    describe('rider name not assigned', () => {
      it('should throw VALIDATION_ERROR', (done) => {
        request(app)
          .post('/rides')
          .send({
            start_lat: 10,
            end_lat: 11,
            start_long: 10,
            end_long: 11
          })
          .expect('Content-Type', /json/)
          .expect(200, {
            error_code: 'VALIDATION_ERROR',
            message: 'Rider name must be a non empty string'
          }, done)
      })
    })

    describe('driver name not assigned', () => {
      it('should throw VALIDATION_ERROR', (done) => {
        request(app)
          .post('/rides')
          .send({
            start_lat: 10,
            end_lat: 11,
            start_long: 10,
            end_long: 11,
            rider_name: 'Jeffrey'
          })
          .expect('Content-Type', /json/)
          .expect(200, {
            error_code: 'VALIDATION_ERROR',
            message: 'Driver name must be a non empty string'
          }, done)
      })
    })

    describe('driver vehicle not assigned', () => {
      it('should throw VALIDATION_ERROR', (done) => {
        request(app)
          .post('/rides')
          .send({
            start_lat: 10,
            end_lat: 11,
            start_long: 10,
            end_long: 11,
            rider_name: 'Jeffrey',
            driver_name: 'Tofu'
          })
          .expect('Content-Type', /json/)
          .expect(200, {
            error_code: 'VALIDATION_ERROR',
            message: 'Driver vehicle must be a non empty string'
          }, done)
      })
    })

    describe('all assigned correctly', () => {
      it('should give success response', (done) => {
        request(app)
          .post('/rides')
          .send({
            start_lat: 10,
            end_lat: 11,
            start_long: 10,
            end_long: 11,
            rider_name: 'Jeffrey',
            driver_name: 'Tofu',
            driver_vehicle: 'Buroq'
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err)

            expect(res.body).to.be.an('array')
            expect(res.body).to.have.length(1)
            expect(res.body[0].startLat).to.be.equal(10)
            expect(res.body[0].endLat).to.be.equal(11)
            expect(res.body[0].startLong).to.be.equal(10)
            expect(res.body[0].endLong).to.be.equal(11)
            expect(res.body[0].riderName).to.be.equal('Jeffrey')
            expect(res.body[0].driverName).to.be.equal('Tofu')
            expect(res.body[0].driverVehicle).to.be.equal('Buroq')
            return done()
          })
      })
    })
  })

  describe('GET /rides', () => {
    describe('ride not found', () => {
      it('should throw RIDES_NOT_FOUND_ERROR', (done) => {
        const rideID = 'nonexistentid'

        request(app)
          .get(`/rides/${rideID}`)
          .expect('Content-Type', /json/)
          .expect(200, {
            error_code: 'RIDES_NOT_FOUND_ERROR',
            message: 'Could not find any rides'
          }, done)
      })
    })

    describe('ride found', () => {
      let rideID = 100

      beforeEach(() => {
        const values = [
          rideID,
          10,
          10,
          11,
          11,
          'Jeffrey',
          'Tofu',
          'Buroq'
        ]

        db.run('INSERT INTO Rides(rideID, startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', values, function (err) {
          if (err) {
            throw err
          }
        })
      })

      it('should give success response', (done) => {
        request(app)
          .get(`/rides/${rideID}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err)

            expect(res.body).to.be.an('array')
            expect(res.body).to.have.length(1)
            expect(res.body[0].rideID).to.be.equal(rideID)
            expect(res.body[0].startLat).to.be.equal(10)
            expect(res.body[0].startLong).to.be.equal(10)
            expect(res.body[0].endLat).to.be.equal(11)
            expect(res.body[0].endLong).to.be.equal(11)
            expect(res.body[0].riderName).to.be.equal('Jeffrey')
            expect(res.body[0].driverName).to.be.equal('Tofu')
            expect(res.body[0].driverVehicle).to.be.equal('Buroq')
            return done()
          })
      })
    })
  })
})
