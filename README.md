## N1-Unsubscribe (Nylas Mail Plugin - *Beta* version)

![Unsubscribe: unsubscribe without leaving Nylas Mail](plugin.png)

Quickly unsubscribe from emails without leaving N1. The unsubscribe plugin parses the `list-unsubscribe` header and the email body to look for the best way to unsubscribe. If an unsubscribe email address can be found, the plugin will send one in the background on your behalf. If only a browser link is found, either a mini N1 browser window will open or for certain cases, you will be redirected to your default browser.

## How to install

1. Download and unzip `n1-unsubscribe.zip` from the [Releases page](https://github.com/colinking/n1-unsubscribe/releases/latest).

2. In Nylas Mail, Select the menu bar option `Developer > Install a Plugin...`, then select the unzipped folder, `n1-unsubscribe`

3. You should now see the plugin in the plugins pane in Nylas Mail (`Preferences > Plugins`).

## Keyboard Shortcuts

Press <kbd>CMD</kbd> + <kbd>ALT</kbd> + <kbd>U</kbd> when viewing an email. This shortcut can be changed in the preference panel (`Nylas->Preferences->Unsubscribe`).

## Reporting Bugs

- **Feature Requests or Bug Reports**: Submit them through the [issues](issues) pane.
- **Mishandled Emails**: Find an email which this plugin doesn't handle correctly? Not finding an unsubscribe link when there should be one? Forward the email to us at <a href="mailto:n1.unsubscribe@gmail.com">n1.unsubscribe@gmail.com</a> and we'll look into it.

## Nylas N1

Nylas Mail is the awaited update to Nylas N1, which included several critical breaking changes. To access the older version, see the legacy branch: [legacy-N1-support](https://github.com/colinking/n1-unsubscribe/tree/legacy-N1-support).

## Made by

[Kyle King](http://kyleking.me) and [Colin King](http://colinking.co)
