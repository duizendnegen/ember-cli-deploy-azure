# Ember-cli-deploy-azure

A pack of [ember-cli-deploy](https://github.com/ember-cli/ember-cli-deploy) plugins for Azure implementing the 'lightning' deploys approach.

+[![](https://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/plugins/ember-cli-deploy-azure.svg)](http://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/)

## Installation & configuration

* `npm install ember-cli-deploy ember-deploy-azure`
* update `config/deploy.js` - a sample has been provided as a blueprint.

## Server-side stack

Server-side multiple strategies are possible to serve the index.html-file.
- C#-based, https://gist.github.com/duizendnegen/85b5c4a7b7eef28f0756
- Node.js-based, [node-ember-cli-deploy-azure-tables](https://github.com/jamesdixon/node-ember-cli-deploy-azure-tables) courtesy of [jamesdixon](https://github.com/jamesdixon/)

## Using a CDN

Files are uploaded to `https://<STORAGE_NAME>.blob.core.windows.net/[CONTAINER_NAME]/<FILENAME>`.
A CDN can be pointed to this blob.

Be sure to use the right fingerprinting to appropriately request the deployed assets: https://ember-cli.com/user-guide/#asset-compilation - this can either be `https://<STORAGE_NAME>.blob.core.windows.net/[CONTAINER_NAME]/` or `http://<CDN>.vo.msecnd.net/[CONTAINER_NAME]/`
