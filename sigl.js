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

  var Shader = function(context) {
    this.glContext = context;
    this.glShader;

    // These should be set by parsing them out of the shader
    // but can be set by hand first
    this.uniforms = {}; // name : type
    this.vertexAttributes = [];

    this.init = function(url) {
      var shader = getShader(context, url);
      this.glShader = shader;
    }

    this.vertexAttribSetup = function(program) {
      var context = this.glContext;
      this.vertexAttributes.forEach(function(attribute) {
        program.enableVertexAttribute(attribute);
      })
    }

    this.uniformSetup = function(program) {
      var context = this.glContext;
      for (uniform in this.uniforms) {
        program.setupUniform(uniform, this.uniforms[uniform]);
      }
    }

    this.setupProgram = function(program) {
      this.vertexAttribSetup(program);
      this.uniformSetup(program);
    }
  }

  var ShaderProgram = function(context) {
    // FIXME: uniforms and vertex attributes should be in a member variable
    // instead of dumped directly onto the object.
    this.glContext = context;
    this.glProgram = undefined;
    this.vertexAttributes = {};
    this.uniformTypes = {};
    this.uniforms = {};

    this.init = function(url) {
      var program;
      var context = this.glContext;
      program = context.createProgram();
      this.glProgram = program;


      var fragment_shader = new Shader(context);
      fragment_shader.init("test.frag");
      fragment_shader.uniforms = {
        'uSampler': '1i'
        };

      var vertex_shader = new Shader(context);
      vertex_shader.init("test.vert");
      vertex_shader.vertexAttributes = ['aPosition', 'aTexCoord'];
      vertex_shader.uniforms = {
        'uMVMatrix': 'Matrix4fv',
        'uPMatrix': 'Matrix4fv'
        };


      context.attachShader(program, vertex_shader.glShader);
      context.attachShader(program, fragment_shader.glShader);
      context.linkProgram(program);

      if (!context.getProgramParameter(program, context.LINK_STATUS)) {
        alert("Could not initialise shaders");
      }

      context.useProgram(program);

      // TODO:
      // Shaders should be automatically parsed, and attributes should automatically be set up.
      // Parse shader and automatically add attribute variables to
      // And enable attribute arrays
      // javascript program object.
      vertex_shader.setupProgram(this);
      fragment_shader.setupProgram(this);

    }

    this.enableVertexAttribute = function(attribute) {
      var context = this.glContext;
      var va = context.getAttribLocation(this.glProgram, attribute);
      this.vertexAttributes[attribute] = va;
      context.enableVertexAttribArray(va);
    }

    this.setupUniform = function(uniform, uniform_type) {
      this.uniforms[uniform] = context.getUniformLocation(this.glProgram, uniform);
      this.uniformTypes[uniform] = uniform_type;
    }

    // FIXME: This is really a property of the context, not the shader.
    this.bindVertexBuffer = function(attrib_name, buffer) {
      var context = this.glContext;
      context.bindBuffer(context.ARRAY_BUFFER, buffer.glBuffer);
      context.vertexAttribPointer(this.vertexAttributes[attrib_name], buffer.glBuffer.itemSize, context.FLOAT, false, 0, 0);
    }

    this.updateUniforms = function(uniform_values) {
      var context = this.glContext;
      for (uniform in this.uniforms) {
        // FIXME: Understand the 'false' parameter
        // Do this based on the types of uniforms
        var uniform_type = this.uniformTypes[uniform];
        var func_name = 'uniform' + uniform_type;
        //console.log(uniform, func_name, uniform_values[uniform])
        // FIXME: Understand the different uniform types
        if (uniform_type === '1i') {
          context[func_name](this.uniforms[uniform], uniform_values[uniform])
        } else {
          context[func_name](this.uniforms[uniform], false, uniform_values[uniform])
        }
      }
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

    this.updateViewport = function() {
      var context = this.context;
      context.viewport(0, 0, context.viewportWidth, context.viewportHeight);
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    }

    this.createVertexBuffer = function() {
      return new VertexBuffer(context);
    }

    this.createVertexIndexBuffer = function() {
      return new VertexIndexBuffer(context);
    }

    this.bindVIBuffer = function(buffer) {
      this.context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, buffer.glIndexBuffer);
    }

    this.bindTexture = function(texture, index) {
      // FIXME: This should take into account the texture's actual properties
      this.context.activeTexture(context['TEXTURE'+index]);
      this.context.bindTexture(context.TEXTURE_2D, texture.glTexture);
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