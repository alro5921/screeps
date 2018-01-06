var util = require('../utility/genUtility.ts');


export function run(creep: Creep) {
    if(creep.memory.sated == undefined){
        creep.memory.sated = true;
    }

    if(creep.memory.sated){
        satedState(creep);
    }
    else{
        unsatedState(creep);
    }
}

function satedState(creep: Creep){
    if(creep.carry.energy == 0){
        creep.memory.sated = false;
        unsatedState(creep);
    }
    let target : (Structure | ConstructionSite);
    let x = 0;
    while(x < Memory.builderTasks.length){
        target = Game.getObjectById(Memory.builderTasks[x].id);
        if(target){break;}
        x++;
    }
    if(!target){return;}
    /*
    for (var i in Memory.builderTasks){
        util.print("id: " + Memory.builderTasks[i].id + " priority: " + Memory.builderTasks[i].priority);
    }
    util.print("===========");*/
    if (target instanceof ConstructionSite){
        if (util.doOrGo(creep, target, (target : any) => creep.build(target)) == OK){
            Memory.tickEnergy += creep.getActiveBodyparts(WORK)*BUILD_POWER;
        }
    }
    else if (target instanceof StructureController){
        if(util.doOrGo(creep, target, (target : any) => creep.upgradeController(target)) == OK){
            Memory.tickEnergy += creep.getActiveBodyparts(WORK)*UPGRADE_CONTROLLER_POWER;
        }
    }
    else if (target instanceof Structure){
        if(util.doOrGo(creep, target, (target : any) => creep.repair(target)) == OK){
            Memory.tickEnergy += creep.getActiveBodyparts(WORK);
        }
    }
    /*
    let buildTarget : ConstructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if(buildTarget) {
        util.doOrGo(creep, buildTarget, (target : any) => creep.build(target));
    }
    else{
        let repairTarget : Structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (structure: Structure) => {return (structure.hits < structure.hitsMax) } } );
        if(repairTarget) {
            util.doOrGo(creep, repairTarget, (target : any) => creep.repair(target));
        }
   }*/
}

function unsatedState(creep: Creep){
    if (creep.carry.energy == creep.carryCapacity && creep.carryCapacity != 0){
        creep.memory.sated = true;
        satedState(creep);
    }

    grabEnergy(creep);
}

function grabEnergy(creep: Creep){
    let container : (Container|Storage) = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure: Structure) => {
                            return (structure instanceof StructureContainer || structure instanceof StructureStorage)
                                    && structure.store[RESOURCE_ENERGY] >= creep.carryCapacity;
                        }
                });
    if (container){
        storeWithdraw(creep, container);
        return;
    }


    if(creep.getActiveBodyparts(WORK) != 0) {
        let source: Source = creep.pos.findClosestByPath(FIND_SOURCES, {filter: (source: Source) =>
            {return !Memory.sources || !Memory.sources[source.id] || !Memory.sources[source.id].full;}
        });
        if (source) {
            util.doOrGo(creep, source, (target : any) => creep.harvest(target));
        }
    }
}

function storeWithdraw(creep: Creep, container: (Container|Storage)){
    let budget : number = Memory.builderBudget - Memory.builderUsed;
    let withdrawAmount : number = Math.min(creep.carryCapacity - (creep.carry.energy || 0), budget,container.store[RESOURCE_ENERGY] || 0);
    if (withdrawAmount <= 0){return;}
    if (util.doOrGo(creep, container, (target : any) => creep.withdraw(target, RESOURCE_ENERGY, withdrawAmount)) == OK){
        console.log("Builder withdrawing " + withdrawAmount + " from container");
        Memory.builderUsed += withdrawAmount;
    }
}
