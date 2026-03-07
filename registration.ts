import axios from "axios";

const { FINANCES_API_ACCOUNT_ID, FINANCES_API_TOKEN, FINANCES_API_URL } =
  process.env;

export const register_balance = (balance: number) => {
  const url = `${FINANCES_API_URL}/accounts/${FINANCES_API_ACCOUNT_ID}/balance`;

  const currency = "JPY";

  const payload = { balance, currency };

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (FINANCES_API_TOKEN)
    headers.Authorization = `Bearer ${FINANCES_API_TOKEN}`;

  return axios.post(url, payload, { headers });
};
