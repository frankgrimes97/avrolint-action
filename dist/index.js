require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 217:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(7147)
const core = __nccwpck_require__(2186);
const avro = __nccwpck_require__(8666);

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



/***/ }),

/***/ 7351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issue = exports.issueCommand = void 0;
const os = __importStar(__nccwpck_require__(2037));
const utils_1 = __nccwpck_require__(5278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 2186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
const command_1 = __nccwpck_require__(7351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(5278);
const os = __importStar(__nccwpck_require__(2037));
const path = __importStar(__nccwpck_require__(1017));
const oidc_utils_1 = __nccwpck_require__(8041);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        return file_command_1.issueFileCommand('ENV', file_command_1.prepareKeyValueMessage(name, val));
    }
    command_1.issueCommand('set-env', { name }, convertedVal);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueFileCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    if (options && options.trimWhitespace === false) {
        return val;
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
function getMultilineInput(name, options) {
    const inputs = getInput(name, options)
        .split('\n')
        .filter(x => x !== '');
    if (options && options.trimWhitespace === false) {
        return inputs;
    }
    return inputs.map(input => input.trim());
}
exports.getMultilineInput = getMultilineInput;
/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
function getBooleanInput(name, options) {
    const trueValue = ['true', 'True', 'TRUE'];
    const falseValue = ['false', 'False', 'FALSE'];
    const val = getInput(name, options);
    if (trueValue.includes(val))
        return true;
    if (falseValue.includes(val))
        return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
}
exports.getBooleanInput = getBooleanInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    const filePath = process.env['GITHUB_OUTPUT'] || '';
    if (filePath) {
        return file_command_1.issueFileCommand('OUTPUT', file_command_1.prepareKeyValueMessage(name, value));
    }
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, utils_1.toCommandValue(value));
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function error(message, properties = {}) {
    command_1.issueCommand('error', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds a warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function warning(message, properties = {}) {
    command_1.issueCommand('warning', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Adds a notice issue
 * @param message notice issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function notice(message, properties = {}) {
    command_1.issueCommand('notice', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.notice = notice;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    const filePath = process.env['GITHUB_STATE'] || '';
    if (filePath) {
        return file_command_1.issueFileCommand('STATE', file_command_1.prepareKeyValueMessage(name, value));
    }
    command_1.issueCommand('save-state', { name }, utils_1.toCommandValue(value));
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
function getIDToken(aud) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
    });
}
exports.getIDToken = getIDToken;
/**
 * Summary exports
 */
var summary_1 = __nccwpck_require__(1327);
Object.defineProperty(exports, "summary", ({ enumerable: true, get: function () { return summary_1.summary; } }));
/**
 * @deprecated use core.summary
 */
var summary_2 = __nccwpck_require__(1327);
Object.defineProperty(exports, "markdownSummary", ({ enumerable: true, get: function () { return summary_2.markdownSummary; } }));
/**
 * Path exports
 */
var path_utils_1 = __nccwpck_require__(2981);
Object.defineProperty(exports, "toPosixPath", ({ enumerable: true, get: function () { return path_utils_1.toPosixPath; } }));
Object.defineProperty(exports, "toWin32Path", ({ enumerable: true, get: function () { return path_utils_1.toWin32Path; } }));
Object.defineProperty(exports, "toPlatformPath", ({ enumerable: true, get: function () { return path_utils_1.toPlatformPath; } }));
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.prepareKeyValueMessage = exports.issueFileCommand = void 0;
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(7147));
const os = __importStar(__nccwpck_require__(2037));
const uuid_1 = __nccwpck_require__(5840);
const utils_1 = __nccwpck_require__(5278);
function issueFileCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueFileCommand = issueFileCommand;
function prepareKeyValueMessage(key, value) {
    const delimiter = `ghadelimiter_${uuid_1.v4()}`;
    const convertedValue = utils_1.toCommandValue(value);
    // These should realistically never happen, but just in case someone finds a
    // way to exploit uuid generation let's not allow keys or values that contain
    // the delimiter.
    if (key.includes(delimiter)) {
        throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
    }
    if (convertedValue.includes(delimiter)) {
        throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
    }
    return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`;
}
exports.prepareKeyValueMessage = prepareKeyValueMessage;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 8041:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OidcClient = void 0;
const http_client_1 = __nccwpck_require__(6255);
const auth_1 = __nccwpck_require__(5526);
const core_1 = __nccwpck_require__(2186);
class OidcClient {
    static createHttpClient(allowRetry = true, maxRetry = 10) {
        const requestOptions = {
            allowRetries: allowRetry,
            maxRetries: maxRetry
        };
        return new http_client_1.HttpClient('actions/oidc-client', [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
    }
    static getRequestToken() {
        const token = process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'];
        if (!token) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable');
        }
        return token;
    }
    static getIDTokenUrl() {
        const runtimeUrl = process.env['ACTIONS_ID_TOKEN_REQUEST_URL'];
        if (!runtimeUrl) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable');
        }
        return runtimeUrl;
    }
    static getCall(id_token_url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const httpclient = OidcClient.createHttpClient();
            const res = yield httpclient
                .getJson(id_token_url)
                .catch(error => {
                throw new Error(`Failed to get ID Token. \n 
        Error Code : ${error.statusCode}\n 
        Error Message: ${error.result.message}`);
            });
            const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
            if (!id_token) {
                throw new Error('Response json body do not have ID Token field');
            }
            return id_token;
        });
    }
    static getIDToken(audience) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // New ID Token is requested from action service
                let id_token_url = OidcClient.getIDTokenUrl();
                if (audience) {
                    const encodedAudience = encodeURIComponent(audience);
                    id_token_url = `${id_token_url}&audience=${encodedAudience}`;
                }
                core_1.debug(`ID token url is ${id_token_url}`);
                const id_token = yield OidcClient.getCall(id_token_url);
                core_1.setSecret(id_token);
                return id_token;
            }
            catch (error) {
                throw new Error(`Error message: ${error.message}`);
            }
        });
    }
}
exports.OidcClient = OidcClient;
//# sourceMappingURL=oidc-utils.js.map

/***/ }),

/***/ 2981:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = void 0;
const path = __importStar(__nccwpck_require__(1017));
/**
 * toPosixPath converts the given path to the posix form. On Windows, \\ will be
 * replaced with /.
 *
 * @param pth. Path to transform.
 * @return string Posix path.
 */
function toPosixPath(pth) {
    return pth.replace(/[\\]/g, '/');
}
exports.toPosixPath = toPosixPath;
/**
 * toWin32Path converts the given path to the win32 form. On Linux, / will be
 * replaced with \\.
 *
 * @param pth. Path to transform.
 * @return string Win32 path.
 */
function toWin32Path(pth) {
    return pth.replace(/[/]/g, '\\');
}
exports.toWin32Path = toWin32Path;
/**
 * toPlatformPath converts the given path to a platform-specific path. It does
 * this by replacing instances of / and \ with the platform-specific path
 * separator.
 *
 * @param pth The path to platformize.
 * @return string The platform-specific path.
 */
function toPlatformPath(pth) {
    return pth.replace(/[/\\]/g, path.sep);
}
exports.toPlatformPath = toPlatformPath;
//# sourceMappingURL=path-utils.js.map

/***/ }),

/***/ 1327:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = void 0;
const os_1 = __nccwpck_require__(2037);
const fs_1 = __nccwpck_require__(7147);
const { access, appendFile, writeFile } = fs_1.promises;
exports.SUMMARY_ENV_VAR = 'GITHUB_STEP_SUMMARY';
exports.SUMMARY_DOCS_URL = 'https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary';
class Summary {
    constructor() {
        this._buffer = '';
    }
    /**
     * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
     * Also checks r/w permissions.
     *
     * @returns step summary file path
     */
    filePath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._filePath) {
                return this._filePath;
            }
            const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
            if (!pathFromEnv) {
                throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
            }
            try {
                yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
            }
            catch (_a) {
                throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
            }
            this._filePath = pathFromEnv;
            return this._filePath;
        });
    }
    /**
     * Wraps content in an HTML tag, adding any HTML attributes
     *
     * @param {string} tag HTML tag to wrap
     * @param {string | null} content content within the tag
     * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
     *
     * @returns {string} content wrapped in HTML element
     */
    wrap(tag, content, attrs = {}) {
        const htmlAttrs = Object.entries(attrs)
            .map(([key, value]) => ` ${key}="${value}"`)
            .join('');
        if (!content) {
            return `<${tag}${htmlAttrs}>`;
        }
        return `<${tag}${htmlAttrs}>${content}</${tag}>`;
    }
    /**
     * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
     *
     * @param {SummaryWriteOptions} [options] (optional) options for write operation
     *
     * @returns {Promise<Summary>} summary instance
     */
    write(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
            const filePath = yield this.filePath();
            const writeFunc = overwrite ? writeFile : appendFile;
            yield writeFunc(filePath, this._buffer, { encoding: 'utf8' });
            return this.emptyBuffer();
        });
    }
    /**
     * Clears the summary buffer and wipes the summary file
     *
     * @returns {Summary} summary instance
     */
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.emptyBuffer().write({ overwrite: true });
        });
    }
    /**
     * Returns the current summary buffer as a string
     *
     * @returns {string} string of summary buffer
     */
    stringify() {
        return this._buffer;
    }
    /**
     * If the summary buffer is empty
     *
     * @returns {boolen} true if the buffer is empty
     */
    isEmptyBuffer() {
        return this._buffer.length === 0;
    }
    /**
     * Resets the summary buffer without writing to summary file
     *
     * @returns {Summary} summary instance
     */
    emptyBuffer() {
        this._buffer = '';
        return this;
    }
    /**
     * Adds raw text to the summary buffer
     *
     * @param {string} text content to add
     * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
     *
     * @returns {Summary} summary instance
     */
    addRaw(text, addEOL = false) {
        this._buffer += text;
        return addEOL ? this.addEOL() : this;
    }
    /**
     * Adds the operating system-specific end-of-line marker to the buffer
     *
     * @returns {Summary} summary instance
     */
    addEOL() {
        return this.addRaw(os_1.EOL);
    }
    /**
     * Adds an HTML codeblock to the summary buffer
     *
     * @param {string} code content to render within fenced code block
     * @param {string} lang (optional) language to syntax highlight code
     *
     * @returns {Summary} summary instance
     */
    addCodeBlock(code, lang) {
        const attrs = Object.assign({}, (lang && { lang }));
        const element = this.wrap('pre', this.wrap('code', code), attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML list to the summary buffer
     *
     * @param {string[]} items list of items to render
     * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
     *
     * @returns {Summary} summary instance
     */
    addList(items, ordered = false) {
        const tag = ordered ? 'ol' : 'ul';
        const listItems = items.map(item => this.wrap('li', item)).join('');
        const element = this.wrap(tag, listItems);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML table to the summary buffer
     *
     * @param {SummaryTableCell[]} rows table rows
     *
     * @returns {Summary} summary instance
     */
    addTable(rows) {
        const tableBody = rows
            .map(row => {
            const cells = row
                .map(cell => {
                if (typeof cell === 'string') {
                    return this.wrap('td', cell);
                }
                const { header, data, colspan, rowspan } = cell;
                const tag = header ? 'th' : 'td';
                const attrs = Object.assign(Object.assign({}, (colspan && { colspan })), (rowspan && { rowspan }));
                return this.wrap(tag, data, attrs);
            })
                .join('');
            return this.wrap('tr', cells);
        })
            .join('');
        const element = this.wrap('table', tableBody);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds a collapsable HTML details element to the summary buffer
     *
     * @param {string} label text for the closed state
     * @param {string} content collapsable content
     *
     * @returns {Summary} summary instance
     */
    addDetails(label, content) {
        const element = this.wrap('details', this.wrap('summary', label) + content);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML image tag to the summary buffer
     *
     * @param {string} src path to the image you to embed
     * @param {string} alt text description of the image
     * @param {SummaryImageOptions} options (optional) addition image attributes
     *
     * @returns {Summary} summary instance
     */
    addImage(src, alt, options) {
        const { width, height } = options || {};
        const attrs = Object.assign(Object.assign({}, (width && { width })), (height && { height }));
        const element = this.wrap('img', null, Object.assign({ src, alt }, attrs));
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML section heading element
     *
     * @param {string} text heading text
     * @param {number | string} [level=1] (optional) the heading level, default: 1
     *
     * @returns {Summary} summary instance
     */
    addHeading(text, level) {
        const tag = `h${level}`;
        const allowedTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
            ? tag
            : 'h1';
        const element = this.wrap(allowedTag, text);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML thematic break (<hr>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addSeparator() {
        const element = this.wrap('hr', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML line break (<br>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addBreak() {
        const element = this.wrap('br', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML blockquote to the summary buffer
     *
     * @param {string} text quote text
     * @param {string} cite (optional) citation url
     *
     * @returns {Summary} summary instance
     */
    addQuote(text, cite) {
        const attrs = Object.assign({}, (cite && { cite }));
        const element = this.wrap('blockquote', text, attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML anchor tag to the summary buffer
     *
     * @param {string} text link text/content
     * @param {string} href hyperlink
     *
     * @returns {Summary} summary instance
     */
    addLink(text, href) {
        const element = this.wrap('a', text, { href });
        return this.addRaw(element).addEOL();
    }
}
const _summary = new Summary();
/**
 * @deprecated use `core.summary`
 */
exports.markdownSummary = _summary;
exports.summary = _summary;
//# sourceMappingURL=summary.js.map

/***/ }),

/***/ 5278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCommandProperties = exports.toCommandValue = void 0;
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
/**
 *
 * @param annotationProperties
 * @returns The command properties to send with the actual annotation command
 * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
 */
function toCommandProperties(annotationProperties) {
    if (!Object.keys(annotationProperties).length) {
        return {};
    }
    return {
        title: annotationProperties.title,
        file: annotationProperties.file,
        line: annotationProperties.startLine,
        endLine: annotationProperties.endLine,
        col: annotationProperties.startColumn,
        endColumn: annotationProperties.endColumn
    };
}
exports.toCommandProperties = toCommandProperties;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 5526:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PersonalAccessTokenCredentialHandler = exports.BearerCredentialHandler = exports.BasicCredentialHandler = void 0;
class BasicCredentialHandler {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.BasicCredentialHandler = BasicCredentialHandler;
class BearerCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Bearer ${this.token}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.BearerCredentialHandler = BearerCredentialHandler;
class PersonalAccessTokenCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Basic ${Buffer.from(`PAT:${this.token}`).toString('base64')}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
//# sourceMappingURL=auth.js.map

/***/ }),

/***/ 6255:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

/* eslint-disable @typescript-eslint/no-explicit-any */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpClient = exports.isHttps = exports.HttpClientResponse = exports.HttpClientError = exports.getProxyUrl = exports.MediaTypes = exports.Headers = exports.HttpCodes = void 0;
const http = __importStar(__nccwpck_require__(3685));
const https = __importStar(__nccwpck_require__(5687));
const pm = __importStar(__nccwpck_require__(9835));
const tunnel = __importStar(__nccwpck_require__(4294));
var HttpCodes;
(function (HttpCodes) {
    HttpCodes[HttpCodes["OK"] = 200] = "OK";
    HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
    HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
    HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
    HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
    HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
    HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
    HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
    HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
    HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
    HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
var Headers;
(function (Headers) {
    Headers["Accept"] = "accept";
    Headers["ContentType"] = "content-type";
})(Headers = exports.Headers || (exports.Headers = {}));
var MediaTypes;
(function (MediaTypes) {
    MediaTypes["ApplicationJson"] = "application/json";
})(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
/**
 * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
 * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
 */
function getProxyUrl(serverUrl) {
    const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
    return proxyUrl ? proxyUrl.href : '';
}
exports.getProxyUrl = getProxyUrl;
const HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
];
const HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
];
const RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
const ExponentialBackoffCeiling = 10;
const ExponentialBackoffTimeSlice = 5;
class HttpClientError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'HttpClientError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpClientError.prototype);
    }
}
exports.HttpClientError = HttpClientError;
class HttpClientResponse {
    constructor(message) {
        this.message = message;
    }
    readBody() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let output = Buffer.alloc(0);
                this.message.on('data', (chunk) => {
                    output = Buffer.concat([output, chunk]);
                });
                this.message.on('end', () => {
                    resolve(output.toString());
                });
            }));
        });
    }
}
exports.HttpClientResponse = HttpClientResponse;
function isHttps(requestUrl) {
    const parsedUrl = new URL(requestUrl);
    return parsedUrl.protocol === 'https:';
}
exports.isHttps = isHttps;
class HttpClient {
    constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
            if (requestOptions.ignoreSslError != null) {
                this._ignoreSslError = requestOptions.ignoreSslError;
            }
            this._socketTimeout = requestOptions.socketTimeout;
            if (requestOptions.allowRedirects != null) {
                this._allowRedirects = requestOptions.allowRedirects;
            }
            if (requestOptions.allowRedirectDowngrade != null) {
                this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
            }
            if (requestOptions.maxRedirects != null) {
                this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
            }
            if (requestOptions.keepAlive != null) {
                this._keepAlive = requestOptions.keepAlive;
            }
            if (requestOptions.allowRetries != null) {
                this._allowRetries = requestOptions.allowRetries;
            }
            if (requestOptions.maxRetries != null) {
                this._maxRetries = requestOptions.maxRetries;
            }
        }
    }
    options(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
        });
    }
    get(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('GET', requestUrl, null, additionalHeaders || {});
        });
    }
    del(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('DELETE', requestUrl, null, additionalHeaders || {});
        });
    }
    post(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('POST', requestUrl, data, additionalHeaders || {});
        });
    }
    patch(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PATCH', requestUrl, data, additionalHeaders || {});
        });
    }
    put(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PUT', requestUrl, data, additionalHeaders || {});
        });
    }
    head(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('HEAD', requestUrl, null, additionalHeaders || {});
        });
    }
    sendStream(verb, requestUrl, stream, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(verb, requestUrl, stream, additionalHeaders);
        });
    }
    /**
     * Gets a typed object from an endpoint
     * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
     */
    getJson(requestUrl, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            const res = yield this.get(requestUrl, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    postJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.post(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    putJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.put(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    patchJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.patch(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    /**
     * Makes a raw http request.
     * All other methods such as get, post, patch, and request ultimately call this.
     * Prefer get, del, post and patch
     */
    request(verb, requestUrl, data, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._disposed) {
                throw new Error('Client has already been disposed.');
            }
            const parsedUrl = new URL(requestUrl);
            let info = this._prepareRequest(verb, parsedUrl, headers);
            // Only perform retries on reads since writes may not be idempotent.
            const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb)
                ? this._maxRetries + 1
                : 1;
            let numTries = 0;
            let response;
            do {
                response = yield this.requestRaw(info, data);
                // Check if it's an authentication challenge
                if (response &&
                    response.message &&
                    response.message.statusCode === HttpCodes.Unauthorized) {
                    let authenticationHandler;
                    for (const handler of this.handlers) {
                        if (handler.canHandleAuthentication(response)) {
                            authenticationHandler = handler;
                            break;
                        }
                    }
                    if (authenticationHandler) {
                        return authenticationHandler.handleAuthentication(this, info, data);
                    }
                    else {
                        // We have received an unauthorized response but have no handlers to handle it.
                        // Let the response return to the caller.
                        return response;
                    }
                }
                let redirectsRemaining = this._maxRedirects;
                while (response.message.statusCode &&
                    HttpRedirectCodes.includes(response.message.statusCode) &&
                    this._allowRedirects &&
                    redirectsRemaining > 0) {
                    const redirectUrl = response.message.headers['location'];
                    if (!redirectUrl) {
                        // if there's no location to redirect to, we won't
                        break;
                    }
                    const parsedRedirectUrl = new URL(redirectUrl);
                    if (parsedUrl.protocol === 'https:' &&
                        parsedUrl.protocol !== parsedRedirectUrl.protocol &&
                        !this._allowRedirectDowngrade) {
                        throw new Error('Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.');
                    }
                    // we need to finish reading the response before reassigning response
                    // which will leak the open socket.
                    yield response.readBody();
                    // strip authorization header if redirected to a different hostname
                    if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                        for (const header in headers) {
                            // header names are case insensitive
                            if (header.toLowerCase() === 'authorization') {
                                delete headers[header];
                            }
                        }
                    }
                    // let's make the request with the new redirectUrl
                    info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                    response = yield this.requestRaw(info, data);
                    redirectsRemaining--;
                }
                if (!response.message.statusCode ||
                    !HttpResponseRetryCodes.includes(response.message.statusCode)) {
                    // If not a retry code, return immediately instead of retrying
                    return response;
                }
                numTries += 1;
                if (numTries < maxTries) {
                    yield response.readBody();
                    yield this._performExponentialBackoff(numTries);
                }
            } while (numTries < maxTries);
            return response;
        });
    }
    /**
     * Needs to be called if keepAlive is set to true in request options.
     */
    dispose() {
        if (this._agent) {
            this._agent.destroy();
        }
        this._disposed = true;
    }
    /**
     * Raw request.
     * @param info
     * @param data
     */
    requestRaw(info, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                function callbackForResult(err, res) {
                    if (err) {
                        reject(err);
                    }
                    else if (!res) {
                        // If `err` is not passed, then `res` must be passed.
                        reject(new Error('Unknown error'));
                    }
                    else {
                        resolve(res);
                    }
                }
                this.requestRawWithCallback(info, data, callbackForResult);
            });
        });
    }
    /**
     * Raw request with callback.
     * @param info
     * @param data
     * @param onResult
     */
    requestRawWithCallback(info, data, onResult) {
        if (typeof data === 'string') {
            if (!info.options.headers) {
                info.options.headers = {};
            }
            info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
        }
        let callbackCalled = false;
        function handleResult(err, res) {
            if (!callbackCalled) {
                callbackCalled = true;
                onResult(err, res);
            }
        }
        const req = info.httpModule.request(info.options, (msg) => {
            const res = new HttpClientResponse(msg);
            handleResult(undefined, res);
        });
        let socket;
        req.on('socket', sock => {
            socket = sock;
        });
        // If we ever get disconnected, we want the socket to timeout eventually
        req.setTimeout(this._socketTimeout || 3 * 60000, () => {
            if (socket) {
                socket.end();
            }
            handleResult(new Error(`Request timeout: ${info.options.path}`));
        });
        req.on('error', function (err) {
            // err has statusCode property
            // res should have headers
            handleResult(err);
        });
        if (data && typeof data === 'string') {
            req.write(data, 'utf8');
        }
        if (data && typeof data !== 'string') {
            data.on('close', function () {
                req.end();
            });
            data.pipe(req);
        }
        else {
            req.end();
        }
    }
    /**
     * Gets an http agent. This function is useful when you need an http agent that handles
     * routing through a proxy server - depending upon the url and proxy environment variables.
     * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
     */
    getAgent(serverUrl) {
        const parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === 'https:';
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port
            ? parseInt(info.parsedUrl.port)
            : defaultPort;
        info.options.path =
            (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
            info.options.headers['user-agent'] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        // gives handlers an opportunity to participate
        if (this.handlers) {
            for (const handler of this.handlers) {
                handler.prepareRequest(info.options);
            }
        }
        return info;
    }
    _mergeHeaders(headers) {
        if (this.requestOptions && this.requestOptions.headers) {
            return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
        }
        return lowercaseKeys(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
            clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
    }
    _getAgent(parsedUrl) {
        let agent;
        const proxyUrl = pm.getProxyUrl(parsedUrl);
        const useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
            agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
            agent = this._agent;
        }
        // if agent is already assigned use that agent.
        if (agent) {
            return agent;
        }
        const usingSsl = parsedUrl.protocol === 'https:';
        let maxSockets = 100;
        if (this.requestOptions) {
            maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        // This is `useProxy` again, but we need to check `proxyURl` directly for TypeScripts's flow analysis.
        if (proxyUrl && proxyUrl.hostname) {
            const agentOptions = {
                maxSockets,
                keepAlive: this._keepAlive,
                proxy: Object.assign(Object.assign({}, ((proxyUrl.username || proxyUrl.password) && {
                    proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
                })), { host: proxyUrl.hostname, port: proxyUrl.port })
            };
            let tunnelAgent;
            const overHttps = proxyUrl.protocol === 'https:';
            if (usingSsl) {
                tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
            }
            else {
                tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
            }
            agent = tunnelAgent(agentOptions);
            this._proxyAgent = agent;
        }
        // if reusing agent across request and tunneling agent isn't assigned create a new agent
        if (this._keepAlive && !agent) {
            const options = { keepAlive: this._keepAlive, maxSockets };
            agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
            this._agent = agent;
        }
        // if not using private agent and tunnel agent isn't setup then use global agent
        if (!agent) {
            agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
            // we don't want to set NODE_TLS_REJECT_UNAUTHORIZED=0 since that will affect request for entire process
            // http.RequestOptions doesn't expose a way to modify RequestOptions.agent.options
            // we have to cast it to any and change it directly
            agent.options = Object.assign(agent.options || {}, {
                rejectUnauthorized: false
            });
        }
        return agent;
    }
    _performExponentialBackoff(retryNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
            const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
            return new Promise(resolve => setTimeout(() => resolve(), ms));
        });
    }
    _processResponse(res, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const statusCode = res.message.statusCode || 0;
                const response = {
                    statusCode,
                    result: null,
                    headers: {}
                };
                // not found leads to null obj returned
                if (statusCode === HttpCodes.NotFound) {
                    resolve(response);
                }
                // get the result from the body
                function dateTimeDeserializer(key, value) {
                    if (typeof value === 'string') {
                        const a = new Date(value);
                        if (!isNaN(a.valueOf())) {
                            return a;
                        }
                    }
                    return value;
                }
                let obj;
                let contents;
                try {
                    contents = yield res.readBody();
                    if (contents && contents.length > 0) {
                        if (options && options.deserializeDates) {
                            obj = JSON.parse(contents, dateTimeDeserializer);
                        }
                        else {
                            obj = JSON.parse(contents);
                        }
                        response.result = obj;
                    }
                    response.headers = res.message.headers;
                }
                catch (err) {
                    // Invalid resource (contents not json);  leaving result obj null
                }
                // note that 3xx redirects are handled by the http layer.
                if (statusCode > 299) {
                    let msg;
                    // if exception/error in body, attempt to get better error
                    if (obj && obj.message) {
                        msg = obj.message;
                    }
                    else if (contents && contents.length > 0) {
                        // it may be the case that the exception is in the body message as string
                        msg = contents;
                    }
                    else {
                        msg = `Failed request: (${statusCode})`;
                    }
                    const err = new HttpClientError(msg, statusCode);
                    err.result = response.result;
                    reject(err);
                }
                else {
                    resolve(response);
                }
            }));
        });
    }
}
exports.HttpClient = HttpClient;
const lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9835:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkBypass = exports.getProxyUrl = void 0;
function getProxyUrl(reqUrl) {
    const usingSsl = reqUrl.protocol === 'https:';
    if (checkBypass(reqUrl)) {
        return undefined;
    }
    const proxyVar = (() => {
        if (usingSsl) {
            return process.env['https_proxy'] || process.env['HTTPS_PROXY'];
        }
        else {
            return process.env['http_proxy'] || process.env['HTTP_PROXY'];
        }
    })();
    if (proxyVar) {
        return new URL(proxyVar);
    }
    else {
        return undefined;
    }
}
exports.getProxyUrl = getProxyUrl;
function checkBypass(reqUrl) {
    if (!reqUrl.hostname) {
        return false;
    }
    const noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
    if (!noProxy) {
        return false;
    }
    // Determine the request port
    let reqPort;
    if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
    }
    else if (reqUrl.protocol === 'http:') {
        reqPort = 80;
    }
    else if (reqUrl.protocol === 'https:') {
        reqPort = 443;
    }
    // Format the request hostname and hostname with port
    const upperReqHosts = [reqUrl.hostname.toUpperCase()];
    if (typeof reqPort === 'number') {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
    }
    // Compare request host against noproxy
    for (const upperNoProxyItem of noProxy
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x)) {
        if (upperReqHosts.some(x => x === upperNoProxyItem)) {
            return true;
        }
    }
    return false;
}
exports.checkBypass = checkBypass;
//# sourceMappingURL=proxy.js.map

/***/ }),

/***/ 9809:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

// Licensed to the Apache Software Foundation (ASF) under one or more
// contributor license agreements.  See the NOTICE file distributed with
// this work for additional information regarding copyright ownership.
// The ASF licenses this file to You under the Apache License, Version 2.0
// (the "License"); you may not use this file except in compliance with
// the License.  You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var _ = __nccwpck_require__(5067),
    util = __nccwpck_require__(3837);

var WARNING = 'Validator API is deprecated. Please use the type API instead.';
Validator = util.deprecate(Validator, WARNING);
ProtocolValidator = util.deprecate(ProtocolValidator, WARNING);

var AvroSpec = {
  PrimitiveTypes: ['null', 'boolean', 'int', 'long', 'float', 'double', 'bytes', 'string'],
  ComplexTypes: ['record', 'enum', 'array', 'map', 'union', 'fixed']
};
AvroSpec.Types = AvroSpec.PrimitiveTypes.concat(AvroSpec.ComplexTypes);

var InvalidSchemaError = function(msg) { return new Error('InvalidSchemaError: ' + msg); };
var InvalidProtocolError = function(msg) { return new Error('InvalidProtocolError: ' + msg); };
var ValidationError = function(msg) { return new Error('ValidationError: ' + msg); };
var ProtocolValidationError = function(msg) { return new Error('ProtocolValidationError: ' + msg); };


function Record(name, namespace, fields) {
  function validateArgs(name, namespace, fields) {
    if (!_.isString(name)) {
      throw new InvalidSchemaError('Record name must be string');
    }

    if (!_.isNull(namespace) && !_.isUndefined(namespace) && !_.isString(namespace)) {
      throw new InvalidSchemaError('Record namespace must be string or null');
    }

    if (!_.isArray(fields)) {
      throw new InvalidSchemaError('Record name must be string');
    }
  }

  validateArgs(name, namespace, fields);

  this.name = name;
  this.namespace = namespace;
  this.fields = fields;
}

function makeFullyQualifiedTypeName(schema, namespace) {
  var typeName = null;
  if (_.isString(schema)) {
    typeName = schema;
  } else if (_.isObject(schema)) {
    if (_.isString(schema.namespace)) {
      namespace = schema.namespace;
    }
    if (_.isString(schema.name)) {
      typeName = schema.name;
    } else if (_.isString(schema.type)) {
      typeName = schema.type;
    }
  } else {
    throw new InvalidSchemaError('unable to determine fully qualified type name from schema ' + JSON.stringify(schema) + ' in namespace ' + namespace);
  }

  if (!_.isString(typeName)) {
    throw new InvalidSchemaError('unable to determine type name from schema ' + JSON.stringify(schema) + ' in namespace ' + namespace);
  }

  if (typeName.indexOf('.') !== -1) {
    return typeName;
  } else if (_.contains(AvroSpec.PrimitiveTypes, typeName)) {
    return typeName;
  } else if (_.isString(namespace)) {
    return namespace + '.' + typeName;
  } else {
    return typeName;
  }
}

function Union(typeSchemas, namespace) {
  this.branchNames = function() {
    return _.map(typeSchemas, function(typeSchema) { return makeFullyQualifiedTypeName(typeSchema, namespace); });
  };

  function validateArgs(typeSchemas) {
    if (!_.isArray(typeSchemas) || _.isEmpty(typeSchemas)) {
      throw new InvalidSchemaError('Union must have at least 1 branch');
    }
  }

  validateArgs(typeSchemas);

  this.typeSchemas = typeSchemas;
  this.namespace = namespace;
}

function Enum(symbols) {

  function validateArgs(symbols) {
    if (!_.isArray(symbols)) {
      throw new InvalidSchemaError('Enum must have array of symbols, got ' + JSON.stringify(symbols));
    }
    if (!_.all(symbols, function(symbol) { return _.isString(symbol); })) {
      throw new InvalidSchemaError('Enum symbols must be strings, got ' + JSON.stringify(symbols));
    }
  }

  validateArgs(symbols);

  this.symbols = symbols;
}

function AvroArray(itemSchema) {

  function validateArgs(itemSchema) {
    if (_.isNull(itemSchema) || _.isUndefined(itemSchema)) {
      throw new InvalidSchemaError('Array "items" schema should not be null or undefined');
    }
  }

  validateArgs(itemSchema);

  this.itemSchema = itemSchema;
}

function Map(valueSchema) {

  function validateArgs(valueSchema) {
    if (_.isNull(valueSchema) || _.isUndefined(valueSchema)) {
      throw new InvalidSchemaError('Map "values" schema should not be null or undefined');
    }
  }

  validateArgs(valueSchema);

  this.valueSchema = valueSchema;
}

function Field(name, schema) {
  function validateArgs(name, schema) {
    if (!_.isString(name)) {
      throw new InvalidSchemaError('Field name must be string');
    }
  }

  this.name = name;
  this.schema = schema;
}

function Primitive(type) {
  function validateArgs(type) {
    if (!_.isString(type)) {
      throw new InvalidSchemaError('Primitive type name must be a string');
    }

    if (!_.contains(AvroSpec.PrimitiveTypes, type)) {
      throw new InvalidSchemaError('Primitive type must be one of: ' + JSON.stringify(AvroSpec.PrimitiveTypes) + '; got ' + type);
    }
  }

  validateArgs(type);

  this.type = type;
}

function Validator(schema, namespace, namedTypes) {
  this.validate = function(obj) {
    return _validate(this.schema, obj);
  };

  var _validate = function(schema, obj) {
    if (schema instanceof Record) {
      return _validateRecord(schema, obj);
    } else if (schema instanceof Union) {
      return _validateUnion(schema, obj);
    } else if (schema instanceof Enum) {
      return _validateEnum(schema, obj);
    } else if (schema instanceof AvroArray) {
      return _validateArray(schema, obj);
    } else if (schema instanceof Map) {
      return _validateMap(schema, obj);
    } else if (schema instanceof Primitive) {
      return _validatePrimitive(schema, obj);
    } else {
      throw new InvalidSchemaError('validation not yet implemented: ' + JSON.stringify(schema));
    }
  };

  var _validateRecord = function(schema, obj) {
    if (!_.isObject(obj) || _.isArray(obj)) {
      throw new ValidationError('Expected record Javascript type to be non-array object, got ' + JSON.stringify(obj));
    }

    var schemaFieldNames = _.pluck(schema.fields, 'name').sort();
    var objFieldNames = _.keys(obj).sort();
    if (!_.isEqual(schemaFieldNames, objFieldNames)) {
      throw new ValidationError('Expected record fields ' + JSON.stringify(schemaFieldNames) + '; got ' + JSON.stringify(objFieldNames));
    }

    return _.all(schema.fields, function(field) {
      return _validate(field.schema, obj[field.name]);
    });
  };

  var _validateUnion = function(schema, obj) {
    if (_.isObject(obj)) {
      if (_.isArray(obj)) {
        throw new ValidationError('Expected union Javascript type to be non-array object (or null), got ' + JSON.stringify(obj));
      } else if (_.size(obj) !== 1) {
        throw new ValidationError('Expected union Javascript object to be object with exactly 1 key (or null), got ' + JSON.stringify(obj));
      } else {
        var unionBranch = _.keys(obj)[0];
        if (unionBranch === "") {
          throw new ValidationError('Expected union Javascript object to contain non-empty string branch, got ' + JSON.stringify(obj));
        }
        if (_.contains(schema.branchNames(), unionBranch)) {
          return true;
        } else {
          throw new ValidationError('Expected union branch to be one of ' + JSON.stringify(schema.branchNames()) + '; got ' + JSON.stringify(unionBranch));
        }
      }
    } else if (_.isNull(obj)) {
      if (_.contains(schema.branchNames(), 'null')) {
        return true;
      } else {
        throw new ValidationError('Expected union branch to be one of ' + JSON.stringify(schema.branchNames()) + '; got ' + JSON.stringify(obj));
      }
    } else {
      throw new ValidationError('Expected union Javascript object to be non-array object of size 1 or null, got ' + JSON.stringify(obj));
    }
  };

  var _validateEnum = function(schema, obj) {
    if (_.isString(obj)) {
      if (_.contains(schema.symbols, obj)) {
        return true;
      } else {
        throw new ValidationError('Expected enum value to be one of ' + JSON.stringify(schema.symbols) + '; got ' + JSON.stringify(obj));
      }
    } else {
      throw new ValidationError('Expected enum Javascript object to be string, got ' + JSON.stringify(obj));
    }
  };

  var _validateArray = function(schema, obj) {
    if (_.isArray(obj)) {
      return _.all(obj, function(member) { return _validate(schema.itemSchema, member); });
    } else {
      throw new ValidationError('Expected array Javascript object to be array, got ' + JSON.stringify(obj));
    }
  };

  var _validateMap = function(schema, obj) {
    if (_.isObject(obj) && !_.isArray(obj)) {
      return _.all(obj, function(value) { return _validate(schema.valueSchema, value); });
    } else if (_.isArray(obj)) {
      throw new ValidationError('Expected map Javascript object to be non-array object, got array ' + JSON.stringify(obj));
    } else {
      throw new ValidationError('Expected map Javascript object to be non-array object, got ' + JSON.stringify(obj));
    }
  };

  var _validatePrimitive = function(schema, obj) {
    switch (schema.type) {
      case 'null':
        if (_.isNull(obj) || _.isUndefined(obj)) {
          return true;
        } else {
          throw new ValidationError('Expected Javascript null or undefined for Avro null, got ' + JSON.stringify(obj));
        }
        break;
      case 'boolean':
        if (_.isBoolean(obj)) {
          return true;
        } else {
          throw new ValidationError('Expected Javascript boolean for Avro boolean, got ' + JSON.stringify(obj));
        }
        break;
      case 'int':
        if (_.isNumber(obj) && Math.floor(obj) === obj && Math.abs(obj) <= Math.pow(2, 31)) {
          return true;
        } else {
          throw new ValidationError('Expected Javascript int32 number for Avro int, got ' + JSON.stringify(obj));
        }
        break;
      case 'long':
        if (_.isNumber(obj) && Math.floor(obj) === obj && Math.abs(obj) <= Math.pow(2, 63)) {
          return true;
        } else {
          throw new ValidationError('Expected Javascript int64 number for Avro long, got ' + JSON.stringify(obj));
        }
        break;
      case 'float':
        if (_.isNumber(obj)) { // TODO: handle NaN?
          return true;
        } else {
          throw new ValidationError('Expected Javascript float number for Avro float, got ' + JSON.stringify(obj));
        }
        break;
      case 'double':
        if (_.isNumber(obj)) { // TODO: handle NaN?
          return true;
        } else {
          throw new ValidationError('Expected Javascript double number for Avro double, got ' + JSON.stringify(obj));
        }
        break;
      case 'bytes':
        throw new InvalidSchemaError('not yet implemented: ' + schema.type);
      case 'string':
        if (_.isString(obj)) { // TODO: handle NaN?
          return true;
        } else {
          throw new ValidationError('Expected Javascript string for Avro string, got ' + JSON.stringify(obj));
        }
        break;
      default:
        throw new InvalidSchemaError('unrecognized primitive type: ' + schema.type);
    }
  };

  // TODO: namespace handling is rudimentary. multiple namespaces within a certain nested schema definition
  // are probably buggy.
  var _namedTypes = namedTypes || {};
  var _saveNamedType = function(fullyQualifiedTypeName, schema) {
    if (_.has(_namedTypes, fullyQualifiedTypeName)) {
      if (!_.isEqual(_namedTypes[fullyQualifiedTypeName], schema)) {
        throw new InvalidSchemaError('conflicting definitions for type ' + fullyQualifiedTypeName + ': ' + JSON.stringify(_namedTypes[fullyQualifiedTypeName]) + ' and ' + JSON.stringify(schema));
      }
    } else {
      _namedTypes[fullyQualifiedTypeName] = schema;
    }
  };

  var _lookupTypeByFullyQualifiedName = function(fullyQualifiedTypeName) {
    if (_.has(_namedTypes, fullyQualifiedTypeName)) {
      return _namedTypes[fullyQualifiedTypeName];
    } else {
      return null;
    }
  };

  var _parseNamedType = function(schema, namespace) {
    if (_.contains(AvroSpec.PrimitiveTypes, schema)) {
      return new Primitive(schema);
    } else if (!_.isNull(_lookupTypeByFullyQualifiedName(makeFullyQualifiedTypeName(schema, namespace)))) {
      return _lookupTypeByFullyQualifiedName(makeFullyQualifiedTypeName(schema, namespace));
    } else {
      throw new InvalidSchemaError('unknown type name: ' + JSON.stringify(schema) + '; known type names are ' + JSON.stringify(_.keys(_namedTypes)));
    }
  };

  var _parseSchema = function(schema, parentSchema, namespace) {
    if (_.isNull(schema) || _.isUndefined(schema)) {
      throw new InvalidSchemaError('schema is null, in parentSchema: ' + JSON.stringify(parentSchema));
    } else if (_.isString(schema)) {
      return _parseNamedType(schema, namespace);
    } else if (_.isObject(schema) && !_.isArray(schema)) {
      if (schema.type === 'record') {
        var newRecord = new Record(schema.name, schema.namespace, _.map(schema.fields, function(field) {
          return new Field(field.name, _parseSchema(field.type, schema, schema.namespace || namespace));
        }));
        _saveNamedType(makeFullyQualifiedTypeName(schema, namespace), newRecord);
        return newRecord;
      } else if (schema.type === 'enum') {
        if (_.has(schema, 'symbols')) {
          var newEnum = new Enum(schema.symbols);
          _saveNamedType(makeFullyQualifiedTypeName(schema, namespace), newEnum);
          return newEnum;
        } else {
          throw new InvalidSchemaError('enum must specify symbols, got ' + JSON.stringify(schema));
        }
      } else if (schema.type === 'array') {
        if (_.has(schema, 'items')) {
          return new AvroArray(_parseSchema(schema.items, schema, namespace));
        } else {
          throw new InvalidSchemaError('array must specify "items" schema, got ' + JSON.stringify(schema));
        }
      } else if (schema.type === 'map') {
        if (_.has(schema, 'values')) {
          return new Map(_parseSchema(schema.values, schema, namespace));
        } else {
          throw new InvalidSchemaError('map must specify "values" schema, got ' + JSON.stringify(schema));
        }
      } else if (_.has(schema, 'type') && _.contains(AvroSpec.PrimitiveTypes, schema.type)) {
        return _parseNamedType(schema.type, namespace);
      } else {
        throw new InvalidSchemaError('not yet implemented: ' + schema.type);
      }
    } else if (_.isArray(schema)) {
      if (_.isEmpty(schema)) {
        throw new InvalidSchemaError('unions must have at least 1 branch');
      }
      var branchTypes = _.map(schema, function(branchType) { return _parseSchema(branchType, schema, namespace); });
      return new Union(branchTypes, namespace);
    } else {
      throw new InvalidSchemaError('unexpected Javascript type for schema: ' + (typeof schema));
    }
  };

  this.rawSchema = schema;
  this.schema = _parseSchema(schema, null, namespace);
}

Validator.validate = function(schema, obj) {
  return (new Validator(schema)).validate(obj);
}

function ProtocolValidator(protocol) {
  this.validate = function(typeName, obj) {
    var fullyQualifiedTypeName = makeFullyQualifiedTypeName(typeName, protocol.namespace);
    if (!_.has(_typeSchemaValidators, fullyQualifiedTypeName)) {
      throw new ProtocolValidationError('Protocol does not contain definition for type ' + JSON.stringify(fullyQualifiedTypeName) + ' (fully qualified from input "' + typeName + '"); known types are ' + JSON.stringify(_.keys(_typeSchemaValidators)));
    }
    return _typeSchemaValidators[fullyQualifiedTypeName].validate(obj);
  };

  var _typeSchemaValidators = {};
  var _initSchemaValidators = function(protocol) {
    var namedTypes = {};
    if (!_.has(protocol, 'protocol') || !_.isString(protocol.protocol)) {
      throw new InvalidProtocolError('Protocol must contain a "protocol" attribute with a string value');
    }
    if (_.isArray(protocol.types)) {
      _.each(protocol.types, function(typeSchema) {
        var schemaValidator = new Validator(typeSchema, protocol.namespace, namedTypes);
        var fullyQualifiedTypeName = makeFullyQualifiedTypeName(typeSchema, protocol.namespace);
        _typeSchemaValidators[fullyQualifiedTypeName] = schemaValidator;
      });
    }
  };

  _initSchemaValidators(protocol);
}

ProtocolValidator.validate = function(protocol, typeName, obj) {
  return (new ProtocolValidator(protocol)).validate(typeName, obj);
};

if (true) {
  exports.Validator = Validator;
  exports.ProtocolValidator = ProtocolValidator;
}


/***/ }),

/***/ 2651:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/* jshint node: true */

/**
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */



var protocols = __nccwpck_require__(968),
    schemas = __nccwpck_require__(7985),
    utils = __nccwpck_require__(1333),
    fs = __nccwpck_require__(7147),
    stream = __nccwpck_require__(2781),
    util = __nccwpck_require__(3837),
    path = __nccwpck_require__(1017),
    zlib = __nccwpck_require__(9796);

// Type of Avro header.
var HEADER_TYPE = schemas.createType({
  type: 'record',
  name: 'org.apache.avro.file.Header',
  fields : [
    {name: 'magic', type: {type: 'fixed', name: 'Magic', size: 4}},
    {name: 'meta', type: {type: 'map', values: 'bytes'}},
    {name: 'sync', type: {type: 'fixed', name: 'Sync', size: 16}}
  ]
});

// Type of each block.
var BLOCK_TYPE = schemas.createType({
  type: 'record',
  name: 'org.apache.avro.file.Block',
  fields : [
    {name: 'count', type: 'long'},
    {name: 'data', type: 'bytes'},
    {name: 'sync', type: {type: 'fixed', name: 'Sync', size: 16}}
  ]
});

// Used to toBuffer each block, without having to copy all its data.
var LONG_TYPE = schemas.createType('long');

// First 4 bytes of an Avro object container file.
var MAGIC_BYTES = Buffer.from('Obj\x01');

// Convenience.
var f = util.format;
var Tap = utils.Tap;


/**
 * Parse a schema and return the corresponding type.
 *
 */
function parse(schema, opts) {
  var attrs = loadSchema(schema);
  return attrs.protocol ?
    protocols.createProtocol(attrs, opts) :
    schemas.createType(attrs, opts);
}


/**
 * Duplex stream for decoding fragments.
 *
 */
function RawDecoder(schema, opts) {
  opts = opts || {};

  var decode = opts.decode === undefined ? true : !!opts.decode;
  stream.Duplex.call(this, {
    readableObjectMode: decode,
    allowHalfOpen: false
  });
  // Somehow setting this to false only closes the writable side after the
  // readable side ends, while we need the other way. So we do it manually.

  this._type = parse(schema);
  this._tap = new Tap(Buffer.alloc(0));
  this._needPush = false;
  this._readValue = createReader(decode, this._type);
  this._finished = false;

  this.on('finish', function () {
    this._finished = true;
    this._read();
  });
}
util.inherits(RawDecoder, stream.Duplex);

RawDecoder.prototype._write = function (chunk, encoding, cb) {
  var tap = this._tap;
  tap.buf = Buffer.concat([tap.buf.slice(tap.pos), chunk]);
  tap.pos = 0;
  if (this._needPush) {
    this._needPush = false;
    this._read();
  }
  cb();
};

RawDecoder.prototype._read = function () {
  var tap = this._tap;
  var pos = tap.pos;
  var val = this._readValue(tap);
  if (tap.isValid()) {
    this.push(val);
  } else if (!this._finished) {
    tap.pos = pos;
    this._needPush = true;
  } else {
    this.push(null);
  }
};


/**
 * Duplex stream for decoding object container files.
 *
 */
function BlockDecoder(opts) {
  opts = opts || {};

  var decode = opts.decode === undefined ? true : !!opts.decode;
  stream.Duplex.call(this, {
    allowHalfOpen: true, // For async decompressors.
    readableObjectMode: decode
  });

  this._type = null;
  this._codecs = opts.codecs;
  this._parseOpts = opts.parseOpts || {};
  this._tap = new Tap(Buffer.alloc(0));
  this._blockTap = new Tap(Buffer.alloc(0));
  this._syncMarker = null;
  this._readValue = null;
  this._decode = decode;
  this._queue = new utils.OrderedQueue();
  this._decompress = null; // Decompression function.
  this._index = 0; // Next block index.
  this._pending = 0; // Number of blocks undergoing decompression.
  this._needPush = false;
  this._finished = false;

  this.on('finish', function () {
    this._finished = true;
    if (!this._pending) {
      this.push(null);
    }
  });
}
util.inherits(BlockDecoder, stream.Duplex);

BlockDecoder.getDefaultCodecs = function () {
  return {
    'null': function (buf, cb) { cb(null, buf); },
    'deflate': zlib.inflateRaw
  };
};

BlockDecoder.prototype._decodeHeader = function () {
  var tap = this._tap;
  var header = HEADER_TYPE._read(tap);
  if (!tap.isValid()) {
    // Wait until more data arrives.
    return false;
  }

  if (!MAGIC_BYTES.equals(header.magic)) {
    this.emit('error', new Error('invalid magic bytes'));
    return;
  }

  var codec = (header.meta['avro.codec'] || 'null').toString();
  this._decompress = (this._codecs || BlockDecoder.getDefaultCodecs())[codec];
  if (!this._decompress) {
    this.emit('error', new Error(f('unknown codec: %s', codec)));
    return;
  }

  try {
    var schema = JSON.parse(header.meta['avro.schema'].toString());
    this._type = parse(schema, this._parseOpts);
  } catch (err) {
    this.emit('error', err);
    return;
  }

  this._readValue = createReader(this._decode, this._type);
  this._syncMarker = header.sync;
  this.emit('metadata', this._type, codec, header);
  return true;
};

BlockDecoder.prototype._write = function (chunk, encoding, cb) {
  var tap = this._tap;
  tap.buf = Buffer.concat([tap.buf, chunk]);
  tap.pos = 0;

  if (!this._decodeHeader()) {
    process.nextTick(cb);
    return;
  }

  // We got the header, switch to block decoding mode. Also, call it directly
  // in case we already have all the data (in which case `_write` wouldn't get
  // called anymore).
  this._write = this._writeChunk;
  this._write(Buffer.alloc(0), encoding, cb);
};

BlockDecoder.prototype._writeChunk = function (chunk, encoding, cb) {
  var tap = this._tap;
  tap.buf = Buffer.concat([tap.buf.slice(tap.pos), chunk]);
  tap.pos = 0;

  var block;
  while ((block = tryReadBlock(tap))) {
    if (!this._syncMarker.equals(block.sync)) {
      cb(new Error('invalid sync marker'));
      return;
    }
    this._decompress(block.data, this._createBlockCallback());
  }

  cb();
};

BlockDecoder.prototype._createBlockCallback = function () {
  var self = this;
  var index = this._index++;
  this._pending++;

  return function (err, data) {
    if (err) {
      self.emit('error', err);
      return;
    }
    self._pending--;
    self._queue.push(new BlockData(index, data));
    if (self._needPush) {
      self._needPush = false;
      self._read();
    }
  };
};

BlockDecoder.prototype._read = function () {
  var tap = this._blockTap;
  if (tap.pos >= tap.buf.length) {
    var data = this._queue.pop();
    if (!data) {
      if (this._finished && !this._pending) {
        this.push(null);
      } else {
        this._needPush = true;
      }
      return; // Wait for more data.
    }
    tap.buf = data.buf;
    tap.pos = 0;
  }

  this.push(this._readValue(tap)); // The read is guaranteed valid.
};


/**
 * Duplex stream for encoding.
 *
 */
function RawEncoder(schema, opts) {
  opts = opts || {};

  stream.Transform.call(this, {
    writableObjectMode: true,
    allowHalfOpen: false
  });

  this._type = parse(schema);
  this._writeValue = function (tap, val) {
    try {
      this._type._write(tap, val);
    } catch (err) {
      this.emit('error', err);
    }
  };
  this._tap = new Tap(Buffer.alloc(opts.batchSize || 65536));
}
util.inherits(RawEncoder, stream.Transform);

RawEncoder.prototype._transform = function (val, encoding, cb) {
  var tap = this._tap;
  var buf = tap.buf;
  var pos = tap.pos;

  this._writeValue(tap, val);
  if (!tap.isValid()) {
    if (pos) {
      // Emit any valid data.
      this.push(copyBuffer(tap.buf, 0, pos));
    }
    var len = tap.pos - pos;
    if (len > buf.length) {
      // Not enough space for last written object, need to resize.
      tap.buf = Buffer.alloc(2 * len);
    }
    tap.pos = 0;
    this._writeValue(tap, val); // Rewrite last failed write.
  }

  cb();
};

RawEncoder.prototype._flush = function (cb) {
  var tap = this._tap;
  var pos = tap.pos;
  if (pos) {
    // This should only ever be false if nothing is written to the stream.
    this.push(tap.buf.slice(0, pos));
  }
  cb();
};


/**
 * Duplex stream to write object container files.
 *
 * @param schema
 * @param opts {Object}
 *
 *  + `blockSize`, uncompressed.
 *  + `codec`
 *  + `codecs`
 *  + `noCheck`
 *  + `omitHeader`, useful to append to an existing block file.
 *
 */
function BlockEncoder(schema, opts) {
  opts = opts || {};

  stream.Duplex.call(this, {
    allowHalfOpen: true, // To support async compressors.
    writableObjectMode: true
  });

  var obj, type;
  if (schema instanceof schemas.types.Type) {
    type = schema;
    schema = undefined;
  } else {
    // Keep full schema to be able to write it to the header later.
    obj = loadSchema(schema);
    type = schemas.createType(obj);
    schema = JSON.stringify(obj);
  }

  this._schema = schema;
  this._type = type;
  this._writeValue = function (tap, val) {
    try {
      this._type._write(tap, val);
    } catch (err) {
      this.emit('error', err);
    }
  };
  this._blockSize = opts.blockSize || 65536;
  this._tap = new Tap(Buffer.alloc(this._blockSize));
  this._codecs = opts.codecs;
  this._codec = opts.codec || 'null';
  this._compress = null;
  this._omitHeader = opts.omitHeader || false;
  this._blockCount = 0;
  this._syncMarker = opts.syncMarker || new utils.Lcg().nextBuffer(16);
  this._queue = new utils.OrderedQueue();
  this._pending = 0;
  this._finished = false;
  this._needPush = false;
  this._downstream = null;

  this.on('finish', function () {
    this._finished = true;
    if (this._blockCount) {
      this._flushChunk();
    }
  });
}
util.inherits(BlockEncoder, stream.Duplex);

BlockEncoder.getDefaultCodecs = function () {
  return {
    'null': function (buf, cb) { cb(null, buf); },
    'deflate': zlib.deflateRaw
  };
};

BlockEncoder.prototype.getDownstream = function () {
  return this._downstream;
};

BlockEncoder.prototype._write = function (val, encoding, cb) {
  var codec = this._codec;
  this._compress = (this._codecs || BlockEncoder.getDefaultCodecs())[codec];
  if (!this._compress) {
    this.emit('error', new Error(f('unsupported codec: %s', codec)));
    return;
  }

  if (!this._omitHeader) {
    var meta = {
      'avro.schema': Buffer.from(this._schema || this._type.getSchema()),
      'avro.codec': Buffer.from(this._codec)
    };
    var Header = HEADER_TYPE.getRecordConstructor();
    var header = new Header(MAGIC_BYTES, meta, this._syncMarker);
    this.push(header.$toBuffer());
  }

  this._write = this._writeChunk;
  this._write(val, encoding, cb);
};

BlockEncoder.prototype._writeChunk = function (val, encoding, cb) {
  var tap = this._tap;
  var pos = tap.pos;

  this._writeValue(tap, val);
  if (!tap.isValid()) {
    if (pos) {
      this._flushChunk(pos);
    }
    var len = tap.pos - pos;
    if (len > this._blockSize) {
      // Not enough space for last written object, need to resize.
      this._blockSize = len * 2;
    }
    tap.buf = Buffer.alloc(this._blockSize);
    tap.pos = 0;
    this._writeValue(tap, val); // Rewrite last failed write.
  }
  this._blockCount++;

  cb();
};

BlockEncoder.prototype._flushChunk = function (pos) {
  var tap = this._tap;
  pos = pos || tap.pos;
  this._compress(tap.buf.slice(0, pos), this._createBlockCallback());
  this._blockCount = 0;
};

BlockEncoder.prototype._read = function () {
  var self = this;
  var data = this._queue.pop();
  if (!data) {
    if (this._finished && !this._pending) {
      process.nextTick(function () { self.push(null); });
    } else {
      this._needPush = true;
    }
    return;
  }

  this.push(LONG_TYPE.toBuffer(data.count, true));
  this.push(LONG_TYPE.toBuffer(data.buf.length, true));
  this.push(data.buf);
  this.push(this._syncMarker);
};

BlockEncoder.prototype._createBlockCallback = function () {
  var self = this;
  var index = this._index++;
  var count = this._blockCount;
  this._pending++;

  return function (err, data) {
    if (err) {
      self.emit('error', err);
      return;
    }
    self._pending--;
    self._queue.push(new BlockData(index, data, count));
    if (self._needPush) {
      self._needPush = false;
      self._read();
    }
  };
};


/**
 * Extract a container file's header synchronously.
 *
 */
function extractFileHeader(path, opts) {
  opts = opts || {};

  var decode = opts.decode === undefined ? true : !!opts.decode;
  var size = Math.max(opts.size || 4096, 4);
  var fd = fs.openSync(path, 'r');
  var buf = Buffer.alloc(size);
  var pos = 0;
  var tap = new Tap(buf);
  var header = null;

  while (pos < 4) {
    // Make sure we have enough to check the magic bytes.
    pos += fs.readSync(fd, buf, pos, size - pos);
  }
  if (MAGIC_BYTES.equals(buf.slice(0, 4))) {
    do {
      header = HEADER_TYPE._read(tap);
    } while (!isValid());
    if (decode !== false) {
      var meta = header.meta;
      meta['avro.schema'] = JSON.parse(meta['avro.schema'].toString());
      if (meta['avro.codec'] !== undefined) {
        meta['avro.codec'] = meta['avro.codec'].toString();
      }
    }
  }
  fs.closeSync(fd);
  return header;

  function isValid() {
    if (tap.isValid()) {
      return true;
    }
    var len = 2 * tap.buf.length;
    var buf = Buffer.alloc(len);
    len = fs.readSync(fd, buf, 0, len);
    tap.buf = Buffer.concat([tap.buf, buf]);
    tap.pos = 0;
    return false;
  }
}


/**
 * Readable stream of records from a local Avro file.
 *
 */
function createFileDecoder(path, opts) {
  return fs.createReadStream(path).pipe(new BlockDecoder(opts));
}


/**
 * Writable stream of records to a local Avro file.
 *
 */
function createFileEncoder(path, schema, opts) {
  var encoder = new BlockEncoder(schema, opts);
  encoder._downstream = encoder.pipe(fs.createWriteStream(path, {defaultEncoding: 'binary'}));
  return encoder;
}


// Helpers.

/**
 * An indexed block.
 *
 * This can be used to preserve block order since compression and decompression
 * can cause some some blocks to be returned out of order. The count is only
 * used when encoding.
 *
 */
function BlockData(index, buf, count) {
  this.index = index;
  this.buf = buf;
  this.count = count | 0;
}

/**
 * Maybe get a block.
 *
 */
function tryReadBlock(tap) {
  var pos = tap.pos;
  var block = BLOCK_TYPE._read(tap);
  if (!tap.isValid()) {
    tap.pos = pos;
    return null;
  }
  return block;
}

/**
 * Create bytes consumer, either reading or skipping records.
 *
 */
function createReader(decode, type) {
  if (decode) {
    return function (tap) { return type._read(tap); };
  } else {
    return (function (skipper) {
      return function (tap) {
        var pos = tap.pos;
        skipper(tap);
        return tap.buf.slice(pos, tap.pos);
      };
    })(type._skip);
  }
}

/**
 * Copy a buffer.
 *
 * This avoids having to create a slice of the original buffer.
 *
 */
function copyBuffer(buf, pos, len) {
  var copy = Buffer.alloc(len);
  buf.copy(copy, 0, pos, pos + len);
  return copy;
}

/**
 * Try to load a schema.
 *
 * This method will attempt to load schemas from a file if the schema passed is
 * a string which isn't valid JSON and contains at least one slash.
 *
 */
function loadSchema(schema) {
  var obj;
  if (typeof schema == 'string') {
    try {
      obj = JSON.parse(schema);
    } catch (err) {
      if (~schema.indexOf(path.sep)) {
        // This can't be a valid name, so we interpret is as a filepath. This
        // makes is always feasible to read a file, independent of its name
        // (i.e. even if its name is valid JSON), by prefixing it with `./`.
        obj = JSON.parse(fs.readFileSync(schema));
      }
    }
  }
  if (obj === undefined) {
    obj = schema;
  }
  return obj;
}


module.exports = {
  HEADER_TYPE: HEADER_TYPE, // For tests.
  MAGIC_BYTES: MAGIC_BYTES, // Idem.
  parse: parse,
  createFileDecoder: createFileDecoder,
  createFileEncoder: createFileEncoder,
  extractFileHeader: extractFileHeader,
  streams: {
    RawDecoder: RawDecoder,
    BlockDecoder: BlockDecoder,
    RawEncoder: RawEncoder,
    BlockEncoder: BlockEncoder
  }
};


/***/ }),

/***/ 8666:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/* jshint node: true */

/**
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */



/**
 * Main node.js entry point.
 *
 * See `etc/browser/avro.js` for the entry point used for browserify.
 *
 */

var files = __nccwpck_require__(2651),
    protocols = __nccwpck_require__(968),
    schemas = __nccwpck_require__(7985),
    deprecated = __nccwpck_require__(9809);


module.exports = {
  Type: schemas.Type,
  Protocol: protocols.Protocol,
  parse: files.parse,
  createFileDecoder: files.createFileDecoder,
  createFileEncoder: files.createFileEncoder,
  extractFileHeader: files.extractFileHeader,
  streams: files.streams,
  types: schemas.types,
  Validator: deprecated.Validator,
  ProtocolValidator: deprecated.ProtocolValidator
};


/***/ }),

/***/ 968:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/* jshint node: true */

/**
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */



/**
 * This module implements Avro's IPC/RPC logic.
 *
 * This is done the Node.js way, mimicking the `EventEmitter` class.
 *
 */

var schemas = __nccwpck_require__(7985),
    utils = __nccwpck_require__(1333),
    events = __nccwpck_require__(2361),
    stream = __nccwpck_require__(2781),
    util = __nccwpck_require__(3837);


var BOOLEAN_TYPE = schemas.createType('boolean');
var STRING_TYPE = schemas.createType('string');
var SYSTEM_ERROR_TYPE = schemas.createType(['string']);

var HANDSHAKE_REQUEST_TYPE = schemas.createType({
  namespace: 'org.apache.avro.ipc',
  name: 'HandshakeRequest',
  type: 'record',
  fields: [
    {name: 'clientHash', type: {name: 'MD5', type: 'fixed', size: 16}},
    {name: 'clientProtocol', type: ['null', 'string'], 'default': null},
    {name: 'serverHash', type: 'org.apache.avro.ipc.MD5'},
    {
      name: 'meta',
      type: ['null', {type: 'map', values: 'bytes'}],
      'default': null
    }
  ]
});

var HANDSHAKE_RESPONSE_TYPE = schemas.createType({
  namespace: 'org.apache.avro.ipc',
  name: 'HandshakeResponse',
  type: 'record',
  fields: [
    {
      name: 'match',
      type: {
        name: 'HandshakeMatch',
        type: 'enum',
        symbols: ['BOTH', 'CLIENT', 'NONE']
      }
    },
    {name: 'serverProtocol', type: ['null', 'string'], 'default': null},
    {
      name: 'serverHash',
      type: ['null', {name: 'MD5', type: 'fixed', size: 16}],
      'default': null
    },
    {
      name: 'meta',
      type: ['null', {type: 'map', values: 'bytes'}],
      'default': null
    }
  ]
});

var HandshakeRequest = HANDSHAKE_REQUEST_TYPE.getRecordConstructor();
var HandshakeResponse = HANDSHAKE_RESPONSE_TYPE.getRecordConstructor();
var Tap = utils.Tap;
var f = util.format;


/**
 * Protocol generation function.
 *
 * This should be used instead of the protocol constructor. The protocol's
 * constructor performs no logic to better support efficient protocol copy.
 *
 */
function createProtocol(attrs, opts) {
  opts = opts || {};

  var name = attrs.protocol;
  if (!name) {
    throw new Error('missing protocol name');
  }
  opts.namespace = attrs.namespace;
  if (opts.namespace && !~name.indexOf('.')) {
    name = f('%s.%s', opts.namespace, name);
  }

  if (attrs.types) {
    attrs.types.forEach(function (obj) { schemas.createType(obj, opts); });
  }
  var messages = {};
  if (attrs.messages) {
    Object.keys(attrs.messages).forEach(function (key) {
      messages[key] = new Message(key, attrs.messages[key], opts);
    });
  }

  return new Protocol(name, messages, opts.registry || {});
}

/**
 * An Avro protocol.
 *
 * It contains a cache for all remote protocols encountered by its emitters and
 * listeners. Note that a protocol can be listening to multiple listeners at a
 * given time. This can be a mix of stateful or stateless listeners.
 *
 */
function Protocol(name, messages, types, ptcl) {
  this._name = name;
  this._messages = messages;
  this._types = types;
  this._parent = ptcl;

  // Cache a string instead of the buffer to avoid retaining an entire slab.
  this._hashString = utils.getHash(this.toString()).toString('binary');

  // Listener callbacks. Note the prototype used for handlers when this is a
  // subprotocol. This lets us easily implement the desired fallback behavior.
  var self = this;
  this._handlers = Object.create(ptcl ? ptcl._handlers : null);
  this._onListenerCall = function (name, req, cb) {
    var handler = self._handlers[name];
    if (!handler) {
      cb(new Error(f('unsupported message: %s', name)));
    } else {
      handler.call(self, req, this, cb);
    }
  };

  // Resolvers are split since we want emitters to still be able to talk to
  // servers with more messages (which would be incompatible the other way).
  this._emitterResolvers = ptcl ? ptcl._emitterResolvers : {};
  this._listenerResolvers = ptcl ? ptcl._listenerResolvers : {};
}

Protocol.prototype.subprotocol = function () {
  return new Protocol(this._name, this._messages, this._types, this);
};

Protocol.prototype.emit = function (name, req, emitter, cb) {
  cb = cb || throwError; // To provide a more helpful error message.

  if (
    !(emitter instanceof MessageEmitter) ||
    emitter._ptcl._hashString !== this._hashString
  ) {
    asyncAvroCb(this, cb, 'invalid emitter');
    return;
  }

  var message = this._messages[name];
  if (!message) {
    asyncAvroCb(this, cb, f('unknown message: %s', name));
    return;
  }

  emitter._emit(message, req, cb);
};

Protocol.prototype.createEmitter = function (transport, opts, cb) {
  if (!cb && typeof opts == 'function') {
    cb = opts;
    opts = undefined;
  }

  var emitter;
  if (typeof transport == 'function') {
    emitter = new StatelessEmitter(this, transport, opts);
  } else {
    var readable, writable;
    if (isStream(transport)) {
      readable = writable = transport;
    } else {
      readable = transport.readable;
      writable = transport.writable;
    }
    emitter = new StatefulEmitter(this, readable, writable, opts);
  }
  if (cb) {
    emitter.once('eot', cb);
  }
  return emitter;
};

Protocol.prototype.on = function (name, handler) {
  if (!this._messages[name]) {
    throw new Error(f('unknown message: %s', name));
  }
  this._handlers[name] = handler;
  return this;
};

Protocol.prototype.createListener = function (transport, opts, cb) {
  if (!cb && typeof opts == 'function') {
    cb = opts;
    opts = undefined;
  }

  var listener;
  if (typeof transport == 'function') {
    listener = new StatelessListener(this, transport, opts);
  } else {
    var readable, writable;
    if (isStream(transport)) {
      readable = writable = transport;
    } else {
      readable = transport.readable;
      writable = transport.writable;
    }
    listener = new StatefulListener(this, readable, writable, opts);
  }
  if (cb) {
    listener.once('eot', cb);
  }
  return listener.on('_call', this._onListenerCall);
};

Protocol.prototype.getType = function (name) { return this._types[name]; };

Protocol.prototype.getName = function () { return this._name; };

Protocol.prototype.getMessages = function () { return this._messages; };

Protocol.prototype.toString = function () {
  var namedTypes = [];
  Object.keys(this._types).forEach(function (name) {
    var type = this._types[name];
    if (type.getName()) {
      namedTypes.push(type);
    }
  }, this);

  return schemas.stringify({
    protocol: this._name,
    types: namedTypes.length ? namedTypes : undefined,
    messages: this._messages
  });
};

Protocol.prototype.inspect = function () {
  return f('<Protocol %j>', this._name);
};

/**
 * Base message emitter class.
 *
 * See below for the two available variants.
 *
 */
function MessageEmitter(ptcl, opts) {
  events.EventEmitter.call(this);

  this._ptcl = ptcl;
  this._resolvers = ptcl._emitterResolvers;
  this._serverHashString = ptcl._hashString;
  this._idType = IdType.createMetadataType(opts.IdType);
  this._bufferSize = opts.bufferSize || 2048;
  this._frameSize = opts.frameSize || 2048;

  this.once('_eot', function (pending) { this.emit('eot', pending); });
}
util.inherits(MessageEmitter, events.EventEmitter);

MessageEmitter.prototype._generateResolvers = function (
  hashString, serverPtcl
) {
  var resolvers = {};
  var emitterMessages = this._ptcl._messages;
  var serverMessages = serverPtcl._messages;
  Object.keys(emitterMessages).forEach(function (name) {
    var cm = emitterMessages[name];
    var sm = serverMessages[name];
    if (!sm) {
      throw new Error(f('missing server message: %s', name));
    }
    resolvers[name] = {
      responseType: cm.responseType.createResolver(sm.responseType),
      errorType: cm.errorType.createResolver(sm.errorType)
    };
  });
  this._resolvers[hashString] = resolvers;
};

MessageEmitter.prototype._createHandshakeRequest = function (
  hashString, noPtcl
) {
  return new HandshakeRequest(
    getHash(this._ptcl),
    noPtcl ? null : {string: this._ptcl.toString()},
    Buffer.from(hashString, 'binary')
  );
};

MessageEmitter.prototype._finalizeHandshake = function (tap, handshakeReq) {
  var res = HANDSHAKE_RESPONSE_TYPE._read(tap);
  this.emit('handshake', handshakeReq, res);

  if (handshakeReq.clientProtocol && res.match === 'NONE') {
    // If the emitter's protocol was included in the original request, this is
    // not a failure which a retry will fix.
    var buf = res.meta && res.meta.map.error;
    throw new Error(buf ? buf.toString() : 'handshake error');
  }

  var hashString;
  if (res.serverHash && res.serverProtocol) {
    // This means the request didn't include the correct server hash. Note that
    // we use the handshake response's hash rather than our computed one in
    // case the server computes it differently.
    hashString = res.serverHash['org.apache.avro.ipc.MD5'].toString('binary');
    if (!canResolve(this, hashString)) {
      this._generateResolvers(
        hashString,
        createProtocol(JSON.parse(res.serverProtocol.string))
      );
    }
    // Make this hash the new default.
    this._serverHashString = hashString;
  } else {
    hashString = handshakeReq.serverHash.toString('binary');
  }

  // We return the server's hash for stateless emitters. It might be that the
  // default hash changes in between requests, in which case using the default
  // one will fail.
  return {match: res.match, serverHashString: hashString};
};

MessageEmitter.prototype._encodeRequest = function (tap, message, req) {
  safeWrite(tap, STRING_TYPE, message.name);
  safeWrite(tap, message.requestType, req);
};

MessageEmitter.prototype._decodeArguments = function (
  tap, hashString, message
) {
  var resolvers = getResolvers(this, hashString, message);
  var args = [null, null];
  if (tap.readBoolean()) {
    args[0] = resolvers.errorType._read(tap);
  } else {
    args[1] = resolvers.responseType._read(tap);
  }
  if (!tap.isValid()) {
    throw new Error('truncated message');
  }
  return args;
};

/**
 * Factory-based emitter.
 *
 * This emitter doesn't keep a persistent connection to the server and requires
 * prepending a handshake to each message emitted. Usage examples include
 * talking to an HTTP server (where the factory returns an HTTP request).
 *
 * Since each message will use its own writable/readable stream pair, the
 * advantage of this emitter is that it is able to keep track of which response
 * corresponds to each request without relying on messages' metadata. In
 * particular, this means these emitters are compatible with any server
 * implementation.
 *
 */
function StatelessEmitter(ptcl, writableFactory, opts) {
  opts = opts || {};
  MessageEmitter.call(this, ptcl, opts);

  this._writableFactory = writableFactory;
  this._id = 1;
  this._pending = {};
  this._destroyed = false;
  this._interrupted = false;
}
util.inherits(StatelessEmitter, MessageEmitter);

StatelessEmitter.prototype._emit = function (message, req, cb) {
  // We enclose the server's hash inside this message's closure since the
  // emitter might be emitting several message concurrently and the hash might
  // change before the response returns (unlikely but possible if the emitter
  // talks to multiple servers at once or the server changes protocol).
  var serverHashString = this._serverHashString;
  var id = this._id++;
  var self = this;

  this._pending[id] = cb;
  if (this._destroyed) {
    asyncAvroCb(undefined, done, 'emitter destroyed');
    return;
  }
  emit(false);

  function emit(retry) {
    var tap = new Tap(Buffer.alloc(self._bufferSize));

    var handshakeReq = self._createHandshakeRequest(serverHashString, !retry);
    safeWrite(tap, HANDSHAKE_REQUEST_TYPE, handshakeReq);
    try {
      safeWrite(tap, self._idType, id);
      self._encodeRequest(tap, message, req);
    } catch (err) {
      asyncAvroCb(undefined, done, err);
      return;
    }

    var writable = self._writableFactory(function onReadable(readable) {
      if (self._interrupted) {
        // In case this function is called asynchronously (e.g. when sending
        // HTTP requests), it might be that we have ended since.
        return;
      }

      readable
        .pipe(new MessageDecoder(true))
        .on('error', done)
        // This will happen when the readable stream ends before a single
        // message has been decoded (e.g. on invalid response).
        .on('data', function (buf) {
          readable.unpipe(this); // Single message per readable stream.
          if (self._interrupted) {
            return;
          }

          var tap = new Tap(buf);
          var args;
          try {
            var info = self._finalizeHandshake(tap, handshakeReq);
            serverHashString = info.serverHashString;
            if (info.match === 'NONE') {
              emit(true); // Retry, attaching emitter protocol this time.
              return;
            }
            self._idType._read(tap); // Skip metadata.
            args = self._decodeArguments(tap, serverHashString, message);
          } catch (err) {
            done(err);
            return;
          }
          done.apply(undefined, args);
        });
    });

    var encoder = new MessageEncoder(self._frameSize);
    encoder.pipe(writable);
    encoder.end(tap.getValue());
  }

  function done(err, res) {
    var cb = self._pending[id];
    delete self._pending[id];
    cb.call(self._ptcl, err, res);
    if (self._destroyed) {
      self.destroy();
    }
  }
};

StatelessEmitter.prototype.destroy = function (noWait) {
  this._destroyed = true;

  var pendingIds = Object.keys(this._pending);
  if (noWait) {
    this._interrupted = true;
    pendingIds.forEach(function (id) {
      this._pending[id]({string: 'interrupted'});
      delete this._pending[id];
    }, this);
  }

  if (noWait || !pendingIds.length) {
    this.emit('_eot', pendingIds.length);
  }
};

/**
 * Multiplexing emitter.
 *
 * These emitters reuse the same streams (both readable and writable) for all
 * messages. This avoids a lot of overhead (e.g. creating new connections,
 * re-issuing handshakes) but requires the server to include compatible
 * metadata in each response (namely forwarding each request's ID into its
 * response).
 *
 * A custom metadata format can be specified via the `idType` option. The
 * default is compatible with this package's default server (i.e. listener)
 * implementation.
 *
 */
function StatefulEmitter(ptcl, readable, writable, opts) {
  opts = opts || {};
  MessageEmitter.call(this, ptcl, opts);

  this._readable = readable;
  this._writable = writable;
  this._id = 1;
  this._pending = {};
  this._started = false;
  this._destroyed = false;
  this._ended = false; // Readable input ended.
  this._decoder = new MessageDecoder();
  this._encoder = new MessageEncoder(this._frameSize);

  var handshakeReq = null;
  var self = this;

  process.nextTick(function () {
    self._readable.pipe(self._decoder)
      .on('error', function (err) { self.emit('error', err); })
      .on('data', onHandshakeData)
      .on('end', function () {
        self._ended = true;
        self.destroy();
      });

    self._encoder.pipe(self._writable);
    emitHandshake(true);
  });

  function emitHandshake(noPtcl) {
    handshakeReq = self._createHandshakeRequest(
      self._serverHashString,
      noPtcl
    );
    self._encoder.write(handshakeReq.$toBuffer());
  }

  function onHandshakeData(buf) {
    var tap = new Tap(buf);
    var info;
    try {
      info = self._finalizeHandshake(tap, handshakeReq);
    } catch (err) {
      self.emit('error', err);
      self.destroy(); // This isn't a recoverable error.
      return;
    }

    if (info.match !== 'NONE') {
      self._decoder
        .removeListener('data', onHandshakeData)
        .on('data', onMessageData);
      self._started = true;
      self.emit('_start'); // Send any pending messages.
    } else {
      emitHandshake(false);
    }
  }

  function onMessageData(buf) {
    var tap = new Tap(buf);
    var id;
    try {
      id = self._idType._read(tap);
      if (!id) {
        throw new Error('missing ID');
      }
    } catch (err) {
      self.emit('error', new Error('invalid metadata: ' + err.message));
      return;
    }

    var info = self._pending[id];
    if (info === undefined) {
      self.emit('error', new Error('orphan response: ' + id));
      return;
    }

    var args;
    try {
      args = self._decodeArguments(
        tap,
        self._serverHashString,
        info.message
      );
    } catch (err) {
      info.cb({string: 'invalid response: ' + err.message});
      return;
    }
    delete self._pending[id];
    info.cb.apply(self._ptcl, args);
    if (self._destroyed) {
      self.destroy();
    }
  }
}
util.inherits(StatefulEmitter, MessageEmitter);

StatefulEmitter.prototype._emit = function (message, req, cb) {
  if (this._destroyed) {
    asyncAvroCb(this._ptcl, cb, 'emitter destroyed');
    return;
  }

  var self = this;
  if (!this._started) {
    this.once('_start', function () { self._emit(message, req, cb); });
    return;
  }

  var tap = new Tap(Buffer.alloc(this._bufferSize));
  var id = this._id++;
  try {
    safeWrite(tap, this._idType, -id);
    this._encodeRequest(tap, message, req);
  } catch (err) {
    asyncAvroCb(this._ptcl, cb, err);
    return;
  }

  if (!message.oneWay) {
    this._pending[id] = {message: message, cb: cb};
  }
  this._encoder.write(tap.getValue());
};

StatefulEmitter.prototype.destroy = function (noWait) {
  this._destroyed = true;
  if (!this._started) {
    this.emit('_start'); // Error out any pending calls.
  }

  var pendingIds = Object.keys(this._pending);
  if (pendingIds.length && !(noWait || this._ended)) {
    return; // Wait for pending requests.
  }
  pendingIds.forEach(function (id) {
    var cb = this._pending[id].cb;
    delete this._pending[id];
    cb({string: 'interrupted'});
  }, this);

  this._readable.unpipe(this._decoder);
  this._encoder.unpipe(this._writable);
  this.emit('_eot', pendingIds.length);
};

/**
 * The server-side emitter equivalent.
 *
 * In particular it is responsible for handling handshakes appropriately.
 *
 */
function MessageListener(ptcl, opts) {
  events.EventEmitter.call(this);
  opts = opts || {};

  this._ptcl = ptcl;
  this._resolvers = ptcl._listenerResolvers;
  this._emitterHashString = null;
  this._idType = IdType.createMetadataType(opts.IdType);
  this._bufferSize = opts.bufferSize || 2048;
  this._frameSize = opts.frameSize || 2048;
  this._decoder = new MessageDecoder();
  this._encoder = new MessageEncoder(this._frameSize);
  this._destroyed = false;
  this._pending = 0;

  this.once('_eot', function (pending) { this.emit('eot', pending); });
}
util.inherits(MessageListener, events.EventEmitter);

MessageListener.prototype._generateResolvers = function (
  hashString, emitterPtcl
) {
  var resolvers = {};
  var clientMessages = emitterPtcl._messages;
  var serverMessages = this._ptcl._messages;
  Object.keys(clientMessages).forEach(function (name) {
    var sm = serverMessages[name];
    if (!sm) {
      throw new Error(f('missing server message: %s', name));
    }
    var cm = clientMessages[name];
    resolvers[name] = {
      requestType: sm.requestType.createResolver(cm.requestType)
    };
  });
  this._resolvers[hashString] = resolvers;
};

MessageListener.prototype._validateHandshake = function (reqTap, resTap) {
  // Reads handshake request and write corresponding response out. If an error
  // occurs when parsing the request, a response with match NONE will be sent.
  // Also emits 'handshake' event with both the request and the response.
  var validationErr = null;
  var handshakeReq;
  var serverHashString;
  try {
    handshakeReq = HANDSHAKE_REQUEST_TYPE._read(reqTap);
    serverHashString = handshakeReq.serverHash.toString('binary');
  } catch (err) {
    validationErr = err;
  }

  if (!validationErr) {
    this._emitterHashString = handshakeReq.clientHash.toString('binary');
    if (!canResolve(this, this._emitterHashString)) {
      var emitterPtclString = handshakeReq.clientProtocol;
      if (emitterPtclString) {
        try {
          this._generateResolvers(
            this._emitterHashString,
            createProtocol(JSON.parse(emitterPtclString.string))
          );
        } catch (err) {
          validationErr = err;
        }
      } else {
        validationErr = new Error('unknown client protocol hash');
      }
    }
  }

  // We use the handshake response's meta field to transmit an eventual error
  // to the client. This will let us display a more useful message later on.
  var serverMatch = serverHashString === this._ptcl._hashString;
  var handshakeRes = new HandshakeResponse(
    validationErr ? 'NONE' : serverMatch ? 'BOTH' : 'CLIENT',
    serverMatch ? null : {string: this._ptcl.toString()},
    serverMatch ? null : {'org.apache.avro.ipc.MD5': getHash(this._ptcl)},
    validationErr ? {map: {error: Buffer.from(validationErr.message)}} : null
  );

  this.emit('handshake', handshakeReq, handshakeRes);
  safeWrite(resTap, HANDSHAKE_RESPONSE_TYPE, handshakeRes);
  return validationErr === null;
};

MessageListener.prototype._decodeRequest = function (tap, message) {
  var resolvers = getResolvers(this, this._emitterHashString, message);
  var val = resolvers.requestType._read(tap);
  if (!tap.isValid()) {
    throw new Error('invalid request');
  }
  return val;
};

MessageListener.prototype._encodeSystemError = function (tap, err) {
  safeWrite(tap, BOOLEAN_TYPE, true);
  safeWrite(tap, SYSTEM_ERROR_TYPE, avroError(err));
};

MessageListener.prototype._encodeArguments = function (
  tap, message, err, res
) {
  var noError = err === null;
  var pos = tap.pos;
  safeWrite(tap, BOOLEAN_TYPE, !noError);
  try {
    if (noError) {
      safeWrite(tap, message.responseType, res);
    } else {
      if (err instanceof Error) {
        // Convenience to allow emitter to use JS errors inside handlers.
        err = avroError(err);
      }
      safeWrite(tap, message.errorType, err);
    }
  } catch (err) {
    tap.pos = pos;
    this._encodeSystemError(tap, err);
  }
};

MessageListener.prototype.destroy = function (noWait) {
  if (!this._destroyed) {
    // Stop listening. This will also correctly push back any unused bytes into
    // the readable stream (via `MessageDecoder`'s `unpipe` handler).
    this._readable.unpipe(this._decoder);
  }

  this._destroyed = true;
  if (noWait || !this._pending) {
    this._encoder.unpipe(this._writable);
    this.emit('_eot', this._pending);
  }
};

/**
 * Listener for stateless transport.
 *
 * This listener expect a handshake to precede each message.
 *
 */
function StatelessListener(ptcl, readableFactory, opts) {
  MessageListener.call(this, ptcl, opts);

  this._tap = new Tap(Buffer.alloc(this._bufferSize));
  this._message = undefined;

  var self = this;
  this._readable = readableFactory(function (writable) {
    // The encoder will buffer writes that happen before this function is
    // called, so we don't need to do any special handling.
    self._writable = self._encoder
      .pipe(writable)
      .on('finish', onEnd);
  });

  this._readable.pipe(this._decoder)
    .on('data', onRequestData)
    .on('end', onEnd);

  function onRequestData(buf) {
    self._pending++;
    self.destroy(); // Only one message per stateless listener.

    var reqTap = new Tap(buf);
    if (!self._validateHandshake(reqTap, self._tap)) {
      onResponse(new Error('invalid handshake'));
      return;
    }

    var name;
    var req;
    try {
      self._idType._read(reqTap); // Skip metadata.
      name = STRING_TYPE._read(reqTap);
      self._message = self._ptcl._messages[name];
      if (!self._message) {
        throw new Error(f('unknown message: %s', name));
      }
      req = self._decodeRequest(reqTap, self._message);
    } catch (err) {
      onResponse(err);
      return;
    }

    self.emit('_call', name, req, onResponse);
  }

  function onResponse(err, res) {
    safeWrite(self._tap, self._idType, 0);
    if (!self._message) {
      self._encodeSystemError(self._tap, err);
    } else {
      self._encodeArguments(self._tap, self._message, err, res);
    }
    self._pending--;
    self._encoder.end(self._tap.getValue());
  }

  function onEnd() { self.destroy(); }
}
util.inherits(StatelessListener, MessageListener);

/**
 * Stateful transport listener.
 *
 * A handshake is done when the listener is first opened, then all messages are
 * sent without.
 *
 */
function StatefulListener(ptcl, readable, writable, opts) {
  MessageListener.call(this, ptcl, opts);

  this._readable = readable;
  this._writable = writable;

  var self = this;

  this._readable
    .pipe(this._decoder)
    .on('data', onHandshakeData)
    .on('end', function () { self.destroy(); });

  this._encoder
    .pipe(this._writable)
    .on('finish', function () { self.destroy(); });

  function onHandshakeData(buf) {
    var reqTap = new Tap(buf);
    var resTap = new Tap(Buffer.alloc(self._bufferSize));
    if (self._validateHandshake(reqTap, resTap)) {
      self._decoder
        .removeListener('data', onHandshakeData)
        .on('data', onRequestData);
    }
    self._encoder.write(resTap.getValue());
  }

  function onRequestData(buf) {
    var reqTap = new Tap(buf);
    var resTap = new Tap(Buffer.alloc(self._bufferSize));
    var id = 0;
    try {
      id = -self._idType._read(reqTap) | 0;
      if (!id) {
        throw new Error('missing ID');
      }
    } catch (err) {
      self.emit('error', new Error('invalid metadata: ' + err.message));
      return;
    }

    self._pending++;
    var name;
    var message;
    var req;
    try {
      name = STRING_TYPE._read(reqTap);
      message = self._ptcl._messages[name];
      if (!message) {
        throw new Error('unknown message: ' + name);
      }
      req = self._decodeRequest(reqTap, message);
    } catch (err) {
      onResponse(err);
      return;
    }

    if (message.oneWay) {
      self.emit('_call', name, req);
      self._pending--;
    } else {
      self.emit('_call', name, req, onResponse);
    }

    function onResponse(err, res) {
      self._pending--;
      safeWrite(resTap, self._idType, id);
      if (!message) {
        self._encodeSystemError(resTap, err);
      } else {
        self._encodeArguments(resTap, message, err, res);
      }
      self._encoder.write(resTap.getValue(), undefined, function () {
        if (!self._pending && self._destroyed) {
          self.destroy(); // For real this time.
        }
      });
    }
  }
}
util.inherits(StatefulListener, MessageListener);

// Helpers.

/**
 * An Avro message.
 *
 */
function Message(name, attrs, opts) {
  this.name = name;

  this.requestType = schemas.createType({
    name: name,
    type: 'request',
    fields: attrs.request
  }, opts);

  if (!attrs.response) {
    throw new Error('missing response');
  }
  this.responseType = schemas.createType(attrs.response, opts);

  var errors = attrs.errors || [];
  errors.unshift('string');
  this.errorType = schemas.createType(errors, opts);

  this.oneWay = !!attrs['one-way'];
  if (this.oneWay) {
    if (
      !(this.responseType instanceof schemas.types.NullType) ||
      errors.length > 1
    ) {
      throw new Error('unapplicable one-way parameter');
    }
  }
}

Message.prototype.toJSON = function () {
  var obj = {
    request: this.requestType.getFields(),
    response: this.responseType
  };
  var errorTypes = this.errorType.getTypes();
  if (errorTypes.length > 1) {
    obj.errors = schemas.createType(errorTypes.slice(1));
  }
  return obj;
};

/**
 * "Framing" stream.
 *
 * @param frameSize {Number} (Maximum) size in bytes of each frame. The last
 * frame might be shorter.
 *
 */
function MessageEncoder(frameSize) {
  stream.Transform.call(this);
  this._frameSize = frameSize | 0;
  if (this._frameSize <= 0) {
    throw new Error('invalid frame size');
  }
}
util.inherits(MessageEncoder, stream.Transform);

MessageEncoder.prototype._transform = function (buf, encoding, cb) {
  var frames = [];
  var length = buf.length;
  var start = 0;
  var end;
  do {
    end = start + this._frameSize;
    if (end > length) {
      end = length;
    }
    frames.push(intBuffer(end - start));
    frames.push(buf.slice(start, end));
  } while ((start = end) < length);
  frames.push(intBuffer(0));
  cb(null, Buffer.concat(frames));
};

/**
 * "Un-framing" stream.
 *
 * @param noEmpty {Boolean} Emit an error if the decoder ends before emitting a
 * single frame.
 *
 * This stream should only be used by being piped/unpiped to. Otherwise there
 * is a risk that too many bytes get consumed from the source stream (i.e.
 * data corresponding to a partial message might be lost).
 *
 */
function MessageDecoder(noEmpty) {
  stream.Transform.call(this);
  this._buf = Buffer.alloc(0);
  this._bufs = [];
  this._length = 0;
  this._empty = !!noEmpty;

  this
    .on('finish', function () { this.push(null); })
    .on('unpipe', function (src) {
      if (~this._length && !src._readableState.ended) {
        // Not ideal to rely on this to check whether we can unshift, but the
        // official documentation mentions it (in the context of the read
        // buffers) so it should be stable. Alternatives are more complex,
        // costly (e.g. attaching a handler on pipe), and not as fool-proof
        // (the stream might have ended earlier).
        this._bufs.push(this._buf);
        src.unshift(Buffer.concat(this._bufs));
      }
    });
}
util.inherits(MessageDecoder, stream.Transform);

MessageDecoder.prototype._transform = function (buf, encoding, cb) {
  buf = Buffer.concat([this._buf, buf]);
  var frameLength;
  while (
    buf.length >= 4 &&
    buf.length >= (frameLength = buf.readInt32BE(0)) + 4
  ) {
    if (frameLength) {
      this._bufs.push(buf.slice(4, frameLength + 4));
      this._length += frameLength;
    } else {
      var frame = Buffer.concat(this._bufs, this._length);
      this._empty = false;
      this._length = 0;
      this._bufs = [];
      this.push(frame);
    }
    buf = buf.slice(frameLength + 4);
  }
  this._buf = buf;
  cb();
};

MessageDecoder.prototype._flush = function () {
  if (this._length || this._buf.length) {
    this._length = -1; // Don't unshift data on incoming unpipe.
    this.emit('error', new Error('trailing data'));
  } else if (this._empty) {
    this.emit('error', new Error('no message decoded'));
  } else {
    this.emit('finish');
  }
};

/**
 * Default ID generator, using Avro messages' metadata field.
 *
 * This is required for stateful emitters to work and can be overridden to read
 * or write arbitrary metadata. Note that the message contents are
 * (intentionally) not available when updating this metadata.
 *
 */
function IdType(attrs, opts) {
  schemas.types.LogicalType.call(this, attrs, opts);
}
util.inherits(IdType, schemas.types.LogicalType);

IdType.prototype._fromValue = function (val) {
  var buf = val.id;
  return buf && buf.length === 4 ? buf.readInt32BE(0) : 0;
};

IdType.prototype._toValue = function (any) {
  return {id: intBuffer(any | 0)};
};

IdType.createMetadataType = function (Type) {
  Type = Type || IdType;
  return new Type({type: 'map', values: 'bytes'});
};

/**
 * Returns a buffer containing an integer's big-endian representation.
 *
 * @param n {Number} Integer.
 *
 */
function intBuffer(n) {
  var buf = Buffer.alloc(4);
  buf.writeInt32BE(n);
  return buf;
}

/**
 * Write and maybe resize.
 *
 * @param tap {Tap} Tap written to.
 * @param type {Type} Avro type.
 * @param val {...} Corresponding Avro value.
 *
 */
function safeWrite(tap, type, val) {
  var pos = tap.pos;
  type._write(tap, val);

  if (!tap.isValid()) {
    var buf = Buffer.alloc(tap.pos);
    tap.buf.copy(buf, 0, 0, pos);
    tap.buf = buf;
    tap.pos = pos;
    type._write(tap, val);
  }
}

/**
 * Default callback when not provided.
 *
 */
function throwError(err) {
  if (!err) {
    return;
  }
  if (typeof err == 'object' && err.string) {
    err = err.string;
  }
  if (typeof err == 'string') {
    err = new Error(err);
  }
  throw err;
}

/**
 * Convert an error message into a format suitable for RPC.
 *
 * @param err {Error|String} Error message. It will be converted into valid
 * format for Avro.
 *
 */
function avroError(err) {
  if (err instanceof Error) {
    err = err.message;
  }
  return {string: err};
}

/**
 * Asynchronous error handling.
 *
 * @param cb {Function} Callback.
 * @param err {...} Error, passed as first argument to `cb.` If an `Error`
 * instance or a string, it will be converted into valid format for Avro.
 * @param res {...} Response. Passed as second argument to `cb`.
 *
 */
function asyncAvroCb(ctx, cb, err, res) {
  process.nextTick(function () { cb.call(ctx, avroError(err), res); });
}

/**
 * Convenience function to get a protocol's hash.
 *
 * @param ptcl {Protocol} Any protocol.
 *
 */
function getHash(ptcl) {
  return Buffer.from(ptcl._hashString, 'binary');
}

/**
 * Whether a emitter or listener can resolve messages from a hash string.
 *
 * @param emitter {MessageEmitter|MessageListener}
 * @param hashString {String}
 *
 */
function canResolve(emitter, hashString) {
  var resolvers = emitter._resolvers[hashString];
  return !!resolvers || hashString === emitter._ptcl._hashString;
}

/**
 * Retrieve resolvers for a given hash string.
 *
 * @param emitter {MessageEmitter|MessageListener}
 * @param hashString {String}
 * @param message {Message}
 *
 */
function getResolvers(emitter, hashString, message) {
  if (hashString === emitter._ptcl._hashString) {
    return message;
  }
  var resolvers = emitter._resolvers[hashString];
  return resolvers && resolvers[message.name];
}

/**
 * Check whether something is a stream.
 *
 * @param any {Object} Any object.
 *
 */
function isStream(any) {
  // This is a hacky way of checking that the transport is a stream-like
  // object. We unfortunately can't use `instanceof Stream` checks since
  // some libraries (e.g. websocket-stream) return streams which don't
  // inherit from it.
  return !!any.pipe;
}


module.exports = {
  HANDSHAKE_REQUEST_TYPE: HANDSHAKE_REQUEST_TYPE,
  HANDSHAKE_RESPONSE_TYPE: HANDSHAKE_RESPONSE_TYPE,
  IdType: IdType,
  Message: Message,
  Protocol: Protocol,
  createProtocol: createProtocol,
  emitters: {
    StatefulEmitter: StatefulEmitter,
    StatelessEmitter: StatelessEmitter
  },
  listeners: {
    StatefulListener: StatefulListener,
    StatelessListener: StatelessListener
  },
  streams: {
    MessageDecoder: MessageDecoder,
    MessageEncoder: MessageEncoder
  },
  throwError: throwError
};


/***/ }),

/***/ 7985:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/* jshint node: true */

/**
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */



var utils = __nccwpck_require__(1333),
    buffer = __nccwpck_require__(4300), // For `SlowBuffer`.
    util = __nccwpck_require__(3837);

// Convenience imports.
var Tap = utils.Tap;
var f = util.format;
var Buffer = buffer.Buffer;

// All Avro types.
var TYPES = {
  'array': ArrayType,
  'boolean': BooleanType,
  'bytes': BytesType,
  'double': DoubleType,
  'enum': EnumType,
  'error': RecordType,
  'fixed': FixedType,
  'float': FloatType,
  'int': IntType,
  'long': LongType,
  'map': MapType,
  'null': NullType,
  'record': RecordType,
  'request': RecordType,
  'string': StringType,
  'union': UnionType
};

// Valid (field, type, and symbol) name regex.
var NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

// Random generator.
var RANDOM = new utils.Lcg();

// Encoding tap (shared for performance).
var TAP = new Tap(Buffer.allocUnsafeSlow(1024));

// Path prefix for validity checks (shared for performance).
var PATH = [];

// Currently active logical type, used for name redirection.
var LOGICAL_TYPE = null;


/**
 * Schema parsing entry point.
 *
 * It isn't exposed directly but called from `parse` inside `index.js` (node)
 * or `avro.js` (browserify) which each add convenience functionality.
 *
 */
function createType(attrs, opts) {
  if (attrs instanceof Type) {
    return attrs;
  }

  opts = getOpts(attrs, opts);

  var type;
  if (typeof attrs == 'string') { // Type reference.
    if (opts.namespace && !~attrs.indexOf('.') && !isPrimitive(attrs)) {
      attrs = opts.namespace + '.' + attrs;
    }
    type = opts.registry[attrs];
    if (type) {
      // Type was already defined, return it.
      return type;
    }
    if (isPrimitive(attrs)) {
      // Reference to a primitive type. These are also defined names by default
      // so we create the appropriate type and it to the registry for future
      // reference.
      type = opts.registry[attrs] = createType({type: attrs}, opts);
      return type;
    }
    throw new Error(f('undefined type name: %s', attrs));
  }

  if (opts.typeHook && (type = opts.typeHook(attrs, opts))) {
    if (!(type instanceof Type)) {
      throw new Error(f('invalid typehook return value: %j', type));
    }
    return type;
  }

  if (attrs.logicalType && !LOGICAL_TYPE) {
    var DerivedType = opts.logicalTypes[attrs.logicalType];
    if (DerivedType) {
      var registry = {};
      Object.keys(opts.registry).forEach(function (key) {
        registry[key] = opts.registry[key];
      });
      try {
        return new DerivedType(attrs, opts);
      } catch (err) {
        if (opts.assertLogicalTypes) {
          throw err;
        }
        LOGICAL_TYPE = null;
        opts.registry = registry; // In case any names were registered.
      }
    }
  }

  if (attrs instanceof Array) { // Union.
    type = new UnionType(attrs, opts);
  } else { // New type definition.
    type = (function (typeName) {
      var Type = TYPES[typeName];
      if (Type === undefined) {
        throw new Error(f('unknown type: %j', typeName));
      }
      return new Type(attrs, opts);
    })(attrs.type);
  }
  return type;
}

/**
 * "Abstract" base Avro type class.
 *
 * This class' constructor will register any named types to support
 * recursive schemas.
 *
 * All type values are represented in memory similarly to their JSON
 * representation, except for `bytes` and `fixed` which are represented as
 * `Buffer`s. See individual subclasses for details.
 *
 */
function Type(registry) {
  var name = this._name;
  var type = LOGICAL_TYPE || this;
  LOGICAL_TYPE = null;

  if (registry === undefined || name === undefined) {
    return;
  }

  var prev = registry[name];
  if (prev !== undefined) {
    throw new Error(f('duplicate type name: %s', name));
  }
  registry[name] = type;
}

Type.__reset = function (size) { TAP.buf = Buffer.allocUnsafeSlow(size); };

Type.prototype.createResolver = function (type, opts) {
  if (!(type instanceof Type)) {
    // More explicit error message than the "incompatible type" thrown
    // otherwise (especially because of the overridden `toJSON` method).
    throw new Error(f('not a type: %j', type));
  }

  if (type instanceof LogicalType && !(this instanceof LogicalType)) {
    // Trying to read a logical type as a built-in: unwrap the logical type.
    return this.createResolver(type._underlyingType, opts);
  }

  opts = opts || {};
  opts.registry = opts.registry || {};

  var resolver, key;
  if (this instanceof RecordType && type instanceof RecordType) {
    key = this._name + ':' + type._name; // ':' is illegal in Avro type names.
    resolver = opts.registry[key];
    if (resolver) {
      return resolver;
    }
  }

  resolver = new Resolver(this);
  if (key) { // Register resolver early for recursive schemas.
    opts.registry[key] = resolver;
  }

  if (type instanceof UnionType) {
    var resolvers = type._types.map(function (t) {
      return this.createResolver(t, opts);
    }, this);
    resolver._read = function (tap) {
      var index = tap.readLong();
      var resolver = resolvers[index];
      if (resolver === undefined) {
        throw new Error(f('invalid union index: %s', index));
      }
      return resolvers[index]._read(tap);
    };
  } else {
    this._updateResolver(resolver, type, opts);
  }

  if (!resolver._read) {
    throw new Error(f('cannot read %s as %s', type, this));
  }
  return resolver;
};

Type.prototype.decode = function (buf, pos, resolver) {
  var tap = new Tap(buf);
  tap.pos = pos | 0;
  var val = readValue(this, tap, resolver);
  if (!tap.isValid()) {
    return {value: undefined, offset: -1};
  }
  return {value: val, offset: tap.pos};
};

Type.prototype.encode = function (val, buf, pos) {
  var tap = new Tap(buf);
  tap.pos = pos | 0;
  this._write(tap, val);
  if (!tap.isValid()) {
    // Don't throw as there is no way to predict this. We also return the
    // number of missing bytes to ease resizing.
    return buf.length - tap.pos;
  }
  return tap.pos;
};

Type.prototype.fromBuffer = function (buf, resolver, noCheck) {
  var tap = new Tap(buf);
  var val = readValue(this, tap, resolver, noCheck);
  if (!tap.isValid()) {
    throw new Error('truncated buffer');
  }
  if (!noCheck && tap.pos < buf.length) {
    throw new Error('trailing data');
  }
  return val;
};

Type.prototype.toBuffer = function (val) {
  TAP.pos = 0;
  this._write(TAP, val);
  if (!TAP.isValid()) {
    Type.__reset(2 * TAP.pos);
    TAP.pos = 0;
    this._write(TAP, val);
  }
  var buf = Buffer.alloc(TAP.pos);
  TAP.buf.copy(buf, 0, 0, TAP.pos);
  return buf;
};

Type.prototype.fromString = function (str) {
  return this._copy(JSON.parse(str), {coerce: 2});
};

Type.prototype.toString = function (val) {
  if (val === undefined) {
    // Consistent behavior with standard `toString` expectations.
    return this.getSchema(true);
  }
  return JSON.stringify(this._copy(val, {coerce: 3}));
};

Type.prototype.clone = function (val, opts) {
  if (opts) {
    opts = {
      coerce: !!opts.coerceBuffers | 0, // Coerce JSON to Buffer.
      fieldHook: opts.fieldHook,
      wrap: !!opts.wrapUnions | 0 // Wrap first match into union.
    };
  }
  return this._copy(val, opts);
};

Type.prototype.isValid = function (val, opts) {
  while (PATH.length) {
    // In case the previous `isValid` call didn't complete successfully (e.g.
    // if an exception was thrown, but then caught in client code), `PATH`
    // might be non-empty, we must manually clear it.
    PATH.pop();
  }
  return this._check(val, opts && opts.errorHook);
};

Type.prototype.compareBuffers = function (buf1, buf2) {
  return this._match(new Tap(buf1), new Tap(buf2));
};

Type.prototype.getName = function (noRef) {
  return noRef ? getTypeName(this) : this._name;
};

Type.prototype.getSchema = function (noDeref) {
  return stringify(this, noDeref);
};

Type.prototype.getFingerprint = function (algorithm) {
  return utils.getHash(this.getSchema(), algorithm);
};

Type.prototype.inspect = function () {
  if (this instanceof PrimitiveType) {
    return f('<%s>', this.constructor.name);
  } else {
    var obj = JSON.parse(this.getSchema(true)); // Slow, only for debugging.
    if (typeof obj == 'object') {
      obj.type = undefined; // Would be redundant with constructor name.
    }
    return f('<%s %j>', this.constructor.name, obj);
  }
};

Type.prototype._check = utils.abstractFunction;
Type.prototype._copy = utils.abstractFunction;
Type.prototype._match = utils.abstractFunction;
Type.prototype._read = utils.abstractFunction;
Type.prototype._skip = utils.abstractFunction;
Type.prototype._updateResolver = utils.abstractFunction;
Type.prototype._write = utils.abstractFunction;
Type.prototype.compare = utils.abstractFunction;
Type.prototype.random = utils.abstractFunction;

// Implementations.

/**
 * Base primitive Avro type.
 *
 * Most of the primitive types share the same cloning and resolution
 * mechanisms, provided by this class. This class also lets us conveniently
 * check whether a type is a primitive using `instanceof`.
 *
 */
function PrimitiveType() { Type.call(this); }
util.inherits(PrimitiveType, Type);
PrimitiveType.prototype._updateResolver = function (resolver, type) {
  if (type.constructor === this.constructor) {
    resolver._read = this._read;
  }
};
PrimitiveType.prototype._copy = function (val) {
  this._check(val, throwInvalidError);
  return val;
};
PrimitiveType.prototype.compare = utils.compare;

/**
 * Nulls.
 *
 */
function NullType() { PrimitiveType.call(this); }
util.inherits(NullType, PrimitiveType);
NullType.prototype._check = function (val, cb) {
  var b = val === null;
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
NullType.prototype._read = function () { return null; };
NullType.prototype._skip = function () {};
NullType.prototype._write = function (tap, val) {
  if (val !== null) {
    throwInvalidError(null, val, this);
  }
};
NullType.prototype._match = function () { return 0; };
NullType.prototype.compare = NullType.prototype._match;
NullType.prototype.random = NullType.prototype._read;
NullType.prototype.toJSON = function () { return 'null'; };

/**
 * Booleans.
 *
 */
function BooleanType() { PrimitiveType.call(this); }
util.inherits(BooleanType, PrimitiveType);
BooleanType.prototype._check = function (val, cb) {
  var b = typeof val == 'boolean';
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
BooleanType.prototype._read = function (tap) { return tap.readBoolean(); };
BooleanType.prototype._skip = function (tap) { tap.skipBoolean(); };
BooleanType.prototype._write = function (tap, val) {
  if (typeof val != 'boolean') {
    throwInvalidError(null, val, this);
  }
  tap.writeBoolean(val);
};
BooleanType.prototype._match = function (tap1, tap2) {
  return tap1.matchBoolean(tap2);
};
BooleanType.prototype.random = function () { return RANDOM.nextBoolean(); };
BooleanType.prototype.toJSON = function () { return 'boolean'; };

/**
 * Integers.
 *
 */
function IntType() { PrimitiveType.call(this); }
util.inherits(IntType, PrimitiveType);
IntType.prototype._check = function (val, cb) {
  var b = val === (val | 0);
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
IntType.prototype._read = function (tap) { return tap.readInt(); };
IntType.prototype._skip = function (tap) { tap.skipInt(); };
IntType.prototype._write = function (tap, val) {
  if (val !== (val | 0)) {
    throwInvalidError(null, val, this);
  }
  tap.writeInt(val);
};
IntType.prototype._match = function (tap1, tap2) {
  return tap1.matchInt(tap2);
};
IntType.prototype.random = function () { return RANDOM.nextInt(1000) | 0; };
IntType.prototype.toJSON = function () { return 'int'; };

/**
 * Longs.
 *
 * We can't capture all the range unfortunately since JavaScript represents all
 * numbers internally as `double`s, so the default implementation plays safe
 * and throws rather than potentially silently change the data. See `using` or
 * `AbstractLongType` below for a way to implement a custom long type.
 *
 */
function LongType() { PrimitiveType.call(this); }
util.inherits(LongType, PrimitiveType);
LongType.prototype._check = function (val, cb) {
  var b = typeof val == 'number' && val % 1 === 0 && isSafeLong(val);
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
LongType.prototype._read = function (tap) {
  var n = tap.readLong();
  if (!isSafeLong(n)) {
    throw new Error('potential precision loss');
  }
  return n;
};
LongType.prototype._skip = function (tap) { tap.skipLong(); };
LongType.prototype._write = function (tap, val) {
  if (typeof val != 'number' || val % 1 || !isSafeLong(val)) {
    throwInvalidError(null, val, this);
  }
  tap.writeLong(val);
};
LongType.prototype._match = function (tap1, tap2) {
  return tap1.matchLong(tap2);
};
LongType.prototype._updateResolver = function (resolver, type) {
  if (type instanceof LongType || type instanceof IntType) {
    resolver._read = type._read;
  }
};
LongType.prototype.random = function () { return RANDOM.nextInt(); };
LongType.prototype.toJSON = function () { return 'long'; };
LongType.using = function (methods, noUnpack) {
  methods = methods || {}; // Will give a more helpful error message.
  // We map some of the methods to a different name to be able to intercept
  // their input and output (otherwise we wouldn't be able to perform any
  // unpacking logic, and the type wouldn't work when nested).
  var mapping = {
    toBuffer: '_toBuffer',
    fromBuffer: '_fromBuffer',
    fromJSON: '_fromJSON',
    toJSON: '_toJSON',
    isValid: '_isValid',
    compare: 'compare'
  };
  var type = new AbstractLongType(noUnpack);
  Object.keys(mapping).forEach(function (name) {
    if (methods[name] === undefined) {
      throw new Error(f('missing method implementation: %s', name));
    }
    type[mapping[name]] = methods[name];
  });
  return type;
};

/**
 * Floats.
 *
 */
function FloatType() { PrimitiveType.call(this); }
util.inherits(FloatType, PrimitiveType);
FloatType.prototype._check = function (val, cb) {
  var b = typeof val == 'number';
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
FloatType.prototype._read = function (tap) { return tap.readFloat(); };
FloatType.prototype._skip = function (tap) { tap.skipFloat(); };
FloatType.prototype._write = function (tap, val) {
  if (typeof val != 'number') {
    throwInvalidError(null, val, this);
  }
  tap.writeFloat(val);
};
FloatType.prototype._match = function (tap1, tap2) {
  return tap1.matchFloat(tap2);
};
FloatType.prototype._updateResolver = function (resolver, type) {
  if (
    type instanceof FloatType ||
    type instanceof LongType ||
    type instanceof IntType
  ) {
    resolver._read = type._read;
  }
};
FloatType.prototype.random = function () { return RANDOM.nextFloat(1e3); };
FloatType.prototype.toJSON = function () { return 'float'; };

/**
 * Doubles.
 *
 */
function DoubleType() { PrimitiveType.call(this); }
util.inherits(DoubleType, PrimitiveType);
DoubleType.prototype._check = function (val, cb) {
  var b = typeof val == 'number';
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
DoubleType.prototype._read = function (tap) { return tap.readDouble(); };
DoubleType.prototype._skip = function (tap) { tap.skipDouble(); };
DoubleType.prototype._write = function (tap, val) {
  if (typeof val != 'number') {
    throwInvalidError(null, val, this);
  }
  tap.writeDouble(val);
};
DoubleType.prototype._match = function (tap1, tap2) {
  return tap1.matchDouble(tap2);
};
DoubleType.prototype._updateResolver = function (resolver, type) {
  if (
    type instanceof DoubleType ||
    type instanceof FloatType ||
    type instanceof LongType ||
    type instanceof IntType
  ) {
    resolver._read = type._read;
  }
};
DoubleType.prototype.random = function () { return RANDOM.nextFloat(); };
DoubleType.prototype.toJSON = function () { return 'double'; };

/**
 * Strings.
 *
 */
function StringType() { PrimitiveType.call(this); }
util.inherits(StringType, PrimitiveType);
StringType.prototype._check = function (val, cb) {
  var b = typeof val == 'string';
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
StringType.prototype._read = function (tap) { return tap.readString(); };
StringType.prototype._skip = function (tap) { tap.skipString(); };
StringType.prototype._write = function (tap, val) {
  if (typeof val != 'string') {
    throwInvalidError(null, val, this);
  }
  tap.writeString(val);
};
StringType.prototype._match = function (tap1, tap2) {
  return tap1.matchString(tap2);
};
StringType.prototype._updateResolver = function (resolver, type) {
  if (type instanceof StringType || type instanceof BytesType) {
    resolver._read = this._read;
  }
};
StringType.prototype.random = function () {
  return RANDOM.nextString(RANDOM.nextInt(32));
};
StringType.prototype.toJSON = function () { return 'string'; };

/**
 * Bytes.
 *
 * These are represented in memory as `Buffer`s rather than binary-encoded
 * strings. This is more efficient (when decoding/encoding from bytes, the
 * common use-case), idiomatic, and convenient.
 *
 * Note the coercion in `_copy`.
 *
 */
function BytesType() { PrimitiveType.call(this); }
util.inherits(BytesType, PrimitiveType);
BytesType.prototype._check = function (val, cb) {
  var b = Buffer.isBuffer(val);
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};
BytesType.prototype._read = function (tap) { return tap.readBytes(); };
BytesType.prototype._skip = function (tap) { tap.skipBytes(); };
BytesType.prototype._write = function (tap, val) {
  if (!Buffer.isBuffer(val)) {
    throwInvalidError(null, val, this);
  }
  tap.writeBytes(val);
};
BytesType.prototype._match = function (tap1, tap2) {
  return tap1.matchBytes(tap2);
};
BytesType.prototype._updateResolver = StringType.prototype._updateResolver;
BytesType.prototype._copy = function (obj, opts) {
  var buf;
  switch ((opts && opts.coerce) | 0) {
    case 3: // Coerce buffers to strings.
      this._check(obj, throwInvalidError);
      return obj.toString('binary');
    case 2: // Coerce strings to buffers.
      if (typeof obj != 'string') {
        throw new Error(f('cannot coerce to buffer: %j', obj));
      }
      buf = Buffer.from(obj, 'binary');
      this._check(buf, throwInvalidError);
      return buf;
    case 1: // Coerce buffer JSON representation to buffers.
      if (!obj || obj.type !== 'Buffer' || !(obj.data instanceof Array)) {
        throw new Error(f('cannot coerce to buffer: %j', obj));
      }
      buf = Buffer.from(obj.data);
      this._check(buf, throwInvalidError);
      return buf;
    default: // Copy buffer.
      this._check(obj, throwInvalidError);
      return Buffer.from(obj);
  }
};
BytesType.prototype.compare = Buffer.compare;
BytesType.prototype.random = function () {
  return RANDOM.nextBuffer(RANDOM.nextInt(32));
};
BytesType.prototype.toJSON = function () { return 'bytes'; };

/**
 * Avro unions.
 *
 * Unions are represented in memory similarly to their JSON representation
 * (i.e. inside an object with single key the name of the contained type).
 *
 * This is not ideal, but is the most efficient way to unambiguously support
 * all unions. Here are a few reasons why the wrapping object is necessary:
 *
 * + Unions with multiple number types would have undefined behavior, unless
 *   numbers are wrapped (either everywhere, leading to large performance and
 *   convenience costs; or only when necessary inside unions, making it hard to
 *   understand when numbers are wrapped or not).
 * + Fixed types would have to be wrapped to be distinguished from bytes.
 * + Using record's constructor names would work (after a slight change to use
 *   the fully qualified name), but would mean that generic objects could no
 *   longer be valid records (making it inconvenient to do simple things like
 *   creating new records).
 *
 * Lore: In the past (until d304cab), there used to be an "unwrapped union
 * type" which directly exposed its values, without the wrapping object
 * (similarly to Avro's python implementation). It was removed to keep all
 * representations consistent and make this library simpler to understand
 * (conversions, e.g. for schema evolution, between representations were
 * particularly confusing). Encoding was also much slower (worst case
 * complexity linear in the number of types in the union).
 *
 */
function UnionType(attrs, opts) {
  if (!(attrs instanceof Array)) {
    throw new Error(f('non-array union schema: %j', attrs));
  }
  if (!attrs.length) {
    throw new Error('empty union');
  }

  opts = getOpts(attrs, opts);
  Type.call(this);
  this._types = attrs.map(function (obj) { return createType(obj, opts); });

  this._indices = {};
  this._types.forEach(function (type, i) {
    if (type instanceof UnionType) {
      throw new Error('unions cannot be directly nested');
    }
    var name = type._name || getTypeName(type);
    if (this._indices[name] !== undefined) {
      throw new Error(f('duplicate union name: %j', name));
    }
    this._indices[name] = i;
  }, this);

  this._constructors = this._types.map(function (type) {
    // jshint -W054
    var name = type._name || getTypeName(type);
    if (name === 'null') {
      return null;
    }
    var body;
    if (~name.indexOf('.')) { // Qualified name.
      body = 'this[\'' + name + '\'] = val;';
    } else {
      body = 'this.' + name + ' = val;';
    }
    return new Function('val', body);
  });
}
util.inherits(UnionType, Type);

UnionType.prototype._check = function (val, cb) {
  var b = false;
  if (val === null) {
    // Shortcut type lookup in this case.
    b = this._indices['null'] !== undefined;
  } else if (typeof val == 'object') {
    var keys = Object.keys(val);
    if (keys.length === 1) {
      // We require a single key here to ensure that writes are correct and
      // efficient as soon as a record passes this check.
      var name = keys[0];
      var index = this._indices[name];
      if (index !== undefined) {
        PATH.push(name);
        b = this._types[index]._check(val[name], cb);
        PATH.pop();
        return b;
      }
    }
  }
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};

UnionType.prototype._read = function (tap) {
  var index = tap.readLong();
  var Class = this._constructors[index];
  if (Class) {
    return new Class(this._types[index]._read(tap));
  } else if (Class === null) {
    return null;
  } else {
    throw new Error(f('invalid union index: %s', index));
  }
};

UnionType.prototype._skip = function (tap) {
  this._types[tap.readLong()]._skip(tap);
};

UnionType.prototype._write = function (tap, val) {
  var index, keys, name;
  if (val === null) {
    index = this._indices['null'];
    if (index === undefined) {
      throwInvalidError(null, val, this);
    }
    tap.writeLong(index);
  } else {
    keys = Object.keys(val);
    if (keys.length === 1) {
      name = keys[0];
      index = this._indices[name];
    }
    if (index === undefined) {
      throwInvalidError(null, val, this);
    }
    tap.writeLong(index);
    this._types[index]._write(tap, val[name]);
  }
};

UnionType.prototype._match = function (tap1, tap2) {
  var n1 = tap1.readLong();
  var n2 = tap2.readLong();
  if (n1 === n2) {
    return this._types[n1]._match(tap1, tap2);
  } else {
    return n1 < n2 ? -1 : 1;
  }
};

UnionType.prototype._updateResolver = function (resolver, type, opts) {
  // jshint -W083
  // (The loop exits after the first function is created.)
  var i, l, typeResolver, Class;
  for (i = 0, l = this._types.length; i < l; i++) {
    try {
      typeResolver = this._types[i].createResolver(type, opts);
    } catch (err) {
      continue;
    }
    Class = this._constructors[i];
    if (Class) {
      resolver._read = function (tap) {
        return new Class(typeResolver._read(tap));
      };
    } else {
      resolver._read = function () { return null; };
    }
    return;
  }
};

UnionType.prototype._copy = function (val, opts) {
  var wrap = opts && opts.wrap | 0;
  if (wrap === 2) {
    // Promote into first type (used for schema defaults).
    if (val === null && this._constructors[0] === null) {
      return null;
    }
    return new this._constructors[0](this._types[0]._copy(val, opts));
  }
  if (val === null && this._indices['null'] !== undefined) {
    return null;
  }

  var i, l, obj;
  if (typeof val == 'object') {
    var keys = Object.keys(val);
    if (keys.length === 1) {
      var name = keys[0];
      i = this._indices[name];
      if (i === undefined) {
        // We are a bit more flexible than in `_check` here since we have
        // to deal with other serializers being less strict, so we fall
        // back to looking up unqualified names.
        var j, type;
        for (j = 0, l = this._types.length; j < l; j++) {
          type = this._types[j];
          if (type._name && name === unqualify(type._name)) {
            i = j;
            break;
          }
        }
      }
      if (i !== undefined) {
        obj = this._types[i]._copy(val[name], opts);
      }
    }
  }
  if (wrap === 1 && obj === undefined) {
    // Try promoting into first match (convenience, slow).
    i = 0;
    l = this._types.length;
    while (i < l && obj === undefined) {
      try {
        obj = this._types[i]._copy(val, opts);
      } catch (err) {
        i++;
      }
    }
  }
  if (obj !== undefined) {
    return new this._constructors[i](obj);
  }
  throwInvalidError(null, val, this);
};

UnionType.prototype.compare = function (val1, val2) {
  var name1 = val1 === null ? 'null' : Object.keys(val1)[0];
  var name2 = val2 === null ? 'null' : Object.keys(val2)[0];
  var index = this._indices[name1];
  if (name1 === name2) {
    return name1 === 'null' ?
      0 :
      this._types[index].compare(val1[name1], val2[name1]);
  } else {
    return utils.compare(index, this._indices[name2]);
  }
};

UnionType.prototype.getTypes = function () { return this._types.slice(); };

UnionType.prototype.random = function () {
  var index = RANDOM.nextInt(this._types.length);
  var Class = this._constructors[index];
  if (!Class) {
    return null;
  }
  return new Class(this._types[index].random());
};

UnionType.prototype.toJSON = function () { return this._types; };

/**
 * Avro enum type.
 *
 * Represented as strings (with allowed values from the set of symbols). Using
 * integers would be a reasonable option, but the performance boost is arguably
 * offset by the legibility cost and the extra deviation from the JSON encoding
 * convention.
 *
 * An integer representation can still be used (e.g. for compatibility with
 * TypeScript `enum`s) by overriding the `EnumType` with a `LongType` (e.g. via
 * `parse`'s registry).
 *
 */
function EnumType(attrs, opts) {
  if (!(attrs.symbols instanceof Array) || !attrs.symbols.length) {
    throw new Error(f('invalid %j enum symbols: %j', attrs.name, attrs));
  }

  opts = getOpts(attrs, opts);
  var resolutions = resolveNames(attrs, opts.namespace);
  this._name = resolutions.name;
  this._symbols = attrs.symbols;
  this._aliases = resolutions.aliases;
  Type.call(this, opts.registry);

  this._indices = {};
  this._symbols.forEach(function (symbol, i) {
    if (!NAME_PATTERN.test(symbol)) {
      throw new Error(f('invalid %s symbol: %j', this, symbol));
    }
    if (this._indices[symbol] !== undefined) {
      throw new Error(f('duplicate %s symbol: %j', this, symbol));
    }
    this._indices[symbol] = i;
  }, this);
}
util.inherits(EnumType, Type);

EnumType.prototype._check = function (val, cb) {
  var b = this._indices[val] !== undefined;
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};

EnumType.prototype._read = function (tap) {
  var index = tap.readLong();
  var symbol = this._symbols[index];
  if (symbol === undefined) {
    throw new Error(f('invalid %s enum index: %s', this._name, index));
  }
  return symbol;
};

EnumType.prototype._skip = function (tap) { tap.skipLong(); };

EnumType.prototype._write = function (tap, val) {
  var index = this._indices[val];
  if (index === undefined) {
    throwInvalidError(null, val, this);
  }
  tap.writeLong(index);
};

EnumType.prototype._match = function (tap1, tap2) {
  return tap1.matchLong(tap2);
};

EnumType.prototype.compare = function (val1, val2) {
  return utils.compare(this._indices[val1], this._indices[val2]);
};

EnumType.prototype._updateResolver = function (resolver, type) {
  var symbols = this._symbols;
  if (
    type instanceof EnumType &&
    ~getAliases(this).indexOf(type._name) &&
    type._symbols.every(function (s) { return ~symbols.indexOf(s); })
  ) {
    resolver._symbols = type._symbols;
    resolver._read = type._read;
  }
};

EnumType.prototype._copy = function (val) {
  this._check(val, throwInvalidError);
  return val;
};

EnumType.prototype.getAliases = function () { return this._aliases; };

EnumType.prototype.getSymbols = function () { return this._symbols.slice(); };

EnumType.prototype.random = function () {
  return RANDOM.choice(this._symbols);
};

EnumType.prototype.toJSON = function () {
  return {name: this._name, type: 'enum', symbols: this._symbols};
};

/**
 * Avro fixed type.
 *
 * Represented simply as a `Buffer`.
 *
 */
function FixedType(attrs, opts) {
  if (attrs.size !== (attrs.size | 0) || attrs.size < 1) {
    throw new Error(f('invalid %j fixed size: %j', attrs.name, attrs.size));
  }

  opts = getOpts(attrs, opts);
  var resolutions = resolveNames(attrs, opts.namespace);
  this._name = resolutions.name;
  this._size = attrs.size | 0;
  this._aliases = resolutions.aliases;
  Type.call(this, opts.registry);
}
util.inherits(FixedType, Type);

FixedType.prototype._check = function (val, cb) {
  var b = Buffer.isBuffer(val) && val.length === this._size;
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};

FixedType.prototype._read = function (tap) {
  return tap.readFixed(this._size);
};

FixedType.prototype._skip = function (tap) {
  tap.skipFixed(this._size);
};

FixedType.prototype._write = function (tap, val) {
  if (!Buffer.isBuffer(val) || val.length !== this._size) {
    throwInvalidError(null, val, this);
  }
  tap.writeFixed(val, this._size);
};

FixedType.prototype._match = function (tap1, tap2) {
  return tap1.matchFixed(tap2, this._size);
};

FixedType.prototype.compare = Buffer.compare;

FixedType.prototype._updateResolver = function (resolver, type) {
  if (
    type instanceof FixedType &&
    this._size === type._size &&
    ~getAliases(this).indexOf(type._name)
  ) {
    resolver._size = this._size;
    resolver._read = this._read;
  }
};

FixedType.prototype._copy = BytesType.prototype._copy;

FixedType.prototype.getAliases = function () { return this._aliases; };

FixedType.prototype.getSize = function () { return this._size; };

FixedType.prototype.random = function () {
  return RANDOM.nextBuffer(this._size);
};

FixedType.prototype.toJSON = function () {
  return {name: this._name, type: 'fixed', size: this._size};
};

/**
 * Avro map.
 *
 * Represented as vanilla objects.
 *
 */
function MapType(attrs, opts) {
  if (!attrs.values) {
    throw new Error(f('missing map values: %j', attrs));
  }

  opts = getOpts(attrs, opts);
  Type.call(this);
  this._values = createType(attrs.values, opts);
}
util.inherits(MapType, Type);

MapType.prototype.getValuesType = function () { return this._values; };

MapType.prototype._check = function (val, cb) {
  if (!val || typeof val != 'object' || val instanceof Array) {
    if (cb) {
      cb(PATH.slice(), val, this);
    }
    return false;
  }

  var keys = Object.keys(val);
  var b = true;
  var i, l, j, key;
  if (cb) {
    // Slow path.
    j = PATH.length;
    PATH.push('');
    for (i = 0, l = keys.length; i < l; i++) {
      key = PATH[j] = keys[i];
      if (!this._values._check(val[key], cb)) {
        b = false;
      }
    }
    PATH.pop();
  } else {
    for (i = 0, l = keys.length; i < l; i++) {
      if (!this._values._check(val[keys[i]], cb)) {
        return false;
      }
    }
  }
  return b;
};

MapType.prototype._read = function (tap) {
  var values = this._values;
  var val = {};
  var n;
  while ((n = readArraySize(tap))) {
    while (n--) {
      var key = tap.readString();
      val[key] = values._read(tap);
    }
  }
  return val;
};

MapType.prototype._skip = function (tap) {
  var values = this._values;
  var len, n;
  while ((n = tap.readLong())) {
    if (n < 0) {
      len = tap.readLong();
      tap.pos += len;
    } else {
      while (n--) {
        tap.skipString();
        values._skip(tap);
      }
    }
  }
};

MapType.prototype._write = function (tap, val) {
  if (!val || typeof val != 'object' || val instanceof Array) {
    throwInvalidError(null, val, this);
  }

  var values = this._values;
  var keys = Object.keys(val);
  var n = keys.length;
  var i, key;
  if (n) {
    tap.writeLong(n);
    for (i = 0; i < n; i++) {
      key = keys[i];
      tap.writeString(key);
      values._write(tap, val[key]);
    }
  }
  tap.writeLong(0);
};

MapType.prototype._match = function () {
  throw new Error('maps cannot be compared');
};

MapType.prototype._updateResolver = function (resolver, type, opts) {
  if (type instanceof MapType) {
    resolver._values = this._values.createResolver(type._values, opts);
    resolver._read = this._read;
  }
};

MapType.prototype._copy = function (val, opts) {
  if (val && typeof val == 'object' && !(val instanceof Array)) {
    var values = this._values;
    var keys = Object.keys(val);
    var i, l, key;
    var copy = {};
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      copy[key] = values._copy(val[key], opts);
    }
    return copy;
  }
  throwInvalidError(null, val, this);
};

MapType.prototype.compare = MapType.prototype._match;

MapType.prototype.random = function () {
  var val = {};
  var i, l;
  for (i = 0, l = RANDOM.nextInt(10); i < l; i++) {
    val[RANDOM.nextString(RANDOM.nextInt(20))] = this._values.random();
  }
  return val;
};

MapType.prototype.toJSON = function () {
  return {type: 'map', values: this._values};
};

/**
 * Avro array.
 *
 * Represented as vanilla arrays.
 *
 */
function ArrayType(attrs, opts) {
  if (!attrs.items) {
    throw new Error(f('missing array items: %j', attrs));
  }

  opts = getOpts(attrs, opts);

  this._items = createType(attrs.items, opts);
  Type.call(this);
}
util.inherits(ArrayType, Type);

ArrayType.prototype._check = function (val, cb) {
  if (!(val instanceof Array)) {
    if (cb) {
      cb(PATH.slice(), val, this);
    }
    return false;
  }

  var b = true;
  var i, l, j;
  if (cb) {
    // Slow path.
    j = PATH.length;
    PATH.push('');
    for (i = 0, l = val.length; i < l; i++) {
      PATH[j] = '' + i;
      if (!this._items._check(val[i], cb)) {
        b = false;
      }
    }
    PATH.pop();
  } else {
    for (i = 0, l = val.length; i < l; i++) {
      if (!this._items._check(val[i], cb)) {
        return false;
      }
    }
  }
  return b;
};

ArrayType.prototype._read = function (tap) {
  var items = this._items;
  var val = [];
  var n;
  while ((n = tap.readLong())) {
    if (n < 0) {
      n = -n;
      tap.skipLong(); // Skip size.
    }
    while (n--) {
      val.push(items._read(tap));
    }
  }
  return val;
};

ArrayType.prototype._skip = function (tap) {
  var len, n;
  while ((n = tap.readLong())) {
    if (n < 0) {
      len = tap.readLong();
      tap.pos += len;
    } else {
      while (n--) {
        this._items._skip(tap);
      }
    }
  }
};

ArrayType.prototype._write = function (tap, val) {
  if (!(val instanceof Array)) {
    throwInvalidError(null, val, this);
  }

  var n = val.length;
  var i;
  if (n) {
    tap.writeLong(n);
    for (i = 0; i < n; i++) {
      this._items._write(tap, val[i]);
    }
  }
  tap.writeLong(0);
};

ArrayType.prototype._match = function (tap1, tap2) {
  var n1 = tap1.readLong();
  var n2 = tap2.readLong();
  var f;
  while (n1 && n2) {
    f = this._items._match(tap1, tap2);
    if (f) {
      return f;
    }
    if (!--n1) {
      n1 = readArraySize(tap1);
    }
    if (!--n2) {
      n2 = readArraySize(tap2);
    }
  }
  return utils.compare(n1, n2);
};

ArrayType.prototype._updateResolver = function (resolver, type, opts) {
  if (type instanceof ArrayType) {
    resolver._items = this._items.createResolver(type._items, opts);
    resolver._read = this._read;
  }
};

ArrayType.prototype._copy = function (val, opts) {
  if (!(val instanceof Array)) {
    throwInvalidError(null, val, this);
  }
  var items = [];
  var i, l;
  for (i = 0, l = val.length; i < l; i++) {
    items.push(this._items._copy(val[i], opts));
  }
  return items;
};

ArrayType.prototype.compare = function (val1, val2) {
  var n1 = val1.length;
  var n2 = val2.length;
  var i, l, f;
  for (i = 0, l = Math.min(n1, n2); i < l; i++) {
    if ((f = this._items.compare(val1[i], val2[i]))) {
      return f;
    }
  }
  return utils.compare(n1, n2);
};

ArrayType.prototype.getItemsType = function () { return this._items; };

ArrayType.prototype.random = function () {
  var arr = [];
  var i, l;
  for (i = 0, l = RANDOM.nextInt(10); i < l; i++) {
    arr.push(this._items.random());
  }
  return arr;
};

ArrayType.prototype.toJSON = function () {
  return {type: 'array', items: this._items};
};

/**
 * Avro record.
 *
 * Values are represented as instances of a programmatically generated
 * constructor (similar to a "specific record"), available via the
 * `getRecordConstructor` method. This "specific record class" gives
 * significant speedups over using generics objects.
 *
 * Note that vanilla objects are still accepted as valid as long as their
 * fields match (this makes it much more convenient to do simple things like
 * update nested records).
 *
 */
function RecordType(attrs, opts) {
  opts = getOpts(attrs, opts);

  var resolutions = resolveNames(attrs, opts.namespace);
  this._name = resolutions.name;
  this._aliases = resolutions.aliases;
  this._type = attrs.type;
  // Requests shouldn't be registered since their name is only a placeholder.
  Type.call(this, this._type === 'request' ? undefined : opts.registry);

  if (!(attrs.fields instanceof Array)) {
    throw new Error(f('non-array %s fields', this._name));
  }
  this._fields = attrs.fields.map(function (f) {
    return new Field(f, opts);
  });
  if (utils.hasDuplicates(attrs.fields, function (f) { return f.name; })) {
    throw new Error(f('duplicate %s field name', this._name));
  }

  var isError = attrs.type === 'error';
  this._constructor = this._createConstructor(isError);
  this._read = this._createReader();
  this._skip = this._createSkipper();
  this._write = this._createWriter();
  this._check = this._createChecker();
}
util.inherits(RecordType, Type);

RecordType.prototype._createConstructor = function (isError) {
  // jshint -W054
  var outerArgs = [];
  var innerArgs = [];
  var ds = []; // Defaults.
  var innerBody = isError ? '  Error.call(this);\n' : '';
  // Not calling `Error.captureStackTrace` because this wouldn't be compatible
  // with browsers other than Chrome.
  var i, l, field, name, getDefault;
  for (i = 0, l = this._fields.length; i < l; i++) {
    field = this._fields[i];
    getDefault = field.getDefault;
    name = field._name;
    innerArgs.push('v' + i);
    innerBody += '  ';
    if (getDefault() === undefined) {
      innerBody += 'this.' + name + ' = v' + i + ';\n';
    } else {
      innerBody += 'if (v' + i + ' === undefined) { ';
      innerBody += 'this.' + name + ' = d' + ds.length + '(); ';
      innerBody += '} else { this.' + name + ' = v' + i + '; }\n';
      outerArgs.push('d' + ds.length);
      ds.push(getDefault);
    }
  }
  var outerBody = 'return function ' + unqualify(this._name) + '(';
  outerBody += innerArgs.join() + ') {\n' + innerBody + '};';
  var Record = new Function(outerArgs.join(), outerBody).apply(undefined, ds);

  var self = this;
  Record.getType = function () { return self; };
  Record.prototype = {
    constructor: Record,
    $clone: function (opts) { return self.clone(this, opts); },
    $compare: function (val) { return self.compare(this, val); },
    $getType: Record.getType,
    $isValid: function (opts) { return self.isValid(this, opts); },
    $toBuffer: function () { return self.toBuffer(this); },
    $toString: function (noCheck) { return self.toString(this, noCheck); }
  };
  // The names of these properties added to the prototype are prefixed with `$`
  // because it is an invalid property name in Avro but not in JavaScript.
  // (This way we are guaranteed not to be stepped over!)
  if (isError) {
    util.inherits(Record, Error);
    // Not setting the name on the prototype to be consistent with how object
    // fields are mapped to (only if defined in the schema as a field).
  }

  return Record;
};

RecordType.prototype._createChecker = function () {
  // jshint -W054
  var names = ['t', 'P'];
  var values = [this, PATH];
  var body = 'return function check' + unqualify(this._name) + '(val, cb) {\n';
  body += '  if (val === null || typeof val != \'object\') {\n';
  body += '    if (cb) { cb(P.slice(), val, t); }\n';
  body += '    return false;\n';
  body += '  }\n';
  if (!this._fields.length) {
    // Special case, empty record. We handle this directly.
    body += '  return true;\n';
  } else {
    for (i = 0, l = this._fields.length; i < l; i++) {
      field = this._fields[i];
      names.push('t' + i);
      values.push(field._type);
      if (field.getDefault() !== undefined) {
        body += '  var v' + i + ' = val.' + field._name + ';\n';
      }
    }
    body += '  if (cb) {\n';
    body += '    var b = 1;\n';
    body += '    var j = P.length;\n';
    body += '    P.push(\'\');\n';
    var i, l, field;
    for (i = 0, l = this._fields.length; i < l; i++) {
      field = this._fields[i];
      body += '    P[j] = \'' + field._name + '\';\n';
      if (field.getDefault() === undefined) {
        body += '    b &= t' + i + '._check(val.' + field._name + ', cb);\n';
      } else {
        body += '    b &= v' + i + ' === undefined || ';
        body += 't' + i + '._check(v' + i + ', cb);\n';
      }
    }
    body += '    P.pop();\n';
    body += '    return !!b;\n';
    body += '  } else {\n    return (\n      ';
    body += this._fields.map(function (field, i) {
      if (field.getDefault() === undefined) {
        return 't' + i + '._check(val.' + field._name + ')';
      } else {
        return '(v' + i + ' === undefined || t' + i + '._check(v' + i + '))';
      }
    }).join(' &&\n      ');
    body += '\n    );\n  }\n';
  }
  body += '};';
  return new Function(names.join(), body).apply(undefined, values);
};

RecordType.prototype._createReader = function () {
  // jshint -W054
  var uname = unqualify(this._name);
  var names = [];
  var values = [this._constructor];
  var i, l;
  for (i = 0, l = this._fields.length; i < l; i++) {
    names.push('t' + i);
    values.push(this._fields[i]._type);
  }
  var body = 'return function read' + uname + '(tap) {\n';
  body += '  return new ' + uname + '(';
  body += names.map(function (t) { return t + '._read(tap)'; }).join();
  body += ');\n};';
  names.unshift(uname);
  // We can do this since the JS spec guarantees that function arguments are
  // evaluated from left to right.
  return new Function(names.join(), body).apply(undefined, values);
};

RecordType.prototype._createSkipper = function () {
  // jshint -W054
  var args = [];
  var body = 'return function skip' + unqualify(this._name) + '(tap) {\n';
  var values = [];
  var i, l;
  for (i = 0, l = this._fields.length; i < l; i++) {
    args.push('t' + i);
    values.push(this._fields[i]._type);
    body += '  t' + i + '._skip(tap);\n';
  }
  body += '}';
  return new Function(args.join(), body).apply(undefined, values);
};

RecordType.prototype._createWriter = function () {
  // jshint -W054
  // We still do default handling here, in case a normal JS object is passed.
  var args = [];
  var body = 'return function write' + unqualify(this._name) + '(tap, val) {\n';
  var values = [];
  var i, l, field, value;
  for (i = 0, l = this._fields.length; i < l; i++) {
    field = this._fields[i];
    args.push('t' + i);
    values.push(field._type);
    body += '  ';
    if (field.getDefault() === undefined) {
      body += 't' + i + '._write(tap, val.' + field._name + ');\n';
    } else {
      value = field._type.toBuffer(field.getDefault()).toString('binary');
      // Convert the default value to a binary string ahead of time. We aren't
      // converting it to a buffer to avoid retaining too much memory. If we
      // had our own buffer pool, this could be an idea in the future.
      args.push('d' + i);
      values.push(value);
      body += 'var v' + i + ' = val.' + field._name + '; ';
      body += 'if (v' + i + ' === undefined) { ';
      body += 'tap.writeBinary(d' + i + ', ' + value.length + ');';
      body += ' } else { t' + i + '._write(tap, v' + i + '); }\n';
    }
  }
  body += '}';
  return new Function(args.join(), body).apply(undefined, values);
};

RecordType.prototype._updateResolver = function (resolver, type, opts) {
  // jshint -W054
  if (!~getAliases(this).indexOf(type._name)) {
    throw new Error(f('no alias for %s in %s', type._name, this._name));
  }

  var rFields = this._fields;
  var wFields = type._fields;
  var wFieldsMap = utils.toMap(wFields, function (f) { return f._name; });

  var innerArgs = []; // Arguments for reader constructor.
  var resolvers = {}; // Resolvers keyed by writer field name.
  var i, j, field, name, names, matches;
  for (i = 0; i < rFields.length; i++) {
    field = rFields[i];
    names = getAliases(field);
    matches = [];
    for (j = 0; j < names.length; j++) {
      name = names[j];
      if (wFieldsMap[name]) {
        matches.push(name);
      }
    }
    if (matches.length > 1) {
      throw new Error(f('multiple matches for %s', field.name));
    }
    if (!matches.length) {
      if (field.getDefault() === undefined) {
        throw new Error(f('no match for default-less %s', field.name));
      }
      innerArgs.push('undefined');
    } else {
      name = matches[0];
      resolvers[name] = {
        resolver: field._type.createResolver(wFieldsMap[name]._type, opts),
        name: field._name // Reader field name.
      };
      innerArgs.push(field._name);
    }
  }

  // See if we can add a bypass for unused fields at the end of the record.
  var lazyIndex = -1;
  i = wFields.length;
  while (i && resolvers[wFields[--i]._name] === undefined) {
    lazyIndex = i;
  }

  var uname = unqualify(this._name);
  var args = [uname];
  var values = [this._constructor];
  var body = '  return function read' + uname + '(tap,lazy) {\n';
  for (i = 0; i < wFields.length; i++) {
    if (i === lazyIndex) {
      body += '  if (!lazy) {\n';
    }
    field = type._fields[i];
    name = field._name;
    body += (~lazyIndex && i >= lazyIndex) ? '    ' : '  ';
    if (resolvers[name] === undefined) {
      args.push('t' + i);
      values.push(field._type);
      body += 't' + i + '._skip(tap);\n';
    } else {
      args.push('t' + i);
      values.push(resolvers[name].resolver);
      body += 'var ' + resolvers[name].name + ' = ';
      body += 't' + i + '._read(tap);\n';
    }
  }
  if (~lazyIndex) {
    body += '  }\n';
  }
  body +=  '  return new ' + uname + '(' + innerArgs.join() + ');\n};';

  resolver._read = new Function(args.join(), body).apply(undefined, values);
};

RecordType.prototype._match = function (tap1, tap2) {
  var fields = this._fields;
  var i, l, field, order, type;
  for (i = 0, l = fields.length; i < l; i++) {
    field = fields[i];
    order = field._order;
    type = field._type;
    if (order) {
      order *= type._match(tap1, tap2);
      if (order) {
        return order;
      }
    } else {
      type._skip(tap1);
      type._skip(tap2);
    }
  }
  return 0;
};

RecordType.prototype._copy = function (val, opts) {
  // jshint -W058
  var hook = opts && opts.fieldHook;
  var values = [undefined];
  var i, l, field, value;
  for (i = 0, l = this._fields.length; i < l; i++) {
    field = this._fields[i];
    value = field._type._copy(typeof val[field._name] == 'undefined' ? field.getDefault() : val[field._name], opts);
    if (hook) {
      value = hook(field, value, this);
    }
    values.push(value);
  }
  return new (this._constructor.bind.apply(this._constructor, values));
};

RecordType.prototype.compare = function (val1, val2) {
  var fields = this._fields;
  var i, l, field, name, order, type;
  for (i = 0, l = fields.length; i < l; i++) {
    field = fields[i];
    name = field._name;
    order = field._order;
    type = field._type;
    if (order) {
      order *= type.compare(val1[name], val2[name]);
      if (order) {
        return order;
      }
    }
  }
  return 0;
};

RecordType.prototype.random = function () {
  // jshint -W058
  var fields = this._fields.map(function (f) { return f._type.random(); });
  fields.unshift(undefined);
  return new (this._constructor.bind.apply(this._constructor, fields));
};

RecordType.prototype.getAliases = function () { return this._aliases; };

RecordType.prototype.getFields = function () { return this._fields.slice(); };

RecordType.prototype.getRecordConstructor = function () {
  return this._constructor;
};

RecordType.prototype.toJSON = function () {
  return {name: this._name, type: 'record', fields: this._fields};
};

/**
 * Derived type abstract class.
 *
 */
function LogicalType(attrs, opts, Types) {
  Type.call(this);
  LOGICAL_TYPE = this;
  this._underlyingType = createType(attrs, opts);

  // Convenience type check.
  if (Types && !~Types.indexOf(this._underlyingType.constructor)) {
    var lType = attrs.logicalType;
    var uType = this._underlyingType;
    throw new Error(f('invalid underlying type for %s: %s', lType, uType));
  }
}
util.inherits(LogicalType, Type);

LogicalType.prototype.getUnderlyingType = function () {
  return this._underlyingType;
};

LogicalType.prototype._read = function (tap) {
  return this._fromValue(this._underlyingType._read(tap));
};

LogicalType.prototype._write = function (tap, any) {
  this._underlyingType._write(tap, this._toValue(any));
};

LogicalType.prototype._check = function (any, cb) {
  var val;
  try {
    val = this._toValue(any);
  } catch (err) {
    if (cb) {
      cb(PATH.slice(), any, this);
    }
    return false;
  }
  return this._underlyingType._check(val, cb);
};

LogicalType.prototype._copy = function (any, opts) {
  var type = this._underlyingType;
  switch (opts && opts.coerce) {
    case 3: // To string.
      return type._copy(this._toValue(any), opts);
    case 2: // From string.
      return this._fromValue(type._copy(any, opts));
    default: // Normal copy.
      return this._fromValue(type._copy(this._toValue(any), opts));
  }
};

LogicalType.prototype._updateResolver = function (resolver, type, opts) {
  var _fromValue = this._resolve(type, opts);
  if (_fromValue) {
    resolver._read = function (tap) { return _fromValue(type._read(tap)); };
  }
};

LogicalType.prototype.random = function () {
  return this._fromValue(this._underlyingType.random());
};

LogicalType.prototype.compare = function (obj1, obj2) {
  var val1 = this._toValue(obj1);
  var val2 = this._toValue(obj2);
  return this._underlyingType.compare(val1, val2);
};

LogicalType.prototype.toJSON = function () {
  return this._underlyingType.toJSON();
};

// Methods to be implemented.
LogicalType.prototype._fromValue = utils.abstractFunction;
LogicalType.prototype._toValue = utils.abstractFunction;
LogicalType.prototype._resolve = utils.abstractFunction;


// General helpers.

/**
 * Customizable long.
 *
 * This allows support of arbitrarily large long (e.g. larger than
 * `Number.MAX_SAFE_INTEGER`). See `LongType.using` method above.
 *
 */
function AbstractLongType(noUnpack) {
  LongType.call(this);
  this._noUnpack = !!noUnpack;
}
util.inherits(AbstractLongType, LongType);

AbstractLongType.prototype._check = function (val, cb) {
  var b = this._isValid(val);
  if (!b && cb) {
    cb(PATH.slice(), val, this);
  }
  return b;
};

AbstractLongType.prototype._read = function (tap) {
  var buf, pos;
  if (this._noUnpack) {
    pos = tap.pos;
    tap.skipLong();
    buf = tap.buf.slice(pos, tap.pos);
  } else {
    buf = tap.unpackLongBytes(tap);
  }
  if (tap.isValid()) {
    return this._fromBuffer(buf);
  }
};

AbstractLongType.prototype._write = function (tap, val) {
  if (!this._isValid(val)) {
    throwInvalidError(null, val, this);
  }
  var buf = this._toBuffer(val);
  if (this._noUnpack) {
    tap.writeFixed(buf);
  } else {
    tap.packLongBytes(buf);
  }
};

AbstractLongType.prototype._copy = function (val, opts) {
  switch (opts && opts.coerce) {
    case 3: // To string.
      return this._toJSON(val);
    case 2: // From string.
      return this._fromJSON(val);
    default: // Normal copy.
      // Slow but guarantees most consistent results. Faster alternatives would
      // require assumptions on the long class used (e.g. immutability).
      return this._fromJSON(JSON.parse(JSON.stringify(this._toJSON(val))));
  }
};

AbstractLongType.prototype.random = function () {
  return this._fromJSON(LongType.prototype.random());
};

// Methods to be implemented by the user.
AbstractLongType.prototype._fromBuffer = utils.abstractFunction;
AbstractLongType.prototype._toBuffer = utils.abstractFunction;
AbstractLongType.prototype._fromJSON = utils.abstractFunction;
AbstractLongType.prototype._toJSON = utils.abstractFunction;
AbstractLongType.prototype._isValid = utils.abstractFunction;
AbstractLongType.prototype.compare = utils.abstractFunction;

/**
 * Field.
 *
 * @param attrs {Object} The field's schema.
 * @para opts {Object} Schema parsing options (the same as `Type`s').
 *
 */
function Field(attrs, opts) {
  var name = attrs.name;
  if (typeof name != 'string' || !NAME_PATTERN.test(name)) {
    throw new Error(f('invalid field name: %s', name));
  }

  this._name = name;
  this._type = createType(attrs.type, opts);
  this._aliases = attrs.aliases || [];

  this._order = (function (order) {
    switch (order) {
      case 'ascending':
        return 1;
      case 'descending':
        return -1;
      case 'ignore':
        return 0;
      default:
        throw new Error(f('invalid order: %j', order));
    }
  })(attrs.order === undefined ? 'ascending' : attrs.order);

  var value = attrs['default'];
  if (value !== undefined) {
    // We need to convert defaults back to a valid format (unions are
    // disallowed in default definitions, only the first type of each union is
    // allowed instead).
    // http://apache-avro.679487.n3.nabble.com/field-union-default-in-Java-td1175327.html
    var type = this._type;
    var val = type._copy(value, {coerce: 2, wrap: 2});
    // The clone call above will throw an error if the default is invalid.
    if (type instanceof PrimitiveType && !(type instanceof BytesType)) {
      // These are immutable.
      this.getDefault = function () { return val; };
    } else {
      this.getDefault = function () { return type._copy(val); };
    }
  }
}

Field.prototype.getAliases = function () { return this._aliases; };

Field.prototype.getDefault = function () {}; // Undefined default.

Field.prototype.getName = function () { return this._name; };

Field.prototype.getOrder = function () {
  return ['descending', 'ignore', 'ascending'][this._order + 1];
};

Field.prototype.getType = function () { return this._type; };

Field.prototype.inspect = function () { return f('<Field %j>', this._name); };

/**
 * Resolver to read a writer's schema as a new schema.
 *
 * @param readerType {Type} The type to convert to.
 *
 */
function Resolver(readerType) {
  // Add all fields here so that all resolvers share the same hidden class.
  this._readerType = readerType;
  this._items = null;
  this._read = null;
  this._size = 0;
  this._symbols = null;
  this._values = null;
}

Resolver.prototype.inspect = function () { return '<Resolver>'; };

/**
 * Read a value from a tap.
 *
 * @param type {Type} The type to decode.
 * @param tap {Tap} The tap to read from. No checks are performed here.
 * @param resolver {Resolver} Optional resolver. It must match the input type.
 * @param lazy {Boolean} Skip trailing fields when using a resolver.
 *
 */
function readValue(type, tap, resolver, lazy) {
  if (resolver) {
    if (resolver._readerType !== type) {
      throw new Error('invalid resolver');
    }
    return resolver._read(tap, lazy);
  } else {
    return type._read(tap);
  }
}

/**
 * Create default parsing options.
 *
 * @param attrs {Object} Schema to populate options with.
 * @param opts {Object} Base options.
 *
 */
function getOpts(attrs, opts) {
  if (attrs === null) {
    // Let's be helpful for this common error.
    throw new Error('invalid type: null (did you mean "null"?)');
  }
  opts = opts || {};
  opts.registry = opts.registry || {};
  opts.namespace = attrs.namespace || opts.namespace;
  opts.logicalTypes = opts.logicalTypes || {};
  return opts;
}

/**
 * Resolve a schema's name and aliases.
 *
 * @param attrs {Object} True schema (can't be a string).
 * @param namespace {String} Optional parent namespace.
 * @param key {String} Key where the name should be looked up (defaults to
 * `name`).
 *
 */
function resolveNames(attrs, namespace, key) {
  namespace = attrs.namespace || namespace;
  key = key || 'name';

  var name = attrs[key];
  if (!name) {
    throw new Error(f('missing %s property in schema: %j', key, attrs));
  }
  return {
    name: qualify(name),
    aliases: attrs.aliases ? attrs.aliases.map(qualify) : []
  };

  function qualify(name) {
    if (!~name.indexOf('.') && namespace) {
      name = namespace + '.' + name;
    }
    var tail = unqualify(name);
    if (isPrimitive(tail)) {
      // Primitive types cannot be defined in any namespace.
      throw new Error(f('cannot rename primitive type: %j', tail));
    }
    name.split('.').forEach(function (part) {
      if (!NAME_PATTERN.test(part)) {
        throw new Error(f('invalid name: %j', name));
      }
    });
    return name;
  }
}

/**
 * Remove namespace from a name.
 *
 * @param name {String} Full or short name.
 *
 */
function unqualify(name) {
  var parts = name.split('.');
  return parts[parts.length - 1];
}

/**
 * Get all aliases for a type (including its name).
 *
 * @param obj {Type|Object} Typically a type or a field. Its aliases property
 * must exist and be an array.
 *
 */
function getAliases(obj) {
  var names = [obj._name];
  var aliases = obj._aliases;
  var i, l;
  for (i = 0, l = aliases.length; i < l; i++) {
    names.push(aliases[i]);
  }
  return names;
}

/**
 * Get a type's "type" (as a string, e.g. `'record'`, `'string'`).
 *
 * @param type {Type} Any type.
 *
 */
function getTypeName(type) {
  var obj = type.toJSON();
  return typeof obj == 'string' ? obj : obj.type;
}

/**
 * Check whether a type's name is a primitive.
 *
 * @param name {String} Type name (e.g. `'string'`, `'array'`).
 *
 */
function isPrimitive(name) {
  var type = TYPES[name];
  return type !== undefined && type.prototype instanceof PrimitiveType;
}

/**
 * Get the number of elements in an array block.
 *
 * @param tap {Tap} A tap positioned at the beginning of an array block.
 *
 */
function readArraySize(tap) {
  var n = tap.readLong();
  if (n < 0) {
    n = -n;
    tap.skipLong(); // Skip size.
  }
  return n;
}

/**
 * Correctly stringify an object which contains types.
 *
 * @param obj {Object} The object to stringify. Typically, a type itself or an
 * object containing types. Any types inside will be expanded only once then
 * referenced by name.
 * @param noDeref {Boolean} Always reference types by name when possible,
 * rather than expand it the first time it is encountered.
 *
 */
function stringify(obj, noDeref) {
  // Since JS objects are unordered, this implementation (unfortunately)
  // relies on engines returning properties in the same order that they are
  // inserted in. This is not in the JS spec, but can be "somewhat" safely
  // assumed (more here: https://stackoverflow.com/q/5525795/1062617).
  return (function (registry) {
    return JSON.stringify(obj, function (key, value) {
      if (value instanceof Field) {
        return {name: value._name, type: value._type};
      } else if (value && value.name) {
        var name = value.name;
        if (noDeref || registry[name]) {
          return name;
        }
        registry[name] = true;
      }
      return value;
    });
  })({});
}

/**
 * Check whether a long can be represented without precision loss.
 *
 * @param n {Number} The number.
 *
 * Two things to note:
 *
 * + We are not using the `Number` constants for compatibility with older
 *   browsers.
 * + We must remove one from each bound because of rounding errors.
 *
 */
function isSafeLong(n) {
  return n >= -9007199254740990 && n <= 9007199254740990;
}

/**
 * Throw a somewhat helpful error on invalid object.
 *
 * @param path {Array} Passed from hook, but unused (because empty where this
 * function is used, since we aren't keeping track of it for effiency).
 * @param val {...} The object to reject.
 * @param type {Type} The type to check against.
 *
 * This method is mostly used from `_write` to signal an invalid object for a
 * given type. Note that this provides less information than calling `isValid`
 * with a hook since the path is not propagated (for efficiency reasons).
 *
 */
function throwInvalidError(path, val, type) {
  throw new Error(f('invalid %s: %j', type, val));
}


module.exports = {
  createType: createType,
  resolveNames: resolveNames, // Protocols use the same name resolution logic.
  stringify: stringify,
  types: (function () {
    // Export the base types along with all concrete implementations.
    var obj = {Type: Type, LogicalType: LogicalType};
    var types = Object.keys(TYPES);
    var i, l, Class;
    for (i = 0, l = types.length; i < l; i++) {
      Class = TYPES[types[i]];
      obj[Class.name] = Class;
    }
    return obj;
  })()
};


/***/ }),

/***/ 1333:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/* jshint node: true */

/**
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */



var crypto = __nccwpck_require__(6113);


/**
 * Uppercase the first letter of a string.
 *
 * @param s {String} The string.
 *
 */
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/**
 * Compare two numbers.
 *
 * @param n1 {Number} The first one.
 * @param n2 {Number} The second one.
 *
 */
function compare(n1, n2) { return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1); }

/**
 * Compute a string's hash.
 *
 * @param str {String} The string to hash.
 * @param algorithm {String} The algorithm used. Defaults to MD5.
 *
 */
function getHash(str, algorithm) {
  algorithm = algorithm || 'md5';
  var hash = crypto.createHash(algorithm);
  hash.end(str);
  return hash.read();
}

/**
 * Find index of value in array.
 *
 * @param arr {Array} Can also be a false-ish value.
 * @param v {Object} Value to find.
 *
 * Returns -1 if not found, -2 if found multiple times.
 *
 */
function singleIndexOf(arr, v) {
  var pos = -1;
  var i, l;
  if (!arr) {
    return -1;
  }
  for (i = 0, l = arr.length; i < l; i++) {
    if (arr[i] === v) {
      if (pos >= 0) {
        return -2;
      }
      pos = i;
    }
  }
  return pos;
}

/**
 * Convert array to map.
 *
 * @param arr {Array} Elements.
 * @param fn {Function} Function returning an element's key.
 *
 */
function toMap(arr, fn) {
  var obj = {};
  var i, elem;
  for (i = 0; i < arr.length; i++) {
    elem = arr[i];
    obj[fn(elem)] = elem;
  }
  return obj;
}

/**
 * Check whether an array has duplicates.
 *
 * @param arr {Array} The array.
 * @param fn {Function} Optional function to apply to each element.
 *
 */
function hasDuplicates(arr, fn) {
  var obj = {};
  var i, l, elem;
  for (i = 0, l = arr.length; i < l; i++) {
    elem = arr[i];
    if (fn) {
      elem = fn(elem);
    }
    if (obj[elem]) {
      return true;
    }
    obj[elem] = true;
  }
  return false;
}

/**
 * "Abstract" function to help with "subclassing".
 *
 */
function abstractFunction() { throw new Error('abstract'); }

/**
 * Generator of random things.
 *
 * Inspired by: https://stackoverflow.com/a/424445/1062617
 *
 */
function Lcg(seed) {
  var a = 1103515245;
  var c = 12345;
  var m = Math.pow(2, 31);
  var state = Math.floor(seed || Math.random() * (m - 1));

  this._max = m;
  this._nextInt = function () {
    state = (a * state + c) % m;
    return state;
  };
}

Lcg.prototype.nextBoolean = function () {
  // jshint -W018
  return !!(this._nextInt() % 2);
};

Lcg.prototype.nextInt = function (start, end) {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  end = end === undefined ? this._max : end;
  return start + Math.floor(this.nextFloat() * (end - start));
};

Lcg.prototype.nextFloat = function (start, end) {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  end = end === undefined ? 1 : end;
  return start + (end - start) * this._nextInt() / this._max;
};

Lcg.prototype.nextString = function(len, flags) {
  len |= 0;
  flags = flags || 'aA';
  var mask = '';
  if (flags.indexOf('a') > -1) {
    mask += 'abcdefghijklmnopqrstuvwxyz';
  }
  if (flags.indexOf('A') > -1) {
    mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  if (flags.indexOf('#') > -1) {
    mask += '0123456789';
  }
  if (flags.indexOf('!') > -1) {
    mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  }
  var result = [];
  for (var i = 0; i < len; i++) {
    result.push(this.choice(mask));
  }
  return result.join('');
};

Lcg.prototype.nextBuffer = function (len) {
  var arr = [];
  var i;
  for (i = 0; i < len; i++) {
    arr.push(this.nextInt(256));
  }
  return Buffer.from(arr);
};

Lcg.prototype.choice = function (arr) {
  var len = arr.length;
  if (!len) {
    throw new Error('choosing from empty array');
  }
  return arr[this.nextInt(len)];
};

/**
 * Ordered queue which returns items consecutively.
 *
 * This is actually a heap by index, with the added requirements that elements
 * can only be retrieved consecutively.
 *
 */
function OrderedQueue() {
  this._index = 0;
  this._items = [];
}

OrderedQueue.prototype.push = function (item) {
  var items = this._items;
  var i = items.length | 0;
  var j;
  items.push(item);
  while (i > 0 && items[i].index < items[j = ((i - 1) >> 1)].index) {
    item = items[i];
    items[i] = items[j];
    items[j] = item;
    i = j;
  }
};

OrderedQueue.prototype.pop = function () {
  var items = this._items;
  var len = (items.length - 1) | 0;
  var first = items[0];
  if (!first || first.index > this._index) {
    return null;
  }
  this._index++;
  if (!len) {
    items.pop();
    return first;
  }
  items[0] = items.pop();
  var mid = len >> 1;
  var i = 0;
  var i1, i2, j, item, c, c1, c2;
  while (i < mid) {
    item = items[i];
    i1 = (i << 1) + 1;
    i2 = (i + 1) << 1;
    c1 = items[i1];
    c2 = items[i2];
    if (!c2 || c1.index <= c2.index) {
      c = c1;
      j = i1;
    } else {
      c = c2;
      j = i2;
    }
    if (c.index >= item.index) {
      break;
    }
    items[j] = item;
    items[i] = c;
    i = j;
  }
  return first;
};

/**
 * A tap is a buffer which remembers what has been already read.
 *
 * It is optimized for performance, at the cost of failing silently when
 * overflowing the buffer. This is a purposeful trade-off given the expected
 * rarity of this case and the large performance hit necessary to enforce
 * validity. See `isValid` below for more information.
 *
 */
function Tap(buf, pos) {
  this.buf = buf;
  this.pos = pos | 0;
}

/**
 * Check that the tap is in a valid state.
 *
 * For efficiency reasons, none of the methods below will fail if an overflow
 * occurs (either read, skip, or write). For this reason, it is up to the
 * caller to always check that the read, skip, or write was valid by calling
 * this method.
 *
 */
Tap.prototype.isValid = function () { return this.pos <= this.buf.length; };

/**
 * Returns the contents of the tap up to the current position.
 *
 */
Tap.prototype.getValue = function () { return this.buf.slice(0, this.pos); };

// Read, skip, write methods.
//
// These should fail silently when the buffer overflows. Note this is only
// required to be true when the functions are decoding valid objects. For
// example errors will still be thrown if a bad count is read, leading to a
// negative position offset (which will typically cause a failure in
// `readFixed`).

Tap.prototype.readBoolean = function () { return !!this.buf[this.pos++]; };

Tap.prototype.skipBoolean = function () { this.pos++; };

Tap.prototype.writeBoolean = function (b) { this.buf[this.pos++] = !!b; };

Tap.prototype.readInt = Tap.prototype.readLong = function () {
  var n = 0;
  var k = 0;
  var buf = this.buf;
  var b, h, f, fk;

  do {
    b = buf[this.pos++];
    h = b & 0x80;
    n |= (b & 0x7f) << k;
    k += 7;
  } while (h && k < 28);

  if (h) {
    // Switch to float arithmetic, otherwise we might overflow.
    f = n;
    fk = 268435456; // 2 ** 28.
    do {
      b = buf[this.pos++];
      f += (b & 0x7f) * fk;
      fk *= 128;
    } while (b & 0x80);
    return (f % 2 ? -(f + 1) : f) / 2;
  }

  return (n >> 1) ^ -(n & 1);
};

Tap.prototype.skipInt = Tap.prototype.skipLong = function () {
  var buf = this.buf;
  while (buf[this.pos++] & 0x80) {}
};

Tap.prototype.writeInt = Tap.prototype.writeLong = function (n) {
  var buf = this.buf;
  var f, m;

  if (n >= -1073741824 && n < 1073741824) {
    // Won't overflow, we can use integer arithmetic.
    m = n >= 0 ? n << 1 : (~n << 1) | 1;
    do {
      buf[this.pos] = m & 0x7f;
      m >>= 7;
    } while (m && (buf[this.pos++] |= 0x80));
  } else {
    // We have to use slower floating arithmetic.
    f = n >= 0 ? n * 2 : (-n * 2) - 1;
    do {
      buf[this.pos] = f & 0x7f;
      f /= 128;
    } while (f >= 1 && (buf[this.pos++] |= 0x80));
  }
  this.pos++;
};

Tap.prototype.readFloat = function () {
  var buf = this.buf;
  var pos = this.pos;
  this.pos += 4;
  if (this.pos > buf.length) {
    return;
  }
  return this.buf.readFloatLE(pos);
};

Tap.prototype.skipFloat = function () { this.pos += 4; };

Tap.prototype.writeFloat = function (f) {
  var buf = this.buf;
  var pos = this.pos;
  this.pos += 4;
  if (this.pos > buf.length) {
    return;
  }
  return this.buf.writeFloatLE(f, pos);
};

Tap.prototype.readDouble = function () {
  var buf = this.buf;
  var pos = this.pos;
  this.pos += 8;
  if (this.pos > buf.length) {
    return;
  }
  return this.buf.readDoubleLE(pos);
};

Tap.prototype.skipDouble = function () { this.pos += 8; };

Tap.prototype.writeDouble = function (d) {
  var buf = this.buf;
  var pos = this.pos;
  this.pos += 8;
  if (this.pos > buf.length) {
    return;
  }
  return this.buf.writeDoubleLE(d, pos);
};

Tap.prototype.readFixed = function (len) {
  var pos = this.pos;
  this.pos += len;
  if (this.pos > this.buf.length) {
    return;
  }
  var fixed = Buffer.alloc(len);
  this.buf.copy(fixed, 0, pos, pos + len);
  return fixed;
};

Tap.prototype.skipFixed = function (len) { this.pos += len; };

Tap.prototype.writeFixed = function (buf, len) {
  len = len || buf.length;
  var pos = this.pos;
  this.pos += len;
  if (this.pos > this.buf.length) {
    return;
  }
  buf.copy(this.buf, pos, 0, len);
};

Tap.prototype.readBytes = function () {
  return this.readFixed(this.readLong());
};

Tap.prototype.skipBytes = function () {
  var len = this.readLong();
  this.pos += len;
};

Tap.prototype.writeBytes = function (buf) {
  var len = buf.length;
  this.writeLong(len);
  this.writeFixed(buf, len);
};

Tap.prototype.readString = function () {
  var len = this.readLong();
  var pos = this.pos;
  var buf = this.buf;
  this.pos += len;
  if (this.pos > buf.length) {
    return;
  }
  return this.buf.utf8Slice(pos, pos + len);
};

Tap.prototype.skipString = function () {
  var len = this.readLong();
  this.pos += len;
};

Tap.prototype.writeString = function (s) {
  var len = Buffer.byteLength(s);
  this.writeLong(len);
  var pos = this.pos;
  this.pos += len;
  if (this.pos > this.buf.length) {
    return;
  }
  this.buf.utf8Write(s, pos, len);
};

// Helper used to speed up writing defaults.

Tap.prototype.writeBinary = function (str, len) {
  var pos = this.pos;
  this.pos += len;
  if (this.pos > this.buf.length) {
    return;
  }
  this.buf.write(str, pos, len, 'binary');
};

// Binary comparison methods.
//
// These are not guaranteed to consume the objects they are comparing when
// returning a non-zero result (allowing for performance benefits), so no other
// operations should be done on either tap after a compare returns a non-zero
// value. Also, these methods do not have the same silent failure requirement
// as read, skip, and write since they are assumed to be called on valid
// buffers.

Tap.prototype.matchBoolean = function (tap) {
  return this.buf[this.pos++] - tap.buf[tap.pos++];
};

Tap.prototype.matchInt = Tap.prototype.matchLong = function (tap) {
  var n1 = this.readLong();
  var n2 = tap.readLong();
  return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1);
};

Tap.prototype.matchFloat = function (tap) {
  var n1 = this.readFloat();
  var n2 = tap.readFloat();
  return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1);
};

Tap.prototype.matchDouble = function (tap) {
  var n1 = this.readDouble();
  var n2 = tap.readDouble();
  return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1);
};

Tap.prototype.matchFixed = function (tap, len) {
  return this.readFixed(len).compare(tap.readFixed(len));
};

Tap.prototype.matchBytes = Tap.prototype.matchString = function (tap) {
  var l1 = this.readLong();
  var p1 = this.pos;
  this.pos += l1;
  var l2 = tap.readLong();
  var p2 = tap.pos;
  tap.pos += l2;
  var b1 = this.buf.slice(p1, this.pos);
  var b2 = tap.buf.slice(p2, tap.pos);
  return b1.compare(b2);
};

// Functions for supporting custom long classes.
//
// The two following methods allow the long implementations to not have to
// worry about Avro's zigzag encoding, we directly expose longs as unpacked.

Tap.prototype.unpackLongBytes = function () {
  var res = Buffer.alloc(8);
  var n = 0;
  var i = 0; // Byte index in target buffer.
  var j = 6; // Bit offset in current target buffer byte.
  var buf = this.buf;
  var b, neg;

  b = buf[this.pos++];
  neg = b & 1;
  res.fill(0);

  n |= (b & 0x7f) >> 1;
  while (b & 0x80) {
    b = buf[this.pos++];
    n |= (b & 0x7f) << j;
    j += 7;
    if (j >= 8) {
      // Flush byte.
      j -= 8;
      res[i++] = n;
      n >>= 8;
    }
  }
  res[i] = n;

  if (neg) {
    invert(res, 8);
  }

  return res;
};

Tap.prototype.packLongBytes = function (buf) {
  var neg = (buf[7] & 0x80) >> 7;
  var res = this.buf;
  var j = 1;
  var k = 0;
  var m = 3;
  var n;

  if (neg) {
    invert(buf, 8);
    n = 1;
  } else {
    n = 0;
  }

  var parts = [
    buf.readUIntLE(0, 3),
    buf.readUIntLE(3, 3),
    buf.readUIntLE(6, 2)
  ];
  // Not reading more than 24 bits because we need to be able to combine the
  // "carry" bits from the previous part and JavaScript only supports bitwise
  // operations on 32 bit integers.
  while (m && !parts[--m]) {} // Skip trailing 0s.

  // Leading parts (if any), we never bail early here since we need the
  // continuation bit to be set.
  while (k < m) {
    n |= parts[k++] << j;
    j += 24;
    while (j > 7) {
      res[this.pos++] = (n & 0x7f) | 0x80;
      n >>= 7;
      j -= 7;
    }
  }

  // Final part, similar to normal packing aside from the initial offset.
  n |= parts[m] << j;
  do {
    res[this.pos] = n & 0x7f;
    n >>= 7;
  } while (n && (res[this.pos++] |= 0x80));
  this.pos++;

  // Restore original buffer (could make this optional?).
  if (neg) {
    invert(buf, 8);
  }
};

// Helpers.

/**
 * Invert all bits in a buffer.
 *
 * @param buf {Buffer} Non-empty buffer to invert.
 * @param len {Number} Buffer length (must be positive).
 *
 */
function invert(buf, len) {
  while (len--) {
    buf[len] = ~buf[len];
  }
}


module.exports = {
  abstractFunction: abstractFunction,
  capitalize: capitalize,
  compare: compare,
  getHash: getHash,
  toMap: toMap,
  singleIndexOf: singleIndexOf,
  hasDuplicates: hasDuplicates,
  Lcg: Lcg,
  OrderedQueue: OrderedQueue,
  Tap: Tap
};


/***/ }),

/***/ 4294:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = __nccwpck_require__(4219);


/***/ }),

/***/ 4219:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


var net = __nccwpck_require__(1808);
var tls = __nccwpck_require__(4404);
var http = __nccwpck_require__(3685);
var https = __nccwpck_require__(5687);
var events = __nccwpck_require__(2361);
var assert = __nccwpck_require__(9491);
var util = __nccwpck_require__(3837);


exports.httpOverHttp = httpOverHttp;
exports.httpsOverHttp = httpsOverHttp;
exports.httpOverHttps = httpOverHttps;
exports.httpsOverHttps = httpsOverHttps;


function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  return agent;
}

function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}

function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  return agent;
}

function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}


function TunnelingAgent(options) {
  var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', function onFree(socket, host, port, localAddress) {
    var options = toOptions(host, port, localAddress);
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === options.host && pending.port === options.port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util.inherits(TunnelingAgent, events.EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
  var self = this;
  var options = mergeOptions({request: req}, self.options, toOptions(host, port, localAddress));

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push(options);
    return;
  }

  // If we are under maxSockets create a new one.
  self.createSocket(options, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    req.onSocket(socket);

    function onFree() {
      self.emit('free', socket, options);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: 'CONNECT',
    path: options.host + ':' + options.port,
    agent: false,
    headers: {
      host: options.host + ':' + options.port
    }
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
        new Buffer(connectOptions.proxyAuth).toString('base64');
  }

  debug('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade);   // for v0.6
  connectReq.once('connect', onConnect);   // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode !== 200) {
      debug('tunneling socket could not be established, statusCode=%d',
        res.statusCode);
      socket.destroy();
      var error = new Error('tunneling socket could not be established, ' +
        'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug('got illegal response body from proxy');
      socket.destroy();
      var error = new Error('got illegal response body from proxy');
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    debug('tunneling connection has established');
    self.sockets[self.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug('tunneling socket could not be established, cause=%s\n',
          cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' +
                          'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket)
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(pending, function(socket) {
      pending.request.onSocket(socket);
    });
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    var hostHeader = options.request.getHeader('host');
    var tlsOptions = mergeOptions({}, self.options, {
      socket: socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
    });

    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, tlsOptions);
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}


function toOptions(host, port, localAddress) {
  if (typeof host === 'string') { // since v0.10
    return {
      host: host,
      port: port,
      localAddress: localAddress
    };
  }
  return host; // for v0.11 or later
}

function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}


var debug;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  }
} else {
  debug = function() {};
}
exports.debug = debug; // for test


/***/ }),

/***/ 5840:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "v1", ({
  enumerable: true,
  get: function () {
    return _v.default;
  }
}));
Object.defineProperty(exports, "v3", ({
  enumerable: true,
  get: function () {
    return _v2.default;
  }
}));
Object.defineProperty(exports, "v4", ({
  enumerable: true,
  get: function () {
    return _v3.default;
  }
}));
Object.defineProperty(exports, "v5", ({
  enumerable: true,
  get: function () {
    return _v4.default;
  }
}));
Object.defineProperty(exports, "NIL", ({
  enumerable: true,
  get: function () {
    return _nil.default;
  }
}));
Object.defineProperty(exports, "version", ({
  enumerable: true,
  get: function () {
    return _version.default;
  }
}));
Object.defineProperty(exports, "validate", ({
  enumerable: true,
  get: function () {
    return _validate.default;
  }
}));
Object.defineProperty(exports, "stringify", ({
  enumerable: true,
  get: function () {
    return _stringify.default;
  }
}));
Object.defineProperty(exports, "parse", ({
  enumerable: true,
  get: function () {
    return _parse.default;
  }
}));

var _v = _interopRequireDefault(__nccwpck_require__(8628));

var _v2 = _interopRequireDefault(__nccwpck_require__(6409));

var _v3 = _interopRequireDefault(__nccwpck_require__(5122));

var _v4 = _interopRequireDefault(__nccwpck_require__(9120));

var _nil = _interopRequireDefault(__nccwpck_require__(5332));

var _version = _interopRequireDefault(__nccwpck_require__(1595));

var _validate = _interopRequireDefault(__nccwpck_require__(6900));

var _stringify = _interopRequireDefault(__nccwpck_require__(8950));

var _parse = _interopRequireDefault(__nccwpck_require__(2746));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),

/***/ 4569:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _crypto = _interopRequireDefault(__nccwpck_require__(6113));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return _crypto.default.createHash('md5').update(bytes).digest();
}

var _default = md5;
exports["default"] = _default;

/***/ }),

/***/ 5332:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = '00000000-0000-0000-0000-000000000000';
exports["default"] = _default;

/***/ }),

/***/ 2746:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(6900));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  let v;
  const arr = new Uint8Array(16); // Parse ########-....-....-....-............

  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 0xff;
  arr[2] = v >>> 8 & 0xff;
  arr[3] = v & 0xff; // Parse ........-####-....-....-............

  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff; // Parse ........-....-####-....-............

  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff; // Parse ........-....-....-####-............

  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff; // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
  arr[11] = v / 0x100000000 & 0xff;
  arr[12] = v >>> 24 & 0xff;
  arr[13] = v >>> 16 & 0xff;
  arr[14] = v >>> 8 & 0xff;
  arr[15] = v & 0xff;
  return arr;
}

var _default = parse;
exports["default"] = _default;

/***/ }),

/***/ 814:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
exports["default"] = _default;

/***/ }),

/***/ 807:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = rng;

var _crypto = _interopRequireDefault(__nccwpck_require__(6113));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate

let poolPtr = rnds8Pool.length;

function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    _crypto.default.randomFillSync(rnds8Pool);

    poolPtr = 0;
  }

  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

/***/ }),

/***/ 5274:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _crypto = _interopRequireDefault(__nccwpck_require__(6113));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return _crypto.default.createHash('sha1').update(bytes).digest();
}

var _default = sha1;
exports["default"] = _default;

/***/ }),

/***/ 8950:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(6900));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

var _default = stringify;
exports["default"] = _default;

/***/ }),

/***/ 8628:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _rng = _interopRequireDefault(__nccwpck_require__(807));

var _stringify = _interopRequireDefault(__nccwpck_require__(8950));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
let _nodeId;

let _clockseq; // Previous uuid creation time


let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || _rng.default)();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0, _stringify.default)(b);
}

var _default = v1;
exports["default"] = _default;

/***/ }),

/***/ 6409:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _v = _interopRequireDefault(__nccwpck_require__(5998));

var _md = _interopRequireDefault(__nccwpck_require__(4569));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v3 = (0, _v.default)('v3', 0x30, _md.default);
var _default = v3;
exports["default"] = _default;

/***/ }),

/***/ 5998:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;
exports.URL = exports.DNS = void 0;

var _stringify = _interopRequireDefault(__nccwpck_require__(8950));

var _parse = _interopRequireDefault(__nccwpck_require__(2746));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  const bytes = [];

  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
exports.DNS = DNS;
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
exports.URL = URL;

function _default(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === 'string') {
      value = stringToBytes(value);
    }

    if (typeof namespace === 'string') {
      namespace = (0, _parse.default)(namespace);
    }

    if (namespace.length !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    } // Compute hash of namespace and value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashfunc([...namespace, ... value])`


    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }

      return buf;
    }

    return (0, _stringify.default)(bytes);
  } // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}

/***/ }),

/***/ 5122:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _rng = _interopRequireDefault(__nccwpck_require__(807));

var _stringify = _interopRequireDefault(__nccwpck_require__(8950));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function v4(options, buf, offset) {
  options = options || {};

  const rnds = options.random || (options.rng || _rng.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`


  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0, _stringify.default)(rnds);
}

var _default = v4;
exports["default"] = _default;

/***/ }),

/***/ 9120:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _v = _interopRequireDefault(__nccwpck_require__(5998));

var _sha = _interopRequireDefault(__nccwpck_require__(5274));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v5 = (0, _v.default)('v5', 0x50, _sha.default);
var _default = v5;
exports["default"] = _default;

/***/ }),

/***/ 6900:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _regex = _interopRequireDefault(__nccwpck_require__(814));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validate(uuid) {
  return typeof uuid === 'string' && _regex.default.test(uuid);
}

var _default = validate;
exports["default"] = _default;

/***/ }),

/***/ 1595:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(6900));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function version(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  return parseInt(uuid.substr(14, 1), 16);
}

var _default = version;
exports["default"] = _default;

/***/ }),

/***/ 9491:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 4300:
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ 6113:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 2361:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 7147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 3685:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 5687:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 1808:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 2037:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 1017:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 2781:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 4404:
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ 3837:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 9796:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ 6717:
/***/ ((__unused_webpack_module, exports) => {

//     Underscore.js 1.13.6
//     https://underscorejs.org
//     (c) 2009-2022 Jeremy Ashkenas, Julian Gonggrijp, and DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

Object.defineProperty(exports, "__esModule", ({ value: true }));

// Current version.
var VERSION = '1.13.6';

// Establish the root object, `window` (`self`) in the browser, `global`
// on the server, or `this` in some virtual machines. We use `self`
// instead of `window` for `WebWorker` support.
var root = (typeof self == 'object' && self.self === self && self) ||
          (typeof global == 'object' && global.global === global && global) ||
          Function('return this')() ||
          {};

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype, ObjProto = Object.prototype;
var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

// Create quick reference variables for speed access to core prototypes.
var push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

// Modern feature detection.
var supportsArrayBuffer = typeof ArrayBuffer !== 'undefined',
    supportsDataView = typeof DataView !== 'undefined';

// All **ECMAScript 5+** native function implementations that we hope to use
// are declared here.
var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeCreate = Object.create,
    nativeIsView = supportsArrayBuffer && ArrayBuffer.isView;

// Create references to these builtin functions because we override them.
var _isNaN = isNaN,
    _isFinite = isFinite;

// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
  'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

// The largest integer that can be represented exactly.
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

// Some functions take a variable number of arguments, or a few expected
// arguments at the beginning and then a variable number of values to operate
// on. This helper accumulates all remaining arguments past the function’s
// argument length (or an explicit `startIndex`), into an array that becomes
// the last argument. Similar to ES6’s "rest parameter".
function restArguments(func, startIndex) {
  startIndex = startIndex == null ? func.length - 1 : +startIndex;
  return function() {
    var length = Math.max(arguments.length - startIndex, 0),
        rest = Array(length),
        index = 0;
    for (; index < length; index++) {
      rest[index] = arguments[index + startIndex];
    }
    switch (startIndex) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, arguments[0], rest);
      case 2: return func.call(this, arguments[0], arguments[1], rest);
    }
    var args = Array(startIndex + 1);
    for (index = 0; index < startIndex; index++) {
      args[index] = arguments[index];
    }
    args[startIndex] = rest;
    return func.apply(this, args);
  };
}

// Is a given variable an object?
function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || (type === 'object' && !!obj);
}

// Is a given value equal to null?
function isNull(obj) {
  return obj === null;
}

// Is a given variable undefined?
function isUndefined(obj) {
  return obj === void 0;
}

// Is a given value a boolean?
function isBoolean(obj) {
  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
}

// Is a given value a DOM element?
function isElement(obj) {
  return !!(obj && obj.nodeType === 1);
}

// Internal function for creating a `toString`-based type tester.
function tagTester(name) {
  var tag = '[object ' + name + ']';
  return function(obj) {
    return toString.call(obj) === tag;
  };
}

var isString = tagTester('String');

var isNumber = tagTester('Number');

var isDate = tagTester('Date');

var isRegExp = tagTester('RegExp');

var isError = tagTester('Error');

var isSymbol = tagTester('Symbol');

var isArrayBuffer = tagTester('ArrayBuffer');

var isFunction = tagTester('Function');

// Optimize `isFunction` if appropriate. Work around some `typeof` bugs in old
// v8, IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
var nodelist = root.document && root.document.childNodes;
if ( true && typeof Int8Array != 'object' && typeof nodelist != 'function') {
  isFunction = function(obj) {
    return typeof obj == 'function' || false;
  };
}

var isFunction$1 = isFunction;

var hasObjectTag = tagTester('Object');

// In IE 10 - Edge 13, `DataView` has string tag `'[object Object]'`.
// In IE 11, the most common among them, this problem also applies to
// `Map`, `WeakMap` and `Set`.
var hasStringTagBug = (
      supportsDataView && hasObjectTag(new DataView(new ArrayBuffer(8)))
    ),
    isIE11 = (typeof Map !== 'undefined' && hasObjectTag(new Map));

var isDataView = tagTester('DataView');

// In IE 10 - Edge 13, we need a different heuristic
// to determine whether an object is a `DataView`.
function ie10IsDataView(obj) {
  return obj != null && isFunction$1(obj.getInt8) && isArrayBuffer(obj.buffer);
}

var isDataView$1 = (hasStringTagBug ? ie10IsDataView : isDataView);

// Is a given value an array?
// Delegates to ECMA5's native `Array.isArray`.
var isArray = nativeIsArray || tagTester('Array');

// Internal function to check whether `key` is an own property name of `obj`.
function has$1(obj, key) {
  return obj != null && hasOwnProperty.call(obj, key);
}

var isArguments = tagTester('Arguments');

// Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.
(function() {
  if (!isArguments(arguments)) {
    isArguments = function(obj) {
      return has$1(obj, 'callee');
    };
  }
}());

var isArguments$1 = isArguments;

// Is a given object a finite number?
function isFinite$1(obj) {
  return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
}

// Is the given value `NaN`?
function isNaN$1(obj) {
  return isNumber(obj) && _isNaN(obj);
}

// Predicate-generating function. Often useful outside of Underscore.
function constant(value) {
  return function() {
    return value;
  };
}

// Common internal logic for `isArrayLike` and `isBufferLike`.
function createSizePropertyCheck(getSizeProperty) {
  return function(collection) {
    var sizeProperty = getSizeProperty(collection);
    return typeof sizeProperty == 'number' && sizeProperty >= 0 && sizeProperty <= MAX_ARRAY_INDEX;
  }
}

// Internal helper to generate a function to obtain property `key` from `obj`.
function shallowProperty(key) {
  return function(obj) {
    return obj == null ? void 0 : obj[key];
  };
}

// Internal helper to obtain the `byteLength` property of an object.
var getByteLength = shallowProperty('byteLength');

// Internal helper to determine whether we should spend extensive checks against
// `ArrayBuffer` et al.
var isBufferLike = createSizePropertyCheck(getByteLength);

// Is a given value a typed array?
var typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
function isTypedArray(obj) {
  // `ArrayBuffer.isView` is the most future-proof, so use it when available.
  // Otherwise, fall back on the above regular expression.
  return nativeIsView ? (nativeIsView(obj) && !isDataView$1(obj)) :
                isBufferLike(obj) && typedArrayPattern.test(toString.call(obj));
}

var isTypedArray$1 = supportsArrayBuffer ? isTypedArray : constant(false);

// Internal helper to obtain the `length` property of an object.
var getLength = shallowProperty('length');

// Internal helper to create a simple lookup structure.
// `collectNonEnumProps` used to depend on `_.contains`, but this led to
// circular imports. `emulatedSet` is a one-off solution that only works for
// arrays of strings.
function emulatedSet(keys) {
  var hash = {};
  for (var l = keys.length, i = 0; i < l; ++i) hash[keys[i]] = true;
  return {
    contains: function(key) { return hash[key] === true; },
    push: function(key) {
      hash[key] = true;
      return keys.push(key);
    }
  };
}

// Internal helper. Checks `keys` for the presence of keys in IE < 9 that won't
// be iterated by `for key in ...` and thus missed. Extends `keys` in place if
// needed.
function collectNonEnumProps(obj, keys) {
  keys = emulatedSet(keys);
  var nonEnumIdx = nonEnumerableProps.length;
  var constructor = obj.constructor;
  var proto = (isFunction$1(constructor) && constructor.prototype) || ObjProto;

  // Constructor is a special case.
  var prop = 'constructor';
  if (has$1(obj, prop) && !keys.contains(prop)) keys.push(prop);

  while (nonEnumIdx--) {
    prop = nonEnumerableProps[nonEnumIdx];
    if (prop in obj && obj[prop] !== proto[prop] && !keys.contains(prop)) {
      keys.push(prop);
    }
  }
}

// Retrieve the names of an object's own properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`.
function keys(obj) {
  if (!isObject(obj)) return [];
  if (nativeKeys) return nativeKeys(obj);
  var keys = [];
  for (var key in obj) if (has$1(obj, key)) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}

// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
function isEmpty(obj) {
  if (obj == null) return true;
  // Skip the more expensive `toString`-based type checks if `obj` has no
  // `.length`.
  var length = getLength(obj);
  if (typeof length == 'number' && (
    isArray(obj) || isString(obj) || isArguments$1(obj)
  )) return length === 0;
  return getLength(keys(obj)) === 0;
}

// Returns whether an object has a given set of `key:value` pairs.
function isMatch(object, attrs) {
  var _keys = keys(attrs), length = _keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = _keys[i];
    if (attrs[key] !== obj[key] || !(key in obj)) return false;
  }
  return true;
}

// If Underscore is called as a function, it returns a wrapped object that can
// be used OO-style. This wrapper holds altered versions of all functions added
// through `_.mixin`. Wrapped objects may be chained.
function _$1(obj) {
  if (obj instanceof _$1) return obj;
  if (!(this instanceof _$1)) return new _$1(obj);
  this._wrapped = obj;
}

_$1.VERSION = VERSION;

// Extracts the result from a wrapped and chained object.
_$1.prototype.value = function() {
  return this._wrapped;
};

// Provide unwrapping proxies for some methods used in engine operations
// such as arithmetic and JSON stringification.
_$1.prototype.valueOf = _$1.prototype.toJSON = _$1.prototype.value;

_$1.prototype.toString = function() {
  return String(this._wrapped);
};

// Internal function to wrap or shallow-copy an ArrayBuffer,
// typed array or DataView to a new view, reusing the buffer.
function toBufferView(bufferSource) {
  return new Uint8Array(
    bufferSource.buffer || bufferSource,
    bufferSource.byteOffset || 0,
    getByteLength(bufferSource)
  );
}

// We use this string twice, so give it a name for minification.
var tagDataView = '[object DataView]';

// Internal recursive comparison function for `_.isEqual`.
function eq(a, b, aStack, bStack) {
  // Identical objects are equal. `0 === -0`, but they aren't identical.
  // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  // `null` or `undefined` only equal to itself (strict comparison).
  if (a == null || b == null) return false;
  // `NaN`s are equivalent, but non-reflexive.
  if (a !== a) return b !== b;
  // Exhaust primitive checks
  var type = typeof a;
  if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
  return deepEq(a, b, aStack, bStack);
}

// Internal recursive comparison function for `_.isEqual`.
function deepEq(a, b, aStack, bStack) {
  // Unwrap any wrapped objects.
  if (a instanceof _$1) a = a._wrapped;
  if (b instanceof _$1) b = b._wrapped;
  // Compare `[[Class]]` names.
  var className = toString.call(a);
  if (className !== toString.call(b)) return false;
  // Work around a bug in IE 10 - Edge 13.
  if (hasStringTagBug && className == '[object Object]' && isDataView$1(a)) {
    if (!isDataView$1(b)) return false;
    className = tagDataView;
  }
  switch (className) {
    // These types are compared by value.
    case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      return '' + a === '' + b;
    case '[object Number]':
      // `NaN`s are equivalent, but non-reflexive.
      // Object(NaN) is equivalent to NaN.
      if (+a !== +a) return +b !== +b;
      // An `egal` comparison is performed for other numeric values.
      return +a === 0 ? 1 / +a === 1 / b : +a === +b;
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      return +a === +b;
    case '[object Symbol]':
      return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    case '[object ArrayBuffer]':
    case tagDataView:
      // Coerce to typed array so we can fall through.
      return deepEq(toBufferView(a), toBufferView(b), aStack, bStack);
  }

  var areArrays = className === '[object Array]';
  if (!areArrays && isTypedArray$1(a)) {
      var byteLength = getByteLength(a);
      if (byteLength !== getByteLength(b)) return false;
      if (a.buffer === b.buffer && a.byteOffset === b.byteOffset) return true;
      areArrays = true;
  }
  if (!areArrays) {
    if (typeof a != 'object' || typeof b != 'object') return false;

    // Objects with different constructors are not equivalent, but `Object`s or `Array`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(isFunction$1(aCtor) && aCtor instanceof aCtor &&
                             isFunction$1(bCtor) && bCtor instanceof bCtor)
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
  }
  // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

  // Initializing stack of traversed objects.
  // It's done here since we only need them for objects and arrays comparison.
  aStack = aStack || [];
  bStack = bStack || [];
  var length = aStack.length;
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] === a) return bStack[length] === b;
  }

  // Add the first object to the stack of traversed objects.
  aStack.push(a);
  bStack.push(b);

  // Recursively compare objects and arrays.
  if (areArrays) {
    // Compare array lengths to determine if a deep comparison is necessary.
    length = a.length;
    if (length !== b.length) return false;
    // Deep compare the contents, ignoring non-numeric properties.
    while (length--) {
      if (!eq(a[length], b[length], aStack, bStack)) return false;
    }
  } else {
    // Deep compare objects.
    var _keys = keys(a), key;
    length = _keys.length;
    // Ensure that both objects contain the same number of properties before comparing deep equality.
    if (keys(b).length !== length) return false;
    while (length--) {
      // Deep compare each member
      key = _keys[length];
      if (!(has$1(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
    }
  }
  // Remove the first object from the stack of traversed objects.
  aStack.pop();
  bStack.pop();
  return true;
}

// Perform a deep comparison to check if two objects are equal.
function isEqual(a, b) {
  return eq(a, b);
}

// Retrieve all the enumerable property names of an object.
function allKeys(obj) {
  if (!isObject(obj)) return [];
  var keys = [];
  for (var key in obj) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}

// Since the regular `Object.prototype.toString` type tests don't work for
// some types in IE 11, we use a fingerprinting heuristic instead, based
// on the methods. It's not great, but it's the best we got.
// The fingerprint method lists are defined below.
function ie11fingerprint(methods) {
  var length = getLength(methods);
  return function(obj) {
    if (obj == null) return false;
    // `Map`, `WeakMap` and `Set` have no enumerable keys.
    var keys = allKeys(obj);
    if (getLength(keys)) return false;
    for (var i = 0; i < length; i++) {
      if (!isFunction$1(obj[methods[i]])) return false;
    }
    // If we are testing against `WeakMap`, we need to ensure that
    // `obj` doesn't have a `forEach` method in order to distinguish
    // it from a regular `Map`.
    return methods !== weakMapMethods || !isFunction$1(obj[forEachName]);
  };
}

// In the interest of compact minification, we write
// each string in the fingerprints only once.
var forEachName = 'forEach',
    hasName = 'has',
    commonInit = ['clear', 'delete'],
    mapTail = ['get', hasName, 'set'];

// `Map`, `WeakMap` and `Set` each have slightly different
// combinations of the above sublists.
var mapMethods = commonInit.concat(forEachName, mapTail),
    weakMapMethods = commonInit.concat(mapTail),
    setMethods = ['add'].concat(commonInit, forEachName, hasName);

var isMap = isIE11 ? ie11fingerprint(mapMethods) : tagTester('Map');

var isWeakMap = isIE11 ? ie11fingerprint(weakMapMethods) : tagTester('WeakMap');

var isSet = isIE11 ? ie11fingerprint(setMethods) : tagTester('Set');

var isWeakSet = tagTester('WeakSet');

// Retrieve the values of an object's properties.
function values(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var values = Array(length);
  for (var i = 0; i < length; i++) {
    values[i] = obj[_keys[i]];
  }
  return values;
}

// Convert an object into a list of `[key, value]` pairs.
// The opposite of `_.object` with one argument.
function pairs(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var pairs = Array(length);
  for (var i = 0; i < length; i++) {
    pairs[i] = [_keys[i], obj[_keys[i]]];
  }
  return pairs;
}

// Invert the keys and values of an object. The values must be serializable.
function invert(obj) {
  var result = {};
  var _keys = keys(obj);
  for (var i = 0, length = _keys.length; i < length; i++) {
    result[obj[_keys[i]]] = _keys[i];
  }
  return result;
}

// Return a sorted list of the function names available on the object.
function functions(obj) {
  var names = [];
  for (var key in obj) {
    if (isFunction$1(obj[key])) names.push(key);
  }
  return names.sort();
}

// An internal function for creating assigner functions.
function createAssigner(keysFunc, defaults) {
  return function(obj) {
    var length = arguments.length;
    if (defaults) obj = Object(obj);
    if (length < 2 || obj == null) return obj;
    for (var index = 1; index < length; index++) {
      var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;
      for (var i = 0; i < l; i++) {
        var key = keys[i];
        if (!defaults || obj[key] === void 0) obj[key] = source[key];
      }
    }
    return obj;
  };
}

// Extend a given object with all the properties in passed-in object(s).
var extend = createAssigner(allKeys);

// Assigns a given object with all the own properties in the passed-in
// object(s).
// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
var extendOwn = createAssigner(keys);

// Fill in a given object with default properties.
var defaults = createAssigner(allKeys, true);

// Create a naked function reference for surrogate-prototype-swapping.
function ctor() {
  return function(){};
}

// An internal function for creating a new object that inherits from another.
function baseCreate(prototype) {
  if (!isObject(prototype)) return {};
  if (nativeCreate) return nativeCreate(prototype);
  var Ctor = ctor();
  Ctor.prototype = prototype;
  var result = new Ctor;
  Ctor.prototype = null;
  return result;
}

// Creates an object that inherits from the given prototype object.
// If additional properties are provided then they will be added to the
// created object.
function create(prototype, props) {
  var result = baseCreate(prototype);
  if (props) extendOwn(result, props);
  return result;
}

// Create a (shallow-cloned) duplicate of an object.
function clone(obj) {
  if (!isObject(obj)) return obj;
  return isArray(obj) ? obj.slice() : extend({}, obj);
}

// Invokes `interceptor` with the `obj` and then returns `obj`.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
function tap(obj, interceptor) {
  interceptor(obj);
  return obj;
}

// Normalize a (deep) property `path` to array.
// Like `_.iteratee`, this function can be customized.
function toPath$1(path) {
  return isArray(path) ? path : [path];
}
_$1.toPath = toPath$1;

// Internal wrapper for `_.toPath` to enable minification.
// Similar to `cb` for `_.iteratee`.
function toPath(path) {
  return _$1.toPath(path);
}

// Internal function to obtain a nested property in `obj` along `path`.
function deepGet(obj, path) {
  var length = path.length;
  for (var i = 0; i < length; i++) {
    if (obj == null) return void 0;
    obj = obj[path[i]];
  }
  return length ? obj : void 0;
}

// Get the value of the (deep) property on `path` from `object`.
// If any property in `path` does not exist or if the value is
// `undefined`, return `defaultValue` instead.
// The `path` is normalized through `_.toPath`.
function get(object, path, defaultValue) {
  var value = deepGet(object, toPath(path));
  return isUndefined(value) ? defaultValue : value;
}

// Shortcut function for checking if an object has a given property directly on
// itself (in other words, not on a prototype). Unlike the internal `has`
// function, this public version can also traverse nested properties.
function has(obj, path) {
  path = toPath(path);
  var length = path.length;
  for (var i = 0; i < length; i++) {
    var key = path[i];
    if (!has$1(obj, key)) return false;
    obj = obj[key];
  }
  return !!length;
}

// Keep the identity function around for default iteratees.
function identity(value) {
  return value;
}

// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
function matcher(attrs) {
  attrs = extendOwn({}, attrs);
  return function(obj) {
    return isMatch(obj, attrs);
  };
}

// Creates a function that, when passed an object, will traverse that object’s
// properties down the given `path`, specified as an array of keys or indices.
function property(path) {
  path = toPath(path);
  return function(obj) {
    return deepGet(obj, path);
  };
}

// Internal function that returns an efficient (for current engines) version
// of the passed-in callback, to be repeatedly applied in other Underscore
// functions.
function optimizeCb(func, context, argCount) {
  if (context === void 0) return func;
  switch (argCount == null ? 3 : argCount) {
    case 1: return function(value) {
      return func.call(context, value);
    };
    // The 2-argument case is omitted because we’re not using it.
    case 3: return function(value, index, collection) {
      return func.call(context, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(context, accumulator, value, index, collection);
    };
  }
  return function() {
    return func.apply(context, arguments);
  };
}

// An internal function to generate callbacks that can be applied to each
// element in a collection, returning the desired result — either `_.identity`,
// an arbitrary callback, a property matcher, or a property accessor.
function baseIteratee(value, context, argCount) {
  if (value == null) return identity;
  if (isFunction$1(value)) return optimizeCb(value, context, argCount);
  if (isObject(value) && !isArray(value)) return matcher(value);
  return property(value);
}

// External wrapper for our callback generator. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only `argCount` argument.
function iteratee(value, context) {
  return baseIteratee(value, context, Infinity);
}
_$1.iteratee = iteratee;

// The function we call internally to generate a callback. It invokes
// `_.iteratee` if overridden, otherwise `baseIteratee`.
function cb(value, context, argCount) {
  if (_$1.iteratee !== iteratee) return _$1.iteratee(value, context);
  return baseIteratee(value, context, argCount);
}

// Returns the results of applying the `iteratee` to each element of `obj`.
// In contrast to `_.map` it returns an object.
function mapObject(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = keys(obj),
      length = _keys.length,
      results = {};
  for (var index = 0; index < length; index++) {
    var currentKey = _keys[index];
    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}

// Predicate-generating function. Often useful outside of Underscore.
function noop(){}

// Generates a function for a given object that returns a given property.
function propertyOf(obj) {
  if (obj == null) return noop;
  return function(path) {
    return get(obj, path);
  };
}

// Run a function **n** times.
function times(n, iteratee, context) {
  var accum = Array(Math.max(0, n));
  iteratee = optimizeCb(iteratee, context, 1);
  for (var i = 0; i < n; i++) accum[i] = iteratee(i);
  return accum;
}

// Return a random integer between `min` and `max` (inclusive).
function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}

// A (possibly faster) way to get the current timestamp as an integer.
var now = Date.now || function() {
  return new Date().getTime();
};

// Internal helper to generate functions for escaping and unescaping strings
// to/from HTML interpolation.
function createEscaper(map) {
  var escaper = function(match) {
    return map[match];
  };
  // Regexes for identifying a key that needs to be escaped.
  var source = '(?:' + keys(map).join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function(string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
}

// Internal list of HTML entities for escaping.
var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};

// Function for escaping strings to HTML interpolation.
var _escape = createEscaper(escapeMap);

// Internal list of HTML entities for unescaping.
var unescapeMap = invert(escapeMap);

// Function for unescaping strings from HTML interpolation.
var _unescape = createEscaper(unescapeMap);

// By default, Underscore uses ERB-style template delimiters. Change the
// following template settings to use alternative delimiters.
var templateSettings = _$1.templateSettings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g
};

// When customizing `_.templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
  "'": "'",
  '\\': '\\',
  '\r': 'r',
  '\n': 'n',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

function escapeChar(match) {
  return '\\' + escapes[match];
}

// In order to prevent third-party code injection through
// `_.templateSettings.variable`, we test it against the following regular
// expression. It is intentionally a bit more liberal than just matching valid
// identifiers, but still prevents possible loopholes through defaults or
// destructuring assignment.
var bareIdentifier = /^\s*(\w|\$)+\s*$/;

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
// NB: `oldSettings` only exists for backwards compatibility.
function template(text, settings, oldSettings) {
  if (!settings && oldSettings) settings = oldSettings;
  settings = defaults({}, settings, _$1.templateSettings);

  // Combine delimiters into one regular expression via alternation.
  var matcher = RegExp([
    (settings.escape || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.evaluate || noMatch).source
  ].join('|') + '|$', 'g');

  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
    index = offset + match.length;

    if (escape) {
      source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
    } else if (interpolate) {
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    } else if (evaluate) {
      source += "';\n" + evaluate + "\n__p+='";
    }

    // Adobe VMs need the match returned to produce the correct offset.
    return match;
  });
  source += "';\n";

  var argument = settings.variable;
  if (argument) {
    // Insure against third-party code injection. (CVE-2021-23358)
    if (!bareIdentifier.test(argument)) throw new Error(
      'variable is not a bare identifier: ' + argument
    );
  } else {
    // If a variable is not specified, place data values in local scope.
    source = 'with(obj||{}){\n' + source + '}\n';
    argument = 'obj';
  }

  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + 'return __p;\n';

  var render;
  try {
    render = new Function(argument, '_', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  var template = function(data) {
    return render.call(this, data, _$1);
  };

  // Provide the compiled source as a convenience for precompilation.
  template.source = 'function(' + argument + '){\n' + source + '}';

  return template;
}

// Traverses the children of `obj` along `path`. If a child is a function, it
// is invoked with its parent as context. Returns the value of the final
// child, or `fallback` if any child is undefined.
function result(obj, path, fallback) {
  path = toPath(path);
  var length = path.length;
  if (!length) {
    return isFunction$1(fallback) ? fallback.call(obj) : fallback;
  }
  for (var i = 0; i < length; i++) {
    var prop = obj == null ? void 0 : obj[path[i]];
    if (prop === void 0) {
      prop = fallback;
      i = length; // Ensure we don't continue iterating.
    }
    obj = isFunction$1(prop) ? prop.call(obj) : prop;
  }
  return obj;
}

// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
var idCounter = 0;
function uniqueId(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
}

// Start chaining a wrapped Underscore object.
function chain(obj) {
  var instance = _$1(obj);
  instance._chain = true;
  return instance;
}

// Internal function to execute `sourceFunc` bound to `context` with optional
// `args`. Determines whether to execute a function as a constructor or as a
// normal function.
function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
  var self = baseCreate(sourceFunc.prototype);
  var result = sourceFunc.apply(self, args);
  if (isObject(result)) return result;
  return self;
}

// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. `_` acts
// as a placeholder by default, allowing any combination of arguments to be
// pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
var partial = restArguments(function(func, boundArgs) {
  var placeholder = partial.placeholder;
  var bound = function() {
    var position = 0, length = boundArgs.length;
    var args = Array(length);
    for (var i = 0; i < length; i++) {
      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return executeBound(func, bound, this, this, args);
  };
  return bound;
});

partial.placeholder = _$1;

// Create a function bound to a given object (assigning `this`, and arguments,
// optionally).
var bind = restArguments(function(func, context, args) {
  if (!isFunction$1(func)) throw new TypeError('Bind must be called on a function');
  var bound = restArguments(function(callArgs) {
    return executeBound(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
});

// Internal helper for collection methods to determine whether a collection
// should be iterated as an array or as an object.
// Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
var isArrayLike = createSizePropertyCheck(getLength);

// Internal implementation of a recursive `flatten` function.
function flatten$1(input, depth, strict, output) {
  output = output || [];
  if (!depth && depth !== 0) {
    depth = Infinity;
  } else if (depth <= 0) {
    return output.concat(input);
  }
  var idx = output.length;
  for (var i = 0, length = getLength(input); i < length; i++) {
    var value = input[i];
    if (isArrayLike(value) && (isArray(value) || isArguments$1(value))) {
      // Flatten current level of array or arguments object.
      if (depth > 1) {
        flatten$1(value, depth - 1, strict, output);
        idx = output.length;
      } else {
        var j = 0, len = value.length;
        while (j < len) output[idx++] = value[j++];
      }
    } else if (!strict) {
      output[idx++] = value;
    }
  }
  return output;
}

// Bind a number of an object's methods to that object. Remaining arguments
// are the method names to be bound. Useful for ensuring that all callbacks
// defined on an object belong to it.
var bindAll = restArguments(function(obj, keys) {
  keys = flatten$1(keys, false, false);
  var index = keys.length;
  if (index < 1) throw new Error('bindAll must be passed function names');
  while (index--) {
    var key = keys[index];
    obj[key] = bind(obj[key], obj);
  }
  return obj;
});

// Memoize an expensive function by storing its results.
function memoize(func, hasher) {
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!has$1(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
}

// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
var delay = restArguments(function(func, wait, args) {
  return setTimeout(function() {
    return func.apply(null, args);
  }, wait);
});

// Defers a function, scheduling it to run after the current call stack has
// cleared.
var defer = partial(delay, _$1, 1);

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};

  var later = function() {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function() {
    var _now = now();
    if (!previous && options.leading === false) previous = _now;
    var remaining = wait - (_now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function() {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
}

// When a sequence of calls of the returned function ends, the argument
// function is triggered. The end of a sequence is defined by the `wait`
// parameter. If `immediate` is passed, the argument function will be
// triggered at the beginning of the sequence instead of at the end.
function debounce(func, wait, immediate) {
  var timeout, previous, args, result, context;

  var later = function() {
    var passed = now() - previous;
    if (wait > passed) {
      timeout = setTimeout(later, wait - passed);
    } else {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
      // This check is needed because `func` can recursively invoke `debounced`.
      if (!timeout) args = context = null;
    }
  };

  var debounced = restArguments(function(_args) {
    context = this;
    args = _args;
    previous = now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (immediate) result = func.apply(context, args);
    }
    return result;
  });

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = args = context = null;
  };

  return debounced;
}

// Returns the first function passed as an argument to the second,
// allowing you to adjust arguments, run code before and after, and
// conditionally execute the original function.
function wrap(func, wrapper) {
  return partial(wrapper, func);
}

// Returns a negated version of the passed-in predicate.
function negate(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  };
}

// Returns a function that is the composition of a list of functions, each
// consuming the return value of the function that follows.
function compose() {
  var args = arguments;
  var start = args.length - 1;
  return function() {
    var i = start;
    var result = args[start].apply(this, arguments);
    while (i--) result = args[i].call(this, result);
    return result;
  };
}

// Returns a function that will only be executed on and after the Nth call.
function after(times, func) {
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
}

// Returns a function that will only be executed up to (but not including) the
// Nth call.
function before(times, func) {
  var memo;
  return function() {
    if (--times > 0) {
      memo = func.apply(this, arguments);
    }
    if (times <= 1) func = null;
    return memo;
  };
}

// Returns a function that will be executed at most one time, no matter how
// often you call it. Useful for lazy initialization.
var once = partial(before, 2);

// Returns the first key on an object that passes a truth test.
function findKey(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = keys(obj), key;
  for (var i = 0, length = _keys.length; i < length; i++) {
    key = _keys[i];
    if (predicate(obj[key], key, obj)) return key;
  }
}

// Internal function to generate `_.findIndex` and `_.findLastIndex`.
function createPredicateIndexFinder(dir) {
  return function(array, predicate, context) {
    predicate = cb(predicate, context);
    var length = getLength(array);
    var index = dir > 0 ? 0 : length - 1;
    for (; index >= 0 && index < length; index += dir) {
      if (predicate(array[index], index, array)) return index;
    }
    return -1;
  };
}

// Returns the first index on an array-like that passes a truth test.
var findIndex = createPredicateIndexFinder(1);

// Returns the last index on an array-like that passes a truth test.
var findLastIndex = createPredicateIndexFinder(-1);

// Use a comparator function to figure out the smallest index at which
// an object should be inserted so as to maintain order. Uses binary search.
function sortedIndex(array, obj, iteratee, context) {
  iteratee = cb(iteratee, context, 1);
  var value = iteratee(obj);
  var low = 0, high = getLength(array);
  while (low < high) {
    var mid = Math.floor((low + high) / 2);
    if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
  }
  return low;
}

// Internal function to generate the `_.indexOf` and `_.lastIndexOf` functions.
function createIndexFinder(dir, predicateFind, sortedIndex) {
  return function(array, item, idx) {
    var i = 0, length = getLength(array);
    if (typeof idx == 'number') {
      if (dir > 0) {
        i = idx >= 0 ? idx : Math.max(idx + length, i);
      } else {
        length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
      }
    } else if (sortedIndex && idx && length) {
      idx = sortedIndex(array, item);
      return array[idx] === item ? idx : -1;
    }
    if (item !== item) {
      idx = predicateFind(slice.call(array, i, length), isNaN$1);
      return idx >= 0 ? idx + i : -1;
    }
    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
      if (array[idx] === item) return idx;
    }
    return -1;
  };
}

// Return the position of the first occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
var indexOf = createIndexFinder(1, findIndex, sortedIndex);

// Return the position of the last occurrence of an item in an array,
// or -1 if the item is not included in the array.
var lastIndexOf = createIndexFinder(-1, findLastIndex);

// Return the first value which passes a truth test.
function find(obj, predicate, context) {
  var keyFinder = isArrayLike(obj) ? findIndex : findKey;
  var key = keyFinder(obj, predicate, context);
  if (key !== void 0 && key !== -1) return obj[key];
}

// Convenience version of a common use case of `_.find`: getting the first
// object containing specific `key:value` pairs.
function findWhere(obj, attrs) {
  return find(obj, matcher(attrs));
}

// The cornerstone for collection functions, an `each`
// implementation, aka `forEach`.
// Handles raw objects in addition to array-likes. Treats all
// sparse array-likes as if they were dense.
function each(obj, iteratee, context) {
  iteratee = optimizeCb(iteratee, context);
  var i, length;
  if (isArrayLike(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      iteratee(obj[i], i, obj);
    }
  } else {
    var _keys = keys(obj);
    for (i = 0, length = _keys.length; i < length; i++) {
      iteratee(obj[_keys[i]], _keys[i], obj);
    }
  }
  return obj;
}

// Return the results of applying the iteratee to each element.
function map(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length,
      results = Array(length);
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    results[index] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}

// Internal helper to create a reducing function, iterating left or right.
function createReduce(dir) {
  // Wrap code that reassigns argument variables in a separate function than
  // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
  var reducer = function(obj, iteratee, memo, initial) {
    var _keys = !isArrayLike(obj) && keys(obj),
        length = (_keys || obj).length,
        index = dir > 0 ? 0 : length - 1;
    if (!initial) {
      memo = obj[_keys ? _keys[index] : index];
      index += dir;
    }
    for (; index >= 0 && index < length; index += dir) {
      var currentKey = _keys ? _keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  return function(obj, iteratee, memo, context) {
    var initial = arguments.length >= 3;
    return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
  };
}

// **Reduce** builds up a single result from a list of values, aka `inject`,
// or `foldl`.
var reduce = createReduce(1);

// The right-associative version of reduce, also known as `foldr`.
var reduceRight = createReduce(-1);

// Return all the elements that pass a truth test.
function filter(obj, predicate, context) {
  var results = [];
  predicate = cb(predicate, context);
  each(obj, function(value, index, list) {
    if (predicate(value, index, list)) results.push(value);
  });
  return results;
}

// Return all the elements for which a truth test fails.
function reject(obj, predicate, context) {
  return filter(obj, negate(cb(predicate)), context);
}

// Determine whether all of the elements pass a truth test.
function every(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (!predicate(obj[currentKey], currentKey, obj)) return false;
  }
  return true;
}

// Determine if at least one element in the object passes a truth test.
function some(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (predicate(obj[currentKey], currentKey, obj)) return true;
  }
  return false;
}

// Determine if the array or object contains a given item (using `===`).
function contains(obj, item, fromIndex, guard) {
  if (!isArrayLike(obj)) obj = values(obj);
  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  return indexOf(obj, item, fromIndex) >= 0;
}

// Invoke a method (with arguments) on every item in a collection.
var invoke = restArguments(function(obj, path, args) {
  var contextPath, func;
  if (isFunction$1(path)) {
    func = path;
  } else {
    path = toPath(path);
    contextPath = path.slice(0, -1);
    path = path[path.length - 1];
  }
  return map(obj, function(context) {
    var method = func;
    if (!method) {
      if (contextPath && contextPath.length) {
        context = deepGet(context, contextPath);
      }
      if (context == null) return void 0;
      method = context[path];
    }
    return method == null ? method : method.apply(context, args);
  });
});

// Convenience version of a common use case of `_.map`: fetching a property.
function pluck(obj, key) {
  return map(obj, property(key));
}

// Convenience version of a common use case of `_.filter`: selecting only
// objects containing specific `key:value` pairs.
function where(obj, attrs) {
  return filter(obj, matcher(attrs));
}

// Return the maximum element (or element-based computation).
function max(obj, iteratee, context) {
  var result = -Infinity, lastComputed = -Infinity,
      value, computed;
  if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
    obj = isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value > result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed > lastComputed || (computed === -Infinity && result === -Infinity)) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}

// Return the minimum element (or element-based computation).
function min(obj, iteratee, context) {
  var result = Infinity, lastComputed = Infinity,
      value, computed;
  if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
    obj = isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value < result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed < lastComputed || (computed === Infinity && result === Infinity)) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}

// Safely create a real, live array from anything iterable.
var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
function toArray(obj) {
  if (!obj) return [];
  if (isArray(obj)) return slice.call(obj);
  if (isString(obj)) {
    // Keep surrogate pair characters together.
    return obj.match(reStrSymbol);
  }
  if (isArrayLike(obj)) return map(obj, identity);
  return values(obj);
}

// Sample **n** random values from a collection using the modern version of the
// [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `_.map`.
function sample(obj, n, guard) {
  if (n == null || guard) {
    if (!isArrayLike(obj)) obj = values(obj);
    return obj[random(obj.length - 1)];
  }
  var sample = toArray(obj);
  var length = getLength(sample);
  n = Math.max(Math.min(n, length), 0);
  var last = length - 1;
  for (var index = 0; index < n; index++) {
    var rand = random(index, last);
    var temp = sample[index];
    sample[index] = sample[rand];
    sample[rand] = temp;
  }
  return sample.slice(0, n);
}

// Shuffle a collection.
function shuffle(obj) {
  return sample(obj, Infinity);
}

// Sort the object's values by a criterion produced by an iteratee.
function sortBy(obj, iteratee, context) {
  var index = 0;
  iteratee = cb(iteratee, context);
  return pluck(map(obj, function(value, key, list) {
    return {
      value: value,
      index: index++,
      criteria: iteratee(value, key, list)
    };
  }).sort(function(left, right) {
    var a = left.criteria;
    var b = right.criteria;
    if (a !== b) {
      if (a > b || a === void 0) return 1;
      if (a < b || b === void 0) return -1;
    }
    return left.index - right.index;
  }), 'value');
}

// An internal function used for aggregate "group by" operations.
function group(behavior, partition) {
  return function(obj, iteratee, context) {
    var result = partition ? [[], []] : {};
    iteratee = cb(iteratee, context);
    each(obj, function(value, index) {
      var key = iteratee(value, index, obj);
      behavior(result, value, key);
    });
    return result;
  };
}

// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
var groupBy = group(function(result, value, key) {
  if (has$1(result, key)) result[key].push(value); else result[key] = [value];
});

// Indexes the object's values by a criterion, similar to `_.groupBy`, but for
// when you know that your index values will be unique.
var indexBy = group(function(result, value, key) {
  result[key] = value;
});

// Counts instances of an object that group by a certain criterion. Pass
// either a string attribute to count by, or a function that returns the
// criterion.
var countBy = group(function(result, value, key) {
  if (has$1(result, key)) result[key]++; else result[key] = 1;
});

// Split a collection into two arrays: one whose elements all pass the given
// truth test, and one whose elements all do not pass the truth test.
var partition = group(function(result, value, pass) {
  result[pass ? 0 : 1].push(value);
}, true);

// Return the number of elements in a collection.
function size(obj) {
  if (obj == null) return 0;
  return isArrayLike(obj) ? obj.length : keys(obj).length;
}

// Internal `_.pick` helper function to determine whether `key` is an enumerable
// property name of `obj`.
function keyInObj(value, key, obj) {
  return key in obj;
}

// Return a copy of the object only containing the allowed properties.
var pick = restArguments(function(obj, keys) {
  var result = {}, iteratee = keys[0];
  if (obj == null) return result;
  if (isFunction$1(iteratee)) {
    if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
    keys = allKeys(obj);
  } else {
    iteratee = keyInObj;
    keys = flatten$1(keys, false, false);
    obj = Object(obj);
  }
  for (var i = 0, length = keys.length; i < length; i++) {
    var key = keys[i];
    var value = obj[key];
    if (iteratee(value, key, obj)) result[key] = value;
  }
  return result;
});

// Return a copy of the object without the disallowed properties.
var omit = restArguments(function(obj, keys) {
  var iteratee = keys[0], context;
  if (isFunction$1(iteratee)) {
    iteratee = negate(iteratee);
    if (keys.length > 1) context = keys[1];
  } else {
    keys = map(flatten$1(keys, false, false), String);
    iteratee = function(value, key) {
      return !contains(keys, key);
    };
  }
  return pick(obj, iteratee, context);
});

// Returns everything but the last entry of the array. Especially useful on
// the arguments object. Passing **n** will return all the values in
// the array, excluding the last N.
function initial(array, n, guard) {
  return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
}

// Get the first element of an array. Passing **n** will return the first N
// values in the array. The **guard** check allows it to work with `_.map`.
function first(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[0];
  return initial(array, array.length - n);
}

// Returns everything but the first entry of the `array`. Especially useful on
// the `arguments` object. Passing an **n** will return the rest N values in the
// `array`.
function rest(array, n, guard) {
  return slice.call(array, n == null || guard ? 1 : n);
}

// Get the last element of an array. Passing **n** will return the last N
// values in the array.
function last(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[array.length - 1];
  return rest(array, Math.max(0, array.length - n));
}

// Trim out all falsy values from an array.
function compact(array) {
  return filter(array, Boolean);
}

// Flatten out an array, either recursively (by default), or up to `depth`.
// Passing `true` or `false` as `depth` means `1` or `Infinity`, respectively.
function flatten(array, depth) {
  return flatten$1(array, depth, false);
}

// Take the difference between one array and a number of other arrays.
// Only the elements present in just the first array will remain.
var difference = restArguments(function(array, rest) {
  rest = flatten$1(rest, true, true);
  return filter(array, function(value){
    return !contains(rest, value);
  });
});

// Return a version of the array that does not contain the specified value(s).
var without = restArguments(function(array, otherArrays) {
  return difference(array, otherArrays);
});

// Produce a duplicate-free version of the array. If the array has already
// been sorted, you have the option of using a faster algorithm.
// The faster algorithm will not work with an iteratee if the iteratee
// is not a one-to-one function, so providing an iteratee will disable
// the faster algorithm.
function uniq(array, isSorted, iteratee, context) {
  if (!isBoolean(isSorted)) {
    context = iteratee;
    iteratee = isSorted;
    isSorted = false;
  }
  if (iteratee != null) iteratee = cb(iteratee, context);
  var result = [];
  var seen = [];
  for (var i = 0, length = getLength(array); i < length; i++) {
    var value = array[i],
        computed = iteratee ? iteratee(value, i, array) : value;
    if (isSorted && !iteratee) {
      if (!i || seen !== computed) result.push(value);
      seen = computed;
    } else if (iteratee) {
      if (!contains(seen, computed)) {
        seen.push(computed);
        result.push(value);
      }
    } else if (!contains(result, value)) {
      result.push(value);
    }
  }
  return result;
}

// Produce an array that contains the union: each distinct element from all of
// the passed-in arrays.
var union = restArguments(function(arrays) {
  return uniq(flatten$1(arrays, true, true));
});

// Produce an array that contains every item shared between all the
// passed-in arrays.
function intersection(array) {
  var result = [];
  var argsLength = arguments.length;
  for (var i = 0, length = getLength(array); i < length; i++) {
    var item = array[i];
    if (contains(result, item)) continue;
    var j;
    for (j = 1; j < argsLength; j++) {
      if (!contains(arguments[j], item)) break;
    }
    if (j === argsLength) result.push(item);
  }
  return result;
}

// Complement of zip. Unzip accepts an array of arrays and groups
// each array's elements on shared indices.
function unzip(array) {
  var length = (array && max(array, getLength).length) || 0;
  var result = Array(length);

  for (var index = 0; index < length; index++) {
    result[index] = pluck(array, index);
  }
  return result;
}

// Zip together multiple lists into a single array -- elements that share
// an index go together.
var zip = restArguments(unzip);

// Converts lists into objects. Pass either a single array of `[key, value]`
// pairs, or two parallel arrays of the same length -- one of keys, and one of
// the corresponding values. Passing by pairs is the reverse of `_.pairs`.
function object(list, values) {
  var result = {};
  for (var i = 0, length = getLength(list); i < length; i++) {
    if (values) {
      result[list[i]] = values[i];
    } else {
      result[list[i][0]] = list[i][1];
    }
  }
  return result;
}

// Generate an integer Array containing an arithmetic progression. A port of
// the native Python `range()` function. See
// [the Python documentation](https://docs.python.org/library/functions.html#range).
function range(start, stop, step) {
  if (stop == null) {
    stop = start || 0;
    start = 0;
  }
  if (!step) {
    step = stop < start ? -1 : 1;
  }

  var length = Math.max(Math.ceil((stop - start) / step), 0);
  var range = Array(length);

  for (var idx = 0; idx < length; idx++, start += step) {
    range[idx] = start;
  }

  return range;
}

// Chunk a single array into multiple arrays, each containing `count` or fewer
// items.
function chunk(array, count) {
  if (count == null || count < 1) return [];
  var result = [];
  var i = 0, length = array.length;
  while (i < length) {
    result.push(slice.call(array, i, i += count));
  }
  return result;
}

// Helper function to continue chaining intermediate results.
function chainResult(instance, obj) {
  return instance._chain ? _$1(obj).chain() : obj;
}

// Add your own custom functions to the Underscore object.
function mixin(obj) {
  each(functions(obj), function(name) {
    var func = _$1[name] = obj[name];
    _$1.prototype[name] = function() {
      var args = [this._wrapped];
      push.apply(args, arguments);
      return chainResult(this, func.apply(_$1, args));
    };
  });
  return _$1;
}

// Add all mutator `Array` functions to the wrapper.
each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
  var method = ArrayProto[name];
  _$1.prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) {
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) {
        delete obj[0];
      }
    }
    return chainResult(this, obj);
  };
});

// Add all accessor `Array` functions to the wrapper.
each(['concat', 'join', 'slice'], function(name) {
  var method = ArrayProto[name];
  _$1.prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) obj = method.apply(obj, arguments);
    return chainResult(this, obj);
  };
});

// Named Exports

var allExports = {
  __proto__: null,
  VERSION: VERSION,
  restArguments: restArguments,
  isObject: isObject,
  isNull: isNull,
  isUndefined: isUndefined,
  isBoolean: isBoolean,
  isElement: isElement,
  isString: isString,
  isNumber: isNumber,
  isDate: isDate,
  isRegExp: isRegExp,
  isError: isError,
  isSymbol: isSymbol,
  isArrayBuffer: isArrayBuffer,
  isDataView: isDataView$1,
  isArray: isArray,
  isFunction: isFunction$1,
  isArguments: isArguments$1,
  isFinite: isFinite$1,
  isNaN: isNaN$1,
  isTypedArray: isTypedArray$1,
  isEmpty: isEmpty,
  isMatch: isMatch,
  isEqual: isEqual,
  isMap: isMap,
  isWeakMap: isWeakMap,
  isSet: isSet,
  isWeakSet: isWeakSet,
  keys: keys,
  allKeys: allKeys,
  values: values,
  pairs: pairs,
  invert: invert,
  functions: functions,
  methods: functions,
  extend: extend,
  extendOwn: extendOwn,
  assign: extendOwn,
  defaults: defaults,
  create: create,
  clone: clone,
  tap: tap,
  get: get,
  has: has,
  mapObject: mapObject,
  identity: identity,
  constant: constant,
  noop: noop,
  toPath: toPath$1,
  property: property,
  propertyOf: propertyOf,
  matcher: matcher,
  matches: matcher,
  times: times,
  random: random,
  now: now,
  escape: _escape,
  unescape: _unescape,
  templateSettings: templateSettings,
  template: template,
  result: result,
  uniqueId: uniqueId,
  chain: chain,
  iteratee: iteratee,
  partial: partial,
  bind: bind,
  bindAll: bindAll,
  memoize: memoize,
  delay: delay,
  defer: defer,
  throttle: throttle,
  debounce: debounce,
  wrap: wrap,
  negate: negate,
  compose: compose,
  after: after,
  before: before,
  once: once,
  findKey: findKey,
  findIndex: findIndex,
  findLastIndex: findLastIndex,
  sortedIndex: sortedIndex,
  indexOf: indexOf,
  lastIndexOf: lastIndexOf,
  find: find,
  detect: find,
  findWhere: findWhere,
  each: each,
  forEach: each,
  map: map,
  collect: map,
  reduce: reduce,
  foldl: reduce,
  inject: reduce,
  reduceRight: reduceRight,
  foldr: reduceRight,
  filter: filter,
  select: filter,
  reject: reject,
  every: every,
  all: every,
  some: some,
  any: some,
  contains: contains,
  includes: contains,
  include: contains,
  invoke: invoke,
  pluck: pluck,
  where: where,
  max: max,
  min: min,
  shuffle: shuffle,
  sample: sample,
  sortBy: sortBy,
  groupBy: groupBy,
  indexBy: indexBy,
  countBy: countBy,
  partition: partition,
  toArray: toArray,
  size: size,
  pick: pick,
  omit: omit,
  first: first,
  head: first,
  take: first,
  initial: initial,
  last: last,
  rest: rest,
  tail: rest,
  drop: rest,
  compact: compact,
  flatten: flatten,
  without: without,
  uniq: uniq,
  unique: uniq,
  union: union,
  intersection: intersection,
  difference: difference,
  unzip: unzip,
  transpose: unzip,
  zip: zip,
  object: object,
  range: range,
  chunk: chunk,
  mixin: mixin,
  'default': _$1
};

// Default Export

// Add all of the Underscore functions to the wrapper object.
var _ = mixin(allExports);
// Legacy Node.js API.
_._ = _;

exports.VERSION = VERSION;
exports._ = _;
exports._escape = _escape;
exports._unescape = _unescape;
exports.after = after;
exports.allKeys = allKeys;
exports.before = before;
exports.bind = bind;
exports.bindAll = bindAll;
exports.chain = chain;
exports.chunk = chunk;
exports.clone = clone;
exports.compact = compact;
exports.compose = compose;
exports.constant = constant;
exports.contains = contains;
exports.countBy = countBy;
exports.create = create;
exports.debounce = debounce;
exports.defaults = defaults;
exports.defer = defer;
exports.delay = delay;
exports.difference = difference;
exports.each = each;
exports.every = every;
exports.extend = extend;
exports.extendOwn = extendOwn;
exports.filter = filter;
exports.find = find;
exports.findIndex = findIndex;
exports.findKey = findKey;
exports.findLastIndex = findLastIndex;
exports.findWhere = findWhere;
exports.first = first;
exports.flatten = flatten;
exports.functions = functions;
exports.get = get;
exports.groupBy = groupBy;
exports.has = has;
exports.identity = identity;
exports.indexBy = indexBy;
exports.indexOf = indexOf;
exports.initial = initial;
exports.intersection = intersection;
exports.invert = invert;
exports.invoke = invoke;
exports.isArguments = isArguments$1;
exports.isArray = isArray;
exports.isArrayBuffer = isArrayBuffer;
exports.isBoolean = isBoolean;
exports.isDataView = isDataView$1;
exports.isDate = isDate;
exports.isElement = isElement;
exports.isEmpty = isEmpty;
exports.isEqual = isEqual;
exports.isError = isError;
exports.isFinite = isFinite$1;
exports.isFunction = isFunction$1;
exports.isMap = isMap;
exports.isMatch = isMatch;
exports.isNaN = isNaN$1;
exports.isNull = isNull;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isRegExp = isRegExp;
exports.isSet = isSet;
exports.isString = isString;
exports.isSymbol = isSymbol;
exports.isTypedArray = isTypedArray$1;
exports.isUndefined = isUndefined;
exports.isWeakMap = isWeakMap;
exports.isWeakSet = isWeakSet;
exports.iteratee = iteratee;
exports.keys = keys;
exports.last = last;
exports.lastIndexOf = lastIndexOf;
exports.map = map;
exports.mapObject = mapObject;
exports.matcher = matcher;
exports.max = max;
exports.memoize = memoize;
exports.min = min;
exports.mixin = mixin;
exports.negate = negate;
exports.noop = noop;
exports.now = now;
exports.object = object;
exports.omit = omit;
exports.once = once;
exports.pairs = pairs;
exports.partial = partial;
exports.partition = partition;
exports.pick = pick;
exports.pluck = pluck;
exports.property = property;
exports.propertyOf = propertyOf;
exports.random = random;
exports.range = range;
exports.reduce = reduce;
exports.reduceRight = reduceRight;
exports.reject = reject;
exports.rest = rest;
exports.restArguments = restArguments;
exports.result = result;
exports.sample = sample;
exports.shuffle = shuffle;
exports.size = size;
exports.some = some;
exports.sortBy = sortBy;
exports.sortedIndex = sortedIndex;
exports.tap = tap;
exports.template = template;
exports.templateSettings = templateSettings;
exports.throttle = throttle;
exports.times = times;
exports.toArray = toArray;
exports.toPath = toPath$1;
exports.union = union;
exports.uniq = uniq;
exports.uniqueId = uniqueId;
exports.unzip = unzip;
exports.values = values;
exports.where = where;
exports.without = without;
exports.wrap = wrap;
exports.zip = zip;
//# sourceMappingURL=underscore-node-f.cjs.map


/***/ }),

/***/ 5067:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

//     Underscore.js 1.13.6
//     https://underscorejs.org
//     (c) 2009-2022 Jeremy Ashkenas, Julian Gonggrijp, and DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

var underscoreNodeF = __nccwpck_require__(6717);



module.exports = underscoreNodeF._;
//# sourceMappingURL=underscore-node.cjs.map


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
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
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
const core = __nccwpck_require__(2186);
const avrolint = __nccwpck_require__(217);

async function run() {
  try {
    // 'avsc-to-lint' input defined in action metadata file
    const avscToLint = core.getInput('avsc-to-lint', {required: true});
    const undocumentedCheck = core.getInput(
      'undocumented-field-check',
      {required: true}
    );
		const complexUnionCheck = core.getInput(
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