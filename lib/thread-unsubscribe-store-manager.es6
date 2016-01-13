var ThreadUnsubscribeStore = require('./thread-unsubscribe-store');

class ThreadUnsubscribeStoreManager {
	constructor() {
		this._threads = {};
	}

	getStoreForThread(thread) {
		var id = thread.id;
		if (this._threads[id] === undefined) {
			this._threads[id] = new ThreadUnsubscribeStore(thread);
		}
		return this._threads[id];
	}
}

module.exports = new ThreadUnsubscribeStoreManager();

