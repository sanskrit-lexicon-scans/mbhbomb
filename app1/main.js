// (setq js-indent-level 1)  # for Emacs

function makelink(indexobj,txt) {
 let href = window.location.href;
 //let url = new URL(href);
 //let search = url.search  // a string, possibly empty
 let base = href.replace(/app1.*$/,'');
 let vp= indexobj.vp
 let newsearch = `app0/?${vp}`;
 let newhref = base + newsearch;
 let html = `<a class="nppage" href="${newhref}"><span class="nppage">${txt}</span></a>`;
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
 display_ipage_id(indexes);
 let html = get_ipage_html(indexes[1]);
 let elt=document.getElementById('ipage');
 if (html == null) {
  html = '';
 }
 elt.innerHTML = html;
}

function get_indexobjs_from_verse(verse) {
 // uses indexdata from index.js
 // verse is a 3-tuple of ints
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
 //console.log(verse,icur);
 let ans, prevobj, curobj, nextobj
 if (icur == -1) {
  // default
  prevobj = indexdata[2];
  curobj = indexdata[3];
  nextobj = indexdata[4];
  //ans  = [indexdata[],indexdata[1],indexdata[2]];
 } else {
  curobj = indexdata[icur];
  if (icur <= 2) {
   prevobj = curobj;
  } else {
   prevobj = indexdata[icur - 1];
  }
  let inext = icur + 1;
  if (inext < indexdata.length) {
   nextobj = indexdata[inext];
  }else {
   nextobj = curobj;
  }
 }
 ans = [prevobj,curobj,nextobj];
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
 let defaultval = [0,0,0]; // default value
 let nparm = 3;
 let iverse = [];
 let x = search.match(/^[?]([0-9]+),([0-9]+),([0-9]+)$/);
 if (x != null) {
  // convert to ints parvan, adhyAya, verse
  for(let i=0;i<nparm;i++) {
   iverse.push(parseInt(x[i+1]));
  }
 }else {
  // 3 -parameters
  x = search.match(/^[?]([0-9]+),([0-9]+),([0-9]+)$/);
  if (x == null) {
   return defaultval;
  }
  // convert to ints
  iverse.push(parseInt(x[0+1])) //parvan = p
  iverse.push(parseInt(x[1+1])) //adhyAya = a
  iverse.push(parseInt(x[2+1])) //verse
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

