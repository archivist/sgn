let ArchivistDocumentEngine = require('archivist-js').DocumentEngine
let Err = require('substance').SubstanceError
let filter = require('lodash/filter')
let forEach = require('lodash/forEach')
let isEmpty = require('lodash/isEmpty')
let map = require('lodash/map')

class DocumentEngine extends ArchivistDocumentEngine {

  listDocuments(args, cb) {
    let filters = !isEmpty(args.filters) ? JSON.parse(args.filters) : {}
    let options = !isEmpty(args.options) ? JSON.parse(args.options) : {}
    let results = {}

    if(!options.columns) options.columns = ['"documentId"', '"schemaName"', '"schemaVersion"', "meta", "title", "language", '"updatedAt"', '(SELECT name FROM users WHERE "userId" = "updatedBy") AS "updatedBy"', '"userId"', '"references"']

    let topics = filters.topics ? filters.topics : []
    delete filters.topics
    if(!isEmpty(topics)) {
      filters['"references" ?&'] = topics
    }

    this.documentStore.countDocuments(filters, function(err, count) {
      if(err) {
        return cb(new Err('ArchivistDocumentEngine.ListDocumentsError', {
          cause: err
        }))
      }
      results.total = count
      this.documentStore.listDocuments(filters, options, function(err, docs) {
        if(err) {
          return cb(new Err('ArchivistDocumentEngine.ListDocumentsError', {
            cause: err
          }))
        }
        forEach(docs, (doc, i) => {
          let docTopics = {}
          forEach(topics, topic => {
            docTopics[topic] = doc.references[topic]
          })
          docs[i].topics = docTopics
          delete doc.references
        })

        results.records = docs

        cb(null, results)
      })
    }.bind(this))
  }

  /*
    Get list of dictinct values for metadata property
  */
  getMetaDataOptions(prop) {
    let query = `
      SELECT DISTINCT ON (meta->$1) meta->$1 AS value
      FROM documents
    `

    return new Promise((resolve, reject) => {
      this.db.run(query, [prop], (err, options) => {
        if (err) {
          return reject(new Err('DocumentEngine.GetMetaDataOptions', {
            cause: err
          }))
        }

        let filtered = filter(options, o => { return !isEmpty(o.value) && o.value !== null })
        let values = map(filtered, opt => { return opt.value })

        resolve(values)
      })
    })
  }
}

module.exports = DocumentEngine
