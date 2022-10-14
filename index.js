const request = require('request');
const htmlparser = require('node-html-parser')
const data = require('./data.json')
const draw = require('./draw.json')
const Canvas = require('canvas')
const Discord = require('discord.js')
const { Client, Intents } = require('discord.js');
const fs = require('fs');

require('dotenv').config()


const client = new Client({ intents: [[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]] });

var aRequest = require('util').promisify(request);


client.once('ready', () => {
    console.log('Ready');

    test();
    setInterval(test, 8.64e+7)
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content === 'setChan') {
        data.channelEuro[message.guild.id] = message.channel.id;
        fs.writeFileSync('data.json', JSON.stringify(data));
    }
    else if (message.content === 'credit') {
        const embed = new Discord.MessageEmbed()
            .addField("Crée par : MikawaSama#1757", "MK_Serveur : [Rejoindre](https://discord.gg/8xQbu48cDZ)")
            .setColor('#00205b')
            .setImage('attachment://mk.png');
        for (const guildID in data.channelEuro) {
            const channelID = data.channelEuro[guildID];
            client.channels.cache.get(channelID).send({embeds: [embed], files: ['./mk.png']});

        }
    }
})


var test = async () => {
    var html = await aRequest('https://www.fdj.fr/jeux-de-tirage/euromillions-my-million/resultats');
    var root = htmlparser.parse(html.body);

    var ball = root.querySelectorAll('.game-ball');

    let textBall = "";
    let textStar1 = "";
    let textStar2 = "";
    ball.forEach(b => {
        console.log(b.text);
        if (b.classList.contains('is-special') && textStar1 == "") {
            textStar1 += b.text;
        }
        else if (b.classList.contains('is-special') && textStar1 !== "") {
            textStar2 += b.text;
        }
        else {
            textBall += `${b.text}    `;
        }
    });

    fs.readFile('draw.json', async (err, d) => {
        if (err) throw err;
        let readData = JSON.parse(d);


        if (ball[0].text != readData.lastDraw.ball1 || ball[1].text != readData.lastDraw.ball2 || ball[2].text != readData.lastDraw.ball3 || ball[3].text != readData.lastDraw.ball4 || ball[4].text != readData.lastDraw.ball5 || ball[5].text != readData.lastDraw.star1 || ball[6].text != readData.lastDraw.star2) {
            draw.lastDraw['ball1'] = ball[0].text;
            draw.lastDraw['ball2'] = ball[1].text;
            draw.lastDraw['ball3'] = ball[2].text;
            draw.lastDraw['ball4'] = ball[3].text;
            draw.lastDraw['ball5'] = ball[4].text;
            draw.lastDraw['star1'] = ball[5].text;
            draw.lastDraw['star2'] = ball[6].text;
            console.log('ok')

            fs.writeFileSync('draw.json', JSON.stringify(draw));

            for (const guildID in data.channelEuro) {
                const channelID = data.channelEuro[guildID];

                if (Object.hasOwnProperty.call(data.channelEuro, guildID)) {
                    const canvas = Canvas.createCanvas(1000, 500);
                    const context = canvas.getContext('2d');
                    const background = await Canvas.loadImage('./canvasEuro.png');
                    context.drawImage(background, 0, 0, canvas.width, canvas.height);

                    context.fillStyle = '#ffffff'
                    context.font = '35px sans-serif'
                    context.fillText(textBall, 272, 342)
                    context.fillText(textStar1, 694, 342)
                    context.fillText(textStar2, 775, 342)

                    const attachment = new Discord.MessageAttachment(canvas.toBuffer());

                    client.channels.cache.get(channelID).send({ files: [attachment] });
                }
            }
        }
        else {
            for (const guildID in data.channelEuro) {
                const channelID = data.channelEuro[guildID];

                client.channels.cache.get(channelID).send("Pas de nouveau tirage !");
            }
        }
    });
}

client.login(process.env.TOKEN);










