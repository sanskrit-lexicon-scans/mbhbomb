// (setq js-indent-level 1)  # for Emacs

function makelink(indexobj,txt) {
 let href = window.location.href;
 let html;
 if (indexobj == null) {
  html = '';
 } else {
  let base = href.replace(/app1.*$/,'');
  let vp= indexobj.vp
  let newsearch = `app0/?${vp}`;
  let newhref = base + newsearch;
  html = `<a class="nppage" href="${newhref}"><span class="nppage">${txt}</span></a>`;
 }
 return html;
}
function display_ipage_id(indexes) {
 //console.log('display_ipage_id: indexes=',indexes);
 [indexprev,indexcur,indexnext] = indexes;
 let prevlink = makelink(indexprev,'<');
 let nextlink = makelink(indexnext,'>');

 let vp = indexcur['vp'];
 // construct title, consisten with app0/main.js
 let regex = /([1-6])([0-9][0-9][0-9][0-9])(.*)$/;
 let m = vp.match(regex);
 let v = m[1]; // n
 let p = m[2]; // nnnn
 let sfx = m[3]; // rest, usu. empty string

 let title = `vol ${v}, extpage ${p}${sfx}`;

 let html = `<p>${prevlink} <span class="nppage">${title}</span> ${nextlink}</p>`;
 let elt = document.getElementById('ipageid');
 elt.innerHTML = html;
}

function get_pdfurl_from_index(indexobj) {
 // copied from app0
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
 //console.log('vp=',vp,'v=',v,'p=',p,'sfx=',sfx,'q=',q); 
 let pdf;
 let sfxes = ['','x','y'];
 if (sfxes.includes(sfx)) {
  pdf = `pdfpages${v}/mbhbomb${v}-${q}${sfx}.pdf`;
 }else {
  pdf = null; //pages missing from pdf
 }
 //console.log('pdf=',pdf);
 return pdf;
}

function get_ipage_html(indexcur) 
{
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
 let defaultval,elt, html;
 defaultval = null;
 elt=document.getElementById('ipage');
 if (indexes == defaultval) {
  html = '<b>Page not found</b>';
 } else {
  display_ipage_id(indexes);
  html = get_ipage_html(indexes[1]);
  if (html == null) {
   html = '';
  }
 }
  elt.innerHTML = html;
}

function get_prevobj(curobj,icur,indexdata) {
 let vp = curobj.vp;
 let ans = null;  //default
 let obj;
 let maxidx = indexdata.length - 1;
 let idx = icur;
 while ((0 <= idx) && (idx <= maxidx)) {
  obj = indexdata[idx];
  if (obj.vp != curobj.vp) {
   ans = obj;
   break;
  } else {
   idx = idx - 1;
  }
 }
 return ans;
}

function get_nextobj(curobj,icur,indexdata) {
 let vp = curobj.vp;
 let ans = null;  //default
 let obj;
 let maxidx = indexdata.length - 1;
 let idx = icur;
 while ((0 <= idx) && (idx <= maxidx)) {
  obj = indexdata[idx];
  if (obj.vp != curobj.vp) {
   ans = obj;
   break;
  } else {
   idx = idx + 1;
  }
 }
 return ans;
}

function get_indexobjs_from_verse(verse) {
 // uses indexdata from index.js
 // verse is a 3-tuple of ints OR null
 let defaultval = null;
 let icur = -1;
 for (let i=0; i < indexdata.length; i++ ) {
  let obj = indexdata[i];
  if (obj.p != verse[0]) {continue;}
  if (obj.a != verse[1]) {continue;}
  if ((obj.v1 <= verse[2]) && (verse[2] <= obj.v2)) {
   icur = i;
   break;
  }
 }
 let ans, prevobj, curobj, nextobj
 if (icur == -1) {
  ans = defaultval;
 } else {
  curobj = indexdata[icur];
  // get previous object with a different pdfpage, or null
  let prevobj = get_prevobj(curobj,icur,indexdata);
  // get next object with a different pdfpage, or null
  let nextobj = get_nextobj(curobj,icur,indexdata);
  ans = [prevobj,curobj,nextobj];
 }
 return ans;
}

function get_verse_from_url() {
 /* return 3-tuple of int numbers derived from url search string.
    Returns [0,0,0] as default
   kand,sarga,sargap,verse
*/
 let href = window.location.href;
 let url = new URL(href);
 // url = http://xyz.com?X ,
 // search = ?X
 let search = url.search;  // a string, possibly empty
 let defaultval = null; //[0,0,0]; // default value
 let nparm = 3;
 let iverse = [];
 let x = search.match(/^[?]([0-9]+),([0-9]+),([0-9]+)$/);
 if (x == null) {
  return defaultval;
 }
 if (x != null) {
  // convert to ints parvan, adhyAya, verse
  for(let i=0;i<nparm;i++) {
   iverse.push(parseInt(x[i+1]));
  }
  return iverse;
 }
}

function display_ipage_url() {  
 let url_verse = get_verse_from_url();
 //console.log('url_verse=',url_verse);
 let defaultval = null;
 let indexobjs;
 if (url_verse == defaultval) {
  indexobjs = defaultval;
 }else {
  indexobjs = get_indexobjs_from_verse(url_verse);
 }
 //console.log('indexobjs=',indexobjs);
 display_ipage_html(indexobjs);
}

document.getElementsByTagName("BODY")[0].onload = display_ipage_url;

