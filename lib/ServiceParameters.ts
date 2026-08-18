import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import type { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';

export class ServiceParameters {
  private readonly scope: Construct;
  private hostedZoneNamecache: cdk.aws_ssm.IStringParameter | undefined;
  private hostedZoneIdCache: cdk.aws_ssm.IStringParameter | undefined;
  private hostedZoneCache: cdk.aws_route53.IHostedZone | undefined;
  private acmCertArnCache: cdk.aws_ssm.IStringParameter | undefined;
  private certificateCache: ICertificate | undefined;

  constructor(scope: Construct) {
    this.scope = scope;
  }

  hostedZoneName(): string {
    if (!this.hostedZoneNamecache) {
      this.hostedZoneNamecache =
        cdk.aws_ssm.StringParameter.fromStringParameterName(
          this.scope,
          `HostedZoneName`,
          '/infra/dns/hostedzonename',
        );
    }
    return this.hostedZoneNamecache.stringValue;
  }

  hostedZoneId(): string {
    if (!this.hostedZoneIdCache) {
      this.hostedZoneIdCache =
        cdk.aws_ssm.StringParameter.fromStringParameterName(
          this.scope,
          `HostedZoneId`,
          '/infra/dns/hostedzoneid',
        );
    }
    return this.hostedZoneIdCache.stringValue;
  }

  acmCertArn(): cdk.aws_ssm.IStringParameter {
    if (!this.acmCertArnCache) {
      this.acmCertArnCache =
        cdk.aws_ssm.StringParameter.fromStringParameterName(
          this.scope,
          'acmCertArn',
          '/infra/acm/certificatearnregional',
        );
    }
    return this.acmCertArnCache;
  }

  zone(): cdk.aws_route53.IHostedZone {
    if (!this.hostedZoneCache) {
      this.hostedZoneCache =
        cdk.aws_route53.HostedZone.fromHostedZoneAttributes(
          this.scope,
          'HostedZone',
          {
            zoneName: this.hostedZoneName(),
            hostedZoneId: this.hostedZoneId(),
          },
        );
    }
    return this.hostedZoneCache;
  }

  certificate(): ICertificate {
    if (!this.certificateCache) {
      this.certificateCache =
        cdk.aws_certificatemanager.Certificate.fromCertificateArn(
          this.scope,
          'AcmCertificate',
          this.acmCertArn().stringValue,
        );
    }
    return this.certificateCache;
  }
}
