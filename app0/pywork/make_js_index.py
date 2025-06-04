# coding=utf-8
""" make_js_index.py for mbhbomb -- all pages of the pdfs
"""
from __future__ import print_function
import sys, re, codecs
import json

class Pagerec(object):
 """
""" 
 def __init__(self,vol,page,xtra):
  self.vol = vol
  self.page = page
  self.xtra = xtra
 def todict(self):
  if self.xtra == 0:
   # the usual case
   vpstr = '%d%04d' % (self.vol,self.page)
  else:
   # an extra page, - represent as deci
   vpstr = '%d%04d.%d' % (self.vol,self.page,self.xtra)
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

def write_recs(fileout,data):
 with codecs.open(fileout,"w","utf-8") as f:
  f.write('indexdata = \n')
  jsonstring = json.dumps(data,indent=1)
  f.write( jsonstring +  '\n')
  f.write('; // end of indexdata\n')
  
 print('json data written to',fileout)

if __name__ == "__main__":
 # index all pages of the 6 pdfs, along with placeholders for missing
 fileout = sys.argv[1]

 missing_dict = {
  #(1,624,2),  # two missing pages after page 624 of vol 1
  #(1,624):2, 
  (1,624) : 2,
  (1,638) : 2,
  (1,664) : 2,
  (2,288) : 4,
  (3,66) : 2,
  (4,408) : 3,
  (4,570) : 2,
  (4,632) : 2,
  (4,638) : 2,
  }
 vol_pages = [
  (1,679),
  (2,643),
  (3,881),
  (4,837),
  (5,1023),
  (6,705)
  ]
 pagerecs = []
 for v,p2 in vol_pages:
  for p in range(1,p2+1):
   pagerec = Pagerec(v,p,0)
   pagerecs.append(pagerec)
   # add missing pages
   if (v,p) in missing_dict:
    nextra = missing_dict[(v,p)]
    for iextra in range(nextra):
     pagerec = Pagerec(v,p,iextra + 1)
     pagerecs.append(pagerec)
 outrecs = make_js(pagerecs)
 write_recs(fileout,outrecs)
 
