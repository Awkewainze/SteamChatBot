const SteamUser = require("steam-user");
const SteamTotp = require("steam-totp");
const client = new SteamUser();
const G = require('gizoogle');

const config = require("./config.json");

var logOnOptions = config.login;
if(logOnOptions.steamSharedSecret) // If you need 2FA, provide sharedSecret to generate Auth code
    logOnOptions.twoFactorCode = SteamTotp.generateAuthCode(logOnOptions.steamSharedSecret);

var on = client.on.bind(client);

client.on = (name, f, ...others) => {
    var g = (...args) => {
        console.log(`${new Date().toLocaleString()} - ${name} - Called with args: ${args.join(", ")}`)
        f(...args);
    }
    on(name, g, ...others);
}

client.on("loggedOn", () => {
	client.setPersona(SteamUser.EPersonaState.Online);
});

client.on('friendRelationship', (steamId, relationship) => {
    if (relationship === SteamUser.EFriendRelationship.PendingInvitee) {
        client.addFriend(steamid);
        client.chatMessage(steamid, 'Hello there, new friend!');
    }
});

client.on("friendOrChatMessage", (steamId, message, room) => {
    if(client.myFriends[steamId] !== SteamUser.EFriendRelationship.Friend){
        client.chatMessage(steamId, "You are not friend!");
        return;
    }
    G.string(message, function(error, translation) {
        client.chatMessage(steamId, translation);
    });
})

client.logOn(logOnOptions);
