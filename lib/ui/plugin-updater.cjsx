{Actions} = require 'nylas-exports'
{ipcRenderer, remote} = require('electron')

module.exports =

  activate: (@state) ->
    @_unlisten = Actions.notificationActionTaken.listen(@_onNotificationActionTaken, @)
    if (@state is 'NEW_RELEASE')
      return @displayNotification(process.env.N1_UNSUBSCRIBE_AVAILABLE_VER)
    else if (@state is 'THANKS')
      return @displayThanksNotification()

  displayNotification: (version) ->
    # Types: `info`, `developer`, `error`, or `success`
    version = if version then "(#{version})" else ''
    Actions.postNotification
      type: 'developer'
      tag: 'app-update'
      sticky: true
      message: "An update to N1-Unsubscribe (Plugin) is available" +
        " #{process.env.N1_UNSUBSCRIBE_AVAILABLE_VER} - click to update now!",
      icon: 'fa-flag'
      actions: [{
        label: 'See What\'s New'
        id: 'release-bar:view-plugin-changelog'
      },{
        label: 'Install Now'
        dismisses: true
        default: true
        id: 'release-bar:install-plugin-update'
      }]

  displayThanksNotification: ->
    Actions.postNotification
      type: 'developer'
      tag: 'app-update'
      sticky: true
      message: "You're running the latest version of N1-Unsubscribe (Plugin)" +
        " - view the changelog to see what's new.",
      icon: 'fa-magic'
      actions: [{
        label: 'Thanks'
        dismisses: true
        id: 'release-bar:no-op'
      },{
        label: 'See What\'s New'
        # dismisses: true
        default: true
        id: 'release-bar:view-plugin-changelog'
      }]

  deactivate: ->
    @_unlisten()

  _onNotificationActionTaken: ({notification, action}) ->
    if action.id is 'release-bar:view-plugin-changelog'
      require('electron').shell.openExternal(process.env.N1_UNSUBSCRIBE_AVAILABLE_URL)
      false
    if action.id is 'release-bar:install-plugin-update'
      require('electron').shell.openExternal(process.env.N1_UNSUBSCRIBE_DOWNLOAD_URL)
      true
