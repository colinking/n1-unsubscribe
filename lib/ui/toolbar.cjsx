{RetinaImg} = require 'nylas-component-kit'
{React} = require 'nylas-exports'
ThreadUnsubscribeStoreManager = require '../thread-unsubscribe-store-manager'

class ThreadUnsubscribeToolbarButton extends React.Component
  @displayName: 'ThreadUnsubscribeToolbarButton'
  @propTypes:
    thread: React.PropTypes.object

  render: =>
    unsubscribe = null
    url = (@selectIcon(@_tuStore.unsubscribeWasSuccess))
    if @_tuStore.canUnsubscribe()
      unsubscribe = <button className="btn btn-toolbar toolbar-unsubscribe"
                            onClick={@_onUnsubscribe}
                            title="Unsubscribe">
                      <RetinaImg
                        mode={RetinaImg.Mode.ContentIsMask}
                        url=url />
                    </button>
    return unsubscribe

  selectIcon: (wasSuccess) ->
    if wasSuccess
      return "nylas://n1-unsubscribe/assets/unsubscribe-success@2x.png"
    else if wasSuccess is 'loading'
      # FIXME just a placeholder, gifs didn't seem to work and
      # the spinner in the UI kit is a 4-icon progress bar
      # return "nylas://n1-unsubscribe/assets/hex-loader2.gif"
      return "nylas://n1-unsubscribe/assets/loading.png"
    else
      return "nylas://n1-unsubscribe/assets/unsubscribe@2x.png"

  shouldComponentUpdate: (newProps, newState) ->
    shouldUpdate = newProps.thread.id isnt @props?.thread.id
    if shouldUpdate
      @_load(newProps)
    shouldUpdate

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

module.exports = ThreadUnsubscribeToolbarButton