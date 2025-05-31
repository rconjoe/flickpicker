/**
 * v0 by Vercel.
 * @see https://v0.dev/t/hVl5q7YIHfe
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { IconContext } from 'react-icons/lib'
import { Button } from './ui/button'
import { Input } from '@/components/ui/input'

export default function Search() {
  const [searchValue, setSearchValue] = useState('')

  return (
    <div className="flex items-center w-full max-w-sm space-x-2 rounded-lg bg-secondary dark px-3.5 py-2">
      <Input
        type="search"
        placeholder="Search movies"
        className="w-full border-0 h-8 font-semibold"
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <Button
        type="submit"
        variant="ghost"
        onClick={() => console.log(searchValue)}
      >
        <IconContext.Provider value={{ color: 'grey' }}>
          <div>
            <FaSearch />
          </div>
        </IconContext.Provider>
      </Button>
    </div>
  )
}
