const {React} = require('nylas-exports');
const {RetinaImg, KeyCommandsRegion} = require('nylas-component-kit');
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

  getIconURL(name : string, scale : number) {
    let url = UNSUBSCRIBE_ASSETS_URL;

    if (typeof scale === 'undefined') {
      // Add error checking to make sure an icon is available:
      // PREVIOUSLY: scale = window.devicePixelRatio || 1;
      scale = Math.ceil(window.devicePixelRatio);
      // console.log(`Calculated scale: ${scale}`);
      if (scale !== 1 || scale !== 2) { scale = 2; }
    }

    url += name;

    switch (this.state.condition) {
      case ThreadConditionType.UNSUBSCRIBED:
        url += '-success';
        break;
      case ThreadConditionType.ERRORED:
        url += '-error';
        break;
      case ThreadConditionType.DISABLED:
        // url += '-disabled';
        url += '';
        break;
      // // // Moved to default:
      // case ThreadConditionType.LOADING:
      //   url += '-loading';
      //   break;
      case ThreadConditionType.DONE:
        url += '';
        break;
      default:
        url += '-loading';
        break;
    }

    url += `@${scale}x.png`;

    return url;
  }

  getStateText() {
    let buttonTitle;
    let extraClasses;
    if (this.state.condition === ThreadConditionType.ERRORED) {
      extraClasses = 'unsubscribe-error';
      buttonTitle = 'Unsubscribe (Error)';
    } else if (this.state.condition === ThreadConditionType.LOADING) {
      extraClasses = 'unsubscribe-loading';
      buttonTitle = 'Unsubscribe (Loading)';
    } else if (this.state.condition === ThreadConditionType.UNSUBSCRIBED) {
      extraClasses = 'unsubscribe-success';
      buttonTitle = 'Unsubscribe (Success!)';
    } else if (this.state.condition === ThreadConditionType.DISABLED) {
      extraClasses = 'unsubscribe-disabled';
      buttonTitle = 'Unsubscribe (Disabled)';
    } else if (this.state.condition === ThreadConditionType.DONE) {
      extraClasses = 'unsubscribe-ready';
      buttonTitle = 'Unsubscribe Now!';
    } else if (this.state.isEmail === true) {
      extraClasses = 'unsubscribe-ready';
      buttonTitle = 'Unsubscribe (via Email)';
    } else if (this.state.hasLinks === true) {
      extraClasses = 'unsubscribe-ready';
      buttonTitle = 'Unsubscribe (via Browser)';
    } else {
      console.warn('Unknown state for this.state.condition:');
      console.warn(this);
      extraClasses = 'unsubscribe-else-catch';
      buttonTitle = 'Unsubscribe (NO-STATE-ERROR)';
    }
    return {buttonTitle, extraClasses};
  }

  load(props) {
    this.unload();
    this.tuStore = ThreadUnsubscribeStoreManager.getStoreForThread(props.thread);
    this.unlisten = this.tuStore.listen(this.onMessageLoad.bind(this));
    this.tuStore.triggerUpdate();
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
    const {buttonTitle, extraClasses} = this.getStateText();
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

  _keymapHandlers() {
    return {"n1-unsubscribe:unsubscribe": this._keymapDemo}
  }

  render() {
    const {buttonTitle, extraClasses} = this.getStateText();
    return (
      <KeyCommandsRegion globalHandlers={this._keymapHandlers(this)}>
        <button
          className={`btn btn-toolbar toolbar-unsubscribe ${extraClasses}`}
          onClick={this.onClick.bind(this)}
          title={buttonTitle}
        >
          <RetinaImg
            mode={RetinaImg.Mode.ContentIsMask}
            url={this.getIconURL('toolbar-unsubscribe')}
          />
        </button>
      </KeyCommandsRegion>
    );
  }

  _keymapDemo() {
    console.error('KEYMAP for N1-Unsubscribe was PRESSED!');
    // // FIXME: `this` doesn't have class `.unsubscribe()`
    // this.tuStore.unsubscribe();
  }
}

module.exports = {
  // ThreadUnsubscribeButton,
  ThreadUnsubscribeToolbarButton,
  ThreadUnsubscribeQuickActionButton,
};
