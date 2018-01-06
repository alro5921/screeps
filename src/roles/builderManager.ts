var builder = require('./builder.ts');
var util = require('../utility/genUtility.ts');
var metrics = require('../utility/metrics.ts');

export function init(){
    Memory.builderBudget = 800;
    Memory.builderUsed = 0;
}

export function run(){
    startTick();

    let builders = _.filter(Game.creeps, creep => {return (creep.memory.role == 'builder')});
    for (let i in builders){
        builder.run(builders[i]);
    }

    endTick();
}

function startTick(){
    if(!Memory.builderTasks || Game.time % 30 == 0){
        Memory.builderTasks = [{id: 'ayy', priority: -10000}];
        for(let roomName in Game.rooms){
            util.print("RoomName: " + roomName);
            let tasks = compileRoomTasks(Game.rooms[roomName]);
            for(let i in tasks){
                util.priorityPush(tasks[i], Memory.builderTasks);
            }
        }
    }

    if(Game.time % 100 == 0){
        Memory.builderUsed = 0;
    }

    Memory.tickEnergy = 0;
}

function endTick(){
    Memory.builderEnergyUsed = metrics.trackMetric(Memory.builderEnergyUsed, Memory.tickEnergy, {window : 100});
    util.print("Builder energy used in the last 100 ticks: " + _.sum(Memory.builderEnergyUsed), true, 100);
}

export function makeBody(spawn : StructureSpawn){
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
        if(budget >= 100){
            body.push(WORK);
            budget -= 100;
        }
    }
    return body;
}

function compileRoomTasks(room: Room){
    util.print("Room: " + room);
    var tasks : {id: string, priority: number}[] = [{id: 'ayy', priority: -10000}];

    util.priorityPush(scoreUpgradeTask(room.controller), tasks);

    let constructionSites : ConstructionSite[] = room.find(FIND_CONSTRUCTION_SITES);
    for (let i in constructionSites){
        util.priorityPush(scoreBuildTask(constructionSites[i]), tasks);
    }

    let repairTargets : Structure[] = room.find(FIND_STRUCTURES, {filter: (structure: Structure) => {return (structure.hits < structure.hitsMax) } } );
    for (let i in repairTargets){
        util.priorityPush(scoreRepairTask(repairTargets[i]), tasks);
    }

    return tasks;
}

function scoreUpgradeTask(controller: StructureController){
    const DEFAULT_UPGRADE_PRIORITY = 8; //below most build tasks
    const PREVENT_DOWNGRADE_PRIORITY = 50;

    let priority : number;

    if(controller.ticksToDowngrade < 2000){
        priority =  PREVENT_DOWNGRADE_PRIORITY;
    }
    else{
        priority =  DEFAULT_UPGRADE_PRIORITY;
    }

    return {id: controller.id, priority: priority};
}

function scoreBuildTask(site: ConstructionSite){
    const DEFAULT_BUILD_PRIORITY = 10;
    const percentDone = site.progress/(site.progress + site.progressTotal);
    return {id: site.id, priority: DEFAULT_BUILD_PRIORITY*(1 + percentDone)};
}

function scoreRepairTask(target: Structure){
    if(target instanceof StructureWall || target instanceof StructureRampart){
        return scoreWallTask(target);
    }
    const DEFAULT_REPAIR_PRIORITY = 20; //Base priority near 0 health
    const SAVE_MULTIPLIER = 1.5;
    const SAVE_THRESHOLD = .15; //If a structure is below the health threshold, add the SAVE_MULTIPLIER.


    let priority : number = 0;
    let percentHealth = target.hits/target.hitsMax;
    priority += DEFAULT_REPAIR_PRIORITY*(1 - percentHealth);
    if(percentHealth < SAVE_THRESHOLD){priority *= SAVE_MULTIPLIER};
    return {id: target.id, priority: priority};
}

Memory.wallMax = 100000;
function scoreWallTask(target: (StructureWall | StructureRampart)){
    let priority : number = 0;
    if (target.hits < Memory.wallMax){
        priority = 9;
    }
    return {id: target.id, priority: priority};
}
