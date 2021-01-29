# sunny-seattle
The website is dedicated to find hikes with a particular weather conditions.
Users choose location, distance, date and preferable weather conditions. App shows hikes within chosen area with specified weather conditions on the 
particular day. Later I plan to add filter by type of location (park, hike) and facilities it offers (beach access, barbeque, picnick area, childran playground, pets restrictions).
*The project was built upon "YelpCamp" project from Web Developer Bootcamp by Colt Steele.

# Main database
I use MongoDB as the main database.
NoSQL database is a good choice for this project as
- I was going to change my schema later on.
- All the information related to a hike is stored in one place. For example, there is no need to store hikes' images at a separate table
  because I show images only with a particular hike. The same goes for another hike information.
- I didn't need a lot of quering.
- MongoDB has in-build sharding, so if website grows, it will handle it.

# Image Storage
Images are stored on Cloudinary.
To minimize the storage size and to have all images of the same size, I added image resizing on upload.
Added default image when no image has been uploaded.

# Security
Full credit must go to "YelpCamp" from Colt Steele's course. Didn't change anything.

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


# Weather Forecast API - need to decide
## What I want
- Need to get a forecast for a particular location for 1 week.
- To give more accurate forecast, I need to update it daily.
- Minimize weather request costs. Free package limitations: 60 requests a mininute, 1 000 000 requests a month.
- Another important thing to consider: for a certain location, there can be several hikes in the area. I don't want to check weather for all of them.

## How it is implemented
- I check forecast daily for all the hikes and write it into the database.
- To meet the restriction 60 requests per minute, I update up to 60 hikes every 2 minutes.
- I update weather for hikes that are new or have weather updated earlier that today.
- For Seattle area I expect to have no more than 1000 hikes and parks. If I update 60 hikes every 2 minutes, I can update 1000 locations in 1 hour.
1000 hikes updated daily give me 1000x30 = 30 000 requests per a month.


