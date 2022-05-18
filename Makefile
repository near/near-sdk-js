
QUIET := @

all: setup build yarn

setup:
	$(QUIET)./setup.sh

build:
	$(QUIET)echo "Building jsvm.wasm..."
	$(QUIET)./build.sh

yarn:
	$(QUIET)yarn && cd sdk && yarn && cd ..

clean: clean-vendor clean-node

clean-vendor:
	$(QUIET)rm -rf vendor

clean-node:
	$(QUIET)rm -rf node_modules


.PHONY: all setup build yarn
.PHONY: clean clean-vendor clean-node
