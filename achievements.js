import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { start } from './server.js';

export async function achievements() {
    console.clear();

    // 타이틀 텍스트
    console.log(
        chalk.black.bold (
            figlet.textSync('The task slayer', {
                font: 'slant', 
                horizontalLayout: 'default',
                verticalLayout: 'default'
                
            })
        )
    );

    // 상단 경계선
    const line = chalk.white('='.repeat(70));
    console.log(line);

    if (achievedThigs.length > 0) {
        console.log(chalk.yellow('달성한 업적:'));
        achievedThigs.forEach((log, index) => console.log(chalk.white(`${index + 1}. ${log}`)));
    } else {
        console.log(chalk.gray('아직 달성한 업적이 없습니다.'));
    }
   
    console.log(line);

    console.log(chalk.blue('1.') + chalk.white('나가기'));
    console.log(chalk.blue('2.') + chalk.white('게임 종료'));
    console.log(chalk.gray('원하는 옵션을 선택 후 엔터를 누르세요.'));

    await handleUserInput();
}
    
export async function handleUserInput() {
    const choice = readlineSync.question('입력: ');
    switch (choice) {
        case '1':
            console.log(chalk.green('메인 화면으로 나갑니다.'));
           await new Promise(resolve => setTimeout(resolve, 1000));
           await start();
           break; 
         
        case '2':
            console.log(chalk.green('게임을 종료합니다.'));
            await new Promise(resolve => setTimeout(resolve, 1000));
            process.exit(0);

        default:
           console.log(chalk.red('올바른 선택을 하세요.'));
           await handleUserInput();
    }      
};

let achievedThigs = []
export function achieve(achieveName){
    achievedThigs.push(achieveName)
    };
    
