SHELL=/bin/bash
REPORTER ?= list

all: test

test:
	@node ./tests/start.js --reporter $(REPORTER)

.PHONY: test

