// data/libs/createIpFiles.js
const fs = require('fs');
const path = require('path');

function createIpFile(ipData, index) {
  const fileName = `ip${String(index + 1).padStart(2, '0')}.json`;
  const fileData = '[' + ipData.map((d) => JSON.stringify(d)).join(',\n') + ']';

  // Write the JSON string to a file
  fs.writeFileSync(path.join('data', fileName), fileData, { encoding: 'utf8' });
  console.log(`Created ${fileName}`);
}

function convertIntToIP(integer) {
  return [
    (integer >>> 24) & 0xff,
    (integer >>> 16) & 0xff,
    (integer >>> 8) & 0xff,
    integer & 0xff
  ].join('.');
}

async function createIpFiles(ipData) {
  if (!ipData || ipData.length === 0) {
    console.warn('createIpFiles: received empty ipData — no ip*.json files written.');
    return;
  }
  console.log('Creating ip files...');

  // Create an array of 16 empty arrays
  const ipFileData = Array.from({ length: 16 }, () => []);

  // Loop through the ipData array and push the data into the appropriate array
  ipData.forEach((entry) => {
    const ipAddress = convertIntToIP(entry.a);
    const firstOctet = parseInt(ipAddress.split('.')[0]);
    const fileIndex = Math.floor(firstOctet / 16);
    ipFileData[fileIndex].push(entry);
  });

  // Loop through each array of data and create a file for it
  for (let i = 0; i < ipFileData.length; i++) {
    createIpFile(ipFileData[i], i);
  }

  console.log('Finished creating ip files.');
}

module.exports = createIpFiles;
