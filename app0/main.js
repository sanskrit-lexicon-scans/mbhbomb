// (setq js-indent-level 1)  # for Emacs

function makelink(indexobj,txt) {
 let href = window.location.href;
 let base = href.replace(/[?].*$/,'');
 //let ipage = indexobj.ipage;
 let ipage = indexobj.vp;
 let newsearch = `?${ipage}`;
 let newhref = base + newsearch;
 let html = `<a class="nppage" href="${newhref}"><span class="nppage">${txt}</span></a>`;
 return html;
}
function display_ipage_id(indexes) {
 //console.log('display_ipage_id: indexes=',indexes);
 [indexprev,indexcur,indexnext] = indexes;
 let prevlink = makelink(indexprev,'<');
 let nextlink = makelink(indexnext,'>');

 let vp = indexcur['vp']; // VNNNN
 //let regex = /([1-6])([0-9][0-9][0-9][0-9])([^0-9]*)/;
 let regex = /([1-6])([0-9][0-9][0-9][0-9])(.*)$/;
 let m = vp.match(regex);
 let v = m[1]; // n
 let p = m[2]; // nnnn
 let sfx = m[3]; // rest, usu. empty string

 let title = `vol ${v}, extpage ${p}${sfx}`;
 if (sfx != '') {
  title = title + ' page missing';
 }
 let html = `<p>${prevlink} <span class="nppage">${title}</span> ${nextlink}</p>`;
 let elt = document.getElementById('ipageid');
 elt.innerHTML = html;
}

function get_pdfurl_from_index(indexobj) {
 /*
  vp = VNNNNX  where V is 1-6, NNNN are digits, X is optional non-number suffix
pdfpages1  mbhbomb1-001.pdf  to  mbhbomb1-679.pdf
pdfpages2  mbhbomb2-001.pdf  to  mbhbomb2-643.pdf
pdfpages3  mbhbomb3-001.pdf  to  mbhbomb3-881.pdf
pdfpages4  mbhbomb4-001.pdf  to  mbhbomb4-837.pdf

pdfpages5/pdfpages5.1/mbhbomb5-0001.pdf  to mbhbomb5-0999.pdf
pdfpages5/pdfpages5.2/mbhbomb5-1000.pdf  to mbhbomb5-1023.pdf

pdfpages6  mbhbomb6-001.pdf  to  mbhbomb6-705.pdf

 */
 let vp = indexcur['vp'];
 let regex = /([1-6])([0-9][0-9][0-9][0-9])(.*)$/;
 let m = vp.match(regex);
 let v = m[1]; // n
 let p = m[2]; // nnnn
 let sfx = m[3]; // rest, usu. empty string
 let q;
 if ( v !== '5') {
  q = p.slice(1,4); // remove initial '0' from p
 }else {
  q = p; // all 4 digits -- v is 5
 }
 //console.log('vp=',vp, v,p,sfx,q);
 //console.log(sfx == '')
 let pdf;
 if (sfx == '') {
  if (v == '5') {
   pdf = `pdfpages${v}/mbhbomb${v}-${q}.pdf`;
  }else {
   pdf = `pdfpages${v}/mbhbomb${v}-${q}.pdf`;
  }
 }else {
  pdf = null; //pages missing from pdf
 }
 //console.log('pdf=',pdf);
 return pdf;
}

function get_ipage_html(indexcur) {
 let html = null;
 if (indexcur == null) {return html;}
 let pdfurl = get_pdfurl_from_index(indexcur);
 if (pdfurl == null) {
  return html;
 }
 let base = '..';
 let urlcur = `${base}/${pdfurl}`;
 //let urlcur = `../pdfpages/${pdfcur}`;
 let android = ` <a href='${urlcur}' style='position:relative; left:100px;'>Click to load pdf</a>`;
 let imageElt = `<object id='servepdf' type='application/pdf' data='${urlcur}' 
              style='width: 98%; height:98%'> ${android} </object>`;
 //console.log('get_ipage_html. imageElt=',imageElt);
 return imageElt;
}

function display_ipage_html(indexes) {
 display_ipage_id(indexes);
 let html = get_ipage_html(indexes[1]);
 let elt=document.getElementById('ipage');
 if (html == null) {
  html = '';
 }
 elt.innerHTML = html;
}


function prev_vp_obj(icur) {
 let defaultobj = indexdata[0];
 if (icur <= 0) {
  return defaultobj;
 }
 if (icur >= indexdata.length) {
  return defaultobj;
 }
 let curobj = indexdata[icur];
 let vpold = curobj['vp'];
 let iprev = icur - 1;
 while (true) {
  if (iprev <= 0) {
   return defaultobj;
   break;
  }
  newobj = indexdata[iprev];
  let vpnew = newobj['vp'];
  if (vpnew != vpold) {
   return newobj;
  }
  iprev = iprev - 1;
 }
}

function next_vp_obj(icur) {
 let defaultobj = indexdata[0];
 if (icur < 0) {
  return defaultobj;
 }
 if (icur >= indexdata.length) {
  return defaultobj;
 }
 let curobj = indexdata[icur];
 let vpold = curobj['vp'];
 let inext = icur + 1;
 while (true) {
  if (inext >= indexdata.length) {
   return defaultobj;
   break;
  }
  newobj = indexdata[inext];
  let vpnew = newobj['vp'];
  if (vpnew != vpold) {
   return newobj;
  }
  inext = inext + 1;
 }
}

function get_indexobjs_from_verse(verse) {
 // uses indexdata from index.js
 // verse is a 1-tuple (vp)
 //console.log('get_indexobjs_from_verse:',verse);
 let icur = -1;
 for (let i=0; i < indexdata.length; i++ ) {
  let obj = indexdata[i];
  if (obj.vp != verse[0]) {continue;}
  icur = i;
  break;
 }
 let ans, prevobj, curobj, nextobj
 if (icur == -1) {
  // default
  prevobj = indexdata[0];
  curobj = indexdata[0];
  nextobj = indexdata[1];
 } else {
  prevobj = prev_vp_obj(icur);
  curobj = indexdata[icur];
  nextobj = next_vp_obj(icur);
 }
 ans = [prevobj,curobj,nextobj];
 return ans;
}

function get_verse_from_url() {
 /* return 1-tuple  derived from url search string.
    Returns [0] on error
*/
 let href = window.location.href;
 let url = new URL(href);
 let search = url.search;  // a string, possibly empty
 let defaultval = [0]; // default value
 let x = search.match(/^[?](.*)$/);
 if (x == null) {
  return defaultval;
 }
 let nparm = 1;
 iverse = [];
 for(let i=0;i<nparm;i++) {
  //iverse.push(parseInt(x[i+1]));
  iverse.push(x[i+1]);
 }
 return iverse;
}

function display_ipage_url() {
 let url_verse = get_verse_from_url();
 //console.log('url_verse=',url_verse);
 let indexobjs = get_indexobjs_from_verse(url_verse);
 //console.log('indexobjs=',indexobjs);
 display_ipage_html(indexobjs);
}

document.getElementsByTagName("BODY")[0].onload = display_ipage_url;

