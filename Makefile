all: build.js

build.js: deps
	npm run build

deps:
	npm install

clean:
	-rm build.js pack.zip

pack: clean all
	zip pack.zip build.js *.png manifest.json
	du -h pack.zip

.PHONY: deps clean pack
