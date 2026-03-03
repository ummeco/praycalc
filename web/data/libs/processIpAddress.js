const fs = require('fs').promises;
const cliProgress = require('cli-progress');
const { getStateAbbr } = require('./getStateAbbr.js');
const KDBush = require('kdbush');
const geokdbush = require('geokdbush');

const processIpAddress = async (source, cityData) => {
  // Guard: if the source file does not exist, return an empty result rather than
  // throwing an unhandled ENOENT error. The caller (build.js) also checks, but
  // this makes processIpAddress safe to call in isolation as well.
  try {
    await fs.access(source);
  } catch {
    console.warn(`processIpAddress: source file not found — ${source}\nSkipping IP geolocation data generation.`);
    return [];
  }

  console.log('\nProcessing ip addresses file...');

  const cache = [];
  const fileData = await fs.readFile(source, 'utf-8');
  const lines = fileData.split('\n');

  // Create a lookup table for cityData based on city names
  const cityLookup = cityData.reduce((lookup, city) => {
    lookup[city.n] = city;
    return lookup;
  }, {});

  // Create a k-d tree index using kdbush
  const index = new KDBush(cityData, (p) => p.x, (p) => p.y);

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

  // Process each line in the file
  for (let i = 0; i < lines.length; i++) {
    progressBar.increment();

    // Parse the fields from the current line
    const [from, to, country, countryLong, stateLong, city, lat, lng] = lines[i].replace(/"+/g, '').split(',');

    // Skip the first row and invalid rows
    if (i === 0 || !from || !to || !country) {
      continue;
    }

    // Format the name based on country and state
    let state = getStateAbbr(stateLong);
    const name = country === 'US' ? `${city}, ${state}, ${country}` : `${city}, ${country}`;

    // Find by city name using lookup table
    const cityInfo = cityLookup[name];
    let elevation = cityInfo ? cityInfo.e : null;
    let timezone = cityInfo ? cityInfo.t : null;

    // Precompute floating-point values for lat and lng
    const latFloat = parseFloat(lat);
    const lngFloat = parseFloat(lng);

    // Find the closest city to the IP address
    if (!cityInfo) {
      const nearestCities = geokdbush.around(index, lngFloat, latFloat, 1);
      const closestCity = nearestCities[0];
      if (closestCity) {
        const { e, t } = closestCity;
        elevation = e;
        timezone = t;
      }
    }

    // Create IP address object with custom properties
    const ipAddressData = {
      a: parseInt(from),
      b: parseInt(to),
      n: name,
      e: elevation,
      y: latFloat,
      x: lngFloat,
      t: timezone,
    };

    cache.push(ipAddressData);
  }

  // Stop the progress bar
  progressBar.stop();

  return cache;
};

module.exports = processIpAddress;
