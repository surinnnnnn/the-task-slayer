import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { start } from './server.js';
import { clearArt, mobArt, LvUPArt } from './arts.js';
import { achieve } from './achievements.js';

class Player {
  constructor() {
    this.hp = 100;
    this.damage = 5 + Math.ceil(5 * (Math.random())); //1 스테이지 유저 공격력
    this.defense = 0.5; //1 스테이지 방어 확률
    this.runAwayRate = 0.5; //1 스테이지 도망 확률
  }

  attack(monster) {
    monster.hp = monster.hp - this.damage;
  }

  levelUp(stage) {
    this.hp = 100 + stage * 10; // 체력 회복
    this.damage = 5 + stage * Math.ceil(Math.random() * 3 + 7); //공격력 업(7~10랜덤)
    this.defense = Number((this.defense+ Math.ceil(Math.random() * 4 + 1)/100).toFixed(2)); // 방어율 업(0.01~0.05)
    this.runAwayRate = Number((this.runAwayRate + (Math.random() *2+1)/100).toFixed(2)); //도망확률 업(0.01~0.03)
  }

  shield() {
    const probability = Math.random();
    if (probability <= this.defense) {
      return true;
    } else {
      return false;
    }
  }

  runAway() {
    const probability = Math.random();
    if (probability <= this.runAwayRate) {
      return true;
    } else {
      return false;
    }
  }
}

class Monster {
  constructor(stage) {
    this.hp = 70 + stage * 10;
    this.damage = stage * Math.ceil(Math.random() * 5 + 5); // 몬스터가 주는 데미지: 랜덤(5~10) * stage
  }

  attack(player) {
    player.hp = player.hp - this.damage;
  }

  variableAttack(player, weight) {
    player.hp = player.hp - Math.ceil(this.damage * weight);
  } // 변이 공격: 기본 공격력 * 가중치
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n======= Stage: ${stage} =======`));
  console.log(
    chalk.cyanBright(`| Player Status  `) +
      chalk.blueBright(`| hp: ${player.hp} | 공격력: ${player.damage} | 방어확률: ${Math.round(player.defense*100)}% | 도망확률: ${Math.round(player.runAwayRate*100)}% |`,
      ) +
      chalk.cyanBright(`\n| Monster Status `) + chalk.redBright(`| hp: ${monster.hp} | 공격력: ${monster.damage} |`),
  );
  console.log(chalk.magentaBright('='.repeat(70)));
}

export async function delay(time) {
  await new Promise((resolve) => setTimeout(resolve, time));
}

const battle = async (stage, player, monster) => {
  function logsClear() {
    console.clear();
    displayStatus(stage, player, monster);
    logs.forEach((log) => console.log(log));
  }

  let logs = [];

  logs.push(mobArt);
  logs.push(chalk.red(`교양2 과제 (Lv.${stage})가 나타났다!`));
  logs.push('');
  while (player.hp > 0) {
    logsClear();

    console.log(
      chalk.green(`\n1. 공격한다 2. 아무것도 하지않는다. 3. 방어한다. 4. 도망간다. 5. 나가기`),
    );
    const choice = readlineSync.question('당신의 선택은? ');
    logs.push('');
    logs.push(chalk.green(`${choice}을(를) 선택하셨습니다.`));

    switch (choice) {
      case '1':
        logs.push(chalk.blue(`당신의 공격!🔪 \n"나는 능히 할 수 있다!!!"`));
        player.attack(monster);
        logsClear();
        await delay(500);

        logs.push(chalk.red(`과제의 반격! \n당신은 ${monster.damage}의 피해를 입었습니다!`));
        monster.attack(player);
        logsClear();
        await delay(500);
        break;

      case '2':
        logs.push(`당신은 아무것도 하지 않았다.\n"나는.... 능이 버섯이다...!!"`);
        logsClear();
        await delay(500);

        logs.push(
          chalk.red(
            `의기 양양한 과제의 농축 공격! \n당신은 ${Math.ceil(monster.damage * 1.3)}의 피해를 입었습니다!`,
          ),
        );
        monster.variableAttack(player, 1.3);
        logsClear();
        await delay(500);
        break;

      case '3':
        logs.push(`당신은 방어를 택했습니다.`);
        if (player.shield()) {
          logsClear();
          await delay(500);
          logs.push(chalk.blue(`방어 성공!`));
          

        } else {
          logsClear();
          await delay(500);
          logs.push(chalk.red(`방어 실패!`));
          logsClear();
          await delay(500);
          monster.variableAttack(player, 0.5); // 방어 실패 시 1/2 피격
          logs.push(chalk.red(`그러나 적의 공격을 정통으로 맞지 않았다! \n당신은 ${monster.damage* 0.5}의 피해를 입었습니다!`));
        }
        logsClear();
        await delay(500);
         break;

      case '4':
        logs.push(`당신은 도망을 택했다.`);
        if (player.runAway()) {
          await delay(500);
          logsClear();
          console.log(chalk.blue('도망에 성공했다!'));
          await delay(500);
          if(stage >= 6){
            console.log(`업적이 추가됐습니다. '업적 확인' 옵션에서 확인하세요.`);
            achieve(`[도주 성공] 럭키비키`); // 6단계 부터 도망 못갈 시 리스크 커짐 도망 성공 시 업적
          }
          player.levelUp(stage); // 도망 성공 시 레벨업
          await delay(500);
          console.log(chalk.yellow('다음 과제로 도망갑니다..'));
          await delay(1000);
          return;
        } else {
          await delay(500);
          logsClear();
          logs.push(chalk.red('도망 칠 수 없었다!'));
          await delay(500);
          logsClear();
          logs.push(
            chalk.red(
              `"히히 못 가~"\n 당신은 ${Math.ceil(monster.damage * 2)}의 큰 피해를 입었습니다!`,
            ),
          );
          monster.variableAttack(player, 2); // 도망 못 갈 시 2배 피격
          await delay(500);
          break;
        }

      case '5':
        logs.push('메인 화면으로 나갑니다.');
        logsClear();
        await delay(1000);
        await start();
        break;

      default:
        logsClear();
        logs.push(chalk.red('올바른 선택을 하세요.'));
        break;
    }

    if (monster.hp <= 0) {
      monster.hp = 0;
      if (stage <= 9) {
        console.log(`당신의 승리~`);
        console.log(LvUPArt);
        player.levelUp(stage);
        await delay(1500);
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
      console.log(chalk.yellow(`업적이 추가됐습니다. '업적 확인' 옵션에서 확인하세요.`));
      achieve(`[패배] 암 오케, I'm fine, 괜찮아..괜찮아.. 딩딩딩딩딩`);
      setTimeout(() => console.log(chalk.white('패배했습니다. 메인 메뉴로 돌아갑니다')), 1000);
      await delay(3000);
      await start();
      return;
    }

    stage++;
  }

  if (player.hp > 0) {
    clearArt();
    console.log(chalk.yellow(`업적이 추가됐습니다. '업적 확인' 옵션에서 확인하세요.`));
    achieve(`[승리] 과제 학살자`);
    await delay(4000);
    await start();
  }
}
