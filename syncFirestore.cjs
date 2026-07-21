const fs = require('fs');
const http = require('http');

async function sync() {
  console.log("Loading universities data...");
  const { universities } = require('./temp_dist/universities.cjs');
  
  console.log(`Loaded ${universities.length} universities. Pushing to API...`);
  
  const postData = JSON.stringify({ colleges: universities });
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/seed',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Response Status: ${res.statusCode}`);
      console.log(`Response Body: ${data}`);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

sync();
