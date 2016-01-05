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
 TaskFactory,
 CategoryStore,
 # FocusedContentStore,
 FocusedMailViewStore,
 Utils,
 React,
 FocusedContactsStore,
 MessageStore,
 NylasAPI,
 AccountStore} = require 'nylas-exports'

NylasStore = require 'nylas-store'

_ = require('underscore')

class KyleButton extends React.Component
  @displayName: 'KyleButton'

  # # In the constructor, we're setting the component's initial state.
  # constructor: (@props) ->

  # HTML Element
  render: ->
    <button style={order:-105}
            className="btn fa fa-bicycle"
            title="KyleButton"
            onClick={ => @_onClick()} ref="button">
    </button>

  _onClick: =>
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

    # TODO Make unsubscribe run in background when possible (sort of works, but...
        # > TODO Confirm unsubscription
        # > https://github.com/atom/electron/blob/master/docs/api/browser-window.md
    # TODO Otherwise load full window so user can interact
    # TODO Auto archive original email
    # TODO Archive any confirmation emails (You are now unsubscribed)


module.exports = {KyleButton}
