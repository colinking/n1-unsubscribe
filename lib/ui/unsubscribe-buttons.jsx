const {React} = require('nylas-exports');
const {RetinaImg} = require('nylas-component-kit');
const ThreadUnsubscribeStoreManager = require('../thread-unsubscribe-store-manager');
const ThreadConditionType = require(`${__dirname}/../enum/threadConditionType`);

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
    console.log(this.props.thread);
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

module.exports = {
  // ThreadUnsubscribeButton,
  ThreadUnsubscribeToolbarButton,
  ThreadUnsubscribeQuickActionButton,
};
