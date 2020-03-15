import React from 'react'
import { Component } from 'react'

const Post = props => {
  return (
    <article className='media'>
      <div className='media-content'>
        <div className='content'>{props.post}</div>
      </div>
    </article>
  )
}

const NewPost = () => {
  return (
    <article className='media'>
      <div className='media-content'>
        <div className='field'>
          <p className='control'>
            <textarea
              className='textarea'
              placeholder="What's on your mind"
              defaultValue={''}
            />
          </p>
        </div>
        <nav className='level'>
          <div className='level-left'></div>
          <div className='level-right'>
            <div className='level-item'>
              <a className='button is-primary' disabled={true}>
                Publish
              </a>
            </div>
          </div>
        </nav>
      </div>
    </article>
  )
}

class Posts extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    }
  }

  componentDidMount () {
    fetch('https://baconipsum.com/api/?type=meat-and-filler')
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            isLoaded: true,
            items: result
          })
        },
        error => {
          this.setState({
            isLoaded: true,
            error
          })
        }
      )
  }

  render () {
    const { error, isLoaded, items } = this.state
    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      return <div>Loading...</div>
    } else {
      return (
        <ul>
          {items.map((item, index) => (
            <Post key={index} post={item} />
          ))}
        </ul>
      )
    }
  }
}

export { Posts, NewPost }
