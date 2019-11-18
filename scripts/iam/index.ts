import * as AWS from 'aws-sdk';

export async function getUser(): Promise<void> {
  const iam = new AWS.IAM();
  const response = await iam.getUser().promise();
  // Prints user name
  console.info(response.User.Arn);
}
