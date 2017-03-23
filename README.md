[![Build Status](https://travis-ci.org/AdoptOpenJDK/openjdk-website.svg?branch=master)](https://travis-ci.org/AdoptOpenJDK/openjdk-website)
# Readme

## https://openjdk.github.io/openjdk-website/index

See the [Contribution Guidelines](CONTRIBUTING.md).

---

## Using the releases API _(work in progress)_

> Note: the current version of the releases API is only suitable for in-browser use. You cannot yet use cURL or Wget to access the API.

You can use the following formats of URL extension after `http://adoptopenjdk.net/api` to return release data in JSON format:

### Platform filters:

`#platform=linux`

`#platform=windows`

`#platform=mac`

Example: `http://adoptopenjdk.net/api#platform=linux`

### Release search:

`#release=latest`

`#release=<release-name>` (e.g. `#release=jdk8u152-b01`)

Example: `http://adoptopenjdk.net/api#release=latest`

### Combination of the two:

Example: `http://adoptopenjdk.net/api#platform=linux&release=latest`

> Note: currently, the `platform` filter must appear before the `release` search in the string.
