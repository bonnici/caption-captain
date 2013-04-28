Caption Catptain
================

Code for a game that gets a list of titles and images from reddit and uses that to show one image and a random selection of 3 titles from which the player needs to select the right one. The default subreddit is r/reactiongifs, but the game also works with other image-heavy subreddit. My goal was to make a fun game that could run entirely on the client side without any sort of web server/database access (except for just vending the html etc.). Reddit data is pulled in using JSONP and subreddit selection is done by using JavaScript to detect the subreddit name in the query string. This uses [Twitter Bootstrap](http://twitter.github.io/bootstrap/), [Dojo Toolkit](http://dojotoolkit.org/), and [Dojo Bootstrap](http://dojobootstrap.com/) to make them play nicely together. The site is live at [http://captioncapta.in/](http://captioncapta.in/), for more details see my [blog post](http://holtcode.blogspot.com/2013/04/caption-captain.html).