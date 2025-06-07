import { createFileRoute } from '@tanstack/react-router'
import MovieGrid from '@/components/MovieGrid'

// environment variables with vite work like this
// https://vite.dev/guide/env-and-mode
const api_url = import.meta.env.VITE_API_URL

export const Route = createFileRoute('/')({
  component: App,
  loader: () => fetchMovies(),
})

async function fetchMovies() {
  const res = await fetch(`${api_url}/movies`)
  if (!res.ok) throw new Error('failed to fetch movies')
  return res.json()
}

function App() {
  const movies = Route.useLoaderData()
  return (
    <div className="text-center">
      <div className="min-h-screen p-4 items-center justify-center text-white">
        <MovieGrid movies={movies} />
      </div>
    </div>
  )
}
