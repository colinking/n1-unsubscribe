const {ComponentRegistry} = require('nylas-exports');
const {
  ThreadUnsubscribeQuickActionButton,
  ThreadUnsubscribeToolbarButton,
} = require('./ui/unsubscribe-buttons');

const fs = require('fs-extra');
const stripJsonComments = require('strip-json-comments');
let settingsFile;
const defaultSettings = `${__dirname}/../unsubscribe-settings.defaults.json`;
const userSettings = `${__dirname}/../unsubscribe-settings.json`;
try {
  // Use user defined settings file, else the defaults
  settingsFile = fs.readFileSync(userSettings, 'utf8');
} catch (e) {
  console.log(`n1-unsubscribe: Copying default settings to ${userSettings}.`);
  fs.copySync(defaultSettings, userSettings);
  settingsFile = fs.readFileSync(userSettings, 'utf8');
}
const settingsJSON = stripJsonComments(settingsFile);
const settings = JSON.parse(settingsJSON);

process.env.N1_UNSUBSCRIBE_USE_BROWSER = settings.use_browser === true ||
  settings.use_browser === 'true';
process.env.N1_UNSUBSCRIBE_THREAD_HANDLING = settings.handle_threads;
process.env.N1_UNSUBSCRIBE_CONFIRM_EMAIL = settings.confirm_for_email === true ||
  settings.confirm_for_email === 'true';
process.env.N1_UNSUBSCRIBE_CONFIRM_BROWSER = settings.confirm_for_browser === true ||
  settings.confirm_for_browser === 'true';

// Print settings file
const browserText = (process.env.n1UnsubscribeUseBrowser === 'true' ? '' : '(Popup)');
console.log(
  `n1-unsubscribe settings:
  - Use native browser for unsubscribing: ${process.env.N1_UNSUBSCRIBE_USE_BROWSER} ${browserText}
  - Archive or trash after unsubscribing: ${process.env.N1_UNSUBSCRIBE_THREAD_HANDLING}
  - Confirm before email unsubscribing: ${process.env.N1_UNSUBSCRIBE_CONFIRM_EMAIL}
  - Confirm before browser unsubscribing: ${process.env.N1_UNSUBSCRIBE_CONFIRM_BROWSER}`
);

module.exports = {
  // Activate is called when the package is loaded. If your package previously
  // saved state using `serialize` it is provided.
  //
  activate: () => {
    // ComponentRegistry.register ThreadUnsubscribeBulkAction,
    //   role: 'thread:BulkAction'
    ComponentRegistry.register(ThreadUnsubscribeQuickActionButton,
      { role: 'ThreadListQuickAction' });
    ComponentRegistry.register(ThreadUnsubscribeToolbarButton,
      { role: 'ThreadActionsToolbarButton' });
  },

  // This **optional** method is called when the window is shutting down,
  // or when your package is being updated or disabled. If your package is
  // watching any files, holding external resources, providing commands or
  // subscribing to events, release them here.
  //
  deactivate: () => {
    ComponentRegistry.unregister(ThreadUnsubscribeQuickActionButton);
    ComponentRegistry.unregister(ThreadUnsubscribeToolbarButton);
  },
}
