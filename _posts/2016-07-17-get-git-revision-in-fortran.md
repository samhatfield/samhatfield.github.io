---
layout: post
title: "Get git revision from FORTRAN"
date: 2016-07-17 18:57:00
---

Why not put the current revision of your git repository in your output file, when using FORTRAN?

{% highlight fortran %}
character(len=41) :: git_rev

! ...

call execute_command_line('git rev-parse HEAD > out.txt')
open(unit=10, file='out.txt', action='read')
read(10, *) git_rev
close(10)
call execute_command_line('rm -f out.txt')

! ...

nf90_put_att(ncid, nf90_global, "git-rev", git_rev)
{% endhighlight %}

And then:

{% highlight bash %}
$ ncdump -h output.nc
netcdf output {
...
// global attributes:
                :git-rev = "8b74bcc960850500de5aaff02664b6049ab81b27" ;
}
{% endhighlight %}

Cool!

The `execute_command_line` subroutine is included in the FORTRAN 2008 standard. Unfortunately, there is no way in the standard to capture the output of the shell command. It's therefore necessary to redirect output to a temporary file, read that file into a character array and then delete it. Be careful what you name the file, so that you don't accidentally overwrite an existing one.
