const dotenv = require("dotenv")
const CoinCheck = require("coincheck")
const axios = require("axios")
const { register_balance } = require("./registration.js")

const { version } = require("./package.json")

dotenv.config()

process.env.TZ = "Asia/Tokyo"

console.log(`Coincheck scraper v${version}`)

const { COINBASE_ACCESS_KEY, COINBASE_SECRET_KEY } = process.env

const coinCheck = new CoinCheck.CoinCheck(
  COINBASE_ACCESS_KEY,
  COINBASE_SECRET_KEY
)

const params = {
  options: {
    success: async (data, response, params) => {
      const { success: _, ...currency_balances } = JSON.parse(data)

      const {
        data: { jpy: jpy_rates },
      } = await axios.get(`https://coincheck.com/api/rate/all`)

      const total = Object.keys(currency_balances).reduce((prev, key) => {
        const balance = currency_balances[key]
        const rate = jpy_rates[key]
        if (rate) return prev + balance * rate
        else return prev
      }, 0)

      await register_balance(total)

      console.log(`Registration successful: JPY ${total}`)
    },
    error: (error, response, params) => {
      console.error(error)
      success = false
    },
  },
}

coinCheck.account.balance(params)
