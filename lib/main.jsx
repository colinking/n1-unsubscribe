const {ComponentRegistry} = require('nylas-exports');
const ThreadUnsubscribeQuickActionButton = require('./ui/quick_action');
const ThreadUnsubscribeToolbarButton = require('./ui/toolbar');

const fs = require('fs');
const stripJsonComments = require('strip-json-comments');
const settingsFile = fs.readFileSync(`${__dirname}/../unsubscribe-settings.json`, 'utf8');
const settingsJSON = stripJsonComments(settingsFile);
const settings = JSON.parse(settingsJSON);
process.env.n1UnsubscribeUseBrowser = settings.use_browser === true ||
  settings.use_browser === 'true';
process.env.n1UnsubscribeHandleThreads = settings.handle_threads;
process.env.n1UnsubscribeConfirmEmail = settings.confirm_for_email === true ||
  settings.confirm_for_email === 'true';
process.env.n1UnsubscribeConfirmBrowser = settings.confirm_for_browser === true ||
  settings.confirm_for_browser === 'true';

// Print settings file
const browserText = (process.env.n1UnsubscribeUseBrowser === 'true' ? 'Native Browser' : 'Popup');
console.log(
  `n1-unsubscribe settings:
  - Browser for unsubscribing: ${process.env.n1UnsubscribeUseBrowser} (${browserText})
  - Archive or trash after unsubscribing: ${process.env.n1UnsubscribeHandleThreads}`
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
