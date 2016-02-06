var {Actions,
 TaskFactory,
 FocusedPerspectiveStore,
 NylasAPI} = require('nylas-exports');
var NylasStore = require('nylas-store');
var _ = require('underscore');
var cheerio = require('cheerio');
var path = require('path');
var browser = require('remote').require('browser-window');
var MailParser = require('mailparser').MailParser;

class ThreadUnsubscribeStore extends NylasStore {
	constructor(thread) {
		super();
		this._thread = thread;
		this._messages = this._thread.metadata;
		this._links = [];
		this.unsubscribeWasSuccess = false;
		// Link Type Enum
		this.LinkType = {
			EMAIL: 'EMAIL',
			BROWSER: 'BROWSER'
		};
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
					if(!error && this.unsubscribeWasSuccess)
						this._trashThread();
					this.unsubscribeWasSuccess = false;
					this.trigger();
				}, 0);
				this.trigger();
			};

			// Determine if best to unsubscribe via email or browser:
			if (this._links[0].type == this.LinkType.EMAIL) {
				this._unsubscribeViaMail(this._links[0].link, unsubscribeHandler);
			} else {
				this._unsubscribeViaBrowser(this._links[0].link, unsubscribeHandler);
			}
		}
	}

	// Initializes the _links array by analyzing the headers and body of the current email thread
	_loadLinks() {
		this._loadMessagesViaAPI((error, email) => {
			if (!error) {
				var header_links = this._parseHeadersForLinks(email.headers);
				console.log("Header links:");
				console.log(header_links);
				var body_links = this._parseBodyForLinks(email.html);
				console.log("Body links:");
				console.log(body_links);
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
	_loadMessagesViaAPI(callback) {
		if (this._messages && this._messages.length > 0) {
			var messagePath = '/messages/' + this._messages[0].id;
			if (!this._messages[0].draft) {
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
		}
	}

	// Examine the email headers for the list-unsubscribe header
	// Returns an array of links as Objects, via the _parseLinksForTypes method
	_parseHeadersForLinks(headers) {
		var unsubscribe_links = [];
		if (headers && headers['list-unsubscribe']) {
			console.log(headers['list-unsubscribe']);
			var raw_links = headers['list-unsubscribe'].split(/,/g);
			unsubscribe_links = _.map(raw_links, function(link) {
				var trimmed_link = link.trim();
				return trimmed_link.substring(1, trimmed_link.length - 1);
			});
		}
		return this._parseLinksForTypes(unsubscribe_links);
	}

	// Parse the HTML within the email body for unsubscribe links
	// Returns an array of links as Objects, via the _parseLinksForTypes method
	_parseBodyForLinks(email_html) {
		var unsubscribe_links = [];
		if (email_html) {
			var $ = cheerio.load(email_html);

			// Get a list of all anchor tags with valid links
			var links = _.filter($('a'), function(email_link) {
				return email_link.href != 'blank';
			});

			links = links.concat(this._getLinkedSentences($));

			var regexps = [/unsubscribe/gi, /opt[ -]out/gi, /email preferences/gi];

			for (var j = 0; j < links.length; j++) {
				var link = links[j];
				for (var i = 0; i < regexps.length; i++) {
					var re = regexps[i];
					if (re.test(link.href) || re.test(link.innerText)) {
						unsubscribe_links.push(link.href);
					}
				};
			}

			// if (unsubscribe_links.length > 0) {
			//  // console.log("Unsubscribe links found in the email body: ");
			//  // console.log(unsubscribe_links);
			// } else {
			//  // console.log("No unsubscribe links found");
			// }
		}
		return this._parseLinksForTypes(unsubscribe_links);
	}

	// Given a list of unsubscribe links (Strings)
	// Returns a list of objects with a link and a LinkType
	// The returned list is in the same order as links, except that EMAIL links are pushed to the front.
	_parseLinksForTypes(links) {
		return _.sortBy(_.map(links, (link) => {
			var type = (/mailto.*/g.test(link) ? this.LinkType.EMAIL : this.LinkType.BROWSER);
			if (type == this.LinkType.EMAIL) {
				matches = /mailto:([^\?]*)/g.exec(link);
				if (matches && matches.length > 1) {
					link = matches[1];
				}
			}
			return {
				link: link,
				type: type
			}
		}), (link) => {
			// Move email links to the front
			if(link.type == this.LinkType.EMAIL) {
				return 0;
			} else {
				return 1;
			}
		});
	}

	// Takes a String URL and unsubscribes by loading a browser window
	// Callback returns a boolean indicating if it was a success
	_unsubscribeViaBrowser(url, callback) {
		// @ColinKing
		// URL's with the '/wf/click?upn=' lick tracking feature can't be opened
		var re = /\/wf\/click\?upn=/gi;
		if (re.test(url)) {
			console.warn('May not be able to open this link, but trying anyway');
			console.warn("TODO Should redirect to user's primary browser instead");
			console.warn('Loading... '+url);
		}
		// May be an issue with: --ignore-certificate-errors
		// app.commandLine.appendSwitch("ignore-certificate-errors");
		// Guide on adding flags to chrome:
		// https://github.com/atom/electron/blob/master/docs/api/chrome-command-line-switches.md
		// Two related issues on Electron:
		// https://github.com/atom/electron/issues/3555
		// https://github.com/atom/electron/issues/1956
		// See #7 for info about the email redirect:
		// https://support.sendgrid.com/hc/en-us/articles/200181718-Email-Deliverability-101
		// POssible solution is to select client certificate:
		// http://electron.atom.io/docs/v0.36.0/api/app/#event-39-select-client-certificate-39

		var browserwindow = new browser({
			'web-preferences': { 'web-security': false },
			'width': 1000,
			'height': 800,
			'center': true
			// 'preload': path.join(__dirname, 'inject.js')
		});
		browserwindow.loadUrl(url);
		browserwindow.show();

		// browserwindow.on('page-title-updated', function(event) {
		// 	webContents = browserwindow.webContents;
		// 	if (!webContents.isDevToolsOpened()) {
		// 		webContents.openDevTools();
		// 	}
		// });

		browserwindow.on('closed', () => {
			callback(null, true);
		});
	}

	// Takes a String email address and sends an email to it in order to unsubscribe from the list
	// Returns a boolean indicating if the unsubscription was a success
	_unsubscribeViaMail(email_address, callback) {
		if (email_address) {
			console.log('Sending an unsubscription email to: ' + email_address);

			NylasAPI.makeRequest({
				path: '/send',
				method: 'POST',
				accountId: this._thread.accountId,
				body: {
					body: 'This is an automated unsubscription request. Please remove the sender of this email from all email lists.',
					subject: 'Unsubscribe',
					to: [{
						email: email_address
					}]
				},
				success: (body) => {
					// callback(null, true);
				},
				error: (error) => {
					// callback(error, false);
					console.error(error);
				}
			});

			// Temporary solution right now so that emails are trashed immediately
			// instead of waiting for the email to be sent.
			callback(null, true); 
		} else {
			callback(new Error("Invalid email address"), false);
		}
	}

	// Move the given thread to the trash
	// From Thread-List Package
	// https://github.com/nylas/N1/blob/master/internal_packages/thread-list/lib/thread-list.cjsx 
	_trashThread() {
		if (FocusedPerspectiveStore.current().canTrashThreads()) {
			if (this._thread) {
				tasks = TaskFactory.tasksForMovingToTrash({
					threads: [this._thread],
					fromPerspective: FocusedPerspectiveStore.current()
				});
				Actions.queueTasks(tasks);
			}
			Actions.popSheet();
		}
	}

	// Takes a parsed DOM (through cheerio) and returns sentences that contain links
	// Good at catching cases such as
	//    "If you would like to unsubscrbe from our emails, please click here."
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

