import * as AWS from 'aws-sdk';
import * as iam from './iam';
import * as sqs from './sqs';

// Inits AWS SDK
AWS.config.update({region: process.env.AWS_DEFAULT_REGION});
console.info(`AwsRegion:${process.env.AWS_DEFAULT_REGION}`);

const handlers = new Map([
  ['sqs:send', sqs.sendMessage],
  ['iam:usr', iam.getUser]
]);

// Exports
export async function aws() {
  const args = process.argv;
  console.info(`Script args:${args}`);

  console.info(`Credentials:`);
  console.info(`AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID}`);
  const cmd = args[1];
  const handler = handlers.get(cmd) || (() => {
    throw Error(`Handler for command ${cmd} is not defined`);
  });
  await handler();
}

