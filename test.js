// This is a test implementation of a very simple WebGL example
// originating from the original Khronos WebGL examples using SIGL.
// The goal is to demonstrate that you can build straightforward
// code for implementing simple rendering without the complexity of
// dealing with GL-specific boilerplate.


var vertex_position_buffer;
var vertex_tex_coord_buffer;
var vertex_index_buffer;
var shader_program;
var texture;

function initBuffers(renderer) {
  vertex_position_buffer = renderer.createVertexBuffer();
  vertex_position_buffer.initURL('test_verts.buf');

  vertex_tex_coord_buffer = renderer.createVertexBuffer();
  vertex_tex_coord_buffer.initURL('test_tcs.buf');

  vertex_index_buffer = renderer.createVertexIndexBuffer();
  vertex_index_buffer.initURL('test_indices.buf');
}

function initShaders(renderer) {
  shader_program = renderer.createShaderProgram();
  shader_program.initURLs(['test.frag', 'test.vert']);
}

function initTexture(renderer) {
  texture = renderer.createTexture();
  texture.init({
    width: 64,
    height: 64
  });
  texture.mapPixels(function(x, y) {
    var value = (1 + Math.sin(x + y))*255*0.5;
    return [value, value, value, value];
  });
}


function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

var xRot = 0;
var yRot = 0;
var zRot = 0;

function drawScene(renderer) {
  var context = renderer.glContext;

  var mvMatrix = mat4.create();
  var pMatrix = mat4.create();

  renderer.updateViewport();

  // Bind vertex buffers
  shader_program.bindVertexBuffer('aPosition', vertex_position_buffer);
  shader_program.bindVertexBuffer('aTexCoord', vertex_tex_coord_buffer);

  // Bind index buffers
  renderer.bindVIBuffer(vertex_index_buffer);

  // Set up texture
  renderer.bindTexture(texture, 0)


  // Update shader parameters
  // Set up the perspective matrix
  mat4.perspective(45, context.viewportWidth / context.viewportHeight, 0.1, 100.0, pMatrix);

  // Set up the modelview matrix
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);
  mat4.rotate(mvMatrix, degToRad(xRot), [1, 0, 0]);
  mat4.rotate(mvMatrix, degToRad(yRot), [0, 1, 0]);
  mat4.rotate(mvMatrix, degToRad(zRot), [0, 0, 1]);

  shader_program.updateUniforms({
    'uSampler': 0,
    'uMVMatrix': mvMatrix,
    'uPMatrix': pMatrix,
    'uThreshold': 0.5*(1+Math.sin(0.001*lastTime))
  })

  context.drawElements(context.TRIANGLES, vertex_index_buffer.glIndexBuffer.numItems, context.UNSIGNED_SHORT, 0);
}


var lastTime = 0;

function animate() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;

    xRot += (90 * elapsed) / 10000.0;
    yRot += (90 * elapsed) / 10000.0;
    zRot += (90 * elapsed) / 10000.0;
  }
  lastTime = timeNow;
}

function updateAndDraw(renderer) {
  animate();
  drawScene(renderer);
}

function tick(renderer, interval) {
  requestAnimFrame(function() {
    if (interval) {
      setTimeout(function() {
        tick(renderer);
      }, 1000);
    } else {
      tick(renderer);
    }
  })
  updateAndDraw(renderer);
}


$(document).ready(function() {
  // Initialize openGL
  var canvas = document.getElementById("webgl-canvas");

  function resizeCanvas()
  {
    canvas.width = document.width;
    canvas.height = document.height;
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  }
  $(window).resize(resizeCanvas)

  var context;

  try {
    context = canvas.getContext("experimental-webgl", {alpha: true, preMultipliedAlpha: true, antialias: true});
    resizeCanvas();
  } catch (e) {
  }

  if (!context) {
    alert("Could not initialise WebGL, sorry :-(");
  }

  var renderer = new SIGL.Renderer(context);
  context.clearColor(0.0, 0.0, 0.0, 0.0);

  initShaders(renderer);
  initBuffers(renderer);
  initTexture(renderer);

  context.enable(context.DEPTH_TEST);

  tick(renderer);
});
