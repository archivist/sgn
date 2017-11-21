let fs = require('fs')
let config = require('config')
let multer = require('multer')
let uuid = require('substance').uuid

const serverConfig = config.get('server')
const destination = serverConfig.mediaEndpoint || './media'

/*
  Implements File Store API.
*/
class FileStore {
  constructor(config) {
    this.config = config

    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, config.destination || destination)
      },
      filename: (req, file, cb) => {
        let extension = file.originalname.split('.').pop()
        cb(null, uuid() + '.' + extension)
      }
    })
    this.uploader = multer({
      storage: this.storage
    })
  }

  /*
    Returns middleware for file uploading
  */
  getFileUploader(fieldName) {
    return this.uploader.single(fieldName)
  }

  /*
    Get name of stored file
  */
  getFileName(req) {
    return req.file.filename
  }

  deleteThumbs(sizes, file, cb) {
    let i = sizes.length
    sizes.forEach(size => {
      const thumbPath = destination + '/' + size + '/' + file
      fs.exists(thumbPath, exists => {
        let callback = function(err) {
          i--
          if (err) {
            cb(err)
            return
          } else if (i <= 0) {
            cb(null)
          }
        }
        if (exists) {
          return fs.unlink(thumbPath, callback)
        }
        return callback()
      })
    })
  }

  deleteFile(fileName, cb) {
    return this.deleteThumbs(['s200', 's400'], fileName, cb)
  }
}

module.exports = FileStore
