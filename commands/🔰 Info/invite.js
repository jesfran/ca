const {
	MessageEmbed, MessageButton, MessageActionRow
} = require("discord.js")
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { handlemsg } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "invite",
  category: "🔰 Info",
  aliases: ["add"],
  usage: "invite",
  description: "Gives you an Invite link for this Bot",
  type: "bot",
  run: async (client, message, args, cmduser, text, prefix) => {
    
    let es = client.settings.get(message.guild.id, "embed");let ls = client.settings.get(message.guild.id, "language")
    try {
      let user = message.mentions.users.first() || client.user;
      if(user) {
        if(!user.bot) return interaction?.reply({ephemeral: true, content: "<:no:833101993668771842> You can't Invite a Normal user! **IT MUST BE A BOT**"})
        let button_public_invite = new MessageButton().setStyle('LINK').setLabel(handlemsg(client.la[ls].cmds.info.invite.buttons.public)).setURL("https://discord.com/api/oauth2/authorize?client_id=935935328966045768&permissions=8&scope=bot%20applications.commands")
        let button_support_dc = new MessageButton().setStyle('LINK').setLabel(handlemsg(client.la[ls].cmds.info.invite.buttons.server)).setURL("https://discord.gg/cxAdRfwz")
        let button_invite = new MessageButton().setStyle('LINK').setLabel("Invita " + user.username).setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=8&scope=bot%20applications.commands`)
        //array of all buttons
        const allbuttons = [new MessageActionRow().addComponents([button_public_invite, button_support_dc, button_invite])]
        message.reply({ 
          embeds: [new MessageEmbed()
            .setColor(ee.color)
            .setTitle(`Invita: __**${user.tag}**__`)
            .setDescription(`||[*Haga clic aquí para obtener un enlace de invitación sin comandos de barra*](https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=8&scope=bot)||`)
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=8&scope=bot%20applications.commands`)
            .setFooter(client.getFooter(`${user.username} `, "https://images-ext-2.discordapp.net/external/U0H18BMn0mpqTlO1IGeb5lMHCBK-FU890slqijcL5Ik/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/933801868549828608/c25f3ee100d14cc3a30a7e3c251af9b6.webp"))],
          components: allbuttons
        });
      }
    } catch (e) {
      console.log(String(e.stack).grey.bgRed)
      return message.reply({embeds: [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["info"]["color"]["variable2"]))
      ]});
    }
  }
}
/**
 * @INFO
 * Bot Coded by Tomato#6966 | https://discord.gg/milrato
 * @INFO
 * Work for Milrato Development | https://milrato.eu
 * @INFO
 * Please mention him / Milrato Development, when using this Code!
 * @INFO
 */
