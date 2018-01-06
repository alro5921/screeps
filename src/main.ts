//import {BuilderTask} from "./components/NewTry/BuilderTask";
var minerM = require('./roles/minerManager.ts');
var builderM = require('./roles/builderManager.ts');
var haulerM = require('./roles/haulerManager.ts');

var spawner = require('./spawner.ts');
var tower = require('./roles/tower.ts');
var attacker = require('./roles/attacker.ts');

var util = require('./utility/genUtility.ts')
var metrics = require('./utility/metrics.ts')

var debug : boolean = false;

function init(spawn: Spawn){
    builderM.init();
    minerM.init(spawn.room);
    Memory.init = true;
}

function mloop() {
    let spawn = Game.spawns['Spawn1'];
    let room = spawn.room;
    Memory.debug = true;
    if(!Memory.init || Memory.init == false){
        init(spawn);
    }

    spawner.spawnCreeps(spawn);

    minerM.run(room);
    builderM.run(room);
    haulerM.run();

    let towers = _.filter(Game.structures, structure => {return (structure.structureType == STRUCTURE_TOWER)});
    for (let i in towers){
        tower.run(towers[i]);
    }

    let attackers = _.filter(Game.creeps, creep => {return (creep.memory.role == 'attacker')});
    for (let i in attackers){
        attacker.run(attackers[i], 'E52N59');
    }

    for(let name in Memory.creeps) {
        util.print("Name: " + name, debug);
       if(!Game.creeps[name]) {
           console.log('Clearing non-existing creep memory:', name);
           delete Memory.creeps[name];
       }
   }

   Memory.cpuUsage = metrics.trackMetric(Memory.cpuUsage, Game.cpu.getUsed(), {window : 100});
   util.print("Average CPU Used in last 100 ticks: " + _.sum(Memory.cpuUsage)/100, true, 100);

   //Memory.init = false;

   let hardWipe = false;
   if(hardWipe){
       clearMemory();
   }
}

function clearMemory(){
    console.log("Wiping memory");
    for(var object in Memory){
        delete Memory[object];
    }
}
/**
 * Screeps system expects this "loop" method in main.js to run the
 * application. If we have this line, we can be sure that the globals are
 * bootstrapped properly and the game loop is executed.
 * http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
 *
 * @export
 */
export const loop = mloop;
