const {React} = require('nylas-exports');
const {RetinaImg} = require('nylas-component-kit');
const ThreadUnsubscribeStoreManager = require('../thread-unsubscribe-store-manager');
const ThreadConditionType = require(`${__dirname}/../enum/threadConditionType`);

const UNSUBSCRIBE_ASSETS_URL = 'nylas://n1-unsubscribe/assets/';

class ThreadUnsubscribeButton extends React.Component {

  static propTypes = {
    thread: React.PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      condition: ThreadConditionType.LOADING,
      hasLinks: false,
    };
  }

  componentWillMount() {
    this.load(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.load(newProps);
    this.setState(this.tuStore.threadState);
  }

  componentWillUnmount() {
    return this.unload();
  }

  onMessageLoad(threadState) {
    this.setState(threadState);
  }

  onClick(event) {
    this.tuStore.unsubscribe();

    // Don't trigger the thread row click
    event.stopPropagation()
  }

  getTitleText() {
    let titleText;
    if (this.state.condition === ThreadConditionType.ERRORED) {
      titleText = 'Unsubscribe (Errored)';
    } else if (this.state.hasLinks === false) {
      titleText = 'Unsubscribe (Disabled)';
    } else if (this.state.isEmail === true) {
      titleText = 'Unsubscribe (Email)';
    } else {
      titleText = 'Unsubscribe (Browser)';
    }
    return titleText;
  }

  load(props) {
    this.unload();
    this.tuStore = ThreadUnsubscribeStoreManager.getStoreForThread(props.thread);
    this.unlisten = this.tuStore.listen(this.onMessageLoad.bind(this));
  }

  unload() {
    if (this.unlisten) {
      this.unlisten();
    }
    this.unlisten = null;
    this.tuStore = null;
  }

  render() {
    return null;
  }
}

class ThreadUnsubscribeQuickActionButton extends ThreadUnsubscribeButton {

  static displayName = 'ThreadUnsubscribeQuickActionButton';

  render() {
    let buttonTitle = this.getTitleText();
    const extraClasses = (this.state.hasLinks === false) ? 'unsubscribe-disabled' : '';

    return (
      <div
        key="unsubscribe"
        title={buttonTitle}
        style={{ order: 80 }}
        className={
          `btn action action-unsubscribe ${extraClasses}`
        }
        onClick={this.onClick.bind(this)}
      ></div>
    );
  }
}

class ThreadUnsubscribeToolbarButton extends ThreadUnsubscribeButton {

  static displayName = 'ThreadUnsubscribeToolbarButton';

  getIconURL(name : string, scale : number) {
    let url = UNSUBSCRIBE_ASSETS_URL;

    if (typeof scale === 'undefined') {
      scale = window.devicePixelRatio || 1;
    }

    url += name;

    /* switch (this.state.condition) {
      case ThreadConditionType.UNSUBSCRIBED:
        url += '-success';
        break;
    }*/

    url += `@${scale}x.png`;

    return url;
  }

  render() {
    let buttonTitle = this.getTitleText();
    const extraClasses = (this.state.hasLinks === false) ? 'unsubscribe-disabled' : '';

    return (
      <button
        className={
          `btn btn-toolbar toolbar-unsubscribe ${extraClasses}`
        }
        onClick={this.onClick.bind(this)}
        title={buttonTitle}
      >
        <RetinaImg
          mode={RetinaImg.Mode.ContentIsMask}
          url={this.getIconURL('toolbar-unsubscribe')}
        />
      </button>
    );
  }
}

module.exports = {
  // ThreadUnsubscribeButton,
  ThreadUnsubscribeToolbarButton,
  ThreadUnsubscribeQuickActionButton,
};
