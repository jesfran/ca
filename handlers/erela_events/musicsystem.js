const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js")
const { check_if_dj, autoplay, escapeRegex, format, duration, createBar } = require("../functions");
const config = require(`${process.cwd()}/botconfig/config.json`);
const ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const playermanager = require(`../../handlers/playermanager`);
//we need to create the music system, somewhere...
module.exports = client => {
    client.on("interactionCreate", async (interaction) => {
        if(!interaction?.isButton()) return;
        var { guild, message, channel, member, user } = interaction;
        if(!guild) guild = client.guilds.cac  he.get(interaction?.guildId);
        if(!guild) return;
        client.musicsettings.ensure(guild.id, {
            "channel": "",
            "message": ""
        })
        var data = client.musicsettings.get(guild.id);
        var musicChannelId = data.channel;
        var musicChannelMessage = data.message;
        //if not setupped yet, return
        if(!musicChannelId || musicChannelId.length < 5) return;
        if(!musicChannelMessage || musicChannelMessage.length < 5) return;
        //if the channel doesnt exist, try to get it and the return if still doesnt exist
        if(!channel) channel = guild.channels.cache.get(interaction?.channelId);
        if(!channel) return;
        //if not the right channel return
        if(musicChannelId != channel.id) return;
        //if not the right message, return
        if(musicChannelMessage != message.id) return;

        if(!member) member = guild.members.cache.get(user.id);
        if(!member) member = await guild.members.fetch(user.id).catch(() => {});
        if(!member) return;
        //if the member is not connected to a vc, return
        if(!member.voice.channel) return interaction?.reply({ephemeral: true, content: ":x: **Please Connect to a Voice Channel first!**"})
        //now its time to start the music system
        if (!member.voice.channel)
            return interaction?.reply({
                content: `<:emojino:933030632731340872> **Please join a Voice Channel first!**`,
                ephemeral: true
            })      
            
        var player = client.manager.players.get(interaction?.guild.id);
        if (interaction?.customId != "Join" && interaction?.customId != "Leave" && (!player || !player.queue || !player.queue.current))
            return interaction?.reply({content: "<:emojino:933030632731340872> Nothing Playing yet", ephemeral: true})
                        
        //if not connected to the same voice channel, then make sure to connect to it!
        if (player && member.voice.channel.id !== player.voiceChannel)
            return interaction?.reply({
                content: `<:emojino:933030632731340872> **Please join __my__ Voice Channel first! <#${player.voiceChannel}>**`,
                ephemeral: true
            })
        //here i use my check_if_dj function to check if he is a dj if not then it returns true, and it shall stop!
        if(player && interaction?.customId != `Join` && interaction?.customId != `Lyrics` && check_if_dj(client, member, player.queue.current)) {
                return interaction?.reply({embeds: [new MessageEmbed()
                  .setColor(ee.wrongcolor)
                  .setFooter({text: `${ee.footertext}`, iconURL: `${ee.footericon}`})
                  .setTitle(`<:emojino:933030632731340872> **You are not a DJ and not the Song Requester!**`)
                  .setDescription(`**DJ-ROLES:**\n${check_if_dj(client, interaction?.member, player.queue.current)}`)
                ],
                ephemeral: true});
        }
        let es = client.settings.get(guild.id, "embed")
        let ls = client.settings.get(guild.id, "language")
        switch(interaction?.customId){
            case "Join": {
                //create the player
                var player = await client.manager.create({
                    guild: guild.id,
                    voiceChannel: member.voice.channel.id,
                    textChannel: channel.id,
                    selfDeafen: config.settings.selfDeaf,
                });
                await player.connect();
                await player.stop();
                 interaction?.reply({embeds: [new MessageEmbed()
                    .setColor(es.color)
                    .setTitle(client.la[ls].cmds.music.join.title)
                    .setDescription(`Channel: <#${member.voice.channel.id}>`)]
                });
                //edit the message so that it's right!
                var data = generateQueueEmbed(client, guild.id)
                message.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
            }break;
            case "Leave": {
                //Stop the player
                interaction?.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`:wave: **Dej?? el canal**`)
                  .setFooter(client.getFooter(`???? Acci??n por: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                }) 
                if(player){
                    await player.destroy();
                    //edit the message so that it's right!
                    var data = generateQueueEmbed(client, guild.id, true)
                    message.edit(data).catch((e) => {
                      //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    })
                } else {
                    //edit the message so that it's right!
                    var data = generateQueueEmbed(client, guild.id, true)
                    message.edit(data).catch((e) => {
                    //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    })
                }
            }break;
            case "Skip": {
                //if ther is nothing more to skip then stop music and leave the Channel
                if (!player.queue || !player.queue.size || player.queue.size === 0) {
                    //if its on autoplay mode, then do autoplay before leaving...
                    if(player.get("autoplay")) return autoplay(client, player, "skip");
                    interaction?.reply({
                        embeds: [new MessageEmbed()
                        .setColor(ee.color)
                        .setTimestamp()
                        .setTitle(`??? **Dejando de reproducir la musica y abandonando el canal**`)
                        .setFooter(client.getFooter(`???? Acci??n por: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                    })
                    await player.destroy()
                    //edit the message so that it's right!
                    var data = generateQueueEmbed(client, guild.id, true)
                    message.edit(data).catch((e) => {
                    //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    })
                    return
                }
                //skip the track
                await player.stop();
                interaction?.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`??? **??Pas?? a la siguiente canci??n!**`)
                  .setFooter(client.getFooter(`???? Acci??n por: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
                //edit the message so that it's right!
                var data = generateQueueEmbed(client, guild.id)
                message.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
            }break;
            case "Stop": {
                //Stop the player
                interaction?.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`??? **Dejando de reproducir la musica y abandonando el canal**`)
                  .setFooter(client.getFooter(`???? Acci??n por: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                }) 
                await player.destroy()
                //edit the message so that it's right!
                var data = generateQueueEmbed(client, guild.id, true)
                message.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
            }break;
            case "Pause": {
                if (!player.playing){
                    player.pause(false);
                    interaction?.reply({
                      embeds: [new MessageEmbed()
                      .setColor(ee.color)
                      .setTimestamp()
                      .setTitle(`?????? **Reanudado!**`)
                      .setFooter(client.getFooter(`???? Acci??n por: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                    })
                  } else{
                    //pause the player
                    player.pause(true);

                    interaction?.reply({
                      embeds: [new MessageEmbed()
                      .setColor(ee.color)
                      .setTimestamp()
                      .setTitle(`??? **En pausa!**`)
                      .setFooter(client.getFooter(`???? Acci??n por: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                    })
                  }
                  //edit the message so that it's right!
                  var data = generateQueueEmbed(client, guild.id)
                  message.edit(data).catch((e) => {
                    //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                  })
            }break;
            case "Autoplay": {
                //pause the player
                player.set(`autoplay`, !player.get(`autoplay`))
                interaction?.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`${player.get(`autoplay`) ? `<a:yes:933036759913201725> **Reproducci??n autom??tica habilitada**`: `<:emojino:933030632731340872> **Reproducci??n autom??tica deshabilitada**`}`)
                  .setFooter(client.getFooter(`???? Acci??n por: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
                //edit the message so that it's right!
                var data = generateQueueEmbed(client, guild.id)
                message.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
            }break;
            case "Shuffle": {
                //set into the player instance an old Queue, before the shuffle...
                player.set(`beforeshuffle`, player.queue.map(track => track));
                //shuffle the Queue
                player.queue.shuffle();
                //Send Success Message
                interaction?.reply({
                  embeds: [new MessageEmbed()
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(`???? **Barajada ${player.queue.length} Canciones!**`)
                    .setFooter(client.getFooter(`???? Acci??n por: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
                //edit the message so that it's right!
                var data = generateQueueEmbed(client, guild.id)
                message.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
            }break;
            case "Song": {
                //if there is active queue loop, disable it + add embed information
                if (player.queueRepeat) {
                  player.setQueueRepeat(false);
                }
                //set track repeat to revers of old track repeat
                player.setTrackRepeat(!player.trackRepeat);
                interaction?.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`${player.trackRepeat ? `<a:yes:933036759913201725> **Bucle de canci??n habilitado**`: `<:emojino:933030632731340872> **Bucle de canci??n deshabilitado**`}`)
                  .setFooter(client.getFooter(`???? Acci??n por: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
                //edit the message so that it's right!
                var data = generateQueueEmbed(client, guild.id)
                message.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
            }break;
            case "Queue": {
                //if there is active queue loop, disable it + add embed information
                if (player.trackRepeat) {
                  player.setTrackRepeat(false);
                }
                //set track repeat to revers of old track repeat
                player.setQueueRepeat(!player.queueRepeat);
                interaction?.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`${player.queueRepeat ? `<a:yes:933036759913201725> **Bucle de cola habilitado**`: `<:emojino:933030632731340872> **Bucle de cola deshabilitado**`}`)
                  .setFooter(client.getFooter(`???? Acci??n por: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
                //edit the message so that it's right!
                var data = generateQueueEmbed(client, guild.id)
                message.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
            }break;
            case "Forward": {
                //get the seektime variable of the user input
                var seektime = Number(player.position) + 10 * 1000;
                //if the userinput is smaller then 0, then set the seektime to just the player.position
                if (10 <= 0) seektime = Number(player.position);
                //if the seektime is too big, then set it 1 sec earlier
                if (Number(seektime) >= player.queue.current.duration) seektime = player.queue.current.duration - 1000;
                //seek to the new Seek position
                await player.seek(Number(seektime));
                interaction?.reply({
                  embeds: [new MessageEmbed()
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(`??? **Adelanta la canci??n para \`10 Segundos\`!**`)
                    .setFooter(client.getFooter(`???? Acci??n por: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
                //edit the message so that it's right!
                var data = generateQueueEmbed(client, guild.id)
                message.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
            }break;
            case "Rewind": {
                var seektime = player.position - 10 * 1000;
                if (seektime >= player.queue.current.duration - player.position || seektime < 0) {
                  seektime = 0;
                }
                //seek to the new Seek position
                await player.seek(Number(seektime));
                interaction?.reply({
                  embeds: [new MessageEmbed()
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(`??? **Regreso la canci??n durante \ '10 segundos\`!**`)
                    .setFooter(client.getFooter(`???? Acci??n por: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
                //edit the message so that it's right!
                var data = generateQueueEmbed(client, guild.id)
                message.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
            }break;
            case "Lyrics": {
                
            }break;
        }
        
    })
    //this was step 1 now we need to code the REQUEST System...

    client.on("messageCreate", async message => {
        if(!message.guild) return;
        client.musicsettings.ensure(message.guild.id, {
            "channel": "",
            "message": ""
        })
        var data = client.musicsettings.get(message.guild.id);
        var musicChannelId = data.channel;
        //if not setupped yet, return
        if(!musicChannelId || musicChannelId.length < 5) return;
        //if not the right channel return
        if(musicChannelId != message.channel.id) return;
        //Delete the message once it got sent into the channel, bot messages after 5 seconds, user messages instantly!
        if (message.author.id === client.user.id) 
            setTimeout(()=>{
              try{
                message.delete().catch(() => {
                  setTimeout(()=>{
                    try{message.delete().catch((e) => {console.log(e)});}catch(e){ console.log(e)}}, 5000)});}catch(e){setTimeout(()=>{try{message.delete().catch((e) => {console.log(e)});}catch(e){ console.log(e)}}, 5000)}}, 5000)
        else 
            {
              try{message.delete().catch(() => {setTimeout(()=>{try{message.delete().catch(() => {});}catch(e){ }}, 5000)});}catch(e){setTimeout(()=>{try{message.delete().catch(() => {});}catch(e){ }}, 5000)}
            }
        if (message.author.bot) return; // if the message  author is a bot, return aka ignore the inputs
        var prefix = client.settings.get(message.guild.id, "prefix")
        //get the prefix regex system
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`); //the prefix can be a Mention of the Bot / The defined Prefix of the Bot
        var args;
        var cmd;
        if (prefixRegex.test(message.content)) {
            //if there is a attached prefix try executing a cmd!
            const [, matchedPrefix] = message.content.match(prefixRegex); //now define the right prefix either ping or not ping
            args = message.content.slice(matchedPrefix.length).trim().split(/ +/); //create the arguments with sliceing of of the rightprefix length
            cmd = args.shift().toLowerCase(); //creating the cmd argument by shifting the args by 1
            if (cmd || cmd.length === 0) return// message.reply("<:emojino:933030632731340872> **Please use a Command Somewhere else!**").then(msg=>{setTimeout(()=>{try{msg.delete().catch(() => {});}catch(e){ }}, 3000)})
        
            var command = client.commands.get(cmd); //get the command from the collection
            if (!command) command = client.commands.get(client.aliases.get(cmd)); //if the command does not exist, try to get it by his alias
            if (command) //if the command is now valid
            {
                return// message.reply("<:emojino:933030632731340872> **Please use a Command Somewhere else!**").then(msg=>{setTimeout(()=>{try{msg.delete().catch(() => {});}catch(e){ }}, 3000)})
            }
        }
        //getting the Voice Channel Data of the Message Member
        const {
          channel
        } = message.member.voice;
        //if not in a Voice Channel return!
        if (!channel) return message.reply("<:emojino:933030632731340872> **????nete primero a un canal de voz!**").then(msg=>{setTimeout(()=>{try{msg.delete().catch(() => {});}catch(e){ }}, 5000)})
        //get the lavalink erela.js player information
        const player = client.manager.players.get(message.guild.id);
        //if there is a player and the user is not in the same channel as the Bot return information message
        if (player && channel.id !== player.voiceChannel) return message.reply(`<:emojino:933030632731340872> **??nase primero a __my__ Voice Channel! <#${player.voiceChannel}>**`).then(msg=>{setTimeout(()=>{try{msg.delete().catch(() => {});}catch(e){ }}, 3000)})

        
        else {
            return playermanager(client, message, message.content.trim().split(/ +/), "request:song");
        }
    })


}
function generateQueueEmbed(client, guildId, leave){
    let guild = client.guilds.cache.get(guildId)
    if(!guild) return;
    let es = client.settings.get(guild.id, "embed")
    let ls = client.settings.get(guild.id, "language")
    var embeds = [
      new MessageEmbed()
        .setColor(es.color)
        .setTitle(`<:M_report:933813086119428198> Lista de __${guild.name}__`)
        .setDescription(`**Actualmente hay __0 canciones__ en la cola**`)
        .setThumbnail(guild.iconURL({dynamic: true})),
      new MessageEmbed()
        .setColor(es.color)
        .setFooter(client.getFooter(es))
        .setImage(guild.banner ? guild.bannerURL({size: 4096}) : "https://media.discordapp.net/attachments/916358563876708442/937788970731962429/server_manager.png?width=1246&height=701")
        .setTitle(`??Comienza a escuchar m??sica conect??ndote a un canal de voz y enviando el **ENLACE DE LA CANCI??N** o el **NOMBRE DE LA CANCI??N** en este canal!`)
        .setDescription(`> *Yo soy compatible con <:Youtube:933396439776780309>Youtube, <:Spotify:933396188563112027> Spotify, <:soundcloud:937781323295227955>  ??Soundcloud y enlaces MP3 directos!*`)
    ]
    const player = client.manager.players.get(guild.id);
    if(!leave && player && player.queue && player.queue.current){
        embeds[1].setImage(`https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`)
            .setFooter(client.getFooter(`Requested by: ${player.queue.current.requester.tag}`, player.queue.current.requester.displayAvatarURL({dynamic: true})))
            .addField(`${emoji?.msg.time} Duraci??n: `, `\`${format(player.queue.current.duration).split(" | ")[0]}\` | \`${format(player.queue.current.duration).split(" | ")[1]}\``, true)
            .addField(`${emoji?.msg.song_by} Canci??n de: `, `\`${player.queue.current.author}\``, true)
            .addField(`${emoji?.msg.repeat_mode} Longitud de la cola: `, `\`${player.queue.length} Canciones\``, true)
            .setAuthor(`${player.queue.current.title}`, "https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif", player.queue.current.uri)
        delete embeds[1].description;
        delete embeds[1].title;
        //get the right tracks of the current tracks
        const tracks = player.queue;
        var maxTracks = 10; //tracks / Queue Page
        //get an array of quelist where 10 tracks is one index in the array
        var songs = tracks.slice(0, maxTracks);
        embeds[0] = new MessageEmbed()
        .setTitle(`<:M_report:933813086119428198> Lista de __${guild.name}__  -  [ ${player.queue.length} Canciones ]`)
        .setColor(es.color)
        .setDescription(String(songs.map((track, index) => `**\` ${++index}. \` ${track.uri ? `[${track.title.substr(0, 60).replace(/\[/igu, "\\[").replace(/\]/igu, "\\]")}](${track.uri})` : track.title}** - \`${track.isStream ? `TRANSMISI??N EN VIVO` : format(track.duration).split(` | `)[0]}\`\n> *Solicitado por: __${track.requester.tag}__*`).join(`\n`)).substr(0, 2048));
        if(player.queue.length > 10)
          embeds[0].addField(`**\` N. \` *${player.queue.length > maxTracks ? player.queue.length - maxTracks : player.queue.length} otras pistas ...***`, `\u200b`)
        embeds[0].addField(`**\` 0. \` __PISTA ACTUAL__**`, `**${player.queue.current.uri ? `[${player.queue.current.title.substr(0, 60).replace(/\[/igu, "\\[").replace(/\]/igu, "\\]")}](${player.queue.current.uri})`:player.queue.current.title}** - \`${player.queue.current.isStream ? `LIVE STREAM` : format(player.queue.current.duration).split(` | `)[0]}\`\n> *Requested by: __${player.queue.current.requester.tag}__*`)
            
    }
    var joinbutton = new MessageButton().setStyle('SUCCESS').setCustomId('Join').setEmoji(`937783970098204764`).setLabel(`Entrar`).setDisabled(false);
    var leavebutton = new MessageButton().setStyle('DANGER').setCustomId('Leave').setEmoji(`937783974439288965`).setLabel(`Salir`).setDisabled();
    var stopbutton = new MessageButton().setStyle('DANGER').setCustomId('Stop').setEmoji(`937783974439288965`).setLabel(`Detener`).setDisabled()
    var skipbutton = new MessageButton().setStyle('PRIMARY').setCustomId('Skip').setEmoji(`937783970098204764`).setLabel(`Saltar`).setDisabled();
    var shufflebutton = new MessageButton().setStyle('PRIMARY').setCustomId('Shuffle').setEmoji('937783973940179024').setLabel(`Barajar`).setDisabled();
    var pausebutton = new MessageButton().setStyle('SECONDARY').setCustomId('Pause').setEmoji('937783972971307039').setLabel(`Pausa`).setDisabled();
    var autoplaybutton = new MessageButton().setStyle('SUCCESS').setCustomId('Autoplay').setEmoji('937783971985645708').setLabel(`Auto-reproducci??n`).setDisabled();
    var songbutton = new MessageButton().setStyle('SUCCESS').setCustomId('Song').setEmoji(`937783971985645708`).setLabel(`Canci??n`).setDisabled();
    var queuebutton = new MessageButton().setStyle('SUCCESS').setCustomId('Queue').setEmoji(`937783971985645708`).setLabel(`Cola`).setDisabled();
    var forwardbutton = new MessageButton().setStyle('PRIMARY').setCustomId('Forward').setEmoji('937783970098204764').setLabel(`+10 Seg`).setDisabled();
    var rewindbutton = new MessageButton().setStyle('PRIMARY').setCustomId('Rewind').setEmoji('937783971239055481').setLabel(`-10 Seg`).setDisabled();
    var lyricsbutton = new MessageButton().setStyle('PRIMARY').setCustomId('Lyrics').setEmoji('937783975408181299').setLabel(`Letra`).setDisabled();
    if(!leave && player && player.queue && player.queue.current){
        skipbutton = skipbutton.setDisabled(false);
        shufflebutton = shufflebutton.setDisabled(false);
        stopbutton = stopbutton.setDisabled(false);
        songbutton = songbutton.setDisabled(false);
        queuebutton = queuebutton.setDisabled(false);
        forwardbutton = forwardbutton.setDisabled(false);
        rewindbutton = rewindbutton.setDisabled(false);
        autoplaybutton = autoplaybutton.setDisabled(false)
        pausebutton = pausebutton.setDisabled(false)
        if (player.get("autoplay")) {
            autoplaybutton = autoplaybutton.setStyle('SECONDARY')
        }
        if (!player.playing) {
            pausebutton = pausebutton.setStyle('SUCCESS').setEmoji('??????').setLabel(`Resume`)
        }
        if (!player.queueRepeat && !player.trackRepeat) {
            songbutton = songbutton.setStyle('SUCCESS')
            queuebutton = queuebutton.setStyle('SUCCESS')
        }
        if (player.trackRepeat) {
            songbutton = songbutton.setStyle('SECONDARY')
            queuebutton = queuebutton.setStyle('SUCCESS')
        }
        if (player.queueRepeat) {
            songbutton = songbutton.setStyle('SUCCESS')
            queuebutton = queuebutton.setStyle('SECONDARY')
        }
    }
    if(player){
        joinbutton = joinbutton.setDisabled()
        leavebutton = leavebutton.setDisabled(false);
    }
    if(leave){
        joinbutton = joinbutton.setDisabled(false)
        leavebutton = leavebutton.setDisabled(true);
    }
    //now we add the components!
    var components = [
      new MessageActionRow().addComponents([
        joinbutton,
        leavebutton,
      ]),
      new MessageActionRow().addComponents([
        skipbutton,
        stopbutton,
        pausebutton,
        autoplaybutton,
        shufflebutton,
      ]),
      new MessageActionRow().addComponents([
        songbutton,
        queuebutton,
        forwardbutton,
        rewindbutton,
        lyricsbutton,
      ]),
    ]
    return {
      embeds, 
      components
    }
}
module.exports.generateQueueEmbed = generateQueueEmbed;