export const config = {
  referralLifespan: 10,
  baseUrl: process.env.BASE_URL,
  secrets: {
    jwt: process.env.JWT_SECRET,
  },
  dbUrl: process.env.MONGODB_URI,
}
