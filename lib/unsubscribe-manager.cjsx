{Actions,
 CategoryStore,
 TaskFactory,
 FocusedMailViewStore} = require 'nylas-exports'

class UnsubscribeManager
	@unsubscribe: (props) ->
		console.log("Unsubscribing...")
		# Trash the element if the unsubscribe was successful
		if true
		  task = TaskFactory.taskForMovingToTrash
		  	threads: [props.thread]
		  	fromView: FocusedMailViewStore.mailView()
		  Actions.queueTask(task)

module.exports = {UnsubscribeManager}