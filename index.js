
const midi = require('midi')
const chords = [
  [0, 4, 7, 12], // major
  [0, 3, 7, 12], // minor
  [0, 4, 7, 11], // major 7th
  [0, 3, 7, 10], // minor 7th
  [0, 3, 7, 10], // 7th
  [0, 4, 7, 8] // 6th
]

// midi setup
const output = new midi.output() // eslint-disable-line

// doesn't work on Mac where the USB ports are locked down
// output.getPortName(0) // Output to physical device

// virtual port - shows up in GarageBand
output.openVirtualPort('VP') // virtual device

// the current key
let key = 64
let chord = chords[0]

// play a MIDI note
const playNote = function (note, velocity, length) {
  console.log('play note', note, velocity, length)
  // note start
  const n = key + note
  output.sendMessage([144, n, velocity])

  setTimeout(function () {
    // note end
    output.sendMessage([128, n, 0])
  }, length)
}

const changeKey = function () {
  key = 30 + Math.floor(Math.random() * 50)
}
const changeChord = function () {
  chord = chords[Math.floor(Math.random() * chords.length)]
}

const pickNote = function (chord) {
  const i = Math.floor(Math.random() * chord.length)
  const note = chord[i]
  return note + 12 * Math.floor(Math.random() * 3)
}

// change key every ten seconds
setInterval(function () {
  changeKey()
  changeChord()
}, 10000)

var args = require('yargs')
  .option('url', { alias: 'u', describe: 'COUCH_URL', default: null })
  .option('database', { alias: 'db', describe: 'CouchDB database name', default: null })
  .help('help')
  .argv

if (args.url && args.database) {
  console.log('Listening for changes on ', args.database)
  const nano = require('nano')(args.url)
  const ChangesReader = require('changesreader')
  const changesReader = new ChangesReader(args.database, nano.request)
  changesReader.start({ batchSize: 100 }).on('change', (c) => {
    const n = pickNote(chord)
    const velocity = 50 + Math.floor(Math.random() * 60)
    const length = 100 + Math.floor(Math.random() * 4000)
    playNote(n, velocity, length)
  }).on('error', (e) => {
    console.error('error', e)
  })
} else {
  console.log('playing random notes every 250ms')
  // play a note every 250ms
  setInterval(function () {
    const n = pickNote(chord)
    const velocity = 50 + Math.floor(Math.random() * 60)
    const length = 100 + Math.floor(Math.random() * 4000)
    playNote(n, velocity, length)
  }, 250)
}
