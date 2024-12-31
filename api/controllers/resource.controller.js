const asyncHandle = require("express-async-handler");

const { formatResponse } = require('../common/MethodsCommon');

const imageUpload = asyncHandle(async (req, res) => {
  res.json(
    formatResponse(true, { url: req.file.path }, "upload successfully!")
  );
});

module.exports = { imageUpload };
