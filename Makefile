.PHONY: install, build, uninstall, install-dev

PWD=$(shell pwd)
PACKAGE_NAME=n1-unsubscribe
PACKAGE_DIR=~/.nylas/packages/${PACKAGE_NAME}
DEV_PACKAGE_DIR=~/.nylas/dev/packages/${PACKAGE_NAME}
LOCAL_DIST=${PWD}/dist/${PACKAGE_NAME}.zip

build:
	@echo "Building for distribution to ${LOCAL_DIST}"
	git archive -o ${LOCAL_DIST} @
	@echo "Built successfully."

install:
	@echo "Installing to ${PACKAGE_DIR}"
	rm -rf ${PACKAGE_DIR}*
	@git archive -o ${PACKAGE_DIR}.zip @
	mkdir ${PACKAGE_DIR}
	@unzip ${PACKAGE_DIR}.zip -d ${PACKAGE_DIR} > /dev/null
	@cd ${PACKAGE_DIR} && npm install  > /dev/null && echo "NPM Packages installed."
	@rm ${PACKAGE_DIR}.zip
	@echo "Installed successfully."

uninstall:
	@echo "Uninstalling from ${PACKAGE_DIR}"
	rm -rf ${PACKAGE_DIR}*
	@echo "Uninstalled successfully."
