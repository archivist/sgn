import { async, Component, EditorSession, JSONConverter } from 'substance'
import Reader from './Reader'

const {series} = async
let converter = new JSONConverter()

class ReaderLayout extends Component {

  getInitialState() {
    return {
      session: null, // CollabSession will be stored here, if null indicates we are in loading state
      error: null, // used to display error messages e.g. loading of document failed
      notification: null //used to display status messages in topbar
    }
  }

  dispose() {
    if(this.state.session) {
      this.state.session.off(this)
      this.state.session.dispose()
    }
    document.body.classList.remove('sm-fixed-layout')
  }

  didMount() {
    // load the document after mounting
    this._loadDocument(this.getDocumentId())
  }

  willReceiveProps(newProps) {
    if (newProps.documentId !== this.props.documentId) {
      this.dispose()
      // TODO: Use setState instead?
      this.state = this.getInitialState()
      this._loadDocument(newProps.documentId)
    }

    if (newProps.entityId !== this.props.entityId && newProps.entityId !== undefined) {
      setTimeout(() => {
        this.refs.reader.highlightReferences([newProps.entityId])
      }, 10)
    }
  }

  _updateLayout() {
    if (this.props.mobile) {
      document.body.classList.remove('sm-fixed-layout')
    } else {
      document.body.classList.add('sm-fixed-layout')
    }
  }

  render($$) {
    let Layout = this.getComponent('layout')
    let Spinner = this.getComponent('spinner')

    let el = $$('div').addClass('sc-read-document')

    let main = $$(Layout, {
      width: 'medium',
      textAlign: 'center'
    }).addClass('se-loading').append(
      $$('div').addClass('se-cover'),
      $$(Spinner, {message: 'spinner-loading'})
    )

    this._updateLayout()

    if (this.state.session) {
      main = $$(Reader, {
        configurator: this.props.configurator,
        editorSession: this.state.session
      }).ref('reader')
    }

    el.append(main)

    return el
  }

  getDocumentId() {
    return this.props.documentId
  }

  /*
    Loads a document and initializes a Document Session
  */
  _loadDocument(documentId) {
    let configurator = this.props.configurator
    let documentClient = this.context.documentClient

    documentClient.getDocument(documentId, (err, docRecord) => {
      if (err) {
        this._onError(err)
        return
      }
      //let docRecord = SampleDoc
      let document = configurator.createDocument()
      let doc = converter.importDocument(document, docRecord.data)
      const meta = doc.getDocumentMeta()
      const respondentId = meta.interviewee

      let session = new EditorSession(doc, {
        configurator: configurator
      })

      // For debugging
      window.doc = doc
      window.session = session

      series([
        this._loadResources(documentId, session),
        this._loadSubjects(session),
        this._loadRespondent(respondentId, session)
      ], () => {
        this.setState({
          session: session
        })
      })
    })
  }

  _loadResources(documentId, session) {
    return function(cb) {
      this._loadDocumentResources(documentId, (err, resources) => {
        session.resources = resources
        cb()
      })
    }.bind(this)
  }

  /*
    Loads subjects tree data
  */
  _loadSubjects(session) {
    return function(cb) {
      let resourceClient = this.context.resourceClient
      let mainConfigurator = this.context.configurator
      let configurator = mainConfigurator.getConfigurator('archivist-subjects')

      resourceClient.getSubjects((err, res) => {
        if (err) {
          console.error('ERROR', err)
          return
        }

        let importer = configurator.createImporter('subjects')
        let subjects = importer.importDocument(res, true)

        session.subjects = subjects
        cb()
      })
    }.bind(this)
  }

  /*
    Loads document resources
  */
  _loadDocumentResources(documentId, cb) {
    let resourceClient = this.context.resourceClient
    resourceClient.getDocumentResources(documentId, cb)
  }

  _loadRespondent(respondentId, session) {
    const resourceClient = this.context.resourceClient
    return function(cb) {
      resourceClient.getRespondentData(respondentId, (err, respondent) => {
        session.respondent = respondent
        cb()
      })
    }
  }

  _onError(err) {
    console.error(err)
  }
}

export default ReaderLayout
