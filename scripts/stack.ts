import {App, CfnOutput, Stack} from '@aws-cdk/core';
import {CdkOut, deployStack, describeStack, destroyStack} from '../lib/cdk-util';
import * as sns from '@aws-cdk/aws-sns';

const yaml = require('js-yaml');

/**
 * Stack to deploy
 */
class AppStack extends Stack {

  constructor(public readonly scope: App,
              public readonly id: string = AppStack.name) {
    super(scope, id);

    /**
     * Stack Resources below
     */
    const topic = new sns.Topic(this, 'Topic');
    // const consumingConstruct = new Construct(this, {id: 'TopicHandler', sourceTopic});

    /**
     * Stack Outputs
     */
    // new CfnOutput(this, 'QueueUrl', {value: consumingConstruct.queueUrl});
    new CfnOutput(this, 'TopicArn', {value: topic.topicArn});
  }
}

const handlers = new Map([
  ['deploy', deployStack],
  ['destroy', destroyStack],
  ['describe', async props => {
    const descr = await describeStack(props);
    // Prints as YAML
    console.info(yaml.safeDump(descr));
  }]
]);

// Exports
export async function stack() {
  const args = process.argv;
  console.info(`Script args:${args}`);
  console.info(`AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID}`);

  const cmd = args[args.length - 1];
  const handler = handlers.get(cmd) || (() => {
    throw Error(`Handler for command ${cmd} is not defined`);
  });

  const app = new App({outdir: CdkOut});
  const stack = new AppStack(app);
  await handler({name: stack.id, app, exclusively: true});
}


