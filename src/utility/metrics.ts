export function trackMetric(store: number[], metric: number, options: any = {}){
    let tickRate: number = options.tickRate || 1;
    let window: number = options.window || 20;

    if(Game.time % tickRate != 0){return store;}

    if(!store){store = [];}
    if(store.length >= window){
        store.pop();
    }
    store.unshift(metric);
    return store;
}

export function weightedAverage (store: number[], weight: number = .95) : number{
    let sum : number = 0;
    let weight_sum : number = 0;
    let c_weight : number = 1;
    for(let i in store){ //WHYYYYYYY
        sum += c_weight*store[i];
        weight_sum += c_weight;
        c_weight *= weight;
    }

    return sum/weight_sum;
}
