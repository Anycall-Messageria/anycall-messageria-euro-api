const response = (res, statusCode = 200, success = false, message = '', data = {}, receiver = '') => {
    res.status(statusCode)
    res.json({
        success,
        message,
        data,
        receiver
    })

   res.end()
}

export default response
