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

# ipcMain = require('ipc')
ipcMain = require("electron").ipcRenderer

class UnsubscribeManager

	constructor: (props) ->
		@props = props

  canUnsubscribe: () ->
  	return parseEmailBody().length isnt 0 or parseHeaders().length isnt 0

  getHTMLEmailBody: () ->
  	html_string = MessageStore.items()[0].body
    parser = new DOMParser()
    html = parser.parseFromString(html_string, "text/html")
    return html

  parseHeaders: () ->
  	console.log("parsing headers")
  	return []

  parseEmailBody: () ->
  	console.log("parsing email body")
  	# Get a list of all links in the email body
  	email_body = getHTMLEmailBody()
  	email_links = _.filter email_body.querySelectorAll('a'), (email_link) ->
  		return email_link.href isnt 'blank'

  	# TODO: Attempt to get for user email and add regexp for user email
  	regexps = [/unsubscribe/gi, /opt.?out/gi, /click.?here/gi, /stop.?receiving/gi, /do.?not.?send/gi, /reject/gi]
  	unsubscribe_links = []
  	i = 0
  	while unsubscribe_links.length is 0 and i < regexps.length
  		unsubscribe_links = _.filter email_links, (email_link) ->
  			return regexps[i].text(email_link.innerText) || re.test(email_link.href)
  		i++

  	return unsubscribe_links

  unsubscribe: (props) ->
    console.log("Unsubscribing...")

    re = new RegExp /unsubscribe/gi
    links = _.filter AllLinks, (selector) ->
      return re.test(selector.innerText) || re.test(selector.href)
    # Handle Error Cases
    if links.length is 0
      # Check for opt out instead of unsubscribe
      re = new RegExp /opt.?out/gi
      links = _.filter AllLinks, (selector) ->
        return re.test(selector.href) || re.test(selector.innerText)
      if links.length is 0
        # Check for opt out instead of unsubscribe
        re = new RegExp /click.?here/gi
        links = _.filter AllLinks, (selector) ->
          return re.test(selector.href) || re.test(selector.innerText)
        if links.length is 0
          re = new RegExp /stop.?receiving/gi
          links = _.filter AllLinks, (selector) ->
            return re.test(selector.href) || re.test(selector.innerText)
          if links.length is 0
            re = new RegExp /do.?not.?send/gi
            links = _.filter AllLinks, (selector) ->
              return re.test(selector.href) || re.test(selector.innerText)
            if links.length is 0
              # rejectInvitationMail
              re = new RegExp /reject/gi
              links = _.filter AllLinks, (selector) ->
                return re.test(selector.href) || re.test(selector.innerText)
            if links.length is 0
              # TODO FIXME rejectInvitationMail
              console.warn "You haven't finished the check for a user email address in unsub link. K bye."
              userEmail = 'find some way to get user email'
              links = _.filter AllLinks, (selector) ->
                return selector.href.indexOf(userEmail) > -1
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
      'web-preferences': {'web-security':false},
      'width': 1000,
      'height': 800,
      # 'allowDisplayingInsecureContent': true,
      'preload': 'inject.js'
    })
    w.on 'closed', () ->
      # Archive/Trash Email:
      # # Need to get right props
      UnsubscribeManager._TrashEmail(@props)
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
      # One way of trying to get feedback:
      # console.log webContents.getURL().indexOf('success')
      # # if unsubscribed...
      # w.destroy()

    #   # ipc = require('ipc')
    # ipc.on 'invokeAction', (event, data) ->
    #   result = processData(data)
    #   event.sender.send 'actionReply', result
    #   return

    webContents.on 'did-get-redirect-request', (event) ->
      console.log 'Current URL on Redirect: '+webContents.getURL()

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
    webContents.on "dom-ready", () ->
      # In main process.
      # ipcMain = require('electron').ipcMain
      ipcMain.on 'asynchronous-message', (event, arg) ->
        console.log arg
        # prints "ping"
        event.sender.send 'asynchronous-reply', 'pong'
        return
      ipcMain.on 'synchronous-message', (event, arg) ->
        console.log arg
        # prints "ping"
        event.returnValue = 'pong'
        return


  @_TrashEmail: (props) ->
    if props is undefined
      console.warn "This is where the message would be archived, but you didn't send any properties."
      return
    # Don't do this while testing
    # if false is true
    # Trash the element if the unsubscribe was successful
    if true
      task = TaskFactory.taskForMovingToTrash
        threads: [props.thread]
        fromView: FocusedMailViewStore.mailView()
      Actions.queueTask(task)
    return

module.exports = {UnsubscribeManager}


# TODO Make unsubscribe run in background when possible (sort of works, but...
  # > TODO Confirm unsubscription - look for title change
  # > https://github.com/atom/electron/blob/master/docs/api/browser-window.md
# TODO Otherwise load full window so user can interact
# TODO Auto archive original email
# TODO Archive any confirmation emails (You are now unsubscribed)
# TODO Make automated unsubscribe button clicker: https://github.com/atom/electron/blob/master/docs/api/web-contents.md#webcontentssendinputeventevent
