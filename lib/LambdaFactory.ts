import { Construct } from "constructs";
import { FactoryBase } from "./FactoryBase.js";
import { INamingProvider } from "./namingProviders/INamingProvider.js";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";

export interface ILambdaProperties extends lambda.FunctionProps {
    duration: number;
    key: cdk.aws_kms.Key;
    methods?: string[];
    name: string;
    path?: string;
    retentionDays?: logs.RetentionDays;
    skipCheckovRule?: string;
}

export interface IEnvironmentVariable {
    name: string;
    value: string;
}

class constants {
    static MEMORY_SIZE = 256;
    static DURATION = 10;
    static METHODS = ["get"];
    static PATH_ERROR = "PATH NOT SET";
    static RETENTION_DAYS;
}

export class LambdaFactory extends FactoryBase {
    private readonly scope: Construct;

    constructor(scope: Construct, serviceName: string, namingProvider?: INamingProvider) {
        super(serviceName, namingProvider);
        this.scope = scope;
    }

    createLambda(id: string, props: ILambdaProperties): lambda.Function {
        const namedProps = { ...props };
        namedProps.functionName = `${this.getResourceName(props.name)}`;
        namedProps.timeout = cdk.Duration.seconds(props.duration);
        const log = new logs.LogGroup(this.scope, `${this.getResourceId(id)}-LogGroup`, {
            logGroupName: `/aws/lambda/${this.getResourceName(namedProps.functionName)}`,
            retention: props.retentionDays
                ? props.retentionDays
                : constants.RETENTION_DAYS,
            encryptionKey: props.key,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        namedProps.logGroup = log;
        const newFunction = new lambda.Function(this.scope, this.getResourceId(id), namedProps);
        return newFunction;
    }

    // @deprecated Use addEnvironmentVariables instead
    addEnvironmentVariable(fn: lambda.IFunction, variable: IEnvironmentVariable): void {
        if (this.isLambdaFunction(fn)) {
            (fn as lambda.Function).addEnvironment(variable.name, variable.value);
        }
    }

    addEnvironmentVariables(fn: lambda.IFunction, variables: IEnvironmentVariable[]): void {
        if (this.isLambdaFunction(fn)) {
            variables.forEach((en) => (fn as lambda.Function).addEnvironment(en.name, en.value));
        }
    }

    private isLambdaFunction = (fn: unknown): fn is lambda.Function => {
        return fn instanceof lambda.Function;
    };
}
