// import 'source-map-support/register';
import {Construct} from '@aws-cdk/core';
import * as sqs from '@aws-cdk/aws-sqs';
import {Queue} from '@aws-cdk/aws-sqs';
import * as sns from '@aws-cdk/aws-sns';
import {SqsSubscription} from '@aws-cdk/aws-sns-subscriptions';
import * as lambda from '@aws-cdk/aws-lambda';
import {Code, Runtime} from '@aws-cdk/aws-lambda';
import {SqsEventSource} from '@aws-cdk/aws-lambda-event-sources';

interface TopicQueueWithHandlerProps extends sqs.QueueProps {
    id: string;
    sourceTopic: sns.Topic;
}

const lambdaProps = {
    handler: 'index.handleSQSEvent',
    runtime: Runtime.NODEJS_10_X,
    code: Code.fromAsset('./dist/bundle'),
};

/**
 * Builds the stack
 */
export class TopicQueueWithHandlerConstruct extends Construct {

    private readonly queue: Queue;

    private readonly queueHandler: lambda.Function;

    private readonly deadLetterQueue: Queue;

    // --
    public get queueUrl(): string {
        return this.queue.queueUrl;
    }

    public get queueHandlerName(): string {
        return this.queueHandler.functionName;
    }

    public get queueHandlerArn(): string {
        return this.queueHandler.functionArn
    }

    constructor(scope: Construct, props: TopicQueueWithHandlerProps) {
        super(scope, props.id);

        const {id, sourceTopic} = props;

        // DL Q
        this.deadLetterQueue = new Queue(scope, 'DeadLetterQueue', {});

        // Main Q
        this.queue = new Queue(scope, 'Queue', {
            // Main Q name
            queueName: `${id}Queue`,
            // DL Q reference
            deadLetterQueue: {
                queue: this.deadLetterQueue,
                maxReceiveCount: 1,
                ...props.deadLetterQueue
            }
        });

        // Queue handler
        this.queueHandler = new lambda.Function(scope, 'QueueHandler', lambdaProps);
        this.queueHandler.addEventSource(new SqsEventSource(this.queue));

        // Adds subscription to the topic
        sourceTopic.addSubscription(new SqsSubscription(this.queue));
    }
}
