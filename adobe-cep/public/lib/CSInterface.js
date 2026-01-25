/**
 * CSInterface.js - Adobe CEP Communication Library
 * Simplified version for panel communication
 */

function CSInterface() {}

CSInterface.prototype.getHostEnvironment = function() {
  var env;
  try {
    env = JSON.parse(window.__adobe_cep__.getHostEnvironment());
  } catch (e) {
    env = null;
  }
  return env;
};

CSInterface.prototype.evalScript = function(script, callback) {
  if (callback === null || callback === undefined) {
    callback = function() {};
  }
  window.__adobe_cep__.evalScript(script, callback);
};

CSInterface.prototype.getSystemPath = function(pathType) {
  var path = decodeURI(window.__adobe_cep__.getSystemPath(pathType));
  return path;
};

CSInterface.prototype.openURLInDefaultBrowser = function(url) {
  window.cep.util.openURLInDefaultBrowser(url);
};

CSInterface.prototype.requestOpenExtension = function(extensionId, params) {
  window.__adobe_cep__.requestOpenExtension(extensionId, params);
};

CSInterface.prototype.closeExtension = function() {
  window.__adobe_cep__.closeExtension();
};

CSInterface.prototype.getExtensionID = function() {
  return window.__adobe_cep__.getExtensionId();
};

CSInterface.prototype.addEventListener = function(type, listener, obj) {
  window.__adobe_cep__.addEventListener(type, listener, obj);
};

CSInterface.prototype.removeEventListener = function(type, listener, obj) {
  window.__adobe_cep__.removeEventListener(type, listener, obj);
};

CSInterface.prototype.dispatchEvent = function(event) {
  if (typeof event.data === 'object') {
    event.data = JSON.stringify(event.data);
  }
  window.__adobe_cep__.dispatchEvent(event);
};

// System path constants
CSInterface.prototype.EXTENSION_ROOT = 'extension';
CSInterface.prototype.USER_DATA = 'userData';
CSInterface.prototype.COMMON_FILES = 'commonFiles';
CSInterface.prototype.HOST_APPLICATION = 'hostApplication';

// Event type for communication
function CSEvent(type, scope, appId, extensionId) {
  this.type = type;
  this.scope = scope;
  this.appId = appId;
  this.extensionId = extensionId;
  this.data = '';
}

// Export for use
if (typeof module !== 'undefined') {
  module.exports = { CSInterface: CSInterface, CSEvent: CSEvent };
}
