SHELL=/bin/bash
REPORTER ?= spec

all: test

test:
	@node ./tests/start.js --reporter $(REPORTER)

.PHONY: test

