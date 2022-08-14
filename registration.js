const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()


const {
  FINANCES_API_ACCOUNT_NAME,
  FINANCES_API_TOKEN,
  FINANCES_API_URL,
} = process.env

exports.register_balance = (balance) => {

  const url = `${FINANCES_API_URL}/accounts/${FINANCES_API_ACCOUNT_NAME}/balance`

  const currency = 'JPY'

  const payload = { balance, currency }

  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FINANCES_API_TOKEN}`,
    },
    timeout: 3000,
  }

  return axios.post(url,payload,options)

}


exports.finance_api_url = FINANCES_API_URL
exports.finance_api_account = FINANCES_API_ACCOUNT_NAME