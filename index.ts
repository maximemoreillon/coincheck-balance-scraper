import dotenv from "dotenv"
// @ts-ignore
import CoinCheck from "coincheck"
import axios from "axios"
import { register_balance } from "./registration"
import { logger } from "./logger"
import { version } from "./package.json"

dotenv.config()

process.env.TZ = "Asia/Tokyo"

console.log(`Coincheck scraper v${version}`)

const { COINBASE_ACCESS_KEY, COINBASE_SECRET_KEY } = process.env

const coinCheck = new CoinCheck.CoinCheck(
  COINBASE_ACCESS_KEY,
  COINBASE_SECRET_KEY
)

const convertToJpy = async (currency_balances: any) => {
  const {
    data: { jpy: jpy_rates },
  } = await axios.get(`https://coincheck.com/api/rate/all`)

  return Object.keys(currency_balances).reduce((prev, key) => {
    const balance = currency_balances[key]
    const rate = jpy_rates[key]
    if (rate) return prev + balance * rate
    else return prev
  }, 0)
}

const successHandler = async (data: any, response: any, params: any) => {
  try {
    const { success: _, ...currency_balances } = JSON.parse(data)

    const totalJpy = await convertToJpy(currency_balances)

    await register_balance(totalJpy)

    logger.info({
      message: `Successfully scraped balance`,
    })
  } catch (error) {
    logger.error({
      message: `Scraping failed`,
    })
    throw error
  }
}

const errorHandler = (error: any, response: any, params: any) => {
  logger.error({
    message: `Scraping failed`,
  })
  throw error
}

const params = {
  options: {
    success: successHandler,
    error: errorHandler,
  },
}

coinCheck.account.balance(params)
