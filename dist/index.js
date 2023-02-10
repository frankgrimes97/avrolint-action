require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 924:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(147)
const core = __nccwpck_require__(782);
const avro = __nccwpck_require__(859);

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

    var filePathsWithErrors = new Set();
    for (const filePath of filePaths) {
      if (typeof filePath === 'undefined' || !fs.existsSync(filePath)) {
        if (typeof filePath === 'undefined') {
          filePathsWithErrors.add("undefined"); // without this a blank error message is printed
        } else {
          filePathsWithErrors.add(filePath);
        }
        core.error("avscFilePath is invalid: '" + filePath + "'");
        continue;
      }

      var fileContents = fs.readFileSync(filePath);
      var avroSchemaJson;

      try {
        avroSchemaJson = JSON.parse(fileContents);
      } catch (err) {
        filePathsWithErrors.add(filePath);
        core.error("AVSC file specified is not valid/parseable JSON: " + filePath + "\n  " + err.toString());
        continue;
      }

      var avroType;
      try {
        avroType = avro.parse(avroSchemaJson);
      } catch (err) {
        filePathsWithErrors.add(filePath);
        core.error("AVSC file specified is not valid/parseable: " + filePath + "\n  " + err.toString());
        continue;
      }

      if (options.undocumentedCheck) {
        const undocumentedFields = getUndocumentedFields(avroType.getName(), avroSchemaJson);
        if (undocumentedFields.length > 0) {
          filePathsWithErrors.add(filePath);
          const errorMessage = `Invalid Schema at '${filePath}'! The following fields are not documented:`;
          core.error(errorMessage.concat("\n  ", ...undocumentedFields.join("\n  ")));
        }
      }

      if (options.complexUnionCheck) {
        const complexUnionFields = getComplexUnionFields(avroType.getName(), avroSchemaJson);
        if (complexUnionFields.length > 0) {
          filePathsWithErrors.add(filePath);
          const errorMessage = `Invalid Schema at '${filePath}'! The following fields are or contain complex unions:`;
          core.error(errorMessage.concat("\n  ", ...complexUnionFields.join("\n  ")));
        }
      }
    }

    if (filePathsWithErrors.size > 0) {
      const errorMessage = "Validation failed for the following files:";
      throw new Error(errorMessage.concat("\n  ", ...Array.from(filePathsWithErrors.keys()).join("\n  ")));
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
    return field.type;
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



/***/ }),

/***/ 782:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 859:
/***/ ((module) => {

module.exports = eval("require")("avro-js");


/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(782);
const avrolint = __nccwpck_require__(924);

async function run() {
  try {
    // 'avsc-to-lint' input defined in action metadata file
    const avscToLint = core.getInput('avsc-to-lint', {required: true});
    const undocumentedCheck = core.getBooleanInput(
      'undocumented-field-check',
      {required: true}
    );
    const complexUnionCheck = core.getBooleanInput(
      'complex-union-check',
      {required: true}
    );
    console.log(`Linting ${avscToLint}!`);
    await avrolint(
      avscToLint,
      {
        "undocumentedCheck": undocumentedCheck,
        "complexUnionCheck": complexUnionCheck
      }
    );
  } catch (error) {
    console.error(error.stack);
    core.setFailed(error.message);
  }
}

run();

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map