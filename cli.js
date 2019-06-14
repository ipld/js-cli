const cli = require('./')    

require('yargs') // eslint-disable-line
  .command({
    command: 'encode [json]',
    aliases: ['e', 'enc'],
    desc: 'Encode data into an IPLD block',
    handler: cli.encode,
    builder: yargs => {
      yargs.positional('json', {
        desc: 'JSON data to encode',
        required: true,
        demandOption: true
      })
      cli.defaults(yargs)
    }
  })
  .command({
    command: 'decode [cid]',
    aliases: ['d', 'dec'],
    desc: 'Decode [cid] from storage.',
    handler: cli.decode,
    builder: yargs => {
      cli.defaults(yargs, 'storage')
    }
  })
  .argv
