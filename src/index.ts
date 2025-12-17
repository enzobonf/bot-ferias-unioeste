import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import * as cron from 'node-cron';

const {
    APP_KEY,
    APP_SECRET,
    ACCESS_TOKEN,
    ACCESS_SECRET,
    DATA_FERIAS,
    DATA_RECESSO,
    EXECUTAR_DIRETO,
} = process.env;

if (!DATA_FERIAS) {
    throw new Error('DATA_FERIAS environment variable is required');
}

const inicioFerias = new Date(DATA_FERIAS);
if (isNaN(inicioFerias.getTime())) {
    throw new Error('DATA_FERIAS must be a valid date');
}
inicioFerias.setUTCHours(3, 0, 0, 0);

const inicioRecesso = DATA_RECESSO ? new Date(DATA_RECESSO) : null;
if (inicioRecesso) {
    if (isNaN(inicioRecesso.getTime())) {
        throw new Error('DATA_RECESSO must be a valid date');
    }
    inicioRecesso.setUTCHours(3, 0, 0, 0);
}

console.log('Bot iniciado com sucesso!');

const twitterClient = new TwitterApi({
    appKey: APP_KEY as any,
    appSecret: APP_SECRET,
    accessToken: ACCESS_TOKEN,
    accessSecret: ACCESS_SECRET,
});

async function executaTweet() {
    try {
        const dataAgora = new Date();
        dataAgora.setUTCHours(3, 0, 0, 0);

        console.log(`[DEBUG] Data atual: ${dataAgora.toISOString()}`);
        console.log(`[DEBUG] Data de férias: ${inicioFerias.toISOString()}`);
        if (inicioRecesso) {
            console.log(`[DEBUG] Data de recesso: ${inicioRecesso.toISOString()}`);
        }

        let dataAlvo = inicioFerias;
        let tipoEvento = 'férias';
        let mensagemFinal = 'BOAS FÉRIAS';
        let artigo = 'as';

        if (inicioRecesso) {
            const diasAteRecesso = Math.trunc(
                (inicioRecesso.valueOf() - dataAgora.valueOf()) /
                    (1000 * 60 * 60 * 24),
            );

            const recessoAntesDasFerias = inicioRecesso.valueOf() < inicioFerias.valueOf();

            console.log(`[DEBUG] Dias até recesso: ${diasAteRecesso}`);
            console.log(`[DEBUG] Recesso antes das férias: ${recessoAntesDasFerias}`);

            if (diasAteRecesso >= 0 && recessoAntesDasFerias) {
                dataAlvo = inicioRecesso;
                tipoEvento = 'recesso';
                mensagemFinal = 'BOM RECESSO';
                artigo = 'o';
                console.log(`[DEBUG] Selecionado: recesso (recesso ainda não passou e é antes das férias)`);
            } else {
                console.log(`[DEBUG] Selecionado: férias (recesso já passou ou férias vêm primeiro)`);
            }
        } else {
            console.log(`[DEBUG] Selecionado: férias (sem data de recesso configurada)`);
        }

        const diasAteEvento = Math.trunc(
            (dataAlvo.valueOf() - dataAgora.valueOf()) / (1000 * 60 * 60 * 24),
        );

        const sufixos =
            diasAteEvento > 1 ? { m: 'm', s: 's' } : { m: '', s: '' };

        let tweetStr = `Falta${sufixos['m']} ${diasAteEvento} dia${sufixos['s']} para ${artigo} ${tipoEvento} da UNIOESTE`;

        if (diasAteEvento < 0) {
            console.log(`Periodo de ${tipoEvento}, nada foi executado`);
            return;
        }

        if (diasAteEvento === 0) {
            tweetStr = mensagemFinal;
        } else if (diasAteEvento < 5) {
            for (let i = 0; i <= 5 - diasAteEvento; i++) tweetStr += '!';
        }

        console.log(tweetStr);

        await twitterClient.v2.tweet(tweetStr);
        console.log('Tweet postado', new Date());
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

const task = cron.schedule(
    '0 0 9 * * *',
    async () => {
        console.log('Executando tarefa');
        await executaTweet();
        process.exit(0);
    },
    {
        timezone: 'America/Sao_Paulo',
    },
);

async function main() {
    if (EXECUTAR_DIRETO === 'true') {
        console.log('Executando diretamente');
        await executaTweet();
        process.exit(0);
    } else {
        console.log('Iniciando agendamento');
        task.start();
    }
}

main();
