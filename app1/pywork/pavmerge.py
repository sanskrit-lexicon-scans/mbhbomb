# coding=utf-8
""" pavmerge.py for mbhbomb
"""
from __future__ import print_function
import sys, re, codecs
from make_js_index import init_pagerecs

def roman_to_int(roman):
 droman_int = {'I':1, 'II':2, 'III':3, 'IV':4,
                'V':5, 'VI':6, 'VII':7, 'VIII':8, 'IX':9,
                'X':10, 'XI':11, 'XII':12,'':0}
 if roman in droman_int:
  return droman_int[roman]
 else:
  # error condition
  return None
 

def write_recs(fileout,data):
 with codecs.open(fileout,"w","utf-8") as f:
  f.write('indexdata = \n')
  jsonstring = json.dumps(data,indent=1)
  f.write( jsonstring +  '\n')
  f.write('; // end of indexdata\n')
  
 print('json data written to',fileout)

def unused_check1_adhy(pagerecs):
 prev = None
 for irec,rec in enumerate(pagerecs):
  lnum = rec.iline + 1
  line = rec.line
  if irec == 0:
   prev = rec
   continue
  if prev.adhy == rec.adhy:
   pass # no problem
  elif (prev.adhy + 1) == rec.adhy:
   pass
  else:
   # unexpected
   print('check1_adhy. adhy=%s, expected %s' %(rec.adhy,prev.adhy + 1))
   print('lnum=%s, line=%s' % (lnum,line))
   exit(1)
  # reset prev
  prev = rec
 print('pagerecs passes check1_adhy ')
 

def check1(pagerecs):
 """ check that v1 = v2_prev + 1 when 
 """
 # check1_adhy(pagerecs)  not sure how to check. too many special cases
 #print('check1 ends')
 return
 # in malavikagni,  verses are continuously
 #  numbered from 1 to 95.
 # verses do not restart at 1 with a change in adhy
 
 nerr = 0
 for irec,rec in enumerate(pagerecs):
  lnum = rec.iline + 1
  line = rec.line
  if irec == 0:
   # first verse should be 1
   if rec.fromv != 1:
    print('first verse not 1')
    print('check1_adhy: first verse not 1.')
    print('lnum=%s, line=%s' % (lnum,line))
    exit(1)    
   prev = rec
   continue
  if (rec.adhy != prev.adhy):
   if rec.fromv != 1:
    print('first verse in adhy not 1')
    print('lnum=%s, line=%s' % (lnum,line))
    exit(1)
   prev = rec
   continue
  # rec.adhy = prev.adhy
  if (rec.fromvx == '') and (prev.tovx == ''):
   #if rec.fromv != (prev.tov + 1):
   if rec.fromv not in (prev.tov, prev.tov + 1):
    print('fromv problem A')
    print('lnum=%s, line=%s' % (lnum-1,prev.line))
    print('lnum=%s, line=%s' % (lnum,line))
    #exit(1)
    nerr = nerr + 1
  else:
   if (prev.tovx == 'a') and (rec.fromvx == 'b') and (rec.fromv == prev.tov):
    # no problem
    pass
   else:
    print('fromv problem B')
    print('lnum=%s, line=%s' % (lnum-1,prev.line))
    print('lnum=%s, line=%s' % (lnum,line))
    exit(1)
  prev = rec
 print("check1 finds %s problems" % nerr)

def init_pa(recs):
 newrecs = [] #
 ndrop = 0
 for rec in recs:
  if rec.fromv == 0:
   ndrop = ndrop + 1
   continue
  rec.pa = (rec.parvan, rec.adhy)
  rec.fromkey = (rec.parvan,rec.adhy,rec.fromv)
  rec.tokey = (rec.parvan,rec.adhy,rec.tov)
  assert rec.fromv <= rec.tov
  newrecs.append(rec)
 return newrecs

def check1_key(pagerecs):
 for irec,rec in enumerate(pagerecs):
  lnum = rec.iline + 1
  line = rec.line
  if not (rec.fromkey <= rec.tokey):
    print('ERROR fromkey %s > tokey %s.' % (rec.fromkey,rec.tokey))
    print('lnum=%s, line=%s' % (lnum,line))
    exit(1)
 print('pagerecs passes check1_key')

class PA:
 def __init__(self,fromv,tov):
  self.fromv = fromv
  self.tov = tov

def init_padict(pagerecs):
 padict = {}
 for irec,rec in enumerate(pagerecs):
  lnum = rec.iline + 1
  line = rec.line
  pa = rec.pa
  if pa not in padict:
   #if not (rec.fromv == 1):
   # print('check2_key error 1: lnum#%s: %s' %(lnum,line))
   # exit(1)
   padict[pa] = PA(rec.fromv,rec.tov)
  else:
   parec = padict[pa]
   oldfromv = parec.fromv
   oldtov = parec.tov
   newfromv = rec.fromv
   newtov = rec.tov
   if not (newfromv in (oldtov,oldtov+1)):
    print('check2_key error: lnum#%s: %s' %(lnum,line))
   parec.tov = newtov
 return padict

def init_pdict(pagerecs):
 pdict = {}
 for irec,rec in enumerate(pagerecs):
  lnum = rec.iline + 1
  line = rec.line
  p = rec.parvan
  if p not in pdict:
   pdict[p] = 0
  nprec = rec.tov - rec.fromv + 1
  pdict[p] = pdict[p] + nprec
 return pdict

def write_padict(filepa,padict):
 outarr = []
 keys = padict.keys()
 for key in keys:
  pa = padict[key]
  fromv = pa.fromv
  tov = pa.tov
  out = '%2d %2d : %d-%d' %(key[0],key[1],fromv,tov)
  outarr.append(out)
 with codecs.open(filepa,"w","utf-8") as f:
  for out in outarr:
   f.write(out+'\n')
 print('%s records written to %s' %(len(keys),filepa))
 
def write_pdict(fileout,pdict):
 outarr = []
 keys = pdict.keys()  # parvans
 ntot = 0
 for key in keys:  
  np = pdict[key]
  out = '%2d : %d' %(key,np)
  outarr.append(out)
  ntot = ntot + np
 # total at end
 out = 'Total verses: %s' %ntot
 outarr.append(out)
 with codecs.open(fileout,"w","utf-8") as f:
  for out in outarr:
   f.write(out+'\n')
 print('%s records written to %s' %(len(keys),fileout))
 
if __name__ == "__main__":
 filein=sys.argv[1]  # tab-delimited index file
 fileout = sys.argv[2]  # counts by parvan, adhyaya
 fileout1 = sys.argv[3]  # counts by parvan
 pagerecs0 = init_pagerecs(filein,filevol=None)
 pagerecs = init_pa(pagerecs0) # remove cases where v1  = 0
 check1_key(pagerecs)
 padict = init_padict(pagerecs)
 write_padict(fileout,padict)
 pdict = init_pdict(pagerecs)
 write_pdict(fileout1,pdict)
 exit(1)
 outrecs = make_js(pagerecs)
 write_recs(fileout,outrecs)
 check1(pagerecs)
 
