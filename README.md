# N1-Unsubscribe (Nylas Plugin)
[![Build Status](https://travis-ci.org/colinking/n1-unsubscribe.svg?branch=master)](https://travis-ci.org/colinking/n1-unsubscribe)
<a href="https://github.com/nylas/N1">
    <img src="https://img.shields.io/badge/nylas-0.4.38-brightgreen.svg"
         alt="nylas version">
</a>

Quickly unsubscribe from emails with the N1-Unsubscribe plugin for [Nylas N1](https://www.nylas.com/n1).

![UnsubscribePromoVideo](.github/UnsubscribePromoVideo.gif)

## The Plugin Magic

N1-Unsubscribe acts in one of two ways. First, it looks if it can unsubscribe via email. If it can, the plugin will send an unsubscribe request email on your behalf. Second, if no email is available, the plugin looks for a link in the body of the email, such as "click to unsubscribe." The plugin can then open the link in a mini-browser to complete the unsubscription without leaving Nylas. When unsubscribed, the email is then trashed or archived based on your selected option ([see settings below](https://github.com/colinking/n1-unsubscribe#settings)).

## How to install

<!-- [![Download n1-unsubscribe](https://cdn.rawgit.com/colinking/n1-unsubscribe/master/.github/download.svg)](https://github.com/colinking/n1-unsubscribe/raw/master/dist/n1-unsubscribe.zip) -->

1. Download and un-zip `n1-unsubscribe.zip` from the [Releases page](https://github.com/colinking/n1-unsubscribe/releases/latest).

2. In N1, Select the menu bar option `Developer > Install a Plugin...`, then select the unzipped folder, `n1-unsubscribe`

3. You should now see the plugin in the plugins pane in N1 (`Preferences > Plugins`).

![PluginsPage](.github/NylasPluginPane.png)

## Settings

Certain features for this package can be toggled by changing the appropriate settings from within `unsubscribe-settings.json`. The settings file isn't tracked, so once you edit it, your preferences will be saved even when updating. You can see the defulat file here: [`unsubscribe-settings.defaults.json`](https://github.com/colinking/n1-unsubscribe/blob/master/unsubscribe-settings.defaults.json).

To change any of these settings, first install the package and modify `~/.nylas/packages/unsubscribe-settings.json`. To update your settings in the app, just reload N1 (<kbd>Alt</kbd> + <kbd>Cmd</kbd> + <kbd>L</kbd> or `Developer > Reload`).

- **use_browser**: Toggle between opening web-based unsubscribe links in your native browser or an in-app pop-up window (default: pop-up).
- **handle_threads**: Toggle between automatically archiving, trashing or not moving your email anywhere after unsubscibing (default: archive).
- **confirm_for_email**: Toggle a confirmation box on or off before sending an automatic unsubscribe email (default: off).
- **confirm_for_browser**: Toggle a confirmation box on or off before opening a browser window to unsubscribe from an email (default: off).

More documentation of these toggles is available in the settings file.

## Reporting Bugs

- **Feature Requests or Bug Reports**: Submit them through the [issues pane][issues]
- **Mishandled Emails**: Find something that doesn't work (not finding an unsubscribe link, etc.)? Forward the email to us at <a href="mailto:n1.unsubscribe@gmail.com">n1.unsubscribe@gmail.com</a> and we will look into it

## Want to learn more?

Do you want to install via git? Want to learn more about how N1-Unsubscribe works? [Check out the extended guide](CONTRIBUTING.md)

## Made by
[Kyle King](http://kyleking.me) and [Colin King](http://colinking.co)

[issues]: https://github.com/colinking/n1-unsubscribe/issues
