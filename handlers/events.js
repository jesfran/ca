const fs = require("fs");
const allevents = [];
module.exports = (client) => {
  try {
    let dateNow = Date.now();
    console.log(`${String("[x] :: ".blue)}Now loading the Events ...`.brightGreen)
    const load_dir = (dir) => {
      const event_files = fs.readdirSync(`./events/${dir}`).filter((file) => file.endsWith(".js"));
      for (const file of event_files) {
        try{
          const event = require(`../events/${dir}/${file}`)
          let eventName = file.split(".")[0];
          if(eventName == "message") continue;
          allevents.push(eventName);
          client.on(eventName, event.bind(null, client));
        }catch(e){
          console.log(String(e.stack).grey.bgRed)
        }
      }
    }
    ["client", "guild"].forEach(e => load_dir(e));
    
    console.log(`[x] :: `.blue + `Cargados los ${allevents.length} EVENTOS después de: `.brightGreen + `${Date.now() - dateNow}ms`.green)
    try {
      const stringlength2 = 69;
      console.log("\n")
      console.log(`     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`.blue)
      console.log(`     ┃ `.blue + " ".repeat(-1 + stringlength2 - ` ┃ `.length) + "┃".blue)
      console.log(`     ┃ `.blue + `Iniciando sesión en el BOT...`.white + " ".repeat(-1 + stringlength2 - ` ┃ `.length - `Iniciando sesión en el BOT...`.length) + "┃".blue)
      console.log(`     ┃ `.blue + " ".repeat(-1 + stringlength2 - ` ┃ `.length) + "┃".blue)
      console.log(`     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.blue)
    } catch {
      /* */ }
    } catch (e) {
    console.log(String(e.stack).grey.bgRed)
  }
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
