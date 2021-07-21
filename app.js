import { resolve } from 'path';
import { watch } from 'chokidar';
import { importTtl } from './lib/import-ttl';

const RDF_EXTENSIONS = ['ttl', 'nt'];
const IMPORT_DIR = process.env.IMPORT_DIR || '/data/imports';
const GRAPH = process.env.GRAPH || 'http://mu.semte.ch/application';

const glob = `**/*.{${RDF_EXTENSIONS.join(',')}}`;
const watcher = watch(glob, {
  persistent: true,
  ignoreInitial: true,
  cwd: IMPORT_DIR,
  awaitWriteFinish: {
    stabilityThreshold: 10 * 1000, // High number, since dump-files might be written to the folder in a streaming fashion we want to wait long enough to be sure the file is complete before starting import.
    pollInterval: 250
  }
});

// New file
watcher.on('add', path => importTtl(resolve(IMPORT_DIR, path), GRAPH));

// Overwrite existing file (supposing it has new content)
watcher.on('change', path => importTtl(resolve(IMPORT_DIR, path), GRAPH));
