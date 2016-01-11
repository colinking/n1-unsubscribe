{RetinaImg} = require 'nylas-component-kit'
{React,
 FocusedMailViewStore} = require 'nylas-exports'
UnsubscribeManager = require '../unsubscribe-manager'

class ThreadUnsubscribeToolbarButton extends React.Component
  @displayName: 'ThreadUnsubscribeToolbarButton'
  @propTypes:
    thread: React.PropTypes.object

  render: =>
    mailViewFilter = FocusedMailViewStore.mailView()
    unsubscribe = null

    if UnsubscribeManager.canUnsubscribe()
      unsubscribe = <button className="btn btn-toolbar"
                            onClick={@_onUnsubscribe}
                            title="Unsubscribe">
                      <RetinaImg
                        mode={RetinaImg.Mode.ContentIsMask}
                        style={{ zoom: 0.5 }}
                        url="nylas://n1-unsubscribe/assets/unsubscribe.png" />
                    </button>
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

module.exports = ThreadUnsubscribeToolbarButton