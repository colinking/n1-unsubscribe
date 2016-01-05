
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

		TextHTML = MessageStore.items()[0].body
		parser = new DOMParser() # Cool chromium experimental thing
		PseudoDoc = parser.parseFromString(TextHTML, "text/html")
		# console.log 'PseudoDoc'
		# console.log PseudoDoc
		# console.log 'PseudoDoc.querySelectorAll...'
		# console.log PseudoDoc.querySelectorAll('a')

		# Search for unsub link
		re = new RegExp /unsubscribe/gi
		links = _.filter PseudoDoc.querySelectorAll('a'), (selector) ->
		  return re.test(selector.innerText) is true
		# links = _.each PseudoDoc.querySelectorAll('a'), (selector) ->
		#   if re.test(selector.innerText) is true
		#     return selector.href
		if links.length isnt 1
		  console.warn 'Issue with links:'
		  console.warn links
		  return
		console.log 'links[0].href'
		console.log links[0].href

		# Open links[0].href in browser
		# https://github.com/atom/electron/blob/master/docs/api/browser-window.md
		BrowserWindow = require('remote').require('browser-window');
		w = new BrowserWindow({
		  'node-integration': false,
		  'web-preferences': {'web-security':false},
		  'width': 700,
		  'height': 600,
		  'show': false
		  # ^ our contribution to that one repo
		});

		w.loadUrl(links[0].href)

		# Trash the element if the unsubscribe was successful
		if true
		  task = TaskFactory.taskForMovingToTrash
		  	threads: [props.thread]
		  	fromView: FocusedMailViewStore.mailView()
		  Actions.queueTask(task)

module.exports = {UnsubscribeManager}