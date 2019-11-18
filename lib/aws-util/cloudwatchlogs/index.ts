import { LogGroup, OutputLogEvents } from 'aws-sdk/clients/cloudwatchlogs';
import AWS from 'aws-sdk';

const defaultProps: LogEventsInGroupProps = {
  cwLogsClient: new AWS.CloudWatchLogs()
};

export interface LogEventsInGroupProps {
  cwLogsClient: AWS.CloudWatchLogs;
  logGroupPrefix?: string;
}

export async function getLogEventInGroup(props: LogEventsInGroupProps = defaultProps): Promise<OutputLogEvents> {
  const {cwLogsClient, logGroupPrefix} = props;

  const logGroupsResp = await cwLogsClient.describeLogGroups({
    logGroupNamePrefix: logGroupPrefix,
    limit: 1
  }).promise();

  const logGroup: LogGroup = logGroupsResp.logGroups!![0];

  // Gets the most recent log stream
  const logStreamsResp = await cwLogsClient.describeLogStreams({
    logGroupName: logGroup.logGroupName!!,
    orderBy: 'LastEventTime',
    descending: true,
    limit: 1
  }).promise();

  const logStream = logStreamsResp.logStreams!![0];

  const logEventsResp = await cwLogsClient.getLogEvents({
    logGroupName: logGroup.logGroupName!!,
    logStreamName: logStream.logStreamName!!
  }).promise();

  return logEventsResp.events!!;
}
