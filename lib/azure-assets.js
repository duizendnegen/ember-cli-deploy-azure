var Adapter     = require('ember-deploy/utilities/adapter');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('ember-cli/lib/errors/silent');
var RSVP        = require('rsvp');
var azure       = require('azure-storage');
var walk        = require('walk');
var fs          = require('fs');
var chalk       = require('chalk');
var path        = require('path');

var green = chalk.green;
var white = chalk.white;

var AZURE_SHARE_NAME = 'embertr';
var AZURE_DIRECTORY_NAME = 'deployment';

module.exports = Adapter.extend({
  init: function() {
    if (!this.config) {
      return Promise.reject(new SilentError('You have to pass a config!'));
    }

    var config = this.config.assets;

    // be transparant to either passing a connectionString or the storageAccount + storageAccessKey
    if(config.connectionString) {
      this.client = azure.createFileService(config.connectionString);
    } else if (config.storageAccount && config.storageAccessKey) {
      this.client = azure.createFileService(config.storageAccount, config.storageAccessKey);
    } else {
      console.error("No connection string or storage account plus access key set for this Azure deployment.");
      return Promise.reject(new SilentError('No connection string or storage account plus access key set for this Azure deployment.'));
    }
  },

  upload: function() {
    var _this = this;
    var fileService = this.client;

    if (!this.ui) {
      var message = 'You have to pass a UI to an adapter.';
      return Promise.reject(new SilentError(message));
    }

    this.ui.pleasantProgress.start(green('Uploading assets'), green('.'));

    return new Promise(function(resolve, reject) {
      // create share
      fileService.createShareIfNotExists(AZURE_SHARE_NAME, function(error, result, response){
        if(!error){
          // create directory
          fileService.createDirectoryIfNotExists(AZURE_SHARE_NAME, AZURE_DIRECTORY_NAME, function(error, result, response){
            if(!error){
              // walk the directory to be uploaded
              walker = walk.walk("tmp/assets-sync", { followLinks: false });

              walker.on("file", _this._uploadFile.bind(_this));

              walker.on("errors", function(root, nodeStatsArray, next) {
                nodeStatsArray.forEach(function (n) {
                  console.error("[ERROR] " + n.name)
                  console.error(n.error.message || (n.error.code + ": " + n.error.path));
                });
                reject();
              });

              walker.on("end", function() {
                resolve();
              });
            } else {
              reject(error);
            }
          });
        } else {
          reject(error);
        }
      });
    });
  },

  _uploadFile: function(root, fileStat, next) {
    var _this = this;
    var fileService = this.client;

    var resolvedFile = path.resolve(root, fileStat.name);
    var targetDirectory = root.replace("tmp/assets-sync", "");
    var targetFile = targetDirectory + "\\" + fileStat.name;

    fileService.createFileFromLocalFile(AZURE_SHARE_NAME, AZURE_DIRECTORY_NAME, targetFile, resolvedFile, function(error, result, response){
      if(!error){
        // file uploaded
        console.log("Succesfully uploaded " + targetFile);
      } else {
        console.error("Error uploading " + targetFile);
        console.log(error);
      }

      next();
    });
  }
});
