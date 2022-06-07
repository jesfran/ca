var { MessageEmbed } = require(`discord.js`);
var Discord = require(`discord.js`);
var config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
var emoji = require(`${process.cwd()}/botconfig/emojis.json`);
var radios = require(`../../botconfig/radiostations.json`);
var playermanager = require(`../../handlers/playermanager`);
var { stations, databasing } = require(`${process.cwd()}/handlers/functions`);
const { MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js')
module.exports = {
    name: "setup-music",
    category: "💪 Setup",
    aliases: ["setupmusic"],
    cooldown: 10,
    usage: "setup-music #Channel",
    description: "Setup a Music Request Channel",
    memberpermissions: ["ADMINISTRATOR"],
    type: "fun",
    run: async (client, message, args, cmduser, text, prefix) => {
    
      let es = client.settings.get(message.guild.id, "embed");let ls = client.settings.get(message.guild.id, "language")
      try{
        //I AM NOW MAKING A MUSIC REQUEST SYSTEM FOR A BOT!
        client.musicsettings.ensure(message.guild.id, {
          "channel": "",
          "message": ""
        })
        //first declare all embeds
        var embeds = [
          new MessageEmbed()
            .setColor(es.color)
            .setTitle(`<:M_report:933813086119428198> Lista de __${message.guild.name}__`)
            .setDescription(`**Actualmente tiene __0 Canciones__ en espera**`)
            .setThumbnail(message.guild.iconURL({dynamic: true})),
          new MessageEmbed()
            .setColor(es.color)
            .setFooter(client.getFooter(es))
            .setImage(message.guild.banner ? message.guild.bannerURL({size: 4096}) : "https://media.discordapp.net/attachments/916358563876708442/937788970731962429/server_manager.png?width=1246&height=701")
            .setTitle(`¡Comienza a escuchar música conectándote a un canal de voz y enviando el **ENLACE DE LA CANCIÓN** o el **NOMBRE DE LA CANCIÓN** en este canal!`)
            .setDescription(`> *Soy compatible con <:Youtube:933396439776780309> Youtube, <:Spotify:933396188563112027> Spotify, <:soundcloud:937781323295227955> ¡Soundcloud y enlaces MP3 directos!*`)
        ]
        //now we add the components!
        var components = [
          new MessageActionRow().addComponents([
            new MessageButton().setStyle('SUCCESS').setCustomId('Join').setEmoji(`880117117192650762`).setLabel(`Entrar`).setDisabled(false),
            new MessageButton().setStyle('DANGER').setCustomId('Leave').setEmoji(`937782078676807771`).setLabel(`Salir`).setDisabled(),
          ]),
          new MessageActionRow().addComponents([
            new MessageButton().setStyle('PRIMARY').setCustomId('Skip').setEmoji(`937783970098204764`).setLabel(`Saltar`).setDisabled(),
            new MessageButton().setStyle('DANGER').setCustomId('Stop').setEmoji(`937783974439288965`).setLabel(`Detener`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Pause').setEmoji('937783972971307039').setLabel(`Pausa`).setDisabled(),
            new MessageButton().setStyle('SUCCESS').setCustomId('Autoplay').setEmoji('937783971985645708').setLabel(`Auto-reproducción`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Shuffle').setEmoji('937783973940179024').setLabel(`Barajar`).setDisabled(),
          ]),
          new MessageActionRow().addComponents([
            new MessageButton().setStyle('SUCCESS').setCustomId('Song').setEmoji(`937783971985645708`).setLabel(`Canción`).setDisabled(),
            new MessageButton().setStyle('SUCCESS').setCustomId('Queue').setEmoji(`937783971985645708`).setLabel(`Cola`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Forward').setEmoji('937783970098204764').setLabel(`+10 Seg`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Rewind').setEmoji('937783971239055481').setLabel(`-10 Seg`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Lyrics').setEmoji('937783975408181299').setLabel(`Letra`).setDisabled(),
          ]),
        ]
        let channel = message.mentions.channels.first();
        if(!channel) return message.reply("<:no:933383859884679268> **¡Olvidaste hacer ping a un canal de texto!**")
        //send the data in the channel
        channel.send({embeds, components}).then(msg => {
          client.musicsettings.set(message.guild.id, channel.id, "channel");
          client.musicsettings.set(message.guild.id, msg.id, "message");
          //send a success message
          return message.reply(`✅ **Configuró correctamente el sistema de música en:** <#${channel.id}>`)
        });
        } catch (e) {
            console.log(String(e.stack).grey.bgRed)
            return message.reply({embeds: [new MessageEmbed()
                .setColor(es.wrongcolor)
    						.setFooter(client.getFooter(es))
                .setTitle(client.la[ls].common.erroroccur)
                .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-radio"]["variable9"]))
            ]});
        }
    },
};
/**
  * @INFO
  * Bot Coded by Tomato#6966 | https://discord.gg/milrato
  * @INFO
  * Work for Milrato Development | https://milrato.eu
  * @INFO
  * Please mention him / Milrato Development, when using this Code!
  * @INFO
*/
