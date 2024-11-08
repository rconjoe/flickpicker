import json

# Define the number of entries you need to generate
num_entries = 1200

# Create a list to hold all movie data
movie_list = []

# Generate the movie entries
for i in range(7, num_entries + 7):  # Start from ID 7 to match your example
    movie = {
        "id": i,
        "title": "",
        "dateWatched": "",
        "watched": False,
        "trailerLink": "",
        "movieLink": "",
        "modernTrailerLink": "",
        "requestedBy": {
            "userId": "",
            "username": "",
            "platform": ""
        },
        "category": "",
        "trailerPrivate": False,
        "moviePrivate": False,
        "year": 0,
        "subtitles": True,
        "language": "",
        "voteCount": 0,
        "imageUrl": f"./img/movie{i}.jpg",  # Dynamically set the image filename
        "runtime": "",
        "ratings": ""
    }
    
    # Append each movie to the list
    movie_list.append(movie)

# Write the list to a JSON file
with open('movieList.json', 'w') as json_file:
    json.dump(movie_list, json_file, indent=4)

print(f"Successfully generated {num_entries} movie entries in 'movieList.json'.")