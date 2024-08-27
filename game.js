import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { start } from './server.js';
import {clearArt, mobArt, LvUPArt} from "./arts.js";
import {achieve} from "./achievements.js"

class Player {
  constructor() {
    this.hp = 100;
    this.damage = Math.ceil(10*(Math.random()*1+1)); //스테이지당 유저 공격력
    this.defense = 1;
  };

  attack(monster) {
   monster.hp = monster.hp - this.damage;
     };


  levelUp(stage) {
    this.hp = 100 + stage * 5; // 체력 회복
    this.damage = Math.ceil(this.damage * 1.3);//공격력 업
    this.defense += 1;
  };
 

}

class Monster {
  constructor(stage) {
    this.hp = 70 + stage * 10;
    this.damage = stage * Math.ceil(Math.random()*6+5);
   // 몬스터가 주는 데미지: 난수(5~10) * stage 수 
  }

  attack(player) {
    // 몬스터의 공격 
    player.hp = player.hp - this.damage;
  }

  sturdyAttack(player, weight){
    player.hp = player.hp - this.damage*weight
  } // 강한 공격: 난수(5~10) * stage 수 * 가중치 

}


function displayStatus(stage, player, monster) {

  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(`| 플레이어 정보 hp: ${player.hp} damage: ${player.damage} |`) +
    chalk.redBright(`\n| 몬스터 정보 hp: ${monster.hp} damage: ${monster.damage} |`),
  );
  console.log(chalk.magentaBright('='.repeat(70)));
}


const battle = async (stage, player, monster) => {
  function delay(){
    console.clear();
    displayStatus(stage, player, monster);
    logs.forEach((log) => console.log(log));
  };

  async function runAway() {
    let probability  = Math.random();// 1/2 확률
    if(probability <=0.5 ){
      await new Promise((resolve) => setTimeout(resolve, 500));
      delay();
      logs.push(chalk.red('도망에 성공했다!'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(chalk.yellow('다음 과제로 도망갑니다..'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true; 
  } else{
      await new Promise((resolve) => setTimeout(resolve, 500));
      delay();
      logs.push(chalk.red('도망 칠 수 없었다!'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      delay();
      logs.push(chalk.red(`"히히 못 가~"
        당신은 ${monster.damage*2}의 피해를 입었습니다!`));
      monster.sturdyAttack(player, 2);// 도망 못 갈 시 2배 피격
      await new Promise((resolve) => setTimeout(resolve, 500));
      
    }  return false;
  };

  
  let logs = [];
 
  logs.push(mobArt)
  logs.push(chalk.red(`교양2 과제 (Lv.${stage})가 나타났다!`));
  logs.push('')
  while (player.hp > 0) {

    delay();
    
    console.log(chalk.green(`\n1. 공격한다 2. 아무것도 하지않는다. 3. 도망간다. 4. 나가기`));
    const choice = readlineSync.question('당신의 선택은? ');
    logs.push('')
    logs.push(chalk.green(`${choice}을(를) 선택하셨습니다.`));

    switch (choice) {
      case '1':
        logs.push(chalk.blue(`당신의 공격!🔪
          "나는 능히 할 수 있다!!!"`));
        player.attack(monster);
        delay();
        await new Promise((resolve) => setTimeout(resolve, 500)); 

        logs.push(chalk.red(`과제의 반격!
          당신은 ${monster.damage}의 피해를 입었습니다!`));
        monster.attack(player);
        delay();
        await new Promise((resolve) => setTimeout(resolve, 500)); 
        break;

      case '2':
        logs.push(`당신은 아무것도 하지 않았다.
          "나는.... 능이 버섯이다...!!"`);
        delay();
        await new Promise((resolve) => setTimeout(resolve, 500)); 

        logs.push(chalk.red(`의기 양양한 과제의 농축 공격!
          당신은 ${monster.damage*1.5}의 피해를 입었습니다!`));
        monster.sturdyAttack(player, 1.5);
        delay();
        await new Promise((resolve) => setTimeout(resolve, 500)); 
        break;

      case '3':
        logs.push(`당신은 도망을 택했다.`);
        let ranAway = await runAway();
        if (ranAway) {
          achieve(`2. 럭키비키`);// 도망 성공 시 업적
          return;
        } break; 

      case '4':
        logs.push('메인 화면으로 나갑니다.')
        delay();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await start();
        break;

      default:
          delay();
          logs.push(chalk.red('올바른 선택을 하세요.'));
          break;
        
    }

    if (monster.hp <= 0) {
      monster.hp = 0
      if (stage <= 9) {
        console.log(`당신의 승리~`);
        console.log(LvUPArt)
        player.levelUp(stage);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } 
      return;
    }
    
    logs.push(chalk.blue(`플레이어 HP: ${player.hp}, 몬스터 HP: ${monster.hp}`));
  }
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건
    if (player.hp <= 0) {
      console.log(chalk.red('당신은 그만 정신을 잃고 말았습니다.'));
      console.log(chalk.red('GAME OVER'));
      setTimeout(() => console.log(chalk.red('패배했습니다. 메인 메뉴로 돌아갑니다')), 1000);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await start();
      return;
    }

    stage++;
  }

  if (player.hp > 0) {
    clearArt();
    achieve(`1. 과제 학살자`);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    await start();
  }
}

