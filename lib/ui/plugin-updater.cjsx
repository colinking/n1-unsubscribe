# Get the latest release to check if an update is needed
GitHubApi = require("github");
config = require('../../package.json');

{Actions} = require 'nylas-exports'
{ipcRenderer, remote} = require('electron')

module.exports =

  # activate: (@state) ->
  activate: (@state, relURL, curVer) ->
    # console.log 'THIS STATE:'
    # console.log @
    # console.log @state
    # console.log @state.state
    @_unlisten = Actions.notificationActionTaken.listen(@_onNotificationActionTaken, @)
    return @displayNotification(curVer)

    # configVersion = NylasEnv.config.get("lastVersion")
    # currentVersion = NylasEnv.getVersion()
    # if configVersion and configVersion isnt currentVersion
    #   NylasEnv.config.set("lastVersion", currentVersion)
    #   @displayThanksNotification()
    # github = new GitHubApi(
    #   version: '3.0.0'
    #   debug: false
    #   protocol: 'https'
    #   host: 'api.github.com'
    #   timeout: 5000
    #   headers: 'user-agent': 'N1-Updater'
    # )
    # github.releases.listReleases {
    #   owner: 'colinking'
    #   repo: 'n1-unsubscribe'
    #   per_page: 1
    # }, (err, res) ->
    #   if err
    #     console.log err
    #   # Get latest release:
    #   console.log res[0]
    #   curVer = config.version
    #   if res[0].tag_name isnt curVer and res[0].draft is false
    #     relURL = res[0].html_url
    #     # console.log(res[0].assets[0].browser_download_url);
    #     console.log "New release available at #{relURL}!"
    #     console.log @
    #     return @displayNotification(curVer)
    #   false

    # if updater.getState() is 'update-available'
    #   @displayNotification(updater.releaseVersion)

    # NylasEnv.onUpdateAvailable ({releaseVersion, releaseNotes} = {}) =>
    #   @displayNotification(releaseVersion)

  displayThanksNotification: ->
    Actions.postNotification
      type: 'info'
      tag: 'app-update'
      sticky: true
      message: "You're running the latest version of N1 - view the changelog to see what's new.",
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
      message: "An update to N1-Unsubscribe is available #{version} - click to update now!",
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
    if action.id is 'release-bar:install-plugin-update'
      require('electron').shell.openExternal('https://github.com/colinking/n1-unsubscribe/releases/latest')
      true
    if action.id is 'release-bar:view-plugin-changelog'
      require('electron').shell.openExternal('https://github.com/colinking/n1-unsubscribe/releases/latest')
      false
