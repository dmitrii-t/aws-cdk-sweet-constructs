import * as AWS from 'aws-sdk';
import {SendMessageRequest} from 'aws-sdk/clients/sqs';

const defaultSendMessageSqsProps: SendMessageSQSProps = {
  queueUrl: 'https://sqs.us-west-2.amazonaws.com/104846358986/QueueHandlerStackQueue',
  message: '{ "message": "blah" }'
};

export interface SendMessageSQSProps {
  queueUrl: string;
  message: string;
}

export async function sendMessage(): Promise<void> {
  const {queueUrl, message} = defaultSendMessageSqsProps;
  const sqs = new AWS.SQS();
  // Prepares the request
  const request: SendMessageRequest = {
    QueueUrl: queueUrl,
    MessageBody: message
  };
  // Sends the message
  const response = await sqs.sendMessage(request).promise();
}
