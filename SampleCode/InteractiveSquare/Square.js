var canvas;
var gl;
var program;
var theta = 0.0;
var thetaLoc;

var speed = 100;
var direction = true;

function InitWebGL()
{
    canvas = document.getElementById("webGL-canvas");
    gl = canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");
    if (!gl)
    {
        console.log("Browser doesnt support webGL");
        return -1;        
    }
}


function InitShader(vertexShaderId, fragmentShaderId)
{
    var vertElem = document.getElementById( vertexShaderId );
    
    if ( !vertElem ) { 
        alert( "Unable to load vertex shader "  );
        return -1;
    }


    var fragElem = document.getElementById( fragmentShaderId );
    if ( !fragElem ) { 
        alert( "Unable to load vertex shader "  );
        return -1;
    }         
    
    
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertElem.text);
    gl.shaderSource(fragmentShader, fragElem.text);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    program = gl.createProgram();
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }
}

function ConnectWithShaderAttribute()
{                                   
    var positionAttribLocation = gl.getAttribLocation(program, "vPosition");
         

    gl.vertexAttribPointer(
        positionAttribLocation, // Attribute location
        2, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0//3 * Float32Array.BYTES_PER_ELEMENT //Offset from the beginning of a single vertex to this attribute
    );
  
    gl.enableVertexAttribArray(positionAttribLocation);
    
    thetaLoc = gl.getUniformLocation(program, "theta");
   
}

function EventHandler()
{
     // Initialize event handlers

    document.getElementById("testValue").onchange = function(){
    console.log(event.target.value);
    };

    document.getElementById("slider").onchange = function(event) {
        speed = 100 - event.target.value;
    };
    document.getElementById("Direction").onclick = function () {
        direction = !direction;
    };

    document.getElementById("Controls").onclick = function( event) {
        switch(event.target.index) {
          case 0:
            direction = !direction;
            break;

         case 1:
            speed /= 2.0;
            break;

         case 2:
            speed *= 2.0;
            break;
       }
    };

    window.onkeydown = function( event ) {
        var key = String.fromCharCode(event.keyCode);
        switch( key ) {
          case '1':
            direction = !direction;
            break;

          case '2':
            speed /= 2.0;
            break;

          case '3':
            speed *= 2.0;
            break;
        }
    };
}

function SupplyData()
{
    
    
    var vertices = [
                    // position color
                     0.0, 1.0, 
                     1.0, 0.0,  
                     -1.0, 0.0, 
                     0.0, -1.0
                ];
    
    var triangleVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),gl.STATIC_DRAW);  
}

function Render()
{                      
    //
    // Main render loop
    //
        //set clear color
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.8, 0.6, 0.2, 1.0);
    
    //clear color buffer using color above
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    theta += (direction ? 0.1 : -0.1);
    gl.uniform1f(thetaLoc, theta);
      
    gl.useProgram(program); 

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    setTimeout(
        function () {requestAnimFrame( Render );},
        speed
    );
}

var RunWebGL = function(vertexShaderId, fragShaderID)
{
    InitWebGL();
    InitShader(vertexShaderId, fragShaderID);
    SupplyData();
    ConnectWithShaderAttribute();       
    EventHandler();   
    Render();            
}


window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();