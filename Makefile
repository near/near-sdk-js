
.ONESHELL: # Applies to every targets in the file!
QUIET := @

OS = $(shell uname -s)
ARCH = $(shell uname -m)

all: setup build yarn

setup:
	cd jsvm && ./setup.sh && cd ..

build: jsvm qjsc

jsvm:
	echo "Building jsvm.wasm..."
	cd jsvm && ./build.sh && cd ..
	cp jsvm/jsvm.wasm res/jsvm.wasm

qjsc:
	echo "Building qjsc bytecode compiler"
	cd quickjs && ./build.sh && cd ..
	cp quickjs/qjsc res/$(OS)-$(ARCH)-qjsc

yarn:
	$(QUIET)yarn

clean: clean-vendor clean-node

clean-vendor:
	$(QUIET)rm -rf jsvm/vendor

clean-node:
	$(QUIET)rm -rf node_modules


.PHONY: all setup build yarn
.PHONY: jsvm qjsc
.PHONY: clean clean-vendor clean-node
