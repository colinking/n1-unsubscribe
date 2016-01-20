# n1-unsubscribe
This is a plugin for [Nylas N1](https://www.nylas.com/n1) that adds quick unsubscribe functionality. It is currently in a very early beta stage, and you *may* encounter issues while using it. If so, please report them [here as an issue][issues], so they can be fixed. Have a feature request or great idea? Also submit them through the issues pane and we will take a look as quickly as possible!

## Install this plugin

1. [Install N1](https://www.nylas.com/n1)

2. Download this repository by selecting [`Download ZIP`](https://github.com/colinking/n1-unsubscribe/archive/master.zip)

3. Unzip and rename the downloaded folder to `n1-unsubscribe` (If you forget to change the name, you may have a missing icon)

3. From the N1 menu, select `Developer > Install a Plugin Manually...`, then select the folder created in step 3 and the plugin will be installed!

### The Unsubscribe Button

When successfully unsubscribed, the button will display a check mark:

![SuccessIcon](/assets/unsubscribe-success%402x.png)

Otherwise, it will be waiting for its moment to shine:

![NormalIcon](/assets/unsubscribe%402x.png)

### Behind the Scenes

We use the list-unsubscribe header that is invisibly attached to most marketing emails. If there is no header, we scour the email body for the unsubscribe link or a phrase describing how to unsubscribe. Once a link is found, a mini browser will appear allowing you to quickly unsubscribe without leaving N1. When you close the browser window, the email will be trashed. An important note, if no unsubscribe action is available, the button will be hidden.

### Current Features

> Anywhere you interact with an email, we have a quick unsubscribe button for you

#### Bulk Action

(To Be Developed)

![BulkAction](README/BulkAction.png)

#### Quick Action

From the comfort of your inbox view, you can easily unsubscribe from an email by tapping the new icon alongside the trash and archive buttons that you are used to. If no unsubscribe action is available, the button will be hidden.

![QuickAction](README/QuickAction.png)

#### Menu Item

While reading an email you may realize that you would like to unsubscribe, so instead of scrolling to the bottom of the email and playing the *spot the unsubscribe link game*, which is [an actual game](http://spottheunsubscribe.tumblr.com/), you can press the obvious button at the top.

![MenuItem](README/MenuItem.png)

## Future Features of n1-unsubscribe 
- Better notification of in-progress unsubscribe
- Add a bulk-unsubscribe tool bar button that is enabled when selecting multiple emails
- Add tests and Travis CI and stricter linting?

## Made by
[Kyle King](http://kyleking.me) and [Colin King](http://colinking.co)

[Also StartupHealth is a great organization, they just happened to be at the top of my inbox](https://www.startuphealth.com/)

[issues]: https://github.com/colinking/n1-unsubscribe/issues