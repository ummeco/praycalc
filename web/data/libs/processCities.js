const fs = require('fs');
const cliProgress = require('cli-progress');

const processCities = async (source) => {
  console.log('Processing cities file...');

  const cache = [];
  const fileData = await fs.promises.readFile(source, 'utf-8');
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

  for (const line of lines) {
    progressBar.increment();

    const [geonameid, name, asciiname, alternatenames, latitude, longitude, featureClass, featureCode, countryCode, cc2, admin1Code, admin2Code, admin3Code, admin4Code, population, elevation, dem, timezone, modificationDate] = line.split('\t');

    // Skip non-city entries
    if (featureClass !== 'P' || featureCode === 'PPLX') {
      continue;
    }

    // Format city name based on country code and admin codes
    const cityName = countryCode === 'US'
      ? `${name}, ${admin1Code}, ${countryCode}`
      : `${name}, ${countryCode}`;

    // Create city object with custom properties
    const cityData = {
      i: null,
      n: cityName,
      p: parseInt(population) || 0,
      e: parseFloat(elevation) || parseFloat(dem) || 0,
      y: parseFloat(latitude),
      x: parseFloat(longitude),
      t: timezone,
    };

    cache.push(cityData);
  }

  // Stop the progress bar
  progressBar.stop();

  // Sort the cache by the "n" field first
  cache.sort((a, b) => {
    if (a.n < b.n) return -1;
    if (a.n > b.n) return 1;
    return 0;
  });

  return cache;
};

module.exports = processCities;
