const badRequest = require('./badRequest.js');
const ok = require('./ok.js');
const serverError = require('./serverError.js');
const notFound = require('./notFound.js');
const forbidden = require('./forbidden.js');

module.exports = {
    badRequest,
    ok,
    serverError,
    notFound,
    forbidden
}