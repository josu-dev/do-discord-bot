import { APIActionRowComponent, APIEmbed, APIMessageActionRowComponent, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, Collection, ComponentType, GuildMember, InteractionCollector, SlashCommandBuilder, bold, italic, quote, underscore, userMention } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type';
import { pickRandom } from '../../lib';
import { Values } from '../../lib/utilType';


const embedColor = 5793266;

const rockPaperScissorsMap = {
    rock: '🪨',
    paper: '🧻',
    scissors: ':scissors:'
} as const;

const options = ['rock', 'paper', 'scissors'] satisfies Options[];

type Options = keyof typeof rockPaperScissorsMap;

type OptionsEmojis = typeof rockPaperScissorsMap[Options];

const roundResult = {
    tie: 'TIE',
    firstWin: 'FIRST_WIN',
    secondWin: 'SECOND_WIN'
} as const;

type RoundResult = Values<typeof roundResult>;


function resolveRound(first: Options, second: Options): RoundResult {
    if (first === second) {
        return roundResult.tie;
    }
    if (first === 'scissors') {
        return second === 'paper' ? roundResult.firstWin : roundResult.secondWin;
    }
    if (first === 'rock') {
        return second === 'scissors' ? roundResult.firstWin : roundResult.secondWin;
    }
    return second === 'rock' ? roundResult.firstWin : roundResult.secondWin;
}


const buttonOptions = [{
    type: ComponentType.ActionRow,
    components: [
        new ButtonBuilder()
            .setCustomId('rock')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🪨')
            .toJSON(),
        new ButtonBuilder()
            .setCustomId('paper')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🧻')
            .toJSON(),
        new ButtonBuilder()
            .setCustomId('scissors')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✂')
            .toJSON(),
    ]
}] satisfies APIActionRowComponent<APIMessageActionRowComponent>[];


interface RPSTrait {
    start(): Promise<unknown>;
    onCollect(interact: ButtonInteraction<CacheType>): Promise<unknown>;
    onEnd(collect: Collection<string, ButtonInteraction>, reason: string): Promise<unknown>;
}

type RunningMatches = Map<string, RPSTrait>;


class SingleplayerRPS implements RPSTrait {
    id: string;
    runningMatches: RunningMatches;
    baseInteract: ChatInputCommandInteraction<CacheType>;
    #ephemeral: boolean;
    member: GuildMember;
    roundCount: number;
    collector: InteractionCollector<ButtonInteraction<CacheType>>;
    embed: APIEmbed;
    embedFields: Exclude<APIEmbed['fields'], undefined>;

    constructor(runningMatches: RunningMatches, interact: ChatInputCommandInteraction<CacheType>, member: GuildMember, ephemeral: boolean = true) {
        this.id = member.id;
        this.runningMatches = runningMatches;
        this.baseInteract = interact;
        this.#ephemeral = ephemeral;
        this.member = member;
        this.roundCount = 0;
        this.embed = {};
        this.embedFields = [];

        this.collector = interact.channel!.createMessageComponentCollector({
            componentType: ComponentType.Button,
            idle: 60 * 1000,
            filter: (interac) => interac.member.id === member.id
        });

        this.collector.on('collect', this.onCollect.bind(this));
        this.collector.on('end', this.onEnd.bind(this));
        this.runningMatches.set(this.member.id, this);
    }

    async start() {
        this.embedFields = [{
            name: `Ronda 1`,
            value: `Elige tu jugada`
        }];
        this.embed = {
            title: `🎲 Piedra, Papel y Tijeras`,
            description: `${italic(this.member.displayName)} vs ${italic(this.baseInteract.guild?.members.me?.displayName ?? '')}`,
            fields: this.embedFields,
            color: embedColor
        };
        return this.baseInteract.reply({
            embeds: [this.embed],
            components: buttonOptions,
            fetchReply: true,
            ephemeral: this.#ephemeral,
        });
    }

    async onCollect(interact: ButtonInteraction<CacheType>) {
        await interact.deferUpdate({ fetchReply: false });

        const memberPlay = interact.customId as Options;
        const botPlay = pickRandom(options);
        const result = resolveRound(memberPlay, botPlay);

        this.embedFields.splice(
            this.embedFields.length - 1,
            1,
            {
                name: `Ronda ${this.roundCount + 1}`,
                value: (`${this.member.displayName}: ${rockPaperScissorsMap[memberPlay]}\n${interact.guild?.members.me?.displayName}: ${rockPaperScissorsMap[botPlay]}\n${(`${underscore('Resultado:')} ${(result === roundResult.tie ? 'Empate' : 'Gano ' + italic(result === roundResult.firstWin ? this.member.displayName : interact.guild?.members.me?.displayName ?? ''))}`)}`)
            }
        );
        if (this.roundCount !== 2) {
            this.embedFields.push({
                name: `Ronda ${this.roundCount + 2}`,
                value: `Elige tu jugada`
            });
        }

        await this.baseInteract.editReply({
            embeds: [this.embed],
            components: this.roundCount === 2 ? [] : undefined
        });

        if (this.roundCount === 2) {
            this.collector.stop('FINISHED_GAME');
            return;
        }
        this.roundCount++;
    }

    async onEnd(collect: Collection<string, ButtonInteraction>, reason: string) {
        this.runningMatches.delete(this.id);
        if (reason === 'FINISHED_GAME') {
            return;
        }

        if (reason === 'idle') {
            this.embedFields.at(-1)!.value += `\n\n` + quote(bold(`Juego cancelado por inactividad`));
            await this.baseInteract.editReply({
                embeds: [this.embed],
                components: []
            });
            return;
        }

        await this.baseInteract.editReply({
            components: []
        });
    }
}

class MultiplayerRPS implements RPSTrait {
    id: string;
    runningMatches: RunningMatches;
    baseInteract: ChatInputCommandInteraction<CacheType>;
    host: GuildMember;
    guest: GuildMember;
    roundCount: number;
    embedFields: Exclude<APIEmbed['fields'], undefined>;
    embed: APIEmbed;
    collector: InteractionCollector<ButtonInteraction<CacheType>>;
    plays: { host?: Options, guest?: Options; };
    summary: {
        host: number,
        guest: number;
    };

    constructor(runningMatches: RunningMatches, interact: ChatInputCommandInteraction<CacheType>, host: GuildMember, guest: GuildMember) {
        this.id = host.id;
        this.runningMatches = runningMatches;
        this.baseInteract = interact;
        this.host = host;
        this.guest = guest;

        this.roundCount = 0;
        this.embedFields = [];
        this.embed = {};
        this.plays = {
            host: undefined,
            guest: undefined,
        };
        this.summary = {
            host: 0,
            guest: 0,
        };

        this.collector = interact.channel!.createMessageComponentCollector({
            componentType: ComponentType.Button,
            idle: 60 * 1000,
            filter: (interac) => interac.member.id === host.id || interac.member.id === guest.id
        });

        this.collector.on('collect', this.onCollect.bind(this));
        this.collector.on('end', this.onEnd.bind(this));
        this.runningMatches.set(this.id, this);
    }

    async start() {
        this.embedFields = [{
            name: `Ronda 1`,
            value: `Elige tu jugada`
        }];
        this.embed = {
            title: `🎲 Piedra, Papel y Tijeras`,
            description: `${italic(userMention(this.host.id))} vs ${italic(userMention(this.guest.id))}`,
            fields: this.embedFields,
            color: embedColor
        };
        return this.baseInteract.reply({
            embeds: [this.embed],
            components: buttonOptions,
            fetchReply: true,
        });
    }

    async onCollect(interact: ButtonInteraction<CacheType>) {
        await interact.deferUpdate({ fetchReply: false });

        const isHost = interact.user.id === this.host.id;
        if (isHost) {
            if (this.plays.host) {
                return;
            }
            this.plays.host = interact.customId as Options;
        }
        else {
            if (this.plays.guest) {
                return;
            }
            this.plays.guest = interact.customId as Options;
        }
        if (!(this.plays.host && this.plays.guest)) {
            return;
        }
        const result = resolveRound(this.plays.host!, this.plays.guest!);
        if (result === roundResult.firstWin) {
            this.summary.host += 1;
        }
        else if (result === roundResult.secondWin) {
            this.summary.guest += 1;
        }

        this.embedFields.splice(
            this.embedFields.length - 1,
            1,
            {
                name: `Ronda ${this.roundCount + 1}`,
                value: (`${this.host.displayName}: ${rockPaperScissorsMap[this.plays.host!]}\n${this.guest.displayName}: ${rockPaperScissorsMap[this.plays.guest!]}\n${(`${underscore('Resultado:')} ${(result === roundResult.tie ? 'Empate' : 'Gano ' + italic(result === roundResult.firstWin ? this.host.displayName : this.guest.displayName))}`)}`)
            }
        );
        if (this.roundCount !== 2) {
            this.embedFields.push({
                name: `Ronda ${this.roundCount + 2}`,
                value: `Elige tu jugada`
            });
        }
        else {
            this.embedFields.at(-1)!.value += `\n\n` + quote(bold(this.summary.host === this.summary.guest ? `${this.host.displayName} y ${this.guest.displayName} empataron` : ((this.summary.host > this.summary.guest ? `${this.host.displayName} gano con ${this.summary.host}/3` : `${this.guest.displayName} gano con ${this.summary.guest}/3`))));
        }

        this.plays.host = undefined;
        this.plays.guest = undefined;

        await this.baseInteract.editReply({
            embeds: [this.embed],
            components: this.roundCount === 2 ? [] : undefined
        });

        if (this.roundCount === 2) {
            this.collector.stop('FINISHED_GAME');
            return;
        }
        this.roundCount++;
    }

    async onEnd(collect: Collection<string, ButtonInteraction>, reason: string) {
        this.runningMatches.delete(this.id);
        if (reason === 'FINISHED_GAME') {
            return;
        }
        if (reason === 'idle') {
            this.embedFields.at(-1)!.value += `\n\n` + quote(bold(`Juego cancelado por inactividad`));
            await this.baseInteract.editReply({
                embeds: [this.embed],
                components: []
            });
            return;
        }

        await this.baseInteract.editReply({
            components: []
        });
    }
}

export default (() => {
    const currentMatches = new Map<string, RPSTrait>();

    return {
        data: new SlashCommandBuilder()
            .setName('rock-paper-scissors')
            .setNameLocalization('es-ES', 'piedra-papel-tijeras')
            .setDescription('A game of rock, paper and scissors against the bot')
            .setDescriptionLocalization('es-ES', 'Un juego de piedra, papel y tijeras contra el bot')
            .addUserOption(opt => opt
                .setName(`versus`)
                .setDescription(`A member to play with`)
                .setDescriptionLocalization(`es-ES`, `Un miembro con el cual jugar`)
            )
            .addBooleanOption(opt => opt
                .setName(`ephemeral`)
                .setNameLocalization(`es-ES`, `efimero`)
                .setDescription(`Sets the response as ephemeral, default true`)
                .setDescriptionLocalization(`es-ES`, `Pone la respuesta como efimera, por defecto true`)
            )
        ,
        async execute({ interaction }) {
            const member = interaction.member;
            if (currentMatches.get(member.id)) {
                return interaction.reply({
                    content: `Termina tu partida antes de empezar una nueva`,
                    ephemeral: true
                });
            }

            let match: RPSTrait;
            const otherMember = interaction.options.getMember('versus');
            if (!otherMember) {
                match = new SingleplayerRPS(currentMatches, interaction, member, interaction.options.getBoolean('ephemeral') ?? undefined);
            }
            else {
                match = new MultiplayerRPS(currentMatches, interaction, member, otherMember);
            }

            return match.start();
        }
    };
}) satisfies SingleFileCommandDefinition;
