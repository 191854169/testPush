const SJCL = require('sjcl')
window.sjcl = SJCL
require('sjcl/core/codecBytes')
require('sjcl/core/hkdf')

export default SJCL
