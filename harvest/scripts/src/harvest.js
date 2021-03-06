import fetch from 'node-fetch';
import fs from 'fs';
import Papa from 'papaparse';

const WAIT_MS = 250;

// const PATH_TO_URI_LIST = '../data/4da1568a-6f1f-4bd7-94ae-1e05feb1bbfc.csv';
const PATH_TO_URI_LIST = '../data/objects-with-geodata-ids.csv';

const str = fs.readFileSync(PATH_TO_URI_LIST, 'utf8');
const csv = Papa.parse(str, { header: true });

// const uris = csv.data.map(row => row['_source.admin.uri']);
const ids = csv.data.map(row => row['ids']);

const harvestOne = (idx = 0) => {

  const objectId = ids[idx]; // .substring(ids[idx].lastIndexOf('/') + 1);

  /*
  const apiURL = uris[idx]
    .replace('http://', 'https://')
    .replace('/id/', '/api/v1/')
    .replace('/object/', '/objects/object-');
  */
 const apiURL = `https://data.fitzmuseum.cam.ac.uk/api/v1/objects/${objectId}`;

  const filename = `../data/objects/${objectId.substring(objectId.indexOf("-") + 1)}.json`;

  if (fs.existsSync(filename)) {
    console.log(`${apiURL} (${idx + 1}/${ids.length}) - exists, skipping`);
    setTimeout(() => harvestOne(idx + 1), 10);
  } else {
    console.log(`${apiURL} (${idx + 1}/${ids.length})`);

    fetch(apiURL)
      .then(res => res.json())
      .then(data => {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));

        setTimeout(() => {
          harvestOne(idx + 1);
        }, WAIT_MS);
      });
  }
}

harvestOne();