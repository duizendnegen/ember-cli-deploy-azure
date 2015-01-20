# Ember-deploy-azure

This is the azure-adapter implementation to use both Azure Tables & CDN with
[ember-deploy](https://github.com/levelbossmike/ember-deploy).

## Installation

* `npm install ember-deploy-azure`
* (does not work yet as it isn't registered on npm)

## Accessing the index uploaded by index-adapter

See the following sample code:
https://gist.github.com/duizendnegen/85b5c4a7b7eef28f0756

## Accessing the assets / using a CDN

Files are uploaded to `https://<STORAGE_NAME>.blob.core.windows.net/emberdeploy/<FILENAME>`
A CDN can be pointed to this blob.
(TODO: describe how to link index.html to the right CDN.)
