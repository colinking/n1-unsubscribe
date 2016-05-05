.PHONY: install, build

build:
	echo Building n1-unsubscribe for distribution to `pwd`/dist/n1-unsubscribe.zip
	git archive -o `pwd`/dist/n1-unsubscribe.zip @ &&
	echo n1-unsubscribe built successfully.

install:
	echo Installing n1-unsubscribe to ~/.nylas/packages/n1-unsubscribe
	rm -rf ~/.nylas/packages/n1-unsubscribe* &&
	git archive -o ~/.nylas/packages/n1-unsubscribe.zip @ &&
	pushd . &&
	mkdir ~/.nylas/packages/n1-unsubscribe &&
	cd ~/.nylas/packages/n1-unsubscribe &&
	unzip ../n1-unsubscribe.zip &&
	npm install &&
	rm ../n1-unsubscribe.zip &&
	popd &&
	echo n1-unsubscribe installed successfully.
