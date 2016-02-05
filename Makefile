all: build.js

build.js: deps
	npm run build

deps:
	npm install

clean:
	rm build.js

.PHONY: deps clean
