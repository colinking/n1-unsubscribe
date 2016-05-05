const {React} = require('nylas-exports');
const ThreadUnsubscribeButton = require('./thread-unsubscribe-button');
// const ThreadConditionType = require(`${__dirname}/../enum/threadConditionType`);

class ThreadUnsubscribeQuickActionButton extends ThreadUnsubscribeButton {

  static displayName = 'ThreadUnsubscribeQuickActionButton';

  render() {
    const disabledClass = (this.state.hasLinks === false ? 'unsubscribe-disabled' : '');
    const titleText = this.getTitleText();

      // TODO: Add success and error images
      // const extraClasses = (this.state.condition === ThreadConditionType.UNSUBSCRIBED ?
      //     ' unsubscribe-success' : '');
    return (
      <div
        key="unsubscribe"
        title={titleText}
        style={{ order: 80 }}
        className={
          `btn action action-unsubscribe ${disabledClass}`
        }
        onClick={this.onClick.bind(this)}
      ></div>
    );
  }
}

module.exports = ThreadUnsubscribeQuickActionButton;
