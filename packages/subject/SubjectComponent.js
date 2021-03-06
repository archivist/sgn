import { Component } from 'substance'

class SubjectComponent extends Component {

  didMount() {
    let node = this.props.node
    node.anno.on('highlighted', this.onHighlightedChanged, this)
  }

  render($$) {
    let fragment = this.props.node
    let el = $$('span')
      .attr("data-id", fragment.id)
      .addClass('sc-'+fragment.anno.type)

    if (this.props.node.anno.highlighted) {
      el.addClass('sm-highlighted')
    }

    el.append(this.props.children)

    return el
  }

  onHighlightedChanged() {
    if (this.props.node.anno.highlighted) {
      this.el.addClass('sm-highlighted')
    } else {
      this.el.removeClass('sm-highlighted')
    }
  }
}

export default SubjectComponent