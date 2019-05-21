---
layout: post
title: "The Raspberry Pi Planet Simulator technical summary"
date: 2019-05-21 11:08:00
---

I recently lead the development of a Raspberry Pi-based cluster for performing weather simulations, the Raspberry Pi Planet Simulator (Raspberry PiPS). I talked about this project, including the motivations, in a blog post on the [European Centre for Medium-Range Weather Forecasts (ECMWF)'s forecast](https://www.ecmwf.int/en/about/media-centre/science-blog/2019/weather-forecasts-openifs-home-made-supercomputer). Here I'll give a technical summary of the project and how you can go about creating your own.

<!-- More -->

_This blog post is a work in progress. Unfortunately, I stupidly didn't create notes as I set up PiPS so I may be adding things I forgot later on._

The summary of the summary is:
1. Buy 5 Raspberry Pis (4 compute nodes and 1 head node), 5 PoE hats, a PoE network switch, ethernet cables and SD cards.
2. Install Raspbian on each Raspberry Pi.
3. Install dependencies on each Raspberry Pi: gfortran, cmake, python, eccodes, openmpi, LAPACK, BLAS.
4. Get access to OpenIFS.
5. Get an initial condition and climatology.
6. Compile the model.
7. Run the model!
8. Process the output.

I'll describe the various steps in more detail later on.
