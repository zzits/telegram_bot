const TelegramApi = require("node-telegram-bot-api")

const TOKEN = "6371592392:AAHehlOoSgGKGea3IZycP8GDOdMS3Q-39zM"

const bot = new TelegramApi(TOKEN, {polling: true})

const admin = "1010086583"; 

bot.setMyCommands([
    { command: "/consultation", description: "Запис на консультацію"}
])

const benefits = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: "Наявні", callback_data: "true" }, { text: "Відсутні", callback_data: "false" }]
        ]
    })
}

// bot.on("message", async msg =>{
//     const text = msg.text;
//     const chatId = msg.chat.id;
//     const username = msg.from.username
//     if (text == "/start") {
//         return bot.sendMessage(chatId, "Привіт! Я твій бот");
//     }
//     if (text == "/consultation") {

//         await bot.sendMessage(chatId,"Введіть ваше ПІБ:")
//         .then(() => {
//             bot.once("message", async msg => {
//                 return bot.sendMessage(chatId, "Наявність пільг", benefits)
//                     .then((msg_benefits)  =>{
//                     bot.on("callback_query", async msg =>{
//                         const data = msg.data;
//                         const benefitsId = msg_benefits.message_id
//                         if (data == "true") {
//                             await bot.deleteMessage(chatId, benefitsId)
//                             return bot.sendMessage(chatId, "Відправте фото пільг")
//                         }
//                         else{
//                             await bot.deleteMessage(chatId, benefitsId)
//                             return bot.sendMessage(chatId, "Поверхово опишіть свій запит:")
//                             .then(() =>{
//                                 bot.on("message", async msg => {
//                                     return bot.sendMessage(chatId, "Ваша заявка була відправленна!")
//                                 })
//                             })
//                         }

//                     })
//                 })
                
//                 .then(() =>{
//                     bot.on("message", async msg => {

//                     })
//                 })
//             })
//         })
//         .catch((erorr) =>{
//             console.error(error)
//         })

//     }
// })
bot.onText(/\/consultation/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username

    bot.sendMessage(chatId, 'Введіть ваше ПІБ:').then(() => {
        bot.once('text', (name) => {
            const PIB = name.text;
            bot.sendMessage(chatId, 'Наявність пільг', benefits)
            .then((benefits_msg) => {
                bot.once('callback_query', (response) => {
                    const benefitsId = benefits_msg.message_id;
                    bot.deleteMessage(chatId, benefitsId)
                    if (response.data === 'false') {
                        bot.sendMessage(chatId, 'Поверхово опишіть свій запит:')
                        .then(() => {
                            bot.once("text", (description) =>{
                                bot.sendMessage(chatId, "Ваш запит було відправленно!")
                                bot.sendMessage(admin, 
                                    "Користувач: <b>@" + username +
                                    "\n</b>ПІБ: <b>"+PIB+
                                    "\n</b>Пільги відсутні"+
                                    "\nПричина запиту: <b>" + description.text +"</b>"
                                    , { parse_mode: 'HTML' })
                            })
                        })
                    } else if (response.data === 'true') {
                        bot.sendMessage(chatId, 'Відправте фото/документ пільг')
                        .then(() => {
                            bot.once("message", (benefitsData) =>{

                                bot.sendMessage(chatId, 'Поверхово опишіть свій запит:')
                                .then(() =>{
                                    bot.once("text", (description) =>{
                                        bot.sendMessage(chatId, "Ваш запит було відправленно!")
                                        bot.sendMessage(admin, 
                                            "Користувач: <b>@" + username +
                                            "\n</b>ПІБ: <b>"+PIB+
                                            "\n</b>Причина запиту: <b>" + description.text +"</b>"
                                            , { parse_mode: 'HTML' })
                                            bot.forwardMessage(admin, chatId, benefitsData.message_id)
                                        })
                                    })
                                })
                            })
                    }
                });
            });
        });
    });
});