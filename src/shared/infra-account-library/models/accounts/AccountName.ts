export enum AccountName {
  // infra accounts
  govukAppInfraSandbox = 'govuk-app-infra-sandbox',
  govukAppInfraDevelopment = 'govuk-app-infra-development',
  govukAppInfraStaging = 'govuk-app-infra-staging',
  govukAppInfraProduction = 'govuk-app-infra-production',
  govukOnceInfraMgmtProduction = 'govuk-once-infra-mgmt-production',
  govukOnceInfraLibProduction = 'govuk-once-infra-lib-production',
  govukOnceInfraLibDevelopment = 'govuk-once-infra-lib-development',

  // current mobile app (in DI's Org)
  govukAppOneauthBuild = 'govuk-app-oneauth-build',
  govukAppOneauthDevelopment = 'govuk-app-oneauth-development',
  govukAppOneauthIntegration = 'govuk-app-oneauth-integration',
  govukAppOneauthProduction = 'govuk-app-oneauth-production',
  govukAppOneauthStaging = 'govuk-app-oneauth-staging',

  // Shared
  govukOnceSharedDevelopment = 'govuk-once-shared-development',
  govukOnceSharedStaging = 'govuk-once-shared-staging',
  govukOnceSharedProduction = 'govuk-once-shared-production',
  govukOnceTrainingSandbox = 'govuk-once-training-sandbox',
  govukOnceObservabilityDevelopment = 'govuk-once-observability-development',
  govukOnceObservabilityProduction = 'govuk-once-observability-production',

  // UDP
  govukAppUdpDevelopment = 'govuk-app-udp-development',
  govukAppUdpStaging = 'govuk-app-udp-staging',
  govukAppUdpProduction = 'govuk-app-udp-production',

  // BL (Flex)
  govukAppBlDevelopment = 'govuk-app-bl-development',
  govukAppBlStaging = 'govuk-app-bl-staging',
  govukAppBlProduction = 'govuk-app-bl-production',

  // UNS
  govukAppNotificationsDevelopment = 'govuk-app-notifications-development',
  govukAppNotificationsStaging = 'govuk-app-notifications-staging',
  govukAppNotificationsProduction = 'govuk-app-notifications-production',

  // Companion
  govukAppCompanionDevelopment = 'govuk-app-companion-development',
  govukAppCompanionStaging = 'govuk-app-companion-staging',

  // Chat
  gdsChatDevelopment = 'gds-chat-development',
  gdsChatStaging = 'gds-chat-staging',
  govukOnceAichatservicesDevelopment = 'govuk-once-aichatservices-development',
  govukOnceAichatservicesStaging = 'govuk-once-aichatservices-staging',

  // Eligibility
  govukOnceEligibilityDevelopment = 'govuk-once-eligibility-development',
  govukOnceEligibilityStaging = 'govuk-once-eligibility-staging',

  // Onward Journeys
  govukOnceOnwardjourneyDevelopment = 'govuk-once-onwardjourney-development',
  govukOnceOnwardjourneyStaging = 'govuk-once-onwardjourney-staging',

  // Lis
  govukOnceLisDevelopment = 'govuk-once-lis-development',
  govukOnceLisStaging = 'govuk-once-lis-staging',

  // Personalised planning
  govukOncePersonalisedPlanningDevelopment = 'govuk-once-personalised-planning-development',
}

export default AccountName;
