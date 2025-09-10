import * as marked from 'marked';


const emote: marked.TokenizerExtension & marked.RendererExtension = {
    name: 'discord-emote',
    level: 'inline',
    start: (src: string) => {
        console.log('Hit Emote Check', src);
        return src.match(/\<(a)?:(.*?):([0-9]{1,})>/)?.index;
    },
    tokenizer(src: string, tokens: any) {
        const rule = /^\<(a)?:(.*?):([0-9]{1,})>/;
        const match = rule.exec(src);

        if (match) return {
            type: 'discord-emote',
            raw: match[0],
            animated: !!match[1],
            emoteName: match[2],
            emoteId: match[3]
        };

        return;
    },
    renderer(token) {
        const animated = token['animated'] ? 'gif' : 'png';
        const name = token['emoteName'];
        const id = token['emoteId'];

        return `<img src="https://cdn.discordapp.com/emojis/${id}.${animated}" class="emote" alt="${name}" />`;
    },
    childTokens: ['animated', 'emoteName', 'emoteId']
};

export default {
    emote
}