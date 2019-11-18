import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';


export async function handleApiGatewayEvent(event: APIGatewayEvent) {
    console.log(`Handled ApiGateway Event for Resource ${event.resource}`);
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: '',
    };
    return result;
}