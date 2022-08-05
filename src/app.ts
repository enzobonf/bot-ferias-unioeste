import 'dotenv/config';
import { TwitterApi, UserTimelineV1Paginator} from 'twitter-api-v2';
import * as cron from 'node-cron';

const { APP_KEY, APP_SECRET, ACCESS_TOKEN, ACCESS_SECRET, DATA_FERIAS } = process.env;
const inicioFerias = new Date(DATA_FERIAS);
inicioFerias.setUTCHours(3,0,0,0);

async function executaTweet(){

    try{

        const twitterClient = new TwitterApi({
            appKey: APP_KEY,
            appSecret: APP_SECRET,
            accessToken: ACCESS_TOKEN,
            accessSecret: ACCESS_SECRET,
        });

        const dataAgora = new Date();
        dataAgora.setHours(0,0,0,0);

        const diasAteFerias =
				(inicioFerias.valueOf() -
					dataAgora.valueOf()) /
				(1000 * 60 * 60 * 24); // fator de conversão ms -> dia
        
        const sufixos = {
            m: diasAteFerias > 1 ? 'm' : '',
            s: diasAteFerias > 1 ? 's' : '',
        }

        let tweetStr = `Falta${sufixos['m']} ${diasAteFerias} dia${sufixos['s']} para as férias da UNIOESTE`;

        await twitterClient.v1.tweet(tweetStr);
        console.log('Tweet postado', new Date());
        

        
    }
    catch(error){
        console.log(error);
    }
}

cron.schedule('0 0 9 * * *', async () => {
    await executaTweet();
}, {
    timezone: 'America/Sao_Paulo'
});
