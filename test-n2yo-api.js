#!/usr/bin/env node

/**
 * N2YO API Test Script
 * Tests the N2YO API key functionality with various endpoints
 * Run with: node test-n2yo-api.js
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.VITE_N2YO_API_KEY || 'WSBCFK-KJXZF4-LEDFSB-5IR1';
const BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';

// Test configuration
const TEST_CONFIG = {
  // ISS coordinates for testing
  ISS_ID: 25544,
  OBSERVER_LAT: 41.702,
  OBSERVER_LNG: -76.014,
  OBSERVER_ALT: 0,
  
  // Other test satellites
  STARLINK_CATEGORY: 52,
  AMATEUR_RADIO_CATEGORY: 18
};

/**
 * Make a request to N2YO API
 */
async function makeN2YORequest(endpoint, description) {
  console.log(`\n🚀 Testing: ${description}`);
  console.log(`📡 Endpoint: ${BASE_URL}${endpoint}&apiKey=${API_KEY.substring(0, 8)}...`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}&apiKey=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Show transaction count and basic info
    if (data.info) {
      console.log(`✅ Success! Transactions used: ${data.info.transactionscount || 'N/A'}`);
      if (data.info.satname) {
        console.log(`   Satellite: ${data.info.satname}`);
      }
      if (data.info.satcount !== undefined) {
        console.log(`   Satellites found: ${data.info.satcount}`);
      }
      if (data.info.passescount !== undefined) {
        console.log(`   Passes found: ${data.info.passescount}`);
      }
    }
    
    return { success: true, data };
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🛰️  N2YO API Key Test Suite');
  console.log('=' .repeat(50));
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
  console.log(`🌍 Base URL: ${BASE_URL}`);
  
  const results = [];
  
  // Test 1: Get ISS TLE data
  const test1 = await makeN2YORequest(
    `/tle/${TEST_CONFIG.ISS_ID}`,
    'ISS TLE Data'
  );
  results.push({ name: 'ISS TLE', ...test1 });
  
  if (test1.success && test1.data.tle) {
    console.log(`   TLE Preview: ${test1.data.tle.substring(0, 50)}...`);
  }
  
  // Test 2: Get ISS current position
  const test2 = await makeN2YORequest(
    `/positions/${TEST_CONFIG.ISS_ID}/${TEST_CONFIG.OBSERVER_LAT}/${TEST_CONFIG.OBSERVER_LNG}/${TEST_CONFIG.OBSERVER_ALT}/1`,
    'ISS Current Position'
  );
  results.push({ name: 'ISS Position', ...test2 });
  
  if (test2.success && test2.data.positions && test2.data.positions[0]) {
    const pos = test2.data.positions[0];
    console.log(`   Position: Lat ${pos.satlatitude.toFixed(4)}, Lng ${pos.satlongitude.toFixed(4)}, Alt ${pos.sataltitude.toFixed(2)}km`);
    console.log(`   Elevation: ${pos.elevation.toFixed(2)}°, Azimuth: ${pos.azimuth.toFixed(2)}°`);
  }
  
  // Test 3: Get ISS visual passes
  const test3 = await makeN2YORequest(
    `/visualpasses/${TEST_CONFIG.ISS_ID}/${TEST_CONFIG.OBSERVER_LAT}/${TEST_CONFIG.OBSERVER_LNG}/${TEST_CONFIG.OBSERVER_ALT}/2/300`,
    'ISS Visual Passes (2 days)'
  );
  results.push({ name: 'ISS Visual Passes', ...test3 });
  
  if (test3.success && test3.data.passes && test3.data.passes.length > 0) {
    const nextPass = test3.data.passes[0];
    const startTime = new Date(nextPass.startUTC * 1000).toLocaleString();
    console.log(`   Next pass: ${startTime}, Max elevation: ${nextPass.maxEl.toFixed(1)}°`);
  }
  
  // Test 4: Get satellites above location
  const test4 = await makeN2YORequest(
    `/above/${TEST_CONFIG.OBSERVER_LAT}/${TEST_CONFIG.OBSERVER_LNG}/${TEST_CONFIG.OBSERVER_ALT}/70/0`,
    'Satellites Above (All categories)'
  );
  results.push({ name: 'Satellites Above', ...test4 });
  
  if (test4.success && test4.data.above) {
    console.log(`   Found ${test4.data.above.length} satellites overhead`);
    if (test4.data.above.length > 0) {
      console.log(`   Sample: ${test4.data.above[0].satname} at ${test4.data.above[0].satalt.toFixed(0)}km`);
    }
  }
  
  // Test 5: Get Starlink satellites
  const test5 = await makeN2YORequest(
    `/above/${TEST_CONFIG.OBSERVER_LAT}/${TEST_CONFIG.OBSERVER_LNG}/${TEST_CONFIG.OBSERVER_ALT}/90/${TEST_CONFIG.STARLINK_CATEGORY}`,
    'Starlink Satellites'
  );
  results.push({ name: 'Starlink Satellites', ...test5 });
  
  // Test 6: Get amateur radio satellites
  const test6 = await makeN2YORequest(
    `/above/${TEST_CONFIG.OBSERVER_LAT}/${TEST_CONFIG.OBSERVER_LNG}/${TEST_CONFIG.OBSERVER_ALT}/90/${TEST_CONFIG.AMATEUR_RADIO_CATEGORY}`,
    'Amateur Radio Satellites'
  );
  results.push({ name: 'Amateur Radio Sats', ...test6 });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n🔍 FAILED TESTS:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   • ${r.name}: ${r.error}`);
    });
  }
  
  // Rate limit info
  const successfulTests = results.filter(r => r.success && r.data.info);
  if (successfulTests.length > 0) {
    console.log('\n📈 USAGE STATISTICS:');
    successfulTests.forEach(test => {
      if (test.data.info.transactionscount !== undefined) {
        console.log(`   • ${test.name}: ${test.data.info.transactionscount} transactions used in last 60min`);
      }
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (passed === results.length) {
    console.log('   🎉 All tests passed! Your API key is working perfectly.');
    console.log('   🚀 You can now use the satellite tracking features.');
  } else if (passed > 0) {
    console.log('   ⚠️  Some tests failed. Check your API key and internet connection.');
    console.log('   🔄 Try running the test again in a few minutes.');
  } else {
    console.log('   🚨 All tests failed. Please check:');
    console.log('      - API key is correct in .env file');
    console.log('      - Internet connection is working');
    console.log('      - N2YO API service is available');
  }
  
  console.log('\n🌟 Visit https://www.n2yo.com for more information about your API usage.');
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, makeN2YORequest }; 