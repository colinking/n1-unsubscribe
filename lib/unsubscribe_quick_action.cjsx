{Actions,
 CategoryStore,
 React,
 TaskFactory,
 FocusedMailViewStore} = require 'nylas-exports'
{UnsubscribeManager} = require './unsubscribe-manager'

class ThreadUnsubscribeQuickActions extends React.Component
  @displayName: 'ThreadUnsubscribeQuickActions'
  @propTypes:
    thread: React.PropTypes.object

  render: =>
    mailViewFilter = FocusedMailViewStore.mailView()
    unsubscribe = null

    if true
      unsubscribe = <div key="unsubscribe"
                   title="Unsubscribe"
                   style={{ order: 90 }}
                   className='btn action action-unsubscribe'
                   onClick={@_onUnsubscribe}></div>

    return unsubscribe

  shouldComponentUpdate: (newProps, newState) ->
    newProps.thread.id isnt @props?.thread.id

  _onUnsubscribe: (event) =>
    console.log("Unsubscribe quick action clicked");

    UnsubscribeManager.unsubscribe(@props);
  
    # Don't trigger the thread row click
    event.stopPropagation()

module.exports = ThreadUnsubscribeQuickActions