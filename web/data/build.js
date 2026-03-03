// data/build.js [entry point]
const fs = require('fs'),
 path = require('path'),
 dateFns = require('date-fns'),
 geolib = require('geolib'),
 backupExisting = require('./libs/backupExisting'),
 processCities = require('./libs/processCities'),
 processAirports = require('./libs/processAirports'),
 processZipcodes = require('./libs/processZipcodes'),
 createGeoFiles = require('./libs/createGeoFiles'),
 processIpAddress = require('./libs/processIpAddress'),
 createIpFiles = require('./libs/createIpFiles'),
 citiesSource = 'data/sources/cities500.txt',
 airportsSource = 'data/sources/airports_Worldwide.csv',
 zipcodesSource = 'data/sources/US.txt',
 ipAddressSource = 'data/sources/IP2LOCATION-LITE-DB11.CSV';

(async () => {
	console.log(`\n${dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\nBeginning data build.\n`);
    await backupExisting();
    const cityData = await processCities(citiesSource);
	const airportData = await processAirports(airportsSource, cityData);
	const zipcodeData = await processZipcodes(zipcodesSource, cityData);
	await createGeoFiles(cityData, airportData, zipcodeData);

	// IP geolocation data is optional — the source CSV is large (~500 MB) and not
	// committed to the repo. Skip silently if the file is not present.
	if (fs.existsSync(ipAddressSource)) {
		const ipData = await processIpAddress(ipAddressSource, cityData);
		await createIpFiles(ipData);
	} else {
		console.warn(`\nWARNING: IP CSV not found — skipping IP geolocation data generation.\n  Expected: ${ipAddressSource}\n  Download from https://lite.ip2location.com (DB11 CSV) and place it there.\n`);
	}

	console.log('\nData build complete.\n');
})();
