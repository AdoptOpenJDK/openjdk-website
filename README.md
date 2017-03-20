[![Build Status](https://travis-ci.org/AdoptOpenJDK/openjdk-website.svg?branch=master)](https://travis-ci.org/AdoptOpenJDK/openjdk-website)
# Readme

## https://openjdk.github.io/openjdk-website/index

See the [Contribution Guidelines](CONTRIBUTING.md).

---

## Using the releases API _(work in progress)_

You can use the following formats of URL extension after `<website>.com/api` to return release data in JSON format:

### Platform filters:

`#platform=linux`

`#platform=windows`

`#platform=mac`

Example: `https://openjdk.github.io/openjdk-website/api#platform=linux`

### Release search:

`#release=latest`

`#release=<release-name>` (e.g. `#release=jdk8u152-b01`)

Example: `https://openjdk.github.io/openjdk-website/api#release=latest`

### Combination of the two:

e.g. `#platform=linux&release=latest`

> Note: currently, the `platform` filter must appear before the `release` search in the string, i.e. the example.
