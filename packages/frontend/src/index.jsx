import React from 'react'
import ReactDOM from 'react-dom'
import bulma from 'bulma'

const post = {
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. A mene tu? Qui potest igitur habitare in beata vita summi mali metus? Nihil opus est exemplis hoc facere longius. Sint ista Graecorum; Neque enim disputari sine reprehensione nec cum iracundia aut pertinacia recte disputari potest. Duo Reges: constructio interrete. Negare non possum.'
}
const posts = [post, post, post, post, post]

const Posts = props => {
  const posts = props.posts.map(post => <Post post={post} />)
  return <div>{posts}</div>
}

const Post = props => {
  return (
    <div className='card'>
      <div className='card-content'>
        <div className='content'>{props.post.content}</div>
      </div>
    </div>
  )
}

const App = () => {
  const p = posts.map((post, index) => {
    ;<p>{post.content}</p>
  })
  return (
    <div className='section'>
      <div className='container'>
        <h1>Foooo</h1>
        <Posts posts={posts} />
      </div>
    </div>
  )
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
