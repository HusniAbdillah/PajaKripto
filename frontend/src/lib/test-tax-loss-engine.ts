import "dotenv/config";
import fs from "fs";
import path from "path";

import { syncWalletTransactions } from "./alchemyService";
import { processAlchemyBatchForPosition } from "./alchemyToPositionProcessor";
import { positionEngine } from "./positionEngine";
import { detectTaxLoss } from "./taxLossEngine";
import { Address, Chain } from "../types";

const TEST_WALLET: Address =
  "0xffa8DB7B38579e6A2D14f9B347a9acE4d044cD54";

const CHAIN: Chain = "BASE";
const TX_LIMIT = 25;

const OUTPUT_FILE = path.resolve(
  process.cwd(),
  "e2e-output.log"
);

function writeLog(title: string, data?: any) {
  const content =
    `\n\n==============================\n` +
    `${title}\n` +
    `==============================\n` +
    (data !== undefined
      ? JSON.stringify(data, null, 2)
      : "");

  fs.appendFileSync(OUTPUT_FILE, content, {
    encoding: "utf-8",
  });
}

async function runTest() {
  fs.writeFileSync(
    OUTPUT_FILE,
    "E2E TEST OUTPUT\n",
    "utf-8"
  );

  writeLog("CONFIG", {
    wallet: TEST_WALLET,
    chain: CHAIN,
    limit: TX_LIMIT,
  });

  const rawResponse = await syncWalletTransactions(
    TEST_WALLET,
    TX_LIMIT
  );

  writeLog("1 RAW ALCHEMY RESPONSE", rawResponse);

  if (!rawResponse.success || !rawResponse.data?.length) {
    writeLog("STOP", "No transaction data");
    return;
  }

  const processedTxs = processAlchemyBatchForPosition(
    rawResponse.data,
    TEST_WALLET,
    CHAIN
  );

  writeLog("2 PROCESSED TRANSACTIONS (FULL)", processedTxs);

  if (!processedTxs.length) {
    writeLog("STOP", "No processed transactions");
    return;
  }

  const positionsMap = positionEngine.buildPositions(processedTxs);

  const positionsArray = Array.from(
    positionsMap.entries()
  );

  writeLog("3 POSITIONS MAP (RAW ENTRIES)", positionsArray);

  if (positionsMap.size === 0) {
    writeLog("STOP", "No positions created");
    return;
  }

  const nowTs = Math.floor(Date.now() / 1000);

  const taxLossResults = await detectTaxLoss(
    positionsMap.values(),
    nowTs
  );

  writeLog("4 TAX LOSS RESULTS (FULL)", taxLossResults);

  writeLog("TEST FINISHED SUCCESSFULLY");
}

runTest()
  .then(() => {
    console.log("E2E test finished");
    console.log(`Output file: ${OUTPUT_FILE}`);
  })
  .catch((err) => {
    writeLog("TEST CRASHED", {
      message: err?.message,
      stack: err?.stack,
    });
    console.error("TEST CRASHED");
    console.error(err);
  });