const dotenv = require('dotenv')
const CoinCheck = require('coincheck')
const axios = require('axios')
const registration = require('./registration')
const schedule = require ('node-schedule');

dotenv.config()

const {
  COINBASE_ACCESS_KEY,
  COINBASE_SECRET_KEY
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

        registration.register_balance(total)

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
