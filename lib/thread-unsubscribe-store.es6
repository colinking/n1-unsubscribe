var {Actions,
 TaskFactory,
 FocusedMailViewStore,
 NylasAPI} = require('nylas-exports');
var NylasStore = require('nylas-store');
var _ = require('underscore');
var cheerio = require('cheerio');
var path = require('path');
var browser = require('remote').require('browser-window');
var MailParser = require("mailparser").MailParser;

class ThreadUnsubscribeStore extends NylasStore {
	constructor(thread) {
		super();
		this._thread = thread;
		this._messages = this._thread.metadata;
		this._links = [];
		this.unsubscribeWasSuccess = false;
		this._loadLinks();
	}

	// Checks if an unsubscribe link can be found in the email
	// Returns a boolean whether it is possible to unsubscribe
	canUnsubscribe() {
		return this._links.length > 0;
	}

	// Opens the unsubscribe link to unsubscribe the user
	// The optional callback returns: (Error, Boolean indicating whether it was a success)
	unsubscribe() {
		if (this.canUnsubscribe()) {
			var unsubscribeHandler = (error, wasSuccess) => {
				this.unsubscribeWasSuccess = wasSuccess;
				setTimeout(() => {
					this.unsubscribeWasSuccess = false;
					this.trigger();
				}, 3000);
				// if(!error && this.unsubscribeWasSuccess)
					// this._trashThread();
				this.trigger();
			};
			this._unsubscribeViaBrowser(this._links[0].href, unsubscribeHandler);
		}
	}

	_loadLinks() {
		// console.log("Loading data: " + this._thread.subject);
		this._loadThreadViaAPI((error, email) => {
			if (!error) {
				var header_links = this._parseHeadersForLinks(email.headers);
				var body_links = this._parseBodyForLinks(email.html);
				this._links = header_links.concat(body_links);

				this.trigger();
			} else {
				// console.error(error);
			}
		});
	}

	// Makes an API request to fetch the data on the 
	// NOTE: This will only make a request for the first email message in the thread, instead of all messages
	// based on the assumption that all of the emails in the thread will have the unsubscribe link.
	// Callback: (Error, Parsed email)
	_loadThreadViaAPI(callback) {
		if (this._messages.length > 0) {
			var messagePath = '/messages/' + this._messages[0].id;
			if (!this._messages[0].draft) {
				// console.log(this._thread);
				NylasAPI.makeRequest({
					path: messagePath,
					accountId: this._thread.accountId,
					headers: {Accept: "message/rfc822"}, // Need raw email to get email headers (see: https://nylas.com/docs/#raw_message_contents)
					json: false,
					success: (raw_email) => {
						var mailparser = new MailParser();
						mailparser.on('end', function(parsed_email) {
							callback(null, parsed_email);
						});
						mailparser.write(raw_email);
						mailparser.end();
					},
					error: (error) => {
						callback(error);
					}
				});
			}
		} else {
			callback(new Error("No messages to load in this thread."));
		}
	}

	// Examine the email headers for the list-unsubscribe header
	_parseHeadersForLinks(headers) {
		var unsubscribe_links = [];
		// TODO
		return unsubscribe_links;
	}

	// Parse the HTML within the email body for unsubscribe links
	_parseBodyForLinks(email_html) {
		var unsubscribe_links = [];
		if (email_html) {
			var $ = cheerio.load(email_html);

			// Get a list of all anchor tags with valid links
			var email_links = _.filter($('a'), function(email_link) {
				return email_link.href != 'blank';
			});

			var link_lists = [email_links, this._getLinkedSentences($)];
			var regexps = [/unsubscribe/gi, /opt[ -]out/gi, /email preferences/gi]; //, /click.?here/gi, /stop.?receiving/gi, /do.?not.?send/gi, /reject/gi];
			
			for (var j = 0; j < link_lists.length; j++) {
				var links = link_lists[j];
				for (var i = 0; i < regexps.length; i++) {
					var re = regexps[i];
					unsubscribe_links = unsubscribe_links.concat(_.filter(links, function(email_link) {
						return re.test(email_link.href) || re.test(email_link.innerText);
					}));
				};
			}

			if (unsubscribe_links.length > 0) {
				// console.log("Unsubscribe links found in the email body: ");
				// console.log(unsubscribe_links);
			} else {
				// console.log("No unsubscribe links found");
			}
		}

		return unsubscribe_links;
	}

	// Takes a String URL and unsubscribes by loading a browser window
	// Callback returns a boolean indicating if it was a success
	_unsubscribeViaBrowser(url, callback) {
		var browserwindow = new browser({
			'web-preferences': { 'web-security': false },
			'width': 1000,
			'height': 800,
			'allowDisplayingInsecureContent': true
			// 'preload': path.join(__dirname, 'inject.js')
		});
		browserwindow.loadUrl(url);
		browserwindow.show();
		browserwindow.on('closed', () => {
			callback(null, true);
		});
	}

	// Takes a String email address and sends an email to it in order to unsubscribe from the list
	// Returns a boolean indicating if the unsubscription was a success
	_unsubscribeViaMail(email_address) {
		// TODO
		return false;
	}

	// Move the given thread to the trash
	_trashThread() {
    	if (FocusedMailViewStore.mailView().canTrashThreads()) {
			task = TaskFactory.taskForMovingToTrash({
				threads: [this._thread], 
				fromView: FocusedMailViewStore.mailView()
			});
			Actions.queueTask(task);
    	}
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
			if (a_tag) {
				if(!$(a_parents).is(a_tag.parent)) {
					a_parents.unshift(a_tag.parent);
				}
			}
		});

		var linked_sentences = [];
		$(a_parents).each(function(_, parent) {
			// console.log($(parent));
			var link = undefined;
			var leftover_text = "";
			if (parent) {
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
			}
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

module.exports = ThreadUnsubscribeStore;

