import React from 'react'
import { Component } from 'react'

const Post = props => {
  return (
    <div className='card'>
      <div className='card-content'>
        <div className='content'>{props.post}</div>
      </div>
    </div>
  )
}

const NewPost = () => {
  return (
    <>
      <textarea></textarea>
      <button>Create New Post</button>
    </>
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

const PostPage = () => {
  return (
    <div className='container'>
      <NewPost />
      <Posts />
    </div>
  )
}

export default PostPage
