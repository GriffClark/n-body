
console.log("found js file");

//some constants we need
const G = 6.673e-11;
const SOLARMASS = 1.98892e30;
const EARTHMASS = 5.972e24;
const R = 2*1e18;

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

    //update the velocity and position of planets using time step dt
    updateVelocityPosition(dt){
        //update velocities
        this.vx += dt *this.fx / this.mass;
        this.vy += dt *this.fy / this.mass;

        //update position
        this.rx += dt * this.vx;
        this.ry += dt * this.vy;
    };

    //calculate the distance between two planets
    distanceTo(otherPlanet){
        this.dx = this.rx - otherPlanet.rx;
        this.dy = this.ry - otherPlanet.ry;
        return Math.sqrt(this.dx*this.dx + this.dy*this.dy);
    };

    //set the force to 0 for the next iteration
    resetForce(){
        this.fx = 0;
        this.fy = 0;
    };

    //compute the net force acting between the body a and b, and add to the net force acting on a
    addForce(otherPlanet){
        this.dx = otherPlanet.rx - this.rx;
        this.dy = otherPlanet.ry - this.ry;
        //calculate the x and y distances
        //local variables
        let dist = this.distanceTo(otherPlanet);
        let force = (G * this.mass * otherPlanet.mass) / (dist * dist); //GMm/r^2

        this.fx += force * this.dx / dist;
        this.fy =  force * this.dy / dist;
    };


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

    //debug
    debugPrint(universe){
        /*
        for each child
        if not external --> debug print each of the children and output myself
        if child is external --> print body toString() and coordinates

         */

        //northwest
        if(this.nw != null){
            if(this.nw.isExternal() === false){
                this.debugPrint(this.nw);
            }
            console.log(this.nw.planet.name + " (" + this.nw.planet.rx + "," + this.nw.planet.ry+ ")");
        }
        else
            console.log("nw is null");

        //northeast
        if(this.ne != null){
            if(this.ne.isExternal() === false){
                this.debugPrint(this.ne);
            }
            console.log(this.ne.planet.name + " (" + this.ne.planet.rx + "," + this.ne.planet.ry+ ")");
        }
        else
            console.log("ne is null");

        //southwest
        if(this.sw != null){
            if(this.sw.isExternal() === false){
                this.debugPrint(this.sw);
            }
            console.log(this.sw.planet.name + " (" + this.sw.planet.rx + "," + this.sw.planet.ry+ ")");
        }
        else
            console.log("sw is null");

        //southeast
        if(this.se != null){
            if(this.se.isExternal() === false){
                this.debugPrint(this.se);
            }
            console.log(this.se.planet.name + " (" + this.se.planet.rx + "," + this.se.planet.ry+ ")");
        }
        else
            console.log("nw is null");
        if(this.isExternal() && this.planet != null){
            console.log(this.planet.name);
        }

    }

    //We have to populate the tree with planets. We start at the current tree and recursively travel through the branches


    updateForce(b){ //FIXME do not understand what this method is doing
        if(this.isExternal()){
            /*
            if you are external and your planet is no the same as this planet
            add the force of the planet within here to b
             */
            if(this.planet !== b){
                b.addForce(this.planet);
            }
        }

        else if(this.quad.length / this.planet.distanceTo(b) < 2){
            b.addForce(this.planet);
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
    //TODO make sure that these aren't all - numbers
    let xRandom = (Math.random() * 10);
    let yRandom = (Math.random() * 10);

    if( xRandom % 2 === 0){
        this.rx =  /*needs to be between -1e9 and 1e9*/ xRandom * 1e9;
    }
    else
        this.rx = -1 * xRandom * 1e9;

    if(yRandom % 2 === 0){
        this.ry =  /*needs to be between -1e9 and 1e9*/ yRandom * 1e9;
    }
    else
        this.ry = -1 * yRandom * 1e9;

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

// let numBodies = document.getElementById("numBodies"); //TODO how to stop model from generating until form has been submitted
let numBodies = 3;
let q = new Quad(0,0, R);
let shouldRun = false; //TODO change this to true when the run button is clicked
let interactionMethod = "BruteForce"; //TODO make it so that you can choose whether you want BruteForce or BHTree


function init(){


    for(i = 0; i < numBodies; i++){
        let name = "planet " + i;
        let newPlanet = generateRandomPlanet(name);
        console.log(newPlanet.name + " (" + newPlanet.rx + "," + newPlanet.ry + ")");
        universe.insert(newPlanet);
    }
}

function updatePlanetsBH() {
    //TODO write me
}

function BFGuts(node, listOfPlanets){
    if(node.nw != null){
        if(node.nw.isExternal()){
            listOfPlanets.push(node.nw.planet);
        }
        else{
            BFGuts(node.nw, listOfPlanets);
        }
    }

    if(node.ne != null){
        if(node.ne.isExternal()){
            listOfPlanets.push(node.ne.planet);
        }
        else{
            BFGuts(node.ne, listOfPlanets);
        }
    }

    if(node.sw != null){
        if(node.sw.isExternal()){
            listOfPlanets.push(node.sw.planet);
        }
        else{
            BFGuts(node.sw, listOfPlanets);
        }
    }

    if(node.se != null){
        if(node.se.isExternal()){
            listOfPlanets.push(node.planet);
        }
        else{
            BFGuts(node.se, listOfPlanets);
        }
    }


}

function updatePlanetsBF(){
    //preamble (stuff I only need to do once
    /*
    create an empty list of planets
     */
    let listOfPlanets = new Planet[numBodies];

    //recursive function call
    BFGuts(universe, listOfPlanets);
    for(i = 0; i < listOfPlanets.length; i++){
        console.log(listOfPlanets[i].name);
    }

}

function updatePlanets(dt){
    switch(interactionMethod){
        case "BHTree":
            //TODO write interaction methods
            updatePlanetsBH();
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
           updatePlanetsBF();


    }
}
let sun = new Planet("sun", SOLARMASS,3,3,0,0,0,0);
let testQuad = new Quad(0,0,20);
let universe = new BHTree(testQuad);
let planet0 = new Planet("planet 0", EARTHMASS, -5, -5, 0, 0, 0, 0);
let planet1 = new Planet("planet 1", EARTHMASS, -5, 5, 0, 0, 0, 0);
let planet2 = new Planet("planet 2", EARTHMASS, 5, 5, 0, 0, 0, 0);
let planet3 = new Planet("planet 3", EARTHMASS, 5, -5, 0, 0, 0, 0);
insert(sun, universe);
console.log("sun inserted");
console.log(universe);

console.log("-----------------------------");
insert(planet0, universe);
console.log("p0 inserted");

console.log(universe);

console.log("-----------------------------");
insert(planet1, universe);
console.log("p1 inserted");

console.log(universe);

console.log("-----------------------------");

insert(planet2, universe);
console.log("p2 inserted");

console.log(universe);

console.log("-----------------------------");

insert(planet3, universe);
console.log("p3 inserted");

console.log(universe);

console.log("-----------------------------");

let planet4 = new Planet("planet 4", EARTHMASS, 1, 1, 0, 0, 0, 0);
insert(planet4, universe);
console.log("planet 4 inserted");
console.log(universe);

console.log("-----------------------------");


universe.debugPrint(universe);








