const {ComponentRegistry} = require('nylas-exports');
const {
  ThreadUnsubscribeQuickActionButton,
  ThreadUnsubscribeToolbarButton,
} = require('./ui/unsubscribe-buttons');

const settings = require('./settings');
settings.configure();
const pluginUpdater = require('./ui/plugin-updater');

module.exports = {
  // Activate is called when the package is loaded. If your package previously
  // saved state using `serialize` it is provided.
  //
  activate: () => {
    settings.checkForUpdate(pluginUpdater);
    // ComponentRegistry.register(ThreadUnsubscribeBulkAction,
    //   { role: 'ThreadListBulkAction' });
    // //   role: 'thread:BulkAction'
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
    pluginUpdater.deactivate();
    // ComponentRegistry.register(ThreadUnsubscribeBulkAction);
    ComponentRegistry.unregister(ThreadUnsubscribeQuickActionButton);
    ComponentRegistry.unregister(ThreadUnsubscribeToolbarButton);
  },
}
