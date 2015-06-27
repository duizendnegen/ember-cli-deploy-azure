# Ember-deploy-azure

This is the azure-adapter implementation to use both Azure Tables & CDN with
[ember-cli-deploy](https://github.com/ember-cli/ember-cli-deploy).

## Installation & usage

* `npm install ember-cli-deploy ember-deploy-azure --save-dev`
* update deploy.json to feature azure-adapters (see below)

## Accessing the index uploaded by index-adapter

Server-side multiple strategies are possible to serve the index.html-file.
- C#-based, https://gist.github.com/duizendnegen/85b5c4a7b7eef28f0756
- Node.js-based, [node-ember-cli-deploy-azure-tables](https://github.com/jamesdixon/node-ember-cli-deploy-azure-tables) courtesy of [jamesdixon](https://github.com/jamesdixon/)

## Configuring deployment

Both the index-adapter and the asset-adapter are specified by using a `type: 'azure'` configuration.

A container name can be specified in your `deploy.js` file by using the `containerName` property. If no container name is specified, it will default to _emberdeploy_.

See below an example script featuring staging & production.

```javascript
staging: {
    buildEnv: 'staging',
    store: {
      type: 'azure',
      storageAccount: "my-storage-account",
      storageAccessKey: "my-access-key"
    },
    assets: {
      type: 'azure',
      gzip: false,
      storageAccount: "my-storage-account",
      storageAccessKey: "my-access-key"
      containerName: 'myapp-staging'
    }
  },

  production: {
    store: {
      type: 'azure',
      storageAccount: "my-storage-account",
      storageAccessKey: "my-access-key"
    },
    assets: {
      type: 'azure',
      gzip: false,
      storageAccount: "my-storage-account",
      storageAccessKey: "my-access-key"
      containerName: 'myapp-prod'
    }
  }

```

## Accessing the assets, using a CDN

Files are uploaded to `https://<STORAGE_NAME>.blob.core.windows.net/[CONTAINER_NAME]/<FILENAME>`.
A CDN can be pointed to this blob.

Be sure to use the right fingerprinting to appropriately request the deployed assets: http://www.ember-cli.com/asset-compilation/ - this can either be `https://<STORAGE_NAME>.blob.core.windows.net/[CONTAINER_NAME]/` or `http://<CDN>.vo.msecnd.net/[CONTAINER_NAME]/`
