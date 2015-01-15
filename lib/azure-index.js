// var Adapter     = require('../adapter');
var RSVP        = require('rsvp');
var azure       = require('azure-storage');
var chalk       = require('chalk');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('ember-cli/lib/errors/silent');
var Adapter     = require('ember-deploy/utilities/adapter')

var DEFAULT_MANIFEST_SIZE   = 10;
var DEFAULT_TAGGING_ADAPTER = 'sha';

var green = chalk.green;
var white = chalk.white;

var AZURE_TABLE_NAME = 'emberdeploy';
var AZURE_MANIFEST_TAG = 'manifest';

module.exports = Adapter.extend({
  init: function() {
    this.tagging      = this.tagging || DEFAULT_TAGGING_ADAPTER;
    this.manifestSize = this.manifestSize || DEFAULT_MANIFEST_SIZE;

    // be transparant to either passing a connectionString or the storageAccount + storageAccessKey
    if(this.config.connectionString) {
      this.client = azure.createTableService(this.config.connectionString);
    } else if (this.config.storageAccount && this.config.storageAccessKey) {
      this.client = azure.createTableService(this.config.storageAccount, this.config.storageAccessKey);
    } else {
      console.error("No connection string or storage account plus access key set for this Azure deployment.");
      // TODO throw error

      return false;
    }

    /*
      TODO to make feasible for tests;
      In order to run the tests, the following environment variables need to be set up:
      AZURE_STORAGE_CONNECTION_STRING="valid storage connection string"
    */
  },

  upload: function(value) {
    var taggingAdapter = this.taggingAdapter || this._initTaggingAdapter();
    var key            = taggingAdapter.createTag();

    return this._upload(value, key);
  },

  list: function() {
    return RSVP.hash({
      revisions: this._list(),
      current: this._current()
    })
    .then(function(results) {
      var revisions = results.revisions;
      var current   = results.current;
      var message   = this._revisionListMessage(revisions, current);

      this._printSuccessMessage(message);

      return message;
    }.bind(this));
  },

  activate: function(revisionKey) {
    if (!revisionKey) {
      return this._printErrorMessage(this._noRevisionPassedMessage());
    };

    var uploadKey = this._currentKey();
    var that      = this;

    return new RSVP.Promise(function(resolve, reject) {
      that._list()
        .then(function(uploads) {
          return uploads.indexOf(revisionKey) > -1 ? resolve() : reject();
        })
        .then(function() {
          return that.client.set(uploadKey, revisionKey);
        })
        .then(resolve);
    })
    .then(this._activationSuccessfulMessage)
    .then(this._printSuccessMessage.bind(this))
    .catch(function() {
      return this._printErrorMessage(this._revisionNotFoundMessage());
    }.bind(this));
  },

  _list: function() {
    var that = this;

    return new Promise(function(resolve, reject) {
      // create table if not already existent
      that.client.createTableIfNotExists(AZURE_TABLE_NAME, function(error, result, response) {
        if(!error){
          var query = new azure.TableQuery()
                  .where('PartitionKey eq ?', AZURE_MANIFEST_TAG);

          // find the list of uploaded revisions
          that.client.queryEntities(AZURE_TABLE_NAME, query, null, function(error, result, response) {
            if(!error) {
              resolve(result.entries);
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

  _current: function() {
    var that = this;

    return new Promise(function(resolve, reject) {
      // create table if not already existent
      that.client.createTableIfNotExists(AZURE_TABLE_NAME, function(error, result, response) {
        if(!error){
          // find the current tag
          var query = new azure.TableQuery()
                  .where('PartitionKey eq ?', AZURE_MANIFEST_TAG)
                  .and('RowKey eq ?', that._currentKey());

          // find the list of uploaded revisions
          that.client.queryEntities(AZURE_TABLE_NAME, query, null, function(error, result, response) {
            if(!error){
              resolve(result.entries);
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

  _initTaggingAdapter: function() {
    var TaggingAdapter = require('ember-deploy/utilities/tagging/'+this.tagging);

    return new TaggingAdapter({
      manifest: this.manifest
    });
  },

  _upload: function(value, key) {
    return this._uploadIfNotAlreadyInManifest(value, key)
      .then(this._deploySuccessMessage.bind(this, key))
      .then(this._printSuccessMessage.bind(this))
      .then(function() { return key; })
      .catch(function() {
        var message = this._deployErrorMessage();
        return this._printErrorMessage(message);
      }.bind(this));
  },

  _uploadIfNotAlreadyInManifest: function(value, key) {
    // read the buffer
    value = value.toString();
    var that = this;

    return new RSVP.Promise(function(resolve, reject) {
      // create table if not already existent
      that.client.createTableIfNotExists(AZURE_TABLE_NAME, function(error, result, response) {
        if(!error){
          var query = new azure.TableQuery()
                  .where('PartitionKey eq ?', AZURE_MANIFEST_TAG)
                  .and('RowKey eq ?', key);

          // find the list of uploaded revisions
          that.client.queryEntities(AZURE_TABLE_NAME, query, null, function(error, result, response) {
            if(!error){
              // has this key already been uploaded once?
              if(result.entries.length > 0) {
                reject("Key already in manifest - revision already uploaded or collided.");
              } else {
                var entGen = azure.TableUtilities.entityGenerator;
                var entity = {};
                entity["PartitionKey"] = entGen.String(AZURE_MANIFEST_TAG);
                entity["RowKey"] = entGen.String(key);
                entity["content"] = entGen.String(value);

                that.client.insertEntity(AZURE_TABLE_NAME, entity,  function (error, result, response) {
                  if(!error){
                    resolve(result);
                  } else {
                    reject(error);
                  }
                });
              }
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

  _currentKey: function() {
    return this.manifest+':current';
  },

  _printSuccessMessage: function(message) {
    return this.ui.writeLine(message);
  },

  _printErrorMessage: function(message) {
    return Promise.reject(new SilentError(message));
  },

  _deploySuccessMessage: function(revisionKey) {
    var success       = green('\nUpload successful!\n\n');
    var uploadMessage = white('Uploaded revision: ')+green(revisionKey);

    return success + uploadMessage;
  },

  _deployErrorMessage: function() {
    var failure    = '\nUpload failed!\n';
    var suggestion = 'Did you try to upload an already uploaded revision?\n\n';
    var solution   = 'Please run `'+green('ember deploy:list')+'` to ' +
                     'investigate.';

    return failure + '\n' + white(suggestion) + white(solution);
  },

  _noRevisionPassedMessage: function() {
    var err = '\nError! Please pass a revision to `deploy:activate`.\n\n';

    return err + white(this._revisionSuggestion());
  },

  _activationSuccessfulMessage: function() {
    var success = green('\nActivation successful!\n\n');
    var message = white('Please run `'+green('ember deploy:list')+'` to see '+
                        'what revision is current.');

    return success + message;
  },

  _revisionNotFoundMessage: function() {
    var err = '\nError! Passed revision could not be found in manifest!\n\n';

    return err + white(this._revisionSuggestion());
  },

  _revisionSuggestion: function() {
    var suggestion = 'Try to run `'+green('ember deploy:list')+'` '+
                     'and pass a revision listed there to `' +
                     green('ember deploy:activate')+'`.\n\nExample: \n\n'+
                     'ember deploy:activate --revision <manifest>:<sha>';

    return suggestion;
  },

  _revisionListMessage: function(revisions, currentRevision) {
    var manifestSize  = this.manifestSize;
    var headline      = '\nLast '+ manifestSize + ' uploaded revisions:\n\n';
    var footer        = '\n\n# => - current revision';
    var revisionsList = revisions.reduce(function(prev, curr) {
      var prefix = (curr === currentRevision) ? '| => ' : '|    ';
      return prev + prefix + chalk.green(curr) + '\n';
    }, '');

    return headline + revisionsList + footer;
  }
});
