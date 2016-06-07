const {React} = require('nylas-exports');
const {RetinaImg, KeyCommandsRegion} = require('nylas-component-kit');
const ThreadUnsubscribeStoreManager = require('../thread-unsubscribe-store-manager');
const ThreadConditionType = require(`${__dirname}/../enum/threadConditionType`);

const UNSUBSCRIBE_ASSETS_URL = 'nylas://n1-unsubscribe/assets/';

class ThreadUnsubscribeButton extends React.Component {

  static containerRequired = false;

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

  getIconInfo(name : string, scale : number) {
    let url = UNSUBSCRIBE_ASSETS_URL;
    let buttonTitle;
    let extraClasses;

    if (typeof scale === 'undefined') {
      scale = Math.ceil(window.devicePixelRatio);
      // console.log(`Calculated scale: ${scale}`);
      if (scale !== 1 || scale !== 2) { scale = 2; }
    }

    url += name;
    switch (this.state.condition) {
      case ThreadConditionType.UNSUBSCRIBED:
        extraClasses = 'unsubscribe-success';
        buttonTitle = 'Unsubscribe (Success!)';
        url += '-success';
        break;
      case ThreadConditionType.ERRORED:
        extraClasses = 'unsubscribe-error';
        buttonTitle = 'Unsubscribe (Error)';
        url += '-error';
        break;
      case ThreadConditionType.DISABLED:
        extraClasses = 'unsubscribe-disabled';
        buttonTitle = 'Unsubscribe (Disabled)';
        // url += '-disabled';
        url += '';
        break;
      case ThreadConditionType.DONE:
        extraClasses = 'unsubscribe-ready';
        buttonTitle = 'Unsubscribe Now!';
        url += '';
        break;
      default:
        extraClasses = 'unsubscribe-loading';
        buttonTitle = 'Unsubscribe (Loading)';
        url += '-loading';
        break;
    }

    url += `@${scale}x.png`;

    return {buttonTitle, extraClasses, url};
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
    const {buttonTitle, extraClasses, url} = this.getIconInfo('unsubscribe');
    // Style-order: [<100] Archive (100), Trash (110) [To be on the right, be > 110]
    return (
      <div
        key="unsubscribe"
        title={buttonTitle}
        style={{
          order: 120,
          background: `url(${url}) center no-repeat`,
        }}
        className={`btn action action-unsubscribe ${extraClasses}`}
        onClick={this.onClick.bind(this)}
      ></div>
    );
  }
}

class ThreadUnsubscribeToolbarButton extends ThreadUnsubscribeButton {

  static displayName = 'ThreadUnsubscribeToolbarButton';

  _keymapHandlers() {
    return {"n1-unsubscribe:unsubscribe": this._keymapEvent}
  }

  render() {
    const {buttonTitle, extraClasses, url} = this.getIconInfo('unsubscribe');
    // Style-order: [<-107] Archive (-107) ...
    //      Unread (-104) [To be on the right, be > -104]
    return (
      <KeyCommandsRegion
        globalHandlers={this._keymapHandlers(this)}
        style={{order: -110}}
      >
        <button
          className={`btn btn-toolbar toolbar-unsubscribe ${extraClasses}`}
          id={'N1-Unsubscribe'}
          onClick={this.onClick.bind(this)}
          title={buttonTitle}
        >
          <RetinaImg
            mode={RetinaImg.Mode.ContentIsMask}
            url={url}
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
