
const toArray = x => Array.isArray(x) ? x : [x];

const getFirst = (field, x) => toArray(x)[0][field];

const crosswalkOne = (idx = 0) => {

  // TODO 
  const json = {}; // 
  const { data } = json;

  const name = getFirst('summary_title', data.name);

  const description = getFirst('value', data.description);
  
  const categories = toArray(data.categories).map(c => c.summary_title);
  
  const department = data.department.value;

  // TODO accession number

  // TODO publications?

  // TODO lifecycle!
  // acquisition, creation (-> places / periods), collection (-> places -> summary_title/coordinates)

  // Multimedia

}