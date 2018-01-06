var util = require('../utility/genUtility.ts');

export function run(attacker: Creep, targetRoom: string) {
    if(!attacker.memory.state){
        attacker.memory.state = 'TRANSIT';
    }

    if(attacker.memory.state == 'ATTACK'){
        attackState(attacker);
    }

    else{
        transitState(attacker, targetRoom);
    }

}

function attackState(attacker: Creep){
    let spawnTarget : Structure = attacker.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure: Structure) => {
                        return structure.structureType == STRUCTURE_SPAWN;
                    }
            });
    if(spawnTarget){
        util.doOrGo(attacker, spawnTarget, (spawn : any) => attacker.attack(spawn));
    }

    let creepTarget : Structure = attacker.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(creepTarget){
        util.doOrGo(attacker, creepTarget, (creep : any) => attacker.attack(creep));
    }
}

function transitState(attacker: Creep, targetRoom: string){
    //attacker.moveTo(new RoomPosition(25, 25, targetRoom));
    attacker.moveTo(Game.flags['ExpansionTest']);
    if (attacker.room.name == targetRoom){
        //attacker.memory.state = 'ATTACK';
    }
}
