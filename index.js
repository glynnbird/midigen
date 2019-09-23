
const midi = require('midi')
const chords = [
  [0, 4, 7, 12], // major
  [0, 3, 7, 12], // minor
  [0, 4, 7, 11], // major 7th
  [0, 3, 7, 10], // minor 7th
  [0, 3, 7, 10], // 7th
  [0, 4, 7, 8] // 6th
]

// the current key
let key = 64
let chord = chords[0]

const clock = function () {
  output.sendMessage([0xf8])
}

// play a MIDI note
const playNote = function (note, velocity, length, channel) {
  console.log('play note', channel, note, velocity, length)
  // note start
  const n = key + note
  // 10010000 (for channel 0) 10010001 (for channel 1)
  output.sendMessage([144 + channel, n, velocity])

  setTimeout(function () {
    // note end
    output.sendMessage([128 + channel, n, 0])
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
  .option('bpm', { alias: 'b', describe: 'Beats per minute', default: 120 })
  .option('database', { alias: 'db', describe: 'CouchDB database name', default: null })
  .help('help')
  .argv

// midi setup
console.log('opening 3 midi ports')
const output = new midi.output() // eslint-disable-line

// output.openPort(1)

// doesn't work on Mac where the USB ports are locked down
// console.log('MIDI channel', args.midi)
// output.getPortName(args.midi) // Output to physical device

// virtual port - shows up in GarageBand
output.openVirtualPort('VP') // virtual device

if (args.url && args.database) {
  console.log('Listening for changes on ', args.database)
  const nano = require('nano')(args.url)
  const ChangesReader = require('changesreader')
  const changesReader = new ChangesReader(args.database, nano.request)
  changesReader.start({ batchSize: 100 }).on('change', (c) => {
    const n = pickNote(chord)
    const velocity = 50 + Math.floor(Math.random() * 60)
    const length = 100 + Math.floor(Math.random() * 4000)
    const rev = parseInt(c.changes[0].rev.split('-')[0])

    if (rev > 1) {
      playNote(n, velocity, length, 2)
    } else if (c.deleted) {
      playNote(n, velocity, length, 1)
    } else {
      playNote(n, velocity, length, 0)
    }
  }).on('error', (e) => {
    console.error('error', e)
  })
} else {
  console.log('playing random notes every 250ms')
  // play a note every beat
  setInterval(function () {
    const n = pickNote(chord)
    const velocity = 50 + Math.floor(Math.random() * 60)
    const length = 100 + Math.floor(Math.random() * 4000)
    playNote(n, velocity, length, Math.floor(Math.random() * 3))
  }, 1000 / (args.bpm / 60))
}

// midi clock
console.log('BPM', args.bpm)
const beatsPerSecond = args.bpm / 60
const beatInterval = 1 / beatsPerSecond
const quarterNoteMS = 1000 * beatInterval / 4
console.log('Beat interval (ms)', quarterNoteMS)
setInterval(function () {
  clock()
}, quarterNoteMS)
