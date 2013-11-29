SHELL=/bin/bash

.PHONY: all clean configure deinstall install

configure:
uninstall:
clean:
	# Clean logs
	@eval `find ./var/log -type f -name '*.log' | awk '{print "echo \"\033[0;31mremove \033[0m" $$0 "\" && rm " $$0 ";"}'`

install: configure
	##### Install backend vendor packages #####
	@npm install

	##### Install frontend vendor packages #####
	@bower install

