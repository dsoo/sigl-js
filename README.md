First, a warning: SIGL is VERY early, and entirely experimental. Use at your own risk. :)

What is SIGL?

After having spent several years away from doing computer graphics development, I've finally recently decided to
start experimenting again, this time starting off with WebGL.

On looking at the existing WebGL frameworks that are out there right now, it seems like
most of them are too high level to make it easy to do some of the experimentation that I want to do -
mostly surrounding procedural geometry, texture and shader generation.

The goal of SIGL is to provide a layered, modular toolkit for rendering engine experimentation that
abstracts away a lot of the low-level boilerplate of WebGL, but still allows the
flexibility to do substantial experimentation. I also hope that it will be useful as
a tool for teaching people about the fundamental architecture of how modern rendering
engines work.

After completing the initial wrapping of basic GL objects (buffers, textures, shaders, etc.)
the next area of focus will be on building modules to allow for interesting transformation and
manipulation of data in the GL pipeline. Hopefully this will allow for the creation of both
traditional scene-graph based graphics pipelines, but also many more novel graphics pipelines
that may be suited for different types of applications such as real0-time data visualization.