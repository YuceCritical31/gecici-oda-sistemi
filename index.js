const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");

client.on("ready", ()=>console.log("Bot Aktif"));

const jointocreate = require("./jointocreate");
jointocreate(client);


client.login(config.TOKEN);
