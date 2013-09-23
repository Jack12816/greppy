REPORTER ?= list

define print
	@echo -e "\n  \E[0;33m${1} \E[0m..";
endef

define md2html
	$(call print,"Prepare ${1} chapter")
    @echo
	@cd "docs/${1}"; \
	echo > "../chaper_${1}.md"; \
	for file in $$(find . -regex ".*\.\(md\)" 2>/dev/null | sort); do \
		echo "    $${file}"; \
		cat "$${file}" >> "../chaper_${1}.md"; \
	done; \
	marked --gfm --tables --lang-prefix "" "../chaper_${1}.md" > "../chaper_${1}.html";
endef

all: test docs

test:
	@node ./tests/start.js --reporter $(REPORTER)

docs: clean docs-md docs-api
	$(call print,"Generate documentation")

docs-md:
	$(call md2html,"guide")
	$(call md2html,"examples")

docs-api:
	@jsdoc -c ./docs/jsdoc.conf.json ./lib ./README.md

clean:
	$(call print,"Cleanup documentation files")
	@rm -f ./docs/*.html*
	@rm -f ./docs/chaper_*.md

.PHONY: test docs clean

