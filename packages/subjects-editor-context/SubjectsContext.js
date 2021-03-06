import { Component, ScrollPane } from 'substance'
import { concat, filter, flattenDeep, map, sortBy } from 'lodash-es'
import SubjectSelector from './SubjectSelector'

class SubjectsContext extends Component {

  constructor(...args) {
    super(...args)

    this.handleActions({
      'showList': this._showList,
      'showEditor': this._showEditor
    })
  }

  didMount() {
    this.buildTree()
    if(this.props.topic) {
      this.highlightNodes(this.props.topic)
    }
  }

  willReceiveProps(newProps) {
    if(newProps.topic !== this.props.topic && newProps.topic !== undefined) {
      this.highlightNodes(newProps.topic)
    }
    if(newProps.mode !== this.props.mode) {
      this.buildTree()
    }
  }

  render($$) {
    let mode = this.props.mode

    if(mode === 'list') {
      return this.renderList($$)
    } else if (mode === 'edit' || mode === 'create') {
      return this.renderSubjectSelector($$)
    }
  }

  renderSubjectSelector($$) {
    let el = $$('div').addClass('sc-subjects-panel')

    el.append(
      $$(SubjectSelector, {configurator: this.props.configurator, node: this.props.item})
    )

    return el
  }

  renderList($$) {
    let subjects = this.state.subjects
    let subjectsPanel = $$(ScrollPane).ref('panelEl')
    let el = $$('div').addClass('sc-context-panel sc-subjects-panel').append(
      subjectsPanel
    )
    if(subjects) {
      let childNodes = subjects.getRoots()
      childNodes = sortBy(childNodes, ['position'])

      let childEls = childNodes.map(function(node) {
        return this.renderChildren($$, node, 1)
      }.bind(this))

      subjectsPanel.append(flattenDeep(childEls))
    }

    let TocEditor = this.getComponent('toc-editor')
    subjectsPanel.append($$(TocEditor))

    return el
  }

  buildTree() {
    let editorSession = this.context.editorSession
    let subjectsTree = editorSession.subjects
    let resources = editorSession.resources
    let subjects = filter(resources, {entityType: 'subject'})
    subjects.forEach(s => {
      subjectsTree.set([s.entityId, 'active'], true)
      let parents = subjectsTree.getParents(s.entityId)
      parents.forEach(pid => {
        subjectsTree.set([pid, 'active'], true)
      })
    })
    this.extendState({
      subjects: subjectsTree
    })
  }

  highlightNodes(activeNode) {
    let editorSession = this.context.editorSession
    let subjects = editorSession.subjects
    subjects.resetSelection()
    let activeNodes = subjects.getAllChildren(activeNode)
    activeNodes.unshift(activeNode)
    this.send('showTopics', activeNodes)
    this.setSelected(activeNode)
  }

  renderChildren($$, node, level) {
    let editorSession = this.context.editorSession
    let subjects = editorSession.subjects
    let isActive = node.active
    let childNodes = subjects.getChildren(node.id)
    childNodes = sortBy(childNodes, ['position'])
    let childrenEls = []

    if(isActive) {
      childrenEls = map(childNodes, function(сhildNode) {
        return this.renderChildren($$, сhildNode, level + 1)
      }.bind(this))

      let el = $$('span').addClass('se-tree-node se-level-' + level)
      .attr("href", '#topic=' + node.id)
      .append(node.name)
      .ref(node.id)
      .on('click', this.highlightNodes.bind(this, node.id))

      if(this.state.selected === node.id) {
        el.addClass('sm-active')
      }

      return concat(el, childrenEls);
    } else {
      return []
    }
  }

  setSelected(node) {
    this.extendState({selected: node})
    // let editorSession = this.context.editorSession
    // let subjects = editorSession.subjects
    // subjects.set([node, 'selected'], true)
    // this.rerender()
  }

  _showList() {
    this.send('resetBrackets', 'subject')
    this.send('switchContext', {mode: 'list'})
    //this.extendState({selected: undefined})
  }

  _showEditor(id) {
    this.send('resetBrackets', 'subject')
    this.send('switchContext', {mode: 'edit', item: id})
    //this.extendState({selected: undefined})
  }
}

export default SubjectsContext
