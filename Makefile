
.ONESHELL: # Applies to every targets in the file!
QUIET := @

OS = $(shell uname -s)
ARCH = $(shell uname -m)

all: build yarn

build: jsvm qjsc

jsvm:
	echo "Building jsvm.wasm..."
	cd jsvm && ./build.sh && cd ..

jsvm-nightly:
	echo "Building jsvm.wasm..."
	cd jsvm && NEAR_NIGHTLY=1 ./build.sh && cd ..

qjsc:
	echo "Building qjsc bytecode compiler"
	cd quickjs && ./build.sh && cd ..
	cp quickjs/qjsc cli/dependencies/qjsc/$(OS)-$(ARCH)-qjsc

yarn:
	$(QUIET)yarn

clean: clean-vendor clean-node

clean-vendor:
	$(QUIET)rm -rf vendor

clean-node:
	$(QUIET)rm -rf node_modules


.PHONY: all build yarn
.PHONY: jsvm qjsc
.PHONY: clean clean-vendor clean-node
