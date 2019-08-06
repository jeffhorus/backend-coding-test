class ApiError extends Error {
  constructor (errorObject) {
    super(errorObject.message)

    this.name = this.constructor.name

    this.error_code = errorObject.error_code
    this.message = errorObject.message
    this.http_code = errorObject.http_code
  }
}

module.exports = ApiError
