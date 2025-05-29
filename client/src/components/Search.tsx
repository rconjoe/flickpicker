/**
 * v0 by Vercel.
 * @see https://v0.dev/t/hVl5q7YIHfe
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { FaSearch } from 'react-icons/fa'
import { IconContext } from 'react-icons/lib'
import { Input } from '@/components/ui/input'

export default function Search() {
  return (
    <div className="flex items-center w-full max-w-sm space-x-2 rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-900 px-3.5 py-2">
      <Input
        type="search"
        placeholder="Search movies"
        className="w-full border-0 h-8 font-semibold text-gray-600"
      />
      <IconContext.Provider value={{ color: 'grey' }}>
        <div>
          <FaSearch />
        </div>
      </IconContext.Provider>
    </div>
  )
}
