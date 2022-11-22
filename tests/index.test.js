const os = require('os');
const process = require('process');
const lint = require('../avrolint');

beforeEach(() => {
  process.stdout.write = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks()
});

// Assert that process.stdout.write calls called only with the given arguments.
let assertWriteCalls = function(calls) {
  expect(process.stdout.write).toHaveBeenCalledTimes(calls.length);

  for (let i = 0; i < calls.length; i++) {
    expect(process.stdout.write).toHaveBeenNthCalledWith(i + 1, calls[i]);
  }
}

test('throws invalid file path: undefined', async () => {
  await expect(lint(undefined)).rejects.toThrow(`Validation failed for the following files:${os.EOL}  undefined`);
  assertWriteCalls([
    `::error::avscFilePath is invalid: 'undefined'${os.EOL}`
  ]);
});

test('throws invalid file path: non-existant file', async () => {
	const fileName = "foo.avsc";
  await expect(lint(fileName)).rejects.toThrow(`Validation failed for the following files:${os.EOL}  ${fileName}`);
  assertWriteCalls([
    `::error::avscFilePath is invalid: '${fileName}'${os.EOL}`
  ]);
});

test('throws parse error AVSC file is non-parseable not JSON', async () => {
  const fileName = "./tests/fixtures/invalid-non-parseable-not-json.avsc";
  await expect(lint(fileName)).rejects.toThrow(`Validation failed for the following files:${os.EOL}  ${fileName}`);
  assertWriteCalls([
    `::error::AVSC file specified is not valid/parseable JSON: ${fileName}%0A  SyntaxError: Unexpected token h in JSON at position 1${os.EOL}`
  ]);
});

test('throws parse error AVSC file is non-parseable invalid AVSC', async () => {
  const fileName = "./tests/fixtures/invalid-non-parseable-avsc.avsc";
  await expect(lint(fileName)).rejects.toThrow(`Validation failed for the following files:${os.EOL}  ${fileName}`);
  assertWriteCalls([
    `::error::AVSC file specified is not valid/parseable: ${fileName}%0A  Error: unknown type: undefined${os.EOL}`
  ]);

});

test('throws error on invalid AVSC file with missing docs', async () => {
  const fileName = "./tests/fixtures/invalid-missing-docs.avsc";
  await expect(lint(fileName)).rejects.toThrow(`Validation failed for the following files:${os.EOL}  ${fileName}`);

  const expectedErrorMessage = `Invalid Schema at '${fileName}'! The following fields are not documented:
  com.samsung.ads.MyRecord.id
  com.samsung.ads.MyRecord.MyArrayOfNestedRecords
  com.samsung.ads.MyRecord.MyArrayOfNestedRecords.nestedId
  com.samsung.ads.MyRecord.MyMapOfNestedRecords
  com.samsung.ads.MyRecord.MyMapOfNestedRecords.nestedId
  com.samsung.ads.MyRecord.MyUnionNestedRecord
  com.samsung.ads.MyRecord.MyUnionNestedRecord.nestedId`.replaceAll("\n", "%0A");

  assertWriteCalls([
    `::error::${expectedErrorMessage}${os.EOL}`
  ]);
});

test('throws error on multiple invalid AVSC files with missing docs', async () => {
  const fileName = "./tests/fixtures/invalid-missing-docs.avsc";
  await expect(lint(`["${fileName}","${fileName}"]`)).rejects.toThrow(`Validation failed for the following files:${os.EOL}  ${fileName}${os.EOL}  ${fileName}`);

  const expectedErrorMessage = `Invalid Schema at '${fileName}'! The following fields are not documented:
  com.samsung.ads.MyRecord.id
  com.samsung.ads.MyRecord.MyArrayOfNestedRecords
  com.samsung.ads.MyRecord.MyArrayOfNestedRecords.nestedId
  com.samsung.ads.MyRecord.MyMapOfNestedRecords
  com.samsung.ads.MyRecord.MyMapOfNestedRecords.nestedId
  com.samsung.ads.MyRecord.MyUnionNestedRecord
  com.samsung.ads.MyRecord.MyUnionNestedRecord.nestedId`.replaceAll("\n", "%0A");

  assertWriteCalls([
    `::error::${expectedErrorMessage}${os.EOL}`,
    `::error::${expectedErrorMessage}${os.EOL}`
  ]);
});

test('throws error on invalid AVSC files, one valid and one with missing docs', async () => {
	const fileNameValid = "./tests/fixtures/valid.avsc";
  const fileNameInvalid = "./tests/fixtures/invalid-missing-docs.avsc";
  await expect(lint(`["${fileNameValid}","${fileNameInvalid}"]`)).rejects.toThrow(`Validation failed for the following files:${os.EOL}  ${fileNameInvalid}`);

  const expectedErrorMessage = `Invalid Schema at '${fileNameInvalid}'! The following fields are not documented:
  com.samsung.ads.MyRecord.id
  com.samsung.ads.MyRecord.MyArrayOfNestedRecords
  com.samsung.ads.MyRecord.MyArrayOfNestedRecords.nestedId
  com.samsung.ads.MyRecord.MyMapOfNestedRecords
  com.samsung.ads.MyRecord.MyMapOfNestedRecords.nestedId
  com.samsung.ads.MyRecord.MyUnionNestedRecord
  com.samsung.ads.MyRecord.MyUnionNestedRecord.nestedId`.replaceAll("\n", "%0A");

  assertWriteCalls([
    `::error::${expectedErrorMessage}${os.EOL}`
  ]);
});

test('throws error on invalid AVSC file with complex union', async () => {
  const fileName = "./tests/fixtures/invalid-complex-union.avsc";
  await expect(lint(fileName)).rejects.toThrow(`Validation failed for the following files:${os.EOL}  ${fileName}`);

  const expectedErrorMessage = `Invalid Schema at '${fileName}'! The following fields are or contain complex unions:
  com.samsung.ads.MyRecord.MyComplexUnionA
  com.samsung.ads.MyRecord.MyComplexUnionB
  com.samsung.ads.MyRecord.MyArrayOfComplexUnions
  com.samsung.ads.MyRecord.MyMapOfComplexUnions`.replaceAll("\n", "%0A");

  assertWriteCalls([
    `::error::${expectedErrorMessage}${os.EOL}`
  ]);
});

test('throws error on multiple invalid AVSC files', async () => {
  const fileName1 = "./tests/fixtures/invalid-missing-docs.avsc";
  const fileName2 = "./tests/fixtures/invalid-complex-union.avsc";
  await expect(lint(`["${fileName1}","${fileName2}"]`)).rejects.toThrow(`Validation failed for the following files:${os.EOL}  ${fileName1}${os.EOL}  ${fileName2}`);

  const expectedErrorMessage1 = `Invalid Schema at '${fileName1}'! The following fields are not documented:
  com.samsung.ads.MyRecord.id
  com.samsung.ads.MyRecord.MyArrayOfNestedRecords
  com.samsung.ads.MyRecord.MyArrayOfNestedRecords.nestedId
  com.samsung.ads.MyRecord.MyMapOfNestedRecords
  com.samsung.ads.MyRecord.MyMapOfNestedRecords.nestedId
  com.samsung.ads.MyRecord.MyUnionNestedRecord
  com.samsung.ads.MyRecord.MyUnionNestedRecord.nestedId`.replaceAll("\n", "%0A");

	const expectedErrorMessage2 = `Invalid Schema at '${fileName2}'! The following fields are or contain complex unions:
  com.samsung.ads.MyRecord.MyComplexUnionA
  com.samsung.ads.MyRecord.MyComplexUnionB
  com.samsung.ads.MyRecord.MyArrayOfComplexUnions
  com.samsung.ads.MyRecord.MyMapOfComplexUnions`.replaceAll("\n", "%0A");

  assertWriteCalls([
    `::error::${expectedErrorMessage1}${os.EOL}`,
    `::error::${expectedErrorMessage2}${os.EOL}`
  ]);
});

test('does not throw error on invalid AVSC file with missing docs when undocumentedCheck disabled', async () => {
  const fileName = "./tests/fixtures/invalid-missing-docs.avsc";
	await expect(lint(fileName, {"undocumentedCheck": false})).resolves;
});

test('does not throw error on invalid AVSC file with complex union when complexUnionCheck disabled', async () => {
  const fileName = "./tests/fixtures/invalid-complex-union.avsc";
	await expect(lint(fileName, {"complexUnionCheck": false})).resolves;
});

test('valid AVSC file parses successfully', async () => {
  const fileName = "./tests/fixtures/valid.avsc";
  await expect(lint(fileName)).resolves;
});

test('multiple valid AVSC files parse successfully', async () => {
  const fileName = "./tests/fixtures/valid.avsc";
  await expect(lint(`["${fileName}","${fileName}"]`)).resolves;
});
