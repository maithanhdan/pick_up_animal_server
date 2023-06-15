import { spawn, SpawnOptions } from 'child_process'
import { EventEmitter } from 'events'
import express, { Response } from 'express'
// import fs from 'fs'
import cors from 'cors'

import dotenv from 'dotenv'
dotenv.config()

const port = process.env.PORT
const app = express()
app.use(express.json())
app.use(cors())
const config = {
  port,
  url: process.env.LINK_LIVESTREAM
}

const Emitters: { [key: string]: EventEmitter } = {}
const firstChunks: { [key: string]: Buffer } = {}

const initEmitter = function (feed: string | number) {
  if (!Emitters[feed]) {
    Emitters[feed] = new EventEmitter().setMaxListeners(0)
  }
  return Emitters[feed]
}

const initFirstChunk = function (feed: string | number, firstBuffer?: Buffer): Buffer | undefined {
  if (!firstChunks[feed] && firstBuffer) {
    firstChunks[feed] = firstBuffer
  }
  return firstChunks[feed]
}

const outputFilePath = 'output'
app.get(`/live/${outputFilePath}.flv`, function (req: any, res: Response) {
  console.log('call api live')
  // Default to first feed
  if (!req.params.feed) {
    req.params.feed = '1'
  }
  // Get emitter
  req.Emitter = initEmitter(req.params.feed)

  // Variable name of contentWriter
  let contentWriter: (buffer: Buffer) => void
  // Set headers
  res.setHeader('Content-Type', 'video/x-flv')
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Write first frame on stream
  const firstChunk = initFirstChunk('1')
  if (firstChunk) {
    res.write(firstChunk)
  }

  // Write new frames as they happen
  req.Emitter.on(
    'data',
    (contentWriter = (buffer: Buffer) => {
      res.write(buffer)
    })
  )

  // Remove contentWriter when client leaves
  res.on('close', function () {
    if (req.Emitter) {
      req.Emitter.removeListener('data', contentWriter)
      // fs.truncate(`${outputFilePath}.flv`, 0, (err) => {
      //   if (err) {
      //     console.error('An error occurred while clearing the file:', err)
      //   } else {
      //     console.log('File cleared successfully!')
      //   }
      // })
    }
  })
})
// FFMPEG
console.log('Starting FFMPEG')
const ffmpegString = `-i ${config.url} -c:v copy -an -f flv pipe:1`
const ffmpegOptions: SpawnOptions = {}
if (ffmpegString.indexOf('rtmp://') > -1) {
  ffmpegOptions.shell = true
}
console.log(`Executing: ffmpeg ${ffmpegString}`)
const ffmpeg: any = spawn('ffmpeg', ffmpegString.split(' '), {
  stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
  ...ffmpegOptions
})

ffmpeg.on('close', function (buffer: Buffer) {
  console.log('ffmpeg died')
  initFirstChunk(1, buffer)
  initEmitter(1).emit('data', buffer)
})

// Data from pipe:1 output of ffmpeg
ffmpeg.stdio[1].on('data', function (buffer: Buffer) {
  initFirstChunk('1', buffer)
  initEmitter('1').emit('data', buffer)
})

// Start the Express.js server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})
// ====================== OLD ==========================//
