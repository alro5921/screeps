//Screeps structures have a bunch of different names and methods for their "storage", consolidating here.
export function isFull(structure : any){
    if(structure.structureType == STRUCTURE_CONTAINER){
        return (_.sum(structure.store) == structure.storeCapacity);
    }
    else if(structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_TOWER){
        return structure.energy == structure.energyCapacity;
    }
    else{
        return true;
    }
}

//There's a LOT of "Try to do something, if you're not there yet move there" calls.
export function doOrGo(creep: Creep, target: any, funct: Function) {
    const code = funct(target);
     if(code == ERR_NOT_IN_RANGE){
         creep.moveTo(target);
     }
     return code;
}

export function print(data: any, debugFlag : boolean = true, timer : number = 1){
    if(!debugFlag || (Game.time % timer != 0)){return;}
    if(data instanceof Array){
        for (let i in data){
            console.log(i + ": " + data[i]);
        }
    }
    else{
        console.log(data);
    }
}

export function priorityPush(pTuple : {id: string, priority: number}, queue : {id: string, priority: number}[]) {
    if (!queue) {
        queue = [pTuple];
        return;
    }
    for (let i = 0; i < queue.length; i++) {
        if (pTuple.priority >= queue[i].priority) {
            queue.splice(i, 0, pTuple);
            return;
        }
    }
    queue.push(pTuple);
    return;
}

export function creepsInRole(role: string){
    return _.filter(Game.creeps, creep => {return (creep.memory.role == role)});
}

/*export function printl(string: any, options: {debug?: boolean, timer?: number}){
    if(options.hasOwnProperty('debug') && !options.debug){return;}
    if(options.timer && Game.time % options.timer != 0){return;}
    console.log(string);
}*/
