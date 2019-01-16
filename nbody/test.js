class obj{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}
function main(){ //merge with runSimulation
    let object = new obj(100,100);
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    // let t0 = (new Date()).getTime();
    // let t1 = 0;
    // let gDt = 0;
    // let windowsize = oldwindowsize = cw > ch ? cw : ch;
    // let deltasize;

    window.requestAnimationFrame(gameloop);

    function updateC(obj) { //pass in one plant

        // //width and height indicators
        ctx.fillStyle = 'red';
        // ctx.fillText("Width: " + cw, 10, 50);
        // ctx.fillText("Height: " + ch, 10, 70);
        // ctx.fillText("Key: " + key, 10, 130);

        //draws the circle
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.stroke();


    }

    function gameloop(){ //updating times
        ctx.clearRect(0,0,1920,1080);

        updateC(object);
        window.requestAnimationFrame(gameloop); //recursive call so will go on forever
    } //end game loop
}


main();