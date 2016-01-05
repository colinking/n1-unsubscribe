# very first functional code:

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

# NylasStore = require 'nylas-store'

# # {RetinaImg} = require 'nylas-component-kit'
# # classNames = require 'classnames'
# # ThreadListStore = require './thread-list-store'

# # MailParser = require('mailparser').MailParser
# # _ = require('underscore')

# # Create Callback on message load
# class UnsubscriberStore extends NylasStore
#   constructor: () ->
#     super() # refers to constructor of parent class to init variables
#     # this._getUnsubscribeLink = this._getUnsubscribeLink.bind(this);
#     # this._parseHTML = this._parseHTML.bind(this);
#     # this._setListUnsubscribeData = this._setListUnsubscribeData.bind(this);
#     this.listenTo(MessageStore, this._onMessageStoreChanged)

#   _onMessageStoreChanged: () ->
#     console.log '_onMessageStoreChanged'
#     console.log 'MessageStore.items():'
#     console.log MessageStore.items()

class KyleButton extends React.Component
  @displayName: 'KyleButton'

  # In the constructor, we're setting the component's initial state.
  constructor: (@props) ->
    # console.log @props.thread
    # console.log 'MessageStore:'
    # console.log MessageStore
    setTimeout (->
      console.log 'MessageStore.items():'
      # console.log MessageStore.items()
      console.log 'MessageStore.items()[0].body:'
      console.log MessageStore.items()[0].body
      # result = MessageStore.items()
      # console.log result[0].body
      # console.log result[0].body.querySelectorAll('a')
      return
    ), 2000
    # @state =
    #   level: @_calculateLevel(@props.thread)

  # HTML Element
  render: ->
    <button style={order:-105}
            className="btn fa fa-bicycle"
            title="KyleButton">
    </button>

module.exports = {KyleButton}
