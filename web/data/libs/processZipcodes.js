// libs/processZipcodes.js
const fs = require('fs').promises;
const cliProgress = require('cli-progress');
const KDBush = require('kdbush');
const geokdbush = require('geokdbush');

const processZipcodes = async (source, cityData) => {
  console.log('Processing zip codes file...');

  const cache = [];
  const fileData = await fs.readFile(source, 'utf-8');
  const lines = fileData.split('\n');

  // Create a spatial index for cityData using KDBush
  const cityIndex = new KDBush(
    cityData,
    (city) => city.x,
    (city) => city.y
  );

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
    const [country_code, postal_code, place_name, admin_name1, admin_code1, admin_name2, admin_code2, admin_name3, admin_code3, latitude, longitude, accuracy] = lines[i].split('\t');

    const short = `${place_name}, ${admin_code1}, ${country_code}`;
    const name = `${place_name}, ${admin_code1}, ${country_code} (${postal_code})`;

    // Find the closest city to the zip 
    const closestCities = geokdbush.around(cityIndex, parseFloat(longitude), parseFloat(latitude), 1);
    const cityInfo = closestCities.length > 0 ? closestCities[0] : null;
    const elevation = cityInfo ? cityInfo.e : null;
    const timezone = cityInfo ? cityInfo.t : null;
    const zipCodeData = {
      i: postal_code,
      n: name,
      p: null,
      e: elevation,
      y: parseFloat(latitude),
      x: parseFloat(longitude),
      t: timezone,
    };
    cache.push(zipCodeData);
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

module.exports = processZipcodes;
