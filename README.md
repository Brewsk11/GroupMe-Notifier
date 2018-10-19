# GroupMe-Notifier
## Description
Userscript that notifies about messages using WebAPI. Additionally it logs messages to the console for clearer view of the conversation.
## Options
You can change most of the constants at the beginning of the script to set it up.
### User options
* **chatNameToFollow** - Name of the chat you want to follow.
* **followingPosters** - Array of persons' names you want to follow. It does not look for substrings (for now) so you have to provide full names.
* **followingAll** - Makes it so you'll recieve a notification form every message. Mainly for debug.
* **notifyFollowing** - Disable notifications.
* **showAll** - Logs every message, not only from the persons following.
### Other options
* **filterHash** - GroupMe uses Console.log() for its own purposes and it supresses it by default. The script brings back logging, but it floods the console with unnecessary data. The hash works as a separator between timestamp and message logged, it should be unique, so that you can filter the console with it
* **showNoComments** - Logs "No new comments" message. For debug purposes.
* **commentsToCheck** - Number of comments to check back for new ones. It should not be lower than number of comments per interval.
* **checkInterval** - Sleep time after which a check for new comments is performed.
## Todo
* Following based on message keywords'
* Daemon sometimes stops working after the window has been out of focus for some time, and then focused on again.
