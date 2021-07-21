import fs from 'fs';
import { Parser } from 'n3';
import { insertTriples } from './triple-ingestion';

// From https://github.com/redpencilio/ttl-to-delta-service/blob/a51af0ec1856bcacfc1478abc19eaa6ea0ea22c9/app.js#L93-L107
function parseTtl (file) {
  return (new Promise((resolve, reject) => {
    const parser = new Parser(); // TODO: specify strict format based on file extension
    const triples = [];
    parser.parse(file, (error, triple) => {
      if (error) {
        reject(error);
      } else if (triple) {
        triples.push(triple);
      } else {
        resolve(triples);
      }
    });
  }));
}

async function importTtl (ttlFile, graph) {
  const ttl = fs.readFileSync(ttlFile, { encoding: 'utf-8' });
  const triples = await parseTtl(ttl);
  await insertTriples(triples, graph);
  return triples;
}

export {
  importTtl
};
