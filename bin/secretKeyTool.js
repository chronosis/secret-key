#!/usr/bin/env node
/* eslint no-console: "off" */

const program = require('commander');
const colors = require('colors');
const secretKey = require('../index');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .option(
    '-g, --generate',
    'Create a new Secret Key using the encryption key (-e) provided.'
  )
  .option(
    '-c, --check',
    'Check the Secret Key against the Encryption Key, IV, and timestamp'
  )
  .option(
    '-e, --enckey <enckey>',
    'Encryption Key to use for generation and checking'
  )
  .option(
    '-i, --iv <iv>',
    'Initialization Vector used to create or check a secret key. Note: This should be a UUID.'
  )
  .option(
    '-t, --timestamp <timestamp>',
    'Timestamp used to create or check a secret key. Note: This should be a UNIX timestamp integer.'
  )
  .option('-s, --secret <secret>', 'Secret Key to check');

program.on('--help', () => {
  console.log('');
  console.log(`  Version: ${pkg.version}`);
});

program.parse(process.argv);

let compareCheck, out;
const iv = program.iv;
const timestamp = program.timestamp;

if (program.generate) {
  if (!program.enckey) {
    console.log('Missing encryption key, please pass one with the --enckey option.');
    program.help();
  } else {
    out = secretKey.create(program.enckey, iv, timestamp);
    console.log(`   ${colors.cyan('EncKey')}(${colors.grey.underline(program.enckey)})`);
    console.log(`   ${colors.cyan('Secret')}(${colors.grey.underline(out.secret)})`);
    console.log(`       ${colors.cyan('IV')}(${colors.grey.underline(out.iv)})`);
    console.log(`${colors.cyan('timestamp')}(${colors.grey.underline(out.timestamp)})`);
  }
} else if (program.check) {
  if (!program.iv && !program.timestamp && !program.enckey && !program.secret) {
    program.help();
  } else if (
    program.iv && program.timestamp && program.enckey && program.secret
  ) {
    // Both were passed and both are valid
    compareCheck = secretKey.check(
      program.enckey,
      program.secret,
      iv,
      timestamp
    );
    out = compareCheck ? colors.green('true') : colors.red('false');
    console.log(`Secret & Generation Values [EncKey, IV, Timestamp] match : [${out}]`);
  }
  console.log('');
} else {
  program.help();

  console.log('');
}
