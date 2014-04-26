SHELL=/bin/bash
REPORTER ?= spec

all: test

test: test-unit test-integration

test-unit:
	@node ./tests/start.js --type unit --reporter $(REPORTER)

test-integration:
	@node ./tests/start.js --type integration --reporter $(REPORTER)

.PHONY: test test-unit test-integration

