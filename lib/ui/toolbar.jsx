const {RetinaImg} = require('nylas-component-kit');
const {React} = require('nylas-exports');
const ThreadUnsubscribeButton = require('./thread-unsubscribe-button');

class ThreadUnsubscribeToolbarButton extends ThreadUnsubscribeButton {

  static displayName = 'ThreadUnsubscribeToolbarButton';

  getIconURL() {
    let url = undefined;
    // if (this.state === ThreadConditionType.UNSUBSCRIBED) {
    // url = "nylas://n1-unsubscribe/assets/unsubscribe-success@2x.png";
    // } else if () {
    //   return "nylas://n1-unsubscribe/assets/loading.png"
    // } else {
    url = "nylas://n1-unsubscribe/assets/unsubscribe@2x.png";
    // }

    return url;
  }

  render() {
    const url = this.getIconURL();
    const disabledClass = (this.state.hasLinks === false ? 'unsubscribe-disabled' : '');
    const titleText = this.getTitleText();

    return (
      <button
        className={`btn btn-toolbar toolbar-unsubscribe ${disabledClass}`}
        onClick={this.onClick.bind(this)}
        title={titleText}
      >
        <RetinaImg
          mode={RetinaImg.Mode.ContentIsMask}
          url={url}
          style={{zoom: 0.5}}
        />
      </button>
    );
  }
}

module.exports = ThreadUnsubscribeToolbarButton;
