{React} = require 'nylas-exports'
ThreadUnsubscribeStoreManager = require '../thread-unsubscribe-store-manager'

class ThreadUnsubscribeQuickActions extends React.Component
  @displayName: 'ThreadUnsubscribeQuickActions'
  @propTypes:
    thread: React.PropTypes.object

  render: =>
    unsubscribe = null

    if @tuStore.canUnsubscribe()
      unsubscribe = <div key="unsubscribe"
                   title="Unsubscribe"
                   style={{ order: 90 }}
                   className='btn action action-unsubscribe'
                   onClick={@_onUnsubscribe}></div> 
    return unsubscribe

  shouldComponentUpdate: (newProps, newState) ->
    newProps.thread.id isnt @props?.thread.id

  componentWillMount: ->
    @tuStore = ThreadUnsubscribeStoreManager.getStoreForThread(@props.thread)
    @_unlisten = @tuStore.listen @_onMessageLoad

  componentWillUnmount: ->
    @_unlisten();

  _onMessageLoad: (change) =>
    @forceUpdate()

  _onUnsubscribe: (event) =>
    @tuStore.unsubscribe();
    
    # Don't trigger the thread row click
    event.stopPropagation()

module.exports = ThreadUnsubscribeQuickActions