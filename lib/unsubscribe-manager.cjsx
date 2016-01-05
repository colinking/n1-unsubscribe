# On click, open browser and begin unsubscribe process

{Actions,
 CategoryStore,
 TaskFactory,
 FocusedMailViewStore,
 Utils,
 React,
 FocusedContactsStore,
 MessageStore,
 NylasAPI,
 AccountStore} = require 'nylas-exports'
NylasStore = require 'nylas-store'
_ = require('underscore')

class UnsubscribeManager
  @unsubscribe: (props) ->
    console.log("Unsubscribing...")

    # Also checked for header items (list-unsubscribe). but was unsuccessful
    console.log MessageStore.items()[0]

    TextHTML = MessageStore.items()[0].body
    parser = new DOMParser() # Cool chromium experimental thing
    PseudoDoc = parser.parseFromString(TextHTML, "text/html")
    # console.log 'PseudoDoc.querySelectorAll...'
    # console.log PseudoDoc.querySelectorAll('a')

    # Search for unsub link
    re = new RegExp /unsubscribe/gi
    AllLinks = PseudoDoc.querySelectorAll('a')
    links = _.filter AllLinks, (selector) ->
      return re.test(selector.innerText)
    # Handle Error Cases
    if links.length is 0
      links = _.filter AllLinks, (selector) ->
        return re.test(selector.href)
      if links.length is 0
        # Check for opt out instead of unsubscribe
        re = new RegExp /opt.?out/gi
        links = _.filter AllLinks, (selector) ->
          return re.test(selector.href)
        if links.length is 0
          console.error 'Failed to find unsubscribe link. Are you sure this is a marketing email?'
          return
    if links.length > 1
      console.error 'Too many links, only accepting first link'
    TheLink = links[0].href
    # Excitedly report ones findings
    # WORKS!
    # console.log 'links[0].href'
    # console.log TheLink
    @_BrowserWindow(TheLink)

  @_BrowserWindow: (TheLink) ->
    # Open links[0].href in browser
    # https://github.com/atom/electron/blob/master/docs/api/browser-window.md
    BrowserWindow = require('remote').require('browser-window');
    w = new BrowserWindow({
      # 'node-integration': false,
      # 'web-preferences': {'web-security':false},
      'width': 1000,
      'height': 800,
      'allowDisplayingInsecureContent': true,
      'preload': 'inject.js'
    })
    w.on 'closed', () ->
      w = null
    w.loadUrl(TheLink)
    w.show()

    w.on 'page-title-updated', (event) ->
      webContents = w.webContents
      # Do this once..
      unless webContents.isDevToolsOpened()
        webContents.openDevTools()
      # Title doesn't help much
      console.log 'Current title: '+webContents.getTitle()

      # XXX - Window is only local to Nylas (i.e. the email itself)
      # console.log 'Current URL: '+window.location.href
      # console.log 'Current pathname: '+window.location.pathname

    webContents = w.webContents
    webContents.on 'dom-ready', (event) ->
      console.log 'Current URL: '+webContents.getURL()
      console.log webContents.getURL().indexOf('success')
      # # if second occurrence...
      # w.destroy()

    webContents.on 'did-get-redirect-request', (event) ->
      console.log 'Current URL: '+webContents.getURL()

    # Basically this can't be automated:

      # webContents = w.webContents
      # # FIXME -> findInPage isn't a function for remote
      # webContents.on 'found-in-page', (event, result) ->
      #   console.log 'result'
      #   console.log result
      #   if result.finalUpdate
      #     webContents.stopFindInPage 'clearSelection'
      #   return
      # requestId = webContents.findInPage('unsubscribe')
      # console.log 'requestId'
      # console.log requestId

      # # FIXME Wrong Scope -> needs to be run in remote
      # re = new RegExp /unsubscribe/gi
      # AllInputs = document.querySelectorAll('input')
      # console.log 'AllInputs'
      # console.log AllInputs
      # # AllButtons = document.querySelectorAll('button')
      # Inputs = _.filter AllInputs, (selector) ->
      #   return re.test(selector.value) or re.test(selector.name) or re.test(selector.text)
      # console.log 'Inputs:'
      # console.log Inputs
      # # console.log 'dom-ready:'
      # # console.log event

    # XXX - doesn't work at all?
    # webContents.on 'found-in-page', (event, result) ->
    #   console.log 'result'
    #   console.log result
    #   if result.finalUpdate
    #     webContents.stopFindInPage 'clearSelection'
    #   return
    # requestId = webContents.findInPage('unsubscribe')

    #  XXX - Works, but can't return anything
    #  and can't use underscore, etc.
    # webContents.executeJavaScript("console.log('EXECUTE JS!')")
    # webContents.executeJavaScript("
    #         // var _ = require('underscore');
    #         var AllInputs, Inputs, re;
    #         re = new RegExp(/unsubscribe/gi);
    #         AllInputs = document.querySelectorAll('input');
    #         console.log('AllInputs');
    #         console.log(AllInputs);")

    # XXX - Doesn't run script and can't access function?
    # webContents.on "dom-ready", () ->
    #     webContents.executeJavaScript('__InjectJS.HelloWorld()')

    # XXX - doesn't work: can't access ipcMain? undefined
    # webContents.on "dom-ready", () ->
    # In main process.
    # ipcMain = require('electron').ipcMain
    # ipcMain.on 'asynchronous-message', (event, arg) ->
    #   console.log arg
    #   # prints "ping"
    #   event.sender.send 'asynchronous-reply', 'pong'
    #   return
    # ipcMain.on 'synchronous-message', (event, arg) ->
    #   console.log arg
    #   # prints "ping"
    #   event.returnValue = 'pong'
    #   return



    # @_TrashEmail(@props)

  @_TrashEmail: (@props) ->
    # Don't do this while testing
    # Trash the element if the unsubscribe was successful
    if false is true
      task = TaskFactory.taskForMovingToTrash
        threads: [props.thread]
        fromView: FocusedMailViewStore.mailView()
      Actions.queueTask(task)

module.exports = {UnsubscribeManager}


# TODO Make unsubscribe run in background when possible (sort of works, but...
  # > TODO Confirm unsubscription - look for title change
  # > https://github.com/atom/electron/blob/master/docs/api/browser-window.md
# TODO Otherwise load full window so user can interact
# TODO Auto archive original email
# TODO Archive any confirmation emails (You are now unsubscribed)
# TODO Make automated unsubscribe button clicker: https://github.com/atom/electron/blob/master/docs/api/web-contents.md#webcontentssendinputeventevent
