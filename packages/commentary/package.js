import CommentaryReference from './CommentaryReference'
import CommentaryComponent from './CommentaryComponent'
import CommentaryCommand from './CommentaryCommand'
import CommentaryContextItem from './CommentaryContextItem'

export default {
  name: 'commentary',
  configure: function(config) {
    config.addNode(CommentaryReference)
    config.addCommand(CommentaryReference.type, CommentaryCommand, { nodeType: CommentaryReference.type })
    config.addIcon(CommentaryReference.type, {'fontawesome': 'fa-comments'})
    config.addComponent('commentary', CommentaryComponent)
    config.addContextItem('commentary', CommentaryContextItem)
    config.addLabel('commentary-resources', {
      en: 'Commentaries',
      ru: 'Комментарии'
    })
    config.addLabel('commentary', {
      en: 'Commentary',
      ru: 'Комментарий'
    })
    config.addLabel('commentary-default-name', {
      en: 'Unknown Commentary',
      ru: 'Безымянный комментарий'
    })
    config.addLabel('commentary-name-placeholder', {
      en: 'Enter name',
      ru: 'Введите заголовок'
    })
    config.addLabel('commentary-description-placeholder', {
      en: 'Enter description',
      ru: 'Введите комментарий'
    })
  }
}
