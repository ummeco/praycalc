const fs = require('fs').promises;
const cliProgress = require('cli-progress');
const KDBush = require('kdbush');
const geokdbush = require('geokdbush');
const { calcDistance } = require('./calcDistance.js');

const processAirports = async (source, cityData) => {
  console.log('Processing airports file...');

  const cache = [];
  const fileData = await fs.readFile(source, 'utf-8');
  const lines = fileData.split('\n');

  // Create a new progress bar instance
  const progressBar = new cliProgress.SingleBar(
    {
      format: '→ {bar} {percentage}% | Row {value}/{total} | Dur: {duration_formatted} | ETA: {eta_formatted}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
      clearOnComplete: true,
    },
    cliProgress.Presets.shades_classic,
  );
  progressBar.start(lines.length, 0);

  // Create a spatial index for cityData using KDBush
  const cityIndex = new KDBush(cityData, (p) => p.x, (p) => p.y);

  // Process each line in the file
  for (let i = 0; i < lines.length; i++) {
    progressBar.increment();
    const [id, type, name, latitude_deg, longitude_deg, elevation_ft, continent, iso_country, gps_code, iata_code] = lines[i].split(',');

    // Filter out invalid or non-large_airport entries
    if (type !== 'large_airport' || !iata_code || iata_code.length !== 4) {
      continue;
    }

    // Format airport name based on country
    const airportName = `${name}, ${iso_country}`;

    // Convert elevation from feet to meters
    let elevation_m = parseFloat(elevation_ft) * 0.3048;
    elevation_m = Math.round(elevation_m);

    // Find the closest city to the airport using the spatial index
    const lat = parseFloat(latitude_deg);
    const lon = parseFloat(longitude_deg);
    const closestCity = geokdbush.around(cityIndex, lon, lat, 1)[0];

    // Create airport object with custom properties
    const airportData = {
      i: iata_code.trim(),
      n: airportName,
      p: null,
      e: elevation_m,
      y: parseFloat(latitude_deg),
      x: parseFloat(longitude_deg),
      t: closestCity.t,
    };

    cache.push(airportData);
  }

  // Stop the progress bar
  progressBar.stop();

  // Sort the cache by the "i" field first
  cache.sort((a, b) => {
    if (a.i < b.i) return -1;
    if (a.i > b.i) return 1;
    return 0;
  });

  return cache;
};

module.exports = processAirports;
