# Attempt with classes and things that I don't understand

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


# {RetinaImg} = require 'nylas-component-kit'
# classNames = require 'classnames'
# ThreadListStore = require './thread-list-store'

# MailParser = require('mailparser').MailParser

# Create Callback on message load
class UnsubscriberStore extends NylasStore
  constructor: () ->
    super() # refers to constructor of parent class to init variables
    # this._getUnsubscribeLink = this._getUnsubscribeLink.bind(this);
    # this._parseHTML = this._parseHTML.bind(this);
    # this._setListUnsubscribeData = this._setListUnsubscribeData.bind(this);
    this.listenTo(MessageStore, this._onMessageStoreChanged)

  _onMessageStoreChanged: () ->
    console.log '_onMessageStoreChanged'
    console.log 'MessageStore.items():'
    console.log MessageStore.items()

class KyleButton extends React.Component
  @displayName: 'KyleButton'

  # In the constructor, we're setting the component's initial state.
  constructor: (@props) ->
    # console.log @props.thread
    # console.log 'MessageStore:'
    # console.log MessageStore
    setTimeout (->
      TextHTML = MessageStore.items()[0].body
      parser = new DOMParser()
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
      console.log 'links[0].href'
      console.log links[0].href
      return links[0].href
    ), 1000
    # @state =
    #   level: @_calculateLevel(@props.thread)

  # HTML Element
  render: ->
    <button style={order:-105}
            className="btn fa fa-bicycle"
            title="KyleButton">
    </button>

module.exports = {KyleButton}
