.PHONY: install, build

PWD=$(shell pwd)
PACKAGE_NAME=n1-unsubscribe
PACKAGE_DIR=~/.nylas/packages/${PACKAGE_NAME}
LOCAL_DIST=${PWD}/dist/${PACKAGE_NAME}.zip

build:
	@echo "Building for distribution to ${LOCAL_DIST}"
	git archive -o ${LOCAL_DIST} @
	@echo "Built successfully."

install:
	@echo "Installing to ~/.nylas/packages/n1-unsubscribe"
	rm -rf ${PACKAGE_DIR}*
	@git archive -o ${PACKAGE_DIR}.zip @
	mkdir ${PACKAGE_DIR}
	@unzip ${PACKAGE_DIR}.zip -d ${PACKAGE_DIR} > /dev/null
	@cd ${PACKAGE_DIR} && npm install  > /dev/null && echo "NPM Packages installed."
	@rm ${PACKAGE_DIR}.zip
	@echo "Installed successfully."
