const https = require('https');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const API_KEY = process.env.VITE_N2YO_API_KEY || 'WSBCFK-KJXZF4-LEDFSB-5IR1';
const BASE_URL = 'api.n2yo.com';

console.log('🛰️  N2YO API Key Test');
console.log('='.repeat(30));
console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);

// Test function using Node.js built-in https
function testN2YOEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    const fullPath = `/rest/v1/satellite${path}&apiKey=${API_KEY}`;
    
    console.log(`\n🚀 Testing: ${description}`);
    console.log(`📡 URL: https://${BASE_URL}${fullPath.replace(API_KEY, API_KEY.substring(0, 8) + '...')}`);
    
    const options = {
      hostname: BASE_URL,
      path: fullPath,
      method: 'GET',
      headers: {
        'User-Agent': 'Nebula-AI-Test/1.0'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const jsonData = JSON.parse(data);
            console.log(`✅ Success! Status: ${res.statusCode}`);
            
            if (jsonData.info) {
              if (jsonData.info.transactionscount !== undefined) {
                console.log(`   Transactions used: ${jsonData.info.transactionscount}`);
              }
              if (jsonData.info.satname) {
                console.log(`   Satellite: ${jsonData.info.satname}`);
              }
              if (jsonData.info.satcount !== undefined) {
                console.log(`   Satellites found: ${jsonData.info.satcount}`);
              }
            }
            
            resolve({ success: true, data: jsonData });
          } else {
            console.log(`❌ HTTP Error: ${res.statusCode}`);
            console.log(`   Response: ${data}`);
            resolve({ success: false, error: `HTTP ${res.statusCode}` });
          }
        } catch (error) {
          console.log(`❌ Parse Error: ${error.message}`);
          console.log(`   Raw response: ${data}`);
          resolve({ success: false, error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Request Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

// Run tests
async function runTests() {
  const results = [];
  
  // Test 1: ISS TLE
  const test1 = await testN2YOEndpoint('/tle/25544?', 'ISS TLE Data');
  results.push(test1);
  
  // Test 2: ISS Position
  const test2 = await testN2YOEndpoint('/positions/25544/41.702/-76.014/0/1?', 'ISS Current Position');
  results.push(test2);
  
  if (test2.success && test2.data.positions && test2.data.positions[0]) {
    const pos = test2.data.positions[0];
    console.log(`   Position: Lat ${pos.satlatitude.toFixed(4)}, Lng ${pos.satlongitude.toFixed(4)}`);
    console.log(`   Altitude: ${pos.sataltitude.toFixed(2)}km, Elevation: ${pos.elevation.toFixed(2)}°`);
  }
  
  // Test 3: Satellites Above
  const test3 = await testN2YOEndpoint('/above/41.702/-76.014/0/70/0?', 'Satellites Above Location');
  results.push(test3);
  
  if (test3.success && test3.data.above) {
    console.log(`   Found ${test3.data.above.length} satellites overhead`);
    if (test3.data.above.length > 0) {
      console.log(`   Sample: ${test3.data.above[0].satname}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(30));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(30));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.length - passed;
  
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (passed === results.length) {
    console.log('\n🎉 All tests passed! Your N2YO API key is working correctly.');
    console.log('🚀 The satellite tracking should work now.');
  } else if (passed > 0) {
    console.log('\n⚠️  Some tests failed. Your API key works but there might be rate limits.');
  } else {
    console.log('\n🚨 All tests failed. Please check:');
    console.log('   - API key is correct');
    console.log('   - Internet connection');
    console.log('   - N2YO service availability');
  }
  
  console.log('\n🌟 Check your usage at: https://www.n2yo.com');
}

// Run the tests
runTests().catch(console.error); 