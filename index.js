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
    success: (data, response, params) => {

      const data_json = JSON.parse(data)

      const url = `https://coincheck.com/api/rate/all`
      axios.get(url)
      .then(response => {

        const rates = response.data.jpy

        let total = 0

        // TODO: use reduce
        for (let currency in data_json) {
          const amount = Number(data_json[currency])
          const rate = rates[currency]
          if(rate) total += amount*rate
        }

        register_balance(total)

      })
      .catch(error => {
        console.log(error)
      })


    },
    error: (error, response, params) => {
      console.log(error)
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
    }
  })
})

app.listen(PORT, () => {
  console.log(`Express listening on port ${PORT}`)
})