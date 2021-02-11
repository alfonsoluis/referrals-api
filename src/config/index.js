import { merge } from 'lodash'
const env = process.env.NODE_ENV || 'development'

const baseConfig = {
  env,
  isDev: env === 'development',
  isTest: env === 'testing',
  isProd: env === 'production',
  port: 3000,
  secrets: {
    jwt: process.env.JWT_SECRET,
    jwtExp: '100d',
  },
  baseUrl: 'localhost',
  conversionPrice: 10,
  referralLifespan: 5, // Expressed in days,
  SSLEnabled: false,
}

let envConfig = {}

switch (env) {
  case 'prod':
  case 'production':
    envConfig = require('./prod').config
    break
  case 'dev':
  case 'development':
    envConfig = require('./dev').config
    break
  case 'test':
  case 'testing':
    envConfig = require('./testing').config
    break
  default:
    envConfig = require('./dev').config
}

export default merge(baseConfig, envConfig)
