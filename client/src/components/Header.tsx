import { Link } from '@tanstack/react-router'
import Search from './Search'
import Login from './Login'

export default function Header() {
  return (
    <header className="p-2 flex gap-2 bg-secondary dark text-white justify-between items-center">
      <nav className="flex flex-row items-center">
        <div className="px-2 font-bold">
          <Link to="/">
            <img src="logo.svg" alt="FlickPicker Logo" width="46" height="40" />
          </Link>
        </div>
        <Link to="/">
          <span className="text-xl">FlickPicker</span>
        </Link>
      </nav>

      <div className="flex flex-row">
        <div className="py-2 px-4 font-bold">
          <Search />
        </div>
        <div className="py-2 px-4 font-bold">
          <Login />
        </div>
      </div>
    </header>
  )
}
