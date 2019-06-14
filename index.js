const printify = require('@ipld/printify')
const Block = require('@ipld/block')
const CID = require('cids')
const path = require('path')
const { writeFile, readFile } = require('fs').promises

const log = (msg, args) => {
  if (!args.silent) console.log(msg)
}

const createPut = args => async block => {
  if (!args.storage) return
  let cid = await block.cid()
  let f = path.join(args.storage, cid.toString())
  return writeFile(f, block.encode())
}

const createGet = args => async cid => {
  if (!args.storage) throw new Error('No storage configured')
  let f = path.join(args.storage, cid.toString())
  let block = Block.create(await readFile(f), cid)
  if (!await block.validate()) throw new Error('Failed block validation')
  return block
}

const printBlock = async (block, args) => {
  let cid = await block.cid()
  if (block.codec === 'raw') {
    log(`Block: RAW(${cid.toString()})`, args)
  } else {
    log(`Block (${cid.toString()}):\n ${printify(block.decode())}`, args)
  }
}

const encode = async args => {
  let put = createPut(args)
  let obj = JSON.parse(args.json)
  let block = Block.encoder(obj, args.codec)
  await printBlock(block, args) 
  await put(block)
  return block
}

const decode = async args => {
  let get = createGet(args)
  let cid = new CID(args.cid)
  let block = await get(cid)
  await printBlock(block, args)
}

const defaults = (yargs, ...required) => {
  yargs.env('IPLD')
  yargs.option('codec', {
    desc: 'Codec to be used for any data encoding.',
    default: 'dag-json'
  })
  yargs.option('silent', {
    desc: 'Do not print block encodings'
  })
  yargs.option('storage', {
    desc: 'Storage backend. Currently only supports filesystem. Example: "/tmp/storage"',
    default: process.env.IPLD_STORAGE,
    required: required.includes('storage')
  })
}

exports.defaults = defaults
exports.encode = encode
exports.decode = decode
exports.log = log
exports.createGet = createGet
exports.createPut = createPut
