import { priceOracle } from "./priceOracle";

type TestCase = {
  name: string;
  symbol: string;
  timestamp: number;
};

const NOW = Math.floor(Date.now() / 1000);
const LAST_YEAR = NOW - 60 * 60 * 24 * 365;

const tests: TestCase[] = [
  {
    name: "CoinGecko historical (ETH)",
    symbol: "ETH",
    timestamp: LAST_YEAR,
  },
  {
    name: "CryptoCompare fallback (ARB)",
    symbol: "ARB",
    timestamp: LAST_YEAR,
  },
  {
    name: "Heuristic normalization (WETH - ETH)",
    symbol: "WETH",
    timestamp: LAST_YEAR,
  },
  {
    name: "Heuristic normalization (USDC.e - USDC)",
    symbol: "USDC.e",
    timestamp: LAST_YEAR,
  },
  {
    name: "Stablecoin price sanity (USDT)",
    symbol: "USDT",
    timestamp: LAST_YEAR,
  },
  {
    name: "Unknown token - legacy fallback",
    symbol: "UNKNOWN_TOKEN_123",
    timestamp: LAST_YEAR,
  },
  {
    name: "Cache hit (ETH same day)",
    symbol: "ETH",
    timestamp: LAST_YEAR,
  },
  {
    name: "Recent timestamp (SOL)",
    symbol: "SOL",
    timestamp: NOW - 3600,
  },
];

async function runTests() {
  console.log("====================================");
  console.log(" PRICE ORACLE INTEGRATION TEST SUITE ");
  console.log("====================================\n");

  let passed = 0;

  for (const test of tests) {
    try {
      const price = await priceOracle.getPrice(
        test.symbol,
        test.timestamp
      );

      if (typeof price !== "number" || price <= 0) {
        throw new Error("Invalid price returned");
      }

      console.log(`PASSED: ${test.name}`);
      console.log(`   Symbol     : ${test.symbol}`);
      console.log(`   Timestamp  : ${test.timestamp}`);
      console.log(`   Price (IDR): ${price.toLocaleString("id-ID")}`);
      console.log("");

      passed++;
    } catch (err: any) {
      console.error(`FAILED: ${test.name}`);
      console.error(`   ERROR: ${err.message}\n`);
    }
  }

  console.log("====================================");
  console.log(` RESULT: ${passed}/${tests.length} tests passed`);
  console.log("====================================\n");

  if (passed !== tests.length) {
    process.exit(1);
  }
}

runTests();