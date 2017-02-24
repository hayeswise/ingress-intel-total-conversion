# How To Setup a Second Clone/Fork
I'm running to forks of [iitc-project/ingress-intel-total-conversion](https://github.com/iitc-project/ingress-intel-total-conversion).  The first one I forked using GitHub and it exists as a private repository.  I renamed it via GitHub > Settings tab > Settings section > Repository name.

The second fork was created using git.
1. Create a project on GitHub called ingress-intel-total-conversion
2. Clone the project onto your local machine (I used GitHub desktop)
3. Add iitc-project/ingress-intel-total-conversion as the upstream.
```
> git remote add origin https://github.com/iitc-project/ingress-intel-total-conversion
> git fetch
> git remote -v
```
