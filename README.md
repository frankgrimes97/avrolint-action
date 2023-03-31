# Avrolint v1

This action performs linting on [Apache Avro](https://avro.apache.org/)
Schema files (.avsc).

## Usage

<!-- start usage -->
```yaml
- uses: frankgrimes97/avrolint-action@v1
  with:
    # Avro schema file(s) to lint
    # Can be a single file path:
    #   e.g. '/tmp/avroSchema.avsc'
    # Can be a string containing a JSON-encoded array of paths:
    #   e.g. '["/tmp/avroSchemaA.avsc", "/tmp2/avroSchemaB.avsc"]'
    avsc-to-lint: ''

    # Check that all fields are documented.
    # Default: true
    undocumented-field-check: ''

    # Check that union types are all simple types.
    # i.e. only used to express nullability
    # This is enforced because schemas which have complex union types are
    # difficult for most programming language type systems to handle gracefully.
    # e.g.
    #   valid: ["null", <TYPE>]
    #   invalid: [<TYPE1>, <TYPE2>]
    #   invalid: ["null", <TYPE1>, <TYPE2>]
    # Default: true
    complex-union-check: ''
```
<!-- end usage -->

## Build

To build it locally, run `npm clean-install`.

N.B. For efficiency of execution, [NCC](https://github.com/vercel/ncc) is used to build a single JavaScript file under the `dist/` folder.

Be sure to check in changes to that file, otherwise changes made to the sources won't be reflected in what's run by the action.

## Release

Releases are handled through Git tags.

Example tags:
  - v1 (major version, moving tag)
  - v1.0.0 (specific version, fixed/immutable tag)

