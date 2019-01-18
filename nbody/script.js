

//some constants we need
const G = 6.673e-11;
const SOLARMASS = 1.98892e30;
const EARTHMASS = 5.972e24;
let R = 1e15;

// classes we need
class Planet {

    constructor(name,mass, rx, ry, vx, vy, fx, fy){
        /* way to generate color
    r: based on mass
    g: based on total force
    b: based on total velocity
     */

        //rx and ry represent cartesian positions
        //vx and vy represent velocities
        //fx and fy represent force components
        this.name = name;
        this. mass = mass; //mass of the planet
        this.rx = rx; //x-coordinate
        this.ry = ry; //y-coordinate
        this.vx = vx; //x-velocity
        this.vy = vy; //y velocity
        this.fx = fx; //x-force component
        this.fy = fy; //y-force component
        this.virtualPlanet = false; //used to determine if planet is real or just a summation of other planets in the tree
        //tell what quad it's in 'nw' 'ne' 'sw''se'

    } //end constructor




    //set the force to 0 for the next iteration
    resetForce(){
        this.fx = 0;
        this.fy = 0;
    };

    //compute the net force acting between the body a and b, and add to the net force acting on a


} // planets are the objects in our tree
class Quad {
    constructor(xmid, ymid, length){
        this.xmid = xmid;
        this.ymid = ymid;
        this.length = length;
    }


    //check if current quadrant contains a point
    // contains(xmid, ymid){ //TODO test this
    //     if(xmid<=xmid+length/2.0 && xmid>=xmid-length/2.0 && ymid<=ymid+length/2.0 && ymid>=ymid-length/2.0){
    //         return true;
    //     }
    //     else {
    //         return false;
    //     }
    // }

    //creates subdivisions of the current quadrant
    NW(){
        return new Quad(this.xmid-this.length/4.0, this.ymid+this.length/4.0,this.length/2.0);
    }
    NE(){
        return new Quad(this.xmid+this.length/4.0, this.ymid+this.length/4.0,this.length/2.0);
    }
    SW(){
        return new Quad(this.xmid-this.length/4.0, this.ymid-this.length/4.0,this.length/2.0);
    }
    SE(){
        return new Quad(this.xmid+this.length/4.0, this.ymid-this.length/4.0,this.length/2.0);
    }


} // quads are the area encompassed by the tree
class BHTree{
    constructor (quad, depth){
        this.planet = null; //body or aggregate body stored in this node
        this.quad = quad; //the whole region this node represents
        this.nw = null; //tree representing the northwest quadrant
        this.ne = null; //tree representing the northeast quadrant
        this.sw = null; //tree representing the southwest quadrant
        this.se = null; //tree representing the southeast quadrant
        //these values are set as null so that we can test if this is a leaf
        this.planetsContained = [];
        this.depth = depth;
        this.children = [this.nw, this.ne, this.sw, this.se];
    }

    isExternal(){
        return this.ne == null && this.nw == null && this.sw == null && this.se == null;
    }

    merge(newPlanet){
        if(this.planet != null){
            this.planet.mass += newPlanet.mass;
            this.planet.rx = ((this.planet.mass * this.planet.rx) + (newPlanet.mass * newPlanet.rx)) / (this.planet.mass + newPlanet.mass);
            this.planet.ry = ((this.planet.mass * this.planet.ry) + (newPlanet.mass * newPlanet.ry)) / (this.planet.mass + newPlanet.mass);
        }
        // else
        //     console.log("unhandled error with trying to merge " + newPlanet + " with " + this);
    }

    //We have to populate the tree with planets. We start at the current tree and recursively travel through the branches

updateInsides(){
    this.children = [this.nw, this.ne, this.sw, this.se];
}
} // BHTree is the tree with four children that we store our planets in

//some variables we need
let dt = 1e6; //each time step will take place over a 1 second interval. The smaller this number is, the more accurate your simulation will be, but the longer it will take.
let currentTime = 0;
let stopTime = 5; //when do you want to run until?
let numBodies = 2; //how many planets in your simulation
let listOfPlanets = []; //an array of unknows size
let depth = 3; //how deep you want to go
let maxBuildDepth = 10;
let shouldRun = false; //TODO change this to true when the run button is clicked
// let numBodies = document.getElementById("numBodies"); //TODO how to stop model from generating until form has been submitted

//build the universe
let q = new Quad(0,0,R);
let universe = new BHTree(q, 0); //this will serve as the initial bhtree

//mathy computation things
function circleV(rx, ry){
    let hyp = Math.sqrt(rx*rx + ry*ry);
    let numerator = (G *1e6 * SOLARMASS);
    return Math.sqrt(numerator / hyp);
}
function updateVelocityPosition(){
    for(let i = 0; i < listOfPlanets.length; i++){
        //for each planet, update it's position after dt time has passed
        updateVelocity(listOfPlanets[i], (dt));
        updatePosition(listOfPlanets[i], dt);
    }
}
function distanceTo(thisPlanet, otherPlanet){
    let dx = thisPlanet.rx - otherPlanet.rx;
    let dy = thisPlanet.ry - otherPlanet.ry;
    return Math.sqrt(dx*dx + dy*dy);
}
function addForce(thisPlanet, otherPlanet){ //this should be inside the Planet class at least in Java, but it doesn't work here
    //calculate the x and y distances
    //local variables
    let dist = distanceTo(thisPlanet, otherPlanet);
    let force = (G * thisPlanet.mass * otherPlanet.mass) / (dist * dist); //GMm/r^2

    let dx = otherPlanet.rx - thisPlanet.rx;
    let dy = otherPlanet.ry - thisPlanet.ry;
    thisPlanet.fx += force * dx / dist;
    thisPlanet.fy =  force * dy / dist;

}
function updateVelocity(thisPlanet, dt){
    //update velocities
    thisPlanet.vx += dt *thisPlanet.fx / thisPlanet.mass;
    thisPlanet.vy += dt *thisPlanet.fy / thisPlanet.mass;


}
function updatePosition(thisPlanet, dt){

    //update position
    thisPlanet.rx += dt * thisPlanet.vx;
    thisPlanet.ry += dt * thisPlanet.vy;
}
//tree manipulation and interaction
function kickPlanet(b, location){
    let testX = b.rx - location.quad.xmid;
    let testY = b.ry - location.quad.ymid;
    //This zeroes you xy plane so that you can figure out the quad by testing to see if this new zeroed location is positive or negative
    //now based on this new zeroed x and y, figure out where to insert b
    if(testX >= 0 && testY >= 0){
        if(location.ne === null){
            location.ne = new BHTree(location.quad.NE(), location.depth + 1);
        }
        insert(b, location.ne);
    }
    else if(testX >= 0 && testY < 0 ){
        if(location.se === null){
            location.se = new BHTree(location.quad.SE(), location.depth + 1);
        }
        insert(b, location.se);
    }

    else if(testX < 0 && testY >= 0){
        if(location.nw === null){
            location.nw = new BHTree(location.quad.NW(), location.depth + 1);
        }
        insert(b, location.nw);
    }
    else{
        if(location.sw === null){
            location.sw = new BHTree(location.quad.SW(), location.depth + 1);
        }
        insert(b, location.sw);
    }
    location.updateInsides(); //this will just fix the contains list

}
function insert(b, location){

    if(location.depth < maxBuildDepth){
        //if this node is empty, put this planet into it
        if(location.planet === null){
            location.planet = b;
            location.planetsContained.push(b);
        }
        /*
        if a body already exists here, but this node IS NOT external
        combine the two bodies and figure out which quadrant of the tree it should be in
        then, update the tree
         */

        else{ //there was already a planet there
            if(location.planet.virtualPlanet === true){ //if you already have a virtual planet, then you just need to add this planet and kick it
                /*
            if you have a virtual planet, you are not an external node
            figure out where the planet belongs and put the planet there
             */
                location.merge(b);
            }
            else{ //if you do not already have a virtual planet, make a new one, kick your old planet, and kick this new planet
                let newVirtualPlanet = new Planet(location.planet.name, location.planet.mass, location.planet.rx, location.planet.ry, location.planet.vx, location.planet.vy, location.planet.fx, location.planet.fy);
                //set up virtual planet

                kickPlanet(location.planet, location);
                newVirtualPlanet.virtualPlanet = true;
                location.planet = newVirtualPlanet;
                location.planet.name +="*";
                location.planetsContained.push(location.planet); //make sure you also contain the new virtual planet
            }

            location.planetsContained.push(b);
            kickPlanet(b, location);
        }
    }
    else{
        location.merge(b);
    }

}//end insert function

function computeBHForce(bhtree, planet, currentDepth) {
    // currentDepth will be updated to show what level in the tree you are in

    if (bhtree.planet !== null && bhtree.planet !== planet) { //if you are not yourself
        for (let m = 0; m < bhtree.children.length; m++) {
            if (bhtree.isExternal()) {
                addForce(planet, bhtree.planet);
            } else {
                let hasPlanet = false;
                for (let i = 0; i < bhtree.planetsContained.length; i++) {
                    if (bhtree.planetsContained[i] !== null && bhtree.planetsContained[i] === planet) {
                        hasPlanet = true;
                    }
                }

                if (hasPlanet === true && bhtree.children[m] !== null) {
                    computeBHForce(bhtree.children[m], planet, currentDepth + 1);
                } else { //you are not external and you do not have the planet
                    if (currentDepth < depth && bhtree.children[m] !== null) /*you need to go deeper*/{
                        computeBHForce(bhtree.children[m], planet, currentDepth + 1);
                    } else
                        if(bhtree.planet.rx !== planet.rx){ //making sure you aren't trying to compute force on yourself
                            /*you are at your depth*/ addForce(planet, bhtree.planet);
                        }
                }
            }
        }

    }
}


//debug functions
function debugPrint(bhtree){
    /*
    for each child
    if not external --> debug print each of the children and output myself
    if child is external --> print body toString() and coordinates

     */

    //northwest
    if(bhtree.nw != null){
        if(bhtree.nw.isExternal() === false){
            debugPrint(bhtree.nw);
        }
        console.log(bhtree.nw.planet.name + " (" + bhtree.nw.planet.rx + "," + bhtree.nw.planet.ry+ ")");
    }
    else
        console.log("nw is null");

    //northeast
    if(bhtree.ne != null){
        if(bhtree.ne.isExternal() === false){
            debugPrint(bhtree.ne);
        }
        console.log(bhtree.ne.planet.name + " (" + bhtree.ne.planet.rx + "," + bhtree.ne.planet.ry+ ")");
    }
    else
        console.log("ne is null");

    //southwest
    if(bhtree.sw != null){
        if(bhtree.sw.isExternal() === false){
            debugPrint(bhtree.sw);
        }
        console.log(bhtree.sw.planet.name + " (" + bhtree.sw.planet.rx + "," + bhtree.sw.planet.ry+ ")");
    }
    else
        console.log("sw is null");

    //southeast
    if(bhtree.se != null){
        if(bhtree.se.isExternal() === false){
            debugPrint(bhtree.se);
        }
        console.log(bhtree.se.planet.name + " (" + bhtree.se.planet.rx + "," + bhtree.se.planet.ry+ ")");
    }
    else
        console.log("nw is null");
    if(bhtree.isExternal() && bhtree.planet != null){
        console.log(bhtree.planet.name);
    }

}

//setting up the simulation
function init(){


    for(let i = 0; i < numBodies; i++){
        let name = "planet " + i;
        let newPlanet = generateRandomPlanet(name);
        console.log(newPlanet.name + " (" + newPlanet.rx + "," + newPlanet.ry + ")");
        listOfPlanets.push(newPlanet);
    }
}

function generateRandomPlanet(name){

    let px = R * (-Math.log(1 - Math.random()) / -1.8) * (0.5 - Math.random());
    let py = R * (-Math.log(1 - Math.random()) / -1.8) * (0.5 - Math.random());
    let magv = circleV(px, py);
    let absangle = Math.atan(Math.abs(py/px));
    let thetav= Math.PI/2-absangle;
    this.vx = -1*Math.sign(py)*Math.cos(thetav)*magv;
    this.vy =  Math.sign(px)*Math.sin(thetav)*magv;

    // figure out which direction to orbit planets in
    if (Math.random() <=.5) {
        this.vx=-this.vx;
        this.vy=-this.vy;
    }

    //each planet will be generated with no forces on it
    this.fx = 0;
    this.fy = 0;
    //these forces need to take into account everything else in the universe
    let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    this.rx = (Math.random() * R) * plusOrMinus;
    plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    this.ry = (Math.random() * R) * plusOrMinus;
    let planetMass = EARTHMASS * Math.pow(Math.random() * 2, 2);

    return new Planet(name, planetMass, this.rx, this.ry, this.vx, this.vy, this.fx, this.fy);
}

//running the simulation
function runBF(){
    while(currentTime < stopTime){
        currentTime += dt; //move forward a little bit in time
        /*
        listOfPlanets[i] is the planet you are computing the force on
        listOfPlanets[j] is the planet that is acting on listOfPlanets[i]
         */
        for(let i = 0; i < listOfPlanets.length; i++){ //for each planet in the array
            for(let j = 0; j < listOfPlanets.length; j++){ //calculate the force of each other planet in the array
                if(listOfPlanets[j] !== listOfPlanets[i]){ //this makes sure you don't try and calculate your force on yourself
                    addForce(listOfPlanets[i],listOfPlanets[j]);
                }
            } //added all forces for listOfPlanets[i]
        } //end for loop

        //now that all forces and velocities have been updated, update position
        updateVelocityPosition();
    }
}
function runBH(){ //go through one cycle
         R = 1; //this way R will eventually be equal to the greatest value among planets

        let runLength = listOfPlanets.length;
        for(let i = 0; i < runLength; i++){
            if(Math.abs(listOfPlanets[i].rx) > R){
                R = Math.abs(listOfPlanets[i].rx);
            }
        } //check x values to increase R
        for(let i = 0; i < runLength; i++){
            if(Math.abs(listOfPlanets[i].ry) > R){
                R = Math.abs(listOfPlanets[i].ry);
            }
        } //check Y values to increase R

        universe = new BHTree(q, 0); //create a new empty bhtree
         let sun = new Planet("sun", SOLARMASS, 1e14, 1e14 ,0,0,0,0,);
         insert(sun, universe);
        for(let i = 0; i < listOfPlanets.length; i++){
            insert(listOfPlanets[i], universe);
        }

        for(let i = 0; i < runLength; i++){
            computeBHForce(universe, listOfPlanets[i], 0);
        }

        updateVelocityPosition();
        console.log(universe);
        //restructure bhtree

        // for(let i = 0; i < listOfPlanets.length; i++){
        //     insert(listOfPlanets[i], universe);
        // }
}
//
// function runSimulation(){
//     switch(interactionMethod){
//         case "BHTree":
//             init();
//             runBH();
//             break;
//
//         default:
//             init();
//             runBF();
//             break;
//
//
//     }
// }


let interactionMethod = "BHTree";
console.log("------------");
console.log(listOfPlanets);


//MR. C

function main(){ //merge with runSimulation
    init();
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    // let t0 = (new Date()).getTime();
    // let t1 = 0;
    // let gDt = 0;
    // let windowsize = oldwindowsize = cw > ch ? cw : ch;
    // let deltasize;

    window.requestAnimationFrame(gameloop);



    function gameloop(){ //updating times
        runBH();
        ctx.clearRect(0,0,1920,1080);
        for(let i = 0; i < listOfPlanets.length; i++){
            updateC(listOfPlanets[i]);

        }
        window.requestAnimationFrame(gameloop); //recursive call so will go on forever
    } //end game loop

    function updateC(obj) { //pass in one plant
        // //width and height indicators


        // ctx.fillText("Width: " + cw, 10, 50);
        // ctx.fillText("Height: " + ch, 10, 70);
        // ctx.fillText("Key: " + key, 10, 130);

        //draws the circle
        let scaleFactor = 270/1e15;
        if(obj.name === "sun"){
            ctx.fillStyle = 'yellow';
            ctx.beginPath();

            ctx.arc(obj.rx * scaleFactor + 500, obj.ry * scaleFactor + 300, 2, 0, 2 * Math.PI);
            ctx.fill();

        }
        else{
            ctx.fillStyle = 'purple';
            ctx.beginPath();

            ctx.arc(obj.rx * scaleFactor + 500, obj.ry * scaleFactor + 300, 2, 0, 2 * Math.PI);
            ctx.fill();


        }
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
}



main();







