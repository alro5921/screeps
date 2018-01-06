export function run(tower: StructureTower){
    let attackTarget : Creep = tower.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if(attackTarget) {
        tower.attack(attackTarget);
        return;
    }

    let repairTarget : Structure = tower.pos.findClosestByPath(FIND_STRUCTURES, {filter: (structure: Structure) => {return (structure.hits < structure.hitsMax) && structure.structureType == STRUCTURE_ROAD} } );
    if(repairTarget) {
        tower.repair(repairTarget);
        return;
    }
}
