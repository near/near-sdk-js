
.ONESHELL: # Applies to every targets in the file!
QUIET := @

OS = $(shell uname -s)
ARCH = $(shell uname -m)

build: binaryen qjsc wasi-sdk

binaryen:
	echo "Building binaryen..."
	cd binaryen && ./clone-and-build.sh
qjsc:
	echo "Building qjsc bytecode compiler"
	cd quickjs && ./build.sh && cd ..
	cp quickjs/qjsc artifacts/qjsc/$(OS)-$(ARCH)-qjsc

wasi-sdk:
	echo "Loading wasi-sdk..."
	cd wasi-sdk && ./load-wasi-sdk.sh

clean: clean-binaryen clean-qjsc clean-wasi-sdk

clean-binaryen:
	echo "Cleaning binaryen..."
	$(QUIET)rm -rf binaryen/binaryen
	$(QUIET)rm artifacts/binaryen/libbinaryen.so
	$(QUIET)rm artifacts/binaryen/wasi-stub

clean-qjsc:
	echo "Cleaning qjsc..."
	rm artifacts/qjsc/$(OS)-$(ARCH)-qjsc

clean-wasi-sdk:
	echo "Deleting wasi-sdk..."
	rm -rf wasi-sdk/$(OS)

.PHONY: build binaryen qjsc wasi-sdk
.PHONY: clean clean-binaryen clean-qjsc clean-wasi-sdk
