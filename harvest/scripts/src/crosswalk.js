import fs from 'fs';

const BASE_PATH = '../data/objects/';

const toArray = x => Array.isArray(x) ? x : [x];

const getFirst = (field, x) => x ? toArray(x)[0][field] : null;

const files = fs.readdirSync(BASE_PATH);

const features = [];

const crosswalkOne = (idx = 0) => {
  console.log(`Crosswalking ${idx + 1}/${files.length}`);

  const str = fs.readFileSync(BASE_PATH + files[idx], 'utf8');
  const json = JSON.parse(str);

  const { data } = json;

  const name = getFirst('summary_title', data.name);

  const description = getFirst('value', data.description);
  
  // TODO Fix
  const categories = toArray(data.categories).map(c => c?.summary_title);
  
  const department = data.department.value;

  // TODO accession number

  // TODO publications?

  // TODO lifecycle!
  // acquisition, creation (-> places / periods), collection (-> places -> summary_title/coordinates)

  // Multimedia

  // Just a hack
  const collection = data.lifecycle?.collection;
  if (collection && collection.places?.length > 0) {
    const { coordinates } = collection.places[0];

    if (coordinates) {
      features.push({
        '@id': data.URI,
        type: 'Feature',
        properties: {
          title: name,
          department
        },
        descriptions: [{ value: description }],
        types: categories.map(value => ({ value })),
        geometry: {
          type: 'Point',
          coordinates: [ parseFloat(coordinates.lng), parseFloat(coordinates.lat) ]
        }
      });
    }
  }

  if (idx < files.length - 1) {
    setTimeout(() => crosswalkOne(idx + 1), 1);
  } else {
    const geojson = {
      type: 'FeatureCollection',
      features
    };

    fs.writeFileSync('../../public/data/crosswalked.json', JSON.stringify(geojson, null, 2));
    console.log('Done.');
  }
}

crosswalkOne();
