import os
import sys
import time

if len(sys.argv)<2:
    print("File age is a required argument")
    exit()

age = sys.argv[1]

ageNumber = age[0:-1]

try:
    ageNumber = int(ageNumber)
except:
    print("Invalid age")
    exit()


divider = 0

if age[-1] == "d":
    divider = 86400
elif age[-1] =="w":
    divider = 604800
elif age[-1] == "s":
    divider = 1
else:
    print("Invalid file age argument use a number followed by d/w/s (days, weeks, seconds) like this 7d")
    exit()

if len(sys.argv)<3:
    print("Directory is a required argument")
    exit()

directory = sys.argv[2]

maxAge = ageNumber

recursive = False
simulate = True

if len(sys.argv)>3 and sys.argv[3] == "-r":
    recursive = True
    print("Enabling recursive")

if sys.argv[len(sys.argv)-1] == "-f":
    simulate = False
    print("Deleting any matching files hope you know what you're doing")
else:
    print("Simulating only showing which files would be deleted")

def parseDir(d):
    for filename in os.listdir(d):
        f = os.path.join(d, filename)
    
        if os.path.isfile(f):
            stats = os.stat(f)
            mtime=stats.st_mtime
            timeDiff = time.time() - mtime
            timeDiff = timeDiff / divider
            if timeDiff > maxAge:
                if simulate:
                    print(f + " is older and should be deleted")
                else:
                    try:
                        os.remove(f)
                    except OSError as e:
                        print("Error: %s - %s." % (e.filename, e.strerror))
        elif recursive:
            parseDir(f)


parseDir(directory)
