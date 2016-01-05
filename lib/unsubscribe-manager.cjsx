
# On click, open browser and begin unsubscribe process

# Useful Code: https://github.com/colinramsay/nylas-unsubscribe

# What we actually care about:
# TODO Merge with Colin's changes to make buttons look pretty
# TODO Clean up icon
# TODO If needed, copy receipt address to clipboard, but if not clear clipboard back
# XXX Others listed at bottom of this code

# Probably worth doing at some point:
# TODO Error catch if multiple unsubscribe links..
# TODO Support unsubscription by emailing back a message
# TODO support batch unsubscriptions
# ??? UI?

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
		if links.length isnt 1
			console.warn 'Issue with links:'
			console.warn links
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

		# Open links[0].href in browser
		BrowserWindow = require('remote').require('browser-window');
		w = new BrowserWindow({
			'node-integration': false,
			'web-preferences': {'web-security':false},
			'width': 1000,
			'height': 800,
			'allowDisplayingInsecureContent': true
		})
		# w.on 'closed', () ->
		# 	w = null
		w.loadUrl(TheLink)
		w.show()
		# WORKS!
		w.on 'page-title-updated', (event) ->
			webContents = w.webContents
			# Do this once..
			unless webContents.isDevToolsOpened()
				webContents.openDevTools()
			# console.log 'page-title-updated:'
			# Window is only local to Nylas (i.e. the email itself)
			# console.log 'Current URL: '+window.location.href
			# console.log 'Current pathname: '+window.location.pathname
			console.log 'Current title: '+webContents.getTitle()
			console.log 'Current URL: '+webContents.getURL()
			# console.log 'page-title-updated:'
			# console.log event.get sender()

		webContents = w.webContents
		# WORKS!
		webContents.on 'dom-ready', (event) ->
			console.log 'dom-ready!'
			# webContents = w.webContents
			# FIXME
			# webContents.on 'found-in-page', (event, result) ->
			# 	console.log 'result'
			# 	console.log result
			# 	if result.finalUpdate
			# 		webContents.stopFindInPage 'clearSelection'
			# 	return
			# requestId = webContents.findInPage('unsubscribe')
			# console.log 'requestId'
			# console.log requestId

			# FIXME Wrong Scope
			# re = new RegExp /unsubscribe/gi
			# AllInputs = document.querySelectorAll('input')
			# console.log 'AllInputs'
			# console.log AllInputs
			# # AllButtons = document.querySelectorAll('button')
			# Inputs = _.filter AllInputs, (selector) ->
			# 	return re.test(selector.value) or re.test(selector.name) or re.test(selector.text)
			# console.log 'Inputs:'
			# console.log Inputs
			# # console.log 'dom-ready:'
			# # console.log event

		# XXX
		# webContents.on 'found-in-page', (event, result) ->
		# 	console.log 'result'
		# 	console.log result
		# 	if result.finalUpdate
		# 		webContents.stopFindInPage 'clearSelection'
		# 	return
		# requestId = webContents.findInPage('unsubscribe')
		# XXX
		# # Crashes the mini-browser
		# webContents.executeJavaScript(console.log('EXECUTE JS!'))


		# TODO Make unsubscribe run in background when possible (sort of works, but...
				# > TODO Confirm unsubscription
				# > https://github.com/atom/electron/blob/master/docs/api/browser-window.md
		# TODO Otherwise load full window so user can interact
		# TODO Auto archive original email
		# TODO Archive any confirmation emails (You are now unsubscribed)
		# TODO Make automated unsubscribe button clicker: https://github.com/atom/electron/blob/master/docs/api/web-contents.md#webcontentssendinputeventevent

		# Don't do this while testing
		# Trash the element if the unsubscribe was successful
		if false is true
			task = TaskFactory.taskForMovingToTrash
				threads: [props.thread]
				fromView: FocusedMailViewStore.mailView()
			Actions.queueTask(task)

module.exports = {UnsubscribeManager}