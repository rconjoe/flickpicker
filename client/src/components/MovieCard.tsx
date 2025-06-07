// youtube embeds don't work unless you use the /embed/:id format
// so here is a function to make sure those are correct
const getYouTubeEmbedUrl = (url) => {
  if (!url) return ''

  let videoId = ''
  const watchMatch = url.match(/[?&]v=([^&]+)/)
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)

  if (watchMatch && watchMatch[1]) {
    videoId = watchMatch[1]
  } else if (shortMatch && shortMatch[1]) {
    videoId = shortMatch[1]
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`
  }
  return ''
}

export default function MovieCard({ movie }) {
  const embedUrl = getYouTubeEmbedUrl(movie.trailerLink)

  return (
    <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
      {/* relative container with 56.25% bottom pad achieves 16:9 ratio for the trailer iframes. */}
      <div className="relative w-full pb-[56.25%] min-h-[200px] bg-secondary">
        {embedUrl ? (
          <iframe
            // absolute is necessary to inherit the aforementioned weird padding.
            className="absolute top-0 left-0 w-full h-full"
            src={embedUrl}
            title={`${movie.title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            Trailer not available or invalid link.
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
        <p className="text-sm mb-1">Year: {movie.year}</p>
        <p className="text-sm mb-1">Runtime: {movie.runtime}</p>
        <p className="text-sm mb-1">Ratings: {movie.ratings}</p>
        {movie.requestedBy && (
          <p className="text-sm">
            Requested by: {movie.requestedBy.username} (
            {movie.requestedBy.platform})
          </p>
        )}
      </div>
    </div>
  )
}
