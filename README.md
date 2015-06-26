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

A container name can be specified in your `deploy.js` file by using the `containerName` property. If no container name is specified, it will default to _emberdeploy_. Here's a simple example:

```javascript
staging: {
    buildEnv: 'staging',
    store: {
      type: 'redis',
      host: '192.168.99.100',
      port: 6379
    },
    assets: {
      type: 'azure',
      gzip: false,
      storageAccount: process.env.AZURE_STORAGE_ACCOUNT_NAME,
      storageAccessKey: process.env.AZURE_STORAGE_ACCESS_KEY,
      containerName: 'myapp-staging'
    }
  },

  production: {
    store: {
      type: 'redis',
      host: '192.168.99.100', // ip address of your redis docker container
      port: 6379
    },
    assets: {
      type: 'azure',
      gzip: false,
      storageAccount: process.env.AZURE_STORAGE_ACCOUNT_NAME,
      storageAccessKey: process.env.AZURE_STORAGE_ACCESS_KEY,
      containerName: 'myapp-prod'
    }
  }

```

Files are uploaded to `https://<STORAGE_NAME>.blob.core.windows.net/[CONTAINER_NAME]/<FILENAME>`.
A CDN can be pointed to this blob.

Be sure to use the right fingerprinting to appropriately request the deployed assets: http://www.ember-cli.com/asset-compilation/ - this can either be `https://<STORAGE_NAME>.blob.core.windows.net/[CONTAINER_NAME]/` or `http://<CDN>.vo.msecnd.net/[CONTAINER_NAME]/`
