{RetinaImg} = require 'nylas-component-kit'
{React,
 FocusedMailViewStore} = require 'nylas-exports'
{UnsubscribeManager} = require './unsubscribe-manager'

class ThreadUnsubscribeToolbarButton extends React.Component
  @displayName: 'ThreadUnsubscribeToolbarButton'
  @propTypes:
    thread: React.PropTypes.object

  render: =>
    mailViewFilter = FocusedMailViewStore.mailView()
    unsubscribe = null

    if true
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

  _onUnsubscribe: (event) =>
    console.log("Unsubscribe toggle button clicked");

    UnsubscribeManager.unsubscribe(@props);
    
    # Don't trigger the thread row click
    event.stopPropagation()

module.exports = ThreadUnsubscribeToolbarButton