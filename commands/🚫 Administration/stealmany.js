const Discord = require('discord.js')
const { parse } = require("twemoji-parser");
const { MessageEmbed } = require("discord.js");


module.exports = {
    name: "stealmany",
    category: "โ๏ธ Utility",
    run: async (client, message, args) => {
      if (!message.member.permissions.has("MANAGE_EMOJIS")) return message.reply(`${client.emojino} **You Don't Have Permission To Use This Command**`)

      const emojis = args.join(" ").match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/gi)
      if (!emojis) return message.reply(`${client.emojino} **Provide The emojis to add**`);

      emojis.forEach(emote => {
        let emoji = Discord.Util.parseEmoji(emote);
        if (emoji.id) {
        const Link = `https://cdn.discordapp.com/emojis/${emoji.id}.${
          emoji.animated ? "gif" : "png"
        }`
        
        
        message.guild.emojis.create(`${Link}`, `${`${emoji.name}`}`)
        .then(em => message.reply(`**The emoji: โฌ${em.toString()}โญ Was successfuly added!**`)).catch(error => {
          message.reply(`${client.emojino} An Error occured`)
          console.log(error)
        })
        
          
        }
        })
}
}

/**
 *  ๐ Axontic Beta โ Vcodez Development ๐งช
 * ๐จ @Masterious#2218 ยฆ @lostfaye แ#1268 ยฆ @aledlb8#1196 ๐
 *  ๐ Unauthorized Duplication is Prohibited ๐ฅ
 */