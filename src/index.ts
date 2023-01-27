import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
//import * as cron from 'node-cron';

const { APP_KEY, APP_SECRET, ACCESS_TOKEN, ACCESS_SECRET, DATA_FERIAS } =
    process.env;

const inicioFerias = new Date(DATA_FERIAS);
inicioFerias.setUTCHours(3, 0, 0, 0);

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

        const diasAteFerias = Math.trunc(
            (inicioFerias.valueOf() - dataAgora.valueOf()) /
                (1000 * 60 * 60 * 24),
        ); // fator de conversão ms -> dia

        const sufixos =
            diasAteFerias > 1 ? { m: 'm', s: 's' } : { m: '', s: '' };

        let tweetStr = `Falta${sufixos['m']} ${diasAteFerias} dia${sufixos['s']} para as férias da UNIOESTE`;

        if (diasAteFerias < 0) {
            console.log('Periodo de férias, nada foi executado');
            return;
        }

        if (diasAteFerias === 0) {
            tweetStr = 'BOAS FÉRIAS';
        } else if (diasAteFerias < 5) {
            for (let i = 0; i <= 5 - diasAteFerias; i++) tweetStr += '!';
        }

        console.log({
            APP_KEY,
            APP_SECRET,
            ACCESS_TOKEN,
            ACCESS_SECRET,
            DATA_FERIAS,
        });
        console.log(tweetStr);

        await twitterClient.v1.tweet('teste');
        console.log('Tweet postado', new Date());
    } catch (error) {
        console.log(error);
    }
}

executaTweet();

/* const task = cron.schedule(
    '0 0 9 * * *',
    async () => {
        console.log('Executando tarefa');
        await executaTweet();
    },
    {
        timezone: 'America/Sao_Paulo',
    },
);

task.start(); */
