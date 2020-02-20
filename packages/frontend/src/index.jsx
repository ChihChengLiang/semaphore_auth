import React from 'react'
import ReactDOM from 'react-dom'
import bulma from 'bulma'
import Nav from './nav'
import { initStorage } from './storage'
import { Web3ReactProvider, getWeb3ReactContext } from '@web3-react/core'

const post = {
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. A mene tu? Qui potest igitur habitare in beata vita summi mali metus? Nihil opus est exemplis hoc facere longius. Sint ista Graecorum; Neque enim disputari sine reprehensione nec cum iracundia aut pertinacia recte disputari potest. Duo Reges: constructio interrete. Negare non possum.'
}
const posts = [post, post, post, post, post]

const Posts = props => {
  const posts = props.posts.map((post, index) => (
    <Post key={index} post={post} />
  ))
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
const Identity = props => {
  const web3ReactContext = getWeb3ReactContext()

  return (
    <>
      <h1>Identity</h1>
      <web3ReactContext.Consumer>
        {conext => {
          console.log(conext)
          return <p>{conext.account}</p>
        }}
      </web3ReactContext.Consumer>
    </>
  )
}

const App = () => {
  initStorage()
  return (
    <Web3ReactProvider libraryName='ethers.js'>
      <div className='section'>
        <div className='container'>
          <h1>Foooo</h1>
          <Identity />
          <Posts posts={posts} />
        </div>
      </div>
    </Web3ReactProvider>
  )
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
