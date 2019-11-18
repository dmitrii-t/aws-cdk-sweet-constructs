import 'source-map-support/register';
import {SNSMessage, SQSEvent, SQSRecord} from 'aws-lambda';
import {Message} from '../../model/Message';

function handleMessage(sqsMessage: SQSRecord) {
  const snsMessage: SNSMessage = JSON.parse(sqsMessage.body);
  const message: Message = JSON.parse(snsMessage.Message);
  console.log(`processing message ${JSON.stringify(message)}`);
}

export async function handleSQSEvent(event: SQSEvent) {
  console.log(`Handled SQS Event ${JSON.stringify(event)}`);

  event.Records.forEach((message: SQSRecord) => {
    try {
      handleMessage(message);

    } catch (e) {
      console.error(`Fail to process SQS msg ${message.messageId}`, e);
    }
  });
};
