#!/usr/bin/env python
# Modification History
# 02/05/2017 Created. Brian S Hayes (Hayeswise)

#import glob
#import time
#import re
#import io
#import base64
#import sys
import os
import shutil
#import json
import shelve
#import hashlib
#import subprocess
from datetime import datetime

# Assume a single GitHub root directory
# ~name/Documents/GitHub
#
# Synch selected files from
#    /ingress-intel-total-conversion
# with
#    /iitc-addremovemarker
#    /iitc-portalsinpolygons
# The
# // @updateURL      @@UPDATEURL@@
# // @downloadURL    @@DOWNLOADURL@@
# for addremovemarker, portalsinpolygons should be ingress-intel-total-conversion;
# In this way, user will migrated over to the dist for the larger gits.

# Configuration
verbose = True

# Distribution Configuration
# "source file path":"destination directory"
distributionConfiguration = {
  "./dist/plugins/wise-portalsinpolygons.user.js":"../iitc-portalsinpolygons",
  "./docs/plugins/wise-portalsinpolygons.user.md":"../iitc-portalsinpolygons/docs",
  "./dist/plugins/wise-addremovemarker.user.js":"../iitc-addremovemarker",
  "./docs/plugins/wise-addremovemarker.user.md":"../iitc-addremovemarker/docs",
  "./docs/plugins/addRemoveMarker-controls.png":"../iitc-addremovemarker/docs"
}

def lastModText(datetimestamp):
    return "does not exist." if datetimestamp == 0 else ("was last modified on " + (str(datetime.fromtimestamp(datetimestamp))))

########################################################
# START
########################################################

# Set directory values and create directories if missing
cwd = os.getcwd()

verbose and print ("Copy changed files to public destinations known!")

fileIndex = 0
filesCopied = 0
for fn, destDir in distributionConfiguration.items():
    verbose and print("Copying file[" + str(fileIndex) + "] " + fn + " to " + destDir);
    if os.path.exists(fn):
      srcFileModTime = os.path.getmtime(fn) if os.path.exists(fn) else 0
      verbose and print("   " + fn + " " + lastModText(srcFileModTime))
      if not os.path.exists(destDir):
        os.mkdir(destDir)
      destPath = os.path.join(destDir, os.path.basename(fn))
      destFileModTime = os.path.getmtime(destPath) if os.path.exists(destPath) else 0
      verbose and print("   " + destPath + " " + lastModText(destFileModTime))
      if (srcFileModTime > destFileModTime):
        verbose and print ("   copy " + fn + " to " + destDir)
        shutil.copy2(fn, destDir)
        # TODO: directly git to repository
        filesCopied = filesCopied + 1
      else:
        verbose and print ("   file not copied: distribution file is up-to-date")
    else:
        print (">>> Source File Not Found: " + fn)
    fileIndex = fileIndex + 1
    print("")

print ("Done")
