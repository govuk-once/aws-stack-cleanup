# Service Template Repo

## Purpose
This is tempate repo that can be used to setup any new typescript project for Gov.UK App projects.
It also acts as a definition of the standard tooling we will use in repos.
It is recommened to move any existing repos to a new one created from this template, that way as this is developed it should be easy to rebase in order to add any new standard tooling to your repos

## Status: `Ready for use, although still being actively developed`
# coming soon:
- more CDK example code
- provide instructions/script/workflow to upgrade node, pnpm & dependencies safely


## Brief description of contents:
- Example CDK code
- GitHub actions pipeine that will deploy a cdk app
- pnpm and node version management
- unit testing tools
- linting & formating tools
- a temporary OIDC Stack that creates components to enable deployments from GitHub Actions

## Local Development Setup:

### install/setup locally: (to be done once)
- install nvm (https://github.com/nvm-sh/nvm or brew)
- install pnpm (https://pnpm.io or brew)
- install aws-cdk (https://docs.aws.amazon.com/cdk/v2/guide/getting-started.html or brew)
- install pre-commit (https://pre-commit.com/ or pip or brew)
- install detects-secrets (https://github.com/Yelp/detect-secrets or pip or brew)
- install checkov (https://www.checkov.io/ or pip or brew)
- run `corepack enable` # to enable corepack locally


### set versions: (for each project)
- `nvm install` # Reads the .nvmrc file
- `nvm use`     # Switches to the required version
- `pnpm install` # install dependencies


## Developer Tooling

This repository uses a standard set of developer tooling to ensure consistency, security, and a good developer experience across all services.

The tools cover:

- Infrastructure as Code
- Dependency management
- Linting and formatting
- Testing (unit and BDD)
- Build tooling
- Security and secret scanning

[Read the full Developer Tooling overview](/docs/developer_tooling_overview.md)
(This document explains what each tool is and why we’ve chosen it.)

## Local Deployments
Instructions to deploy a stack from laptop:
- Authenticate to an AWS Account on your CLI (should really be just a develoment account)
- at root of repo in CLI run:
    - `pnpm cdk ls` to list stacks
    - `pnpm cdk diff XXX` to see what will be deployed, where XXX is stackname
    - `pnpm cdk deploy XXX` to deploy stack XXX
- This will use you local laptop username as the environment name and create a stack unique to you
- while developing you can rapidly push changes by running `pnpm dev`.
  This kicks-off a continually running programme that monitors your code and instantly deploys any changes.
  It will perform a 'hot swap' deployment of lambda code within about 10 seconds.
  It will also display lambda logs in your CLI.
  Use `Ctrl + Q` to exit the programme.
  **Warning**: Disable auto-save when using feature this as it will cause problems.

## Checkov tests
These test will check the cloudformation outputted against known bad configuration, it can pick up lots of issues that you consider to be acceptable.  To accept the findings and prevent them re-occurring requires you to "re-baseline" which is done as follows (although you must check all findings when doing this):
- delete the `cdk.out` dir (to remove any old files)
- run `cdk synth` (to create new CFN files for checkov to scan)
- run `checkov --config-file .checkov.yaml` to get new findings
  - if this results in zero findings then skip remaining steps
- run `cp .checkov.baseline .checkov.baseline.bak` to backup old baseline
- run `echo '{}' > .checkov.baseline` (we need an empty baseline)
- run `checkov --config-file .checkov.yaml --create-baseline` to create new baseline
- run `mv cdk.out/.checkov.baseline .checkov.baseline` to move it to correct location
- run `checkov --config-file .checkov.yaml` (this should report zero findings)
- assess the `checkov.baseline` so see all findings, you can also view `.checkov.baseline.bak` to see the previously accepted ones.
- delete `.checkov.baseline.bak` and commit

## Instruction to customise this template
- rename cdk/service-template.ts to suit the new service
- rename cdk/stacks/service-template-stack.ts and test file to suit a new stack
- delete cdk/stacks/temp-oidc-stack.ts
- delete docs/developer_tooling_overview.md
- change `name` and `description` in package.json
- change bin file to correspond with new cdk/service-template.ts in package.json
- change `app` to reflect new cdk/service-template.ts in cdk.json
- rename the class in stack definition (previously cdk/stacks/service-template-stack.)
- edit existing code in stack definition
- run `pre-commit install` to setup the pre-commit hooks
- remove all content from Readme.md and start fresh

---
## template development notes

### Decisions taken:
- use AWS-CDK to define some test infra
- use nvm to manage node versions
- use pnpm as package manager with corepack
- use eslint and prettier for formatting and linting
- use precommit for Pre-commit hooks
- use Vitest for unit test framework
- use cucumber for BDD testing
- use Esbuild as a build tool
- use precommit for pre-commit hooks
- use checkov for scanning iac
- use Yelp/detect-secrets for secret scanning on commit


### Decisions needed:
- should dist dir contain _.d.ts file or just _.js files?
- Additional Code Analysis tools
    - Co-pilot in PRs
    - SonarCloud
    - GitHub Advanced Security
    - others?
