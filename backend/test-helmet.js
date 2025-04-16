const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/test-security',
  method: 'GET'
};

console.log('Testing Helmet Security Headers...\n');

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('\nSecurity Headers:\n');
  
  // List of important security headers to check
  const importantHeaders = [
    'content-security-policy',
    'strict-transport-security',
    'x-content-type-options',
    'x-dns-prefetch-control',
    'x-frame-options',
    'x-permitted-cross-domain-policies',
    'x-xss-protection'
  ];

  // Check each important header
  importantHeaders.forEach(header => {
    const value = res.headers[header];
    console.log(`${header}: ${value || 'Not set'}`);
  });

  // Check for any additional security headers
  console.log('\nOther Headers:\n');
  Object.keys(res.headers).forEach(header => {
    if (!importantHeaders.includes(header)) {
      console.log(`${header}: ${res.headers[header]}`);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
