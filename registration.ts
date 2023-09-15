import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const { FINANCES_API_ACCOUNT_NAME, FINANCES_API_TOKEN, FINANCES_API_URL } =
  process.env

export const register_balance = (balance: number) => {
  const url = `${FINANCES_API_URL}/accounts/${FINANCES_API_ACCOUNT_NAME}/balance`

  const currency = "JPY"

  const payload = { balance, currency }

  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FINANCES_API_TOKEN}`,
    },
    timeout: 3000,
  }

  return axios.post(url, payload, options)
}
