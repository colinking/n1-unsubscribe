const {
  Actions,
  TaskFactory,
  FocusedPerspectiveStore,
  NylasAPI,
} = require('nylas-exports');
const NylasStore = require('nylas-store');
const _ = require('underscore');
const cheerio = require('cheerio');
const BrowserWindow = require('electron').remote.BrowserWindow;
const MailParser = require('mailparser').MailParser;
const ThreadConditionType = require(`${__dirname}/enum/threadConditionType`);
const open = require('open');

class ThreadUnsubscribeStore extends NylasStore {
  constructor(thread) {
    super();

    // Enums
    this.LinkType = {
      EMAIL: 'EMAIL',
      BROWSER: 'BROWSER',
    };

    this.thread = thread;
    this.threadState = {
      id: this.thread.id,
      condition: ThreadConditionType.LOADING,
      hasLinks: false,
    }
    this.messages = this.thread.metadata;
    this.links = [];
    this.loadLinks();
  }

  // Checks if an unsubscribe link can be found in the email
  // Returns a boolean whether it is possible to unsubscribe
  canUnsubscribe() {
    return this.links.length > 0;
  }

  triggerUpdate() {
    this.trigger(this.threadState);
  }

  // Opens the unsubscribe link to unsubscribe the user
  // The optional callback returns: (Error, Boolean indicating whether it was a success)
  unsubscribe() {
    if (this.canUnsubscribe()) {
      const unsubscribeHandler = (error) => {
        if (!error) {
          this.moveThread();
          this.threadState.condition = ThreadConditionType.UNSUBSCRIBED;
        } else {
          this.threadState.condition = ThreadConditionType.ERRORED;
        }

        this.triggerUpdate();
      };

      // Determine if best to unsubscribe via email or browser:
      if (this.links[0].type === this.LinkType.EMAIL) {
        this.unsubscribeViaMail(this.links[0].link, unsubscribeHandler);
      } else {
        this.unsubscribeViaBrowser(this.links[0].link, unsubscribeHandler);
      }
    }
  }

  // Initializes the _links array by analyzing the headers and body of the current email thread
  loadLinks() {
    this.loadMessagesViaAPI((error, email) => {
      if (!error) {
        const headerLinks = this.parseHeadersForLinks(email.headers);
        console.log(this.thread.subject);
        console.log(this.thread);
        console.log("Header links:");
        console.log(headerLinks);
        const bodyLinks = this.parseBodyForLinks(email.html);
        console.log("Body links:");
        console.log(bodyLinks);
        this.links = this.parseLinksForTypes(bodyLinks.concat(headerLinks));
        this.threadState.hasLinks = (this.links.length > 0);
        this.threadState.condition = ThreadConditionType.DONE;
      } else {
        // TODO: Try again with the next email in the thread
        console.log(this.thread);
        console.warn(error);
        this.threadState.condition = ThreadConditionType.ERRORED;
      }
      this.triggerUpdate();
    });
  }

  // Makes an API request to fetch the data on the
  // NOTE: This will only make a request for the first email message in the thread,
  // instead of all messages based on the assumption that all of the emails in the
  // thread will have the unsubscribe link.
  // Callback: (Error, Parsed email)
  loadMessagesViaAPI(callback) {
    if (this.messages && this.messages.length > 0) {
      const messagePath = `/messages/${this.messages[0].id}`;
      if (!this.messages[0].draft) {
        NylasAPI.makeRequest({
          path: messagePath,
          accountId: this.thread.accountId,
          // Need raw email to get email headers (see: https://nylas.com/docs/#raw_message_contents)
          headers: {Accept: "message/rfc822"},
          json: false,
          success: (rawEmail) => {
            const mailparser = new MailParser();
            mailparser.on('end', (parsedEmail) => {
              callback(null, parsedEmail);
            });
            mailparser.write(rawEmail);
            mailparser.end();
          },
          error: (error) => {
            callback(error);
          },
        });
      } else {
        callback(new Error('Draft emails aren\'t parsed for unsubscribe links.'));
      }
    } else {
      callback(new Error('No messages found to parse for unsubscribe links.'));
    }
  }

  // Examine the email headers for the list-unsubscribe header
  parseHeadersForLinks(headers) {
    let unsubscribeLinks = [];
    if (headers && headers['list-unsubscribe']) {
      const rawLinks = headers['list-unsubscribe'].split(/,/g);
      unsubscribeLinks = _.map(rawLinks, (link) => {
        const trimmedLinks = link.trim();
        return trimmedLinks.substring(1, trimmedLinks.length - 1);
      });
    }
    return unsubscribeLinks;
  }

  // Parse the HTML within the email body for unsubscribe links
  parseBodyForLinks(emailHTML) {
    const unsubscribeLinks = [];
    if (emailHTML) {
      const $ = cheerio.load(emailHTML);
      // Get a list of all anchor tags with valid links
      let links = _.filter($('a'), (emailLink) => emailLink.href !== 'blank');
      links = links.concat(this.getLinkedSentences($));
      const regexps = [
        /unsubscribe/gi,
        /opt[ -]out/gi,
        /email preferences/gi,
        /subscription/gi,
      ];

      for (let j = 0; j < links.length; j++) {
        const link = links[j];
        for (let i = 0; i < regexps.length; i++) {
          const re = regexps[i];
          if (re.test(link.href) || re.test(link.innerText)) {
            unsubscribeLinks.push(link.href);
          }
        }
      }
    }
    return unsubscribeLinks;
  }

  // Given a list of unsubscribe links (Strings)
  // Returns a list of objects with a link and a LinkType
  // The returned list is in the same order as links,
  // except that EMAIL links are pushed to the front.
  parseLinksForTypes(links) {
    const newLinks = _.sortBy(_.map(links, (link) => {
      const type = (/mailto.*/g.test(link) ? this.LinkType.EMAIL : this.LinkType.BROWSER);
      const data = {link, type};
      if (type === this.LinkType.EMAIL) {
        const matches = /mailto:([^\?]*)/g.exec(link);
        if (matches && matches.length > 1) {
          data.link = matches[1];
        }
      }
      return data;
    }), (link) => {
      // Move email links to the front
      if (link.type === this.LinkType.EMAIL) {
        this.threadState.isEmail = true;
        return 0;
      }
      return 1;
    });
    return newLinks;
  }

  // Takes a String URL and unsubscribes by loading a browser window
  unsubscribeViaBrowser(url, callback) {
<<<<<<< HEAD
    if (process.env.N1_UNSUBSCRIBE_CONFIRM_BROWSER === 'false' ||
    confirm(`Are you sure that you want to unsubscribe?
A browser will be opened at: ${url}`)) {
      console.log(`Opening a browser window to: ${url}`);
=======
    if (process.env.n1UnsubscribeConfirmBrowser === 'false' ||
    confirm('Are you sure that you want to unsubscribe?' +
      `\nA browser will be opened at:\n${url}`)) {
      console.log(`Opening a browser window to:\n${url}`);
>>>>>>> f6a5a9c471256b7dd82e42e76cf26fdc6917befa
      // @ColinKing
      // URL's with the '/wf/click?upn=' lick tracking feature can't be opened
      // const re = /\/wf\/click\?upn=/gi;
      // if (re.test(url)) {
      // }
      if (process.env.N1_UNSUBSCRIBE_USE_BROWSER === 'true') {
        // Open the user's browser to the specific URL
        open(url);
        callback(null);
      } else {
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

        const browserWindow = new BrowserWindow({
          'web-preferences': { 'web-security': false },
          width: 1000,
          height: 800,
          center: true,
          // 'preload': path.join(__dirname, 'inject.js'),
        });

        browserWindow.on('closed', () => {
          callback(null, true);
        });

        // browserWindow.on('page-title-updated', function(event) {
        // 	webContents = browserWindow.webContents;
        // 	if (!webContents.isDevToolsOpened()) {
        // 		webContents.openDevTools();
        // 	}
        // });

        browserWindow.loadURL(url);
        browserWindow.show();
      }
    }
  }

  // Takes a String email address and sends an email to it in order to unsubscribe from the list
  unsubscribeViaMail(emailAddress, callback) {
    if (emailAddress) {
      if (process.env.N1_UNSUBSCRIBE_CONFIRM_EMAIL === 'false' ||
        confirm('Are you sure that you want to unsubscribe?' +
        `\nAn email will be sent to:\n${emailAddress}`)) {
        console.log(`Sending an unsubscription email to:\n${emailAddress}`);

        NylasAPI.makeRequest({
          path: '/send',
          method: 'POST',
          accountId: this.thread.accountId,
          body: {
            body: 'This is an automated unsubscription request. ' +
              'Please remove the sender of this email from all email lists.',
            subject: 'Unsubscribe',
            to: [{
              email: emailAddress,
            }],
          },
          success: () => {
            // callback(null);
          },
          error: (error) => {
            // callback(error);
            console.error(error);
          },
        });

        // Temporary solution right now so that emails are trashed immediately
        // instead of waiting for the email to be sent.
        callback(null);
      } else {
        callback(new Error('Did not confirm -- do not unsubscribe.'));
      }
    } else {
      callback(new Error(`Invalid email address (${emailAddress})`));
    }
  }

	// Move the given thread to the trash
	// From Thread-List Package
	// https://github.com/nylas/N1/blob/master/internal_packages/thread-list/lib/thread-list.cjsx
  moveThread() {
    if (this.thread) {
      if (process.env.N1_UNSUBSCRIBE_THREAD_HANDLING === 'trash') {
        // Trash the thread
        if (FocusedPerspectiveStore.current().canTrashThreads([this.thread])) {
          const tasks = TaskFactory.tasksForMovingToTrash({
            threads: [this.thread],
            fromPerspective: FocusedPerspectiveStore.current(),
          });
          Actions.queueTasks(tasks);
        }
      } else if (process.env.N1_UNSUBSCRIBE_THREAD_HANDLING === 'archive') {
        // Archive the thread
        if (FocusedPerspectiveStore.current().canArchiveThreads([this.thread])) {
          const tasks = TaskFactory.tasksForArchiving({
            threads: [this.thread],
            fromPerspective: FocusedPerspectiveStore.current(),
          });
          Actions.queueTasks(tasks);
        }
      }
      Actions.popSheet();
    }
  }

  // Takes a parsed DOM (through cheerio) and returns sentences that contain links
  // Good at catching cases such as
  //    "If you would like to unsubscrbe from our emails, please click here."
  // Returns a list of objects, each representing a single link
  // Each object contains an href and innerText property
  getLinkedSentences($) {
    // Get a unique list of parents to <a> tags
    const aParents = [];
    $('a').each((index, aTag) => {
      if (aTag) {
        if (!$(aParents).is(aTag.parent)) {
          aParents.unshift(aTag.parent);
        }
      }
    });

    const linkedSentences = [];
    $(aParents).each((parentIndex, parent) => {
      // console.log($(parent));
      let link = undefined;
      let leftoverText = "";
      if (parent) {
        $(parent.children).each((childIndex, child) => {
          // console.log(child);
          if ($(child).is($('a'))) {
            if (link !== undefined && leftoverText.length > 0) {
              linkedSentences.push({
                href: link,
                innerText: leftoverText,
              });
              leftoverText = "";
            }
            link = $(child).attr('href');
            // console.log("Found link: " + link);
          }
          const text = $(child).text();
          const re = /(.*\.|!|\?\s)|(.*\.|!|\?)$/g;
          // console.log("text: " + text);
          if (re.test(text)) {
            const splitup = text.split(re);
            // console.log(splitup);
            for (let i = 0; i < splitup.length; i++) {
              if (splitup[i] !== "" && splitup[i] !== undefined) {
                if (link !== undefined) {
                  const fullLine = leftoverText + splitup[i];
                  // console.log("FULL LINE: " + fullLine);
                  linkedSentences.push({
                    href: link,
                    innerText: fullLine,
                  });
                  link = undefined;
                  leftoverText = "";
                } else {
                  leftoverText += splitup[i];
                }
              }
            }
          } else {
            leftoverText += text;
            // console.log("leftoverText: " + leftoverText);
          }
          leftoverText += " ";
        });
      }
      // Case occures when an end of sentence is not found
      if (link !== undefined && leftoverText.length > 0) {
        linkedSentences.push({
          href: link,
          innerText: leftoverText,
        });
      }
    });
    // console.log(linkedSentences);
    return linkedSentences;
  }
}

module.exports = ThreadUnsubscribeStore;
