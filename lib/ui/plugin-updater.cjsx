{Actions} = require 'nylas-exports'
{ipcRenderer, remote} = require('electron')

module.exports =

  activate: (@state) ->
    @_unlisten = Actions.notificationActionTaken.listen(@_onNotificationActionTaken, @)
    return @displayNotification(process.env.N1_UNSUBSCRIBE_AVAILABLE_VER)

    # configVersion = NylasEnv.config.get("lastVersion")
    # currentVersion = NylasEnv.getVersion()
    # if configVersion and configVersion isnt currentVersion
    #   NylasEnv.config.set("lastVersion", currentVersion)
    #   @displayThanksNotification()

    # if updater.getState() is 'update-available'
    #   @displayNotification(updater.releaseVersion)

    # NylasEnv.onUpdateAvailable ({releaseVersion, releaseNotes} = {}) =>
    #   @displayNotification(releaseVersion)

  displayThanksNotification: ->
    Actions.postNotification
      type: 'info'
      tag: 'app-update'
      sticky: true
      message: "You're running the latest version of N1-Unsubscribe (Plugin)" +
        " - view the changelog to see what's new.",
      icon: 'fa-magic'
      actions: [{
        dismisses: true
        label: 'Thanks'
        id: 'release-bar:no-op'
      },{
        default: true
        dismisses: true
        label: 'See What\'s New'
        id: 'release-bar:view-plugin-changelog'
      }]

  displayNotification: (version) ->
    version = if version then "(#{version})" else ''
    Actions.postNotification
      type: 'info'
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

  deactivate: ->
    @_unlisten()

  _onNotificationActionTaken: ({notification, action}) ->
    if action.id is 'release-bar:view-plugin-changelog'
      require('electron').shell.openExternal(process.env.N1_UNSUBSCRIBE_AVAILABLE_URL)
      false
    if action.id is 'release-bar:install-plugin-update'
      require('electron').shell.openExternal(process.env.N1_UNSUBSCRIBE_DOWNLOAD_URL)
      true
