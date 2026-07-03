import Account from '../models/accounts/Account';
import AccountName from '../models/accounts/AccountName';
import { EnvLabel } from '../models/EnvLabel';

export const allAccounts: Account[] = [
  // infra accounts
  {
    name: AccountName.govukAppInfraSandbox,
    displayName: 'govuk-app-infra-sandbox',
    id: '',
    envLabel: EnvLabel.sandbox,
  },
  {
    name: AccountName.govukAppInfraDevelopment,
    displayName: 'govuk-app-infra-development',
    id: '127996280145',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.govukAppInfraStaging,
    displayName: 'govuk-app-infra-staging',
    id: '838693050821',
    envLabel: EnvLabel.stage,
  },
  {
    name: AccountName.govukAppInfraProduction,
    displayName: 'govuk-app-infra-production',
    id: '008341391450',
    envLabel: EnvLabel.prod,
  },

  {
    name: AccountName.govukOnceInfraMgmtProduction,
    displayName: 'govuk-once-infra-mgmt-production',
    id: '973629899903',
    envLabel: EnvLabel.prod,
  },
  {
    name: AccountName.govukOnceInfraLibDevelopment,
    displayName: 'govuk-once-infra-lib-development',
    id: '903936256209',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.govukOnceInfraLibProduction,
    displayName: 'govuk-once-infra-lib-production',
    id: '904690835784',
    envLabel: EnvLabel.prod,
  },
  // sandbox accounts
  {
    name: AccountName.govukOnceTrainingSandbox,
    displayName: 'govuk-once-training-sandbox',
    id: '046867677977',
    envLabel: EnvLabel.sandbox,
  },
  // shared accounts
  {
    name: AccountName.govukOnceSharedDevelopment,
    displayName: 'govuk-once-shared-development',
    id: '896094201155',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.govukOnceSharedStaging,
    displayName: 'govuk-once-shared-staging',
    id: '353661393280',
    envLabel: EnvLabel.stage,
  },
  {
    name: AccountName.govukOnceSharedProduction,
    displayName: 'govuk-once-shared-production',
    id: '716174522992',
    envLabel: EnvLabel.prod,
  },
  {
    name: AccountName.govukOnceObservabilityDevelopment,
    displayName: 'govuk-once-observability-development',
    id: '540662471709',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.govukOnceObservabilityProduction,
    displayName: 'govuk-once-observability-production',
    id: '764488968960',
    envLabel: EnvLabel.prod,
  },
  //AI chat services accounts
  {
    name: AccountName.govukOnceAichatservicesDevelopment,
    displayName: 'govuk-once-aichatservices-development',
    id: '715195480427',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.govukOnceAichatservicesStaging,
    displayName: 'govuk-once-aichatservices-staging',
    id: '281868401169',
    envLabel: EnvLabel.stage,
  },
  // Flex Accounts
  {
    name: AccountName.govukAppBlDevelopment,
    displayName: 'govuk-app-bl-development',
    id: '308036881389',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.govukAppBlStaging,
    displayName: 'govuk-app-bl-staging',
    id: '831869585824',
    envLabel: EnvLabel.stage,
  },
  {
    name: AccountName.govukAppBlProduction,
    displayName: 'govuk-app-bl-production',
    id: '755352604849',
    envLabel: EnvLabel.prod,
  },
  // companion accounts
  {
    name: AccountName.govukAppCompanionDevelopment,
    displayName: 'govuk-app-companion-development',
    id: '913024026659',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.govukAppCompanionStaging,
    displayName: 'govuk-app-companion-staging',
    id: '081047269052',
    envLabel: EnvLabel.stage,
  },
  // gds Chat accounts
  {
    name: AccountName.gdsChatDevelopment,
    displayName: 'gds-chat-development',
    id: '207513914339',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.gdsChatStaging,
    displayName: 'gds-chat-staging',
    id: '851334204204',
    envLabel: EnvLabel.stage,
  },
  // Eligibility accounts
  {
    name: AccountName.govukOnceEligibilityDevelopment,
    displayName: 'govuk-once-eligibility-development',
    id: '453624448465',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.govukOnceEligibilityStaging,
    displayName: 'govuk-once-eligibility-staging',
    id: '173331852279',
    envLabel: EnvLabel.stage,
  },
  // UDP accounts
  {
    name: AccountName.govukAppUdpDevelopment,
    displayName: 'govuk-app-udp-development',
    id: '542403648748',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.govukAppUdpStaging,
    displayName: 'govuk-app-udp-staging',
    id: '646082656986',
    envLabel: EnvLabel.stage,
  },
  {
    name: AccountName.govukAppUdpProduction,
    displayName: 'govuk-app-udp-production',
    id: '917028072953',
    envLabel: EnvLabel.prod,
  },
  // Notifications accounts
  {
    name: AccountName.govukAppNotificationsDevelopment,
    displayName: 'govuk-app-notifications-development',
    id: '674663567518',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.govukAppNotificationsStaging,
    displayName: 'govuk-app-notifications-staging',
    id: '228546881614',
    envLabel: EnvLabel.stage,
  },
  {
    name: AccountName.govukAppNotificationsProduction,
    displayName: 'govuk-app-notifications-production',
    id: '244826541561',
    envLabel: EnvLabel.prod,
  },
  // Onward Journey accounts
  {
    name: AccountName.govukOnceOnwardjourneyDevelopment,
    displayName: 'govuk-once-onwardjourney-development',
    id: '863183417936',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.govukOnceOnwardjourneyStaging,
    displayName: 'govuk-once-onwardjourney-staging',
    id: '246624128430',
    envLabel: EnvLabel.stage,
  },
  // LIS accounts
  {
    name: AccountName.govukOnceLisDevelopment,
    displayName: 'govuk-once-lis-development',
    id: '830482599484',
    envLabel: EnvLabel.dev,
  },
  {
    name: AccountName.govukOnceLisStaging,
    displayName: 'govuk-once-lis-staging',
    id: '682718097401',
    envLabel: EnvLabel.stage,
  },
  // Personalised planning accounts
  {
    name: AccountName.govukOncePersonalisedPlanningDevelopment,
    displayName: 'govuk-once-personalised-planning-development',
    id: '097853039017',
    envLabel: EnvLabel.dev,
  },
];
