import React from 'react'

import ReactDOM from 'react-dom'
import bulma from 'bulma'
import { initStorage } from './storage'
import Web3Provider from 'web3-react'

import { Activation, MetaMask } from './web3'

import { Posts } from './pages/posts'
import { IdentityPage } from './pages/identity'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import './custom.scss'
import Onboarding from './pages/onboarding'

const Home = () => {
  return (
    <div className='container'>
      <Onboarding />
      <hr />
      <Posts />
    </div>
  )
}

const links = [
  { path: '/posts', title: 'Posts', component: <Home /> },
  {
    path: '/identity',
    title: 'Identity',
    component: <IdentityPage />
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
      <div className='column is-half is-offset-one-quarter'>
        <div className='box'>{children}</div>
      </div>
    </div>
  </section>
)

const App = () => {
  initStorage()
  return (
    <Web3Provider connectors={{ MetaMask }} libraryName='ethers.js'>
      <Layout>
        <RouteTabs />
      </Layout>
    </Web3Provider>
  )
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
