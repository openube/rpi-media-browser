import React from 'react'
const { object, func } = React.PropTypes
import Mousetrap from 'mousetrap'

import MediaItem from './MediaItem'
import 'styles/media-list.scss'

export default class MediaList extends React.Component {
  static get propTypes () {
    return {
      items: object.isRequired,
      actions: object.isRequired,
      filter: object.isRequired,
      handlePlay: func.isRequired,
    }
  }

  constructor () {
    super()
    this.state = {
      focusIndex: -1,
    }

    this.focusPrevItem = this.focusPrevItem.bind(this)
    this.focusNextItem = this.focusNextItem.bind(this)
  }

  componentDidMount () {
    Mousetrap.bind(['left'], this.focusPrevItem)
    Mousetrap.bind(['right'], this.focusNextItem)
    this.focusFirstItem()
  }

  componentWillUnmount () {
    Mousetrap.unbind(['left', 'right'])
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.items.size) {
      this.focusFirstItem()
    }
  }

  focusFirstItem () {
    if (this.props.items.size) {
      this.refs['item-0'].refs.cover.focus()
    }
  }

  focusNextItem () {
    const items = this.filterItems()
    const index = (this.state.focusIndex + 1) % items.size
    this.refs[`item-${index}`].refs.cover.focus()
  }

  focusPrevItem () {
    const items = this.filterItems()
    const index = (this.state.focusIndex + items.size - 1) % items.size
    this.refs[`item-${index}`].refs.cover.focus()
  }

  filterItems () {
    const filter = this.props.filter.toJS()

    return this.props.items.filter(item => {
      const matchesSearch = !filter.search || item.get('title').toLowerCase().indexOf(filter.search.toLowerCase()) !== -1
      const matchesCategory = filter.category === 'all' || item.get('categories').includes(filter.category)
      return matchesSearch && matchesCategory
    })
  }

  renderItems (items) {
    return items.map((item, i) => {
      return (
        <MediaItem
          key={item.hashCode() + i}
          ref={`item-${i}`}
          item={item}
          handlePlay={() => this.props.handlePlay(item.getIn(['mediaFiles', 0]))}
          handleFocus={() => this.setState({ focusIndex: i })}
        />
      )
    })
  }

  renderContent () {
    const items = this.filterItems()

    if (items.size) {
      return this.renderItems(items)
    } else {
      return (
        <p>No items found</p>
      )
    }
  }

  render () {
    return (
      <div className='media-list'>
        {this.renderContent()}
      </div>
    )
  }
}
