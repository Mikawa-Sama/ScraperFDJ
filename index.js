const request = require('request');
const htmlparser = require('node-html-parser')
const data = require('./data.json')
const canvas = require('canvas')
const { Client, Collection, Intents, BaseGuildVoiceChannel } = require('discord.js');
const fs = require('fs');
require('dotenv').config()


const client = new Client({ intents: [[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]] });

var aRequest = require('util').promisify(request);


client.once('ready', () => {
    console.log('Ready');

    test();
    // setInterval(test, 8.64e+7)
});

client.once('messageCreate', message => {
    if (message.author.bot) return;
    if (!message.member.permissions.has('Administrator')) return;

    if (message.content === "setChan") {
        data.channelEuro[message.guild.id] = message.channel.id;
        fs.writeFile('data.json', JSON.stringify(data));

    }
})  

var test = async () => {
    var html = await aRequest('https://www.fdj.fr/jeux-de-tirage/euromillions-my-million/resultats');
    var root = htmlparser.parse(html.body);

    var ball = root.querySelectorAll('.game-ball');

    ball.forEach(b => {
        console.log(b.text);
        console.log(b.classList.contains('is-special'));
    });

    for (const guildID in data.channelEuro) {
        if (Object.hasOwnProperty.call(data.channelEuro, guildID)) {
            const channelID = data.channelEuro[guildID];
            client.channels.cache.get(channelID).send("ok");
            
        }
    }
    
}

client.login(process.env.TOKEN);










