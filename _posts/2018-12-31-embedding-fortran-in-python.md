---
layout: post
title: "Embedding FORTRAN in Python"
date: 2018-12-31 18:16:00
---

I recently started developing a [simple Python framework](https://github.com/samhatfield/lorenz96_machine_learning) for playing around with neural nets and data assimilation. I wanted to see whether a neural net could be used as a surrogate for a traditional numerical model to perform the forecast step in an ensemble Kalman filter. I decided on Python because I wanted to use the ridiculously simple [Keras framework](https://keras.io/) to train the model.

<!-- More -->

To train an accurate neural net, you need a lot of data. Now, all I was trying to do was to emulate an existing model as well as possible. I could use this existing model to generate as much training data as I liked. However, I found the Python-based numerical model that I developed to be extremely slow. Here is a simplified version of the model that I was using, the [Lorenz '96 system](https://en.wikipedia.org/wiki/Lorenz_96_model):

```python
# test.py

import numpy as np

# Model forcing and time step
F = 8.0
dt = 0.005

# Step model state forward by one time step
def step(previous):    
    # 4th order Runge-Kutta
    k1 = ode(previous)
    k2 = ode(previous+0.5*dt*k1)
    k3 = ode(previous+0.5*dt*k2)
    k4 = ode(previous+dt*k3)

    return previous + (dt/6)*(k1 + 2*k2 + 2*k3 + k4)

# Model ordinary differential equation
def ode(x):
    return (np.roll(x, -1) - np.roll(x, 2))*np.roll(x, 1) - x + F
```

Let's try it out:

```python
# Number of model variables
nx = 50

# Initialise model state
state = np.zeros(nx)
state[0] = 8.0

# Integrate model for a long time
for _ in range(20000):
    state = step(state)
```

```bash
$> time python.py test.py
python test.py  13.21s user 0.15s system 89% cpu 14.957 total
```

13 seconds for 20,000 time steps. That really started to add up, and it ended up taking several days to generate the training data.

There are several ways to speed up Python code. You can try to interface with Julia by using [pyjulia](https://github.com/JuliaPy/pyjulia), but the general impression I got from the internet is that this isn't yet mature. You could try using a just-in-time compiler like [Numba](http://numba.pydata.org/). I decided to try interfacing with FORTRAN, since that's a language I already have a lot of experience with.

To compile a FORTRAN module into a Python module, you use f2py. If you have Numpy installed, this should be on your path. First, write your FORTRAN module:

```fortran
! fortran.f90
module fortran
    implicit none
contains

! Step model state forward by one timestep
subroutine step(input, output)
    real(8), dimension(50), intent(in) :: input
    real(8), dimension(50), intent(out) :: output
    real(8), dimension(50) :: k1, k2, k3, k4
    real(8) :: dt = 0.005_8

    ! 4th order Runge-Kutta
    k1 = ode(input)
    k2 = ode(input+0.5_8*dt*k1)
    k3 = ode(input+0.5_8*dt*k2)
    k4 = ode(input+dt*k3)

    output = input + (dt/6.0_8)*(k1 + 2.0_8*k2 + 2.0_8*k3 + k4)
end subroutine

! Model ordinary differential equation
function ode(state)
    real(8), intent(in) :: state(50)
    real(8) :: ode(50)
    real(8) :: f = 8.0_8

    ode = cshift(state,-1)*(cshift(state,1)-cshift(state,-2))&
        & - state + f
end function
end module fortran
```

It looks pretty similar to the original Python code. Then, compile it with

```bash
f2py -c -m fortran fortran.f90
```

Along with a bunch of mostly innocuous warnings, this will produce a `fortran.so` file. Sometimes it produces a file with a slightly different name, like `fortran.py-3.6.so`. I'm not sure why.

Now, from the same directory as the `.so` file, you can import the `fortran` module from Python. From the `fortran` _file_, you need to import the `fortran` _module_ and from that you need to import the `step` _subroutine_:

```python
# test.py

import numpy as np
from fortran import fortran

step = fortran.step

# Number of model variables
nx = 50

# Initialise model state
state = np.zeros(nx)
state[0] = 8.0

# Integrate model for a long time
for _ in range(20000):
    state = step(state)
```

Let's try it out:

```bash
$> time python.py test.py
python test.py  0.25s user 0.09s system 94% cpu 0.353 total
```

Whoa. It's _50 times_ faster.

Of course, I'm sure the existing Python code could be optimised. However, readability would probably be sacrificed. By bringing in FORTRAN, we've mostly kept the readability of Python while benefiting from a 50 times speed-up.

There are a number of nasty things about the FORTRAN code. I've had to hard-code the model parameters. I found a way around this eventually, by defining a separate [parameters module](https://github.com/samhatfield/lorenz96_machine_learning/blob/master/numerical_model/params.f90) in FORTRAN that can be used both on the FORTRAN side and the Python side.

I also couldn't find a way to define the floating-point precision except to manually specify the byte width (8 being double-precision). Normally I define a `dp` variable based on `real64` from the intrinsic `iso_fortran_env` module. This gave nebulous compilation errors which I wasn't able to decipher. If anyone knows how to do this, please [tweet me](https://twitter.com/s_e_hatfield).
