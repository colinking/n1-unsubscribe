const {ComponentRegistry} = require('nylas-exports');
const {
  ThreadUnsubscribeQuickActionButton,
  ThreadUnsubscribeToolbarButton,
} = require('./ui/unsubscribe-buttons');

const settings = require('./settings');
settings.configure();
const pluginUpdater = require('./ui/plugin-updater');

// const KeymapManager = require('atom-keymap');
// const keymaps = new KeymapManager;
// keymaps.defaultTarget = document.body;

// // Pass all the window's keydown events to the KeymapManager
// document.addEventListener('keydown', function(event) {
//   keymaps.handleKeyboardEvent(event)
// })

// // Add some keymaps
// keymaps.loadKeymap('/path/to/keymap-file.json') // can also be a directory of json / cson files
// // OR
// keymaps.add('/key/for/these/keymaps', {
//   "body": {
//     "up": "core:move-up",
//     "down": "core:move-down"
//   }
// })

// When a keybinding is triggered, it will dispatch it on the node that was focused
window.addEventListener('keymap-2', (event) => console.log('up', event))
// window.addEventListener('core:move-down', (event) => console.log('down', event))

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

  // // TODO FIXME
  // _keymapHandlers: () => {
  //   console.log('Keymap');
  //   return {
  //     'keymap-test': n1pluginupdater.checkForUpdate(pluginUpdater),
  //   };
  // },

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
