var util = require('./utility/genUtility');

var minerM = require('./roles/minerManager.ts');
var builderM = require('./roles/builderManager.ts');
var haulerM = require('./roles/haulerManager.ts');

if(!Memory.debug){
    Memory.spawnDebug = false;
}
export function spawnCreeps(spawn: StructureSpawn){
    let miners = _.filter(Game.creeps, creep => {return (creep.memory.role == 'miner') && creep.ticksToLive >= 100});
    let builders = _.filter(Game.creeps, creep => {return (creep.memory.role == 'builder')});
    let haulers = _.filter(Game.creeps, creep => {return (creep.memory.role == 'hauler')});

    let headcountString : string = "Headcount: \n Miners: " + miners.length
                                    + "\n Builders: " + builders.length
                                    + "\n Haulers: " + haulers.length;
    util.print(headcountString, Memory.spawnDebug, 10);


    if(miners.length < 2){
        util.print("Trying to spawn miner", Memory.spawnDebug);
        let body = minerM.makeBody(spawn);
        util.print("Miner body: " + body, Memory.spawnDebug);
        let ret = createCreep(minerM.makeBody(spawn),spawn, {role: 'miner'});
        util.print("Return error: " + ret, Memory.spawnDebug);
    }
    else if(haulers.length < 3){
        util.print("Trying to spawn hauler", Memory.spawnDebug);
        let ret = createCreep(haulerM.makeBody(spawn),spawn, {role: 'hauler'});
        util.print("Return error: " + ret, Memory.spawnDebug);
    }
    else if(builders.length < 2){
        util.print("Trying to spawn builder", Memory.spawnDebug);
        let body = builderM.makeBody(spawn);
        util.print("Builder body: " + body, Memory.spawnDebug);
        let ret = createCreep(builderM.makeBody(spawn),spawn, {role: 'builder'});
        util.print("Return error: " + ret, Memory.spawnDebug);
    }
}

function createCreep(body: string[], spawn: StructureSpawn, options : {memory?: any, role?: string} = {}){
    let role = options.role || "Generic";
    let creepMemory : any = options.memory || {};
    if (options.role){
        creepMemory.role = options.role;
    }
    util.print("Spawn: " + spawn.name, Memory.spawnDebug);
    util.print("Spawn Body: " + body, Memory.spawnDebug);
    util.print("Energy Avai: " + spawn.room.energyAvailable, Memory.spawnDebug);
    util.print("Energy Capacity Avil: " + spawn.room.energyCapacityAvailable, Memory.spawnDebug);
    return spawn.spawnCreep(body, addRandTag(role), {memory: creepMemory});
}

function addRandTag(base : string){
    let rand_tag = Math.floor(Math.random() * 10000000);
    return base + '-' + rand_tag;
}
