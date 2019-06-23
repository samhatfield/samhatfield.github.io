---
layout: post
title: "The Raspberry Pi Planet Simulator technical summary"
date: 2019-05-21 11:08:00
---

I recently lead the development of a Raspberry Pi-based cluster for performing weather simulations with the OpenIFS model, the Raspberry Pi Planet Simulator (Raspberry PiPS). I talked about this project, including the motivations, in a blog post on the [European Centre for Medium-Range Weather Forecasts (ECMWF)'s forecast](https://www.ecmwf.int/en/about/media-centre/science-blog/2019/weather-forecasts-openifs-home-made-supercomputer). Here I'll give a technical summary of the project and how you can go about creating your own.

<!-- More -->

_This blog post is a work in progress. Unfortunately, I stupidly didn't create notes as I set up PiPS so I may be adding things I forgot later on._

The summary of the summary is:
1. Acquire hardware
2. Install Raspbian on each Raspberry Pi.
3. Install dependencies on each Raspberry Pi: gfortran, cmake, python, eccodes, openmpi, LAPACK, BLAS.
4. Get access to OpenIFS.
5. Get an initial condition and climatology.
6. Compile the model.
7. Run the model!
8. Process the output.


## 1. Acquire hardware

The required hardware is as follows:
- 5 Raspberry Pi 3 Model B+s
- 5 PoE hats
- 1 PoE network switch
- 6 ethernet cables
- 5 micro SD cards

I used four Pis as compute nodes, which do the actual computing, and one Pi as a head node, which is just used for logging into and for invoking the model's executable. At first I tried just having four compute nodes, from one of which I would invoke the executable. However, for reasons I don't understand OpenIFS would hang when initialising MPI. So I added a fifth node from which to invoke the executable. This is standard protocol for cluster computing anyway.

To minimise the number of cables I took advantage of the Model 3 B+'s power-over-ethernet (PoE) functionality, which is exactly what it sounds like. However, in order to use PoE you need to buy a surprisingly-expensive [PoE hat](https://www.raspberrypi.org/products/poe-hat/) for each Pi. The PoE hat is quite poorly constructed and difficult to remove once installed. I'd only recommend this option if you really don't like cables. Otherwise, just power each Pi through the USB ports.

So that the Pis can communicate you need a network switch, which is like a simplified router without Wi-Fi (though you could use an old router). There needs to be enough ports for each of the five Pis as well as an extra port for plugging in a laptop (for any debugging etc.). If you go down the PoE route, **make sure there are enough PoE-powered ports for each PoE-powered Pi**. Many switches only have a fraction of the ports with PoE.

Finally you'll need a micro SD card for each Pi. I used a 32 GB card for each Pi, except for one Pi for which I used a 64 GB card. The latter Pi will be used for hosting the cluster's networked file system so it may need a little extra space.
