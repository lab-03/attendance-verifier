require("dotenv").config();
const { env } = process;

module.exports = {
  development: {
    url: env.DB_DEV_URL
  },
  test: {
    url: env.DB_TEST_URL
  },
  production: {
    url: env.DATABASE_URL
  }
};
