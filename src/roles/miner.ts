var util = require('../utility/genUtility.ts');

export function run(creep: Creep){
    if(creep.memory.mining == undefined){
        creep.memory.mining = true;
    }

    if (!creep.memory.sourceId){
        let source : Source = creep.pos.findClosestByPath(FIND_SOURCES, {filter: (source: Source) => {return !Memory.sources[source.id].full;}});
        if(!source){return;}
        //add creep to source
        creep.memory.sourceId = source.id;
        //updateSource(source);
    }

    if(creep.memory.mining){
        miningState(creep);
    }
    else{
        depositState(creep);
    }
}

function miningState(creep: Creep){
    if(creep.carry.energy == creep.carryCapacity){
        creep.memory.mining = false;
        depositState(creep);
    }

    let source : Source = Game.getObjectById(creep.memory.sourceId);
    if(!source){return;}
    if(util.doOrGo(creep, source, (target : any) => creep.harvest(target)) == OK){
        Memory.minedTick += HARVEST_POWER*creep.getActiveBodyparts(WORK);
    }
}


function depositState(creep: Creep){
    if(creep.carry.energy < creep.carryCapacity){
        creep.memory.mining = true;
        miningState(creep);
    }

    let nearestStore : Structure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure: Structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION)
                                && !util.isFull(structure) && structure.pos.inRangeTo(creep.pos, 5);
                    }
            });

    if(nearestStore){
        util.doOrGo(creep, nearestStore, (target : any) => creep.transfer(target, RESOURCE_ENERGY));
    }

    let buildTarget : ConstructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if(buildTarget){
        util.doOrGo(creep, buildTarget, (target : any) => creep.build(target))
    }
    else{
        //creep.drop(RESOURCE_ENERGY);
    }
}
