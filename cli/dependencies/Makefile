
.ONESHELL: # Applies to every targets in the file!
QUIET := @

OS = $(shell uname -s)
ARCH = $(shell uname -m)

build: binaryen

binaryen:
	echo "Building binaryen..."
	cd binaryen && ./clone-and-build.sh

clean: clean-binaryen clean-qjsc

clean-binaryen:
	echo "Cleaning binaryen..."
	$(QUIET)rm -rf binaryen/binaryen
	$(QUIET)rm artifacts/binaryen/libbinaryen.so
	$(QUIET)rm artifacts/binaryen/wasi-stub


.PHONY: build binaryen
.PHONY: clean clean-binaryen
