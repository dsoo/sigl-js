;(function() {
  window.SIGL = {}

  var Texture = function(context) {
    this.glContext = context;
    this.glTexture = context.createTexture();

    this.init = function() {
      var context = this.glContext;
      var texture = this.glTexture;

      var size = 8;
      var pixels = new Uint8Array(size*size*4);
      var i;
      for (i = 0; i < size*size*4; ++i) {
        if (0 == (i % 3)) {
          pixels.set([255], i);
        }
      }

      context.bindTexture(context.TEXTURE_2D, texture);
      context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, size, size, 0, context.RGBA, context.UNSIGNED_BYTE, pixels);
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
      context.bindTexture(context.TEXTURE_2D, null);
    }
  }
  window.SIGL.Texture = Texture;

  var VertexBuffer = function(context) {
    this.glContext = context;
    this.glBuffer;

    this.init = function(data, stride) {
      var context = this.glContext;
      var buffer = context.createBuffer();
      context.bindBuffer(context.ARRAY_BUFFER, buffer);
      context.bufferData(context.ARRAY_BUFFER, new Float32Array(data), context.STATIC_DRAW);

      // TODO: Validate buffer sizes;
      buffer.itemSize = stride;
      buffer.numItems = vertices.length/stride;
      this.glBuffer = buffer;
    }
  }
  window.SIGL.VertexBuffer = VertexBuffer;

  var VertexIndexBuffer = function(context) {
    this.glContext = context;
    this.glIndexBuffer;

    this.init = function(data, stride) {
      // FIXME: Automatically determine buffer size based on length of index list
      var context = this.glContext;
      var index_buffer = context.createBuffer();
      context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, index_buffer);
      context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), context.STATIC_DRAW);
      index_buffer.itemSize = stride;
      index_buffer.numItems = data.length/stride;
      this.glIndexBuffer = index_buffer;
    }
  }

  var ShaderProgram = function(context) {
    this.glContext = context;
    this.glProgram = undefined;

    this.init = function() {
      console.log('Initializing shaders');
      var program;
      var context = this.glContext;

      var fragmentShader = getShader(context, "test.frag");
      var vertexShader = getShader(context, "test.vert");

      program = context.createProgram();
      context.attachShader(program, vertexShader);
      context.attachShader(program, fragmentShader);
      context.linkProgram(program);

      if (!context.getProgramParameter(program, context.LINK_STATUS)) {
        alert("Could not initialise shaders");
      }

      context.useProgram(program);

      // TODO:
      // Parse shader and automatically add attribute variables to
      // And enable attribute arrays
      // javascript program object.

      program.vertexPositionAttribute = context.getAttribLocation(program, "aVertexPosition");
      context.enableVertexAttribArray(program.vertexPositionAttribute);

      program.textureCoordAttribute = context.getAttribLocation(program, "aTextureCoord");
      context.enableVertexAttribArray(program.textureCoordAttribute);

      program.pMatrixUniform = context.getUniformLocation(program, "uPMatrix");
      program.mvMatrixUniform = context.getUniformLocation(program, "uMVMatrix");
      program.samplerUniform = context.getUniformLocation(program, "uSampler");

      this.glProgram = program;
    }

    // FIXME: This is really a property of the context, not the shader.
    this.bindVertexBuffer = function(attrib_name, buffer) {
      var context = this.glContext;
      context.bindBuffer(context.ARRAY_BUFFER, buffer.glBuffer);
      context.vertexAttribPointer(this.glProgram[attrib_name], buffer.glBuffer.itemSize, context.FLOAT, false, 0, 0);
    }

    this.update = function(pMatrix, mvMatrix) {
      var context = this.glContext;
      context.uniform1i(this.glProgram.samplerUniform, 0);
      context.uniformMatrix4fv(this.glProgram.pMatrixUniform, false, pMatrix);
      context.uniformMatrix4fv(this.glProgram.mvMatrixUniform, false, mvMatrix);
    }
  }
  window.SIGL.ShaderProgram = ShaderProgram;

  var Renderer = function(context) {
    // Keep track of resources for you
    // The rendering context
    // All buffers associated with the context
    // All shaders associated with the context
    // All textures associated with the context

    this.context = context;
    this.shaderProgram = undefined;
    this.texture = undefined;

    this.createVertexBuffer = function() {
      return new VertexBuffer(context);
    }

    this.createVertexIndexBuffer = function() {
      return new VertexIndexBuffer(context);
    }

    this.bindVIBuffer = function(buffer) {
      this.context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, buffer.glIndexBuffer);
    }

    this.initTexture = function() {
      this.texture = new Texture(this.context);
      this.texture.init();
    }

    this.initShaders = function() {
      this.shaderProgram = new ShaderProgram(this.context);
      this.shaderProgram.init();
    }
  }
  window.SIGL.Renderer = Renderer;

})();