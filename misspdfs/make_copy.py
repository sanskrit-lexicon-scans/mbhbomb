# coding=utf-8
""" make_copy.py
    makes script to copy and rename the missing pdfs.
"""
from __future__ import print_function
import sys, re, codecs

class Pagerec(object):
 """
""" 
 def __init__(self,vol,page,xtra):
  # xtra is either 0 or 'x' or 'y'
  self.vol = vol
  self.page = page
  self.xtra = xtra
 def todict(self):
  if self.xtra == 0:
   # the usual case
   vpstr = '%d%04d' % (self.vol,self.page)
  else:
   # an extra page, - represent as deci
   vpstr = '%d%04d.%s' % (self.vol,self.page,self.xtra)
  e = {
   'vp':vpstr
  }
  return e

def make_js(recs):
 outarr = []
 outarr.append('indexdata = [')
 arr = [] # array of Python dicts
 for rec in recs:
  d = rec.todict()  # a Python dictionary
  arr.append(d)
 return arr

def write_lines(fileout,outlines):
 with codecs.open(fileout,"w","utf-8") as f:
  for out in outlines:
   f.write(out + '\n')  
 print('%s lines written to %s' % (len(outlines),fileout))

def make_copylines(vin,pin,dirin,dirout):
 # vin, pin are int type
 v = '%d' % vin
 p = '%03d' % pin
 ans = []  # list of lines for copy script
 for sfx in ['x','y']:
  fromfile = '%s/%s-%s%s.pdf' %(dirin,v,p,sfx)
  tofile = '%s/pdfpages%s/mbhbomb%s-%s%s.pdf' %(dirout,v,v,p,sfx)
  cmd = 'cp %s %s' %(fromfile,tofile)
  ans.append(cmd)
 return ans

if __name__ == "__main__":
 # index all pages of the 6 pdfs, along with placeholders for missing
 dirin = sys.argv[1]
 dirout = sys.argv[2]
 fileout = sys.argv[3]

 missing_list = [
  (1,624),
  (1,638),
  (1,664),
  (2,288),
  (3,66),
  (3,104),
  (3,126),
  (4,408),
  (4,570),
  (4,632),
  (4,638),
  ]
 
 outlines = []
 for v,p in missing_list:
  alines = make_copylines(v,p,dirin,dirout)
  for line in alines:
   outlines.append(line)
 write_lines(fileout,outlines)
 
