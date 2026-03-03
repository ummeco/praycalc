// data/libs/createGeoFiles.js
const fs = require('fs');
const path = require('path');

function checkData(cityData, airportData, zipcodeData) {
  if (!cityData.length) {
    console.error('No city data found.');
    process.exit(1);
  }
  if (!airportData.length) {
    console.error('No airport data found.');
    process.exit(1);
  }
  if (!zipcodeData.length) {
    console.error('No zipcode data found.');
    process.exit(1);
  }
}

function createAutoFile(cityData, airportData, zipcodeData) {
  const autoData = [];

  cityData.forEach((city) => {
    const cityName = city.n === 'New York City, NY, US' ? 'New York, NY, US' : city.n;
    autoData.push({
      n: cityName,
      p: city.p
    });
  });

  airportData.forEach((airport) => {
    autoData.push({
      i: airport.i,
      n: airport.n
    });
  });

  zipcodeData.forEach((zipcode) => {
    autoData.push({
      i: zipcode.i,
      n: zipcode.n
    });
  });

  const autoJson = '[' + autoData.map((d) => JSON.stringify(d)).join(',\n') + ']';
  fs.writeFileSync(path.join('data', 'auto.json'), autoJson);
  console.log('Created auto.json');
}

function createGeoFile(cityData, airportData, zipcodeData) {
  const geoData = [];

  cityData.forEach((city) => {
    const cityName = city.n === 'New York City, NY, US' ? 'New York, NY, US' : city.n;
    geoData.push({
      n: cityName,
      p: city.p,
      e: city.e || 0,
      y: city.y,
      x: city.x,
      t: city.t
    });
  });

  airportData.forEach((airport) => {
    geoData.push({
      i: airport.i,
      n: airport.n,
      e: airport.e || 0,
      y: airport.y,
      x: airport.x,
      t: airport.t,
    });
  });

  zipcodeData.forEach((zipcode) => {
    geoData.push({
      i: zipcode.i,
      n: zipcode.n,
      e: zipcode.e || 0,
      y: zipcode.y,
      x: zipcode.x,
      t: zipcode.t,
    });
  });

  const geoJson = '[' + geoData.map((d) => JSON.stringify(d)).join(',\n') + ']';
  fs.writeFileSync(path.join('data', 'geo.json'), geoJson);
  console.log('Created geo.json');
}

async function createGeoFiles(cityData, airportData, zipcodeData) {
  checkData(cityData, airportData, zipcodeData);
  createAutoFile(cityData, airportData, zipcodeData);
  createGeoFile(cityData, airportData, zipcodeData);
}
  
module.exports = createGeoFiles;
