var util = require('../utility/genUtility.ts')
var miner = require('./miner.ts');
var metrics = require('../utility/metrics.ts');

export function init(room: Room){
    console.log("Initing miner");
    Memory.sources = {};
    updateRoom(room);
}

export function run(room: Room){
    startTick(room);

    let miners = _.filter(Game.creeps, creep => {return (creep.memory.role == 'miner')});
    for (let i in miners){
        miner.run(miners[i]);
    }

    endTick();
}

export function startTick(room: Room){
    if(Game.time % 20 == 0){
        updateRoom(room);
    }
    Memory.minedTick = 0;
}

export function endTick(){
    Memory.mined = metrics.trackMetric(Memory.mined, Memory.minedTick, {window : 100});
    util.print("Amount mined in the last 100 ticks: " + _.sum(Memory.mined), true, 100);
}

function updateRoom(room: Room){
    let sources: Source[] = room.find(FIND_SOURCES);
    for (let i in sources){
        updateSource(sources[i]);
    }
}

function updateSource(source: Source){
    if(!Memory.sources[source.id]){
        initSource(source);
    }

    Memory.sources[source.id].WORKs = _.filter(Game.creeps, creep => {return (creep.memory.sourceId == source.id)})
                                       .reduce((acc, creep) => acc + creep.getActiveBodyparts(WORK), 0);
    Memory.sources[source.id].full = Memory.sources[source.id].WORKs >= 6;
}

function initSource(source: Source){
    Memory.sources[source.id] = {full : false, WORKs: false, containerId: undefined};
    //placeContainer(source);
}

export function makeBody(spawn: StructureSpawn){
    let budget: number = spawn.room.energyCapacityAvailable;
    if(budget >= 1000){
        return [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    }

    let body: string[] = [MOVE, CARRY];
    budget -= 100;
    let WORKcount : number = 0;
    while(budget >= 100 && WORKcount < 6){
        body.push(WORK);
        budget -= 100;
        WORKcount++;
    }
    while(budget >= 50){
        if(budget >= 50){
            body.push(CARRY);
            budget -= 50;
        }
        if(budget >= 50){
            body.push(MOVE);
            budget -= 50;
        }
    }
    return body;
}

/*
function placeContainer(source: Source){
    for (var x_off = -1; x_off <= 1; x_off++){
    for (var y_off = -1; y_off <= 1; y_off++){
        var testPos = source.room.getPositionAt(source.pos.x + x_off, source.pos.y + y_off);
        if(testPos.createConstructionSite(STRUCTURE_CONTAINER) == OK){
            Memory.sources[source.id].container = testPos;
            return;
        }
    }
    }
}*/
