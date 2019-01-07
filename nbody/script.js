
console.log("found js file");

//some constants we need
const G = 6.673e-11;
const SOLARMASS = 1.98892e30;
const EARTHMASS = 5.972e24;
// const R = 2*1e18;
const R = 20;

function circleV(rx, ry){
    let hyp = Math.sqrt(rx*rx + ry*ry);
    let numerator = (G *1e6 * SOLARMASS);
    return Math.sqrt(numerator / hyp);
}

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


};
//TODO planet 0 name did not add but planet 1 did
function insert(b, location){

    //if this node is empty, put this planet into it
    if(location.planet == null){
        location.planet = b;
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
            location.planet.name += " + " + b.name;
            location.merge(b);
        }
        else{ //if you do not already have a virtual planet, make a new one, kick your old planet, and kick this new planet
            let planetIWantToKick = new Planet(location.planet.name, location.planet.mass, location.planet.rx, location.planet.ry, location.planet.vx, location.planet.vy, location.planet.fx, location.planet.fy);
            //set up virtual planet
            kickPlanet(planetIWantToKick, location);
            location.planet.virtualPlanet = true;
            location.planet.name += " virtual";
        }

        kickPlanet(b, location);
    }
}//end insert function

//calculate the distance between two planets
function distanceTo(thisPlanet, otherPlanet){
    let dx = thisPlanet.rx - otherPlanet.rx;
    let dy = thisPlanet.ry - otherPlanet.ry;
    return Math.sqrt(dx*dx + dy*dy);
}

function computeFV(thisPlanet, otherPlanet, ){ //just to simolufy my code
    addForce(thisPlanet, otherPlanet);
    updateVelocity(thisPlanet, dt);
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

function kickPlanet(b, location){
    let testX = b.rx - location.quad.xmid;
    let testY = b.ry - location.quad.ymid;
    //This zeroes you xy plane so that you can figure out the quad by testing to see if this new zeroed location is positive or negative

    //now based on this new zeroed x and y, figure out where to insert b
    if(testX >= 0 && testY >= 0){
        if(location.ne === null){
            location.ne = new BHTree(location.quad.NE());
        }
        insert(b, location.ne);
    }
    else if(testX >= 0 && testY < 0 ){
        if(location.se === null){
            location.se = new BHTree(location.quad.SE());
        }
        insert(b, location.se);
    }

    else if(testX < 0 && testY >= 0){
        if(location.nw === null){
            location.nw = new BHTree(location.quad.NW());
        }
        insert(b, location.nw);
    }
    else{
        if(location.sw === null){
            location.sw = new BHTree(location.quad.SW());
        }
        insert(b, location.sw);
    }

}

class Quad {
    constructor(xmid, ymid, length){
        this.xmid = xmid;
        this.ymid = ymid;
        this.length = length;
    }


    //check if current quadrant contains a point
    contains(xmid, ymid){ //TODO test this
        if(xmid<=xmid+length/2.0 && xmid>=xmid-length/2.0 && ymid<=ymid+length/2.0 && ymid>=ymid-length/2.0){
            return true;
        }
        else {
            return false;
        }
    }

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


}
class BHTree {
    constructor (quad){
        this.planet = null; //body or aggregate body stored in this node
        this.quad = quad; //the whole region this node represents
        this.nw = null; //tree representing the northwest quadrant
        this.ne = null; //tree representing the northeast quadrant
        this.sw = null; //tree representing the southwest quadrant
        this.se = null; //tree representing the southeast quadrant
        //these values are set as null so that we can test if this is a leaf
    }

    isExternal(){
        if (this.ne == null && this.nw == null && this.sw == null && this.se == null ){
            return true;
        }
        else return false;
    }

    merge(newPlanet){
        //TODO what to do if this.planet = null
        this.planet.mass += newPlanet.mass;
        this.planet.rx = ((this.planet.mass * this.planet.rx) + (newPlanet.mass * newPlanet.rx)) / (this.planet.mass + newPlanet.mass);
        this.planet.ry = ((this.planet.mass * this.planet.ry) + (newPlanet.mass * newPlanet.ry)) / (this.planet.mass + newPlanet.mass);
    }

    //We have to populate the tree with planets. We start at the current tree and recursively travel through the branches


    updateForce(b){ //FIXME do not understand what this method is doing
        if(this.isExternal()){
            /*
            if you are external and your planet is no the same as this planet
            add the force of the planet within here to b
             */
            if(this.planet !== b){
                addForce(b, this.planet);
            }
        }

        else if(this.quad.length / distanceTo(this.planet, b) < 2){
            addForce(b, this.planet);
        }

        else {
            if (this.nw!=null) this.nw.updateForce(b);
            if (this.sw!=null) this.sw.updateForce(b);
            if (this.se!=null) this.se.updateForce(b);
            if (this.ne!=null) this.ne.updateForce(b);
        }
    }
}

//returns a random planet in a random point in the universe
function generateRandomPlanet(name){
    //set a random location
    let xRandom = (Math.random() * 10);
    let yRandom = (Math.random() * 10);

    if( xRandom % 2 === 0){
        this.rx =  /*needs to be between -R/2 and R/2*/ xRandom * R/2;
    }
    else
        this.rx = -1 * xRandom * R/2;

    if(yRandom % 2 === 0){
        this.ry =  /*needs to be between -R/2 and R/2*/ yRandom * R/2;
    }
    else
        this.ry = -1 * yRandom * R/2;

    // set v0x and v0y
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
    return new Planet(name, EARTHMASS, this.rx, this.ry, this.vx, this.vy, this.fx, this.fy);
}

function init(){


    for(i = 0; i < numBodies; i++){
        let name = "planet " + i;
        let newPlanet = generateRandomPlanet(name);
        console.log(newPlanet.name + " (" + newPlanet.rx + "," + newPlanet.ry + ")");
        universe.insert(newPlanet);
    }
}




function runSimulation(dt){
    switch(interactionMethod){
        case "BHTree":
            //TODO write interaction methods
            runBH();
            break;

        default: //this means that we are going to use the BruteForce method
            /*
            needs to loop through each of the bodies
            for each planet, go though and update the force on it from each other planet

            pick a planet
            go through the tree for each planet
            and if the planet you are looking at isn't yourself
            add the force of the new planet on you
             */
           runBF();


    }
}
let dt = 1; //each time step will take place over a 1 second interval. The smaller this number is, the more accurate your simulation will be, but the longer it will take.
let currentTime = 0;
let stopTime = 5; //when do you want to run until?
let q = new Quad(0,0,R);
let universe = new BHTree(q);
let numPlanets = 3;
let listOfPlanets = []; //an array of unknows size
let shouldRun = false; //TODO change this to true when the run button is clicked
let interactionMethod = "BruteForce"; //TODO make it so that you can choose whether you want BruteForce or BHTree
// let numBodies = document.getElementById("numBodies"); //TODO how to stop model from generating until form has been submitted

// // initializing brute force
// for(i = 0; i < numPlanets; i++){
//     listOfPlanets.push(generateRandomPlanet("planet" + i));
// }

let sun = new Planet("sun", 6.67e12,3,3,0,0,0,0);
let planet0 = new Planet("planet 0", 6.67e11, 5, 5, 10,10,0,0);
listOfPlanets.push(planet0);
listOfPlanets.push(sun);

//run through brute force
function runBF(){
    while(currentTime < stopTime){
        console.log(currentTime);
        currentTime += dt; //move forward a little bit in time
        /*
        listOfPlanets[i] is the planet you are computing the force on
        listOfPlanets[j] is the planet that is acting on listOfPlanets[i]
         */
        for(i = 0; i < listOfPlanets.length; i++){ //for each planet in the array
            for(j = 0; j < listOfPlanets.length; j++){ //calculate the force of each other planet in the array
                if(listOfPlanets[j] !== listOfPlanets[i]){ //this makes sure you don't try and calculate your force on yourself
                    addForce(listOfPlanets[i],listOfPlanets[j]);
                    updateVelocity(listOfPlanets[i], (dt));
                }
            } //added all forces for listOfPlanets[i]
        } //end for loop

        //now that all forces and velocities have been updated, update position
        for(i = 0; i < listOfPlanets.length; i++){
            //for each planet, update it's position after dt time has passed
            updatePosition(listOfPlanets[i], dt);
            console.log(listOfPlanets[i].name + " (" + listOfPlanets[i].rx + "," + listOfPlanets[i].ry + ")");
        }




    }
}

function runBH(){
    /*
    Stage 1:
        depending on depth variable
        if(you are at your target depth)


     */
}

/*
TODO
make sure that planets are withing the quad (if the quad is size 20 you cant have a planet at 21
force velocity and location variables are not changing
    if listOfPlanets actually isn't updating when its variables update (even though the variables are changing)
    each time remove the item from the list, edit that new item, then add that new item back in
 */







