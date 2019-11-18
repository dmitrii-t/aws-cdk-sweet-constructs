// Integration test
import { TopicQueueWithHandlerConstruct } from './index';
import AWS from 'aws-sdk';
import { App, CfnOutput, Stack } from '@aws-cdk/core';
import {should, wait} from '../../test-util';
import {OutputLogEvent, OutputLogEvents} from 'aws-sdk/clients/cloudwatchlogs';
import { expect } from 'chai';
import { Message } from '../../model/Message';
import { deployStack, describeStack, destroyStack, CdkOut } from '../../cdk-util';
import { getLogEventInGroup } from '../../aws-util/cloudwatchlogs';
import * as sns from '@aws-cdk/aws-sns';


describe('topic-queue-with-handler', () => {
  /**
   * Stack to deploy the construct for tests
   */
  class TestStack extends Stack {
    constructor(scope: App, id: string = TestStack.name) {
      super(scope, id);

      const sourceTopic = new sns.Topic(this, 'Topic');
      const consumingConstruct = new TopicQueueWithHandlerConstruct(this, {id: 'TopicHandler', sourceTopic});

      // Outputs
      new CfnOutput(this, 'QueueUrl', {value: consumingConstruct.queueUrl});
      new CfnOutput(this, 'QueueHandlerName', {value: consumingConstruct.queueHandlerName});
      new CfnOutput(this, 'TopicArn', {value: sourceTopic.topicArn});
    }
  }

  const id = 'TestTopicQueueWithHandler';
  const app = new App({outdir: CdkOut});
  const stack = new TestStack(app, id);

  // Setup task
  before(async () => {
    await deployStack({name: id, app, exclusively: true});
  });

  // Cleanup task
  after(async () => {
    await destroyStack({name: id, app, exclusively: true});
  });

  it('should process the message sent to the topic', should(async () => {
    // Given
    const {environment, stack} = await describeStack({name: id, app, exclusively: true});
    const queueHandlerName = stack.Outputs!!.find(it => it.OutputKey === 'QueueHandlerName')!!.OutputValue;
    const topicArn = stack.Outputs!!.find(it => it.OutputKey === 'TopicArn')!!.OutputValue;

    AWS.config.update({region: 'us-west-2'});
    const snsClient = new AWS.SNS();
    const cwLogsClient = new AWS.CloudWatchLogs();

    // When
    const message: Message = {createdAt: new Date()};
    const messageStr = JSON.stringify(message);
    await snsClient.publish({
      TopicArn: topicArn, Message: messageStr
    }).promise();

    // Wait for log record to appear
    await wait(5);

    // Then
    const queueHandlerLogEvents: OutputLogEvents = await getLogEventInGroup({
        logGroupPrefix: `/aws/lambda/${queueHandlerName}`,
        cwLogsClient
    });
    const queueHandlerLogEvent: OutputLogEvent | undefined = queueHandlerLogEvents.find(it => it.message!!.indexOf('Handled SQS Event') > 0);
    expect(queueHandlerLogEvent).to.exist;

    // Return completed promise
    return Promise.resolve();
  }));
});
