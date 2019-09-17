# midigen

Generates MIDI start/stop note messages in response to changes received from a Cloudant/CouchDB changes feed.

## Installation

Clone the repo and install the dependencies (Node.js required):

```sh
git clone https://github.com/glynnbird/midigen.git
cd midigen
npm install
```

## Prepare sound generator

Run GarageBand (free from the App Store) on your Mac. Create a new project and create a new track as a "Software Instrument":

![](midigen1.png)

## Run

To generate random notes:

```sh
node index.js
```

To trigger notes from a CouchDB/Cloudant changes feed, set up an environment variable with your URL in:

```sh
export COUCH_URL="https://user:pass@mycloudant.service.com"
```

and run `midigen` as follows:

```
node index.js --url "$COUCH_URL" --database mydatabase
```

Notes will be played as the data changes.

## Parameters

- `--bpm`/`-b` - number of beats per minute (Default `120`)
- `--url`/`-u` - the URL of the CouchDB service (Default: null)
- `--database`/`--db` - the name of the CouchDB database (Defaul: null)