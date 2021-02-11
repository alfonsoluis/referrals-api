export const config = {
  referralLifespan: 10,
  baseUrl: 'alfonso.media/referrals',
  secrets: {
    jwt: process.env.JWT_SECRET,
  },
  dbUrl: process.env.MONGODB_URI,
}
