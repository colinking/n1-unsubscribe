{Actions,
 CategoryStore,
 React,
 TaskFactory,
 FocusedMailViewStore} = require 'nylas-exports'
UnsubscribeManager = require '../unsubscribe-manager'

# NOTE: Currently does not work, unless the email is currently selected. 

class ThreadUnsubscribeQuickActions extends React.Component
  @displayName: 'ThreadUnsubscribeQuickActions'
  @propTypes:
    thread: React.PropTypes.object

  render: =>
    mailViewFilter = FocusedMailViewStore.mailView()
    unsubscribe = null

    if UnsubscribeManager.canUnsubscribe()
      unsubscribe = <div key="unsubscribe"
                   title="Unsubscribe"
                   style={{ order: 90 }}
                   className='btn action action-unsubscribe'
                   onClick={@_onUnsubscribe}></div> 
    return unsubscribe

  shouldComponentUpdate: (newProps, newState) ->
    newProps.thread.id isnt @props?.thread.id

  componentWillMount: ->
    @_unlisten = UnsubscribeManager.listen @_onMessageLoad

  componentWillUnmount: ->
    @_unlisten();

  _onMessageLoad: (change) =>
    @forceUpdate()

  _onUnsubscribe: (event) =>
    UnsubscribeManager.unsubscribe();
    
    # Don't trigger the thread row click
    event.stopPropagation()

module.exports = ThreadUnsubscribeQuickActions