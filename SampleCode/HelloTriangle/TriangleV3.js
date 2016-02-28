var canvas;
var gl;
var program;

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
    var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');              

    gl.vertexAttribPointer(
        positionAttribLocation, // Attribute location
        2, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT //Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 //2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
}

function SupplyData()
{
    
    
    var vertices = [
                    // position color
                     1.0, 1.0, 0.0, 0.0,  0.5, 
                  0.7, 0.0, 1.0, -0.5, -0.5,  
                   0.1, 1.0, 0.6, 0.5, -0.5
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
    gl.clearColor(0.8, 0.6, 0.2, 1.0);
    
    //clear color buffer using color above
    gl.clear(gl.COLOR_BUFFER_BIT);  
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

var RunWebGL = function(vertexShaderId, fragShaderID)
{
    InitWebGL();
    InitShader(vertexShaderId, fragShaderID);
    SupplyData();
    ConnectWithShaderAttribute();          
    Render();            
}