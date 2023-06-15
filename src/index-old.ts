// import cors from 'cors'
// import express, { Request, Response } from 'express'
// import ffmpeg from 'fluent-ffmpeg'
// import fs from 'fs'
// const port = 8000
// const app = express()
// app.use(express.json())
// app.use(cors())
// // const videoPath = 'stream_converted.flv'
// // app.post('/convert', (req: Request, res: Response) => {
// //   const inputRTMPLink = req.body.rtmpLink
// //   const outputFLVLink = 'http://localhost:8000/live/livestream.flv'
// //   res.setHeader('Content-Type', 'video/x-flv')
// //   fs.unlinkSync('stream_converted.flv')
// //   ffmpeg(inputRTMPLink)
// //     .outputOptions(['-c:v copy', '-c:a copy', '-f flv'])
// //     .outputFormat('flv')
// //     .on('error', (err) => {
// //       console.error('Error transcoding stream:', err)
// //       res.status(500).send('Error transcoding stream')
// //     })
// //     .on('end', () => {
// //       console.log('Transcoding complete')
// //       res.status(200).json({ mp4Link: outputFLVLink })
// //     })
// //     .on('stderr', (stderrLine) => {
// //       console.log('FFmpeg stderr:', stderrLine)
// //     })
// //     .on('progress', (progress) => {
// //       console.log('Transcoding progress:', progress)
// //       // res.status(200).json({ hasLivestream: true })
// //     })
// //     .saveToFile('stream_converted.flv')
// //     .on('stdout', (stdout) => {
// //       console.log('Transcoding stdout:', stdout)
// //     })
// //     .output(outputFLVLink) // Specify the output file
// //     .run()
// // })

// // app.get('/live/livestream.flv', function (req: Request, res: Response) {
// //   const range = req.headers.range || ''
// //   if (!range) {
// //     res.status(400).send('Requires Range header')
// //   }
// //   const videoSize = fs.statSync(videoPath).size
// //   const CHUNK_SIZE = 10 ** 6
// //   const start = Number(range.replace(/\D/g, ''))
// //   const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
// //   const contentLength = end - start + 1
// //   const headers = {
// //     'Content-Range': `bytes ${start}-${end}/${videoSize}`,
// //     'Accept-Ranges': 'bytes',
// //     'Content-Length': contentLength,
// //     'Content-Type': 'video/flv-x'
// //   }
// //   res.writeHead(206, headers)
// //   const videoStream = fs.createReadStream(videoPath)
// //   videoStream.pipe(res)
// // })

// const inputUrl = 'rtmp://175.178.176.194:1925/live/106'
// const outputFilePath = 'output'
// app.post('/convert', function (req: Request, res: Response) {
//   const inputRTMPLink = req.body.rtmpLink
//   fs.truncate(`${outputFilePath}.flv`, 0, (err) => {
//     if (err) {
//       console.error('An error occurred while clearing the file:', err)
//     } else {
//       console.log('File cleared successfully!')
//     }
//   })
//   // fs.unlinkSync(`${outputFilePath}.flv`)
//   ffmpeg(inputRTMPLink)
//     .outputOptions(['-c:v copy', '-c:a copy', '-f flv'])
//     .outputFormat('flv')
//     .on('error', (err) => {
//       console.error('Error transcoding stream:', err)
//     })
//     .on('end', () => {
//       console.log('Transcoding complete')
//     })
//     .on('stderr', (stderrLine) => {
//       console.log('FFmpeg stderr:', stderrLine)
//     })
//     .on('progress', (progress) => {
//       console.log('Transcoding progress:', progress)
//       const videoSize = fs.statSync(`${outputFilePath}.flv`)
//     })
//     .saveToFile(`${outputFilePath}.flv`)
//     .on('stdout', (stdout) => {
//       console.log('Transcoding stdout:', stdout)
//     })
//     .output(`http://localhost:8000/live/${outputFilePath}.flv`)
//     .run()
// })

// // app.get(`/live/${outputFilePath}.flv`, (req, res) => {
// //   const readStream = fs.createReadStream(`${outputFilePath}.flv`)
// //   const range = req.headers.range || ''
// //   if (!range) {
// //     res.status(400).send('Requires Range header')
// //   }
// //   const videoSize = fs.statSync(`${outputFilePath}.flv`).size
// //   const CHUNK_SIZE = 10 ** 6
// //   const start = Number(range.replace(/\D/g, ''))
// //   const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
// //   const contentLength = end - start + 1
// //   const headers = {
// //     'Content-Range': `bytes ${start}-${end}/${videoSize}`,
// //     'Accept-Ranges': 'bytes',
// //     'Content-Length': contentLength,
// //     'Content-Type': 'video/flv-x'
// //   }
// //   readStream.on('open', () => {
// //     res.writeHead(206, headers)
// //     readStream.pipe(res)
// //   })

// //   readStream.on('error', (err) => {
// //     res.statusCode = 500
// //     res.end(err)
// //   })
// // })

// app.get(`/live/${outputFilePath}.flv`, function (req: Request, res: Response) {
//   const range = req.headers.range || ''
//   if (!range) {
//     res.status(400).send('Requires Range header')
//   }
//   const videoSize = fs.statSync(`${outputFilePath}.flv`).size
//   const CHUNK_SIZE = 10 ** 6
//   const start = Number(range.replace(/\D/g, ''))
//   const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
//   const contentLength = end - start + 1
//   const headers = {
//     'Content-Range': `bytes ${start}-${end}/${videoSize}`,
//     'Accept-Ranges': 'bytes',
//     'Content-Length': contentLength,
//     'Content-Type': 'video/flv-x',
//     'Access-Control-Allow-Origin': '*'
//   }
//   // res.writeHead(206, headers)
//   const videoStream = fs.createReadStream(`${outputFilePath}.flv`)
//   videoStream.pipe(res)
// })

// // Start the Express.js server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}/`)
// })

//=================================
import { spawn, SpawnOptions } from 'child_process'
import { EventEmitter } from 'events'
import express, { Response } from 'express'
import fs from 'fs'
import cors from 'cors'

const port = 8000
const app = express()
app.use(express.json())
app.use(cors())
const config = {
  port,
  url: 'rtmp://175.178.176.194:1925/live/106'
}

const Emitters: { [key: string]: any } = {}
const firstChunks: { [key: string]: any } = {}

const initEmitter = function (feed: any) {
  if (!Emitters[feed]) {
    Emitters[feed] = new EventEmitter().setMaxListeners(0)
  }
  return Emitters[feed]
}

const initFirstChunk = function (feed: any, firstBuffer?: any) {
  if (!firstChunks[feed]) {
    firstChunks[feed] = firstBuffer
  }
  return firstChunks[feed]
}

const outputFilePath = 'output'
app.get(`/live/${outputFilePath}.flv`, function (req: any, res: Response) {
  console.log('call api live')
  fs.truncate(`${outputFilePath}.flv`, 0, (err) => {
    if (err) {
      console.error('An error occurred while clearing the file:', err)
    } else {
      console.log('File cleared successfully!')
    }
  })
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

ffmpeg.on('close', function (buffer: any) {
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
// ====================== OLD ==========================
