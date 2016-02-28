var InitWebGL1 = function(){
    //console.log("");
    
    //1. Get the canvas
    var canvas = document.getElementById("triangleWebGLCanvas");
    var gl = canvas.getContext("webgl") ||
             canvas.getContext("experimental-webgl");
    if (!gl)
    {
        console.log("Browser doesnt support webGL");
        return;        
    }
    
    gl.clearColor(0.8, 0.8, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
}