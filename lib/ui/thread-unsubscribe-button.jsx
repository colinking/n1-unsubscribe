const {React} = require('nylas-exports');
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

  load(props) {
    this.unload();
    this.tuStore = ThreadUnsubscribeStoreManager.getStoreForThread(props.thread);
    this.unlisten = this.tuStore.listen(this.onMessageLoad.bind(this));
  }

  unload() {
    if (this.unlisten) {
      this.unlisten();
    }
  }

  render() {
    return null;
  }
}

module.exports = ThreadUnsubscribeButton;
