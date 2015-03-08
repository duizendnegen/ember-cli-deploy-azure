# Ember-deploy-azure

This is the azure-adapter implementation to use both Azure Tables & CDN with
[ember-cli-deploy](https://github.com/ember-cli/ember-cli-deploy).

## Installation & usage

* `npm install ember-cli-deploy ember-deploy-azure --save-dev`
* update deploy.json to feature azure-adapters

## Accessing the index uploaded by index-adapter

See the following sample code:
https://gist.github.com/duizendnegen/85b5c4a7b7eef28f0756

## Accessing the assets / using a CDN

Files are uploaded to `https://<STORAGE_NAME>.blob.core.windows.net/emberdeploy/<FILENAME>`.
A CDN can be pointed to this blob.

Be sure to use the right fingerprinting to appropriately request the deployed assets: http://www.ember-cli.com/asset-compilation/ - this can either be `https://<STORAGE_NAME>.blob.core.windows.net/emberdeploy/` or `http://<CDN>.vo.msecnd.net/emberdeploy/`
