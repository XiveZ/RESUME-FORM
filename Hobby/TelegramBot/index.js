const { default: fetch } = require('node-fetch');
const { Telegraf, Telegram } = require('telegraf');
const tumblr = require('tumblr.js');
const PixivApi = require('pixiv-api-client');
const dotenv = require('dotenv').config();
console.log(process.env)

const pixiv = new PixivApi();

// telegram token key
const telegraf = new Telegraf(process.env.TELEGRAM_TOKEN)

// tumblr key client
const client = tumblr.createClient({
    consumer_key: process.env.TUMBLR_CONSUMER_KEY,
    consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,
    token: process.env.TUMBLR_TOKEN,
    token_secret: process.env.TUMBLR_SECRET,
});

message_error = ['Чарговы сляпы, які не разумее, як мной карыстацца.',
    'Ты хоць разумееш, чаго хочаш?',
    'Мне шкада цябе.',
    'Мільёны мікробаў загінулі бессэнсоўна з-за тваёй памылкі.',
    'Займіся ўжо сапраўднай справай, калі не можаш авалодаць простым запытам.',
    `Зараз <pre>${new Date().getHours().toLocaleString({ hour12: false, hour: 'numeric' })}:${new Date().getMinutes().toLocaleString({ hour12: false, minute: '2-digit' })}</pre> і гэта добры час, каб на ўсё забіць.`,
    'Мне даспадобы твае мучэнні.',
    'Не тваё гэта — выдалі гісторыю разам з ботам.',
    'Дашлі дадзеныя сваёй карты — гэта аблегчыць пошук.',
    'Ту-ру-рум, ту-ту ру-рум, ту рум-рум-пум-пум.',
    'Крывыя толькі пальцы, ці яшчэ і жыццё?'
]

//<============================================================================================================================================>

telegraf.command('getPicturesAnArtStationByAuthor'.toLowerCase(), async function sendData(item) {

    try {
        if (item.message.text.split(" ").length == 1) {
            item.telegram.sendMessage(item.chat.id, 'Адсутнічае аўтар 🤷‍♀️')
            return;
        }
    } catch (err) {
        console.log(`Response: ${item.message.text}`)
    }

    let authors = [];
    let author_hash = []

    let titles = [];
    let titles_hash = [];

    let urls = [];
    let url_hash = [];

    let images = [];
    let images_hash = [];

    let hash_id = [];

    let number_page;

    let author_ = item.message.text.substring(32, item.message.text.length).trim();
    if(item.message.text.split(" ").length == 3){
        author_ = item.message.text.substring(32, item.message.text.length -2).trim();
        number_page = item.message.text.substring(item.message.text.length - 2, item.message.text.length).trim();
    }
    else{
        number_page = 0;
    }
    let url =`https://www.artstation.com/users/${author_}/projects?page=${number_page}`
    await fetch(url).then(async response => await response.json()).then(async data => {
        await item.telegram.sendMessage(item.chat.id,`<pre>Усяго работ: ${data.total_count}\nЗасталося работ: ${data.total_count - (data.data.length *(parseInt(number_page,10)+1))}</pre>`, {parse_mode: 'HTML'});
        setTimeout(()=>{},4500);
        for (let k = 0; k < data.data.length; k++) {
            hash_id.push(data.data[k].hash_id)
            titles.push(data.data[k].title);
            authors.push(author_);
            urls.push(data.data[k].permalink);
            images.push(data.data[k].cover.small_square_url)
        }


        for (let i = 0; i < hash_id.length; i++) {
            let url_hash_ = 'https://www.artstation.com/projects/' + hash_id[i] + '.json'
            await fetch(url_hash_).then(async response => response.json()).then(async data => {

                for (let j = 0; j < data.assets.length; j++) {
                    let r_ = await fetch(data.assets[j].image_url,{method: 'HEAD'})

                    if ((r_.headers.get('cf-polished')!=null || undefined) &&(parseInt(r_.headers.get('cf-polished').substring(r_.headers.get('cf-polished').indexOf('=')+1, r_.headers.get('cf-polished').length)))  > 5000000){
                        await item.telegram.sendMessage(item.chat.id, `<a href="${data.assets[j].image_url}">${data.user.username} — ${data.title}</a>`, {parse_mode:'HTML'});
                              continue
                            }
                    
                    if (data.assets[j].image_url.includes('gif')) { item.telegram.sendChatAction(item.chat.id, 'upload_document'); await item.telegram.sendDocument(item.chat.id, data.assets[j].image_url, { parse_mode: 'HTML', caption: `<a href="${data.permalink}">${data.user.username} — ${data.title}</a>` }); continue }
                    images_hash.push(data.assets[j].image_url);
                    titles_hash.push(data.title)
                    url_hash.push(data.permalink);
                    author_hash.push(data.user.username)
                }

                item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                for (; 0 < url_hash.length;)
                    await item.telegram.sendPhoto(item.chat.id, images_hash.shift(), { parse_mode: 'HTML', caption: `<a href="${url_hash.shift()}">${author_hash.shift()} — ${titles_hash.shift()}</a>` })

            }
            ).catch(err => console.log(err.message))
        }

        if (urls.length > 10) {
            for (; 0 < urls.length;) {
                if (urls.length < 10) break;
                item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                await item.telegram.sendMediaGroup(item.chat.id,
                    [
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${urls.shift()}">${authors.shift()} — ${titles.shift()}</a>`,
                            type: 'photo',
                            media: images.shift()

                        },
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${urls.shift()}">${authors.shift()} — ${titles.shift()}</a>`,
                            type: 'photo',
                            media: images.shift()

                        },
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${urls.shift()}">${authors.shift()} — ${titles.shift()}</a>`,
                            type: 'photo',
                            media: images.shift()

                        },
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${urls.shift()}">${authors.shift()} — ${titles.shift()}</a>`,
                            type: 'photo',
                            media: images.shift()

                        },
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${urls.shift()}">${authors.shift()} — ${titles.shift()}</a>`,
                            type: 'photo',
                            media: images.shift()

                        },
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${urls.shift()}">${authors.shift()} — ${titles.shift()}</a>`,
                            type: 'photo',
                            media: images.shift()

                        },
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${urls.shift()}">${authors.shift()} — ${titles.shift()}</a>`,
                            type: 'photo',
                            media: images.shift()

                        },
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${urls.shift()}">${authors.shift()} — ${titles.shift()}</a>`,
                            type: 'photo',
                            media: images.shift()

                        },
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${urls.shift()}">${authors.shift()} — ${titles.shift()}</a>`,
                            type: 'photo',
                            media: images.shift()

                        },
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${urls.shift()}">${authors.shift()} — ${titles.shift()}</a>`,
                            type: 'photo',
                            media: images.shift()

                        }
                    ]);
            }
        }
        if (urls.length < 10 && urls.length > 0) {
            for (; 0 < urls.length;) {
                item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                await item.telegram.sendPhoto(item.chat.id, images.shift(), {
                    parse_mode: 'HTML',
                    caption: `<a href="${urls.shift()}">${authors.shift()} — ${titles.shift()}</a>`,
                })
            }
        }


    }).catch(err => { console.log(err); item.telegram.sendMessage(item.chat.id, "Адсутнічае аўтар 🤷‍♀️"); });

}).catch(err => console.log(err.message));

//<============================================================================================================================================>


telegraf.command('latestAnArtStation'.toLowerCase(), async function sendData(item) {

    let authors = [];
    let titles = [];
    let urls = [];
    let images = [];
    let user = [];

    const response = await fetch('https://www.artstation.com/projects.json?page=0&sorting=latest').
        then(async response => await response.json()).then(async data => {

            for (let k = 0; k < data.data.length; k++) {
                titles.push(data.data[k].title);
                authors.push(data.data[k].user.full_name);
                images.push(data.data[k].cover.small_square_url);
                urls.push(data.data[k].permalink);
                user.push(data.data[k].user.username)
            }

            if (urls.length > 10) {
                for (; 0 < images.length;) {
                    item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                    await item.telegram.sendMediaGroup(item.chat.id,
                        [
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${urls.shift()}">(${user.shift()})${authors.shift()} — ${titles.shift()}</a>`,
                                type: 'photo',
                                media: images.shift()

                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${urls.shift()}">(${user.shift()})${authors.shift()} — ${titles.shift()}</a>`,
                                type: 'photo',
                                media: images.shift()

                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${urls.shift()}">(${user.shift()})${authors.shift()} — ${titles.shift()}</a>`,
                                type: 'photo',
                                media: images.shift()

                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${urls.shift()}">(${user.shift()})${authors.shift()} — ${titles.shift()}</a>`,
                                type: 'photo',
                                media: images.shift()

                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${urls.shift()}">(${user.shift()})${authors.shift()} — ${titles.shift()}</a>`,
                                type: 'photo',
                                media: images.shift()

                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${urls.shift()}">(${user.shift()})${authors.shift()} — ${titles.shift()}</a>`,
                                type: 'photo',
                                media: images.shift()

                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${urls.shift()}">(${user.shift()})${authors.shift()} — ${titles.shift()}</a>`,
                                type: 'photo',
                                media: images.shift()

                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${urls.shift()}">(${user.shift()})${authors.shift()} — ${titles.shift()}</a>`,
                                type: 'photo',
                                media: images.shift()

                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${urls.shift()}">(${user.shift()})${authors.shift()} — ${titles.shift()}</a>`,
                                type: 'photo',
                                media: images.shift()

                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${urls.shift()}">(${user.shift()})${authors.shift()} — ${titles.shift()}</a>`,
                                type: 'photo',
                                media: images.shift()

                            }]);
                }
            }
            if (urls.length < 10) {
                for (; 0 < urls.length;) {
                    item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                    await item.telegram.sendMediaGroup(item.chat.id, images.shift,
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${urls.shift()}">(${user.shift()})${authors.shift()} — ${titles.shift()}</a>`,
                        });
                }
            }

        });

    console.log("ArtStation: " + item.from)
}).catch(err => console.log(err.message));

//<============================================================================================================================================>


telegraf.command('getPicturesAnDeviantArtbyTag'.toLowerCase(), async function getData(item) {

    let image_url = [];
    let title = [];
    let author = [];
    let post_url = [];

    if (item.message.text.split(" ").length == 1) item.telegram.sendMessage(item.chat.id, 'Адсутнічае аўтар 🤷‍♀️');
    const response = await fetch(`https://www.deviantart.com/oauth2/token?client_id=${process.env.DEVIANT_ART_CLIENT_ID}&client_secret=${process.env.DEVIANT_ART_CLIENT_SECRET}&grant_type=client_credentials`); //get temporary token
    const token = await response.json();
    let url = `https://www.deviantart.com/api/v1/oauth2/browse/tags?tag=${item.message.text.substring(30, item.message.text.length).trim()}&offset=0&limit=50&access_token=${token.access_token}&mature_content=true`

    await fetch(url).then(async response => await response.json()).then(async data => {
        if (data.results.length == 0) item.telegram.sendMessage(item.chat.id, "Пошук не даў вынікаў")

        for (let i = 0; i < data.results.length; i++) {
            if (data.results[i].content.src.includes('gif')) {
                item.telegram.sendChatAction(item.chat.id, 'upload_document');
                await item.telegram.sendMessage(item.chat.id, `<a href = "${data.results[i].content.src}">${data.results[i].author.username} — ${data.results[i].title}</a>`, { parse_mode: 'HTML' });
                continue;
            }
            
            if (data.results[i].content.filesize > 5000000) {
                item.telegram.sendChatAction(item.chat.id, 'upload_document');
                await item.telegram.sendMessage(item.chat.id, `<a href ="${data.results[i].url}">${data.results[i].author.username} — ${data.results[i].title}</a>\n<a href = "${data.results[i].content.src}">\n\n❗❕❗Тэлеграм не падтрымлівае перадачу файла перавышаючага 5МБ❗❕❗</a>`, { parse_mode: 'HTML' });
             
                continue;
            }



            image_url.push(data.results[i].content.src);
            title.push(data.results[i].title.replace(new RegExp(/[\[\]]/gm), ''));
            author.push(data.results[i].author.username);
            post_url.push(data.results[i].url);
        }

        if (image_url.length > 10) {
            for (; 0 < image_url.length;) {
                item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                await item.telegram.sendMediaGroup(item.chat.id, [
                    {
                        type: 'photo',
                        parse_mode: 'Markdown',
                        caption: `[${author.shift()} — ${title.shift()}](${post_url.shift()})`,
                        media: image_url.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'Markdown',
                        caption: `[${author.shift()} — ${title.shift()}](${post_url.shift()})`,
                        media: image_url.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        media: image_url.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        media: image_url.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        media: image_url.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        media: image_url.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        media: image_url.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        media: image_url.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        media: image_url.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        media: image_url.shift()
                    }
                ]).catch(err => { console.log(err.message); return })
            }
        }
        if (image_url.length < 10 && image_url.length > 0) {
            for (; 0 < image_url.length;) {
                item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                await item.telegram.sendPhoto(item.chat.id, image_url.shift(), {
                    parse_mode: 'HTML',
                    caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`
                });
            }
        }
    })
        .catch(err => console.log(err.message))

})

//<============================================================================================================================================>


telegraf.command('getPicturesAnDeviantArtByAuthor'.toLowerCase(), async function sendData(item) {

    try {

        let urls = [];
        let author = [];
        let titles = [];
        let images = [];

        const response = await fetch(`https://www.deviantart.com/oauth2/token?client_id=${process.env.DEVIANT_ART_CLIENT_ID}&client_secret=${process.env.DEVIANT_ART_CLIENT_SECRET}&grant_type=client_credentials`); //get temporary token
        const token = await response.json();
        let url = await 'https://www.deviantart.com/api/v1/oauth2/gallery/all?username=' + `${item.message.text.substring(32, item.message.text.length).trim()}` + '&limit=24&offset=0' + '&access_token=' + token.access_token + '&mature_content=true';

        await fetch(url).then(async response => await response.json())
            .then(async data => {
                for (let k = 0; k < data.results.length; k++) {
                    if (data.results[k].content.src.includes('gif')) { item.telegram.sendChatAction(item.chat.id, 'upload_document'); await item.telegram.sendDocument(item.chat.id, data.results[k].content.src, { caption: `<a href="${data.results[k].url}">${data.results[k].author.username} — ${data.results[k].title}</a>`, parse_mode: 'HTML' }); continue }
                    titles.push(data.results[k].title);
                    images.push(data.results[k].content.src);
                    author.push(data.results[k].author.username);
                    urls.push(data.results[k].url)
                }

            });

        if (urls.length > 10) {
            for (; 0 < urls.length;) {
                if (images.length < 8) break;
                item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                await item.telegram.sendMediaGroup(item.chat.id, [
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${urls.shift()}">${author.shift()} — ${titles.shift()}</a>`,
                        media: images.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${urls.shift()}">${author.shift()} — ${titles.shift()}</a>`,
                        media: images.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${urls.shift()}">${author.shift()} — ${titles.shift()}</a>`,
                        media: images.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${urls.shift()}">${author.shift()} — ${titles.shift()}</a>`,
                        media: images.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${urls.shift()}">${author.shift()} — ${titles.shift()}</a>`,
                        media: images.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${urls.shift()}">${author.shift()} — ${titles.shift()}</a>`,
                        media: images.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${urls.shift()}">${author.shift()} — ${titles.shift()}</a>`,
                        media: images.shift()
                    },
                    {
                        type: 'photo',
                        parse_mode: 'HTML',
                        caption: `<a href="${urls.shift()}">${author.shift()} — ${titles.shift()}</a>`,
                        media: images.shift()
                    }
                ])
            }
        }

        if (urls.length < 10 && urls.length > 0) {
            for (const i = 0; i < urls.length;) {
                item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                await item.telegram.sendPhoto(item.chat.id, images.shift(), {
                    parse_mode: 'HTML',
                    caption: `<a href="${urls.shift()}">${author.shift()} — ${titles.shift()}</a>`,
                });
            }

        }
    } catch (err) {
        console.log(err.message)
        item.telegram.sendMessage(item.chat.id, 'Адсутнічае аўтар 🤷‍♀️')
    }
    console.log("DeviantArt: " + item.from)
});

//<============================================================================================================================================>


telegraf.command('getPicturesAnDeviantArtbyRecommended'.toLowerCase(), async function getRecommended(item) {
    const response = await fetch(`https://www.deviantart.com/oauth2/token?client_id=${process.env.DEVIANT_ART_CLIENT_ID}&client_secret=${process.env.DEVIANT_ART_CLIENT_SECRET}&grant_type=client_credentials`); //get temporary token
    let token = await response.json();

    let url = `https://www.deviantart.com/api/v1/oauth2/browse/recommended?q=${item.message.text.substring(38, item.message.text.length).trim()}&limit=50&mature_content=true&access_token=${token.access_token}`;

    let post_url = [];
    let image_url = [];
    let author = [];
    let title = [];
    await fetch(url).then(async response_ => await response_.json())
        .then(async data => {
            for (let i = 0; i < data.results.length; i++) {
                if (data.results[i].content.src.includes('gif')) { item.telegram.sendChatAction(item.chat.id, 'upload_document'); await item.telegram.sendDocument(item.chat.id, data.results[i].content.src, { parse_mode: 'HTML', caption: `<a href="${data.results[i].url}">${data.results[i].author.username} — ${data.results[i].title}</a>` }); continue }
                post_url.push(data.results[i].url);
                image_url.push(data.results[i].content.src);
                author.push(data.results[i].author.username);
                title.push(data.results[i].title);
            }

            if (image_url.length > 10) {
                for (; 0 < image_url.length;) {
                    if (image_url.length < 10) continue
                    item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                    await item.telegram.sendMediaGroup(item.chat.id, [
                        {
                            type: 'photo',
                            parse_mode: 'HTML',
                            media: image_url.shift(),
                            caption: `<a href="${post_url.shift()}>${author.shift()} — ${title.shift()}</a>"`
                        },
                        {
                            type: 'photo',
                            parse_mode: 'HTML',
                            media: image_url.shift(),
                            caption: `<a href="${post_url.shift()}>${author.shift()} — ${title.shift()}</a>"`
                        },
                        {
                            type: 'photo',
                            parse_mode: 'HTML',
                            media: image_url.shift(),
                            caption: `<a href="${post_url.shift()}>${author.shift()} — ${title.shift()}</a>"`
                        },
                        {
                            type: 'photo',
                            parse_mode: 'HTML',
                            media: image_url.shift(),
                            caption: `<a href="${post_url.shift()}>${author.shift()} — ${title.shift()}</a>"`
                        },
                        {
                            type: 'photo',
                            parse_mode: 'HTML',
                            media: image_url.shift(),
                            caption: `<a href="${post_url.shift()}>${author.shift()} — ${title.shift()}</a>"`
                        },
                        {
                            type: 'photo',
                            parse_mode: 'HTML',
                            media: image_url.shift(),
                            caption: `<a href="${post_url.shift()}>${author.shift()} — ${title.shift()}</a>"`
                        },
                        {
                            type: 'photo',
                            parse_mode: 'HTML',
                            media: image_url.shift(),
                            caption: `<a href="${post_url.shift()}>${author.shift()} — ${title.shift()}</a>"`
                        },
                        {
                            type: 'photo',
                            parse_mode: 'HTML',
                            media: image_url.shift(),
                            caption: `<a href="${post_url.shift()}>${author.shift()} — ${title.shift()}</a>"`
                        },
                        {
                            type: 'photo',
                            parse_mode: 'HTML',
                            media: image_url.shift(),
                            caption: `<a href="${post_url.shift()}>${author.shift()} — ${title.shift()}</a>"`
                        },
                        {
                            type: 'photo',
                            parse_mode: 'HTML',
                            media: image_url.shift(),
                            caption: `<a href="${post_url.shift()}>${author.shift()} — ${title.shift()}</a>"`
                        }
                    ])
                }
            }
            if (image_url.length > 0 && image_url.length < 10) {
                for (; 0 < image_url.length;) {
                    item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                    item.telegram.sendPhoto(item.chat.id, image_url.shift(),
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`
                        })
                }
            }
        }).catch(err => console.log(err.message));

})

//<============================================================================================================================================>


telegraf.command('getPicturesAnDeviantArtByDailyDeviations'.toLowerCase(), async function getdailydeviations(item) {

    let image_url = [];
    let post_url = [];
    let author = [];
    let title = [];

    const response = await fetch(`https://www.deviantart.com/oauth2/token?client_id=${process.env.DEVIANT_ART_CLIENT_ID}&client_secret=${process.env.DEVIANT_ART_CLIENT_SECRET}&grant_type=client_credentials`); //get temporary token
    const token = await response.json();

    let url = `https://www.deviantart.com/api/v1/oauth2/browse/dailydeviations?date=${item.message.text.substring(41, item.message.text.length).trim()}&mature_content=true&access_token=${token.access_token}`;

    await fetch(url).then(async response => await response.json()).then(async data => {

        for (let i = 0; i < data.results.length; i++) {
            if ("content" in data.results[i]) {
                console.log(i);
                if (data.results[i].content.filesize > 5000000) {
                    item.telegram.sendChatAction(item.chat.id, 'upload_document');
                    await item.telegram.sendMessage(item.chat.id,
                        `<a href="${data.results[i].url}">${data.results[i].author.username} — ${data.results[i].title}\n❗❕❗ Тэлеграм не падтрымлівае перадачу файла перавышаючага 5МБ ❗❕❗</a>`,
                        { parse_mode: 'HTML' }); continue
                }
                image_url.push(data.results[i].content.src);
                author.push(data.results[i].author.username);
                title.push(data.results[i].title);
                post_url.push(data.results[i].url)
            } else { continue; }

        }

        if (image_url.length > 10) {
            for (; 0 < image_url.length;) {
                if (image_url.length < 10) break;
                if (image_url.includes('gif')) { item.telegram.sendChatAction(item.chat.id, 'upload_document'); await (item.telegram.sendDocument(item.chat.id, image_url.shift, { parse_mode: 'HTML', caption: `<a href="${post_url.shift}">${author.shift()} — ${title.shift()} </a>` })); continue }
                item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                await item.telegram.sendMediaGroup(item.chat.id, [
                    {
                        type: 'photo',
                        media: image_url.shift(),
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        parse_mode: 'HTML'

                    },
                    {
                        type: 'photo',
                        media: image_url.shift(),
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        parse_mode: 'HTML'

                    },
                    {
                        type: 'photo',
                        media: image_url.shift(),
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        parse_mode: 'HTML'

                    },
                    {
                        type: 'photo',
                        media: image_url.shift(),
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        parse_mode: 'HTML'

                    },
                    {
                        type: 'photo',
                        media: image_url.shift(),
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        parse_mode: 'HTML'

                    },
                    {
                        type: 'photo',
                        media: image_url.shift(),
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        parse_mode: 'HTML'

                    },
                    {
                        type: 'photo',
                        media: image_url.shift(),
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        parse_mode: 'HTML'

                    },
                    {
                        type: 'photo',
                        media: image_url.shift(),
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        parse_mode: 'HTML'

                    },
                    {
                        type: 'photo',
                        media: image_url.shift(),
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        parse_mode: 'HTML'

                    },
                    {
                        type: 'photo',
                        media: image_url.shift(),
                        caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>`,
                        parse_mode: 'HTML'

                    }
                ])
            }
        }
        if (image_url.length < 10) {
            for (; 0 < image_url.length;) {
                if (image_url.includes('gif')) { item.telegram.sendChatAction(item.chat.id, 'upload_document'); await (item.telegram.sendDocument(item.chat.id, image_url.shift, { parse_mode: 'HTML', caption: `<a href="${post_url.shift}">${author.shift()} — ${title.shift()} </a>` })); continue }
                item.telegram.sendChatAction(item.chat.id, 'upload_photo')
                await item.telegram.sendPhoto(item.chat.id, image_url.shift(), { parse_mode: 'HTML', caption: `<a href="${post_url.shift()}">${author.shift()} — ${title.shift()}</a>` })
            }
        }
    }).catch(error => console.log(error.message));
})

//<============================================================================================================================================>

telegraf.command('getPicturesAnTumblrByAuthor'.toLowerCase(), async function sendData(data_) {
    try {
        if (data_.message.text.split(" ").length == 1) {
            data_.telegram.sendMessage(data_.chat.id, 'Адсутнічае аўтар 🤷‍♀️');
            return
        }
    } catch (err) {
        data_.telegram.sendMessage(data_.chat.id, err.message)
    }

    let image_url = [];
    let image_title = [];
    let image_post_url = [];

    let author = [];

    console.log(data_.message.text);
    await client.blogPosts(`${data_.message.text.substring(28, data_.message.text.length).trim()}.tumblr.com`, { type: 'photo', limit: 50 }, async function (err_, data) {

        if (err_ != null && err_.message == 'API error: 404 Not Found') {
            await data_.telegram.sendMessage(data_.chat.id, 'Адсутнічае аўтар 🤷‍♀️');
            return;
        }

        for (let k = 0; k < data.posts.length; k++) {

            try {
                if (data.posts[k].type == 'video') {
                    if (data.posts[k].type_video == "youtube" || "instagram") continue;
                    data_.telegram.sendChatAction(data_.chat.id, 'upload_video');
                    await data_.telegram.sendVideo(data_.chat.id, data.posts[k].video_url, {
                        parse_mode: 'HTML',
                        caption: `<a href="${data.posts[k].post_url}">${data.posts[k].blog.name} — ${data.posts[k].blog.title}</a>`
                    })
                    continue;
                }
            } catch (err) { console.log(err.message); return }

            try {
                if (data.posts[k].type == 'photo') {
                    for (let i = 0; i < data.posts[k].photos.length; i++) {

                        if (data.posts[k].photos[i].alt_sizes[0].url.includes("gif")) {
                            await data_.telegram.sendChatAction(data_.chat.id, 'upload_document');
                            await data_.telegram.sendDocument(data_.chat.id, data.posts[k].photos[i].alt_sizes[0].url,
                                {
                                    parse_mode: 'HTML',
                                    caption: `<a href="${data.posts[k].post_url}">${data.posts[k].blog.name} — ${data.posts[k].blog.title}</a>`
                                });
                            continue;
                        }

                        image_url.push(data.posts[k].photos[i].alt_sizes[0].url);
                        image_title.push(data.posts[k].blog.title);
                        image_post_url.push(data.posts[k].post_url);
                        author.push(data.posts[k].blog.name)
                    }
                }
            } catch (err) { console.log(err.message); return }
        }

        if (image_url.length > 10) {
            try {
                for (; 0 < image_url.length;) {
                    if (image_url.length < 10) break;
                    data_.telegram.sendChatAction(data_.chat.id, 'upload_photo');
                    await data_.telegram.sendMediaGroup(data_.chat.id,
                        [
                            {
                                type: 'photo',
                                parse_mode: 'HTML',
                                media: image_url.shift(),
                                caption: `<a href="${image_post_url.shift()}">${author.shift()} — ${image_title.shift()}</a>`
                            },
                            {
                                type: 'photo',
                                parse_mode: 'HTML',
                                media: image_url.shift(),
                                caption: `<a href="${image_post_url.shift()}">${author.shift()} — ${image_title.shift()}</a>`
                            },
                            {
                                type: 'photo',
                                parse_mode: 'HTML',
                                media: image_url.shift(),
                                caption: `<a href="${image_post_url.shift()}">${author.shift()} — ${image_title.shift()}</a>`
                            },
                            {
                                type: 'photo',
                                parse_mode: 'HTML',
                                media: image_url.shift(),
                                caption: `<a href="${image_post_url.shift()}">${author.shift()} — ${image_title.shift()}</a>`
                            },
                            {
                                type: 'photo',
                                parse_mode: 'HTML',
                                media: image_url.shift(),
                                caption: `<a href="${image_post_url.shift()}">${author.shift()} — ${image_title.shift()}</a>`
                            },
                            {
                                type: 'photo',
                                parse_mode: 'HTML',
                                media: image_url.shift(),
                                caption: `<a href="${image_post_url.shift()}">${author.shift()} — ${image_title.shift()}</a>`
                            },
                            {
                                type: 'photo',
                                parse_mode: 'HTML',
                                media: image_url.shift(),
                                caption: `<a href="${image_post_url.shift()}">${author.shift()} — ${image_title.shift()}</a>`
                            },
                            {
                                type: 'photo',
                                parse_mode: 'HTML',
                                media: image_url.shift(),
                                caption: `<a href="${image_post_url.shift()}">${author.shift()} — ${image_title.shift()}</a>`
                            },
                            {
                                type: 'photo',
                                parse_mode: 'HTML',
                                media: image_url.shift(),
                                caption: `<a href="${image_post_url.shift()}">${author.shift()} — ${image_title.shift()}</a>`
                            },
                            {
                                type: 'photo',
                                parse_mode: 'HTML',
                                media: image_url.shift(),
                                caption: `<a href="${image_post_url.shift()}">${author.shift()} — ${image_title.shift()}</a>`
                            }
                        ]
                    );
                }
            } catch (err) {
                console.log("Error: " + err.message + "\n" + data_.from)
            }
        }
        try {
            if (image_url.length < 10) {
                for (; 0 < image_url.length;) {
                    data_.telegram.sendPhoto(data_.chat.id, image_url.shift(),
                        {
                            parse_mode: 'HTML',
                            caption: `<a href="${image_post_url.shift()}">${author.shift()} — ${image_title.shift()}</a>`
                        });
                }
            }
        } catch (err) {
            data_.telegram.sendMessage("Error: low count images\n" + data_.message.text, err_.message);
        }
    });
    }).catch(err => console.log(err))


//<============================================================================================================================================>


    telegraf.command('getPicturesAnTumblByTag'.toLowerCase(), async function sendData(item) {

        let image_url = [];
        let image_title = [];
        let image_author = [];
        let image_post_url = [];

        let video_url = [];
        let video_title = [];
        let video_author = [];
        let video_post_url = [];

        let gif_url = [];
        let gif_title = [];
        let gif_author = [];
        let gif_post_url = [];

        try {
            if (item.message.text.split(" ").length == 1) {
                item.telegram.sendMessage(item.chat.id, 'Адсутнічае аўтар 🤷‍♀️')
                return;
            }
        } catch (err) {
            console.log(`Response: ${item.message.text}`)
        }

        client.taggedPosts(`${item.message.text.substring(24, item.message.text.length).trim()}`, async function (err, data) {
            const response = await data;

            for (let k = 0; k < data.length; k++) {
                if (data[k].type == 'text') continue;

                if (data[k].type == 'video') {
                    if (data[k].video_type == 'youtube' || 'instagram') continue;
                    video_url.push(data[k].video_url);
                    video_title.push(data[k].blog.title);
                    video_author.push(data[k].blog.name);
                    video_post_url.push(data[k].post_url);
                }

                else if (data[k].type == 'photo') {
                    for (let i = 0; i < data[k].photos.length; i++) {

                        if (data[k].photos[i].alt_sizes[0].url.includes('gif')) {
                            gif_url.push(data[k].photos[i].alt_sizes[0].url);
                            gif_author.push(data[k].blog.name);
                            gif_title.push(data[k].blog.title);
                            gif_post_url.push(data[k].post_url);
                            continue;
                        }
                        image_url.push(data[k].photos[i].alt_sizes[0].url);
                        image_author.push(data[k].blog.name);
                        image_title.push(data[k].blog.title)
                        image_post_url.push(data[k].post_url)

                    }
                } else {
                    continue;
                }
            }

            if (video_url.length != 0 || undefined || null) {
                for (let j = 0; j < video_url.length; j++) {
                    item.telegram.sendChatAction(item.chat.id, 'upload_video');
                    await item.telegram.sendVideo(item.chat.id, video_url[j], {
                        caption: `<a href="${video_post_url[j]}">${video_author[j]} — ${video_title[j]}</a>`,
                        parse_mode: 'HTML',
                    });
                }
            }

            if (gif_url.length != 0 || undefined || null) {
                for (let j = 0; j < gif_url.length; j++) {
                    item.telegram.sendChatAction(item.chat.id, 'upload_document');
                    await item.telegram.sendAnimation(item.chat.id, gif_url[j], {
                        caption: `<a href="${gif_post_url[j]}">${gif_author[j]} — ${gif_title[j]}</a>`,
                        parse_mode: 'HTML'
                    })
                }
            }

            if (image_url.length > 10) {
                for (let i = 0; i < image_url.length; i++) {
                    try {
                        item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                        await item.telegram.sendMediaGroup(item.chat.id, [
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${image_post_url.shift()}">${image_author.shift()} — ${image_title.shift()}</a>`,
                                media: image_url.shift(),
                                type: 'photo'
                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${image_post_url.shift()}">${image_author.shift()} — ${image_title.shift()}</a>`,
                                media: image_url.shift(),
                                type: 'photo'
                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${image_post_url.shift()}">${image_author.shift()} — ${image_title.shift()}</a>`,
                                media: image_url.shift(),
                                type: 'photo'
                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${image_post_url.shift()}">${image_author.shift()} — ${image_title.shift()}</a>`,
                                media: image_url.shift(),
                                type: 'photo'
                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${image_post_url.shift()}">${image_author.shift()} — ${image_title.shift()}</a>`,
                                media: image_url.shift(),
                                type: 'photo'
                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${image_post_url.shift()}">${image_author.shift()} — ${image_title.shift()}</a>`,
                                media: image_url.shift(),
                                type: 'photo'
                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${image_post_url.shift()}">${image_author.shift()} — ${image_title.shift()}</a>`,
                                media: image_url.shift(),
                                type: 'photo'
                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${image_post_url.shift()}">${image_author.shift()} — ${image_title.shift()}</a>`,
                                media: image_url.shift(),
                                type: 'photo'
                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${image_post_url.shift()}">${image_author.shift()} — ${image_title.shift()}</a>`,
                                media: image_url.shift(),
                                type: 'photo'
                            },
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${image_post_url.shift()}">${image_author.shift()} — ${image_title.shift()}</a>`,
                                media: image_url.shift(),
                                type: 'photo'
                            }
                        ]);
                        i = 0;
                        if (image_url.length < 10) continue;

                    } catch (e) {
                        console.log("Error: bad link\n" + item.chat.id, e.message, item.from)
                    }
                }
            }

            if (image_url.length < 10) {
                try {
                    for (let i = 0; i < image_url.length; i++) {
                        item.telegram.sendChatAction(item.chat.id, 'upload_photo');
                        await item.telegram.sendMediaGroup(item.chat.id, [
                            {
                                parse_mode: 'HTML',
                                caption: `<a href="${image_post_url.shift()}">${image_author.shift()} — ${image_title.shift()}</a>`,
                                media: image_url.shift(),
                                type: 'photo'
                            }
                        ])
                        i = 0;
                    }
                } catch (err) {
                    item.telegram.sendChatAction(item.chat.id, 'typing');
                    item.telegram.sendMessage(item.chat.id, err.message)
                }

            }
        })
        console.log("Tumbler get Tags: " + item.message.text);
    });

    //<============================================================================================================================================>


    telegraf.command('help', async function help(item) {
        item.telegram.sendChatAction(item.chat.id, 'typing');
        item.telegram.sendMessage(item.chat.id, '/latestanartstation — вяртае апошнія 50 работ, што карыстальнікі запампавалі на ArtStation \n\n' +
            '/getpicturesanartstationbyauthor <i>nameAuthor</i> — вяртае апошнія работы аўтара на ArtStation\n  <pre>[Напрыклад: /getpicturesanartstationbyauthor asuka111]</pre> \n\n' +
            '/getpicturesandeviantartbyauthor <i>nameAuthor</i> — вертае апошнія работы аўтара на DeviantArt\n    <pre>[Напрыклад: /getpicturesandeviantartbyauthor asuka111]</pre> \n\n' +
            '/getpicturesandeviantartbytag <i>tag</i> — вяртае апошнія работы па тэгу на DevianArt \n   <pre>[Напрыклад: /getpicturesandeviantartbytag asuka]</pre>\n\n' +
            '/getpicturesantumblbytag <i>tag</i> — вяртае работы па тэгу на Tumblr\n<pre>[Напрыклад: /getpicturesantumblbytag asuka]</pre>\n\n'+
            '/getPicturesandeviantartbydailydeviations <i>ГГГГ-ММ-ДзДз</i> — вяртае штодзенную падборку работ аўтараў на DeviantArt\n   <pre>[Напрыклад: /getpicturesandeviantartbydailydeviations 2021-01-13]</pre>\n\n' +
            '/getpicturesantumblrbyauthor <i>nameAuthor</i> — верне апошнія работы аўтара на Tumblr \n    <pre>[Напрыклад: /getpicturesantumblrbyauthor asuka111]</pre> \n', { parse_mode: 'HTML' }).catch(err => console.log(err.message));
        console.log("Help:" + item.from);
    });

    //<============================================================================================================================================>


    telegraf.command('start', async function start(item) {
        await item.telegram.sendMessage(item.chat.id, 'Гэты бот збірае работы аўтараў з такіх крыніц як:\n\n<pre>• ArtStation \n• DeviantArt \n• Tumblr </pre>  \n Больш падрабязна /help', { parse_mode: 'HTML' })
        console.log("Start: " + item.from)
    });

    //<============================================================================================================================================>

    telegraf.command('temp', async function getTemp(item) {
        try {
            if (item.message.text.split(" ").length == 1) item.telegram.sendMessage(item.chat.id, "Error: missing name place");
            let request_url = "https://api.openweathermap.org/data/2.5/weather?q=" + `${item.message.text.substring(5, item.message.text.length).trim()}` + ",by&appid=2b84f94bf10cf779b4a961dc64a0d585&units=metric";
            const response = await fetch(request_url);
            let data = await response.json();

            item.telegram.sendChatAction(item.chat.id, 'typing');
            item.telegram.sendMessage(item.chat.id, `<pre>Temp: ${data.main.temp} — ${data.weather[0].main}</pre>`, { parse_mode: 'HTML' })
        } catch (err) {

            console.log("Error with the temp: " + err.message, item.from);
        }
    });

    //<============================================================================================================================================>


    telegraf.command('qtemp', async function getTemp(item) {

        try {
            if (item.message.text.split(' ').length == 1) item.telegram.sendMessage(item.chat.id, "Error: missing name place");
            let nameCity = item.message.text.substring(6, item.message.text.length).trim();
            let url = `https://api.openweathermap.org/data/2.5/forecast?q=${nameCity},by&appid=2b84f94bf10cf779b4a961dc64a0d585&units=metric`;
            await fetch(url).then(async response => await response.json()).then(async data => {
                if (data.cod == 400) item.telegram.sendMessage(item.chat.id, `<pre>Error: bad request</pre>`, { parse_mode: 'HTML' });
                for (let i = 0; i < data.list.length; i++) {

                    item.telegram.sendChatAction(item.chat.id, 'typing');
                    await item.telegram.sendMessage(item.chat.id, `<pre>${data.city.name} — ${new Date(data.list[i].dt_txt).toLocaleString('be-BY')}: ${data.list[i].main.temp}℃ — ${data.list[i].weather[0].description}\n</pre>`
                        , { parse_mode: 'HTML' })
                }
            })

            console.log(item.from)

        } catch (err) {
            console.log(`Error: bad request\n`, item.from);
        }
    })

    //<============================================================================================================================================>


    telegraf.on('text', (item) => {
        item.telegram.sendChatAction(item.chat.id, 'typing');
        item.telegram.sendMessage(item.chat.id, message_error[Math.floor(Math.random() * 11)], { parse_mode: 'HTML' })
        item.telegram.sendSticker(item.chat.id, 'CAACAgIAAxkBAAKrDF_7ft4jAzmCKHGaHXlGfSpVjZb0AAK6BwACi0ZtJ_sHQaOt-Jm_HgQ')
    })

    telegraf.launch();