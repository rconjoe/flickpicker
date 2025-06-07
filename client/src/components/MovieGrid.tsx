import { getRouteApi } from '@tanstack/react-router'
import MovieCard from './MovieCard' // Adjust the path if necessary

export default function MovieGrid() {
  const routeApi = getRouteApi('/')
  const movies = routeApi.useLoaderData()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
