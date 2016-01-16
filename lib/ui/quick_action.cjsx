{React} = require 'nylas-exports'
ThreadUnsubscribeStoreManager = require '../thread-unsubscribe-store-manager'

class ThreadUnsubscribeQuickActions extends React.Component
  @displayName: 'ThreadUnsubscribeQuickActions'
  @propTypes:
    thread: React.PropTypes.object

  render: =>
    unsubscribe = null

    if @_tuStore.canUnsubscribe()
      unsubscribe = <div key="unsubscribe"
                   title="Unsubscribe"
                   style={{ order: 90 }}
                   className={'btn action action-unsubscribe' + (if @_tuStore.unsubscribeWasSuccess then ' unsubscribe-success' else '')}
                   onClick={@_onUnsubscribe}></div> 
    return unsubscribe

  shouldComponentUpdate: (newProps, newState) ->
    newProps.thread.id isnt @props?.thread.id

  componentWillMount: ->
    @_load(@props)

  componentWillUnmount: ->
    @_unload()

  _load: (props) ->
      @_unload()
      @_tuStore = ThreadUnsubscribeStoreManager.getStoreForThread(props.thread)
      @_unlisten = @_tuStore.listen @_onMessageLoad

  _unload: ->
    @_unlisten() if @_unlisten

  _onMessageLoad: (change) =>
    @forceUpdate()

  _onUnsubscribe: (event) =>
    @_tuStore.unsubscribe();
    
    # Don't trigger the thread row click
    event.stopPropagation()

module.exports = ThreadUnsubscribeQuickActions