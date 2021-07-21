# ttl import service

A service that watches a directory for newly appearing RDF-dumps (`.ttl` or `.nt`) and imports those into the database. Uses [sudo-headers](https://github.com/lblod/mu-auth-sudo) and imports in batches, so it can be used through [mu-authorization](https://github.com/mu-semtech/mu-authorization).

## Configuration

### Environment variables

The service can be configured through the following environment variables:
* `GRAPH`: graph to write to, by default `http://mu.semte.ch/application`
* `BATCH_SIZE`: Amount of triples imported in each insert statement. Particularly important when querying through mu-authorization. Defaults to `100`.
* `IMPORT_DIR`: path to monitor, by default `/data/imports`
* (`MU_SPARQL_ENDPOINT`): SPARQL endpoint to use (default provided by [mu-javascript-template](https://github.com/mu-semtech/mu-javascript-template/blob/ef96de5960ce496548d6641c4fc658bcdd8cbcfd/Dockerfile#L7))

### docker-compose snippet

```yaml
  ttl-import:
    build: https://github.com/kanselarij-vlaanderen/ttl-import-service.git
    volumes:
      - "./data/my-import-folder:/data/imports"
    environment:
      GRAPH: "http://mu.semte.ch/graphs/staatsblad"
```

## FAQ

> I want the files that are already present in the `IMPORT_DIR` at startup to be imported. Can this service do that for me?

No. This service is scoped to monitoring for newly appearing files. A one-time import can easily be accomplished through the [mu-migrations-service](https://github.com/mu-semtech/mu-migrations-service/).

## Related services

Other services that have inspired this one, or have a slightly different take on importing data are:

- [mandaten-import-service](https://github.com/lblod/mandaten-import-service)
- [ttl-to-delta](https://github.com/redpencilio/ttl-to-delta-service) in conjuction with [themis-publication-consumer](https://github.com/kanselarij-vlaanderen/themis-publication-consumer). 