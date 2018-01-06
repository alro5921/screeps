var util = require('../utility/genUtility.ts');

export function run(hauler: Creep) {
    if(hauler.memory.sated == undefined){
        hauler.memory.sated = true;
    }

    if(hauler.memory.sated){
        satedState(hauler);
    }
    else{
        unsatedState(hauler);
    }
}

function findTarget(hauler: Creep){

    let spawns : Structure[] = _.filter(Game.structures, structure => {
        return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) && !util.isFull(structure)
        });
    let spawnTarget : Structure = hauler.pos.findClosestByRange(spawns) || spawns[0];
    if (spawnTarget){
        return spawnTarget.id;
    }

    let towerCriterion : Function = function(structure : Structure){
                                return structure instanceof StructureTower
                                        && structure.energy < structure.energyCapacity/2;
                                }
    let towerTarget : Structure = hauler.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure: Structure) => {return towerCriterion(structure);}
            });
    if(towerTarget){
        return towerTarget.id;
    }

    if(Memory.builderUsed < Memory.builderBudget){
        let builders = _.filter(Game.creeps, creep => {return (creep.memory.role == 'builder') && _.sum(creep.carry) + 100 < creep.carryCapacity});
        util.print(builders);
        let builderTarget : Creep = hauler.pos.findClosestByRange(builders) || builders[0];
        if(builderTarget){
            return builderTarget.id;
        }
    }

    let storage : StructureStorage = hauler.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure: Structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE);
                    }
            });
    if(storage){
        return storage.id;
    }

    util.print("Could not find haul target for " + hauler.name, Memory.debug);
    return undefined;
}

function satedState(hauler: Creep){
    if(hauler.carry.energy == 0){
        hauler.memory.sated = false;
        unsatedState(hauler);
    }

    if(!hauler.memory.targetId){
        util.print(hauler.name + " aquiring new hauler target.", Memory.debug);
        hauler.memory.targetId = findTarget(hauler);
    }

    let target : any = Game.getObjectById(hauler.memory.targetId);
    if(!target){
        hauler.memory.targetId = undefined;
        return;
    }

    if (target instanceof Creep){
        let budget = Memory.builderBudget - Memory.builderUsed;
        let transferAmount : number = Math.min(target.carryCapacity - (target.carry.energy || 0), budget,hauler.carry[RESOURCE_ENERGY] || 0);
        let ret : number = util.doOrGo(hauler, target, (target : Creep) => hauler.transfer(target, RESOURCE_ENERGY, transferAmount));
        if (ret == OK || ret == ERR_FULL){
            util.print(target.name + " recieving " + transferAmount + " energy from " + hauler.name, Memory.debug);
            Memory.builderUsed += transferAmount;
            hauler.memory.targetId = undefined;
        }
    }

    else if(target instanceof StructureSpawn || target instanceof StructureExtension || target instanceof StructureStorage || target instanceof StructureTower){
        let ret : number = util.doOrGo(hauler, target, (target : any) => hauler.transfer(target, RESOURCE_ENERGY));
        if (ret == OK || ret == ERR_FULL){
            hauler.memory.targetId = undefined;
        }
    }

    else{
        util.print(hauler.name + " has an unsupported hauler target.", Memory.debug);
    }

}

function unsatedState(hauler: Creep){
    if (hauler.carry.energy == hauler.carryCapacity && hauler.carryCapacity != 0){
        hauler.memory.sated = true;
        satedState(hauler);
    }

    let droppedEnergy : Resource = hauler.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: (resource: Resource) => {
            return resource.resourceType == RESOURCE_ENERGY && resource.amount > 100;}
        });
    if(droppedEnergy) {
        util.doOrGo(hauler, droppedEnergy, (target : any) => hauler.pickup(target));
        return;
    }

    if(!hauler.memory.containerId){
        /*
        let containers : Structure[] = _.filter(Game.structures, structure => {return structure.structureTypetype == STRUCTURE_CONTAINER});
        util.print(containers);
        let container : Structure = hauler.pos.findClosestByPath(containers) || containers[0]; */

        let container : StructureContainer = hauler.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure: Structure) => {
                            return (structure instanceof StructureContainer) && structure.store[RESOURCE_ENERGY] >= hauler.carryCapacity;
                        }
                });
        if (container){
            hauler.memory.containerId = container.id;
        }
    }

    let container : Container = Game.getObjectById(hauler.memory.containerId);
    if(container){
        let ret = util.doOrGo(hauler, container, (target : any) => hauler.withdraw(target, RESOURCE_ENERGY));
        if(ret == OK || ret == ERR_FULL){
            hauler.memory.containerId = undefined;
            return;
        }
        if(ret == ERR_NOT_IN_RANGE){
            return;
        }
    }
    /*
    if(!hauler.memory.bored){
        hauler.memory.bored = 0;
    }
    hauler.memory.bored += 1;
    if(hauler.memory.bored >= 30){
        let store : Storage = hauler.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return (structure instanceof StructureStorage)
                        && structure.store[RESOURCE_ENERGY] >= hauler.carryCapacity;
            }
                    });
        if(store){
            if(util.doOrGo(hauler, store, (target : any) => hauler.withdraw(target, RESOURCE_ENERGY)) == OK){
                hauler.memory.bored = 0;
            }
        }

    }
    */
}
