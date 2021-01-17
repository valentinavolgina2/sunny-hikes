# sunny-seattle
yelp-like website that is dedicated to find hikes with sunny forecast

# Main database
I use MongoDB as the main databse

# Images
Images are stored on Cloudinary.

# Pagination for the main page
## Hikes pagination. 
- Since a user search for hikes near a chosen city within certain distance, it gives us a limited number of hikes in the area (not more than 50 at most). 
- Even though I want to make a pagination for search result, I want to show ALL the results on the cluster map.
- Since I have all the results on the client, I don't want to go to the server just to render the next page.
- I want to go to the server only when my search request changes.
Thus, for any particular search I can send all the found hikes to the client, and on the client, show the hikes by pages. So, the pagination takes place on the client. 
If a user changes the search parameters, I go to the server and get all the hikes for this search.

## Reviews pagination.
- I don't need all the reviews all at once.
- Unlike hikes, there can be huge number of users and, because of this, a lot of reviews.
So, it seems to me a better idea to make a pagination on the server rather than on the client. Every time I need to show more reviews, I go to the server.


# Weather Forecast API - ???
