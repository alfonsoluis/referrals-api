export const config = {
  referralLifespan: 10,
  baseUrl: 'alfonso.media/referrals',
  secrets: {
    jwt: 'thisisthesecret',
  },
  dbUrl: process.env.MONGODB_URI,
}
