---
layout: post
title: "Supercomputer trend data"
date: 2019-04-10 22:02:00
---

Karl Rupp has a [nice blog series](https://www.karlrupp.net/2018/02/42-years-of-microprocessor-trend-data) chronicling the developments in microprocessors over the past 42 years. He took the data originally compiled by M. Horowitz, F. Labonte, O. Shacham, K. Olukotun, L. Hammond, and C. Batten. I wanted to compare this data with parallel developments in supercomputing. So I noted down the number of cores in the #1 supercomputer of the [Top500](https://www.top500.org) going back to June 1993. The top machine at that time was Thinking Machines Corporation's CM-5.

![Microprocessor and supercomputer trend data over the past 42 years]({{site.url}}/public/images/42-years.png)

In only 21 years, we've gone from the top machine having 140 cores (the [Numerical Wind Tunnel](https://en.wikipedia.org/wiki/Numerical_Wind_Tunnel_(Japan))) to having 10.6 million ([Sunway TaihuLight](https://en.wikipedia.org/wiki/Sunway_TaihuLight)).

I've posted this additional data as a fork to Karl's repository [here](https://github.com/samhatfield/microprocessor-trend-data). That includes the plot above and the Python script for creating it.
