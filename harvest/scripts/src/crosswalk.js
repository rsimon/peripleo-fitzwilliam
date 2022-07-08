import fs from 'fs';

const BASE_PATH = '../data/objects/';

const toArray = x => x ? (Array.isArray(x) ? x : [x]) : [];

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
  
  const categories = toArray(data.categories).map(c => c?.summary_title);
  
  const department = data.department.value;

  const accession = toArray(data.identifier).find(i => i.type === 'accession number')?.value;

  const multimedia = toArray(data.multimedia).length > 0 ?
    toArray(data.multimedia)[0].mid.location : null;

  // TODO lifecycle - periods!
  // acquisition, creation (-> places / periods), collection (-> places -> summary_title/coordinates)

  // TODO Multimedia

  const places = data.lifecycle ?
    Object.values(data.lifecycle).reduce((all, evt) => evt.places ? [...all, ...evt.places] : all, []) : [];

  // TODO geocode places that have no coordinates

  const locatedPlaces = places.filter(p => p.coordinates);

  // TODO Peripleo only supports single place per record at the moment!

  if (locatedPlaces.length > 0) {
    const { coordinates } = locatedPlaces[0];

    const feature = {
      '@id': data.URI,
      type: 'Feature',
      properties: {
        title: `${name} ${accession}`,
        department
      },
      types: categories.map(value => ({ value })),
      geometry: {
        type: 'Point',
        coordinates: [ parseFloat(coordinates.lng), parseFloat(coordinates.lat) ]
      }
    };

    if (description)
      feature.descriptions = [{ value: description }];

    if (multimedia)
      feature.depictions = [{ '@id': multimedia, thumbnail: multimedia }];

    features.push(feature);
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
