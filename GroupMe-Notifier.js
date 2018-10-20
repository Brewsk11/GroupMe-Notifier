// ==UserScript==
// @name         GroupmeAlerter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Notify about comments made by specific people
// @author       Pawel Szymichowski @ acidYeah 
// @match        https://*.groupme.com/chats
// @grant        none
// ==/UserScript==

const chatNameToFollow = "";
const followingPosters = [];
const followingAll = false;
const notifyFollowing = true;
const showAll = true;

const filterHash = "::>>";
const showNoComments = false;
const commentsToCheck = 10;
const checkInterval = 3000;

// Error codes
const CHAT_NOT_FOUND = -1;

function restoreConsoleLog() {
    var i = document.createElement('iframe');
    i.style.display='none';
    document.body.appendChild(i);
    window.console=i.contentWindow.console;
}

function getChatElement(name) {
    let allChats = document.getElementsByClassName("chat");
    for(let i = 0; i < allChats.length; i++) {
        if(allChats[i].getElementsByClassName("chat-name")[0].textContent == name)
            return allChats[i];
    }
    return CHAT_NOT_FOUND;
}

function getChatMessages(chat) {
    return Array.from(chat.getElementsByClassName("message"));
}

function getMessagePoster(message) {
    return message.getElementsByClassName("nickname")[0].textContent;
}

function getMessageBody(message) {
    return message.getElementsByClassName("message-text")[0].textContent;
}

function compareMessages(a, b) {
    if (getMessageBody(a) == getMessageBody(b) &&
        getMessagePoster(a) == getMessagePoster(b))
        return true;
    else
        return false;
}

function getNewMessagesCount(older, newer) {
    let index = newer.length - 1;

    while(index >= 0) {
        if(compareMessages(older[older.length - 1], newer[index])) {
            break;
        }
        index--;
    }

    return newer.length - 1 - index;
}

function isFromFollowedPosters(message, posters) {
    let poster = getMessagePoster(message);
    for(let i = 0; i < posters.length; i++) {
        if(poster == posters[i])
            return true;
    }
    return false;
}

function sleep(msec) {
    return new Promise(res => setTimeout(res, msec));
}

function log(message) {
    let d = new Date().toLocaleTimeString();
    console.log(d + " " + filterHash + " " + message);
}

function trimArrayFromEnd(array, n) {
    return array.slice(n >= array.length ? 0 : array.length - n);
}

async function runDaemonOnChat(chatName) {
    let chat = getChatElement(chatName);
    let olderComments = trimArrayFromEnd(getChatMessages(chat), commentsToCheck);

    log("Daemon has started succesfully on chat \"" + chatNameToFollow + "\"");

    do {
        await sleep(checkInterval);

        let newerComments = trimArrayFromEnd(getChatMessages(chat), commentsToCheck);
        let newMessagesCount = getNewMessagesCount(olderComments, newerComments);

        olderComments = newerComments;

        if(newMessagesCount != 0) {

            for(let i = 0; i < newMessagesCount; i++) {
                let m = newerComments[newerComments.length - i - 1];
                if(followingAll || isFromFollowedPosters(m, followingPosters)) {
                    log("")
                    log("/-----------------!!!-----------------\\");
                    log("| >> " + getMessagePoster(m) + " <<");
                    log("| " + getMessageBody(m));
                    log("\\-----------------!!!-----------------/");
                    log("")

                    if(notifyFollowing && Notification.permission == "granted") {
                        new Notification(getMessagePoster(m), {body: getMessageBody(m)});
                    }
                }
                else if (showAll) {
                    log(getMessagePoster(m) + ":\t" + getMessageBody(m));
                }
            }

        }
        else {
            if(showNoComments) log("No new comments");
            continue;
        }
    }
    while(true);
}

(async function() {
    'use strict';

    await sleep(5000);

    restoreConsoleLog();

    if (Notification.permission != "granted")
        Notification.requestPermission();

    while(true) {
        try {
            await sleep(5000);
            await runDaemonOnChat(chatNameToFollow);
        }
        catch(e) {
            log("There has been an error during start/run of the daemon: \"" + e + "\" Restarting...");
        }
    }

})();