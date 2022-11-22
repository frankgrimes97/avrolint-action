const fs = require('fs')
const core = require('@actions/core');
const avro = require('avro-js');

let avrolint = function(avscFilePath, options={"undocumentedCheck": true, "complexUnionCheck": true}) {
  return new Promise((resolve) => {
    // default, assume input is single file
    var filePaths = [avscFilePath];
		try {
      // try to see if it's a list of paths in JSON array
      filePaths = JSON.parse(avscFilePath);
    }
    catch (err) {
			// ignore
    }

    var filePathsWithErrors = [];
		for (const filePath of filePaths) {
      if (typeof filePath === 'undefined' || !fs.existsSync(filePath)) {
        if (typeof filePath === 'undefined') {
          filePathsWithErrors.push("undefined"); // without this a blank error message is printed
        } else {
          filePathsWithErrors.push(filePath);
        }
        core.error("avscFilePath is invalid: '" + filePath + "'");
        continue;
      }

      var fileContents = fs.readFileSync(filePath);
      var avroSchemaJson;

      try {
        avroSchemaJson = JSON.parse(fileContents);
      } catch (err) {
        filePathsWithErrors.push(filePath);
        core.error("AVSC file specified is not valid/parseable JSON: " + filePath + "\n  " + err.toString());
        continue;
      }

      var avroType;
      try {
        avroType = avro.parse(avroSchemaJson);
      } catch (err) {
        filePathsWithErrors.push(filePath);
        core.error("AVSC file specified is not valid/parseable: " + filePath + "\n  " + err.toString());
        continue;
      }

      if (options.undocumentedCheck) {
        const undocumentedFields = getUndocumentedFields(avroType.getName(), avroSchemaJson);
        if (undocumentedFields.length > 0) {
          filePathsWithErrors.push(filePath);
          const errorMessage = `Invalid Schema at '${filePath}'! The following fields are not documented:`;
          core.error(errorMessage.concat("\n  ", ...undocumentedFields.join("\n  ")));
        }
      }

      if (options.complexUnionCheck) {
        const complexUnionFields = getComplexUnionFields(avroType.getName(), avroSchemaJson);
        if (complexUnionFields.length > 0) {
          filePathsWithErrors.push(filePath);
          const errorMessage = `Invalid Schema at '${filePath}'! The following fields are or contain complex unions:`;
          core.error(errorMessage.concat("\n  ", ...complexUnionFields.join("\n  ")));
        }
      }
    }

    if (filePathsWithErrors.length > 0) {
      const errorMessage = "Validation failed for the following files:";
      throw new Error(errorMessage.concat("\n  ", ...filePathsWithErrors.join("\n  ")));
    }

    resolve("done!");
  });
};

let isOrContainsRecord = function(field) {
	if (Array.isArray(field.type)) {
    // Check UNION type for RECORD type
    return field.type.filter(x => x.type?.toUpperCase() === "RECORD").length > 0;
  }

  const upperCaseFieldType = field.type.type?.toUpperCase();
  if (upperCaseFieldType === "RECORD") {
    return true;
  } else if (upperCaseFieldType === "ARRAY" && field.type.items?.type?.toUpperCase() === "RECORD") {
    return true;
  } else if (upperCaseFieldType === "MAP" && field.type.values?.type?.toUpperCase() === "RECORD") {
    return true;
  }

  return false;
}

let isUnionType = function(type) {
	return Array.isArray(type);
}

let getRecordSchema = function(field) {
  if (isUnionType(field.type)) {
    // Extract UNION type RECORD schema
    return field.type.filter(x => x.type?.toUpperCase() === "RECORD")[0];
  }

  const upperCaseFieldType = field.type.type?.toUpperCase();
  if (upperCaseFieldType === "RECORD") {
    return field;
  } else if (upperCaseFieldType === "ARRAY" && field.type.items?.type?.toUpperCase() === "RECORD") {
    return field.type.items;
  } else if (upperCaseFieldType === "MAP" && field.type.values?.type?.toUpperCase() === "RECORD") {
    return field.type.values;
  }
}

let getUndocumentedFields = function(pathPrefix, avroSchemaJson) {
  const undocumentedFields = [];

  for (const field of avroSchemaJson.fields) {
    if (field.doc == null || field.doc.trim() === '') {
      undocumentedFields.push(pathPrefix + '.' + field.name);
    }
    if (isOrContainsRecord(field)) {
      undocumentedFields.push(...getUndocumentedFields(pathPrefix + '.' + field.name, getRecordSchema(field)));
    }
  }

  return undocumentedFields;
}

let getUnionSchema = function(field) {

  if (isUnionType(field.type)) {
    return field.type;
  }

	const upperCaseFieldType = field.type.type?.toUpperCase();
	if (upperCaseFieldType === "ARRAY" && isUnionType(field.type.items)) {
    return field.type.items;
  } else if (upperCaseFieldType === "MAP" && isUnionType(field.type.values)) {
    return field.type.values;
  }

}

let isComplexUnion = function(field) {
	const unionSchema = getUnionSchema(field);

	if (!unionSchema) {
    return false;
  }

	if (unionSchema.length == 2 && unionSchema[0].toUpperCase() === "NULL") {
		return false;
	}

	return true;
}

let getComplexUnionFields = function(pathPrefix, avroSchemaJson) {
  const complexUnionFields = [];

  for (const field of avroSchemaJson.fields) {
    if (isComplexUnion(field)) {
      complexUnionFields.push(pathPrefix + '.' + field.name);
		}

		if (isOrContainsRecord(field)) {
      complexUnionFields.push(...getComplexUnionFields(pathPrefix + '.' + field.name, getRecordSchema(field)));
		}
	}

  return complexUnionFields;
}

module.exports = avrolint;

