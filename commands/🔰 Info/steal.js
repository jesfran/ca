const { Util, MessageEmbed } = require("discord.js");
const { parse } = require("twemoji-parser");

module.exports = {
  name: "stealemoji",
  aliases: ["steal"],
  category: "⚙️ Utility",
  run: async (client, message, args, prefix) => {
    let es = client.settings.get(message.guild.id, "embed");
let ls = client.settings.get(message.guild.id, "language")  

    if(!message.member.permissions.has("MANAGE_GUILD")) return message.channel.send(`${client.emojino} You dont have permission to \`Manage-GUILD\``)

    const emoji = args[0];
    const name = args.slice(1).join(" ");
    if (!emoji) {
      const embed = new MessageEmbed()
               .setTitle(`${client.emojino} Please give me an Emoji to add!`)
               .setColor(ee.wrongcolor)
      .setThumbnail(es.thumb ? es.footericon : null)
      .setFooter(es.footertext, es.footericon)
      return message.channel.send({ embeds: [embed] })
    }

    try {
      if (emoji.startsWith("https://cdn.discordapp.com")) {
        await message.guild.emojis.create(emoji, name || "give_name");

        const embed = new MessageEmbed()
          .setTitle(`${client.emojiyes} Added the Emoji!`)
          .setThumbnail(emoji)
          .setColor(ee.color)
      .setFooter(es.footertext, es.footericon)
          .setDescription(
            `Emoji Name: \`${
              name || "give_name"
            }\` `
          );
        return message.channel.send({ embeds: [embed] })
      }

      const customEmoji = Util.parseEmoji(emoji);

      if (customEmoji.id) {
        const link = `https://cdn.discordapp.com/emojis/${customEmoji.id}.${
          customEmoji.animated ? "gif" : "png"
        }` ;

        await message.guild.emojis.create(
          `${link}`,
          `${name || `${customEmoji.name}`}`
        ).then(emoji => {
       
        const embed = new MessageEmbed()
          .setTitle(`${client.emojiyes} Added The Emoji ${emoji.toString()}!`)
          .setColor(ee.color)
      .setFooter(es.footertext, es.footericon)
          .setThumbnail(`${link}`)
          
        return message.channel.send({ embeds: [embed] })
        });
      } else {
        const foundEmoji = parse(emoji, { assetType: "png" });
        if (!foundEmoji[0]) {
           const embed = new MessageEmbed()
               .setTitle(`${client.emojino} Provide a valid emoji.`)
               .setColor(ee.wrongcolor)
      .setThumbnail(es.thumb ? es.footericon : null)
      .setFooter(es.footertext, es.footericon)
          return message.channel.send({ embeds: [embed] });
        }
        const embed = new MessageEmbed()
               .setTitle(`${client.emojino} This is a normal \`Default-Discord\` emoji!`)
               .setColor(ee.wrongcolor)
      .setThumbnail(es.thumb ? es.footericon : null)
      .setFooter(es.footertext, es.footericon)
        message.channel.send({ embeds: [embed] })
      }
    } catch (e) {
      if (String(e).includes("DiscordAPIError: Maximum number of emojis reached (50)")) {
         const embed = new MessageEmbed()
               .setTitle(`${client.emojino} Maximum emoji count reached for this Server!`)
               .setColor(ee.wrongcolor)
      .setThumbnail(es.thumb ? es.footericon : null)
      .setFooter(es.footertext, es.footericon)
        
        return message.channel.send({ embeds: [embed] })
      }
    }
  },
};

/**
 *  🎒 Axontic Beta ● Vcodez Development 🧪
 * 🎨 @Masterious#2218 ¦ @lostfaye ៛#1268 ¦ @aledlb8#1196 🔍
 *  🎋 Unauthorized Duplication is Prohibited 🥏
 */