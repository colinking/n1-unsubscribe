import {ComponentRegistry, PreferencesUIStore} from 'nylas-exports';
import {ThreadUnsubscribeQuickActionButton, ThreadUnsubscribeToolbarButton}
  from './ui/unsubscribe-buttons';

export const config = {
  defaultBrowser: {
    "title": "Default browser",
    "type": "string",
    "default": "popup",
    "enum": ["popup", "native"],
    'enumLabels': ["Popup Window", "Native Browser"],
  },
  handleThreads: {
    "title": "Default unsubscribe behavior",
    "type": "string",
    "default": "archive",
    "enum": ["archive", "trash", "none"],
    'enumLabels': ["Archive", "Trash", "None"],
  },
  confirmForEmail: {
    "title": "Confirm before sending email-based unsubscribe requests",
    "type": "boolean",
    "default": false,
  },
  confirmForBrowser: {
    "title": "Confirm before opening web-based unsubscribe links",
    "type": "boolean",
    "default": false,
  },
}

export function activate() {
  ComponentRegistry.register(ThreadUnsubscribeQuickActionButton,
    { role: 'ThreadListQuickAction' });
  ComponentRegistry.register(ThreadUnsubscribeToolbarButton,
    { role: 'ThreadActionsToolbarButton' });
}

export function deactivate() {
  ComponentRegistry.unregister(ThreadUnsubscribeQuickActionButton);
  ComponentRegistry.unregister(ThreadUnsubscribeToolbarButton);
}
