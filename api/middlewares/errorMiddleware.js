const { formatResponse } = require("../common/MethodsCommon");

function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Kiểm tra loại lỗi và phản hồi phù hợp
  if (err.name === 'ValidationError') {
    return res.status(400).json(formatResponse(
      false,
      null,
      err.errors
    ));
  }

  if (err.name === 'CastError') {
    return res.status(400).json(formatResponse(
      false,
      null,
      'Invalid Data Format'
    ));
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(formatResponse(
      false,
      null,
      'Unauthorized'
    ));
  }

  if (err.name === 'MongoError') {
    return res.status(500).json(formatResponse(
      false,
      null,
      'Database Error'
    ));
  }

  // Xử lý lỗi không xác định hoặc lỗi khác
  res.status(err.status || 500).json(formatResponse(
    false,
    null,
    err.message || 'Internal Server Error',
  ));
}

module.exports = errorHandler;