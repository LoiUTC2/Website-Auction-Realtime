const common = require("./common.validation")
const paging = require("./paging.validation")
const auth = require("./auth.validation")
const user = require("./user.validation")

module.exports = {
    ...common,
    ...auth,
    ...user,
    ...paging
};