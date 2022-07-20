var fs = require('fs')
var _ = require('lodash')
var path = require('path')
var cruncher = require('./lib/cruncher-n163.js')
var flags = require('flags')

// define flags
flags.defineBoolean('normalize', false, 'Normalize the wave?')
flags.defineBoolean('channel', 0, 'Channel for data?')
flags.defineBoolean('linear', false, 'Linear interpolation?')
flags.defineBoolean('exp', false, 'Exponential interpolation?')
flags.defineBoolean('analyze', false, 'Analyze pitch')
flags.defineString('output', '', 'Output filename')

// check usage
if (process.argv.length < 4) {
  console.log(`Usage: crunch [SOUND.WAV] [NOTE|BASE FREQUENCY|auto]
  Optional flags
  --linear|--exp: choose waveform interpolation
  --normalize: normalize waveform prior to crunching
  --channel=0: choose channel 0 or 1 for stereo wave file
  --output=filename: provide output filename
  --analyze: analyze waveform only, do not output .snt file`)
  process.exit(1)
}
// parse flags
flags.parse(process.argv.slice(4))

// log
console.log("Crunching data...")
// crunch
var synthdata = cruncher(process.argv[2], process.argv[3], {
  normalize: flags.get('normalize'),
  channel: flags.get('channel'),
  linear: flags.get('linear'),
  exp: flags.get('exp')
})

// log
var analyze = flags.get('analyze')
var output = flags.get('output')
if (output.length < 1) {
	var filename = path.basename(process.argv[2], path.extname(process.argv[2])) + '.fti'
} else {
	var filename = output
}
// creating buffer
var buf1 = Buffer.from('FTI2.4', 'utf-8');
var buf2 = Buffer.from("\x05\x00\x00\x00\x00\x05\x00\x00\x00\x00\x01\x10\x00\x00\x00\x0F\x00\x00\x00\xFF\xFF\xFF\xFF\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F\x10\x20\x00\x00\x00\x00\x00\x00\x00\x10\x00\x00\x00\x00", "binary")
/*
var bufd = Buffer.from(_.map(_.chunk(synthdata, 2), function (chunk) {
  return _.reduce(chunk, function(cur, oth) {
    return (cur << 4) + oth
  }, 0)
}))
*/
var bufd = Buffer.from(synthdata)
bufarr = [buf1, buf2, bufd]
var buf = Buffer.concat(bufarr);

if (!analyze) {
console.log("Saving data as " + filename + "...")

// save buff
fs.writeFile(path.dirname(process.argv[2]) + "/" + filename, buf, function(err) {
  // error
  if (err) {
    console.log("Error : " + err)
    process.exit(1)
  } else {
    console.log("Successfully output " + filename + "!")
  }
})
}

// done
console.log('Done!')
