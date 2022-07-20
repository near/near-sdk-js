
.ONESHELL: # Applies to every targets in the file!
QUIET := @

OS = $(shell uname -s)
ARCH = $(shell uname -m)

build: binaryen qjsc

binaryen:
	echo "Building binaryen..."
	cd binaryen && ./clone-and-build.sh
qjsc:
	echo "Building qjsc bytecode compiler"
	cd quickjs && ./build.sh && cd ..
	cp quickjs/qjsc artifacts/qjsc/$(OS)-$(ARCH)-qjsc

clean: clean-binaryen clean-qjsc

clean-binaryen:
	echo "Cleaning binaryen..."
	$(QUIET)rm -rf binaryen/binaryen
	$(QUIET)rm artifacts/binaryen/libbinaryen.so
	$(QUIET)rm artifacts/binaryen/wasi-stub

clean-qjsc:
	echo "Cleaning qjsc..."
	rm artifacts/qjsc/$(OS)-$(ARCH)-qjsc

.PHONY: build binaryen qjsc
.PHONY: clean clean-binaryen clean-qjsc
