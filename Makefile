.PHONY: install, build, uninstall, install-dev

PWD=$(shell pwd)
PACKAGE_NAME=n1-unsubscribe
PACKAGE_DIR=~/.nylas/packages/${PACKAGE_NAME}
DEV_PACKAGE_DIR=~/.nylas/dev/packages/${PACKAGE_NAME}

ZIP=${PACKAGE_NAME}.zip
DIST_DIR=${PWD}/dist/
LOCAL_ARCHIVE=${DIST_DIR}${ZIP}
TEMP_DIST=${PWD}/dist/${PACKAGE_NAME}

build:
	@# @mkdir -p ${DIST_DIR}
	@# @mkdir -p ${TEMP_DIST}
	@echo "Building for distribution to ${LOCAL_ARCHIVE}"
	git archive -o ${LOCAL_ARCHIVE} @
	@# @echo "Unzipping and running APM INSTALL."
	@# @cd ${TEMP_DIST}; unzip ${LOCAL_ARCHIVE} > /dev/null; apm install
	@# @rm -rf ${LOCAL_ARCHIVE}
	@# @echo "Re-Zipping for Distribution."
	@# @cd ${DIST_DIR}; zip -r ${ZIP} ${PACKAGE_NAME} > /dev/null
	@# @rm -rf ${TEMP_DIST}
	@echo "Built successfully."
	@echo "WARN: Make sure to incrememnt the package.json version."

install:
	@echo "Installing to ${PACKAGE_DIR}"
	rm -rf ${PACKAGE_DIR}*
	@git archive -o ${PACKAGE_DIR}.zip @
	mkdir ${PACKAGE_DIR}
	@unzip ${PACKAGE_DIR}.zip -d ${PACKAGE_DIR} > /dev/null
	@cd ${PACKAGE_DIR} && npm install  > /dev/null && echo "NPM Packages installed."
	@rm ${PACKAGE_DIR}.zip
	@echo "Installed successfully."

install-dev:
	@echo "Installing to ${DEV_PACKAGE_DIR}"
	@cd ${DEV_PACKAGE_DIR} && npm install  > /dev/null && echo "NPM Packages installed."
	@echo "Installed successfully."

uninstall:
	@echo "Uninstalling from ${PACKAGE_DIR}"
	rm -rf ${PACKAGE_DIR}*
	@echo "Uninstalled successfully."
