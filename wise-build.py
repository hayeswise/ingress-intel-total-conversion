#!/usr/bin/env python
# Modification History
# 01/28/2017 Add jsdoc2md and some print statements to trace what's going on. Brian S Hayes (Hayeswise)
# 02/04/2017 Add if exists check around distribution file rather than use try block.  Brian S Hayes (Hayeswise)

import glob
import time
import re
import io
import base64
import sys
import os
import shutil
import json
import shelve
import hashlib
import subprocess
import time
from datetime import datetime
#try:
#    import jsmin
#except ImportError:
#    print ("Not able to import jsmin")


try:
  import urllib2
except ImportError:
  import urllib.request as urllib2

# load settings file
from buildsettings import buildSettings

# load option local settings file
try:
    from localbuildsettings import buildSettings as localBuildSettings
    buildSettings.update(localBuildSettings)
except ImportError:
    pass

# load default build
try:
    from localbuildsettings import defaultBuild
except ImportError:
    defaultBuild = None

buildName = defaultBuild

clean = False
verbose = False

# build name from command line
if len(sys.argv) >= 2:	# argv[0] = program, argv[1] = buildname, len=2
    buildName = sys.argv[1]

if len(sys.argv) >= 3:	# argv[0] = program, argv[1] = buildname, option
    for option in sys.argv:
        if option == "-verbose" or option == "--verbose":
            verbose = True;
        if option == "-clean" or option == "--clean":
            clean = True;

if buildName is None or not buildName in buildSettings:
    print ("Usage: build.py buildname [--verbose] [--clean]")
    print (" available build names: %s" % ', '.join(buildSettings.keys()))
    print (" if --clean, the files will not be built.")
    sys.exit(1)

# set up vars used for replacements
utcTime = time.gmtime()
buildDate = time.strftime('%Y-%m-%d-%H%M%S',utcTime)

# userscripts have specific specifications for version numbers - the above date format doesn't match
dateTimeVersion = time.strftime('%Y%m%d.',utcTime) + time.strftime('%H%M%S',utcTime).lstrip('0')

verbose and print("IITC build, dateTimeVersion=" + dateTimeVersion + ", buildDate=" + buildDate)
verbose and print ("Get buildSettings[" + buildName + "]")
if buildName in buildSettings:
    settings = buildSettings[buildName]

# extract required values from the settings entry
resourceUrlBase = settings.get('resourceUrlBase')
distUrlBase = settings.get('distUrlBase')
buildMobile = settings.get('buildMobile')
antOptions = settings.get('antOptions','')
antBuildFile = settings.get('antBuildFile', 'mobile/build.xml');


# plugin wrapper code snippets. handled as macros, to ensure that
# 1. indentation caused by the "function wrapper()" doesn't apply to the plugin code body
# 2. the wrapper is formatted correctly for removal by the IITC Mobile android app
pluginWrapperStart = """
function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = '@@BUILDNAME@@';
plugin_info.dateTimeVersion = '@@DATETIMEVERSION@@';
plugin_info.pluginId = '@@PLUGINNAME@@';
//END PLUGIN AUTHORS NOTE

"""

pluginWrapperStartUseStrict = pluginWrapperStart.replace("{\n", "{\n\"use strict\";", 1).replace("function", ";function", 1)

pluginWrapperEnd = """
setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = {version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);

"""
def lastModText(datetimestamp):
    return "does not exist." if datetimestamp == 0 else ("was last modified on " + (str(datetime.fromtimestamp(datetimestamp))))

def readfile(fn):
    with io.open(fn, 'Ur', encoding='utf8') as f:
        return f.read()

def loaderString(var):
    fn = var.group(1)
    return readfile(fn).replace('\n', '\\n').replace('\'', '\\\'')

def loaderRaw(var):
    fn = var.group(1)
    return readfile(fn)

def loaderMD(var):
    fn = var.group(1)
    # use different MD.dat's for python 2 vs 3 incase user switches versions, as they are not compatible
    db = shelve.open('build/MDv' + str(sys.version_info[0]) + '.dat')
    if 'files' in db:
      files = db['files']
    else:
      files = {}
    file = readfile(fn)
    filemd5 = hashlib.md5(file.encode('utf8')).hexdigest()
    # check if file has already been parsed by the github api
    if fn in files and filemd5 in files[fn]:
      # use the stored copy if nothing has changed to avoid hitting the api more then the 60/hour when not signed in
      db.close()
      return files[fn][filemd5]
    else:
      url = 'https://api.github.com/markdown'
      payload = {'text': file, 'mode': 'markdown'}
      headers = {'Content-Type': 'application/json'}
      req = urllib2.Request(url, json.dumps(payload).encode('utf8'), headers)
      md = urllib2.urlopen(req).read().decode('utf8').replace('\n', '\\n').replace('\'', '\\\'')
      files[fn] = {}
      files[fn][filemd5] = md
      db['files'] = files
      db.close()
      return md

def loaderImage(var):
    fn = var.group(1)
    return 'data:image/png;base64,{0}'.format(base64.encodestring(open(fn, 'rb').read()).decode('utf8').replace('\n', ''))

def loadCode(ignore):
    return '\n\n;\n\n'.join(map(readfile, sorted(glob.glob('code/*.js'))))

def extractUserScriptMeta(var):
    m = re.search ( r"//[ \t]*==UserScript==\n.*?//[ \t]*==/UserScript==\n", var, re.MULTILINE|re.DOTALL )
    return m.group(0)

def latestDependencyModTime(script):
    # TODO add something for INJECTCODE
    patterns = ['@@INCLUDERAW:([0-9a-zA-Z_./-]+)@@', '@@INCLUDESTRING:([0-9a-zA-Z_./-]+)@@', '@@INCLUDEMD:([0-9a-zA-Z_./-]+)@@' '@@INCLUDEIMAGE:([0-9a-zA-Z_./-]+)@@']
    groupLastModDate = 0
    for pattern in patterns:
        files = re.findall(pattern,script)
        for file in files:
            lastModDate = os.path.getmtime(file)
            verbose and print ("...dependency " + file + " " + lastModText(lastModDate))
            if lastModDate > groupLastModDate:
                groupLastModDate = lastModDate
    return groupLastModDate

def doReplacements(script,updateUrl,downloadUrl,pluginName=None):

    script = re.sub('@@INJECTCODE@@',loadCode,script)

    script = script.replace('@@PLUGINSTART@@', pluginWrapperStart)
    script = script.replace('@@PLUGINSTART-USE-STRICT@@', pluginWrapperStartUseStrict)
    script = script.replace('@@PLUGINEND@@', pluginWrapperEnd)

    script = re.sub('@@INCLUDERAW:([0-9a-zA-Z_./-]+)@@', loaderRaw, script)
    script = re.sub('@@INCLUDESTRING:([0-9a-zA-Z_./-]+)@@', loaderString, script)
    script = re.sub('@@INCLUDEMD:([0-9a-zA-Z_./-]+)@@', loaderMD, script)
    script = re.sub('@@INCLUDEIMAGE:([0-9a-zA-Z_./-]+)@@', loaderImage, script)

    script = script.replace('@@BUILDDATE@@', buildDate)
    script = script.replace('@@DATETIMEVERSION@@', dateTimeVersion)

    if resourceUrlBase:
        script = script.replace('@@RESOURCEURLBASE@@', resourceUrlBase)
    else:
        if '@@RESOURCEURLBASE@@' in script:
            raise Exception("Error: '@@RESOURCEURLBASE@@' found in script, but no replacement defined")

    script = script.replace('@@BUILDNAME@@', buildName)

    script = script.replace('@@UPDATEURL@@', updateUrl)
    script = script.replace('@@DOWNLOADURL@@', downloadUrl)

    if (pluginName):
        script = script.replace('@@PLUGINNAME@@', pluginName);

    return script


def saveScriptAndMeta(script,ourDir,filename):
    fn = os.path.join(outDir,filename)
    with io.open(fn, 'w', encoding='utf8') as f:
        f.write(script)

    metafn = fn.replace('.user.js', '.meta.js')
    if metafn != fn:
        with io.open(metafn, 'w', encoding='utf8') as f:
            meta = extractUserScriptMeta(script)
            f.write(meta)

# Set directory values and create directories if missing
cwd = os.getcwd()
buildRoot = os.path.join(cwd, 'build')
docRoot = os.path.join(cwd, "docs")
distRoot = os.path.join(cwd, 'dist')
outDir = os.path.join(buildRoot, buildName)

if clean:
    verbose and print ("Cleaning directories")
    for d in [outDir, distRoot, docRoot]:
        if os.path.exists(d):
            verbose and print("..." + d)
            for d, dirs, files in os.walk(d): # Thanks to rejax at http://stackoverflow.com/questions/36267807/python-recursively-remove-files-folders-in-a-directory-but-not-the-parent-direc
                for name in files:
                    try:
                        os.remove(os.path.join(d,name))
                    except:
                        print("...Error:", sys.exec_info()[0])
                for name in dirs:
                    try:
                        shutil.rmtree(os.path.join(d,name))
                    except:
                        print("...Error:", sys.exec_info()[0])
    for d, dirs, files in os.walk(buildRoot):
        for name in files:
            try:
                os.remove(os.path.join(d,name))
            except:
                print("...Error:", sys.exec_info()[0])
    sys.exit(1);


if not os.path.exists(buildRoot):
    os.mkdir(buildRoot)

if not os.path.exists(outDir):
    os.mkdir(outDir)

if not os.path.exists(distRoot):
    os.mkdir(distRoot)

if not os.path.isdir(docRoot):
    os.mkdir(os.path.join(cwd, "docs"))

# see if jsdoc2md is installed for JSDoc
jsdoc2md = shutil.which("jsdoc2md")
jsdocFiles = []

# run any preBuild commands
for cmd in settings.get('preBuild',[]):
    os.system ( cmd )

# load main.js, parse, and create main total-conversion-build.user.js
main = readfile('main.js')

downloadUrl = distUrlBase and distUrlBase + '/total-conversion-build.user.js' or 'none'
updateUrl = distUrlBase and distUrlBase + '/total-conversion-build.meta.js' or 'none'

# TODO: Only rebuild if main or one of the dependencies has changed per file last modified date
main = doReplacements(main,downloadUrl=downloadUrl,updateUrl=updateUrl)
saveScriptAndMeta(main, outDir, 'total-conversion-build.user.js')

with io.open(os.path.join(outDir, '.build-timestamp'), 'w') as f:
    f.write(u"" + time.strftime('%Y-%m-%d %H:%M:%S UTC', utcTime))

# for each plugin, load, parse, and save output
pluginsBuildRoot = os.path.join(outDir,'plugins')
if not os.path.exists(pluginsBuildRoot):
    os.mkdir(pluginsBuildRoot)

verbose and print ("Build plugins and generate individual JSDocs")

fileIndex = 0
for fn in glob.glob("plugins/*.user.js"):
    verbose and print("Processing plugin[" + str(fileIndex) + "] " + fn)
    srcModTime = os.path.getmtime(fn) # Just note that the replacement strategy obfusactes file modification dates
    buildPath = os.path.join(outDir, fn)
    distPath = os.path.join(distRoot, fn)
    distDir = os.path.dirname(distPath)
    docPath = os.path.join(docRoot, fn.replace(".js",".md"))
    docDir = os.path.dirname(docPath)
    verbose and print("...buildPath is " + buildPath)
    verbose and print("...distPath is " + distPath)
    distFileModTime = os.path.getmtime(distPath) if os.path.exists(distPath) else 0
    buildFileModTime = os.path.getmtime(buildPath) if os.path.exists(buildPath) else 0
    script = readfile(fn)
    dependencyModTime = latestDependencyModTime(script)
    verbose and print ("..." + fn + " " + lastModText(srcModTime) + ", last modified dependency on "
        + lastModText(dependencyModTime) + ", build version " + lastModText(buildFileModTime))
    if (srcModTime > buildFileModTime or dependencyModTime > buildFileModTime):
        downloadUrl = distUrlBase and distUrlBase + '/' + fn.replace("\\","/") or 'none'
        updateUrl = distUrlBase and downloadUrl.replace('.user.js', '.meta.js') or 'none'
        pluginName = os.path.splitext(os.path.splitext(os.path.basename(fn))[0])[0]
        script = doReplacements(script, downloadUrl=downloadUrl, updateUrl=updateUrl, pluginName=pluginName)
        saveScriptAndMeta(script, outDir, fn) # TODO: consider passing n buildPath
        if not os.path.exists(distDir):
            verbose and print("...os.path.makedirs(" + distDir + ")")
            os.makedirs(distDir)
        shutil.copy2(buildPath, distPath)
        #shutil.copy2(buildPath.replace('.user.js', '.meta.js'), distPath.replace('.user.js', '.meta.js'))
        #jsdocFiles.append(os.path.join(cwd,os.path.join(outDir,fn)))
    else:
        verbose and print ("...no need to build since distribution is older than dependencies")
    if jsdoc2md != None:
        possibleJSDoc = re.search("/\*\*[ \t\n\r]{1}",script, re.MULTILINE)
        buildFileModTime = os.path.getmtime(buildPath) if os.path.exists(buildPath) else 0;
        docFileModTime = os.path.getmtime(docPath) if os.path.exists(docPath) else 0;
        if (possibleJSDoc != None and (buildFileModTime > docFileModTime)): # this approach allows doc to be created outside this build.py
            if not os.path.exists(docDir):
                verbose and print("...os.path.makedirs(" + docDir + ")")
                os.makedirs(docDir)
            #docCmd = jsdoc2md + " " + os.path.join(cwd,os.path.join(outDir,fn)) + " > " + os.path.join(cwd,os.path.join("docs", os.path.basename(fn).replace(".js",".md")))
            docCmd = jsdoc2md + " " + buildPath + " > " + docPath
            verbose and print ("..." + docCmd)
            subprocess.call(docCmd)
    fileIndex = fileIndex + 1

# jsdoc2md non user files
fileIndex = 0
others = [fn for fn in glob.glob("plugins/*.js") if not ".user." in fn]
for fn in others:
    verbose and print("Processing others[" + str(fileIndex) + "] " + fn)
    docPath = os.path.join(docRoot, fn.replace(".js",".md"))
    docDir = os.path.dirname(docPath)
    script = readfile(fn)
    if jsdoc2md != None:
        possibleJSDoc = re.search("/\*\*[ \t\n\r]{1}",script, re.MULTILINE)
        srcModTime = os.path.getmtime(fn);
        docFileModTime = os.path.getmtime(docPath) if os.path.exists(docPath) else 0;
        if ((possibleJSDoc != None) and (srcModTime > docFileModTime)):
            if not os.path.exists(docDir):
                verbose and print("...os.path.makedirs(" + docDir + ")")
                os.makedirs(docDir)
            #docCmd = jsdoc2md + " " + os.path.join(cwd,os.path.join(outDir,fn)) + " > " + os.path.join(cwd,os.path.join("docs", os.path.basename(fn).replace(".js",".md")))
            docCmd = jsdoc2md + " " + fn + " > " + docPath
            verbose and print ("..." + docCmd)
            subprocess.call(docCmd)
    fileIndex = fileIndex + 1

# if we're building mobile too
if buildMobile:
    verbose and print ("Build mobile")
    if buildMobile not in ['debug','release','copyonly']:
        raise Exception("Error: buildMobile must be 'debug' or 'release' or 'copyonly'")

    # compile the user location script
    fn = "user-location.user.js"
    script = readfile("mobile/plugins/" + fn)
    downloadUrl = distUrlBase and distUrlBase + '/' + fn.replace("\\","/") or 'none'
    updateUrl = distUrlBase and downloadUrl.replace('.user.js', '.meta.js') or 'none'
    script = doReplacements(script, downloadUrl=downloadUrl, updateUrl=updateUrl, pluginName='user-location')

    saveScriptAndMeta(script, outDir, fn)

    # copy the IITC script into the mobile folder. create the folder if needed
    try:
        os.makedirs("mobile/assets")
    except:
        pass
    shutil.copy(os.path.join(outDir,"total-conversion-build.user.js"), "mobile/assets/total-conversion-build.user.js")
    # copy the user location script into the mobile folder.
    shutil.copy(os.path.join(outDir,"user-location.user.js"), "mobile/assets/user-location.user.js")
    # also copy plugins
    try:
        shutil.rmtree("mobile/assets/plugins")
    except:
        pass
    shutil.copytree(os.path.join(outDir,"plugins"), "mobile/assets/plugins",
            # do not include desktop-only plugins to mobile assets
            ignore=shutil.ignore_patterns('*.meta.js',
            'force-https*', 'speech-search*', 'basemap-cloudmade*',
            'scroll-wheel-zoom-disable*'))


    if buildMobile != 'copyonly':
        # now launch 'ant' to build the mobile project
        retcode = os.system("ant %s -buildfile %s %s" % (antOptions, antBuildFile, buildMobile))

        if retcode != 0:
            print ("Error: mobile app failed to build. ant returned %d" % retcode)
            exit(1) # ant may return 256, but python seems to allow only values <256
        else:
            shutil.copy("mobile/bin/IITC_Mobile-%s.apk" % buildMobile, os.path.join(outDir,"IITC_Mobile-%s.apk" % buildMobile) )

# run any postBuild commands
for cmd in settings.get('postBuild',[]):
    os.system ( cmd )

verbose and print("Done, dateTimeVersion=" + dateTimeVersion + ", buildDate=" + buildDate)
# vim: ai si ts=4 sw=4 sts=4 et
