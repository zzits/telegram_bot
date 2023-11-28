const TelegramApi = require("node-telegram-bot-api")

const TOKEN = "6371592392:AAHehlOoSgGKGea3IZycP8GDOdMS3Q-39zM"

const bot = new TelegramApi(TOKEN, {polling: true})

const admin = "1010086583"; 

const userStates = {
};

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
const contactKeyboard = {
    reply_markup: JSON.stringify({
        one_time_keyboard: true,
        keyboard: [

            [{
                text: "Відпрвити данні акаунта",
                request_contact: true
            }],
            [{
                text: "Не відправляти"
            }]
        ]
    })
}

bot.onText(/\/consultation/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username
    console.log(userStates[String(chatId)], chatId)
    if (!userStates[String(chatId)]) {
        userStates[String(chatId)] = true
        bot.sendMessage(chatId, 'Введіть ваше ПІБ:').then(() => {
            bot.once('text', (name) => {
                if (chatId!==name.chat.id) {
    
                }
                else{
                    const PIB = name.text;
                    console.log("dfafjl;kdsa;jlkf")
                    bot.sendMessage(chatId, 'Наявність пільг', benefits)
                    .then((benefits_msg) => {
                        bot.once('callback_query', (response) => {
                            const benefitsId = benefits_msg.message_id;
                            bot.deleteMessage(chatId, benefitsId)
                            if (response.data === 'false') {
                                bot.sendMessage(chatId, 'Поверхово опишіть свій запит:')
                                .then(() => {
                                    bot.once("text", (description) =>{
                                        bot.sendMessage(chatId, "Відправте данні акаунта для подальшо зв'язку", contactKeyboard)
                                        .then(()=>{
                                            bot.once("contact", (user) =>{
                                                const phoneNumber = user.contact.phone_number;
                                                const firstName = user.contact.first_name;
                                                bot.sendMessage(chatId, "Ваш запит було відправленно!", { reply_markup:{ remove_keyboard: true }})
                                                bot.sendMessage(admin,
                                                    "ПІБ: <b>"+PIB+
                                                    "\n</b>Пільги відсутні"+
                                                    "\nПричина запиту: <b>" + description.text +"</b>"
                                                    , { parse_mode: 'HTML' }
                                                )
                                                bot.sendContact(admin,phoneNumber,firstName)
                                            })
                                            bot.once("text", () =>{
                                                bot.sendMessage(chatId, "Ваш запит було відправленно!", { reply_markup: { remove_keyboard: true } })
                                                bot.sendMessage(admin,
                                                    getUsername(username)+
                                                    "ПІБ: <b>" + PIB +
                                                    "\n</b>Пільги відсутні" +
                                                    "\nПричина запиту: <b>" + description.text + "</b>"
                                                    , { parse_mode: 'HTML' }
                                                )
                                            })
                                        })
                                    })
                                })
                            } 
                            else if (response.data === 'true') {
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
                                                    , { parse_mode: 'HTML' }
                                                )
                                                bot.forwardMessage(admin, chatId, benefitsData.message_id)
                                            })
                                        })
                                    })
                                })
                            }
                        });
                    });
                }
            });
        });
    }
});
// Нужно создать обьект в котором будет пользователи и у пользователей будут параметры "step" и "action"
    if (username === undefined) {
        console.log(username)
        return "Користувач не надав данні\n";
    }
    return "Користувач: <b>@" + username +"</b> \n";
}