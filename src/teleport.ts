let teleport = null

if (process.env.TELEPORT_ENV === 'development') {
  console.info('teleport-generator-react: LOADING DEV teleport-lib-js')
  // tslint:disable-next-line
  teleport = require('../teleport-lib-js')
} else {
  // tslint:disable-next-line
  teleport = require('teleport-lib-js')
}

export default teleport
