import React from 'react'

import ReactDOM from 'react-dom'
import bulma from 'bulma'
// import Nav from './nav'
import { initStorage } from './storage'
// import Web3Provider from 'web3-react'

// import { Activation, MetaMask } from './web3'

import PostPage from './pages/posts'
import { IdentityCommitment, IdentityManagement } from './pages/identity'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import './custom.scss'

const links = [
  { path: '/posts', title: 'Posts', component: <PostPage /> },
  {
    path: '/identityCommitment',
    title: 'IdentityCommitment',
    component: <IdentityCommitment />
  },
  {
    path: '/identityManagement',
    title: 'IdentityManagement',
    component: <IdentityManagement />
  }
]

const RouteTabs = () => (
  <Router>
    <div className='tabs is-centered is-boxed'>
      <ul>
        {links.map((link, key) => (
          <Route key={key} path={link.path}>
            {({ match }) => (
              <li className={match ? 'is-active' : undefined}>
                <Link to={link.path}>{link.title}</Link>
              </li>
            )}
          </Route>
        ))}
      </ul>
    </div>
    <Switch>
      {links.map((link, key) => (
        <Route key={key} exact path={link.path}>
          {link.component}
        </Route>
      ))}
    </Switch>
  </Router>
)

const Layout = ({ children }) => (
  <section className='section'>
    <div className='columns'>
      <div className='column is-half is-centered'>{children}</div>
    </div>
  </section>
)

const App = () => {
  initStorage()
  return (
    <Layout>
      <RouteTabs />
      {/* <Web3Provider connectors={{ MetaMask }} libraryName='ethers.js'> */}
      {/* <Activation /> */}

      {/* </Web3Provider> */}
    </Layout>
  )
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
