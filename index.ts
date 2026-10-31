import dotenv from "dotenv";
dotenv.config();

// @ts-ignore
import CoinCheck from "coincheck";
import axios from "axios";
import { register_balance } from "./registration";
import { version } from "./package.json";
import { logger } from "./logger";

process.env.TZ = "Asia/Tokyo";

logger.info(`Coincheck scraper v${version}`);

const { COINBASE_ACCESS_KEY, COINBASE_SECRET_KEY } = process.env;

const coinCheck = new CoinCheck.CoinCheck(
  COINBASE_ACCESS_KEY,
  COINBASE_SECRET_KEY,
);

const convertToJpy = async (currency_balances: any) => {
  const {
    data: { jpy: jpy_rates },
  } = await axios.get(`https://coincheck.com/api/rate/all`);

  return Object.keys(currency_balances).reduce((prev, key) => {
    const balance = currency_balances[key];
    const rate = jpy_rates[key];
    if (rate) return prev + balance * rate;
    else return prev;
  }, 0);
};

const failureHandler = (error: unknown) => {
  logger.error({ err: error }, "Scrape and register failed");
  process.exit(1);
};

const successHandler = async (data: any, response: any, params: any) => {
  try {
    const { success, ...currency_balances } = JSON.parse(data);
    // Otherwise no currency matches a rate and a balance of 0 gets registered
    if (!success) throw new Error(`Unsuccessful balance response: ${data}`);
    const totalJpy = await convertToJpy(currency_balances);
    logger.info({ balance: totalJpy }, "Balance scraped");
    await register_balance(totalJpy);
    logger.info("Balance registered");
  } catch (error) {
    failureHandler(error);
  }
};

const errorHandler = (error: any, response: any, params: any) => {
  failureHandler(error);
};

const params = {
  options: {
    success: successHandler,
    error: errorHandler,
  },
};

coinCheck.account.balance(params);
