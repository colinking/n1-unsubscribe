var {Actions,
 CategoryStore,
 TaskFactory,
 FocusedMailViewStore,
 Utils,
 React,
 FocusedContactsStore,
 MessageStore,
 NylasAPI,
 AccountStore} = require('nylas-exports');
var NylasStore = require('nylas-store');
var _ = require('underscore');
var cheerio = require('cheerio');
var path = require('path');
var browser = require('remote').require('browser-window');

class UnsubscribeManager extends NylasStore {
	constructor() {
		super();
		// this.props = props;
		this._links = {};
		this.listenTo(MessageStore, this._onItemsLoaded);
	}

	// An array of unsubscribe links that have been found in the list-unsubscribe header of the email or by parsing the body
	get links() {
		if (this._links[this.id] === undefined) {
			this._loadLinks();
		}
		return this._links;
	}

	get id() {
		var thread = MessageStore.thread();
		return thread == null ? null : thread.id;
	}

	_loadLinks() {
		var header_links = this._parseHeadersForLinks();
		var body_links = this._parseBodyForLinks();
		this._links[this.id] = header_links.concat(body_links);
	}

	// Examine the email headers for the list-unsubscribe header
	_parseHeadersForLinks() {
		var unsubscribe_links = [];
		// TODO
		return unsubscribe_links;
	}

	// Parse the HTML within the email body for unsubscribe links
	_parseBodyForLinks() {
		var unsubscribe_links = [];

		var items = MessageStore.items();
		if (items.length > 0) {
			var html_string = items[0].body;
			var $ = cheerio.load(html_string);

			// Get a list of all anchor tags with valid links
			var email_links = _.filter($('a'), function(email_link) {
				return email_link.href != 'blank';
			});

			var link_lists = [email_links, this._getLinkedSentences($)];
			var regexps = [/unsubscribe/gi, /opt[ -]out/gi]; //, /click.?here/gi, /stop.?receiving/gi, /do.?not.?send/gi, /reject/gi];
			
			for (var j = 0; j < link_lists.length; j++) {
				var links = link_lists[j];
				for (var i = 0; i < regexps.length; i++) {
					var re = regexps[i];
					unsubscribe_links = unsubscribe_links.concat(_.filter(links, function(email_link) {
						return re.test(email_link.href) || re.test(email_link.innerText);
					}));
				};
			}
		}

		if (this._links[this.id] != undefined) {
			if (unsubscribe_links.length > 0) {
				console.log("Unsubscribe links found in the email body: ");
				console.log(unsubscribe_links);
			} else {
				console.log("No unsubscribe links found");
			}
		}

		return unsubscribe_links;
	}

	// Checks if an unsubscribe link can be found in the email
	// Returns a boolean whether it is possible to unsubscribe
	canUnsubscribe() {
		return this.links[this.id].length > 0;
	}

	// Opens the unsubscribe link to unsubscribe the user
	// Returns a boolean indicating whether it was a success
	unsubscribe() {
		if (!this.canUnsubscribe()) {
			return false;
		}

		var isDone = false;
		for (var i = 0; i < this.links[this.id].length && !isDone; i++) {
			var link = this.links[this.id][i].href
			console.log("Found link: " + link);
			isDone = this._unsubscribeViaBrowser(link);
		};

		if (isDone)
			_trashEmail();

		return isDone;
	}

	_onItemsLoaded(change) {
		if (change != undefined) {
			// console.log("Items loaded");
			// console.log(change);

			this._links[this.id] = [];
			this._loadLinks();
			this.trigger();
		}
	}

	// Takes a String URL and unsubscribes by loading a browser window
	// Returns a boolean indicating if it was a success
	_unsubscribeViaBrowser(url) {
		var browserwindow = new browser({
			'web-preferences': {'web-security':false},
			'width': 1000,
			'height': 800,
			'allowDisplayingInsecureContent': true
			// 'preload': path.join(__dirname, 'inject.js')
		});
		browserwindow.loadUrl(url);
		browserwindow.show();
		return true;
	}

	// Takes a String email address and sends an email to it in order to unsubscribe from the list
	// Returns a boolean indicating if the unsubscription was a success
	_unsubscribeViaMail(email_address) {
		// TODO
		return false;
	}

	// Move the given email to the trash
	_trashEmail() {
		// console.log("Trashing email");
		task = TaskFactory.taskForMovingToTrash([this.props.thread], FocusedMailViewStore.mailView());
		Actions.queueTask(task);
	}

	// Takes a parsed DOM (through cheerio) and returns sentences that contain links
	// Good at catching cases such as 
	//		"If you would like to unsubscrbe from our emails, please click here."
	// Returns a list of objects, each representing a single link
	// Each object contains an href and innerText property
	_getLinkedSentences($) {
		// Get a unique list of parents to <a> tags
		var a_parents = [];
		$('a').each(function(_, a_tag) {
			if(!$(a_parents).is(a_tag.parent)) {
				a_parents.unshift(a_tag.parent);
			}
		});

		var linked_sentences = [];
		$(a_parents).each(function(_, parent) {
			// console.log($(parent));
			var link = undefined;
			var leftover_text = "";
			$(parent.children).each(function(_, child) {
				// console.log(child);
				if($(child).is($('a'))) {
					if (link != undefined && leftover_text.length > 0) {
						linked_sentences.push({
							href: link,
							innerText: leftover_text
						});
						leftover_text = "";
					}
					link = $(child).attr('href');
					// console.log("Found link: " + link);
				}
				var text = $(child).text();
				var re = /(.*\.|!|\?\s)|(.*\.|!|\?)$/g;
				// console.log("text: " + text);
				if (re.test(text)) {
					var splitup = text.split(re);
					// console.log(splitup);
					for(var i = 0; i < splitup.length; i++) {
						if (splitup[i] != "" && splitup[i] != undefined) {
							if(link != undefined) {
								var full_line = leftover_text + splitup[i];
								// console.log("FULL LINE: " + full_line);
								linked_sentences.push({
									href: link,
									innerText: full_line
								});
								link = undefined;
								leftover_text = "";
							} else {
								leftover_text += splitup[i];
							}
						}
					}
				} else {
					leftover_text += text;
					// console.log("leftover_text: " + leftover_text);
				}
				leftover_text += " ";
			});
			// Case occures when an end of sentence is not found
			if(link != undefined && leftover_text.length > 0)
				linked_sentences.push({
					href: link,
					innerText: leftover_text
				});
		});
		// console.log(linked_sentences);
		return linked_sentences;
	}
}

module.exports = new UnsubscribeManager();

