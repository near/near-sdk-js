
.ONESHELL: # Applies to every targets in the file!
QUIET := @

OS = $(shell uname -s)
ARCH = $(shell uname -m)

all: build

build: binarien qjsc wasi-sdk

binarien:
	echo "Building binarien..."
	# TODO
qjsc:
	echo "Building qjsc bytecode compiler"
	cd quickjs && ./build.sh && cd ..
	cp quickjs/qjsc artifacts/qjsc/$(OS)-$(ARCH)-qjsc

wasi-sdk:
	echo "Building wasi-sdk..."
	cd wasi-sdk && ./build.sh && cd ..
	cp wasi-sdk/wasi-sdk artifacts/wasi-sdk/$(OS)-$(ARCH)-wasi-sdk #TODO

clean: clean-binaryen clean-qjsc clean-wasi-sdk

clean-binaryen:
	$(QUIET)rm -rf vendor # TODO

clean-qjsc:
	$(QUIET)rm -rf vendor # TODO

clean-wasi-sdk:
	$(QUIET)rm -rf vendor # TODO

.PHONY: all build yarn
.PHONY: jsvm qjsc
.PHONY: clean clean-vendor clean-node
