import { Alchemy, Network } from "alchemy-sdk";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.ALCHEMY_RPC_URL
  ? process.env.ALCHEMY_RPC_URL.split("/").pop()
  : undefined;

if (!apiKey) {
  console.error(
    "Error: ALCHEMY_API_KEY is not defined in the environment variables.",
  );
  process.exit(1);
}

const config = {
  apiKey: apiKey,
  network: Network.BASE_MAINNET,
};
const alchemy = new Alchemy(config);

// Ambil semua saldo token (USDC, DEGEN, dll) milik user
const balances = await alchemy.core.getTokenBalances(
  "0xffa8DB7B38579e6A2D14f9B347a9acE4d044cD54",
);

console.log(balances);
