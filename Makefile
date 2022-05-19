
QUIET := @

all: setup build yarn

setup:
	 $(QUIET)$(cd jsvm && ./setup.sh && cd ..)

build: jsvm qjsc

jsvm:
	echo "Building jsvm.wasm..."
	$(QUIET)$(cd jsvm && ./build.sh && cd ..)
	cp jsvm/jsvm.wasm res/jsvm.wasm

qjsc:
	echo "Building qjsc bytecode compiler"
	$(QUIET)$(cd quickjs && ./build.sh && cd ..)
	cp quickjs/qjsc res/qjsc

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
