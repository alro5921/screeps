//Interesting, but probably way overkill for now. Keep in back pocket.


/*
var util = require('../utility/genUtility.ts');

//The creep picking up is NOT neccesarily the creep with the reservation (hauler).
function openEnergy(container: Container|Storage){
    let reservations : {id: string, amount: number}[] = Memory.containers[container.id].reservations;
    let resAmount : number = 0;
    for(let i in reservations){
        resAmount += reservations[i].amount;
    }
    return container.store[RESOURCE_ENERGY] - resAmount;
    //return container.store[RESOURCE_ENERGY] -  _.sumBy(reservations, (res: any) => res.amount);
}

function requestReservation(container: Container|Storage, id: string, amount: number){
    if (openEnergy(container) >= amount){
        Memory.containers[container.id].reservations.push({id: id, amount: amount});
    }
}

function withdraw(creep: Creep, container: Container|Storage, res: {id: string, amount: number}){
    let ret = util.doOrGo(creep, container, (target : Container|Storage) => creep.withdraw(target, RESOURCE_ENERGY,res.amount));
    if(ret == OK){
        res.amount -= Math.min(res.amount,
                               creep.carry.carryCapacity - _.sum(creep.carry),
                               container.store[RESOURCE_ENERGY]);
        if (res.amount <= 0){
            //delete res
        }
    }
}
*/
