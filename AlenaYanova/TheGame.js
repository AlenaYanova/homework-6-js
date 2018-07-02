var _ = require('underscore');

function Character(charName, className, life, damage ){
    this.name = charName;
    this.class = className;
    this.life = life;
    this.damage = damage;
    this.maxLife = life;
    this.skillCounter = 2;
    this.potionCounter = _.sample([0, 0, 0, 1, 2]) * 2;
}

Character.prototype.getName = function() {
    return this.name;
}

Character.prototype.getClass = function() {
    return this.class;
}

Character.prototype.getDescription = function() {
    return 'Character ' + this.getName() + ' from class ' + this.getClass();
}

Character.prototype.setLife = function(dmg) {
    this.life -= dmg;
}

Character.prototype.getDamage = function() {
    return this.damage;
}

Character.prototype.attack = function(obj) {
    obj.setLife(this.getDamage());
}

Character.prototype.isAlive = function() {
    return this.life > 0;
}

Character.prototype.getLife = function() {
    return this.life;
}

Character.prototype.shouldUseSkill = function() {
    return (this.life < this.maxLife/2 && this.skillCounter > 0);
}

Character.prototype.shouldUsePotion = function() {
    return (this.potionCounter > 0 && this.shouldUseSkill());
}

Character.prototype.renewParameters = function () {
    this.skillCounter = 2;
    this.life = this.maxLife;
}


function Hero () {
    Character.apply(this, arguments);
}


Hero.prototype = Object.create(Character.prototype);
Hero.prototype.constructor = Hero;


Hero.prototype.getDescription = function() {
    return 'Hero ' + this.getName() + ' from class ' + this.getClass();
}

Hero.prototype.setLife = function(dmg) {

    if ( this.shouldUseSkill() ) {
        this.skillCounter--;
    } else {
        this.life -= dmg;
    }

}

Hero.prototype.getDamage = function () {
    if (this.shouldUsePotion()){
        this.potionCounter--;
        return this.damage*2;
    }
    else
        return this.damage;
};


function ThiefFactory(name) {
    var CLASS_NAME = 'Thief', LIFE = 320, DAMAGE = 40;
    return new Hero(name, CLASS_NAME, LIFE, DAMAGE)
}

function WarriorFactory(name) {
    var CLASS_NAME = 'Warrior', LIFE = 250, DAMAGE = 75;
    return new Hero(name, CLASS_NAME, LIFE, DAMAGE)
}

function WizardFactory(name) {
    var CLASS_NAME = 'Wizard', LIFE = 220, DAMAGE = 100;
    return new Hero(name, CLASS_NAME, LIFE, DAMAGE)
}


function Monster () {
    Character.apply(this, arguments);
}


Monster.prototype = Object.create(Character.prototype);
Monster.prototype.constructor = Monster;


Monster.prototype.getDescription = function() {
    return 'Monster ' + this.getName() + ' from class ' + this.getClass();
}

Monster.prototype.getDamage = function() {

    if ( this.shouldUseSkill() ) {
        this.skillCounter--;
        return this.damage*2;
    }

    return this.damage;
}

Monster.prototype.setLife = function (dmg) {
    if ( this.shouldUsePotion() ) {
        this.potionCounter--;
    } else {
        this.life -= dmg;
    }
}


function GoblinFactory(name) {
    var CLASS_NAME = 'Goblin', LIFE = 250, DAMAGE = 75;
    return new Monster(name, CLASS_NAME, LIFE, DAMAGE)
}

function OrcsFactory(name) {
    var CLASS_NAME = 'Orks', LIFE = 220, DAMAGE = 100;
    return new Monster(name, CLASS_NAME, LIFE, DAMAGE)
}

function VampireFactory(name) {
    var CLASS_NAME = 'Vampire', LIFE = 320, DAMAGE = 35;
    return new Monster(name, CLASS_NAME, LIFE, DAMAGE)
}


function Battle(monster, hero) {
    this.hero = hero;
    this.monster = monster;
}

Battle.prototype.getHero = function() {
    return this.hero;
}

Battle.prototype.getMonster = function() {
    return this.monster;
}

Battle.prototype.start = function () {
    var
        hero = this.getHero(),
        monster = this.getMonster();
    hero.renewParameters();
    monster.renewParameters();
    console.log(hero.getDescription() + ' VS ' + monster.getDescription());
    while (hero.isAlive() && monster.isAlive()) {
        hero.attack(monster);
        console.log('Monster xp: ' + monster.getLife());
        monster.attack(hero);
        console.log('Hero xp: ' +hero.getLife());
    }
}


function Tournament(numOfParticipants, allowedHeroNames, allowedMonsterNames) {
    this.NUM_OF_PARTICIPANTS = numOfParticipants;
    this.ALLOWED_HERO_NAMES = allowedHeroNames;
    this.ALLOWED_MONSTER_NAMES = allowedMonsterNames;
    this.monsters = [];
    this.heroes = [];
}

Tournament.prototype.getMonsters = function(){
    return this.monsters;
}

Tournament.prototype.getHeroes = function(){
    return this.heroes;
}

Tournament.prototype.setMonsters = function(newMonstersArr){
    this.monsters = newMonstersArr;
}

Tournament.prototype.setHeroes = function(newHeroesArr){
    this.heroes = newHeroesArr;
}

Tournament.prototype.addMonster = function(newMonster){
    this.monsters.push(newMonster);
}

Tournament.prototype.addHero = function(newHero){
    this.heroes.push(newHero);
}

Tournament.prototype.faceControl = function(character) {
    if (character instanceof Monster) {
        if (_(this.ALLOWED_MONSTER_NAMES).contains(character.getName())) {
            console.log(character.getDescription() + ' passed the face control!');
            return true;
        }
    }

    else if (character instanceof Hero) {
        if (_(this.ALLOWED_HERO_NAMES).contains(character.getName())) {
            console.log(character.getDescription() + ' passed the face control!');
            return true;
        }
    }

    console.log(character.getDescription() + ' dont passed the face control');
    return false;
}

Tournament.prototype.addParticipants = function (...arg) {
    var currentParticipantsNum = this.getHeroes().length + this.getMonsters().length;

    for (var i = 0; i < arg.length; i++) {
        if (currentParticipantsNum === this.NUM_OF_PARTICIPANTS) {
            console.log(arg[i].getDescription() + ', sorry, we scored enough participants for the tournament')
        }
        else if (this.faceControl(arg[i])) {
            if (arg[i] instanceof Hero)
                this.addHero(arg[i]);
            else
                this.addMonster(arg[i]);
            currentParticipantsNum++;
        }
    }
}

Tournament.prototype.start = function () {
    console.log('\n------------ Tournament is started! ------------');

    var battleCounter = 0;

    while (this.getMonsters().length !== 0 && this.getHeroes().length !== 0){
        var heroes = this.getHeroes(),
            monsters = this.getMonsters(),
            winHeroes = [],
            winMonsters = [];

        while (heroes.length !== 0 && monsters.length !== 0){
            var battle = new Battle(monsters.shift(), heroes.shift());
            battleCounter++;
            console.log('\n---- Battle ' + battleCounter + ' ----');
            battle.start();
            if (battle.getMonster().isAlive()) {
                winMonsters.push(battle.getMonster());
                console.log('Monster win this battle');
            }
            else if (battle.getHero().isAlive()) {
                winHeroes.push(battle.getHero());
                console.log('Hero win this battle');
            }
            else
                console.log('All characters die')
        }

        // console.log(heroes.concat(winHeroes));
        // break;
        this.setHeroes(heroes.concat(winHeroes));
        this.setMonsters(monsters.concat(winMonsters));
    }

    console.log('\n\nRESULT: ');
    this.showWinner();
    console.log('\n------------ Tournament is ended! ------------')
};

Tournament.prototype.showWinner = function () {
    var heroes = this.getHeroes(),
        monsters = this.getMonsters();

    if (monsters.length !== 0 && heroes.length !== 0)
        console.log('Sorry, the result can not be shown, the tournament is not over');

    else if (monsters.length !== 0){
        if (monsters.length === 1)
            console.log(monsters[0].getDescription() + ' is winner!');
        else {
            console.log('All this monsters are alive: ');
            monsters.forEach(function (monster) {
                console.log(monster.getDescription())
            })
        }
    }

    else if (heroes.length){
        if (heroes.length === 1)
            console.log(heroes[0].getDescription() + ' is winner!');
        else {
            console.log('All this heroes are alive: ');
            heroes.forEach(function (hero) {
                console.log(hero.getDescription())
            })
        }
    }

    else
        console.log('Everybody die!')

}


// ---------------- It's time to test this code! ----------------

var ALLOWED_HERO_NAMES = ['Mario', 'Pac-Man', 'Sonic'],
    MONSTERS_NAMES_GUIDE = ['Bowser', 'Shadow', 'Eggman'];

var theGreatCup = new Tournament(6, ALLOWED_HERO_NAMES, MONSTERS_NAMES_GUIDE);

theGreatCup.addParticipants(VampireFactory('Shadow'), VampireFactory('Constantin'), WizardFactory ('Sonic'));
theGreatCup.addParticipants(OrcsFactory('Bowser'), WarriorFactory('Mario'), ThiefFactory('Pac-Man'));
theGreatCup.addParticipants(GoblinFactory('Eggman'),WarriorFactory('Captain America'));

theGreatCup.start();
