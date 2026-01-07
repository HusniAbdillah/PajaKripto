import { calculateTaxFromFile, generateTaxReport, checkSPTObligation } from './taxEngine';

console.log('Testing Tax Engine with Mock Data...\n');

try {
  const taxResults = calculateTaxFromFile();
  console.log('Data berhasil dimuat!');
  console.log(`Total transaksi: ${taxResults.summary.totalTransactions}\n`);
  
  const report = generateTaxReport(taxResults);
  console.log(report);

  console.log('\n' + '═'.repeat(50));
  console.log('ANALISIS KEWAJIBAN SPT:');
  console.log('═'.repeat(50));

  const sptCheck = checkSPTObligation(taxResults.summary, 30000000);
  console.log(`Wajib Lapor SPT: ${sptCheck.mustReport ? 'YA' : 'TIDAK'}`);
  console.log(`Total Penghasilan: Rp ${sptCheck.totalIncomeIDR.toLocaleString('id-ID')}`);
  console.log(`PTKP Threshold: Rp ${sptCheck.ptkpThresholdIDR.toLocaleString('id-ID')}`);
  console.log(`Alasan: ${sptCheck.reason}`);
  
  console.log('\nTesting selesai!');
} catch (error: any) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}