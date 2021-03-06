import RespondentContext from './RespondentContext'

export default {
  name: 'archivist-reader-respondent',
  configure: function(config) {
    config.addContext('respondent-context', RespondentContext, true)
    config.addIcon('respondent-context', {'fontawesome': 'fa-user'})
    config.addLabel('respondent-context', {
      en: 'Respondent',
      ru: 'О респонденте'
    })
  }
}
