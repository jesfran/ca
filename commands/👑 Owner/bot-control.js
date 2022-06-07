var {
  MessageEmbed
} = require(`discord.js`);
var Discord = require(`discord.js`);
var config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
var emoji = require(`${process.cwd()}/botconfig/emojis.json`);
var {
  databasing, isValidURL
} = require(`${process.cwd()}/handlers/functions`);
module.exports = {
  name: "control-bot",
  category: "👑 Owner",
  aliases: ["controlpanel"],
  cooldown: 5,
  usage: "",
  type: "bot",
  description: "",
  run: async (client, message, args, cmduser, text, prefix) => {

    let es = client.settings.get(message.guild.id, "embed"); let ls = client.settings.get(message.guild.id, "language")
    let clientapp = client.application ? await client.application.fetch().catch(e => false) : false;
    let guild = client.guilds.cache.get("951310093868224534")
    if (!config.ownerIDS.some(r => r.includes(message.author.id)))
      return message.channel.send({
        embeds: [new MessageEmbed()
          .setColor(es.wrongcolor).setFooter(es.footertext, es.footericon)
          .setTitle(eval(client.la[ls]["cmds"]["owner"]["stopbot"]["variable1"]))
          .setDescription(eval(client.la[ls]["cmds"]["owner"]["stopbot"]["variable2"]))
        ]
      });
    const control = new Discord.MessageEmbed()
      .setColor(es.color)
      .setAuthor('Bot Control Panel', 'https://cdn.discordapp.com/attachments/933816426140155944/934156237027835934/emoji.png', client.credits)
      .setDescription(`<:a_right:933701797032361984> **Path:**
\`\`\`yml
${process.cwd()}
\`\`\`
<:a_right:933701797032361984> **Server:**
\`\`\`yml
${String(Object.values(require(`os`).networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i ?.family === `IPv4` && !i ?.internal && i ?.address || []), [])), [])).split(".")[3]}
\`\`\`
<:a_right:933701797032361984> **Command:**
\`\`\`yml
pm2 list | grep "${String(String(process.cwd()).split("/")[String(process.cwd()).split("/").length - 1]).toLowerCase()}" --ignore-case
\`\`\`
${clientapp ? `
<:a_right:933701797032361984> **Application Information:**
\`\`\`yml
Link: https://discord.com/developers/applications/${client.user.id}
Name: ${clientapp.name} 
${clientapp.owner.discriminator ? "Owner: " + clientapp.owner.tag : "Team: " + clientapp.owner.name + "\nMembers: " + clientapp.owner.members.map(uid => `${uid.user.tag}`).join(", ") + "\nTeam-Owner: " + `${guild.members.cache.get(clientapp.owner.ownerId) && guild.members.cache.get(clientapp.owner.ownerId).user ? guild.members.cache.get(clientapp.owner.ownerId).user.tag : clientapp.owner.ownerId}`} 
Icon: ${clientapp.iconURL()}
Bot-Public: ${clientapp.botPublic ? "✅" : "❌"} (Invite able)
\`\`\`
<:a_right:933701797032361984> **About me:**
\`\`\`yml
${clientapp.description ? clientapp.description : "❌ NO DESCRIPTION YET!"}
\`\`\``
          : ""}
`)
    message.channel.send({
      embeds: [control],
      components: [
        new Discord.MessageActionRow()
          .addComponents(
            new Discord.MessageButton()
              .setLabel(`Restart ${client.user.username}`)
              .setCustomId("restart_client")
             .setEmoji("934152287155269632") 
              .setStyle("PRIMARY"),
            new Discord.MessageButton()
              .setLabel(`Stop ${client.user.username}`)
              .setCustomId("stop_client")
              .setEmoji("934152965856591953")
              .setStyle("DANGER"),
            new Discord.MessageButton()
              .setLabel("Rename the bot")
              .setEmoji("📝")
              .setCustomId("rename_client")
              .setStyle("DANGER"),
            new Discord.MessageButton()
              .setLabel("Change Avatar")
              .setEmoji("📸")
              .setCustomId("changeav_client")
              .setStyle("DANGER")
          )
      ]
    })
  },
};