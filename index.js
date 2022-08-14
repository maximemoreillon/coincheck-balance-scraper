const dotenv = require('dotenv')
const CoinCheck = require('coincheck')
const axios = require('axios')
const {
  register_balance,
  finance_api_url,
  finance_api_account,
} = require('./registration.js')
const schedule = require ('node-schedule');
const express = require('express')
const cors = require('cors')
const { version } = require('./package.json')

dotenv.config()

process.env.TZ = 'Asia/Tokyo'

const {
  COINBASE_ACCESS_KEY,
  COINBASE_SECRET_KEY,
  PORT = 80

} = process.env


const coinCheck = new CoinCheck.CoinCheck(COINBASE_ACCESS_KEY, COINBASE_SECRET_KEY)

const params = {
  options: {
    success: async (data, response, params) => {

      try {
        const { success: _, ...currency_balances } = JSON.parse(data)

        const { data: { jpy: jpy_rates } } = await axios.get(`https://coincheck.com/api/rate/all`)

        const total = Object.keys(currency_balances).reduce((prev, key) => {
          const balance = currency_balances[key]
          const rate = jpy_rates[key]
          if (rate) return prev + balance * rate
          else return prev

        }, 0)

        await register_balance(total)

        console.log(`Registration successful: JPY ${total}`)

        success = true
      } catch (error) {
        success = false
      }

      



    },
    error: (error, response, params) => {
      console.error(error)
      success = false

    }
  }
}

schedule.scheduleJob('0 */12 * * *', () => {
  coinCheck.account.balance(params)
})

coinCheck.account.balance(params)



const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send({
    application_name: 'Coincheck scraper',
    version,
    finances_api: {
      url: finance_api_url,
      account: finance_api_account,
    },
    success,

  })
})

app.listen(PORT, () => {
  console.log(`Express listening on port ${PORT}`)
})