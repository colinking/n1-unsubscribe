# On click, open browser and begin unsubscribe process

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
      'height': 600
    });

    w.loadUrl(links[0].href)


module.exports = {KyleButton}
