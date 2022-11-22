const core = require('@actions/core');
const avrolint = require('./avrolint');

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
