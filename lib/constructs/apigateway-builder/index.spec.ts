// Integration test
import {ApiGatewayBuilder} from './index';
import {App, CfnOutput, Stack} from '@aws-cdk/core';
import {CdkOut, deployStack, describeStack, destroyStack} from '../../cdk-util';
import {should} from '../../test-util';
import fetch from 'node-fetch';
import {expect} from 'chai';

describe('apigateway-with-lambda-proxy', () => {
    /**
     * Stack to deploy the construct for tests
     */
    class LambdaProxyIntegrationTestStack extends Stack {
        constructor(scope: App, id: string = LambdaProxyIntegrationTestStack.name) {
            super(scope, id);

            const producingConstruct = new ApiGatewayBuilder(this, {id: 'TestApiGateway'});

            // Child resource one
            producingConstruct.resource('/test/child/one')
                .addCors({allowOrigins: ['*'], allowMethods: ['GET']})
                .addLambdaProxyIntegration('GET');

            // Child resource two
            producingConstruct.resource('/test/child/two')
                .addCors({allowOrigins: ['*'], allowMethods: ['GET']})
                .addLambdaProxyIntegration('GET');

            // Outputs
            new CfnOutput(this, 'ResourceOneUrl', {value: producingConstruct.resourceUrl('/test/child/one')});
            new CfnOutput(this, 'ResourceOneHandlerName', {value: producingConstruct.resource('/test/child/one').handlerName!!});

            new CfnOutput(this, 'ResourceTwoUrl', {value: producingConstruct.resourceUrl('/test/child/two')});
            new CfnOutput(this, 'ResourceTwoHandlerName', {value: producingConstruct.resource('/test/child/two').handlerName!!});
        }
    }

    const id = 'TestApiGatewayWithLambdaProxy';
    const app = new App({outdir: CdkOut});
    const stack = new LambdaProxyIntegrationTestStack(app, id);

    // Setup task
    before(async () => {
        await deployStack({name: id, app, exclusively: true});
    });

    // Cleanup task
    after(async () => {
        await destroyStack({name: id, app, exclusively: true});
    });

    it('should see message from lambda handlers for both resources in the log', should(async () => {
        // Given
        const {environment, stack} = await describeStack({name: id, app, exclusively: true});
        const resourceOneUrl = stack.Outputs!!.find(it => it.OutputKey === 'ResourceOneUrl')!!.OutputValue;
        const resourceTwoUrl = stack.Outputs!!.find(it => it.OutputKey === 'ResourceTwoUrl')!!.OutputValue;

        // Then
        // it('should respond with status 200', should(async () => {
        const responseOne = await fetch(resourceOneUrl!!);
        expect(responseOne.status).to.equal(200);

        const responseTwo = await fetch(resourceTwoUrl!!);
        expect(responseTwo.status).to.equal(200);
        // }));

        // Return completed promise
        return Promise.resolve();
    }));
});

