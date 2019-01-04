
console.log("found js file");

//some constants we need
const G = 6.673e-11;
const SOLARMASS = 1.98892e30;
const EARTHMASS = 5.972e24;
const R = 2*1e18;

function circleV(rx, ry){
    let hyp = Math.sqrt(rx*rx + ry*ry);
    let numerator = (G *1e6 * SOLARMASS);
    let circleV = Math.sqrt(numerator / hyp);
    return circleV;
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
        //tell what quad it's in 'nw' 'ne' 'sw''se'
        this.quadLocation = this.setQuadLocation();

    } //end constructor

     setQuadLocation(){
        if (this.rx >= 0 && this.ry >= 0) {
            return 'ne';
        } else if (this.rx >= 0 && this.ry < 0) {
            return 'se'
        } else if (this.rx < 0 && this.ry < 0) {
            return 'sw'
        } else
            return 'nw';
    }

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

        //TODO check if the fx and fy math is correct
        this.fx += force * this.dx / dist;
        this.fy =  force * this.dy / dist;
    };


};
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
        return new Quad(xmid-length/4.0, ymid+length/4.0,length/2.0);
    }
    NE(){
        return new Quad(xmid+length/4.0, ymid+length/4.0,length/2.0);
    }
    SW(){
        return new Quad(xmid-length/4.0, ymid-length/4.0,length/2.0);
    }
    SE(){
        return new Quad(xmid+length/4.0, ymid-length/4.0,length/2.0);
    }


}
class BHTree {
    constructor (planet, quad){
        this.planet = planet; //body or aggregate body stored in this node
        this.quad = quad; //the whole region this node represents
        this.nw = null; //tree representing the northwest quadrant
        this.ne = null; //tree representing the northeast quadrant
        this.sw = null; //tree representing the southwest quadrant
        this.se = null; //tree representing the southeast quadrant
        //these values are set as null so that we can test if this is a leaf
    }

    add(newPlanet){
        this.planet.mass += newPlanet.mass;
        this.planet.rx = ((this.planet.mass * this.planet.rx) + (newPlanet.mass * newPlanet.rx)) / (this.planet.mass + newPlanet.mass);
        this.planet.ry = ((this.planet.mass * this.planet.ry) + (newPlanet.mass * newPlanet.ry)) / (this.planet.mass + newPlanet.mass);
    }

    isExternal(){
        if (this.ne == null && this.nw == null && this.sw == null && this.se == null ){
            return true;
        }
        else return false;
    }

    //debug
    debugPrint(universe){
        /*
        for each child
        if not external --> debug print each of the children and output myself
        if child is external --> print body toString() and coordinates

         */

        if(this.nw != null){
            if(this.nw.isExternal()){
                console.log(this.nw.planet.name + " (" + this.nw.planet.rx + "," + this.nw.planet.ry+ ")");
            }
            else{
                this.debugPrint(this.nw);
                console.log("generalized mass for nw quad--> " + this.planet.mass + " (" + this.planet.rx + "," + this.planet.ry + ")");
            }
        }
        else
            console.log("nw is null");

        if(this.ne != null){
            if(this.ne.isExternal()){
                console.log(this.ne.planet.name + this.ne.planet.rx + "," + this.ne.planet.ry);
            }
            else{
                this.debugPrint(this.ne);
                console.log("generalized mass for ne quad--> " + this.planet.mass + " (" + this.planet.rx + "," + this.planet.ry + ")");
            }
        }
        else{
            console.log("ne is null");
        }

        if(this.sw != null){
            if(this.sw.isExternal()){
                console.log(this.sw.planet.name + this.sw.planet.rx + "," + this.sw.planet.ry);
            }
            else{
                this.debugPrint(this.sw);
                console.log("generalized mass for sw quad--> " + this.planet.mass + " (" + this.planet.rx + "," + this.planet.ry + ")");

            }
        }
        else{
            console.log("sw is null");
        }

        if(this.se != null){
            if(this.nw.isExternal()){
                console.log(this.se.planet.name + this.se.planet.rx + "," + this.se.planet.ry);
            }
            else{
                this.debugPrint(this.se);
                console.log("generalized mass for se quad--> " + this.planet.mass + " (" + this.planet.rx + "," + this.planet.ry + ")");

            }
        }
        else{
            console.log("se is null");
        }

    }

    //We have to populate the tree with planets. We start at the current tree and recursively travel through the branches
    insert(b){

        //if this node is empty, put this planet into it
        if(this.planet == null){
            this.planet = b;
        }
        /*
        if a body already exists here, but this node IS NOT external
        combine the two bodies and figure out which quadrant of the tree it should be in
        then, update the tree
         */
        else{

            if (this.isExternal() === false) {
                /*
                if you are not external
                update your mass and rCM
                 */
                add(b); //updates rCM and mass
            }
            switch(b.quadLocation){
                case 'nw':
                    if(this.nw === null){
                        this.nw = new BHTree(b, b.quad.NW());
                        this.insert(b, this.nw);
                    }
                    break;

                case 'ne':
                    if(this.ne === null){
                        this.ne = new BHTree(b, b.quad.NE()); //FIXME error here during the debug print
                        this.insert(b, this.ne);
                    }
                    break;

                case 'sw':
                    if(this.sw === null){
                        this.sw = new BHTree(b, b.quad.SW());
                        this.insert(b, this.sw);
                    }
                    break;

                case 'se':
                    if(this.se === null){
                        this. se = new BHTree(b, b.quad.SE());
                        this.insert(b, this.se);
                    }
                    break;
            }
        }
        }//end insert function

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
    if(Math.random() % 2 === 0){
        this.rx =  /*needs to be between -1e9 and 1e9*/ Math.random() * 1e9;
    }
    else
        this.rx = -1 * Math.random() * 1e9;

    if(Math.random() % 2 === 0){
        this.ry =  /*needs to be between -1e9 and 1e9*/ Math.random() * 1e9;
    }
    else
        this.ry = -1 * Math.random() * 1e9;

    // set v0x and v0y
    let px = R * (-Math.log(1 - Math.random()) / -1.8) * (0.5 - Math.random());
    let py = R * (-Math.log(1 - Math.random()) / -1.8) * (0.5 - Math.random());
    let magv = circleV(px, py);
    let absangle = Math.atan(Math.abs(py/px));
    let thetav= Math.PI/2-absangle;
    this.vx = -1*Math.sign(py)*Math.cos(thetav)*magv;;
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

let numBodies = document.getElementById("numBodies"); //TODO how to stop model from generating until form has been submitted
console.log(numBodies);


let q = new Quad(0,0, R);
let shouldRun = false; //TODO change this to true when the run button is clicked
let interactionMethod = "BruteForce"; //TODO make it so that you can choose whether you want BruteForce or BHTree
let sun = new Planet("sun", SOLARMASS,0,0,0,0,0,0);
let universe = new BHTree(sun, q);

function init(){
    for(i = 0; i < numBodies; i++){
        let name = "planet " + i;
        universe.insert(generateRandomPlanet(name));
    }
}

function updatePlanets(dt){
    switch(interactionMethod){
        case "BHTree":
            //TODO write interaction methods
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
            if(universe.nw != null){
                if(universe.nw.isExternal()){
                    console.log(this.nw.planet.name + " (" + this.nw.planet.rx + "," + this.nw.planet.ry+ ")");
                }
                else{
                    this.debugPrint(this.nw);
                    console.log("generalized mass for nw quad--> " + this.planet.mass + " (" + this.planet.rx + "," + this.planet.ry + ")");
                }
            }
            else
                console.log("nw is null");


    }
}








