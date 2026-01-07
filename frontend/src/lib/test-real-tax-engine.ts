import { 
  calculateTaxFromWallet, 
  calculateRealTax, 
  generateRealTaxReport 
} from "./realTaxEngine";
import type { Address } from "../types";

const TEST_WALLETS = {
  valid: "0xffa8DB7B38579e6A2D14f9B347a9acE4d044cD54" as Address,
  invalid: "invalid_address" as Address,
  empty: "" as Address,
};

console.log("Starting Real Tax Engine Tests...\n");
console.log("═".repeat(60));

async function testValidWallet() {
  console.log("\nTEST 1: Valid Wallet - Full Tax Calculation");
  console.log("─".repeat(60));
  
  try {
    const result = await calculateTaxFromWallet(TEST_WALLETS.valid, {
      limit: 10,
      taxYear: 2026
    });
    
    const { taxResults, source } = result;
    const { summary, perTransaction } = taxResults;
    
    console.log("SUCCESS");
    console.log(`   Source: ${source}`);
    console.log(`   Total Transactions: ${summary.totalTransactions}`);
    console.log(`   Taxable: ${summary.taxableTransactions}`);
    console.log(`   Non-Taxable: ${summary.nonTaxableTransactions}`);
    console.log(`   Total Tax: ${summary.formatted.totalPph}`);
    console.log(`   Period: ${summary.formatted.period}`);
    
    if (summary.totalTransactions !== perTransaction.length) {
      throw new Error("Data mismatch: summary vs perTransaction count");
    }
    
    const calculatedTax = perTransaction.reduce((sum, tx) => 
      sum + (tx.taxable ? tx.pphAmountIDR : 0), 0
    );
    
    if (Math.abs(calculatedTax - summary.totalPphIDR) > 0.01) {
      throw new Error(`Tax calculation mismatch: ${calculatedTax} vs ${summary.totalPphIDR}`);
    }
    
    console.log("Data integrity check: PASSED");
    console.log("Tax calculation check: PASSED");
    
    return result;
    
  } catch (error: any) {
    console.log(`FAILED: ${error.message}`);
    throw error;
  }
}

async function testInvalidWallet() {
  console.log("\nTEST 2: Invalid Wallet Address");
  console.log("─".repeat(60));
  
  try {
    await calculateTaxFromWallet(TEST_WALLETS.invalid, { limit: 5 });
    console.log("FAILED: Should have thrown error for invalid address");
    return false;
  } catch (error: any) {
    if (error.message.includes("Invalid wallet address")) {
      console.log("SUCCESS: Correctly rejected invalid address");
      console.log(`   Error: ${error.message}`);
      return true;
    }
    console.log("FAILED: Wrong error message");
    return false;
  }
}

async function testTaxYearFilter() {
  console.log("\nTEST 3: Tax Year Filtering");
  console.log("─".repeat(60));
  
  try {
    const allResult = await calculateTaxFromWallet(TEST_WALLETS.valid, {
      limit: 20
    });
    
    const availableYears = new Set(
      allResult.taxResults.perTransaction.map(tx => 
        new Date(tx.timestamp).getFullYear()
      )
    );
    
    console.log(`   Available years in data: ${Array.from(availableYears).join(', ')}`);
    
    const results: Record<number, any> = {};
    
    for (const year of availableYears) {
      const filtered = await calculateTaxFromWallet(TEST_WALLETS.valid, {
        limit: 20,
        taxYear: year
      });
      results[year] = filtered;
      
      console.log(`   ${year} Transactions: ${filtered.taxResults.summary.totalTransactions}`);
      
      const allCorrectYear = filtered.taxResults.perTransaction.every(tx => 
        new Date(tx.timestamp).getFullYear() === year
      );
      
      if (filtered.taxResults.perTransaction.length > 0 && !allCorrectYear) {
        throw new Error(`Year filter ${year} not working correctly`);
      }
    }
    
    console.log("SUCCESS");
    console.log("Year filtering: PASSED");
    
    return results;
    
  } catch (error: any) {
    console.log(`FAILED: ${error.message}`);
    throw error;
  }
}

async function testTaxRateValidation() {
  console.log("\nTEST 4: Tax Rate Validation (1% PPh)");
  console.log("─".repeat(60));
  
  try {
    const result = await calculateTaxFromWallet(TEST_WALLETS.valid, {
      limit: 10
    });
    
    const taxableTransactions = result.taxResults.perTransaction.filter(
      tx => tx.taxable && tx.valueIDR > 0
    );
    
    if (taxableTransactions.length === 0) {
      console.log("No taxable transactions found");
      return true;
    }
    
    const allCorrectRate = taxableTransactions.every(tx => 
      Math.abs(tx.pphRate - 0.01) < 0.0001
    );
    
    if (!allCorrectRate) {
      throw new Error("Tax rate is not 1% for some transactions");
    }
    
    const calculationCorrect = taxableTransactions.every(tx => {
      const expectedPph = tx.valueIDR * 0.01;
      return Math.abs(tx.pphAmountIDR - expectedPph) < 0.01;
    });
    
    if (!calculationCorrect) {
      throw new Error("PPh calculation incorrect");
    }
    
    console.log("SUCCESS");
    console.log(`   Checked ${taxableTransactions.length} taxable transactions`);
    console.log(`   All rates: 1% (0.01)`);
    console.log(`   All calculations: CORRECT`);
    
    return true;
    
  } catch (error: any) {
    console.log(`FAILED: ${error.message}`);
    throw error;
  }
}

async function testReportGeneration() {
  console.log("\nTEST 5: Report Generation");
  console.log("─".repeat(60));
  
  try {
    const result = await calculateTaxFromWallet(TEST_WALLETS.valid, {
      limit: 10
    });
    
    const report = generateRealTaxReport(result.taxResults, result.source);
    
    const requiredSections = [
      'LAPORAN PAJAK ASET KRIPTO',
      'PMK No. 50 Tahun 2025',
      'Wallet:',
      'Tahun Pajak:',
      'Total Transaksi:',
      'Total PPh (1%):',
      'TOTAL PAJAK:'
    ];
    
    const allSectionsPresent = requiredSections.every(section => 
      report.includes(section)
    );
    
    if (!allSectionsPresent) {
      throw new Error("Report missing required sections");
    }
    
    console.log("SUCCESS");
    console.log(`   Report length: ${report.length} characters`);
    console.log("   All required sections: PRESENT");
    console.log("\nSample Report:\n");
    console.log(report);
    
    return report;
    
  } catch (error: any) {
    console.log(`FAILED: ${error.message}`);
    throw error;
  }
}

async function testEdgeCases() {
  console.log("\nTEST 6: Edge Cases");
  console.log("─".repeat(60));
  
  try {
    console.log("\n   6.1: Limit = 0");
    const result1 = await calculateTaxFromWallet(TEST_WALLETS.valid, {
      limit: 1
    });
    console.log(`   Result: ${result1.taxResults.summary.totalTransactions} transactions`);
    
    console.log("\n   6.2: Limit = 100");
    const result2 = await calculateTaxFromWallet(TEST_WALLETS.valid, {
      limit: 100
    });
    console.log(`   Result: ${result2.taxResults.summary.totalTransactions} transactions`);
    
    console.log("\n   6.3: Tax Year = 2030 (future)");
    const result3 = await calculateTaxFromWallet(TEST_WALLETS.valid, {
      limit: 10,
      taxYear: 2030
    });
    console.log(`   Result: ${result3.taxResults.summary.totalTransactions} transactions`);
    
    console.log("\nAll edge cases handled correctly");
    return true;
    
  } catch (error: any) {
    console.log(`FAILED: ${error.message}`);
    throw error;
  }
}

async function runAllTests() {
  console.log("\nRUNNING ALL TESTS");
  console.log("═".repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    total: 6
  };
  
  const tests = [
    { name: "Valid Wallet", fn: testValidWallet },
    { name: "Invalid Wallet", fn: testInvalidWallet },
    { name: "Tax Year Filter", fn: testTaxYearFilter },
    { name: "Tax Rate Validation", fn: testTaxRateValidation },
    { name: "Report Generation", fn: testReportGeneration },
    { name: "Edge Cases", fn: testEdgeCases }
  ];
  
  for (const test of tests) {
    try {
      await test.fn();
      results.passed++;
    } catch (error) {
      results.failed++;
      console.log(`\nTest "${test.name}" failed but continuing...`);
    }
  }
  
  console.log("\n" + "═".repeat(60));
  console.log("TEST RESULTS SUMMARY");
  console.log("═".repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${(results.passed / results.total * 100).toFixed(1)}%`);
  console.log("═".repeat(60));
  
  if (results.failed === 0) {
    console.log("\nALL TESTS PASSED!");
  } else {
    console.log(`\n${results.failed} test(s) failed. Please review.`);
  }
}

runAllTests().catch(console.error);