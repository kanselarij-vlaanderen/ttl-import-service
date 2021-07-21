import { sparqlEscapeUri, sparqlEscapeString } from 'mu';
import { updateSudo as update } from '@lblod/mu-auth-sudo';

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 100;

// From https://github.com/kanselarij-vlaanderen/themis-publication-consumer/blob/170c4ae224116ac112759165bb7374db35f8ec49/lib/delta-file.js#L117-L130
async function insertTriples (triples, graph) {
  for (let i = 0; i < triples.length; i += BATCH_SIZE) {
    console.log(`Inserting triples in batch: ${i}-${i + BATCH_SIZE}`);
    const batch = triples.slice(i, i + BATCH_SIZE);
    const statements = toStatements(batch);
    await update(`
INSERT DATA {
    GRAPH <${graph}> {
        ${statements}
    }
}`);
  }
}

// Adapted from https://github.com/kanselarij-vlaanderen/themis-publication-consumer/blob/170c4ae224116ac112759165bb7374db35f8ec49/lib/delta-file.js#L132-L158
function toStatements (triples) {
  const escape = function (rdfTerm) {
    const { termType, value, datatype, language } = rdfTerm;
    if (termType === 'NamedNode') {
      return sparqlEscapeUri(value);
    } else if (termType === 'Literal') {
      if (datatype && datatype.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString') {
        return `${sparqlEscapeString(value)}@${language}`;
      } else if (datatype && datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
        // We ignore xsd:string datatypes because Virtuoso doesn't treat those as default datatype
        // Eg. SELECT * WHERE { ?s mu:uuid "4983948" } will not return any value if the uuid is a typed literal
        // Since the n3 npm library used by the producer explicitely adds xsd:string on non-typed literals
        // we ignore the xsd:string on ingest
        return `${sparqlEscapeString(value)}^^${sparqlEscapeUri(datatype.value)}`;
      } else {
        return `${sparqlEscapeString(value)}`;
      }
    } else {
      console.log(`Don't know how to escape type ${termType}. Will escape as a string.`);
    }
    return sparqlEscapeString(value);
  };
  return triples.map(function (t) {
    const subject = escape(t.subject);
    const predicate = escape(t.predicate);
    const object = escape(t.object);
    return `${subject} ${predicate} ${object} . `;
  }).join('');
}

export {
  insertTriples
};
