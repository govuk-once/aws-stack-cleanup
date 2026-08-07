import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";

export interface ILambdaRoute {
    path: string;
    methods: string[];
    lambda: lambda.IFunction;
    auth?: apigateway.MethodOptions;
    skipCheckovRule?: string;
}
