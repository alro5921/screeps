var hauler = require('./hauler.ts');

export function init(){

}

export function run(){
    startTick();

    let haulers = _.filter(Game.creeps, creep => {return (creep.memory.role == 'hauler')});
    for (let i in haulers){
        hauler.run(haulers[i]);
    }

    endTick();
}

export function startTick(){

}

export function endTick(){

}

export function makeBody(spawn: StructureSpawn){
    let budget: number = spawn.room.energyCapacityAvailable;
    let body: string[] = [];

    while(budget > 0){
        if(budget >= 50){
            body.push(MOVE);
            budget -= 50;
        }
        if(budget >= 50){
            body.push(CARRY);
            budget -= 50;
        }
        if(budget >= 50){
            body.push(CARRY);
            budget -= 50;
        }
    }
    return body;
}
