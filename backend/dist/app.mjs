import{createRequire as __jseCR}from'module';const require=__jseCR(String(import.meta.url).startsWith('file:')?import.meta.url:'file:///tmp/jse.mjs');
var jr=Object.create;var _i=Object.defineProperty;var Ur=Object.getOwnPropertyDescriptor;var Pr=Object.getOwnPropertyNames;var Hr=Object.getPrototypeOf,wr=Object.prototype.hasOwnProperty;var B=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,s)=>(typeof require<"u"?require:t)[s]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var h=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var Mr=(e,t,s,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of Pr(t))!wr.call(e,a)&&a!==s&&_i(e,a,{get:()=>t[a],enumerable:!(i=Ur(t,a))||i.enumerable});return e};var kr=(e,t,s)=>(s=e!=null?jr(Hr(e)):{},Mr(t||!e||!e.__esModule?_i(s,"default",{value:e,enumerable:!0}):s,e));var wt=h(Ei=>{"use strict";Ei.parse=function(e,t){return new Ht(e,t).parse()};var Ht=class e{constructor(t,s){this.source=t,this.transform=s||xr,this.position=0,this.entries=[],this.recorded=[],this.dimension=0}isEof(){return this.position>=this.source.length}nextCharacter(){var t=this.source[this.position++];return t==="\\"?{value:this.source[this.position++],escaped:!0}:{value:t,escaped:!1}}record(t){this.recorded.push(t)}newEntry(t){var s;(this.recorded.length>0||t)&&(s=this.recorded.join(""),s==="NULL"&&!t&&(s=null),s!==null&&(s=this.transform(s)),this.entries.push(s),this.recorded=[])}consumeDimensions(){if(this.source[0]==="[")for(;!this.isEof();){var t=this.nextCharacter();if(t.value==="=")break}}parse(t){var s,i,a;for(this.consumeDimensions();!this.isEof();)if(s=this.nextCharacter(),s.value==="{"&&!a)this.dimension++,this.dimension>1&&(i=new e(this.source.substr(this.position-1),this.transform),this.entries.push(i.parse(!0)),this.position+=i.position-2);else if(s.value==="}"&&!a){if(this.dimension--,!this.dimension&&(this.newEntry(),t))return this.entries}else s.value==='"'&&!s.escaped?(a&&this.newEntry(!0),a=!a):s.value===","&&!a?this.newEntry():this.record(s.value);if(this.dimension!==0)throw new Error("array dimension not balanced");return this.entries}};function xr(e){return e}});var Mt=h((QE,ci)=>{var Wr=wt();ci.exports={create:function(e,t){return{parse:function(){return Wr.parse(e,t)}}}}});var ui=h((ZE,di)=>{"use strict";var Br=/(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/,qr=/^(\d{1,})-(\d{2})-(\d{2})( BC)?$/,Gr=/([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/,Yr=/^-?infinity$/;di.exports=function(t){if(Yr.test(t))return Number(t.replace("i","I"));var s=Br.exec(t);if(!s)return $r(t)||null;var i=!!s[8],a=parseInt(s[1],10);i&&(a=li(a));var r=parseInt(s[2],10)-1,n=s[3],o=parseInt(s[4],10),E=parseInt(s[5],10),_=parseInt(s[6],10),c=s[7];c=c?1e3*parseFloat(c):0;var l,d=Kr(t);return d!=null?(l=new Date(Date.UTC(a,r,n,o,E,_,c)),kt(a)&&l.setUTCFullYear(a),d!==0&&l.setTime(l.getTime()-d)):(l=new Date(a,r,n,o,E,_,c),kt(a)&&l.setFullYear(a)),l};function $r(e){var t=qr.exec(e);if(t){var s=parseInt(t[1],10),i=!!t[4];i&&(s=li(s));var a=parseInt(t[2],10)-1,r=t[3],n=new Date(s,a,r);return kt(s)&&n.setFullYear(s),n}}function Kr(e){if(e.endsWith("+00"))return 0;var t=Gr.exec(e.split(" ")[1]);if(t){var s=t[1];if(s==="Z")return 0;var i=s==="-"?-1:1,a=parseInt(t[2],10)*3600+parseInt(t[3]||0,10)*60+parseInt(t[4]||0,10);return a*i*1e3}}function li(e){return-(e-1)}function kt(e){return e>=0&&e<100}});var pi=h((ec,Ni)=>{Ni.exports=Jr;var Vr=Object.prototype.hasOwnProperty;function Jr(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var i in s)Vr.call(s,i)&&(e[i]=s[i])}return e}});var Ri=h((tc,mi)=>{"use strict";var Xr=pi();mi.exports=we;function we(e){if(!(this instanceof we))return new we(e);Xr(this,En(e))}var zr=["seconds","minutes","hours","days","months","years"];we.prototype.toPostgres=function(){var e=zr.filter(this.hasOwnProperty,this);return this.milliseconds&&e.indexOf("seconds")<0&&e.push("seconds"),e.length===0?"0":e.map(function(t){var s=this[t]||0;return t==="seconds"&&this.milliseconds&&(s=(s+this.milliseconds/1e3).toFixed(6).replace(/\.?0+$/,"")),s+" "+t},this).join(" ")};var Qr={years:"Y",months:"M",days:"D",hours:"H",minutes:"M",seconds:"S"},Zr=["years","months","days"],en=["hours","minutes","seconds"];we.prototype.toISOString=we.prototype.toISO=function(){var e=Zr.map(s,this).join(""),t=en.map(s,this).join("");return"P"+e+"T"+t;function s(i){var a=this[i]||0;return i==="seconds"&&this.milliseconds&&(a=(a+this.milliseconds/1e3).toFixed(6).replace(/0+$/,"")),a+Qr[i]}};var xt="([+-]?\\d+)",tn=xt+"\\s+years?",sn=xt+"\\s+mons?",an=xt+"\\s+days?",rn="([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?",nn=new RegExp([tn,sn,an,rn].map(function(e){return"("+e+")?"}).join("\\s*")),Ti={years:2,months:4,days:6,hours:9,minutes:10,seconds:11,milliseconds:12},on=["hours","minutes","seconds","milliseconds"];function _n(e){var t=e+"000000".slice(e.length);return parseInt(t,10)/1e3}function En(e){if(!e)return{};var t=nn.exec(e),s=t[8]==="-";return Object.keys(Ti).reduce(function(i,a){var r=Ti[a],n=t[r];return!n||(n=a==="milliseconds"?_n(n):parseInt(n,10),!n)||(s&&~on.indexOf(a)&&(n*=-1),i[a]=n),i},{})}});var bi=h((sc,Ii)=>{"use strict";var hi=Buffer.from||Buffer;Ii.exports=function(t){if(/^\\x/.test(t))return hi(t.substr(2),"hex");for(var s="",i=0;i<t.length;)if(t[i]!=="\\")s+=t[i],++i;else if(/[0-7]{3}/.test(t.substr(i+1,3)))s+=String.fromCharCode(parseInt(t.substr(i+1,3),8)),i+=4;else{for(var a=1;i+a<t.length&&t[i+a]==="\\";)a++;for(var r=0;r<Math.floor(a/2);++r)s+="\\";i+=Math.floor(a/2)*2}return hi(s,"binary")}});var gi=h((ic,Si)=>{var Xe=wt(),ze=Mt(),Tt=ui(),Li=Ri(),vi=bi();function mt(e){return function(s){return s===null?s:e(s)}}function fi(e){return e===null?e:e==="TRUE"||e==="t"||e==="true"||e==="y"||e==="yes"||e==="on"||e==="1"}function cn(e){return e?Xe.parse(e,fi):null}function ln(e){return parseInt(e,10)}function Wt(e){return e?Xe.parse(e,mt(ln)):null}function dn(e){return e?Xe.parse(e,mt(function(t){return Ai(t).trim()})):null}var un=function(e){if(!e)return null;var t=ze.create(e,function(s){return s!==null&&(s=Yt(s)),s});return t.parse()},Bt=function(e){if(!e)return null;var t=ze.create(e,function(s){return s!==null&&(s=parseFloat(s)),s});return t.parse()},ue=function(e){if(!e)return null;var t=ze.create(e);return t.parse()},qt=function(e){if(!e)return null;var t=ze.create(e,function(s){return s!==null&&(s=Tt(s)),s});return t.parse()},Nn=function(e){if(!e)return null;var t=ze.create(e,function(s){return s!==null&&(s=Li(s)),s});return t.parse()},pn=function(e){return e?Xe.parse(e,mt(vi)):null},Gt=function(e){return parseInt(e,10)},Ai=function(e){var t=String(e);return/^\d+$/.test(t)?t:e},Oi=function(e){return e?Xe.parse(e,mt(JSON.parse)):null},Yt=function(e){return e[0]!=="("?null:(e=e.substring(1,e.length-1).split(","),{x:parseFloat(e[0]),y:parseFloat(e[1])})},Tn=function(e){if(e[0]!=="<"&&e[1]!=="(")return null;for(var t="(",s="",i=!1,a=2;a<e.length-1;a++){if(i||(t+=e[a]),e[a]===")"){i=!0;continue}else if(!i)continue;e[a]!==","&&(s+=e[a])}var r=Yt(t);return r.radius=parseFloat(s),r},mn=function(e){e(20,Ai),e(21,Gt),e(23,Gt),e(26,Gt),e(700,parseFloat),e(701,parseFloat),e(16,fi),e(1082,Tt),e(1114,Tt),e(1184,Tt),e(600,Yt),e(651,ue),e(718,Tn),e(1e3,cn),e(1001,pn),e(1005,Wt),e(1007,Wt),e(1028,Wt),e(1016,dn),e(1017,un),e(1021,Bt),e(1022,Bt),e(1231,Bt),e(1014,ue),e(1015,ue),e(1008,ue),e(1009,ue),e(1040,ue),e(1041,ue),e(1115,qt),e(1182,qt),e(1185,qt),e(1186,Li),e(1187,Nn),e(17,vi),e(114,JSON.parse.bind(JSON)),e(3802,JSON.parse.bind(JSON)),e(199,Oi),e(3807,Oi),e(3907,ue),e(2951,ue),e(791,ue),e(1183,ue),e(1270,ue)};Si.exports={init:mn}});var Di=h((ac,yi)=>{"use strict";var re=1e6;function Rn(e){var t=e.readInt32BE(0),s=e.readUInt32BE(4),i="";t<0&&(t=~t+(s===0),s=~s+1>>>0,i="-");var a="",r,n,o,E,_,c;{if(r=t%re,t=t/re>>>0,n=4294967296*r+s,s=n/re>>>0,o=""+(n-re*s),s===0&&t===0)return i+o+a;for(E="",_=6-o.length,c=0;c<_;c++)E+="0";a=E+o+a}{if(r=t%re,t=t/re>>>0,n=4294967296*r+s,s=n/re>>>0,o=""+(n-re*s),s===0&&t===0)return i+o+a;for(E="",_=6-o.length,c=0;c<_;c++)E+="0";a=E+o+a}{if(r=t%re,t=t/re>>>0,n=4294967296*r+s,s=n/re>>>0,o=""+(n-re*s),s===0&&t===0)return i+o+a;for(E="",_=6-o.length,c=0;c<_;c++)E+="0";a=E+o+a}return r=t%re,n=4294967296*r+s,o=""+n%re,i+o+a}yi.exports=Rn});var Pi=h((rc,Ui)=>{var hn=Di(),U=function(e,t,s,i,a){s=s||0,i=i||!1,a=a||function(u,I,L){return u*Math.pow(2,L)+I};var r=s>>3,n=function(u){return i?~u&255:u},o=255,E=8-s%8;t<E&&(o=255<<8-t&255,E=t),s&&(o=o>>s%8);var _=0;s%8+t>=8&&(_=a(0,n(e[r])&o,E));for(var c=t+s>>3,l=r+1;l<c;l++)_=a(_,n(e[l]),8);var d=(t+s)%8;return d>0&&(_=a(_,n(e[c])>>8-d,d)),_},ji=function(e,t,s){var i=Math.pow(2,s-1)-1,a=U(e,1),r=U(e,s,1);if(r===0)return 0;var n=1,o=function(_,c,l){_===0&&(_=1);for(var d=1;d<=l;d++)n/=2,(c&1<<l-d)>0&&(_+=n);return _},E=U(e,t,s+1,!1,o);return r==Math.pow(2,s+1)-1?E===0?a===0?1/0:-1/0:NaN:(a===0?1:-1)*Math.pow(2,r-i)*E},In=function(e){return U(e,1)==1?-1*(U(e,15,1,!0)+1):U(e,15,1)},Ci=function(e){return U(e,1)==1?-1*(U(e,31,1,!0)+1):U(e,31,1)},bn=function(e){return ji(e,23,8)},On=function(e){return ji(e,52,11)},Ln=function(e){var t=U(e,16,32);if(t==49152)return NaN;for(var s=Math.pow(1e4,U(e,16,16)),i=0,a=[],r=U(e,16),n=0;n<r;n++)i+=U(e,16,64+16*n)*s,s/=1e4;var o=Math.pow(10,U(e,16,48));return(t===0?1:-1)*Math.round(i*o)/o},Fi=function(e,t){var s=U(t,1),i=U(t,63,1),a=new Date((s===0?1:-1)*i/1e3+9466848e5);return e||a.setTime(a.getTime()+a.getTimezoneOffset()*6e4),a.usec=i%1e3,a.getMicroSeconds=function(){return this.usec},a.setMicroSeconds=function(r){this.usec=r},a.getUTCMicroSeconds=function(){return this.usec},a},Qe=function(e){for(var t=U(e,32),s=U(e,32,32),i=U(e,32,64),a=96,r=[],n=0;n<t;n++)r[n]=U(e,32,a),a+=32,a+=32;var o=function(_){var c=U(e,32,a);if(a+=32,c==4294967295)return null;var l;if(_==23||_==20)return l=U(e,c*8,a),a+=c*8,l;if(_==25)return l=e.toString(this.encoding,a>>3,(a+=c<<3)>>3),l;console.log("ERROR: ElementType not implemented: "+_)},E=function(_,c){var l=[],d;if(_.length>1){var u=_.shift();for(d=0;d<u;d++)l[d]=E(_,c);_.unshift(u)}else for(d=0;d<_[0];d++)l[d]=o(c);return l};return E(r,i)},vn=function(e){return e.toString("utf8")},fn=function(e){return e===null?null:U(e,8)>0},An=function(e){e(20,hn),e(21,In),e(23,Ci),e(26,Ci),e(1700,Ln),e(700,bn),e(701,On),e(16,fn),e(1114,Fi.bind(null,!1)),e(1184,Fi.bind(null,!0)),e(1e3,Qe),e(1007,Qe),e(1016,Qe),e(1008,Qe),e(1009,Qe),e(25,vn)};Ui.exports={init:An}});var wi=h((nc,Hi)=>{Hi.exports={BOOL:16,BYTEA:17,CHAR:18,INT8:20,INT2:21,INT4:23,REGPROC:24,TEXT:25,OID:26,TID:27,XID:28,CID:29,JSON:114,XML:142,PG_NODE_TREE:194,SMGR:210,PATH:602,POLYGON:604,CIDR:650,FLOAT4:700,FLOAT8:701,ABSTIME:702,RELTIME:703,TINTERVAL:704,CIRCLE:718,MACADDR8:774,MONEY:790,MACADDR:829,INET:869,ACLITEM:1033,BPCHAR:1042,VARCHAR:1043,DATE:1082,TIME:1083,TIMESTAMP:1114,TIMESTAMPTZ:1184,INTERVAL:1186,TIMETZ:1266,BIT:1560,VARBIT:1562,NUMERIC:1700,REFCURSOR:1790,REGPROCEDURE:2202,REGOPER:2203,REGOPERATOR:2204,REGCLASS:2205,REGTYPE:2206,UUID:2950,TXID_SNAPSHOT:2970,PG_LSN:3220,PG_NDISTINCT:3361,PG_DEPENDENCIES:3402,TSVECTOR:3614,TSQUERY:3615,GTSVECTOR:3642,REGCONFIG:3734,REGDICTIONARY:3769,JSONB:3802,REGNAMESPACE:4089,REGROLE:4096}});var tt=h(et=>{var Sn=gi(),gn=Pi(),yn=Mt(),Dn=wi();et.getTypeParser=Cn;et.setTypeParser=Fn;et.arrayParser=yn;et.builtins=Dn;var Ze={text:{},binary:{}};function Mi(e){return String(e)}function Cn(e,t){return t=t||"text",Ze[t]&&Ze[t][e]||Mi}function Fn(e,t,s){typeof t=="function"&&(s=t,t="text"),Ze[t][e]=s}Sn.init(function(e,t){Ze.text[e]=t});gn.init(function(e,t){Ze.binary[e]=t})});var st=h((_c,$t)=>{"use strict";$t.exports={host:"localhost",user:process.platform==="win32"?process.env.USERNAME:process.env.USER,database:void 0,password:null,connectionString:void 0,port:5432,rows:0,binary:!1,max:10,idleTimeoutMillis:3e4,client_encoding:"",ssl:!1,application_name:void 0,fallback_application_name:void 0,options:void 0,parseInputDatesAsUTC:!1,statement_timeout:!1,lock_timeout:!1,idle_in_transaction_session_timeout:!1,query_timeout:!1,connect_timeout:0,keepalives:1,keepalives_idle:0};var Me=tt(),jn=Me.getTypeParser(20,"text"),Un=Me.getTypeParser(1016,"text");$t.exports.__defineSetter__("parseInt8",function(e){Me.setTypeParser(20,"text",e?Me.getTypeParser(23,"text"):jn),Me.setTypeParser(1016,"text",e?Me.getTypeParser(1007,"text"):Un)})});var it=h((Ec,xi)=>{"use strict";var Pn=st();function Hn(e){var t=e.replace(/\\/g,"\\\\").replace(/"/g,'\\"');return'"'+t+'"'}function ki(e){for(var t="{",s=0;s<e.length;s++)if(s>0&&(t=t+","),e[s]===null||typeof e[s]>"u")t=t+"NULL";else if(Array.isArray(e[s]))t=t+ki(e[s]);else if(ArrayBuffer.isView(e[s])){var i=e[s];if(!(i instanceof Buffer)){var a=Buffer.from(i.buffer,i.byteOffset,i.byteLength);a.length===i.byteLength?i=a:i=a.slice(i.byteOffset,i.byteOffset+i.byteLength)}t+="\\\\x"+i.toString("hex")}else t+=Hn(Rt(e[s]));return t=t+"}",t}var Rt=function(e,t){if(e==null)return null;if(e instanceof Buffer)return e;if(ArrayBuffer.isView(e)){var s=Buffer.from(e.buffer,e.byteOffset,e.byteLength);return s.length===e.byteLength?s:s.slice(e.byteOffset,e.byteOffset+e.byteLength)}return e instanceof Date?Pn.parseInputDatesAsUTC?kn(e):Mn(e):Array.isArray(e)?ki(e):typeof e=="object"?wn(e,t):e.toString()};function wn(e,t){if(e&&typeof e.toPostgres=="function"){if(t=t||[],t.indexOf(e)!==-1)throw new Error('circular reference detected while preparing "'+e+'" for query');return t.push(e),Rt(e.toPostgres(Rt),t)}return JSON.stringify(e)}function Q(e,t){for(e=""+e;e.length<t;)e="0"+e;return e}function Mn(e){var t=-e.getTimezoneOffset(),s=e.getFullYear(),i=s<1;i&&(s=Math.abs(s)+1);var a=Q(s,4)+"-"+Q(e.getMonth()+1,2)+"-"+Q(e.getDate(),2)+"T"+Q(e.getHours(),2)+":"+Q(e.getMinutes(),2)+":"+Q(e.getSeconds(),2)+"."+Q(e.getMilliseconds(),3);return t<0?(a+="-",t*=-1):a+="+",a+=Q(Math.floor(t/60),2)+":"+Q(t%60,2),i&&(a+=" BC"),a}function kn(e){var t=e.getUTCFullYear(),s=t<1;s&&(t=Math.abs(t)+1);var i=Q(t,4)+"-"+Q(e.getUTCMonth()+1,2)+"-"+Q(e.getUTCDate(),2)+"T"+Q(e.getUTCHours(),2)+":"+Q(e.getUTCMinutes(),2)+":"+Q(e.getUTCSeconds(),2)+"."+Q(e.getUTCMilliseconds(),3);return i+="+00:00",s&&(i+=" BC"),i}function xn(e,t,s){return e=typeof e=="string"?{text:e}:e,t&&(typeof t=="function"?e.callback=t:e.values=t),s&&(e.callback=s),e}var Wn=function(e){return'"'+e.replace(/"/g,'""')+'"'},Bn=function(e){for(var t=!1,s="'",i=0;i<e.length;i++){var a=e[i];a==="'"?s+=a+a:a==="\\"?(s+=a+a,t=!0):s+=a}return s+="'",t===!0&&(s=" E"+s),s};xi.exports={prepareValue:function(t){return Rt(t)},normalizeQueryConfig:xn,escapeIdentifier:Wn,escapeLiteral:Bn}});var Bi=h((cc,Wi)=>{"use strict";var at=B("crypto");function Kt(e){return at.createHash("md5").update(e,"utf-8").digest("hex")}function qn(e,t,s){var i=Kt(t+e),a=Kt(Buffer.concat([Buffer.from(i),s]));return"md5"+a}function Gn(e){return at.createHash("sha256").update(e).digest()}function Yn(e,t){return at.createHmac("sha256",e).update(t).digest()}async function $n(e,t,s){return at.pbkdf2Sync(e,t,s,32,"sha256")}Wi.exports={postgresMd5PasswordHash:qn,randomBytes:at.randomBytes,deriveKey:$n,sha256:Gn,hmacSha256:Yn,md5:Kt}});var $i=h((lc,Yi)=>{var qi=B("crypto");Yi.exports={postgresMd5PasswordHash:Vn,randomBytes:Kn,deriveKey:zn,sha256:Jn,hmacSha256:Xn,md5:Vt};var Gi=qi.webcrypto||globalThis.crypto,ke=Gi.subtle,Jt=new TextEncoder;function Kn(e){return Gi.getRandomValues(Buffer.alloc(e))}async function Vt(e){try{return qi.createHash("md5").update(e,"utf-8").digest("hex")}catch{let s=typeof e=="string"?Jt.encode(e):e,i=await ke.digest("MD5",s);return Array.from(new Uint8Array(i)).map(a=>a.toString(16).padStart(2,"0")).join("")}}async function Vn(e,t,s){var i=await Vt(t+e),a=await Vt(Buffer.concat([Buffer.from(i),s]));return"md5"+a}async function Jn(e){return await ke.digest("SHA-256",e)}async function Xn(e,t){let s=await ke.importKey("raw",e,{name:"HMAC",hash:"SHA-256"},!1,["sign"]);return await ke.sign("HMAC",s,Jt.encode(t))}async function zn(e,t,s){let i=await ke.importKey("raw",Jt.encode(e),"PBKDF2",!1,["deriveBits"]),a={name:"PBKDF2",hash:"SHA-256",salt:t,iterations:s};return await ke.deriveBits(a,i,32*8,["deriveBits"])}});var zt=h((dc,Xt)=>{"use strict";var Qn=parseInt(process.versions&&process.versions.node&&process.versions.node.split(".")[0])<15;Qn?Xt.exports=Bi():Xt.exports=$i()});var Xi=h((uc,Ji)=>{"use strict";var De=zt();function Zn(e){if(e.indexOf("SCRAM-SHA-256")===-1)throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");let t=De.randomBytes(18).toString("base64");return{mechanism:"SCRAM-SHA-256",clientNonce:t,response:"n,,n=*,r="+t,message:"SASLInitialResponse"}}async function eo(e,t,s){if(e.message!=="SASLInitialResponse")throw new Error("SASL: Last message was not SASLInitialResponse");if(typeof t!="string")throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");if(t==="")throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string");if(typeof s!="string")throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");let i=io(s);if(i.nonce.startsWith(e.clientNonce)){if(i.nonce.length===e.clientNonce.length)throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");var a="n=*,r="+e.clientNonce,r="r="+i.nonce+",s="+i.salt+",i="+i.iteration,n="c=biws,r="+i.nonce,o=a+","+r+","+n,E=Buffer.from(i.salt,"base64"),_=await De.deriveKey(t,E,i.iteration),c=await De.hmacSha256(_,"Client Key"),l=await De.sha256(c),d=await De.hmacSha256(l,o),u=ro(Buffer.from(c),Buffer.from(d)).toString("base64"),I=await De.hmacSha256(_,"Server Key"),L=await De.hmacSha256(I,o);e.message="SASLResponse",e.serverSignature=Buffer.from(L).toString("base64"),e.response=n+",p="+u}function to(e,t){if(e.message!=="SASLResponse")throw new Error("SASL: Last message was not SASLResponse");if(typeof t!="string")throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");let{serverSignature:s}=ao(t);if(s!==e.serverSignature)throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match")}function so(e){if(typeof e!="string")throw new TypeError("SASL: text must be a string");return e.split("").map((t,s)=>e.charCodeAt(s)).every(t=>t>=33&&t<=43||t>=45&&t<=126)}function Ki(e){return/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(e)}function Vi(e){if(typeof e!="string")throw new TypeError("SASL: attribute pairs text must be a string");return new Map(e.split(",").map(t=>{if(!/^.=/.test(t))throw new Error("SASL: Invalid attribute pair entry");let s=t[0],i=t.substring(2);return[s,i]}))}function io(e){let t=Vi(e),s=t.get("r");if(s){if(!so(s))throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");let i=t.get("s");if(i){if(!Ki(i))throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");let a=t.get("i");if(a){if(!/^[1-9][0-9]*$/.test(a))throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");let r=parseInt(a,10);return{nonce:s,salt:i,iteration:r}}function ao(e){let s=Vi(e).get("v");if(s){if(!Ki(s))throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64")}else throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");return{serverSignature:s}}function ro(e,t){if(!Buffer.isBuffer(e))throw new TypeError("first argument must be a Buffer");if(!Buffer.isBuffer(t))throw new TypeError("second argument must be a Buffer");if(e.length!==t.length)throw new Error("Buffer lengths must match");if(e.length===0)throw new Error("Buffers cannot be empty");return Buffer.from(e.map((s,i)=>e[i]^t[i]))}Ji.exports={startSession:Zn,continueSession:eo,finalizeSession:to}});var Qt=h((Nc,zi)=>{"use strict";var no=tt();function ht(e){this._types=e||no,this.text={},this.binary={}}ht.prototype.getOverrides=function(e){switch(e){case"text":return this.text;case"binary":return this.binary;default:return{}}};ht.prototype.setTypeParser=function(e,t,s){typeof t=="function"&&(s=t,t="text"),this.getOverrides(t)[e]=s};ht.prototype.getTypeParser=function(e,t){return t=t||"text",this.getOverrides(t)[e]||this._types.getTypeParser(e,t)};zi.exports=ht});var ea=h((pc,Zi)=>{"use strict";function xe(e,t={}){if(e.charAt(0)==="/"){let E=e.split(" ");return{host:E[0],database:E[1]}}let s=Object.create(null),i,a=!1;/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(e)&&(e=encodeURI(e).replace(/%25(\d\d)/g,"%$1"));try{try{i=new URL(e,"postgres://base")}catch{i=new URL(e.replace("@/","@___DUMMY___/"),"postgres://base"),a=!0}}catch(E){throw E.input&&(E.input="*****REDACTED*****"),E}for(let E of i.searchParams.entries())s[E[0]]=E[1];if(s.user=s.user||decodeURIComponent(i.username),s.password=s.password||decodeURIComponent(i.password),i.protocol=="socket:")return s.host=decodeURI(i.pathname),s.database=i.searchParams.get("db"),s.client_encoding=i.searchParams.get("encoding"),s;let r=(a?"":i.hostname).replace(/^\[(.+)\]$/,"$1");s.host?r&&/^%2f/i.test(r)&&(i.pathname=r+i.pathname):s.host=decodeURIComponent(r),s.port||(s.port=i.port);let n=i.pathname.slice(1)||null;s.database=n?decodeURI(n):null,(s.ssl==="true"||s.ssl==="1")&&(s.ssl=!0),s.ssl==="0"&&(s.ssl=!1),(s.sslcert||s.sslkey||s.sslrootcert||s.sslmode)&&(s.ssl={}),s.sslnegotiation==="direct"&&s.ssl===void 0&&(s.ssl=!0);let o=s.sslcert||s.sslkey||s.sslrootcert?B("fs"):null;if(s.sslcert&&(s.ssl.cert=o.readFileSync(s.sslcert).toString()),s.sslkey&&(s.ssl.key=o.readFileSync(s.sslkey).toString()),s.sslrootcert&&(s.ssl.ca=o.readFileSync(s.sslrootcert).toString()),t.useLibpqCompat&&s.uselibpqcompat)throw new Error("Both useLibpqCompat and uselibpqcompat are set. Please use only one of them.");if(s.uselibpqcompat==="true"||t.useLibpqCompat)switch(s.sslmode){case"disable":{s.ssl=!1;break}case"prefer":{s.ssl.rejectUnauthorized=!1;break}case"require":{s.sslrootcert?s.ssl.checkServerIdentity=function(){}:s.ssl.rejectUnauthorized=!1;break}case"verify-ca":{if(!s.ssl.ca)throw new Error("SECURITY WARNING: Using sslmode=verify-ca requires specifying a CA with sslrootcert. If a public CA is used, verify-ca allows connections to a server that somebody else may have registered with the CA, making you vulnerable to Man-in-the-Middle attacks. Either specify a custom CA certificate with sslrootcert parameter or use sslmode=verify-full for proper security.");s.ssl.checkServerIdentity=function(){};break}case"verify-full":break}else switch(s.sslmode){case"disable":{s.ssl=!1;break}case"prefer":case"require":case"verify-ca":case"verify-full":{s.sslmode!=="verify-full"&&Zt(s.sslmode);break}case"no-verify":{s.ssl.rejectUnauthorized=!1;break}}return s}function oo(e){return Object.entries(e).reduce((s,[i,a])=>(a!=null&&(s[i]=a),s),Object.create(null))}function Qi(e){return Object.entries(e).reduce((s,[i,a])=>{if(i==="ssl"){let r=a;typeof r=="boolean"&&(s[i]=r),typeof r=="object"&&(s[i]=oo(r))}else if(a!=null)if(i==="port"){if(a!==""){let r=parseInt(a,10);if(isNaN(r))throw new Error(`Invalid ${i}: ${a}`);s[i]=r}}else s[i]=a;return s},Object.create(null))}function _o(e){return Qi(xe(e))}function Zt(e){!Zt.warned&&typeof process<"u"&&process.emitWarning&&(Zt.warned=!0,process.emitWarning(`SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=${e}'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.`))}Zi.exports=xe;xe.parse=xe;xe.toClientConfig=Qi;xe.parseIntoClientConfig=_o});var ts=h((Tc,ia)=>{"use strict";var Eo=B("dns"),sa=st(),ta=ea().parse,ee=function(e,t,s){return s===void 0?s=process.env["PG"+e.toUpperCase()]:s===!1||(s=process.env[s]),t[e]||s||sa[e]},co=function(){switch(process.env.PGSSLMODE){case"disable":return!1;case"prefer":case"require":case"verify-ca":case"verify-full":return!0;case"no-verify":return{rejectUnauthorized:!1}}return sa.ssl},We=function(e){return"'"+(""+e).replace(/\\/g,"\\\\").replace(/'/g,"\\'")+"'"},Ne=function(e,t,s){var i=t[s];i!=null&&e.push(s+"="+We(i))},es=class{constructor(t){t=typeof t=="string"?ta(t):t||{},t.connectionString&&(t=Object.assign({},t,ta(t.connectionString))),this.user=ee("user",t),this.database=ee("database",t),this.database===void 0&&(this.database=this.user),this.port=parseInt(ee("port",t),10),this.host=ee("host",t),Object.defineProperty(this,"password",{configurable:!0,enumerable:!1,writable:!0,value:ee("password",t)}),this.binary=ee("binary",t),this.options=ee("options",t),this.ssl=typeof t.ssl>"u"?co():t.ssl,typeof this.ssl=="string"&&this.ssl==="true"&&(this.ssl=!0),this.ssl==="no-verify"&&(this.ssl={rejectUnauthorized:!1}),this.ssl&&this.ssl.key&&Object.defineProperty(this.ssl,"key",{enumerable:!1}),this.client_encoding=ee("client_encoding",t),this.replication=ee("replication",t),this.isDomainSocket=!(this.host||"").indexOf("/"),this.application_name=ee("application_name",t,"PGAPPNAME"),this.fallback_application_name=ee("fallback_application_name",t,!1),this.statement_timeout=ee("statement_timeout",t,!1),this.lock_timeout=ee("lock_timeout",t,!1),this.idle_in_transaction_session_timeout=ee("idle_in_transaction_session_timeout",t,!1),this.query_timeout=ee("query_timeout",t,!1),t.connectionTimeoutMillis===void 0?this.connect_timeout=process.env.PGCONNECT_TIMEOUT||0:this.connect_timeout=Math.floor(t.connectionTimeoutMillis/1e3),t.keepAlive===!1?this.keepalives=0:t.keepAlive===!0&&(this.keepalives=1),typeof t.keepAliveInitialDelayMillis=="number"&&(this.keepalives_idle=Math.floor(t.keepAliveInitialDelayMillis/1e3))}getLibpqConnectionString(t){var s=[];Ne(s,this,"user"),Ne(s,this,"password"),Ne(s,this,"port"),Ne(s,this,"application_name"),Ne(s,this,"fallback_application_name"),Ne(s,this,"connect_timeout"),Ne(s,this,"options");var i=typeof this.ssl=="object"?this.ssl:this.ssl?{sslmode:this.ssl}:{};if(Ne(s,i,"sslmode"),Ne(s,i,"sslca"),Ne(s,i,"sslkey"),Ne(s,i,"sslcert"),Ne(s,i,"sslrootcert"),this.database&&s.push("dbname="+We(this.database)),this.replication&&s.push("replication="+We(this.replication)),this.host&&s.push("host="+We(this.host)),this.isDomainSocket)return t(null,s.join(" "));this.client_encoding&&s.push("client_encoding="+We(this.client_encoding)),Eo.lookup(this.host,function(a,r){return a?t(a,null):(s.push("hostaddr="+We(r)),t(null,s.join(" ")))})}};ia.exports=es});var na=h((mc,ra)=>{"use strict";var lo=tt(),aa=/^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/,ss=class{constructor(t,s){this.command=null,this.rowCount=null,this.oid=null,this.rows=[],this.fields=[],this._parsers=void 0,this._types=s,this.RowCtor=null,this.rowAsArray=t==="array",this.rowAsArray&&(this.parseRow=this._parseRowAsArray),this._prebuiltEmptyResultObject=null}addCommandComplete(t){var s;t.text?s=aa.exec(t.text):s=aa.exec(t.command),s&&(this.command=s[1],s[3]?(this.oid=parseInt(s[2],10),this.rowCount=parseInt(s[3],10)):s[2]&&(this.rowCount=parseInt(s[2],10)))}_parseRowAsArray(t){for(var s=new Array(t.length),i=0,a=t.length;i<a;i++){var r=t[i];r!==null?s[i]=this._parsers[i](r):s[i]=null}return s}parseRow(t){for(var s={...this._prebuiltEmptyResultObject},i=0,a=t.length;i<a;i++){var r=t[i],n=this.fields[i].name;r!==null?s[n]=this._parsers[i](r):s[n]=null}return s}addRow(t){this.rows.push(t)}addFields(t){this.fields=t,this.fields.length&&(this._parsers=new Array(t.length));for(var s={},i=0;i<t.length;i++){var a=t[i];s[a.name]=null,this._types?this._parsers[i]=this._types.getTypeParser(a.dataTypeID,a.format||"text"):this._parsers[i]=lo.getTypeParser(a.dataTypeID,a.format||"text")}this._prebuiltEmptyResultObject={...s}}};ra.exports=ss});var ca=h((Rc,Ea)=>{"use strict";var{EventEmitter:uo}=B("events"),oa=na(),_a=it(),is=class extends uo{constructor(t,s,i){super(),t=_a.normalizeQueryConfig(t,s,i),this.text=t.text,this.values=t.values,this.rows=t.rows,this.types=t.types,this.name=t.name,this.queryMode=t.queryMode,this.binary=t.binary,this.portal=t.portal||"",this.callback=t.callback,this._rowMode=t.rowMode,process.domain&&t.callback&&(this.callback=process.domain.bind(t.callback)),this._result=new oa(this._rowMode,this.types),this._results=this._result,this._canceledDueToError=!1}requiresPreparation(){return this.queryMode==="extended"||this.name||this.rows?!0:!this.text||!this.values?!1:this.values.length>0}_checkForMultirow(){this._result.command&&(Array.isArray(this._results)||(this._results=[this._result]),this._result=new oa(this._rowMode,this._result._types),this._results.push(this._result))}handleRowDescription(t){this._checkForMultirow(),this._result.addFields(t.fields),this._accumulateRows=this.callback||!this.listeners("row").length}handleDataRow(t){let s;if(!this._canceledDueToError){try{s=this._result.parseRow(t.fields)}catch(i){this._canceledDueToError=i;return}this.emit("row",s,this._result),this._accumulateRows&&this._result.addRow(s)}}handleCommandComplete(t,s){this._checkForMultirow(),this._result.addCommandComplete(t),this.rows&&s.sync()}handleEmptyQuery(t){this.rows&&t.sync()}handleError(t,s){if(this._canceledDueToError&&(t=this._canceledDueToError,this._canceledDueToError=!1),this.callback)return this.callback(t);this.emit("error",t)}handleReadyForQuery(t){if(this._canceledDueToError)return this.handleError(this._canceledDueToError,t);if(this.callback)try{this.callback(null,this._results)}catch(s){process.nextTick(()=>{throw s})}this.emit("end",this._results)}submit(t){if(typeof this.text!="string"&&typeof this.name!="string")return new Error("A query must have either text or a name. Supplying neither is unsupported.");let s=t.parsedStatements[this.name];return this.text&&s&&this.text!==s?new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`):this.values&&!Array.isArray(this.values)?new Error("Query values must be an array"):(this.requiresPreparation()?this.prepare(t):t.query(this.text),null)}hasBeenParsed(t){return this.name&&t.parsedStatements[this.name]}handlePortalSuspended(t){this._getRows(t,this.rows)}_getRows(t,s){t.execute({portal:this.portal,rows:s}),s?t.flush():t.sync()}prepare(t){this.hasBeenParsed(t)||t.parse({text:this.text,name:this.name,types:this.types});try{t.bind({portal:this.portal,statement:this.name,values:this.values,binary:this.binary,valueMapper:_a.prepareValue})}catch(s){this.handleError(s,t);return}t.describe({type:"P",name:this.portal||""}),this._getRows(t,this.rows)}handleCopyInResponse(t){t.sendCopyFail("No source stream defined")}handleCopyData(t,s){}};Ea.exports=is});var Rs=h(p=>{"use strict";Object.defineProperty(p,"__esModule",{value:!0});p.NoticeMessage=p.DataRowMessage=p.CommandCompleteMessage=p.ReadyForQueryMessage=p.NotificationResponseMessage=p.BackendKeyDataMessage=p.AuthenticationMD5Password=p.ParameterStatusMessage=p.ParameterDescriptionMessage=p.RowDescriptionMessage=p.Field=p.CopyResponse=p.CopyDataMessage=p.DatabaseError=p.copyDone=p.emptyQuery=p.replicationStart=p.portalSuspended=p.noData=p.closeComplete=p.bindComplete=p.parseComplete=void 0;p.parseComplete={name:"parseComplete",length:5};p.bindComplete={name:"bindComplete",length:5};p.closeComplete={name:"closeComplete",length:5};p.noData={name:"noData",length:5};p.portalSuspended={name:"portalSuspended",length:5};p.replicationStart={name:"replicationStart",length:4};p.emptyQuery={name:"emptyQuery",length:4};p.copyDone={name:"copyDone",length:4};var as=class extends Error{constructor(t,s,i){super(t),this.length=s,this.name=i}};p.DatabaseError=as;var rs=class{constructor(t,s){this.length=t,this.chunk=s,this.name="copyData"}};p.CopyDataMessage=rs;var ns=class{constructor(t,s,i,a){this.length=t,this.name=s,this.binary=i,this.columnTypes=new Array(a)}};p.CopyResponse=ns;var os=class{constructor(t,s,i,a,r,n,o){this.name=t,this.tableID=s,this.columnID=i,this.dataTypeID=a,this.dataTypeSize=r,this.dataTypeModifier=n,this.format=o}};p.Field=os;var _s=class{constructor(t,s){this.length=t,this.fieldCount=s,this.name="rowDescription",this.fields=new Array(this.fieldCount)}};p.RowDescriptionMessage=_s;var Es=class{constructor(t,s){this.length=t,this.parameterCount=s,this.name="parameterDescription",this.dataTypeIDs=new Array(this.parameterCount)}};p.ParameterDescriptionMessage=Es;var cs=class{constructor(t,s,i){this.length=t,this.parameterName=s,this.parameterValue=i,this.name="parameterStatus"}};p.ParameterStatusMessage=cs;var ls=class{constructor(t,s){this.length=t,this.salt=s,this.name="authenticationMD5Password"}};p.AuthenticationMD5Password=ls;var ds=class{constructor(t,s,i){this.length=t,this.processID=s,this.secretKey=i,this.name="backendKeyData"}};p.BackendKeyDataMessage=ds;var us=class{constructor(t,s,i,a){this.length=t,this.processId=s,this.channel=i,this.payload=a,this.name="notification"}};p.NotificationResponseMessage=us;var Ns=class{constructor(t,s){this.length=t,this.status=s,this.name="readyForQuery"}};p.ReadyForQueryMessage=Ns;var ps=class{constructor(t,s){this.length=t,this.text=s,this.name="commandComplete"}};p.CommandCompleteMessage=ps;var Ts=class{constructor(t,s){this.length=t,this.fields=s,this.name="dataRow",this.fieldCount=s.length}};p.DataRowMessage=Ts;var ms=class{constructor(t,s){this.length=t,this.message=s,this.name="notice"}};p.NoticeMessage=ms});var la=h(It=>{"use strict";Object.defineProperty(It,"__esModule",{value:!0});It.Writer=void 0;var hs=class{constructor(t=256){this.size=t,this.offset=5,this.headerPosition=0,this.buffer=Buffer.allocUnsafe(t)}ensure(t){if(this.buffer.length-this.offset<t){let i=this.buffer,a=i.length+(i.length>>1)+t;this.buffer=Buffer.allocUnsafe(a),i.copy(this.buffer,0,0,this.offset)}}addInt32(t){return this.ensure(4),this.buffer[this.offset++]=t>>>24&255,this.buffer[this.offset++]=t>>>16&255,this.buffer[this.offset++]=t>>>8&255,this.buffer[this.offset++]=t>>>0&255,this}addInt16(t){return this.ensure(2),this.buffer[this.offset++]=t>>>8&255,this.buffer[this.offset++]=t>>>0&255,this}addCString(t){if(!t)this.ensure(1);else{let s=Buffer.byteLength(t);this.ensure(s+1),this.buffer.write(t,this.offset,"utf-8"),this.offset+=s}return this.buffer[this.offset++]=0,this}addString(t=""){let s=Buffer.byteLength(t);return this.ensure(s),this.buffer.write(t,this.offset),this.offset+=s,this}addInt32PrefixedString(t){let s=Buffer.byteLength(t);this.ensure(4+s);let i=this.buffer,a=this.offset;return i[a++]=s>>>24&255,i[a++]=s>>>16&255,i[a++]=s>>>8&255,i[a++]=s>>>0&255,i.write(t,a,"utf-8"),this.offset=a+s,this}add(t){return this.ensure(t.length),t.copy(this.buffer,this.offset),this.offset+=t.length,this}reserveUnsafe(t){let s=this.offset;return this.ensure(t),this.offset+=t,s}join(t){if(t){this.buffer[this.headerPosition]=t;let s=this.offset-(this.headerPosition+1);this.buffer.writeInt32BE(s,this.headerPosition+1)}return this.buffer.slice(t?0:5,this.offset)}flush(t){let s=this.join(t);return this.offset=5,this.headerPosition=0,this.buffer=Buffer.allocUnsafe(this.size),s}clear(){this.offset=5,this.headerPosition=0}};It.Writer=hs});var Na=h(Ot=>{"use strict";Object.defineProperty(Ot,"__esModule",{value:!0});Ot.serialize=void 0;var da=la(),S=new da.Writer,No=e=>{S.addInt16(3).addInt16(0);for(let i of Object.keys(e))S.addCString(i).addCString(e[i]);S.addCString("client_encoding").addCString("UTF8");let t=S.addCString("").flush(),s=t.length+4;return new da.Writer().addInt32(s).add(t).flush()},po=()=>{let e=Buffer.allocUnsafe(8);return e.writeInt32BE(8,0),e.writeInt32BE(80877103,4),e},To=e=>S.addCString(e).flush(112),mo=function(e,t){return S.addCString(e).addInt32PrefixedString(t),S.flush(112)},Ro=function(e){return S.addString(e).flush(112)},ho=e=>S.addCString(e).flush(81),ua=[],Io=e=>{let t=e.name||"";t.length>63&&(console.error("Warning! Postgres only supports 63 characters for query names."),console.error("You supplied %s (%s)",t,t.length),console.error("This can cause conflicts and silent errors executing queries"));let s=e.types||ua,i=s.length,a=S.addCString(t).addCString(e.text).addInt16(i);for(let r=0;r<i;r++)a.addInt32(s[r]);return S.flush(80)},bo=function(e,t,s){let i=e.length;for(let a=0;a<i;a++){let r=t?t(e[a],a):e[a],n=0;r==null?S.addInt32(-1):r instanceof Buffer?(n=1,S.addInt32(r.length),S.add(r)):S.addInt32PrefixedString(r);let o=S.buffer;o[s++]=0,o[s++]=n}},Oo=(e={})=>{let t=e.portal||"",s=e.statement||"",i=e.binary||!1,a=e.values||ua,r=a.length;S.addCString(t).addCString(s),S.addInt16(r);let n=S.reserveUnsafe(r*2);S.addInt16(r);try{bo(a,e.valueMapper,n)}catch(o){throw S.clear(),o}return S.addInt16(1),S.addInt16(i?1:0),S.flush(66)},Lo=Buffer.from([69,0,0,0,9,0,0,0,0,0]),vo=e=>{if(!e||!e.portal&&!e.rows)return Lo;let t=e.portal||"",s=e.rows||0,i=Buffer.byteLength(t),a=4+i+1+4,r=Buffer.allocUnsafe(1+a);return r[0]=69,r.writeInt32BE(a,1),r.write(t,5,"utf-8"),r[i+5]=0,r.writeUInt32BE(s,r.length-4),r},fo=(e,t)=>{let s=Buffer.allocUnsafe(16);return s.writeInt32BE(16,0),s.writeInt16BE(1234,4),s.writeInt16BE(5678,6),s.writeInt32BE(e,8),s.writeInt32BE(t,12),s},Is=(e,t)=>{let i=4+Buffer.byteLength(t)+1,a=Buffer.allocUnsafe(1+i);return a[0]=e,a.writeInt32BE(i,1),a.write(t,5,"utf-8"),a[i]=0,a},Ao=S.addCString("P").flush(68),So=S.addCString("S").flush(68),go=e=>e.name?Is(68,`${e.type}${e.name||""}`):e.type==="P"?Ao:So,yo=e=>{let t=`${e.type}${e.name||""}`;return Is(67,t)},Do=e=>S.add(e).flush(100),Co=e=>Is(102,e),bt=e=>Buffer.from([e,0,0,0,4]),Fo=bt(72),jo=bt(83),Uo=bt(88),Po=bt(99),Ho={startup:No,password:To,requestSsl:po,sendSASLInitialResponseMessage:mo,sendSCRAMClientFinalMessage:Ro,query:ho,parse:Io,bind:Oo,execute:vo,describe:go,close:yo,flush:()=>Fo,sync:()=>jo,end:()=>Uo,copyData:Do,copyDone:()=>Po,copyFail:Co,cancel:fo};Ot.serialize=Ho});var pa=h(Lt=>{"use strict";Object.defineProperty(Lt,"__esModule",{value:!0});Lt.BufferReader=void 0;var bs=class{constructor(t=0){this.offset=t,this.buffer=Buffer.allocUnsafe(0),this.encoding="utf-8"}setBuffer(t,s){this.offset=t,this.buffer=s}int16(){let t=this.buffer.readInt16BE(this.offset);return this.offset+=2,t}byte(){let t=this.buffer[this.offset];return this.offset++,t}int32(){let t=this.buffer.readInt32BE(this.offset);return this.offset+=4,t}uint32(){let t=this.buffer.readUInt32BE(this.offset);return this.offset+=4,t}string(t){let s=this.buffer.toString(this.encoding,this.offset,this.offset+t);return this.offset+=t,s}cstring(){let t=this.offset,s=t;for(;this.buffer[s++];);return this.offset=s,this.buffer.toString(this.encoding,t,s-1)}bytes(t){let s=this.buffer.slice(this.offset,this.offset+t);return this.offset+=t,s}};Lt.BufferReader=bs});var ha=h(vt=>{"use strict";Object.defineProperty(vt,"__esModule",{value:!0});vt.Parser=void 0;var P=Rs(),wo=pa(),Ls=1,Mo=4,Ta=Ls+Mo,ce=-1,Os=Buffer.allocUnsafe(0),vs=class{constructor(t){if(this.buffer=Os,this.bufferLength=0,this.bufferOffset=0,this.reader=new wo.BufferReader,t?.mode==="binary")throw new Error("Binary mode not supported yet");this.mode=t?.mode||"text"}parse(t,s){this.mergeBuffer(t);let i=this.bufferOffset+this.bufferLength,a=this.bufferOffset;for(;a+Ta<=i;){let r=this.buffer[a],n=this.buffer.readUInt32BE(a+Ls),o=Ls+n;if(o+a<=i){let E=this.handlePacket(a+Ta,r,n,this.buffer);s(E),a+=o}else break}a===i?(this.buffer=Os,this.bufferLength=0,this.bufferOffset=0):(this.bufferLength=i-a,this.bufferOffset=a)}mergeBuffer(t){if(this.bufferLength>0){let s=this.bufferLength+t.byteLength;if(s+this.bufferOffset>this.buffer.byteLength){let a;if(s<=this.buffer.byteLength&&this.bufferOffset>=this.bufferLength)a=this.buffer;else{let r=this.buffer.byteLength*2;for(;s>=r;)r*=2;a=Buffer.allocUnsafe(r)}this.buffer.copy(a,0,this.bufferOffset,this.bufferOffset+this.bufferLength),this.buffer=a,this.bufferOffset=0}t.copy(this.buffer,this.bufferOffset+this.bufferLength),this.bufferLength=s}else this.buffer=t,this.bufferOffset=0,this.bufferLength=t.byteLength}handlePacket(t,s,i,a){let{reader:r}=this;r.setBuffer(t,a);let n;switch(s){case 50:n=P.bindComplete;break;case 49:n=P.parseComplete;break;case 51:n=P.closeComplete;break;case 110:n=P.noData;break;case 115:n=P.portalSuspended;break;case 99:n=P.copyDone;break;case 87:n=P.replicationStart;break;case 73:n=P.emptyQuery;break;case 68:n=Vo(r);break;case 67:n=xo(r);break;case 90:n=ko(r);break;case 65:n=Go(r);break;case 82:n=zo(r,i);break;case 83:n=Jo(r);break;case 75:n=Xo(r);break;case 69:n=ma(r,"error");break;case 78:n=ma(r,"notice");break;case 84:n=Yo(r);break;case 116:n=Ko(r);break;case 71:n=Bo(r);break;case 72:n=qo(r);break;case 100:n=Wo(r,i);break;default:return new P.DatabaseError("received invalid response: "+s.toString(16),i,"error")}return r.setBuffer(0,Os),n.length=i,n}};vt.Parser=vs;var ko=e=>{let t=e.string(1);return new P.ReadyForQueryMessage(ce,t)},xo=e=>{let t=e.cstring();return new P.CommandCompleteMessage(ce,t)},Wo=(e,t)=>{let s=e.bytes(t-4);return new P.CopyDataMessage(ce,s)},Bo=e=>Ra(e,"copyInResponse"),qo=e=>Ra(e,"copyOutResponse"),Ra=(e,t)=>{let s=e.byte()!==0,i=e.int16(),a=new P.CopyResponse(ce,t,s,i);for(let r=0;r<i;r++)a.columnTypes[r]=e.int16();return a},Go=e=>{let t=e.int32(),s=e.cstring(),i=e.cstring();return new P.NotificationResponseMessage(ce,t,s,i)},Yo=e=>{let t=e.int16(),s=new P.RowDescriptionMessage(ce,t);for(let i=0;i<t;i++)s.fields[i]=$o(e);return s},$o=e=>{let t=e.cstring(),s=e.uint32(),i=e.int16(),a=e.uint32(),r=e.int16(),n=e.int32(),o=e.int16()===0?"text":"binary";return new P.Field(t,s,i,a,r,n,o)},Ko=e=>{let t=e.int16(),s=new P.ParameterDescriptionMessage(ce,t);for(let i=0;i<t;i++)s.dataTypeIDs[i]=e.uint32();return s},Vo=e=>{let t=e.int16(),s=new Array(t);for(let i=0;i<t;i++){let a=e.int32();s[i]=a===-1?null:e.string(a)}return new P.DataRowMessage(ce,s)},Jo=e=>{let t=e.cstring(),s=e.cstring();return new P.ParameterStatusMessage(ce,t,s)},Xo=e=>{let t=e.int32(),s=e.int32();return new P.BackendKeyDataMessage(ce,t,s)},zo=(e,t)=>{let s=e.int32(),i={name:"authenticationOk",length:t};switch(s){case 0:break;case 3:i.length===8&&(i.name="authenticationCleartextPassword");break;case 5:if(i.length===12){i.name="authenticationMD5Password";let a=e.bytes(4);return new P.AuthenticationMD5Password(ce,a)}break;case 10:{i.name="authenticationSASL",i.mechanisms=[];let a;do a=e.cstring(),a&&i.mechanisms.push(a);while(a)}break;case 11:i.name="authenticationSASLContinue",i.data=e.string(t-8);break;case 12:i.name="authenticationSASLFinal",i.data=e.string(t-8);break;default:throw new Error("Unknown authenticationOk message type "+s)}return i},ma=(e,t)=>{let s={},i=e.string(1);for(;i!=="\0";)s[i]=e.cstring(),i=e.string(1);let a=s.M,r=t==="notice"?new P.NoticeMessage(ce,a):new P.DatabaseError(a,ce,t);return r.severity=s.S,r.code=s.C,r.detail=s.D,r.hint=s.H,r.position=s.P,r.internalPosition=s.p,r.internalQuery=s.q,r.where=s.W,r.schema=s.s,r.table=s.t,r.column=s.c,r.dataType=s.d,r.constraint=s.n,r.file=s.F,r.line=s.L,r.routine=s.R,r}});var fs=h(Ce=>{"use strict";Object.defineProperty(Ce,"__esModule",{value:!0});Ce.DatabaseError=Ce.serialize=void 0;Ce.parse=t_;var Qo=Rs();Object.defineProperty(Ce,"DatabaseError",{enumerable:!0,get:function(){return Qo.DatabaseError}});var Zo=Na();Object.defineProperty(Ce,"serialize",{enumerable:!0,get:function(){return Zo.serialize}});var e_=ha();function t_(e,t){let s=new e_.Parser;return e.on("data",i=>s.parse(i,t)),new Promise(i=>e.on("end",()=>i()))}});var Ia=h(As=>{"use strict";Object.defineProperty(As,"__esModule",{value:!0});As.default={}});var Oa=h((Ac,ba)=>{var{getStream:s_,getSecureStream:i_}=o_();ba.exports={getStream:s_,getSecureStream:i_};function a_(){function e(s){let i=B("net");return new i.Socket}function t(s){var i=B("tls");return i.connect(s)}return{getStream:e,getSecureStream:t}}function r_(){function e(s){let{CloudflareSocket:i}=Ia();return new i(s)}function t(s){return s.socket.startTls(s),s.socket}return{getStream:e,getSecureStream:t}}function n_(){if(typeof navigator=="object"&&navigator!==null&&typeof navigator.userAgent=="string")return navigator.userAgent==="Cloudflare-Workers";if(typeof Response=="function"){let e=new Response(null,{cf:{thing:!0}});if(typeof e.cf=="object"&&e.cf!==null&&e.cf.thing)return!0}return!1}function o_(){return n_()?r_():a_()}});var gs=h((Sc,La)=>{"use strict";var __=B("events").EventEmitter,{parse:E_,serialize:$}=fs(),{getStream:c_,getSecureStream:l_}=Oa(),d_=$.flush(),u_=$.sync(),N_=$.end(),Ss=class extends __{constructor(t){super(),t=t||{},this.stream=t.stream||c_(t.ssl),typeof this.stream=="function"&&(this.stream=this.stream(t)),this._keepAlive=t.keepAlive,this._keepAliveInitialDelayMillis=t.keepAliveInitialDelayMillis,this.lastBuffer=!1,this.parsedStatements={},this.ssl=t.ssl||!1,this._ending=!1,this._emitMessage=!1;var s=this;this.on("newListener",function(i){i==="message"&&(s._emitMessage=!0)})}connect(t,s){var i=this;this._connecting=!0,this.stream.setNoDelay(!0),this.stream.connect(t,s),this.stream.once("connect",function(){i._keepAlive&&i.stream.setKeepAlive(!0,i._keepAliveInitialDelayMillis),i.emit("connect")});let a=function(r){i._ending&&(r.code==="ECONNRESET"||r.code==="EPIPE")||i.emit("error",r)};if(this.stream.on("error",a),this.stream.on("close",function(){i.emit("end")}),!this.ssl)return this.attachListeners(this.stream);this.stream.once("data",function(r){var n=r.toString("utf8");switch(n){case"S":break;case"N":return i.stream.end(),i.emit("error",new Error("The server does not support SSL connections"));default:return i.stream.end(),i.emit("error",new Error("There was an error establishing an SSL connection"))}let o={socket:i.stream};i.ssl!==!0&&(Object.assign(o,i.ssl),"key"in i.ssl&&(o.key=i.ssl.key));var E=B("net");E.isIP&&E.isIP(s)===0&&(o.servername=s);try{i.stream=l_(o)}catch(_){return i.emit("error",_)}i.attachListeners(i.stream),i.stream.on("error",a),i.emit("sslconnect")})}attachListeners(t){E_(t,s=>{var i=s.name==="error"?"errorMessage":s.name;this._emitMessage&&this.emit("message",s),this.emit(i,s)})}requestSsl(){this.stream.write($.requestSsl())}startup(t){this.stream.write($.startup(t))}cancel(t,s){this._send($.cancel(t,s))}password(t){this._send($.password(t))}sendSASLInitialResponseMessage(t,s){this._send($.sendSASLInitialResponseMessage(t,s))}sendSCRAMClientFinalMessage(t){this._send($.sendSCRAMClientFinalMessage(t))}_send(t){return this.stream.writable?this.stream.write(t):!1}query(t){this._send($.query(t))}parse(t){this._send($.parse(t))}bind(t){this._send($.bind(t))}execute(t){this._send($.execute(t))}flush(){this.stream.writable&&this.stream.write(d_)}sync(){this._ending=!0,this._send(u_)}ref(){this.stream.ref()}unref(){this.stream.unref()}end(){if(this._ending=!0,!this._connecting||!this.stream.writable){this.stream.end();return}return this.stream.write(N_,()=>{this.stream.end()})}close(t){this._send($.close(t))}describe(t){this._send($.describe(t))}sendCopyFromChunk(t){this._send($.copyData(t))}endCopyFrom(){this._send($.copyDone())}sendCopyFail(t){this._send($.copyFail(t))}};La.exports=Ss});var Aa=h((gc,Oe)=>{"use strict";var va=B("path"),p_=B("stream").Stream,T_=B("readline").createInterface,fa=B("util"),m_=5432,ft=process.platform==="win32",rt=process.stderr,R_=56,h_=7,I_=61440,b_=32768;function O_(e){return(e&I_)==b_}var Be=["host","port","database","user","password"],ys=Be.length,L_=Be[ys-1];function Ds(){var e=rt instanceof p_&&rt.writable===!0;if(e){var t=Array.prototype.slice.call(arguments).concat(`
`);rt.write(fa.format.apply(fa,t))}}Object.defineProperty(Oe.exports,"isWin",{get:function(){return ft},set:function(e){ft=e}});Oe.exports.warnTo=function(e){var t=rt;return rt=e,t};Oe.exports.getFileName=function(e){var t=e||process.env,s=t.PGPASSFILE||(ft?va.join(t.APPDATA||"./","postgresql","pgpass.conf"):va.join(t.HOME||"./",".pgpass"));return s};Oe.exports.usePgPass=function(e,t){return Object.prototype.hasOwnProperty.call(process.env,"PGPASSWORD")?!1:ft?!0:(t=t||"<unkn>",O_(e.mode)?e.mode&(R_|h_)?(Ds('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less',t),!1):!0:(Ds('WARNING: password file "%s" is not a plain file',t),!1))};var v_=Oe.exports.match=function(e,t){return Be.slice(0,-1).reduce(function(s,i,a){return a==1&&Number(e[i]||m_)===Number(t[i])?s&&!0:s&&(t[i]==="*"||t[i]===e[i])},!0)};Oe.exports.getPassword=function(e,t,s){var i,a=!1,r=T_({input:t,crlfDelay:1/0});function n(c){a=!0,t.destroy(),s(c)}function o(c){var l=f_(c);l&&A_(l)&&v_(e,l)&&(i=l[L_],r.close())}var E=function(){a||n(i)},_=function(c){a||(Ds("WARNING: error on reading file: %s",c),n(void 0))};t.on("error",_),r.on("line",o).on("close",E).on("error",_)};var f_=Oe.exports.parseLine=function(e){if(e.length<11||e.match(/^\s+#/))return null;for(var t="",s="",i=0,a=0,r=0,n={},o=!1,E=function(c,l,d){var u=e.substring(l,d);Object.hasOwnProperty.call(process.env,"PGPASS_NO_DEESCAPE")||(u=u.replace(/\\([:\\])/g,"$1")),n[Be[c]]=u},_=0;_<e.length-1;_+=1){if(t=e.charAt(_+1),s=e.charAt(_),o=i==ys-1,o){E(i,a);break}_>=0&&t==":"&&s!=="\\"&&(E(i,a,_+1),a=_+2,i+=1)}return n=Object.keys(n).length===ys?n:null,n},A_=Oe.exports.isValidEntry=function(e){for(var t={0:function(n){return n.length>0},1:function(n){return n==="*"?!0:(n=Number(n),isFinite(n)&&n>0&&n<9007199254740992&&Math.floor(n)===n)},2:function(n){return n.length>0},3:function(n){return n.length>0},4:function(n){return n.length>0}},s=0;s<Be.length;s+=1){var i=t[s],a=e[Be[s]]||"",r=i(a);if(!r)return!1}return!0}});var ga=h((Dc,Cs)=>{"use strict";var yc=B("path"),Sa=B("fs"),At=Aa();Cs.exports=function(e,t){var s=At.getFileName();Sa.stat(s,function(i,a){if(i||!At.usePgPass(a,s))return t(void 0);var r=Sa.createReadStream(s);At.getPassword(e,r,t)})};Cs.exports.warnTo=At.warnTo});var Fa=h((Cc,Ca)=>{"use strict";var S_=B("events").EventEmitter,ya=it(),Fs=Xi(),g_=Qt(),y_=ts(),Da=ca(),D_=st(),C_=gs(),F_=zt(),St=class extends S_{constructor(t){super(),this.connectionParameters=new y_(t),this.user=this.connectionParameters.user,this.database=this.connectionParameters.database,this.port=this.connectionParameters.port,this.host=this.connectionParameters.host,Object.defineProperty(this,"password",{configurable:!0,enumerable:!1,writable:!0,value:this.connectionParameters.password}),this.replication=this.connectionParameters.replication;var s=t||{};this._Promise=s.Promise||global.Promise,this._types=new g_(s.types),this._ending=!1,this._ended=!1,this._connecting=!1,this._connected=!1,this._connectionError=!1,this._queryable=!0,this.connection=s.connection||new C_({stream:s.stream,ssl:this.connectionParameters.ssl,keepAlive:s.keepAlive||!1,keepAliveInitialDelayMillis:s.keepAliveInitialDelayMillis||0,encoding:this.connectionParameters.client_encoding||"utf8"}),this.queryQueue=[],this.binary=s.binary||D_.binary,this.processID=null,this.secretKey=null,this.ssl=this.connectionParameters.ssl||!1,this.ssl&&this.ssl.key&&Object.defineProperty(this.ssl,"key",{enumerable:!1}),this._connectionTimeoutMillis=s.connectionTimeoutMillis||0}_errorAllQueries(t){let s=i=>{process.nextTick(()=>{i.handleError(t,this.connection)})};this.activeQuery&&(s(this.activeQuery),this.activeQuery=null),this.queryQueue.forEach(s),this.queryQueue.length=0}_connect(t){var s=this,i=this.connection;if(this._connectionCallback=t,this._connecting||this._connected){let a=new Error("Client has already been connected. You cannot reuse a client.");process.nextTick(()=>{t(a)});return}this._connecting=!0,this._connectionTimeoutMillis>0&&(this.connectionTimeoutHandle=setTimeout(()=>{i._ending=!0,i.stream.destroy(new Error("timeout expired"))},this._connectionTimeoutMillis)),this.host&&this.host.indexOf("/")===0?i.connect(this.host+"/.s.PGSQL."+this.port):i.connect(this.port,this.host),i.on("connect",function(){s.ssl?i.requestSsl():i.startup(s.getStartupConf())}),i.on("sslconnect",function(){i.startup(s.getStartupConf())}),this._attachListeners(i),i.once("end",()=>{let a=this._ending?new Error("Connection terminated"):new Error("Connection terminated unexpectedly");clearTimeout(this.connectionTimeoutHandle),this._errorAllQueries(a),this._ended=!0,this._ending||(this._connecting&&!this._connectionError?this._connectionCallback?this._connectionCallback(a):this._handleErrorEvent(a):this._connectionError||this._handleErrorEvent(a)),process.nextTick(()=>{this.emit("end")})})}connect(t){if(t){this._connect(t);return}return new this._Promise((s,i)=>{this._connect(a=>{a?i(a):s()})})}_attachListeners(t){t.on("authenticationCleartextPassword",this._handleAuthCleartextPassword.bind(this)),t.on("authenticationMD5Password",this._handleAuthMD5Password.bind(this)),t.on("authenticationSASL",this._handleAuthSASL.bind(this)),t.on("authenticationSASLContinue",this._handleAuthSASLContinue.bind(this)),t.on("authenticationSASLFinal",this._handleAuthSASLFinal.bind(this)),t.on("backendKeyData",this._handleBackendKeyData.bind(this)),t.on("error",this._handleErrorEvent.bind(this)),t.on("errorMessage",this._handleErrorMessage.bind(this)),t.on("readyForQuery",this._handleReadyForQuery.bind(this)),t.on("notice",this._handleNotice.bind(this)),t.on("rowDescription",this._handleRowDescription.bind(this)),t.on("dataRow",this._handleDataRow.bind(this)),t.on("portalSuspended",this._handlePortalSuspended.bind(this)),t.on("emptyQuery",this._handleEmptyQuery.bind(this)),t.on("commandComplete",this._handleCommandComplete.bind(this)),t.on("parseComplete",this._handleParseComplete.bind(this)),t.on("copyInResponse",this._handleCopyInResponse.bind(this)),t.on("copyData",this._handleCopyData.bind(this)),t.on("notification",this._handleNotification.bind(this))}_checkPgPass(t){let s=this.connection;if(typeof this.password=="function")this._Promise.resolve().then(()=>this.password()).then(i=>{if(i!==void 0){if(typeof i!="string"){s.emit("error",new TypeError("Password must be a string"));return}this.connectionParameters.password=this.password=i}else this.connectionParameters.password=this.password=null;t()}).catch(i=>{s.emit("error",i)});else if(this.password!==null)t();else try{ga()(this.connectionParameters,a=>{a!==void 0&&(this.connectionParameters.password=this.password=a),t()})}catch(i){this.emit("error",i)}}_handleAuthCleartextPassword(t){this._checkPgPass(()=>{this.connection.password(this.password)})}_handleAuthMD5Password(t){this._checkPgPass(async()=>{try{let s=await F_.postgresMd5PasswordHash(this.user,this.password,t.salt);this.connection.password(s)}catch(s){this.emit("error",s)}})}_handleAuthSASL(t){this._checkPgPass(()=>{try{this.saslSession=Fs.startSession(t.mechanisms),this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism,this.saslSession.response)}catch(s){this.connection.emit("error",s)}})}async _handleAuthSASLContinue(t){try{await Fs.continueSession(this.saslSession,this.password,t.data),this.connection.sendSCRAMClientFinalMessage(this.saslSession.response)}catch(s){this.connection.emit("error",s)}}_handleAuthSASLFinal(t){try{Fs.finalizeSession(this.saslSession,t.data),this.saslSession=null}catch(s){this.connection.emit("error",s)}}_handleBackendKeyData(t){this.processID=t.processID,this.secretKey=t.secretKey}_handleReadyForQuery(t){this._connecting&&(this._connecting=!1,this._connected=!0,clearTimeout(this.connectionTimeoutHandle),this._connectionCallback&&(this._connectionCallback(null,this),this._connectionCallback=null),this.emit("connect"));let{activeQuery:s}=this;this.activeQuery=null,this.readyForQuery=!0,s&&s.handleReadyForQuery(this.connection),this._pulseQueryQueue()}_handleErrorWhileConnecting(t){if(!this._connectionError){if(this._connectionError=!0,clearTimeout(this.connectionTimeoutHandle),this._connectionCallback)return this._connectionCallback(t);this.emit("error",t)}}_handleErrorEvent(t){if(this._connecting)return this._handleErrorWhileConnecting(t);this._queryable=!1,this._errorAllQueries(t),this.emit("error",t)}_handleErrorMessage(t){if(this._connecting)return this._handleErrorWhileConnecting(t);let s=this.activeQuery;if(!s){this._handleErrorEvent(t);return}this.activeQuery=null,s.handleError(t,this.connection)}_handleRowDescription(t){this.activeQuery.handleRowDescription(t)}_handleDataRow(t){this.activeQuery.handleDataRow(t)}_handlePortalSuspended(t){this.activeQuery.handlePortalSuspended(this.connection)}_handleEmptyQuery(t){this.activeQuery.handleEmptyQuery(this.connection)}_handleCommandComplete(t){if(this.activeQuery==null){let s=new Error("Received unexpected commandComplete message from backend.");this._handleErrorEvent(s);return}this.activeQuery.handleCommandComplete(t,this.connection)}_handleParseComplete(){if(this.activeQuery==null){let t=new Error("Received unexpected parseComplete message from backend.");this._handleErrorEvent(t);return}this.activeQuery.name&&(this.connection.parsedStatements[this.activeQuery.name]=this.activeQuery.text)}_handleCopyInResponse(t){this.activeQuery.handleCopyInResponse(this.connection)}_handleCopyData(t){this.activeQuery.handleCopyData(t,this.connection)}_handleNotification(t){this.emit("notification",t)}_handleNotice(t){this.emit("notice",t)}getStartupConf(){var t=this.connectionParameters,s={user:t.user,database:t.database},i=t.application_name||t.fallback_application_name;return i&&(s.application_name=i),t.replication&&(s.replication=""+t.replication),t.statement_timeout&&(s.statement_timeout=String(parseInt(t.statement_timeout,10))),t.lock_timeout&&(s.lock_timeout=String(parseInt(t.lock_timeout,10))),t.idle_in_transaction_session_timeout&&(s.idle_in_transaction_session_timeout=String(parseInt(t.idle_in_transaction_session_timeout,10))),t.options&&(s.options=t.options),s}cancel(t,s){if(t.activeQuery===s){var i=this.connection;this.host&&this.host.indexOf("/")===0?i.connect(this.host+"/.s.PGSQL."+this.port):i.connect(this.port,this.host),i.on("connect",function(){i.cancel(t.processID,t.secretKey)})}else t.queryQueue.indexOf(s)!==-1&&t.queryQueue.splice(t.queryQueue.indexOf(s),1)}setTypeParser(t,s,i){return this._types.setTypeParser(t,s,i)}getTypeParser(t,s){return this._types.getTypeParser(t,s)}escapeIdentifier(t){return ya.escapeIdentifier(t)}escapeLiteral(t){return ya.escapeLiteral(t)}_pulseQueryQueue(){if(this.readyForQuery===!0)if(this.activeQuery=this.queryQueue.shift(),this.activeQuery){this.readyForQuery=!1,this.hasExecuted=!0;let t=this.activeQuery.submit(this.connection);t&&process.nextTick(()=>{this.activeQuery.handleError(t,this.connection),this.readyForQuery=!0,this._pulseQueryQueue()})}else this.hasExecuted&&(this.activeQuery=null,this.emit("drain"))}query(t,s,i){var a,r,n,o,E;if(t==null)throw new TypeError("Client was passed a null or undefined query");return typeof t.submit=="function"?(n=t.query_timeout||this.connectionParameters.query_timeout,r=a=t,typeof s=="function"&&(a.callback=a.callback||s)):(n=t.query_timeout||this.connectionParameters.query_timeout,a=new Da(t,s,i),a.callback||(r=new this._Promise((_,c)=>{a.callback=(l,d)=>l?c(l):_(d)}).catch(_=>{throw Error.captureStackTrace(_),_}))),n&&(E=a.callback,o=setTimeout(()=>{var _=new Error("Query read timeout");process.nextTick(()=>{a.handleError(_,this.connection)}),E(_),a.callback=()=>{};var c=this.queryQueue.indexOf(a);c>-1&&this.queryQueue.splice(c,1),this._pulseQueryQueue()},n),a.callback=(_,c)=>{clearTimeout(o),E(_,c)}),this.binary&&!a.binary&&(a.binary=!0),a._result&&!a._result._types&&(a._result._types=this._types),this._queryable?this._ending?(process.nextTick(()=>{a.handleError(new Error("Client was closed and is not queryable"),this.connection)}),r):(this.queryQueue.push(a),this._pulseQueryQueue(),r):(process.nextTick(()=>{a.handleError(new Error("Client has encountered a connection error and is not queryable"),this.connection)}),r)}ref(){this.connection.ref()}unref(){this.connection.unref()}end(t){if(this._ending=!0,!this.connection._connecting||this._ended)if(t)t();else return this._Promise.resolve();if(this.activeQuery||!this._queryable?this.connection.stream.destroy():this.connection.end(),t)this.connection.once("end",t);else return new this._Promise(s=>{this.connection.once("end",s)})}};St.Query=Da;Ca.exports=St});var Pa=h((Fc,Ua)=>{"use strict";var j_=B("events").EventEmitter,js=function(){},ja=(e,t)=>{let s=e.findIndex(t);return s===-1?void 0:e.splice(s,1)[0]},Us=class{constructor(t,s,i){this.client=t,this.idleListener=s,this.timeoutId=i}},qe=class{constructor(t){this.callback=t}};function U_(){throw new Error("Release called on client which has already been released to the pool.")}function gt(e,t){if(t)return{callback:t,result:void 0};let s,i,a=function(n,o){n?s(n):i(o)},r=new e(function(n,o){i=n,s=o}).catch(n=>{throw Error.captureStackTrace(n),n});return{callback:a,result:r}}function P_(e,t){return function s(i){i.client=t,t.removeListener("error",s),t.on("error",()=>{e.log("additional client error after disconnection due to error",i)}),e._remove(t),e.emit("error",i,t)}}var Ps=class extends j_{constructor(t,s){super(),this.options=Object.assign({},t),t!=null&&"password"in t&&Object.defineProperty(this.options,"password",{configurable:!0,enumerable:!1,writable:!0,value:t.password}),t!=null&&t.ssl&&t.ssl.key&&Object.defineProperty(this.options.ssl,"key",{enumerable:!1}),this.options.max=this.options.max||this.options.poolSize||10,this.options.min=this.options.min||0,this.options.maxUses=this.options.maxUses||1/0,this.options.allowExitOnIdle=this.options.allowExitOnIdle||!1,this.options.maxLifetimeSeconds=this.options.maxLifetimeSeconds||0,this.log=this.options.log||function(){},this.Client=this.options.Client||s||Hs().Client,this.Promise=this.options.Promise||global.Promise,typeof this.options.idleTimeoutMillis>"u"&&(this.options.idleTimeoutMillis=1e4),this._clients=[],this._idle=[],this._expired=new WeakSet,this._pendingQueue=[],this._endCallback=void 0,this.ending=!1,this.ended=!1}_promiseTry(t){let s=this.Promise;return typeof s.try=="function"?s.try(t):new s(i=>i(t()))}_isFull(){return this._clients.length>=this.options.max}_isAboveMin(){return this._clients.length>this.options.min}_pulseQueue(){if(this.log("pulse queue"),this.ended){this.log("pulse queue ended");return}if(this.ending){this.log("pulse queue on ending"),this._idle.length&&this._idle.slice().map(s=>{this._remove(s.client)}),this._clients.length||(this.ended=!0,this._endCallback());return}if(!this._pendingQueue.length){this.log("no queued requests");return}if(!this._idle.length&&this._isFull())return;let t=this._pendingQueue.shift();if(this._idle.length){let s=this._idle.pop();clearTimeout(s.timeoutId);let i=s.client;i.ref&&i.ref();let a=s.idleListener;return this._acquireClient(i,t,a,!1)}if(!this._isFull())return this.newClient(t);throw new Error("unexpected condition")}_remove(t,s){let i=ja(this._idle,r=>r.client===t);i!==void 0&&clearTimeout(i.timeoutId),this._clients=this._clients.filter(r=>r!==t);let a=this;t.end(()=>{a.emit("remove",t),typeof s=="function"&&s()})}connect(t){if(this.ending){let a=new Error("Cannot use a pool after calling end on the pool");return t?t(a):this.Promise.reject(a)}let s=gt(this.Promise,t),i=s.result;if(this._isFull()||this._idle.length){if(this._idle.length&&process.nextTick(()=>this._pulseQueue()),!this.options.connectionTimeoutMillis)return this._pendingQueue.push(new qe(s.callback)),i;let a=(o,E,_)=>{clearTimeout(n),s.callback(o,E,_)},r=new qe(a),n=setTimeout(()=>{ja(this._pendingQueue,o=>o.callback===a),r.timedOut=!0,s.callback(new Error("timeout exceeded when trying to connect"))},this.options.connectionTimeoutMillis);return n.unref&&n.unref(),this._pendingQueue.push(r),i}return this.newClient(new qe(s.callback)),i}newClient(t){let s=new this.Client(this.options);this._clients.push(s);let i=P_(this,s);this.log("checking client timeout");let a,r=!1;this.options.connectionTimeoutMillis&&(a=setTimeout(()=>{s.connection?(this.log("ending client due to timeout"),r=!0,s.connection.stream.destroy()):s.isConnected()||(this.log("ending client due to timeout"),r=!0,s.end())},this.options.connectionTimeoutMillis)),this.log("connecting new client"),s.connect(n=>{if(a&&clearTimeout(a),s.on("error",i),n)this.log("client failed to connect",n),this._clients=this._clients.filter(o=>o!==s),r&&(n=new Error("Connection terminated due to connection timeout",{cause:n})),this._pulseQueue(),t.timedOut||t.callback(n,void 0,js);else{if(this.log("new client connected"),this.options.onConnect){this._promiseTry(()=>this.options.onConnect(s)).then(()=>{this._afterConnect(s,t,i)},o=>{this._clients=this._clients.filter(E=>E!==s),s.end(()=>{this._pulseQueue(),t.timedOut||t.callback(o,void 0,js)})});return}return this._afterConnect(s,t,i)}})}_afterConnect(t,s,i){if(this.options.maxLifetimeSeconds!==0){let a=setTimeout(()=>{this.log("ending client due to expired lifetime"),this._expired.add(t),this._idle.findIndex(n=>n.client===t)!==-1&&this._acquireClient(t,new qe((n,o,E)=>E()),i,!1)},this.options.maxLifetimeSeconds*1e3);a.unref(),t.once("end",()=>clearTimeout(a))}return this._acquireClient(t,s,i,!0)}_acquireClient(t,s,i,a){a&&this.emit("connect",t),this.emit("acquire",t),t.release=this._releaseOnce(t,i),t.removeListener("error",i),s.timedOut?a&&this.options.verify?this.options.verify(t,t.release):t.release():a&&this.options.verify?this.options.verify(t,r=>{if(r)return t.release(r),s.callback(r,void 0,js);s.callback(void 0,t,t.release)}):s.callback(void 0,t,t.release)}_releaseOnce(t,s){let i=!1;return a=>{i&&U_(),i=!0,this._release(t,s,a)}}_release(t,s,i){if(t.on("error",s),t._poolUseCount=(t._poolUseCount||0)+1,this.emit("release",i,t),i||this.ending||!t._queryable||t._ending||t._poolUseCount>=this.options.maxUses)return t._poolUseCount>=this.options.maxUses&&this.log("remove expended client"),this._remove(t,this._pulseQueue.bind(this));if(this._expired.has(t))return this.log("remove expired client"),this._expired.delete(t),this._remove(t,this._pulseQueue.bind(this));let r;this.options.idleTimeoutMillis&&this._isAboveMin()&&(r=setTimeout(()=>{this._isAboveMin()&&(this.log("remove idle client"),this._remove(t,this._pulseQueue.bind(this)))},this.options.idleTimeoutMillis),this.options.allowExitOnIdle&&r.unref()),this.options.allowExitOnIdle&&t.unref(),this._idle.push(new Us(t,s,r)),this._pulseQueue()}query(t,s,i){if(typeof t=="function"){let r=gt(this.Promise,t);return setImmediate(function(){return r.callback(new Error("Passing a function as the first parameter to pool.query is not supported"))}),r.result}typeof s=="function"&&(i=s,s=void 0);let a=gt(this.Promise,i);return i=a.callback,this.connect((r,n)=>{if(r)return i(r);let o=!1,E=_=>{o||(o=!0,n.release(_),i(_))};n.once("error",E),this.log("dispatching query");try{n.query(t,s,(_,c)=>{if(this.log("query dispatched"),n.removeListener("error",E),!o)return o=!0,n.release(_),_?i(_):i(void 0,c)})}catch(_){return n.release(_),i(_)}}),a.result}end(t){if(this.log("ending"),this.ending){let i=new Error("Called end on pool more than once");return t?t(i):this.Promise.reject(i)}this.ending=!0;let s=gt(this.Promise,t);return this._endCallback=s.callback,this._pulseQueue(),s.result}get waitingCount(){return this._pendingQueue.length}get idleCount(){return this._idle.length}get expiredCount(){return this._clients.reduce((t,s)=>t+(this._expired.has(s)?1:0),0)}get totalCount(){return this._clients.length}};Ua.exports=Ps});var Ma=h((jc,wa)=>{"use strict";var Ha=B("events").EventEmitter,H_=B("util"),ws=it(),Ge=wa.exports=function(e,t,s){Ha.call(this),e=ws.normalizeQueryConfig(e,t,s),this.text=e.text,this.values=e.values,this.name=e.name,this.queryMode=e.queryMode,this.callback=e.callback,this.state="new",this._arrayMode=e.rowMode==="array",this._emitRowEvents=!1,this.on("newListener",function(i){i==="row"&&(this._emitRowEvents=!0)}.bind(this))};H_.inherits(Ge,Ha);var w_={sqlState:"code",statementPosition:"position",messagePrimary:"message",context:"where",schemaName:"schema",tableName:"table",columnName:"column",dataTypeName:"dataType",constraintName:"constraint",sourceFile:"file",sourceLine:"line",sourceFunction:"routine"};Ge.prototype.handleError=function(e){var t=this.native.pq.resultErrorFields();if(t)for(var s in t){var i=w_[s]||s;e[i]=t[s]}this.callback?this.callback(e):this.emit("error",e),this.state="error"};Ge.prototype.then=function(e,t){return this._getPromise().then(e,t)};Ge.prototype.catch=function(e){return this._getPromise().catch(e)};Ge.prototype._getPromise=function(){return this._promise?this._promise:(this._promise=new Promise(function(e,t){this._once("end",e),this._once("error",t)}.bind(this)),this._promise)};Ge.prototype.submit=function(e){this.state="running";var t=this;this.native=e.native,e.native.arrayMode=this._arrayMode;var s=function(r,n,o){if(e.native.arrayMode=!1,setImmediate(function(){t.emit("_done")}),r)return t.handleError(r);t._emitRowEvents&&(o.length>1?n.forEach((E,_)=>{E.forEach(c=>{t.emit("row",c,o[_])})}):n.forEach(function(E){t.emit("row",E,o)})),t.state="end",t.emit("end",o),t.callback&&t.callback(null,o)};if(process.domain&&(s=process.domain.bind(s)),this.name){this.name.length>63&&(console.error("Warning! Postgres only supports 63 characters for query names."),console.error("You supplied %s (%s)",this.name,this.name.length),console.error("This can cause conflicts and silent errors executing queries"));var i=(this.values||[]).map(ws.prepareValue);if(e.namedQueries[this.name]){if(this.text&&e.namedQueries[this.name]!==this.text){let r=new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);return s(r)}return e.native.execute(this.name,i,s)}return e.native.prepare(this.name,this.text,i.length,function(r){return r?s(r):(e.namedQueries[t.name]=t.text,t.native.execute(t.name,i,s))})}else if(this.values){if(!Array.isArray(this.values)){let r=new Error("Query values must be an array");return s(r)}var a=this.values.map(ws.prepareValue);e.native.query(this.text,a,s)}else this.queryMode==="extended"?e.native.query(this.text,[],s):e.native.query(this.text,s)}});var qa=h((Uc,Ba)=>{"use strict";var ka;try{ka=B("pg-native")}catch(e){throw e}var M_=Qt(),xa=B("events").EventEmitter,k_=B("util"),x_=ts(),Wa=Ma(),ne=Ba.exports=function(e){xa.call(this),e=e||{},this._Promise=e.Promise||global.Promise,this._types=new M_(e.types),this.native=new ka({types:this._types}),this._queryQueue=[],this._ending=!1,this._connecting=!1,this._connected=!1,this._queryable=!0;var t=this.connectionParameters=new x_(e);e.nativeConnectionString&&(t.nativeConnectionString=e.nativeConnectionString),this.user=t.user,Object.defineProperty(this,"password",{configurable:!0,enumerable:!1,writable:!0,value:t.password}),this.database=t.database,this.host=t.host,this.port=t.port,this.namedQueries={}};ne.Query=Wa;k_.inherits(ne,xa);ne.prototype._errorAllQueries=function(e){let t=s=>{process.nextTick(()=>{s.native=this.native,s.handleError(e)})};this._hasActiveQuery()&&(t(this._activeQuery),this._activeQuery=null),this._queryQueue.forEach(t),this._queryQueue.length=0};ne.prototype._connect=function(e){var t=this;if(this._connecting){process.nextTick(()=>e(new Error("Client has already been connected. You cannot reuse a client.")));return}this._connecting=!0,this.connectionParameters.getLibpqConnectionString(function(s,i){if(t.connectionParameters.nativeConnectionString&&(i=t.connectionParameters.nativeConnectionString),s)return e(s);t.native.connect(i,function(a){if(a)return t.native.end(),e(a);t._connected=!0,t.native.on("error",function(r){t._queryable=!1,t._errorAllQueries(r),t.emit("error",r)}),t.native.on("notification",function(r){t.emit("notification",{channel:r.relname,payload:r.extra})}),t.emit("connect"),t._pulseQueryQueue(!0),e()})})};ne.prototype.connect=function(e){if(e){this._connect(e);return}return new this._Promise((t,s)=>{this._connect(i=>{i?s(i):t()})})};ne.prototype.query=function(e,t,s){var i,a,r,n,o;if(e==null)throw new TypeError("Client was passed a null or undefined query");if(typeof e.submit=="function")r=e.query_timeout||this.connectionParameters.query_timeout,a=i=e,typeof t=="function"&&(e.callback=t);else if(r=e.query_timeout||this.connectionParameters.query_timeout,i=new Wa(e,t,s),!i.callback){let E,_;a=new this._Promise((c,l)=>{E=c,_=l}).catch(c=>{throw Error.captureStackTrace(c),c}),i.callback=(c,l)=>c?_(c):E(l)}return r&&(o=i.callback,n=setTimeout(()=>{var E=new Error("Query read timeout");process.nextTick(()=>{i.handleError(E,this.connection)}),o(E),i.callback=()=>{};var _=this._queryQueue.indexOf(i);_>-1&&this._queryQueue.splice(_,1),this._pulseQueryQueue()},r),i.callback=(E,_)=>{clearTimeout(n),o(E,_)}),this._queryable?this._ending?(i.native=this.native,process.nextTick(()=>{i.handleError(new Error("Client was closed and is not queryable"))}),a):(this._queryQueue.push(i),this._pulseQueryQueue(),a):(i.native=this.native,process.nextTick(()=>{i.handleError(new Error("Client has encountered a connection error and is not queryable"))}),a)};ne.prototype.end=function(e){var t=this;this._ending=!0,this._connected||this.once("connect",this.end.bind(this,e));var s;return e||(s=new this._Promise(function(i,a){e=r=>r?a(r):i()})),this.native.end(function(){t._errorAllQueries(new Error("Connection terminated")),process.nextTick(()=>{t.emit("end"),e&&e()})}),s};ne.prototype._hasActiveQuery=function(){return this._activeQuery&&this._activeQuery.state!=="error"&&this._activeQuery.state!=="end"};ne.prototype._pulseQueryQueue=function(e){if(this._connected&&!this._hasActiveQuery()){var t=this._queryQueue.shift();if(!t){e||this.emit("drain");return}this._activeQuery=t,t.submit(this);var s=this;t.once("_done",function(){s._pulseQueryQueue()})}};ne.prototype.cancel=function(e){this._activeQuery===e?this.native.cancel(function(){}):this._queryQueue.indexOf(e)!==-1&&this._queryQueue.splice(this._queryQueue.indexOf(e),1)};ne.prototype.ref=function(){};ne.prototype.unref=function(){};ne.prototype.setTypeParser=function(e,t,s){return this._types.setTypeParser(e,t,s)};ne.prototype.getTypeParser=function(e,t){return this._types.getTypeParser(e,t)}});var Ms=h((Pc,Ga)=>{"use strict";Ga.exports=qa()});var Hs=h((wc,nt)=>{"use strict";var W_=Fa(),B_=st(),q_=gs(),G_=Pa(),{DatabaseError:Y_}=fs(),{escapeIdentifier:$_,escapeLiteral:K_}=it(),V_=e=>class extends G_{constructor(s){super(s,e)}},ks=function(e){this.defaults=B_,this.Client=e,this.Query=this.Client.Query,this.Pool=V_(this.Client),this._pools=[],this.Connection=q_,this.types=tt(),this.DatabaseError=Y_,this.escapeIdentifier=$_,this.escapeLiteral=K_};typeof process.env.NODE_PG_FORCE_NATIVE<"u"?nt.exports=new ks(Ms()):(nt.exports=new ks(W_),Object.defineProperty(nt.exports,"native",{configurable:!0,enumerable:!1,get(){var e=null;try{e=new ks(Ms())}catch(t){if(t.code!=="MODULE_NOT_FOUND")throw t}return Object.defineProperty(nt.exports,"native",{value:e}),e}}))});import{createHash as ME,randomUUID as kE}from"node:crypto";import{gzipSync as xE}from"node:zlib";var er=kr(Hs(),1);var Ya=`-- JAIN STOCK EXCHANGE (JSE) v272
-- 001_schema.sql: tables, constraints, indexes and compatibility views.
-- Money is stored as numeric(\u2026,2) rupees. Prices are whole rupees by default (price_tick).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now(),
  checksum text
);

-- ---------------------------------------------------------------------------
-- Event configuration and control (single rows)
-- ---------------------------------------------------------------------------
CREATE TABLE event_config (
  id                       smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  event_name               text NOT NULL DEFAULT 'DALAL STREET 2026',
  initial_capital          numeric(16,2) NOT NULL DEFAULT 2000000 CHECK (initial_capital > 0),
  institutional_cash       numeric(16,2) NOT NULL DEFAULT 20000000 CHECK (institutional_cash >= 0),
  brokerage_rate           numeric(8,6)  NOT NULL DEFAULT 0.005 CHECK (brokerage_rate >= 0 AND brokerage_rate < 1),
  stock_lot_size           integer NOT NULL DEFAULT 50 CHECK (stock_lot_size > 0),
  ipo_lot_size             integer NOT NULL DEFAULT 50 CHECK (ipo_lot_size > 0),
  price_tick               numeric(8,2)  NOT NULL DEFAULT 1 CHECK (price_tick > 0),
  min_order_value          numeric(16,2) NOT NULL DEFAULT 1 CHECK (min_order_value >= 0),
  max_order_value          numeric(16,2) NOT NULL DEFAULT 5000000 CHECK (max_order_value > 0),
  max_price_move_pct       numeric(6,2)  NOT NULL DEFAULT 10 CHECK (max_price_move_pct > 0 AND max_price_move_pct <= 100),
  loan_max_principal       numeric(16,2) NOT NULL DEFAULT 500000 CHECK (loan_max_principal >= 0),
  loan_interest_rate       numeric(8,6)  NOT NULL DEFAULT 0.02 CHECK (loan_interest_rate >= 0 AND loan_interest_rate < 1),
  min_cash_buffer          numeric(16,2) NOT NULL DEFAULT 20000 CHECK (min_cash_buffer >= 0),
  cash_rule_limit          numeric(16,2) NOT NULL DEFAULT 50000 CHECK (cash_rule_limit >= 0),
  loans_enabled            boolean NOT NULL DEFAULT true,
  auto_loan_on_settlement  boolean NOT NULL DEFAULT true,
  participant_order_entry  boolean NOT NULL DEFAULT false,
  institution_overdraft    boolean NOT NULL DEFAULT true,
  institution_brokerage    boolean NOT NULL DEFAULT false,
  updated_at               timestamptz NOT NULL DEFAULT now(),
  updated_by               text
);

CREATE TABLE event_control (
  id                 smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  status             text NOT NULL DEFAULT 'NOT_STARTED'
                     CHECK (status IN ('NOT_STARTED','LIVE','SETTLEMENT_ONLY','CLOSED','FINALIZED')),
  started_at         timestamptz,
  paused_at          timestamptz,
  closed_at          timestamptz,
  finalized_at       timestamptz,
  status_changed_at  timestamptz NOT NULL DEFAULT now(),
  status_changed_by  text,
  reset_count        integer NOT NULL DEFAULT 0,
  last_reset_at      timestamptz,
  market_updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Participants, brokers, institutions, securities
-- ---------------------------------------------------------------------------
CREATE TABLE brokers (
  id          serial PRIMARY KEY,
  code        text NOT NULL UNIQUE,
  name        text NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE teams (
  id                               serial PRIMARY KEY,
  code                             text NOT NULL UNIQUE CHECK (code ~ '^TEAM-[0-9]{3}$'),
  seq                              integer GENERATED ALWAYS AS ((substring(code from 6))::integer) STORED,
  name                             text NOT NULL,
  section                          text,
  members                          text,
  broker_id                        integer REFERENCES brokers(id),
  cash                             numeric(16,2) NOT NULL CHECK (cash >= 0),
  realized_pnl                     numeric(16,2) NOT NULL DEFAULT 0,
  brokerage_paid                   numeric(16,2) NOT NULL DEFAULT 0 CHECK (brokerage_paid >= 0),
  short_sell_attempts              integer NOT NULL DEFAULT 0 CHECK (short_sell_attempts >= 0),
  cash_shortfall_attempts          integer NOT NULL DEFAULT 0 CHECK (cash_shortfall_attempts >= 0),
  insufficient_balance_rejections  integer NOT NULL DEFAULT 0 CHECK (insufficient_balance_rejections >= 0),
  active                           boolean NOT NULL DEFAULT true,
  created_at                       timestamptz NOT NULL DEFAULT now(),
  updated_at                       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX teams_seq_uq ON teams(seq);

CREATE TABLE institutions (
  id            serial PRIMARY KEY,
  code          text NOT NULL UNIQUE,
  name          text NOT NULL,
  initial_cash  numeric(16,2) NOT NULL,
  cash          numeric(16,2) NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE securities (
  id              serial PRIMARY KEY,
  kind            text NOT NULL CHECK (kind IN ('EQUITY','IPO')),
  symbol          text NOT NULL UNIQUE,
  name            text NOT NULL,
  sector          text,
  base_price      numeric(12,2) NOT NULL CHECK (base_price > 0),
  price           numeric(12,2) NOT NULL CHECK (price > 0),
  previous_price  numeric(12,2) NOT NULL CHECK (previous_price > 0),
  lot_size        integer NOT NULL DEFAULT 50 CHECK (lot_size > 0),
  display_order   integer NOT NULL DEFAULT 0,
  active          boolean NOT NULL DEFAULT true,
  trade_count     integer NOT NULL DEFAULT 0,
  traded_quantity bigint NOT NULL DEFAULT 0,
  traded_value    numeric(18,2) NOT NULL DEFAULT 0,
  last_trade_at   timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Users and sessions
-- ---------------------------------------------------------------------------
CREATE TABLE app_users (
  id                    serial PRIMARY KEY,
  username              text NOT NULL,
  display_name          text NOT NULL,
  email                 text,
  role                  text NOT NULL CHECK (role IN ('ADMIN','EXCHANGE','BANK','BROKER','INSTITUTIONAL','PARTICIPANT','VIEWER')),
  team_id               integer REFERENCES teams(id),
  broker_id             integer REFERENCES brokers(id),
  institution_id        integer REFERENCES institutions(id),
  password_hash         text NOT NULL,
  active                boolean NOT NULL DEFAULT true,
  must_change_password  boolean NOT NULL DEFAULT false,
  failed_logins         integer NOT NULL DEFAULT 0,
  locked_until          timestamptz,
  last_login_at         timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CHECK (role <> 'PARTICIPANT' OR team_id IS NOT NULL)
);
CREATE UNIQUE INDEX app_users_username_uq ON app_users (lower(username));

CREATE TABLE sessions (
  id            bigserial PRIMARY KEY,
  token_hash    text NOT NULL UNIQUE,
  user_id       integer NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at    timestamptz,
  ip            text,
  user_agent    text
);
CREATE INDEX sessions_user_idx ON sessions(user_id);

-- ---------------------------------------------------------------------------
-- Holdings
-- ---------------------------------------------------------------------------
CREATE TABLE holdings (
  team_id      integer NOT NULL REFERENCES teams(id),
  security_id  integer NOT NULL REFERENCES securities(id),
  quantity     integer NOT NULL CHECK (quantity >= 0),
  cost_basis   numeric(18,4) NOT NULL DEFAULT 0 CHECK (cost_basis >= 0),   -- includes buy brokerage
  trade_cost   numeric(18,4) NOT NULL DEFAULT 0 CHECK (trade_cost >= 0),   -- execution value only
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, security_id)
);
CREATE INDEX holdings_security_idx ON holdings(security_id);

CREATE TABLE institutional_holdings (
  institution_id  integer NOT NULL REFERENCES institutions(id),
  security_id     integer NOT NULL REFERENCES securities(id),
  quantity        integer NOT NULL CHECK (quantity >= 0),
  cost_basis      numeric(18,4) NOT NULL DEFAULT 0 CHECK (cost_basis >= 0),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (institution_id, security_id)
);

-- ---------------------------------------------------------------------------
-- Orders, workflow events, settlements
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
  id                  bigserial PRIMARY KEY,
  order_no            text NOT NULL UNIQUE,
  account_type        text NOT NULL CHECK (account_type IN ('TEAM','INSTITUTION')),
  team_id             integer NOT NULL REFERENCES teams(id),          -- trading team, or counterparty team for institutional orders
  institution_id      integer REFERENCES institutions(id),
  broker_id           integer REFERENCES brokers(id),
  security_id         integer NOT NULL REFERENCES securities(id),
  side                text NOT NULL CHECK (side IN ('BUY','SELL')),
  quantity            integer NOT NULL CHECK (quantity > 0),
  price               numeric(12,2) NOT NULL CHECK (price > 0),
  trade_value         numeric(16,2) NOT NULL CHECK (trade_value > 0),
  brokerage           numeric(16,2) NOT NULL DEFAULT 0 CHECK (brokerage >= 0),
  settlement_amount   numeric(16,2) NOT NULL,
  reference_price     numeric(12,2) NOT NULL,
  status              text NOT NULL DEFAULT 'EXCHANGE_PENDING'
                      CHECK (status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','EXCHANGE_REJECTED','BANK_PENDING','BANK_SETTLED','BANK_REJECTED')),
  short_sell_flag     boolean NOT NULL DEFAULT false,
  cash_shortfall_flag boolean NOT NULL DEFAULT false,
  short_sell_approved boolean NOT NULL DEFAULT false,
  reject_code         text,
  reject_reason       text,
  notes               text,
  pair_ref            text,
  idempotency_key     text UNIQUE,
  created_by          integer REFERENCES app_users(id),
  created_by_name     text,
  created_role        text,
  exchange_by         integer REFERENCES app_users(id),
  exchange_by_name    text,
  exchange_at         timestamptz,
  exchange_note       text,
  bank_claimed_by     integer REFERENCES app_users(id),
  bank_claimed_name   text,
  bank_claimed_at     timestamptz,
  bank_by             integer REFERENCES app_users(id),
  bank_by_name        text,
  bank_at             timestamptz,
  bank_note           text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CHECK ((account_type = 'TEAM' AND institution_id IS NULL) OR (account_type = 'INSTITUTION' AND institution_id IS NOT NULL))
);
CREATE INDEX orders_team_idx        ON orders(team_id, created_at DESC);
CREATE INDEX orders_status_idx      ON orders(status, created_at);
CREATE INDEX orders_created_idx     ON orders(created_at DESC, id DESC);
CREATE INDEX orders_security_idx    ON orders(security_id, created_at DESC);
CREATE INDEX orders_broker_idx      ON orders(broker_id);
CREATE INDEX orders_institution_idx ON orders(institution_id) WHERE institution_id IS NOT NULL;
CREATE INDEX orders_open_idx        ON orders(team_id, security_id, side) WHERE status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING');

CREATE TABLE order_events (
  id          bigserial PRIMARY KEY,
  order_id    bigint NOT NULL REFERENCES orders(id),
  event       text NOT NULL,
  from_status text,
  to_status   text,
  actor_id    integer,
  actor_name  text,
  actor_role  text,
  note        text,
  data        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_events_order_idx ON order_events(order_id, id);

CREATE TABLE settlements (
  id                       bigserial PRIMARY KEY,
  order_id                 bigint NOT NULL REFERENCES orders(id),
  account_type             text NOT NULL,
  team_id                  integer NOT NULL REFERENCES teams(id),
  institution_id           integer REFERENCES institutions(id),
  security_id              integer NOT NULL REFERENCES securities(id),
  side                     text NOT NULL,
  quantity                 integer NOT NULL,
  price                    numeric(12,2) NOT NULL,
  trade_value              numeric(16,2) NOT NULL,
  brokerage                numeric(16,2) NOT NULL,
  team_cash_delta          numeric(16,2) NOT NULL,
  team_cash_before         numeric(16,2) NOT NULL,
  team_cash_after          numeric(16,2) NOT NULL,
  institution_cash_before  numeric(16,2),
  institution_cash_after   numeric(16,2),
  holding_before           integer NOT NULL,
  holding_after            integer NOT NULL,
  cost_moved               numeric(18,4) NOT NULL DEFAULT 0,
  trade_cost_moved         numeric(18,4) NOT NULL DEFAULT 0,
  inst_cost_moved          numeric(18,4) NOT NULL DEFAULT 0,
  realized_pnl             numeric(16,2) NOT NULL DEFAULT 0,
  loan_drawn               numeric(16,2) NOT NULL DEFAULT 0,
  loan_interest            numeric(16,2) NOT NULL DEFAULT 0,
  price_before             numeric(12,2) NOT NULL,
  price_after              numeric(12,2) NOT NULL,
  previous_price_before    numeric(12,2) NOT NULL,
  settled_by               integer,
  settled_by_name          text,
  settled_at               timestamptz NOT NULL DEFAULT now(),
  reversed_at              timestamptz,
  reversed_by_name         text
);
CREATE UNIQUE INDEX settlements_one_active_uq ON settlements(order_id) WHERE reversed_at IS NULL;
CREATE INDEX settlements_team_idx ON settlements(team_id, settled_at DESC);
CREATE INDEX settlements_security_idx ON settlements(security_id, settled_at DESC);

CREATE TABLE broker_commissions (
  id             bigserial PRIMARY KEY,
  order_id       bigint NOT NULL REFERENCES orders(id),
  settlement_id  bigint NOT NULL REFERENCES settlements(id),
  broker_id      integer NOT NULL REFERENCES brokers(id),
  team_id        integer NOT NULL REFERENCES teams(id),
  side           text NOT NULL,
  trade_value    numeric(16,2) NOT NULL,
  rate           numeric(8,6) NOT NULL,
  amount         numeric(16,2) NOT NULL CHECK (amount >= 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  reversed_at    timestamptz
);
CREATE UNIQUE INDEX broker_commissions_one_active_uq ON broker_commissions(order_id) WHERE reversed_at IS NULL;
CREATE INDEX broker_commissions_broker_idx ON broker_commissions(broker_id);

-- ---------------------------------------------------------------------------
-- Cash ledgers (append-only)
-- ---------------------------------------------------------------------------
CREATE TABLE cash_ledger (
  id             bigserial PRIMARY KEY,
  team_id        integer NOT NULL REFERENCES teams(id),
  order_id       bigint REFERENCES orders(id),
  settlement_id  bigint REFERENCES settlements(id),
  entry_type     text NOT NULL CHECK (entry_type IN ('INITIAL_CAPITAL','IPO_ALLOTMENT','BUY','SELL','BROKERAGE','LOAN_DRAW','INTEREST','LOAN_REPAYMENT','REVERSAL','ADJUSTMENT')),
  debit          numeric(16,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit         numeric(16,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  balance_after  numeric(16,2) NOT NULL,
  note           text,
  actor_id       integer,
  actor_name     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cash_ledger_team_idx ON cash_ledger(team_id, created_at, id);
CREATE INDEX cash_ledger_created_idx ON cash_ledger(created_at DESC, id DESC);
CREATE INDEX cash_ledger_order_idx ON cash_ledger(order_id) WHERE order_id IS NOT NULL;

CREATE TABLE institution_ledger (
  id              bigserial PRIMARY KEY,
  institution_id  integer NOT NULL REFERENCES institutions(id),
  order_id        bigint REFERENCES orders(id),
  settlement_id   bigint REFERENCES settlements(id),
  entry_type      text NOT NULL CHECK (entry_type IN ('INITIAL_CAPITAL','BUY','SELL','REVERSAL','ADJUSTMENT')),
  debit           numeric(16,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit          numeric(16,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  balance_after   numeric(16,2) NOT NULL,
  note            text,
  actor_id        integer,
  actor_name      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX institution_ledger_idx ON institution_ledger(institution_id, created_at, id);

-- ---------------------------------------------------------------------------
-- Loans
-- ---------------------------------------------------------------------------
CREATE TABLE loans (
  team_id                integer PRIMARY KEY REFERENCES teams(id),
  original_principal     numeric(16,2) NOT NULL DEFAULT 0 CHECK (original_principal >= 0),
  principal_outstanding  numeric(16,2) NOT NULL DEFAULT 0 CHECK (principal_outstanding >= 0),
  interest_outstanding   numeric(16,2) NOT NULL DEFAULT 0 CHECK (interest_outstanding >= 0),
  interest_charged       numeric(16,2) NOT NULL DEFAULT 0 CHECK (interest_charged >= 0),
  interest_paid          numeric(16,2) NOT NULL DEFAULT 0 CHECK (interest_paid >= 0),
  principal_repaid       numeric(16,2) NOT NULL DEFAULT 0 CHECK (principal_repaid >= 0),
  draws                  integer NOT NULL DEFAULT 0,
  status                 text NOT NULL DEFAULT 'NONE' CHECK (status IN ('NONE','OUTSTANDING','REPAID')),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE loan_transactions (
  id             bigserial PRIMARY KEY,
  team_id        integer NOT NULL REFERENCES teams(id),
  kind           text NOT NULL CHECK (kind IN ('DRAW','INTEREST_CHARGE','INTEREST_REPAYMENT','PRINCIPAL_REPAYMENT','REVERSAL')),
  amount         numeric(16,2) NOT NULL CHECK (amount >= 0),
  order_id       bigint REFERENCES orders(id),
  settlement_id  bigint REFERENCES settlements(id),
  automatic      boolean NOT NULL DEFAULT false,
  note           text,
  actor_id       integer,
  actor_name     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX loan_transactions_team_idx ON loan_transactions(team_id, id);

-- ---------------------------------------------------------------------------
-- Risk tracking
-- ---------------------------------------------------------------------------
CREATE TABLE risk_events (
  id               bigserial PRIMARY KEY,
  team_id          integer NOT NULL REFERENCES teams(id),
  order_id         bigint REFERENCES orders(id),
  security_id      integer REFERENCES securities(id),
  kind             text NOT NULL CHECK (kind IN ('SHORT_SELL_ATTEMPT','CASH_SHORTFALL_ATTEMPT','INSUFFICIENT_BALANCE_REJECTION')),
  stage            text NOT NULL CHECK (stage IN ('ORDER','EXCHANGE','BANK')),
  side             text,
  quantity         integer,
  holding_before   integer,
  required_amount  numeric(16,2),
  available_cash   numeric(16,2),
  shortage         numeric(16,2),
  note             text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX risk_events_order_kind_uq ON risk_events(order_id, kind) WHERE order_id IS NOT NULL;
CREATE INDEX risk_events_team_idx ON risk_events(team_id, kind, created_at DESC);

-- ---------------------------------------------------------------------------
-- Market news, price history
-- ---------------------------------------------------------------------------
CREATE TABLE market_news (
  id               bigserial PRIMARY KEY,
  security_id      integer NOT NULL REFERENCES securities(id),
  mood             text NOT NULL CHECK (mood IN ('VERY_SEVERE','SEVERE','NEGATIVE','NORMAL','POSITIVE','VERY_POSITIVE','SUPER_POSITIVE')),
  headline         text NOT NULL,
  requested_pct    numeric(7,2) NOT NULL,
  applied_pct      numeric(9,4) NOT NULL,
  previous_price   numeric(12,2) NOT NULL,
  new_price        numeric(12,2) NOT NULL,
  prior_previous   numeric(12,2) NOT NULL,
  created_by       integer,
  created_by_name  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  reversed_at      timestamptz
);
CREATE INDEX market_news_security_idx ON market_news(security_id, created_at DESC);
CREATE INDEX market_news_created_idx ON market_news(created_at DESC);

CREATE TABLE price_history (
  id              bigserial PRIMARY KEY,
  security_id     integer NOT NULL REFERENCES securities(id),
  previous_price  numeric(12,2) NOT NULL,
  new_price       numeric(12,2) NOT NULL,
  change_pct      numeric(9,4) NOT NULL,
  source          text NOT NULL CHECK (source IN ('TRADE','MARKET_NEWS','RESET','UNDO','REDO','ADMIN')),
  order_id        bigint REFERENCES orders(id),
  news_id         bigint REFERENCES market_news(id),
  settlement_id   bigint REFERENCES settlements(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX price_history_security_idx ON price_history(security_id, created_at DESC, id DESC);

-- ---------------------------------------------------------------------------
-- IPO allotments (loaded before trading)
-- ---------------------------------------------------------------------------
CREATE TABLE ipo_allotments (
  id               bigserial PRIMARY KEY,
  team_id          integer NOT NULL REFERENCES teams(id),
  security_id      integer NOT NULL REFERENCES securities(id),
  lots             integer NOT NULL CHECK (lots > 0),
  quantity         integer NOT NULL CHECK (quantity > 0),
  price            numeric(12,2) NOT NULL,
  amount           numeric(16,2) NOT NULL,
  batch_id         text,
  created_by       integer,
  created_by_name  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  reversed_at      timestamptz
);
CREATE UNIQUE INDEX ipo_allotments_one_active_uq ON ipo_allotments(team_id, security_id) WHERE reversed_at IS NULL;

-- ---------------------------------------------------------------------------
-- Audit log (append-only) and action journal (undo / redo)
-- ---------------------------------------------------------------------------
CREATE TABLE audit_log (
  id              bigserial PRIMARY KEY,
  actor_id        integer,
  actor_username  text,
  actor_email     text,
  actor_role      text,
  action          text NOT NULL,
  entity          text,
  entity_id       text,
  team_id         integer,
  order_id        bigint,
  before_state    jsonb,
  after_state     jsonb,
  details         jsonb,
  ip              text,
  user_agent      text,
  session_id      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_idx ON audit_log(created_at DESC, id DESC);
CREATE INDEX audit_log_action_idx ON audit_log(action, created_at DESC);
CREATE INDEX audit_log_team_idx ON audit_log(team_id, created_at DESC) WHERE team_id IS NOT NULL;
CREATE INDEX audit_log_order_idx ON audit_log(order_id) WHERE order_id IS NOT NULL;

CREATE TABLE audit_log_archive (
  LIKE audit_log,
  archived_at  timestamptz NOT NULL DEFAULT now(),
  reset_no     integer
);

CREATE TABLE action_journal (
  id           bigserial PRIMARY KEY,
  action       text NOT NULL CHECK (action IN ('EXCHANGE_DECISION','BANK_SETTLE','BANK_REJECT','MARKET_NEWS','EVENT_STATUS')),
  ref_id       bigint,
  summary      text NOT NULL,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id     integer,
  actor_name   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  undone_at    timestamptz,
  undone_by    text,
  redone_at    timestamptz,
  redone_by    text
);
CREATE INDEX action_journal_created_idx ON action_journal(id DESC);

-- ---------------------------------------------------------------------------
-- Append-only protection. Only the reset routine may clear these tables
-- (it sets jse.maintenance = 'on' for its own transaction).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_forbid_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF coalesce(current_setting('jse.maintenance', true), '') = 'on' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN COALESCE(NEW, OLD);
  END IF;
  RAISE EXCEPTION 'JSE: % is append-only (% blocked)', TG_TABLE_NAME, TG_OP USING ERRCODE = 'P0001';
END $$;

CREATE TRIGGER audit_log_append_only BEFORE UPDATE OR DELETE ON audit_log FOR EACH ROW EXECUTE FUNCTION jse_forbid_mutation();
CREATE TRIGGER audit_log_no_truncate BEFORE TRUNCATE ON audit_log FOR EACH STATEMENT EXECUTE FUNCTION jse_forbid_mutation();
CREATE TRIGGER cash_ledger_append_only BEFORE UPDATE OR DELETE ON cash_ledger FOR EACH ROW EXECUTE FUNCTION jse_forbid_mutation();
CREATE TRIGGER cash_ledger_no_truncate BEFORE TRUNCATE ON cash_ledger FOR EACH STATEMENT EXECUTE FUNCTION jse_forbid_mutation();
CREATE TRIGGER institution_ledger_append_only BEFORE UPDATE OR DELETE ON institution_ledger FOR EACH ROW EXECUTE FUNCTION jse_forbid_mutation();
CREATE TRIGGER institution_ledger_no_truncate BEFORE TRUNCATE ON institution_ledger FOR EACH STATEMENT EXECUTE FUNCTION jse_forbid_mutation();

-- ---------------------------------------------------------------------------
-- Spec table names as views (stocks / ipos / per-type holdings / institutional
-- orders / institutional account) over the normalized tables.
-- ---------------------------------------------------------------------------
CREATE VIEW stocks AS
  SELECT id, symbol, name, sector, base_price, price, previous_price, lot_size, display_order, active, last_trade_at, updated_at
  FROM securities WHERE kind = 'EQUITY';
CREATE VIEW ipos AS
  SELECT id, symbol, name, sector, base_price, price, previous_price, lot_size, display_order, active, last_trade_at, updated_at
  FROM securities WHERE kind = 'IPO';
CREATE VIEW stock_holdings AS
  SELECT h.team_id, h.security_id AS stock_id, h.quantity, h.cost_basis, h.trade_cost, h.updated_at
  FROM holdings h JOIN securities s ON s.id = h.security_id WHERE s.kind = 'EQUITY';
CREATE VIEW ipo_holdings AS
  SELECT h.team_id, h.security_id AS ipo_id, h.quantity, h.cost_basis, h.trade_cost, h.updated_at
  FROM holdings h JOIN securities s ON s.id = h.security_id WHERE s.kind = 'IPO';
CREATE VIEW institutional_orders AS
  SELECT * FROM orders WHERE account_type = 'INSTITUTION';
CREATE VIEW institutional_account AS
  SELECT * FROM institutions;
CREATE VIEW participants AS
  SELECT u.id, u.username, u.display_name, u.team_id, t.code AS team_code, u.active
  FROM app_users u JOIN teams t ON t.id = u.team_id WHERE u.role = 'PARTICIPANT';

INSERT INTO schema_migrations(version) VALUES ('001_schema');
`;var $a=`-- JAIN STOCK EXCHANGE (JSE) v311
-- 001a_upgrades.sql: additive schema changes applied right after 001_schema.
-- Every statement is idempotent, so the file is safe to re-run on existing databases.

-- ---------------------------------------------------------------------------
-- v272: IPO listing (confidential listing price saved by the Controller, applied at listing time)
-- ---------------------------------------------------------------------------
ALTER TABLE securities ADD COLUMN IF NOT EXISTS listing_price  numeric(12,2);
ALTER TABLE securities ADD COLUMN IF NOT EXISTS listed_at      timestamptz;
ALTER TABLE securities ADD COLUMN IF NOT EXISTS listing_set_at timestamptz;
ALTER TABLE securities ADD COLUMN IF NOT EXISTS listing_set_by text;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'securities_listing_price_chk') THEN
    ALTER TABLE securities ADD CONSTRAINT securities_listing_price_chk
      CHECK (listing_price IS NULL OR (listing_price > 0 AND kind = 'IPO'));
  END IF;
END $$;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS auto_list_ipos boolean NOT NULL DEFAULT true;

ALTER TABLE price_history DROP CONSTRAINT IF EXISTS price_history_source_check;
ALTER TABLE price_history ADD CONSTRAINT price_history_source_check
  CHECK (source IN ('TRADE','MARKET_NEWS','RESET','UNDO','REDO','ADMIN','LISTING'));

ALTER TABLE action_journal DROP CONSTRAINT IF EXISTS action_journal_action_check;
ALTER TABLE action_journal ADD CONSTRAINT action_journal_action_check
  CHECK (action IN ('EXCHANGE_DECISION','BANK_SETTLE','BANK_REJECT','MARKET_NEWS','EVENT_STATUS','IPO_LISTING'));

-- ---------------------------------------------------------------------------
-- v311: roles \u2014 dedicated Pit Manager role; broker accounts must name their broker
-- ---------------------------------------------------------------------------
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_check;
ALTER TABLE app_users ADD CONSTRAINT app_users_role_check
  CHECK (role IN ('ADMIN','EXCHANGE','BANK','BROKER','PIT_MANAGER','INSTITUTIONAL','PARTICIPANT','VIEWER'));
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_users_broker_chk') THEN
    ALTER TABLE app_users ADD CONSTRAINT app_users_broker_chk CHECK (role <> 'BROKER' OR broker_id IS NOT NULL);
  END IF;
END $$;
-- PASSWORD = normal sign-in, CI = staging test sign-in with a GitHub OIDC token (set only by jse_ci_session)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'PASSWORD';

-- ---------------------------------------------------------------------------
-- v311: event configuration (one canonical source per rule)
-- ---------------------------------------------------------------------------
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS event_start_at timestamptz NOT NULL DEFAULT '2026-10-15 13:15:00+05:30';
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS ipo_application_hours numeric(6,2) NOT NULL DEFAULT 24
  CHECK (ipo_application_hours > 0 AND ipo_application_hours <= 48);
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS min_buy_trades integer NOT NULL DEFAULT 5 CHECK (min_buy_trades >= 0 AND min_buy_trades <= 1000);
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS min_sell_trades integer NOT NULL DEFAULT 5 CHECK (min_sell_trades >= 0 AND min_sell_trades <= 1000);
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS loan_repayment_required boolean NOT NULL DEFAULT true;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS team_name_seed text;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS team_names_assigned_at timestamptz;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS team_names_locked_at timestamptz;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS team_names_locked_by text;

-- ---------------------------------------------------------------------------
-- v311: brokers \u2014 contact details communicated to participants in advance
-- ---------------------------------------------------------------------------
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS contact text;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS desk text;

-- ---------------------------------------------------------------------------
-- v311: securities \u2014 IPO code, CMS INDEX base for staged composition, last real price change
-- ---------------------------------------------------------------------------
ALTER TABLE securities ADD COLUMN IF NOT EXISTS ipo_code text;
ALTER TABLE securities ADD COLUMN IF NOT EXISTS index_base_price numeric(12,2);
ALTER TABLE securities ADD COLUMN IF NOT EXISTS last_price_change_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS securities_ipo_code_uq ON securities(ipo_code) WHERE ipo_code IS NOT NULL;

-- ---------------------------------------------------------------------------
-- v311: team identity \u2014 curated Indian Knowledge System name pool; team names unique
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_name_pool (
  id        serial PRIMARY KEY,
  name      text NOT NULL,
  category  text,
  meaning   text,
  active    boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX IF NOT EXISTS team_name_pool_name_uq ON team_name_pool(lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS teams_name_uq ON teams(lower(name));

-- ---------------------------------------------------------------------------
-- v311: order flow \u2014 PARTICIPANT INSTRUCTION \u2192 BROKER SUBMISSION \u2192 PIT MANAGER EXECUTION
--       \u2192 EXCHANGE REVIEW \u2192 BANK SETTLEMENT. One status column for the whole flow.
-- ---------------------------------------------------------------------------
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('PIT_PENDING','PIT_REJECTED','EXCHANGE_PENDING','EXCHANGE_APPROVED','EXCHANGE_REJECTED',
                    'BANK_PENDING','BANK_SETTLED','BANK_REJECTED'));
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'PIT_PENDING';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS instruction_id    bigint;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS brokerage_rate    numeric(8,6);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pit_by            integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pit_by_name       text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pit_at            timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pit_note          text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS executed_at       timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS executed_by       integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS executed_by_name  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS executed_price    numeric(12,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS executed_quantity integer;
DROP INDEX IF EXISTS orders_open_idx;
CREATE INDEX IF NOT EXISTS orders_open2_idx ON orders(team_id, security_id, side)
  WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING');
CREATE INDEX IF NOT EXISTS orders_pit_pending_idx ON orders(security_id, id) WHERE status = 'PIT_PENDING';
CREATE INDEX IF NOT EXISTS orders_executed_idx ON orders(executed_at DESC) WHERE executed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_updated_idx ON orders(updated_at DESC, id DESC);

-- Participant \u2192 broker instructions (digital instruction mechanism)
CREATE TABLE IF NOT EXISTS instructions (
  id               bigserial PRIMARY KEY,
  instruction_no   text NOT NULL UNIQUE,
  team_id          integer NOT NULL REFERENCES teams(id),
  broker_id        integer REFERENCES brokers(id),
  security_id      integer NOT NULL REFERENCES securities(id),
  side             text NOT NULL CHECK (side IN ('BUY','SELL')),
  quantity         integer NOT NULL CHECK (quantity > 0),
  note             text,
  price_seen       numeric(12,2),
  status           text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','SUBMITTED','DECLINED','CANCELLED','EXPIRED')),
  order_id         bigint REFERENCES orders(id),
  idempotency_key  text UNIQUE,
  created_by       integer,
  created_by_name  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  handled_at       timestamptz,
  handled_by_name  text,
  decline_reason   text
);
CREATE INDEX IF NOT EXISTS instructions_team_idx ON instructions(team_id, id DESC);
CREATE INDEX IF NOT EXISTS instructions_open_idx ON instructions(broker_id, id) WHERE status = 'OPEN';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_instruction_fk') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_instruction_fk FOREIGN KEY (instruction_id) REFERENCES instructions(id);
  END IF;
END $$;

-- Trading slips: exactly one per executed order (one-to-one with the canonical order record).
-- The executed terms live on the order (guarded below); the slip row is immutable.
CREATE TABLE IF NOT EXISTS trading_slips (
  id              bigserial PRIMARY KEY,
  slip_no         text NOT NULL UNIQUE,
  order_id        bigint NOT NULL UNIQUE REFERENCES orders(id),
  issued_at       timestamptz NOT NULL DEFAULT now(),
  issued_by       integer,
  issued_by_name  text NOT NULL
);
CREATE INDEX IF NOT EXISTS trading_slips_issued_idx ON trading_slips(issued_at DESC, id DESC);
CREATE OR REPLACE TRIGGER trading_slips_append_only BEFORE UPDATE OR DELETE ON trading_slips
  FOR EACH ROW EXECUTE FUNCTION jse_forbid_mutation();
CREATE OR REPLACE TRIGGER trading_slips_no_truncate BEFORE TRUNCATE ON trading_slips
  FOR EACH STATEMENT EXECUTE FUNCTION jse_forbid_mutation();

-- Executed orders cannot be edited silently: the executed terms are fixed (only the reset routine may clear them).
CREATE OR REPLACE FUNCTION jse_orders_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF coalesce(current_setting('jse.maintenance', true), '') = 'on' OR OLD.executed_at IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.executed_at IS DISTINCT FROM OLD.executed_at OR NEW.executed_price IS DISTINCT FROM OLD.executed_price
     OR NEW.executed_quantity IS DISTINCT FROM OLD.executed_quantity OR NEW.executed_by_name IS DISTINCT FROM OLD.executed_by_name
     OR NEW.price IS DISTINCT FROM OLD.price OR NEW.quantity IS DISTINCT FROM OLD.quantity OR NEW.side IS DISTINCT FROM OLD.side
     OR NEW.team_id IS DISTINCT FROM OLD.team_id OR NEW.security_id IS DISTINCT FROM OLD.security_id
     OR NEW.trade_value IS DISTINCT FROM OLD.trade_value OR NEW.brokerage IS DISTINCT FROM OLD.brokerage
     OR NEW.brokerage_rate IS DISTINCT FROM OLD.brokerage_rate OR NEW.account_type IS DISTINCT FROM OLD.account_type
     OR NEW.institution_id IS DISTINCT FROM OLD.institution_id OR NEW.broker_id IS DISTINCT FROM OLD.broker_id THEN
    RAISE EXCEPTION 'JSE: % was executed by the Pit Manager; its executed terms cannot be edited', OLD.order_no USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE OR REPLACE TRIGGER orders_executed_guard BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION jse_orders_guard();

-- ---------------------------------------------------------------------------
-- v311: IPO round \u2014 one prospectus record per IPO, participant applications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ipo_prospectus (
  security_id            integer PRIMARY KEY REFERENCES securities(id),
  company_description    text,
  issue_details          text,
  business_overview      text,
  financial_information  text,
  risk_factors           text,
  use_of_proceeds        text,
  promoters_management   text,
  other_information      text,
  document_name          text,
  document_type          text,
  document_size          integer,
  document_data          bytea,
  document_url           text,
  document_uploaded_at   timestamptz,
  document_uploaded_by   text,
  updated_at             timestamptz NOT NULL DEFAULT now(),
  updated_by             text
);

CREATE TABLE IF NOT EXISTS ipo_applications (
  id               bigserial PRIMARY KEY,
  team_id          integer NOT NULL REFERENCES teams(id),
  security_id      integer NOT NULL REFERENCES securities(id),
  lots             integer NOT NULL CHECK (lots > 0),
  quantity         integer NOT NULL CHECK (quantity > 0),
  price            numeric(12,2) NOT NULL CHECK (price > 0),
  amount           numeric(16,2) NOT NULL CHECK (amount > 0),
  status           text NOT NULL DEFAULT 'APPLIED' CHECK (status IN ('APPLIED','WITHDRAWN')),
  created_by_name  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_by_name  text,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, security_id)
);

-- ---------------------------------------------------------------------------
-- v311: cash ledger records loan interest charges too (zero cash movement, liability noted)
-- ---------------------------------------------------------------------------
ALTER TABLE cash_ledger DROP CONSTRAINT IF EXISTS cash_ledger_entry_type_check;
ALTER TABLE cash_ledger ADD CONSTRAINT cash_ledger_entry_type_check
  CHECK (entry_type IN ('INITIAL_CAPITAL','IPO_ALLOTMENT','BUY','SELL','BROKERAGE','LOAN_DRAW','INTEREST','INTEREST_CHARGE',
                        'LOAN_REPAYMENT','REVERSAL','ADJUSTMENT'));

INSERT INTO schema_migrations(version) VALUES ('001a_upgrades');
`;var Ka=`-- JAIN STOCK EXCHANGE (JSE) v311
-- 002_core.sql: helpers, authentication, broker order submission, Pit Manager execution and
-- trading slips, Exchange review and Bank settlement.
-- Canonical flow: PARTICIPANT INSTRUCTION \u2192 BROKER SUBMISSION \u2192 PIT MANAGER EXECUTION \u2192 EXCHANGE REVIEW
--                 \u2192 BANK SETTLEMENT \u2192 CASH / HOLDINGS UPDATE.
-- Market prices change ONLY through the Market News engine (and the one-time IPO listing); orders are
-- submitted at the canonical market price and settlement never writes a price.
-- Every money-changing step is one database transaction (one function call) with row locks taken in a
-- fixed order: security -> order -> team -> loan -> holding -> institution (settlement: order -> security -> \u2026).
-- Security row locks: Market News FOR UPDATE \xB7 submission / execution FOR KEY SHARE \xB7 settlement FOR NO KEY UPDATE.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_fail(p_code text, p_msg text, p_http integer DEFAULT 400)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = 'JSE01', MESSAGE = p_msg, DETAIL = p_code, HINT = p_http::text;
END $$;

CREATE OR REPLACE FUNCTION jse_require_role(a jsonb, VARIADIC p_roles text[])
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF a IS NULL OR coalesce(a->>'role', '') = '' THEN
    PERFORM jse_fail('UNAUTHENTICATED', 'Please sign in to continue.', 401);
  END IF;
  IF NOT ((a->>'role') = ANY (p_roles)) THEN
    PERFORM jse_fail('FORBIDDEN', 'Your role (' || (a->>'role') || ') is not allowed to perform this action.', 403);
  END IF;
END $$;

-- Material administrative actions re-confirm the signed-in administrator's password (one dialog per action).
-- Automated staging tests sign in with a GitHub OIDC token (session kind CI) and have no password to give.
CREATE OR REPLACE FUNCTION jse_require_admin_password(a jsonb, p jsonb)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_hash text;
BEGIN
  IF coalesce(a->>'session_kind', '') = 'CI' THEN RETURN; END IF;
  SELECT password_hash INTO v_hash FROM app_users WHERE id = nullif(a->>'id', '')::integer AND role = 'ADMIN' AND active;
  IF v_hash IS NULL THEN PERFORM jse_fail('FORBIDDEN', 'Only an active administrator can do this.', 403); END IF;
  IF coalesce(p->>'admin_password', '') = '' THEN
    PERFORM jse_fail('ADMIN_PASSWORD_REQUIRED', 'Enter the administrator password to confirm this action.', 403);
  END IF;
  IF v_hash <> crypt(p->>'admin_password', v_hash) THEN
    PERFORM jse_fail('ADMIN_PASSWORD_INVALID', 'The administrator password is incorrect. Nothing was changed.', 403);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION jse_actor_name(a jsonb) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(nullif(a->>'username', ''), nullif(a->>'name', ''), 'system')
$$;

CREATE OR REPLACE FUNCTION jse_round_tick(p numeric, p_tick numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT round(p / p_tick) * p_tick
$$;

CREATE OR REPLACE FUNCTION jse_pct(p_new numeric, p_old numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN coalesce(p_old, 0) = 0 THEN 0 ELSE round((p_new - p_old) * 100 / p_old, 4) END
$$;

CREATE OR REPLACE FUNCTION jse_rate_text(p_rate numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(to_char(coalesce(p_rate, 0) * 100, 'FM9990.00')) || '%'
$$;

CREATE OR REPLACE FUNCTION jse_audit(a jsonb, p_action text, p_entity text, p_entity_id text, p_team integer,
                                     p_order bigint, p_before jsonb, p_after jsonb, p_details jsonb)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO audit_log(actor_id, actor_username, actor_email, actor_role, action, entity, entity_id, team_id, order_id,
                        before_state, after_state, details, ip, user_agent, session_id)
  VALUES (nullif(a->>'id', '')::integer, coalesce(a->>'username', 'system'), a->>'email', coalesce(a->>'role', 'SYSTEM'),
          p_action, p_entity, p_entity_id, p_team, p_order, p_before, p_after, p_details,
          a->>'ip', left(a->>'ua', 300), a->>'session')
$$;

CREATE OR REPLACE FUNCTION jse_order_event(p_order bigint, p_event text, p_from text, p_to text, a jsonb, p_note text, p_data jsonb)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO order_events(order_id, event, from_status, to_status, actor_id, actor_name, actor_role, note, data)
  VALUES (p_order, p_event, p_from, p_to, nullif(a->>'id', '')::integer, jse_actor_name(a), coalesce(a->>'role', 'SYSTEM'), p_note, p_data)
$$;

CREATE OR REPLACE FUNCTION jse_ledger(p_team integer, p_order bigint, p_settlement bigint, p_type text,
                                      p_debit numeric, p_credit numeric, p_balance numeric, p_note text, a jsonb)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO cash_ledger(team_id, order_id, settlement_id, entry_type, debit, credit, balance_after, note, actor_id, actor_name)
  VALUES (p_team, p_order, p_settlement, p_type, coalesce(p_debit, 0), coalesce(p_credit, 0), p_balance, p_note,
          nullif(a->>'id', '')::integer, jse_actor_name(a))
$$;

CREATE OR REPLACE FUNCTION jse_inst_ledger(p_inst integer, p_order bigint, p_settlement bigint, p_type text,
                                           p_debit numeric, p_credit numeric, p_balance numeric, p_note text, a jsonb)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO institution_ledger(institution_id, order_id, settlement_id, entry_type, debit, credit, balance_after, note, actor_id, actor_name)
  VALUES (p_inst, p_order, p_settlement, p_type, coalesce(p_debit, 0), coalesce(p_credit, 0), p_balance, p_note,
          nullif(a->>'id', '')::integer, jse_actor_name(a))
$$;

CREATE OR REPLACE FUNCTION jse_journal(p_action text, p_ref bigint, p_summary text, p_payload jsonb, a jsonb)
RETURNS bigint LANGUAGE sql AS $$
  INSERT INTO action_journal(action, ref_id, summary, payload, actor_id, actor_name)
  VALUES (p_action, p_ref, p_summary, coalesce(p_payload, '{}'::jsonb), nullif(a->>'id', '')::integer, jse_actor_name(a))
  RETURNING id
$$;

-- Records a risk event once per (order, kind) and bumps the team counter only when new.
CREATE OR REPLACE FUNCTION jse_risk(p_team integer, p_order bigint, p_security integer, p_kind text, p_stage text, p_side text,
                                    p_qty integer, p_holding integer, p_required numeric, p_available numeric, p_note text)
RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE v_new boolean := false;
BEGIN
  INSERT INTO risk_events(team_id, order_id, security_id, kind, stage, side, quantity, holding_before, required_amount, available_cash, shortage, note)
  VALUES (p_team, p_order, p_security, p_kind, p_stage, p_side, p_qty, p_holding, p_required, p_available,
          CASE WHEN p_required IS NOT NULL AND p_available IS NOT NULL THEN greatest(0, p_required - p_available) END, p_note)
  ON CONFLICT (order_id, kind) WHERE order_id IS NOT NULL DO NOTHING;
  GET DIAGNOSTICS v_new = ROW_COUNT;
  IF v_new THEN
    UPDATE teams SET
      short_sell_attempts = short_sell_attempts + CASE WHEN p_kind = 'SHORT_SELL_ATTEMPT' THEN 1 ELSE 0 END,
      cash_shortfall_attempts = cash_shortfall_attempts + CASE WHEN p_kind = 'CASH_SHORTFALL_ATTEMPT' THEN 1 ELSE 0 END,
      insufficient_balance_rejections = insufficient_balance_rejections + CASE WHEN p_kind = 'INSUFFICIENT_BALANCE_REJECTION' THEN 1 ELSE 0 END,
      updated_at = now()
    WHERE id = p_team;
  END IF;
  RETURN v_new;
END $$;

-- Quantity the team can still sell: holding minus quantity already committed to other open SELL orders.
CREATE OR REPLACE FUNCTION jse_available_qty(p_team integer, p_security integer, p_exclude_order bigint DEFAULT NULL)
RETURNS TABLE(holding integer, open_sell integer, available integer) LANGUAGE sql STABLE AS $$
  WITH h AS (SELECT coalesce((SELECT quantity FROM holdings WHERE team_id = p_team AND security_id = p_security), 0) AS q),
       s AS (SELECT coalesce(sum(quantity), 0)::integer AS q FROM orders
             WHERE team_id = p_team AND security_id = p_security AND side = 'SELL' AND account_type = 'TEAM'
               AND status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')
               AND (p_exclude_order IS NULL OR id <> p_exclude_order))
  SELECT h.q, s.q, h.q - s.q FROM h, s
$$;

-- Cash the team still has free: cash minus the full amount of its other open BUY orders.
CREATE OR REPLACE FUNCTION jse_available_cash(p_team integer, p_exclude_order bigint DEFAULT NULL)
RETURNS numeric LANGUAGE sql STABLE AS $$
  SELECT (SELECT cash FROM teams WHERE id = p_team) - coalesce((
    SELECT sum(settlement_amount) FROM orders
    WHERE team_id = p_team AND side = 'BUY' AND account_type = 'TEAM'
      AND status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')
      AND (p_exclude_order IS NULL OR id <> p_exclude_order)), 0)
$$;

-- Loan principal the team can still draw (limit applies to the total principal ever drawn).
CREATE OR REPLACE FUNCTION jse_loan_room(p_team integer) RETURNS numeric LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN c.loans_enabled THEN greatest(0, c.loan_max_principal - coalesce(l.original_principal, 0)) ELSE 0 END
  FROM event_config c LEFT JOIN loans l ON l.team_id = p_team WHERE c.id = 1
$$;

-- User-facing stage of an order in the canonical flow
CREATE OR REPLACE FUNCTION jse_stage_label(p_status text, p_code text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_status
    WHEN 'PIT_PENDING' THEN 'Broker submitted \xB7 awaiting Pit Manager'
    WHEN 'PIT_REJECTED' THEN CASE WHEN p_code = 'PRICE_STALE' THEN 'Rejected \xB7 price stale' ELSE 'Rejected by Pit Manager' END
    WHEN 'EXCHANGE_PENDING' THEN 'Executed \xB7 awaiting Exchange'
    WHEN 'EXCHANGE_APPROVED' THEN 'Exchange approved \xB7 awaiting Bank'
    WHEN 'BANK_PENDING' THEN 'Bank verifying'
    WHEN 'BANK_SETTLED' THEN 'Settled'
    WHEN 'EXCHANGE_REJECTED' THEN 'Rejected by Exchange'
    WHEN 'BANK_REJECTED' THEN 'Rejected by Bank'
    ELSE p_status END
$$;

CREATE OR REPLACE FUNCTION jse_order_json(p_id bigint) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object(
    'id', o.id, 'order_no', o.order_no, 'account_type', o.account_type,
    'team', t.code, 'team_name', t.name, 'broker', b.code, 'broker_name', b.name,
    'institution', i.code, 'institution_name', i.name,
    'security_id', s.id, 'symbol', s.symbol, 'security', s.name, 'kind', s.kind,
    'side', o.side, 'quantity', o.quantity, 'price', o.price,
    'trade_value', o.trade_value, 'brokerage_rate', coalesce(o.brokerage_rate, CASE WHEN o.trade_value > 0 THEN round(o.brokerage / o.trade_value, 6) END),
    'brokerage', o.brokerage, 'settlement_amount', o.settlement_amount,
    'reference_price', o.reference_price, 'market_price', s.price, 'status', o.status, 'stage', jse_stage_label(o.status, o.reject_code),
    'short_sell_flag', o.short_sell_flag, 'cash_shortfall_flag', o.cash_shortfall_flag,
    'reject_code', o.reject_code, 'reject_reason', o.reject_reason,
    'instruction_no', ins.instruction_no, 'instruction_at', ins.created_at,
    'created_by', o.created_by_name, 'created_role', o.created_role, 'created_at', o.created_at,
    'pit_by', o.pit_by_name, 'pit_at', o.pit_at,
    'executed_at', o.executed_at, 'executed_by', o.executed_by_name, 'executed_price', o.executed_price, 'executed_quantity', o.executed_quantity,
    'slip_no', sl.slip_no,
    'exchange_by', o.exchange_by_name, 'exchange_at', o.exchange_at,
    'bank_by', o.bank_by_name, 'bank_at', o.bank_at, 'pair_ref', o.pair_ref, 'notes', o.notes, 'updated_at', o.updated_at)
  FROM orders o
  JOIN teams t ON t.id = o.team_id
  JOIN securities s ON s.id = o.security_id
  LEFT JOIN brokers b ON b.id = o.broker_id
  LEFT JOIN institutions i ON i.id = o.institution_id
  LEFT JOIN instructions ins ON ins.id = o.instruction_id
  LEFT JOIN trading_slips sl ON sl.order_id = o.id
  WHERE o.id = p_id
$$;

-- ---------------------------------------------------------------------------
-- The canonical price writer. Called by Market News, IPO listing and their undo / redo \u2014 never by
-- order submission, execution, Exchange or Bank. Records price history and marks orders still
-- waiting for the Pit Manager at the old price as PRICE STALE.
-- The caller must hold the security row FOR UPDATE.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__mark_stale(a jsonb, o orders, p_market numeric, p_source text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_reason text;
BEGIN
  v_reason := 'PRICE STALE: the market price moved from \u20B9' || o.price || ' to \u20B9' || p_market || ' (' || replace(p_source, '_', ' ') ||
              ') before the Pit Manager executed this order. The broker must submit a fresh order at the new market price.';
  UPDATE orders SET status = 'PIT_REJECTED', reject_code = 'PRICE_STALE', reject_reason = v_reason,
         pit_at = now(), pit_by_name = 'SYSTEM \xB7 ' || replace(p_source, '_', ' '), updated_at = now()
  WHERE id = o.id AND status = 'PIT_PENDING';
  PERFORM jse_order_event(o.id, 'PRICE_STALE', 'PIT_PENDING', 'PIT_REJECTED', a, v_reason,
    jsonb_build_object('order_price', o.price, 'market_price', p_market, 'source', p_source));
  PERFORM jse_audit(a, 'ORDER_PRICE_STALE', 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', 'PIT_PENDING'),
    jsonb_build_object('status', 'PIT_REJECTED', 'reject_code', 'PRICE_STALE'),
    jsonb_build_object('order_price', o.price, 'market_price', p_market, 'source', p_source));
END $$;

CREATE OR REPLACE FUNCTION jse__stale_orders(a jsonb, p_security integer, p_new_price numeric, p_source text)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE o orders%ROWTYPE; v_n integer := 0;
BEGIN
  FOR o IN SELECT * FROM orders WHERE security_id = p_security AND status = 'PIT_PENDING' AND price <> p_new_price ORDER BY id FOR UPDATE LOOP
    PERFORM jse__mark_stale(a, o, p_new_price, p_source);
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END $$;

CREATE OR REPLACE FUNCTION jse__set_price(a jsonb, p_security integer, p_new numeric, p_source text,
                                          p_news bigint DEFAULT NULL, p_previous numeric DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE s securities%ROWTYPE; v_stale integer := 0;
BEGIN
  SELECT * INTO s FROM securities WHERE id = p_security;
  IF p_new IS NULL OR p_new <= 0 THEN RAISE EXCEPTION 'JSE invariant: invalid price for %', s.symbol; END IF;
  UPDATE securities SET previous_price = coalesce(p_previous, price), price = p_new, updated_at = now(),
         last_price_change_at = CASE WHEN p_new <> s.price THEN clock_timestamp() ELSE last_price_change_at END
  WHERE id = s.id;
  IF p_new <> s.price THEN
    INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source, news_id)
    VALUES (s.id, s.price, p_new, jse_pct(p_new, s.price), p_source, p_news);
    v_stale := jse__stale_orders(a, s.id, p_new, p_source);
  END IF;
  UPDATE event_control SET market_updated_at = now() WHERE id = 1;
  RETURN v_stale;
END $$;

-- ---------------------------------------------------------------------------
-- Authentication (bcrypt via pgcrypto; opaque random session tokens, stored hashed)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_user_json(u app_users) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('id', u.id, 'username', u.username, 'name', u.display_name, 'email', u.email, 'role', u.role,
    'team_id', u.team_id, 'team', t.code, 'team_name', t.name,
    'team_broker', tb.code, 'team_broker_name', tb.name,
    'broker_id', u.broker_id, 'broker', b.code, 'broker_name', b.name,
    'institution_id', u.institution_id, 'institution', i.code,
    'must_change_password', u.must_change_password)
  FROM (SELECT 1) one
  LEFT JOIN teams t ON t.id = u.team_id
  LEFT JOIN brokers tb ON tb.id = t.broker_id
  LEFT JOIN brokers b ON b.id = u.broker_id
  LEFT JOIN institutions i ON i.id = u.institution_id
$$;

CREATE OR REPLACE FUNCTION jse_login(p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  u app_users%ROWTYPE;
  v_token text;
  v_hours integer := coalesce(nullif(p->>'hours', '')::integer, 16);
  a jsonb;
BEGIN
  SELECT * INTO u FROM app_users WHERE lower(username) = lower(trim(coalesce(p->>'username', ''))) FOR UPDATE;
  IF NOT FOUND THEN
    PERFORM crypt(coalesce(p->>'password', ''), gen_salt('bf', 8));   -- equal timing for unknown users
    PERFORM jse_fail('INVALID_CREDENTIALS', 'Incorrect username or password.', 401);
  END IF;
  IF u.locked_until IS NOT NULL AND u.locked_until > now() THEN
    PERFORM jse_fail('ACCOUNT_LOCKED', 'Too many failed attempts. Try again in a few minutes.', 423);
  END IF;
  IF u.password_hash <> crypt(coalesce(p->>'password', ''), u.password_hash) THEN
    UPDATE app_users SET failed_logins = failed_logins + 1,
      locked_until = CASE WHEN failed_logins + 1 >= 10 THEN now() + interval '5 minutes' ELSE locked_until END
    WHERE id = u.id;
    a := jsonb_build_object('id', u.id, 'username', u.username, 'role', u.role, 'ip', p->>'ip', 'ua', p->>'ua');
    PERFORM jse_audit(a, 'LOGIN_FAILED', 'user', u.id::text, u.team_id, NULL, NULL, NULL, NULL);
    -- the failed-attempt counter must survive, so return an error object instead of raising
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_CREDENTIALS', 'error', 'Incorrect username or password.', 'http', 401);
  END IF;
  IF NOT u.active THEN
    PERFORM jse_fail('ACCOUNT_DISABLED', 'This account is disabled. Contact the event administrator.', 403);
  END IF;
  v_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO sessions(token_hash, user_id, expires_at, ip, user_agent, kind)
  VALUES (encode(digest(v_token, 'sha256'), 'hex'), u.id, now() + make_interval(hours => greatest(1, least(v_hours, 72))), p->>'ip', left(p->>'ua', 300), 'PASSWORD');
  UPDATE app_users SET failed_logins = 0, locked_until = NULL, last_login_at = now() WHERE id = u.id;
  a := jsonb_build_object('id', u.id, 'username', u.username, 'role', u.role, 'email', u.email, 'ip', p->>'ip', 'ua', p->>'ua');
  PERFORM jse_audit(a, 'LOGIN', 'user', u.id::text, u.team_id, NULL, NULL, NULL, NULL);
  RETURN jsonb_build_object('success', true, 'token', v_token, 'user', jse_user_json(u),
                            'expires_at', now() + make_interval(hours => greatest(1, least(v_hours, 72))));
END $$;

CREATE OR REPLACE FUNCTION jse_session(p_token_hash text) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE s sessions%ROWTYPE; u app_users%ROWTYPE;
BEGIN
  SELECT * INTO s FROM sessions WHERE token_hash = p_token_hash;
  IF NOT FOUND OR s.revoked_at IS NOT NULL OR s.expires_at < now() THEN RETURN NULL; END IF;
  SELECT * INTO u FROM app_users WHERE id = s.user_id;
  IF NOT FOUND OR NOT u.active THEN RETURN NULL; END IF;
  IF s.last_seen_at < now() - interval '2 minutes' THEN
    UPDATE sessions SET last_seen_at = now() WHERE id = s.id;
  END IF;
  RETURN jse_user_json(u) || jsonb_build_object('session', s.id::text, 'expires_at', s.expires_at, 'session_kind', s.kind);
END $$;

CREATE OR REPLACE FUNCTION jse_logout(p_token_hash text) RETURNS jsonb LANGUAGE sql AS $$
  UPDATE sessions SET revoked_at = now() WHERE token_hash = p_token_hash AND revoked_at IS NULL;
  SELECT jsonb_build_object('success', true);
$$;

CREATE OR REPLACE FUNCTION jse_change_password(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE u app_users%ROWTYPE; v_new text := coalesce(p->>'new_password', '');
BEGIN
  SELECT * INTO u FROM app_users WHERE id = (a->>'id')::integer FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('UNAUTHENTICATED', 'Please sign in again.', 401); END IF;
  IF u.password_hash <> crypt(coalesce(p->>'old_password', ''), u.password_hash) THEN
    PERFORM jse_fail('INVALID_CREDENTIALS', 'Your current password is incorrect.', 400);
  END IF;
  IF length(v_new) < 8 THEN PERFORM jse_fail('WEAK_PASSWORD', 'Use at least 8 characters for the new password.', 400); END IF;
  UPDATE app_users SET password_hash = crypt(v_new, gen_salt('bf', 8)), must_change_password = false, updated_at = now() WHERE id = u.id;
  UPDATE sessions SET revoked_at = now() WHERE user_id = u.id AND revoked_at IS NULL AND id::text <> coalesce(a->>'session', '');
  PERFORM jse_audit(a, 'PASSWORD_CHANGED', 'user', u.id::text, u.team_id, NULL, NULL, NULL, NULL);
  RETURN jsonb_build_object('success', true);
END $$;

-- First administrator password (and recovery). Database console only \u2014 no API route calls this.
--   SELECT jse_bootstrap_password('ADMIN');              -- random password, returned once
--   SELECT jse_bootstrap_password('ADMIN', 'my-own-pw'); -- chosen password (8+ characters)
-- The account must choose a new password at its next sign-in.
CREATE OR REPLACE FUNCTION jse_bootstrap_password(p_username text, p_password text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE u app_users%ROWTYPE; v_pw text := coalesce(nullif(p_password, ''), jse_random_password());
BEGIN
  SELECT * INTO u FROM app_users WHERE lower(username) = lower(trim(coalesce(p_username, ''))) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'No account named %', p_username; END IF;
  IF length(v_pw) < 8 THEN RAISE EXCEPTION 'Use at least 8 characters'; END IF;
  UPDATE app_users SET password_hash = crypt(v_pw, gen_salt('bf', 8)), must_change_password = true, failed_logins = 0,
         locked_until = NULL, active = true, updated_at = now() WHERE id = u.id;
  UPDATE sessions SET revoked_at = now() WHERE user_id = u.id AND revoked_at IS NULL;
  PERFORM jse_audit('{"username":"DATABASE CONSOLE","role":"SYSTEM"}'::jsonb, 'PASSWORD_BOOTSTRAP', 'user', u.username, u.team_id,
                    NULL, NULL, NULL, NULL);
  RETURN v_pw;
END $$;

-- Session for automated tests on a staging deployment. The API calls this only when it runs with
-- CI_OIDC_REPOSITORY set and the caller presents a valid GitHub Actions OIDC token for that repository.
CREATE OR REPLACE FUNCTION jse_ci_session(p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE u app_users%ROWTYPE; v_token text; a jsonb;
BEGIN
  SELECT * INTO u FROM app_users WHERE lower(username) = lower(trim(coalesce(p->>'username', '')));
  IF NOT FOUND OR NOT u.active THEN PERFORM jse_fail('INVALID_CREDENTIALS', 'Unknown or disabled account.', 401); END IF;
  v_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO sessions(token_hash, user_id, expires_at, ip, user_agent, kind)
  VALUES (encode(digest(v_token, 'sha256'), 'hex'), u.id, now() + interval '6 hours', p->>'ip', left('CI ' || coalesce(p->>'subject', ''), 300), 'CI');
  a := jsonb_build_object('id', u.id, 'username', u.username, 'role', u.role, 'ip', p->>'ip', 'ua', p->>'ua');
  PERFORM jse_audit(a, 'CI_LOGIN', 'user', u.id::text, u.team_id, NULL, NULL, NULL,
                    jsonb_build_object('subject', p->>'subject', 'run_id', p->>'run_id', 'workflow', p->>'workflow'));
  RETURN jsonb_build_object('success', true, 'token', v_token, 'user', jse_user_json(u) || jsonb_build_object('session_kind', 'CI'));
END $$;

-- ---------------------------------------------------------------------------
-- Broker submission. Only the team's assigned broker (or an administrator) submits; participants never do.
-- The order is placed at the canonical market price \u2014 nobody chooses a price. No cash, holding or price change here.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_place_order(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE;
  v_status text;
  v_team teams%ROWTYPE;
  v_sec securities%ROWTYPE;
  v_ins instructions%ROWTYPE;
  v_side text := upper(trim(coalesce(p->>'side', '')));
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_qty integer; v_expected numeric; v_rate numeric;
  v_tv numeric; v_brk numeric; v_amount numeric;
  v_id bigint; v_no text;
  v_existing bigint;
  v_avail record;
  v_free_cash numeric; v_room numeric;
  v_short boolean := false; v_shortfall boolean := false;
  v_warnings jsonb := '[]'::jsonb;
BEGIN
  IF a->>'role' = 'PARTICIPANT' THEN
    PERFORM jse_fail('PARTICIPANT_ENTRY_DISABLED',
      'Participants do not place exchange orders. Give your instruction to your assigned broker (or send it from My Orders); the broker submits the order.', 403);
  END IF;
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER');
  IF v_key IS NULL OR length(v_key) > 120 THEN
    PERFORM jse_fail('IDEMPOTENCY_KEY_REQUIRED', 'Order submission is missing its request key. Reload the page and try again.', 400);
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('jse-order:' || v_key, 0));
  SELECT id INTO v_existing FROM orders WHERE idempotency_key = v_key;
  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'replayed', true, 'order', jse_order_json(v_existing), 'warnings', '[]'::jsonb);
  END IF;

  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  IF v_status <> 'LIVE' THEN
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;

  -- an instruction from the participant can be submitted as it is (same team, security, side and quantity)
  IF nullif(p->>'instruction_id', '') IS NOT NULL OR nullif(p->>'instruction_no', '') IS NOT NULL THEN
    SELECT * INTO v_ins FROM instructions
    WHERE id = nullif(p->>'instruction_id', '')::bigint OR instruction_no = upper(trim(coalesce(p->>'instruction_no', '')))
    FOR UPDATE;
    IF NOT FOUND THEN PERFORM jse_fail('INSTRUCTION_NOT_FOUND', 'That participant instruction was not found.', 404); END IF;
    IF v_ins.status <> 'OPEN' THEN
      PERFORM jse_fail('INSTRUCTION_NOT_OPEN', v_ins.instruction_no || ' is ' || lower(v_ins.status) || ' and cannot be submitted again.', 409);
    END IF;
  END IF;

  SELECT * INTO v_team FROM teams
  WHERE (p ? 'team' AND code = upper(trim(p->>'team'))) OR (p ? 'team_id' AND id = nullif(p->>'team_id', '')::integer)
     OR (v_ins.id IS NOT NULL AND NOT (p ? 'team') AND NOT (p ? 'team_id') AND id = v_ins.team_id);
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Select one of your assigned teams.', 404); END IF;
  IF NOT v_team.active THEN PERFORM jse_fail('TEAM_INACTIVE', 'Team ' || v_team.code || ' is not active.', 409); END IF;
  IF v_team.broker_id IS NULL THEN
    PERFORM jse_fail('NO_BROKER', v_team.code || ' has no assigned broker yet. The Event Admin must assign one before it can trade.', 409);
  END IF;
  IF a->>'role' = 'BROKER' AND v_team.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN
    PERFORM jse_fail('NOT_YOUR_TEAM', v_team.code || ' (' || v_team.name || ') is assigned to another broker. You can submit orders only for your own teams.', 403);
  END IF;

  -- KEY SHARE: a Market News price change on this security waits for this submission (and vice versa)
  SELECT * INTO v_sec FROM securities
  WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')))
     OR (v_ins.id IS NOT NULL AND NOT (p ? 'security_id') AND NOT (p ? 'symbol') AND id = v_ins.security_id)
  FOR KEY SHARE;
  IF NOT FOUND OR NOT v_sec.active THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a valid listed stock.', 404); END IF;
  IF v_sec.kind = 'IPO' AND v_sec.listed_at IS NULL THEN
    PERFORM jse_fail('IPO_NOT_LISTED', v_sec.symbol || ' is still in the IPO stage. It can be traded on the market only after it lists.', 409);
  END IF;

  IF v_side = '' AND v_ins.id IS NOT NULL THEN v_side := v_ins.side; END IF;
  IF v_side NOT IN ('BUY', 'SELL') THEN PERFORM jse_fail('INVALID_SIDE', 'Choose BUY or SELL.', 400); END IF;

  BEGIN
    v_qty := coalesce(nullif(p->>'quantity', '')::integer, v_ins.quantity);
    v_expected := nullif(p->>'expected_price', '')::numeric;
  EXCEPTION WHEN others THEN
    PERFORM jse_fail('INVALID_NUMBER', 'Quantity must be a whole number of shares.', 400);
  END;
  IF v_qty IS NULL OR v_qty <= 0 THEN PERFORM jse_fail('INVALID_QUANTITY', 'Quantity must be a positive number of shares.', 400); END IF;
  IF v_qty % v_sec.lot_size <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' trades in multiples of ' || v_sec.lot_size || ' shares (e.g. ' || v_sec.lot_size || ', ' || (2 * v_sec.lot_size) || ', ' || (3 * v_sec.lot_size) || ').', 400);
  END IF;
  IF v_ins.id IS NOT NULL AND (v_ins.team_id <> v_team.id OR v_ins.security_id <> v_sec.id OR v_ins.side <> v_side OR v_ins.quantity <> v_qty) THEN
    PERFORM jse_fail('INSTRUCTION_MISMATCH', 'The order must match ' || v_ins.instruction_no || ' (' || v_ins.side || ' ' || v_ins.quantity ||
      '). If the participant wants something different, decline it and ask for a new instruction.', 409);
  END IF;
  -- the broker's screen showed a price; if Market News moved it since, ask the broker to review (no silent re-quote)
  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'PRICE_CHANGED', HINT = '409',
      MESSAGE = 'The market price of ' || v_sec.symbol || ' changed from \u20B9' || v_expected || ' to \u20B9' || v_sec.price ||
                ' (Market News). Review the new value with the participant and submit again.';
  END IF;

  v_rate := cfg.brokerage_rate;
  v_tv := round(v_qty * v_sec.price, 2);
  v_brk := round(v_tv * v_rate, 2);
  v_amount := CASE WHEN v_side = 'BUY' THEN v_tv + v_brk ELSE v_tv - v_brk END;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between \u20B9' || cfg.min_order_value || ' and \u20B9' || cfg.max_order_value ||
      ' per order (this order: \u20B9' || v_tv || ').', 400);
  END IF;

  -- risk checks (recorded and shown to the Pit Manager, Exchange and Bank; the Bank enforces them)
  IF v_side = 'SELL' THEN
    SELECT * INTO v_avail FROM jse_available_qty(v_team.id, v_sec.id, NULL);
    IF v_qty > v_avail.available THEN
      v_short := true;
      v_warnings := v_warnings || jsonb_build_object('code', 'SHORT_SELL', 'message',
        'Short selling is not allowed: ' || v_team.code || ' can sell only ' || greatest(v_avail.available, 0) || ' ' || v_sec.symbol ||
        ' shares (holding ' || v_avail.holding || ', already in open sell orders ' || v_avail.open_sell || '). The attempt has been recorded; the Bank will reject it unless the holding is sufficient.');
    END IF;
  ELSE
    v_free_cash := jse_available_cash(v_team.id, NULL);
    v_room := jse_loan_room(v_team.id);
    IF v_amount > v_free_cash + v_room THEN
      v_shortfall := true;
      v_warnings := v_warnings || jsonb_build_object('code', 'CASH_SHORTFALL', 'message',
        'Cash shortfall: this BUY needs \u20B9' || v_amount || ' but ' || v_team.code || ' has \u20B9' || greatest(v_free_cash, 0) ||
        ' free cash and \u20B9' || v_room || ' of loan room. The attempt has been recorded; the Bank will reject it unless funds are available.');
    ELSIF v_amount > v_free_cash THEN
      v_warnings := v_warnings || jsonb_build_object('code', 'LOAN_NEEDED', 'message',
        'This BUY needs about \u20B9' || round(v_amount - greatest(v_free_cash, 0), 2) || ' more than the free cash. The Bank will draw that amount as a loan at settlement (' ||
        jse_rate_text(cfg.loan_interest_rate) || ' interest).');
    END IF;
  END IF;

  v_id := nextval(pg_get_serial_sequence('orders', 'id'));
  v_no := 'ORD-' || lpad(v_id::text, 6, '0');
  INSERT INTO orders(id, order_no, account_type, team_id, broker_id, security_id, side, quantity, price, trade_value, brokerage, brokerage_rate,
                     settlement_amount, reference_price, status, short_sell_flag, cash_shortfall_flag, notes, pair_ref, idempotency_key,
                     instruction_id, created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'TEAM', v_team.id, v_team.broker_id, v_sec.id, v_side, v_qty, v_sec.price, v_tv, v_brk, v_rate,
          v_amount, v_sec.price, 'PIT_PENDING', v_short, v_shortfall, left(p->>'notes', 300), left(p->>'pair_ref', 60), v_key,
          v_ins.id, nullif(a->>'id', '')::integer, jse_actor_name(a), a->>'role');
  IF v_ins.id IS NOT NULL THEN
    UPDATE instructions SET status = 'SUBMITTED', order_id = v_id, handled_at = now(), handled_by_name = jse_actor_name(a) WHERE id = v_ins.id;
    PERFORM jse_order_event(v_id, 'INSTRUCTION_RECEIVED', NULL, NULL, jsonb_build_object('username', v_ins.created_by_name, 'role', 'PARTICIPANT'),
      v_ins.instruction_no || ': ' || v_ins.side || ' ' || v_ins.quantity || ' ' || v_sec.symbol, jsonb_build_object('at', v_ins.created_at));
  END IF;
  PERFORM jse_order_event(v_id, 'BROKER_SUBMITTED', NULL, 'PIT_PENDING', a, 'Submitted at the market price \u20B9' || v_sec.price,
    jsonb_build_object('price', v_sec.price, 'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'instruction_no', v_ins.instruction_no));
  PERFORM jse_audit(a, 'ORDER_SUBMITTED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'PIT_PENDING', 'side', v_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_sec.price),
    jsonb_build_object('trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'settlement_amount', v_amount,
                       'broker', (SELECT code FROM brokers WHERE id = v_team.broker_id), 'instruction_no', v_ins.instruction_no));

  IF v_short THEN
    PERFORM jse_risk(v_team.id, v_id, v_sec.id, 'SHORT_SELL_ATTEMPT', 'ORDER', v_side, v_qty, v_avail.holding, NULL, NULL,
                     'Open sell orders: ' || v_avail.open_sell);
    PERFORM jse_audit(a, 'SHORT_SELLING_ATTEMPT', 'order', v_no, v_team.id, v_id, NULL, NULL,
      jsonb_build_object('quantity', v_qty, 'holding', v_avail.holding, 'open_sell', v_avail.open_sell, 'stage', 'ORDER'));
  END IF;
  IF v_shortfall THEN
    PERFORM jse_risk(v_team.id, v_id, v_sec.id, 'CASH_SHORTFALL_ATTEMPT', 'ORDER', v_side, v_qty, NULL, v_amount, greatest(v_free_cash, 0) + v_room, NULL);
    PERFORM jse_audit(a, 'CASH_SHORTFALL_ATTEMPT', 'order', v_no, v_team.id, v_id, NULL, NULL,
      jsonb_build_object('required', v_amount, 'available', v_free_cash, 'loan_room', v_room, 'stage', 'ORDER'));
  END IF;

  RETURN jsonb_build_object('success', true, 'replayed', false, 'order', jse_order_json(v_id), 'warnings', v_warnings);
END $$;

-- ---------------------------------------------------------------------------
-- Pit Manager: EXECUTE ORDER (creates the one official trading slip) or REJECT with a reason.
-- An order whose submitted price is no longer the market price is PRICE STALE and cannot be executed.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_pit_action(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action', ''), 'EXECUTE'));
  v_reason text := nullif(left(trim(coalesce(p->>'reason', '')), 300), '');
  v_status text; v_sec_id integer; v_slip_id bigint; v_slip_no text;
  s securities%ROWTYPE; o orders%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'PIT_MANAGER');
  IF v_action NOT IN ('EXECUTE', 'REJECT') THEN PERFORM jse_fail('INVALID_ACTION', 'Use EXECUTE or REJECT.', 400); END IF;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'The Pit Manager can execute orders only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  SELECT security_id INTO v_sec_id FROM orders WHERE id = nullif(p->>'order_id', '')::bigint OR order_no = upper(trim(coalesce(p->>'order_no', '')));
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  -- lock order: security (KEY SHARE, blocks a concurrent price change) then the order
  SELECT * INTO s FROM securities WHERE id = v_sec_id FOR KEY SHARE;
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint OR order_no = upper(trim(coalesce(p->>'order_no', ''))) FOR UPDATE;
  IF o.status <> 'PIT_PENDING' THEN
    PERFORM jse_fail('ORDER_NOT_PENDING', o.order_no || CASE
      WHEN o.executed_at IS NOT NULL THEN ' was already executed by ' || coalesce(o.executed_by_name, 'a Pit Manager') || ' (slip ' || coalesce((SELECT slip_no FROM trading_slips WHERE order_id = o.id), '\u2014') || ').'
      WHEN o.status = 'PIT_REJECTED' THEN ' was rejected: ' || coalesce(o.reject_reason, o.reject_code, 'rejected') ELSE
      ' is not waiting for the Pit Manager (status: ' || replace(o.status, '_', ' ') || ').' END, 409);
  END IF;

  IF v_action = 'REJECT' THEN
    IF v_reason IS NULL THEN PERFORM jse_fail('REASON_REQUIRED', 'Give the reason for rejecting ' || o.order_no || ' (the participant and broker see it).', 400); END IF;
    UPDATE orders SET status = 'PIT_REJECTED', reject_code = 'PIT_REJECTED', reject_reason = v_reason, pit_note = v_reason,
           pit_by = nullif(a->>'id', '')::integer, pit_by_name = jse_actor_name(a), pit_at = now(), updated_at = now()
    WHERE id = o.id;
    PERFORM jse_order_event(o.id, 'PIT_REJECTED', 'PIT_PENDING', 'PIT_REJECTED', a, v_reason, NULL);
    PERFORM jse_audit(a, 'PIT_REJECTED', 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', 'PIT_PENDING'),
                      jsonb_build_object('status', 'PIT_REJECTED'), jsonb_build_object('reason', v_reason));
    RETURN jsonb_build_object('success', true, 'status', 'PIT_REJECTED', 'order', jse_order_json(o.id));
  END IF;

  -- EXECUTE
  IF o.price <> s.price THEN
    PERFORM jse__mark_stale(a, o, s.price, 'PRICE_CHECK_AT_EXECUTION');
    RETURN jsonb_build_object('success', false, 'http', 409, 'code', 'PRICE_STALE',
      'error', o.order_no || ' is PRICE STALE: it was submitted at \u20B9' || o.price || ' but the market price is now \u20B9' || s.price ||
               '. It cannot be executed; the broker must submit a fresh order at the new market price.',
      'order', jse_order_json(o.id));
  END IF;
  IF NOT s.active THEN PERFORM jse_fail('SECURITY_INACTIVE', s.symbol || ' is not tradable.', 409); END IF;
  IF s.kind = 'IPO' AND s.listed_at IS NULL THEN PERFORM jse_fail('IPO_NOT_LISTED', s.symbol || ' has not listed yet.', 409); END IF;

  UPDATE orders SET status = 'EXCHANGE_PENDING', executed_at = clock_timestamp(), executed_by = nullif(a->>'id', '')::integer,
         executed_by_name = jse_actor_name(a), executed_price = o.price, executed_quantity = o.quantity,
         pit_by = nullif(a->>'id', '')::integer, pit_by_name = jse_actor_name(a), pit_at = clock_timestamp(), pit_note = v_reason,
         updated_at = now()
  WHERE id = o.id;
  v_slip_id := nextval(pg_get_serial_sequence('trading_slips', 'id'));
  v_slip_no := 'TS-' || lpad(v_slip_id::text, 6, '0');
  INSERT INTO trading_slips(id, slip_no, order_id, issued_at, issued_by, issued_by_name)
  VALUES (v_slip_id, v_slip_no, o.id, clock_timestamp(), nullif(a->>'id', '')::integer, jse_actor_name(a));
  PERFORM jse_order_event(o.id, 'PIT_EXECUTED', 'PIT_PENDING', 'EXCHANGE_PENDING', a,
    'Executed ' || o.side || ' ' || o.quantity || ' ' || s.symbol || ' @ \u20B9' || o.price || ' \xB7 trading slip ' || v_slip_no,
    jsonb_build_object('slip_no', v_slip_no, 'price', o.price, 'quantity', o.quantity, 'trade_value', o.trade_value, 'brokerage', o.brokerage));
  PERFORM jse_audit(a, 'PIT_EXECUTED', 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', 'PIT_PENDING'),
    jsonb_build_object('status', 'EXCHANGE_PENDING', 'executed_price', o.price, 'executed_quantity', o.quantity),
    jsonb_build_object('slip_no', v_slip_no, 'symbol', s.symbol, 'side', o.side, 'trade_value', o.trade_value, 'brokerage', o.brokerage));
  RETURN jsonb_build_object('success', true, 'status', 'EXCHANGE_PENDING', 'slip_no', v_slip_no, 'order', jse_order_json(o.id));
END $$;

-- ---------------------------------------------------------------------------
-- Exchange review of executed orders. Never changes cash, holdings or prices.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_exchange_decide(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  o orders%ROWTYPE;
  v_status text;
  v_action text := upper(coalesce(p->>'action', ''));
  v_confirm boolean := coalesce((p->>'confirm_short_sell')::boolean, false);
  v_reason text := nullif(left(trim(coalesce(p->>'reason', '')), 300), '');
  v_avail record;
  v_to text;
  v_inst_qty integer;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE');
  IF v_action NOT IN ('APPROVE', 'REJECT') THEN PERFORM jse_fail('INVALID_ACTION', 'Use APPROVE or REJECT.', 400); END IF;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Exchange actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status = 'PIT_PENDING' THEN
    PERFORM jse_fail('NOT_EXECUTED', o.order_no || ' has not been executed by the Pit Manager yet.', 409);
  END IF;
  IF o.status <> 'EXCHANGE_PENDING' THEN
    PERFORM jse_fail('ORDER_NOT_PENDING', o.order_no || ' is no longer pending at the Exchange (status: ' || replace(o.status, '_', ' ') || ').', 409);
  END IF;
  IF v_action = 'REJECT' AND v_reason IS NULL THEN v_reason := 'Rejected by Exchange'; END IF;

  IF v_action = 'APPROVE' THEN
    IF o.account_type = 'TEAM' AND o.side = 'SELL' THEN
      SELECT * INTO v_avail FROM jse_available_qty(o.team_id, o.security_id, o.id);
      IF o.quantity > v_avail.available THEN
        IF NOT v_confirm THEN
          RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_CONFIRM_REQUIRED', HINT = '409',
            MESSAGE = 'Short-selling warning: the team can sell only ' || greatest(v_avail.available, 0) || ' shares (holding ' || v_avail.holding ||
                      '). Short selling is not permitted; forwarding it is recorded and the Bank will reject it unless holdings are sufficient.';
        END IF;
        UPDATE orders SET short_sell_flag = true, short_sell_approved = true WHERE id = o.id;
        PERFORM jse_risk(o.team_id, o.id, o.security_id, 'SHORT_SELL_ATTEMPT', 'EXCHANGE', o.side, o.quantity, v_avail.holding, NULL, NULL, NULL);
        PERFORM jse_audit(a, 'SHORT_SELLING_FORWARDED', 'order', o.order_no, o.team_id, o.id, NULL, NULL,
          jsonb_build_object('holding', v_avail.holding, 'quantity', o.quantity, 'open_sell_other', v_avail.open_sell));
      END IF;
    ELSIF o.account_type = 'INSTITUTION' AND o.side = 'SELL' THEN
      SELECT coalesce((SELECT quantity FROM institutional_holdings WHERE institution_id = o.institution_id AND security_id = o.security_id), 0) INTO v_inst_qty;
      IF v_inst_qty < o.quantity AND NOT v_confirm THEN
        RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_CONFIRM_REQUIRED', HINT = '409',
          MESSAGE = 'The institution holds only ' || v_inst_qty || ' shares. Confirm to forward it anyway \u2014 the Bank will reject it unless holdings are sufficient.';
      END IF;
    END IF;
    v_to := 'EXCHANGE_APPROVED';
  ELSE
    v_to := 'EXCHANGE_REJECTED';
  END IF;

  UPDATE orders SET status = v_to, exchange_by = nullif(a->>'id', '')::integer, exchange_by_name = jse_actor_name(a), exchange_at = now(),
         exchange_note = v_reason,
         reject_code = CASE WHEN v_to = 'EXCHANGE_REJECTED' THEN 'EXCHANGE_REJECTED' ELSE NULL END,
         reject_reason = CASE WHEN v_to = 'EXCHANGE_REJECTED' THEN v_reason ELSE NULL END,
         updated_at = now()
  WHERE id = o.id;
  PERFORM jse_order_event(o.id, v_to, 'EXCHANGE_PENDING', v_to, a, v_reason, NULL);
  PERFORM jse_audit(a, v_to, 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', 'EXCHANGE_PENDING'),
                    jsonb_build_object('status', v_to), jsonb_build_object('reason', v_reason, 'account_type', o.account_type));
  PERFORM jse_journal('EXCHANGE_DECISION', o.id, o.order_no || ' ' || v_to, jsonb_build_object('order_id', o.id, 'decision', v_to, 'reason', v_reason), a);
  RETURN jsonb_build_object('success', true, 'status', v_to, 'order', jse_order_json(o.id));
END $$;

-- ---------------------------------------------------------------------------
-- Bank claim (BANK_PENDING) / release
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_bank_claim(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE o orders%ROWTYPE; v_release boolean := coalesce((p->>'release')::boolean, false);
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF v_release THEN
    IF o.status <> 'BANK_PENDING' THEN RETURN jsonb_build_object('success', true, 'status', o.status); END IF;
    UPDATE orders SET status = 'EXCHANGE_APPROVED', bank_claimed_by = NULL, bank_claimed_name = NULL, bank_claimed_at = NULL, updated_at = now() WHERE id = o.id;
    PERFORM jse_order_event(o.id, 'BANK_RELEASED', 'BANK_PENDING', 'EXCHANGE_APPROVED', a, NULL, NULL);
    RETURN jsonb_build_object('success', true, 'status', 'EXCHANGE_APPROVED');
  END IF;
  IF o.status = 'BANK_PENDING' AND o.bank_claimed_by IS DISTINCT FROM nullif(a->>'id', '')::integer
     AND o.bank_claimed_at > now() - interval '2 minutes' THEN
    PERFORM jse_fail('ALREADY_CLAIMED', o.order_no || ' is being verified by ' || coalesce(o.bank_claimed_name, 'another bank operator') || '.', 409);
  END IF;
  IF o.status NOT IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN
    PERFORM jse_fail('NOT_AWAITING_BANK', o.order_no || ' is not waiting for the Bank (status: ' || replace(o.status, '_', ' ') || ').', 409);
  END IF;
  UPDATE orders SET status = 'BANK_PENDING', bank_claimed_by = nullif(a->>'id', '')::integer, bank_claimed_name = jse_actor_name(a),
         bank_claimed_at = now(), updated_at = now() WHERE id = o.id;
  IF o.status = 'EXCHANGE_APPROVED' THEN
    PERFORM jse_order_event(o.id, 'BANK_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING', a, 'Bank verification started', NULL);
  END IF;
  RETURN jsonb_build_object('success', true, 'status', 'BANK_PENDING', 'order', jse_order_json(o.id));
END $$;

-- ---------------------------------------------------------------------------
-- Bank rejection (operator decision or failed validation). Commits the rejection.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__bank_reject(a jsonb, o orders, p_code text, p_reason text, p_details jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $$
BEGIN
  UPDATE orders SET status = 'BANK_REJECTED', reject_code = p_code, reject_reason = p_reason,
         bank_by = nullif(a->>'id', '')::integer, bank_by_name = jse_actor_name(a), bank_at = now(),
         bank_note = p_reason, bank_claimed_by = NULL, bank_claimed_name = NULL, bank_claimed_at = NULL, updated_at = now()
  WHERE id = o.id;
  PERFORM jse_order_event(o.id, 'BANK_REJECTED', o.status, 'BANK_REJECTED', a, p_reason, p_details || jsonb_build_object('code', p_code));
  PERFORM jse_audit(a, 'BANK_REJECTED', 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', o.status),
                    jsonb_build_object('status', 'BANK_REJECTED'), coalesce(p_details, '{}'::jsonb) || jsonb_build_object('code', p_code, 'reason', p_reason));
  PERFORM jse_journal('BANK_REJECT', o.id, o.order_no || ' BANK_REJECTED (' || p_code || ')',
                      jsonb_build_object('order_id', o.id, 'from_status', o.status, 'code', p_code, 'reason', p_reason), a);
  RETURN jsonb_build_object('success', true, 'status', 'BANK_REJECTED', 'code', p_code, 'reason', p_reason,
                            'details', coalesce(p_details, '{}'::jsonb), 'order', jse_order_json(o.id));
END $$;

CREATE OR REPLACE FUNCTION jse_bank_reject(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE o orders%ROWTYPE; v_status text; v_reason text := nullif(left(trim(coalesce(p->>'reason', '')), 300), '');
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status = 'BANK_SETTLED' THEN PERFORM jse_fail('ALREADY_SETTLED', o.order_no || ' is already settled and cannot be rejected.', 409); END IF;
  IF o.status NOT IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN
    PERFORM jse_fail('NOT_AWAITING_BANK', o.order_no || ' is not waiting for the Bank (status: ' || replace(o.status, '_', ' ') || ').', 409);
  END IF;
  RETURN jse__bank_reject(a, o, 'BANK_REJECTED_BY_OPERATOR', coalesce(v_reason, 'Rejected by Bank'), '{}'::jsonb);
END $$;

-- ---------------------------------------------------------------------------
-- Bank settlement: the only place where a trade changes cash and holdings. It never changes the market price.
-- Idempotent: an order can have at most one active settlement (unique index) and the status transition
-- happens under the order row lock.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__settle(a jsonb, p_order_id bigint, p_source text DEFAULT 'BANK')
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE;
  o orders%ROWTYPE;
  s securities%ROWTYPE;
  t teams%ROWTYPE;
  inst institutions%ROWTYPE;
  ln loans%ROWTYPE;
  v_hold integer := 0; v_cost numeric := 0; v_tcost numeric := 0;
  v_ihold integer := 0; v_icost numeric := 0;
  v_tv numeric; v_brk numeric; v_rate numeric; v_req numeric;
  v_cash numeric; v_cash_after numeric;
  v_draw numeric := 0; v_interest numeric := 0; v_room numeric;
  v_cost_moved numeric := 0; v_tcost_moved numeric := 0; v_icost_moved numeric := 0;
  v_realized numeric := 0;
  v_inst_before numeric; v_inst_after numeric;
  v_settle_id bigint;
  v_bal numeric;
  v_team_delta numeric;
  v_hold_after integer;
  v_note text;
  v_team_buys boolean;
BEGIN
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO o FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status = 'BANK_SETTLED' OR EXISTS (SELECT 1 FROM settlements WHERE order_id = o.id AND reversed_at IS NULL) THEN
    PERFORM jse_fail('ALREADY_SETTLED', o.order_no || ' has already been settled. Duplicate settlement blocked.', 409);
  END IF;
  IF o.status NOT IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN
    PERFORM jse_fail('NOT_AWAITING_BANK', o.order_no || ' is not waiting for the Bank (status: ' || replace(o.status, '_', ' ') || ').', 409);
  END IF;
  IF o.status = 'BANK_PENDING' AND o.bank_claimed_by IS NOT NULL AND o.bank_claimed_by IS DISTINCT FROM nullif(a->>'id', '')::integer
     AND o.bank_claimed_at > now() - interval '2 minutes' AND p_source = 'BANK' THEN
    PERFORM jse_fail('ALREADY_CLAIMED', o.order_no || ' is being verified by ' || coalesce(o.bank_claimed_name, 'another bank operator') || '.', 409);
  END IF;

  -- lock order: security -> team -> loan -> holdings -> institution
  SELECT * INTO s FROM securities WHERE id = o.security_id FOR NO KEY UPDATE;
  SELECT * INTO t FROM teams WHERE id = o.team_id FOR UPDATE;
  INSERT INTO loans(team_id) VALUES (o.team_id) ON CONFLICT (team_id) DO NOTHING;
  SELECT * INTO ln FROM loans WHERE team_id = o.team_id FOR UPDATE;
  SELECT quantity, cost_basis, trade_cost INTO v_hold, v_cost, v_tcost FROM holdings WHERE team_id = o.team_id AND security_id = o.security_id FOR UPDATE;
  v_hold := coalesce(v_hold, 0); v_cost := coalesce(v_cost, 0); v_tcost := coalesce(v_tcost, 0);
  IF o.account_type = 'INSTITUTION' THEN
    SELECT * INTO inst FROM institutions WHERE id = o.institution_id FOR UPDATE;
    SELECT quantity, cost_basis INTO v_ihold, v_icost FROM institutional_holdings WHERE institution_id = o.institution_id AND security_id = o.security_id FOR UPDATE;
    v_ihold := coalesce(v_ihold, 0); v_icost := coalesce(v_icost, 0);
  END IF;

  -- independent re-validation (never trust earlier desks alone)
  IF NOT t.active THEN RETURN jse__bank_reject(a, o, 'TEAM_INACTIVE', 'Team ' || t.code || ' is not active.', '{}'::jsonb); END IF;
  IF NOT s.active THEN RETURN jse__bank_reject(a, o, 'SECURITY_INACTIVE', s.symbol || ' is not tradable.', '{}'::jsonb); END IF;
  IF o.quantity <= 0 OR o.quantity % s.lot_size <> 0 THEN
    RETURN jse__bank_reject(a, o, 'INVALID_LOT', 'Quantity must be a multiple of ' || s.lot_size || '.', '{}'::jsonb);
  END IF;
  IF o.price <= 0 THEN
    RETURN jse__bank_reject(a, o, 'INVALID_PRICE', 'Invalid order price.', '{}'::jsonb);
  END IF;
  v_tv := round(o.quantity * o.price, 2);
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    RETURN jse__bank_reject(a, o, 'ORDER_VALUE_LIMIT', 'Order value \u20B9' || v_tv || ' is outside the allowed \u20B9' || cfg.min_order_value || ' to \u20B9' || cfg.max_order_value || '.', '{}'::jsonb);
  END IF;
  -- the brokerage rate is fixed on the order when the broker submits it (shown on the trading slip)
  v_rate := coalesce(o.brokerage_rate, CASE WHEN o.account_type = 'TEAM' OR cfg.institution_brokerage THEN cfg.brokerage_rate ELSE 0 END);
  v_brk := round(v_tv * v_rate, 2);

  v_cash := t.cash;
  v_team_buys := (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL');

  IF v_team_buys THEN
    IF o.account_type = 'INSTITUTION' AND v_ihold < o.quantity THEN
      RETURN jse__bank_reject(a, o, 'INSTITUTION_INSUFFICIENT_HOLDINGS', 'The institution holds only ' || v_ihold || ' ' || s.symbol || ' shares.',
        jsonb_build_object('holding', v_ihold, 'quantity', o.quantity));
    END IF;
    v_req := v_tv + v_brk;
    IF v_cash < v_req THEN
      -- own money first: only the shortfall is borrowed, automatically, within the loan limit
      v_room := CASE WHEN cfg.loans_enabled THEN greatest(0, cfg.loan_max_principal - ln.original_principal) ELSE 0 END;
      v_draw := v_req - v_cash;
      IF NOT (cfg.loans_enabled AND cfg.auto_loan_on_settlement) OR v_draw > v_room THEN
        IF o.account_type = 'TEAM' THEN
          PERFORM jse_risk(t.id, o.id, s.id, 'INSUFFICIENT_BALANCE_REJECTION', 'BANK', o.side, o.quantity, v_hold, v_req, v_cash,
                           'Loan room \u20B9' || v_room);
          PERFORM jse_audit(a, 'INSUFFICIENT_BALANCE_REJECTED', 'order', o.order_no, t.id, o.id, NULL, NULL,
            jsonb_build_object('required', v_req, 'cash', v_cash, 'loan_room', v_room));
        END IF;
        RETURN jse__bank_reject(a, o, 'INSUFFICIENT_BALANCE',
          'Insufficient balance: \u20B9' || v_req || ' is needed but ' || t.code || ' has \u20B9' || v_cash ||
          CASE WHEN cfg.loans_enabled AND cfg.auto_loan_on_settlement THEN ' plus \u20B9' || v_room || ' of loan room' ELSE '' END || '.',
          jsonb_build_object('required', v_req, 'cash', v_cash, 'loan_room', v_room));
      END IF;
      v_interest := round(v_draw * cfg.loan_interest_rate, 2);
    END IF;
  ELSE
    IF v_hold < o.quantity THEN
      IF o.account_type = 'TEAM' THEN
        PERFORM jse_risk(t.id, o.id, s.id, 'SHORT_SELL_ATTEMPT', 'BANK', o.side, o.quantity, v_hold, NULL, NULL, 'Rejected at Bank');
        PERFORM jse_audit(a, 'SHORT_SELLING_ATTEMPT', 'order', o.order_no, t.id, o.id, NULL, NULL,
          jsonb_build_object('quantity', o.quantity, 'holding', v_hold, 'stage', 'BANK'));
        RETURN jse__bank_reject(a, o, 'SHORT_SELLING_NOT_ALLOWED',
          'Short selling is not allowed: ' || t.code || ' holds ' || v_hold || ' ' || s.symbol || ' shares but the order sells ' || o.quantity || '.',
          jsonb_build_object('holding', v_hold, 'quantity', o.quantity));
      END IF;
      RETURN jse__bank_reject(a, o, 'COUNTERPARTY_INSUFFICIENT_HOLDINGS',
        'Counterparty ' || t.code || ' holds only ' || v_hold || ' ' || s.symbol || ' shares.', jsonb_build_object('holding', v_hold, 'quantity', o.quantity));
    END IF;
    IF o.account_type = 'INSTITUTION' AND NOT cfg.institution_overdraft AND inst.cash < v_tv THEN
      RETURN jse__bank_reject(a, o, 'INSTITUTION_INSUFFICIENT_FUNDS', 'The institution has only \u20B9' || inst.cash || ' available.',
        jsonb_build_object('cash', inst.cash, 'required', v_tv));
    END IF;
  END IF;

  -- ===== all checks passed: apply =====
  INSERT INTO settlements(order_id, account_type, team_id, institution_id, security_id, side, quantity, price, trade_value, brokerage,
                          team_cash_delta, team_cash_before, team_cash_after, holding_before, holding_after,
                          price_before, price_after, previous_price_before, settled_by, settled_by_name)
  VALUES (o.id, o.account_type, t.id, o.institution_id, s.id, o.side, o.quantity, o.price, v_tv, v_brk,
          0, v_cash, v_cash, v_hold, v_hold, s.price, s.price, s.previous_price,
          nullif(a->>'id', '')::integer, jse_actor_name(a))
  RETURNING id INTO v_settle_id;

  v_bal := v_cash;
  IF v_team_buys THEN
    IF v_draw > 0 THEN
      v_bal := v_bal + v_draw;
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'LOAN_DRAW', 0, v_draw, v_bal,
        'Automatic loan draw for the cash shortfall on ' || o.order_no, a);
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'INTEREST_CHARGE', 0, 0, v_bal,
        'Loan interest charged \u20B9' || v_interest || ' (' || jse_rate_text(cfg.loan_interest_rate) || ' on \u20B9' || v_draw || ') \u2014 added to the loan balance, no cash moved', a);
      UPDATE loans SET original_principal = original_principal + v_draw, principal_outstanding = principal_outstanding + v_draw,
             interest_outstanding = interest_outstanding + v_interest, interest_charged = interest_charged + v_interest,
             draws = draws + 1, status = 'OUTSTANDING', updated_at = now()
      WHERE team_id = t.id;
      INSERT INTO loan_transactions(team_id, kind, amount, order_id, settlement_id, automatic, note, actor_id, actor_name)
      VALUES (t.id, 'DRAW', v_draw, o.id, v_settle_id, true, 'Automatic draw at settlement of ' || o.order_no, nullif(a->>'id', '')::integer, jse_actor_name(a)),
             (t.id, 'INTEREST_CHARGE', v_interest, o.id, v_settle_id, true, jse_rate_text(cfg.loan_interest_rate) || ' interest on draw', nullif(a->>'id', '')::integer, jse_actor_name(a));
      PERFORM jse_audit(a, 'LOAN_DRAW', 'loan', t.code, t.id, o.id, NULL, NULL,
        jsonb_build_object('amount', v_draw, 'interest', v_interest, 'automatic', true, 'order_no', o.order_no));
    END IF;
    v_bal := v_bal - v_tv;
    v_note := CASE WHEN o.account_type = 'INSTITUTION' THEN 'Bought ' || o.quantity || ' ' || s.symbol || ' @ \u20B9' || o.price || ' from ' || inst.code
                   ELSE 'Bought ' || o.quantity || ' ' || s.symbol || ' @ \u20B9' || o.price END;
    PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BUY', v_tv, 0, v_bal, v_note, a);
    IF v_brk > 0 THEN
      v_bal := v_bal - v_brk;
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BROKERAGE', v_brk, 0, v_bal, 'Brokerage ' || jse_rate_text(v_rate) || ' on ' || o.order_no, a);
    END IF;
    INSERT INTO holdings(team_id, security_id, quantity, cost_basis, trade_cost) VALUES (t.id, s.id, o.quantity, v_tv + v_brk, v_tv)
    ON CONFLICT (team_id, security_id) DO UPDATE SET quantity = holdings.quantity + EXCLUDED.quantity,
      cost_basis = holdings.cost_basis + EXCLUDED.cost_basis, trade_cost = holdings.trade_cost + EXCLUDED.trade_cost, updated_at = now();
    v_hold_after := v_hold + o.quantity;
    v_cost_moved := v_tv + v_brk; v_tcost_moved := v_tv;
    v_team_delta := v_draw - v_tv - v_brk;
    IF o.account_type = 'INSTITUTION' THEN
      v_icost_moved := CASE WHEN v_ihold = o.quantity THEN v_icost ELSE round(v_icost * o.quantity / v_ihold, 4) END;
      UPDATE institutional_holdings SET quantity = quantity - o.quantity, cost_basis = greatest(0, cost_basis - v_icost_moved), updated_at = now()
      WHERE institution_id = inst.id AND security_id = s.id;
      DELETE FROM institutional_holdings WHERE institution_id = inst.id AND security_id = s.id AND quantity = 0;
      v_inst_before := inst.cash; v_inst_after := inst.cash + v_tv;
      UPDATE institutions SET cash = v_inst_after, updated_at = now() WHERE id = inst.id;
      PERFORM jse_inst_ledger(inst.id, o.id, v_settle_id, 'SELL', 0, v_tv, v_inst_after,
        'Sold ' || o.quantity || ' ' || s.symbol || ' @ \u20B9' || o.price || ' to ' || t.code, a);
    END IF;
  ELSE
    v_cost_moved := CASE WHEN v_hold = o.quantity THEN v_cost ELSE round(v_cost * o.quantity / v_hold, 4) END;
    v_tcost_moved := CASE WHEN v_hold = o.quantity THEN v_tcost ELSE round(v_tcost * o.quantity / v_hold, 4) END;
    UPDATE holdings SET quantity = quantity - o.quantity, cost_basis = greatest(0, cost_basis - v_cost_moved),
           trade_cost = greatest(0, trade_cost - v_tcost_moved), updated_at = now()
    WHERE team_id = t.id AND security_id = s.id;
    DELETE FROM holdings WHERE team_id = t.id AND security_id = s.id AND quantity = 0;
    v_hold_after := v_hold - o.quantity;
    v_bal := v_bal + v_tv;
    v_note := CASE WHEN o.account_type = 'INSTITUTION' THEN 'Sold ' || o.quantity || ' ' || s.symbol || ' @ \u20B9' || o.price || ' to ' || inst.code
                   ELSE 'Sold ' || o.quantity || ' ' || s.symbol || ' @ \u20B9' || o.price END;
    PERFORM jse_ledger(t.id, o.id, v_settle_id, 'SELL', 0, v_tv, v_bal, v_note, a);
    IF v_brk > 0 THEN
      v_bal := v_bal - v_brk;
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BROKERAGE', v_brk, 0, v_bal, 'Brokerage ' || jse_rate_text(v_rate) || ' on ' || o.order_no, a);
    END IF;
    v_realized := round(v_tv - v_brk - v_cost_moved, 2);
    v_team_delta := v_tv - v_brk;
    IF o.account_type = 'INSTITUTION' THEN
      INSERT INTO institutional_holdings(institution_id, security_id, quantity, cost_basis) VALUES (inst.id, s.id, o.quantity, v_tv)
      ON CONFLICT (institution_id, security_id) DO UPDATE SET quantity = institutional_holdings.quantity + EXCLUDED.quantity,
        cost_basis = institutional_holdings.cost_basis + EXCLUDED.cost_basis, updated_at = now();
      v_icost_moved := v_tv;
      v_inst_before := inst.cash; v_inst_after := inst.cash - v_tv;
      UPDATE institutions SET cash = v_inst_after, updated_at = now() WHERE id = inst.id;
      PERFORM jse_inst_ledger(inst.id, o.id, v_settle_id, 'BUY', v_tv, 0, v_inst_after,
        'Bought ' || o.quantity || ' ' || s.symbol || ' @ \u20B9' || o.price || ' from ' || t.code, a);
    END IF;
  END IF;

  v_cash_after := v_bal;
  IF v_cash_after < 0 THEN
    RAISE EXCEPTION 'JSE invariant: negative cash for % on %', t.code, o.order_no;
  END IF;
  UPDATE teams SET cash = v_cash_after, realized_pnl = realized_pnl + v_realized, brokerage_paid = brokerage_paid + v_brk, updated_at = now()
  WHERE id = t.id;

  IF v_brk > 0 AND o.broker_id IS NOT NULL AND o.account_type = 'TEAM' THEN
    INSERT INTO broker_commissions(order_id, settlement_id, broker_id, team_id, side, trade_value, rate, amount)
    VALUES (o.id, v_settle_id, o.broker_id, t.id, o.side, v_tv, v_rate, v_brk);
  END IF;

  -- trade statistics only: settlement never changes the market price (Market News is the only price engine)
  UPDATE securities SET trade_count = trade_count + 1, traded_quantity = traded_quantity + o.quantity, traded_value = traded_value + v_tv,
         last_trade_at = now() WHERE id = s.id;

  UPDATE settlements SET brokerage = v_brk, team_cash_delta = v_team_delta, team_cash_after = v_cash_after, holding_after = v_hold_after,
         cost_moved = v_cost_moved, trade_cost_moved = v_tcost_moved, inst_cost_moved = v_icost_moved, realized_pnl = v_realized,
         loan_drawn = v_draw, loan_interest = v_interest, institution_cash_before = v_inst_before, institution_cash_after = v_inst_after
  WHERE id = v_settle_id;

  UPDATE orders SET status = 'BANK_SETTLED',
         bank_by = nullif(a->>'id', '')::integer, bank_by_name = jse_actor_name(a), bank_at = now(),
         bank_claimed_by = NULL, bank_claimed_name = NULL, bank_claimed_at = NULL,
         reject_code = NULL, reject_reason = NULL, updated_at = now()
  WHERE id = o.id;

  PERFORM jse_order_event(o.id, 'BANK_SETTLED', o.status, 'BANK_SETTLED', a, NULL,
    jsonb_build_object('trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'cash_before', v_cash, 'cash_after', v_cash_after,
                       'loan_drawn', v_draw, 'loan_interest', v_interest));
  PERFORM jse_order_event(o.id, 'HOLDINGS_UPDATED', 'BANK_SETTLED', 'BANK_SETTLED', a,
    t.code || ' cash \u20B9' || v_cash || ' \u2192 \u20B9' || v_cash_after || '; ' || s.symbol || ' holding ' || v_hold || ' \u2192 ' || v_hold_after ||
    '; market price unchanged at \u20B9' || s.price || ' (prices move only on Market News)',
    jsonb_build_object('holding_before', v_hold, 'holding_after', v_hold_after, 'market_price', s.price));
  PERFORM jse_audit(a, 'BANK_SETTLED', 'order', o.order_no, t.id, o.id,
    jsonb_build_object('status', o.status, 'cash', v_cash, 'holding', v_hold),
    jsonb_build_object('status', 'BANK_SETTLED', 'cash', v_cash_after, 'holding', v_hold_after),
    jsonb_build_object('account_type', o.account_type, 'side', o.side, 'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate,
                       'loan_drawn', v_draw, 'interest', v_interest, 'realized_pnl', v_realized, 'market_price', s.price, 'source', p_source));
  PERFORM jse_journal('BANK_SETTLE', v_settle_id, o.order_no || ' settled (' || o.side || ' ' || o.quantity || ' ' || s.symbol || ' @ \u20B9' || o.price || ')',
                      jsonb_build_object('order_id', o.id, 'settlement_id', v_settle_id), a);

  RETURN jsonb_build_object('success', true, 'status', 'BANK_SETTLED', 'settlement_id', v_settle_id,
    'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'cash_before', v_cash, 'cash_after', v_cash_after,
    'loan_drawn', v_draw, 'loan_interest', v_interest, 'realized_pnl', v_realized,
    'holding_before', v_hold, 'holding_after', v_hold_after, 'market_price', s.price, 'order', jse_order_json(o.id));
END $$;

CREATE OR REPLACE FUNCTION jse_bank_settle(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_status text;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank settlement is allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  RETURN jse__settle(a, nullif(p->>'order_id', '')::bigint, 'BANK');
END $$;

-- Paired buyer/seller ticket: two linked orders created atomically (both or neither); each leg follows
-- the normal broker rules (assigned teams only, market price).
CREATE OR REPLACE FUNCTION jse_place_pair(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  legs jsonb := p->'legs';
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_pair text; r1 jsonb; r2 jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER');
  IF v_key IS NULL THEN PERFORM jse_fail('IDEMPOTENCY_KEY_REQUIRED', 'Order submission is missing its request key. Reload the page and try again.', 400); END IF;
  IF jsonb_typeof(legs) IS DISTINCT FROM 'array' OR jsonb_array_length(legs) <> 2 THEN
    PERFORM jse_fail('INVALID_PAIR', 'A paired trade needs exactly one BUY leg and one SELL leg.', 400);
  END IF;
  IF upper(coalesce(legs->0->>'side', '')) = upper(coalesce(legs->1->>'side', '')) THEN
    PERFORM jse_fail('INVALID_PAIR', 'A paired trade needs one BUY leg and one SELL leg.', 400);
  END IF;
  IF upper(trim(coalesce(legs->0->>'team', ''))) = upper(trim(coalesce(legs->1->>'team', ''))) THEN
    PERFORM jse_fail('INVALID_PAIR', 'Buyer and seller must be different teams.', 400);
  END IF;
  v_pair := 'PAIR-' || upper(substr(md5(v_key), 1, 8));
  r1 := jse_place_order(a, (legs->0) || jsonb_build_object('pair_ref', v_pair, 'idempotency_key', v_key || ':0'));
  r2 := jse_place_order(a, (legs->1) || jsonb_build_object('pair_ref', v_pair, 'idempotency_key', v_key || ':1'));
  RETURN jsonb_build_object('success', true, 'pair_ref', v_pair, 'legs', jsonb_build_array(r1, r2));
END $$;

INSERT INTO schema_migrations(version) VALUES ('002_core');
`;var Va=`-- JAIN STOCK EXCHANGE (JSE) v311
-- 003_ops.sql: institutional orders, loans, Market News (the only price engine), event control,
-- participant instructions, team names, IPO round (applications, allotments, prospectus, listing),
-- reset, undo / redo and administration.
-- Material administrative actions call jse_require_admin_password (one password dialog per action).

-- ---------------------------------------------------------------------------
-- Institutional order: separate desk, counterparty participant team, canonical market price, then the same
-- Pit Manager \u2192 Exchange \u2192 Bank workflow. Institutions never set prices.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_place_institutional_order(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE;
  v_status text;
  v_inst institutions%ROWTYPE;
  v_team teams%ROWTYPE;
  v_sec securities%ROWTYPE;
  v_side text := upper(trim(coalesce(p->>'side', '')));
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_qty integer; v_expected numeric; v_tv numeric; v_brk numeric := 0; v_rate numeric := 0;
  v_id bigint; v_no text; v_existing bigint;
  v_warnings jsonb := '[]'::jsonb;
  v_hold integer; v_ihold integer;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL');
  IF v_key IS NULL OR length(v_key) > 120 THEN
    PERFORM jse_fail('IDEMPOTENCY_KEY_REQUIRED', 'Order submission is missing its request key. Reload the page and try again.', 400);
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('jse-order:' || v_key, 0));
  SELECT id INTO v_existing FROM orders WHERE idempotency_key = v_key;
  IF FOUND THEN RETURN jsonb_build_object('success', true, 'replayed', true, 'order', jse_order_json(v_existing), 'warnings', '[]'::jsonb); END IF;

  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  IF v_status <> 'LIVE' THEN
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  SELECT * INTO v_inst FROM institutions
  WHERE id = coalesce(CASE WHEN a->>'role' = 'ADMIN' THEN nullif(p->>'institution_id', '')::integer END,
                      nullif(a->>'institution_id', '')::integer, (SELECT min(id) FROM institutions));
  IF NOT FOUND THEN PERFORM jse_fail('INSTITUTION_NOT_FOUND', 'Institutional account not found.', 404); END IF;
  SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(p->>'counterparty_team', p->>'team', '')));
  IF NOT FOUND THEN PERFORM jse_fail('COUNTERPARTY_REQUIRED', 'Select the counterparty participant team.', 400); END IF;
  SELECT * INTO v_sec FROM securities
  WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')))
  FOR KEY SHARE;
  IF NOT FOUND OR NOT v_sec.active THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a valid listed stock.', 404); END IF;
  IF v_sec.kind = 'IPO' AND v_sec.listed_at IS NULL THEN
    PERFORM jse_fail('IPO_NOT_LISTED', v_sec.symbol || ' is still in the IPO stage and cannot be traded yet.', 409);
  END IF;
  IF v_side NOT IN ('BUY', 'SELL') THEN PERFORM jse_fail('INVALID_SIDE', 'Choose BUY or SELL.', 400); END IF;
  BEGIN
    v_qty := (p->>'quantity')::integer; v_expected := nullif(p->>'expected_price', '')::numeric;
  EXCEPTION WHEN others THEN PERFORM jse_fail('INVALID_NUMBER', 'Quantity must be a whole number of shares.', 400);
  END;
  IF v_qty IS NULL OR v_qty <= 0 OR v_qty % v_sec.lot_size <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' trades in multiples of ' || v_sec.lot_size || ' shares.', 400);
  END IF;
  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'PRICE_CHANGED', HINT = '409',
      MESSAGE = 'The market price of ' || v_sec.symbol || ' changed from \u20B9' || v_expected || ' to \u20B9' || v_sec.price || ' (Market News). Review and submit again.';
  END IF;
  v_tv := round(v_qty * v_sec.price, 2);
  IF cfg.institution_brokerage THEN v_rate := cfg.brokerage_rate; v_brk := round(v_tv * v_rate, 2); END IF;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between \u20B9' || cfg.min_order_value || ' and \u20B9' || cfg.max_order_value || ' per order.', 400);
  END IF;

  IF v_side = 'BUY' THEN
    SELECT coalesce((SELECT quantity FROM holdings WHERE team_id = v_team.id AND security_id = v_sec.id), 0) INTO v_hold;
    IF v_hold < v_qty THEN
      v_warnings := v_warnings || jsonb_build_object('code', 'COUNTERPARTY_HOLDINGS', 'message',
        v_team.code || ' currently holds ' || v_hold || ' ' || v_sec.symbol || ' shares; the Bank will reject unless it holds ' || v_qty || '.');
    END IF;
  ELSE
    SELECT coalesce((SELECT quantity FROM institutional_holdings WHERE institution_id = v_inst.id AND security_id = v_sec.id), 0) INTO v_ihold;
    IF v_ihold < v_qty THEN
      v_warnings := v_warnings || jsonb_build_object('code', 'INSTITUTION_HOLDINGS', 'message',
        v_inst.code || ' holds ' || v_ihold || ' ' || v_sec.symbol || ' shares; the Bank will reject unless it holds ' || v_qty || '.');
    END IF;
  END IF;

  v_id := nextval(pg_get_serial_sequence('orders', 'id'));
  v_no := 'INS-' || lpad(v_id::text, 6, '0');
  INSERT INTO orders(id, order_no, account_type, team_id, institution_id, broker_id, security_id, side, quantity, price, trade_value, brokerage,
                     brokerage_rate, settlement_amount, reference_price, status, notes, idempotency_key, created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'INSTITUTION', v_team.id, v_inst.id, NULL, v_sec.id, v_side, v_qty, v_sec.price, v_tv, v_brk,
          v_rate, CASE WHEN v_side = 'SELL' THEN v_tv + v_brk ELSE v_tv - v_brk END, v_sec.price, 'PIT_PENDING', left(p->>'notes', 300), v_key,
          nullif(a->>'id', '')::integer, jse_actor_name(a), a->>'role');
  PERFORM jse_order_event(v_id, 'INSTITUTION_SUBMITTED', NULL, 'PIT_PENDING', a,
    'Institutional order at the market price \u20B9' || v_sec.price || '; counterparty ' || v_team.code,
    jsonb_build_object('price', v_sec.price, 'trade_value', v_tv, 'institution', v_inst.code));
  PERFORM jse_audit(a, 'ORDER_SUBMITTED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'PIT_PENDING', 'side', v_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_sec.price),
    jsonb_build_object('account_type', 'INSTITUTION', 'institution', v_inst.code, 'counterparty', v_team.code, 'trade_value', v_tv));
  RETURN jsonb_build_object('success', true, 'replayed', false, 'order', jse_order_json(v_id), 'warnings', v_warnings);
END $$;

-- ---------------------------------------------------------------------------
-- Loans (Bank authority). Interest is charged at the configured rate on every draw. Repayment pays
-- interest first, then principal; after a partial repayment, fresh interest at the configured rate is
-- charged on the principal that remains. There is no minimum cash buffer.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_loan_action(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE; v_status text;
  t teams%ROWTYPE; ln loans%ROWTYPE;
  v_action text := upper(coalesce(p->>'action', ''));
  v_amount numeric; v_due numeric;
  v_interest numeric; v_int_pay numeric; v_prin_pay numeric; v_prin_left numeric; v_fresh numeric := 0;
  v_bal numeric; v_room numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY', 'CLOSED') OR (v_status = 'CLOSED' AND v_action <> 'REPAY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Loan draws are allowed while the event is LIVE or SETTLEMENT ONLY; repayments also after CLOSE (before FINALIZE).', 409);
  END IF;
  SELECT * INTO t FROM teams WHERE code = upper(trim(coalesce(p->>'team', ''))) FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Select a valid team.', 404); END IF;
  INSERT INTO loans(team_id) VALUES (t.id) ON CONFLICT (team_id) DO NOTHING;
  SELECT * INTO ln FROM loans WHERE team_id = t.id FOR UPDATE;
  BEGIN v_amount := round((p->>'amount')::numeric, 2);
  EXCEPTION WHEN others THEN PERFORM jse_fail('INVALID_AMOUNT', 'Enter a valid amount.', 400);
  END;
  IF v_amount IS NULL OR v_amount <= 0 THEN PERFORM jse_fail('INVALID_AMOUNT', 'Amount must be greater than zero.', 400); END IF;

  IF v_action = 'DRAW' THEN
    IF NOT cfg.loans_enabled THEN PERFORM jse_fail('LOANS_DISABLED', 'Borrowing is not permitted right now.', 409); END IF;
    v_room := greatest(0, cfg.loan_max_principal - ln.original_principal);
    IF v_amount > v_room THEN
      PERFORM jse_fail('LOAN_LIMIT', 'Only \u20B9' || v_room || ' of the \u20B9' || cfg.loan_max_principal || ' loan limit is left for ' || t.code || '.', 409);
    END IF;
    v_interest := round(v_amount * cfg.loan_interest_rate, 2);
    v_bal := t.cash + v_amount;
    UPDATE teams SET cash = v_bal, updated_at = now() WHERE id = t.id;
    UPDATE loans SET original_principal = original_principal + v_amount, principal_outstanding = principal_outstanding + v_amount,
           interest_outstanding = interest_outstanding + v_interest, interest_charged = interest_charged + v_interest,
           draws = draws + 1, status = 'OUTSTANDING', updated_at = now() WHERE team_id = t.id;
    PERFORM jse_ledger(t.id, NULL, NULL, 'LOAN_DRAW', 0, v_amount, v_bal, 'Loan draw by the Bank', a);
    PERFORM jse_ledger(t.id, NULL, NULL, 'INTEREST_CHARGE', 0, 0, v_bal,
      'Loan interest charged \u20B9' || v_interest || ' (' || jse_rate_text(cfg.loan_interest_rate) || ' on \u20B9' || v_amount || ') \u2014 added to the loan balance, no cash moved', a);
    INSERT INTO loan_transactions(team_id, kind, amount, automatic, note, actor_id, actor_name)
    VALUES (t.id, 'DRAW', v_amount, false, 'Loan draw', nullif(a->>'id', '')::integer, jse_actor_name(a)),
           (t.id, 'INTEREST_CHARGE', v_interest, false, jse_rate_text(cfg.loan_interest_rate) || ' interest on draw', nullif(a->>'id', '')::integer, jse_actor_name(a));
    PERFORM jse_audit(a, 'LOAN_DRAW', 'loan', t.code, t.id, NULL, jsonb_build_object('cash', t.cash, 'principal', ln.principal_outstanding, 'interest', ln.interest_outstanding),
      jsonb_build_object('cash', v_bal, 'principal', ln.principal_outstanding + v_amount, 'interest', ln.interest_outstanding + v_interest),
      jsonb_build_object('amount', v_amount, 'interest_charged', v_interest, 'rate', cfg.loan_interest_rate));
    RETURN jsonb_build_object('success', true, 'action', 'DRAW', 'team', t.code, 'amount', v_amount, 'interest_charged', v_interest, 'cash', v_bal,
                              'loan', (SELECT to_jsonb(l) FROM loans l WHERE l.team_id = t.id));
  ELSIF v_action = 'REPAY' THEN
    v_due := ln.principal_outstanding + ln.interest_outstanding;
    IF v_due <= 0 THEN PERFORM jse_fail('NO_LOAN', t.code || ' has no outstanding loan.', 409); END IF;
    IF v_amount > v_due THEN
      PERFORM jse_fail('REPAYMENT_EXCEEDS_DUE', 'Repayment is more than the amount due (\u20B9' || v_due || ').', 409);
    END IF;
    IF v_amount > t.cash THEN
      PERFORM jse_fail('REPAYMENT_CASH_LIMIT', t.code || ' has only \u20B9' || t.cash || ' in cash.', 409);
    END IF;
    v_int_pay := least(v_amount, ln.interest_outstanding);
    v_prin_pay := least(v_amount - v_int_pay, ln.principal_outstanding);
    v_prin_left := ln.principal_outstanding - v_prin_pay;
    v_bal := t.cash;
    IF v_int_pay > 0 THEN
      v_bal := v_bal - v_int_pay;
      PERFORM jse_ledger(t.id, NULL, NULL, 'INTEREST', v_int_pay, 0, v_bal, 'Loan interest repaid (interest is repaid first)', a);
      INSERT INTO loan_transactions(team_id, kind, amount, note, actor_id, actor_name)
      VALUES (t.id, 'INTEREST_REPAYMENT', v_int_pay, 'Interest repayment', nullif(a->>'id', '')::integer, jse_actor_name(a));
    END IF;
    IF v_prin_pay > 0 THEN
      v_bal := v_bal - v_prin_pay;
      PERFORM jse_ledger(t.id, NULL, NULL, 'LOAN_REPAYMENT', v_prin_pay, 0, v_bal,
        'Loan principal repaid' || CASE WHEN v_prin_left > 0 THEN ' (\u20B9' || v_prin_left || ' principal remains)' ELSE ' (principal cleared)' END, a);
      INSERT INTO loan_transactions(team_id, kind, amount, note, actor_id, actor_name)
      VALUES (t.id, 'PRINCIPAL_REPAYMENT', v_prin_pay, 'Principal repayment', nullif(a->>'id', '')::integer, jse_actor_name(a));
      IF v_prin_left > 0 THEN
        v_fresh := round(v_prin_left * cfg.loan_interest_rate, 2);
        IF v_fresh > 0 THEN
          PERFORM jse_ledger(t.id, NULL, NULL, 'INTEREST_CHARGE', 0, 0, v_bal,
            'Fresh interest \u20B9' || v_fresh || ' (' || jse_rate_text(cfg.loan_interest_rate) || ' on the remaining principal \u20B9' || v_prin_left ||
            ' after a partial repayment) \u2014 added to the loan balance, no cash moved', a);
          INSERT INTO loan_transactions(team_id, kind, amount, note, actor_id, actor_name)
          VALUES (t.id, 'INTEREST_CHARGE', v_fresh, jse_rate_text(cfg.loan_interest_rate) || ' fresh interest on remaining principal \u20B9' || v_prin_left,
                  nullif(a->>'id', '')::integer, jse_actor_name(a));
        END IF;
      END IF;
    END IF;
    UPDATE teams SET cash = v_bal, updated_at = now() WHERE id = t.id;
    UPDATE loans SET interest_outstanding = interest_outstanding - v_int_pay + v_fresh, principal_outstanding = v_prin_left,
           interest_paid = interest_paid + v_int_pay, principal_repaid = principal_repaid + v_prin_pay, interest_charged = interest_charged + v_fresh,
           status = CASE WHEN v_prin_left = 0 AND interest_outstanding - v_int_pay + v_fresh = 0 THEN 'REPAID' ELSE 'OUTSTANDING' END,
           updated_at = now() WHERE team_id = t.id;
    PERFORM jse_audit(a, 'LOAN_REPAYMENT', 'loan', t.code, t.id, NULL,
      jsonb_build_object('cash', t.cash, 'principal', ln.principal_outstanding, 'interest', ln.interest_outstanding),
      jsonb_build_object('cash', v_bal, 'principal', v_prin_left, 'interest', ln.interest_outstanding - v_int_pay + v_fresh),
      jsonb_build_object('amount', v_amount, 'interest_paid', v_int_pay, 'principal_paid', v_prin_pay, 'fresh_interest', v_fresh,
                         'fully_repaid', v_prin_left = 0 AND ln.interest_outstanding - v_int_pay + v_fresh = 0));
    RETURN jsonb_build_object('success', true, 'action', 'REPAY', 'team', t.code, 'amount', v_amount, 'interest_paid', v_int_pay,
                              'principal_paid', v_prin_pay, 'fresh_interest', v_fresh, 'cash', v_bal,
                              'loan', (SELECT to_jsonb(l) FROM loans l WHERE l.team_id = t.id));
  END IF;
  PERFORM jse_fail('INVALID_ACTION', 'Use DRAW or REPAY.', 400);
  RETURN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Market News: the canonical price engine (administrator only). Severity sets the band, the move is
-- random inside the band, capped at \xB110%.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_mood_band(p_mood text) RETURNS numeric[] LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE upper(replace(trim(p_mood), ' ', '_'))
    WHEN 'VERY_SEVERE'    THEN ARRAY[-10.00, -7.50]
    WHEN 'SEVERE'         THEN ARRAY[-7.49, -5.00]
    WHEN 'NEGATIVE'       THEN ARRAY[-4.99, -1.00]
    WHEN 'NORMAL'         THEN ARRAY[-0.99, 0.99]
    WHEN 'POSITIVE'       THEN ARRAY[1.00, 4.99]
    WHEN 'VERY_POSITIVE'  THEN ARRAY[5.00, 7.49]
    WHEN 'SUPER_POSITIVE' THEN ARRAY[7.50, 10.00]
  END::numeric[]
$$;

CREATE OR REPLACE FUNCTION jse__apply_news_price(a jsonb, s securities, p_mood text, p_req numeric, p_new numeric, p_headline text)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_news bigint; v_applied numeric; v_stale integer;
BEGIN
  v_applied := jse_pct(p_new, s.price);
  INSERT INTO market_news(security_id, mood, headline, requested_pct, applied_pct, previous_price, new_price, prior_previous, created_by, created_by_name)
  VALUES (s.id, p_mood, p_headline, p_req, v_applied, s.price, p_new, s.previous_price, nullif(a->>'id', '')::integer, jse_actor_name(a))
  RETURNING id INTO v_news;
  v_stale := jse__set_price(a, s.id, p_new, 'MARKET_NEWS', v_news);
  PERFORM jse_audit(a, 'MARKET_NEWS_PRICE_MOVE', 'security', s.symbol, NULL, NULL,
    jsonb_build_object('price', s.price, 'previous_price', s.previous_price), jsonb_build_object('price', p_new, 'previous_price', s.price),
    jsonb_build_object('company', s.name, 'symbol', s.symbol, 'headline', p_headline, 'severity', p_mood, 'requested_pct', p_req,
                       'applied_pct', v_applied, 'previous_price', s.price, 'new_price', p_new, 'news_id', v_news, 'stale_orders', v_stale,
                       'source', 'MARKET_NEWS'));
  PERFORM jse_journal('MARKET_NEWS', v_news, s.symbol || ' ' || replace(p_mood, '_', ' ') || ' ' || CASE WHEN v_applied > 0 THEN '+' ELSE '' END || to_char(v_applied, 'FM990.00') || '% (\u20B9' || s.price || ' \u2192 \u20B9' || p_new || ')',
                      jsonb_build_object('news_id', v_news, 'security_id', s.id), a);
  RETURN jsonb_build_object('success', true, 'news_id', v_news, 'symbol', s.symbol, 'name', s.name, 'mood', p_mood, 'headline', p_headline,
    'requested_pct', p_req, 'applied_pct', v_applied, 'previous_price', s.price, 'new_price', p_new, 'stale_orders', v_stale, 'source', 'MARKET_NEWS');
END $$;

CREATE OR REPLACE FUNCTION jse_market_news(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE; v_status text; s securities%ROWTYPE;
  v_mood text := upper(replace(trim(coalesce(p->>'mood', p->>'severity', '')), ' ', '_'));
  v_headline text := nullif(left(trim(coalesce(p->>'headline', '')), 240), '');
  v_band numeric[]; v_pct numeric; v_new numeric; v_lo numeric; v_hi numeric; v_cap numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('NOT_STARTED', 'LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_CLOSED', 'Market News is not allowed after the market has closed.', 409);
  END IF;
  v_band := jse_mood_band(v_mood);
  IF v_band IS NULL THEN PERFORM jse_fail('INVALID_MOOD', 'Choose a news severity.', 400); END IF;
  SELECT * INTO s FROM securities WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')));
  IF NOT FOUND THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a company.', 404); END IF;
  IF s.kind = 'IPO' AND s.listed_at IS NULL THEN
    PERFORM jse_fail('IPO_NOT_LISTED', s.symbol || ' is still in the IPO stage; Market News applies once it lists.', 409);
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('jse-news:' || s.id, 0));
  SELECT * INTO s FROM securities WHERE id = s.id FOR UPDATE;
  v_pct := round((v_band[1] + random() * (v_band[2] - v_band[1]))::numeric, 2);
  v_new := jse_round_tick(s.price * (1 + v_pct / 100), cfg.price_tick);
  -- never exceed the \xB110% single-move cap (or the configured lower cap) after rounding to the price tick
  v_cap := least(cfg.max_price_move_pct, 10);
  v_lo := ceil(s.price * (1 - v_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_hi := floor(s.price * (1 + v_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_new := greatest(v_lo, least(v_hi, v_new));
  IF v_new <= 0 THEN v_new := cfg.price_tick; END IF;
  RETURN jse__apply_news_price(a, s, v_mood, v_pct, v_new,
    coalesce(v_headline, initcap(replace(v_mood, '_', ' ')) || ' news on ' || s.name));
END $$;

-- ---------------------------------------------------------------------------
-- Event control: START / PAUSE / RESUME / CLOSE / REOPEN / FINALIZE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__set_status(a jsonb, p_to text, p_journal boolean, p_audit_action text)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE ev event_control%ROWTYPE;
BEGIN
  SELECT * INTO ev FROM event_control WHERE id = 1 FOR UPDATE;
  UPDATE event_control SET status = p_to, status_changed_at = now(), status_changed_by = jse_actor_name(a),
    started_at = CASE WHEN p_to = 'LIVE' AND started_at IS NULL THEN now() ELSE started_at END,
    paused_at = CASE WHEN p_to = 'SETTLEMENT_ONLY' THEN now() ELSE paused_at END,
    closed_at = CASE WHEN p_to = 'CLOSED' THEN now() WHEN p_to IN ('LIVE','SETTLEMENT_ONLY','NOT_STARTED') THEN NULL ELSE closed_at END,
    finalized_at = CASE WHEN p_to = 'FINALIZED' THEN now() WHEN p_to <> 'FINALIZED' THEN NULL ELSE finalized_at END
  WHERE id = 1;
  PERFORM jse_audit(a, p_audit_action, 'event', 'event_control', NULL, NULL, jsonb_build_object('status', ev.status), jsonb_build_object('status', p_to), NULL);
  IF p_journal THEN
    PERFORM jse_journal('EVENT_STATUS', NULL, 'Event ' || ev.status || ' \u2192 ' || p_to, jsonb_build_object('from', ev.status, 'to', p_to), a);
  END IF;
  RETURN jsonb_build_object('success', true, 'from', ev.status, 'status', p_to);
END $$;

CREATE OR REPLACE FUNCTION jse_event_action(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(p->>'action', ''));
  cfg event_config%ROWTYPE;
  v_cur text; v_to text; v_open integer; v_listed jsonb := '[]'::jsonb; v_one jsonb; r record; v_names jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF v_action NOT IN ('START', 'PAUSE', 'RESUME', 'CLOSE', 'REOPEN', 'FINALIZE') THEN
    PERFORM jse_fail('INVALID_ACTION', 'Unknown event action.', 400);
  END IF;
  PERFORM jse_require_admin_password(a, p);
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_cur FROM event_control WHERE id = 1 FOR UPDATE;
  v_to := CASE v_action
    WHEN 'START'    THEN CASE WHEN v_cur = 'NOT_STARTED' THEN 'LIVE' END
    WHEN 'PAUSE'    THEN CASE WHEN v_cur = 'LIVE' THEN 'SETTLEMENT_ONLY' END
    WHEN 'RESUME'   THEN CASE WHEN v_cur = 'SETTLEMENT_ONLY' THEN 'LIVE' END
    WHEN 'CLOSE'    THEN CASE WHEN v_cur IN ('LIVE', 'SETTLEMENT_ONLY') THEN 'CLOSED' END
    WHEN 'REOPEN'   THEN CASE WHEN v_cur = 'CLOSED' THEN 'LIVE' END
    WHEN 'FINALIZE' THEN CASE WHEN v_cur = 'CLOSED' THEN 'FINALIZED' END
  END;
  IF v_to IS NULL THEN
    PERFORM jse_fail('INVALID_TRANSITION', v_action || ' is not possible while the event is ' || replace(v_cur, '_', ' ') || '.', 409);
  END IF;
  IF v_action = 'FINALIZE' THEN
    SELECT count(*) INTO v_open FROM orders WHERE status IN ('PIT_PENDING', 'EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING');
    IF v_open > 0 THEN
      PERFORM jse_fail('OPEN_ORDERS', 'Cannot finalize while ' || v_open || ' order(s) are still waiting at the Pit, Exchange or Bank. Settle or reject them first.', 409);
    END IF;
  END IF;
  IF v_action = 'START' THEN
    -- team names: randomly assigned before LIVE, locked for the event once it begins
    IF cfg.team_names_assigned_at IS NULL THEN
      PERFORM jse__assign_team_names(a, coalesce(cfg.team_name_seed, 'JSE-DALAL-STREET-2026'));
    END IF;
    IF cfg.team_names_locked_at IS NULL THEN
      UPDATE event_config SET team_names_locked_at = now(), team_names_locked_by = jse_actor_name(a) || ' (START EVENT)' WHERE id = 1;
      PERFORM jse_audit(a, 'TEAM_NAMES_LOCKED', 'team_names', NULL, NULL, NULL, NULL, NULL,
        jsonb_build_object('seed', (SELECT team_name_seed FROM event_config WHERE id = 1), 'automatic', true));
    END IF;
    -- IPOs list when the market starts: at the saved listing price, otherwise at the issue price
    IF cfg.auto_list_ipos THEN
      FOR r IN SELECT id FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NULL ORDER BY display_order, id LOOP
        v_one := jse__list_ipo(a, r.id);
        IF v_one IS NOT NULL THEN v_listed := v_listed || jsonb_build_array(v_one); END IF;
      END LOOP;
    END IF;
  END IF;
  RETURN jse__set_status(a, v_to, true,
    CASE v_action WHEN 'START' THEN 'EVENT_START' WHEN 'PAUSE' THEN 'EVENT_PAUSE' WHEN 'RESUME' THEN 'EVENT_RESUME'
                  WHEN 'CLOSE' THEN 'EVENT_CLOSE' WHEN 'REOPEN' THEN 'EVENT_REOPEN' ELSE 'EVENT_FINALIZE' END)
    || jsonb_build_object('listed', v_listed);
END $$;

-- Rejects every order still waiting at the Pit, Exchange or Bank, and expires open instructions (used at close).
CREATE OR REPLACE FUNCTION jse_reject_open_orders(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  o orders%ROWTYPE; v_n integer := 0; v_i integer := 0; v_to text;
  v_reason text := coalesce(nullif(trim(p->>'reason'), ''), 'Market closed before settlement');
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  FOR o IN SELECT * FROM orders WHERE status IN ('PIT_PENDING', 'EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING') ORDER BY id FOR UPDATE LOOP
    v_to := CASE o.status WHEN 'PIT_PENDING' THEN 'PIT_REJECTED' WHEN 'EXCHANGE_PENDING' THEN 'EXCHANGE_REJECTED' ELSE 'BANK_REJECTED' END;
    UPDATE orders SET status = v_to, reject_code = 'MARKET_CLOSED', reject_reason = v_reason, updated_at = now(),
           pit_at = CASE WHEN v_to = 'PIT_REJECTED' THEN now() ELSE pit_at END,
           pit_by_name = CASE WHEN v_to = 'PIT_REJECTED' THEN jse_actor_name(a) ELSE pit_by_name END,
           exchange_at = CASE WHEN v_to = 'EXCHANGE_REJECTED' THEN now() ELSE exchange_at END,
           exchange_by_name = CASE WHEN v_to = 'EXCHANGE_REJECTED' THEN jse_actor_name(a) ELSE exchange_by_name END,
           bank_at = CASE WHEN v_to = 'BANK_REJECTED' THEN now() ELSE bank_at END,
           bank_by_name = CASE WHEN v_to = 'BANK_REJECTED' THEN jse_actor_name(a) ELSE bank_by_name END,
           bank_claimed_by = NULL, bank_claimed_name = NULL, bank_claimed_at = NULL
    WHERE id = o.id;
    PERFORM jse_order_event(o.id, v_to, o.status, v_to, a, v_reason, jsonb_build_object('code', 'MARKET_CLOSED', 'bulk', true));
    PERFORM jse_audit(a, v_to, 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', o.status), jsonb_build_object('status', v_to),
      jsonb_build_object('code', 'MARKET_CLOSED', 'bulk', true, 'reason', v_reason));
    v_n := v_n + 1;
  END LOOP;
  UPDATE instructions SET status = 'EXPIRED', handled_at = now(), handled_by_name = jse_actor_name(a), decline_reason = v_reason WHERE status = 'OPEN';
  GET DIAGNOSTICS v_i = ROW_COUNT;
  PERFORM jse_audit(a, 'OPEN_ORDERS_REJECTED', 'event', NULL, NULL, NULL, NULL, NULL,
    jsonb_build_object('orders', v_n, 'instructions_expired', v_i, 'reason', v_reason));
  RETURN jsonb_build_object('success', true, 'rejected', v_n, 'instructions_expired', v_i);
END $$;

-- ---------------------------------------------------------------------------
-- Participant instructions to the assigned broker (digital instruction mechanism)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_instruction_action(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action', ''), 'CREATE'));
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_status text; t teams%ROWTYPE; s securities%ROWTYPE; ins instructions%ROWTYPE;
  v_side text := upper(trim(coalesce(p->>'side', '')));
  v_qty integer; v_id bigint; v_no text; v_open integer;
  v_reason text := nullif(left(trim(coalesce(p->>'reason', '')), 300), '');
BEGIN
  PERFORM jse_require_role(a, 'PARTICIPANT', 'BROKER', 'ADMIN');
  IF v_action = 'CREATE' THEN
    IF a->>'role' = 'BROKER' THEN PERFORM jse_fail('FORBIDDEN', 'Brokers submit orders; instructions come from participants.', 403); END IF;
    IF v_key IS NULL OR length(v_key) > 120 THEN PERFORM jse_fail('IDEMPOTENCY_KEY_REQUIRED', 'Reload the page and try again.', 400); END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended('jse-ins:' || v_key, 0));
    SELECT * INTO ins FROM instructions WHERE idempotency_key = v_key;
    IF FOUND THEN RETURN jsonb_build_object('success', true, 'replayed', true, 'instruction', to_jsonb(ins)); END IF;
    SELECT status INTO v_status FROM event_control WHERE id = 1;
    IF v_status <> 'LIVE' THEN PERFORM jse_fail('EVENT_NOT_LIVE', 'Instructions can be sent while the market is LIVE.', 409); END IF;
    SELECT * INTO t FROM teams WHERE id = CASE WHEN a->>'role' = 'PARTICIPANT' THEN nullif(a->>'team_id', '')::integer
                                               ELSE (SELECT id FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')))) END;
    IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Team not found.', 404); END IF;
    IF t.broker_id IS NULL THEN PERFORM jse_fail('NO_BROKER', 'Your team has no assigned broker yet. Contact the event desk.', 409); END IF;
    SELECT * INTO s FROM securities WHERE symbol = upper(trim(coalesce(p->>'symbol', ''))) AND active;
    IF NOT FOUND THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a listed stock.', 404); END IF;
    IF s.kind = 'IPO' AND s.listed_at IS NULL THEN PERFORM jse_fail('IPO_NOT_LISTED', s.symbol || ' has not listed yet.', 409); END IF;
    IF v_side NOT IN ('BUY', 'SELL') THEN PERFORM jse_fail('INVALID_SIDE', 'Choose BUY or SELL.', 400); END IF;
    BEGIN v_qty := (p->>'quantity')::integer; EXCEPTION WHEN others THEN v_qty := NULL; END;
    IF v_qty IS NULL OR v_qty <= 0 OR v_qty % s.lot_size <> 0 THEN
      PERFORM jse_fail('INVALID_LOT', 'Quantity must be a multiple of ' || s.lot_size || ' shares.', 400);
    END IF;
    SELECT count(*) INTO v_open FROM instructions WHERE team_id = t.id AND status = 'OPEN';
    IF v_open >= 10 THEN PERFORM jse_fail('TOO_MANY_OPEN', 'You already have 10 open instructions. Wait for your broker or cancel one.', 409); END IF;
    v_id := nextval(pg_get_serial_sequence('instructions', 'id'));
    v_no := 'REQ-' || lpad(v_id::text, 6, '0');
    INSERT INTO instructions(id, instruction_no, team_id, broker_id, security_id, side, quantity, note, price_seen, idempotency_key, created_by, created_by_name)
    VALUES (v_id, v_no, t.id, t.broker_id, s.id, v_side, v_qty, left(nullif(trim(p->>'note'), ''), 300), s.price, v_key,
            nullif(a->>'id', '')::integer, jse_actor_name(a))
    RETURNING * INTO ins;
    PERFORM jse_audit(a, 'INSTRUCTION_CREATED', 'instruction', v_no, t.id, NULL, NULL,
      jsonb_build_object('status', 'OPEN', 'side', v_side, 'symbol', s.symbol, 'quantity', v_qty),
      jsonb_build_object('broker', (SELECT code FROM brokers WHERE id = t.broker_id), 'price_seen', s.price, 'note', ins.note));
    RETURN jsonb_build_object('success', true, 'replayed', false, 'instruction', to_jsonb(ins) || jsonb_build_object('symbol', s.symbol));
  END IF;

  SELECT * INTO ins FROM instructions WHERE id = nullif(p->>'instruction_id', '')::bigint OR instruction_no = upper(trim(coalesce(p->>'instruction_no', '')))
  FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('INSTRUCTION_NOT_FOUND', 'Instruction not found.', 404); END IF;
  IF ins.status <> 'OPEN' THEN PERFORM jse_fail('INSTRUCTION_NOT_OPEN', ins.instruction_no || ' is already ' || lower(ins.status) || '.', 409); END IF;
  IF v_action = 'CANCEL' THEN
    IF a->>'role' = 'PARTICIPANT' AND ins.team_id IS DISTINCT FROM nullif(a->>'team_id', '')::integer THEN PERFORM jse_fail('FORBIDDEN', 'Not your instruction.', 403); END IF;
    IF a->>'role' = 'BROKER' THEN PERFORM jse_fail('FORBIDDEN', 'Brokers decline instructions; only the participant cancels.', 403); END IF;
    UPDATE instructions SET status = 'CANCELLED', handled_at = now(), handled_by_name = jse_actor_name(a) WHERE id = ins.id;
  ELSIF v_action = 'DECLINE' THEN
    IF a->>'role' = 'PARTICIPANT' THEN PERFORM jse_fail('FORBIDDEN', 'Use Cancel to withdraw your own instruction.', 403); END IF;
    IF a->>'role' = 'BROKER' AND ins.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN
      PERFORM jse_fail('NOT_YOUR_TEAM', 'This instruction belongs to another broker''s team.', 403);
    END IF;
    IF v_reason IS NULL THEN PERFORM jse_fail('REASON_REQUIRED', 'Tell the participant why the instruction is declined.', 400); END IF;
    UPDATE instructions SET status = 'DECLINED', handled_at = now(), handled_by_name = jse_actor_name(a), decline_reason = v_reason WHERE id = ins.id;
  ELSE
    PERFORM jse_fail('INVALID_ACTION', 'Use CREATE, CANCEL or DECLINE.', 400);
  END IF;
  PERFORM jse_audit(a, 'INSTRUCTION_' || CASE v_action WHEN 'CANCEL' THEN 'CANCELLED' ELSE 'DECLINED' END, 'instruction', ins.instruction_no, ins.team_id, NULL,
    jsonb_build_object('status', 'OPEN'), jsonb_build_object('status', CASE v_action WHEN 'CANCEL' THEN 'CANCELLED' ELSE 'DECLINED' END),
    jsonb_build_object('reason', v_reason));
  RETURN jsonb_build_object('success', true, 'instruction', (SELECT to_jsonb(x) FROM instructions x WHERE x.id = ins.id));
END $$;

-- ---------------------------------------------------------------------------
-- Team identity: reproducible random assignment from the curated Indian Knowledge System name pool,
-- locked for the event once trading begins.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__assign_team_names(a jsonb, p_seed text) RETURNS integer LANGUAGE plpgsql AS $$
DECLARE v_teams integer; v_pool integer;
BEGIN
  SELECT count(*) INTO v_teams FROM teams;
  SELECT count(*) INTO v_pool FROM team_name_pool WHERE active;
  IF v_pool < v_teams THEN
    PERFORM jse_fail('POOL_TOO_SMALL', 'The team-name pool has ' || v_pool || ' names for ' || v_teams || ' teams.', 409);
  END IF;
  UPDATE teams SET name = '~' || code;   -- temporary unique names while reassigning
  WITH tt AS (SELECT id, row_number() OVER (ORDER BY seq) AS rn FROM teams),
       nn AS (SELECT name, row_number() OVER (ORDER BY md5(p_seed || ':' || lower(name)), name) AS rn FROM team_name_pool WHERE active)
  UPDATE teams SET name = nn.name, updated_at = now() FROM tt JOIN nn ON nn.rn = tt.rn WHERE teams.id = tt.id;
  UPDATE app_users u SET display_name = t.name, updated_at = now() FROM teams t WHERE u.team_id = t.id AND u.role = 'PARTICIPANT';
  UPDATE event_config SET team_name_seed = p_seed, team_names_assigned_at = now() WHERE id = 1;
  PERFORM jse_audit(a, 'TEAM_NAMES_ASSIGNED', 'team_names', p_seed, NULL, NULL, NULL, NULL,
    jsonb_build_object('seed', p_seed, 'teams', v_teams, 'pool', v_pool, 'method', 'md5(seed:name) order, teams by code'));
  RETURN v_teams;
END $$;

CREATE OR REPLACE FUNCTION jse_team_names(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action', ''), 'STATE'));
  cfg event_config%ROWTYPE; v_status text; v_seed text; v_n integer;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  IF v_action <> 'STATE' THEN
    PERFORM jse_require_role(a, 'ADMIN');
    PERFORM jse_require_admin_password(a, p);
  END IF;
  IF v_action = 'RANDOMIZE' THEN
    IF cfg.team_names_locked_at IS NOT NULL THEN
      PERFORM jse_fail('NAMES_LOCKED', 'Team names are locked (' || coalesce(cfg.team_names_locked_by, 'locked') || '). Unlock them first (only before the event starts).', 409);
    END IF;
    IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'Team names can be randomized only before the event starts.', 409); END IF;
    v_seed := coalesce(nullif(upper(trim(p->>'seed')), ''), 'JSE-' || upper(encode(gen_random_bytes(4), 'hex')));
    v_n := jse__assign_team_names(a, v_seed);
  ELSIF v_action = 'LOCK' THEN
    IF cfg.team_names_assigned_at IS NULL THEN v_n := jse__assign_team_names(a, coalesce(cfg.team_name_seed, 'JSE-DALAL-STREET-2026')); END IF;
    UPDATE event_config SET team_names_locked_at = now(), team_names_locked_by = jse_actor_name(a) WHERE id = 1 AND team_names_locked_at IS NULL;
    PERFORM jse_audit(a, 'TEAM_NAMES_LOCKED', 'team_names', NULL, NULL, NULL, NULL, NULL, jsonb_build_object('seed', (SELECT team_name_seed FROM event_config WHERE id = 1)));
  ELSIF v_action = 'UNLOCK' THEN
    IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'Team names stay locked once the event has started.', 409); END IF;
    UPDATE event_config SET team_names_locked_at = NULL, team_names_locked_by = NULL WHERE id = 1;
    PERFORM jse_audit(a, 'TEAM_NAMES_UNLOCKED', 'team_names', NULL, NULL, NULL, NULL, NULL, NULL);
  ELSIF v_action <> 'STATE' THEN
    PERFORM jse_fail('INVALID_ACTION', 'Use STATE, RANDOMIZE, LOCK or UNLOCK.', 400);
  END IF;
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  RETURN jsonb_build_object('success', true, 'seed', cfg.team_name_seed, 'assigned_at', cfg.team_names_assigned_at,
    'locked', cfg.team_names_locked_at IS NOT NULL, 'locked_at', cfg.team_names_locked_at, 'locked_by', cfg.team_names_locked_by,
    'pool_size', (SELECT count(*) FROM team_name_pool WHERE active),
    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('team', t.code, 'name', t.name, 'meaning', np.meaning, 'category', np.category,
                         'section', t.section, 'members', t.members, 'broker', b.code, 'broker_name', b.name) ORDER BY t.seq)
                       FROM teams t LEFT JOIN team_name_pool np ON lower(np.name) = lower(t.name) LEFT JOIN brokers b ON b.id = t.broker_id), '[]'::jsonb),
    'pool', coalesce((SELECT jsonb_agg(jsonb_build_object('name', np.name, 'category', np.category, 'meaning', np.meaning,
                        'team', (SELECT code FROM teams WHERE lower(name) = lower(np.name))) ORDER BY np.category, np.name)
                      FROM team_name_pool np WHERE np.active), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- IPO round: window = exactly 48 hours before the configured event start, for ipo_application_hours.
-- Stages: PRE_IPO \u2192 APPLICATION_OPEN \u2192 APPLICATION_CLOSED \u2192 ALLOTMENT_COMPLETED \u2192 LISTED (in CMS INDEX)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_ipo_window() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('event_start_at', c.event_start_at, 'opens_at', c.event_start_at - interval '48 hours',
    'closes_at', c.event_start_at - interval '48 hours' + make_interval(mins => (c.ipo_application_hours * 60)::integer),
    'hours', c.ipo_application_hours,
    'phase', CASE WHEN now() < c.event_start_at - interval '48 hours' THEN 'PRE_IPO'
                  WHEN now() < c.event_start_at - interval '48 hours' + make_interval(mins => (c.ipo_application_hours * 60)::integer) THEN 'OPEN'
                  ELSE 'CLOSED' END)
  FROM event_config c WHERE c.id = 1
$$;

CREATE OR REPLACE FUNCTION jse_ipo_stage(p_security integer) RETURNS text LANGUAGE sql STABLE AS $$
  SELECT CASE
    WHEN s.listed_at IS NOT NULL THEN 'LISTED'
    WHEN EXISTS (SELECT 1 FROM ipo_allotments al WHERE al.security_id = s.id AND al.reversed_at IS NULL) THEN 'ALLOTMENT_COMPLETED'
    WHEN w->>'phase' = 'PRE_IPO' THEN 'PRE_IPO'
    WHEN w->>'phase' = 'OPEN' THEN 'APPLICATION_OPEN'
    ELSE 'APPLICATION_CLOSED' END
  FROM securities s, (SELECT jse_ipo_window() AS w) x WHERE s.id = p_security AND s.kind = 'IPO'
$$;

CREATE OR REPLACE FUNCTION jse_ipo_application(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action', ''), 'SET'));
  v_status text; t teams%ROWTYPE; s securities%ROWTYPE; app ipo_applications%ROWTYPE;
  v_lots integer; v_amount numeric; v_other numeric; v_n integer;
BEGIN
  PERFORM jse_require_role(a, 'PARTICIPANT', 'ADMIN');
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  IF v_action = 'CLEAR' THEN
    PERFORM jse_require_role(a, 'ADMIN');
    PERFORM jse_require_admin_password(a, p);
    IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'Applications can be cleared only before the event starts.', 409); END IF;
    DELETE FROM ipo_applications WHERE coalesce(p->>'ipo', '') = '' OR security_id = (SELECT id FROM securities WHERE kind = 'IPO' AND symbol = upper(trim(p->>'ipo')));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    PERFORM jse_audit(a, 'IPO_APPLICATIONS_CLEARED', 'ipo_application', coalesce(nullif(p->>'ipo', ''), 'ALL'), NULL, NULL, NULL, NULL, jsonb_build_object('rows', v_n));
    RETURN jsonb_build_object('success', true, 'cleared', v_n);
  END IF;
  SELECT * INTO t FROM teams WHERE id = CASE WHEN a->>'role' = 'PARTICIPANT' THEN nullif(a->>'team_id', '')::integer
                                             ELSE (SELECT id FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')))) END FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Team not found.', 404); END IF;
  SELECT * INTO s FROM securities WHERE kind = 'IPO' AND active AND (symbol = upper(trim(coalesce(p->>'ipo', p->>'symbol', ''))) OR ipo_code = upper(trim(coalesce(p->>'ipo', p->>'symbol', ''))));
  IF NOT FOUND THEN PERFORM jse_fail('IPO_NOT_FOUND', 'Choose one of the IPOs.', 404); END IF;
  IF jse_ipo_stage(s.id) <> 'APPLICATION_OPEN' THEN
    PERFORM jse_fail('IPO_WINDOW_CLOSED', 'Applications for ' || s.name || ' are not open (stage: ' || replace(jse_ipo_stage(s.id), '_', ' ') || ').', 409);
  END IF;
  SELECT * INTO app FROM ipo_applications WHERE team_id = t.id AND security_id = s.id FOR UPDATE;
  IF v_action = 'WITHDRAW' THEN
    IF NOT FOUND OR app.status <> 'APPLIED' THEN PERFORM jse_fail('NO_APPLICATION', 'There is no application to withdraw.', 409); END IF;
    UPDATE ipo_applications SET status = 'WITHDRAWN', updated_at = now(), updated_by_name = jse_actor_name(a) WHERE id = app.id;
    PERFORM jse_audit(a, 'IPO_APPLICATION_WITHDRAWN', 'ipo_application', s.symbol, t.id, NULL, jsonb_build_object('lots', app.lots), NULL, NULL);
    RETURN jsonb_build_object('success', true, 'status', 'WITHDRAWN');
  ELSIF v_action <> 'SET' THEN
    PERFORM jse_fail('INVALID_ACTION', 'Use SET or WITHDRAW.', 400);
  END IF;
  BEGIN v_lots := (p->>'lots')::integer; EXCEPTION WHEN others THEN v_lots := NULL; END;
  IF v_lots IS NULL OR v_lots <= 0 THEN PERFORM jse_fail('INVALID_LOTS', 'Apply for a whole number of lots (1 lot = ' || s.lot_size || ' shares).', 400); END IF;
  v_amount := v_lots * s.lot_size * s.base_price;
  SELECT coalesce(sum(amount), 0) INTO v_other FROM ipo_applications WHERE team_id = t.id AND status = 'APPLIED' AND security_id <> s.id;
  IF v_other + v_amount > t.cash THEN
    PERFORM jse_fail('APPLICATION_CASH', 'All IPO applications together (\u20B9' || (v_other + v_amount) || ') cannot exceed the team''s cash (\u20B9' || t.cash || ').', 409);
  END IF;
  INSERT INTO ipo_applications(team_id, security_id, lots, quantity, price, amount, status, created_by_name, updated_by_name)
  VALUES (t.id, s.id, v_lots, v_lots * s.lot_size, s.base_price, v_amount, 'APPLIED', jse_actor_name(a), jse_actor_name(a))
  ON CONFLICT (team_id, security_id) DO UPDATE SET lots = EXCLUDED.lots, quantity = EXCLUDED.quantity, price = EXCLUDED.price,
    amount = EXCLUDED.amount, status = 'APPLIED', updated_at = now(), updated_by_name = EXCLUDED.updated_by_name
  RETURNING * INTO app;
  PERFORM jse_audit(a, 'IPO_APPLICATION_SUBMITTED', 'ipo_application', s.symbol, t.id, NULL, NULL,
    jsonb_build_object('lots', v_lots, 'shares', v_lots * s.lot_size, 'amount', v_amount), jsonb_build_object('issue_price', s.base_price));
  RETURN jsonb_build_object('success', true, 'status', 'APPLIED', 'application', to_jsonb(app) || jsonb_build_object('symbol', s.symbol));
END $$;

-- One prospectus record per IPO, managed by the administrator. Content is supplied by the organisers.
CREATE OR REPLACE FUNCTION jse_ipo_prospectus_update(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE s securities%ROWTYPE; v_doc bytea; v_changed text[] := '{}'; f text; v_url text;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT * INTO s FROM securities WHERE kind = 'IPO' AND (symbol = upper(trim(coalesce(p->>'ipo', p->>'symbol', ''))) OR ipo_code = upper(trim(coalesce(p->>'ipo', ''))));
  IF NOT FOUND THEN PERFORM jse_fail('IPO_NOT_FOUND', 'Choose one of the IPOs.', 404); END IF;
  INSERT INTO ipo_prospectus(security_id) VALUES (s.id) ON CONFLICT (security_id) DO NOTHING;
  FOREACH f IN ARRAY ARRAY['company_description','issue_details','business_overview','financial_information','risk_factors',
                           'use_of_proceeds','promoters_management','other_information'] LOOP
    IF p ? f THEN
      IF length(coalesce(p->>f, '')) > 20000 THEN PERFORM jse_fail('TOO_LONG', replace(f, '_', ' ') || ' is longer than 20,000 characters.', 400); END IF;
      EXECUTE format('UPDATE ipo_prospectus SET %I = $1 WHERE security_id = $2', f) USING nullif(trim(p->>f), ''), s.id;
      v_changed := v_changed || f;
    END IF;
  END LOOP;
  IF p ? 'document_url' THEN
    v_url := nullif(trim(p->>'document_url'), '');
    IF v_url IS NOT NULL AND v_url !~* '^https?://' THEN PERFORM jse_fail('INVALID_URL', 'The document link must start with https://', 400); END IF;
    UPDATE ipo_prospectus SET document_url = v_url WHERE security_id = s.id;
    v_changed := v_changed || 'document_url'::text;
  END IF;
  IF coalesce((p->>'remove_document')::boolean, false) THEN
    UPDATE ipo_prospectus SET document_data = NULL, document_name = NULL, document_type = NULL, document_size = NULL,
           document_uploaded_at = now(), document_uploaded_by = jse_actor_name(a) WHERE security_id = s.id;
    v_changed := v_changed || 'document_removed'::text;
  ELSIF jsonb_typeof(p->'document') = 'object' THEN
    BEGIN v_doc := decode(p->'document'->>'data_base64', 'base64');
    EXCEPTION WHEN others THEN PERFORM jse_fail('INVALID_DOCUMENT', 'The document could not be read.', 400);
    END;
    IF v_doc IS NULL OR length(v_doc) = 0 THEN PERFORM jse_fail('INVALID_DOCUMENT', 'The document is empty.', 400); END IF;
    IF length(v_doc) > 4 * 1024 * 1024 THEN PERFORM jse_fail('DOCUMENT_TOO_LARGE', 'Upload a PDF of at most 4 MB (or give a link instead).', 413); END IF;
    IF substring(v_doc from 1 for 5) <> '\\x255044462d'::bytea THEN PERFORM jse_fail('NOT_A_PDF', 'Upload the prospectus as a PDF file.', 400); END IF;
    UPDATE ipo_prospectus SET document_data = v_doc, document_name = left(coalesce(nullif(p->'document'->>'name', ''), s.symbol || '-prospectus.pdf'), 160),
           document_type = 'application/pdf', document_size = length(v_doc), document_uploaded_at = now(), document_uploaded_by = jse_actor_name(a)
    WHERE security_id = s.id;
    v_changed := v_changed || 'document'::text;
  END IF;
  UPDATE ipo_prospectus SET updated_at = now(), updated_by = jse_actor_name(a) WHERE security_id = s.id;
  PERFORM jse_audit(a, 'IPO_PROSPECTUS_UPDATED', 'security', s.symbol, NULL, NULL, NULL, NULL,
    jsonb_build_object('fields', to_jsonb(v_changed), 'document_size', (SELECT document_size FROM ipo_prospectus WHERE security_id = s.id)));
  RETURN jsonb_build_object('success', true, 'symbol', s.symbol, 'updated', to_jsonb(v_changed));
END $$;

-- ---------------------------------------------------------------------------
-- IPO allotments (bulk load before START; no brokerage, no price change; not assessment trades)
-- Import columns: Team, IPO, Lots, Shares, Amount \u2014 every row is validated before anything is saved.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__apply_allotment(a jsonb, p_allot ipo_allotments) RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_bal numeric; v_sym text;
BEGIN
  SELECT symbol INTO v_sym FROM securities WHERE id = p_allot.security_id;
  UPDATE teams SET cash = cash - p_allot.amount, updated_at = now() WHERE id = p_allot.team_id RETURNING cash INTO v_bal;
  IF v_bal < 0 THEN PERFORM jse_fail('ALLOTMENT_CASH', 'Allotment exceeds the team''s cash.', 409); END IF;
  PERFORM jse_ledger(p_allot.team_id, NULL, NULL, 'IPO_ALLOTMENT', p_allot.amount, 0, v_bal,
    'IPO allotment: ' || p_allot.lots || ' IPO lot(s) = ' || p_allot.quantity || ' ' || v_sym || ' @ \u20B9' || p_allot.price || ' (no brokerage; not an assessment trade)', a);
  INSERT INTO holdings(team_id, security_id, quantity, cost_basis, trade_cost) VALUES (p_allot.team_id, p_allot.security_id, p_allot.quantity, p_allot.amount, p_allot.amount)
  ON CONFLICT (team_id, security_id) DO UPDATE SET quantity = holdings.quantity + EXCLUDED.quantity,
    cost_basis = holdings.cost_basis + EXCLUDED.cost_basis, trade_cost = holdings.trade_cost + EXCLUDED.trade_cost, updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION jse_ipo_allot(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_status text; r jsonb; v_errors jsonb := '[]'::jsonb; v_rows jsonb := '[]'::jsonb;
  v_team teams%ROWTYPE; v_sec securities%ROWTYPE; v_lots integer; v_shares integer; v_amt numeric; v_i integer := 0;
  v_replace boolean := coalesce((p->>'replace')::boolean, false);
  v_batch text := coalesce(nullif(p->>'batch_id', ''), to_char(now(), 'YYYYMMDD-HH24MISS'));
  v_total numeric := 0; v_count integer := 0; v_applied integer;
  al ipo_allotments%ROWTYPE; x record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR UPDATE;
  IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'IPO allotments can be loaded only before the event starts.', 409); END IF;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN PERFORM jse_fail('NO_ROWS', 'No allotment rows were supplied.', 400); END IF;

  -- validation pass (nothing is written unless every row is valid)
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(r->>'team', '')));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown team ' || coalesce(r->>'team', '(blank)')); CONTINUE; END IF;
    SELECT * INTO v_sec FROM securities WHERE kind = 'IPO' AND (symbol = upper(trim(coalesce(r->>'ipo', r->>'symbol', ''))) OR ipo_code = upper(trim(coalesce(r->>'ipo', '')))
                                                               OR upper(name) = upper(trim(coalesce(r->>'ipo', r->>'symbol', ''))));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown IPO ' || coalesce(r->>'ipo', r->>'symbol', '(blank)')); CONTINUE; END IF;
    BEGIN v_lots := (r->>'lots')::integer; EXCEPTION WHEN others THEN v_lots := NULL; END;
    IF v_lots IS NULL OR v_lots < 0 THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Lots must be a whole number'); CONTINUE; END IF;
    IF v_lots = 0 THEN CONTINUE; END IF;
    v_shares := v_lots * v_sec.lot_size; v_amt := v_shares * v_sec.base_price;
    IF nullif(trim(coalesce(r->>'shares', '')), '') IS NOT NULL AND (r->>'shares')::numeric <> v_shares THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' / ' || v_sec.symbol || ': Shares ' || (r->>'shares') || ' \u2260 ' || v_lots || ' lots \xD7 ' || v_sec.lot_size || ' = ' || v_shares); CONTINUE;
    END IF;
    IF nullif(trim(coalesce(r->>'amount', '')), '') IS NOT NULL AND round((r->>'amount')::numeric, 2) <> v_amt THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' / ' || v_sec.symbol || ': Amount ' || (r->>'amount') || ' \u2260 ' || v_shares || ' \xD7 \u20B9' || v_sec.base_price || ' = \u20B9' || v_amt); CONTINUE;
    END IF;
    -- when the portal application process was used for this IPO, an allotment cannot exceed the team's application
    IF EXISTS (SELECT 1 FROM ipo_applications ap WHERE ap.security_id = v_sec.id AND ap.status = 'APPLIED') THEN
      SELECT lots INTO v_applied FROM ipo_applications ap WHERE ap.security_id = v_sec.id AND ap.team_id = v_team.id AND ap.status = 'APPLIED';
      IF coalesce(v_applied, 0) < v_lots THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' applied for ' || coalesce(v_applied, 0) || ' ' || v_sec.symbol || ' lot(s) but the file allots ' || v_lots); CONTINUE;
      END IF;
    END IF;
    IF NOT v_replace AND EXISTS (SELECT 1 FROM ipo_allotments WHERE team_id = v_team.id AND security_id = v_sec.id AND reversed_at IS NULL) THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' already has a ' || v_sec.symbol || ' allotment (tick "replace" to overwrite)'); CONTINUE;
    END IF;
    v_rows := v_rows || jsonb_build_object('team_id', v_team.id, 'team', v_team.code, 'security_id', v_sec.id, 'symbol', v_sec.symbol,
                                           'lots', v_lots, 'quantity', v_shares, 'price', v_sec.base_price, 'amount', v_amt);
  END LOOP;
  FOR x IN SELECT e->>'team' AS team, e->>'symbol' AS symbol, count(*) AS n FROM jsonb_array_elements(v_rows) e GROUP BY 1, 2 HAVING count(*) > 1 LOOP
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', x.team || ' / ' || x.symbol || ' appears ' || x.n || ' times in the file');
  END LOOP;
  FOR x IN
    SELECT e->>'team' AS team, (e->>'team_id')::integer AS team_id, sum((e->>'amount')::numeric) AS need
    FROM jsonb_array_elements(v_rows) e GROUP BY 1, 2
  LOOP
    SELECT t2.cash + (CASE WHEN v_replace THEN coalesce((
             SELECT sum(al2.amount) FROM ipo_allotments al2
             JOIN jsonb_array_elements(v_rows) e2 ON (e2->>'team_id')::integer = al2.team_id AND (e2->>'security_id')::integer = al2.security_id
             WHERE al2.team_id = x.team_id AND al2.reversed_at IS NULL), 0) ELSE 0 END)
    INTO v_total FROM teams t2 WHERE t2.id = x.team_id;
    IF x.need > v_total THEN
      v_errors := v_errors || jsonb_build_object('row', NULL, 'error', x.team || ' does not have enough cash for \u20B9' || x.need || ' of allotments (available \u20B9' || v_total || ')');
    END IF;
  END LOOP;
  v_total := 0;
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'ALLOTMENT_ERRORS', 'error', 'Nothing was loaded. Fix the rows listed and upload again.', 'errors', v_errors, 'http', 400);
  END IF;
  IF coalesce((p->>'dry_run')::boolean, false) THEN
    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_rows),
      'total_amount', (SELECT coalesce(sum((e->>'amount')::numeric), 0) FROM jsonb_array_elements(v_rows) e), 'preview', v_rows);
  END IF;

  FOR r IN SELECT value FROM jsonb_array_elements(v_rows) LOOP
    IF v_replace THEN
      PERFORM jse__reverse_allotment(a, al2.id) FROM ipo_allotments al2
      WHERE al2.team_id = (r->>'team_id')::integer AND al2.security_id = (r->>'security_id')::integer AND al2.reversed_at IS NULL;
    END IF;
    INSERT INTO ipo_allotments(team_id, security_id, lots, quantity, price, amount, batch_id, created_by, created_by_name)
    VALUES ((r->>'team_id')::integer, (r->>'security_id')::integer, (r->>'lots')::integer, (r->>'quantity')::integer,
            (r->>'price')::numeric, (r->>'amount')::numeric, v_batch, nullif(a->>'id', '')::integer, jse_actor_name(a))
    RETURNING * INTO al;
    PERFORM jse__apply_allotment(a, al);
    v_total := v_total + al.amount; v_count := v_count + 1;
  END LOOP;
  PERFORM jse_audit(a, 'IPO_ALLOTMENT_LOADED', 'ipo_allotment', v_batch, NULL, NULL, NULL, NULL,
    jsonb_build_object('rows', v_count, 'total_amount', v_total, 'replace', v_replace));
  RETURN jsonb_build_object('success', true, 'batch_id', v_batch, 'rows', v_count, 'total_amount', v_total);
END $$;

CREATE OR REPLACE FUNCTION jse__reverse_allotment(a jsonb, p_id bigint) RETURNS void LANGUAGE plpgsql AS $$
DECLARE al ipo_allotments%ROWTYPE; v_bal numeric; v_hold integer; v_sym text;
BEGIN
  SELECT * INTO al FROM ipo_allotments WHERE id = p_id AND reversed_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT quantity INTO v_hold FROM holdings WHERE team_id = al.team_id AND security_id = al.security_id FOR UPDATE;
  IF coalesce(v_hold, 0) < al.quantity THEN PERFORM jse_fail('ALLOTMENT_SOLD', 'The allotted shares are no longer held; cannot reverse.', 409); END IF;
  SELECT symbol INTO v_sym FROM securities WHERE id = al.security_id;
  UPDATE holdings SET quantity = quantity - al.quantity, cost_basis = greatest(0, cost_basis - al.amount), trade_cost = greatest(0, trade_cost - al.amount), updated_at = now()
  WHERE team_id = al.team_id AND security_id = al.security_id;
  DELETE FROM holdings WHERE team_id = al.team_id AND security_id = al.security_id AND quantity = 0;
  UPDATE teams SET cash = cash + al.amount, updated_at = now() WHERE id = al.team_id RETURNING cash INTO v_bal;
  PERFORM jse_ledger(al.team_id, NULL, NULL, 'REVERSAL', 0, al.amount, v_bal, 'IPO allotment reversed: ' || al.quantity || ' ' || v_sym, a);
  UPDATE ipo_allotments SET reversed_at = now() WHERE id = al.id;
END $$;

CREATE OR REPLACE FUNCTION jse_ipo_allot_clear(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_status text; v_n integer := 0; r record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR UPDATE;
  IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'Allotments can be removed only before the event starts.', 409); END IF;
  FOR r IN SELECT al.id FROM ipo_allotments al JOIN teams t ON t.id = al.team_id
           WHERE al.reversed_at IS NULL AND (coalesce(p->>'team', '') = '' OR t.code = upper(trim(p->>'team'))) ORDER BY al.id LOOP
    PERFORM jse__reverse_allotment(a, r.id); v_n := v_n + 1;
  END LOOP;
  PERFORM jse_audit(a, 'IPO_ALLOTMENT_REMOVED', 'ipo_allotment', coalesce(nullif(p->>'team', ''), 'ALL'), NULL, NULL, NULL, NULL, jsonb_build_object('rows', v_n));
  RETURN jsonb_build_object('success', true, 'removed', v_n);
END $$;

-- ---------------------------------------------------------------------------
-- IPO listing: the IPO moves from its issue price to the listing price (source LISTING), enters the listed
-- market and becomes a CMS INDEX component exactly once (at its listing price, so the index % does not jump).
-- Lists automatically at START EVENT (saved listing price, else issue price) or with "List now".
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__list_ipo(a jsonb, p_id integer) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE s securities%ROWTYPE; v_price numeric; v_pct numeric; v_n integer;
BEGIN
  SELECT * INTO s FROM securities WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR s.kind <> 'IPO' OR s.listed_at IS NOT NULL OR NOT s.active THEN RETURN NULL; END IF;
  IF s.trade_count > 0 OR s.price <> s.base_price
     OR EXISTS (SELECT 1 FROM market_news n WHERE n.security_id = s.id AND n.reversed_at IS NULL) THEN
    PERFORM jse_fail('IPO_ALREADY_MOVED', s.symbol || ' has already traded or moved on Market News; it can no longer be listed.', 409);
  END IF;
  v_price := coalesce(s.listing_price, s.base_price);
  v_pct := jse_pct(v_price, s.price);
  PERFORM jse__set_price(a, s.id, v_price, 'LISTING');
  UPDATE securities SET listed_at = clock_timestamp(), index_base_price = v_price WHERE id = s.id;
  SELECT count(*) INTO v_n FROM securities WHERE active AND (kind = 'EQUITY' OR listed_at IS NOT NULL);
  PERFORM jse_audit(a, 'IPO_LISTED', 'security', s.symbol, NULL, NULL,
    jsonb_build_object('stage', jse_ipo_stage(s.id), 'price', s.price),
    jsonb_build_object('stage', 'LISTED', 'price', v_price, 'cms_index', 'INCLUDED'),
    jsonb_build_object('issue_price', s.base_price, 'listing_price', v_price, 'listed_at_issue_price', s.listing_price IS NULL,
                       'change_pct', round(v_pct, 2), 'cms_index_components', v_n, 'source', 'LISTING'));
  PERFORM jse_journal('IPO_LISTING', s.id,
    s.symbol || ' listed at \u20B9' || v_price || ' (issue \u20B9' || s.base_price || ', ' || CASE WHEN v_pct > 0 THEN '+' ELSE '' END || to_char(round(v_pct, 2), 'FM990.00') || '%) \xB7 CMS INDEX ' || v_n || ' components',
    jsonb_build_object('security_id', s.id, 'from_price', s.price, 'from_previous', s.previous_price, 'listing_price', v_price), a);
  RETURN jsonb_build_object('symbol', s.symbol, 'name', s.name, 'issue_price', s.base_price, 'listing_price', v_price,
                            'change_pct', round(v_pct, 2), 'at_issue_price', s.listing_price IS NULL, 'index_components', v_n);
END $$;

-- Listing status of every IPO; the saved price is visible only to administrators until the IPO lists.
CREATE OR REPLACE FUNCTION jse_listing_state(a jsonb) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'symbol', s.symbol, 'ipo_code', s.ipo_code, 'name', s.name, 'issue_price', s.base_price, 'price', s.price,
           'listing_saved', s.listing_price IS NOT NULL,
           'listing_price', CASE WHEN a->>'role' = 'ADMIN' OR s.listed_at IS NOT NULL THEN coalesce(s.listing_price, CASE WHEN s.listed_at IS NOT NULL THEN s.index_base_price END) END,
           'gain_pct', CASE WHEN (a->>'role' = 'ADMIN' OR s.listed_at IS NOT NULL) AND s.listing_price IS NOT NULL
                            THEN round(jse_pct(s.listing_price, s.base_price), 2) END,
           'stage', jse_ipo_stage(s.id),
           'listed', s.listed_at IS NOT NULL, 'listed_at', s.listed_at, 'set_at', s.listing_set_at, 'set_by', s.listing_set_by,
           'traded', s.trade_count > 0) ORDER BY s.display_order, s.id), '[]'::jsonb)
  FROM securities s WHERE s.kind = 'IPO' AND s.active
$$;

CREATE OR REPLACE FUNCTION jse_ipo_listing(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(p->>'action', 'SET'));
  cfg event_config%ROWTYPE; v_status text; r jsonb; x jsonb; s securities%ROWTYPE; v_price numeric; v_i integer := 0;
  v_errors jsonb := '[]'::jsonb; v_rows jsonb := '[]'::jsonb; v_out jsonb := '[]'::jsonb; v_one jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR UPDATE;
  IF v_status NOT IN ('NOT_STARTED', 'LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_CLOSED', 'IPO listing is not possible after the market has closed.', 409);
  END IF;

  IF v_action = 'SET' THEN
    IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN
      PERFORM jse_fail('NO_ROWS', 'Enter at least one listing price.', 400);
    END IF;
    FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
      v_i := v_i + 1;
      SELECT * INTO s FROM securities WHERE kind = 'IPO' AND symbol = upper(trim(coalesce(r->>'ipo', r->>'symbol', '')));
      IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown IPO ' || coalesce(r->>'ipo', r->>'symbol', '(blank)')); CONTINUE; END IF;
      IF s.listed_at IS NOT NULL THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ' is already listed'); CONTINUE; END IF;
      IF nullif(trim(coalesce(r->>'listing_price', '')), '') IS NULL THEN
        v_rows := v_rows || jsonb_build_object('id', s.id, 'symbol', s.symbol, 'price', NULL);   -- blank = list at the issue price
        CONTINUE;
      END IF;
      BEGIN v_price := (r->>'listing_price')::numeric; EXCEPTION WHEN others THEN v_price := NULL; END;
      IF v_price IS NULL OR v_price <= 0 THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ': enter a positive price'); CONTINUE;
      END IF;
      IF v_price <> jse_round_tick(v_price, cfg.price_tick) THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ': use whole rupees (price step \u20B9' || cfg.price_tick || ')'); CONTINUE;
      END IF;
      IF v_price < s.base_price * 0.5 OR v_price > s.base_price * 2 THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ': the listing price must be between 50% and 200% of the issue price \u20B9' || s.base_price);
        CONTINUE;
      END IF;
      v_rows := v_rows || jsonb_build_object('id', s.id, 'symbol', s.symbol, 'price', v_price);
    END LOOP;
    IF jsonb_array_length(v_errors) > 0 THEN
      RETURN jsonb_build_object('success', false, 'code', 'LISTING_ERRORS', 'error', 'Nothing was saved. Fix the rows listed.', 'errors', v_errors, 'http', 400);
    END IF;
    FOR x IN SELECT value FROM jsonb_array_elements(v_rows) LOOP
      UPDATE securities SET listing_price = (x->>'price')::numeric, listing_set_at = now(), listing_set_by = jse_actor_name(a) WHERE id = (x->>'id')::integer;
    END LOOP;
    -- the prices themselves stay out of the audit trail until the IPO lists (IPO_LISTED records them)
    PERFORM jse_audit(a, 'IPO_LISTING_PRICES_SAVED', 'security', NULL, NULL, NULL, NULL, NULL,
      jsonb_build_object('ipos', (SELECT jsonb_agg(e->>'symbol') FROM jsonb_array_elements(v_rows) e),
                         'with_price', (SELECT count(*) FROM jsonb_array_elements(v_rows) e WHERE e->>'price' IS NOT NULL)));
    RETURN jsonb_build_object('success', true, 'saved', jsonb_array_length(v_rows), 'listing', jse_listing_state(a));

  ELSIF v_action = 'CLEAR' THEN
    UPDATE securities SET listing_price = NULL, listing_set_at = now(), listing_set_by = jse_actor_name(a)
    WHERE kind = 'IPO' AND listed_at IS NULL AND listing_price IS NOT NULL;
    GET DIAGNOSTICS v_i = ROW_COUNT;
    PERFORM jse_audit(a, 'IPO_LISTING_PRICES_CLEARED', 'security', NULL, NULL, NULL, NULL, NULL, jsonb_build_object('cleared', v_i));
    RETURN jsonb_build_object('success', true, 'cleared', v_i, 'listing', jse_listing_state(a));

  ELSIF v_action = 'APPLY' THEN
    FOR s IN SELECT * FROM securities
             WHERE kind = 'IPO' AND active AND listed_at IS NULL
               AND (listing_price IS NOT NULL OR coalesce((p->>'at_issue_price')::boolean, false) OR jsonb_typeof(p->'symbols') = 'array')
               AND (jsonb_typeof(p->'symbols') IS DISTINCT FROM 'array'
                    OR symbol IN (SELECT upper(trim(v)) FROM jsonb_array_elements_text(p->'symbols') v))
             ORDER BY display_order, id LOOP
      v_one := jse__list_ipo(a, s.id);
      IF v_one IS NOT NULL THEN v_out := v_out || jsonb_build_array(v_one); END IF;
    END LOOP;
    IF jsonb_array_length(v_out) = 0 THEN
      PERFORM jse_fail('NOTHING_TO_LIST', 'No IPO is waiting to be listed (save a listing price, choose IPOs, or list at the issue price).', 409);
    END IF;
    RETURN jsonb_build_object('success', true, 'listed', v_out, 'listing', jse_listing_state(a));
  END IF;
  PERFORM jse_fail('INVALID_ACTION', 'Use SET, CLEAR or APPLY.', 400);
  RETURN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Reset: clean starting state. Audit history is archived, not lost. IPOs return to the pre-market stage.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_reset_event(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE; ev event_control%ROWTYPE;
  v_keep boolean := coalesce((p->>'keep_allotments')::boolean, true);
  v_allots jsonb; r jsonb; al ipo_allotments%ROWTYPE; v_n integer := 0; v_archived integer;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF coalesce(p->>'confirm', '') <> 'RESET' THEN PERFORM jse_fail('CONFIRM_REQUIRED', 'Type RESET to confirm.', 400); END IF;
  PERFORM jse_require_admin_password(a, p);
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO ev FROM event_control WHERE id = 1 FOR UPDATE;
  IF ev.status IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_RUNNING', 'Close the market before resetting (current status: ' || replace(ev.status, '_', ' ') || ').', 409);
  END IF;
  LOCK TABLE orders, settlements, holdings, teams, securities, loans IN EXCLUSIVE MODE;
  SELECT coalesce(jsonb_agg(jsonb_build_object('team_id', team_id, 'security_id', security_id, 'lots', lots, 'quantity', quantity,
                                               'price', price, 'amount', amount, 'batch_id', batch_id) ORDER BY id), '[]'::jsonb)
  INTO v_allots FROM ipo_allotments WHERE reversed_at IS NULL;

  PERFORM set_config('jse.maintenance', 'on', true);
  INSERT INTO audit_log_archive SELECT al2.*, now(), ev.reset_count + 1 FROM audit_log al2;
  GET DIAGNOSTICS v_archived = ROW_COUNT;
  TRUNCATE action_journal, broker_commissions, cash_ledger, institution_ledger, loan_transactions, risk_events, price_history,
           market_news, order_events, settlements, holdings, institutional_holdings, ipo_allotments, trading_slips, instructions, orders, audit_log;
  PERFORM set_config('jse.maintenance', 'off', true);

  UPDATE teams SET cash = cfg.initial_capital, realized_pnl = 0, brokerage_paid = 0, short_sell_attempts = 0,
                   cash_shortfall_attempts = 0, insufficient_balance_rejections = 0, updated_at = now();
  UPDATE loans SET original_principal = 0, principal_outstanding = 0, interest_outstanding = 0, interest_charged = 0,
                   interest_paid = 0, principal_repaid = 0, draws = 0, status = 'NONE', updated_at = now();
  INSERT INTO loans(team_id) SELECT id FROM teams ON CONFLICT (team_id) DO NOTHING;
  UPDATE institutions SET cash = initial_cash, updated_at = now();
  -- base / reference prices; IPOs back to the pre-market stage (saved listing prices are kept for the next START)
  UPDATE securities SET price = base_price, previous_price = base_price, trade_count = 0, traded_quantity = 0, traded_value = 0,
                        last_trade_at = NULL, listed_at = NULL, last_price_change_at = NULL,
                        index_base_price = CASE WHEN kind = 'EQUITY' THEN base_price END, updated_at = now();
  INSERT INTO cash_ledger(team_id, entry_type, credit, balance_after, note, actor_id, actor_name)
  SELECT id, 'INITIAL_CAPITAL', cfg.initial_capital, cfg.initial_capital, 'Initial event capital', nullif(a->>'id', '')::integer, jse_actor_name(a) FROM teams;
  INSERT INTO institution_ledger(institution_id, entry_type, credit, balance_after, note, actor_id, actor_name)
  SELECT id, 'INITIAL_CAPITAL', initial_cash, initial_cash, 'Initial institutional cash', nullif(a->>'id', '')::integer, jse_actor_name(a) FROM institutions;

  IF v_keep THEN
    FOR r IN SELECT value FROM jsonb_array_elements(v_allots) LOOP
      INSERT INTO ipo_allotments(team_id, security_id, lots, quantity, price, amount, batch_id, created_by, created_by_name)
      VALUES ((r->>'team_id')::integer, (r->>'security_id')::integer, (r->>'lots')::integer, (r->>'quantity')::integer,
              (r->>'price')::numeric, (r->>'amount')::numeric, r->>'batch_id', nullif(a->>'id', '')::integer, jse_actor_name(a))
      RETURNING * INTO al;
      PERFORM jse__apply_allotment(a, al);
      v_n := v_n + 1;
    END LOOP;
  END IF;

  UPDATE event_control SET status = 'NOT_STARTED', started_at = NULL, paused_at = NULL, closed_at = NULL, finalized_at = NULL,
         status_changed_at = now(), status_changed_by = jse_actor_name(a), reset_count = reset_count + 1, last_reset_at = now(),
         market_updated_at = now() WHERE id = 1;
  PERFORM jse_audit(a, 'RESET_EVENT', 'event', 'event_control', NULL, NULL, jsonb_build_object('status', ev.status),
    jsonb_build_object('status', 'NOT_STARTED'),
    jsonb_build_object('reset_no', ev.reset_count + 1, 'archived_audit_rows', v_archived, 'kept_ipo_allotments', v_n, 'keep_allotments', v_keep,
                       'team_names_locked', cfg.team_names_locked_at IS NOT NULL));
  RETURN jsonb_build_object('success', true, 'status', 'NOT_STARTED', 'reset_no', ev.reset_count + 1, 'kept_ipo_allotments', v_n, 'archived_audit_rows', v_archived);
END $$;

-- ---------------------------------------------------------------------------
-- Undo / redo of journaled actions where it is safe to do so
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__undo_settlement(a jsonb, p_settle bigint) RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  st settlements%ROWTYPE; o orders%ROWTYPE; s securities%ROWTYPE; t teams%ROWTYPE; ln loans%ROWTYPE; inst institutions%ROWTYPE;
  v_bal numeric; v_team_buys boolean;
BEGIN
  SELECT * INTO st FROM settlements WHERE id = p_settle FOR UPDATE;
  IF NOT FOUND OR st.reversed_at IS NOT NULL THEN RETURN 'This settlement is already reversed.'; END IF;
  SELECT * INTO o FROM orders WHERE id = st.order_id FOR UPDATE;
  SELECT * INTO s FROM securities WHERE id = st.security_id FOR NO KEY UPDATE;
  SELECT * INTO t FROM teams WHERE id = st.team_id FOR UPDATE;
  SELECT * INTO ln FROM loans WHERE team_id = st.team_id FOR UPDATE;
  IF st.institution_id IS NOT NULL THEN SELECT * INTO inst FROM institutions WHERE id = st.institution_id FOR UPDATE; END IF;

  IF st.loan_drawn > 0 AND EXISTS (SELECT 1 FROM loan_transactions lt WHERE lt.team_id = st.team_id AND lt.id >
       (SELECT max(lt2.id) FROM loan_transactions lt2 WHERE lt2.settlement_id = st.id)) THEN
    RETURN 'The team''s loan changed after this settlement; it cannot be reversed safely.';
  END IF;
  v_team_buys := (st.account_type = 'TEAM' AND st.side = 'BUY') OR (st.account_type = 'INSTITUTION' AND st.side = 'SELL');
  IF t.cash - st.team_cash_delta < 0 THEN
    RETURN t.code || ' no longer has the cash needed to reverse this settlement.';
  END IF;
  IF v_team_buys AND coalesce((SELECT quantity FROM holdings WHERE team_id = t.id AND security_id = s.id), 0) < st.quantity THEN
    RETURN t.code || ' no longer holds the bought shares.';
  END IF;
  IF st.institution_id IS NOT NULL AND NOT v_team_buys
     AND coalesce((SELECT quantity FROM institutional_holdings WHERE institution_id = st.institution_id AND security_id = s.id), 0) < st.quantity THEN
    RETURN 'The institution no longer holds the bought shares.';
  END IF;

  -- team side
  v_bal := t.cash - st.team_cash_delta;
  PERFORM jse_ledger(t.id, o.id, st.id, 'REVERSAL', greatest(st.team_cash_delta, 0), greatest(-st.team_cash_delta, 0), v_bal,
    'Undo of ' || o.order_no || ' settlement', a);
  UPDATE teams SET cash = v_bal, realized_pnl = realized_pnl - st.realized_pnl, brokerage_paid = greatest(0, brokerage_paid - st.brokerage), updated_at = now()
  WHERE id = t.id;
  IF v_team_buys THEN
    UPDATE holdings SET quantity = quantity - st.quantity, cost_basis = greatest(0, cost_basis - st.cost_moved),
           trade_cost = greatest(0, trade_cost - st.trade_cost_moved), updated_at = now() WHERE team_id = t.id AND security_id = s.id;
    DELETE FROM holdings WHERE team_id = t.id AND security_id = s.id AND quantity = 0;
  ELSE
    INSERT INTO holdings(team_id, security_id, quantity, cost_basis, trade_cost) VALUES (t.id, s.id, st.quantity, st.cost_moved, st.trade_cost_moved)
    ON CONFLICT (team_id, security_id) DO UPDATE SET quantity = holdings.quantity + EXCLUDED.quantity,
      cost_basis = holdings.cost_basis + EXCLUDED.cost_basis, trade_cost = holdings.trade_cost + EXCLUDED.trade_cost, updated_at = now();
  END IF;
  IF st.loan_drawn > 0 THEN
    UPDATE loans SET original_principal = greatest(0, original_principal - st.loan_drawn), principal_outstanding = greatest(0, principal_outstanding - st.loan_drawn),
           interest_outstanding = greatest(0, interest_outstanding - st.loan_interest), interest_charged = greatest(0, interest_charged - st.loan_interest),
           draws = greatest(0, draws - 1), updated_at = now() WHERE team_id = t.id;
    UPDATE loans SET status = CASE WHEN original_principal = 0 THEN 'NONE' WHEN principal_outstanding + interest_outstanding = 0 THEN 'REPAID' ELSE 'OUTSTANDING' END WHERE team_id = t.id;
    INSERT INTO loan_transactions(team_id, kind, amount, order_id, settlement_id, note, actor_id, actor_name)
    VALUES (t.id, 'REVERSAL', st.loan_drawn, o.id, st.id, 'Automatic draw and its interest reversed (undo)', nullif(a->>'id', '')::integer, jse_actor_name(a));
    PERFORM jse_ledger(t.id, o.id, st.id, 'INTEREST_CHARGE', 0, 0, v_bal, 'Loan interest \u20B9' || st.loan_interest || ' on the reversed draw cancelled (undo)', a);
  END IF;
  -- institution side
  IF st.institution_id IS NOT NULL THEN
    UPDATE institutions SET cash = st.institution_cash_before, updated_at = now() WHERE id = st.institution_id;
    PERFORM jse_inst_ledger(st.institution_id, o.id, st.id, 'REVERSAL',
      greatest(st.institution_cash_after - st.institution_cash_before, 0), greatest(st.institution_cash_before - st.institution_cash_after, 0),
      st.institution_cash_before, 'Undo of ' || o.order_no || ' settlement', a);
    IF v_team_buys THEN
      INSERT INTO institutional_holdings(institution_id, security_id, quantity, cost_basis) VALUES (st.institution_id, s.id, st.quantity, st.inst_cost_moved)
      ON CONFLICT (institution_id, security_id) DO UPDATE SET quantity = institutional_holdings.quantity + EXCLUDED.quantity,
        cost_basis = institutional_holdings.cost_basis + EXCLUDED.cost_basis, updated_at = now();
    ELSE
      UPDATE institutional_holdings SET quantity = quantity - st.quantity, cost_basis = greatest(0, cost_basis - st.inst_cost_moved), updated_at = now()
      WHERE institution_id = st.institution_id AND security_id = s.id;
      DELETE FROM institutional_holdings WHERE institution_id = st.institution_id AND security_id = s.id AND quantity = 0;
    END IF;
  END IF;
  UPDATE broker_commissions SET reversed_at = now() WHERE settlement_id = st.id AND reversed_at IS NULL;
  -- market prices are not touched: settlement never moved them
  UPDATE securities SET trade_count = greatest(0, trade_count - 1), traded_quantity = greatest(0, traded_quantity - st.quantity),
         traded_value = greatest(0, traded_value - st.trade_value) WHERE id = s.id;
  UPDATE settlements SET reversed_at = now(), reversed_by_name = jse_actor_name(a) WHERE id = st.id;
  UPDATE orders SET status = 'EXCHANGE_APPROVED', bank_by = NULL, bank_by_name = NULL, bank_at = NULL, updated_at = now() WHERE id = o.id;
  PERFORM jse_order_event(o.id, 'UNDO_SETTLEMENT', 'BANK_SETTLED', 'EXCHANGE_APPROVED', a, 'Settlement reversed by administrator; back in the Bank queue', NULL);
  PERFORM jse_audit(a, 'SETTLEMENT_REVERSED', 'order', o.order_no, t.id, o.id, jsonb_build_object('status', 'BANK_SETTLED', 'cash', t.cash),
    jsonb_build_object('status', 'EXCHANGE_APPROVED', 'cash', v_bal), jsonb_build_object('settlement_id', st.id, 'loan_reversed', st.loan_drawn));
  RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION jse_undo_redo(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  j action_journal%ROWTYPE; o orders%ROWTYPE; s securities%ROWTYPE; n market_news%ROWTYPE;
  v_action text := upper(coalesce(p->>'action', ''));
  v_msg text; v_cur text; v_res jsonb; v_to text; v_from text;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF v_action NOT IN ('UNDO', 'REDO') THEN PERFORM jse_fail('INVALID_ACTION', 'Use UNDO or REDO.', 400); END IF;
  PERFORM jse_require_admin_password(a, p);
  IF nullif(p->>'journal_id', '') IS NULL THEN
    IF v_action = 'UNDO' THEN
      SELECT * INTO j FROM action_journal
      WHERE (undone_at IS NULL OR redone_at > undone_at) AND NOT coalesce((payload->>'superseded')::boolean, false)
      ORDER BY id DESC LIMIT 1 FOR UPDATE;
    ELSE
      SELECT * INTO j FROM action_journal
      WHERE undone_at IS NOT NULL AND (redone_at IS NULL OR redone_at < undone_at) AND NOT coalesce((payload->>'superseded')::boolean, false)
      ORDER BY undone_at DESC LIMIT 1 FOR UPDATE;
    END IF;
  ELSE
    SELECT * INTO j FROM action_journal WHERE id = (p->>'journal_id')::bigint FOR UPDATE;
  END IF;
  IF NOT FOUND THEN PERFORM jse_fail('NOTHING_TO_' || v_action, CASE WHEN v_action = 'UNDO' THEN 'There is nothing to undo.' ELSE 'There is nothing to redo.' END, 404); END IF;
  IF coalesce((j.payload->>'superseded')::boolean, false) THEN
    PERFORM jse_fail('SUPERSEDED', 'That action was already redone; use the newer entry in the list.', 409);
  END IF;
  IF v_action = 'UNDO' AND j.undone_at IS NOT NULL AND (j.redone_at IS NULL OR j.redone_at < j.undone_at) THEN
    PERFORM jse_fail('ALREADY_UNDONE', 'That action is already undone.', 409);
  END IF;
  IF v_action = 'REDO' AND (j.undone_at IS NULL OR (j.redone_at IS NOT NULL AND j.redone_at > j.undone_at)) THEN
    PERFORM jse_fail('NOT_UNDONE', 'Only an undone action can be redone.', 409);
  END IF;
  SELECT status INTO v_cur FROM event_control WHERE id = 1;

  IF j.action = 'EXCHANGE_DECISION' THEN
    SELECT * INTO o FROM orders WHERE id = (j.payload->>'order_id')::bigint FOR UPDATE;
    IF v_action = 'UNDO' THEN
      IF o.status <> j.payload->>'decision' THEN PERFORM jse_fail('UNSAFE_UNDO', o.order_no || ' has moved on (status ' || o.status || '); undo the later step first.', 409); END IF;
      UPDATE orders SET status = 'EXCHANGE_PENDING', exchange_by = NULL, exchange_by_name = NULL, exchange_at = NULL, exchange_note = NULL,
             reject_code = NULL, reject_reason = NULL, updated_at = now() WHERE id = o.id;
      PERFORM jse_order_event(o.id, 'UNDO_EXCHANGE', o.status, 'EXCHANGE_PENDING', a, 'Exchange decision undone', NULL);
    ELSE
      IF o.status <> 'EXCHANGE_PENDING' THEN PERFORM jse_fail('UNSAFE_REDO', o.order_no || ' is no longer pending at the Exchange.', 409); END IF;
      v_res := jse_exchange_decide(a, jsonb_build_object('order_id', o.id, 'action', CASE WHEN j.payload->>'decision' = 'EXCHANGE_APPROVED' THEN 'APPROVE' ELSE 'REJECT' END,
                                                         'reason', j.payload->>'reason', 'confirm_short_sell', true));
    END IF;
  ELSIF j.action = 'BANK_REJECT' THEN
    SELECT * INTO o FROM orders WHERE id = (j.payload->>'order_id')::bigint FOR UPDATE;
    IF v_action = 'UNDO' THEN
      IF o.status <> 'BANK_REJECTED' THEN PERFORM jse_fail('UNSAFE_UNDO', o.order_no || ' is not bank-rejected any more.', 409); END IF;
      UPDATE orders SET status = 'EXCHANGE_APPROVED', reject_code = NULL, reject_reason = NULL, bank_by = NULL, bank_by_name = NULL, bank_at = NULL,
             bank_note = NULL, updated_at = now() WHERE id = o.id;
      IF j.payload->>'code' = 'INSUFFICIENT_BALANCE' AND EXISTS (SELECT 1 FROM risk_events WHERE order_id = o.id AND kind = 'INSUFFICIENT_BALANCE_REJECTION') THEN
        DELETE FROM risk_events WHERE order_id = o.id AND kind = 'INSUFFICIENT_BALANCE_REJECTION';
        UPDATE teams SET insufficient_balance_rejections = greatest(0, insufficient_balance_rejections - 1) WHERE id = o.team_id;
      END IF;
      PERFORM jse_order_event(o.id, 'UNDO_BANK_REJECT', 'BANK_REJECTED', 'EXCHANGE_APPROVED', a, 'Bank rejection undone', NULL);
    ELSE
      IF o.status NOT IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN PERFORM jse_fail('UNSAFE_REDO', o.order_no || ' is not waiting for the Bank.', 409); END IF;
      v_res := jse__bank_reject(a, o, coalesce(j.payload->>'code', 'BANK_REJECTED_BY_OPERATOR'), coalesce(j.payload->>'reason', 'Rejected by Bank'), '{"redo":true}'::jsonb);
    END IF;
  ELSIF j.action = 'BANK_SETTLE' THEN
    IF v_action = 'UNDO' THEN
      v_msg := jse__undo_settlement(a, (j.payload->>'settlement_id')::bigint);
      IF v_msg IS NOT NULL THEN PERFORM jse_fail('UNSAFE_UNDO', v_msg, 409); END IF;
    ELSE
      IF v_cur NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN PERFORM jse_fail('EVENT_NOT_OPEN', 'Redo of a settlement needs the market LIVE or SETTLEMENT ONLY.', 409); END IF;
      v_res := jse__settle(a, (j.payload->>'order_id')::bigint, 'REDO');
      IF v_res->>'status' <> 'BANK_SETTLED' THEN
        RETURN jsonb_build_object('success', true, 'action', 'REDO', 'journal_id', j.id, 'result', v_res,
                                  'message', 'Redo validation failed; the order was rejected: ' || coalesce(v_res->>'reason', ''));
      END IF;
    END IF;
  ELSIF j.action = 'MARKET_NEWS' THEN
    SELECT * INTO n FROM market_news WHERE id = (j.payload->>'news_id')::bigint FOR UPDATE;
    SELECT * INTO s FROM securities WHERE id = n.security_id FOR UPDATE;
    IF v_action = 'UNDO' THEN
      IF n.reversed_at IS NOT NULL THEN PERFORM jse_fail('ALREADY_UNDONE', 'That news impact is already reversed.', 409); END IF;
      IF s.price <> n.new_price OR EXISTS (SELECT 1 FROM price_history ph WHERE ph.security_id = s.id AND ph.created_at > n.created_at AND ph.news_id IS DISTINCT FROM n.id) THEN
        PERFORM jse_fail('UNSAFE_UNDO', s.symbol || ' has moved since this news. Undo the later actions first.', 409);
      END IF;
      PERFORM jse__set_price(a, s.id, n.previous_price, 'UNDO', n.id, n.prior_previous);
      UPDATE market_news SET reversed_at = now() WHERE id = n.id;
    ELSE
      IF n.reversed_at IS NULL THEN PERFORM jse_fail('NOT_UNDONE', 'That news impact is still active.', 409); END IF;
      IF s.price <> n.previous_price THEN PERFORM jse_fail('UNSAFE_REDO', s.symbol || ' has moved since; re-publish the news instead.', 409); END IF;
      PERFORM jse__set_price(a, s.id, n.new_price, 'REDO', n.id);
      UPDATE market_news SET reversed_at = NULL, created_at = now() WHERE id = n.id;
    END IF;
  ELSIF j.action = 'IPO_LISTING' THEN
    SELECT * INTO s FROM securities WHERE id = (j.payload->>'security_id')::integer FOR UPDATE;
    IF v_action = 'UNDO' THEN
      IF s.listed_at IS NULL THEN PERFORM jse_fail('ALREADY_UNDONE', s.symbol || ' is not listed.', 409); END IF;
      IF s.price <> (j.payload->>'listing_price')::numeric OR s.trade_count > 0
         OR EXISTS (SELECT 1 FROM price_history ph WHERE ph.security_id = s.id AND ph.created_at > s.listed_at)
         OR EXISTS (SELECT 1 FROM orders x WHERE x.security_id = s.id AND x.status NOT IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED')) THEN
        PERFORM jse_fail('UNSAFE_UNDO', s.symbol || ' has orders, trades or price moves since listing. Undo the later actions first.', 409);
      END IF;
      PERFORM jse__set_price(a, s.id, (j.payload->>'from_price')::numeric, 'UNDO', NULL, (j.payload->>'from_previous')::numeric);
      UPDATE securities SET listed_at = NULL, index_base_price = NULL WHERE id = s.id;
    ELSE
      IF s.listed_at IS NOT NULL THEN PERFORM jse_fail('NOT_UNDONE', s.symbol || ' is already listed.', 409); END IF;
      IF s.price <> (j.payload->>'from_price')::numeric OR s.trade_count > 0 THEN
        PERFORM jse_fail('UNSAFE_REDO', s.symbol || ' has moved since; save the listing price and list it again instead.', 409);
      END IF;
      PERFORM jse__set_price(a, s.id, (j.payload->>'listing_price')::numeric, 'REDO');
      UPDATE securities SET listed_at = clock_timestamp(), index_base_price = (j.payload->>'listing_price')::numeric WHERE id = s.id;
    END IF;
  ELSIF j.action = 'EVENT_STATUS' THEN
    v_from := j.payload->>'from'; v_to := j.payload->>'to';
    IF v_action = 'UNDO' THEN
      IF v_cur <> v_to THEN PERFORM jse_fail('UNSAFE_UNDO', 'The event status has changed since (' || v_cur || ').', 409); END IF;
      IF v_from = 'NOT_STARTED' AND EXISTS (SELECT 1 FROM orders) THEN PERFORM jse_fail('UNSAFE_UNDO', 'Orders already exist; use RESET instead.', 409); END IF;
      PERFORM jse__set_status(a, v_from, false, 'EVENT_STATUS_UNDO');
    ELSE
      IF v_cur <> v_from THEN PERFORM jse_fail('UNSAFE_REDO', 'The event status has changed since (' || v_cur || ').', 409); END IF;
      IF v_to = 'FINALIZED' AND EXISTS (SELECT 1 FROM orders WHERE status IN ('PIT_PENDING', 'EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING')) THEN
        PERFORM jse_fail('OPEN_ORDERS', 'Cannot finalize while orders are still open.', 409);
      END IF;
      PERFORM jse__set_status(a, v_to, false, 'EVENT_STATUS_REDO');
    END IF;
  END IF;

  IF v_action = 'UNDO' THEN
    UPDATE action_journal SET undone_at = clock_timestamp(), undone_by = jse_actor_name(a) WHERE id = j.id;
  ELSE
    -- redo of Exchange / Bank steps runs the engine again, which journals a fresh entry;
    -- this entry is then marked superseded so the same step can never be undone or redone twice
    UPDATE action_journal SET redone_at = clock_timestamp(), redone_by = jse_actor_name(a),
           payload = CASE WHEN j.action IN ('EXCHANGE_DECISION', 'BANK_SETTLE', 'BANK_REJECT') THEN payload || '{"superseded":true}'::jsonb ELSE payload END
    WHERE id = j.id;
  END IF;
  PERFORM jse_audit(a, v_action, 'journal', j.id::text, NULL, NULL, NULL, NULL, jsonb_build_object('journal_action', j.action, 'summary', j.summary));
  RETURN jsonb_build_object('success', true, 'action', v_action, 'journal_id', j.id, 'summary', j.summary, 'result', v_res);
END $$;

-- ---------------------------------------------------------------------------
-- Rules & Configuration (the single source of truth for every event rule). Saving requires the password.
-- Rates may be given as percentages (brokerage_rate_pct, loan_interest_rate_pct) or fractions.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_update_config(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE before jsonb; after jsonb; v_status text; cfg event_config%ROWTYPE;
  v_brk numeric; v_loan numeric; v_start timestamptz; v_max numeric; v_min numeric; v_move numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT to_jsonb(c) - 'updated_at' INTO before FROM event_config c WHERE id = 1;
  BEGIN
    v_brk := coalesce(nullif(p->>'brokerage_rate_pct', '')::numeric / 100, nullif(p->>'brokerage_rate', '')::numeric);
    v_loan := coalesce(nullif(p->>'loan_interest_rate_pct', '')::numeric / 100, nullif(p->>'loan_interest_rate', '')::numeric);
    v_start := nullif(p->>'event_start_at', '')::timestamptz;
    v_max := nullif(p->>'max_order_value', '')::numeric;
    v_min := nullif(p->>'min_order_value', '')::numeric;
    v_move := nullif(p->>'max_price_move_pct', '')::numeric;
  EXCEPTION WHEN others THEN
    PERFORM jse_fail('INVALID_CONFIG', 'One of the values is not a valid number or date.', 400);
  END;
  IF v_status <> 'NOT_STARTED' AND ((p ? 'initial_capital' AND nullif(p->>'initial_capital', '')::numeric IS DISTINCT FROM cfg.initial_capital)
                                 OR (p ? 'institutional_cash' AND nullif(p->>'institutional_cash', '')::numeric IS DISTINCT FROM cfg.institutional_cash)) THEN
    PERFORM jse_fail('EVENT_STARTED', 'Starting capital can only be changed before the event starts (then RESET).', 409);
  END IF;
  IF v_brk IS NOT NULL AND (v_brk < 0 OR v_brk >= 1) THEN PERFORM jse_fail('INVALID_CONFIG', 'Brokerage must be between 0% and 100%.', 400); END IF;
  IF v_loan IS NOT NULL AND (v_loan < 0 OR v_loan >= 1) THEN PERFORM jse_fail('INVALID_CONFIG', 'Loan interest must be between 0% and 100%.', 400); END IF;
  IF v_move IS NOT NULL AND (v_move <= 0 OR v_move > 10) THEN PERFORM jse_fail('INVALID_CONFIG', 'Maximum price movement must be above 0% and at most the \xB110% event cap.', 400); END IF;
  IF coalesce(v_min, cfg.min_order_value) >= coalesce(v_max, cfg.max_order_value) THEN
    PERFORM jse_fail('INVALID_CONFIG', 'Minimum order value must be lower than the maximum order value.', 400);
  END IF;
  UPDATE event_config SET
    event_name              = coalesce(nullif(trim(p->>'event_name'), ''), event_name),
    event_start_at          = coalesce(v_start, event_start_at),
    initial_capital         = coalesce(nullif(p->>'initial_capital', '')::numeric, initial_capital),
    institutional_cash      = coalesce(nullif(p->>'institutional_cash', '')::numeric, institutional_cash),
    brokerage_rate          = coalesce(v_brk, brokerage_rate),
    max_price_move_pct      = coalesce(v_move, max_price_move_pct),
    min_order_value         = coalesce(v_min, min_order_value),
    max_order_value         = coalesce(v_max, max_order_value),
    loan_max_principal      = coalesce(nullif(p->>'loan_max_principal', '')::numeric, loan_max_principal),
    loan_interest_rate      = coalesce(v_loan, loan_interest_rate),
    cash_rule_limit         = coalesce(nullif(p->>'cash_rule_limit', '')::numeric, cash_rule_limit),
    min_buy_trades          = coalesce(nullif(p->>'min_buy_trades', '')::integer, min_buy_trades),
    min_sell_trades         = coalesce(nullif(p->>'min_sell_trades', '')::integer, min_sell_trades),
    ipo_application_hours   = coalesce(nullif(p->>'ipo_application_hours', '')::numeric, ipo_application_hours),
    loans_enabled           = coalesce((p->>'loans_enabled')::boolean, loans_enabled),
    auto_loan_on_settlement = coalesce((p->>'auto_loan_on_settlement')::boolean, auto_loan_on_settlement),
    loan_repayment_required = coalesce((p->>'loan_repayment_required')::boolean, loan_repayment_required),
    institution_overdraft   = coalesce((p->>'institution_overdraft')::boolean, institution_overdraft),
    institution_brokerage   = coalesce((p->>'institution_brokerage')::boolean, institution_brokerage),
    auto_list_ipos          = coalesce((p->>'auto_list_ipos')::boolean, auto_list_ipos),
    min_cash_buffer         = 0,
    participant_order_entry = false,
    updated_at = now(), updated_by = jse_actor_name(a)
  WHERE id = 1;
  IF p ? 'institutional_cash' AND nullif(p->>'institutional_cash', '') IS NOT NULL THEN
    UPDATE institutions SET initial_cash = (p->>'institutional_cash')::numeric;
  END IF;
  SELECT to_jsonb(c) - 'updated_at' INTO after FROM event_config c WHERE id = 1;
  PERFORM jse_audit(a, 'CONFIG_UPDATED', 'event_config', '1', NULL, NULL, before, after,
    jsonb_build_object('changed', (SELECT coalesce(jsonb_agg(k), '[]'::jsonb) FROM jsonb_object_keys(after) k WHERE after->k IS DISTINCT FROM before->k AND k <> 'updated_by')));
  RETURN jsonb_build_object('success', true, 'config', after);
EXCEPTION WHEN check_violation OR invalid_text_representation OR numeric_value_out_of_range OR invalid_datetime_format THEN
  PERFORM jse_fail('INVALID_CONFIG', 'One of the values is not valid.', 400);
  RETURN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Team roster (Team, Team Name, Section, Broker, Members). Atomic: every row is validated first.
-- Team names must come from the IKS pool, stay unique, and cannot change once names are locked.
-- teams.broker_id is the one canonical broker assignment.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_update_teams(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  r jsonb; v_errors jsonb := '[]'::jsonb; v_plan jsonb := '[]'::jsonb; v_broker integer; v_team teams%ROWTYPE; v_i integer := 0;
  v_name text; v_locked boolean; x jsonb; v_n integer := 0; v_dupe record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;
  SELECT team_names_locked_at IS NOT NULL INTO v_locked FROM event_config WHERE id = 1;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN PERFORM jse_fail('NO_ROWS', 'No team rows were supplied.', 400); END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(r->>'team', '')));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown team ' || coalesce(nullif(r->>'team', ''), '(blank)')); CONTINUE; END IF;
    v_broker := NULL;
    IF coalesce(trim(r->>'broker'), '') <> '' THEN
      SELECT id INTO v_broker FROM brokers WHERE code = upper(trim(r->>'broker')) OR upper(name) = upper(trim(r->>'broker'));
      IF v_broker IS NULL THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ': unknown broker ' || (r->>'broker')); CONTINUE; END IF;
    END IF;
    v_name := NULL;
    IF coalesce(trim(r->>'name'), '') <> '' THEN
      SELECT name INTO v_name FROM team_name_pool WHERE lower(name) = lower(trim(r->>'name')) AND active;
      IF v_name IS NULL THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ': "' || trim(r->>'name') || '" is not in the Indian Knowledge System team-name pool'); CONTINUE;
      END IF;
      IF v_locked AND v_name <> v_team.name THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ': team names are locked for the event (current name ' || v_team.name || ')'); CONTINUE;
      END IF;
    END IF;
    IF length(coalesce(r->>'section', '')) > 120 OR length(coalesce(r->>'members', '')) > 1000 THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ': section or members text is too long'); CONTINUE;
    END IF;
    v_plan := v_plan || jsonb_build_object('id', v_team.id, 'code', v_team.code, 'name', coalesce(v_name, v_team.name),
      'section', coalesce(nullif(trim(r->>'section'), ''), v_team.section), 'members', coalesce(nullif(trim(r->>'members'), ''), v_team.members),
      'broker_id', coalesce(v_broker, v_team.broker_id), 'active', coalesce((r->>'active')::boolean, v_team.active),
      'before', jsonb_build_object('name', v_team.name, 'section', v_team.section, 'members', v_team.members, 'broker_id', v_team.broker_id, 'active', v_team.active));
  END LOOP;
  -- the same team twice, or a name used by two teams once the file is applied
  FOR v_dupe IN SELECT e->>'code' AS code, count(*) AS n FROM jsonb_array_elements(v_plan) e GROUP BY 1 HAVING count(*) > 1 LOOP
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', v_dupe.code || ' appears ' || v_dupe.n || ' times in the file');
  END LOOP;
  FOR v_dupe IN
    WITH final AS (
      SELECT t.code, coalesce((SELECT e->>'name' FROM jsonb_array_elements(v_plan) e WHERE (e->>'id')::integer = t.id LIMIT 1), t.name) AS name FROM teams t)
    SELECT lower(name) AS nm, string_agg(code, ', ' ORDER BY code) AS codes, count(*) AS n FROM final GROUP BY lower(name) HAVING count(*) > 1
  LOOP
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', 'Team name "' || v_dupe.nm || '" would be used by ' || v_dupe.codes);
  END LOOP;
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'ROSTER_ERRORS', 'error', 'Nothing was saved. Fix the rows listed and try again.', 'errors', v_errors, 'http', 400);
  END IF;
  IF coalesce((p->>'dry_run')::boolean, false) THEN
    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_plan));
  END IF;
  -- apply (names through temporary values so swaps never collide)
  UPDATE teams t SET name = '~' || t.code FROM jsonb_array_elements(v_plan) e WHERE t.id = (e->>'id')::integer AND t.name <> e->>'name';
  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    UPDATE teams SET name = x->>'name', section = x->>'section', members = x->>'members', broker_id = (x->>'broker_id')::integer,
           active = (x->>'active')::boolean, updated_at = now()
    WHERE id = (x->>'id')::integer;
    IF (x->'before') IS DISTINCT FROM jsonb_build_object('name', x->>'name', 'section', x->>'section', 'members', x->>'members',
                                                          'broker_id', (x->>'broker_id')::integer, 'active', (x->>'active')::boolean) THEN
      PERFORM jse_audit(a, 'TEAM_UPDATED', 'team', x->>'code', (x->>'id')::integer, NULL,
        (x->'before') || jsonb_build_object('broker', (SELECT code FROM brokers WHERE id = (x->'before'->>'broker_id')::integer)),
        jsonb_build_object('name', x->>'name', 'section', x->>'section', 'members', x->>'members', 'active', (x->>'active')::boolean,
                           'broker', (SELECT code FROM brokers WHERE id = (x->>'broker_id')::integer)), NULL);
      v_n := v_n + 1;
    END IF;
  END LOOP;
  UPDATE app_users u SET display_name = t.name, updated_at = now() FROM teams t WHERE u.team_id = t.id AND u.role = 'PARTICIPANT' AND u.display_name <> t.name;
  PERFORM jse_audit(a, 'TEAMS_UPDATED', 'team', NULL, NULL, NULL, NULL, NULL, jsonb_build_object('rows', jsonb_array_length(v_plan), 'changed', v_n));
  RETURN jsonb_build_object('success', true, 'updated', jsonb_array_length(v_plan), 'changed', v_n);
END $$;

-- Broker roster (Broker Code, Broker Name, optional Contact and Desk). Atomic; the 10 brokers stay the broker population.
CREATE OR REPLACE FUNCTION jse_update_brokers(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE r jsonb; v_errors jsonb := '[]'::jsonb; v_plan jsonb := '[]'::jsonb; b brokers%ROWTYPE; v_i integer := 0; x jsonb; v_n integer := 0;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN PERFORM jse_fail('NO_ROWS', 'No broker rows were supplied.', 400); END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    SELECT * INTO b FROM brokers WHERE code = upper(trim(coalesce(r->>'broker', r->>'code', '')));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown broker code ' || coalesce(nullif(coalesce(r->>'broker', r->>'code'), ''), '(blank)')); CONTINUE; END IF;
    IF length(coalesce(r->>'name', '')) > 120 OR length(coalesce(r->>'contact', '')) > 200 OR length(coalesce(r->>'desk', '')) > 120 THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', b.code || ': text too long'); CONTINUE;
    END IF;
    v_plan := v_plan || jsonb_build_object('id', b.id, 'code', b.code,
      'name', coalesce(nullif(trim(r->>'name'), ''), b.name),
      'contact', CASE WHEN r ? 'contact' THEN nullif(trim(r->>'contact'), '') ELSE b.contact END,
      'desk', CASE WHEN r ? 'desk' THEN nullif(trim(r->>'desk'), '') ELSE b.desk END,
      'before', jsonb_build_object('name', b.name, 'contact', b.contact, 'desk', b.desk));
  END LOOP;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(v_plan) e GROUP BY e->>'code' HAVING count(*) > 1) THEN
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', 'A broker code appears more than once in the file');
  END IF;
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'ROSTER_ERRORS', 'error', 'Nothing was saved. Fix the rows listed and try again.', 'errors', v_errors, 'http', 400);
  END IF;
  IF coalesce((p->>'dry_run')::boolean, false) THEN RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_plan)); END IF;
  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    UPDATE brokers SET name = x->>'name', contact = x->>'contact', desk = x->>'desk' WHERE id = (x->>'id')::integer;
    UPDATE app_users SET display_name = x->>'name', updated_at = now() WHERE role = 'BROKER' AND broker_id = (x->>'id')::integer AND display_name <> x->>'name';
    IF (x->'before') IS DISTINCT FROM jsonb_build_object('name', x->>'name', 'contact', x->>'contact', 'desk', x->>'desk') THEN
      PERFORM jse_audit(a, 'BROKER_UPDATED', 'broker', x->>'code', NULL, NULL, x->'before',
        jsonb_build_object('name', x->>'name', 'contact', x->>'contact', 'desk', x->>'desk'), NULL);
      v_n := v_n + 1;
    END IF;
  END LOOP;
  PERFORM jse_audit(a, 'BROKERS_UPDATED', 'broker', NULL, NULL, NULL, NULL, NULL, jsonb_build_object('rows', jsonb_array_length(v_plan), 'changed', v_n));
  RETURN jsonb_build_object('success', true, 'updated', jsonb_array_length(v_plan), 'changed', v_n);
END $$;

CREATE OR REPLACE FUNCTION jse_random_password() RETURNS text LANGUAGE sql VOLATILE AS $$
  -- 10 characters from an unambiguous alphabet
  SELECT string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789', 1 + (get_byte(b, i) % 56), 1), '')
  FROM (SELECT gen_random_bytes(10) AS b) x, generate_series(0, 9) AS i
$$;

CREATE OR REPLACE FUNCTION jse_admin_users(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(p->>'action', 'LIST'));
  u app_users%ROWTYPE; v_pw text; v_out jsonb := '[]'::jsonb; r record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF v_action = 'LIST' THEN
    RETURN jsonb_build_object('success', true, 'users', coalesce((
      SELECT jsonb_agg(jsonb_build_object('id', u2.id, 'username', u2.username, 'name', u2.display_name, 'role', u2.role,
                                          'team', t.code, 'broker', b.code, 'active', u2.active, 'last_login_at', u2.last_login_at,
                                          'must_change_password', u2.must_change_password) ORDER BY u2.role, u2.username)
      FROM app_users u2 LEFT JOIN teams t ON t.id = u2.team_id LEFT JOIN brokers b ON b.id = u2.broker_id), '[]'::jsonb));
  END IF;
  PERFORM jse_require_admin_password(a, p);
  IF v_action = 'RESET_PASSWORD' THEN
    SELECT * INTO u FROM app_users WHERE lower(username) = lower(trim(coalesce(p->>'username', ''))) FOR UPDATE;
    IF NOT FOUND THEN PERFORM jse_fail('USER_NOT_FOUND', 'User not found.', 404); END IF;
    v_pw := coalesce(nullif(p->>'password', ''), jse_random_password());
    IF length(v_pw) < 8 THEN PERFORM jse_fail('WEAK_PASSWORD', 'Use at least 8 characters.', 400); END IF;
    UPDATE app_users SET password_hash = crypt(v_pw, gen_salt('bf', 8)), failed_logins = 0, locked_until = NULL, updated_at = now() WHERE id = u.id;
    UPDATE sessions SET revoked_at = now() WHERE user_id = u.id AND revoked_at IS NULL;
    PERFORM jse_audit(a, 'PASSWORD_RESET', 'user', u.username, u.team_id, NULL, NULL, NULL, NULL);
    RETURN jsonb_build_object('success', true, 'username', u.username, 'password', v_pw);
  ELSIF v_action = 'SET_ACTIVE' THEN
    IF lower(trim(coalesce(p->>'username', ''))) = lower(coalesce(a->>'username', '')) THEN
      PERFORM jse_fail('SELF', 'You cannot disable your own account.', 409);
    END IF;
    UPDATE app_users SET active = coalesce((p->>'active')::boolean, active), updated_at = now()
    WHERE lower(username) = lower(trim(coalesce(p->>'username', ''))) RETURNING * INTO u;
    IF NOT FOUND THEN PERFORM jse_fail('USER_NOT_FOUND', 'User not found.', 404); END IF;
    IF NOT u.active THEN UPDATE sessions SET revoked_at = now() WHERE user_id = u.id AND revoked_at IS NULL; END IF;
    PERFORM jse_audit(a, CASE WHEN u.active THEN 'USER_ENABLED' ELSE 'USER_DISABLED' END, 'user', u.username, u.team_id, NULL, NULL, NULL, NULL);
    RETURN jsonb_build_object('success', true, 'username', u.username, 'active', u.active);
  ELSIF v_action = 'RESET_ROLE_PASSWORDS' THEN
    -- issue fresh passwords for every account of one role (returned once, never stored in clear)
    FOR r IN SELECT id, username FROM app_users WHERE role = upper(coalesce(p->>'role', '')) AND id IS DISTINCT FROM nullif(a->>'id', '')::integer
             ORDER BY username FOR UPDATE LOOP
      v_pw := jse_random_password();
      UPDATE app_users SET password_hash = crypt(v_pw, gen_salt('bf', 8)), failed_logins = 0, locked_until = NULL, updated_at = now() WHERE id = r.id;
      UPDATE sessions SET revoked_at = now() WHERE user_id = r.id AND revoked_at IS NULL;
      v_out := v_out || jsonb_build_object('username', r.username, 'password', v_pw);
    END LOOP;
    PERFORM jse_audit(a, 'PASSWORDS_RESET', 'user', upper(coalesce(p->>'role', '')), NULL, NULL, NULL, NULL, jsonb_build_object('count', jsonb_array_length(v_out)));
    RETURN jsonb_build_object('success', true, 'credentials', v_out);
  END IF;
  PERFORM jse_fail('INVALID_ACTION', 'Unknown user action.', 400);
  RETURN NULL;
END $$;

-- Free-form audit entries for administrative read actions (exports, imports)
CREATE OR REPLACE FUNCTION jse_audit_note(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_action text := upper(coalesce(p->>'action', ''));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  IF v_action NOT IN ('EXPORT_EVENT_EXCEL', 'EXPORT_EVENT_JSON', 'EXPORT_CSV', 'CREDENTIALS_ISSUED') THEN PERFORM jse_fail('INVALID_ACTION', 'Unknown audit note.', 400); END IF;
  PERFORM jse_audit(a, v_action, 'export', NULL, NULL, NULL, NULL, NULL, p - 'action' - 'admin_password');
  RETURN jsonb_build_object('success', true);
END $$;

INSERT INTO schema_migrations(version) VALUES ('003_ops');
`;var Ja=`-- JAIN STOCK EXCHANGE (JSE) v311
-- 004_reads.sql: read models used by the API (CMS INDEX, market board, IPO page, portfolios with assessment and
-- eligibility, order tracking with the canonical six-step flow, Pit Manager queue, trading slips, broker desk,
-- Exchange / Bank queues, ledgers, audit, commissions, Market Intelligence, admin state, certificates).

-- ---------------------------------------------------------------------------
-- CMS INDEX \u2014 one canonical calculation, staged composition: the active listed equities plus every IPO
-- that has officially listed (each IPO once, at its listing price as the component base).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_cms_index() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('name', 'CMS INDEX',
    'value', coalesce(sum(price), 0),
    'base_value', coalesce(sum(coalesce(index_base_price, base_price)), 0),
    'change', coalesce(sum(price), 0) - coalesce(sum(coalesce(index_base_price, base_price)), 0),
    'change_pct', CASE WHEN coalesce(sum(coalesce(index_base_price, base_price)), 0) = 0 THEN 0
                       ELSE round((sum(price) - sum(coalesce(index_base_price, base_price))) * 100 / sum(coalesce(index_base_price, base_price)), 2) END,
    'components', count(*),
    'equity_components', count(*) FILTER (WHERE kind = 'EQUITY'),
    'ipo_components', count(*) FILTER (WHERE kind = 'IPO'),
    'ipos_included', coalesce(jsonb_agg(symbol ORDER BY listed_at) FILTER (WHERE kind = 'IPO'), '[]'::jsonb),
    'methodology', 'Sum of component prices. Components: the listed equities plus each IPO once it lists (base = its listing price).')
  FROM securities WHERE active AND (kind = 'EQUITY' OR listed_at IS NOT NULL)
$$;

-- ---------------------------------------------------------------------------
-- Team metrics: Net Worth = liquid cash + \u03A3(quantity \xD7 current price) (the closing price once the market closes).
-- Assessment: settled listed-stock BUY / SELL trades placed by the team (IPO allotments are not trades).
-- Eligibility: assessment met + loan fully repaid (when required) + closing cash rule (evaluated at close).
-- ---------------------------------------------------------------------------
DROP VIEW IF EXISTS jse_team_metrics;
CREATE VIEW jse_team_metrics AS
WITH cfg AS (SELECT * FROM event_config WHERE id = 1),
     ev  AS (SELECT status FROM event_control WHERE id = 1),
     hv  AS (SELECT h.team_id, sum(h.quantity * s.price) AS holdings_value, sum(h.cost_basis) AS cost_basis,
                    count(*) FILTER (WHERE h.quantity > 0) AS positions
             FROM holdings h JOIN securities s ON s.id = h.security_id GROUP BY h.team_id),
     tr  AS (SELECT team_id, count(*) FILTER (WHERE side = 'BUY') AS buys, count(*) FILTER (WHERE side = 'SELL') AS sells
             FROM settlements WHERE reversed_at IS NULL AND account_type = 'TEAM' GROUP BY team_id),
     base AS (
       SELECT t.id AS team_id, t.code, t.seq, t.name, t.section, t.members, t.active,
              b.id AS broker_id, b.code AS broker, b.name AS broker_name, b.contact AS broker_contact, b.desk AS broker_desk,
              t.cash, coalesce(hv.holdings_value, 0)::numeric(18,2) AS holdings_value, coalesce(hv.cost_basis, 0) AS cost_basis,
              coalesce(hv.positions, 0) AS positions, t.realized_pnl, t.brokerage_paid,
              t.short_sell_attempts, t.cash_shortfall_attempts, t.insufficient_balance_rejections,
              coalesce(tr.buys, 0)::integer AS settled_buys, coalesce(tr.sells, 0)::integer AS settled_sells,
              cfg.min_buy_trades, cfg.min_sell_trades,
              coalesce(l.original_principal, 0) AS loan_original, coalesce(l.principal_outstanding, 0) AS loan_principal,
              coalesce(l.interest_outstanding, 0) AS loan_interest, coalesce(l.interest_charged, 0) AS loan_interest_charged,
              coalesce(l.interest_paid, 0) AS loan_interest_paid, coalesce(l.principal_repaid, 0) AS loan_principal_repaid,
              coalesce(l.status, 'NONE') AS loan_status, cfg.loan_repayment_required,
              greatest(0, least(t.cash, t.realized_pnl)) AS profit_cash_exempt,
              cfg.initial_capital, cfg.cash_rule_limit, ev.status AS event_status
       FROM teams t CROSS JOIN cfg CROSS JOIN ev
       LEFT JOIN brokers b ON b.id = t.broker_id
       LEFT JOIN hv ON hv.team_id = t.id
       LEFT JOIN tr ON tr.team_id = t.id
       LEFT JOIN loans l ON l.team_id = t.id),
     m AS (
       SELECT base.*,
              (cash + holdings_value)::numeric(18,2) AS net_worth,
              (cash + holdings_value - initial_capital)::numeric(18,2) AS pnl,
              round((cash + holdings_value - initial_capital) * 100 / initial_capital, 4) AS return_pct,
              (holdings_value - cost_basis)::numeric(18,2) AS unrealized_pnl,
              (cash - profit_cash_exempt)::numeric(18,2) AS base_cash_counted,
              (cash - profit_cash_exempt) <= cash_rule_limit AS cash_rule_met,
              (settled_buys >= min_buy_trades AND settled_sells >= min_sell_trades) AS assessment_met,
              (loan_principal + loan_interest) = 0 AS loan_repaid,
              (loan_principal + loan_interest)::numeric(18,2) AS loan_liability,
              event_status IN ('CLOSED', 'FINALIZED') AS final_evaluation
       FROM base)
SELECT m.*,
  CASE WHEN final_evaluation THEN CASE WHEN cash_rule_met THEN 'SATISFIED' ELSE 'NOT_SATISFIED' END ELSE 'PROVISIONAL' END AS cash_rule_status,
  (NOT loan_repayment_required OR loan_repaid) AS loan_rule_met,
  (assessment_met AND (NOT loan_repayment_required OR loan_repaid) AND (NOT final_evaluation OR cash_rule_met)) AS eligible,
  array_remove(ARRAY[
    CASE WHEN settled_buys < min_buy_trades THEN 'BUY ' || settled_buys || ' / ' || min_buy_trades END,
    CASE WHEN settled_sells < min_sell_trades THEN 'SELL ' || settled_sells || ' / ' || min_sell_trades END,
    CASE WHEN loan_repayment_required AND NOT loan_repaid THEN 'Loan not fully repaid' END,
    CASE WHEN final_evaluation AND NOT cash_rule_met THEN 'Closing cash above \u20B9' || cash_rule_limit::bigint || ' (base cash rule)' END], NULL) AS eligibility_gaps,
  CASE WHEN assessment_met AND (NOT loan_repayment_required OR loan_repaid) AND (NOT final_evaluation OR cash_rule_met)
       THEN CASE WHEN final_evaluation THEN 'ELIGIBLE' ELSE 'ELIGIBLE \xB7 PROVISIONAL' END
       ELSE CASE WHEN final_evaluation THEN 'NOT ELIGIBLE' ELSE 'NOT YET ELIGIBLE' END END AS eligibility_status,
  CASE WHEN final_evaluation THEN CASE WHEN cash_rule_met THEN 'ELIGIBLE' ELSE 'LOCKED' END ELSE 'PROVISIONAL' END AS portfolio_access
FROM m;

-- The one canonical ranking: overall by Net Worth; Winner and Runner-Up = first and second among eligible teams
-- (ties \u2192 lower team code). Used by portfolios, Market Intelligence, certificates and exports.
DROP FUNCTION IF EXISTS jse_ranked_teams();
CREATE FUNCTION jse_ranked_teams() RETURNS TABLE(m jsonb, rank_overall integer, rank_eligible integer, award text)
LANGUAGE sql STABLE AS $$
  WITH r AS (
    SELECT tm.*,
           row_number() OVER (ORDER BY net_worth DESC, code ASC)::integer AS rk,
           CASE WHEN eligible THEN row_number() OVER (PARTITION BY eligible ORDER BY net_worth DESC, code ASC)::integer END AS rke
    FROM jse_team_metrics tm WHERE tm.active)
  SELECT to_jsonb(r) - 'initial_capital' - 'cash_rule_limit' - 'event_status' - 'rk' - 'rke', rk, rke,
         CASE rke WHEN 1 THEN 'WINNER' WHEN 2 THEN 'RUNNER_UP' END
  FROM r
$$;

-- ---------------------------------------------------------------------------
-- Market (public). Board: the IPO Market (IPOs before listing) and the Listed Market (equities + listed IPOs),
-- the latest real price change first. The server's CMS INDEX is the only index value.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_security_json(s securities) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('id', s.id, 'symbol', s.symbol, 'name', s.name, 'kind', s.kind, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
    'ipo_code', s.ipo_code, 'sector', s.sector,
    'price', s.price, 'previous_price', s.previous_price, 'base_price', s.base_price,
    'change', s.price - s.previous_price, 'change_pct', round(jse_pct(s.price, s.previous_price), 2),
    'day_change_pct', round(jse_pct(s.price, coalesce(s.index_base_price, s.base_price)), 2), 'lot_size', s.lot_size,
    'trade_count', s.trade_count, 'traded_value', s.traded_value, 'last_trade_at', s.last_trade_at, 'updated_at', s.updated_at,
    'last_price_change_at', s.last_price_change_at,
    'stage', CASE WHEN s.kind = 'IPO' THEN jse_ipo_stage(s.id) ELSE 'LISTED' END,
    'listed', s.kind = 'EQUITY' OR s.listed_at IS NOT NULL, 'listed_at', s.listed_at,
    'in_index', s.kind = 'EQUITY' OR s.listed_at IS NOT NULL,
    'tradable', s.active AND (s.kind = 'EQUITY' OR s.listed_at IS NOT NULL))
$$;

CREATE OR REPLACE FUNCTION jse_market() RETURNS jsonb LANGUAGE sql STABLE AS $$
  WITH ev AS (SELECT * FROM event_control WHERE id = 1),
       cfg AS (SELECT * FROM event_config WHERE id = 1),
       s AS (SELECT * FROM securities WHERE active)
  SELECT jsonb_build_object(
    'success', true,
    'status', ev.status, 'status_changed_at', ev.status_changed_at,
    'event_name', cfg.event_name, 'event_start_at', cfg.event_start_at,
    'index', jse_cms_index(),
    'breadth', (SELECT jsonb_build_object('advances', count(*) FILTER (WHERE price > coalesce(index_base_price, base_price)),
                                          'declines', count(*) FILTER (WHERE price < coalesce(index_base_price, base_price)),
                                          'unchanged', count(*) FILTER (WHERE price = coalesce(index_base_price, base_price)))
                FROM s WHERE kind = 'EQUITY' OR listed_at IS NOT NULL),
    'updated_at', ev.market_updated_at,
    'ipo_window', jse_ipo_window(),
    'price_band_pct', cfg.max_price_move_pct, 'price_tick', cfg.price_tick, 'brokerage_rate', cfg.brokerage_rate,
    'board', jsonb_build_object(
      'ipo_market', coalesce((SELECT jsonb_agg(x.symbol ORDER BY x.display_order, x.id) FROM s x WHERE x.kind = 'IPO' AND x.listed_at IS NULL), '[]'::jsonb),
      'listed_market', coalesce((SELECT jsonb_agg(x.symbol ORDER BY x.last_price_change_at DESC NULLS LAST, x.display_order, x.id)
                                 FROM s x WHERE x.kind = 'EQUITY' OR x.listed_at IS NOT NULL), '[]'::jsonb)),
    'ipos', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY x.display_order, x.id) FROM s x WHERE x.kind = 'IPO'), '[]'::jsonb),
    'stocks', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY x.display_order, x.id) FROM s x WHERE x.kind = 'EQUITY'), '[]'::jsonb))
  FROM ev, cfg
$$;

CREATE OR REPLACE FUNCTION jse_event_status() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('success', true, 'status', ev.status, 'status_changed_at', ev.status_changed_at, 'started_at', ev.started_at,
    'index', jse_cms_index(),
    'closed_at', ev.closed_at, 'finalized_at', ev.finalized_at, 'reset_count', ev.reset_count,
    'event_name', cfg.event_name, 'event_start_at', cfg.event_start_at, 'ipo_window', jse_ipo_window(),
    'config', jsonb_build_object('initial_capital', cfg.initial_capital, 'institutional_cash', cfg.institutional_cash,
      'brokerage_rate', cfg.brokerage_rate, 'stock_lot_size', cfg.stock_lot_size, 'ipo_lot_size', cfg.ipo_lot_size, 'price_tick', cfg.price_tick,
      'min_order_value', cfg.min_order_value, 'max_order_value', cfg.max_order_value, 'max_price_move_pct', cfg.max_price_move_pct,
      'loan_max_principal', cfg.loan_max_principal, 'loan_interest_rate', cfg.loan_interest_rate,
      'cash_rule_limit', cfg.cash_rule_limit, 'loans_enabled', cfg.loans_enabled, 'auto_loan_on_settlement', cfg.auto_loan_on_settlement,
      'loan_repayment_required', cfg.loan_repayment_required, 'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades,
      'event_start_at', cfg.event_start_at, 'ipo_application_hours', cfg.ipo_application_hours, 'auto_list_ipos', cfg.auto_list_ipos,
      'institution_overdraft', cfg.institution_overdraft, 'institution_brokerage', cfg.institution_brokerage,
      'max_total_capital', cfg.initial_capital + cfg.loan_max_principal),
    'counts', (SELECT jsonb_build_object(
      'teams', (SELECT count(*) FROM teams WHERE active), 'stocks', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active),
      'ipos', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active), 'brokers', (SELECT count(*) FROM brokers WHERE active),
      'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
      'exchange_pending', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
      'bank_pending', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING')),
      'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
      'rejected', count(*) FILTER (WHERE status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED')),
      'orders', count(*)) FROM orders))
  FROM event_control ev, event_config cfg WHERE ev.id = 1 AND cfg.id = 1
$$;

-- ---------------------------------------------------------------------------
-- IPO page (public, canonical prospectus source) and the participant's own application / allotment
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_ipo_page() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('success', true, 'event_name', cfg.event_name, 'event_start_at', cfg.event_start_at, 'window', jse_ipo_window(),
    'status', (SELECT status FROM event_control WHERE id = 1),
    'ipos', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'symbol', s.symbol, 'ipo_code', s.ipo_code, 'name', s.name, 'sector', s.sector,
        'issue_price', s.base_price, 'lot_size', s.lot_size, 'lot_value', s.lot_size * s.base_price,
        'stage', jse_ipo_stage(s.id), 'listed', s.listed_at IS NOT NULL, 'listed_at', s.listed_at,
        'listing_price', CASE WHEN s.listed_at IS NOT NULL THEN s.index_base_price END, 'price', s.price, 'in_index', s.listed_at IS NOT NULL,
        'prospectus', jsonb_build_object(
          'company_description', pr.company_description, 'issue_details', pr.issue_details, 'business_overview', pr.business_overview,
          'financial_information', pr.financial_information, 'risk_factors', pr.risk_factors, 'use_of_proceeds', pr.use_of_proceeds,
          'promoters_management', pr.promoters_management, 'other_information', pr.other_information,
          'document_url', pr.document_url, 'document_name', pr.document_name, 'document_size', pr.document_size,
          'document_uploaded_at', pr.document_uploaded_at, 'has_document', pr.document_data IS NOT NULL, 'updated_at', pr.updated_at)
      ) ORDER BY s.display_order, s.id)
      FROM securities s LEFT JOIN ipo_prospectus pr ON pr.security_id = s.id WHERE s.kind = 'IPO' AND s.active), '[]'::jsonb))
  FROM event_config cfg WHERE cfg.id = 1
$$;

CREATE OR REPLACE FUNCTION jse_ipo_mine(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_team integer;
BEGIN
  PERFORM jse_require_role(a, 'PARTICIPANT', 'ADMIN', 'VIEWER', 'BROKER');
  v_team := CASE WHEN a->>'role' = 'PARTICIPANT' THEN nullif(a->>'team_id', '')::integer
                 ELSE (SELECT id FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')))) END;
  IF v_team IS NULL THEN RETURN jsonb_build_object('success', true, 'team', NULL, 'items', '[]'::jsonb); END IF;
  IF a->>'role' = 'BROKER' AND (SELECT broker_id FROM teams WHERE id = v_team) IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN
    PERFORM jse_fail('FORBIDDEN', 'Not one of your teams.', 403);
  END IF;
  RETURN jsonb_build_object('success', true, 'team', (SELECT code FROM teams WHERE id = v_team), 'cash', (SELECT cash FROM teams WHERE id = v_team),
    'items', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol,
        'application', (SELECT jsonb_build_object('lots', ap.lots, 'shares', ap.quantity, 'amount', ap.amount, 'status', ap.status, 'updated_at', ap.updated_at)
                        FROM ipo_applications ap WHERE ap.team_id = v_team AND ap.security_id = s.id),
        'allotment', (SELECT jsonb_build_object('lots', al.lots, 'shares', al.quantity, 'amount', al.amount, 'at', al.created_at)
                      FROM ipo_allotments al WHERE al.team_id = v_team AND al.security_id = s.id AND al.reversed_at IS NULL)) ORDER BY s.display_order)
      FROM securities s WHERE s.kind = 'IPO' AND s.active), '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION jse_ipo_applications(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jsonb_build_object('success', true, 'window', jse_ipo_window(),
    'summary', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'name', s.name, 'stage', jse_ipo_stage(s.id),
        'teams', (SELECT count(*) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),
        'lots', (SELECT coalesce(sum(lots), 0) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),
        'amount', (SELECT coalesce(sum(amount), 0) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),
        'allotted_teams', (SELECT count(*) FROM ipo_allotments al WHERE al.security_id = s.id AND al.reversed_at IS NULL),
        'allotted_lots', (SELECT coalesce(sum(lots), 0) FROM ipo_allotments al WHERE al.security_id = s.id AND al.reversed_at IS NULL)) ORDER BY s.display_order)
      FROM securities s WHERE s.kind = 'IPO' AND s.active), '[]'::jsonb),
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('team', t.code, 'team_name', t.name, 'ipo', s.symbol, 'lots', ap.lots, 'shares', ap.quantity,
        'amount', ap.amount, 'status', ap.status, 'updated_at', ap.updated_at) ORDER BY t.seq, s.display_order)
      FROM ipo_applications ap JOIN teams t ON t.id = ap.team_id JOIN securities s ON s.id = ap.security_id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Participant portfolios (all teams) and detail
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_portfolios(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_rows jsonb; v_status text; cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  SELECT jsonb_agg(m || jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award) ORDER BY (m->>'seq')::integer)
  INTO v_rows FROM jse_ranked_teams();
  RETURN jsonb_build_object('success', true, 'event_status', v_status, 'final', v_status IN ('CLOSED', 'FINALIZED'),
    'criterion', 'Net Worth = liquid cash + holdings \xD7 closing price (loans are not deducted). Winner = highest eligible Net Worth; Runner-Up = second highest. Ties go to the lower team code.',
    'eligibility_rule', 'Eligible = at least ' || cfg.min_buy_trades || ' settled BUY and ' || cfg.min_sell_trades || ' settled SELL listed-stock trades (IPO allotments do not count)' ||
                        CASE WHEN cfg.loan_repayment_required THEN ' + loan fully repaid' ELSE '' END || ' + closing cash rule (base cash \u2264 \u20B9' || cfg.cash_rule_limit::bigint || ', evaluated at close).',
    'initial_capital', cfg.initial_capital, 'cash_rule_limit', cfg.cash_rule_limit, 'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades,
    'loan_repayment_required', cfg.loan_repayment_required,
    'stats', (SELECT jsonb_build_object('teams', count(*), 'total_net_worth', sum(net_worth), 'average_net_worth', round(avg(net_worth), 2),
              'highest_net_worth', max(net_worth), 'lowest_net_worth', min(net_worth), 'total_cash', sum(cash), 'total_holdings', sum(holdings_value),
              'eligible', count(*) FILTER (WHERE eligible), 'assessment_met', count(*) FILTER (WHERE assessment_met),
              'loans_unpaid', count(*) FILTER (WHERE NOT loan_repaid),
              'cash_rule_met', count(*) FILTER (WHERE cash_rule_met), 'cash_rule_not_met', count(*) FILTER (WHERE NOT cash_rule_met),
              'profitable', count(*) FILTER (WHERE pnl > 0), 'short_sell_attempts', sum(short_sell_attempts),
              'cash_shortfall_attempts', sum(cash_shortfall_attempts), 'insufficient_balance_rejections', sum(insufficient_balance_rejections),
              'total_brokerage', sum(brokerage_paid), 'loans_outstanding', sum(loan_principal + loan_interest))
              FROM jse_team_metrics WHERE active),
    'winner', (SELECT m || jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award) FROM jse_ranked_teams() WHERE award = 'WINNER'),
    'runner_up', (SELECT m || jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award) FROM jse_ranked_teams() WHERE award = 'RUNNER_UP'),
    'teams', coalesce(v_rows, '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION jse_portfolio_detail(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE t teams%ROWTYPE; v_m jsonb; cfg event_config%ROWTYPE; b brokers%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER', 'BROKER', 'PARTICIPANT');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO t FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')));
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Team not found.', 404); END IF;
  IF a->>'role' = 'PARTICIPANT' AND (a->>'team_id')::integer IS DISTINCT FROM t.id THEN
    PERFORM jse_fail('FORBIDDEN', 'You can view only your own team.', 403);
  END IF;
  IF a->>'role' = 'BROKER' AND t.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN
    PERFORM jse_fail('FORBIDDEN', 'You can view only the teams assigned to you.', 403);
  END IF;
  SELECT * INTO b FROM brokers WHERE id = t.broker_id;
  SELECT m || jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award) INTO v_m
  FROM jse_ranked_teams() WHERE (m->>'team_id')::integer = t.id;
  RETURN jsonb_build_object('success', true, 'team', v_m,
    'identity', jsonb_build_object('code', t.code, 'name', t.name, 'section', t.section, 'members', t.members,
      'name_meaning', (SELECT meaning FROM team_name_pool WHERE lower(name) = lower(t.name)),
      'name_category', (SELECT category FROM team_name_pool WHERE lower(name) = lower(t.name))),
    'broker', CASE WHEN b.id IS NULL THEN NULL ELSE jsonb_build_object('code', b.code, 'name', b.name, 'contact', b.contact, 'desk', b.desk) END,
    'rules', jsonb_build_object('starting_capital', cfg.initial_capital, 'cash_limit', cfg.cash_rule_limit, 'loan_limit', cfg.loan_max_principal,
      'loan_rate', cfg.loan_interest_rate, 'brokerage_rate', cfg.brokerage_rate, 'max_order_value', cfg.max_order_value, 'min_order_value', cfg.min_order_value,
      'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades, 'loan_repayment_required', cfg.loan_repayment_required),
    'assessment', jsonb_build_object('buy', (v_m->>'settled_buys')::integer, 'sell', (v_m->>'settled_sells')::integer,
      'min_buy', cfg.min_buy_trades, 'min_sell', cfg.min_sell_trades, 'met', (v_m->>'assessment_met')::boolean,
      'basis', 'Settled listed-stock trades placed for your team. IPO allotments, rejected and unsettled orders do not count.'),
    'eligibility', jsonb_build_object('eligible', (v_m->>'eligible')::boolean, 'status', v_m->>'eligibility_status', 'gaps', v_m->'eligibility_gaps',
      'final', (v_m->>'final_evaluation')::boolean),
    'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'security', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'quantity', h.quantity, 'avg_price', round(h.trade_cost / nullif(h.quantity, 0), 2), 'cost_basis', round(h.cost_basis, 2),
        'current_price', s.price, 'market_value', h.quantity * s.price, 'unrealized_pnl', round(h.quantity * s.price - h.cost_basis, 2),
        'change_pct', round(jse_pct(s.price, s.previous_price), 2), 'listed', s.kind = 'EQUITY' OR s.listed_at IS NOT NULL) ORDER BY h.quantity * s.price DESC)
      FROM holdings h JOIN securities s ON s.id = h.security_id WHERE h.team_id = t.id AND h.quantity > 0), '[]'::jsonb),
    'sold', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol, 'security', s.name,
        'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, 'quantity', st.quantity, 'sell_price', st.price,
        'trade_value', st.trade_value, 'brokerage', st.brokerage, 'net_proceeds', st.trade_value - st.brokerage,
        'realized_pnl', st.realized_pnl, 'counterparty', CASE WHEN st.account_type = 'INSTITUTION' THEN 'Institution' ELSE 'Market' END,
        'settled_at', st.settled_at) ORDER BY st.settled_at DESC)
      FROM settlements st JOIN orders o ON o.id = st.order_id JOIN securities s ON s.id = st.security_id
      WHERE st.team_id = t.id AND st.reversed_at IS NULL
        AND ((st.account_type = 'TEAM' AND st.side = 'SELL') OR (st.account_type = 'INSTITUTION' AND st.side = 'BUY'))), '[]'::jsonb),
    'bought', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'quantity', st.quantity, 'price', st.price, 'trade_value', st.trade_value, 'brokerage', st.brokerage, 'loan_drawn', st.loan_drawn,
        'settled_at', st.settled_at) ORDER BY st.settled_at DESC)
      FROM settlements st JOIN orders o ON o.id = st.order_id JOIN securities s ON s.id = st.security_id
      WHERE st.team_id = t.id AND st.reversed_at IS NULL
        AND ((st.account_type = 'TEAM' AND st.side = 'BUY') OR (st.account_type = 'INSTITUTION' AND st.side = 'SELL'))), '[]'::jsonb),
    'ipo_allotments', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'name', s.name, 'lots', al.lots, 'quantity', al.quantity, 'price', al.price, 'amount', al.amount))
      FROM ipo_allotments al JOIN securities s ON s.id = al.security_id WHERE al.team_id = t.id AND al.reversed_at IS NULL), '[]'::jsonb),
    'ipo_applications', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'lots', ap.lots, 'amount', ap.amount, 'status', ap.status))
      FROM ipo_applications ap JOIN securities s ON s.id = ap.security_id WHERE ap.team_id = t.id), '[]'::jsonb),
    'loan', (SELECT jsonb_build_object('original_principal', l.original_principal, 'current_principal', l.principal_outstanding,
        'interest', l.interest_outstanding, 'interest_charged', l.interest_charged, 'interest_paid', l.interest_paid,
        'principal_repaid', l.principal_repaid, 'total_liability', l.principal_outstanding + l.interest_outstanding,
        'remaining_limit', greatest(0, cfg.loan_max_principal - l.original_principal), 'draws', l.draws,
        'repaid', l.principal_outstanding + l.interest_outstanding = 0,
        'repayment_status', CASE l.status WHEN 'NONE' THEN 'NO LOAN' WHEN 'REPAID' THEN 'REPAID' ELSE 'OUTSTANDING' END)
      FROM loans l WHERE l.team_id = t.id),
    'loan_transactions', coalesce((SELECT jsonb_agg(jsonb_build_object('kind', lt.kind, 'amount', lt.amount, 'automatic', lt.automatic,
        'order_no', o.order_no, 'note', lt.note, 'created_at', lt.created_at) ORDER BY lt.id DESC)
      FROM loan_transactions lt LEFT JOIN orders o ON o.id = lt.order_id WHERE lt.team_id = t.id), '[]'::jsonb),
    'short_sell_history', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol, 'security', s.name,
        'quantity', r.quantity, 'holding_before', r.holding_before, 'stage', r.stage, 'status', o.status, 'created_at', r.created_at) ORDER BY r.created_at DESC)
      FROM risk_events r LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN securities s ON s.id = r.security_id
      WHERE r.team_id = t.id AND r.kind = 'SHORT_SELL_ATTEMPT'), '[]'::jsonb),
    'cash_shortfall_history', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol, 'security', s.name,
        'required_cash', r.required_amount, 'available_cash', r.available_cash, 'shortage', r.shortage, 'status', o.status, 'created_at', r.created_at) ORDER BY r.created_at DESC)
      FROM risk_events r LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN securities s ON s.id = r.security_id
      WHERE r.team_id = t.id AND r.kind = 'CASH_SHORTFALL_ATTEMPT'), '[]'::jsonb),
    'insufficient_balance_history', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol,
        'required_cash', r.required_amount, 'available_cash', r.available_cash, 'shortage', r.shortage, 'note', r.note, 'status', o.status, 'created_at', r.created_at) ORDER BY r.created_at DESC)
      FROM risk_events r LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN securities s ON s.id = r.security_id
      WHERE r.team_id = t.id AND r.kind = 'INSUFFICIENT_BALANCE_REJECTION'), '[]'::jsonb),
    'recent_orders', coalesce((SELECT jsonb_agg(x ORDER BY (x->>'id')::bigint DESC) FROM (
        SELECT jse_order_json(o.id) AS x FROM orders o WHERE o.team_id = t.id ORDER BY o.id DESC LIMIT 25) q), '[]'::jsonb),
    'slips', coalesce((SELECT jsonb_agg(jsonb_build_object('slip_no', sl.slip_no, 'order_no', o.order_no, 'issued_at', sl.issued_at, 'symbol', s.symbol,
        'side', o.side, 'quantity', o.quantity, 'price', o.executed_price, 'status', o.status) ORDER BY sl.id DESC)
      FROM (SELECT * FROM trading_slips WHERE order_id IN (SELECT id FROM orders WHERE team_id = t.id) ORDER BY id DESC LIMIT 25) sl
      JOIN orders o ON o.id = sl.order_id JOIN securities s ON s.id = o.security_id), '[]'::jsonb),
    'recent_ledger', coalesce((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'type', c.entry_type, 'debit', c.debit, 'credit', c.credit,
        'balance_after', c.balance_after, 'note', c.note, 'order_no', o.order_no, 'created_at', c.created_at) ORDER BY c.id DESC)
      FROM (SELECT * FROM cash_ledger WHERE team_id = t.id ORDER BY id DESC LIMIT 30) c LEFT JOIN orders o ON o.id = c.order_id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Order tracking: the single source of truth for transaction progress
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_tracking(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_team integer; v_broker integer; v_inst integer;
  v_status text := nullif(upper(trim(coalesce(p->>'status', ''))), '');
  v_side text := nullif(upper(trim(coalesce(p->>'side', ''))), '');
  v_kind text := nullif(upper(trim(coalesce(p->>'kind', ''))), '');
  v_acct text := nullif(upper(trim(coalesce(p->>'account', ''))), '');
  v_q text := nullif(trim(coalesce(p->>'q', '')), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(200, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 50)));
  v_res jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'PIT_MANAGER', 'INSTITUTIONAL', 'VIEWER', 'PARTICIPANT');
  IF a->>'role' = 'PARTICIPANT' THEN
    v_team := (a->>'team_id')::integer;
  ELSIF coalesce(p->>'team', '') <> '' THEN
    SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team'));
    IF v_team IS NULL THEN v_team := -1; END IF;
  END IF;
  IF a->>'role' = 'BROKER' THEN v_broker := coalesce(nullif(a->>'broker_id', '')::integer, -1); END IF;
  IF a->>'role' = 'INSTITUTIONAL' THEN v_inst := coalesce(nullif(a->>'institution_id', '')::integer, -1); END IF;
  IF v_status = 'OPEN' THEN v_status := 'PENDING'; END IF;

  WITH f AS (
    SELECT o.*, s.symbol, s.name AS security_name, s.kind, t.code AS team_code, t.name AS team_name, b.code AS broker_code, b.name AS broker_name,
           i.code AS institution_code, sl.slip_no, ins.instruction_no
    FROM orders o JOIN securities s ON s.id = o.security_id JOIN teams t ON t.id = o.team_id
    LEFT JOIN brokers b ON b.id = o.broker_id LEFT JOIN institutions i ON i.id = o.institution_id
    LEFT JOIN trading_slips sl ON sl.order_id = o.id LEFT JOIN instructions ins ON ins.id = o.instruction_id
    WHERE (v_team IS NULL OR o.team_id = v_team)
      AND (v_broker IS NULL OR o.broker_id = v_broker)
      AND (v_inst IS NULL OR o.institution_id = v_inst)
      AND (v_status IS NULL OR o.status = v_status
           OR (v_status = 'REJECTED' AND o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED'))
           OR (v_status = 'PENDING' AND o.status IN ('PIT_PENDING', 'EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING'))
           OR (v_status = 'STALE' AND o.reject_code = 'PRICE_STALE')
           OR (v_status = 'EXECUTED' AND o.executed_at IS NOT NULL))
      AND (v_side IS NULL OR o.side = v_side)
      AND (v_kind IS NULL OR s.kind = v_kind OR (v_kind = 'STOCK' AND s.kind = 'EQUITY'))
      AND (v_acct IS NULL OR o.account_type = v_acct)
      AND (v_q IS NULL OR o.order_no ILIKE '%' || v_q || '%' OR t.code ILIKE '%' || v_q || '%' OR t.name ILIKE '%' || v_q || '%'
           OR s.symbol ILIKE '%' || v_q || '%' OR s.name ILIKE '%' || v_q || '%' OR coalesce(b.code, '') ILIKE '%' || v_q || '%'
           OR coalesce(sl.slip_no, '') ILIKE '%' || v_q || '%' OR coalesce(ins.instruction_no, '') ILIKE '%' || v_q || '%'))
  SELECT jsonb_build_object('success', true,
    'kpis', (SELECT jsonb_build_object('orders', count(*),
        'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
        'pit_rejected', count(*) FILTER (WHERE status = 'PIT_REJECTED' AND coalesce(reject_code, '') <> 'PRICE_STALE'),
        'stale', count(*) FILTER (WHERE reject_code = 'PRICE_STALE'),
        'executed', count(*) FILTER (WHERE executed_at IS NOT NULL),
        'exchange_pending', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
        'exchange_approved', count(*) FILTER (WHERE status = 'EXCHANGE_APPROVED'),
        'bank_pending', count(*) FILTER (WHERE status = 'BANK_PENDING'),
        'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
        'exchange_rejected', count(*) FILTER (WHERE status = 'EXCHANGE_REJECTED'),
        'bank_rejected', count(*) FILTER (WHERE status = 'BANK_REJECTED'),
        'buy', count(*) FILTER (WHERE side = 'BUY'), 'sell', count(*) FILTER (WHERE side = 'SELL'),
        'trade_value', coalesce(sum(trade_value), 0), 'settled_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'short_sell_flags', count(*) FILTER (WHERE short_sell_flag), 'cash_shortfall_flags', count(*) FILTER (WHERE cash_shortfall_flag)) FROM f),
    'page', v_page, 'page_size', v_size,
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('id', x.id, 'order_no', x.order_no, 'account_type', x.account_type, 'team', x.team_code,
        'team_name', x.team_name, 'broker', x.broker_code, 'broker_name', x.broker_name, 'institution', x.institution_code, 'symbol', x.symbol,
        'security', x.security_name, 'kind', x.kind, 'side', x.side, 'quantity', x.quantity, 'price', x.price, 'trade_value', x.trade_value,
        'brokerage', x.brokerage, 'brokerage_rate', x.brokerage_rate, 'settlement_amount', x.settlement_amount, 'status', x.status,
        'stage', jse_stage_label(x.status, x.reject_code), 'reject_code', x.reject_code, 'reject_reason', x.reject_reason,
        'short_sell_flag', x.short_sell_flag, 'cash_shortfall_flag', x.cash_shortfall_flag, 'created_by', x.created_by_name,
        'created_at', x.created_at, 'instruction_no', x.instruction_no, 'executed_at', x.executed_at, 'executed_by', x.executed_by_name,
        'slip_no', x.slip_no, 'pit_at', x.pit_at, 'exchange_by', x.exchange_by_name, 'exchange_at', x.exchange_at, 'bank_by', x.bank_by_name,
        'bank_at', x.bank_at, 'updated_at', x.updated_at) ORDER BY x.updated_at DESC, x.id DESC)
      FROM (SELECT * FROM f ORDER BY f.updated_at DESC, f.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) x), '[]'::jsonb))
  INTO v_res;
  RETURN v_res;
END $$;

-- The canonical six-step processing flow of one order (every timestamp, actor and outcome)
CREATE OR REPLACE FUNCTION jse_order_flow(p_id bigint) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_array(
    jsonb_build_object('step', 'INSTRUCTION', 'label', 'Participant Instruction',
      'state', CASE WHEN o.account_type = 'INSTITUTION' THEN 'NA' WHEN ins.id IS NOT NULL THEN 'DONE' ELSE 'IN_PERSON' END,
      'at', ins.created_at, 'by', CASE WHEN ins.id IS NOT NULL THEN t.name || ' (' || t.code || ')' END,
      'detail', CASE WHEN o.account_type = 'INSTITUTION' THEN 'Institutional desk order (counterparty ' || t.code || ')'
                     WHEN ins.id IS NOT NULL THEN ins.instruction_no || ': ' || ins.side || ' ' || ins.quantity || ' ' || s.symbol ||
                          coalesce(' \xB7 market price seen \u20B9' || ins.price_seen, '') || coalesce(' \xB7 note: ' || ins.note, '')
                     ELSE 'Instruction given to the broker in person at the desk' END),
    jsonb_build_object('step', 'BROKER_SUBMISSION', 'label', CASE WHEN o.account_type = 'INSTITUTION' THEN 'Institutional Submission' ELSE 'Broker Submission' END,
      'state', 'DONE', 'at', o.created_at, 'by', o.created_by_name || coalesce(' \xB7 ' || b.name || ' (' || b.code || ')', ''),
      'detail', o.side || ' ' || o.quantity || ' ' || s.symbol || ' at the market price \u20B9' || o.price || ' \xB7 trade value \u20B9' || o.trade_value ||
                ' \xB7 brokerage ' || jse_rate_text(coalesce(o.brokerage_rate, CASE WHEN o.trade_value > 0 THEN o.brokerage / o.trade_value END)) || ' = \u20B9' || o.brokerage),
    jsonb_build_object('step', 'PIT_EXECUTION', 'label', 'Pit Manager Execution',
      'state', CASE WHEN o.executed_at IS NOT NULL THEN 'DONE' WHEN o.status = 'PIT_PENDING' THEN 'CURRENT' WHEN o.status = 'PIT_REJECTED' THEN 'REJECTED' ELSE 'NA' END,
      'at', coalesce(o.executed_at, o.pit_at), 'by', coalesce(o.executed_by_name, o.pit_by_name),
      'detail', CASE WHEN o.executed_at IS NOT NULL THEN 'Executed ' || o.executed_quantity || ' @ \u20B9' || o.executed_price || ' \xB7 trading slip ' || coalesce(sl.slip_no, '\u2014')
                     WHEN o.status = 'PIT_PENDING' THEN 'Waiting for the Pit Manager to execute'
                     WHEN o.status = 'PIT_REJECTED' THEN coalesce(o.reject_reason, 'Rejected by the Pit Manager')
                     ELSE 'Recorded before the Pit Manager stage existed' END),
    jsonb_build_object('step', 'EXCHANGE_REVIEW', 'label', 'Exchange Review',
      'state', CASE WHEN o.status = 'EXCHANGE_REJECTED' THEN 'REJECTED' WHEN o.status = 'EXCHANGE_PENDING' THEN 'CURRENT'
                    WHEN o.exchange_at IS NOT NULL THEN 'DONE' WHEN o.status IN ('PIT_REJECTED') THEN 'SKIPPED' ELSE 'WAITING' END,
      'at', o.exchange_at, 'by', o.exchange_by_name,
      'detail', CASE WHEN o.status = 'EXCHANGE_REJECTED' THEN coalesce(o.reject_reason, 'Rejected by the Exchange')
                     WHEN o.status = 'EXCHANGE_PENDING' THEN 'Executed; waiting for Exchange review'
                     WHEN o.exchange_at IS NOT NULL THEN 'Approved' || CASE WHEN o.short_sell_approved THEN ' (short-selling warning forwarded to the Bank)' ELSE '' END
                     ELSE NULL END),
    jsonb_build_object('step', 'BANK_SETTLEMENT', 'label', 'Bank Settlement',
      'state', CASE WHEN o.status = 'BANK_SETTLED' THEN 'DONE' WHEN o.status = 'BANK_REJECTED' THEN 'REJECTED'
                    WHEN o.status IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN 'CURRENT'
                    WHEN o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED') THEN 'SKIPPED' ELSE 'WAITING' END,
      'at', o.bank_at, 'by', coalesce(o.bank_by_name, o.bank_claimed_name),
      'detail', CASE WHEN o.status = 'BANK_SETTLED' THEN 'Settled \u20B9' || o.settlement_amount || CASE WHEN o.side = 'BUY' AND o.account_type = 'TEAM' THEN ' (trade value + brokerage)'
                                                                                              WHEN o.account_type = 'TEAM' THEN ' (trade value \u2212 brokerage)' ELSE '' END ||
                                                     CASE WHEN st.loan_drawn > 0 THEN ' \xB7 automatic loan \u20B9' || st.loan_drawn || ' (interest \u20B9' || st.loan_interest || ')' ELSE '' END
                     WHEN o.status = 'BANK_REJECTED' THEN coalesce(o.reject_reason, 'Rejected by the Bank')
                     WHEN o.status = 'BANK_PENDING' THEN 'Being verified by ' || coalesce(o.bank_claimed_name, 'the Bank')
                     WHEN o.status = 'EXCHANGE_APPROVED' THEN 'Waiting for the Bank' ELSE NULL END),
    jsonb_build_object('step', 'UPDATES', 'label', 'Market / Cash / Holdings Updated',
      'state', CASE WHEN o.status = 'BANK_SETTLED' THEN 'DONE' WHEN o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED') THEN 'SKIPPED' ELSE 'WAITING' END,
      'at', st.settled_at, 'by', st.settled_by_name,
      'detail', CASE WHEN st.id IS NOT NULL THEN t.code || ' cash \u20B9' || st.team_cash_before || ' \u2192 \u20B9' || st.team_cash_after || ' \xB7 ' || s.symbol || ' holding ' ||
                     st.holding_before || ' \u2192 ' || st.holding_after || ' \xB7 market price unchanged (\u20B9' || st.price_before || '; prices move only on Market News)'
                     WHEN o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED') THEN 'No cash or holding change (order rejected)' ELSE NULL END))
  FROM orders o JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
  LEFT JOIN brokers b ON b.id = o.broker_id
  LEFT JOIN instructions ins ON ins.id = o.instruction_id
  LEFT JOIN trading_slips sl ON sl.order_id = o.id
  LEFT JOIN settlements st ON st.order_id = o.id AND st.reversed_at IS NULL
  WHERE o.id = p_id
$$;

CREATE OR REPLACE FUNCTION jse_order_detail(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE o orders%ROWTYPE; s securities%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'PIT_MANAGER', 'INSTITUTIONAL', 'VIEWER', 'PARTICIPANT');
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint OR order_no = upper(trim(coalesce(p->>'order_no', '')))
     OR id = (SELECT order_id FROM trading_slips WHERE slip_no = upper(trim(coalesce(p->>'slip_no', ''))));
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF a->>'role' = 'PARTICIPANT' AND (a->>'team_id')::integer IS DISTINCT FROM o.team_id THEN PERFORM jse_fail('FORBIDDEN', 'Not your order.', 403); END IF;
  IF a->>'role' = 'BROKER' AND o.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN PERFORM jse_fail('FORBIDDEN', 'Not one of your teams'' orders.', 403); END IF;
  IF a->>'role' = 'INSTITUTIONAL' AND o.institution_id IS DISTINCT FROM nullif(a->>'institution_id', '')::integer THEN PERFORM jse_fail('FORBIDDEN', 'Not your institution''s order.', 403); END IF;
  SELECT * INTO s FROM securities WHERE id = o.security_id;
  RETURN jsonb_build_object('success', true, 'order', jse_order_json(o.id), 'flow', jse_order_flow(o.id),
    'assessment', jsonb_build_object('counts', o.account_type = 'TEAM' AND o.status = 'BANK_SETTLED',
      'explanation', CASE WHEN o.account_type <> 'TEAM' THEN 'Institutional order: does not count toward a team''s assessment.'
                          WHEN o.status = 'BANK_SETTLED' THEN 'Counts as 1 settled ' || o.side || ' trade toward the assessment.'
                          WHEN o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED') THEN 'Rejected orders do not count toward the assessment.'
                          ELSE 'Counts toward the assessment only once the Bank settles it.' END),
    'events', coalesce((SELECT jsonb_agg(jsonb_build_object('event', e.event, 'from', e.from_status, 'to', e.to_status, 'actor', e.actor_name,
        'role', e.actor_role, 'note', e.note, 'data', e.data, 'at', e.created_at) ORDER BY e.id) FROM order_events e WHERE e.order_id = o.id), '[]'::jsonb),
    'settlement', (SELECT to_jsonb(st) FROM settlements st WHERE st.order_id = o.id AND st.reversed_at IS NULL),
    'risk', coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.id) FROM risk_events r WHERE r.order_id = o.id), '[]'::jsonb),
    'audit', coalesce((SELECT jsonb_agg(jsonb_build_object('action', al.action, 'actor', al.actor_username, 'role', al.actor_role,
        'details', al.details, 'at', al.created_at) ORDER BY al.id) FROM audit_log al WHERE al.order_id = o.id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Pit Manager queue: one queue of broker-submitted orders awaiting execution
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_pit_queue(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'PIT_MANAGER', 'VIEWER');
  RETURN jsonb_build_object('success', true,
    'pending', coalesce((SELECT jsonb_agg(q.j ORDER BY q.id) FROM (
      SELECT o.id, jse_order_json(o.id) || jsonb_build_object(
        'stale', o.price <> s.price, 'age_seconds', extract(epoch FROM now() - o.created_at)::integer,
        'holding', CASE WHEN o.account_type = 'TEAM' THEN av.holding END, 'available_qty', CASE WHEN o.account_type = 'TEAM' THEN av.available END,
        'short_sell_risk', (o.account_type = 'TEAM' AND o.side = 'SELL' AND o.quantity > av.available)) AS j
      FROM orders o JOIN securities s ON s.id = o.security_id
      CROSS JOIN LATERAL jse_available_qty(o.team_id, o.security_id, o.id) av
      WHERE o.status = 'PIT_PENDING' ORDER BY o.id LIMIT 300) q), '[]'::jsonb),
    'recent', coalesce((SELECT jsonb_agg(jse_order_json(x.id) ORDER BY x.pit_at DESC, x.id DESC) FROM (
      SELECT id, pit_at FROM orders WHERE pit_at IS NOT NULL ORDER BY pit_at DESC, id DESC LIMIT 30) x), '[]'::jsonb),
    'counts', (SELECT jsonb_build_object('pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
       'executed', count(*) FILTER (WHERE executed_at IS NOT NULL),
       'rejected', count(*) FILTER (WHERE status = 'PIT_REJECTED' AND coalesce(reject_code, '') NOT IN ('PRICE_STALE', 'MARKET_CLOSED')),
       'stale', count(*) FILTER (WHERE reject_code = 'PRICE_STALE')) FROM orders));
END $$;

-- ---------------------------------------------------------------------------
-- Trading slips (one per executed order; proves the executed order record)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_slip_json(p_slip trading_slips) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('slip_no', p_slip.slip_no, 'order_no', o.order_no, 'order_id', o.id, 'issued_at', p_slip.issued_at,
    'account_type', o.account_type, 'team', t.code, 'team_name', t.name, 'broker', b.code, 'broker_name', b.name, 'institution', i.code, 'institution_name', i.name,
    'symbol', s.symbol, 'security', s.name, 'asset_type', CASE WHEN s.kind = 'IPO' THEN 'IPO (listed)' ELSE 'Equity' END,
    'side', o.side, 'quantity', o.executed_quantity, 'price', o.executed_price, 'trade_value', o.trade_value,
    'brokerage_rate', coalesce(o.brokerage_rate, CASE WHEN o.trade_value > 0 THEN round(o.brokerage / o.trade_value, 6) END), 'brokerage', o.brokerage,
    'settlement_value', o.settlement_amount, 'executed_at', o.executed_at, 'executed_by', o.executed_by_name,
    'submitted_at', o.created_at, 'submitted_by', o.created_by_name, 'instruction_no', ins.instruction_no,
    'status', o.status, 'stage', jse_stage_label(o.status, o.reject_code),
    'exchange_status', CASE WHEN o.status = 'EXCHANGE_PENDING' THEN 'PENDING' WHEN o.status = 'EXCHANGE_REJECTED' THEN 'REJECTED'
                            WHEN o.exchange_at IS NOT NULL THEN 'APPROVED' ELSE 'PENDING' END,
    'exchange_at', o.exchange_at, 'exchange_by', o.exchange_by_name,
    'bank_status', CASE WHEN o.status = 'BANK_SETTLED' THEN 'SETTLED' WHEN o.status = 'BANK_REJECTED' THEN 'REJECTED'
                        WHEN o.status IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN 'PENDING' WHEN o.status = 'EXCHANGE_REJECTED' THEN 'NOT APPLICABLE' ELSE 'WAITING' END,
    'bank_at', o.bank_at, 'bank_by', o.bank_by_name, 'reject_reason', o.reject_reason)
  FROM orders o JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
  LEFT JOIN brokers b ON b.id = o.broker_id LEFT JOIN institutions i ON i.id = o.institution_id
  LEFT JOIN instructions ins ON ins.id = o.instruction_id
  WHERE o.id = p_slip.order_id
$$;

CREATE OR REPLACE FUNCTION jse_slips(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_team integer; v_broker integer; v_inst integer; v_q text := nullif(trim(coalesce(p->>'q', '')), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(200, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 50)));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'PIT_MANAGER', 'VIEWER', 'EXCHANGE', 'BANK', 'BROKER', 'PARTICIPANT', 'INSTITUTIONAL');
  IF a->>'role' = 'PARTICIPANT' THEN v_team := (a->>'team_id')::integer;
  ELSIF coalesce(p->>'team', '') <> '' THEN SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team')); v_team := coalesce(v_team, -1);
  END IF;
  IF a->>'role' = 'BROKER' THEN v_broker := coalesce(nullif(a->>'broker_id', '')::integer, -1); END IF;
  IF a->>'role' = 'INSTITUTIONAL' THEN v_inst := coalesce(nullif(a->>'institution_id', '')::integer, -1); END IF;
  RETURN jsonb_build_object('success', true, 'page', v_page, 'page_size', v_size,
    'total', (SELECT count(*) FROM trading_slips sl JOIN orders o ON o.id = sl.order_id JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
              WHERE (v_team IS NULL OR o.team_id = v_team) AND (v_broker IS NULL OR o.broker_id = v_broker) AND (v_inst IS NULL OR o.institution_id = v_inst)
                AND (v_q IS NULL OR sl.slip_no ILIKE '%' || v_q || '%' OR o.order_no ILIKE '%' || v_q || '%' OR t.code ILIKE '%' || v_q || '%' OR s.symbol ILIKE '%' || v_q || '%')),
    'rows', coalesce((SELECT jsonb_agg(jse_slip_json(x) ORDER BY x.id DESC) FROM (
      SELECT sl.* FROM trading_slips sl JOIN orders o ON o.id = sl.order_id JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
      WHERE (v_team IS NULL OR o.team_id = v_team) AND (v_broker IS NULL OR o.broker_id = v_broker) AND (v_inst IS NULL OR o.institution_id = v_inst)
        AND (v_q IS NULL OR sl.slip_no ILIKE '%' || v_q || '%' OR o.order_no ILIKE '%' || v_q || '%' OR t.code ILIKE '%' || v_q || '%' OR s.symbol ILIKE '%' || v_q || '%')
      ORDER BY sl.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) x), '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION jse_slip(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE sl trading_slips%ROWTYPE; o orders%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'PIT_MANAGER', 'VIEWER', 'EXCHANGE', 'BANK', 'BROKER', 'PARTICIPANT', 'INSTITUTIONAL');
  SELECT * INTO sl FROM trading_slips WHERE slip_no = upper(trim(coalesce(p->>'slip_no', '')))
     OR order_id = nullif(p->>'order_id', '')::bigint OR order_id = (SELECT id FROM orders WHERE order_no = upper(trim(coalesce(p->>'order_no', ''))));
  IF NOT FOUND THEN PERFORM jse_fail('SLIP_NOT_FOUND', 'No trading slip found (a slip exists only after the Pit Manager executes the order).', 404); END IF;
  SELECT * INTO o FROM orders WHERE id = sl.order_id;
  IF a->>'role' = 'PARTICIPANT' AND (a->>'team_id')::integer IS DISTINCT FROM o.team_id THEN PERFORM jse_fail('FORBIDDEN', 'Not your trading slip.', 403); END IF;
  IF a->>'role' = 'BROKER' AND o.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN PERFORM jse_fail('FORBIDDEN', 'Not one of your teams'' slips.', 403); END IF;
  IF a->>'role' = 'INSTITUTIONAL' AND o.institution_id IS DISTINCT FROM nullif(a->>'institution_id', '')::integer THEN PERFORM jse_fail('FORBIDDEN', 'Not your institution''s slip.', 403); END IF;
  RETURN jsonb_build_object('success', true, 'event_name', (SELECT event_name FROM event_config WHERE id = 1), 'slip', jse_slip_json(sl));
END $$;

-- ---------------------------------------------------------------------------
-- Broker Desk: only the broker's assigned teams, their instructions and orders
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_broker_desk(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE b brokers%ROWTYPE; cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  IF a->>'role' = 'BROKER' THEN
    SELECT * INTO b FROM brokers WHERE id = nullif(a->>'broker_id', '')::integer;
  ELSE
    SELECT * INTO b FROM brokers WHERE code = upper(trim(coalesce(nullif(p->>'broker', ''), (SELECT min(code) FROM brokers))));
  END IF;
  IF NOT FOUND THEN PERFORM jse_fail('BROKER_NOT_FOUND', 'Broker not found.', 404); END IF;
  RETURN jsonb_build_object('success', true,
    'broker', jsonb_build_object('code', b.code, 'name', b.name, 'contact', b.contact, 'desk', b.desk),
    'brokers', CASE WHEN a->>'role' = 'BROKER' THEN NULL ELSE (SELECT jsonb_agg(jsonb_build_object('code', code, 'name', name) ORDER BY code) FROM brokers) END,
    'rules', jsonb_build_object('brokerage_rate', cfg.brokerage_rate, 'max_order_value', cfg.max_order_value, 'min_order_value', cfg.min_order_value,
      'stock_lot_size', cfg.stock_lot_size, 'loan_max_principal', cfg.loan_max_principal, 'loan_interest_rate', cfg.loan_interest_rate,
      'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades),
    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('code', tm.code, 'name', tm.name, 'section', tm.section, 'members', tm.members,
        'cash', tm.cash, 'free_cash', jse_available_cash(tm.team_id, NULL), 'loan_room', jse_loan_room(tm.team_id),
        'holdings_value', tm.holdings_value, 'net_worth', tm.net_worth, 'settled_buys', tm.settled_buys, 'settled_sells', tm.settled_sells,
        'assessment_met', tm.assessment_met, 'loan_liability', tm.loan_liability, 'eligibility_status', tm.eligibility_status,
        'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'quantity', h.quantity,
              'available', (SELECT available FROM jse_available_qty(tm.team_id, s.id, NULL)), 'avg_price', round(h.trade_cost / nullif(h.quantity, 0), 2),
              'price', s.price, 'value', h.quantity * s.price, 'tradable', s.kind = 'EQUITY' OR s.listed_at IS NOT NULL) ORDER BY h.quantity * s.price DESC)
            FROM holdings h JOIN securities s ON s.id = h.security_id WHERE h.team_id = tm.team_id AND h.quantity > 0), '[]'::jsonb),
        'open_orders', (SELECT count(*) FROM orders o WHERE o.team_id = tm.team_id AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')))
        ORDER BY tm.seq)
      FROM jse_team_metrics tm WHERE tm.broker_id = b.id AND tm.active), '[]'::jsonb),
    'instructions', coalesce((SELECT jsonb_agg(jsonb_build_object('id', i.id, 'instruction_no', i.instruction_no, 'team', t.code, 'team_name', t.name,
        'symbol', s.symbol, 'security', s.name, 'side', i.side, 'quantity', i.quantity, 'note', i.note, 'price_seen', i.price_seen, 'market_price', s.price,
        'status', i.status, 'created_at', i.created_at, 'handled_at', i.handled_at, 'handled_by', i.handled_by_name, 'decline_reason', i.decline_reason,
        'order_no', o.order_no, 'order_status', o.status) ORDER BY (i.status = 'OPEN') DESC, i.id DESC)
      FROM (SELECT * FROM instructions WHERE broker_id = b.id AND (status = 'OPEN' OR created_at > now() - interval '12 hours') ORDER BY id DESC LIMIT 80) i
      JOIN teams t ON t.id = i.team_id JOIN securities s ON s.id = i.security_id LEFT JOIN orders o ON o.id = i.order_id), '[]'::jsonb),
    'orders', coalesce((SELECT jsonb_agg(jse_order_json(x.id) ORDER BY x.id DESC) FROM (
        SELECT o.id FROM orders o WHERE o.broker_id = b.id ORDER BY o.id DESC LIMIT 60) x), '[]'::jsonb),
    'counts', (SELECT jsonb_build_object(
        'teams', (SELECT count(*) FROM teams WHERE broker_id = b.id AND active),
        'open_instructions', (SELECT count(*) FROM instructions WHERE broker_id = b.id AND status = 'OPEN'),
        'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
        'awaiting_exchange', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
        'awaiting_bank', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING')),
        'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
        'rejected', count(*) FILTER (WHERE status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED'))) FROM orders WHERE broker_id = b.id));
END $$;

CREATE OR REPLACE FUNCTION jse_instructions(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_team integer; v_broker integer;
BEGIN
  PERFORM jse_require_role(a, 'PARTICIPANT', 'BROKER', 'ADMIN', 'VIEWER');
  IF a->>'role' = 'PARTICIPANT' THEN v_team := (a->>'team_id')::integer; END IF;
  IF a->>'role' = 'BROKER' THEN v_broker := coalesce(nullif(a->>'broker_id', '')::integer, -1); END IF;
  IF v_team IS NULL AND coalesce(p->>'team', '') <> '' THEN SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team')); v_team := coalesce(v_team, -1); END IF;
  RETURN jsonb_build_object('success', true,
    'broker', (SELECT jsonb_build_object('code', b.code, 'name', b.name, 'contact', b.contact, 'desk', b.desk)
               FROM teams t JOIN brokers b ON b.id = t.broker_id WHERE a->>'role' = 'PARTICIPANT' AND t.id = v_team),
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('id', i.id, 'instruction_no', i.instruction_no, 'team', t.code, 'team_name', t.name,
        'broker', b.code, 'symbol', s.symbol, 'security', s.name, 'side', i.side, 'quantity', i.quantity, 'note', i.note,
        'price_seen', i.price_seen, 'market_price', s.price, 'status', i.status, 'created_at', i.created_at, 'handled_at', i.handled_at,
        'handled_by', i.handled_by_name, 'decline_reason', i.decline_reason, 'order_no', o.order_no, 'order_status', o.status,
        'order_stage', jse_stage_label(o.status, o.reject_code)) ORDER BY i.id DESC)
      FROM (SELECT * FROM instructions WHERE (v_team IS NULL OR team_id = v_team) AND (v_broker IS NULL OR broker_id = v_broker) ORDER BY id DESC LIMIT 200) i
      JOIN teams t ON t.id = i.team_id JOIN securities s ON s.id = i.security_id LEFT JOIN brokers b ON b.id = i.broker_id
      LEFT JOIN orders o ON o.id = i.order_id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Exchange and Bank queues with independent pre-checks
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_exchange_queue(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'VIEWER');
  RETURN jsonb_build_object('success', true,
    'pending', coalesce((SELECT jsonb_agg(q.j ORDER BY q.id) FROM (
      SELECT o.id, jse_order_json(o.id) || jsonb_build_object(
        'holding', av.holding, 'open_sell_other', av.open_sell, 'available_qty', av.available,
        'free_cash', CASE WHEN o.account_type = 'TEAM' THEN jse_available_cash(o.team_id, o.id) END,
        'loan_room', CASE WHEN o.account_type = 'TEAM' THEN jse_loan_room(o.team_id) END,
        'short_sell_risk', (o.account_type = 'TEAM' AND o.side = 'SELL' AND o.quantity > av.available),
        'cash_risk', (o.account_type = 'TEAM' AND o.side = 'BUY' AND o.settlement_amount > jse_available_cash(o.team_id, o.id) + jse_loan_room(o.team_id)),
        'loan_needed', (o.account_type = 'TEAM' AND o.side = 'BUY' AND o.settlement_amount > jse_available_cash(o.team_id, o.id)),
        'age_seconds', extract(epoch FROM now() - coalesce(o.executed_at, o.created_at))::integer) AS j
      FROM orders o CROSS JOIN LATERAL jse_available_qty(o.team_id, o.security_id, o.id) av
      WHERE o.status = 'EXCHANGE_PENDING' ORDER BY o.id LIMIT 300) q), '[]'::jsonb),
    'recent', coalesce((SELECT jsonb_agg(jse_order_json(x.id) ORDER BY x.exchange_at DESC) FROM (
      SELECT id, exchange_at FROM orders WHERE exchange_at IS NOT NULL ORDER BY exchange_at DESC LIMIT 25) x), '[]'::jsonb),
    'counts', (SELECT jsonb_build_object('pending', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
       'awaiting_pit', count(*) FILTER (WHERE status = 'PIT_PENDING'),
       'approved', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING', 'BANK_SETTLED', 'BANK_REJECTED') AND exchange_at IS NOT NULL),
       'rejected', count(*) FILTER (WHERE status = 'EXCHANGE_REJECTED')) FROM orders));
END $$;

CREATE OR REPLACE FUNCTION jse_bank_queue(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  RETURN jsonb_build_object('success', true, 'loan_limit', cfg.loan_max_principal, 'loan_rate', cfg.loan_interest_rate,
    'auto_loan', cfg.loans_enabled AND cfg.auto_loan_on_settlement,
    'pending', coalesce((SELECT jsonb_agg(q.j ORDER BY q.id) FROM (
      SELECT o.id, jse_order_json(o.id) || jsonb_build_object(
        'claimed_by', o.bank_claimed_name, 'claimed_at', o.bank_claimed_at,
        'team_side', CASE WHEN (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL') THEN 'BUY' ELSE 'SELL' END,
        'cash', t.cash, 'holding', coalesce(h.quantity, 0),
        'required', CASE WHEN (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL')
                         THEN o.trade_value + round(o.trade_value * coalesce(o.brokerage_rate, cfg.brokerage_rate), 2) END,
        'loan_room', greatest(0, cfg.loan_max_principal - coalesce(l.original_principal, 0)),
        'institution_holding', CASE WHEN o.account_type = 'INSTITUTION' THEN coalesce(ih.quantity, 0) END,
        'age_seconds', extract(epoch FROM now() - coalesce(o.exchange_at, o.created_at))::integer) AS j
      FROM orders o JOIN teams t ON t.id = o.team_id
      LEFT JOIN holdings h ON h.team_id = o.team_id AND h.security_id = o.security_id
      LEFT JOIN loans l ON l.team_id = o.team_id
      LEFT JOIN institutional_holdings ih ON ih.institution_id = o.institution_id AND ih.security_id = o.security_id
      WHERE o.status IN ('EXCHANGE_APPROVED', 'BANK_PENDING') ORDER BY o.id LIMIT 300) q), '[]'::jsonb),
    'recent', coalesce((SELECT jsonb_agg(jse_order_json(x.id) || jsonb_build_object('loan_drawn', x.loan_drawn) ORDER BY x.bank_at DESC) FROM (
      SELECT o.id, o.bank_at, coalesce(st.loan_drawn, 0) AS loan_drawn FROM orders o LEFT JOIN settlements st ON st.order_id = o.id AND st.reversed_at IS NULL
      WHERE o.bank_at IS NOT NULL ORDER BY o.bank_at DESC LIMIT 25) x), '[]'::jsonb),
    'stats', (SELECT jsonb_build_object('settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
       'rejected', count(*) FILTER (WHERE status = 'BANK_REJECTED'),
       'settled_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED'), 0),
       'brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0),
       'insufficient_balance', (SELECT count(*) FROM risk_events WHERE kind = 'INSUFFICIENT_BALANCE_REJECTION'),
       'loans_outstanding', (SELECT coalesce(sum(principal_outstanding), 0) FROM loans),
       'interest_outstanding', (SELECT coalesce(sum(interest_outstanding), 0) FROM loans),
       'interest_earned', (SELECT coalesce(sum(interest_charged), 0) FROM loans)) FROM orders));
END $$;

-- Loan overview for the Bank desk
CREATE OR REPLACE FUNCTION jse_loans(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  RETURN jsonb_build_object('success', true, 'limit', cfg.loan_max_principal, 'rate', cfg.loan_interest_rate,
    'rules', 'Interest ' || jse_rate_text(cfg.loan_interest_rate) || ' is charged on every draw. Repayment pays interest first, then principal; after a partial repayment, fresh ' ||
             jse_rate_text(cfg.loan_interest_rate) || ' interest is charged on the principal that remains. The full loan must be repaid for eligibility.',
    'loans', coalesce((SELECT jsonb_agg(jsonb_build_object('team', t.code, 'team_name', t.name, 'cash', t.cash, 'original_principal', l.original_principal,
        'principal', l.principal_outstanding, 'interest', l.interest_outstanding, 'liability', l.principal_outstanding + l.interest_outstanding,
        'remaining_limit', greatest(0, cfg.loan_max_principal - l.original_principal), 'status', l.status, 'draws', l.draws,
        'can_draw', cfg.loans_enabled AND l.original_principal < cfg.loan_max_principal,
        'max_repay', least(l.principal_outstanding + l.interest_outstanding, t.cash)) ORDER BY (l.status = 'OUTSTANDING') DESC, t.seq)
      FROM teams t JOIN loans l ON l.team_id = t.id WHERE l.status <> 'NONE'), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Cash ledger with reconciliation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_cash(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_team integer; v_type text := nullif(upper(trim(coalesce(p->>'type', ''))), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(500, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 100)));
  v_q text := nullif(trim(coalesce(p->>'q', '')), '');
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK', 'VIEWER', 'PARTICIPANT');
  IF a->>'role' = 'PARTICIPANT' THEN v_team := (a->>'team_id')::integer;
  ELSIF coalesce(p->>'team', '') <> '' THEN SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team')); v_team := coalesce(v_team, -1);
  END IF;
  RETURN jsonb_build_object('success', true, 'page', v_page, 'page_size', v_size,
    'summary', (SELECT jsonb_build_object('entries', count(*), 'debits', coalesce(sum(debit), 0), 'credits', coalesce(sum(credit), 0),
        'by_type', (SELECT coalesce(jsonb_object_agg(entry_type, jsonb_build_object('count', n, 'debit', d, 'credit', c)), '{}'::jsonb)
                    FROM (SELECT entry_type, count(*) n, sum(debit) d, sum(credit) c FROM cash_ledger
                          WHERE (v_team IS NULL OR team_id = v_team) GROUP BY entry_type) z))
      FROM cash_ledger WHERE (v_team IS NULL OR team_id = v_team) AND (v_type IS NULL OR entry_type = v_type)),
    'reconciliation', (SELECT jsonb_build_object('teams_checked', count(*), 'mismatches', count(*) FILTER (WHERE abs(t.cash - x.net) > 0.001 OR abs(t.cash - x.last_bal) > 0.001),
        'mismatched_teams', coalesce(jsonb_agg(t.code) FILTER (WHERE abs(t.cash - x.net) > 0.001 OR abs(t.cash - x.last_bal) > 0.001), '[]'::jsonb),
        'ok', count(*) FILTER (WHERE abs(t.cash - x.net) > 0.001 OR abs(t.cash - x.last_bal) > 0.001) = 0)
      FROM teams t JOIN LATERAL (
        SELECT coalesce(sum(credit) - sum(debit), 0) AS net,
               coalesce((SELECT balance_after FROM cash_ledger c2 WHERE c2.team_id = t.id ORDER BY c2.id DESC LIMIT 1), 0) AS last_bal
        FROM cash_ledger c WHERE c.team_id = t.id) x ON true
      WHERE v_team IS NULL OR t.id = v_team),
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'created_at', c.created_at, 'team', t.code, 'team_name', t.name, 'order_no', o.order_no,
        'type', c.entry_type, 'debit', c.debit, 'credit', c.credit, 'balance_after', c.balance_after, 'note', c.note, 'actor', c.actor_name) ORDER BY c.id DESC)
      FROM (SELECT * FROM cash_ledger c0 WHERE (v_team IS NULL OR c0.team_id = v_team) AND (v_type IS NULL OR c0.entry_type = v_type)
              AND (v_q IS NULL OR c0.note ILIKE '%' || v_q || '%')
            ORDER BY c0.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) c
      JOIN teams t ON t.id = c.team_id LEFT JOIN orders o ON o.id = c.order_id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Audit log (immutable event history)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_audit_log(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_action text := nullif(upper(trim(coalesce(p->>'action', ''))), '');
  v_team integer; v_q text := nullif(trim(coalesce(p->>'q', '')), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(500, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 100)));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  IF coalesce(p->>'team', '') <> '' THEN SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team')); v_team := coalesce(v_team, -1); END IF;
  RETURN jsonb_build_object('success', true, 'page', v_page, 'page_size', v_size,
    'actions', coalesce((SELECT jsonb_agg(DISTINCT action) FROM audit_log), '[]'::jsonb),
    'total', (SELECT count(*) FROM audit_log al WHERE (v_action IS NULL OR al.action = v_action) AND (v_team IS NULL OR al.team_id = v_team)),
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('id', al.id, 'created_at', al.created_at, 'actor', al.actor_username, 'email', al.actor_email,
        'role', al.actor_role, 'action', al.action, 'entity', al.entity, 'entity_id', al.entity_id, 'team', t.code, 'order_no', o.order_no,
        'before', al.before_state, 'after', al.after_state, 'details', al.details, 'ip', al.ip, 'session', al.session_id) ORDER BY al.id DESC)
      FROM (SELECT * FROM audit_log a0 WHERE (v_action IS NULL OR a0.action = v_action) AND (v_team IS NULL OR a0.team_id = v_team)
              AND (v_q IS NULL OR a0.entity_id ILIKE '%' || v_q || '%' OR a0.actor_username ILIKE '%' || v_q || '%' OR a0.details::text ILIKE '%' || v_q || '%')
            ORDER BY a0.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) al
      LEFT JOIN teams t ON t.id = al.team_id LEFT JOIN orders o ON o.id = al.order_id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Broker commission: ranking and the per-transaction register (reconciles to settled transactions)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_commissions(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_broker integer; v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(500, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 100)));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'VIEWER');
  IF a->>'role' = 'BROKER' THEN v_broker := nullif(a->>'broker_id', '')::integer;
  ELSIF coalesce(p->>'broker', '') <> '' THEN SELECT id INTO v_broker FROM brokers WHERE code = upper(trim(p->>'broker')); v_broker := coalesce(v_broker, -1);
  END IF;
  RETURN jsonb_build_object('success', true, 'rate', (SELECT brokerage_rate FROM event_config WHERE id = 1),
    'own_broker', CASE WHEN a->>'role' = 'BROKER' THEN (SELECT code FROM brokers WHERE id = v_broker) END,
    'brokers', coalesce((SELECT jsonb_agg(x ORDER BY (x->>'rank')::integer) FROM (
      SELECT jsonb_build_object('rank', row_number() OVER (ORDER BY coalesce(c.amount, 0) DESC, b.code), 'broker', b.code, 'name', b.name,
        'teams', (SELECT count(*) FROM teams t WHERE t.broker_id = b.id),
        'orders', coalesce(c.n, 0), 'buy_orders', coalesce(c.nb, 0), 'sell_orders', coalesce(c.ns, 0),
        'buy_volume', coalesce(c.bv, 0), 'sell_volume', coalesce(c.sv, 0), 'buy_quantity', coalesce(c.bq, 0), 'sell_quantity', coalesce(c.sq, 0),
        'total_trade_value', coalesce(c.tv, 0), 'brokerage_earned', coalesce(c.amount, 0),
        'pending_orders', (SELECT count(*) FROM orders o WHERE o.broker_id = b.id AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING'))) AS x
      FROM brokers b LEFT JOIN (
        SELECT bc.broker_id, count(*) n, count(*) FILTER (WHERE bc.side = 'BUY') nb, count(*) FILTER (WHERE bc.side = 'SELL') ns,
               sum(bc.trade_value) FILTER (WHERE bc.side = 'BUY') bv, sum(bc.trade_value) FILTER (WHERE bc.side = 'SELL') sv,
               sum(o.quantity) FILTER (WHERE bc.side = 'BUY') bq, sum(o.quantity) FILTER (WHERE bc.side = 'SELL') sq,
               sum(bc.trade_value) tv, sum(bc.amount) amount
        FROM broker_commissions bc JOIN orders o ON o.id = bc.order_id WHERE bc.reversed_at IS NULL GROUP BY bc.broker_id) c ON c.broker_id = b.id) q
      -- a broker sees only its own row (with its rank); staff see every broker
      WHERE a->>'role' <> 'BROKER' OR x->>'broker' = (SELECT code FROM brokers WHERE id = v_broker)), '[]'::jsonb),
    'transactions_total', (SELECT count(*) FROM broker_commissions bc WHERE v_broker IS NULL OR bc.broker_id = v_broker),
    'page', v_page, 'page_size', v_size,
    'transactions', coalesce((SELECT jsonb_agg(jsonb_build_object('created_at', bc.created_at, 'broker', b.code, 'broker_name', b.name,
        'order_no', o.order_no, 'team', t.code, 'team_name', t.name, 'symbol', s.symbol, 'security', s.name, 'side', bc.side,
        'quantity', o.quantity, 'price', o.price, 'trade_value', bc.trade_value, 'rate', bc.rate, 'amount', bc.amount,
        'status', CASE WHEN bc.reversed_at IS NULL THEN 'SETTLED' ELSE 'REVERSED' END, 'reversed_at', bc.reversed_at) ORDER BY bc.id DESC)
      FROM (SELECT * FROM broker_commissions WHERE v_broker IS NULL OR broker_id = v_broker ORDER BY id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) bc
      JOIN brokers b ON b.id = bc.broker_id JOIN orders o ON o.id = bc.order_id JOIN teams t ON t.id = bc.team_id JOIN securities s ON s.id = o.security_id), '[]'::jsonb),
    'totals', (SELECT jsonb_build_object('orders', count(*), 'trade_value', coalesce(sum(trade_value), 0), 'brokerage', coalesce(sum(amount), 0))
               FROM broker_commissions WHERE reversed_at IS NULL AND (v_broker IS NULL OR broker_id = v_broker)),
    'reconciliation', (SELECT jsonb_build_object('commission_total', c.total, 'settled_brokerage_total', st.total, 'ok', c.total = st.total)
      FROM (SELECT coalesce(sum(amount), 0) AS total FROM broker_commissions WHERE reversed_at IS NULL AND (v_broker IS NULL OR broker_id = v_broker)) c,
           (SELECT coalesce(sum(st0.brokerage), 0) AS total FROM settlements st0 JOIN orders o0 ON o0.id = st0.order_id
            WHERE st0.reversed_at IS NULL AND st0.account_type = 'TEAM' AND o0.broker_id IS NOT NULL AND (v_broker IS NULL OR o0.broker_id = v_broker)) st));
END $$;

-- ---------------------------------------------------------------------------
-- Market News list (public)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_news_list(p jsonb) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('success', true, 'news', coalesce(jsonb_agg(x ORDER BY (x->>'id')::bigint DESC), '[]'::jsonb))
  FROM (SELECT jsonb_build_object('id', n.id, 'symbol', s.symbol, 'name', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
          'mood', replace(n.mood, '_', ' '), 'headline', n.headline, 'requested_pct', n.requested_pct, 'applied_pct', round(n.applied_pct, 2),
          'previous_price', n.previous_price, 'new_price', n.new_price, 'reversed', n.reversed_at IS NOT NULL,
          'created_by', n.created_by_name, 'created_at', n.created_at) AS x
        FROM market_news n JOIN securities s ON s.id = n.security_id
        ORDER BY n.id DESC LIMIT least(200, greatest(1, coalesce(nullif(p->>'limit', '')::integer, 30)))) q
$$;

-- ---------------------------------------------------------------------------
-- Market Intelligence (administrator / faculty only; embedded in Event Admin). Same canonical data as
-- portfolios, tracking and the market board.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_insights() RETURNS jsonb LANGUAGE sql STABLE AS $$
  WITH s AS (SELECT * FROM securities WHERE active AND (kind = 'EQUITY' OR listed_at IS NOT NULL)),
       ev AS (SELECT status FROM event_control WHERE id = 1),
       rk AS (SELECT * FROM jse_ranked_teams()),
       tm AS (SELECT * FROM jse_team_metrics WHERE active),
       idx AS (SELECT jse_cms_index() AS j),
       br AS (SELECT count(*) FILTER (WHERE price > coalesce(index_base_price, base_price)) AS adv,
                     count(*) FILTER (WHERE price < coalesce(index_base_price, base_price)) AS dec,
                     count(*) FILTER (WHERE price = coalesce(index_base_price, base_price)) AS unch FROM s),
       flow AS (SELECT coalesce(sum(trade_value) FILTER (WHERE account_type = 'TEAM' AND side = 'BUY'), 0) AS team_buy,
                       coalesce(sum(trade_value) FILTER (WHERE account_type = 'TEAM' AND side = 'SELL'), 0) AS team_sell,
                       coalesce(sum(trade_value) FILTER (WHERE account_type = 'INSTITUTION' AND side = 'BUY'), 0) AS inst_buy,
                       coalesce(sum(trade_value) FILTER (WHERE account_type = 'INSTITUTION' AND side = 'SELL'), 0) AS inst_sell,
                       count(*) AS trades, coalesce(sum(trade_value), 0) AS value, coalesce(sum(brokerage), 0) AS brokerage
                FROM settlements WHERE reversed_at IS NULL),
       press AS (SELECT o.security_id,
                        sum(o.trade_value) FILTER (WHERE (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'BUY')) AS buy_v,
                        sum(o.trade_value) FILTER (WHERE (o.account_type = 'TEAM' AND o.side = 'SELL') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL')) AS sell_v,
                        count(*) AS n
                 FROM orders o WHERE o.created_at > now() - interval '30 minutes' AND o.status NOT IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED')
                 GROUP BY o.security_id)
  SELECT jsonb_build_object('success', true, 'status', ev.status,
    'index', idx.j,
    'breadth', jsonb_build_object('advances', br.adv, 'declines', br.dec, 'unchanged', br.unch),
    'sentiment', jsonb_build_object(
      'label', CASE WHEN (idx.j->>'change_pct')::numeric >= 0.5 AND br.adv > br.dec THEN 'BULLISH'
                    WHEN (idx.j->>'change_pct')::numeric <= -0.5 AND br.dec > br.adv THEN 'BEARISH' ELSE 'NEUTRAL' END,
      'index_change_pct', (idx.j->>'change_pct')::numeric,
      'recent_news', (SELECT jsonb_build_object('positive', count(*) FILTER (WHERE mood IN ('POSITIVE','VERY_POSITIVE','SUPER_POSITIVE')),
                        'negative', count(*) FILTER (WHERE mood IN ('NEGATIVE','SEVERE','VERY_SEVERE')), 'normal', count(*) FILTER (WHERE mood = 'NORMAL'))
                      FROM (SELECT mood FROM market_news WHERE reversed_at IS NULL ORDER BY id DESC LIMIT 12) z)),
    'flow', jsonb_build_object('team_buy_value', flow.team_buy, 'team_sell_value', flow.team_sell, 'net_team_flow', flow.team_buy - flow.team_sell,
      'trades', flow.trades, 'settled_value', flow.value, 'brokerage', flow.brokerage),
    'institutional_signal', jsonb_build_object('bought_value', flow.inst_buy, 'sold_value', flow.inst_sell, 'net', flow.inst_buy - flow.inst_sell,
      'label', CASE WHEN flow.inst_buy - flow.inst_sell > 0 THEN 'NET BUYING' WHEN flow.inst_buy - flow.inst_sell < 0 THEN 'NET SELLING' ELSE 'NEUTRAL' END),
    'top_gainers', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY jse_pct(x.price, coalesce(x.index_base_price, x.base_price)) DESC)
                             FROM (SELECT * FROM s WHERE price > coalesce(index_base_price, base_price) ORDER BY jse_pct(price, coalesce(index_base_price, base_price)) DESC LIMIT 5) x), '[]'::jsonb),
    'top_losers', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY jse_pct(x.price, coalesce(x.index_base_price, x.base_price)))
                            FROM (SELECT * FROM s WHERE price < coalesce(index_base_price, base_price) ORDER BY jse_pct(price, coalesce(index_base_price, base_price)) LIMIT 5) x), '[]'::jsonb),
    'most_traded', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY x.traded_value DESC) FROM (SELECT * FROM s WHERE trade_count > 0 ORDER BY traded_value DESC LIMIT 8) x), '[]'::jsonb),
    'buy_pressure', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s2.symbol, 'name', s2.name, 'buy_value', coalesce(pr.buy_v, 0), 'sell_value', coalesce(pr.sell_v, 0), 'orders', pr.n)
                               ORDER BY coalesce(pr.buy_v, 0) - coalesce(pr.sell_v, 0) DESC)
                              FROM (SELECT * FROM press WHERE coalesce(buy_v, 0) > coalesce(sell_v, 0) ORDER BY coalesce(buy_v, 0) - coalesce(sell_v, 0) DESC LIMIT 5) pr
                              JOIN securities s2 ON s2.id = pr.security_id), '[]'::jsonb),
    'sell_pressure', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s2.symbol, 'name', s2.name, 'buy_value', coalesce(pr.buy_v, 0), 'sell_value', coalesce(pr.sell_v, 0), 'orders', pr.n)
                                ORDER BY coalesce(pr.sell_v, 0) - coalesce(pr.buy_v, 0) DESC)
                               FROM (SELECT * FROM press WHERE coalesce(sell_v, 0) > coalesce(buy_v, 0) ORDER BY coalesce(sell_v, 0) - coalesce(buy_v, 0) DESC LIMIT 5) pr
                               JOIN securities s2 ON s2.id = pr.security_id), '[]'::jsonb),
    'sectors', coalesce((SELECT jsonb_agg(jsonb_build_object('sector', z.sector, 'securities', z.n, 'avg_change_pct', z.chg, 'traded_value', z.tv, 'advances', z.adv, 'declines', z.dec)
                          ORDER BY z.chg DESC)
                         FROM (SELECT coalesce(sector, 'Other') AS sector, count(*) AS n, round(avg(jse_pct(price, coalesce(index_base_price, base_price))), 2) AS chg,
                                      sum(traded_value) AS tv, count(*) FILTER (WHERE price > coalesce(index_base_price, base_price)) AS adv,
                                      count(*) FILTER (WHERE price < coalesce(index_base_price, base_price)) AS dec
                               FROM s GROUP BY coalesce(sector, 'Other')) z), '[]'::jsonb),
    'net_worth', (SELECT jsonb_build_object('highest', max(net_worth), 'average', round(avg(net_worth), 2), 'lowest', min(net_worth),
                  'total', sum(net_worth), 'teams', count(*), 'eligible', count(*) FILTER (WHERE eligible), 'assessment_met', count(*) FILTER (WHERE assessment_met),
                  'profitable', count(*) FILTER (WHERE pnl > 0)) FROM tm),
    'orders', (SELECT jsonb_build_object('total', count(*), 'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
                  'pending', count(*) FILTER (WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
                  'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'), 'rejected', count(*) FILTER (WHERE status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED')),
                  'stale', count(*) FILTER (WHERE reject_code = 'PRICE_STALE')) FROM orders),
    'final', ev.status IN ('CLOSED', 'FINALIZED'),
    'winner', (SELECT jsonb_build_object('team', m->>'code', 'name', m->>'name', 'net_worth', (m->>'net_worth')::numeric, 'broker', m->>'broker',
                  'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2)) FROM rk WHERE award = 'WINNER'),
    'runner_up', (SELECT jsonb_build_object('team', m->>'code', 'name', m->>'name', 'net_worth', (m->>'net_worth')::numeric, 'broker', m->>'broker',
                  'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2)) FROM rk WHERE award = 'RUNNER_UP'),
    'leaderboard', coalesce((SELECT jsonb_agg(jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award, 'team', m->>'code', 'name', m->>'name',
                  'net_worth', (m->>'net_worth')::numeric, 'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2),
                  'buys', (m->>'settled_buys')::integer, 'sells', (m->>'settled_sells')::integer, 'eligible', (m->>'eligible')::boolean,
                  'eligibility_status', m->>'eligibility_status') ORDER BY rank_overall)
                  FROM rk WHERE rank_overall <= 10), '[]'::jsonb),
    'alerts', (SELECT coalesce(jsonb_agg(al) FILTER (WHERE al IS NOT NULL), '[]'::jsonb) FROM (SELECT unnest(ARRAY[
        CASE WHEN (SELECT count(*) FROM orders WHERE status = 'PIT_PENDING' AND created_at < now() - interval '3 minutes') > 0
             THEN jsonb_build_object('level', 'warn', 'text', (SELECT count(*) FROM orders WHERE status = 'PIT_PENDING' AND created_at < now() - interval '3 minutes') || ' order(s) waiting more than 3 min for the Pit Manager') END,
        CASE WHEN (SELECT count(*) FROM orders WHERE status = 'EXCHANGE_PENDING' AND coalesce(executed_at, created_at) < now() - interval '3 minutes') > 0
             THEN jsonb_build_object('level', 'warn', 'text', (SELECT count(*) FROM orders WHERE status = 'EXCHANGE_PENDING' AND coalesce(executed_at, created_at) < now() - interval '3 minutes') || ' executed order(s) waiting more than 3 min at the Exchange') END,
        CASE WHEN (SELECT count(*) FROM orders WHERE status IN ('EXCHANGE_APPROVED','BANK_PENDING') AND exchange_at < now() - interval '3 minutes') > 0
             THEN jsonb_build_object('level', 'warn', 'text', (SELECT count(*) FROM orders WHERE status IN ('EXCHANGE_APPROVED','BANK_PENDING') AND exchange_at < now() - interval '3 minutes') || ' approved order(s) waiting more than 3 min at the Bank') END,
        CASE WHEN (SELECT count(*) FROM orders WHERE reject_code = 'PRICE_STALE' AND pit_at > now() - interval '10 minutes') > 0
             THEN jsonb_build_object('level', 'info', 'text', (SELECT count(*) FROM orders WHERE reject_code = 'PRICE_STALE' AND pit_at > now() - interval '10 minutes') || ' order(s) went PRICE STALE in the last 10 min \u2014 brokers must resubmit') END,
        CASE WHEN (SELECT count(*) FROM risk_events WHERE kind = 'SHORT_SELL_ATTEMPT' AND created_at > now() - interval '15 minutes') > 0
             THEN jsonb_build_object('level', 'warn', 'text', (SELECT count(*) FROM risk_events WHERE kind = 'SHORT_SELL_ATTEMPT' AND created_at > now() - interval '15 minutes') || ' short-selling attempt(s) in the last 15 min') END,
        CASE WHEN ev.status IN ('LIVE', 'SETTLEMENT_ONLY') AND (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NULL) > 0
             THEN jsonb_build_object('level', 'info', 'text', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NULL) || ' IPO(s) not listed yet') END,
        CASE WHEN (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active) <> (idx.j->>'equity_components')::integer
             THEN jsonb_build_object('level', 'bad', 'text', 'CMS INDEX component mismatch: check the listed equities') END,
        CASE WHEN ev.status IN ('CLOSED', 'FINALIZED') AND (SELECT count(*) FROM tm WHERE NOT cash_rule_met) > 0
             THEN jsonb_build_object('level', 'info', 'text', (SELECT count(*) FROM tm WHERE NOT cash_rule_met) || ' team(s) do not meet the closing cash rule') END,
        CASE WHEN (SELECT count(*) FROM tm WHERE NOT loan_repaid) > 0 AND ev.status IN ('SETTLEMENT_ONLY', 'CLOSED')
             THEN jsonb_build_object('level', 'warn', 'text', (SELECT count(*) FROM tm WHERE NOT loan_repaid) || ' team(s) still have loans outstanding (not eligible until repaid)') END
      ]) AS al) z),
    'latest_news', (SELECT jse_news_list('{"limit":8}'::jsonb)->'news'),
    'institutional', (SELECT jsonb_build_object(
        'accounts', coalesce((SELECT jsonb_agg(jsonb_build_object('code', i.code, 'name', i.name, 'cash', i.cash,
            'holdings_value', coalesce((SELECT sum(ih.quantity * s2.price) FROM institutional_holdings ih JOIN securities s2 ON s2.id = ih.security_id WHERE ih.institution_id = i.id), 0)))
            FROM institutions i), '[]'::jsonb),
        'recent', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'side', o.side, 'symbol', s2.symbol, 'quantity', o.quantity,
            'price', o.price, 'trade_value', o.trade_value, 'status', o.status, 'counterparty', t.code, 'at', o.updated_at) ORDER BY o.updated_at DESC)
            FROM (SELECT * FROM orders WHERE account_type = 'INSTITUTION' ORDER BY updated_at DESC LIMIT 8) o
            JOIN securities s2 ON s2.id = o.security_id JOIN teams t ON t.id = o.team_id), '[]'::jsonb))),
    'tape', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s2.symbol, 'side', st.side, 'quantity', st.quantity, 'price', st.price,
              'account_type', st.account_type, 'at', st.settled_at) ORDER BY st.settled_at DESC)
              FROM (SELECT * FROM settlements WHERE reversed_at IS NULL ORDER BY id DESC LIMIT 12) st JOIN securities s2 ON s2.id = st.security_id), '[]'::jsonb))
  FROM ev, idx, br, flow
$$;

-- ---------------------------------------------------------------------------
-- Institutional desk
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_institutional(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE i institutions%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL', 'VIEWER');
  SELECT * INTO i FROM institutions WHERE id = coalesce(CASE WHEN a->>'role' <> 'INSTITUTIONAL' THEN nullif(p->>'institution_id', '')::integer END,
                                                        nullif(a->>'institution_id', '')::integer, (SELECT min(id) FROM institutions));
  IF NOT FOUND THEN PERFORM jse_fail('INSTITUTION_NOT_FOUND', 'Institutional account not found.', 404); END IF;
  RETURN jsonb_build_object('success', true,
    'institutions', (SELECT jsonb_agg(jsonb_build_object('id', x.id, 'code', x.code, 'name', x.name) ORDER BY x.id) FROM institutions x),
    -- counterparty choices: participant team code and team name only (no team cash or holdings)
    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('code', t.code, 'name', t.name) ORDER BY t.seq) FROM teams t WHERE t.active), '[]'::jsonb),
    'account', jsonb_build_object('id', i.id, 'code', i.code, 'name', i.name, 'initial_cash', i.initial_cash, 'cash', i.cash,
       'holdings_value', coalesce((SELECT sum(ih.quantity * s.price) FROM institutional_holdings ih JOIN securities s ON s.id = ih.security_id WHERE ih.institution_id = i.id), 0)),
    'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'security', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'quantity', ih.quantity, 'avg_price', round(ih.cost_basis / nullif(ih.quantity, 0), 2), 'current_price', s.price,
        'market_value', ih.quantity * s.price) ORDER BY ih.quantity * s.price DESC)
      FROM institutional_holdings ih JOIN securities s ON s.id = ih.security_id WHERE ih.institution_id = i.id AND ih.quantity > 0), '[]'::jsonb),
    'orders', coalesce((SELECT jsonb_agg(jse_order_json(o.id) ORDER BY o.id DESC) FROM (SELECT id FROM orders WHERE institution_id = i.id ORDER BY id DESC LIMIT 60) o), '[]'::jsonb),
    'stats', (SELECT jsonb_build_object('orders', count(*), 'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
       'pending', count(*) FILTER (WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
       'bought_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'BUY'), 0),
       'sold_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'SELL'), 0)) FROM orders WHERE institution_id = i.id),
    'ledger', coalesce((SELECT jsonb_agg(jsonb_build_object('type', l.entry_type, 'debit', l.debit, 'credit', l.credit, 'balance_after', l.balance_after,
        'note', l.note, 'at', l.created_at) ORDER BY l.id DESC) FROM (SELECT * FROM institution_ledger WHERE institution_id = i.id ORDER BY id DESC LIMIT 30) l), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Event admin dashboard state
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_admin_state(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_idx jsonb := jse_cms_index();
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jse_event_status() || jsonb_build_object(
    'config_full', (SELECT to_jsonb(c) - 'min_cash_buffer' - 'participant_order_entry' FROM event_config c WHERE id = 1),
    'stats', (SELECT jsonb_build_object('total_trade_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'total_brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
        'pending_orders', count(*) FILTER (WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
        'settled_orders', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
        'rejected_orders', count(*) FILTER (WHERE status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED')),
        'stale_orders', count(*) FILTER (WHERE reject_code = 'PRICE_STALE'),
        'slips', (SELECT count(*) FROM trading_slips),
        'open_instructions', (SELECT count(*) FROM instructions WHERE status = 'OPEN'),
        'institutional_orders', count(*) FILTER (WHERE account_type = 'INSTITUTION'),
        'news_items', (SELECT count(*) FROM market_news WHERE reversed_at IS NULL),
        'loans_outstanding', (SELECT coalesce(sum(principal_outstanding + interest_outstanding), 0) FROM loans),
        'risk', (SELECT jsonb_build_object('short_sell', count(*) FILTER (WHERE kind = 'SHORT_SELL_ATTEMPT'),
                   'cash_shortfall', count(*) FILTER (WHERE kind = 'CASH_SHORTFALL_ATTEMPT'),
                   'insufficient_balance', count(*) FILTER (WHERE kind = 'INSUFFICIENT_BALANCE_REJECTION')) FROM risk_events)) FROM orders),
    'market', jsonb_build_object('index', v_idx, 'breadth', jse_market()->'breadth'),
    'consistency', (SELECT jsonb_build_object(
        'equities_active', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active),
        'index_equity_components', (v_idx->>'equity_components')::integer,
        'market_stocks', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active),
        'ipos', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active),
        'ipos_listed', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NOT NULL),
        'index_ipo_components', (v_idx->>'ipo_components')::integer,
        'index_components', (v_idx->>'components')::integer,
        'ok', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active) = (v_idx->>'equity_components')::integer
              AND (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NOT NULL) = (v_idx->>'ipo_components')::integer)),
    'journal', coalesce((SELECT jsonb_agg(jsonb_build_object('id', j.id, 'action', j.action, 'summary', j.summary, 'actor', j.actor_name, 'at', j.created_at,
        'undone_at', j.undone_at, 'undone_by', j.undone_by, 'redone_at', j.redone_at, 'redone_by', j.redone_by,
        'superseded', coalesce((j.payload->>'superseded')::boolean, false),
        'state', CASE WHEN coalesce((j.payload->>'superseded')::boolean, false) THEN 'REDONE'
                      WHEN j.undone_at IS NOT NULL AND (j.redone_at IS NULL OR j.redone_at < j.undone_at) THEN 'UNDONE' ELSE 'ACTIVE' END) ORDER BY j.id DESC)
      FROM (SELECT * FROM action_journal ORDER BY id DESC LIMIT 40) j), '[]'::jsonb),
    'allotments', (SELECT jsonb_build_object('rows', count(*), 'teams', count(DISTINCT team_id), 'amount', coalesce(sum(amount), 0),
        'by_ipo', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'name', s.name, 'teams', z.n, 'lots', z.lots, 'shares', z.q, 'amount', z.amt) ORDER BY s.display_order)
                  FROM (SELECT security_id, count(*) n, sum(lots) lots, sum(quantity) q, sum(amount) amt FROM ipo_allotments WHERE reversed_at IS NULL GROUP BY security_id) z
                  JOIN securities s ON s.id = z.security_id), '[]'::jsonb))
      FROM ipo_allotments WHERE reversed_at IS NULL),
    'ipo_listing', jse_listing_state(a),
    'ipo_admin', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'ipo_code', s.ipo_code, 'name', s.name, 'stage', jse_ipo_stage(s.id),
        'applications', (SELECT count(*) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),
        'applied_lots', (SELECT coalesce(sum(lots), 0) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),
        'prospectus_fields', (SELECT (CASE WHEN pr.company_description IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.issue_details IS NOT NULL THEN 1 ELSE 0 END)
              + (CASE WHEN pr.business_overview IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.financial_information IS NOT NULL THEN 1 ELSE 0 END)
              + (CASE WHEN pr.risk_factors IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.use_of_proceeds IS NOT NULL THEN 1 ELSE 0 END)
              + (CASE WHEN pr.promoters_management IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.other_information IS NOT NULL THEN 1 ELSE 0 END)
              FROM ipo_prospectus pr WHERE pr.security_id = s.id),
        'has_document', (SELECT document_data IS NOT NULL OR document_url IS NOT NULL FROM ipo_prospectus pr WHERE pr.security_id = s.id)) ORDER BY s.display_order)
      FROM securities s WHERE s.kind = 'IPO' AND s.active), '[]'::jsonb),
    'team_names', (SELECT jsonb_build_object('seed', team_name_seed, 'assigned_at', team_names_assigned_at, 'locked', team_names_locked_at IS NOT NULL,
        'locked_at', team_names_locked_at, 'locked_by', team_names_locked_by, 'pool_size', (SELECT count(*) FROM team_name_pool WHERE active))
      FROM event_config WHERE id = 1),
    'brokers', (SELECT jsonb_agg(jsonb_build_object('code', b.code, 'name', b.name, 'contact', b.contact, 'desk', b.desk,
        'teams', (SELECT count(*) FROM teams t WHERE t.broker_id = b.id)) ORDER BY b.code) FROM brokers b),
    'unassigned_teams', (SELECT count(*) FROM teams WHERE broker_id IS NULL),
    'users', (SELECT jsonb_object_agg(role, n) FROM (SELECT role, count(*) n FROM app_users WHERE active GROUP BY role) u));
END $$;

-- ---------------------------------------------------------------------------
-- Share certificates (settled share ownership; separate from trading slips) and award certificates
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_share_certificates(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE t teams%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER', 'PARTICIPANT', 'BROKER');
  SELECT * INTO t FROM teams WHERE id = CASE WHEN a->>'role' = 'PARTICIPANT' THEN nullif(a->>'team_id', '')::integer
                                             ELSE (SELECT id FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')))) END;
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Choose a team.', 404); END IF;
  IF a->>'role' = 'BROKER' AND t.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN PERFORM jse_fail('FORBIDDEN', 'Not one of your teams.', 403); END IF;
  RETURN jsonb_build_object('success', true, 'event_name', (SELECT event_name FROM event_config WHERE id = 1), 'as_of', now(),
    'status', (SELECT status FROM event_control WHERE id = 1),
    'team', jsonb_build_object('code', t.code, 'name', t.name, 'section', t.section, 'members', t.members,
       'broker', (SELECT code FROM brokers WHERE id = t.broker_id), 'broker_name', (SELECT name FROM brokers WHERE id = t.broker_id)),
    'certificates', coalesce((SELECT jsonb_agg(jsonb_build_object('certificate_no', 'SC-' || t.seq || '-' || s.id || '-' || h.quantity,
        'symbol', s.symbol, 'security', s.name, 'asset_type', CASE WHEN s.kind = 'IPO' THEN 'IPO share' ELSE 'Equity share' END,
        'quantity', h.quantity, 'avg_cost', round(h.trade_cost / nullif(h.quantity, 0), 2), 'last_settled_at', h.updated_at,
        'allotted', (SELECT coalesce(sum(quantity), 0) FROM ipo_allotments al WHERE al.team_id = t.id AND al.security_id = s.id AND al.reversed_at IS NULL),
        'settled_trades', (SELECT count(*) FROM settlements st WHERE st.team_id = t.id AND st.security_id = s.id AND st.reversed_at IS NULL)) ORDER BY s.display_order)
      FROM holdings h JOIN securities s ON s.id = h.security_id WHERE h.team_id = t.id AND h.quantity > 0), '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION jse_certificates(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jsonb_build_object('success', true, 'event_name', (SELECT event_name FROM event_config WHERE id = 1),
    'status', (SELECT status FROM event_control WHERE id = 1), 'generated_at', now(),
    'ranking', coalesce((SELECT jsonb_agg(jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award, 'team', m->>'code',
        'name', m->>'name', 'section', m->>'section', 'members', m->>'members', 'broker', m->>'broker', 'broker_name', m->>'broker_name',
        'net_worth', (m->>'net_worth')::numeric, 'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2),
        'buys', (m->>'settled_buys')::integer, 'sells', (m->>'settled_sells')::integer, 'eligible', (m->>'eligible')::boolean,
        'eligibility_status', m->>'eligibility_status', 'cash_rule_met', (m->>'cash_rule_met')::boolean, 'loan_repaid', (m->>'loan_repaid')::boolean)
        ORDER BY coalesce(rank_eligible, 100000 + rank_overall))
      FROM jse_ranked_teams()), '[]'::jsonb),
    'top_brokers', (SELECT jse_commissions(a, '{}'::jsonb)->'brokers'));
END $$;

CREATE OR REPLACE FUNCTION jse_reports(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jsonb_build_object('success', true, 'generated_at', now(),
    'event', jse_event_status(),
    'portfolios', jse_portfolios(a, '{}'::jsonb) - 'teams',
    'commissions', jse_commissions(a, '{"page_size":10}'::jsonb) - 'transactions',
    'insights', jse_insights(),
    'reconciliation', jse_cash(a, '{"page_size":10}'::jsonb)->'reconciliation');
END $$;

INSERT INTO schema_migrations(version) VALUES ('004_reads');
`;var Xa=`-- JAIN STOCK EXCHANGE (JSE) v311
-- 005_exports.sql: one function per export sheet; rows are returned as arrays for compact transfer.
-- Every sheet reads the same canonical tables / views as the live dashboards.

CREATE OR REPLACE FUNCTION jse_export_sheets() RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT '[
    ["winner","Winner & Runner-Up"],["assessment","Assessment & Eligibility"],["teams","Team Details"],["participants","Participant Details"],
    ["broker_roster","Broker Roster"],["brokers","Broker Performance"],
    ["cash","Cash"],["holdings","Holdings"],["sold_stocks","Sold Stocks"],["sold_ipos","Sold IPOs"],
    ["networth","Net Worth & PL"],["loans","Loans & Interest"],["cash_rule","Cash Rule"],
    ["short_sell","Short Selling Attempts"],["cash_shortfall","Cash Shortfall Attempts"],["insufficient_balance","Insufficient Balance Rejections"],
    ["orders","Order Tracking"],["rejected","Rejected Orders"],["slips","Trading Slips"],["instructions","Participant Instructions"],
    ["trades","Trade History"],["ledger","Cash Ledger"],["commission","Broker Commission"],["institutional","Institutional Investors"],
    ["ipo_applications","IPO Applications"],["ipo_allotments","IPO Allotments"],
    ["news","Market News"],["prices","Price History"],["journal","Action Journal"],["audit","Audit Logs"]]'::jsonb
$$;

CREATE OR REPLACE FUNCTION jse_export(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_sheet text := lower(coalesce(p->>'sheet', '')); v_cols jsonb; v_rows jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  IF v_sheet = 'winner' THEN
    v_cols := '["Award","Rank (eligible)","Overall rank","Team","Team name","Broker","Liquid Cash","Holdings Value","Net Worth","P/L","Return %","Settled BUY","Settled SELL","Loan repaid","Closing cash rule","Eligibility"]';
    SELECT jsonb_agg(jsonb_build_array(CASE award WHEN 'WINNER' THEN 'WINNER' WHEN 'RUNNER_UP' THEN 'RUNNER-UP' ELSE '' END, rank_eligible, rank_overall,
             m->>'code', m->>'name', m->>'broker', (m->>'cash')::numeric, (m->>'holdings_value')::numeric,
             (m->>'net_worth')::numeric, (m->>'pnl')::numeric, round((m->>'return_pct')::numeric, 2), (m->>'settled_buys')::integer, (m->>'settled_sells')::integer,
             CASE WHEN (m->>'loan_repaid')::boolean THEN 'YES' ELSE 'NO' END, m->>'cash_rule_status', m->>'eligibility_status')
           ORDER BY coalesce(rank_eligible, 100000 + rank_overall)) INTO v_rows FROM jse_ranked_teams();
  ELSIF v_sheet = 'assessment' THEN
    v_cols := '["Team","Team name","Broker","Settled BUY","Min BUY","Settled SELL","Min SELL","Assessment","Loan liability","Loan repaid","Base cash counted","Cash limit","Closing cash rule","Eligibility","Gaps"]';
    SELECT jsonb_agg(jsonb_build_array(code, name, broker, settled_buys, min_buy_trades, settled_sells, min_sell_trades,
             CASE WHEN assessment_met THEN 'MET' ELSE 'NOT MET' END, loan_liability, CASE WHEN loan_repaid THEN 'YES' ELSE 'NO' END,
             base_cash_counted, cash_rule_limit, cash_rule_status, eligibility_status, array_to_string(eligibility_gaps, '; ')) ORDER BY seq) INTO v_rows
    FROM jse_team_metrics;
  ELSIF v_sheet = 'teams' THEN
    v_cols := '["Team","Team Name","Section","Broker","Members","Broker name","Broker contact","Broker desk","Name meaning","Active"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, t.name, t.section, b.code, t.members, b.name, b.contact, b.desk, np.meaning, t.active) ORDER BY t.seq) INTO v_rows
    FROM teams t LEFT JOIN brokers b ON b.id = t.broker_id LEFT JOIN team_name_pool np ON lower(np.name) = lower(t.name);
  ELSIF v_sheet = 'participants' THEN
    v_cols := '["Team","Team name","Section","Members","Broker","Login","Login active","Last login"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, t.name, t.section, t.members, b.code, u.username, u.active, u.last_login_at) ORDER BY t.seq) INTO v_rows
    FROM teams t LEFT JOIN brokers b ON b.id = t.broker_id LEFT JOIN app_users u ON u.team_id = t.id AND u.role = 'PARTICIPANT';
  ELSIF v_sheet = 'broker_roster' THEN
    v_cols := '["Broker Code","Broker Name","Contact","Desk","Teams assigned","Team codes","Broker login"]';
    SELECT jsonb_agg(jsonb_build_array(b.code, b.name, b.contact, b.desk, (SELECT count(*) FROM teams t WHERE t.broker_id = b.id),
             (SELECT string_agg(t.code || ' ' || t.name, ', ' ORDER BY t.seq) FROM teams t WHERE t.broker_id = b.id),
             (SELECT string_agg(u.username, ', ') FROM app_users u WHERE u.role = 'BROKER' AND u.broker_id = b.id)) ORDER BY b.code) INTO v_rows
    FROM brokers b;
  ELSIF v_sheet = 'brokers' THEN
    v_cols := '["Rank","Broker","Name","Teams","Orders","Buy orders","Sell orders","Buy value","Sell value","Total trade value","Brokerage earned"]';
    SELECT jsonb_agg(jsonb_build_array((x->>'rank')::integer, x->>'broker', x->>'name', (x->>'teams')::integer, (x->>'orders')::integer, (x->>'buy_orders')::integer,
             (x->>'sell_orders')::integer, (x->>'buy_volume')::numeric, (x->>'sell_volume')::numeric, (x->>'total_trade_value')::numeric, (x->>'brokerage_earned')::numeric)
           ORDER BY (x->>'rank')::integer) INTO v_rows FROM jsonb_array_elements(jse_commissions(a, '{"page_size":10}'::jsonb)->'brokers') x;
  ELSIF v_sheet = 'cash' THEN
    v_cols := '["Team","Team name","Liquid Cash","Realised P/L","Profit Cash Exempt","Base Cash Counted","Cash Limit","Closing cash rule","Loan Liability"]';
    SELECT jsonb_agg(jsonb_build_array(code, name, cash, realized_pnl, profit_cash_exempt, base_cash_counted, cash_rule_limit,
             cash_rule_status, loan_liability) ORDER BY seq) INTO v_rows FROM jse_team_metrics;
  ELSIF v_sheet = 'holdings' THEN
    v_cols := '["Team","Team name","Security","Name","Type","Quantity","Average Price","Cost incl. brokerage","Current Price","Market Value","Unrealised P/L"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, t.name, s.symbol, s.name, CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, h.quantity,
             round(h.trade_cost / nullif(h.quantity, 0), 2), round(h.cost_basis, 2), s.price, h.quantity * s.price, round(h.quantity * s.price - h.cost_basis, 2))
           ORDER BY t.seq, s.display_order) INTO v_rows
    FROM holdings h JOIN teams t ON t.id = h.team_id JOIN securities s ON s.id = h.security_id WHERE h.quantity > 0;
  ELSIF v_sheet IN ('sold_stocks', 'sold_ipos') THEN
    v_cols := '["Team","Security","Name","Type","Quantity","Sell Price","Trade Value","Brokerage","Net Proceeds","Realised P/L","Counterparty","Timestamp","Order ID"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, s.symbol, s.name, CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, st.quantity, st.price, st.trade_value,
             st.brokerage, st.trade_value - st.brokerage, st.realized_pnl, CASE WHEN st.account_type = 'INSTITUTION' THEN 'Institution' ELSE 'Market' END,
             st.settled_at, o.order_no) ORDER BY st.settled_at) INTO v_rows
    FROM settlements st JOIN teams t ON t.id = st.team_id JOIN securities s ON s.id = st.security_id JOIN orders o ON o.id = st.order_id
    WHERE st.reversed_at IS NULL AND ((st.account_type = 'TEAM' AND st.side = 'SELL') OR (st.account_type = 'INSTITUTION' AND st.side = 'BUY'))
      AND s.kind = CASE WHEN v_sheet = 'sold_ipos' THEN 'IPO' ELSE 'EQUITY' END;
  ELSIF v_sheet = 'networth' THEN
    v_cols := '["Rank","Team","Team name","Broker","Liquid Cash","Holdings Value","Net Worth","P/L","Return %","Realised P/L","Unrealised P/L","Brokerage Paid","Loan Original","Loan Principal","Interest Outstanding","Interest Paid","Closing cash rule","Portfolio Access","Eligibility","Short Sell Attempts","Cash Shortfall Attempts","Insufficient Balance Rejections"]';
    SELECT jsonb_agg(jsonb_build_array(rank_overall, m->>'code', m->>'name', m->>'broker', (m->>'cash')::numeric, (m->>'holdings_value')::numeric,
             (m->>'net_worth')::numeric, (m->>'pnl')::numeric, round((m->>'return_pct')::numeric, 2), (m->>'realized_pnl')::numeric,
             (m->>'unrealized_pnl')::numeric, (m->>'brokerage_paid')::numeric, (m->>'loan_original')::numeric, (m->>'loan_principal')::numeric,
             (m->>'loan_interest')::numeric, (m->>'loan_interest_paid')::numeric, m->>'cash_rule_status', m->>'portfolio_access', m->>'eligibility_status',
             (m->>'short_sell_attempts')::integer, (m->>'cash_shortfall_attempts')::integer, (m->>'insufficient_balance_rejections')::integer)
           ORDER BY rank_overall) INTO v_rows FROM jse_ranked_teams();
  ELSIF v_sheet = 'loans' THEN
    v_cols := '["Team","Original Principal","Current Principal","Interest Outstanding","Interest Charged","Interest Paid","Principal Repaid","Total Liability","Draws","Status"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, l.original_principal, l.principal_outstanding, l.interest_outstanding, l.interest_charged, l.interest_paid,
             l.principal_repaid, l.principal_outstanding + l.interest_outstanding, l.draws, l.status) ORDER BY t.seq) INTO v_rows
    FROM loans l JOIN teams t ON t.id = l.team_id;
  ELSIF v_sheet = 'cash_rule' THEN
    v_cols := '["Team","Liquid Cash","Profit Cash Exempt","Base Cash Counted","Cash Limit","Rule met now","Closing cash rule","Portfolio Access","Eligible"]';
    SELECT jsonb_agg(jsonb_build_array(code, cash, profit_cash_exempt, base_cash_counted, cash_rule_limit,
             CASE WHEN cash_rule_met THEN 'YES' ELSE 'NO' END, cash_rule_status, portfolio_access, eligible) ORDER BY seq) INTO v_rows
    FROM jse_team_metrics;
  ELSIF v_sheet IN ('short_sell', 'cash_shortfall', 'insufficient_balance') THEN
    v_cols := '["Timestamp","Team","Order ID","Security","Side","Quantity","Holding Before","Required Cash","Available Cash","Shortage","Stage","Order Status","Note"]';
    SELECT jsonb_agg(jsonb_build_array(r.created_at, t.code, o.order_no, s.symbol, r.side, r.quantity, r.holding_before, r.required_amount, r.available_cash,
             r.shortage, r.stage, o.status, r.note) ORDER BY r.created_at) INTO v_rows
    FROM risk_events r JOIN teams t ON t.id = r.team_id LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN securities s ON s.id = r.security_id
    WHERE r.kind = CASE v_sheet WHEN 'short_sell' THEN 'SHORT_SELL_ATTEMPT' WHEN 'cash_shortfall' THEN 'CASH_SHORTFALL_ATTEMPT' ELSE 'INSUFFICIENT_BALANCE_REJECTION' END;
  ELSIF v_sheet IN ('orders', 'rejected') THEN
    v_cols := '["Order ID","Account","Team","Team name","Broker","Institution","Instruction","Security","Type","Side","Quantity","Price","Trade Value","Brokerage %","Brokerage","Settlement Amount","Status","Stage","Reject Code","Reject Reason","Short Sell Flag","Cash Shortfall Flag","Submitted By","Submitted At","Executed By","Executed At","Slip No","Exchange By","Exchange At","Bank By","Bank At"]';
    SELECT jsonb_agg(jsonb_build_array(o.order_no, o.account_type, t.code, t.name, b.code, i.code, ins.instruction_no, s.symbol, CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, o.side,
             o.quantity, o.price, o.trade_value, round(coalesce(o.brokerage_rate, 0) * 100, 4), o.brokerage, o.settlement_amount, o.status, jse_stage_label(o.status, o.reject_code),
             o.reject_code, o.reject_reason, o.short_sell_flag, o.cash_shortfall_flag, o.created_by_name, o.created_at, o.executed_by_name, o.executed_at, sl.slip_no,
             o.exchange_by_name, o.exchange_at, o.bank_by_name, o.bank_at) ORDER BY o.id) INTO v_rows
    FROM orders o JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id LEFT JOIN brokers b ON b.id = o.broker_id
    LEFT JOIN institutions i ON i.id = o.institution_id LEFT JOIN instructions ins ON ins.id = o.instruction_id LEFT JOIN trading_slips sl ON sl.order_id = o.id
    WHERE v_sheet = 'orders' OR o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED');
  ELSIF v_sheet = 'slips' THEN
    v_cols := '["Slip No","Order ID","Executed At","Team","Team name","Broker","Broker name","Institution","Security","Name","Asset type","Side","Quantity","Execution Price","Trade Value","Brokerage %","Brokerage","Settlement Value","Pit Manager","Exchange","Bank","Status"]';
    SELECT jsonb_agg(jsonb_build_array(x->>'slip_no', x->>'order_no', x->>'executed_at', x->>'team', x->>'team_name', x->>'broker', x->>'broker_name', x->>'institution',
             x->>'symbol', x->>'security', x->>'asset_type', x->>'side', (x->>'quantity')::integer, (x->>'price')::numeric, (x->>'trade_value')::numeric,
             round(coalesce((x->>'brokerage_rate')::numeric, 0) * 100, 4), (x->>'brokerage')::numeric, (x->>'settlement_value')::numeric, x->>'executed_by',
             x->>'exchange_status', x->>'bank_status', x->>'stage') ORDER BY x->>'slip_no') INTO v_rows
    FROM (SELECT jse_slip_json(sl) AS x FROM trading_slips sl) q;
  ELSIF v_sheet = 'instructions' THEN
    v_cols := '["Instruction","Created At","Team","Team name","Broker","Security","Side","Quantity","Price seen","Note","Status","Order","Order status","Handled At","Handled By","Decline reason"]';
    SELECT jsonb_agg(jsonb_build_array(i.instruction_no, i.created_at, t.code, t.name, b.code, s.symbol, i.side, i.quantity, i.price_seen, i.note, i.status,
             o.order_no, o.status, i.handled_at, i.handled_by_name, i.decline_reason) ORDER BY i.id) INTO v_rows
    FROM instructions i JOIN teams t ON t.id = i.team_id JOIN securities s ON s.id = i.security_id LEFT JOIN brokers b ON b.id = i.broker_id LEFT JOIN orders o ON o.id = i.order_id;
  ELSIF v_sheet = 'trades' THEN
    v_cols := '["Settled At","Order ID","Account","Team","Institution","Security","Side","Quantity","Price","Trade Value","Brokerage","Team Cash Before","Team Cash After","Holding Before","Holding After","Loan Drawn","Loan Interest","Market Price","Realised P/L","Settled By"]';
    SELECT jsonb_agg(jsonb_build_array(st.settled_at, o.order_no, st.account_type, t.code, i.code, s.symbol, st.side, st.quantity, st.price, st.trade_value,
             st.brokerage, st.team_cash_before, st.team_cash_after, st.holding_before, st.holding_after, st.loan_drawn, st.loan_interest, st.price_before,
             st.realized_pnl, st.settled_by_name) ORDER BY st.id) INTO v_rows
    FROM settlements st JOIN orders o ON o.id = st.order_id JOIN teams t ON t.id = st.team_id JOIN securities s ON s.id = st.security_id
    LEFT JOIN institutions i ON i.id = st.institution_id WHERE st.reversed_at IS NULL;
  ELSIF v_sheet = 'ledger' THEN
    v_cols := '["Timestamp","Team","Order ID","Type","Debit","Credit","Balance After","Notes","Actor"]';
    SELECT jsonb_agg(jsonb_build_array(c.created_at, t.code, o.order_no, c.entry_type, c.debit, c.credit, c.balance_after, c.note, c.actor_name) ORDER BY c.id) INTO v_rows
    FROM cash_ledger c JOIN teams t ON t.id = c.team_id LEFT JOIN orders o ON o.id = c.order_id;
  ELSIF v_sheet = 'commission' THEN
    v_cols := '["Date/time","Broker","Broker name","Order","Team","Team name","Security","Side","Quantity","Price","Trade value","Brokerage rate %","Commission","Status"]';
    SELECT jsonb_agg(jsonb_build_array(bc.created_at, b.code, b.name, o.order_no, t.code, t.name, s.symbol, bc.side, o.quantity, o.price, bc.trade_value,
             round(bc.rate * 100, 4), bc.amount, CASE WHEN bc.reversed_at IS NULL THEN 'SETTLED' ELSE 'REVERSED' END) ORDER BY bc.id) INTO v_rows
    FROM broker_commissions bc JOIN brokers b ON b.id = bc.broker_id JOIN teams t ON t.id = bc.team_id JOIN orders o ON o.id = bc.order_id
    JOIN securities s ON s.id = o.security_id;
  ELSIF v_sheet = 'institutional' THEN
    v_cols := '["Order ID","Institution","Counterparty Team","Security","Side","Quantity","Price","Trade Value","Status","Reject Reason","Submitted At","Executed At","Slip No","Bank At"]';
    SELECT jsonb_agg(jsonb_build_array(o.order_no, i.code, t.code, s.symbol, o.side, o.quantity, o.price, o.trade_value, o.status, o.reject_reason, o.created_at,
             o.executed_at, sl.slip_no, o.bank_at) ORDER BY o.id) INTO v_rows
    FROM orders o JOIN institutions i ON i.id = o.institution_id JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
    LEFT JOIN trading_slips sl ON sl.order_id = o.id;
  ELSIF v_sheet = 'ipo_applications' THEN
    v_cols := '["Team","IPO","Lots","Shares","Amount","Team name","IPO code","IPO name","Status","Updated At"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, s.symbol, ap.lots, ap.quantity, ap.amount, t.name, s.ipo_code, s.name, ap.status, ap.updated_at) ORDER BY t.seq, s.display_order) INTO v_rows
    FROM ipo_applications ap JOIN teams t ON t.id = ap.team_id JOIN securities s ON s.id = ap.security_id;
  ELSIF v_sheet = 'ipo_allotments' THEN
    v_cols := '["Team","IPO","Lots","Shares","Amount","Team name","IPO code","IPO name","Issue Price","Batch","Loaded At","Reversed"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, s.symbol, al.lots, al.quantity, al.amount, t.name, s.ipo_code, s.name, al.price, al.batch_id, al.created_at,
             al.reversed_at IS NOT NULL) ORDER BY t.seq, s.display_order, al.id) INTO v_rows
    FROM ipo_allotments al JOIN teams t ON t.id = al.team_id JOIN securities s ON s.id = al.security_id;
  ELSIF v_sheet = 'news' THEN
    v_cols := '["Timestamp","Company","Symbol","Severity","Headline","Requested %","Applied %","Previous Price","New Price","Reversed","Published By"]';
    SELECT jsonb_agg(jsonb_build_array(n.created_at, s.name, s.symbol, replace(n.mood, '_', ' '), n.headline, n.requested_pct, round(n.applied_pct, 2), n.previous_price,
             n.new_price, n.reversed_at IS NOT NULL, n.created_by_name) ORDER BY n.id) INTO v_rows
    FROM market_news n JOIN securities s ON s.id = n.security_id;
  ELSIF v_sheet = 'prices' THEN
    v_cols := '["Timestamp","Security","Source","Previous Price","New Price","Change %","News ID"]';
    SELECT jsonb_agg(jsonb_build_array(ph.created_at, s.symbol, ph.source, ph.previous_price, ph.new_price, round(ph.change_pct, 2), ph.news_id) ORDER BY ph.id) INTO v_rows
    FROM price_history ph JOIN securities s ON s.id = ph.security_id;
  ELSIF v_sheet = 'journal' THEN
    v_cols := '["ID","Timestamp","Action","Summary","Actor","State","Undone At","Undone By","Redone At","Redone By"]';
    SELECT jsonb_agg(jsonb_build_array(j.id, j.created_at, j.action, j.summary, j.actor_name,
             CASE WHEN coalesce((j.payload->>'superseded')::boolean, false) THEN 'REDONE'
                  WHEN j.undone_at IS NOT NULL AND (j.redone_at IS NULL OR j.redone_at < j.undone_at) THEN 'UNDONE' ELSE 'ACTIVE' END,
             j.undone_at, j.undone_by, j.redone_at, j.redone_by) ORDER BY j.id) INTO v_rows
    FROM action_journal j;
  ELSIF v_sheet = 'audit' THEN
    v_cols := '["Timestamp","User","Email","Role","Action","Entity","Entity ID","Team","Order ID","Before","After","Details","IP"]';
    SELECT jsonb_agg(jsonb_build_array(al.created_at, al.actor_username, al.actor_email, al.actor_role, al.action, al.entity, al.entity_id, t.code, o.order_no,
             al.before_state::text, al.after_state::text, al.details::text, al.ip) ORDER BY al.id) INTO v_rows
    FROM audit_log al LEFT JOIN teams t ON t.id = al.team_id LEFT JOIN orders o ON o.id = al.order_id;
  ELSE
    PERFORM jse_fail('UNKNOWN_SHEET', 'Unknown export sheet.', 404);
  END IF;
  RETURN jsonb_build_object('success', true, 'sheet', v_sheet,
    'title', (SELECT x->>1 FROM jsonb_array_elements(jse_export_sheets()) x WHERE x->>0 = v_sheet),
    'columns', v_cols, 'rows', coalesce(v_rows, '[]'::jsonb));
END $$;

INSERT INTO schema_migrations(version) VALUES ('005_exports');
`;var za=`-- JAIN STOCK EXCHANGE (JSE) v311
-- 006_seed.sql: event configuration, 10 brokers, 100 teams, 50 stocks, 4 IPOs, the institutional
-- account and staff / participant accounts (fresh installs; 008_v311 brings older databases to the same state). Idempotent. Accounts start with random unknown passwords;
-- the administrator issues real passwords with jse_admin_users(RESET_ROLE_PASSWORDS).

INSERT INTO event_config(id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO event_control(id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO brokers(code, name)
SELECT 'BROKER-' || lpad(n::text, 2, '0'), 'Broker ' || lpad(n::text, 2, '0') FROM generate_series(1, 10) n
ON CONFLICT (code) DO NOTHING;

INSERT INTO teams(code, name, broker_id, cash)
SELECT 'TEAM-' || lpad(n::text, 3, '0'), 'Team ' || lpad(n::text, 3, '0'),
       (SELECT id FROM brokers WHERE code = 'BROKER-' || lpad((((n - 1) % 10) + 1)::text, 2, '0')),
       (SELECT initial_capital FROM event_config WHERE id = 1)
FROM generate_series(1, 100) n
ON CONFLICT (code) DO NOTHING;

INSERT INTO loans(team_id) SELECT id FROM teams ON CONFLICT (team_id) DO NOTHING;

INSERT INTO institutions(code, name, initial_cash, cash)
SELECT 'INST-01', 'JSE Institutional Investors', institutional_cash, institutional_cash FROM event_config WHERE id = 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO securities(kind, symbol, ipo_code, name, sector, base_price, price, previous_price, lot_size, display_order) VALUES
  ('IPO', 'VOLTRA',  'IPO-01', 'Voltra Motors Ltd',          'Electric Vehicles', 890, 890, 890, 50, 1),
  ('IPO', 'BLUEAI',  'IPO-02', 'Blue Orbit AI Ltd',          'Technology',        780, 780, 780, 50, 2),
  ('IPO', 'SHREEB',  'IPO-03', 'Shreebuild Industries Ltd',  'Infrastructure',    620, 620, 620, 50, 3),
  ('IPO', 'AAROGYA', 'IPO-04', 'Aarogya Lifesciences Ltd',   'Healthcare',        710, 710, 710, 50, 4)
ON CONFLICT (symbol) DO NOTHING;

INSERT INTO securities(kind, symbol, name, base_price, price, previous_price, index_base_price, lot_size, display_order)
SELECT 'EQUITY', v.sym, v.nm, v.px, v.px, v.px, v.px, 50, v.ord FROM (VALUES
  ('RELIANCE','Reliance Industries',2890,10),('HDFCBANK','HDFC Bank',719,11),('ICICIBANK','ICICI Bank',1172,12),('INFY','Infosys',900,13),
  ('TCS','TCS',1864,14),('BHARTIARTL','Bharti Airtel',1850,15),('LT','Larsen & Toubro',2898,16),('AXISBANK','Axis Bank',1089,17),
  ('KOTAKBANK','Kotak Mahindra Bank',402,18),('SBIN','SBI',962,19),('BAJFINANCE','Bajaj Finance',984,20),('MARUTI','Maruti Suzuki',13200,21),
  ('M_M','Mahindra & Mahindra',2426,22),('TITAN','Titan',3499,23),('ASIANPAINT','Asian Paints',1960,24),('ULTRACEMCO','UltraTech Cement',4977,25),
  ('SUNPHARMA','Sun Pharma',1654,26),('NTPC','NTPC',321,27),('POWERGRID','Power Grid',262,28),('TATAMOTORS','Tata Motors',793,29),
  ('ADANIPORTS','Adani Ports',1450,30),('ADANIENT','Adani Enterprises',2290,31),('JSWSTEEL','JSW Steel',1137,32),('HCLTECH','HCL Technologies',1126,33),
  ('TECHM','Tech Mahindra',1388,34),('NESTLEIND','Nestl\xE9 India',2300,35),('HINDUNILVR','Hindustan Unilever',1706,36),('WIPRO','Wipro',320,37),
  ('ITC','ITC',265,38),('ONGC','ONGC',231,39),('COALINDIA','Coal India',400,40),('BAJAJ-AUTO','Bajaj Auto',5050,41),
  ('CIPLA','Cipla',1246,42),('DRREDDY','Dr. Reddy''s',6200,43),('INDUSINDBK','IndusInd Bank',910,44),('TATASTEEL','Tata Steel',179,45),
  ('EICHERMOT','Eicher Motors',4480,46),('APOLLOHOSP','Apollo Hospitals',6700,47),('TRENT','Trent',2128,48),('BEL','BEL',400,49),
  ('BHARATFORG','Bharat Forge',1124,50),('DLF','DLF',800,51),('GRASIM','Grasim',2420,52),('DIVISLAB','Divi''s Laboratories',3499,53),
  ('SIEMENS','Siemens India',3599,54),('PIDILITE','Pidilite Industries',3600,55),('SHRIRAMFIN','Shriram Finance',976,56),('HINDALCO','Hindalco',956,57),
  ('ETERNAL','Zomato (Eternal)',331,58),('INDIGO','InterGlobe Aviation',4800,59)
) AS v(sym, nm, px, ord)
ON CONFLICT (symbol) DO NOTHING;

-- opening ledger entries (only once)
INSERT INTO cash_ledger(team_id, entry_type, credit, balance_after, note, actor_name)
SELECT t.id, 'INITIAL_CAPITAL', t.cash, t.cash, 'Initial event capital', 'system' FROM teams t
WHERE NOT EXISTS (SELECT 1 FROM cash_ledger c WHERE c.team_id = t.id);
INSERT INTO institution_ledger(institution_id, entry_type, credit, balance_after, note, actor_name)
SELECT i.id, 'INITIAL_CAPITAL', i.cash, i.cash, 'Initial institutional cash', 'system' FROM institutions i
WHERE NOT EXISTS (SELECT 1 FROM institution_ledger l WHERE l.institution_id = i.id);

-- accounts (random unknown passwords until the administrator issues credentials)
INSERT INTO app_users(username, display_name, role, password_hash)
SELECT v.u, v.n, v.r, crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6)) FROM (VALUES
  ('ADMIN', 'Event Administrator', 'ADMIN'), ('ASSOC-ADMIN', 'Associate Administrator', 'ADMIN'),
  ('FACULTY-01', 'Faculty Viewer 01', 'VIEWER'), ('FACULTY-02', 'Faculty Viewer 02', 'VIEWER')
) AS v(u, n, r)
ON CONFLICT (lower(username)) DO NOTHING;

-- broker desks (one login per broker) and the Pit Managers who execute broker-submitted orders
INSERT INTO app_users(username, display_name, role, broker_id, password_hash)
SELECT 'BROKER-' || lpad(n::text, 2, '0'), 'Broker ' || lpad(n::text, 2, '0'), 'BROKER',
       (SELECT id FROM brokers WHERE code = 'BROKER-' || lpad(n::text, 2, '0')), crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6))
FROM generate_series(1, 10) n
ON CONFLICT (lower(username)) DO NOTHING;
INSERT INTO app_users(username, display_name, role, password_hash)
SELECT 'PIT-' || lpad(n::text, 2, '0'), 'Pit Manager ' || lpad(n::text, 2, '0'), 'PIT_MANAGER', crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6))
FROM generate_series(1, 10) n
ON CONFLICT (lower(username)) DO NOTHING;

INSERT INTO app_users(username, display_name, role, password_hash)
SELECT r || '-' || lpad(n::text, 2, '0'), initcap(r) || ' Desk ' || lpad(n::text, 2, '0'), r, crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6))
FROM generate_series(1, 4) n, (VALUES ('EXCHANGE'), ('BANK')) AS x(r)
ON CONFLICT (lower(username)) DO NOTHING;

INSERT INTO app_users(username, display_name, role, institution_id, password_hash)
SELECT 'INST-' || lpad(n::text, 2, '0'), 'Institutional Investor ' || lpad(n::text, 2, '0'), 'INSTITUTIONAL',
       (SELECT id FROM institutions WHERE code = 'INST-01'), crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6))
FROM generate_series(1, 4) n
ON CONFLICT (lower(username)) DO NOTHING;

INSERT INTO app_users(username, display_name, role, team_id, password_hash)
SELECT t.code, t.name, 'PARTICIPANT', t.id, crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6)) FROM teams t
ON CONFLICT (lower(username)) DO NOTHING;

INSERT INTO schema_migrations(version) VALUES ('006_seed');
`;var Qa=`-- JAIN STOCK EXCHANGE (JSE) v311
-- 007_tuning.sql: safety timeouts for this database (re-applicable).
DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I SET statement_timeout = %L', current_database(), '20s');
  EXECUTE format('ALTER DATABASE %I SET idle_in_transaction_session_timeout = %L', current_database(), '60s');
  EXECUTE format('ALTER DATABASE %I SET lock_timeout = %L', current_database(), '10s');
END $$;
ANALYZE;
`;var Za=`-- JAIN STOCK EXCHANGE (JSE) v311
-- 008_v311.sql: brings any database to the v311 operating model (idempotent \u2014 safe to re-run).
--   * broker desks log in as BROKER-01\u202610; PIT-01\u202610 become dedicated Pit Manager accounts
--   * IPO identity (IPO-01\u202604) and sector labels; CMS INDEX bases; one prospectus record per IPO
--   * the curated Indian Knowledge System team-name pool and the first reproducible name assignment
--   * v311 rule values (applied once): \u20B925,00,000 maximum order, \u20B90 minimum order, no minimum cash buffer

-- ---------------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------------
UPDATE app_users u SET username = 'BROKER-' || substring(u.username from 5), display_name = coalesce(b.name, 'Broker ' || substring(u.username from 5)), updated_at = now()
FROM brokers b
WHERE u.role = 'BROKER' AND u.username ~ '^PIT-[0-9]{2}$' AND b.id = u.broker_id
  AND NOT EXISTS (SELECT 1 FROM app_users x WHERE lower(x.username) = lower('BROKER-' || substring(u.username from 5)));

INSERT INTO app_users(username, display_name, role, password_hash)
SELECT 'PIT-' || lpad(n::text, 2, '0'), 'Pit Manager ' || lpad(n::text, 2, '0'), 'PIT_MANAGER', crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6))
FROM generate_series(1, 10) n
ON CONFLICT (lower(username)) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Securities: IPO identity (v311 baseline), sector labels, CMS INDEX base prices
-- ---------------------------------------------------------------------------
UPDATE securities SET ipo_code = v.code, name = v.nm
FROM (VALUES ('VOLTRA', 'IPO-01', 'Voltra Motors Ltd'), ('BLUEAI', 'IPO-02', 'Blue Orbit AI Ltd'),
             ('SHREEB', 'IPO-03', 'Shreebuild Industries Ltd'), ('AAROGYA', 'IPO-04', 'Aarogya Lifesciences Ltd')) AS v(sym, code, nm)
WHERE securities.symbol = v.sym AND securities.kind = 'IPO' AND securities.ipo_code IS NULL;

UPDATE securities SET sector = v.sector
FROM (VALUES
  ('RELIANCE','Energy'),('HDFCBANK','Banking'),('ICICIBANK','Banking'),('INFY','Information Technology'),('TCS','Information Technology'),
  ('BHARTIARTL','Telecom'),('LT','Infrastructure'),('AXISBANK','Banking'),('KOTAKBANK','Banking'),('SBIN','Banking'),
  ('BAJFINANCE','Financial Services'),('MARUTI','Automobile'),('M_M','Automobile'),('TITAN','Consumer Durables'),('ASIANPAINT','Paints & Chemicals'),
  ('ULTRACEMCO','Cement & Materials'),('SUNPHARMA','Pharmaceuticals'),('NTPC','Power'),('POWERGRID','Power'),('TATAMOTORS','Automobile'),
  ('ADANIPORTS','Infrastructure'),('ADANIENT','Diversified'),('JSWSTEEL','Metals'),('HCLTECH','Information Technology'),('TECHM','Information Technology'),
  ('NESTLEIND','FMCG'),('HINDUNILVR','FMCG'),('WIPRO','Information Technology'),('ITC','FMCG'),('ONGC','Energy'),
  ('COALINDIA','Energy'),('BAJAJ-AUTO','Automobile'),('CIPLA','Pharmaceuticals'),('DRREDDY','Pharmaceuticals'),('INDUSINDBK','Banking'),
  ('TATASTEEL','Metals'),('EICHERMOT','Automobile'),('APOLLOHOSP','Healthcare'),('TRENT','Retail'),('BEL','Defence'),
  ('BHARATFORG','Capital Goods'),('DLF','Real Estate'),('GRASIM','Cement & Materials'),('DIVISLAB','Pharmaceuticals'),('SIEMENS','Capital Goods'),
  ('PIDILITE','Paints & Chemicals'),('SHRIRAMFIN','Financial Services'),('HINDALCO','Metals'),('ETERNAL','Internet & Consumer Tech'),('INDIGO','Aviation')
) AS v(sym, sector)
WHERE securities.symbol = v.sym AND securities.kind = 'EQUITY' AND securities.sector IS NULL;

UPDATE securities SET index_base_price = base_price WHERE kind = 'EQUITY' AND index_base_price IS NULL;
UPDATE securities SET index_base_price = coalesce(listing_price, price) WHERE kind = 'IPO' AND listed_at IS NOT NULL AND index_base_price IS NULL;
UPDATE securities SET index_base_price = NULL WHERE kind = 'IPO' AND listed_at IS NULL AND index_base_price IS NOT NULL;

INSERT INTO ipo_prospectus(security_id) SELECT id FROM securities WHERE kind = 'IPO' ON CONFLICT (security_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Curated Indian Knowledge System team-name pool (122 unique names)
-- ---------------------------------------------------------------------------
INSERT INTO team_name_pool(name, category, meaning) VALUES
  ('Aryabhata', 'Mathematics & Astronomy', '5th-century mathematician-astronomer, author of the Aryabhatiya'),
  ('Brahmagupta', 'Mathematics & Astronomy', '7th-century mathematician who set out rules for computing with zero'),
  ('Bhaskaracharya', 'Mathematics & Astronomy', '12th-century mathematician-astronomer, author of Lilavati and Siddhanta Shiromani'),
  ('Varahamihira', 'Mathematics & Astronomy', '6th-century astronomer, author of the Pancha Siddhantika'),
  ('Madhava', 'Mathematics & Astronomy', '14th-century founder of the Kerala school, pioneer of infinite series'),
  ('Nilakantha', 'Mathematics & Astronomy', 'Nilakantha Somayaji, Kerala astronomer and author of the Tantrasangraha'),
  ('Baudhayana', 'Mathematics & Astronomy', 'Author of the Baudhayana Shulba Sutra on geometry'),
  ('Apastamba', 'Mathematics & Astronomy', 'Author of a Shulba Sutra on geometric constructions'),
  ('Pingala', 'Mathematics & Astronomy', 'Ancient prosodist whose Chandahshastra used binary-like patterns'),
  ('Mahaviracharya', 'Mathematics & Astronomy', '9th-century mathematician, author of the Ganita Sara Sangraha'),
  ('Sridhara', 'Mathematics & Astronomy', 'Mathematician, author of the Patiganita and the Trishatika'),
  ('Lalla', 'Mathematics & Astronomy', '8th-century astronomer, author of the Shishyadhivriddhida'),
  ('Jyeshthadeva', 'Mathematics & Astronomy', 'Kerala-school author of the Yuktibhasha, a book of mathematical rationale'),
  ('Parameshvara', 'Mathematics & Astronomy', 'Kerala-school astronomer who devised the Drigganita system'),
  ('Achyuta Pisharati', 'Mathematics & Astronomy', '16th\u201317th-century astronomer of the Kerala school'),
  ('Shankara Variyar', 'Mathematics & Astronomy', 'Kerala-school mathematician and commentator'),
  ('Virahanka', 'Mathematics & Astronomy', 'Prosodist who described the number sequence later called Fibonacci numbers'),
  ('Halayudha', 'Mathematics & Astronomy', '10th-century commentator on Pingala who described the Meru Prastara'),
  ('Vateshvara', 'Mathematics & Astronomy', '10th-century astronomer, author of the Vateshvara Siddhanta'),
  ('Munjala', 'Mathematics & Astronomy', '10th-century astronomer, author of the Laghumanasa'),
  ('Sripati', 'Mathematics & Astronomy', '11th-century astronomer-mathematician, author of the Siddhanta Shekhara'),
  ('Narayana Pandita', 'Mathematics & Astronomy', '14th-century mathematician, author of the Ganita Kaumudi'),
  ('Kamalakara', 'Mathematics & Astronomy', '17th-century astronomer, author of the Siddhanta Tattva Viveka'),
  ('Jagannatha Samrat', 'Mathematics & Astronomy', '18th-century astronomer at Jaipur, author of the Samrat Siddhanta'),
  ('Jantar Mantar', 'Mathematics & Astronomy', 'The 18th-century astronomical observatories built by Sawai Jai Singh II'),
  ('Hemachandra', 'Mathematics & Astronomy', '12th-century polymath who also described the Fibonacci-type sequence'),
  ('Charaka', 'Medicine & Life Sciences', 'Physician of the Charaka Samhita, a foundational text of Ayurveda'),
  ('Sushruta', 'Medicine & Life Sciences', 'Physician-surgeon of the Sushruta Samhita on surgery'),
  ('Vagbhata', 'Medicine & Life Sciences', 'Author of the Ashtanga Hridaya, a classic of Ayurveda'),
  ('Jivaka', 'Medicine & Life Sciences', 'Renowned physician of ancient India'),
  ('Ayurveda', 'Medicine & Life Sciences', 'The traditional Indian science of life and health'),
  ('Panini', 'Language & Grammar', 'Grammarian, author of the Ashtadhyayi'),
  ('Patanjali', 'Language & Grammar', 'Author of the Mahabhashya on grammar and of the Yoga Sutras'),
  ('Yaska', 'Language & Grammar', 'Author of the Nirukta, the classical study of etymology'),
  ('Bhartrihari', 'Language & Grammar', 'Philosopher of language, author of the Vakyapadiya'),
  ('Tolkappiyar', 'Language & Grammar', 'Author of the Tolkappiyam, the earliest Tamil grammar'),
  ('Kanada', 'Philosophy & Logic', 'Founder of the Vaisheshika school and its atomic theory'),
  ('Akshapada', 'Philosophy & Logic', 'Akshapada Gautama, author of the Nyaya Sutras on logic'),
  ('Kapila', 'Philosophy & Logic', 'Founder of the Samkhya school of philosophy'),
  ('Jaimini', 'Philosophy & Logic', 'Author of the Mimamsa Sutras'),
  ('Badarayana', 'Philosophy & Logic', 'Author of the Brahma Sutras'),
  ('Nagarjuna', 'Philosophy & Logic', '2nd-century philosopher of the Madhyamaka school'),
  ('Aryadeva', 'Philosophy & Logic', 'Philosopher and student of Nagarjuna'),
  ('Vasubandhu', 'Philosophy & Logic', '4th\u20135th-century philosopher and logician'),
  ('Dignaga', 'Philosophy & Logic', 'Founder of the Buddhist tradition of logic and epistemology'),
  ('Dharmakirti', 'Philosophy & Logic', '7th-century logician and philosopher'),
  ('Shantarakshita', 'Philosophy & Logic', '8th-century philosopher and scholar of Nalanda'),
  ('Nyaya', 'Philosophy & Logic', 'The school of logic and valid reasoning'),
  ('Vaisheshika', 'Philosophy & Logic', 'The school of natural philosophy and atomism'),
  ('Samkhya', 'Philosophy & Logic', 'The enumerative school of philosophy'),
  ('Mimamsa', 'Philosophy & Logic', 'The school of exegesis and interpretation'),
  ('Anvikshiki', 'Philosophy & Logic', 'The science of inquiry, as named in the Arthashastra'),
  ('Tarka', 'Philosophy & Logic', 'Reasoning and argumentation'),
  ('Pramana', 'Philosophy & Logic', 'The means of valid knowledge'),
  ('Kautilya', 'Economics & Statecraft', 'Author of the Arthashastra on economics and statecraft'),
  ('Arthashastra', 'Economics & Statecraft', 'The classical treatise on economics, administration and statecraft'),
  ('Kamandaka', 'Economics & Statecraft', 'Author of the Nitisara on polity'),
  ('Vidura', 'Economics & Statecraft', 'Counsellor known for the Vidura Niti on ethics and governance'),
  ('Thiruvalluvar', 'Economics & Statecraft', 'Poet-philosopher, author of the Thirukkural'),
  ('Gargi', 'Women Scholars', 'Gargi Vachaknavi, philosopher of the Upanishadic debates'),
  ('Maitreyi', 'Women Scholars', 'Philosopher in the Brihadaranyaka Upanishad'),
  ('Lopamudra', 'Women Scholars', 'Seer-poet of the Rigveda'),
  ('Ghosha', 'Women Scholars', 'Seer-poet of the Rigveda'),
  ('Apala', 'Women Scholars', 'Seer-poet of the Rigveda'),
  ('Avvaiyar', 'Women Scholars', 'Celebrated Tamil poet and philosopher'),
  ('Khana', 'Women Scholars', 'Legendary poet of agricultural and astronomical sayings (Khanar Vachan)'),
  ('Ubhaya Bharati', 'Women Scholars', 'Scholar who judged the celebrated Shankara\u2013Mandana debate'),
  ('Natyashastra', 'Arts, Music & Architecture', 'Bharata''s treatise on drama, dance and music'),
  ('Sangita', 'Arts, Music & Architecture', 'Music, as codified in the Sangita Ratnakara'),
  ('Sharngadeva', 'Arts, Music & Architecture', '13th-century author of the Sangita Ratnakara'),
  ('Matanga', 'Arts, Music & Architecture', 'Author of the Brihaddeshi on music'),
  ('Vastu', 'Arts, Music & Architecture', 'Vastu Shastra, the traditional science of architecture'),
  ('Shilpa', 'Arts, Music & Architecture', 'Shilpa Shastra, the science of arts and crafts'),
  ('Mayamata', 'Arts, Music & Architecture', 'Classical treatise on architecture and town planning'),
  ('Manasara', 'Arts, Music & Architecture', 'Classical treatise on architecture and sculpture'),
  ('Rasa', 'Arts, Music & Architecture', 'The aesthetic essence described in the Natyashastra'),
  ('Abhinavagupta', 'Arts, Music & Architecture', '10th\u201311th-century philosopher of aesthetics'),
  ('Kalidasa', 'Literature & Poetics', 'Classical poet and dramatist'),
  ('Banabhatta', 'Literature & Poetics', '7th-century author of the Harshacharita and Kadambari'),
  ('Dandin', 'Literature & Poetics', 'Author of the Kavyadarsha on poetics'),
  ('Bhamaha', 'Literature & Poetics', 'Early theorist of poetics, author of the Kavyalankara'),
  ('Anandavardhana', 'Literature & Poetics', '9th-century author of the Dhvanyaloka'),
  ('Panchatantra', 'Literature & Poetics', 'The classic collection of fables on practical wisdom'),
  ('Hitopadesha', 'Literature & Poetics', 'The classic book of fables on good counsel'),
  ('Takshashila', 'Centres of Learning', 'Ancient centre of learning in the north-west'),
  ('Nalanda', 'Centres of Learning', 'Ancient university in Bihar'),
  ('Vikramashila', 'Centres of Learning', 'Ancient university in Bihar'),
  ('Valabhi', 'Centres of Learning', 'Ancient centre of learning in Gujarat'),
  ('Odantapuri', 'Centres of Learning', 'Ancient university in Bihar'),
  ('Jagaddala', 'Centres of Learning', 'Ancient university in Bengal'),
  ('Somapura', 'Centres of Learning', 'Somapura Mahavihara, ancient centre of learning in Bengal'),
  ('Pushpagiri', 'Centres of Learning', 'Ancient university in Odisha'),
  ('Ujjayini', 'Centres of Learning', 'Astronomical centre whose meridian anchored classical Indian astronomy'),
  ('Kanchi', 'Centres of Learning', 'Kanchipuram, a historic centre of learning in Tamil Nadu'),
  ('Mithila', 'Centres of Learning', 'Historic centre of Nyaya learning'),
  ('Sharada Peetha', 'Centres of Learning', 'Historic centre of learning in Kashmir'),
  ('Shunya', 'Mathematical Concepts', 'Zero, as a number and as a place-holder'),
  ('Ananta', 'Mathematical Concepts', 'Infinity'),
  ('Ganita', 'Mathematical Concepts', 'Mathematics'),
  ('Bijaganita', 'Mathematical Concepts', 'Algebra'),
  ('Rekhaganita', 'Mathematical Concepts', 'Geometry'),
  ('Kuttaka', 'Mathematical Concepts', 'The pulveriser algorithm for indeterminate equations'),
  ('Chakravala', 'Mathematical Concepts', 'The cyclic method for quadratic indeterminate equations'),
  ('Jya', 'Mathematical Concepts', 'The sine function of Indian trigonometry'),
  ('Meru Prastara', 'Mathematical Concepts', 'The triangular number array known today as Pascal''s triangle'),
  ('Siddhanta', 'Mathematical Concepts', 'The genre of comprehensive astronomical treatises'),
  ('Karana', 'Mathematical Concepts', 'The genre of practical astronomical handbooks'),
  ('Yukti', 'Mathematical Concepts', 'Rationale and demonstration'),
  ('Shiksha', 'Vedangas & Disciplines', 'Phonetics, one of the six Vedangas'),
  ('Vyakarana', 'Vedangas & Disciplines', 'Grammar, one of the six Vedangas'),
  ('Nirukta', 'Vedangas & Disciplines', 'Etymology, one of the six Vedangas'),
  ('Chandas', 'Vedangas & Disciplines', 'Prosody, one of the six Vedangas'),
  ('Jyotisha', 'Vedangas & Disciplines', 'Astronomy and timekeeping, one of the six Vedangas'),
  ('Kalpa', 'Vedangas & Disciplines', 'Procedure manuals, one of the six Vedangas'),
  ('Prajna', 'Qualities of the Learner', 'Wisdom'),
  ('Medha', 'Qualities of the Learner', 'Intellect'),
  ('Viveka', 'Qualities of the Learner', 'Discernment'),
  ('Dhriti', 'Qualities of the Learner', 'Fortitude'),
  ('Sankalpa', 'Qualities of the Learner', 'Resolve'),
  ('Abhyasa', 'Qualities of the Learner', 'Disciplined practice'),
  ('Utsaha', 'Qualities of the Learner', 'Enthusiasm'),
  ('Nishtha', 'Qualities of the Learner', 'Commitment')
ON CONFLICT (lower(name)) DO NOTHING;

-- ---------------------------------------------------------------------------
-- v311 rule values (applied once; later edits in Rules & Configuration are kept)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = '008_v311_defaults') THEN
    UPDATE event_config SET max_order_value = 2500000, min_order_value = 0, min_cash_buffer = 0, participant_order_entry = false,
           updated_at = now(), updated_by = 'v311 upgrade' WHERE id = 1;
    INSERT INTO schema_migrations (version) VALUES ('008_v311_defaults');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- First team-name assignment (reproducible: seed + pool \u2192 same names); the admin may re-randomize before START
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF (SELECT team_names_assigned_at FROM event_config WHERE id = 1) IS NULL THEN
    PERFORM jse__assign_team_names('{"username":"SYSTEM","role":"SYSTEM"}'::jsonb, 'JSE-DALAL-STREET-2026');
  END IF;
END $$;

INSERT INTO schema_migrations(version) VALUES ('008_v311');
`;var aE=[["001_schema",Ya],["001a_upgrades",$a],["002_core",Ka],["003_ops",Va],["004_reads",Ja],["005_exports",Xa],["006_seed",za],["007_tuning",Qa],["008_v311",Za]],rE=new Set(["001a_upgrades","002_core","003_ops","004_reads","005_exports","007_tuning","008_v311"]),b=class extends Error{constructor(s,i,a,r){super(a);this.status=s;this.code=i;this.extra=r}};function nE(){let e=process.env.DATABASE_URL||"postgres://postgres@127.0.0.1:5433/jse",t=new URL(e);process.env.DB_NAME&&(t.pathname="/"+process.env.DB_NAME);let s=t.searchParams.get("sslmode");return(s==="require"||s==="prefer"||s==="verify-ca")&&t.searchParams.set("sslmode","verify-full"),t.toString()}var yt=null;function tr(){return yt||(yt=new er.default.Pool({connectionString:nE(),max:Number(process.env.DB_POOL_MAX||8),idleTimeoutMillis:3e4,connectionTimeoutMillis:1e4,allowExitOnIdle:!1}),yt.on("error",e=>console.warn("[db] idle client error:",e.message))),yt}var oE=new Set(["40001","40P01","57P01","08006","08003","08000","53300"]);async function Le(e,t=[]){let s=0;for(;;)try{return await tr().query(e,t)}catch(i){if(s++,(oE.has(i?.code)||/Connection terminated|ECONNRESET|timeout exceeded when trying to connect/i.test(String(i?.message)))&&s<3){await new Promise(r=>setTimeout(r,120*s+Math.random()*120));continue}throw i}}async function T(e,t,s,i={}){if(!/^jse_[a-z0-9_]+$/.test(e))throw new Error("bad function name");try{let a;i.noActor?a=await Le(`SELECT ${e}($1::jsonb) AS r`,[JSON.stringify(s??{})]):s===void 0?a=await Le(`SELECT ${e}() AS r`):a=await Le(`SELECT ${e}($1::jsonb, $2::jsonb) AS r`,[JSON.stringify(t??{}),JSON.stringify(s??{})]);let r=a.rows[0]?.r;if(r&&r.success===!1)throw new b(Number(r.http)||400,r.code||"REQUEST_FAILED",r.error||"Request failed",r.errors?{errors:r.errors}:void 0);return r}catch(a){throw a instanceof b?a:a?.code==="JSE01"?new b(Number(a.hint)||400,a.detail||"REQUEST_FAILED",a.message):a?.code==="23505"?new b(409,"DUPLICATE","This action was already recorded (duplicate request blocked)."):a?.code==="23514"?new b(409,"RULE_VIOLATION","The request would break a financial rule (for example negative cash or holdings) and was blocked."):a?.code==="57014"?new b(503,"TIMEOUT","The database took too long to respond. Please retry."):a}}var Dt=null;function sr(){return process.env.SKIP_MIGRATIONS==="1"?Promise.resolve():(Dt||(Dt=EE().catch(e=>{throw Dt=null,e})),Dt)}async function _E(e){let{createHash:t}=await import("node:crypto");return t("sha256").update(e).digest("hex").slice(0,16)}async function EE(){let e=await tr().connect();try{await e.query("BEGIN"),await e.query("SELECT pg_advisory_xact_lock(727272)"),await e.query("CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now(), checksum text)");let t=new Map((await e.query("SELECT version, checksum FROM schema_migrations")).rows.map(i=>[i.version,i.checksum])),s=[];for(let[i,a]of aE){let r=await _E(a),n=t.has(i);if(n&&(t.get(i)===r||!rE.has(i)))continue;let o=n?a.replace(/INSERT INTO schema_migrations\(version\) VALUES \('[^']+'\);/g,""):a;await e.query("SAVEPOINT m");try{await e.query(o)}catch(E){throw new Error(`migration ${i} failed: ${E.message}`)}await e.query("INSERT INTO schema_migrations(version, checksum) VALUES ($1, $2) ON CONFLICT (version) DO UPDATE SET checksum = EXCLUDED.checksum, applied_at = now()",[i,r]),await e.query("RELEASE SAVEPOINT m"),s.push(`${i} ${n?"re-applied":"applied"}`)}await e.query("COMMIT"),s.length&&console.log("[db] migrations: "+s.join(", "))}catch(t){try{await e.query("ROLLBACK")}catch{}throw t}finally{e.release()}}import{createPublicKey as cE,verify as lE}from"node:crypto";var ar="https://token.actions.githubusercontent.com",ot=null;async function ir(e=!1){if(!e&&ot&&Date.now()-ot.at<36e5)return ot.keys;let t=await fetch(ar+"/.well-known/jwks",{headers:{accept:"application/json"}});if(!t.ok)throw new Error("could not load GitHub signing keys ("+t.status+")");let s=await t.json();return ot={at:Date.now(),keys:s.keys||[]},ot.keys}var xs=e=>Buffer.from(e.replace(/-/g,"+").replace(/_/g,"/"),"base64");async function rr(e,t){let s=e.split(".");if(s.length!==3)throw new Error("malformed token");let i=JSON.parse(xs(s[0]).toString("utf8")),a=JSON.parse(xs(s[1]).toString("utf8"));if(i.alg!=="RS256")throw new Error("unexpected algorithm");let r=(await ir()).find(_=>_.kid===i.kid);if(r||(r=(await ir(!0)).find(_=>_.kid===i.kid)),!r)throw new Error("unknown signing key");if(!lE("RSA-SHA256",Buffer.from(s[0]+"."+s[1]),cE({key:r,format:"jwk"}),xs(s[2])))throw new Error("bad signature");let o=Math.floor(Date.now()/1e3);if(a.iss!==ar)throw new Error("wrong issuer");if(!(Array.isArray(a.aud)?a.aud:[a.aud]).includes(t.audience))throw new Error("wrong audience");if(typeof a.exp!="number"||a.exp<o-30)throw new Error("token expired");if(typeof a.nbf=="number"&&a.nbf>o+60)throw new Error("token not valid yet");if(a.repository!==t.repository)throw new Error("wrong repository");if(t.refs&&t.refs.length&&!t.refs.includes(a.ref))throw new Error("branch not allowed");return a}import{createRequire as dE}from"module";var uE=dE("/"),NE;try{NE=uE("worker_threads").Worker}catch{}var H=Uint8Array,le=Uint16Array,zs=Int32Array,Ct=new H([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Ft=new H([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),Ys=new H([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),lr=function(e,t){for(var s=new le(31),i=0;i<31;++i)s[i]=t+=1<<e[i-1];for(var a=new zs(s[30]),i=1;i<30;++i)for(var r=s[i];r<s[i+1];++r)a[r]=r-s[i]<<5|i;return{b:s,r:a}},dr=lr(Ct,2),ur=dr.b,$s=dr.r;ur[28]=258,$s[258]=28;var Nr=lr(Ft,0),pE=Nr.b,nr=Nr.r,Ks=new le(32768);for(v=0;v<32768;++v)ve=(v&43690)>>1|(v&21845)<<1,ve=(ve&52428)>>2|(ve&13107)<<2,ve=(ve&61680)>>4|(ve&3855)<<4,Ks[v]=((ve&65280)>>8|(ve&255)<<8)>>1;var ve,v,he=function(e,t,s){for(var i=e.length,a=0,r=new le(t);a<i;++a)e[a]&&++r[e[a]-1];var n=new le(t);for(a=1;a<t;++a)n[a]=n[a-1]+r[a-1]<<1;var o;if(s){o=new le(1<<t);var E=15-t;for(a=0;a<i;++a)if(e[a])for(var _=a<<4|e[a],c=t-e[a],l=n[e[a]-1]++<<c,d=l|(1<<c)-1;l<=d;++l)o[Ks[l]>>E]=_}else for(o=new le(i),a=0;a<i;++a)e[a]&&(o[a]=Ks[n[e[a]-1]++]>>15-e[a]);return o},ge=new H(288);for(v=0;v<144;++v)ge[v]=8;var v;for(v=144;v<256;++v)ge[v]=9;var v;for(v=256;v<280;++v)ge[v]=7;var v;for(v=280;v<288;++v)ge[v]=8;var v,ct=new H(32);for(v=0;v<32;++v)ct[v]=5;var v,TE=he(ge,9,0),mE=he(ge,9,1),RE=he(ct,5,0),hE=he(ct,5,1),Ws=function(e){for(var t=e[0],s=1;s<e.length;++s)e[s]>t&&(t=e[s]);return t},pe=function(e,t,s){var i=t/8|0;return(e[i]|e[i+1]<<8)>>(t&7)&s},Bs=function(e,t){var s=t/8|0;return(e[s]|e[s+1]<<8|e[s+2]<<16)>>(t&7)},Qs=function(e){return(e+7)/8|0},lt=function(e,t,s){return(t==null||t<0)&&(t=0),(s==null||s>e.length)&&(s=e.length),new H(e.subarray(t,s))};var IE=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],te=function(e,t,s){var i=new Error(t||IE[e]);if(i.code=e,Error.captureStackTrace&&Error.captureStackTrace(i,te),!s)throw i;return i},bE=function(e,t,s,i){var a=e.length,r=i?i.length:0;if(!a||t.f&&!t.l)return s||new H(0);var n=!s,o=n||t.i!=2,E=t.i;n&&(s=new H(a*3));var _=function(Ve){var Je=s.length;if(Ve>Je){var He=new H(Math.max(Je*2,Ve));He.set(s),s=He}},c=t.f||0,l=t.p||0,d=t.b||0,u=t.l,I=t.d,L=t.m,g=t.n,M=a*8;do{if(!u){c=pe(e,l,1);var G=pe(e,l+1,3);if(l+=3,G)if(G==1)u=mE,I=hE,L=9,g=5;else if(G==2){var q=pe(e,l,31)+257,A=pe(e,l+10,15)+4,R=q+pe(e,l+5,31)+1;l+=14;for(var m=new H(R),K=new H(19),Y=0;Y<A;++Y)K[Ys[Y]]=pe(e,l+Y*3,7);l+=A*3;for(var z=Ws(K),Se=(1<<z)-1,oe=he(K,z,1),Y=0;Y<R;){var ie=oe[pe(e,l,Se)];l+=ie&15;var F=ie>>4;if(F<16)m[Y++]=F;else{var V=0,x=0;for(F==16?(x=3+pe(e,l,3),l+=2,V=m[Y-1]):F==17?(x=3+pe(e,l,7),l+=3):F==18&&(x=11+pe(e,l,127),l+=7);x--;)m[Y++]=V}}var ae=m.subarray(0,q),J=m.subarray(q);L=Ws(ae),g=Ws(J),u=he(ae,L,1),I=he(J,g,1)}else te(1);else{var F=Qs(l)+4,j=e[F-4]|e[F-3]<<8,k=F+j;if(k>a){E&&te(0);break}o&&_(d+j),s.set(e.subarray(F,k),d),t.b=d+=j,t.p=l=k*8,t.f=c;continue}if(l>M){E&&te(0);break}}o&&_(d+131072);for(var Ke=(1<<L)-1,de=(1<<g)-1,be=l;;be=l){var V=u[Bs(e,l)&Ke],_e=V>>4;if(l+=V&15,l>M){E&&te(0);break}if(V||te(2),_e<256)s[d++]=_e;else if(_e==256){be=l,u=null;break}else{var Ee=_e-254;if(_e>264){var Y=_e-257,W=Ct[Y];Ee=pe(e,l,(1<<W)-1)+ur[Y],l+=W}var me=I[Bs(e,l)&de],Ue=me>>4;me||te(3),l+=me&15;var J=pE[Ue];if(Ue>3){var W=Ft[Ue];J+=Bs(e,l)&(1<<W)-1,l+=W}if(l>M){E&&te(0);break}o&&_(d+131072);var Pe=d+Ee;if(d<J){var Nt=r-J,pt=Math.min(J,Pe);for(Nt+d<0&&te(3);d<pt;++d)s[d]=i[Nt+d]}for(;d<Pe;++d)s[d]=s[d-J]}}t.l=u,t.p=be,t.b=d,t.f=c,u&&(c=1,t.m=L,t.d=I,t.n=g)}while(!c);return d!=s.length&&n?lt(s,0,d):s.subarray(0,d)},fe=function(e,t,s){s<<=t&7;var i=t/8|0;e[i]|=s,e[i+1]|=s>>8},_t=function(e,t,s){s<<=t&7;var i=t/8|0;e[i]|=s,e[i+1]|=s>>8,e[i+2]|=s>>16},qs=function(e,t){for(var s=[],i=0;i<e.length;++i)e[i]&&s.push({s:i,f:e[i]});var a=s.length,r=s.slice();if(!a)return{t:Tr,l:0};if(a==1){var n=new H(s[0].s+1);return n[s[0].s]=1,{t:n,l:1}}s.sort(function(k,q){return k.f-q.f}),s.push({s:-1,f:25001});var o=s[0],E=s[1],_=0,c=1,l=2;for(s[0]={s:-1,f:o.f+E.f,l:o,r:E};c!=a-1;)o=s[s[_].f<s[l].f?_++:l++],E=s[_!=c&&s[_].f<s[l].f?_++:l++],s[c++]={s:-1,f:o.f+E.f,l:o,r:E};for(var d=r[0].s,i=1;i<a;++i)r[i].s>d&&(d=r[i].s);var u=new le(d+1),I=Vs(s[c-1],u,0);if(I>t){var i=0,L=0,g=I-t,M=1<<g;for(r.sort(function(q,A){return u[A.s]-u[q.s]||q.f-A.f});i<a;++i){var G=r[i].s;if(u[G]>t)L+=M-(1<<I-u[G]),u[G]=t;else break}for(L>>=g;L>0;){var F=r[i].s;u[F]<t?L-=1<<t-u[F]++-1:++i}for(;i>=0&&L;--i){var j=r[i].s;u[j]==t&&(--u[j],++L)}I=t}return{t:new H(u),l:I}},Vs=function(e,t,s){return e.s==-1?Math.max(Vs(e.l,t,s+1),Vs(e.r,t,s+1)):t[e.s]=s},or=function(e){for(var t=e.length;t&&!e[--t];);for(var s=new le(++t),i=0,a=e[0],r=1,n=function(E){s[i++]=E},o=1;o<=t;++o)if(e[o]==a&&o!=t)++r;else{if(!a&&r>2){for(;r>138;r-=138)n(32754);r>2&&(n(r>10?r-11<<5|28690:r-3<<5|12305),r=0)}else if(r>3){for(n(a),--r;r>6;r-=6)n(8304);r>2&&(n(r-3<<5|8208),r=0)}for(;r--;)n(a);r=1,a=e[o]}return{c:s.subarray(0,i),n:t}},Et=function(e,t){for(var s=0,i=0;i<t.length;++i)s+=e[i]*t[i];return s},pr=function(e,t,s){var i=s.length,a=Qs(t+2);e[a]=i&255,e[a+1]=i>>8,e[a+2]=e[a]^255,e[a+3]=e[a+1]^255;for(var r=0;r<i;++r)e[a+r+4]=s[r];return(a+4+i)*8},_r=function(e,t,s,i,a,r,n,o,E,_,c){fe(t,c++,s),++a[256];for(var l=qs(a,15),d=l.t,u=l.l,I=qs(r,15),L=I.t,g=I.l,M=or(d),G=M.c,F=M.n,j=or(L),k=j.c,q=j.n,A=new le(19),R=0;R<G.length;++R)++A[G[R]&31];for(var R=0;R<k.length;++R)++A[k[R]&31];for(var m=qs(A,7),K=m.t,Y=m.l,z=19;z>4&&!K[Ys[z-1]];--z);var Se=_+5<<3,oe=Et(a,ge)+Et(r,ct)+n,ie=Et(a,d)+Et(r,L)+n+14+3*z+Et(A,K)+2*A[16]+3*A[17]+7*A[18];if(E>=0&&Se<=oe&&Se<=ie)return pr(t,c,e.subarray(E,E+_));var V,x,ae,J;if(fe(t,c,1+(ie<oe)),c+=2,ie<oe){V=he(d,u,0),x=d,ae=he(L,g,0),J=L;var Ke=he(K,Y,0);fe(t,c,F-257),fe(t,c+5,q-1),fe(t,c+10,z-4),c+=14;for(var R=0;R<z;++R)fe(t,c+3*R,K[Ys[R]]);c+=3*z;for(var de=[G,k],be=0;be<2;++be)for(var _e=de[be],R=0;R<_e.length;++R){var Ee=_e[R]&31;fe(t,c,Ke[Ee]),c+=K[Ee],Ee>15&&(fe(t,c,_e[R]>>5&127),c+=_e[R]>>12)}}else V=TE,x=ge,ae=RE,J=ct;for(var R=0;R<o;++R){var W=i[R];if(W>255){var Ee=W>>18&31;_t(t,c,V[Ee+257]),c+=x[Ee+257],Ee>7&&(fe(t,c,W>>23&31),c+=Ct[Ee]);var me=W&31;_t(t,c,ae[me]),c+=J[me],me>3&&(_t(t,c,W>>5&8191),c+=Ft[me])}else _t(t,c,V[W]),c+=x[W]}return _t(t,c,V[256]),c+x[256]},OE=new zs([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),Tr=new H(0),LE=function(e,t,s,i,a,r){var n=r.z||e.length,o=new H(i+n+5*(1+Math.ceil(n/7e3))+a),E=o.subarray(i,o.length-a),_=r.l,c=(r.r||0)&7;if(t){c&&(E[0]=r.r>>3);for(var l=OE[t-1],d=l>>13,u=l&8191,I=(1<<s)-1,L=r.p||new le(32768),g=r.h||new le(I+1),M=Math.ceil(s/3),G=2*M,F=function(Pt){return(e[Pt]^e[Pt+1]<<M^e[Pt+2]<<G)&I},j=new zs(25e3),k=new le(288),q=new le(32),A=0,R=0,m=r.i||0,K=0,Y=r.w||0,z=0;m+2<n;++m){var Se=F(m),oe=m&32767,ie=g[Se];if(L[oe]=ie,g[Se]=oe,Y<=m){var V=n-m;if((A>7e3||K>24576)&&(V>423||!_)){c=_r(e,E,0,j,k,q,R,K,z,m-z,c),K=A=R=0,z=m;for(var x=0;x<286;++x)k[x]=0;for(var x=0;x<30;++x)q[x]=0}var ae=2,J=0,Ke=u,de=oe-ie&32767;if(V>2&&Se==F(m-de))for(var be=Math.min(d,V)-1,_e=Math.min(32767,m),Ee=Math.min(258,V);de<=_e&&--Ke&&oe!=ie;){if(e[m+ae]==e[m+ae-de]){for(var W=0;W<Ee&&e[m+W]==e[m+W-de];++W);if(W>ae){if(ae=W,J=de,W>be)break;for(var me=Math.min(de,W-2),Ue=0,x=0;x<me;++x){var Pe=m-de+x&32767,Nt=L[Pe],pt=Pe-Nt&32767;pt>Ue&&(Ue=pt,ie=Pe)}}}oe=ie,ie=L[oe],de+=oe-ie&32767}if(J){j[K++]=268435456|$s[ae]<<18|nr[J];var Ve=$s[ae]&31,Je=nr[J]&31;R+=Ct[Ve]+Ft[Je],++k[257+Ve],++q[Je],Y=m+ae,++A}else j[K++]=e[m],++k[e[m]]}}for(m=Math.max(m,Y);m<n;++m)j[K++]=e[m],++k[e[m]];c=_r(e,E,_,j,k,q,R,K,z,m-z,c),_||(r.r=c&7|E[c/8|0]<<3,c-=7,r.h=g,r.p=L,r.i=m,r.w=Y)}else{for(var m=r.w||0;m<n+_;m+=65535){var He=m+65535;He>=n&&(E[c/8|0]=_,He=n),c=pr(E,c+1,e.subarray(m,He))}r.i=n}return lt(o,0,i+Qs(c)+a)},vE=function(){for(var e=new Int32Array(256),t=0;t<256;++t){for(var s=t,i=9;--i;)s=(s&1&&-306674912)^s>>>1;e[t]=s}return e}(),fE=function(){var e=-1;return{p:function(t){for(var s=e,i=0;i<t.length;++i)s=vE[s&255^t[i]]^s>>>8;e=s},d:function(){return~e}}};var AE=function(e,t,s,i,a){if(!a&&(a={l:1},t.dictionary)){var r=t.dictionary.subarray(-32768),n=new H(r.length+e.length);n.set(r),n.set(e,r.length),e=n,a.w=r.length}return LE(e,t.level==null?6:t.level,t.mem==null?a.l?Math.ceil(Math.max(8,Math.min(13,Math.log(e.length)))*1.5):20:12+t.mem,s,i,a)},mr=function(e,t){var s={};for(var i in e)s[i]=e[i];for(var i in t)s[i]=t[i];return s};var Re=function(e,t){return e[t]|e[t+1]<<8},Te=function(e,t){return(e[t]|e[t+1]<<8|e[t+2]<<16|e[t+3]<<24)>>>0},Gs=function(e,t){return Te(e,t)+Te(e,t+4)*4294967296},X=function(e,t,s){for(;s;++t)e[t]=s,s>>>=8};function SE(e,t){return AE(e,t||{},0,0)}function gE(e,t){return bE(e,{i:2},t&&t.out,t&&t.dictionary)}var Rr=function(e,t,s,i){for(var a in e){var r=e[a],n=t+a,o=i;Array.isArray(r)&&(o=mr(i,r[1]),r=r[0]),r instanceof H?s[n]=[r,o]:(s[n+="/"]=[new H(0),o],Rr(r,n,s,i))}},Er=typeof TextEncoder<"u"&&new TextEncoder,Js=typeof TextDecoder<"u"&&new TextDecoder,yE=0;try{Js.decode(Tr,{stream:!0}),yE=1}catch{}var DE=function(e){for(var t="",s=0;;){var i=e[s++],a=(i>127)+(i>223)+(i>239);if(s+a>e.length)return{s:t,r:lt(e,s-1)};a?a==3?(i=((i&15)<<18|(e[s++]&63)<<12|(e[s++]&63)<<6|e[s++]&63)-65536,t+=String.fromCharCode(55296|i>>10,56320|i&1023)):a&1?t+=String.fromCharCode((i&31)<<6|e[s++]&63):t+=String.fromCharCode((i&15)<<12|(e[s++]&63)<<6|e[s++]&63):t+=String.fromCharCode(i)}};function Ie(e,t){if(t){for(var s=new H(e.length),i=0;i<e.length;++i)s[i]=e.charCodeAt(i);return s}if(Er)return Er.encode(e);for(var a=e.length,r=new H(e.length+(e.length>>1)),n=0,o=function(c){r[n++]=c},i=0;i<a;++i){if(n+5>r.length){var E=new H(n+8+(a-i<<1));E.set(r),r=E}var _=e.charCodeAt(i);_<128||t?o(_):_<2048?(o(192|_>>6),o(128|_&63)):_>55295&&_<57344?(_=65536+(_&1047552)|e.charCodeAt(++i)&1023,o(240|_>>18),o(128|_>>12&63),o(128|_>>6&63),o(128|_&63)):(o(224|_>>12),o(128|_>>6&63),o(128|_&63))}return lt(r,0,n)}function Zs(e,t){if(t){for(var s="",i=0;i<e.length;i+=16384)s+=String.fromCharCode.apply(null,e.subarray(i,i+16384));return s}else{if(Js)return Js.decode(e);var a=DE(e),r=a.s,s=a.r;return s.length&&te(8),r}}var CE=function(e,t){return t+30+Re(e,t+26)+Re(e,t+28)},FE=function(e,t,s){var i=Re(e,t+28),a=Zs(e.subarray(t+46,t+46+i),!(Re(e,t+8)&2048)),r=t+46+i,n=Te(e,t+20),o=s&&n==4294967295?jE(e,r):[n,Te(e,t+24),Te(e,t+42)],E=o[0],_=o[1],c=o[2];return[Re(e,t+10),E,_,a,r+Re(e,t+30)+Re(e,t+32),c]},jE=function(e,t){for(;Re(e,t)!=1;t+=4+Re(e,t+2));return[Gs(e,t+12),Gs(e,t+4),Gs(e,t+20)]},Xs=function(e){var t=0;if(e)for(var s in e){var i=e[s].length;i>65535&&te(9),t+=i+4}return t},cr=function(e,t,s,i,a,r,n,o){var E=i.length,_=s.extra,c=o&&o.length,l=Xs(_);X(e,t,n!=null?33639248:67324752),t+=4,n!=null&&(e[t++]=20,e[t++]=s.os),e[t]=20,t+=2,e[t++]=s.flag<<1|(r<0&&8),e[t++]=a&&8,e[t++]=s.compression&255,e[t++]=s.compression>>8;var d=new Date(s.mtime==null?Date.now():s.mtime),u=d.getFullYear()-1980;if((u<0||u>119)&&te(10),X(e,t,u<<25|d.getMonth()+1<<21|d.getDate()<<16|d.getHours()<<11|d.getMinutes()<<5|d.getSeconds()>>1),t+=4,r!=-1&&(X(e,t,s.crc),X(e,t+4,r<0?-r-2:r),X(e,t+8,s.size)),X(e,t+12,E),X(e,t+14,l),t+=16,n!=null&&(X(e,t,c),X(e,t+6,s.attrs),X(e,t+10,n),t+=14),e.set(i,t),t+=E,l)for(var I in _){var L=_[I],g=L.length;X(e,t,+I),X(e,t+2,g),e.set(L,t+4),t+=4+g}return c&&(e.set(o,t),t+=c),t},UE=function(e,t,s,i,a){X(e,t,101010256),X(e,t+8,s),X(e,t+10,s),X(e,t+12,i),X(e,t+16,a)};function hr(e,t){t||(t={});var s={},i=[];Rr(e,"",s,t);var a=0,r=0;for(var n in s){var o=s[n],E=o[0],_=o[1],c=_.level==0?0:8,l=Ie(n),d=l.length,u=_.comment,I=u&&Ie(u),L=I&&I.length,g=Xs(_.extra);d>65535&&te(11);var M=c?SE(E,_):E,G=M.length,F=fE();F.p(E),i.push(mr(_,{size:E.length,crc:F.d(),c:M,f:l,m:I,u:d!=n.length||I&&u.length!=L,o:a,compression:c})),a+=30+d+g+G,r+=76+2*(d+g)+(L||0)+G}for(var j=new H(r+22),k=a,q=r-a,A=0;A<i.length;++A){var l=i[A];cr(j,l.o,l,l.f,l.u,l.c.length);var R=30+l.f.length+Xs(l.extra);j.set(l.c,l.o+R),cr(j,a,l,l.f,l.u,l.c.length,l.o,l.m),a+=16+R+(l.m?l.m.length:0)}return UE(j,a,i.length,q,k),j}function Ir(e,t){for(var s={},i=e.length-22;Te(e,i)!=101010256;--i)(!i||e.length-i>65558)&&te(13);var a=Re(e,i+8);if(!a)return{};var r=Te(e,i+16),n=r==4294967295||a==65535;if(n){var o=Te(e,i-12);n=Te(e,o)==101075792,n&&(a=Te(e,o+32),r=Te(e,o+48))}for(var E=t&&t.filter,_=0;_<a;++_){var c=FE(e,r,n),l=c[0],d=c[1],u=c[2],I=c[3],L=c[4],g=c[5],M=CE(e,g);r=L,(!E||E({name:I,size:d,originalSize:u,compression:l}))&&(l?l==8?s[I]=gE(e.subarray(M,M+d),{out:new H(u)}):te(14,"unknown compression type "+l):s[I]=lt(e,M,M+d))}return s}var ti=e=>e.replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,"");function ei(e){let t="";for(e++;e>0;e=Math.floor((e-1)/26))t=String.fromCharCode(65+(e-1)%26)+t;return t}var Lr=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;function vr(e){let t=new Date(e);return isNaN(t.getTime())?e:new Date(t.getTime()+5.5*3600*1e3).toISOString().replace("T"," ").slice(0,19)}function br(e,t,s){if(t==null||t==="")return"";if(typeof t=="boolean")return`<c r="${e}" t="b"${s?' s="1"':""}><v>${t?1:0}</v></c>`;if(typeof t=="number"&&isFinite(t)){let a=s?1:Number.isInteger(t)?3:2;return`<c r="${e}" s="${a}"><v>${t}</v></c>`}let i=typeof t=="string"?t:JSON.stringify(t);return!s&&Lr.test(i)&&(i=vr(i)),i.length>32e3&&(i=i.slice(0,32e3)+"\u2026"),`<c r="${e}" t="inlineStr"${s?' s="1"':""}><is><t xml:space="preserve">${ti(i)}</t></is></c>`}function PE(e){let t=e.columns.map(n=>Math.min(60,Math.max(10,n.length+2)));for(let n of e.rows.slice(0,200))n.forEach((o,E)=>{let _=o==null?0:String(o).length;E<t.length&&(t[E]=Math.min(60,Math.max(t[E],_+2)))});let s=t.map((n,o)=>`<col min="${o+1}" max="${o+1}" width="${n}" customWidth="1"/>`).join(""),i=[];i.push(`<row r="1">${e.columns.map((n,o)=>br(ei(o)+"1",n,!0)).join("")}</row>`),e.rows.forEach((n,o)=>{let E=o+2;i.push(`<row r="${E}">${n.map((_,c)=>br(ei(c)+E,_,!1)).join("")}</row>`)});let a=ei(Math.max(0,e.columns.length-1)),r=Math.max(1,e.rows.length+1);return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/><cols>${s}</cols><sheetData>${i.join("")}</sheetData>
${e.rows.length?`<autoFilter ref="A1:${a}${r}"/>`:""}
</worksheet>`}function HE(e,t){let s=e.replace(/[\[\]:*?\/\\]/g," ").slice(0,31).trim()||"Sheet",i=2;for(;t.has(s.toLowerCase());)s=s.slice(0,28)+" "+i++;return t.add(s.toLowerCase()),s}function fr(e,t="JSE Report"){let s=new Set,i=e.map(r=>HE(r.name,s)),a={};return a["[Content_Types].xml"]=Ie(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
${e.map((r,n)=>`<Override PartName="/xl/worksheets/sheet${n+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join(`
`)}
</Types>`),a["_rels/.rels"]=Ie(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`),a["docProps/core.xml"]=Ie(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${ti(t)}</dc:title><dc:creator>JAIN STOCK EXCHANGE</dc:creator>
<dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0,19)}Z</dcterms:created>
</cp:coreProperties>`),a["xl/workbook.xml"]=Ie(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${i.map((r,n)=>`<sheet name="${ti(r)}" sheetId="${n+1}" r:id="rId${n+1}"/>`).join("")}</sheets>
</workbook>`),a["xl/_rels/workbook.xml.rels"]=Ie(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${e.map((r,n)=>`<Relationship Id="rId${n+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${n+1}.xml"/>`).join(`
`)}
<Relationship Id="rId${e.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`),a["xl/styles.xml"]=Ie(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2"><numFmt numFmtId="164" formatCode="#,##,##0.00"/><numFmt numFmtId="165" formatCode="#,##,##0"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF172B4D"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`),e.forEach((r,n)=>{a[`xl/worksheets/sheet${n+1}.xml`]=Ie(PE(r))}),hr(a,{level:6})}function Ar(e,t){let s=i=>{if(i==null)return"";let a=typeof i=="string"?i:typeof i=="object"?JSON.stringify(i):String(i);return typeof i=="string"&&Lr.test(a)&&(a=vr(a)),/^[=+\-@]/.test(a)&&typeof i=="string"&&(a="'"+a),/[",\n\r]/.test(a)?'"'+a.replace(/"/g,'""')+'"':a};return"\uFEFF"+[e.map(s).join(","),...t.map(i=>i.map(s).join(","))].join(`\r
`)+`\r
`}var Sr=e=>e.replace(/&(lt|gt|amp|quot|apos|#\d+|#x[0-9a-fA-F]+);/g,(t,s)=>s==="lt"?"<":s==="gt"?">":s==="amp"?"&":s==="quot"?'"':s==="apos"?"'":s[1]==="x"?String.fromCodePoint(parseInt(s.slice(2),16)):String.fromCodePoint(parseInt(s.slice(1),10)));function Or(e){let t="",s=/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t(?:\s[^>]*)?\/>/g,i;for(;i=s.exec(e);)t+=i[1]?Sr(i[1]):"";return t}function wE(e){let t=(/^[A-Z]+/.exec(e)||["A"])[0],s=0;for(let i of t)s=s*26+(i.charCodeAt(0)-64);return s-1}function gr(e){let t;try{t=Ir(e)}catch{throw new Error("The file is not a valid .xlsx workbook.")}let s=u=>t[u]?Zs(t[u]):"",i="xl/worksheets/sheet1.xml",a=s("xl/workbook.xml"),r=s("xl/_rels/workbook.xml.rels"),n=/<sheet\b[^>]*\br:id="([^"]+)"/.exec(a);if(n&&r){let u=new RegExp('<Relationship\\b[^>]*Id="'+n[1]+'"[^>]*Target="([^"]+)"').exec(r)||new RegExp('<Relationship\\b[^>]*Target="([^"]+)"[^>]*Id="'+n[1]+'"').exec(r);u&&(i=u[1].startsWith("/")?u[1].slice(1):"xl/"+u[1].replace(/^\.\//,""))}let o=s(i);if(!o)throw new Error("The workbook has no readable worksheet.");let E=[],_=s("xl/sharedStrings.xml");if(_){let u=/<si>([\s\S]*?)<\/si>/g,I;for(;I=u.exec(_);)E.push(Or(I[1]))}let c=[],l=/<row\b[^>]*\/>|<row\b[^>]*>([\s\S]*?)<\/row>/g,d;for(;d=l.exec(o);){let u=[],I=d[1]||"",L=/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g,g,M=0;for(;g=L.exec(I);){let G=g[1]||"",F=g[2]||"",j=/\br="([A-Z]+)\d+"/.exec(G),k=j?wE(j[1]):M;M=k+1;let q=(/\bt="([^"]+)"/.exec(G)||[])[1]||"n",A=/<v>([\s\S]*?)<\/v>/.exec(F),R="";for(q==="s"?R=A?E[Number(A[1])]??"":"":q==="inlineStr"?R=Or(F):q==="b"?R=A&&A[1]==="1"?"TRUE":"FALSE":R=A?Sr(A[1]):"";u.length<k;)u.push("");u[k]=R.trim()}c.push(u)}return c}function si(e){let t=[],s=[],i="",a=!1,r=e.replace(/^\uFEFF/,"");for(let n=0;n<r.length;n++){let o=r[n];a?o==='"'&&r[n+1]==='"'?(i+='"',n++):o==='"'?a=!1:i+=o:o==='"'?a=!0:o===","?(s.push(i.trim()),i=""):o===`
`||o==="\r"?(o==="\r"&&r[n+1]===`
`&&n++,s.push(i.trim()),t.push(s),s=[],i=""):i+=o}return(i.length||s.length)&&(s.push(i.trim()),t.push(s)),t.filter(n=>n.some(o=>o!==""))}var ri="3.11.0",WE=Date.now(),ut=["ADMIN","EXCHANGE","BANK","BROKER","PIT_MANAGER","INSTITUTIONAL","PARTICIPANT","VIEWER"];function ni(e){return ME("sha256").update(e).digest("hex")}function BE(e){if(!e)return null;if((process.env.CORS_ORIGINS||"").split(",").map(s=>s.trim()).filter(Boolean).includes(e))return e;try{let s=new URL(e),i=s.hostname;if(i==="localhost"||i==="127.0.0.1"||s.protocol==="https:"&&(i==="jain-stock-exchange.pages.dev"||i.endsWith(".jain-stock-exchange.pages.dev")||i==="jse-live.pages.dev"||i.endsWith(".jse-live.pages.dev")))return e}catch{}return null}function Fe(e){let t=BE(e.origin),s={vary:"Origin, Accept-Encoding"};return t&&(s["access-control-allow-origin"]=t,s["access-control-allow-methods"]="GET, POST, OPTIONS",s["access-control-allow-headers"]="Authorization, Content-Type, X-Request-Id",s["access-control-expose-headers"]="ETag, X-JSE-Version, X-Request-Id, Content-Disposition, Date",s["access-control-max-age"]="7200"),s}function qE(e){return/\bgzip\b/.test(e.headers.get("accept-encoding")||"")}function Dr(e){let t=JSON.stringify(e);return{body:t,etag:'W/"'+ni(t).slice(0,24)+'"'}}function y(e,t,s,i={},a=0){let r={"content-type":"application/json; charset=utf-8","x-jse-version":ri,"x-request-id":e.reqId,"cache-control":a>0?`public, max-age=${a}, must-revalidate`:"no-store",etag:s.etag,...Fe(e),...i};return t===200&&e.method==="GET"&&e.req.headers.get("if-none-match")===s.etag?(delete r["content-type"],new Response(null,{status:304,headers:r})):s.body.length>1024&&qE(e.req)?(s.gz||(s.gz=xE(s.body,{level:5})),r["content-encoding"]="gzip",new Response(s.gz,{status:t,headers:r})):new Response(s.body,{status:t,headers:r})}var Z=(e,t,s=200,i=0)=>y(e,s,Dr(t),{},i);function GE(e,t){if(t instanceof b)return Z(e,{success:!1,error:t.message,code:t.code,...t.extra||{}},t.status);let s=t;console.error(`[api] ${e.reqId} ${e.method} ${e.url.pathname} failed:`,s?.code||"",s?.message||s);let i=/ECONNREFUSED|ENOTFOUND|Connection terminated|timeout|too many|remaining connection/i.test(String(s?.message));return Z(e,{success:!1,code:i?"SERVICE_UNAVAILABLE":"SERVER_ERROR",ref:e.reqId,error:i?"The trading service is busy or reconnecting. Please retry in a moment.":"Something went wrong while processing this request. Please retry; if it keeps failing, tell the event desk (ref "+e.reqId+")."},i?503:500)}var ye=new Map;async function D(e,t,s){let i=Date.now(),a=ye.get(e);if(a?.value&&i-a.at<a.ttl)return a.value;if(a?.pending)return a.pending;let r=a||{at:0,ttl:t};if(r.ttl=t,r.pending=s().then(n=>(r.value=Dr(n),r.at=Date.now(),r.pending=void 0,r.value)).catch(n=>{if(r.pending=void 0,!(n instanceof b)&&r.value&&Date.now()-r.at<3e4)return r.value;throw n}),ye.set(e,r),ye.size>2e3)for(let[n,o]of ye)!o.pending&&i-o.at>6e4&&ye.delete(n);return r.pending}function yr(e){if(!e){ye.clear();return}for(let t of[...ye.keys()])e.some(s=>t.startsWith(s))&&ye.delete(t)}var Ae=new Map;async function YE(e){if(!e||e.length<32||e.length>128)return null;let t=ni(e),s=Ae.get(t);if(s&&Date.now()-s.at<3e4)return s.user;let a=(await Le("SELECT jse_session($1) AS u",[t])).rows[0]?.u||null;if(Ae.set(t,{user:a,at:Date.now()}),Ae.size>5e3)for(let[r,n]of Ae)Date.now()-n.at>12e4&&Ae.delete(r);return a}function f(e){let t=e.user;return{id:t?.id??null,username:t?.username??"anonymous",name:t?.name??null,email:t?.email??null,role:t?.role??null,team_id:t?.team_id??null,broker_id:t?.broker_id??null,institution_id:t?.institution_id??null,session:t?.session??null,session_kind:t?.session_kind??null,ip:e.ip,ua:e.ua}}function N(e,...t){if(!e.user)throw new b(401,"UNAUTHENTICATED","Please sign in to continue.");if(t.length&&!t.includes(e.user.role))throw new b(403,"FORBIDDEN",`Your role (${e.user.role.replace(/_/g," ")}) cannot do this.`);return e.user}var dt=new Map;function Ye(e,t,s){let i=Date.now(),a=dt.get(e)||{tokens:s,at:i};return a.tokens=Math.min(s,a.tokens+(i-a.at)/1e3*t),a.at=i,a.tokens<1?(dt.set(e,a),!1):(a.tokens-=1,dt.set(e,a),dt.size>2e4&&dt.clear(),!0)}var jt=new Map,O=(e,t)=>jt.set("GET "+e,{h:t}),C=(e,t,s)=>jt.set("POST "+e,{h:t,maxBody:s}),se=(e,t)=>(e.url.searchParams.get(t)||"").trim();function je(e,t){let s={};for(let i of t){let a=se(e,i);a&&(s[i]=a)}return s}async function w(e,t,s,i){if(!Ye("w:"+(e.user?.id??e.ip),15,40))throw new b(429,"TOO_MANY_REQUESTS","Too many actions in a short time. Please wait a moment.");if(s&&typeof s=="object"&&"admin_password"in s&&e.user&&!Ye("adminpw:"+e.user.id,.1,12))throw new b(429,"TOO_MANY_ATTEMPTS","Too many password confirmations. Wait a minute and try again.");try{let a=await T(t,f(e),s);return yr(i),Z(e,a)}catch(a){throw a instanceof b&&a.code==="PRICE_STALE"&&yr(i),a}}var $e=["trk:","staff:","pd:","q:","bd:","ins:","slips:","pub:status"];O("/api/health",async e=>{let t=Date.now(),s="ok";try{await Le("SELECT 1")}catch(i){s="error: "+String(i?.message).slice(0,120)}return Z(e,{success:s==="ok",service:"JAIN STOCK EXCHANGE API",version:ri,db:s,db_ms:Date.now()-t,uptime_s:Math.round((Date.now()-WE)/1e3),node:process.version,time:new Date().toISOString()},s==="ok"?200:503)});O("/api/market",async e=>y(e,200,await D("pub:market",900,()=>T("jse_market",null)),{},1));O("/api/event-status",async e=>y(e,200,await D("pub:status",900,()=>T("jse_event_status",null)),{},1));O("/api/market-news",async e=>{let t=Math.min(200,Math.max(1,Number(se(e,"limit"))||30));return y(e,200,await D("pub:news:"+t,1500,()=>T("jse_news_list",null,{limit:t},{noActor:!0})),{},1)});O("/api/cms50",async e=>{let t=JSON.parse((await D("pub:market",900,()=>T("jse_market",null))).body);return Z(e,{success:!0,status:t.status,...t.index,market_stock_count:t.stocks.length,ipo_count:t.ipos.length})});O("/api/ipo",async e=>y(e,200,await D("pub:ipo",3e3,()=>T("jse_ipo_page",null)),{},2));var ai=new Map;O("/api/ipo-document",async e=>{let t=se(e,"symbol").toUpperCase();if(!/^[A-Z0-9_-]{1,20}$/.test(t))throw new b(400,"INVALID_SYMBOL","Choose an IPO.");let s=ai.get(t);if(!s||Date.now()-s.at>6e4){let a=(await Le("SELECT p.document_data, p.document_type, p.document_name, p.document_url FROM ipo_prospectus p JOIN securities s ON s.id = p.security_id WHERE s.symbol = $1 AND s.kind = 'IPO'",[t])).rows[0];if(!a)throw new b(404,"IPO_NOT_FOUND","IPO not found.");if(!a.document_data){if(a.document_url)return new Response(null,{status:302,headers:{location:a.document_url,...Fe(e)}});throw new b(404,"NO_DOCUMENT","The prospectus document has not been published yet.")}s={at:Date.now(),type:a.document_type||"application/pdf",name:a.document_name||t+"-prospectus.pdf",data:a.document_data},ai.set(t,s)}return new Response(new Uint8Array(s.data),{status:200,headers:{"content-type":s.type,"content-disposition":`inline; filename="${s.name.replace(/[^\w.\- ]/g,"_")}"`,"cache-control":"public, max-age=60",...Fe(e)}})});C("/api/login",async e=>{let t=String(e.body?.username||"").trim(),s=String(e.body?.password||"");if(!Ye("login-ip:"+e.ip,5,150)||!Ye("login-user:"+t.toLowerCase(),.2,12))throw new b(429,"TOO_MANY_ATTEMPTS","Too many sign-in attempts. Wait a minute and try again.");if(!t||!s)throw new b(400,"MISSING_CREDENTIALS","Enter your username and password.");let i=await T("jse_login",null,{username:t,password:s,ip:e.ip,ua:e.ua},{noActor:!0});return Z(e,i)});C("/api/logout",async e=>{if(e.token){let t=ni(e.token);await Le("SELECT jse_logout($1)",[t]),Ae.delete(t)}return Z(e,{success:!0})});O("/api/me",async e=>e.user?Z(e,{success:!0,authenticated:!0,user:e.user}):Z(e,{success:!0,authenticated:!1,user:null}));C("/api/change-password",async e=>{if(N(e),!Ye("pw:"+e.user.id,.2,6))throw new b(429,"TOO_MANY_ATTEMPTS","Too many attempts. Wait a minute and try again.");let t=await T("jse_change_password",f(e),e.body||{});return Ae.clear(),Z(e,t)});C("/api/ci-login",async e=>{let t=process.env.CI_OIDC_REPOSITORY;if(!t)throw new b(404,"NOT_FOUND","Unknown API endpoint: /api/ci-login");if(!Ye("ci-login:"+e.ip,10,300))throw new b(429,"TOO_MANY_ATTEMPTS","Too many sign-in attempts.");let s;try{s=await rr(String(e.body?.token||""),{repository:t,audience:process.env.CI_OIDC_AUDIENCE||"jse-staging",refs:(process.env.CI_OIDC_REFS||"").split(",").map(a=>a.trim()).filter(Boolean)})}catch(a){throw new b(401,"INVALID_CI_TOKEN","CI token rejected: "+a.message)}let i=await T("jse_ci_session",null,{username:String(e.body?.username||""),ip:e.ip,ua:e.ua,subject:s.sub,run_id:s.run_id,workflow:s.workflow},{noActor:!0});return Z(e,i)});O("/api/portfolios",async e=>(N(e,"ADMIN","VIEWER"),y(e,200,await D("staff:portfolios",1800,()=>T("jse_portfolios",f(e),{})))));O("/api/portfolio-details",async e=>{let t=N(e,"ADMIN","VIEWER","BROKER","PARTICIPANT"),s=(t.role==="PARTICIPANT"?t.team:se(e,"team"))||"";if(!s)throw new b(400,"TEAM_REQUIRED","Choose a team.");let i=t.role==="PARTICIPANT"?"p"+t.id:t.role==="BROKER"?"b"+t.broker_id:"staff";return y(e,200,await D("pd:"+s.toUpperCase()+":"+i,1500,()=>T("jse_portfolio_detail",f(e),{team:s})))});function Ut(e){return e.role==="PARTICIPANT"?"p"+e.team_id:e.role==="BROKER"?"b"+e.broker_id:e.role==="INSTITUTIONAL"?"i"+e.institution_id:"s"}var Cr=async e=>{let t=N(e,...ut),s=je(e,["team","status","side","kind","account","q","page","page_size"]);return y(e,200,await D("trk:"+Ut(t)+":"+JSON.stringify(s),1200,()=>T("jse_tracking",f(e),s)))};O("/api/tracking",Cr);O("/api/orders",Cr);O("/api/order",async e=>(N(e,...ut),Z(e,await T("jse_order_detail",f(e),{order_id:se(e,"id")||void 0,order_no:se(e,"order_no")||void 0,slip_no:se(e,"slip_no")||void 0}))));C("/api/orders",async e=>{N(e,...ut);let t=e.body||{};return Array.isArray(t.legs)?w(e,"jse_place_pair",t,$e):w(e,"jse_place_order",t,$e)});O("/api/instructions",async e=>{let t=N(e,"PARTICIPANT","BROKER","ADMIN","VIEWER"),s=je(e,["team"]);return y(e,200,await D("ins:"+Ut(t)+":"+JSON.stringify(s),1200,()=>T("jse_instructions",f(e),s)))});C("/api/instructions",async e=>(N(e,"PARTICIPANT","BROKER","ADMIN"),w(e,"jse_instruction_action",e.body||{},["ins:","bd:","pd:"])));O("/api/broker-desk",async e=>{let t=N(e,"BROKER","ADMIN","VIEWER"),s=t.role==="BROKER"?String(t.broker||""):se(e,"broker");return y(e,200,await D("bd:"+(t.role==="BROKER"?"own"+t.broker_id:s||"first"),1200,()=>T("jse_broker_desk",f(e),s?{broker:s}:{})))});O("/api/pit",async e=>(N(e,"PIT_MANAGER","ADMIN","VIEWER"),y(e,200,await D("q:pit",900,()=>T("jse_pit_queue",f(e),{})))));C("/api/pit",async e=>(N(e,"PIT_MANAGER","ADMIN"),w(e,"jse_pit_action",e.body||{},$e)));O("/api/slips",async e=>{let t=N(e,...ut),s=je(e,["team","q","page","page_size"]);return y(e,200,await D("slips:"+Ut(t)+":"+JSON.stringify(s),1500,()=>T("jse_slips",f(e),s)))});O("/api/slip",async e=>(N(e,...ut),Z(e,await T("jse_slip",f(e),{slip_no:se(e,"slip_no")||void 0,order_no:se(e,"order_no")||void 0,order_id:se(e,"order_id")||void 0}))));O("/api/exchange",async e=>(N(e,"ADMIN","EXCHANGE","VIEWER"),y(e,200,await D("q:exchange",900,()=>T("jse_exchange_queue",f(e),{})))));C("/api/exchange",async e=>(N(e,"ADMIN","EXCHANGE"),w(e,"jse_exchange_decide",e.body||{},$e)));O("/api/bank",async e=>(N(e,"ADMIN","BANK","VIEWER"),y(e,200,await D("q:bank",900,()=>T("jse_bank_queue",f(e),{})))));C("/api/bank",async e=>{N(e,"ADMIN","BANK");let t=e.body||{},s=String(t.action||"SETTLE").toUpperCase(),i=s==="SETTLE"||s==="APPROVE"?"jse_bank_settle":s==="REJECT"?"jse_bank_reject":s==="CLAIM"||s==="RELEASE"?"jse_bank_claim":"";if(!i)throw new b(400,"INVALID_ACTION","Use SETTLE, REJECT, CLAIM or RELEASE.");return w(e,i,{...t,release:s==="RELEASE"},s==="CLAIM"||s==="RELEASE"?["q:bank"]:$e.concat(["cash:","q:loans"]))});O("/api/loan",async e=>(N(e,"ADMIN","BANK","VIEWER"),y(e,200,await D("q:loans",1500,()=>T("jse_loans",f(e),{})))));C("/api/loan",async e=>(N(e,"ADMIN","BANK"),w(e,"jse_loan_action",e.body||{},["q:","staff:","pd:","cash:","bd:"])));O("/api/cash",async e=>{let t=N(e,"ADMIN","BANK","VIEWER","PARTICIPANT"),s=je(e,["team","type","q","page","page_size"]);return y(e,200,await D("cash:"+(t.role==="PARTICIPANT"?t.team_id:"s")+":"+JSON.stringify(s),1500,()=>T("jse_cash",f(e),s)))});O("/api/audit",async e=>{N(e,"ADMIN","VIEWER");let t=je(e,["action","team","q","page","page_size"]);return y(e,200,await D("audit:"+JSON.stringify(t),1500,()=>T("jse_audit_log",f(e),t)))});O("/api/commissions",async e=>{let t=N(e,"ADMIN","BROKER","VIEWER"),s=je(e,["broker","page","page_size"]);return y(e,200,await D("staff:commissions:"+(t.role==="BROKER"?"b"+t.broker_id:"s")+":"+JSON.stringify(s),2e3,()=>T("jse_commissions",f(e),s)))});O("/api/institutional-portfolio",async e=>{let t=N(e,"ADMIN","INSTITUTIONAL","VIEWER"),s=t.role==="INSTITUTIONAL"?"":se(e,"institution_id");return y(e,200,await D("inst:"+(s||t.institution_id||"default"),1500,()=>T("jse_institutional",f(e),s?{institution_id:s}:{})))});C("/api/institutional-order",async e=>(N(e,"ADMIN","INSTITUTIONAL"),w(e,"jse_place_institutional_order",e.body||{},$e.concat(["inst:"]))));C("/api/market-news",async e=>(N(e,"ADMIN"),w(e,"jse_market_news",e.body||{})));O("/api/ipo-mine",async e=>{let t=N(e,"PARTICIPANT","ADMIN","VIEWER","BROKER"),s=je(e,["team"]);return y(e,200,await D("ipo-mine:"+Ut(t)+":"+JSON.stringify(s),1500,()=>T("jse_ipo_mine",f(e),s)))});O("/api/ipo-applications",async e=>(N(e,"ADMIN","VIEWER"),y(e,200,await D("staff:ipo-applications",1500,()=>T("jse_ipo_applications",f(e),{})))));C("/api/ipo-applications",async e=>(N(e,"PARTICIPANT","ADMIN"),w(e,"jse_ipo_application",e.body||{},["ipo-mine:","staff:","admin:","pd:"])));C("/api/ipo-prospectus",async e=>{N(e,"ADMIN");let t=await w(e,"jse_ipo_prospectus_update",e.body||{},["pub:ipo","admin:"]);return ai.clear(),t},7e6);O("/api/admin-state",async e=>{let t=N(e,"ADMIN","VIEWER");return y(e,200,await D("admin:state:"+t.role,1500,()=>T("jse_admin_state",f(e),{})))});O("/api/insights",async e=>(N(e,"ADMIN","VIEWER"),y(e,200,await D("staff:insights",2500,()=>T("jse_insights",null)))));C("/api/ipo-listing",async e=>(N(e,"ADMIN"),w(e,"jse_ipo_listing",e.body||{})));C("/api/event",async e=>(N(e,"ADMIN"),w(e,"jse_event_action",e.body||{})));C("/api/reset-event",async e=>(N(e,"ADMIN"),w(e,"jse_reset_event",e.body||{})));C("/api/undo-redo",async e=>(N(e,"ADMIN"),w(e,"jse_undo_redo",e.body||{})));C("/api/reject-open-orders",async e=>(N(e,"ADMIN"),w(e,"jse_reject_open_orders",e.body||{})));C("/api/ipo-allotments",async e=>{N(e,"ADMIN");let t=e.body||{};return w(e,t.clear?"jse_ipo_allot_clear":"jse_ipo_allot",t)});C("/api/teams",async e=>(N(e,"ADMIN"),w(e,"jse_update_teams",e.body||{})));C("/api/brokers",async e=>(N(e,"ADMIN"),w(e,"jse_update_brokers",e.body||{})));C("/api/config",async e=>(N(e,"ADMIN"),w(e,"jse_update_config",e.body||{})));O("/api/team-names",async e=>(N(e,"ADMIN","VIEWER"),y(e,200,await D("admin:team-names",2e3,()=>T("jse_team_names",f(e),{action:"STATE"})))));C("/api/team-names",async e=>{N(e,"ADMIN");let t=await w(e,"jse_team_names",e.body||{});return Ae.clear(),t});O("/api/users",async e=>(N(e,"ADMIN"),Z(e,await T("jse_admin_users",f(e),{action:"LIST"}))));C("/api/users",async e=>{N(e,"ADMIN");let t=await w(e,"jse_admin_users",e.body||{},[]);return Ae.clear(),t});var $E={teams:{fn:"jse_update_teams",required:["team"],map:{team:"team","team code":"team","team name":"name",name:"name",section:"section",broker:"broker","broker code":"broker",members:"members","participant members":"members"}},brokers:{fn:"jse_update_brokers",required:["broker"],map:{"broker code":"broker",broker:"broker",code:"broker","broker name":"name",name:"name",contact:"contact","broker contact":"contact",desk:"desk","broker desk":"desk"}},allotments:{fn:"jse_ipo_allot",required:["team","ipo","lots"],map:{team:"team","team code":"team",ipo:"ipo","ipo code":"ipo",symbol:"ipo",lots:"lots",shares:"shares",quantity:"shares",amount:"amount"}}};C("/api/import",async e=>{N(e,"ADMIN");let t=e.body||{},s=$E[String(t.kind||"")];if(!s)throw new b(400,"INVALID_IMPORT","Choose what to import: teams, brokers or allotments.");let i;try{if(typeof t.csv_text=="string")i=si(t.csv_text);else{let E=Buffer.from(String(t.data_base64||""),"base64");if(!E.length)throw new Error("The file is empty.");i=/\.csv$/i.test(String(t.filename||""))?si(E.toString("utf8")):gr(new Uint8Array(E))}}catch(E){throw new b(400,"UNREADABLE_FILE",E.message||"The file could not be read.")}let a=i.findIndex(E=>E.some(_=>s.map[_.trim().toLowerCase()]));if(a<0)throw new b(400,"MISSING_HEADERS","The first row must contain the column names ("+Object.keys(s.map).slice(0,5).join(", ")+").");let r=i[a].map(E=>s.map[E.trim().toLowerCase()]||""),n=s.required.filter(E=>!r.includes(E));if(n.length)throw new b(400,"MISSING_HEADERS","Missing column(s): "+n.join(", ")+".");let o=i.slice(a+1).filter(E=>E.some(_=>_!=="")).map(E=>{let _={};return r.forEach((c,l)=>{c&&E[l]!==void 0&&E[l]!==""&&(_[c]=E[l])}),_});if(!o.length)throw new b(400,"NO_ROWS","The file has no data rows.");if(o.length>2e3)throw new b(400,"TOO_MANY_ROWS","At most 2,000 rows per import.");return w(e,s.fn,{rows:o,admin_password:t.admin_password,dry_run:!!t.dry_run,replace:!!t.replace,batch_id:t.filename?String(t.filename).slice(0,60):void 0})},3e6);O("/api/reports",async e=>(N(e,"ADMIN","VIEWER"),y(e,200,await D("staff:reports",3e3,()=>T("jse_reports",f(e),{})))));O("/api/certificates",async e=>(N(e,"ADMIN","VIEWER"),y(e,200,await D("staff:certificates",3e3,()=>T("jse_certificates",f(e),{})))));O("/api/share-certificates",async e=>{let s=N(e,"ADMIN","VIEWER","PARTICIPANT","BROKER").role==="PARTICIPANT"?"":se(e,"team");return Z(e,await T("jse_share_certificates",f(e),s?{team:s}:{}))});var ii=null;async function Fr(){return ii||(ii=(await Le("SELECT jse_export_sheets() AS s")).rows[0].s),ii}function oi(){let e=new Date(Date.now()+198e5).toISOString();return e.slice(0,10)+"_"+e.slice(11,16).replace(":","")}O("/api/export",async e=>{N(e,"ADMIN","VIEWER");let t=se(e,"sheet")||"networth",s=(se(e,"format")||"csv").toLowerCase(),i=await T("jse_export",f(e),{sheet:t});if(s==="json")return Z(e,i);let a=Ar(i.columns,i.rows);return new Response(a,{status:200,headers:{"content-type":"text/csv; charset=utf-8","content-disposition":`attachment; filename="JSE_${t}_${oi()}.csv"`,"cache-control":"no-store",...Fe(e)}})});O("/api/export-event-excel",async e=>{N(e,"ADMIN","VIEWER");let t=[];for(let[i,a]of await Fr()){let r=await T("jse_export",f(e),{sheet:i});t.push({name:a,columns:r.columns,rows:r.rows})}let s=fr(t,"JAIN STOCK EXCHANGE \u2014 Final Event Report");return await T("jse_audit_note",f(e),{action:"EXPORT_EVENT_EXCEL",sheets:t.length}).catch(()=>null),new Response(s,{status:200,headers:{"content-type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","content-disposition":`attachment; filename="JSE_Final_Event_Report_${oi()}.xlsx"`,"cache-control":"no-store",...Fe(e)}})});O("/api/export-event-json",async e=>{N(e,"ADMIN","VIEWER");let t={};for(let[a,r]of await Fr()){let n=await T("jse_export",f(e),{sheet:a});t[a]={title:r,columns:n.columns,rows:n.rows}}let s=await T("jse_event_status",null),i=JSON.stringify({success:!0,service:"JAIN STOCK EXCHANGE",version:ri,generated_at:new Date().toISOString(),event:s,sheets:t});return await T("jse_audit_note",f(e),{action:"EXPORT_EVENT_JSON",sheets:Object.keys(t).length}).catch(()=>null),new Response(i,{status:200,headers:{"content-type":"application/json; charset=utf-8","content-disposition":`attachment; filename="JSE_Final_Event_${oi()}.json"`,"cache-control":"no-store",...Fe(e)}})});async function KE(e,t=2e6){if(Number(e.headers.get("content-length")||0)>t)throw new b(413,"TOO_LARGE","The request is too large.");let i=await e.text();if(i.length>t)throw new b(413,"TOO_LARGE","The request is too large.");if(!i.trim())return{};try{return JSON.parse(i)}catch{throw new b(400,"INVALID_JSON","The request body is not valid JSON.")}}function VE(e){let t=e.headers.get("x-forwarded-for");return(e.headers.get("cf-connecting-ip")||(t?t.split(",")[0].trim():"")||e.headers.get("x-real-ip")||"").slice(0,64)}async function JE(e){let t=new URL(e.url),s={req:e,url:t,method:e.method.toUpperCase(),ip:VE(e),ua:(e.headers.get("user-agent")||"").slice(0,300),origin:e.headers.get("origin"),token:null,user:null,body:null,started:Date.now(),reqId:(e.headers.get("x-request-id")||kE()).slice(0,36)};if(s.method==="OPTIONS")return new Response(null,{status:204,headers:Fe(s)});let i=t.pathname.replace(/\/+$/,"")||"/";i.startsWith("/api")||(i="/api"+(i==="/"?"/health":i));try{let a=jt.get(s.method+" "+i);if(!a){let n=jt.has((s.method==="GET"?"POST ":"GET ")+i);throw new b(n?405:404,n?"METHOD_NOT_ALLOWED":"NOT_FOUND",n?"Method not allowed.":"Unknown API endpoint: "+i)}await sr();let r=e.headers.get("authorization")||"";return s.token=r.toLowerCase().startsWith("bearer ")?r.slice(7).trim():null,s.user=await YE(s.token),s.method==="POST"&&(s.body=await KE(e,a.maxBody)),await a.h(s)}catch(a){return GE(s,a)}}var Nl={fetch:JE};export{ri as VERSION,Nl as default,JE as handle};
