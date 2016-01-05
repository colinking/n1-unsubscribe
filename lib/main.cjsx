{ComponentRegistry} = require 'nylas-exports'

# MyComposerButton = require './my-composer-button'
# MyMessageSidebar = require './my-message-sidebar'

# This must be consistent with the export (i.e. same '{}' or not)
{KyleButton} = require "./thread-buttons"

ThreadUnsubscribeQuickActions = require './unsubscribe_quick_action'
ThreadUnsubscribeToolbarButton = require './unsubscribe_toolbar_button'


module.exports =
  # Activate is called when the package is loaded. If your package previously
  # saved state using `serialize` it is provided.
  #
  activate: (@state) ->
    # ComponentRegistry.register MyComposerButton,
    #   role: 'Composer:ActionButton'

    # ComponentRegistry.register MyMessageSidebar,
    #   role: 'MessageListSidebar:ContactCard'

    ComponentRegistry.register KyleButton,
      # # On top of bar at thread list, but in unsafe div...
      # role: 'thread:BulkAction'
      # # Not sure what this does?
      # role: 'thread:QuickAction'
      # # In front of message in thread list:
      # role: 'ThreadListIcon'
      # button on individual message page
      role: 'message:Toolbar'

    ComponentRegistry.register ThreadUnsubscribeQuickActions,
      role: 'ThreadListQuickAction'
    ComponentRegistry.register ThreadUnsubscribeToolbarButton,
      role: 'message:Toolbar'

  # Serialize is called when your package is about to be unmounted.
  # You can return a state object that will be passed back to your package
  # when it is re-activated.
  #
  serialize: ->

  # This **optional** method is called when the window is shutting down,
  # or when your package is being updated or disabled. If your package is
  # watching any files, holding external resources, providing commands or
  # subscribing to events, release them here.
  #
  deactivate: ->
    # ComponentRegistry.unregister(MyComposerButton)
    # ComponentRegistry.unregister(MyMessageSidebar)
    ComponentRegistry.unregister(KyleButton)
    ComponentRegistry.unregister(MyComposerButton)
    ComponentRegistry.unregister(MyMessageSidebar)