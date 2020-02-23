import * as React from 'react'
const useState = React.useState

const Nav = () => {
  const [menuToggle, setMenuToggle] = useState(false)

  const navbarMenuClassName = menuToggle
    ? 'navbar-menu is-active'
    : 'navbar-menu'

  return (
    <nav className='navbar' role='navigation' aria-label='main navigation'>
      <div className={navbarMenuClassName}>
        <div className='navbar-end'>
          <a className='navbar-item' href='/register'>
            Register
          </a>

          <a className='navbar-item' href='/post'>
            Post
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Nav
