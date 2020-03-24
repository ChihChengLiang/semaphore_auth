import React from 'react'

import ReactDOM from 'react-dom'
import bulma from 'bulma'
import { initStorage } from './storage'
import { Web3ReactProvider } from '@web3-react/core'
import { getLibrary } from './web3'

import { IdentityPage } from './pages/identity'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import './custom.scss'

import { ToastProvider } from 'react-toast-notifications'
import Group from './pages/group'
import About from './pages/about'

const links = [
  { path: '/about', title: 'About', component: <About /> },
  { path: '/', title: 'Posts', component: <Group /> },
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
          <Route exact key={key} path={link.path}>
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
    <Web3ReactProvider getLibrary={getLibrary}>
      <ToastProvider>
        <Layout>
          <RouteTabs />
        </Layout>
      </ToastProvider>
    </Web3ReactProvider>
  )
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
