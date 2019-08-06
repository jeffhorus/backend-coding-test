'use strict'

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

const winston = require('winston')

const ApiError = require('./api_error')

app.logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

module.exports = (db) => {
  app.get('/health', (req, res) => res.send('Healthy'))

  app.post('/rides', jsonParser, (req, res, next) => {
    const startLatitude = Number(req.body.start_lat)
    const startLongitude = Number(req.body.start_long)
    const endLatitude = Number(req.body.end_lat)
    const endLongitude = Number(req.body.end_long)
    const riderName = req.body.rider_name
    const driverName = req.body.driver_name
    const driverVehicle = req.body.driver_vehicle

    if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
      return next(new ApiError({
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
      }))
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      return next(new ApiError({
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
      }))
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      return next(new ApiError({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string'
      }))
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      return next(new ApiError({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver name must be a non empty string'
      }))
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      return next(new ApiError({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver vehicle must be a non empty string'
      }))
    }

    var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle]

    db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
      if (err) {
        return next(new ApiError({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error'
        }))
      }

      db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
        if (err) {
          return next(new ApiError({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error'
          }))
        }

        res.locals.response_data = rows
        next()
      })
    })
  })

  app.get('/rides', (req, res, next) => {
    let page, limit
    let command = 'SELECT * FROM Rides'

    if (req.query.limit) {
      limit = req.query.limit

      command += ` LIMIT ${limit}`

      if (req.query.page) {
        page = req.query.page

        command += ` OFFSET ${(page - 1) * limit}`
      }
    }

    db.all(command, function (err, rows) {
      if (err) {
        console.log(err)
        return next(new ApiError({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error'
        }))
      }

      if (rows.length === 0) {
        return next(new ApiError({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides'
        }))
      }

      res.locals.response_data = rows
      next()
    })
  })

  app.get('/rides/:id', (req, res, next) => {
    db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
      if (err) {
        return next(new ApiError({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error'
        }))
      }

      if (rows.length === 0) {
        return next(new ApiError({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides'
        }))
      }

      res.locals.response_data = rows
      next()
    })
  })

  app.use((err, req, res, next) => {
    if (!err) {
      return next()
    }

    app.logger.log({
      level: 'error',
      message: err
    })

    return res.send({
      error_code: err.error_code,
      message: err.message
    })
  })

  app.use((req, res, next) => {
    res.send(res.locals.response_data)
  })

  return app
}
