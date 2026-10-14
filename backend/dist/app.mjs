import{createRequire as __jseCR}from'module';const require=__jseCR(String(import.meta.url).startsWith('file:')?import.meta.url:'file:///tmp/jse.mjs');
var Pi=Object.create;var Ea=Object.defineProperty;var Hi=Object.getOwnPropertyDescriptor;var Mi=Object.getOwnPropertyNames;var wi=Object.getPrototypeOf,ki=Object.prototype.hasOwnProperty;var k=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,s)=>(typeof require<"u"?require:e)[s]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var R=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var xi=(t,e,s,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Mi(e))!ki.call(t,r)&&r!==s&&Ea(t,r,{get:()=>e[r],enumerable:!(a=Hi(e,r))||a.enumerable});return t};var Wi=(t,e,s)=>(s=t!=null?Pi(wi(t)):{},xi(e||!t||!t.__esModule?Ea(s,"default",{value:t,enumerable:!0}):s,t));var wt=R(ca=>{"use strict";ca.parse=function(t,e){return new Mt(t,e).parse()};var Mt=class t{constructor(e,s){this.source=e,this.transform=s||Bi,this.position=0,this.entries=[],this.recorded=[],this.dimension=0}isEof(){return this.position>=this.source.length}nextCharacter(){var e=this.source[this.position++];return e==="\\"?{value:this.source[this.position++],escaped:!0}:{value:e,escaped:!1}}record(e){this.recorded.push(e)}newEntry(e){var s;(this.recorded.length>0||e)&&(s=this.recorded.join(""),s==="NULL"&&!e&&(s=null),s!==null&&(s=this.transform(s)),this.entries.push(s),this.recorded=[])}consumeDimensions(){if(this.source[0]==="[")for(;!this.isEof();){var e=this.nextCharacter();if(e.value==="=")break}}parse(e){var s,a,r;for(this.consumeDimensions();!this.isEof();)if(s=this.nextCharacter(),s.value==="{"&&!r)this.dimension++,this.dimension>1&&(a=new t(this.source.substr(this.position-1),this.transform),this.entries.push(a.parse(!0)),this.position+=a.position-2);else if(s.value==="}"&&!r){if(this.dimension--,!this.dimension&&(this.newEntry(),e))return this.entries}else s.value==='"'&&!s.escaped?(r&&this.newEntry(!0),r=!r):s.value===","&&!r?this.newEntry():this.record(s.value);if(this.dimension!==0)throw new Error("array dimension not balanced");return this.entries}};function Bi(t){return t}});var kt=R((rc,la)=>{var Gi=wt();la.exports={create:function(t,e){return{parse:function(){return Gi.parse(t,e)}}}}});var Na=R((ic,ua)=>{"use strict";var qi=/(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/,Yi=/^(\d{1,})-(\d{2})-(\d{2})( BC)?$/,$i=/([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/,Ki=/^-?infinity$/;ua.exports=function(e){if(Ki.test(e))return Number(e.replace("i","I"));var s=qi.exec(e);if(!s)return Vi(e)||null;var a=!!s[8],r=parseInt(s[1],10);a&&(r=da(r));var i=parseInt(s[2],10)-1,n=s[3],o=parseInt(s[4],10),E=parseInt(s[5],10),_=parseInt(s[6],10),c=s[7];c=c?1e3*parseFloat(c):0;var l,d=Xi(e);return d!=null?(l=new Date(Date.UTC(r,i,n,o,E,_,c)),xt(r)&&l.setUTCFullYear(r),d!==0&&l.setTime(l.getTime()-d)):(l=new Date(r,i,n,o,E,_,c),xt(r)&&l.setFullYear(r)),l};function Vi(t){var e=Yi.exec(t);if(e){var s=parseInt(e[1],10),a=!!e[4];a&&(s=da(s));var r=parseInt(e[2],10)-1,i=e[3],n=new Date(s,r,i);return xt(s)&&n.setFullYear(s),n}}function Xi(t){if(t.endsWith("+00"))return 0;var e=$i.exec(t.split(" ")[1]);if(e){var s=e[1];if(s==="Z")return 0;var a=s==="-"?-1:1,r=parseInt(e[2],10)*3600+parseInt(e[3]||0,10)*60+parseInt(e[4]||0,10);return r*a*1e3}}function da(t){return-(t-1)}function xt(t){return t>=0&&t<100}});var Ta=R((nc,pa)=>{pa.exports=zi;var Ji=Object.prototype.hasOwnProperty;function zi(t){for(var e=1;e<arguments.length;e++){var s=arguments[e];for(var a in s)Ji.call(s,a)&&(t[a]=s[a])}return t}});var ha=R((oc,Ra)=>{"use strict";var Qi=Ta();Ra.exports=Pe;function Pe(t){if(!(this instanceof Pe))return new Pe(t);Qi(this,ln(t))}var Zi=["seconds","minutes","hours","days","months","years"];Pe.prototype.toPostgres=function(){var t=Zi.filter(this.hasOwnProperty,this);return this.milliseconds&&t.indexOf("seconds")<0&&t.push("seconds"),t.length===0?"0":t.map(function(e){var s=this[e]||0;return e==="seconds"&&this.milliseconds&&(s=(s+this.milliseconds/1e3).toFixed(6).replace(/\.?0+$/,"")),s+" "+e},this).join(" ")};var en={years:"Y",months:"M",days:"D",hours:"H",minutes:"M",seconds:"S"},tn=["years","months","days"],sn=["hours","minutes","seconds"];Pe.prototype.toISOString=Pe.prototype.toISO=function(){var t=tn.map(s,this).join(""),e=sn.map(s,this).join("");return"P"+t+"T"+e;function s(a){var r=this[a]||0;return a==="seconds"&&this.milliseconds&&(r=(r+this.milliseconds/1e3).toFixed(6).replace(/0+$/,"")),r+en[a]}};var Wt="([+-]?\\d+)",an=Wt+"\\s+years?",rn=Wt+"\\s+mons?",nn=Wt+"\\s+days?",on="([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?",_n=new RegExp([an,rn,nn,on].map(function(t){return"("+t+")?"}).join("\\s*")),ma={years:2,months:4,days:6,hours:9,minutes:10,seconds:11,milliseconds:12},En=["hours","minutes","seconds","milliseconds"];function cn(t){var e=t+"000000".slice(t.length);return parseInt(e,10)/1e3}function ln(t){if(!t)return{};var e=_n.exec(t),s=e[8]==="-";return Object.keys(ma).reduce(function(a,r){var i=ma[r],n=e[i];return!n||(n=r==="milliseconds"?cn(n):parseInt(n,10),!n)||(s&&~En.indexOf(r)&&(n*=-1),a[r]=n),a},{})}});var ba=R((_c,Oa)=>{"use strict";var Ia=Buffer.from||Buffer;Oa.exports=function(e){if(/^\\x/.test(e))return Ia(e.substr(2),"hex");for(var s="",a=0;a<e.length;)if(e[a]!=="\\")s+=e[a],++a;else if(/[0-7]{3}/.test(e.substr(a+1,3)))s+=String.fromCharCode(parseInt(e.substr(a+1,3),8)),a+=4;else{for(var r=1;a+r<e.length&&e[a+r]==="\\";)r++;for(var i=0;i<Math.floor(r/2);++i)s+="\\";a+=Math.floor(r/2)*2}return Ia(s,"binary")}});var Da=R((Ec,ga)=>{var Xe=wt(),Je=kt(),Tt=Na(),va=ha(),Aa=ba();function mt(t){return function(s){return s===null?s:t(s)}}function fa(t){return t===null?t:t==="TRUE"||t==="t"||t==="true"||t==="y"||t==="yes"||t==="on"||t==="1"}function dn(t){return t?Xe.parse(t,fa):null}function un(t){return parseInt(t,10)}function Bt(t){return t?Xe.parse(t,mt(un)):null}function Nn(t){return t?Xe.parse(t,mt(function(e){return Sa(e).trim()})):null}var pn=function(t){if(!t)return null;var e=Je.create(t,function(s){return s!==null&&(s=$t(s)),s});return e.parse()},Gt=function(t){if(!t)return null;var e=Je.create(t,function(s){return s!==null&&(s=parseFloat(s)),s});return e.parse()},de=function(t){if(!t)return null;var e=Je.create(t);return e.parse()},qt=function(t){if(!t)return null;var e=Je.create(t,function(s){return s!==null&&(s=Tt(s)),s});return e.parse()},Tn=function(t){if(!t)return null;var e=Je.create(t,function(s){return s!==null&&(s=va(s)),s});return e.parse()},mn=function(t){return t?Xe.parse(t,mt(Aa)):null},Yt=function(t){return parseInt(t,10)},Sa=function(t){var e=String(t);return/^\d+$/.test(e)?e:t},La=function(t){return t?Xe.parse(t,mt(JSON.parse)):null},$t=function(t){return t[0]!=="("?null:(t=t.substring(1,t.length-1).split(","),{x:parseFloat(t[0]),y:parseFloat(t[1])})},Rn=function(t){if(t[0]!=="<"&&t[1]!=="(")return null;for(var e="(",s="",a=!1,r=2;r<t.length-1;r++){if(a||(e+=t[r]),t[r]===")"){a=!0;continue}else if(!a)continue;t[r]!==","&&(s+=t[r])}var i=$t(e);return i.radius=parseFloat(s),i},hn=function(t){t(20,Sa),t(21,Yt),t(23,Yt),t(26,Yt),t(700,parseFloat),t(701,parseFloat),t(16,fa),t(1082,Tt),t(1114,Tt),t(1184,Tt),t(600,$t),t(651,de),t(718,Rn),t(1e3,dn),t(1001,mn),t(1005,Bt),t(1007,Bt),t(1028,Bt),t(1016,Nn),t(1017,pn),t(1021,Gt),t(1022,Gt),t(1231,Gt),t(1014,de),t(1015,de),t(1008,de),t(1009,de),t(1040,de),t(1041,de),t(1115,qt),t(1182,qt),t(1185,qt),t(1186,va),t(1187,Tn),t(17,Aa),t(114,JSON.parse.bind(JSON)),t(3802,JSON.parse.bind(JSON)),t(199,La),t(3807,La),t(3907,de),t(2951,de),t(791,de),t(1183,de),t(1270,de)};ga.exports={init:hn}});var Ca=R((cc,ya)=>{"use strict";var re=1e6;function In(t){var e=t.readInt32BE(0),s=t.readUInt32BE(4),a="";e<0&&(e=~e+(s===0),s=~s+1>>>0,a="-");var r="",i,n,o,E,_,c;{if(i=e%re,e=e/re>>>0,n=4294967296*i+s,s=n/re>>>0,o=""+(n-re*s),s===0&&e===0)return a+o+r;for(E="",_=6-o.length,c=0;c<_;c++)E+="0";r=E+o+r}{if(i=e%re,e=e/re>>>0,n=4294967296*i+s,s=n/re>>>0,o=""+(n-re*s),s===0&&e===0)return a+o+r;for(E="",_=6-o.length,c=0;c<_;c++)E+="0";r=E+o+r}{if(i=e%re,e=e/re>>>0,n=4294967296*i+s,s=n/re>>>0,o=""+(n-re*s),s===0&&e===0)return a+o+r;for(E="",_=6-o.length,c=0;c<_;c++)E+="0";r=E+o+r}return i=e%re,n=4294967296*i+s,o=""+n%re,a+o+r}ya.exports=In});var Ha=R((lc,Pa)=>{var On=Ca(),F=function(t,e,s,a,r){s=s||0,a=a||!1,r=r||function(u,h,I){return u*Math.pow(2,I)+h};var i=s>>3,n=function(u){return a?~u&255:u},o=255,E=8-s%8;e<E&&(o=255<<8-e&255,E=e),s&&(o=o>>s%8);var _=0;s%8+e>=8&&(_=r(0,n(t[i])&o,E));for(var c=e+s>>3,l=i+1;l<c;l++)_=r(_,n(t[l]),8);var d=(e+s)%8;return d>0&&(_=r(_,n(t[c])>>8-d,d)),_},Ua=function(t,e,s){var a=Math.pow(2,s-1)-1,r=F(t,1),i=F(t,s,1);if(i===0)return 0;var n=1,o=function(_,c,l){_===0&&(_=1);for(var d=1;d<=l;d++)n/=2,(c&1<<l-d)>0&&(_+=n);return _},E=F(t,e,s+1,!1,o);return i==Math.pow(2,s+1)-1?E===0?r===0?1/0:-1/0:NaN:(r===0?1:-1)*Math.pow(2,i-a)*E},bn=function(t){return F(t,1)==1?-1*(F(t,15,1,!0)+1):F(t,15,1)},Fa=function(t){return F(t,1)==1?-1*(F(t,31,1,!0)+1):F(t,31,1)},Ln=function(t){return Ua(t,23,8)},vn=function(t){return Ua(t,52,11)},An=function(t){var e=F(t,16,32);if(e==49152)return NaN;for(var s=Math.pow(1e4,F(t,16,16)),a=0,r=[],i=F(t,16),n=0;n<i;n++)a+=F(t,16,64+16*n)*s,s/=1e4;var o=Math.pow(10,F(t,16,48));return(e===0?1:-1)*Math.round(a*o)/o},ja=function(t,e){var s=F(e,1),a=F(e,63,1),r=new Date((s===0?1:-1)*a/1e3+9466848e5);return t||r.setTime(r.getTime()+r.getTimezoneOffset()*6e4),r.usec=a%1e3,r.getMicroSeconds=function(){return this.usec},r.setMicroSeconds=function(i){this.usec=i},r.getUTCMicroSeconds=function(){return this.usec},r},ze=function(t){for(var e=F(t,32),s=F(t,32,32),a=F(t,32,64),r=96,i=[],n=0;n<e;n++)i[n]=F(t,32,r),r+=32,r+=32;var o=function(_){var c=F(t,32,r);if(r+=32,c==4294967295)return null;var l;if(_==23||_==20)return l=F(t,c*8,r),r+=c*8,l;if(_==25)return l=t.toString(this.encoding,r>>3,(r+=c<<3)>>3),l;console.log("ERROR: ElementType not implemented: "+_)},E=function(_,c){var l=[],d;if(_.length>1){var u=_.shift();for(d=0;d<u;d++)l[d]=E(_,c);_.unshift(u)}else for(d=0;d<_[0];d++)l[d]=o(c);return l};return E(i,a)},fn=function(t){return t.toString("utf8")},Sn=function(t){return t===null?null:F(t,8)>0},gn=function(t){t(20,On),t(21,bn),t(23,Fa),t(26,Fa),t(1700,An),t(700,Ln),t(701,vn),t(16,Sn),t(1114,ja.bind(null,!1)),t(1184,ja.bind(null,!0)),t(1e3,ze),t(1007,ze),t(1016,ze),t(1008,ze),t(1009,ze),t(25,fn)};Pa.exports={init:gn}});var wa=R((dc,Ma)=>{Ma.exports={BOOL:16,BYTEA:17,CHAR:18,INT8:20,INT2:21,INT4:23,REGPROC:24,TEXT:25,OID:26,TID:27,XID:28,CID:29,JSON:114,XML:142,PG_NODE_TREE:194,SMGR:210,PATH:602,POLYGON:604,CIDR:650,FLOAT4:700,FLOAT8:701,ABSTIME:702,RELTIME:703,TINTERVAL:704,CIRCLE:718,MACADDR8:774,MONEY:790,MACADDR:829,INET:869,ACLITEM:1033,BPCHAR:1042,VARCHAR:1043,DATE:1082,TIME:1083,TIMESTAMP:1114,TIMESTAMPTZ:1184,INTERVAL:1186,TIMETZ:1266,BIT:1560,VARBIT:1562,NUMERIC:1700,REFCURSOR:1790,REGPROCEDURE:2202,REGOPER:2203,REGOPERATOR:2204,REGCLASS:2205,REGTYPE:2206,UUID:2950,TXID_SNAPSHOT:2970,PG_LSN:3220,PG_NDISTINCT:3361,PG_DEPENDENCIES:3402,TSVECTOR:3614,TSQUERY:3615,GTSVECTOR:3642,REGCONFIG:3734,REGDICTIONARY:3769,JSONB:3802,REGNAMESPACE:4089,REGROLE:4096}});var et=R(Ze=>{var Dn=Da(),yn=Ha(),Cn=kt(),Fn=wa();Ze.getTypeParser=jn;Ze.setTypeParser=Un;Ze.arrayParser=Cn;Ze.builtins=Fn;var Qe={text:{},binary:{}};function ka(t){return String(t)}function jn(t,e){return e=e||"text",Qe[e]&&Qe[e][t]||ka}function Un(t,e,s){typeof e=="function"&&(s=e,e="text"),Qe[e][t]=s}Dn.init(function(t,e){Qe.text[t]=e});yn.init(function(t,e){Qe.binary[t]=e})});var tt=R((Nc,Kt)=>{"use strict";Kt.exports={host:"localhost",user:process.platform==="win32"?process.env.USERNAME:process.env.USER,database:void 0,password:null,connectionString:void 0,port:5432,rows:0,binary:!1,max:10,idleTimeoutMillis:3e4,client_encoding:"",ssl:!1,application_name:void 0,fallback_application_name:void 0,options:void 0,parseInputDatesAsUTC:!1,statement_timeout:!1,lock_timeout:!1,idle_in_transaction_session_timeout:!1,query_timeout:!1,connect_timeout:0,keepalives:1,keepalives_idle:0};var He=et(),Pn=He.getTypeParser(20,"text"),Hn=He.getTypeParser(1016,"text");Kt.exports.__defineSetter__("parseInt8",function(t){He.setTypeParser(20,"text",t?He.getTypeParser(23,"text"):Pn),He.setTypeParser(1016,"text",t?He.getTypeParser(1007,"text"):Hn)})});var st=R((pc,Wa)=>{"use strict";var Mn=tt();function wn(t){var e=t.replace(/\\/g,"\\\\").replace(/"/g,'\\"');return'"'+e+'"'}function xa(t){for(var e="{",s=0;s<t.length;s++)if(s>0&&(e=e+","),t[s]===null||typeof t[s]>"u")e=e+"NULL";else if(Array.isArray(t[s]))e=e+xa(t[s]);else if(ArrayBuffer.isView(t[s])){var a=t[s];if(!(a instanceof Buffer)){var r=Buffer.from(a.buffer,a.byteOffset,a.byteLength);r.length===a.byteLength?a=r:a=r.slice(a.byteOffset,a.byteOffset+a.byteLength)}e+="\\\\x"+a.toString("hex")}else e+=wn(Rt(t[s]));return e=e+"}",e}var Rt=function(t,e){if(t==null)return null;if(t instanceof Buffer)return t;if(ArrayBuffer.isView(t)){var s=Buffer.from(t.buffer,t.byteOffset,t.byteLength);return s.length===t.byteLength?s:s.slice(t.byteOffset,t.byteOffset+t.byteLength)}return t instanceof Date?Mn.parseInputDatesAsUTC?Wn(t):xn(t):Array.isArray(t)?xa(t):typeof t=="object"?kn(t,e):t.toString()};function kn(t,e){if(t&&typeof t.toPostgres=="function"){if(e=e||[],e.indexOf(t)!==-1)throw new Error('circular reference detected while preparing "'+t+'" for query');return e.push(t),Rt(t.toPostgres(Rt),e)}return JSON.stringify(t)}function Q(t,e){for(t=""+t;t.length<e;)t="0"+t;return t}function xn(t){var e=-t.getTimezoneOffset(),s=t.getFullYear(),a=s<1;a&&(s=Math.abs(s)+1);var r=Q(s,4)+"-"+Q(t.getMonth()+1,2)+"-"+Q(t.getDate(),2)+"T"+Q(t.getHours(),2)+":"+Q(t.getMinutes(),2)+":"+Q(t.getSeconds(),2)+"."+Q(t.getMilliseconds(),3);return e<0?(r+="-",e*=-1):r+="+",r+=Q(Math.floor(e/60),2)+":"+Q(e%60,2),a&&(r+=" BC"),r}function Wn(t){var e=t.getUTCFullYear(),s=e<1;s&&(e=Math.abs(e)+1);var a=Q(e,4)+"-"+Q(t.getUTCMonth()+1,2)+"-"+Q(t.getUTCDate(),2)+"T"+Q(t.getUTCHours(),2)+":"+Q(t.getUTCMinutes(),2)+":"+Q(t.getUTCSeconds(),2)+"."+Q(t.getUTCMilliseconds(),3);return a+="+00:00",s&&(a+=" BC"),a}function Bn(t,e,s){return t=typeof t=="string"?{text:t}:t,e&&(typeof e=="function"?t.callback=e:t.values=e),s&&(t.callback=s),t}var Gn=function(t){return'"'+t.replace(/"/g,'""')+'"'},qn=function(t){for(var e=!1,s="'",a=0;a<t.length;a++){var r=t[a];r==="'"?s+=r+r:r==="\\"?(s+=r+r,e=!0):s+=r}return s+="'",e===!0&&(s=" E"+s),s};Wa.exports={prepareValue:function(e){return Rt(e)},normalizeQueryConfig:Bn,escapeIdentifier:Gn,escapeLiteral:qn}});var Ga=R((Tc,Ba)=>{"use strict";var at=k("crypto");function Vt(t){return at.createHash("md5").update(t,"utf-8").digest("hex")}function Yn(t,e,s){var a=Vt(e+t),r=Vt(Buffer.concat([Buffer.from(a),s]));return"md5"+r}function $n(t){return at.createHash("sha256").update(t).digest()}function Kn(t,e){return at.createHmac("sha256",t).update(e).digest()}async function Vn(t,e,s){return at.pbkdf2Sync(t,e,s,32,"sha256")}Ba.exports={postgresMd5PasswordHash:Yn,randomBytes:at.randomBytes,deriveKey:Vn,sha256:$n,hmacSha256:Kn,md5:Vt}});var Ka=R((mc,$a)=>{var qa=k("crypto");$a.exports={postgresMd5PasswordHash:Jn,randomBytes:Xn,deriveKey:Zn,sha256:zn,hmacSha256:Qn,md5:Xt};var Ya=qa.webcrypto||globalThis.crypto,Me=Ya.subtle,Jt=new TextEncoder;function Xn(t){return Ya.getRandomValues(Buffer.alloc(t))}async function Xt(t){try{return qa.createHash("md5").update(t,"utf-8").digest("hex")}catch{let s=typeof t=="string"?Jt.encode(t):t,a=await Me.digest("MD5",s);return Array.from(new Uint8Array(a)).map(r=>r.toString(16).padStart(2,"0")).join("")}}async function Jn(t,e,s){var a=await Xt(e+t),r=await Xt(Buffer.concat([Buffer.from(a),s]));return"md5"+r}async function zn(t){return await Me.digest("SHA-256",t)}async function Qn(t,e){let s=await Me.importKey("raw",t,{name:"HMAC",hash:"SHA-256"},!1,["sign"]);return await Me.sign("HMAC",s,Jt.encode(e))}async function Zn(t,e,s){let a=await Me.importKey("raw",Jt.encode(t),"PBKDF2",!1,["deriveBits"]),r={name:"PBKDF2",hash:"SHA-256",salt:e,iterations:s};return await Me.deriveBits(r,a,32*8,["deriveBits"])}});var Qt=R((Rc,zt)=>{"use strict";var eo=parseInt(process.versions&&process.versions.node&&process.versions.node.split(".")[0])<15;eo?zt.exports=Ga():zt.exports=Ka()});var za=R((hc,Ja)=>{"use strict";var ye=Qt();function to(t){if(t.indexOf("SCRAM-SHA-256")===-1)throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");let e=ye.randomBytes(18).toString("base64");return{mechanism:"SCRAM-SHA-256",clientNonce:e,response:"n,,n=*,r="+e,message:"SASLInitialResponse"}}async function so(t,e,s){if(t.message!=="SASLInitialResponse")throw new Error("SASL: Last message was not SASLInitialResponse");if(typeof e!="string")throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");if(e==="")throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string");if(typeof s!="string")throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");let a=io(s);if(a.nonce.startsWith(t.clientNonce)){if(a.nonce.length===t.clientNonce.length)throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");var r="n=*,r="+t.clientNonce,i="r="+a.nonce+",s="+a.salt+",i="+a.iteration,n="c=biws,r="+a.nonce,o=r+","+i+","+n,E=Buffer.from(a.salt,"base64"),_=await ye.deriveKey(e,E,a.iteration),c=await ye.hmacSha256(_,"Client Key"),l=await ye.sha256(c),d=await ye.hmacSha256(l,o),u=oo(Buffer.from(c),Buffer.from(d)).toString("base64"),h=await ye.hmacSha256(_,"Server Key"),I=await ye.hmacSha256(h,o);t.message="SASLResponse",t.serverSignature=Buffer.from(I).toString("base64"),t.response=n+",p="+u}function ao(t,e){if(t.message!=="SASLResponse")throw new Error("SASL: Last message was not SASLResponse");if(typeof e!="string")throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");let{serverSignature:s}=no(e);if(s!==t.serverSignature)throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match")}function ro(t){if(typeof t!="string")throw new TypeError("SASL: text must be a string");return t.split("").map((e,s)=>t.charCodeAt(s)).every(e=>e>=33&&e<=43||e>=45&&e<=126)}function Va(t){return/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(t)}function Xa(t){if(typeof t!="string")throw new TypeError("SASL: attribute pairs text must be a string");return new Map(t.split(",").map(e=>{if(!/^.=/.test(e))throw new Error("SASL: Invalid attribute pair entry");let s=e[0],a=e.substring(2);return[s,a]}))}function io(t){let e=Xa(t),s=e.get("r");if(s){if(!ro(s))throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");let a=e.get("s");if(a){if(!Va(a))throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");let r=e.get("i");if(r){if(!/^[1-9][0-9]*$/.test(r))throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");let i=parseInt(r,10);return{nonce:s,salt:a,iteration:i}}function no(t){let s=Xa(t).get("v");if(s){if(!Va(s))throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64")}else throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");return{serverSignature:s}}function oo(t,e){if(!Buffer.isBuffer(t))throw new TypeError("first argument must be a Buffer");if(!Buffer.isBuffer(e))throw new TypeError("second argument must be a Buffer");if(t.length!==e.length)throw new Error("Buffer lengths must match");if(t.length===0)throw new Error("Buffers cannot be empty");return Buffer.from(t.map((s,a)=>t[a]^e[a]))}Ja.exports={startSession:to,continueSession:so,finalizeSession:ao}});var Zt=R((Ic,Qa)=>{"use strict";var _o=et();function ht(t){this._types=t||_o,this.text={},this.binary={}}ht.prototype.getOverrides=function(t){switch(t){case"text":return this.text;case"binary":return this.binary;default:return{}}};ht.prototype.setTypeParser=function(t,e,s){typeof e=="function"&&(s=e,e="text"),this.getOverrides(e)[t]=s};ht.prototype.getTypeParser=function(t,e){return e=e||"text",this.getOverrides(e)[t]||this._types.getTypeParser(t,e)};Qa.exports=ht});var tr=R((Oc,er)=>{"use strict";function we(t,e={}){if(t.charAt(0)==="/"){let E=t.split(" ");return{host:E[0],database:E[1]}}let s=Object.create(null),a,r=!1;/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(t)&&(t=encodeURI(t).replace(/%25(\d\d)/g,"%$1"));try{try{a=new URL(t,"postgres://base")}catch{a=new URL(t.replace("@/","@___DUMMY___/"),"postgres://base"),r=!0}}catch(E){throw E.input&&(E.input="*****REDACTED*****"),E}for(let E of a.searchParams.entries())s[E[0]]=E[1];if(s.user=s.user||decodeURIComponent(a.username),s.password=s.password||decodeURIComponent(a.password),a.protocol=="socket:")return s.host=decodeURI(a.pathname),s.database=a.searchParams.get("db"),s.client_encoding=a.searchParams.get("encoding"),s;let i=(r?"":a.hostname).replace(/^\[(.+)\]$/,"$1");s.host?i&&/^%2f/i.test(i)&&(a.pathname=i+a.pathname):s.host=decodeURIComponent(i),s.port||(s.port=a.port);let n=a.pathname.slice(1)||null;s.database=n?decodeURI(n):null,(s.ssl==="true"||s.ssl==="1")&&(s.ssl=!0),s.ssl==="0"&&(s.ssl=!1),(s.sslcert||s.sslkey||s.sslrootcert||s.sslmode)&&(s.ssl={}),s.sslnegotiation==="direct"&&s.ssl===void 0&&(s.ssl=!0);let o=s.sslcert||s.sslkey||s.sslrootcert?k("fs"):null;if(s.sslcert&&(s.ssl.cert=o.readFileSync(s.sslcert).toString()),s.sslkey&&(s.ssl.key=o.readFileSync(s.sslkey).toString()),s.sslrootcert&&(s.ssl.ca=o.readFileSync(s.sslrootcert).toString()),e.useLibpqCompat&&s.uselibpqcompat)throw new Error("Both useLibpqCompat and uselibpqcompat are set. Please use only one of them.");if(s.uselibpqcompat==="true"||e.useLibpqCompat)switch(s.sslmode){case"disable":{s.ssl=!1;break}case"prefer":{s.ssl.rejectUnauthorized=!1;break}case"require":{s.sslrootcert?s.ssl.checkServerIdentity=function(){}:s.ssl.rejectUnauthorized=!1;break}case"verify-ca":{if(!s.ssl.ca)throw new Error("SECURITY WARNING: Using sslmode=verify-ca requires specifying a CA with sslrootcert. If a public CA is used, verify-ca allows connections to a server that somebody else may have registered with the CA, making you vulnerable to Man-in-the-Middle attacks. Either specify a custom CA certificate with sslrootcert parameter or use sslmode=verify-full for proper security.");s.ssl.checkServerIdentity=function(){};break}case"verify-full":break}else switch(s.sslmode){case"disable":{s.ssl=!1;break}case"prefer":case"require":case"verify-ca":case"verify-full":{s.sslmode!=="verify-full"&&es(s.sslmode);break}case"no-verify":{s.ssl.rejectUnauthorized=!1;break}}return s}function Eo(t){return Object.entries(t).reduce((s,[a,r])=>(r!=null&&(s[a]=r),s),Object.create(null))}function Za(t){return Object.entries(t).reduce((s,[a,r])=>{if(a==="ssl"){let i=r;typeof i=="boolean"&&(s[a]=i),typeof i=="object"&&(s[a]=Eo(i))}else if(r!=null)if(a==="port"){if(r!==""){let i=parseInt(r,10);if(isNaN(i))throw new Error(`Invalid ${a}: ${r}`);s[a]=i}}else s[a]=r;return s},Object.create(null))}function co(t){return Za(we(t))}function es(t){!es.warned&&typeof process<"u"&&process.emitWarning&&(es.warned=!0,process.emitWarning(`SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=${t}'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.`))}er.exports=we;we.parse=we;we.toClientConfig=Za;we.parseIntoClientConfig=co});var ss=R((bc,rr)=>{"use strict";var lo=k("dns"),ar=tt(),sr=tr().parse,Z=function(t,e,s){return s===void 0?s=process.env["PG"+t.toUpperCase()]:s===!1||(s=process.env[s]),e[t]||s||ar[t]},uo=function(){switch(process.env.PGSSLMODE){case"disable":return!1;case"prefer":case"require":case"verify-ca":case"verify-full":return!0;case"no-verify":return{rejectUnauthorized:!1}}return ar.ssl},ke=function(t){return"'"+(""+t).replace(/\\/g,"\\\\").replace(/'/g,"\\'")+"'"},ue=function(t,e,s){var a=e[s];a!=null&&t.push(s+"="+ke(a))},ts=class{constructor(e){e=typeof e=="string"?sr(e):e||{},e.connectionString&&(e=Object.assign({},e,sr(e.connectionString))),this.user=Z("user",e),this.database=Z("database",e),this.database===void 0&&(this.database=this.user),this.port=parseInt(Z("port",e),10),this.host=Z("host",e),Object.defineProperty(this,"password",{configurable:!0,enumerable:!1,writable:!0,value:Z("password",e)}),this.binary=Z("binary",e),this.options=Z("options",e),this.ssl=typeof e.ssl>"u"?uo():e.ssl,typeof this.ssl=="string"&&this.ssl==="true"&&(this.ssl=!0),this.ssl==="no-verify"&&(this.ssl={rejectUnauthorized:!1}),this.ssl&&this.ssl.key&&Object.defineProperty(this.ssl,"key",{enumerable:!1}),this.client_encoding=Z("client_encoding",e),this.replication=Z("replication",e),this.isDomainSocket=!(this.host||"").indexOf("/"),this.application_name=Z("application_name",e,"PGAPPNAME"),this.fallback_application_name=Z("fallback_application_name",e,!1),this.statement_timeout=Z("statement_timeout",e,!1),this.lock_timeout=Z("lock_timeout",e,!1),this.idle_in_transaction_session_timeout=Z("idle_in_transaction_session_timeout",e,!1),this.query_timeout=Z("query_timeout",e,!1),e.connectionTimeoutMillis===void 0?this.connect_timeout=process.env.PGCONNECT_TIMEOUT||0:this.connect_timeout=Math.floor(e.connectionTimeoutMillis/1e3),e.keepAlive===!1?this.keepalives=0:e.keepAlive===!0&&(this.keepalives=1),typeof e.keepAliveInitialDelayMillis=="number"&&(this.keepalives_idle=Math.floor(e.keepAliveInitialDelayMillis/1e3))}getLibpqConnectionString(e){var s=[];ue(s,this,"user"),ue(s,this,"password"),ue(s,this,"port"),ue(s,this,"application_name"),ue(s,this,"fallback_application_name"),ue(s,this,"connect_timeout"),ue(s,this,"options");var a=typeof this.ssl=="object"?this.ssl:this.ssl?{sslmode:this.ssl}:{};if(ue(s,a,"sslmode"),ue(s,a,"sslca"),ue(s,a,"sslkey"),ue(s,a,"sslcert"),ue(s,a,"sslrootcert"),this.database&&s.push("dbname="+ke(this.database)),this.replication&&s.push("replication="+ke(this.replication)),this.host&&s.push("host="+ke(this.host)),this.isDomainSocket)return e(null,s.join(" "));this.client_encoding&&s.push("client_encoding="+ke(this.client_encoding)),lo.lookup(this.host,function(r,i){return r?e(r,null):(s.push("hostaddr="+ke(i)),e(null,s.join(" ")))})}};rr.exports=ts});var or=R((Lc,nr)=>{"use strict";var No=et(),ir=/^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/,as=class{constructor(e,s){this.command=null,this.rowCount=null,this.oid=null,this.rows=[],this.fields=[],this._parsers=void 0,this._types=s,this.RowCtor=null,this.rowAsArray=e==="array",this.rowAsArray&&(this.parseRow=this._parseRowAsArray),this._prebuiltEmptyResultObject=null}addCommandComplete(e){var s;e.text?s=ir.exec(e.text):s=ir.exec(e.command),s&&(this.command=s[1],s[3]?(this.oid=parseInt(s[2],10),this.rowCount=parseInt(s[3],10)):s[2]&&(this.rowCount=parseInt(s[2],10)))}_parseRowAsArray(e){for(var s=new Array(e.length),a=0,r=e.length;a<r;a++){var i=e[a];i!==null?s[a]=this._parsers[a](i):s[a]=null}return s}parseRow(e){for(var s={...this._prebuiltEmptyResultObject},a=0,r=e.length;a<r;a++){var i=e[a],n=this.fields[a].name;i!==null?s[n]=this._parsers[a](i):s[n]=null}return s}addRow(e){this.rows.push(e)}addFields(e){this.fields=e,this.fields.length&&(this._parsers=new Array(e.length));for(var s={},a=0;a<e.length;a++){var r=e[a];s[r.name]=null,this._types?this._parsers[a]=this._types.getTypeParser(r.dataTypeID,r.format||"text"):this._parsers[a]=No.getTypeParser(r.dataTypeID,r.format||"text")}this._prebuiltEmptyResultObject={...s}}};nr.exports=as});var lr=R((vc,cr)=>{"use strict";var{EventEmitter:po}=k("events"),_r=or(),Er=st(),rs=class extends po{constructor(e,s,a){super(),e=Er.normalizeQueryConfig(e,s,a),this.text=e.text,this.values=e.values,this.rows=e.rows,this.types=e.types,this.name=e.name,this.queryMode=e.queryMode,this.binary=e.binary,this.portal=e.portal||"",this.callback=e.callback,this._rowMode=e.rowMode,process.domain&&e.callback&&(this.callback=process.domain.bind(e.callback)),this._result=new _r(this._rowMode,this.types),this._results=this._result,this._canceledDueToError=!1}requiresPreparation(){return this.queryMode==="extended"||this.name||this.rows?!0:!this.text||!this.values?!1:this.values.length>0}_checkForMultirow(){this._result.command&&(Array.isArray(this._results)||(this._results=[this._result]),this._result=new _r(this._rowMode,this._result._types),this._results.push(this._result))}handleRowDescription(e){this._checkForMultirow(),this._result.addFields(e.fields),this._accumulateRows=this.callback||!this.listeners("row").length}handleDataRow(e){let s;if(!this._canceledDueToError){try{s=this._result.parseRow(e.fields)}catch(a){this._canceledDueToError=a;return}this.emit("row",s,this._result),this._accumulateRows&&this._result.addRow(s)}}handleCommandComplete(e,s){this._checkForMultirow(),this._result.addCommandComplete(e),this.rows&&s.sync()}handleEmptyQuery(e){this.rows&&e.sync()}handleError(e,s){if(this._canceledDueToError&&(e=this._canceledDueToError,this._canceledDueToError=!1),this.callback)return this.callback(e);this.emit("error",e)}handleReadyForQuery(e){if(this._canceledDueToError)return this.handleError(this._canceledDueToError,e);if(this.callback)try{this.callback(null,this._results)}catch(s){process.nextTick(()=>{throw s})}this.emit("end",this._results)}submit(e){if(typeof this.text!="string"&&typeof this.name!="string")return new Error("A query must have either text or a name. Supplying neither is unsupported.");let s=e.parsedStatements[this.name];return this.text&&s&&this.text!==s?new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`):this.values&&!Array.isArray(this.values)?new Error("Query values must be an array"):(this.requiresPreparation()?this.prepare(e):e.query(this.text),null)}hasBeenParsed(e){return this.name&&e.parsedStatements[this.name]}handlePortalSuspended(e){this._getRows(e,this.rows)}_getRows(e,s){e.execute({portal:this.portal,rows:s}),s?e.flush():e.sync()}prepare(e){this.hasBeenParsed(e)||e.parse({text:this.text,name:this.name,types:this.types});try{e.bind({portal:this.portal,statement:this.name,values:this.values,binary:this.binary,valueMapper:Er.prepareValue})}catch(s){this.handleError(s,e);return}e.describe({type:"P",name:this.portal||""}),this._getRows(e,this.rows)}handleCopyInResponse(e){e.sendCopyFail("No source stream defined")}handleCopyData(e,s){}};cr.exports=rs});var hs=R(N=>{"use strict";Object.defineProperty(N,"__esModule",{value:!0});N.NoticeMessage=N.DataRowMessage=N.CommandCompleteMessage=N.ReadyForQueryMessage=N.NotificationResponseMessage=N.BackendKeyDataMessage=N.AuthenticationMD5Password=N.ParameterStatusMessage=N.ParameterDescriptionMessage=N.RowDescriptionMessage=N.Field=N.CopyResponse=N.CopyDataMessage=N.DatabaseError=N.copyDone=N.emptyQuery=N.replicationStart=N.portalSuspended=N.noData=N.closeComplete=N.bindComplete=N.parseComplete=void 0;N.parseComplete={name:"parseComplete",length:5};N.bindComplete={name:"bindComplete",length:5};N.closeComplete={name:"closeComplete",length:5};N.noData={name:"noData",length:5};N.portalSuspended={name:"portalSuspended",length:5};N.replicationStart={name:"replicationStart",length:4};N.emptyQuery={name:"emptyQuery",length:4};N.copyDone={name:"copyDone",length:4};var is=class extends Error{constructor(e,s,a){super(e),this.length=s,this.name=a}};N.DatabaseError=is;var ns=class{constructor(e,s){this.length=e,this.chunk=s,this.name="copyData"}};N.CopyDataMessage=ns;var os=class{constructor(e,s,a,r){this.length=e,this.name=s,this.binary=a,this.columnTypes=new Array(r)}};N.CopyResponse=os;var _s=class{constructor(e,s,a,r,i,n,o){this.name=e,this.tableID=s,this.columnID=a,this.dataTypeID=r,this.dataTypeSize=i,this.dataTypeModifier=n,this.format=o}};N.Field=_s;var Es=class{constructor(e,s){this.length=e,this.fieldCount=s,this.name="rowDescription",this.fields=new Array(this.fieldCount)}};N.RowDescriptionMessage=Es;var cs=class{constructor(e,s){this.length=e,this.parameterCount=s,this.name="parameterDescription",this.dataTypeIDs=new Array(this.parameterCount)}};N.ParameterDescriptionMessage=cs;var ls=class{constructor(e,s,a){this.length=e,this.parameterName=s,this.parameterValue=a,this.name="parameterStatus"}};N.ParameterStatusMessage=ls;var ds=class{constructor(e,s){this.length=e,this.salt=s,this.name="authenticationMD5Password"}};N.AuthenticationMD5Password=ds;var us=class{constructor(e,s,a){this.length=e,this.processID=s,this.secretKey=a,this.name="backendKeyData"}};N.BackendKeyDataMessage=us;var Ns=class{constructor(e,s,a,r){this.length=e,this.processId=s,this.channel=a,this.payload=r,this.name="notification"}};N.NotificationResponseMessage=Ns;var ps=class{constructor(e,s){this.length=e,this.status=s,this.name="readyForQuery"}};N.ReadyForQueryMessage=ps;var Ts=class{constructor(e,s){this.length=e,this.text=s,this.name="commandComplete"}};N.CommandCompleteMessage=Ts;var ms=class{constructor(e,s){this.length=e,this.fields=s,this.name="dataRow",this.fieldCount=s.length}};N.DataRowMessage=ms;var Rs=class{constructor(e,s){this.length=e,this.message=s,this.name="notice"}};N.NoticeMessage=Rs});var dr=R(It=>{"use strict";Object.defineProperty(It,"__esModule",{value:!0});It.Writer=void 0;var Is=class{constructor(e=256){this.size=e,this.offset=5,this.headerPosition=0,this.buffer=Buffer.allocUnsafe(e)}ensure(e){if(this.buffer.length-this.offset<e){let a=this.buffer,r=a.length+(a.length>>1)+e;this.buffer=Buffer.allocUnsafe(r),a.copy(this.buffer,0,0,this.offset)}}addInt32(e){return this.ensure(4),this.buffer[this.offset++]=e>>>24&255,this.buffer[this.offset++]=e>>>16&255,this.buffer[this.offset++]=e>>>8&255,this.buffer[this.offset++]=e>>>0&255,this}addInt16(e){return this.ensure(2),this.buffer[this.offset++]=e>>>8&255,this.buffer[this.offset++]=e>>>0&255,this}addCString(e){if(!e)this.ensure(1);else{let s=Buffer.byteLength(e);this.ensure(s+1),this.buffer.write(e,this.offset,"utf-8"),this.offset+=s}return this.buffer[this.offset++]=0,this}addString(e=""){let s=Buffer.byteLength(e);return this.ensure(s),this.buffer.write(e,this.offset),this.offset+=s,this}addInt32PrefixedString(e){let s=Buffer.byteLength(e);this.ensure(4+s);let a=this.buffer,r=this.offset;return a[r++]=s>>>24&255,a[r++]=s>>>16&255,a[r++]=s>>>8&255,a[r++]=s>>>0&255,a.write(e,r,"utf-8"),this.offset=r+s,this}add(e){return this.ensure(e.length),e.copy(this.buffer,this.offset),this.offset+=e.length,this}reserveUnsafe(e){let s=this.offset;return this.ensure(e),this.offset+=e,s}join(e){if(e){this.buffer[this.headerPosition]=e;let s=this.offset-(this.headerPosition+1);this.buffer.writeInt32BE(s,this.headerPosition+1)}return this.buffer.slice(e?0:5,this.offset)}flush(e){let s=this.join(e);return this.offset=5,this.headerPosition=0,this.buffer=Buffer.allocUnsafe(this.size),s}clear(){this.offset=5,this.headerPosition=0}};It.Writer=Is});var pr=R(bt=>{"use strict";Object.defineProperty(bt,"__esModule",{value:!0});bt.serialize=void 0;var ur=dr(),f=new ur.Writer,To=t=>{f.addInt16(3).addInt16(0);for(let a of Object.keys(t))f.addCString(a).addCString(t[a]);f.addCString("client_encoding").addCString("UTF8");let e=f.addCString("").flush(),s=e.length+4;return new ur.Writer().addInt32(s).add(e).flush()},mo=()=>{let t=Buffer.allocUnsafe(8);return t.writeInt32BE(8,0),t.writeInt32BE(80877103,4),t},Ro=t=>f.addCString(t).flush(112),ho=function(t,e){return f.addCString(t).addInt32PrefixedString(e),f.flush(112)},Io=function(t){return f.addString(t).flush(112)},Oo=t=>f.addCString(t).flush(81),Nr=[],bo=t=>{let e=t.name||"";e.length>63&&(console.error("Warning! Postgres only supports 63 characters for query names."),console.error("You supplied %s (%s)",e,e.length),console.error("This can cause conflicts and silent errors executing queries"));let s=t.types||Nr,a=s.length,r=f.addCString(e).addCString(t.text).addInt16(a);for(let i=0;i<a;i++)r.addInt32(s[i]);return f.flush(80)},Lo=function(t,e,s){let a=t.length;for(let r=0;r<a;r++){let i=e?e(t[r],r):t[r],n=0;i==null?f.addInt32(-1):i instanceof Buffer?(n=1,f.addInt32(i.length),f.add(i)):f.addInt32PrefixedString(i);let o=f.buffer;o[s++]=0,o[s++]=n}},vo=(t={})=>{let e=t.portal||"",s=t.statement||"",a=t.binary||!1,r=t.values||Nr,i=r.length;f.addCString(e).addCString(s),f.addInt16(i);let n=f.reserveUnsafe(i*2);f.addInt16(i);try{Lo(r,t.valueMapper,n)}catch(o){throw f.clear(),o}return f.addInt16(1),f.addInt16(a?1:0),f.flush(66)},Ao=Buffer.from([69,0,0,0,9,0,0,0,0,0]),fo=t=>{if(!t||!t.portal&&!t.rows)return Ao;let e=t.portal||"",s=t.rows||0,a=Buffer.byteLength(e),r=4+a+1+4,i=Buffer.allocUnsafe(1+r);return i[0]=69,i.writeInt32BE(r,1),i.write(e,5,"utf-8"),i[a+5]=0,i.writeUInt32BE(s,i.length-4),i},So=(t,e)=>{let s=Buffer.allocUnsafe(16);return s.writeInt32BE(16,0),s.writeInt16BE(1234,4),s.writeInt16BE(5678,6),s.writeInt32BE(t,8),s.writeInt32BE(e,12),s},Os=(t,e)=>{let a=4+Buffer.byteLength(e)+1,r=Buffer.allocUnsafe(1+a);return r[0]=t,r.writeInt32BE(a,1),r.write(e,5,"utf-8"),r[a]=0,r},go=f.addCString("P").flush(68),Do=f.addCString("S").flush(68),yo=t=>t.name?Os(68,`${t.type}${t.name||""}`):t.type==="P"?go:Do,Co=t=>{let e=`${t.type}${t.name||""}`;return Os(67,e)},Fo=t=>f.add(t).flush(100),jo=t=>Os(102,t),Ot=t=>Buffer.from([t,0,0,0,4]),Uo=Ot(72),Po=Ot(83),Ho=Ot(88),Mo=Ot(99),wo={startup:To,password:Ro,requestSsl:mo,sendSASLInitialResponseMessage:ho,sendSCRAMClientFinalMessage:Io,query:Oo,parse:bo,bind:vo,execute:fo,describe:yo,close:Co,flush:()=>Uo,sync:()=>Po,end:()=>Ho,copyData:Fo,copyDone:()=>Mo,copyFail:jo,cancel:So};bt.serialize=wo});var Tr=R(Lt=>{"use strict";Object.defineProperty(Lt,"__esModule",{value:!0});Lt.BufferReader=void 0;var bs=class{constructor(e=0){this.offset=e,this.buffer=Buffer.allocUnsafe(0),this.encoding="utf-8"}setBuffer(e,s){this.offset=e,this.buffer=s}int16(){let e=this.buffer.readInt16BE(this.offset);return this.offset+=2,e}byte(){let e=this.buffer[this.offset];return this.offset++,e}int32(){let e=this.buffer.readInt32BE(this.offset);return this.offset+=4,e}uint32(){let e=this.buffer.readUInt32BE(this.offset);return this.offset+=4,e}string(e){let s=this.buffer.toString(this.encoding,this.offset,this.offset+e);return this.offset+=e,s}cstring(){let e=this.offset,s=e;for(;this.buffer[s++];);return this.offset=s,this.buffer.toString(this.encoding,e,s-1)}bytes(e){let s=this.buffer.slice(this.offset,this.offset+e);return this.offset+=e,s}};Lt.BufferReader=bs});var Ir=R(vt=>{"use strict";Object.defineProperty(vt,"__esModule",{value:!0});vt.Parser=void 0;var j=hs(),ko=Tr(),vs=1,xo=4,mr=vs+xo,Ee=-1,Ls=Buffer.allocUnsafe(0),As=class{constructor(e){if(this.buffer=Ls,this.bufferLength=0,this.bufferOffset=0,this.reader=new ko.BufferReader,e?.mode==="binary")throw new Error("Binary mode not supported yet");this.mode=e?.mode||"text"}parse(e,s){this.mergeBuffer(e);let a=this.bufferOffset+this.bufferLength,r=this.bufferOffset;for(;r+mr<=a;){let i=this.buffer[r],n=this.buffer.readUInt32BE(r+vs),o=vs+n;if(o+r<=a){let E=this.handlePacket(r+mr,i,n,this.buffer);s(E),r+=o}else break}r===a?(this.buffer=Ls,this.bufferLength=0,this.bufferOffset=0):(this.bufferLength=a-r,this.bufferOffset=r)}mergeBuffer(e){if(this.bufferLength>0){let s=this.bufferLength+e.byteLength;if(s+this.bufferOffset>this.buffer.byteLength){let r;if(s<=this.buffer.byteLength&&this.bufferOffset>=this.bufferLength)r=this.buffer;else{let i=this.buffer.byteLength*2;for(;s>=i;)i*=2;r=Buffer.allocUnsafe(i)}this.buffer.copy(r,0,this.bufferOffset,this.bufferOffset+this.bufferLength),this.buffer=r,this.bufferOffset=0}e.copy(this.buffer,this.bufferOffset+this.bufferLength),this.bufferLength=s}else this.buffer=e,this.bufferOffset=0,this.bufferLength=e.byteLength}handlePacket(e,s,a,r){let{reader:i}=this;i.setBuffer(e,r);let n;switch(s){case 50:n=j.bindComplete;break;case 49:n=j.parseComplete;break;case 51:n=j.closeComplete;break;case 110:n=j.noData;break;case 115:n=j.portalSuspended;break;case 99:n=j.copyDone;break;case 87:n=j.replicationStart;break;case 73:n=j.emptyQuery;break;case 68:n=Jo(i);break;case 67:n=Bo(i);break;case 90:n=Wo(i);break;case 65:n=$o(i);break;case 82:n=Zo(i,a);break;case 83:n=zo(i);break;case 75:n=Qo(i);break;case 69:n=Rr(i,"error");break;case 78:n=Rr(i,"notice");break;case 84:n=Ko(i);break;case 116:n=Xo(i);break;case 71:n=qo(i);break;case 72:n=Yo(i);break;case 100:n=Go(i,a);break;default:return new j.DatabaseError("received invalid response: "+s.toString(16),a,"error")}return i.setBuffer(0,Ls),n.length=a,n}};vt.Parser=As;var Wo=t=>{let e=t.string(1);return new j.ReadyForQueryMessage(Ee,e)},Bo=t=>{let e=t.cstring();return new j.CommandCompleteMessage(Ee,e)},Go=(t,e)=>{let s=t.bytes(e-4);return new j.CopyDataMessage(Ee,s)},qo=t=>hr(t,"copyInResponse"),Yo=t=>hr(t,"copyOutResponse"),hr=(t,e)=>{let s=t.byte()!==0,a=t.int16(),r=new j.CopyResponse(Ee,e,s,a);for(let i=0;i<a;i++)r.columnTypes[i]=t.int16();return r},$o=t=>{let e=t.int32(),s=t.cstring(),a=t.cstring();return new j.NotificationResponseMessage(Ee,e,s,a)},Ko=t=>{let e=t.int16(),s=new j.RowDescriptionMessage(Ee,e);for(let a=0;a<e;a++)s.fields[a]=Vo(t);return s},Vo=t=>{let e=t.cstring(),s=t.uint32(),a=t.int16(),r=t.uint32(),i=t.int16(),n=t.int32(),o=t.int16()===0?"text":"binary";return new j.Field(e,s,a,r,i,n,o)},Xo=t=>{let e=t.int16(),s=new j.ParameterDescriptionMessage(Ee,e);for(let a=0;a<e;a++)s.dataTypeIDs[a]=t.uint32();return s},Jo=t=>{let e=t.int16(),s=new Array(e);for(let a=0;a<e;a++){let r=t.int32();s[a]=r===-1?null:t.string(r)}return new j.DataRowMessage(Ee,s)},zo=t=>{let e=t.cstring(),s=t.cstring();return new j.ParameterStatusMessage(Ee,e,s)},Qo=t=>{let e=t.int32(),s=t.int32();return new j.BackendKeyDataMessage(Ee,e,s)},Zo=(t,e)=>{let s=t.int32(),a={name:"authenticationOk",length:e};switch(s){case 0:break;case 3:a.length===8&&(a.name="authenticationCleartextPassword");break;case 5:if(a.length===12){a.name="authenticationMD5Password";let r=t.bytes(4);return new j.AuthenticationMD5Password(Ee,r)}break;case 10:{a.name="authenticationSASL",a.mechanisms=[];let r;do r=t.cstring(),r&&a.mechanisms.push(r);while(r)}break;case 11:a.name="authenticationSASLContinue",a.data=t.string(e-8);break;case 12:a.name="authenticationSASLFinal",a.data=t.string(e-8);break;default:throw new Error("Unknown authenticationOk message type "+s)}return a},Rr=(t,e)=>{let s={},a=t.string(1);for(;a!=="\0";)s[a]=t.cstring(),a=t.string(1);let r=s.M,i=e==="notice"?new j.NoticeMessage(Ee,r):new j.DatabaseError(r,Ee,e);return i.severity=s.S,i.code=s.C,i.detail=s.D,i.hint=s.H,i.position=s.P,i.internalPosition=s.p,i.internalQuery=s.q,i.where=s.W,i.schema=s.s,i.table=s.t,i.column=s.c,i.dataType=s.d,i.constraint=s.n,i.file=s.F,i.line=s.L,i.routine=s.R,i}});var fs=R(Ce=>{"use strict";Object.defineProperty(Ce,"__esModule",{value:!0});Ce.DatabaseError=Ce.serialize=void 0;Ce.parse=a_;var e_=hs();Object.defineProperty(Ce,"DatabaseError",{enumerable:!0,get:function(){return e_.DatabaseError}});var t_=pr();Object.defineProperty(Ce,"serialize",{enumerable:!0,get:function(){return t_.serialize}});var s_=Ir();function a_(t,e){let s=new s_.Parser;return t.on("data",a=>s.parse(a,e)),new Promise(a=>t.on("end",()=>a()))}});var Or=R(Ss=>{"use strict";Object.defineProperty(Ss,"__esModule",{value:!0});Ss.default={}});var Lr=R((Fc,br)=>{var{getStream:r_,getSecureStream:i_}=E_();br.exports={getStream:r_,getSecureStream:i_};function n_(){function t(s){let a=k("net");return new a.Socket}function e(s){var a=k("tls");return a.connect(s)}return{getStream:t,getSecureStream:e}}function o_(){function t(s){let{CloudflareSocket:a}=Or();return new a(s)}function e(s){return s.socket.startTls(s),s.socket}return{getStream:t,getSecureStream:e}}function __(){if(typeof navigator=="object"&&navigator!==null&&typeof navigator.userAgent=="string")return navigator.userAgent==="Cloudflare-Workers";if(typeof Response=="function"){let t=new Response(null,{cf:{thing:!0}});if(typeof t.cf=="object"&&t.cf!==null&&t.cf.thing)return!0}return!1}function E_(){return __()?o_():n_()}});var Ds=R((jc,vr)=>{"use strict";var c_=k("events").EventEmitter,{parse:l_,serialize:$}=fs(),{getStream:d_,getSecureStream:u_}=Lr(),N_=$.flush(),p_=$.sync(),T_=$.end(),gs=class extends c_{constructor(e){super(),e=e||{},this.stream=e.stream||d_(e.ssl),typeof this.stream=="function"&&(this.stream=this.stream(e)),this._keepAlive=e.keepAlive,this._keepAliveInitialDelayMillis=e.keepAliveInitialDelayMillis,this.lastBuffer=!1,this.parsedStatements={},this.ssl=e.ssl||!1,this._ending=!1,this._emitMessage=!1;var s=this;this.on("newListener",function(a){a==="message"&&(s._emitMessage=!0)})}connect(e,s){var a=this;this._connecting=!0,this.stream.setNoDelay(!0),this.stream.connect(e,s),this.stream.once("connect",function(){a._keepAlive&&a.stream.setKeepAlive(!0,a._keepAliveInitialDelayMillis),a.emit("connect")});let r=function(i){a._ending&&(i.code==="ECONNRESET"||i.code==="EPIPE")||a.emit("error",i)};if(this.stream.on("error",r),this.stream.on("close",function(){a.emit("end")}),!this.ssl)return this.attachListeners(this.stream);this.stream.once("data",function(i){var n=i.toString("utf8");switch(n){case"S":break;case"N":return a.stream.end(),a.emit("error",new Error("The server does not support SSL connections"));default:return a.stream.end(),a.emit("error",new Error("There was an error establishing an SSL connection"))}let o={socket:a.stream};a.ssl!==!0&&(Object.assign(o,a.ssl),"key"in a.ssl&&(o.key=a.ssl.key));var E=k("net");E.isIP&&E.isIP(s)===0&&(o.servername=s);try{a.stream=u_(o)}catch(_){return a.emit("error",_)}a.attachListeners(a.stream),a.stream.on("error",r),a.emit("sslconnect")})}attachListeners(e){l_(e,s=>{var a=s.name==="error"?"errorMessage":s.name;this._emitMessage&&this.emit("message",s),this.emit(a,s)})}requestSsl(){this.stream.write($.requestSsl())}startup(e){this.stream.write($.startup(e))}cancel(e,s){this._send($.cancel(e,s))}password(e){this._send($.password(e))}sendSASLInitialResponseMessage(e,s){this._send($.sendSASLInitialResponseMessage(e,s))}sendSCRAMClientFinalMessage(e){this._send($.sendSCRAMClientFinalMessage(e))}_send(e){return this.stream.writable?this.stream.write(e):!1}query(e){this._send($.query(e))}parse(e){this._send($.parse(e))}bind(e){this._send($.bind(e))}execute(e){this._send($.execute(e))}flush(){this.stream.writable&&this.stream.write(N_)}sync(){this._ending=!0,this._send(p_)}ref(){this.stream.ref()}unref(){this.stream.unref()}end(){if(this._ending=!0,!this._connecting||!this.stream.writable){this.stream.end();return}return this.stream.write(T_,()=>{this.stream.end()})}close(e){this._send($.close(e))}describe(e){this._send($.describe(e))}sendCopyFromChunk(e){this._send($.copyData(e))}endCopyFrom(){this._send($.copyDone())}sendCopyFail(e){this._send($.copyFail(e))}};vr.exports=gs});var Sr=R((Uc,be)=>{"use strict";var Ar=k("path"),m_=k("stream").Stream,R_=k("readline").createInterface,fr=k("util"),h_=5432,At=process.platform==="win32",rt=process.stderr,I_=56,O_=7,b_=61440,L_=32768;function v_(t){return(t&b_)==L_}var xe=["host","port","database","user","password"],ys=xe.length,A_=xe[ys-1];function Cs(){var t=rt instanceof m_&&rt.writable===!0;if(t){var e=Array.prototype.slice.call(arguments).concat(`
`);rt.write(fr.format.apply(fr,e))}}Object.defineProperty(be.exports,"isWin",{get:function(){return At},set:function(t){At=t}});be.exports.warnTo=function(t){var e=rt;return rt=t,e};be.exports.getFileName=function(t){var e=t||process.env,s=e.PGPASSFILE||(At?Ar.join(e.APPDATA||"./","postgresql","pgpass.conf"):Ar.join(e.HOME||"./",".pgpass"));return s};be.exports.usePgPass=function(t,e){return Object.prototype.hasOwnProperty.call(process.env,"PGPASSWORD")?!1:At?!0:(e=e||"<unkn>",v_(t.mode)?t.mode&(I_|O_)?(Cs('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less',e),!1):!0:(Cs('WARNING: password file "%s" is not a plain file',e),!1))};var f_=be.exports.match=function(t,e){return xe.slice(0,-1).reduce(function(s,a,r){return r==1&&Number(t[a]||h_)===Number(e[a])?s&&!0:s&&(e[a]==="*"||e[a]===t[a])},!0)};be.exports.getPassword=function(t,e,s){var a,r=!1,i=R_({input:e,crlfDelay:1/0});function n(c){r=!0,e.destroy(),s(c)}function o(c){var l=S_(c);l&&g_(l)&&f_(t,l)&&(a=l[A_],i.close())}var E=function(){r||n(a)},_=function(c){r||(Cs("WARNING: error on reading file: %s",c),n(void 0))};e.on("error",_),i.on("line",o).on("close",E).on("error",_)};var S_=be.exports.parseLine=function(t){if(t.length<11||t.match(/^\s+#/))return null;for(var e="",s="",a=0,r=0,i=0,n={},o=!1,E=function(c,l,d){var u=t.substring(l,d);Object.hasOwnProperty.call(process.env,"PGPASS_NO_DEESCAPE")||(u=u.replace(/\\([:\\])/g,"$1")),n[xe[c]]=u},_=0;_<t.length-1;_+=1){if(e=t.charAt(_+1),s=t.charAt(_),o=a==ys-1,o){E(a,r);break}_>=0&&e==":"&&s!=="\\"&&(E(a,r,_+1),r=_+2,a+=1)}return n=Object.keys(n).length===ys?n:null,n},g_=be.exports.isValidEntry=function(t){for(var e={0:function(n){return n.length>0},1:function(n){return n==="*"?!0:(n=Number(n),isFinite(n)&&n>0&&n<9007199254740992&&Math.floor(n)===n)},2:function(n){return n.length>0},3:function(n){return n.length>0},4:function(n){return n.length>0}},s=0;s<xe.length;s+=1){var a=e[s],r=t[xe[s]]||"",i=a(r);if(!i)return!1}return!0}});var Dr=R((Hc,Fs)=>{"use strict";var Pc=k("path"),gr=k("fs"),ft=Sr();Fs.exports=function(t,e){var s=ft.getFileName();gr.stat(s,function(a,r){if(a||!ft.usePgPass(r,s))return e(void 0);var i=gr.createReadStream(s);ft.getPassword(t,i,e)})};Fs.exports.warnTo=ft.warnTo});var jr=R((Mc,Fr)=>{"use strict";var D_=k("events").EventEmitter,yr=st(),js=za(),y_=Zt(),C_=ss(),Cr=lr(),F_=tt(),j_=Ds(),U_=Qt(),St=class extends D_{constructor(e){super(),this.connectionParameters=new C_(e),this.user=this.connectionParameters.user,this.database=this.connectionParameters.database,this.port=this.connectionParameters.port,this.host=this.connectionParameters.host,Object.defineProperty(this,"password",{configurable:!0,enumerable:!1,writable:!0,value:this.connectionParameters.password}),this.replication=this.connectionParameters.replication;var s=e||{};this._Promise=s.Promise||global.Promise,this._types=new y_(s.types),this._ending=!1,this._ended=!1,this._connecting=!1,this._connected=!1,this._connectionError=!1,this._queryable=!0,this.connection=s.connection||new j_({stream:s.stream,ssl:this.connectionParameters.ssl,keepAlive:s.keepAlive||!1,keepAliveInitialDelayMillis:s.keepAliveInitialDelayMillis||0,encoding:this.connectionParameters.client_encoding||"utf8"}),this.queryQueue=[],this.binary=s.binary||F_.binary,this.processID=null,this.secretKey=null,this.ssl=this.connectionParameters.ssl||!1,this.ssl&&this.ssl.key&&Object.defineProperty(this.ssl,"key",{enumerable:!1}),this._connectionTimeoutMillis=s.connectionTimeoutMillis||0}_errorAllQueries(e){let s=a=>{process.nextTick(()=>{a.handleError(e,this.connection)})};this.activeQuery&&(s(this.activeQuery),this.activeQuery=null),this.queryQueue.forEach(s),this.queryQueue.length=0}_connect(e){var s=this,a=this.connection;if(this._connectionCallback=e,this._connecting||this._connected){let r=new Error("Client has already been connected. You cannot reuse a client.");process.nextTick(()=>{e(r)});return}this._connecting=!0,this._connectionTimeoutMillis>0&&(this.connectionTimeoutHandle=setTimeout(()=>{a._ending=!0,a.stream.destroy(new Error("timeout expired"))},this._connectionTimeoutMillis)),this.host&&this.host.indexOf("/")===0?a.connect(this.host+"/.s.PGSQL."+this.port):a.connect(this.port,this.host),a.on("connect",function(){s.ssl?a.requestSsl():a.startup(s.getStartupConf())}),a.on("sslconnect",function(){a.startup(s.getStartupConf())}),this._attachListeners(a),a.once("end",()=>{let r=this._ending?new Error("Connection terminated"):new Error("Connection terminated unexpectedly");clearTimeout(this.connectionTimeoutHandle),this._errorAllQueries(r),this._ended=!0,this._ending||(this._connecting&&!this._connectionError?this._connectionCallback?this._connectionCallback(r):this._handleErrorEvent(r):this._connectionError||this._handleErrorEvent(r)),process.nextTick(()=>{this.emit("end")})})}connect(e){if(e){this._connect(e);return}return new this._Promise((s,a)=>{this._connect(r=>{r?a(r):s()})})}_attachListeners(e){e.on("authenticationCleartextPassword",this._handleAuthCleartextPassword.bind(this)),e.on("authenticationMD5Password",this._handleAuthMD5Password.bind(this)),e.on("authenticationSASL",this._handleAuthSASL.bind(this)),e.on("authenticationSASLContinue",this._handleAuthSASLContinue.bind(this)),e.on("authenticationSASLFinal",this._handleAuthSASLFinal.bind(this)),e.on("backendKeyData",this._handleBackendKeyData.bind(this)),e.on("error",this._handleErrorEvent.bind(this)),e.on("errorMessage",this._handleErrorMessage.bind(this)),e.on("readyForQuery",this._handleReadyForQuery.bind(this)),e.on("notice",this._handleNotice.bind(this)),e.on("rowDescription",this._handleRowDescription.bind(this)),e.on("dataRow",this._handleDataRow.bind(this)),e.on("portalSuspended",this._handlePortalSuspended.bind(this)),e.on("emptyQuery",this._handleEmptyQuery.bind(this)),e.on("commandComplete",this._handleCommandComplete.bind(this)),e.on("parseComplete",this._handleParseComplete.bind(this)),e.on("copyInResponse",this._handleCopyInResponse.bind(this)),e.on("copyData",this._handleCopyData.bind(this)),e.on("notification",this._handleNotification.bind(this))}_checkPgPass(e){let s=this.connection;if(typeof this.password=="function")this._Promise.resolve().then(()=>this.password()).then(a=>{if(a!==void 0){if(typeof a!="string"){s.emit("error",new TypeError("Password must be a string"));return}this.connectionParameters.password=this.password=a}else this.connectionParameters.password=this.password=null;e()}).catch(a=>{s.emit("error",a)});else if(this.password!==null)e();else try{Dr()(this.connectionParameters,r=>{r!==void 0&&(this.connectionParameters.password=this.password=r),e()})}catch(a){this.emit("error",a)}}_handleAuthCleartextPassword(e){this._checkPgPass(()=>{this.connection.password(this.password)})}_handleAuthMD5Password(e){this._checkPgPass(async()=>{try{let s=await U_.postgresMd5PasswordHash(this.user,this.password,e.salt);this.connection.password(s)}catch(s){this.emit("error",s)}})}_handleAuthSASL(e){this._checkPgPass(()=>{try{this.saslSession=js.startSession(e.mechanisms),this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism,this.saslSession.response)}catch(s){this.connection.emit("error",s)}})}async _handleAuthSASLContinue(e){try{await js.continueSession(this.saslSession,this.password,e.data),this.connection.sendSCRAMClientFinalMessage(this.saslSession.response)}catch(s){this.connection.emit("error",s)}}_handleAuthSASLFinal(e){try{js.finalizeSession(this.saslSession,e.data),this.saslSession=null}catch(s){this.connection.emit("error",s)}}_handleBackendKeyData(e){this.processID=e.processID,this.secretKey=e.secretKey}_handleReadyForQuery(e){this._connecting&&(this._connecting=!1,this._connected=!0,clearTimeout(this.connectionTimeoutHandle),this._connectionCallback&&(this._connectionCallback(null,this),this._connectionCallback=null),this.emit("connect"));let{activeQuery:s}=this;this.activeQuery=null,this.readyForQuery=!0,s&&s.handleReadyForQuery(this.connection),this._pulseQueryQueue()}_handleErrorWhileConnecting(e){if(!this._connectionError){if(this._connectionError=!0,clearTimeout(this.connectionTimeoutHandle),this._connectionCallback)return this._connectionCallback(e);this.emit("error",e)}}_handleErrorEvent(e){if(this._connecting)return this._handleErrorWhileConnecting(e);this._queryable=!1,this._errorAllQueries(e),this.emit("error",e)}_handleErrorMessage(e){if(this._connecting)return this._handleErrorWhileConnecting(e);let s=this.activeQuery;if(!s){this._handleErrorEvent(e);return}this.activeQuery=null,s.handleError(e,this.connection)}_handleRowDescription(e){this.activeQuery.handleRowDescription(e)}_handleDataRow(e){this.activeQuery.handleDataRow(e)}_handlePortalSuspended(e){this.activeQuery.handlePortalSuspended(this.connection)}_handleEmptyQuery(e){this.activeQuery.handleEmptyQuery(this.connection)}_handleCommandComplete(e){if(this.activeQuery==null){let s=new Error("Received unexpected commandComplete message from backend.");this._handleErrorEvent(s);return}this.activeQuery.handleCommandComplete(e,this.connection)}_handleParseComplete(){if(this.activeQuery==null){let e=new Error("Received unexpected parseComplete message from backend.");this._handleErrorEvent(e);return}this.activeQuery.name&&(this.connection.parsedStatements[this.activeQuery.name]=this.activeQuery.text)}_handleCopyInResponse(e){this.activeQuery.handleCopyInResponse(this.connection)}_handleCopyData(e){this.activeQuery.handleCopyData(e,this.connection)}_handleNotification(e){this.emit("notification",e)}_handleNotice(e){this.emit("notice",e)}getStartupConf(){var e=this.connectionParameters,s={user:e.user,database:e.database},a=e.application_name||e.fallback_application_name;return a&&(s.application_name=a),e.replication&&(s.replication=""+e.replication),e.statement_timeout&&(s.statement_timeout=String(parseInt(e.statement_timeout,10))),e.lock_timeout&&(s.lock_timeout=String(parseInt(e.lock_timeout,10))),e.idle_in_transaction_session_timeout&&(s.idle_in_transaction_session_timeout=String(parseInt(e.idle_in_transaction_session_timeout,10))),e.options&&(s.options=e.options),s}cancel(e,s){if(e.activeQuery===s){var a=this.connection;this.host&&this.host.indexOf("/")===0?a.connect(this.host+"/.s.PGSQL."+this.port):a.connect(this.port,this.host),a.on("connect",function(){a.cancel(e.processID,e.secretKey)})}else e.queryQueue.indexOf(s)!==-1&&e.queryQueue.splice(e.queryQueue.indexOf(s),1)}setTypeParser(e,s,a){return this._types.setTypeParser(e,s,a)}getTypeParser(e,s){return this._types.getTypeParser(e,s)}escapeIdentifier(e){return yr.escapeIdentifier(e)}escapeLiteral(e){return yr.escapeLiteral(e)}_pulseQueryQueue(){if(this.readyForQuery===!0)if(this.activeQuery=this.queryQueue.shift(),this.activeQuery){this.readyForQuery=!1,this.hasExecuted=!0;let e=this.activeQuery.submit(this.connection);e&&process.nextTick(()=>{this.activeQuery.handleError(e,this.connection),this.readyForQuery=!0,this._pulseQueryQueue()})}else this.hasExecuted&&(this.activeQuery=null,this.emit("drain"))}query(e,s,a){var r,i,n,o,E;if(e==null)throw new TypeError("Client was passed a null or undefined query");return typeof e.submit=="function"?(n=e.query_timeout||this.connectionParameters.query_timeout,i=r=e,typeof s=="function"&&(r.callback=r.callback||s)):(n=e.query_timeout||this.connectionParameters.query_timeout,r=new Cr(e,s,a),r.callback||(i=new this._Promise((_,c)=>{r.callback=(l,d)=>l?c(l):_(d)}).catch(_=>{throw Error.captureStackTrace(_),_}))),n&&(E=r.callback,o=setTimeout(()=>{var _=new Error("Query read timeout");process.nextTick(()=>{r.handleError(_,this.connection)}),E(_),r.callback=()=>{};var c=this.queryQueue.indexOf(r);c>-1&&this.queryQueue.splice(c,1),this._pulseQueryQueue()},n),r.callback=(_,c)=>{clearTimeout(o),E(_,c)}),this.binary&&!r.binary&&(r.binary=!0),r._result&&!r._result._types&&(r._result._types=this._types),this._queryable?this._ending?(process.nextTick(()=>{r.handleError(new Error("Client was closed and is not queryable"),this.connection)}),i):(this.queryQueue.push(r),this._pulseQueryQueue(),i):(process.nextTick(()=>{r.handleError(new Error("Client has encountered a connection error and is not queryable"),this.connection)}),i)}ref(){this.connection.ref()}unref(){this.connection.unref()}end(e){if(this._ending=!0,!this.connection._connecting||this._ended)if(e)e();else return this._Promise.resolve();if(this.activeQuery||!this._queryable?this.connection.stream.destroy():this.connection.end(),e)this.connection.once("end",e);else return new this._Promise(s=>{this.connection.once("end",s)})}};St.Query=Cr;Fr.exports=St});var Hr=R((wc,Pr)=>{"use strict";var P_=k("events").EventEmitter,Us=function(){},Ur=(t,e)=>{let s=t.findIndex(e);return s===-1?void 0:t.splice(s,1)[0]},Ps=class{constructor(e,s,a){this.client=e,this.idleListener=s,this.timeoutId=a}},We=class{constructor(e){this.callback=e}};function H_(){throw new Error("Release called on client which has already been released to the pool.")}function gt(t,e){if(e)return{callback:e,result:void 0};let s,a,r=function(n,o){n?s(n):a(o)},i=new t(function(n,o){a=n,s=o}).catch(n=>{throw Error.captureStackTrace(n),n});return{callback:r,result:i}}function M_(t,e){return function s(a){a.client=e,e.removeListener("error",s),e.on("error",()=>{t.log("additional client error after disconnection due to error",a)}),t._remove(e),t.emit("error",a,e)}}var Hs=class extends P_{constructor(e,s){super(),this.options=Object.assign({},e),e!=null&&"password"in e&&Object.defineProperty(this.options,"password",{configurable:!0,enumerable:!1,writable:!0,value:e.password}),e!=null&&e.ssl&&e.ssl.key&&Object.defineProperty(this.options.ssl,"key",{enumerable:!1}),this.options.max=this.options.max||this.options.poolSize||10,this.options.min=this.options.min||0,this.options.maxUses=this.options.maxUses||1/0,this.options.allowExitOnIdle=this.options.allowExitOnIdle||!1,this.options.maxLifetimeSeconds=this.options.maxLifetimeSeconds||0,this.log=this.options.log||function(){},this.Client=this.options.Client||s||Ms().Client,this.Promise=this.options.Promise||global.Promise,typeof this.options.idleTimeoutMillis>"u"&&(this.options.idleTimeoutMillis=1e4),this._clients=[],this._idle=[],this._expired=new WeakSet,this._pendingQueue=[],this._endCallback=void 0,this.ending=!1,this.ended=!1}_promiseTry(e){let s=this.Promise;return typeof s.try=="function"?s.try(e):new s(a=>a(e()))}_isFull(){return this._clients.length>=this.options.max}_isAboveMin(){return this._clients.length>this.options.min}_pulseQueue(){if(this.log("pulse queue"),this.ended){this.log("pulse queue ended");return}if(this.ending){this.log("pulse queue on ending"),this._idle.length&&this._idle.slice().map(s=>{this._remove(s.client)}),this._clients.length||(this.ended=!0,this._endCallback());return}if(!this._pendingQueue.length){this.log("no queued requests");return}if(!this._idle.length&&this._isFull())return;let e=this._pendingQueue.shift();if(this._idle.length){let s=this._idle.pop();clearTimeout(s.timeoutId);let a=s.client;a.ref&&a.ref();let r=s.idleListener;return this._acquireClient(a,e,r,!1)}if(!this._isFull())return this.newClient(e);throw new Error("unexpected condition")}_remove(e,s){let a=Ur(this._idle,i=>i.client===e);a!==void 0&&clearTimeout(a.timeoutId),this._clients=this._clients.filter(i=>i!==e);let r=this;e.end(()=>{r.emit("remove",e),typeof s=="function"&&s()})}connect(e){if(this.ending){let r=new Error("Cannot use a pool after calling end on the pool");return e?e(r):this.Promise.reject(r)}let s=gt(this.Promise,e),a=s.result;if(this._isFull()||this._idle.length){if(this._idle.length&&process.nextTick(()=>this._pulseQueue()),!this.options.connectionTimeoutMillis)return this._pendingQueue.push(new We(s.callback)),a;let r=(o,E,_)=>{clearTimeout(n),s.callback(o,E,_)},i=new We(r),n=setTimeout(()=>{Ur(this._pendingQueue,o=>o.callback===r),i.timedOut=!0,s.callback(new Error("timeout exceeded when trying to connect"))},this.options.connectionTimeoutMillis);return n.unref&&n.unref(),this._pendingQueue.push(i),a}return this.newClient(new We(s.callback)),a}newClient(e){let s=new this.Client(this.options);this._clients.push(s);let a=M_(this,s);this.log("checking client timeout");let r,i=!1;this.options.connectionTimeoutMillis&&(r=setTimeout(()=>{s.connection?(this.log("ending client due to timeout"),i=!0,s.connection.stream.destroy()):s.isConnected()||(this.log("ending client due to timeout"),i=!0,s.end())},this.options.connectionTimeoutMillis)),this.log("connecting new client"),s.connect(n=>{if(r&&clearTimeout(r),s.on("error",a),n)this.log("client failed to connect",n),this._clients=this._clients.filter(o=>o!==s),i&&(n=new Error("Connection terminated due to connection timeout",{cause:n})),this._pulseQueue(),e.timedOut||e.callback(n,void 0,Us);else{if(this.log("new client connected"),this.options.onConnect){this._promiseTry(()=>this.options.onConnect(s)).then(()=>{this._afterConnect(s,e,a)},o=>{this._clients=this._clients.filter(E=>E!==s),s.end(()=>{this._pulseQueue(),e.timedOut||e.callback(o,void 0,Us)})});return}return this._afterConnect(s,e,a)}})}_afterConnect(e,s,a){if(this.options.maxLifetimeSeconds!==0){let r=setTimeout(()=>{this.log("ending client due to expired lifetime"),this._expired.add(e),this._idle.findIndex(n=>n.client===e)!==-1&&this._acquireClient(e,new We((n,o,E)=>E()),a,!1)},this.options.maxLifetimeSeconds*1e3);r.unref(),e.once("end",()=>clearTimeout(r))}return this._acquireClient(e,s,a,!0)}_acquireClient(e,s,a,r){r&&this.emit("connect",e),this.emit("acquire",e),e.release=this._releaseOnce(e,a),e.removeListener("error",a),s.timedOut?r&&this.options.verify?this.options.verify(e,e.release):e.release():r&&this.options.verify?this.options.verify(e,i=>{if(i)return e.release(i),s.callback(i,void 0,Us);s.callback(void 0,e,e.release)}):s.callback(void 0,e,e.release)}_releaseOnce(e,s){let a=!1;return r=>{a&&H_(),a=!0,this._release(e,s,r)}}_release(e,s,a){if(e.on("error",s),e._poolUseCount=(e._poolUseCount||0)+1,this.emit("release",a,e),a||this.ending||!e._queryable||e._ending||e._poolUseCount>=this.options.maxUses)return e._poolUseCount>=this.options.maxUses&&this.log("remove expended client"),this._remove(e,this._pulseQueue.bind(this));if(this._expired.has(e))return this.log("remove expired client"),this._expired.delete(e),this._remove(e,this._pulseQueue.bind(this));let i;this.options.idleTimeoutMillis&&this._isAboveMin()&&(i=setTimeout(()=>{this._isAboveMin()&&(this.log("remove idle client"),this._remove(e,this._pulseQueue.bind(this)))},this.options.idleTimeoutMillis),this.options.allowExitOnIdle&&i.unref()),this.options.allowExitOnIdle&&e.unref(),this._idle.push(new Ps(e,s,i)),this._pulseQueue()}query(e,s,a){if(typeof e=="function"){let i=gt(this.Promise,e);return setImmediate(function(){return i.callback(new Error("Passing a function as the first parameter to pool.query is not supported"))}),i.result}typeof s=="function"&&(a=s,s=void 0);let r=gt(this.Promise,a);return a=r.callback,this.connect((i,n)=>{if(i)return a(i);let o=!1,E=_=>{o||(o=!0,n.release(_),a(_))};n.once("error",E),this.log("dispatching query");try{n.query(e,s,(_,c)=>{if(this.log("query dispatched"),n.removeListener("error",E),!o)return o=!0,n.release(_),_?a(_):a(void 0,c)})}catch(_){return n.release(_),a(_)}}),r.result}end(e){if(this.log("ending"),this.ending){let a=new Error("Called end on pool more than once");return e?e(a):this.Promise.reject(a)}this.ending=!0;let s=gt(this.Promise,e);return this._endCallback=s.callback,this._pulseQueue(),s.result}get waitingCount(){return this._pendingQueue.length}get idleCount(){return this._idle.length}get expiredCount(){return this._clients.reduce((e,s)=>e+(this._expired.has(s)?1:0),0)}get totalCount(){return this._clients.length}};Pr.exports=Hs});var kr=R((kc,wr)=>{"use strict";var Mr=k("events").EventEmitter,w_=k("util"),ws=st(),Be=wr.exports=function(t,e,s){Mr.call(this),t=ws.normalizeQueryConfig(t,e,s),this.text=t.text,this.values=t.values,this.name=t.name,this.queryMode=t.queryMode,this.callback=t.callback,this.state="new",this._arrayMode=t.rowMode==="array",this._emitRowEvents=!1,this.on("newListener",function(a){a==="row"&&(this._emitRowEvents=!0)}.bind(this))};w_.inherits(Be,Mr);var k_={sqlState:"code",statementPosition:"position",messagePrimary:"message",context:"where",schemaName:"schema",tableName:"table",columnName:"column",dataTypeName:"dataType",constraintName:"constraint",sourceFile:"file",sourceLine:"line",sourceFunction:"routine"};Be.prototype.handleError=function(t){var e=this.native.pq.resultErrorFields();if(e)for(var s in e){var a=k_[s]||s;t[a]=e[s]}this.callback?this.callback(t):this.emit("error",t),this.state="error"};Be.prototype.then=function(t,e){return this._getPromise().then(t,e)};Be.prototype.catch=function(t){return this._getPromise().catch(t)};Be.prototype._getPromise=function(){return this._promise?this._promise:(this._promise=new Promise(function(t,e){this._once("end",t),this._once("error",e)}.bind(this)),this._promise)};Be.prototype.submit=function(t){this.state="running";var e=this;this.native=t.native,t.native.arrayMode=this._arrayMode;var s=function(i,n,o){if(t.native.arrayMode=!1,setImmediate(function(){e.emit("_done")}),i)return e.handleError(i);e._emitRowEvents&&(o.length>1?n.forEach((E,_)=>{E.forEach(c=>{e.emit("row",c,o[_])})}):n.forEach(function(E){e.emit("row",E,o)})),e.state="end",e.emit("end",o),e.callback&&e.callback(null,o)};if(process.domain&&(s=process.domain.bind(s)),this.name){this.name.length>63&&(console.error("Warning! Postgres only supports 63 characters for query names."),console.error("You supplied %s (%s)",this.name,this.name.length),console.error("This can cause conflicts and silent errors executing queries"));var a=(this.values||[]).map(ws.prepareValue);if(t.namedQueries[this.name]){if(this.text&&t.namedQueries[this.name]!==this.text){let i=new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);return s(i)}return t.native.execute(this.name,a,s)}return t.native.prepare(this.name,this.text,a.length,function(i){return i?s(i):(t.namedQueries[e.name]=e.text,e.native.execute(e.name,a,s))})}else if(this.values){if(!Array.isArray(this.values)){let i=new Error("Query values must be an array");return s(i)}var r=this.values.map(ws.prepareValue);t.native.query(this.text,r,s)}else this.queryMode==="extended"?t.native.query(this.text,[],s):t.native.query(this.text,s)}});var qr=R((xc,Gr)=>{"use strict";var xr;try{xr=k("pg-native")}catch(t){throw t}var x_=Zt(),Wr=k("events").EventEmitter,W_=k("util"),B_=ss(),Br=kr(),ie=Gr.exports=function(t){Wr.call(this),t=t||{},this._Promise=t.Promise||global.Promise,this._types=new x_(t.types),this.native=new xr({types:this._types}),this._queryQueue=[],this._ending=!1,this._connecting=!1,this._connected=!1,this._queryable=!0;var e=this.connectionParameters=new B_(t);t.nativeConnectionString&&(e.nativeConnectionString=t.nativeConnectionString),this.user=e.user,Object.defineProperty(this,"password",{configurable:!0,enumerable:!1,writable:!0,value:e.password}),this.database=e.database,this.host=e.host,this.port=e.port,this.namedQueries={}};ie.Query=Br;W_.inherits(ie,Wr);ie.prototype._errorAllQueries=function(t){let e=s=>{process.nextTick(()=>{s.native=this.native,s.handleError(t)})};this._hasActiveQuery()&&(e(this._activeQuery),this._activeQuery=null),this._queryQueue.forEach(e),this._queryQueue.length=0};ie.prototype._connect=function(t){var e=this;if(this._connecting){process.nextTick(()=>t(new Error("Client has already been connected. You cannot reuse a client.")));return}this._connecting=!0,this.connectionParameters.getLibpqConnectionString(function(s,a){if(e.connectionParameters.nativeConnectionString&&(a=e.connectionParameters.nativeConnectionString),s)return t(s);e.native.connect(a,function(r){if(r)return e.native.end(),t(r);e._connected=!0,e.native.on("error",function(i){e._queryable=!1,e._errorAllQueries(i),e.emit("error",i)}),e.native.on("notification",function(i){e.emit("notification",{channel:i.relname,payload:i.extra})}),e.emit("connect"),e._pulseQueryQueue(!0),t()})})};ie.prototype.connect=function(t){if(t){this._connect(t);return}return new this._Promise((e,s)=>{this._connect(a=>{a?s(a):e()})})};ie.prototype.query=function(t,e,s){var a,r,i,n,o;if(t==null)throw new TypeError("Client was passed a null or undefined query");if(typeof t.submit=="function")i=t.query_timeout||this.connectionParameters.query_timeout,r=a=t,typeof e=="function"&&(t.callback=e);else if(i=t.query_timeout||this.connectionParameters.query_timeout,a=new Br(t,e,s),!a.callback){let E,_;r=new this._Promise((c,l)=>{E=c,_=l}).catch(c=>{throw Error.captureStackTrace(c),c}),a.callback=(c,l)=>c?_(c):E(l)}return i&&(o=a.callback,n=setTimeout(()=>{var E=new Error("Query read timeout");process.nextTick(()=>{a.handleError(E,this.connection)}),o(E),a.callback=()=>{};var _=this._queryQueue.indexOf(a);_>-1&&this._queryQueue.splice(_,1),this._pulseQueryQueue()},i),a.callback=(E,_)=>{clearTimeout(n),o(E,_)}),this._queryable?this._ending?(a.native=this.native,process.nextTick(()=>{a.handleError(new Error("Client was closed and is not queryable"))}),r):(this._queryQueue.push(a),this._pulseQueryQueue(),r):(a.native=this.native,process.nextTick(()=>{a.handleError(new Error("Client has encountered a connection error and is not queryable"))}),r)};ie.prototype.end=function(t){var e=this;this._ending=!0,this._connected||this.once("connect",this.end.bind(this,t));var s;return t||(s=new this._Promise(function(a,r){t=i=>i?r(i):a()})),this.native.end(function(){e._errorAllQueries(new Error("Connection terminated")),process.nextTick(()=>{e.emit("end"),t&&t()})}),s};ie.prototype._hasActiveQuery=function(){return this._activeQuery&&this._activeQuery.state!=="error"&&this._activeQuery.state!=="end"};ie.prototype._pulseQueryQueue=function(t){if(this._connected&&!this._hasActiveQuery()){var e=this._queryQueue.shift();if(!e){t||this.emit("drain");return}this._activeQuery=e,e.submit(this);var s=this;e.once("_done",function(){s._pulseQueryQueue()})}};ie.prototype.cancel=function(t){this._activeQuery===t?this.native.cancel(function(){}):this._queryQueue.indexOf(t)!==-1&&this._queryQueue.splice(this._queryQueue.indexOf(t),1)};ie.prototype.ref=function(){};ie.prototype.unref=function(){};ie.prototype.setTypeParser=function(t,e,s){return this._types.setTypeParser(t,e,s)};ie.prototype.getTypeParser=function(t,e){return this._types.getTypeParser(t,e)}});var ks=R((Wc,Yr)=>{"use strict";Yr.exports=qr()});var Ms=R((Gc,it)=>{"use strict";var G_=jr(),q_=tt(),Y_=Ds(),$_=Hr(),{DatabaseError:K_}=fs(),{escapeIdentifier:V_,escapeLiteral:X_}=st(),J_=t=>class extends $_{constructor(s){super(s,t)}},xs=function(t){this.defaults=q_,this.Client=t,this.Query=this.Client.Query,this.Pool=J_(this.Client),this._pools=[],this.Connection=Y_,this.types=et(),this.DatabaseError=K_,this.escapeIdentifier=V_,this.escapeLiteral=X_};typeof process.env.NODE_PG_FORCE_NATIVE<"u"?it.exports=new xs(ks()):(it.exports=new xs(G_),Object.defineProperty(it.exports,"native",{configurable:!0,enumerable:!1,get(){var t=null;try{t=new xs(ks())}catch(e){if(e.code!=="MODULE_NOT_FOUND")throw e}return Object.defineProperty(it.exports,"native",{value:t}),t}}))});import{createHash as BE,randomUUID as GE}from"node:crypto";import{gzipSync as qE}from"node:zlib";var ai=Wi(Ms(),1);var $r=`-- JAIN STOCK EXCHANGE (JSE) v272
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
`;var Kr=`-- JAIN STOCK EXCHANGE (JSE) v311
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

-- v3.13: IPO shares on offer (Hatchable IPO master: remaining = offered \u2212 allotted)
ALTER TABLE securities ADD COLUMN IF NOT EXISTS ipo_shares_offered integer;

INSERT INTO schema_migrations(version) VALUES ('001a_upgrades');

-- v3.14 (P0/P1/P3): per-company limit, editable bank name, loan requests approved and released by the Bank Desk
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS max_company_pct numeric(5,2) NOT NULL DEFAULT 25 CHECK (max_company_pct >= 0 AND max_company_pct <= 100);
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS bank_name text NOT NULL DEFAULT 'JSE Bank';
CREATE TABLE IF NOT EXISTS loan_requests (
  id               bigserial PRIMARY KEY,
  request_no       text UNIQUE,
  team_id          integer NOT NULL REFERENCES teams(id),
  requested_amount numeric(16,2) NOT NULL CHECK (requested_amount > 0),
  approved_amount  numeric(16,2) CHECK (approved_amount IS NULL OR approved_amount > 0),
  status           text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','DISBURSED','REJECTED','CANCELLED')),
  reason           text,
  requested_by     text, requested_role text, requested_at timestamptz NOT NULL DEFAULT now(),
  decided_by       text, decided_at timestamptz, decision_note text,
  disbursement_ref bigint,               -- loan_transactions.id of the DRAW
  cash_after       numeric(16,2)
);
CREATE UNIQUE INDEX IF NOT EXISTS loan_requests_one_pending ON loan_requests(team_id) WHERE status = 'PENDING';
`;var Vr=`-- JAIN STOCK EXCHANGE (JSE) v311
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

-- Indian rupee text for messages and records: \u20B919,11,000 \xB7 \u20B91,445.50 \xB7 \u2212\u20B9250 (paise only when present)
CREATE OR REPLACE FUNCTION jse_inr(p numeric) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE v_abs numeric; v_int text; v_dec text; v_head text; v_out text;
BEGIN
  IF p IS NULL THEN RETURN NULL; END IF;
  v_abs := abs(round(p, 2));
  v_int := trunc(v_abs)::text;
  v_dec := lpad(round((v_abs - trunc(v_abs)) * 100)::integer::text, 2, '0');
  IF length(v_int) > 3 THEN
    v_out := right(v_int, 3); v_head := left(v_int, length(v_int) - 3);
    WHILE length(v_head) > 2 LOOP
      v_out := right(v_head, 2) || ',' || v_out; v_head := left(v_head, length(v_head) - 2);
    END LOOP;
    v_out := v_head || ',' || v_out;
  ELSE
    v_out := v_int;
  END IF;
  RETURN CASE WHEN p < 0 THEN '\u2212' ELSE '' END || '\u20B9' || v_out || CASE WHEN v_dec <> '00' THEN '.' || v_dec ELSE '' END;
END $$;

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

-- The participant team's side of an order. An institutional order stores the INSTITUTION's side:
-- institution BUY = the team sells to the institution; institution SELL = the team buys from the institution.
CREATE OR REPLACE FUNCTION jse_team_side(p_account text, p_side text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN p_account = 'INSTITUTION' THEN CASE p_side WHEN 'BUY' THEN 'SELL' WHEN 'SELL' THEN 'BUY' END ELSE p_side END
$$;

-- Institutional counterparty price (broker rules): a participant BUYS from an institution at 2% ABOVE the
-- prevailing market price and SELLS to an institution at 2% BELOW it. p_inst_side is the institution's side.
CREATE OR REPLACE FUNCTION jse_inst_spread_pct() RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT 2.00::numeric $$;
CREATE OR REPLACE FUNCTION jse_inst_price(p_market numeric, p_inst_side text) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT round(p_market * (1 + CASE WHEN p_inst_side = 'SELL' THEN 1 ELSE -1 END * jse_inst_spread_pct() / 100), 2)
$$;

-- Quantity the team can still sell: holding minus quantity already committed to other open orders in which the
-- team sells (its own SELL orders and institutional orders where the institution buys from it).
CREATE OR REPLACE FUNCTION jse_available_qty(p_team integer, p_security integer, p_exclude_order bigint DEFAULT NULL)
RETURNS TABLE(holding integer, open_sell integer, available integer) LANGUAGE sql STABLE AS $$
  WITH h AS (SELECT coalesce((SELECT quantity FROM holdings WHERE team_id = p_team AND security_id = p_security), 0) AS q),
       s AS (SELECT coalesce(sum(quantity), 0)::integer AS q FROM orders
             WHERE team_id = p_team AND security_id = p_security
               AND ((account_type = 'TEAM' AND side = 'SELL') OR (account_type = 'INSTITUTION' AND side = 'BUY'))
               AND status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')
               AND (p_exclude_order IS NULL OR id <> p_exclude_order))
  SELECT h.q, s.q, h.q - s.q FROM h, s
$$;

-- Cash the team still has free: cash minus the full amount of its other open orders in which the team buys.
CREATE OR REPLACE FUNCTION jse_available_cash(p_team integer, p_exclude_order bigint DEFAULT NULL)
RETURNS numeric LANGUAGE sql STABLE AS $$
  SELECT (SELECT cash FROM teams WHERE id = p_team) - coalesce((
    SELECT sum(settlement_amount) FROM orders
    WHERE team_id = p_team AND ((account_type = 'TEAM' AND side = 'BUY') OR (account_type = 'INSTITUTION' AND side = 'SELL'))
      AND status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')
      AND (p_exclude_order IS NULL OR id <> p_exclude_order)), 0)
$$;

-- Per-company limit (v3.14): money committed to one company (holding at cost + open BUY orders + this order) may not exceed
-- max_company_pct of the team's capital at cost (cash + cost of all holdings). IPO companies are exempt (allotments are fixed lots).
CREATE OR REPLACE FUNCTION jse_check_company_limit(p_team integer, p_security integer, p_amount numeric, p_exclude_order bigint)
RETURNS void LANGUAGE plpgsql STABLE AS $$
DECLARE v_pct numeric; v_base numeric; v_used numeric; v_limit numeric; v_kind text; v_sym text;
BEGIN
  SELECT coalesce(max_company_pct, 0) INTO v_pct FROM event_config WHERE id = 1;
  SELECT kind, symbol INTO v_kind, v_sym FROM securities WHERE id = p_security;
  IF v_pct <= 0 OR v_kind = 'IPO' THEN RETURN; END IF;
  SELECT t.cash + coalesce((SELECT sum(cost_basis) FROM holdings WHERE team_id = p_team), 0) INTO v_base FROM teams t WHERE t.id = p_team;
  SELECT coalesce((SELECT cost_basis FROM holdings WHERE team_id = p_team AND security_id = p_security), 0)
       + coalesce((SELECT sum(settlement_amount) FROM orders WHERE team_id = p_team AND security_id = p_security AND account_type = 'TEAM' AND side = 'BUY'
                     AND status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING') AND (p_exclude_order IS NULL OR id <> p_exclude_order)), 0)
    INTO v_used;
  v_limit := round(v_base * v_pct / 100, 2);
  IF v_used + p_amount > v_limit THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'COMPANY_LIMIT', HINT = '409',
      MESSAGE = 'Per-company limit: a team may invest at most ' || trim(to_char(v_pct, 'FM990.##')) || '% of its funds (' || jse_inr(v_limit) || ') in ' || v_sym ||
                '. Already committed ' || jse_inr(v_used) || '; this order needs ' || jse_inr(p_amount) || '. You can still invest ' || jse_inr(greatest(v_limit - v_used, 0)) || '.';
  END IF;
END $$;

-- Loan principal the team can still draw (limit applies to the total principal ever drawn).
CREATE OR REPLACE FUNCTION jse_loan_room(p_team integer) RETURNS numeric LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN c.loans_enabled THEN greatest(0, c.loan_max_principal - coalesce(l.original_principal, 0)) ELSE 0 END
  FROM event_config c LEFT JOIN loans l ON l.team_id = p_team WHERE c.id = 1
$$;

-- User-facing stage of an order in the canonical flow
CREATE OR REPLACE FUNCTION jse_stage_label(p_status text, p_code text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_status
    WHEN 'PIT_PENDING' THEN 'Exchange intake'
    WHEN 'PIT_REJECTED' THEN CASE WHEN p_code = 'PRICE_STALE' THEN 'Rejected \xB7 market price changed' ELSE 'Rejected' END
    WHEN 'EXCHANGE_PENDING' THEN 'Order created \xB7 awaiting Exchange'
    WHEN 'EXCHANGE_APPROVED' THEN 'Exchange approved \xB7 awaiting Bank'
    WHEN 'BANK_PENDING' THEN 'Bank verifying'
    WHEN 'BANK_SETTLED' THEN 'Settled \xB7 market / cash updated'
    WHEN 'EXCHANGE_REJECTED' THEN CASE WHEN p_code = 'PRICE_STALE' THEN 'Rejected \xB7 market price changed' ELSE 'Rejected by Exchange' END
    WHEN 'BANK_REJECTED' THEN CASE WHEN p_code = 'PRICE_STALE' THEN 'Rejected \xB7 market price changed' ELSE 'Rejected by Bank' END
    ELSE p_status END
$$;

CREATE OR REPLACE FUNCTION jse_order_json(p_id bigint) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object(
    'id', o.id, 'order_no', o.order_no, 'account_type', o.account_type,
    'team', t.code, 'team_name', t.name, 'broker', b.code, 'broker_name', b.name,
    'institution', i.code, 'institution_name', i.name,
    'security_id', s.id, 'symbol', s.symbol, 'security', s.name, 'kind', s.kind,
    'side', o.side, 'team_side', jse_team_side(o.account_type, o.side),
    'counterparty', CASE WHEN o.account_type = 'INSTITUTION' THEN coalesce(i.name, 'Institutional Investor') ELSE 'Market' END,
    'quantity', o.quantity, 'price', o.price,
    'price_basis', CASE WHEN o.account_type = 'INSTITUTION' AND o.price IS DISTINCT FROM o.reference_price THEN 'Market ' || jse_inr(o.reference_price) ||
                          CASE WHEN o.side = 'SELL' THEN ' + ' ELSE ' \u2212 ' END || to_char(jse_inst_spread_pct(), 'FM990.##') || '% (institutional counterparty)'
                        ELSE 'Market price' END,
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
-- order creation, Exchange or Bank. Records price history and closes every open order that was created at the
-- old market price (MARKET PRICE CHANGED): an order never settles at an obsolete price.
-- The caller must hold the security row FOR UPDATE.
-- ---------------------------------------------------------------------------
-- An order is priced from the market price it was created against (reference_price; for institutional orders
-- the order price is that market price \xB1 the institutional spread).
CREATE OR REPLACE FUNCTION jse__mark_stale(a jsonb, o orders, p_market numeric, p_source text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_reason text; v_ref numeric := coalesce(o.reference_price, o.price);
        v_to text := CASE o.status WHEN 'EXCHANGE_PENDING' THEN 'EXCHANGE_REJECTED' WHEN 'PIT_PENDING' THEN 'EXCHANGE_REJECTED' ELSE 'BANK_REJECTED' END;
BEGIN
  IF o.status NOT IN ('PIT_PENDING', 'EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING') THEN RETURN; END IF;
  v_reason := 'MARKET PRICE CHANGED: the market price moved from ' || jse_inr(v_ref) || ' to ' || jse_inr(p_market) || ' (' || replace(p_source, '_', ' ') ||
              ') before settlement. The order was not settled at the old price \u2014 create a fresh order at the new market price.';
  UPDATE orders SET status = v_to, reject_code = 'PRICE_STALE', reject_reason = v_reason,
         exchange_at = CASE WHEN v_to = 'EXCHANGE_REJECTED' THEN now() ELSE exchange_at END,
         exchange_by_name = CASE WHEN v_to = 'EXCHANGE_REJECTED' THEN 'SYSTEM \xB7 ' || replace(p_source, '_', ' ') ELSE exchange_by_name END,
         bank_at = CASE WHEN v_to = 'BANK_REJECTED' THEN now() ELSE bank_at END,
         bank_by_name = CASE WHEN v_to = 'BANK_REJECTED' THEN 'SYSTEM \xB7 ' || replace(p_source, '_', ' ') ELSE bank_by_name END,
         bank_claimed_by = NULL, bank_claimed_name = NULL, bank_claimed_at = NULL, updated_at = now()
  WHERE id = o.id;
  PERFORM jse_order_event(o.id, 'PRICE_STALE', o.status, v_to, a, v_reason,
    jsonb_build_object('order_price', o.price, 'reference_price', v_ref, 'market_price', p_market, 'source', p_source));
  PERFORM jse_audit(a, 'ORDER_PRICE_STALE', 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', o.status),
    jsonb_build_object('status', v_to, 'reject_code', 'PRICE_STALE'),
    jsonb_build_object('order_price', o.price, 'reference_price', v_ref, 'market_price', p_market, 'source', p_source));
END $$;

CREATE OR REPLACE FUNCTION jse__stale_orders(a jsonb, p_security integer, p_new_price numeric, p_source text)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE o orders%ROWTYPE; v_n integer := 0;
BEGIN
  FOR o IN SELECT * FROM orders WHERE security_id = p_security AND status IN ('PIT_PENDING', 'EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING')
             AND coalesce(reference_price, price) <> p_new_price
           ORDER BY id FOR UPDATE LOOP
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
      'Participant self entry is disabled. Your broker creates the order for your team.', 403);
  END IF;
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'PIT_MANAGER');
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
      MESSAGE = 'MARKET PRICE CHANGED: ' || v_sec.symbol || ' moved from ' || jse_inr(v_expected) || ' to ' || jse_inr(v_sec.price) ||
                ' (Market News). The order was not submitted \u2014 review the new value with the participant and submit again.';
  END IF;

  v_rate := cfg.brokerage_rate;
  v_tv := round(v_qty * v_sec.price, 2);
  v_brk := round(v_tv * v_rate, 2);
  v_amount := CASE WHEN v_side = 'BUY' THEN v_tv + v_brk ELSE v_tv - v_brk END;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between ' || jse_inr(cfg.min_order_value) || ' and ' || jse_inr(cfg.max_order_value) ||
      ' per order (this order: ' || jse_inr(v_tv) || ').', 400);
  END IF;

  -- P0 financial safety (v3.14): one team's orders are serialised by locking the team row, so two desks cannot sell the
  -- same shares or commit the same cash twice. Short selling and buying beyond free cash are refused here (and again at the Bank).
  PERFORM 1 FROM teams WHERE id = v_team.id FOR UPDATE;
  IF v_sec.price <> trunc(v_sec.price) THEN
    PERFORM jse_fail('PRICE_NOT_WHOLE', v_sec.symbol || ' price must be whole rupees. Ask the Event Admin to correct the price.', 409);
  END IF;
  IF v_side = 'SELL' THEN
    SELECT * INTO v_avail FROM jse_available_qty(v_team.id, v_sec.id, NULL);
    IF v_qty > v_avail.available THEN
      RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_NOT_ALLOWED', HINT = '409',
        MESSAGE = 'Short selling is not allowed. You can sell only the shares available in your portfolio. Please reduce the quantity or check your holdings. (' ||
                  v_team.code || ' can sell ' || greatest(v_avail.available, 0) || ' ' || v_sec.symbol || ': holding ' || v_avail.holding || ', in open sell orders ' || v_avail.open_sell || ')';
    END IF;
  ELSE
    v_free_cash := jse_available_cash(v_team.id, NULL);
    IF v_amount > v_free_cash THEN
      RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'INSUFFICIENT_BALANCE', HINT = '409',
        MESSAGE = 'Insufficient balance! Your available cash is ' || jse_inr(greatest(v_free_cash, 0)) || ', but this order requires ' || jse_inr(v_amount) ||
                  ', including applicable charges. Please reduce the order quantity or obtain an approved loan before placing this order.';
    END IF;
    PERFORM jse_check_company_limit(v_team.id, v_sec.id, v_amount, NULL);
  END IF;

  v_id := nextval(pg_get_serial_sequence('orders', 'id'));
  v_no := 'ORD-' || v_id::text;
  INSERT INTO orders(id, order_no, account_type, team_id, broker_id, security_id, side, quantity, price, trade_value, brokerage, brokerage_rate,
                     settlement_amount, reference_price, status, short_sell_flag, cash_shortfall_flag, notes, pair_ref, idempotency_key,
                     instruction_id, created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'TEAM', v_team.id, v_team.broker_id, v_sec.id, v_side, v_qty, v_sec.price, v_tv, v_brk, v_rate,
          v_amount, v_sec.price, 'EXCHANGE_PENDING', v_short, v_shortfall, left(p->>'notes', 300), left(p->>'pair_ref', 60), v_key,
          v_ins.id, nullif(a->>'id', '')::integer, jse_actor_name(a), a->>'role');
  IF v_ins.id IS NOT NULL THEN
    UPDATE instructions SET status = 'SUBMITTED', order_id = v_id, handled_at = now(), handled_by_name = jse_actor_name(a) WHERE id = v_ins.id;
    PERFORM jse_order_event(v_id, 'INSTRUCTION_RECEIVED', NULL, NULL, jsonb_build_object('username', v_ins.created_by_name, 'role', 'PARTICIPANT'),
      v_ins.instruction_no || ': ' || v_ins.side || ' ' || v_ins.quantity || ' ' || v_sec.symbol, jsonb_build_object('at', v_ins.created_at));
  END IF;
  PERFORM jse_order_event(v_id, 'ORDER_CREATED', NULL, 'EXCHANGE_PENDING', a, 'Order created at the market price ' || jse_inr(v_sec.price),
    jsonb_build_object('price', v_sec.price, 'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'instruction_no', v_ins.instruction_no));
  PERFORM jse_audit(a, 'ORDER_CREATED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'EXCHANGE_PENDING', 'side', v_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_sec.price),
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
  IF coalesce(o.reference_price, o.price) <> s.price THEN
    PERFORM jse__mark_stale(a, o, s.price, 'PRICE_CHECK_AT_EXECUTION');
    RETURN jsonb_build_object('success', false, 'http', 409, 'code', 'PRICE_STALE',
      'error', 'MARKET PRICE CHANGED \u2014 ' || o.order_no || ' is PRICE STALE: it was submitted at the market price ' || jse_inr(coalesce(o.reference_price, o.price)) ||
               ' but the market price is now ' || jse_inr(s.price) || '. It cannot be executed; the broker must submit a fresh order at the new market price.',
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
    'Executed ' || o.side || ' ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ' \xB7 trading slip ' || v_slip_no,
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
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE');
  IF v_action NOT IN ('APPROVE', 'REJECT') THEN PERFORM jse_fail('INVALID_ACTION', 'Use APPROVE or REJECT.', 400); END IF;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Exchange actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status NOT IN ('EXCHANGE_PENDING', 'PIT_PENDING') THEN
    PERFORM jse_fail('ORDER_NOT_PENDING', o.order_no || ' is no longer pending at the Exchange (status: ' || replace(o.status, '_', ' ') || ').', 409);
  END IF;
  IF v_action = 'REJECT' AND v_reason IS NULL THEN v_reason := 'Rejected by Exchange'; END IF;
  IF v_action = 'APPROVE' AND coalesce(o.reference_price, o.price) <> (SELECT price FROM securities WHERE id = o.security_id) THEN
    PERFORM jse__mark_stale(a, o, (SELECT price FROM securities WHERE id = o.security_id), 'PRICE_CHECK_AT_EXCHANGE');
    RETURN jsonb_build_object('success', false, 'http', 409, 'code', 'PRICE_STALE',
      'error', 'MARKET PRICE CHANGED \u2014 ' || o.order_no || ' was created at ' || jse_inr(coalesce(o.reference_price, o.price)) ||
               ' but the market price is now ' || jse_inr((SELECT price FROM securities WHERE id = o.security_id)) || '. It has been closed; create a fresh order at the new market price.',
      'order', jse_order_json(o.id));
  END IF;

  IF v_action = 'APPROVE' THEN
    -- the participant team sells (its own SELL, or a sale to an institution): it may sell only shares it owns.
    -- The Exchange may explicitly approve it (recorded as SHORT SELLING \u2014 EXCHANGE APPROVED); the Bank still
    -- checks the holding at settlement. Institutions have no cash or holdings restriction.
    IF jse_team_side(o.account_type, o.side) = 'SELL' THEN
      SELECT * INTO v_avail FROM jse_available_qty(o.team_id, o.security_id, o.id);
      IF o.quantity > v_avail.available THEN
        IF NOT v_confirm THEN
          RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_CONFIRM_REQUIRED', HINT = '409',
            MESSAGE = 'SHORT SELLING: the team can sell only ' || greatest(v_avail.available, 0) || ' shares (holding ' || v_avail.holding ||
                      '). Normal participant short selling is prohibited. Approve it explicitly only as an Exchange override \u2014 it is recorded as SHORT SELLING \u2014 EXCHANGE APPROVED and the Bank still rejects it unless the holding is sufficient at settlement.';
        END IF;
        UPDATE orders SET short_sell_flag = true, short_sell_approved = true WHERE id = o.id;
        PERFORM jse_risk(o.team_id, o.id, o.security_id, 'SHORT_SELL_ATTEMPT', 'EXCHANGE', jse_team_side(o.account_type, o.side), o.quantity, v_avail.holding, NULL, NULL, NULL);
        PERFORM jse_audit(a, 'SHORT_SELLING_APPROVED', 'order', o.order_no, o.team_id, o.id, NULL, NULL,
          jsonb_build_object('holding', v_avail.holding, 'quantity', o.quantity, 'open_sell_other', v_avail.open_sell, 'account_type', o.account_type));
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
  PERFORM jse_order_event(o.id, v_to, o.status, v_to, a, v_reason, NULL);
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
  -- institutions are transaction-based counterparties: no cash or holdings restriction and no portfolio;
  -- the institution ledger only records each settled transaction (running net settlement flow)
  IF o.account_type = 'INSTITUTION' THEN
    SELECT * INTO inst FROM institutions WHERE id = o.institution_id FOR UPDATE;
  END IF;

  -- independent re-validation (never trust earlier desks alone)
  IF coalesce(o.reference_price, o.price) <> s.price AND p_source = 'BANK' THEN
    RETURN jse__bank_reject(a, o, 'PRICE_STALE', 'MARKET PRICE CHANGED: ' || o.order_no || ' was created at the market price ' || jse_inr(coalesce(o.reference_price, o.price)) ||
      ' but the market price is now ' || jse_inr(s.price) || '. It is not settled at an obsolete price \u2014 create a fresh order.', jsonb_build_object('market_price', s.price));
  END IF;
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
    RETURN jse__bank_reject(a, o, 'ORDER_VALUE_LIMIT', 'Order value ' || jse_inr(v_tv) || ' is outside the allowed ' || jse_inr(cfg.min_order_value) || ' to ' || jse_inr(cfg.max_order_value) || '.', '{}'::jsonb);
  END IF;
  -- the brokerage rate is fixed on the order when it is created. The participant team
  -- pays it on every trade, including trades with an institutional counterparty; its broker earns the commission.
  v_rate := coalesce(o.brokerage_rate, cfg.brokerage_rate);
  v_brk := round(v_tv * v_rate, 2);

  v_cash := t.cash;
  v_team_buys := jse_team_side(o.account_type, o.side) = 'BUY';

  IF v_team_buys THEN
    v_req := v_tv + v_brk;
    IF o.account_type = 'TEAM' THEN
      BEGIN
        PERFORM jse_check_company_limit(t.id, s.id, v_req, o.id);
      EXCEPTION WHEN SQLSTATE 'JSE01' THEN
        RETURN jse__bank_reject(a, o, 'COMPANY_LIMIT', SQLERRM, '{}'::jsonb);
      END;
    END IF;
    IF v_cash < v_req THEN
      -- own money first: only the shortfall is borrowed, automatically, within the loan limit
      v_room := CASE WHEN cfg.loans_enabled THEN greatest(0, cfg.loan_max_principal - ln.original_principal) ELSE 0 END;
      v_draw := v_req - v_cash;
      IF NOT (cfg.loans_enabled AND cfg.auto_loan_on_settlement) OR v_draw > v_room THEN
        PERFORM jse_risk(t.id, o.id, s.id, 'INSUFFICIENT_BALANCE_REJECTION', 'BANK', 'BUY', o.quantity, v_hold, v_req, v_cash,
                         'Loan room ' || jse_inr(v_room));
        PERFORM jse_audit(a, 'INSUFFICIENT_BALANCE_REJECTED', 'order', o.order_no, t.id, o.id, NULL, NULL,
          jsonb_build_object('required', v_req, 'cash', v_cash, 'loan_room', v_room, 'account_type', o.account_type));
        RETURN jse__bank_reject(a, o, 'INSUFFICIENT_BALANCE',
          'Insufficient balance: ' || jse_inr(v_req) || ' is needed but ' || t.code || ' has ' || jse_inr(v_cash) ||
          CASE WHEN cfg.loans_enabled AND cfg.auto_loan_on_settlement THEN ' plus ' || jse_inr(v_room) || ' of loan room' ELSE '' END || '.',
          jsonb_build_object('required', v_req, 'cash', v_cash, 'loan_room', v_room));
      END IF;
      v_interest := round(v_draw * cfg.loan_interest_rate, 2);
    END IF;
  ELSE
    IF v_hold < o.quantity THEN
      PERFORM jse_risk(t.id, o.id, s.id, 'SHORT_SELL_ATTEMPT', 'BANK', 'SELL', o.quantity, v_hold, NULL, NULL, 'Rejected at Bank');
      PERFORM jse_audit(a, 'SHORT_SELLING_ATTEMPT', 'order', o.order_no, t.id, o.id, NULL, NULL,
        jsonb_build_object('quantity', o.quantity, 'holding', v_hold, 'stage', 'BANK', 'exchange_approved', coalesce(o.short_sell_approved, false),
                           'account_type', o.account_type));
      RETURN jse__bank_reject(a, o, 'SHORT_SELLING_NOT_ALLOWED',
        'Short selling is not allowed: ' || t.code || ' holds ' || v_hold || ' ' || s.symbol || ' shares but the order sells ' || o.quantity || '.',
        jsonb_build_object('holding', v_hold, 'quantity', o.quantity));
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
        'Loan interest charged ' || jse_inr(v_interest) || ' (' || jse_rate_text(cfg.loan_interest_rate) || ' on ' || jse_inr(v_draw) || ') \u2014 added to the loan balance, no cash moved', a);
      UPDATE loans SET original_principal = original_principal + v_draw, principal_outstanding = principal_outstanding + v_draw,
             interest_outstanding = interest_outstanding + v_interest, interest_charged = interest_charged + v_interest,
             draws = draws + 1, status = 'OUTSTANDING', updated_at = now()
      WHERE team_id = t.id;
      INSERT INTO loan_transactions(team_id, kind, amount, order_id, settlement_id, automatic, note, actor_id, actor_name)
      VALUES (t.id, 'DRAW', v_draw, o.id, v_settle_id, true, 'Automatic draw at settlement of ' || o.order_no, nullif(a->>'id', '')::integer, jse_actor_name(a)),
             (t.id, 'INTEREST_CHARGE', v_interest, o.id, v_settle_id, true, jse_rate_text(cfg.loan_interest_rate) || ' interest on draw', nullif(a->>'id', '')::integer, jse_actor_name(a));
      PERFORM jse_audit(a, 'LOAN_DRAW', 'loan', t.code, t.id, o.id, NULL, NULL,
        jsonb_build_object('amount', v_draw, 'interest', v_interest, 'automatic', true, 'order_no', o.order_no));
      PERFORM jse_audit(a, 'INSUFFICIENT_BALANCE_SETTLED', 'order', o.order_no, t.id, o.id, NULL, NULL,
        jsonb_build_object('required', v_req, 'cash', v_cash, 'loan_drawn', v_draw, 'interest', v_interest, 'symbol', s.symbol,
                           'account_type', o.account_type));
    END IF;
    v_bal := v_bal - v_tv;
    v_note := CASE WHEN o.account_type = 'INSTITUTION' THEN 'Bought ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ' from ' || inst.code
                   ELSE 'Bought ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) END;
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
      v_inst_before := inst.cash; v_inst_after := inst.cash + v_tv;
      UPDATE institutions SET cash = v_inst_after, updated_at = now() WHERE id = inst.id;
      PERFORM jse_inst_ledger(inst.id, o.id, v_settle_id, 'SELL', 0, v_tv, v_inst_after,
        'Sold ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ' to ' || t.code, a);
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
    v_note := CASE WHEN o.account_type = 'INSTITUTION' THEN 'Sold ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ' to ' || inst.code
                   ELSE 'Sold ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) END;
    PERFORM jse_ledger(t.id, o.id, v_settle_id, 'SELL', 0, v_tv, v_bal, v_note, a);
    IF v_brk > 0 THEN
      v_bal := v_bal - v_brk;
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BROKERAGE', v_brk, 0, v_bal, 'Brokerage ' || jse_rate_text(v_rate) || ' on ' || o.order_no, a);
    END IF;
    v_realized := round(v_tv - v_brk - v_cost_moved, 2);
    v_team_delta := v_tv - v_brk;
    IF o.account_type = 'INSTITUTION' THEN
      v_inst_before := inst.cash; v_inst_after := inst.cash - v_tv;
      UPDATE institutions SET cash = v_inst_after, updated_at = now() WHERE id = inst.id;
      PERFORM jse_inst_ledger(inst.id, o.id, v_settle_id, 'BUY', v_tv, 0, v_inst_after,
        'Bought ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ' from ' || t.code, a);
    END IF;
  END IF;

  v_cash_after := v_bal;
  IF v_cash_after < 0 THEN
    RAISE EXCEPTION 'JSE invariant: negative cash for % on %', t.code, o.order_no;
  END IF;
  UPDATE teams SET cash = v_cash_after, realized_pnl = realized_pnl + v_realized, brokerage_paid = brokerage_paid + v_brk, updated_at = now()
  WHERE id = t.id;

  -- the team's broker earns the brokerage on every settled trade of its team (institutional counterparty trades too);
  -- the commission register records the team's side of the trade
  IF v_brk > 0 AND o.broker_id IS NOT NULL THEN
    INSERT INTO broker_commissions(order_id, settlement_id, broker_id, team_id, side, trade_value, rate, amount)
    VALUES (o.id, v_settle_id, o.broker_id, t.id, jse_team_side(o.account_type, o.side), v_tv, v_rate, v_brk);
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
    t.code || ' cash ' || jse_inr(v_cash) || ' \u2192 ' || jse_inr(v_cash_after) || '; ' || s.symbol || ' holding ' || v_hold || ' \u2192 ' || v_hold_after ||
    '; market price unchanged at ' || jse_inr(s.price) || ' (prices move only on Market News)',
    jsonb_build_object('holding_before', v_hold, 'holding_after', v_hold_after, 'market_price', s.price));
  PERFORM jse_audit(a, 'BANK_SETTLED', 'order', o.order_no, t.id, o.id,
    jsonb_build_object('status', o.status, 'cash', v_cash, 'holding', v_hold),
    jsonb_build_object('status', 'BANK_SETTLED', 'cash', v_cash_after, 'holding', v_hold_after),
    jsonb_build_object('account_type', o.account_type, 'side', o.side, 'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate,
                       'loan_drawn', v_draw, 'interest', v_interest, 'realized_pnl', v_realized, 'market_price', s.price, 'source', p_source));
  PERFORM jse_journal('BANK_SETTLE', v_settle_id, o.order_no || ' settled (' || o.side || ' ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ')',
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
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'PIT_MANAGER');
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
`;var Xr=`-- JAIN STOCK EXCHANGE (JSE) v3.13
-- 003_ops.sql: institutional orders, loans, Market News (the only price engine), event control,
-- participant instructions, team names, IPO round (applications, allotments, prospectus, listing),
-- reset, undo / redo and administration.
-- Material administrative actions call jse_require_admin_password (one password dialog per action).

-- ---------------------------------------------------------------------------
-- Institutional order: a transaction-based counterparty for a participant team that cannot find one in the
-- market. Price = prevailing market price + 2% when the participant BUYS from the institution, \u2212 2% when the
-- participant SELLS to it (nobody types a price). The participant pays the normal brokerage, earned by its
-- broker. No institutional cash or holdings restriction. Same Exchange \u2192 Bank workflow as every order.
-- p.side is the INSTITUTION's side (BUY = it buys from the team; SELL = it sells to the team).
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
  v_price numeric; v_amount numeric; v_team_side text;
  v_id bigint; v_no text; v_existing bigint;
  v_warnings jsonb := '[]'::jsonb;
  v_avail record; v_free_cash numeric; v_room numeric;
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
  IF NOT v_team.active THEN PERFORM jse_fail('TEAM_INACTIVE', 'Team ' || v_team.code || ' is not active.', 409); END IF;
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
  -- expected_price = the prevailing MARKET price the desk saw (the institutional price is derived from it)
  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'PRICE_CHANGED', HINT = '409',
      MESSAGE = 'MARKET PRICE CHANGED: ' || v_sec.symbol || ' moved from ' || jse_inr(v_expected) || ' to ' || jse_inr(v_sec.price) ||
                ' (Market News). The institutional price is recalculated from the new market price \u2014 review and submit again.';
  END IF;
  v_team_side := jse_team_side('INSTITUTION', v_side);
  v_price := jse_inst_price(v_sec.price, v_side);
  v_tv := round(v_qty * v_price, 2);
  v_rate := cfg.brokerage_rate;
  v_brk := round(v_tv * v_rate, 2);
  v_amount := CASE WHEN v_team_side = 'BUY' THEN v_tv + v_brk ELSE v_tv - v_brk END;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between ' || jse_inr(cfg.min_order_value) || ' and ' || jse_inr(cfg.max_order_value) ||
      ' per order (this order: ' || jse_inr(v_tv) || ').', 400);
  END IF;

  -- the participant side is checked like any participant trade (v3.14: refused, not only flagged); team row locked
  PERFORM 1 FROM teams WHERE id = v_team.id FOR UPDATE;
  IF v_team_side = 'SELL' THEN
    SELECT * INTO v_avail FROM jse_available_qty(v_team.id, v_sec.id, NULL);
    IF v_qty > v_avail.available THEN
      RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_NOT_ALLOWED', HINT = '409',
        MESSAGE = 'Short selling is not allowed. You can sell only the shares available in your portfolio. Please reduce the quantity or check your holdings. (' ||
                  v_team.code || ' can sell ' || greatest(v_avail.available, 0) || ' ' || v_sec.symbol || ')';
    END IF;
  ELSE
    v_free_cash := jse_available_cash(v_team.id, NULL);
    IF v_amount > v_free_cash THEN
      RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'INSUFFICIENT_BALANCE', HINT = '409',
        MESSAGE = 'Insufficient balance! Your available cash is ' || jse_inr(greatest(v_free_cash, 0)) || ', but this order requires ' || jse_inr(v_amount) ||
                  ', including applicable charges. Please reduce the order quantity or obtain an approved loan before placing this order.';
    END IF;
    PERFORM jse_check_company_limit(v_team.id, v_sec.id, v_amount, NULL);
  END IF;

  v_id := nextval(pg_get_serial_sequence('orders', 'id'));
  v_no := 'INS-' || v_id::text;
  INSERT INTO orders(id, order_no, account_type, team_id, institution_id, broker_id, security_id, side, quantity, price, trade_value, brokerage,
                     brokerage_rate, settlement_amount, reference_price, status, notes, idempotency_key, created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'INSTITUTION', v_team.id, v_inst.id, v_team.broker_id, v_sec.id, v_side, v_qty, v_price, v_tv, v_brk,
          v_rate, v_amount, v_sec.price, 'EXCHANGE_PENDING', left(p->>'notes', 300), v_key,
          nullif(a->>'id', '')::integer, jse_actor_name(a), a->>'role');
  PERFORM jse_order_event(v_id, 'INSTITUTION_SUBMITTED', NULL, 'EXCHANGE_PENDING', a,
    v_team.code || ' ' || CASE WHEN v_team_side = 'BUY' THEN 'buys from ' ELSE 'sells to ' END || v_inst.code || ' at ' || jse_inr(v_price) ||
    ' (market ' || jse_inr(v_sec.price) || CASE WHEN v_team_side = 'BUY' THEN ' + ' ELSE ' \u2212 ' END || to_char(jse_inst_spread_pct(), 'FM990.##') || '%)' ||
    ' \xB7 brokerage ' || jse_rate_text(v_rate) || ' = ' || jse_inr(v_brk),
    jsonb_build_object('price', v_price, 'market_price', v_sec.price, 'spread_pct', jse_inst_spread_pct(), 'trade_value', v_tv, 'brokerage', v_brk,
                       'institution', v_inst.code));
  PERFORM jse_audit(a, 'INSTITUTIONAL_ORDER_SUBMITTED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'EXCHANGE_PENDING', 'side', v_side, 'team_side', v_team_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_price),
    jsonb_build_object('account_type', 'INSTITUTION', 'institution', v_inst.code, 'counterparty', v_team.code, 'market_price', v_sec.price,
                       'spread_pct', jse_inst_spread_pct(), 'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'settlement_amount', v_amount,
                       'broker', (SELECT code FROM brokers WHERE id = v_team.broker_id)));
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
      PERFORM jse_fail('LOAN_LIMIT', 'Only ' || jse_inr(v_room) || ' of the ' || jse_inr(cfg.loan_max_principal) || ' loan limit is left for ' || t.code || '.', 409);
    END IF;
    v_interest := round(v_amount * cfg.loan_interest_rate, 2);
    v_bal := t.cash + v_amount;
    UPDATE teams SET cash = v_bal, updated_at = now() WHERE id = t.id;
    UPDATE loans SET original_principal = original_principal + v_amount, principal_outstanding = principal_outstanding + v_amount,
           interest_outstanding = interest_outstanding + v_interest, interest_charged = interest_charged + v_interest,
           draws = draws + 1, status = 'OUTSTANDING', updated_at = now() WHERE team_id = t.id;
    PERFORM jse_ledger(t.id, NULL, NULL, 'LOAN_DRAW', 0, v_amount, v_bal, 'Loan draw by the Bank', a);
    PERFORM jse_ledger(t.id, NULL, NULL, 'INTEREST_CHARGE', 0, 0, v_bal,
      'Loan interest charged ' || jse_inr(v_interest) || ' (' || jse_rate_text(cfg.loan_interest_rate) || ' on ' || jse_inr(v_amount) || ') \u2014 added to the loan balance, no cash moved', a);
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
      PERFORM jse_fail('REPAYMENT_EXCEEDS_DUE', 'Repayment is more than the amount due (' || jse_inr(v_due) || ').', 409);
    END IF;
    IF v_amount > t.cash THEN
      PERFORM jse_fail('REPAYMENT_CASH_LIMIT', t.code || ' has only ' || jse_inr(t.cash) || ' in cash.', 409);
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
        'Loan principal repaid' || CASE WHEN v_prin_left > 0 THEN ' (' || jse_inr(v_prin_left) || ' principal remains)' ELSE ' (principal cleared)' END, a);
      INSERT INTO loan_transactions(team_id, kind, amount, note, actor_id, actor_name)
      VALUES (t.id, 'PRINCIPAL_REPAYMENT', v_prin_pay, 'Principal repayment', nullif(a->>'id', '')::integer, jse_actor_name(a));
      IF v_prin_left > 0 THEN
        v_fresh := round(v_prin_left * cfg.loan_interest_rate, 2);
        IF v_fresh > 0 THEN
          PERFORM jse_ledger(t.id, NULL, NULL, 'INTEREST_CHARGE', 0, 0, v_bal,
            'Fresh interest ' || jse_inr(v_fresh) || ' (' || jse_rate_text(cfg.loan_interest_rate) || ' on the remaining principal ' || jse_inr(v_prin_left) ||
            ' after a partial repayment) \u2014 added to the loan balance, no cash moved', a);
          INSERT INTO loan_transactions(team_id, kind, amount, note, actor_id, actor_name)
          VALUES (t.id, 'INTEREST_CHARGE', v_fresh, jse_rate_text(cfg.loan_interest_rate) || ' fresh interest on remaining principal ' || jse_inr(v_prin_left),
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
  PERFORM jse_journal('MARKET_NEWS', v_news, s.symbol || ' ' || replace(p_mood, '_', ' ') || ' ' || CASE WHEN v_applied > 0 THEN '+' ELSE '' END || to_char(v_applied, 'FM990.00') || '% (' || jse_inr(s.price) || ' \u2192 ' || jse_inr(p_new) || ')',
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
  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL');  -- as on Hatchable: Event Admin and the Institutional desk
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
    WHEN 'REOPEN'   THEN CASE WHEN v_cur IN ('CLOSED', 'FINALIZED') THEN 'LIVE' END   -- reopen after CLOSE or FINALIZE (results become provisional again)
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

-- ---------------------------------------------------------------------------
-- v3.14 Loan requests: a team (through its broker), the Bank or the Admin requests a loan; the Bank Desk approves it and the
-- approved amount is credited at once (one transaction: loan draw + cash + ledger + request status). Approving twice never pays twice.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_loan_request(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE t teams%ROWTYPE; v_amt numeric; v_room numeric; v_status text; v_id bigint; cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK', 'BROKER', 'PIT_MANAGER', 'PARTICIPANT');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN PERFORM jse_fail('EVENT_NOT_OPEN', 'Loans can be requested only while the market is open.', 409); END IF;
  IF NOT cfg.loans_enabled THEN PERFORM jse_fail('LOANS_DISABLED', 'Borrowing is not permitted right now.', 409); END IF;
  IF a->>'role' = 'PARTICIPANT' THEN SELECT * INTO t FROM teams WHERE id = nullif(a->>'team_id', '')::integer;
  ELSE SELECT * INTO t FROM teams WHERE code = upper(trim(coalesce(p->>'team', ''))); END IF;
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Select a valid team.', 404); END IF;
  IF a->>'role' = 'BROKER' AND t.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN
    PERFORM jse_fail('NOT_YOUR_TEAM', t.code || ' is assigned to another broker.', 403);
  END IF;
  BEGIN v_amt := (p->>'amount')::numeric; EXCEPTION WHEN others THEN PERFORM jse_fail('INVALID_AMOUNT', 'Enter the loan amount in whole rupees.', 400); END;
  IF v_amt IS NULL OR v_amt <= 0 OR v_amt <> trunc(v_amt) THEN PERFORM jse_fail('INVALID_AMOUNT', 'Enter the loan amount in whole rupees.', 400); END IF;
  v_room := jse_loan_room(t.id);
  IF v_amt > v_room THEN PERFORM jse_fail('LOAN_LIMIT', 'Only ' || jse_inr(v_room) || ' of the ' || jse_inr(cfg.loan_max_principal) || ' loan limit is left for ' || t.code || '.', 409); END IF;
  BEGIN
    INSERT INTO loan_requests(team_id, requested_amount, reason, requested_by, requested_role)
    VALUES (t.id, v_amt, left(p->>'reason', 300), jse_actor_name(a), a->>'role') RETURNING id INTO v_id;
  EXCEPTION WHEN unique_violation THEN
    PERFORM jse_fail('LOAN_REQUEST_PENDING', t.code || ' already has a loan request waiting at the Bank Desk.', 409);
  END;
  UPDATE loan_requests SET request_no = 'LR-' || v_id WHERE id = v_id;
  PERFORM jse_audit(a, 'LOAN_REQUESTED', 'loan', 'LR-' || v_id, t.id, NULL, NULL, jsonb_build_object('status', 'PENDING', 'requested_amount', v_amt), NULL);
  RETURN jsonb_build_object('success', true, 'request_no', 'LR-' || v_id, 'id', v_id, 'team', t.code, 'requested_amount', v_amt,
    'message', 'Loan request LR-' || v_id || ' for ' || jse_inr(v_amt) || ' sent to the Bank Desk.');
END $$;

CREATE OR REPLACE FUNCTION jse_loan_decide(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE r loan_requests%ROWTYPE; t teams%ROWTYPE; v_action text := upper(coalesce(p->>'action', '')); v_amt numeric; v_draw jsonb; v_ref bigint;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT * INTO r FROM loan_requests WHERE id = nullif(p->>'request_id', '')::bigint FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('REQUEST_NOT_FOUND', 'Loan request not found.', 404); END IF;
  SELECT * INTO t FROM teams WHERE id = r.team_id;
  IF r.status = 'DISBURSED' AND v_action = 'APPROVE' THEN
    RETURN jsonb_build_object('success', true, 'replayed', true, 'request_no', r.request_no, 'team', t.code, 'approved_amount', r.approved_amount,
      'message', 'Already released: ' || jse_inr(r.approved_amount) || ' was credited to Team ' || t.code || ' (no second credit).');
  END IF;
  IF r.status <> 'PENDING' THEN PERFORM jse_fail('REQUEST_CLOSED', r.request_no || ' is already ' || lower(r.status) || '.', 409); END IF;
  IF v_action = 'REJECT' THEN
    UPDATE loan_requests SET status = 'REJECTED', decided_by = jse_actor_name(a), decided_at = now(), decision_note = left(p->>'note', 300) WHERE id = r.id;
    PERFORM jse_audit(a, 'LOAN_REJECTED', 'loan', r.request_no, t.id, NULL, jsonb_build_object('status', 'PENDING'), jsonb_build_object('status', 'REJECTED'),
      jsonb_build_object('note', p->>'note'));
    RETURN jsonb_build_object('success', true, 'request_no', r.request_no, 'team', t.code, 'status', 'REJECTED', 'message', r.request_no || ' rejected.');
  ELSIF v_action <> 'APPROVE' THEN PERFORM jse_fail('INVALID_ACTION', 'Choose APPROVE or REJECT.', 400);
  END IF;
  BEGIN v_amt := coalesce(nullif(p->>'approved_amount', '')::numeric, r.requested_amount);
  EXCEPTION WHEN others THEN PERFORM jse_fail('INVALID_AMOUNT', 'Enter the approved amount in whole rupees.', 400); END;
  IF v_amt <= 0 OR v_amt <> trunc(v_amt) OR v_amt > r.requested_amount THEN
    PERFORM jse_fail('INVALID_AMOUNT', 'The approved amount must be a whole-rupee amount up to the requested ' || jse_inr(r.requested_amount) || '.', 400);
  END IF;
  -- release: the existing Bank loan draw (team lock, loan limit, cash, ledger, interest, audit) in this same transaction
  v_draw := jse_loan_action(a, jsonb_build_object('team', t.code, 'action', 'DRAW', 'amount', v_amt));
  SELECT max(id) INTO v_ref FROM loan_transactions WHERE team_id = t.id AND kind = 'DRAW';
  UPDATE loan_requests SET status = 'DISBURSED', approved_amount = v_amt, decided_by = jse_actor_name(a), decided_at = now(),
         decision_note = left(p->>'note', 300), disbursement_ref = v_ref, cash_after = (v_draw->>'cash')::numeric WHERE id = r.id;
  PERFORM jse_audit(a, 'LOAN_APPROVED_RELEASED', 'loan', r.request_no, t.id, NULL,
    jsonb_build_object('status', 'PENDING', 'cash', (v_draw->>'cash')::numeric - v_amt),
    jsonb_build_object('status', 'DISBURSED', 'cash', (v_draw->>'cash')::numeric),
    jsonb_build_object('requested_amount', r.requested_amount, 'approved_amount', v_amt, 'disbursement_ref', v_ref));
  RETURN jsonb_build_object('success', true, 'request_no', r.request_no, 'team', t.code, 'status', 'DISBURSED', 'approved_amount', v_amt,
    'cash', (v_draw->>'cash')::numeric, 'disbursement_ref', v_ref,
    'message', 'Loan approved and released successfully. ' || jse_inr(v_amt) || ' has been credited to Team ' || t.code || '''s account.');
END $$;

CREATE OR REPLACE FUNCTION jse_loan_requests(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK', 'VIEWER', 'BROKER', 'PIT_MANAGER', 'PARTICIPANT');
  RETURN jsonb_build_object('success', true, 'bank_name', (SELECT bank_name FROM event_config WHERE id = 1), 'requests', coalesce((
    SELECT jsonb_agg(jsonb_build_object('id', r.id, 'request_no', r.request_no, 'team', t.code, 'team_name', t.name, 'requested_amount', r.requested_amount,
      'approved_amount', r.approved_amount, 'status', r.status, 'reason', r.reason, 'requested_by', r.requested_by, 'requested_at', r.requested_at,
      'decided_by', r.decided_by, 'decided_at', r.decided_at, 'disbursement_ref', r.disbursement_ref, 'cash', t.cash, 'loan_room', jse_loan_room(t.id))
      ORDER BY (r.status = 'PENDING') DESC, r.id DESC)
    FROM (SELECT * FROM loan_requests ORDER BY id DESC LIMIT 200) r JOIN teams t ON t.id = r.team_id
    WHERE (a->>'role' <> 'PARTICIPANT' OR t.id = nullif(a->>'team_id', '')::integer)
      AND (a->>'role' <> 'BROKER' OR t.broker_id = nullif(a->>'broker_id', '')::integer)), '[]'::jsonb));
END $$;

-- v3.14 P3: editable bank name and institutional investor name (same records, stable IDs; audited with old/new/reason)
CREATE OR REPLACE FUNCTION jse_rename_entity(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_kind text := upper(coalesce(p->>'kind', '')); v_new text := trim(coalesce(p->>'name', '')); v_old text; v_id integer;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  IF v_new = '' OR length(v_new) > 80 THEN PERFORM jse_fail('INVALID_NAME', 'Enter a name (1\u201380 characters).', 400); END IF;
  IF v_kind = 'BANK' THEN
    SELECT bank_name INTO v_old FROM event_config WHERE id = 1 FOR UPDATE;
    UPDATE event_config SET bank_name = v_new WHERE id = 1;
  ELSIF v_kind = 'INSTITUTION' THEN
    SELECT id, name INTO v_id, v_old FROM institutions WHERE (nullif(p->>'id', '') IS NULL OR id = (p->>'id')::integer) ORDER BY id LIMIT 1 FOR UPDATE;
    IF NOT FOUND THEN PERFORM jse_fail('NOT_FOUND', 'Institutional investor not found.', 404); END IF;
    IF EXISTS (SELECT 1 FROM institutions WHERE lower(name) = lower(v_new) AND id <> v_id) THEN
      PERFORM jse_fail('DUPLICATE_NAME', 'Another institutional investor already uses that name.', 409);
    END IF;
    UPDATE institutions SET name = v_new WHERE id = v_id;
  ELSE PERFORM jse_fail('INVALID_KIND', 'Choose BANK or INSTITUTION.', 400);
  END IF;
  IF v_old IS NOT DISTINCT FROM v_new THEN RETURN jsonb_build_object('success', true, 'unchanged', true, 'name', v_new); END IF;
  PERFORM jse_audit(a, v_kind || '_RENAMED', lower(v_kind), coalesce(v_id::text, 'bank'), NULL, NULL,
    jsonb_build_object('name', v_old), jsonb_build_object('name', v_new), jsonb_build_object('reason', left(p->>'reason', 300)));
  RETURN jsonb_build_object('success', true, 'kind', v_kind, 'old_name', v_old, 'name', v_new,
    'message', initcap(lower(v_kind)) || ' name changed from "' || v_old || '" to "' || v_new || '".');
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
-- Stages: PRE_IPO \u2192 APPLICATION_OPEN \u2192 APPLICATION_CLOSED \u2192 ALLOTMENT_COMPLETED \u2192 LISTED (in CMS 50)
-- Once START EVENT has run (any status other than NOT_STARTED) the window is CLOSED whatever the clock says.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_ipo_window() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('event_start_at', c.event_start_at, 'opens_at', c.event_start_at - interval '48 hours',
    'closes_at', c.event_start_at - interval '48 hours' + make_interval(mins => (c.ipo_application_hours * 60)::integer),
    'hours', c.ipo_application_hours, 'event_started', coalesce(ec.status, 'NOT_STARTED') <> 'NOT_STARTED',
    'phase', CASE WHEN coalesce(ec.status, 'NOT_STARTED') <> 'NOT_STARTED' THEN 'CLOSED'
                  WHEN now() < c.event_start_at - interval '48 hours' THEN 'PRE_IPO'
                  WHEN now() < c.event_start_at - interval '48 hours' + make_interval(mins => (c.ipo_application_hours * 60)::integer) THEN 'OPEN'
                  ELSE 'CLOSED' END)
  FROM event_config c LEFT JOIN event_control ec ON ec.id = 1 WHERE c.id = 1
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
    PERFORM jse_fail('APPLICATION_CASH', 'All IPO applications together (' || jse_inr((v_other + v_amount)) || ') cannot exceed the team''s cash (' || jse_inr(t.cash) || ').', 409);
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
    'IPO allotment: ' || p_allot.lots || ' IPO lot(s) = ' || p_allot.quantity || ' ' || v_sym || ' @ ' || jse_inr(p_allot.price) || ' (no brokerage; not an assessment trade)', a);
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
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' / ' || v_sec.symbol || ': Amount ' || (r->>'amount') || ' \u2260 ' || v_shares || ' \xD7 ' || jse_inr(v_sec.base_price) || ' = ' || jse_inr(v_amt)); CONTINUE;
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
      v_errors := v_errors || jsonb_build_object('row', NULL, 'error', x.team || ' does not have enough cash for ' || jse_inr(x.need) || ' of allotments (available ' || jse_inr(v_total) || ')');
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
    s.symbol || ' listed at ' || jse_inr(v_price) || ' (issue ' || jse_inr(s.base_price) || ', ' || CASE WHEN v_pct > 0 THEN '+' ELSE '' END || to_char(round(v_pct, 2), 'FM990.00') || '%) \xB7 CMS 50 ' || v_n || ' components',
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
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ': use whole rupees (price step ' || jse_inr(cfg.price_tick) || ')'); CONTINUE;
      END IF;
      IF v_price < s.base_price * 0.5 OR v_price > s.base_price * 2 THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ': the listing price must be between 50% and 200% of the issue price ' || jse_inr(s.base_price));
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
           market_news, order_events, settlements, holdings, institutional_holdings, ipo_allotments, trading_slips, instructions, orders, audit_log
           RESTART IDENTITY;
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
  PERFORM jse_audit(a, 'EVENT_RESET', 'event', 'event_control', NULL, NULL, jsonb_build_object('status', ev.status),
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
  v_bal numeric; v_team_buys boolean; v_inst_bal numeric;
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
    PERFORM jse_ledger(t.id, o.id, st.id, 'INTEREST_CHARGE', 0, 0, v_bal, 'Loan interest ' || jse_inr(st.loan_interest) || ' on the reversed draw cancelled (undo)', a);
  END IF;
  -- institution side: only its transaction record (institutions hold no restricted cash or portfolio)
  IF st.institution_id IS NOT NULL THEN
    UPDATE institutions SET cash = cash - (st.institution_cash_after - st.institution_cash_before), updated_at = now() WHERE id = st.institution_id
    RETURNING cash INTO v_inst_bal;
    PERFORM jse_inst_ledger(st.institution_id, o.id, st.id, 'REVERSAL',
      greatest(st.institution_cash_after - st.institution_cash_before, 0), greatest(st.institution_cash_before - st.institution_cash_after, 0),
      v_inst_bal, 'Undo of ' || o.order_no || ' settlement', a);
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
  PERFORM jse_audit(a, 'CONFIGURATION_UPDATED', 'event_config', '1', NULL, NULL, before, after,
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
      SELECT jsonb_agg(jsonb_build_object('id', u2.id, 'username', u2.username, 'name', u2.display_name, 'email', u2.email, 'role', u2.role,
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
  ELSIF v_action = 'CREATE_USER' THEN
    -- v3.14: add an account for any role (extra brokers, desks, faculty, administrators); password shown once
    DECLARE v_role text := upper(trim(coalesce(p->>'role', ''))); v_user text := upper(trim(coalesce(p->>'username', '')));
            v_name text := trim(coalesce(p->>'display_name', '')); v_team integer; v_broker integer; v_inst integer;
    BEGIN
      IF v_role NOT IN ('ADMIN','EXCHANGE','BANK','BROKER','PIT_MANAGER','INSTITUTIONAL','PARTICIPANT','VIEWER') THEN
        PERFORM jse_fail('INVALID_ROLE', 'Choose a valid role.', 400); END IF;
      IF v_user !~ '^[A-Z0-9][A-Z0-9_.-]{2,39}$' THEN
        PERFORM jse_fail('INVALID_USERNAME', 'Username: 3\u201340 letters, digits, dot, dash or underscore (e.g. BROKER-11, BANK-05).', 400); END IF;
      IF EXISTS (SELECT 1 FROM app_users WHERE lower(username) = lower(v_user)) THEN
        PERFORM jse_fail('USERNAME_TAKEN', v_user || ' already exists.', 409); END IF;
      IF v_name = '' THEN v_name := v_user; END IF;
      IF v_role = 'PARTICIPANT' THEN
        SELECT id INTO v_team FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')));
        IF v_team IS NULL THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'A participant account needs an existing team code (TEAM-001 \u2026).', 400); END IF;
      ELSIF v_role = 'BROKER' THEN
        SELECT id INTO v_broker FROM brokers WHERE code = upper(trim(coalesce(nullif(p->>'broker', ''), v_user)));
        IF v_broker IS NULL THEN   -- a new broker desk: create the broker record with this code
          INSERT INTO brokers(code, name) VALUES (upper(trim(coalesce(nullif(p->>'broker', ''), v_user))), v_name) RETURNING id INTO v_broker;
        END IF;
      ELSIF v_role = 'INSTITUTIONAL' THEN
        SELECT id INTO v_inst FROM institutions ORDER BY id LIMIT 1;
      END IF;
      v_pw := coalesce(nullif(p->>'password', ''), jse_random_password());
      IF length(v_pw) < 8 THEN PERFORM jse_fail('WEAK_PASSWORD', 'Use at least 8 characters.', 400); END IF;
      INSERT INTO app_users(username, display_name, email, role, team_id, broker_id, institution_id, password_hash, must_change_password)
      VALUES (v_user, v_name, nullif(trim(coalesce(p->>'email', '')), ''), v_role, v_team, v_broker, v_inst, crypt(v_pw, gen_salt('bf', 8)),
              coalesce((p->>'must_change_password')::boolean, false))
      RETURNING * INTO u;
      PERFORM jse_audit(a, 'USER_CREATED', 'user', u.username, u.team_id, NULL, NULL,
        jsonb_build_object('role', u.role, 'display_name', u.display_name, 'broker', (SELECT code FROM brokers WHERE id = u.broker_id)), NULL);
      RETURN jsonb_build_object('success', true, 'username', u.username, 'role', u.role, 'password', v_pw,
        'message', 'Account ' || u.username || ' (' || u.role || ') created.');
    END;
  ELSIF v_action = 'UPDATE_USER' THEN
    SELECT * INTO u FROM app_users WHERE lower(username) = lower(trim(coalesce(p->>'username', ''))) FOR UPDATE;
    IF NOT FOUND THEN PERFORM jse_fail('USER_NOT_FOUND', 'User not found.', 404); END IF;
    UPDATE app_users SET display_name = coalesce(nullif(trim(p->>'display_name'), ''), display_name),
                         email = CASE WHEN p ? 'email' THEN nullif(trim(p->>'email'), '') ELSE email END, updated_at = now() WHERE id = u.id;
    PERFORM jse_audit(a, 'USER_UPDATED', 'user', u.username, u.team_id, NULL, jsonb_build_object('display_name', u.display_name, 'email', u.email),
      jsonb_build_object('display_name', coalesce(nullif(trim(p->>'display_name'), ''), u.display_name), 'email', CASE WHEN p ? 'email' THEN nullif(trim(p->>'email'), '') ELSE u.email END), NULL);
    RETURN jsonb_build_object('success', true, 'username', u.username, 'message', u.username || ' updated.');
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
  IF v_action NOT IN ('EXPORT_EVENT_EXCEL', 'EXPORT_EVENT_JSON', 'EXPORT_EVENT_CSV', 'EXPORT_CSV', 'CREDENTIALS_ISSUED') THEN PERFORM jse_fail('INVALID_ACTION', 'Unknown audit note.', 400); END IF;
  PERFORM jse_audit(a, v_action, 'export', NULL, NULL, NULL, NULL, NULL, p - 'action' - 'admin_password');
  RETURN jsonb_build_object('success', true);
END $$;

INSERT INTO schema_migrations(version) VALUES ('003_ops');
`;var Jr=`-- JAIN STOCK EXCHANGE (JSE) v311
-- 004_reads.sql: read models used by the API (CMS 50, market board, IPO page, portfolios with assessment and
-- eligibility, order tracking with the canonical six-step flow, Pit Manager queue, trading slips, broker desk,
-- Exchange / Bank queues, ledgers, audit, commissions, Market Intelligence, admin state, certificates).

-- ---------------------------------------------------------------------------
-- CMS 50 \u2014 one canonical calculation (a simple price-sum event index), stage-aware composition: the 50 listed
-- CMS equities plus every IPO that has officially listed (each IPO once, at its listing price as the component base).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_cms_index() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('name', 'CMS 50',
    'value', coalesce(sum(price), 0),
    'base_value', coalesce(sum(coalesce(index_base_price, base_price)), 0),
    'change', coalesce(sum(price), 0) - coalesce(sum(coalesce(index_base_price, base_price)), 0),
    'change_pct', CASE WHEN coalesce(sum(coalesce(index_base_price, base_price)), 0) = 0 THEN 0
                       ELSE round((sum(price) - sum(coalesce(index_base_price, base_price))) * 100 / sum(coalesce(index_base_price, base_price)), 2) END,
    'components', count(*),
    'equity_components', count(*) FILTER (WHERE kind = 'EQUITY'),
    'ipo_components', count(*) FILTER (WHERE kind = 'IPO'),
    'ipos_included', coalesce(jsonb_agg(symbol ORDER BY listed_at) FILTER (WHERE kind = 'IPO'), '[]'::jsonb),
    'methodology', 'Sum of component prices. Components: the 50 listed CMS equities plus each IPO once it lists (base = its listing price).')
  FROM securities WHERE active AND (kind = 'EQUITY' OR listed_at IS NOT NULL)
$$;

-- ---------------------------------------------------------------------------
-- Team metrics: Net Worth = liquid cash + \u03A3(quantity \xD7 current price) (the closing price once the market closes).
-- Assessment: settled listed-stock BUY / SELL trades of the team \u2014 its own orders and its trades with an institutional
-- counterparty, counted from the team's side (IPO allotments are not trades).
-- Eligibility: assessment met + loan fully repaid (when required) + closing cash rule (evaluated at close).
-- ---------------------------------------------------------------------------
DROP VIEW IF EXISTS jse_team_metrics;
CREATE VIEW jse_team_metrics AS
WITH cfg AS (SELECT * FROM event_config WHERE id = 1),
     ev  AS (SELECT status FROM event_control WHERE id = 1),
     hv  AS (SELECT h.team_id, sum(h.quantity * s.price) AS holdings_value, sum(h.cost_basis) AS cost_basis,
                    count(*) FILTER (WHERE h.quantity > 0) AS positions
             FROM holdings h JOIN securities s ON s.id = h.security_id GROUP BY h.team_id),
     tr  AS (SELECT team_id, count(*) FILTER (WHERE jse_team_side(account_type, side) = 'BUY') AS buys,
                    count(*) FILTER (WHERE jse_team_side(account_type, side) = 'SELL') AS sells
             FROM settlements WHERE reversed_at IS NULL GROUP BY team_id),
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
    CASE WHEN final_evaluation AND NOT cash_rule_met THEN 'Closing cash above ' || jse_inr(cash_rule_limit::bigint) || ' (base cash rule)' END], NULL) AS eligibility_gaps,
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
-- the latest real price change first. The server's CMS 50 is the only index value.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_security_json(s securities) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('id', s.id, 'symbol', s.symbol, 'name', s.name, 'kind', s.kind, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
    'ipo_code', s.ipo_code, 'sector', s.sector,
    'price', s.price, 'previous_price', s.previous_price, 'base_price', s.base_price,
    'change', s.price - s.previous_price, 'change_pct', round(jse_pct(s.price, s.previous_price), 2),
    'day_change_pct', round(jse_pct(s.price, coalesce(s.index_base_price, s.base_price)), 2), 'lot_size', s.lot_size,
    'day_base', coalesce(s.index_base_price, s.base_price), 'day_change', s.price - coalesce(s.index_base_price, s.base_price),
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
    'config', jsonb_build_object('initial_capital', cfg.initial_capital, 'institutional_spread_pct', jse_inst_spread_pct(),
      'brokerage_rate', cfg.brokerage_rate, 'stock_lot_size', cfg.stock_lot_size, 'ipo_lot_size', cfg.ipo_lot_size, 'price_tick', cfg.price_tick,
      'min_order_value', cfg.min_order_value, 'max_order_value', cfg.max_order_value, 'max_price_move_pct', cfg.max_price_move_pct,
      'loan_max_principal', cfg.loan_max_principal, 'loan_interest_rate', cfg.loan_interest_rate,
      'cash_rule_limit', cfg.cash_rule_limit, 'loans_enabled', cfg.loans_enabled, 'auto_loan_on_settlement', cfg.auto_loan_on_settlement,
      'loan_repayment_required', cfg.loan_repayment_required, 'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades,
      'event_start_at', cfg.event_start_at, 'ipo_application_hours', cfg.ipo_application_hours, 'auto_list_ipos', cfg.auto_list_ipos,
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
                        CASE WHEN cfg.loan_repayment_required THEN ' + loan fully repaid' ELSE '' END || ' + closing cash rule (base cash \u2264 ' || jse_inr(cfg.cash_rule_limit::bigint) || ', evaluated at close).',
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
    -- the participant capital strip (one server-side calculation): own starting capital vs the loan credit facility
    'capital', jsonb_build_object('base_capital', cfg.initial_capital, 'loan_sanctioned', cfg.loan_max_principal,
      'loan_available', CASE WHEN cfg.loans_enabled THEN greatest(0, cfg.loan_max_principal - (v_m->>'loan_original')::numeric) ELSE 0 END,
      'base_money_left', greatest(0, (v_m->>'cash')::numeric - (v_m->>'loan_liability')::numeric),
      'liquid_cash', (v_m->>'cash')::numeric, 'holdings_value', (v_m->>'holdings_value')::numeric, 'net_worth', (v_m->>'net_worth')::numeric,
      'portfolio_pnl', (v_m->>'pnl')::numeric, 'realized_pnl', (v_m->>'realized_pnl')::numeric, 'unrealized_pnl', (v_m->>'unrealized_pnl')::numeric,
      'brokerage_paid', (v_m->>'brokerage_paid')::numeric, 'max_financing', cfg.initial_capital + cfg.loan_max_principal),
    'rules', jsonb_build_object('starting_capital', cfg.initial_capital, 'cash_limit', cfg.cash_rule_limit, 'loan_limit', cfg.loan_max_principal,
      'loan_rate', cfg.loan_interest_rate, 'brokerage_rate', cfg.brokerage_rate, 'max_order_value', cfg.max_order_value, 'min_order_value', cfg.min_order_value,
      'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades, 'loan_repayment_required', cfg.loan_repayment_required),
    'assessment', jsonb_build_object('buy', (v_m->>'settled_buys')::integer, 'sell', (v_m->>'settled_sells')::integer,
      'min_buy', cfg.min_buy_trades, 'min_sell', cfg.min_sell_trades, 'met', (v_m->>'assessment_met')::boolean,
      'basis', 'Settled listed-stock trades of your team (including trades with an institutional counterparty, counted from your side). IPO allotments, rejected and unsettled orders do not count.'),
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
        'realized_pnl', st.realized_pnl, 'counterparty', CASE WHEN st.account_type = 'INSTITUTION' THEN 'Institutional investor' ELSE 'Market' END,
        'settled_at', st.settled_at) ORDER BY st.settled_at DESC)
      FROM settlements st JOIN orders o ON o.id = st.order_id JOIN securities s ON s.id = st.security_id
      WHERE st.team_id = t.id AND st.reversed_at IS NULL
        AND ((st.account_type = 'TEAM' AND st.side = 'SELL') OR (st.account_type = 'INSTITUTION' AND st.side = 'BUY'))), '[]'::jsonb),
    'bought', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'quantity', st.quantity, 'price', st.price, 'trade_value', st.trade_value, 'brokerage', st.brokerage, 'loan_drawn', st.loan_drawn,
        'counterparty', CASE WHEN st.account_type = 'INSTITUTION' THEN 'Institutional investor' ELSE 'Market' END,
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
      AND (v_side IS NULL OR jse_team_side(o.account_type, o.side) = v_side)
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
        'buy', count(*) FILTER (WHERE jse_team_side(account_type, side) = 'BUY'), 'sell', count(*) FILTER (WHERE jse_team_side(account_type, side) = 'SELL'),
        'awaiting_exchange', count(*) FILTER (WHERE status IN ('PIT_PENDING', 'EXCHANGE_PENDING')),
        'awaiting_bank', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING')),
        'rejected', count(*) FILTER (WHERE status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED')),
        'trade_value', coalesce(sum(trade_value), 0), 'settled_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'gross_brokerage', coalesce(sum(brokerage), 0),
        'brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'short_sell_flags', count(*) FILTER (WHERE short_sell_flag), 'cash_shortfall_flags', count(*) FILTER (WHERE cash_shortfall_flag)) FROM f),
    'page', v_page, 'page_size', v_size,
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('id', x.id, 'order_no', x.order_no, 'account_type', x.account_type, 'team', x.team_code,
        'team_name', x.team_name, 'broker', x.broker_code, 'broker_name', x.broker_name, 'institution', x.institution_code, 'symbol', x.symbol,
        'security', x.security_name, 'kind', x.kind, 'side', x.side, 'team_side', jse_team_side(x.account_type, x.side), 'reference_price', x.reference_price,
        'quantity', x.quantity, 'price', x.price, 'trade_value', x.trade_value,
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

-- The processing flow of one order (Order Created \u2192 Exchange Review \u2192 Bank Settlement \u2192 Market / Cash Updated)
CREATE OR REPLACE FUNCTION jse_order_flow(p_id bigint) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_array(
    jsonb_build_object('step', 'ORDER_CREATED', 'label', 'Order Created',
      'state', 'DONE', 'at', o.created_at, 'by', o.created_by_name || coalesce(' \xB7 ' || b.name || ' (' || b.code || ')', ''),
      'detail', CASE WHEN o.account_type = 'INSTITUTION' THEN 'Institutional transaction \xB7 ' ELSE '' END ||
                jse_team_side(o.account_type, o.side) || ' ' || o.quantity || ' ' || s.symbol ||
                CASE WHEN o.account_type = 'INSTITUTION' AND o.price IS DISTINCT FROM o.reference_price
                     THEN ' at ' || jse_inr(o.price) || ' (market ' || jse_inr(o.reference_price) || CASE WHEN o.side = 'SELL' THEN ' + ' ELSE ' \u2212 ' END ||
                          to_char(jse_inst_spread_pct(), 'FM990.##') || '%)'
                     ELSE ' at the market price ' || jse_inr(o.price) END || ' \xB7 trade value ' || jse_inr(o.trade_value) ||
                ' \xB7 brokerage ' || jse_rate_text(coalesce(o.brokerage_rate, CASE WHEN o.trade_value > 0 THEN o.brokerage / o.trade_value END)) || ' = ' || jse_inr(o.brokerage)),
    jsonb_build_object('step', 'EXCHANGE_REVIEW', 'label', 'Exchange Review',
      'state', CASE WHEN o.status IN ('EXCHANGE_REJECTED', 'PIT_REJECTED') THEN 'REJECTED' WHEN o.status IN ('EXCHANGE_PENDING', 'PIT_PENDING') THEN 'CURRENT'
                    WHEN o.exchange_at IS NOT NULL THEN 'DONE' ELSE 'WAITING' END,
      'at', o.exchange_at, 'by', o.exchange_by_name,
      'detail', CASE WHEN o.status IN ('EXCHANGE_REJECTED', 'PIT_REJECTED') THEN coalesce(o.reject_reason, 'Rejected by the Exchange')
                     WHEN o.status IN ('EXCHANGE_PENDING', 'PIT_PENDING') THEN 'Waiting for Exchange review'
                     WHEN o.exchange_at IS NOT NULL THEN 'Approved' || CASE WHEN o.short_sell_approved THEN ' \u2014 SHORT SELLING \u2014 EXCHANGE APPROVED (the Bank still checks the holding)' ELSE '' END
                     ELSE NULL END),
    jsonb_build_object('step', 'BANK_SETTLEMENT', 'label', 'Bank Settlement',
      'state', CASE WHEN o.status = 'BANK_SETTLED' THEN 'DONE' WHEN o.status = 'BANK_REJECTED' THEN 'REJECTED'
                    WHEN o.status IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN 'CURRENT'
                    WHEN o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED') THEN 'SKIPPED' ELSE 'WAITING' END,
      'at', o.bank_at, 'by', coalesce(o.bank_by_name, o.bank_claimed_name),
      'detail', CASE WHEN o.status = 'BANK_SETTLED' THEN 'Settled ' || jse_inr(o.settlement_amount) || CASE WHEN jse_team_side(o.account_type, o.side) = 'BUY' THEN ' (trade value + brokerage)'
                                                                                              ELSE ' (trade value \u2212 brokerage)' END ||
                                                     CASE WHEN st.loan_drawn > 0 THEN ' \xB7 automatic loan ' || jse_inr(st.loan_drawn) || ' (interest ' || jse_inr(st.loan_interest) || ')' ELSE '' END
                     WHEN o.status = 'BANK_REJECTED' THEN coalesce(o.reject_reason, 'Rejected by the Bank')
                     WHEN o.status = 'BANK_PENDING' THEN 'Being verified by ' || coalesce(o.bank_claimed_name, 'the Bank')
                     WHEN o.status = 'EXCHANGE_APPROVED' THEN 'Waiting for the Bank' ELSE NULL END),
    jsonb_build_object('step', 'UPDATES', 'label', 'Market / Cash Updated',
      'state', CASE WHEN o.status = 'BANK_SETTLED' THEN 'DONE' WHEN o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED') THEN 'SKIPPED' ELSE 'WAITING' END,
      'at', st.settled_at, 'by', st.settled_by_name,
      'detail', CASE WHEN st.id IS NOT NULL THEN t.code || ' cash ' || jse_inr(st.team_cash_before) || ' \u2192 ' || jse_inr(st.team_cash_after) || ' \xB7 ' || s.symbol || ' holding ' ||
                     st.holding_before || ' \u2192 ' || st.holding_after || ' \xB7 market price unchanged (' || jse_inr(st.price_before) || '; prices move only on Market News)'
                     WHEN o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED') THEN 'No cash or holding change (order rejected)' ELSE NULL END))
  FROM orders o JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
  LEFT JOIN brokers b ON b.id = o.broker_id
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
    'assessment', jsonb_build_object('counts', o.status = 'BANK_SETTLED',
      'explanation', CASE WHEN o.status = 'BANK_SETTLED' THEN 'Counts as 1 settled ' || jse_team_side(o.account_type, o.side) || ' trade toward ' ||
                                                            (SELECT code FROM teams WHERE id = o.team_id) || '''s assessment' ||
                                                            CASE WHEN o.account_type = 'INSTITUTION' THEN ' (institutional counterparty trade).' ELSE '.' END
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
        'stale', coalesce(o.reference_price, o.price) <> s.price, 'queued_at', o.created_at,
        'holding', av.holding, 'available_qty', av.available,
        'short_sell_risk', (jse_team_side(o.account_type, o.side) = 'SELL' AND o.quantity > av.available)) AS j
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
  -- the Pit Manager records trades for every team; administrators can open the all-teams desk with broker=ALL
  v_all boolean := a->>'role' = 'PIT_MANAGER' OR (a->>'role' IN ('ADMIN', 'VIEWER') AND upper(coalesce(p->>'broker', '')) = 'ALL');
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'PIT_MANAGER', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  IF a->>'role' = 'BROKER' THEN
    SELECT * INTO b FROM brokers WHERE id = nullif(a->>'broker_id', '')::integer;
  ELSE
    SELECT * INTO b FROM brokers WHERE code = CASE WHEN v_all THEN (SELECT min(code) FROM brokers) ELSE upper(trim(coalesce(nullif(p->>'broker', ''), (SELECT min(code) FROM brokers)))) END;
  END IF;
  IF NOT FOUND THEN PERFORM jse_fail('BROKER_NOT_FOUND', 'Broker not found.', 404); END IF;
  RETURN jsonb_build_object('success', true,
    'broker', CASE WHEN v_all THEN jsonb_build_object('code', 'ALL', 'name', 'All teams') ELSE jsonb_build_object('code', b.code, 'name', b.name, 'contact', b.contact, 'desk', b.desk) END, 'all_teams', v_all,
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
      FROM jse_team_metrics tm WHERE (v_all OR tm.broker_id = b.id) AND tm.active), '[]'::jsonb),
    'instructions', coalesce((SELECT jsonb_agg(jsonb_build_object('id', i.id, 'instruction_no', i.instruction_no, 'team', t.code, 'team_name', t.name,
        'symbol', s.symbol, 'security', s.name, 'side', i.side, 'quantity', i.quantity, 'note', i.note, 'price_seen', i.price_seen, 'market_price', s.price,
        'status', i.status, 'created_at', i.created_at, 'handled_at', i.handled_at, 'handled_by', i.handled_by_name, 'decline_reason', i.decline_reason,
        'order_no', o.order_no, 'order_status', o.status) ORDER BY (i.status = 'OPEN') DESC, i.id DESC)
      FROM (SELECT * FROM instructions WHERE broker_id = b.id AND (status = 'OPEN' OR created_at > now() - interval '12 hours') ORDER BY id DESC LIMIT 80) i
      JOIN teams t ON t.id = i.team_id JOIN securities s ON s.id = i.security_id LEFT JOIN orders o ON o.id = i.order_id), '[]'::jsonb),
    'orders', coalesce((SELECT jsonb_agg(jse_order_json(x.id) ORDER BY x.id DESC) FROM (
        SELECT o.id FROM orders o WHERE (v_all OR o.broker_id = b.id) ORDER BY o.id DESC LIMIT 60) x), '[]'::jsonb),
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
        'free_cash', jse_available_cash(o.team_id, o.id),
        'loan_room', jse_loan_room(o.team_id),
        'short_sell_risk', (jse_team_side(o.account_type, o.side) = 'SELL' AND o.quantity > av.available),
        'cash_risk', (jse_team_side(o.account_type, o.side) = 'BUY' AND o.settlement_amount > jse_available_cash(o.team_id, o.id) + jse_loan_room(o.team_id)),
        'loan_needed', (jse_team_side(o.account_type, o.side) = 'BUY' AND o.settlement_amount > jse_available_cash(o.team_id, o.id)),
        'queued_at', coalesce(o.executed_at, o.created_at)) AS j
      FROM orders o CROSS JOIN LATERAL jse_available_qty(o.team_id, o.security_id, o.id) av
      WHERE o.status = 'EXCHANGE_PENDING' ORDER BY o.id LIMIT 300) q), '[]'::jsonb),
    'recent', coalesce((SELECT jsonb_agg(jse_order_json(x.id) ORDER BY x.exchange_at DESC) FROM (
      SELECT id, exchange_at FROM orders WHERE exchange_at IS NOT NULL ORDER BY exchange_at DESC LIMIT 25) x), '[]'::jsonb),
    'counts', (SELECT jsonb_build_object('pending', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
       'awaiting_pit', count(*) FILTER (WHERE status = 'PIT_PENDING'),
       'approved', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING', 'BANK_SETTLED', 'BANK_REJECTED') AND exchange_at IS NOT NULL),
       'rejected', count(*) FILTER (WHERE status = 'EXCHANGE_REJECTED'),
       'short_selling', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING' AND short_sell_flag),
       'trade_orders', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING' AND account_type = 'TEAM'),
       'institutional_orders', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING' AND account_type = 'INSTITUTION')) FROM orders));
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
        'team_side', jse_team_side(o.account_type, o.side),
        'cash', t.cash, 'holding', coalesce(h.quantity, 0),
        'required', CASE WHEN jse_team_side(o.account_type, o.side) = 'BUY'
                         THEN o.trade_value + round(o.trade_value * coalesce(o.brokerage_rate, cfg.brokerage_rate), 2) END,
        'loan_room', CASE WHEN cfg.loans_enabled AND cfg.auto_loan_on_settlement THEN greatest(0, cfg.loan_max_principal - coalesce(l.original_principal, 0)) ELSE 0 END,
        'queued_at', coalesce(o.exchange_at, o.created_at)) AS j
      FROM orders o JOIN teams t ON t.id = o.team_id
      LEFT JOIN holdings h ON h.team_id = o.team_id AND h.security_id = o.security_id
      LEFT JOIN loans l ON l.team_id = o.team_id
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
       'interest_earned', (SELECT coalesce(sum(interest_charged), 0) FROM loans),
       'pending', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING')),
       'buy_requests', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING') AND jse_team_side(account_type, side) = 'BUY'),
       'sell_requests', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING') AND jse_team_side(account_type, side) = 'SELL'),
       'warnings', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING') AND (short_sell_flag OR cash_shortfall_flag))) FROM orders));
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
        'net_movement', coalesce(sum(credit), 0) - coalesce(sum(debit), 0),
        'current_cash', (SELECT coalesce(sum(cash), 0) FROM teams WHERE v_team IS NULL OR id = v_team),
        'teams', (SELECT count(*) FROM teams WHERE v_team IS NULL OR id = v_team),
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
CREATE OR REPLACE FUNCTION jse_audit_risk(p_action text, p_details jsonb) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  -- risk indicators: these are not ordinary successful trades and stay visibly distinguishable
  SELECT CASE
    WHEN p_action IN ('SHORT_SELLING_APPROVED', 'SHORT_SELLING_FORWARDED') THEN 'SHORT SELLING \u2014 EXCHANGE APPROVED'
    WHEN p_action = 'SHORT_SELLING_ATTEMPT' AND p_details->>'stage' = 'BANK' THEN 'SHORT SELLING \u2014 REJECTED AT BANK'
    WHEN p_action = 'SHORT_SELLING_ATTEMPT' THEN 'SHORT SELLING ATTEMPT'
    WHEN p_action = 'INSUFFICIENT_BALANCE_SETTLED' THEN 'INSUFFICIENT BALANCE \u2014 LOAN USED'
    WHEN p_action = 'INSUFFICIENT_BALANCE_REJECTED' THEN 'INSUFFICIENT BALANCE \u2014 REJECTED'
    WHEN p_action = 'CASH_SHORTFALL_ATTEMPT' THEN 'INSUFFICIENT BALANCE \u2014 ATTEMPT'
  END
$$;

CREATE OR REPLACE FUNCTION jse_audit_group(p_action text, p_entity text, p_role text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_action LIKE 'EXCHANGE%' OR p_action = 'SHORT_SELLING_APPROVED' OR p_role = 'EXCHANGE' THEN 'EXCHANGE'
    WHEN p_action LIKE 'EVENT%' OR p_action IN ('MARKET_NEWS_PRICE_MOVE', 'CONFIGURATION_UPDATED', 'UNDO', 'REDO', 'OPEN_ORDERS_REJECTED', 'IPO_LISTED')
         OR p_entity IN ('event', 'config', 'security', 'journal') THEN 'EVENT'
    WHEN p_entity = 'order' OR p_action LIKE 'ORDER%' OR p_action LIKE 'BANK%' OR p_action LIKE 'INSTITUTIONAL%' THEN 'ORDERS'
    ELSE 'OTHER' END
$$;

CREATE OR REPLACE FUNCTION jse_audit_log(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_action text := nullif(upper(trim(coalesce(p->>'action', ''))), '');
  v_risk boolean := coalesce((p->>'risk')::boolean, false);
  v_role text := nullif(upper(trim(coalesce(p->>'role', ''))), '');
  v_group text := nullif(upper(trim(coalesce(p->>'group', ''))), '');  -- Hatchable tabs: ORDERS \xB7 EXCHANGE \xB7 EVENT
  v_team integer; v_q text := nullif(trim(coalesce(p->>'q', '')), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(500, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 100)));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  IF coalesce(p->>'team', '') <> '' THEN SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team')); v_team := coalesce(v_team, -1); END IF;
  RETURN jsonb_build_object('success', true, 'page', v_page, 'page_size', v_size,
    'actions', coalesce((SELECT jsonb_agg(DISTINCT action) FROM audit_log), '[]'::jsonb),
    'risk_count', (SELECT count(*) FROM audit_log al WHERE jse_audit_risk(al.action, al.details) IS NOT NULL),
    'total', (SELECT count(*) FROM audit_log al WHERE (v_action IS NULL OR al.action = v_action) AND (v_team IS NULL OR al.team_id = v_team)
                AND (v_role IS NULL OR al.actor_role = v_role) AND (v_group IS NULL OR jse_audit_group(al.action, al.entity, al.actor_role) = v_group) AND (NOT v_risk OR jse_audit_risk(al.action, al.details) IS NOT NULL)
                AND (v_q IS NULL OR al.entity_id ILIKE '%' || v_q || '%' OR al.actor_username ILIKE '%' || v_q || '%' OR al.details::text ILIKE '%' || v_q || '%')),
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('id', al.id, 'created_at', al.created_at, 'actor', al.actor_username, 'email', al.actor_email,
        'role', al.actor_role, 'action', al.action, 'entity', al.entity, 'entity_id', al.entity_id, 'team', t.code, 'order_no', o.order_no,
        'security', coalesce(s.symbol, al.details->>'symbol', al.after_state->>'symbol'), 'security_name', s.name,
        'risk', jse_audit_risk(al.action, al.details),
        'before', al.before_state, 'after', al.after_state, 'details', al.details, 'ip', al.ip, 'session', al.session_id) ORDER BY al.id DESC)
      FROM (SELECT * FROM audit_log a0 WHERE (v_action IS NULL OR a0.action = v_action) AND (v_team IS NULL OR a0.team_id = v_team)
              AND (v_role IS NULL OR a0.actor_role = v_role) AND (v_group IS NULL OR jse_audit_group(a0.action, a0.entity, a0.actor_role) = v_group) AND (NOT v_risk OR jse_audit_risk(a0.action, a0.details) IS NOT NULL)
              AND (v_q IS NULL OR a0.entity_id ILIKE '%' || v_q || '%' OR a0.actor_username ILIKE '%' || v_q || '%' OR a0.details::text ILIKE '%' || v_q || '%')
            ORDER BY a0.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) al
      LEFT JOIN teams t ON t.id = al.team_id LEFT JOIN orders o ON o.id = al.order_id LEFT JOIN securities s ON s.id = o.security_id), '[]'::jsonb));
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
        'order_no', o.order_no, 'account_type', o.account_type, 'counterparty', CASE WHEN o.account_type = 'INSTITUTION' THEN 'Institutional investor' ELSE 'Market' END,
        'team', t.code, 'team_name', t.name, 'symbol', s.symbol, 'security', s.name, 'side', bc.side,
        'quantity', o.quantity, 'price', o.price, 'trade_value', bc.trade_value, 'rate', bc.rate, 'amount', bc.amount,
        'status', CASE WHEN bc.reversed_at IS NULL THEN 'SETTLED' ELSE 'REVERSED' END, 'reversed_at', bc.reversed_at) ORDER BY bc.id DESC)
      FROM (SELECT * FROM broker_commissions WHERE v_broker IS NULL OR broker_id = v_broker ORDER BY id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) bc
      JOIN brokers b ON b.id = bc.broker_id JOIN orders o ON o.id = bc.order_id JOIN teams t ON t.id = bc.team_id JOIN securities s ON s.id = o.security_id), '[]'::jsonb),
    'totals', (SELECT jsonb_build_object('orders', count(*), 'trade_value', coalesce(sum(trade_value), 0), 'brokerage', coalesce(sum(amount), 0))
               FROM broker_commissions WHERE reversed_at IS NULL AND (v_broker IS NULL OR broker_id = v_broker)),
    'reconciliation', (SELECT jsonb_build_object('commission_total', c.total, 'settled_brokerage_total', st.total, 'ok', c.total = st.total)
      FROM (SELECT coalesce(sum(amount), 0) AS total FROM broker_commissions WHERE reversed_at IS NULL AND (v_broker IS NULL OR broker_id = v_broker)) c,
           (SELECT coalesce(sum(st0.brokerage), 0) AS total FROM settlements st0 JOIN orders o0 ON o0.id = st0.order_id
            WHERE st0.reversed_at IS NULL AND o0.broker_id IS NOT NULL AND (v_broker IS NULL OR o0.broker_id = v_broker)) st),
    'institutional', (SELECT jsonb_build_object('orders', count(*), 'brokerage', coalesce(sum(bc.amount), 0)) FROM broker_commissions bc JOIN orders o ON o.id = bc.order_id
                      WHERE bc.reversed_at IS NULL AND o.account_type = 'INSTITUTION' AND (v_broker IS NULL OR bc.broker_id = v_broker)));
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
             THEN jsonb_build_object('level', 'bad', 'text', 'CMS 50 component mismatch: check the listed equities') END,
        CASE WHEN ev.status IN ('CLOSED', 'FINALIZED') AND (SELECT count(*) FROM tm WHERE NOT cash_rule_met) > 0
             THEN jsonb_build_object('level', 'info', 'text', (SELECT count(*) FROM tm WHERE NOT cash_rule_met) || ' team(s) do not meet the closing cash rule') END,
        CASE WHEN (SELECT count(*) FROM tm WHERE NOT loan_repaid) > 0 AND ev.status IN ('SETTLEMENT_ONLY', 'CLOSED')
             THEN jsonb_build_object('level', 'warn', 'text', (SELECT count(*) FROM tm WHERE NOT loan_repaid) || ' team(s) still have loans outstanding (not eligible until repaid)') END
      ]) AS al) z),
    'latest_news', (SELECT jse_news_list('{"limit":8}'::jsonb)->'news'),
    'institutional', (SELECT jsonb_build_object(
        'accounts', coalesce((SELECT jsonb_agg(jsonb_build_object('code', i.code, 'name', i.name,
            'transactions', (SELECT count(*) FROM orders o2 WHERE o2.institution_id = i.id),
            'settled_value', (SELECT coalesce(sum(o2.trade_value), 0) FROM orders o2 WHERE o2.institution_id = i.id AND o2.status = 'BANK_SETTLED')))
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
DECLARE i institutions%ROWTYPE; cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO i FROM institutions WHERE id = coalesce(CASE WHEN a->>'role' <> 'INSTITUTIONAL' THEN nullif(p->>'institution_id', '')::integer END,
                                                        nullif(a->>'institution_id', '')::integer, (SELECT min(id) FROM institutions));
  IF NOT FOUND THEN PERFORM jse_fail('INSTITUTION_NOT_FOUND', 'Institutional account not found.', 404); END IF;
  -- a transaction desk: ticket inputs, the current market with institutional prices, and the transaction history.
  -- Institutions are counterparties only \u2014 no cash or holdings restriction and no participant-style portfolio.
  RETURN jsonb_build_object('success', true,
    'rules', jsonb_build_object('spread_pct', jse_inst_spread_pct(), 'brokerage_rate', cfg.brokerage_rate, 'stock_lot_size', cfg.stock_lot_size,
       'min_order_value', cfg.min_order_value, 'max_order_value', cfg.max_order_value,
       'text', 'When a participant cannot find a counterparty, the institution trades with it: the participant BUYS from the institution at ' ||
               to_char(jse_inst_spread_pct(), 'FM990.##') || '% ABOVE the prevailing market price and SELLS to it at ' || to_char(jse_inst_spread_pct(), 'FM990.##') ||
               '% BELOW. The participant pays the normal brokerage (' || jse_rate_text(cfg.brokerage_rate) || '), earned by its broker. The trade goes through the Pit Manager, Exchange and Bank like any order.'),
    'institutions', (SELECT jsonb_agg(jsonb_build_object('id', x.id, 'code', x.code, 'name', x.name) ORDER BY x.id) FROM institutions x),
    'institution', jsonb_build_object('id', i.id, 'code', i.code, 'name', i.name),
    -- counterparty choices: participant team code, name and broker only (no team cash or holdings)
    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('code', t.code, 'name', t.name, 'broker', b.code) ORDER BY t.seq)
                       FROM teams t LEFT JOIN brokers b ON b.id = t.broker_id WHERE t.active), '[]'::jsonb),
    'market', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'name', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'price', s.price, 'change_pct', round(jse_pct(s.price, s.previous_price), 2), 'lot_size', s.lot_size,
        'participant_buy_price', jse_inst_price(s.price, 'SELL'), 'participant_sell_price', jse_inst_price(s.price, 'BUY'),
        'last_price_change_at', s.last_price_change_at) ORDER BY s.last_price_change_at DESC NULLS LAST, s.display_order, s.id)
      FROM securities s WHERE s.active AND (s.kind = 'EQUITY' OR s.listed_at IS NOT NULL)), '[]'::jsonb),
    'orders', coalesce((SELECT jsonb_agg(jse_order_json(o.id) ORDER BY o.id DESC) FROM (SELECT id FROM orders WHERE institution_id = i.id ORDER BY id DESC LIMIT 80) o), '[]'::jsonb),
    'stats', (SELECT jsonb_build_object('transactions', count(*), 'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
       'pending', count(*) FILTER (WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
       'rejected', count(*) FILTER (WHERE status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED')),
       'participants_bought_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'SELL'), 0),
       'participants_sold_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'BUY'), 0),
       'brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0)) FROM orders WHERE institution_id = i.id));
END $$;

-- ---------------------------------------------------------------------------
-- Event admin dashboard state
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_admin_state(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_idx jsonb := jse_cms_index();
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jse_event_status() || jsonb_build_object(
    'config_full', (SELECT to_jsonb(c) - 'min_cash_buffer' - 'participant_order_entry' - 'institutional_cash' - 'institution_overdraft' - 'institution_brokerage'
                    FROM event_config c WHERE id = 1),
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
                  JOIN securities s ON s.id = z.security_id), '[]'::jsonb),
        'list', coalesce((SELECT jsonb_agg(jsonb_build_object('team', t.code, 'team_name', t.name, 'ipo', s.symbol, 'ipo_code', s.ipo_code, 'lots', x.lots, 'shares', x.quantity, 'amount', x.amount) ORDER BY t.seq, s.display_order)
                  FROM (SELECT * FROM ipo_allotments WHERE reversed_at IS NULL ORDER BY id LIMIT 1000) x JOIN teams t ON t.id = x.team_id JOIN securities s ON s.id = x.security_id), '[]'::jsonb))
      FROM ipo_allotments WHERE reversed_at IS NULL),
    'ipo_listing', jse_listing_state(a),
    'ipo_admin', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'ipo_code', s.ipo_code, 'name', s.name, 'stage', jse_ipo_stage(s.id),
        'price', s.base_price, 'listed', s.listed_at IS NOT NULL, 'offered', s.ipo_shares_offered,
        'remaining', CASE WHEN s.ipo_shares_offered IS NULL THEN NULL ELSE s.ipo_shares_offered - coalesce((SELECT sum(quantity) FROM ipo_allotments al WHERE al.security_id = s.id AND al.reversed_at IS NULL), 0) END,
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
`;var zr=`-- JAIN STOCK EXCHANGE (JSE) v311
-- 005_exports.sql: one function per export sheet; rows are returned as arrays for compact transfer.
-- Every sheet reads the same canonical tables / views as the live dashboards.

CREATE OR REPLACE FUNCTION jse_export_sheets() RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT '[
    ["winner","Winner & Runner-Up"],["assessment","Assessment & Eligibility"],["teams","Team Details"],["participants","Participant Details"],
    ["broker_roster","Broker Roster"],["brokers","Broker Performance"],
    ["cash","Cash"],["holdings","Holdings"],["sold_stocks","Sold Stocks"],["sold_ipos","Sold IPOs"],
    ["networth","Net Worth & PL"],["loans","Loans & Interest"],["cash_rule","Cash Rule"],
    ["short_sell","Short Selling Attempts"],["cash_shortfall","Cash Shortfall Attempts"],["insufficient_balance","Insufficient Balance Rejections"],
    ["orders","Order Tracking"],["rejected","Rejected Orders"],
    ["trades","Trade History"],["ledger","Cash Ledger"],["commission","Broker Commission"],["institutional","Institutional Investors"],
    ["ipo_allotments","IPO Allotments"],
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
    v_cols := '["Order ID","Account","Team","Team name","Broker","Institution","Instruction","Security","Type","Side","Quantity","Price","Trade Value","Brokerage Rate","Brokerage","Settlement Amount","Status","Stage","Reject Code","Reject Reason","Short Sell Flag","Cash Shortfall Flag","Submitted By","Submitted At","Executed By","Executed At","Slip No","Exchange By","Exchange At","Bank By","Bank At"]';
    SELECT jsonb_agg(jsonb_build_array(o.order_no, o.account_type, t.code, t.name, b.code, i.code, ins.instruction_no, s.symbol, CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, o.side,
             o.quantity, o.price, o.trade_value, jse_rate_text(o.brokerage_rate), o.brokerage, o.settlement_amount, o.status, jse_stage_label(o.status, o.reject_code),
             o.reject_code, o.reject_reason, o.short_sell_flag, o.cash_shortfall_flag, o.created_by_name, o.created_at, o.executed_by_name, o.executed_at, sl.slip_no,
             o.exchange_by_name, o.exchange_at, o.bank_by_name, o.bank_at) ORDER BY o.id) INTO v_rows
    FROM orders o JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id LEFT JOIN brokers b ON b.id = o.broker_id
    LEFT JOIN institutions i ON i.id = o.institution_id LEFT JOIN instructions ins ON ins.id = o.instruction_id LEFT JOIN trading_slips sl ON sl.order_id = o.id
    WHERE v_sheet = 'orders' OR o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED');
  ELSIF v_sheet = 'slips' THEN
    v_cols := '["Slip No","Order ID","Executed At","Team","Team name","Broker","Broker name","Institution","Security","Name","Asset type","Side","Quantity","Execution Price","Trade Value","Brokerage Rate","Brokerage","Settlement Value","Pit Manager","Exchange","Bank","Status"]';
    SELECT jsonb_agg(jsonb_build_array(x->>'slip_no', x->>'order_no', x->>'executed_at', x->>'team', x->>'team_name', x->>'broker', x->>'broker_name', x->>'institution',
             x->>'symbol', x->>'security', x->>'asset_type', x->>'side', (x->>'quantity')::integer, (x->>'price')::numeric, (x->>'trade_value')::numeric,
             jse_rate_text((x->>'brokerage_rate')::numeric), (x->>'brokerage')::numeric, (x->>'settlement_value')::numeric, x->>'executed_by',
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
    v_cols := '["Date/time","Broker","Broker name","Order","Counterparty","Team","Team name","Security","Side","Quantity","Price","Trade value","Brokerage rate","Commission","Status"]';
    SELECT jsonb_agg(jsonb_build_array(bc.created_at, b.code, b.name, o.order_no, CASE WHEN o.account_type = 'INSTITUTION' THEN 'Institutional investor' ELSE 'Market' END,
             t.code, t.name, s.symbol, bc.side, o.quantity, o.price, bc.trade_value,
             jse_rate_text(bc.rate), bc.amount, CASE WHEN bc.reversed_at IS NULL THEN 'SETTLED' ELSE 'REVERSED' END) ORDER BY bc.id) INTO v_rows
    FROM broker_commissions bc JOIN brokers b ON b.id = bc.broker_id JOIN teams t ON t.id = bc.team_id JOIN orders o ON o.id = bc.order_id
    JOIN securities s ON s.id = o.security_id;
  ELSIF v_sheet = 'institutional' THEN
    v_cols := '["Order ID","Institution","Institution Side","Counterparty Team","Team Side","Broker","Security","Quantity","Market Price","Institutional Price","Trade Value","Brokerage","Settlement Amount","Status","Reject Reason","Submitted At","Executed At","Slip No","Bank At"]';
    SELECT jsonb_agg(jsonb_build_array(o.order_no, i.code, o.side, t.code, jse_team_side(o.account_type, o.side), b.code, s.symbol, o.quantity, o.reference_price, o.price,
             o.trade_value, o.brokerage, o.settlement_amount, o.status, o.reject_reason, o.created_at, o.executed_at, sl.slip_no, o.bank_at) ORDER BY o.id) INTO v_rows
    FROM orders o JOIN institutions i ON i.id = o.institution_id JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
    LEFT JOIN brokers b ON b.id = o.broker_id LEFT JOIN trading_slips sl ON sl.order_id = o.id;
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
`;var Qr=`-- JAIN STOCK EXCHANGE (JSE) v311
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
`;var Zr=`-- JAIN STOCK EXCHANGE (JSE) v311
-- 007_tuning.sql: safety timeouts for this database (re-applicable).
DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I SET statement_timeout = %L', current_database(), '20s');
  EXECUTE format('ALTER DATABASE %I SET idle_in_transaction_session_timeout = %L', current_database(), '60s');
  EXECUTE format('ALTER DATABASE %I SET lock_timeout = %L', current_database(), '10s');
END $$;
ANALYZE;
`;var ei=`-- JAIN STOCK EXCHANGE (JSE) v311
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

-- Current IPO names as the live system shows them (IPO-01 VOLTRA MOTORS LTD \u2026); a later admin rename is kept
UPDATE securities SET name = upper(name), updated_at = now()
WHERE kind = 'IPO' AND symbol IN ('VOLTRA', 'BLUEAI', 'SHREEB', 'AAROGYA')
  AND name IN ('Voltra Motors Ltd', 'Blue Orbit AI Ltd', 'Shreebuild Industries Ltd', 'Aarogya Lifesciences Ltd');

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
`;var ti=`-- JAIN STOCK EXCHANGE (JSE) v3.13
-- 009_hatchable.sql: one-time data changes to match the live Hatchable application (applied once).
--   * Market News moves are priced to the paisa, as on Hatchable (e.g. \u20B91,714.55); base prices stay whole rupees.
UPDATE event_config SET price_tick = 0.01 WHERE id = 1 AND price_tick = 1;

--   * IPO shares on offer, as the live IPO master shows them (remaining = offered \u2212 allotted)
UPDATE securities SET ipo_shares_offered = v.q
FROM (VALUES ('VOLTRA', 100000), ('BLUEAI', 80000), ('SHREEB', 120000), ('AAROGYA', 60000)) AS v(sym, q)
WHERE securities.symbol = v.sym AND securities.kind = 'IPO' AND securities.ipo_shares_offered IS NULL;

INSERT INTO schema_migrations(version) VALUES ('009_hatchable');
`;var si=`-- JAIN STOCK EXCHANGE (JSE) v3.14
-- 010_safety.sql: one-time rule changes from the v3.14 master brief (applied once).
--   * Share prices are whole rupees again (no decimals). Any price with paise is rounded once, recorded as an ADMIN price change.
UPDATE event_config SET price_tick = 1 WHERE id = 1;
INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source)
SELECT id, price, round(price), CASE WHEN price > 0 THEN round((round(price) - price) * 100 / price, 4) ELSE 0 END, 'ADMIN'
FROM securities WHERE price <> round(price);
UPDATE securities SET price = round(price) WHERE price <> round(price);
UPDATE securities SET previous_price = round(previous_price) WHERE previous_price <> round(previous_price);
--   * Loans are no longer drawn automatically at settlement: a team requests a loan, the Bank Desk approves it and the cash is released.
UPDATE event_config SET auto_loan_on_settlement = false WHERE id = 1;
INSERT INTO schema_migrations(version) VALUES ('010_safety');
`;var m11sql="-- v272 targeted roster and IPO administration additions.\n-- Additive only: preserve existing tables, data, routes and financial history.\n\nALTER TABLE securities ADD COLUMN IF NOT EXISTS ipo_lot_size integer NOT NULL DEFAULT 50 CHECK (ipo_lot_size > 0);\n\nCREATE TABLE IF NOT EXISTS ipo_allotment_draws (\n  id                 bigserial PRIMARY KEY,\n  security_id        integer NOT NULL REFERENCES securities(id),\n  status             text NOT NULL DEFAULT 'GENERATED'\n                     CHECK (status IN ('GENERATED','VERIFIED','APPROVED','FINALIZED','CANCELLED')),\n  available_shares   integer NOT NULL CHECK (available_shares >= 0),\n  available_lots     integer NOT NULL CHECK (available_lots >= 0),\n  requested_lots     integer NOT NULL DEFAULT 0 CHECK (requested_lots >= 0),\n  subscription_ratio numeric(14,4),\n  algorithm_version  text NOT NULL DEFAULT 'RANDOM_ROUND_ROBIN_V1',\n  inventory_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,\n  generated_by       text,\n  generated_at       timestamptz NOT NULL DEFAULT now(),\n  verified_by        text,\n  verified_at        timestamptz,\n  approved_by        text,\n  approved_at        timestamptz,\n  finalized_by       text,\n  finalized_at       timestamptz,\n  created_at         timestamptz NOT NULL DEFAULT now()\n);\nCREATE INDEX IF NOT EXISTS ipo_allotment_draws_security_idx ON ipo_allotment_draws(security_id, id DESC);\n\nCREATE TABLE IF NOT EXISTS ipo_allotment_draw_items (\n  id                 bigserial PRIMARY KEY,\n  draw_id            bigint NOT NULL REFERENCES ipo_allotment_draws(id),\n  application_id     bigint NOT NULL,\n  team_id            integer NOT NULL REFERENCES teams(id),\n  team_code          text NOT NULL,\n  team_name          text NOT NULL,\n  draw_position      integer NOT NULL CHECK (draw_position > 0),\n  requested_lots     integer NOT NULL CHECK (requested_lots > 0),\n  allotted_lots      integer NOT NULL DEFAULT 0 CHECK (allotted_lots >= 0 AND allotted_lots <= requested_lots),\n  lot_size           integer NOT NULL CHECK (lot_size > 0),\n  application_price  numeric(12,2) NOT NULL CHECK (application_price > 0),\n  rounds             integer[] NOT NULL DEFAULT '{}',\n  UNIQUE (draw_id, application_id),\n  UNIQUE (draw_id, draw_position)\n);\nCREATE INDEX IF NOT EXISTS ipo_allotment_draw_items_order_idx ON ipo_allotment_draw_items(draw_id, draw_position);\n\n-- Official Dalal Street broker aliases map the uploaded Broker Number/Code/Name to existing internal desks.\n-- Internal BROKER-XX identifiers remain untouched, so logins and historical records are preserved.\nCREATE TABLE IF NOT EXISTS broker_roster_aliases (\n  broker_number       integer PRIMARY KEY CHECK (broker_number > 0),\n  broker_code         text NOT NULL UNIQUE,\n  broker_name         text NOT NULL,\n  internal_broker_id  integer REFERENCES brokers(id)\n);\nINSERT INTO broker_roster_aliases(broker_number,broker_code,broker_name,internal_broker_id) VALUES\n  (1,'Prajna','M Manoj',(SELECT id FROM brokers WHERE code='BROKER-09')),\n  (2,'Ganita','Harsha G',(SELECT id FROM brokers WHERE code='BROKER-05')),\n  (3,'Amrit','Nehaa',(SELECT id FROM brokers WHERE code='BROKER-04')),\n  (4,'Vikas','Vikash',(SELECT id FROM brokers WHERE code='BROKER-01')),\n  (5,'Yash','Gokul Krishna',(SELECT id FROM brokers WHERE code='BROKER-02')),\n  (6,'Arohan','Aman',(SELECT id FROM brokers WHERE code='BROKER-06')),\n  (7,'Madhava','Mayur G',(SELECT id FROM brokers WHERE code='BROKER-03')),\n  (8,'Vidura','Bhavani Reddy',(SELECT id FROM brokers WHERE code='BROKER-07')),\n  (9,'Kalidasa','Varun SB',(SELECT id FROM brokers WHERE code='BROKER-08')),\n  (10,'Suvarna','Sujatha',(SELECT id FROM brokers WHERE code='BROKER-10'))\nON CONFLICT (broker_number) DO UPDATE SET\n  broker_code=EXCLUDED.broker_code,\n  broker_name=EXCLUDED.broker_name,\n  internal_broker_id=coalesce(broker_roster_aliases.internal_broker_id,EXCLUDED.internal_broker_id);\n\n-- Five-column roster importer. This only updates the canonical broker assignment on existing teams.\nCREATE OR REPLACE FUNCTION jse_import_roster_assignments(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$\nDECLARE\n  r jsonb;\n  x jsonb;\n  v_i integer := 0;\n  v_team_no integer;\n  v_broker_no integer;\n  v_team_code text;\n  v_broker_code text;\n  v_broker_name text;\n  t teams%ROWTYPE;\n  b brokers%ROWTYPE;\n  v_alias broker_roster_aliases%ROWTYPE;\n  v_plan jsonb := '[]'::jsonb;\n  v_errors jsonb := '[]'::jsonb;\n  v_changed integer := 0;\nBEGIN\n  PERFORM jse_require_role(a, 'ADMIN');\n  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;\n  -- Follow the existing team editor's policy: broker assignments can be changed without resetting team IDs or names.\n  -- The import changes only teams.broker_id and never touches historical orders or financial records.\n  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN\n    PERFORM jse_fail('NO_ROWS', 'No roster rows were supplied.', 400);\n  END IF;\n  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP\n    v_i := v_i + 1;\n    BEGIN v_team_no := nullif(trim(r->>'team_number'), '')::integer; EXCEPTION WHEN others THEN v_team_no := NULL; END;\n    BEGIN v_broker_no := nullif(trim(r->>'broker_number'), '')::integer; EXCEPTION WHEN others THEN v_broker_no := NULL; END;\n    v_team_code := upper(trim(coalesce(r->>'team_code', '')));\n    v_broker_code := upper(trim(coalesce(r->>'broker_code', '')));\n    v_broker_name := trim(coalesce(r->>'broker_name', ''));\n    IF v_team_no IS NULL OR v_team_no <= 0 THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Team Number must be a positive whole number'); CONTINUE;\n    END IF;\n    IF v_broker_no IS NULL OR v_broker_no <= 0 THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Broker Number must be a positive whole number'); CONTINUE;\n    END IF;\n    IF v_team_code = '' OR v_broker_code = '' OR v_broker_name = '' THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Team Code, Broker Code and Broker Name are required'); CONTINUE;\n    END IF;\n    SELECT * INTO t FROM teams WHERE code = v_team_code;\n    IF NOT FOUND THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown Team Code ' || v_team_code); CONTINUE;\n    END IF;\n    IF t.seq <> v_team_no THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Team Number ' || v_team_no || ' does not match ' || v_team_code || ' (registered number ' || t.seq || ')'); CONTINUE;\n    END IF;\n    SELECT * INTO v_alias FROM broker_roster_aliases\n    WHERE broker_number=v_broker_no AND upper(broker_code)=v_broker_code AND lower(btrim(broker_name))=lower(btrim(v_broker_name));\n    IF NOT FOUND THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Broker Number, Broker Code and Broker Name do not match the official broker roster'); CONTINUE;\n    END IF;\n    SELECT * INTO b FROM brokers WHERE id=v_alias.internal_broker_id AND active;\n    IF NOT FOUND THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'The official broker ' || v_alias.broker_code || ' has no active internal broker desk mapping'); CONTINUE;\n    END IF;\n    v_plan := v_plan || jsonb_build_object('team_id', t.id, 'team_number', t.seq, 'team_code', t.code,\n      'broker_id', b.id, 'broker_number', v_broker_no, 'broker_code', v_alias.broker_code, 'broker_name', v_alias.broker_name,\n      'before_broker_id', t.broker_id,\n      'before_broker_code', (SELECT broker_code FROM broker_roster_aliases WHERE internal_broker_id=t.broker_id LIMIT 1));\n  END LOOP;\n\n  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP\n    IF (SELECT count(*) FROM jsonb_array_elements(v_plan) e WHERE e->>'team_code' = x->>'team_code') > 1 THEN\n      v_errors := v_errors || jsonb_build_object('row', NULL, 'error', (x->>'team_code') || ' appears more than once in the file');\n      EXIT;\n    END IF;\n  END LOOP;\n  IF jsonb_array_length(v_errors) > 0 THEN\n    RETURN jsonb_build_object('success', false, 'code', 'ROSTER_ERRORS',\n      'error', 'Nothing was saved. Fix the rows listed and import again.', 'errors', v_errors, 'http', 400);\n  END IF;\n  IF coalesce((p->>'dry_run')::boolean, false) THEN\n    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_plan), 'preview', v_plan);\n  END IF;\n\n  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP\n    UPDATE teams SET broker_id = (x->>'broker_id')::integer, updated_at = now()\n    WHERE id = (x->>'team_id')::integer AND broker_id IS DISTINCT FROM (x->>'broker_id')::integer;\n    IF FOUND THEN\n      v_changed := v_changed + 1;\n      PERFORM jse_audit(a, 'TEAM_BROKER_ASSIGNMENT_IMPORTED', 'team', x->>'team_code',\n        (x->>'team_id')::integer, NULL,\n        jsonb_build_object('broker_code', x->>'before_broker_code'),\n        jsonb_build_object('broker_code', x->>'broker_code', 'broker_number', x->>'broker_number'),\n        jsonb_build_object('import', true, 'team_number', x->>'team_number'));\n    END IF;\n  END LOOP;\n  PERFORM jse_audit(a, 'ROSTER_ASSIGNMENTS_IMPORTED', 'team', NULL, NULL, NULL, NULL, NULL,\n    jsonb_build_object('rows', jsonb_array_length(v_plan), 'changed', v_changed));\n  RETURN jsonb_build_object('success', true, 'rows', jsonb_array_length(v_plan), 'updated', jsonb_array_length(v_plan), 'changed', v_changed);\nEND $$;\n\n-- Company/base-price import. Ticker is the stable key; this deliberately does not change live prices.\nCREATE OR REPLACE FUNCTION jse_import_companies(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$\nDECLARE\n  r jsonb;\n  x jsonb;\n  v_i integer := 0;\n  v_status text;\n  v_ticker text;\n  v_name text;\n  v_price numeric;\n  s securities%ROWTYPE;\n  v_plan jsonb := '[]'::jsonb;\n  v_errors jsonb := '[]'::jsonb;\n  v_changed integer := 0;\nBEGIN\n  PERFORM jse_require_role(a, 'ADMIN');\n  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;\n  SELECT status INTO v_status FROM event_control WHERE id=1;\n  IF v_status <> 'NOT_STARTED' AND NOT coalesce((p->>'dry_run')::boolean, false) THEN\n    PERFORM jse_fail('EVENT_STARTED', 'Company/base-price imports can be saved only before the event starts.', 409);\n  END IF;\n  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM 1 FROM event_control WHERE id=1 FOR UPDATE; END IF;\n  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN\n    PERFORM jse_fail('NO_ROWS', 'No company rows were supplied.', 400);\n  END IF;\n  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP\n    v_i := v_i + 1;\n    v_ticker := upper(trim(coalesce(r->>'ticker', '')));\n    v_name := trim(coalesce(r->>'name', ''));\n    BEGIN v_price := (r->>'base_price')::numeric; EXCEPTION WHEN others THEN v_price := NULL; END;\n    IF v_ticker = '' OR v_name = '' THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Company Name and Ticker are required'); CONTINUE;\n    END IF;\n    IF v_ticker !~ '^[A-Z0-9][A-Z0-9._-]{0,19}$' THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Ticker must use 1–20 letters, numbers, dots, underscores or hyphens'); CONTINUE;\n    END IF;\n    IF v_price IS NULL OR v_price <= 0 OR v_price <> trunc(v_price) THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Base Price must be a positive whole number'); CONTINUE;\n    END IF;\n    IF length(v_name) > 160 THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Company Name must be 160 characters or fewer'); CONTINUE;\n    END IF;\n    SELECT * INTO s FROM securities WHERE symbol = v_ticker;\n    IF NOT FOUND THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Ticker ' || v_ticker || ' does not exist in the current securities list. Add it through the existing company/IPO setup first.'); CONTINUE;\n    END IF;\n    v_plan := v_plan || jsonb_build_object('id', s.id, 'ticker', s.symbol, 'name', v_name, 'base_price', v_price,\n      'before_name', s.name, 'before_base_price', s.base_price, 'kind', s.kind);\n  END LOOP;\n  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP\n    IF (SELECT count(*) FROM jsonb_array_elements(v_plan) e WHERE e->>'ticker' = x->>'ticker') > 1 THEN\n      v_errors := v_errors || jsonb_build_object('row', NULL, 'error', (x->>'ticker') || ' appears more than once in the file');\n      EXIT;\n    END IF;\n  END LOOP;\n  IF jsonb_array_length(v_errors) > 0 THEN\n    RETURN jsonb_build_object('success', false, 'code', 'COMPANY_IMPORT_ERRORS',\n      'error', 'Nothing was saved. Fix the rows listed and import again.', 'errors', v_errors, 'http', 400);\n  END IF;\n  IF coalesce((p->>'dry_run')::boolean, false) THEN\n    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_plan), 'preview', v_plan);\n  END IF;\n  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP\n    UPDATE securities SET name = x->>'name', base_price = (x->>'base_price')::numeric, updated_at = now()\n    WHERE id = (x->>'id')::integer\n      AND (name IS DISTINCT FROM x->>'name' OR base_price IS DISTINCT FROM (x->>'base_price')::numeric);\n    IF FOUND THEN\n      v_changed := v_changed + 1;\n      PERFORM jse_audit(a, 'COMPANY_BASE_PRICE_IMPORTED', 'security', x->>'ticker', NULL, NULL,\n        jsonb_build_object('name', x->>'before_name', 'base_price', x->>'before_base_price'),\n        jsonb_build_object('name', x->>'name', 'base_price', x->>'base_price'),\n        jsonb_build_object('kind', x->>'kind', 'live_price_unchanged', true));\n    END IF;\n  END LOOP;\n  PERFORM jse_audit(a, 'COMPANY_BASE_PRICES_IMPORTED', 'security', NULL, NULL, NULL, NULL, NULL,\n    jsonb_build_object('rows', jsonb_array_length(v_plan), 'changed', v_changed, 'live_prices_changed', false));\n  RETURN jsonb_build_object('success', true, 'rows', jsonb_array_length(v_plan), 'updated', jsonb_array_length(v_plan), 'changed', v_changed);\nEND $$;\n\n-- Admin-only IPO tool: persistent random draw, verification, approval, idempotent issuance, and issue-size editing.\nCREATE OR REPLACE FUNCTION jse_ipo_admin_tool(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$\nDECLARE\n  v_action text := upper(coalesce(nullif(p->>'action',''), 'STATE'));\n  v_ipo text := upper(trim(coalesce(p->>'ipo','')));\n  v_status text;\n  v_event_status text;\n  s securities%ROWTYPE;\n  d ipo_allotment_draws%ROWTYPE;\n  ap ipo_applications%ROWTYPE;\n  al ipo_allotments%ROWTYPE;\n  x record;\n  v_issued integer;\n  v_remaining integer;\n  v_available_lots integer;\n  v_requested integer := 0;\n  v_position integer := 0;\n  v_round integer := 1;\n  v_left integer := 0;\n  v_progress boolean;\n  v_count integer := 0;\n  v_total_shares integer := 0;\n  v_total_amount numeric := 0;\n  v_new_size numeric;\n  v_new_shares integer;\n  v_unit text;\n  v_reason text;\n  v_draw_id bigint;\nBEGIN\n  PERFORM jse_require_role(a, 'ADMIN');\n  IF v_action <> 'STATE' THEN PERFORM jse_require_admin_password(a, p); END IF;\n\n  IF v_action = 'STATE' THEN\n    IF v_ipo <> '' THEN\n      SELECT * INTO s FROM securities WHERE kind = 'IPO' AND active AND (symbol = v_ipo OR ipo_code = v_ipo);\n      IF NOT FOUND THEN PERFORM jse_fail('IPO_NOT_FOUND', 'Choose an existing IPO.', 404); END IF;\n      SELECT * INTO d FROM ipo_allotment_draws WHERE security_id = s.id ORDER BY id DESC LIMIT 1;\n    END IF;\n    RETURN jsonb_build_object(\n      'success', true,\n      'ipos', coalesce((SELECT jsonb_agg(jsonb_build_object(\n        'symbol', sec.symbol, 'ipo_code', sec.ipo_code, 'name', sec.name, 'price', sec.base_price, 'live_price', sec.price,\n        'lot_size', sec.ipo_lot_size, 'offered', sec.ipo_shares_offered,\n        'issued', (SELECT coalesce(sum(ia.quantity),0) FROM ipo_allotments ia WHERE ia.security_id=sec.id AND ia.reversed_at IS NULL),\n        'remaining', CASE WHEN sec.ipo_shares_offered IS NULL THEN NULL ELSE sec.ipo_shares_offered -\n          (SELECT coalesce(sum(ia.quantity),0) FROM ipo_allotments ia WHERE ia.security_id=sec.id AND ia.reversed_at IS NULL) END,\n        'applications', (SELECT count(*) FROM ipo_applications ia WHERE ia.security_id=sec.id AND ia.status='APPLIED'),\n        'applied_lots', (SELECT coalesce(sum(ia.lots),0) FROM ipo_applications ia WHERE ia.security_id=sec.id AND ia.status='APPLIED'),\n        'stage', jse_ipo_stage(sec.id),\n        'latest_draw_status', (SELECT dd.status FROM ipo_allotment_draws dd WHERE dd.security_id=sec.id ORDER BY dd.id DESC LIMIT 1)\n      ) ORDER BY sec.display_order, sec.id) FROM securities sec WHERE sec.kind='IPO' AND sec.active), '[]'::jsonb),\n      'event_status', (SELECT status FROM event_control WHERE id=1),\n      'ipo', CASE WHEN s.id IS NULL THEN NULL ELSE jsonb_build_object('symbol',s.symbol,'name',s.name,'lot_size',s.ipo_lot_size,\n        'offered',s.ipo_shares_offered,'issued',(SELECT coalesce(sum(ia.quantity),0) FROM ipo_allotments ia WHERE ia.security_id=s.id AND ia.reversed_at IS NULL),\n        'remaining',CASE WHEN s.ipo_shares_offered IS NULL THEN NULL ELSE s.ipo_shares_offered-(SELECT coalesce(sum(ia.quantity),0) FROM ipo_allotments ia WHERE ia.security_id=s.id AND ia.reversed_at IS NULL) END) END,\n      'draw', CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d) END,\n      'eligible_count', CASE WHEN s.id IS NULL THEN 0 ELSE (SELECT count(*) FROM ipo_applications ia\n        WHERE ia.security_id=s.id AND ia.status='APPLIED' AND ia.lots BETWEEN 1 AND 10 AND ia.amount<=150000\n          AND (SELECT coalesce(sum(ax.amount),0) FROM ipo_applications ax WHERE ax.team_id=ia.team_id AND ax.status='APPLIED')<=600000\n          AND NOT EXISTS (SELECT 1 FROM ipo_allotments aa WHERE aa.team_id=ia.team_id AND aa.security_id=s.id AND aa.reversed_at IS NULL)) END,\n      'rejected_count', CASE WHEN s.id IS NULL THEN 0 ELSE greatest(0,\n        (SELECT count(*) FROM ipo_applications ia WHERE ia.security_id=s.id AND ia.status='APPLIED') -\n        (SELECT count(*) FROM ipo_applications ia WHERE ia.security_id=s.id AND ia.status='APPLIED' AND ia.lots BETWEEN 1 AND 10 AND ia.amount<=150000\n          AND (SELECT coalesce(sum(ax.amount),0) FROM ipo_applications ax WHERE ax.team_id=ia.team_id AND ax.status='APPLIED')<=600000\n          AND NOT EXISTS (SELECT 1 FROM ipo_allotments aa WHERE aa.team_id=ia.team_id AND aa.security_id=s.id AND aa.reversed_at IS NULL))) END,\n      'items', CASE WHEN d.id IS NULL THEN '[]'::jsonb ELSE coalesce((SELECT jsonb_agg(jsonb_build_object(\n        'team',di.team_code,'team_name',di.team_name,'position',di.draw_position,'requested_lots',di.requested_lots,\n        'allotted_lots',di.allotted_lots,'shares',di.allotted_lots*di.lot_size,'rounds',to_jsonb(di.rounds),\n        'price',di.application_price,'amount',di.allotted_lots*di.lot_size*di.application_price)\n        ORDER BY di.draw_position) FROM ipo_allotment_draw_items di WHERE di.draw_id=d.id), '[]'::jsonb) END\n    );\n  END IF;\n\n  SELECT status INTO v_event_status FROM event_control WHERE id=1 FOR UPDATE;\n  IF v_event_status <> 'NOT_STARTED' AND v_action <> 'LOT_SIZE' THEN\n    PERFORM jse_fail('EVENT_STARTED', 'IPO allotment and issue-size changes are allowed only before the event starts.', 409);\n  END IF;\n  SELECT * INTO s FROM securities WHERE kind='IPO' AND active AND (symbol=v_ipo OR ipo_code=v_ipo) FOR UPDATE;\n  IF NOT FOUND THEN PERFORM jse_fail('IPO_NOT_FOUND', 'Choose an existing IPO.', 404); END IF;\n\n  IF v_action = 'LOT_SIZE' THEN\n    IF v_event_status NOT IN ('NOT_STARTED','LIVE') THEN\n      PERFORM jse_fail('EVENT_NOT_CONFIGURABLE', 'IPO allotment lot size can only be changed before the event or during LIVE status, before IPO applications/allotments exist.', 409);\n    END IF;\n    IF jse_ipo_stage(s.id) = 'APPLICATION_OPEN' THEN\n      PERFORM jse_fail('IPO_APPLICATIONS_OPEN', 'Close the IPO application window before changing its allotment lot size.', 409);\n    END IF;\n    BEGIN v_new_size := (p->>'lot_size')::numeric; EXCEPTION WHEN others THEN v_new_size := NULL; END;\n    v_reason := trim(coalesce(p->>'reason',''));\n    IF v_new_size IS NULL OR v_new_size <= 0 OR v_new_size <> trunc(v_new_size) OR v_new_size > 2147483647 THEN\n      PERFORM jse_fail('INVALID_IPO_LOT_SIZE', 'IPO allotment lot size must be a positive whole number of shares.', 400);\n    END IF;\n    IF EXISTS (SELECT 1 FROM ipo_applications WHERE security_id=s.id)\n       OR EXISTS (SELECT 1 FROM ipo_allotments WHERE security_id=s.id)\n       OR EXISTS (SELECT 1 FROM ipo_allotment_draws WHERE security_id=s.id) THEN\n      PERFORM jse_fail('IPO_LOT_SIZE_LOCKED', 'IPO lot size cannot change after applications, allotments or a draw exist for this IPO.', 409);\n    END IF;\n    PERFORM jse_audit(a, 'IPO_LOT_SIZE_CHANGED', 'security', s.symbol, NULL, NULL,\n      jsonb_build_object('ipo_lot_size',s.ipo_lot_size),\n      jsonb_build_object('ipo_lot_size',v_new_size::integer),\n      jsonb_build_object('reason',nullif(v_reason,''),'trading_lot_size_unchanged',true));\n    UPDATE securities SET ipo_lot_size=v_new_size::integer, updated_at=now() WHERE id=s.id;\n    RETURN jsonb_build_object('success',true,'symbol',s.symbol,'old_lot_size',s.ipo_lot_size,'lot_size',v_new_size::integer);\n  END IF;\n\n  IF v_action = 'SIZE' THEN\n    BEGIN v_new_size := (p->>'new_size')::numeric; EXCEPTION WHEN others THEN v_new_size := NULL; END;\n    v_unit := upper(trim(coalesce(p->>'unit','SHARES')));\n    v_reason := trim(coalesce(p->>'reason',''));\n    IF v_new_size IS NULL OR v_new_size <= 0 OR v_new_size <> trunc(v_new_size) THEN\n      PERFORM jse_fail('INVALID_ISSUE_SIZE', 'Issue size must be a positive whole number.', 400);\n    END IF;\n    IF v_unit NOT IN ('SHARES','LOTS') THEN PERFORM jse_fail('INVALID_UNIT', 'Choose Shares or Lots.', 400); END IF;\n    IF v_unit='LOTS' THEN v_new_size := v_new_size * s.ipo_lot_size; END IF;\n    IF v_new_size > 2147483647 THEN PERFORM jse_fail('ISSUE_SIZE_TOO_LARGE', 'Issue size exceeds the supported inventory range.', 400); END IF;\n    v_new_shares := v_new_size::integer;\n    SELECT coalesce(sum(quantity),0)::integer INTO v_issued FROM ipo_allotments WHERE security_id=s.id AND reversed_at IS NULL;\n    SELECT * INTO d FROM ipo_allotment_draws WHERE security_id=s.id ORDER BY id DESC LIMIT 1;\n    IF d.id IS NOT NULL AND d.status IN ('GENERATED','VERIFIED','APPROVED') THEN\n      PERFORM jse_fail('DRAW_IN_PROGRESS', 'Issue size cannot change while a draw is generated, verified or approved. Finalize or resolve that draw first.', 409);\n    END IF;\n    IF v_new_shares < v_issued THEN\n      PERFORM jse_fail('BELOW_ISSUED', 'Issue size cannot be lower than already allotted shares (' || v_issued || ').', 409);\n    END IF;\n    IF d.id IS NOT NULL AND d.status='FINALIZED' AND v_new_shares < coalesce(s.ipo_shares_offered,0) THEN\n      PERFORM jse_fail('FINALIZED_ISSUE_SIZE', 'After final issuance, issue size may only be increased; it cannot be reduced.', 409);\n    END IF;\n    PERFORM jse_audit(a, 'IPO_ISSUE_SIZE_CHANGED', 'security', s.symbol, NULL, NULL,\n      jsonb_build_object('offered_shares',s.ipo_shares_offered),\n      jsonb_build_object('offered_shares',v_new_shares,'unit_entered',v_unit,'value_entered',p->>'new_size'),\n      jsonb_build_object('reason',v_reason,'issued_shares',v_issued));\n    UPDATE securities SET ipo_shares_offered=v_new_shares, updated_at=now() WHERE id=s.id;\n    RETURN jsonb_build_object('success',true,'symbol',s.symbol,'old_size',s.ipo_shares_offered,'new_size',v_new_shares,'issued',v_issued,'remaining',v_new_shares-v_issued);\n  END IF;\n\n  IF v_action = 'DRAW' THEN\n    IF s.ipo_shares_offered IS NULL OR s.ipo_shares_offered <= 0 THEN\n      PERFORM jse_fail('ISSUE_SIZE_REQUIRED', 'Set the IPO issue size before generating allotment.', 409);\n    END IF;\n    IF (jse_ipo_window()->>'phase') IS DISTINCT FROM 'CLOSED' THEN\n      PERFORM jse_fail('APPLICATIONS_NOT_CLOSED', 'Random allotment is available only after the IPO application window closes.', 409);\n    END IF;\n    SELECT * INTO d FROM ipo_allotment_draws WHERE security_id=s.id AND status<>'CANCELLED' ORDER BY id DESC LIMIT 1;\n    IF FOUND THEN\n      RETURN jsonb_build_object('success',true,'replay',true,'draw_id',d.id,'status',d.status,\n        'message','An existing saved draw was returned. The random order was not regenerated.');\n    END IF;\n    SELECT coalesce(sum(quantity),0)::integer INTO v_issued FROM ipo_allotments WHERE security_id=s.id AND reversed_at IS NULL;\n    v_remaining := s.ipo_shares_offered - v_issued;\n    IF v_remaining < 0 THEN PERFORM jse_fail('INVENTORY_MISMATCH', 'Issued shares exceed the configured IPO issue size.', 409); END IF;\n    v_available_lots := floor(v_remaining::numeric / s.ipo_lot_size)::integer;\n    INSERT INTO ipo_allotment_draws(security_id,status,available_shares,available_lots,generated_by,inventory_snapshot)\n    VALUES(s.id,'GENERATED',v_remaining,v_available_lots,jse_actor_name(a),\n      jsonb_build_object('offered_shares',s.ipo_shares_offered,'issued_shares',v_issued,'lot_size',s.ipo_lot_size,'base_price',s.base_price))\n    RETURNING id INTO v_draw_id;\n    FOR x IN\n      SELECT ia.id AS application_id, ia.team_id, t.code AS team_code, t.name AS team_name,\n        ia.lots AS requested_lots, ia.price AS application_price, s.ipo_lot_size\n      FROM ipo_applications ia JOIN teams t ON t.id=ia.team_id\n      WHERE ia.security_id=s.id AND ia.status='APPLIED'\n        AND ia.lots BETWEEN 1 AND 10 AND ia.amount<=150000\n        AND (SELECT coalesce(sum(ax.amount),0) FROM ipo_applications ax WHERE ax.team_id=ia.team_id AND ax.status='APPLIED')<=600000\n        AND NOT EXISTS (SELECT 1 FROM ipo_allotments aa WHERE aa.team_id=ia.team_id AND aa.security_id=s.id AND aa.reversed_at IS NULL)\n      ORDER BY gen_random_bytes(16)\n    LOOP\n      v_position := v_position + 1;\n      v_requested := v_requested + x.requested_lots;\n      INSERT INTO ipo_allotment_draw_items(draw_id,application_id,team_id,team_code,team_name,draw_position,\n        requested_lots,allotted_lots,lot_size,application_price)\n      VALUES(v_draw_id,x.application_id,x.team_id,x.team_code,x.team_name,v_position,x.requested_lots,0,x.lot_size,x.application_price);\n    END LOOP;\n    IF v_position=0 THEN\n      DELETE FROM ipo_allotment_draws WHERE id=v_draw_id;\n      PERFORM jse_fail('NO_ELIGIBLE_APPLICATIONS', 'No eligible, unallotted applications were found for this IPO.', 409);\n    END IF;\n    UPDATE ipo_allotment_draws SET requested_lots=v_requested,\n      subscription_ratio=CASE WHEN v_available_lots>0 THEN round(v_requested::numeric/v_available_lots,4) ELSE NULL END\n    WHERE id=v_draw_id;\n    v_left := v_available_lots;\n    v_round := 1;\n    WHILE v_left>0 LOOP\n      v_progress := false;\n      FOR x IN SELECT id,requested_lots,allotted_lots FROM ipo_allotment_draw_items\n               WHERE draw_id=v_draw_id AND allotted_lots<requested_lots ORDER BY draw_position LOOP\n        UPDATE ipo_allotment_draw_items SET allotted_lots=allotted_lots+1, rounds=array_append(rounds,v_round)\n        WHERE id=x.id;\n        v_left := v_left-1;\n        v_progress := true;\n        EXIT WHEN v_left<=0;\n      END LOOP;\n      EXIT WHEN NOT v_progress;\n      v_round := v_round+1;\n    END LOOP;\n    PERFORM jse_audit(a,'IPO_RANDOM_DRAW_GENERATED','ipo_allotment_draw',v_draw_id::text,NULL,NULL,NULL,NULL,\n      jsonb_build_object('symbol',s.symbol,'eligible',v_position,'requested_lots',v_requested,'available_lots',v_available_lots,\n        'subscription_ratio',CASE WHEN v_available_lots>0 THEN round(v_requested::numeric/v_available_lots,4) ELSE NULL END,\n        'algorithm','RANDOM_ROUND_ROBIN_V1'));\n    RETURN jsonb_build_object('success',true,'draw_id',v_draw_id,'status','GENERATED','eligible_count',v_position,\n      'requested_lots',v_requested,'available_lots',v_available_lots,\n      'subscription_ratio',CASE WHEN v_available_lots>0 THEN round(v_requested::numeric/v_available_lots,4) ELSE NULL END);\n  END IF;\n\n  SELECT * INTO d FROM ipo_allotment_draws WHERE security_id=s.id ORDER BY id DESC LIMIT 1 FOR UPDATE;\n  IF NOT FOUND THEN PERFORM jse_fail('NO_DRAW', 'Generate the random draw first.', 409); END IF;\n\n  IF v_action = 'VERIFY' THEN\n    IF d.status <> 'GENERATED' THEN\n      IF d.status IN ('VERIFIED','APPROVED','FINALIZED') THEN RETURN jsonb_build_object('success',true,'replay',true,'draw_id',d.id,'status',d.status); END IF;\n      PERFORM jse_fail('INVALID_DRAW_STATUS','Only a generated draw can be verified.',409);\n    END IF;\n    SELECT coalesce(sum(quantity),0)::integer INTO v_issued FROM ipo_allotments WHERE security_id=s.id AND reversed_at IS NULL;\n    v_remaining := coalesce(s.ipo_shares_offered,0)-v_issued;\n    SELECT coalesce(sum(allotted_lots*lot_size),0)::integer, coalesce(sum(allotted_lots),0)::integer\n      INTO v_total_shares,v_count FROM ipo_allotment_draw_items WHERE draw_id=d.id;\n    IF v_remaining <> d.available_shares THEN PERFORM jse_fail('INVENTORY_CHANGED','IPO inventory changed after the draw. Do not approve this stale draw.',409); END IF;\n    IF v_total_shares > d.available_shares OR EXISTS(SELECT 1 FROM ipo_allotment_draw_items WHERE draw_id=d.id AND (allotted_lots<0 OR allotted_lots>requested_lots)) THEN\n      PERFORM jse_fail('ALLOTMENT_INVALID','The proposed allotment exceeds inventory or a request.',409);\n    END IF;\n    UPDATE ipo_allotment_draws SET status='VERIFIED',verified_by=jse_actor_name(a),verified_at=now() WHERE id=d.id;\n    PERFORM jse_audit(a,'IPO_RANDOM_DRAW_VERIFIED','ipo_allotment_draw',d.id::text,NULL,NULL,\n      jsonb_build_object('status','GENERATED'),jsonb_build_object('status','VERIFIED'),\n      jsonb_build_object('allotted_lots',v_count,'allotted_shares',v_total_shares,'available_shares',d.available_shares));\n    RETURN jsonb_build_object('success',true,'draw_id',d.id,'status','VERIFIED','allotted_lots',v_count,'allotted_shares',v_total_shares);\n  ELSIF v_action = 'APPROVE' THEN\n    IF d.status <> 'VERIFIED' THEN PERFORM jse_fail('NOT_VERIFIED','Verify the allotment before approval.',409); END IF;\n    UPDATE ipo_allotment_draws SET status='APPROVED',approved_by=jse_actor_name(a),approved_at=now() WHERE id=d.id;\n    PERFORM jse_audit(a,'IPO_RANDOM_DRAW_APPROVED','ipo_allotment_draw',d.id::text,NULL,NULL,\n      jsonb_build_object('status','VERIFIED'),jsonb_build_object('status','APPROVED'),NULL);\n    RETURN jsonb_build_object('success',true,'draw_id',d.id,'status','APPROVED');\n  ELSIF v_action = 'FINALIZE' THEN\n    IF d.status='FINALIZED' THEN RETURN jsonb_build_object('success',true,'replay',true,'draw_id',d.id,'status','FINALIZED'); END IF;\n    IF d.status <> 'APPROVED' THEN PERFORM jse_fail('NOT_APPROVED','Approve the verified allotment before issuing shares.',409); END IF;\n    SELECT coalesce(sum(quantity),0)::integer INTO v_issued FROM ipo_allotments WHERE security_id=s.id AND reversed_at IS NULL;\n    v_remaining := coalesce(s.ipo_shares_offered,0)-v_issued;\n    SELECT coalesce(sum(allotted_lots*lot_size),0)::integer INTO v_total_shares FROM ipo_allotment_draw_items WHERE draw_id=d.id;\n    IF v_remaining <> d.available_shares OR v_total_shares>v_remaining THEN\n      PERFORM jse_fail('INVENTORY_CHANGED','IPO inventory changed after approval. No shares were issued.',409);\n    END IF;\n    IF EXISTS(SELECT 1 FROM ipo_allotment_draw_items di JOIN ipo_allotments aa ON aa.team_id=di.team_id AND aa.security_id=s.id AND aa.reversed_at IS NULL WHERE di.draw_id=d.id AND di.allotted_lots>0) THEN\n      PERFORM jse_fail('DUPLICATE_ALLOTMENT','An applicant already has an allotment for this IPO. No shares were issued.',409);\n    END IF;\n    FOR x IN SELECT di.team_id,di.allotted_lots,di.lot_size,di.application_price,t.cash,t.code\n      FROM ipo_allotment_draw_items di JOIN teams t ON t.id=di.team_id\n      WHERE di.draw_id=d.id AND di.allotted_lots>0 LOOP\n      v_total_amount := v_total_amount + x.allotted_lots*x.lot_size*x.application_price;\n      IF x.cash < x.allotted_lots*x.lot_size*x.application_price THEN\n        PERFORM jse_fail('ALLOTMENT_CASH',x.code || ' does not have enough cash for the proposed allotment. No shares were issued.',409);\n      END IF;\n    END LOOP;\n    FOR x IN SELECT di.* FROM ipo_allotment_draw_items di WHERE di.draw_id=d.id AND di.allotted_lots>0 ORDER BY di.draw_position LOOP\n      INSERT INTO ipo_allotments(team_id,security_id,lots,quantity,price,amount,batch_id,created_by,created_by_name)\n      VALUES(x.team_id,s.id,x.allotted_lots,x.allotted_lots*x.lot_size,x.application_price,\n        x.allotted_lots*x.lot_size*x.application_price,'RANDOM-IPO-'||d.id,nullif(a->>'id','')::integer,jse_actor_name(a))\n      RETURNING * INTO al;\n      PERFORM jse__apply_allotment(a,al);\n      v_count := v_count+1;\n    END LOOP;\n    UPDATE ipo_allotment_draws SET status='FINALIZED',finalized_by=jse_actor_name(a),finalized_at=now() WHERE id=d.id;\n    PERFORM jse_audit(a,'IPO_RANDOM_DRAW_FINALIZED','ipo_allotment_draw',d.id::text,NULL,NULL,\n      jsonb_build_object('status','APPROVED'),jsonb_build_object('status','FINALIZED'),\n      jsonb_build_object('rows_issued',v_count,'shares_issued',v_total_shares,'amount_charged',v_total_amount));\n    RETURN jsonb_build_object('success',true,'draw_id',d.id,'status','FINALIZED','rows_issued',v_count,\n      'shares_issued',v_total_shares,'amount_charged',v_total_amount);\n  END IF;\n\n  PERFORM jse_fail('INVALID_ACTION','Use STATE, LOT_SIZE, SIZE, DRAW, VERIFY, APPROVE or FINALIZE.',400);\nEND $$;\n\n\n-- IPO application and allotment lots are separate from regular share-trading lots.\nCREATE OR REPLACE FUNCTION jse_ipo_application(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$\nDECLARE\n  v_action text := upper(coalesce(nullif(p->>'action', ''), 'SET'));\n  v_status text; t teams%ROWTYPE; s securities%ROWTYPE; app ipo_applications%ROWTYPE;\n  v_lots integer; v_amount numeric; v_other numeric; v_n integer;\nBEGIN\n  PERFORM jse_require_role(a, 'PARTICIPANT', 'ADMIN');\n  SELECT status INTO v_status FROM event_control WHERE id = 1;\n  IF v_action = 'CLEAR' THEN\n    PERFORM jse_require_role(a, 'ADMIN');\n    PERFORM jse_require_admin_password(a, p);\n    IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'Applications can be cleared only before the event starts.', 409); END IF;\n    DELETE FROM ipo_applications WHERE coalesce(p->>'ipo', '') = '' OR security_id = (SELECT id FROM securities WHERE kind = 'IPO' AND symbol = upper(trim(p->>'ipo')));\n    GET DIAGNOSTICS v_n = ROW_COUNT;\n    PERFORM jse_audit(a, 'IPO_APPLICATIONS_CLEARED', 'ipo_application', coalesce(nullif(p->>'ipo', ''), 'ALL'), NULL, NULL, NULL, NULL, jsonb_build_object('rows', v_n));\n    RETURN jsonb_build_object('success', true, 'cleared', v_n);\n  END IF;\n  SELECT * INTO t FROM teams WHERE id = CASE WHEN a->>'role' = 'PARTICIPANT' THEN nullif(a->>'team_id', '')::integer\n                                             ELSE (SELECT id FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')))) END FOR UPDATE;\n  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Team not found.', 404); END IF;\n  SELECT * INTO s FROM securities WHERE kind = 'IPO' AND active AND (symbol = upper(trim(coalesce(p->>'ipo', p->>'symbol', ''))) OR ipo_code = upper(trim(coalesce(p->>'ipo', p->>'symbol', ''))));\n  IF NOT FOUND THEN PERFORM jse_fail('IPO_NOT_FOUND', 'Choose one of the IPOs.', 404); END IF;\n  IF jse_ipo_stage(s.id) <> 'APPLICATION_OPEN' THEN\n    PERFORM jse_fail('IPO_WINDOW_CLOSED', 'Applications for ' || s.name || ' are not open (stage: ' || replace(jse_ipo_stage(s.id), '_', ' ') || ').', 409);\n  END IF;\n  SELECT * INTO app FROM ipo_applications WHERE team_id = t.id AND security_id = s.id FOR UPDATE;\n  IF v_action = 'WITHDRAW' THEN\n    IF NOT FOUND OR app.status <> 'APPLIED' THEN PERFORM jse_fail('NO_APPLICATION', 'There is no application to withdraw.', 409); END IF;\n    UPDATE ipo_applications SET status = 'WITHDRAWN', updated_at = now(), updated_by_name = jse_actor_name(a) WHERE id = app.id;\n    PERFORM jse_audit(a, 'IPO_APPLICATION_WITHDRAWN', 'ipo_application', s.symbol, t.id, NULL, jsonb_build_object('lots', app.lots), NULL, NULL);\n    RETURN jsonb_build_object('success', true, 'status', 'WITHDRAWN');\n  ELSIF v_action <> 'SET' THEN\n    PERFORM jse_fail('INVALID_ACTION', 'Use SET or WITHDRAW.', 400);\n  END IF;\n  BEGIN v_lots := (p->>'lots')::integer; EXCEPTION WHEN others THEN v_lots := NULL; END;\n  IF v_lots IS NULL OR v_lots <= 0 THEN PERFORM jse_fail('INVALID_LOTS', 'Apply for a whole number of lots (1 lot = ' || s.ipo_lot_size || ' shares).', 400); END IF;\n  v_amount := v_lots * s.ipo_lot_size * s.base_price;\n  SELECT coalesce(sum(amount), 0) INTO v_other FROM ipo_applications WHERE team_id = t.id AND status = 'APPLIED' AND security_id <> s.id;\n  IF v_other + v_amount > t.cash THEN\n    PERFORM jse_fail('APPLICATION_CASH', 'All IPO applications together (' || jse_inr((v_other + v_amount)) || ') cannot exceed the team''s cash (' || jse_inr(t.cash) || ').', 409);\n  END IF;\n  INSERT INTO ipo_applications(team_id, security_id, lots, quantity, price, amount, status, created_by_name, updated_by_name)\n  VALUES (t.id, s.id, v_lots, v_lots * s.ipo_lot_size, s.base_price, v_amount, 'APPLIED', jse_actor_name(a), jse_actor_name(a))\n  ON CONFLICT (team_id, security_id) DO UPDATE SET lots = EXCLUDED.lots, quantity = EXCLUDED.quantity, price = EXCLUDED.price,\n    amount = EXCLUDED.amount, status = 'APPLIED', updated_at = now(), updated_by_name = EXCLUDED.updated_by_name\n  RETURNING * INTO app;\n  PERFORM jse_audit(a, 'IPO_APPLICATION_SUBMITTED', 'ipo_application', s.symbol, t.id, NULL, NULL,\n    jsonb_build_object('lots', v_lots, 'shares', v_lots * s.ipo_lot_size, 'amount', v_amount), jsonb_build_object('issue_price', s.base_price));\n  RETURN jsonb_build_object('success', true, 'status', 'APPLIED', 'application', to_jsonb(app) || jsonb_build_object('symbol', s.symbol));\nEND $$;\n\n-- One prospectus record per IPO, managed by the administrator. Content is supplied by the organisers.\n\nCREATE OR REPLACE FUNCTION jse_ipo_allot(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$\nDECLARE\n  v_status text; r jsonb; v_errors jsonb := '[]'::jsonb; v_rows jsonb := '[]'::jsonb;\n  v_team teams%ROWTYPE; v_sec securities%ROWTYPE; v_lots integer; v_shares integer; v_amt numeric; v_i integer := 0;\n  v_replace boolean := coalesce((p->>'replace')::boolean, false);\n  v_batch text := coalesce(nullif(p->>'batch_id', ''), to_char(now(), 'YYYYMMDD-HH24MISS'));\n  v_total numeric := 0; v_count integer := 0; v_applied integer;\n  al ipo_allotments%ROWTYPE; x record;\nBEGIN\n  PERFORM jse_require_role(a, 'ADMIN');\n  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;\n  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR UPDATE;\n  IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'IPO allotments can be loaded only before the event starts.', 409); END IF;\n  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN PERFORM jse_fail('NO_ROWS', 'No allotment rows were supplied.', 400); END IF;\n\n  -- validation pass (nothing is written unless every row is valid)\n  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP\n    v_i := v_i + 1;\n    SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(r->>'team', '')));\n    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown team ' || coalesce(r->>'team', '(blank)')); CONTINUE; END IF;\n    SELECT * INTO v_sec FROM securities WHERE kind = 'IPO' AND (symbol = upper(trim(coalesce(r->>'ipo', r->>'symbol', ''))) OR ipo_code = upper(trim(coalesce(r->>'ipo', '')))\n                                                               OR upper(name) = upper(trim(coalesce(r->>'ipo', r->>'symbol', ''))));\n    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown IPO ' || coalesce(r->>'ipo', r->>'symbol', '(blank)')); CONTINUE; END IF;\n    BEGIN v_lots := (r->>'lots')::integer; EXCEPTION WHEN others THEN v_lots := NULL; END;\n    IF v_lots IS NULL OR v_lots < 0 THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Lots must be a whole number'); CONTINUE; END IF;\n    IF v_lots = 0 THEN CONTINUE; END IF;\n    v_shares := v_lots * v_sec.ipo_lot_size; v_amt := v_shares * v_sec.base_price;\n    IF nullif(trim(coalesce(r->>'shares', '')), '') IS NOT NULL AND (r->>'shares')::numeric <> v_shares THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' / ' || v_sec.symbol || ': Shares ' || (r->>'shares') || ' \\u2260 ' || v_lots || ' lots \\xD7 ' || v_sec.ipo_lot_size || ' = ' || v_shares); CONTINUE;\n    END IF;\n    IF nullif(trim(coalesce(r->>'amount', '')), '') IS NOT NULL AND round((r->>'amount')::numeric, 2) <> v_amt THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' / ' || v_sec.symbol || ': Amount ' || (r->>'amount') || ' \\u2260 ' || v_shares || ' \\xD7 ' || jse_inr(v_sec.base_price) || ' = ' || jse_inr(v_amt)); CONTINUE;\n    END IF;\n    -- when the portal application process was used for this IPO, an allotment cannot exceed the team's application\n    IF EXISTS (SELECT 1 FROM ipo_applications ap WHERE ap.security_id = v_sec.id AND ap.status = 'APPLIED') THEN\n      SELECT lots INTO v_applied FROM ipo_applications ap WHERE ap.security_id = v_sec.id AND ap.team_id = v_team.id AND ap.status = 'APPLIED';\n      IF coalesce(v_applied, 0) < v_lots THEN\n        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' applied for ' || coalesce(v_applied, 0) || ' ' || v_sec.symbol || ' lot(s) but the file allots ' || v_lots); CONTINUE;\n      END IF;\n    END IF;\n    IF NOT v_replace AND EXISTS (SELECT 1 FROM ipo_allotments WHERE team_id = v_team.id AND security_id = v_sec.id AND reversed_at IS NULL) THEN\n      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' already has a ' || v_sec.symbol || ' allotment (tick \"replace\" to overwrite)'); CONTINUE;\n    END IF;\n    v_rows := v_rows || jsonb_build_object('team_id', v_team.id, 'team', v_team.code, 'security_id', v_sec.id, 'symbol', v_sec.symbol,\n                                           'lots', v_lots, 'quantity', v_shares, 'price', v_sec.base_price, 'amount', v_amt);\n  END LOOP;\n  FOR x IN SELECT e->>'team' AS team, e->>'symbol' AS symbol, count(*) AS n FROM jsonb_array_elements(v_rows) e GROUP BY 1, 2 HAVING count(*) > 1 LOOP\n    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', x.team || ' / ' || x.symbol || ' appears ' || x.n || ' times in the file');\n  END LOOP;\n  FOR x IN\n    SELECT e->>'team' AS team, (e->>'team_id')::integer AS team_id, sum((e->>'amount')::numeric) AS need\n    FROM jsonb_array_elements(v_rows) e GROUP BY 1, 2\n  LOOP\n    SELECT t2.cash + (CASE WHEN v_replace THEN coalesce((\n             SELECT sum(al2.amount) FROM ipo_allotments al2\n             JOIN jsonb_array_elements(v_rows) e2 ON (e2->>'team_id')::integer = al2.team_id AND (e2->>'security_id')::integer = al2.security_id\n             WHERE al2.team_id = x.team_id AND al2.reversed_at IS NULL), 0) ELSE 0 END)\n    INTO v_total FROM teams t2 WHERE t2.id = x.team_id;\n    IF x.need > v_total THEN\n      v_errors := v_errors || jsonb_build_object('row', NULL, 'error', x.team || ' does not have enough cash for ' || jse_inr(x.need) || ' of allotments (available ' || jse_inr(v_total) || ')');\n    END IF;\n  END LOOP;\n  v_total := 0;\n  IF jsonb_array_length(v_errors) > 0 THEN\n    RETURN jsonb_build_object('success', false, 'code', 'ALLOTMENT_ERRORS', 'error', 'Nothing was loaded. Fix the rows listed and upload again.', 'errors', v_errors, 'http', 400);\n  END IF;\n  IF coalesce((p->>'dry_run')::boolean, false) THEN\n    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_rows),\n      'total_amount', (SELECT coalesce(sum((e->>'amount')::numeric), 0) FROM jsonb_array_elements(v_rows) e), 'preview', v_rows);\n  END IF;\n\n  FOR r IN SELECT value FROM jsonb_array_elements(v_rows) LOOP\n    IF v_replace THEN\n      PERFORM jse__reverse_allotment(a, al2.id) FROM ipo_allotments al2\n      WHERE al2.team_id = (r->>'team_id')::integer AND al2.security_id = (r->>'security_id')::integer AND al2.reversed_at IS NULL;\n    END IF;\n    INSERT INTO ipo_allotments(team_id, security_id, lots, quantity, price, amount, batch_id, created_by, created_by_name)\n    VALUES ((r->>'team_id')::integer, (r->>'security_id')::integer, (r->>'lots')::integer, (r->>'quantity')::integer,\n            (r->>'price')::numeric, (r->>'amount')::numeric, v_batch, nullif(a->>'id', '')::integer, jse_actor_name(a))\n    RETURNING * INTO al;\n    PERFORM jse__apply_allotment(a, al);\n    v_total := v_total + al.amount; v_count := v_count + 1;\n  END LOOP;\n  PERFORM jse_audit(a, 'IPO_ALLOTMENT_LOADED', 'ipo_allotment', v_batch, NULL, NULL, NULL, NULL,\n    jsonb_build_object('rows', v_count, 'total_amount', v_total, 'replace', v_replace));\n  RETURN jsonb_build_object('success', true, 'batch_id', v_batch, 'rows', v_count, 'total_amount', v_total);\nEND $$;\n\nCREATE OR REPLACE FUNCTION jse_ipo_page() RETURNS jsonb LANGUAGE sql STABLE AS $$\n  SELECT jsonb_build_object('success', true, 'event_name', cfg.event_name, 'event_start_at', cfg.event_start_at, 'window', jse_ipo_window(),\n    'status', (SELECT status FROM event_control WHERE id = 1),\n    'ipos', coalesce((SELECT jsonb_agg(jsonb_build_object(\n        'symbol', s.symbol, 'ipo_code', s.ipo_code, 'name', s.name, 'sector', s.sector,\n        'issue_price', s.base_price, 'lot_size', s.ipo_lot_size, 'lot_value', s.ipo_lot_size * s.base_price,\n        'stage', jse_ipo_stage(s.id), 'listed', s.listed_at IS NOT NULL, 'listed_at', s.listed_at,\n        'listing_price', CASE WHEN s.listed_at IS NOT NULL THEN s.index_base_price END, 'price', s.price, 'in_index', s.listed_at IS NOT NULL,\n        'prospectus', jsonb_build_object(\n          'company_description', pr.company_description, 'issue_details', pr.issue_details, 'business_overview', pr.business_overview,\n          'financial_information', pr.financial_information, 'risk_factors', pr.risk_factors, 'use_of_proceeds', pr.use_of_proceeds,\n          'promoters_management', pr.promoters_management, 'other_information', pr.other_information,\n          'document_url', pr.document_url, 'document_name', pr.document_name, 'document_size', pr.document_size,\n          'document_uploaded_at', pr.document_uploaded_at, 'has_document', pr.document_data IS NOT NULL, 'updated_at', pr.updated_at)\n      ) ORDER BY s.display_order, s.id)\n      FROM securities s LEFT JOIN ipo_prospectus pr ON pr.security_id = s.id WHERE s.kind = 'IPO' AND s.active), '[]'::jsonb))\n  FROM event_config cfg WHERE cfg.id = 1\n$$;\n\nINSERT INTO schema_migrations(version) VALUES ('011_roster_ipo');\n";var m12special="-- BIG BULL special participant: Team 1 is a dedicated account with a hard ₹1 crore cash ceiling.\n-- Additive and idempotent. Existing cash, holdings, orders, and team/broker identifiers are preserved.\nCREATE TABLE IF NOT EXISTS public.jse_special_accounts (\n  team_id integer PRIMARY KEY REFERENCES public.teams(id),\n  account_code text NOT NULL UNIQUE,\n  display_name text NOT NULL,\n  cash_limit numeric(14,2) NOT NULL CHECK (cash_limit >= 0),\n  created_at timestamptz NOT NULL DEFAULT now(),\n  updated_at timestamptz NOT NULL DEFAULT now()\n);\nINSERT INTO public.jse_special_accounts(team_id, account_code, display_name, cash_limit)\nSELECT id, 'BIG-BULL', 'BIG BULL', 100000000.00 FROM public.teams WHERE code='TEAM-001'\nON CONFLICT (team_id) DO UPDATE SET account_code='BIG-BULL', display_name='BIG BULL', cash_limit=100000000.00, updated_at=now();\n\nCREATE OR REPLACE FUNCTION public.jse_special_cash_limit_guard() RETURNS trigger LANGUAGE plpgsql AS $$\nDECLARE v_limit numeric;\nBEGIN\n  SELECT cash_limit INTO v_limit FROM public.jse_special_accounts WHERE team_id=NEW.id;\n  IF FOUND AND NEW.cash > v_limit THEN\n    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='BIG BULL cash limit is ₹1,00,00,000.00; this balance change is blocked.';\n  END IF;\n  RETURN NEW;\nEND $$;\nDROP TRIGGER IF EXISTS jse_special_cash_limit_guard_trg ON public.teams;\nCREATE TRIGGER jse_special_cash_limit_guard_trg BEFORE INSERT OR UPDATE ON public.teams\nFOR EACH ROW EXECUTE FUNCTION public.jse_special_cash_limit_guard();\n\nCREATE OR REPLACE FUNCTION public.jse_big_bull_admin(a jsonb, p jsonb)\n RETURNS jsonb\n LANGUAGE plpgsql\nAS $function$\nDECLARE\n  v_action text := upper(coalesce(nullif(p->>'action',''),'STATE'));\n  t teams%ROWTYPE;\n  b brokers%ROWTYPE;\n  v_amount numeric(16,2);\n  v_delta numeric(16,2);\n  v_after numeric(16,2);\n  v_reason text;\n  v_name text;\n  v_broker_code text;\n  v_broker_id integer;\n  v_section text;\n  v_members text;\n  v_active boolean;\nBEGIN\n  PERFORM jse_require_role(a, 'ADMIN');\n  SELECT * INTO t FROM teams WHERE seq=1 AND code='TEAM-001' FOR UPDATE;\n  IF NOT FOUND THEN PERFORM jse_fail('BIG_BULL_NOT_FOUND','Team 1 special participant was not found.',404); END IF;\n  SELECT * INTO b FROM brokers WHERE id=t.broker_id;\n\n  IF v_action = 'STATE' THEN\n    RETURN jsonb_build_object('success',true,'account',jsonb_build_object(\n      'team_number',t.seq,'team_code',t.code,'display_name',t.name,'broker_number',b.id,'broker_code',b.code,\n      'broker_name',b.name,'cash',t.cash,'cash_limit',100000000,'active',t.active,'section',t.section,'members',t.members));\n  END IF;\n\n  PERFORM jse_require_admin_password(a,p);\n  v_reason := left(trim(coalesce(p->>'reason','')),300);\n  IF v_reason='' THEN PERFORM jse_fail('REASON_REQUIRED','Enter a reason for the BIG BULL change.',400); END IF;\n\n  IF v_action = 'UPDATE_ACCOUNT' THEN\n    v_name := left(trim(coalesce(p->>'display_name','')),120);\n    v_broker_code := upper(trim(coalesce(p->>'broker_code','')));\n    v_section := left(trim(coalesce(p->>'section','')),120);\n    v_members := left(trim(coalesce(p->>'members','')),1000);\n    BEGIN v_active := (p->>'active')::boolean; EXCEPTION WHEN others THEN v_active := NULL; END;\n    IF v_name='' THEN PERFORM jse_fail('NAME_REQUIRED','Enter the BIG BULL display name.',400); END IF;\n    IF v_active IS NULL THEN PERFORM jse_fail('INVALID_ACTIVE','Choose an account status.',400); END IF;\n    SELECT id INTO v_broker_id FROM brokers WHERE code=v_broker_code AND active;\n    IF v_broker_id IS NULL THEN PERFORM jse_fail('BROKER_NOT_FOUND','Choose an existing active broker.',400); END IF;\n    IF EXISTS (SELECT 1 FROM teams WHERE id<>t.id AND lower(name)=lower(v_name)) THEN\n      PERFORM jse_fail('DUPLICATE_TEAM_NAME','That display name is already used by another team.',409);\n    END IF;\n    UPDATE teams SET name=v_name, broker_id=v_broker_id, section=nullif(v_section,''), members=nullif(v_members,''),\n      active=v_active, updated_at=now() WHERE id=t.id;\n    UPDATE app_users SET display_name=v_name, active=v_active, updated_at=now()\n      WHERE role='PARTICIPANT' AND team_id=t.id;\n    UPDATE public.jse_special_accounts SET display_name=v_name, updated_at=now() WHERE team_id=t.id;\n    PERFORM jse_audit(a,'BIG_BULL_ACCOUNT_UPDATED','team',t.code,t.id,NULL,\n      jsonb_build_object('name',t.name,'broker_code',b.code,'section',t.section,'members',t.members,'active',t.active),\n      jsonb_build_object('name',v_name,'broker_code',v_broker_code,'section',nullif(v_section,''),'members',nullif(v_members,''),'active',v_active),\n      jsonb_build_object('reason',v_reason));\n  ELSIF v_action IN ('SET_BALANCE','ADJUST_CASH') THEN\n    BEGIN v_amount := nullif(trim(p->>'amount'),'')::numeric; EXCEPTION WHEN others THEN v_amount := NULL; END;\n    IF v_amount IS NULL OR v_amount<0 AND v_action='SET_BALANCE' THEN\n      PERFORM jse_fail('INVALID_AMOUNT','Enter a balance from ₹0 to ₹1 crore.',400);\n    END IF;\n    IF v_action='ADJUST_CASH' AND v_amount=0 THEN PERFORM jse_fail('INVALID_AMOUNT','Enter a non-zero cash adjustment.',400); END IF;\n    v_after := CASE WHEN v_action='SET_BALANCE' THEN v_amount ELSE t.cash+v_amount END;\n    IF v_after<0 OR v_after>100000000 THEN\n      PERFORM jse_fail('CASH_LIMIT','BIG BULL cash must stay between ₹0 and ₹1 crore.',400);\n    END IF;\n    v_delta := v_after-t.cash;\n    IF v_delta<>0 THEN\n      UPDATE teams SET cash=v_after, updated_at=now() WHERE id=t.id;\n      INSERT INTO cash_ledger(team_id,entry_type,debit,credit,balance_after,note,actor_id,actor_name)\n      VALUES(t.id,'ADJUSTMENT',greatest(-v_delta,0),greatest(v_delta,0),v_after,\n        'BIG BULL admin '||lower(v_action)||': '||v_reason,nullif(a->>'id','')::integer,jse_actor_name(a));\n      PERFORM jse_audit(a,CASE WHEN v_action='SET_BALANCE' THEN 'BIG_BULL_BALANCE_SET' ELSE 'BIG_BULL_CASH_ADJUSTED' END,\n        'team',t.code,t.id,NULL,jsonb_build_object('cash',t.cash),jsonb_build_object('cash',v_after),\n        jsonb_build_object('reason',v_reason,'amount',v_amount,'action',v_action));\n    END IF;\n  ELSE\n    PERFORM jse_fail('INVALID_ACTION','Use STATE, UPDATE_ACCOUNT, SET_BALANCE or ADJUST_CASH.',400);\n  END IF;\n\n  SELECT * INTO t FROM teams WHERE id=t.id;\n  SELECT * INTO b FROM brokers WHERE id=t.broker_id;\n  RETURN jsonb_build_object('success',true,'cash',t.cash,'account',jsonb_build_object(\n    'team_number',t.seq,'team_code',t.code,'display_name',t.name,'broker_number',b.id,'broker_code',b.code,\n    'broker_name',b.name,'cash',t.cash,'cash_limit',100000000,'active',t.active,'section',t.section,'members',t.members));\nEND $function$\n\n\nCREATE OR REPLACE FUNCTION public.jse_broker_desk(a jsonb, p jsonb)\n RETURNS jsonb\n LANGUAGE plpgsql\n STABLE\nAS $function$\nDECLARE b brokers%ROWTYPE; cfg event_config%ROWTYPE;\n  -- the Pit Manager records trades for every team; administrators can open the all-teams desk with broker=ALL\n  v_all boolean := a->>'role' = 'PIT_MANAGER' OR (a->>'role' IN ('ADMIN', 'VIEWER') AND upper(coalesce(p->>'broker', '')) = 'ALL');\nBEGIN\n  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'PIT_MANAGER', 'VIEWER');\n  SELECT * INTO cfg FROM event_config WHERE id = 1;\n  IF a->>'role' = 'BROKER' THEN\n    SELECT * INTO b FROM brokers WHERE id = nullif(a->>'broker_id', '')::integer;\n  ELSE\n    SELECT * INTO b FROM brokers WHERE code = CASE WHEN v_all THEN (SELECT min(code) FROM brokers) ELSE upper(trim(coalesce(nullif(p->>'broker', ''), (SELECT min(code) FROM brokers)))) END;\n  END IF;\n  IF NOT FOUND THEN PERFORM jse_fail('BROKER_NOT_FOUND', 'Broker not found.', 404); END IF;\n  RETURN jsonb_build_object('success', true,\n    'broker', CASE WHEN v_all THEN jsonb_build_object('code', 'ALL', 'name', 'All teams') ELSE jsonb_build_object('code', b.code, 'name', b.name, 'contact', b.contact, 'desk', b.desk) END, 'all_teams', v_all,\n    'brokers', CASE WHEN a->>'role' = 'BROKER' THEN NULL ELSE (SELECT jsonb_agg(jsonb_build_object('code', br.code, 'name', br.name, 'broker_number', coalesce(ra.broker_number,br.id), 'roster_code', coalesce(ra.broker_code,br.code), 'roster_name', coalesce(ra.broker_name,br.name)) ORDER BY coalesce(ra.broker_number,br.id)) FROM brokers br LEFT JOIN broker_roster_aliases ra ON ra.internal_broker_id=br.id) END,\n    'rules', jsonb_build_object('brokerage_rate', cfg.brokerage_rate, 'max_order_value', cfg.max_order_value, 'min_order_value', cfg.min_order_value,\n      'stock_lot_size', cfg.stock_lot_size, 'loan_max_principal', cfg.loan_max_principal, 'loan_interest_rate', cfg.loan_interest_rate,\n      'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades),\n    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('code', tm.code, 'seq', right(tm.code,3)::integer, 'name', CASE WHEN sa.account_code='BIG-BULL' THEN sa.display_name ELSE tm.name END, 'special_account', sa.account_code, 'cash_limit', sa.cash_limit, 'broker_number', coalesce(ra.broker_number, tm.broker_id), 'broker_code', coalesce(ra.broker_code, (SELECT code FROM brokers WHERE id=tm.broker_id)), 'broker_name', coalesce(ra.broker_name, (SELECT name FROM brokers WHERE id=tm.broker_id)), 'section', tm.section, 'members', tm.members,\n        'cash', tm.cash, 'free_cash', jse_available_cash(tm.team_id, NULL), 'loan_room', jse_loan_room(tm.team_id),\n        'holdings_value', tm.holdings_value, 'net_worth', tm.net_worth, 'settled_buys', tm.settled_buys, 'settled_sells', tm.settled_sells,\n        'assessment_met', tm.assessment_met, 'loan_liability', tm.loan_liability, 'eligibility_status', tm.eligibility_status,\n        'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'quantity', h.quantity,\n              'available', (SELECT available FROM jse_available_qty(tm.team_id, s.id, NULL)), 'avg_price', round(h.trade_cost / nullif(h.quantity, 0), 2),\n              'price', s.price, 'value', h.quantity * s.price, 'tradable', s.kind = 'EQUITY' OR s.listed_at IS NOT NULL) ORDER BY h.quantity * s.price DESC)\n            FROM holdings h JOIN securities s ON s.id = h.security_id WHERE h.team_id = tm.team_id AND h.quantity > 0), '[]'::jsonb),\n        'open_orders', (SELECT count(*) FROM orders o WHERE o.team_id = tm.team_id AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')))\n        ORDER BY tm.seq)\n      FROM jse_team_metrics tm LEFT JOIN jse_special_accounts sa ON sa.team_id=tm.team_id LEFT JOIN broker_roster_aliases ra ON ra.internal_broker_id=tm.broker_id WHERE (v_all OR tm.broker_id = b.id) AND tm.active), '[]'::jsonb),\n    'instructions', coalesce((SELECT jsonb_agg(jsonb_build_object('id', i.id, 'instruction_no', i.instruction_no, 'team', t.code, 'team_name', t.name,\n        'symbol', s.symbol, 'security', s.name, 'side', i.side, 'quantity', i.quantity, 'note', i.note, 'price_seen', i.price_seen, 'market_price', s.price,\n        'status', i.status, 'created_at', i.created_at, 'handled_at', i.handled_at, 'handled_by', i.handled_by_name, 'decline_reason', i.decline_reason,\n        'order_no', o.order_no, 'order_status', o.status) ORDER BY (i.status = 'OPEN') DESC, i.id DESC)\n      FROM (SELECT * FROM instructions WHERE broker_id = b.id AND (status = 'OPEN' OR created_at > now() - interval '12 hours') ORDER BY id DESC LIMIT 80) i\n      JOIN teams t ON t.id = i.team_id JOIN securities s ON s.id = i.security_id LEFT JOIN orders o ON o.id = i.order_id), '[]'::jsonb),\n    'orders', coalesce((SELECT jsonb_agg(jse_order_json(x.id) ORDER BY x.id DESC) FROM (\n        SELECT o.id FROM orders o WHERE (v_all OR o.broker_id = b.id) ORDER BY o.id DESC LIMIT 60) x), '[]'::jsonb),\n    'counts', (SELECT jsonb_build_object(\n        'teams', (SELECT count(*) FROM teams WHERE broker_id = b.id AND active),\n        'open_instructions', (SELECT count(*) FROM instructions WHERE broker_id = b.id AND status = 'OPEN'),\n        'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),\n        'awaiting_exchange', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),\n        'awaiting_bank', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING')),\n        'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),\n        'rejected', count(*) FILTER (WHERE status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED'))) FROM orders WHERE broker_id = b.id));\nEND $function$\n\n\nCREATE OR REPLACE FUNCTION public.jse_institutional(a jsonb, p jsonb)\n RETURNS jsonb\n LANGUAGE plpgsql\n STABLE\nAS $function$\nDECLARE i institutions%ROWTYPE; cfg event_config%ROWTYPE;\nBEGIN\n  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL', 'VIEWER');\n  SELECT * INTO cfg FROM event_config WHERE id = 1;\n  SELECT * INTO i FROM institutions WHERE id = coalesce(CASE WHEN a->>'role' <> 'INSTITUTIONAL' THEN nullif(p->>'institution_id', '')::integer END,\n                                                        nullif(a->>'institution_id', '')::integer, (SELECT min(id) FROM institutions));\n  IF NOT FOUND THEN PERFORM jse_fail('INSTITUTION_NOT_FOUND', 'Institutional account not found.', 404); END IF;\n  -- a transaction desk: ticket inputs, the current market with institutional prices, and the transaction history.\n  -- Institutions are counterparties only — no cash or holdings restriction and no participant-style portfolio.\n  RETURN jsonb_build_object('success', true,\n    'rules', jsonb_build_object('spread_pct', jse_inst_spread_pct(), 'brokerage_rate', cfg.brokerage_rate, 'stock_lot_size', cfg.stock_lot_size,\n       'min_order_value', cfg.min_order_value, 'max_order_value', cfg.max_order_value,\n       'text', 'When a participant cannot find a counterparty, the institution trades with it: the participant BUYS from the institution at ' ||\n               to_char(jse_inst_spread_pct(), 'FM990.##') || '% ABOVE the prevailing market price and SELLS to it at ' || to_char(jse_inst_spread_pct(), 'FM990.##') ||\n               '% BELOW. The participant pays the normal brokerage (' || jse_rate_text(cfg.brokerage_rate) || '), earned by its broker. The trade goes through the Pit Manager, Exchange and Bank like any order.'),\n    'institutions', (SELECT jsonb_agg(jsonb_build_object('id', x.id, 'code', x.code, 'name', x.name) ORDER BY x.id) FROM institutions x),\n    'institution', jsonb_build_object('id', i.id, 'code', i.code, 'name', i.name),\n    -- counterparty choices: participant team code, name and broker only (no team cash or holdings)\n    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('code', t.code, 'seq', t.seq, 'name', CASE WHEN sa.account_code='BIG-BULL' THEN sa.display_name ELSE t.name END, 'special_account', sa.account_code, 'broker', coalesce(ra.broker_code,b.code), 'broker_number', coalesce(ra.broker_number,b.id), 'broker_name', coalesce(ra.broker_name,b.name)) ORDER BY t.seq) FROM teams t LEFT JOIN brokers b ON b.id = t.broker_id LEFT JOIN jse_special_accounts sa ON sa.team_id=t.id LEFT JOIN broker_roster_aliases ra ON ra.internal_broker_id=t.broker_id WHERE t.active), '[]'::jsonb),\n    'market', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'name', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,\n        'price', s.price, 'change_pct', round(jse_pct(s.price, s.previous_price), 2), 'lot_size', s.lot_size,\n        'participant_buy_price', jse_inst_price(s.price, 'SELL'), 'participant_sell_price', jse_inst_price(s.price, 'BUY'),\n        'last_price_change_at', s.last_price_change_at) ORDER BY s.last_price_change_at DESC NULLS LAST, s.display_order, s.id)\n      FROM securities s WHERE s.active AND (s.kind = 'EQUITY' OR s.listed_at IS NOT NULL)), '[]'::jsonb),\n    'orders', coalesce((SELECT jsonb_agg(jse_order_json(o.id) ORDER BY o.id DESC) FROM (SELECT id FROM orders WHERE institution_id = i.id ORDER BY id DESC LIMIT 80) o), '[]'::jsonb),\n    'stats', (SELECT jsonb_build_object('transactions', count(*), 'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),\n       'pending', count(*) FILTER (WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),\n       'rejected', count(*) FILTER (WHERE status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED')),\n       'participants_bought_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'SELL'), 0),\n       'participants_sold_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'BUY'), 0),\n       'brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0)) FROM orders WHERE institution_id = i.id));\nEND $function$\n\n\nINSERT INTO schema_migrations(version) VALUES ('012_big_bull_special_account');\n";var m12admin="-- BIG BULL special participant controls: Team 1 / Broker 11.\n-- Additive and replayable. Existing balances and trade history are retained.\nINSERT INTO brokers (code,name,active) VALUES ('BROKER-11','SIDDHARTH',true)\nON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, active=true;\n\nCREATE TABLE IF NOT EXISTS public.jse_special_accounts (\n  team_id integer PRIMARY KEY REFERENCES teams(id),\n  account_code text NOT NULL UNIQUE,\n  display_name text NOT NULL,\n  cash_limit numeric(16,2) NOT NULL DEFAULT 100000000 CHECK (cash_limit >= 0),\n  created_at timestamptz NOT NULL DEFAULT now(),\n  updated_at timestamptz NOT NULL DEFAULT now()\n);\nINSERT INTO public.jse_special_accounts(team_id,account_code,display_name,cash_limit)\nSELECT id,'BIG-BULL','BIG BULL',100000000 FROM teams WHERE code='TEAM-001'\nON CONFLICT (account_code) DO UPDATE SET team_id=EXCLUDED.team_id,display_name=EXCLUDED.display_name,\n  cash_limit=EXCLUDED.cash_limit,updated_at=now();\n\nINSERT INTO team_name_pool (name,category,meaning,active)\nSELECT 'BIG BULL','SPECIAL','Special participant; managed separately by the administrator',true\nWHERE NOT EXISTS (SELECT 1 FROM team_name_pool WHERE lower(name)='big bull');\n\nUPDATE teams\nSET name='BIG BULL', broker_id=(SELECT id FROM brokers WHERE code='BROKER-11'), updated_at=now()\nWHERE seq=1 AND code='TEAM-001'\n  AND (name IS DISTINCT FROM 'BIG BULL' OR broker_id IS DISTINCT FROM (SELECT id FROM brokers WHERE code='BROKER-11'));\n\nUPDATE app_users SET display_name='BIG BULL', updated_at=now()\nWHERE role='PARTICIPANT' AND team_id=(SELECT id FROM teams WHERE seq=1 AND code='TEAM-001')\n  AND display_name IS DISTINCT FROM 'BIG BULL';\n\n-- Add sequence and broker identity to the order-desk team payload so dropdowns can show\n-- 1-BIG BULL-11-SIDDHARTH without relying on hard-coded browser values.\nDO $do$\nDECLARE v_def text;\n  v_old text := '''code'', tm.code, ''name'', tm.name, ''section'', tm.section, ''members'', tm.members';\n  v_new text := '''code'', tm.code, ''seq'', right(tm.code,3)::integer, ''name'', CASE WHEN sa.account_code=''BIG-BULL'' THEN sa.display_name ELSE tm.name END, ''special_account'', sa.account_code, ''cash_limit'', sa.cash_limit, ''broker_number'', coalesce(ra.broker_number,tm.broker_id), ''broker_code'', coalesce(ra.broker_code,(SELECT code FROM brokers WHERE id=tm.broker_id)), ''broker_name'', coalesce(ra.broker_name,(SELECT name FROM brokers WHERE id=tm.broker_id)), ''section'', tm.section, ''members'', tm.members';\nBEGIN\n  SELECT pg_get_functiondef('jse_broker_desk(jsonb,jsonb)'::regprocedure) INTO v_def;\n  IF position(v_old IN v_def) > 0 THEN\n    v_def := replace(v_def, v_old, v_new);\n    v_def := replace(v_def, 'FROM jse_team_metrics tm WHERE (v_all OR tm.broker_id = b.id) AND tm.active',\n      'FROM jse_team_metrics tm LEFT JOIN jse_special_accounts sa ON sa.team_id=tm.team_id LEFT JOIN broker_roster_aliases ra ON ra.internal_broker_id=tm.broker_id WHERE (v_all OR tm.broker_id = b.id) AND tm.active');\n  ELSIF position('broker_name' IN v_def) = 0 THEN\n    RAISE EXCEPTION 'Could not patch broker-desk team payload';\n  END IF;\n  v_def := replace(v_def, 'WHERE (v_all OR tm.broker_id = b.id) AND tm.active ORDER BY tm.seq), ''[]''::jsonb)',\n    'WHERE (v_all OR tm.broker_id = b.id) AND tm.active), ''[]''::jsonb)');\n  EXECUTE v_def;\nEND $do$;\n\nCREATE OR REPLACE FUNCTION public.jse_big_bull_admin(a jsonb, p jsonb)\nRETURNS jsonb LANGUAGE plpgsql AS $$\nDECLARE\n  v_action text := upper(coalesce(nullif(p->>'action',''),'STATE'));\n  t teams%ROWTYPE;\n  b brokers%ROWTYPE;\n  v_amount numeric(16,2);\n  v_delta numeric(16,2);\n  v_after numeric(16,2);\n  v_reason text;\n  v_name text;\n  v_broker_code text;\n  v_broker_id integer;\n  v_section text;\n  v_members text;\n  v_active boolean;\n  v_cash_limit numeric(16,2);\nBEGIN\n  PERFORM jse_require_role(a, 'ADMIN');\n  SELECT * INTO t FROM teams WHERE seq=1 AND code='TEAM-001' FOR UPDATE;\n  IF NOT FOUND THEN PERFORM jse_fail('BIG_BULL_NOT_FOUND','Team 1 special participant was not found.',404); END IF;\n  SELECT * INTO b FROM brokers WHERE id=t.broker_id;\n  SELECT cash_limit INTO v_cash_limit FROM public.jse_special_accounts WHERE team_id=t.id AND account_code='BIG-BULL';\n  v_cash_limit := coalesce(v_cash_limit,100000000);\n\n  IF v_action = 'STATE' THEN\n    RETURN jsonb_build_object('success',true,'account',jsonb_build_object(\n      'team_number',t.seq,'team_code',t.code,'display_name',t.name,'broker_number',b.id,'broker_code',b.code,\n      'broker_name',b.name,'cash',t.cash,'cash_limit',v_cash_limit,'active',t.active,'section',t.section,'members',t.members));\n  END IF;\n\n  PERFORM jse_require_admin_password(a,p);\n  v_reason := left(trim(coalesce(p->>'reason','')),300);\n  IF v_reason='' THEN PERFORM jse_fail('REASON_REQUIRED','Enter a reason for the BIG BULL change.',400); END IF;\n\n  IF v_action = 'UPDATE_ACCOUNT' THEN\n    v_name := left(trim(coalesce(p->>'display_name','')),120);\n    v_broker_code := upper(trim(coalesce(p->>'broker_code','')));\n    v_section := left(trim(coalesce(p->>'section','')),120);\n    v_members := left(trim(coalesce(p->>'members','')),1000);\n    BEGIN v_active := (p->>'active')::boolean; EXCEPTION WHEN others THEN v_active := NULL; END;\n    IF v_name='' THEN PERFORM jse_fail('NAME_REQUIRED','Enter the BIG BULL display name.',400); END IF;\n    IF v_active IS NULL THEN PERFORM jse_fail('INVALID_ACTIVE','Choose an account status.',400); END IF;\n    SELECT id INTO v_broker_id FROM brokers WHERE code=v_broker_code AND active;\n    IF v_broker_id IS NULL THEN PERFORM jse_fail('BROKER_NOT_FOUND','Choose an existing active broker.',400); END IF;\n    IF EXISTS (SELECT 1 FROM teams WHERE id<>t.id AND lower(name)=lower(v_name)) THEN\n      PERFORM jse_fail('DUPLICATE_TEAM_NAME','That display name is already used by another team.',409);\n    END IF;\n    UPDATE teams SET name=v_name, broker_id=v_broker_id, section=nullif(v_section,''), members=nullif(v_members,''),\n      active=v_active, updated_at=now() WHERE id=t.id;\n    UPDATE app_users SET display_name=v_name, active=v_active, updated_at=now()\n      WHERE role='PARTICIPANT' AND team_id=t.id;\n    UPDATE public.jse_special_accounts SET display_name=v_name, updated_at=now() WHERE team_id=t.id;\n    PERFORM jse_audit(a,'BIG_BULL_ACCOUNT_UPDATED','team',t.code,t.id,NULL,\n      jsonb_build_object('name',t.name,'broker_code',b.code,'section',t.section,'members',t.members,'active',t.active),\n      jsonb_build_object('name',v_name,'broker_code',v_broker_code,'section',nullif(v_section,''),'members',nullif(v_members,''),'active',v_active),\n      jsonb_build_object('reason',v_reason));\n  ELSIF v_action IN ('SET_BALANCE','ADJUST_CASH') THEN\n    BEGIN v_amount := nullif(trim(p->>'amount'),'')::numeric; EXCEPTION WHEN others THEN v_amount := NULL; END;\n    IF v_amount IS NULL OR (v_amount<0 AND v_action='SET_BALANCE') THEN\n      PERFORM jse_fail('INVALID_AMOUNT','Enter a balance from ₹0 to ₹1 crore.',400);\n    END IF;\n    IF v_action='ADJUST_CASH' AND v_amount=0 THEN PERFORM jse_fail('INVALID_AMOUNT','Enter a non-zero cash adjustment.',400); END IF;\n    v_after := CASE WHEN v_action='SET_BALANCE' THEN v_amount ELSE t.cash+v_amount END;\n    IF v_after<0 OR v_after>v_cash_limit THEN\n      PERFORM jse_fail('CASH_LIMIT','BIG BULL cash must stay between ₹0 and ₹1 crore.',400);\n    END IF;\n    v_delta := v_after-t.cash;\n    IF v_delta<>0 THEN\n      UPDATE teams SET cash=v_after, updated_at=now() WHERE id=t.id;\n      INSERT INTO cash_ledger(team_id,entry_type,debit,credit,balance_after,note,actor_id,actor_name)\n      VALUES(t.id,'ADJUSTMENT',greatest(-v_delta,0),greatest(v_delta,0),v_after,\n        'BIG BULL admin '||lower(v_action)||': '||v_reason,nullif(a->>'id','')::integer,jse_actor_name(a));\n      PERFORM jse_audit(a,CASE WHEN v_action='SET_BALANCE' THEN 'BIG_BULL_BALANCE_SET' ELSE 'BIG_BULL_CASH_ADJUSTED' END,\n        'team',t.code,t.id,NULL,jsonb_build_object('cash',t.cash),jsonb_build_object('cash',v_after),\n        jsonb_build_object('reason',v_reason,'amount',v_amount,'action',v_action));\n    END IF;\n  ELSE\n    PERFORM jse_fail('INVALID_ACTION','Use STATE, UPDATE_ACCOUNT, SET_BALANCE or ADJUST_CASH.',400);\n  END IF;\n\n  SELECT * INTO t FROM teams WHERE id=t.id;\n  SELECT * INTO b FROM brokers WHERE id=t.broker_id;\n  RETURN jsonb_build_object('success',true,'cash',t.cash,'account',jsonb_build_object(\n    'team_number',t.seq,'team_code',t.code,'display_name',t.name,'broker_number',b.id,'broker_code',b.code,\n    'broker_name',b.name,'cash',t.cash,'cash_limit',v_cash_limit,'active',t.active,'section',t.section,'members',t.members));\nEND $$;\n\nINSERT INTO schema_migrations(version) VALUES ('012_big_bull_admin');\n\nINSERT INTO broker_roster_aliases(broker_number,broker_code,broker_name,internal_broker_id)\nSELECT 11,'SIDDHARTH','SIDDHARTH',id FROM brokers WHERE code='BROKER-11'\nON CONFLICT (broker_number) DO UPDATE SET broker_code=EXCLUDED.broker_code, broker_name=EXCLUDED.broker_name, internal_broker_id=EXCLUDED.internal_broker_id;\n";var m13sql="-- One-time import of the official Dalal Street roster (73 teams) plus BIG BULL as Team 1.\n-- Existing financial histories are preserved; only roster identity/assignment and active flags change.\nINSERT INTO broker_roster_aliases(broker_number,broker_code,broker_name,internal_broker_id)\nSELECT 11,'SIDDHARTH','SIDDHARTH',id FROM brokers WHERE code='BROKER-11'\nON CONFLICT (broker_number) DO UPDATE SET broker_code=EXCLUDED.broker_code,\n broker_name=EXCLUDED.broker_name,internal_broker_id=EXCLUDED.internal_broker_id;\n\nWITH raw AS (\n SELECT line, ord FROM unnest(string_to_array($roster$Apala|Vidura|K + K|Krishnangshu Sarkar / Gourav V Rao\nDignaga|Vidura|D + A|Karanam Seebivamsikrishna / Shreya C\nKanada|Vidura|O + O|Juhi Moudekar / Sidharrth Rao\nKapila|Vidura|I + I|Swaroop Rao T / Rohit B\nKhana|Vidura|J + J|Yuvaraj Suresh Bangera / Neeraj Kamath\nMatanga|Vidura|O + O|Shraddha Yadav / Chinmay B Arya\nVagbhata|Vidura|C + M|Manisha Raj / Suhas vardhan\nArtha|Yash|M + D|Likitesh / Lakshna. S\nDhriti|Yash|I + I|Jothish N / S S S Surya\nKosh|Yash|L + L|Bhoomika Venkatachala Bhat / Mitali Basavaraj Devagi\nMangala|Yash|F + F|Vishal Bhaskaran / A Tarakeshwar\nNishtha|Yash|E + E|Thamizh Selvan E / Sri viswanath\nNyaya|Yash|D + D|LIJIN LAKSHMANAN / Albin Sanjay P\nRajat|Yash|P + P|Greeshma R / Disha M\nValabhi|Yash|F + F|Aishwarya B M / Poorvitha\nKoshya|Ganita|O + O|Drushya A / Supreeth Shekar S\nMadhava|Ganita|N + N|Ajay M / PRANAV S R\nPanini|Ganita|L + L|Arundhathy V Nambi / Aakash Darsan P M\nSangita|Ganita|P + P|Pasupathi R / R Megha\nSutra|Ganita|M + M|Joshiya J / Indhu Shree Raj Kumar\nVirahanka|Ganita|N + M|Mohammed Riyaz / Arshiya Kausar\nYukti|Ganita|H + J|Koushik Gali / Kumar Vayur\nAbhyasa|Prajna|R + R|Tanish Milind Salunkhe / John Tophy\nGhosha|Prajna|C + C|SHASWAT AGRAWAL / Mohammed Haseeb Ahmed\nJaya|Prajna|K + K|Shreya j hegde / Nidhi shetty\nJya|Prajna|N + N|Rion Dsouza / Suraj\nShree|Prajna|N + N|Rohan J / Abishek R\nUtsaha|Prajna|M + M|K PRANAVI / DARUNIKA R\nViveka|Prajna|M + M|Aaditya Mehra / Madiya Mehraj\nBhamaha|Madhava|K + K|Muhammad Irfan / Kumaraguru\nKuttaka|Madhava|P + P|Kunj Punith Kumar Maru / Raunak Bajaj\nLopamudra|Madhava|K + B|Varun Nayak / Satvik B Bellad\nMedha|Madhava|D + D|Pulagam hasini / Anusha dumpala\nNirukta|Madhava|Q + Q|Hem b davey / Ramcharan\nNivesh|Madhava|A + A|K S Monish Kumar / Guruprasad V\nVasubandhu|Madhava|K + L|Bhoomika GS / M.Madhu vandhan\nVyaya|Madhava|L + L|Yoga Shree R R / Janani Suresh\nAvvaiyar|Amrit|P + P|Anusha V Bhat / VIJAY ANANTH J\nDhan|Amrit|D + D|Abhishek Nagori / Advaith R\nHalayudha|Amrit|G + G|Lithin H Raju / Tarun P\nMaitreyi|Amrit|P + P|Mohammad Saif / Anirudh Rao\nMithila|Amrit|D + D|Sourabh Toppo / Ramkrishna Kamlakar Rao\nNilakantha|Amrit|L + L|Sri Seshasaini G / Sadhana B\nTanka|Amrit|J + J|Nichhanametla Harshita / Prachi kashyap\nCharaka|Arohan|J + J|Kartik Revankar / Payal manna\nKautilya|Arohan|F + F|Mohammed Farhan Ulla / Aviral Singh\nKriya|Arohan|K + K|Soham Organtiwar / Shikhar Sampann\nLabhya|Arohan|N + G|Siddannagari Reddeppa Reddy Nandini / Tallapalle Sai Vyshnavi\nMudra|Arohan|H + H|Mohammed raza / Ashit singla\nNidhi|Arohan|F + F|Prajwal M Bharadwaj / Samyak Shrivastav\nSridhara|Arohan|G + G|Almeera S / Sugumaran\nAkshaya|Suvarna|L + L|Devansh Srivastava / Shreya Shukla\nAryabhata|Suvarna|I + O|Swaroop mahadev pujari / Gayana N\nAryadeva|Suvarna|B + B|Aashish Reddy / Kailesh b\nDandin|Suvarna|Q + I|Manjunath Gaddad / Midhat Rahman\nSushruta|Suvarna|D + D|Arsha.P.R / Harini S M\nTantra|Suvarna|O + O|Mohammed Samadul Zain S / Shivam Periwal\nVastu|Suvarna|D + D|Shraddha Dey / Pamela Pramanick\nChandas|Kalidasa|M + M|Mohammed Riyaz K / Manisha Kumari\nKamandaka|Kalidasa|M + Q|Srishti sinha / Ashmeet kaur\nMunjala|Kalidasa|A + A|Lokesh P / MALLAMMA BASAVARAJ NITALI\nSankalpa|Kalidasa|F + M|DAKSHATA C A / SURYAPRAKASH V\nShilpa|Kalidasa|L + L|Azwath Roshan / Rithika B\nVidura|Kalidasa|C + C|Tejas Thimmaiah / Tushar Biswas\nVriddhi|Kalidasa|J + J|Kiran prasaath / Balaji T\nJaimini|Vikas|N + N|Astha Jain / K M Prajwal\nLabh|Vikas|L + L|Aditya raj / Abhijit Chakraborty\nNeeti|Vikas|B + B|SESHATHRI BALAN G / Sasi Naga Kiran Godavarthi\nNeetiya|Vikas|L + L|RAHUL TL / Shriharan RK T\nPingala|Vikas|E + E|Praveen / Rahul Kunar\nPramana|Vikas|K + K|Tanushka Rajesh Chugh / Prince Raj\nRupa|Vikas|F + J|Ashutosh Padhy / Swayam Sahu\nShiksha|Vikas|M + M|Samhita hegde / D ABHIRAMA SHASTRY$roster$, E'\\n')) WITH ORDINALITY AS x(line,ord)\n WHERE btrim(line)<>''\n), roster AS (\n SELECT ord::integer+1 AS team_no, split_part(line,'|',1) AS name,\n  split_part(line,'|',2) AS broker_code, split_part(line,'|',3) AS section,\n  split_part(line,'|',4) AS members FROM raw\n)\nINSERT INTO team_name_pool(name,category,meaning,active)\nSELECT r.name,'ROSTER','Official Dalal Street 2026 participant team',true\nFROM roster r WHERE NOT EXISTS (SELECT 1 FROM team_name_pool p WHERE lower(p.name)=lower(r.name));\n\nUPDATE teams SET name='__DALAL_ROSTER_TMP__' || seq, updated_at=now() WHERE seq BETWEEN 2 AND 100;\n\nWITH raw AS (\n SELECT line, ord FROM unnest(string_to_array($roster$Apala|Vidura|K + K|Krishnangshu Sarkar / Gourav V Rao\nDignaga|Vidura|D + A|Karanam Seebivamsikrishna / Shreya C\nKanada|Vidura|O + O|Juhi Moudekar / Sidharrth Rao\nKapila|Vidura|I + I|Swaroop Rao T / Rohit B\nKhana|Vidura|J + J|Yuvaraj Suresh Bangera / Neeraj Kamath\nMatanga|Vidura|O + O|Shraddha Yadav / Chinmay B Arya\nVagbhata|Vidura|C + M|Manisha Raj / Suhas vardhan\nArtha|Yash|M + D|Likitesh / Lakshna. S\nDhriti|Yash|I + I|Jothish N / S S S Surya\nKosh|Yash|L + L|Bhoomika Venkatachala Bhat / Mitali Basavaraj Devagi\nMangala|Yash|F + F|Vishal Bhaskaran / A Tarakeshwar\nNishtha|Yash|E + E|Thamizh Selvan E / Sri viswanath\nNyaya|Yash|D + D|LIJIN LAKSHMANAN / Albin Sanjay P\nRajat|Yash|P + P|Greeshma R / Disha M\nValabhi|Yash|F + F|Aishwarya B M / Poorvitha\nKoshya|Ganita|O + O|Drushya A / Supreeth Shekar S\nMadhava|Ganita|N + N|Ajay M / PRANAV S R\nPanini|Ganita|L + L|Arundhathy V Nambi / Aakash Darsan P M\nSangita|Ganita|P + P|Pasupathi R / R Megha\nSutra|Ganita|M + M|Joshiya J / Indhu Shree Raj Kumar\nVirahanka|Ganita|N + M|Mohammed Riyaz / Arshiya Kausar\nYukti|Ganita|H + J|Koushik Gali / Kumar Vayur\nAbhyasa|Prajna|R + R|Tanish Milind Salunkhe / John Tophy\nGhosha|Prajna|C + C|SHASWAT AGRAWAL / Mohammed Haseeb Ahmed\nJaya|Prajna|K + K|Shreya j hegde / Nidhi shetty\nJya|Prajna|N + N|Rion Dsouza / Suraj\nShree|Prajna|N + N|Rohan J / Abishek R\nUtsaha|Prajna|M + M|K PRANAVI / DARUNIKA R\nViveka|Prajna|M + M|Aaditya Mehra / Madiya Mehraj\nBhamaha|Madhava|K + K|Muhammad Irfan / Kumaraguru\nKuttaka|Madhava|P + P|Kunj Punith Kumar Maru / Raunak Bajaj\nLopamudra|Madhava|K + B|Varun Nayak / Satvik B Bellad\nMedha|Madhava|D + D|Pulagam hasini / Anusha dumpala\nNirukta|Madhava|Q + Q|Hem b davey / Ramcharan\nNivesh|Madhava|A + A|K S Monish Kumar / Guruprasad V\nVasubandhu|Madhava|K + L|Bhoomika GS / M.Madhu vandhan\nVyaya|Madhava|L + L|Yoga Shree R R / Janani Suresh\nAvvaiyar|Amrit|P + P|Anusha V Bhat / VIJAY ANANTH J\nDhan|Amrit|D + D|Abhishek Nagori / Advaith R\nHalayudha|Amrit|G + G|Lithin H Raju / Tarun P\nMaitreyi|Amrit|P + P|Mohammad Saif / Anirudh Rao\nMithila|Amrit|D + D|Sourabh Toppo / Ramkrishna Kamlakar Rao\nNilakantha|Amrit|L + L|Sri Seshasaini G / Sadhana B\nTanka|Amrit|J + J|Nichhanametla Harshita / Prachi kashyap\nCharaka|Arohan|J + J|Kartik Revankar / Payal manna\nKautilya|Arohan|F + F|Mohammed Farhan Ulla / Aviral Singh\nKriya|Arohan|K + K|Soham Organtiwar / Shikhar Sampann\nLabhya|Arohan|N + G|Siddannagari Reddeppa Reddy Nandini / Tallapalle Sai Vyshnavi\nMudra|Arohan|H + H|Mohammed raza / Ashit singla\nNidhi|Arohan|F + F|Prajwal M Bharadwaj / Samyak Shrivastav\nSridhara|Arohan|G + G|Almeera S / Sugumaran\nAkshaya|Suvarna|L + L|Devansh Srivastava / Shreya Shukla\nAryabhata|Suvarna|I + O|Swaroop mahadev pujari / Gayana N\nAryadeva|Suvarna|B + B|Aashish Reddy / Kailesh b\nDandin|Suvarna|Q + I|Manjunath Gaddad / Midhat Rahman\nSushruta|Suvarna|D + D|Arsha.P.R / Harini S M\nTantra|Suvarna|O + O|Mohammed Samadul Zain S / Shivam Periwal\nVastu|Suvarna|D + D|Shraddha Dey / Pamela Pramanick\nChandas|Kalidasa|M + M|Mohammed Riyaz K / Manisha Kumari\nKamandaka|Kalidasa|M + Q|Srishti sinha / Ashmeet kaur\nMunjala|Kalidasa|A + A|Lokesh P / MALLAMMA BASAVARAJ NITALI\nSankalpa|Kalidasa|F + M|DAKSHATA C A / SURYAPRAKASH V\nShilpa|Kalidasa|L + L|Azwath Roshan / Rithika B\nVidura|Kalidasa|C + C|Tejas Thimmaiah / Tushar Biswas\nVriddhi|Kalidasa|J + J|Kiran prasaath / Balaji T\nJaimini|Vikas|N + N|Astha Jain / K M Prajwal\nLabh|Vikas|L + L|Aditya raj / Abhijit Chakraborty\nNeeti|Vikas|B + B|SESHATHRI BALAN G / Sasi Naga Kiran Godavarthi\nNeetiya|Vikas|L + L|RAHUL TL / Shriharan RK T\nPingala|Vikas|E + E|Praveen / Rahul Kunar\nPramana|Vikas|K + K|Tanushka Rajesh Chugh / Prince Raj\nRupa|Vikas|F + J|Ashutosh Padhy / Swayam Sahu\nShiksha|Vikas|M + M|Samhita hegde / D ABHIRAMA SHASTRY$roster$, E'\\n')) WITH ORDINALITY AS x(line,ord)\n WHERE btrim(line)<>''\n), roster AS (\n SELECT ord::integer+1 AS team_no, split_part(line,'|',1) AS name,\n  split_part(line,'|',2) AS broker_code, split_part(line,'|',3) AS section,\n  split_part(line,'|',4) AS members FROM raw\n)\nUPDATE teams t SET name=r.name, section=r.section, members=r.members,\n broker_id=a.internal_broker_id, active=true, updated_at=now()\nFROM roster r JOIN broker_roster_aliases a ON lower(a.broker_code)=lower(r.broker_code)\nWHERE t.seq=r.team_no AND t.seq BETWEEN 2 AND 74;\n\nUPDATE teams SET name='INACTIVE-PLACEHOLDER-' || seq, active=false, updated_at=now() WHERE seq BETWEEN 75 AND 100;\nUPDATE teams SET name='BIG BULL', active=true, broker_id=(SELECT id FROM brokers WHERE code='BROKER-11'), updated_at=now()\nWHERE seq=1 AND code='TEAM-001';\nUPDATE app_users u SET display_name=t.name, active=t.active, updated_at=now()\nFROM teams t WHERE u.team_id=t.id AND u.role='PARTICIPANT';\nINSERT INTO audit_log(actor_username,actor_role,action,entity,entity_id,details)\nVALUES ('roster-migration','ADMIN','OFFICIAL_DALAL_ROSTER_IMPORTED','roster',NULL,\n jsonb_build_object('official_teams',73,'special_participant','1-BIG BULL-11-SIDDHARTH',\n 'broker_count',11,'active_team_numbers','1-74','inactive_placeholder_numbers','75-100',\n 'financial_history_reset',false,'source','Dalal_Street_Teams(6).xlsx + Dalal_Street_Brokers(5).xlsx'));\nINSERT INTO schema_migrations(version) VALUES ('013_dalal_roster');\n";var m14sql="-- 014: Correct BIG BULL cash ceiling, daily news price cap, and final cash eligibility.\n-- Automated price changer configuration/logic is intentionally unchanged.\n\nALTER TABLE public.jse_special_accounts\n  ALTER COLUMN cash_limit SET DEFAULT 10000000;\nUPDATE public.jse_special_accounts\n  SET cash_limit = 10000000, updated_at = now()\n  WHERE account_code = 'BIG-BULL';\nUPDATE public.event_config SET cash_rule_limit = 100000 WHERE id = 1;\n\nCREATE OR REPLACE FUNCTION public.jse_special_cash_limit_guard()\nRETURNS trigger LANGUAGE plpgsql AS $function$\nDECLARE v_limit numeric;\nBEGIN\n  SELECT cash_limit INTO v_limit FROM public.jse_special_accounts WHERE team_id = NEW.id;\n  IF FOUND AND NEW.cash > v_limit THEN\n    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='BIG BULL cash limit is ₹1,00,00,000.00; this balance change is blocked.';\n  END IF;\n  RETURN NEW;\nEND $function$;\n\n-- Keep the admin function's fallback aligned with the stored ₹1 crore limit.\nDO $do$\nDECLARE v_def text;\nBEGIN\n  SELECT pg_get_functiondef('public.jse_big_bull_admin(jsonb,jsonb)'::regprocedure) INTO v_def;\n  IF position('coalesce(v_cash_limit,100000000)' IN v_def) > 0 THEN\n    v_def := replace(v_def, 'coalesce(v_cash_limit,100000000)', 'coalesce(v_cash_limit,10000000)');\n    EXECUTE v_def;\n  END IF;\nEND $do$;\n\n-- Only the Market News mood bands use the expanded +/-15% range.\nCREATE OR REPLACE FUNCTION public.jse_mood_band(p_mood text)\nRETURNS numeric[] LANGUAGE sql IMMUTABLE AS $function$\n  SELECT CASE upper(replace(trim(p_mood), ' ', '_'))\n    WHEN 'VERY_SEVERE'    THEN ARRAY[-15.00, -7.50]\n    WHEN 'SEVERE'         THEN ARRAY[-7.49, -5.00]\n    WHEN 'NEGATIVE'       THEN ARRAY[-4.99, -1.00]\n    WHEN 'NORMAL'         THEN ARRAY[-0.99, 0.99]\n    WHEN 'POSITIVE'       THEN ARRAY[1.00, 4.99]\n    WHEN 'VERY_POSITIVE'  THEN ARRAY[5.00, 7.49]\n    WHEN 'SUPER_POSITIVE' THEN ARRAY[7.50, 15.00]\n  END::numeric[]\n$function$;\n\n-- A security's news-driven price is constrained to +/-15% of its first active news\n-- baseline for the current India-local day. The automated price changer is not changed.\nCREATE OR REPLACE FUNCTION public.jse_market_news(a jsonb, p jsonb)\nRETURNS jsonb LANGUAGE plpgsql AS $function$\nDECLARE\n  cfg event_config%ROWTYPE; v_status text; s securities%ROWTYPE;\n  v_mood text := upper(replace(trim(coalesce(p->>'mood', p->>'severity', '')), ' ', '_'));\n  v_headline text := nullif(left(trim(coalesce(p->>'headline', '')), 240), '');\n  v_band numeric[]; v_pct numeric; v_new numeric; v_lo numeric; v_hi numeric;\n  v_day_start timestamptz; v_day_base numeric; v_daily_cap constant numeric := 15;\nBEGIN\n  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL');\n  SELECT * INTO cfg FROM event_config WHERE id = 1;\n  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;\n  IF v_status NOT IN ('NOT_STARTED', 'LIVE', 'SETTLEMENT_ONLY') THEN\n    PERFORM jse_fail('EVENT_CLOSED', 'Market News is not allowed after the market has closed.', 409);\n  END IF;\n  v_band := jse_mood_band(v_mood);\n  IF v_band IS NULL THEN PERFORM jse_fail('INVALID_MOOD', 'Choose a news severity.', 400); END IF;\n  SELECT * INTO s FROM securities WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')));\n  IF NOT FOUND THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a company.', 404); END IF;\n  IF s.kind = 'IPO' AND s.listed_at IS NULL THEN\n    PERFORM jse_fail('IPO_NOT_LISTED', s.symbol || ' is still in the IPO stage; Market News applies once it lists.', 409);\n  END IF;\n  PERFORM pg_advisory_xact_lock(hashtextextended('jse-news:' || s.id, 0));\n  SELECT * INTO s FROM securities WHERE id = s.id FOR UPDATE;\n\n  v_day_start := date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';\n  SELECT previous_price INTO v_day_base\n  FROM market_news\n  WHERE security_id = s.id\n    AND created_at >= v_day_start\n    AND created_at < v_day_start + interval '1 day'\n    AND reversed_at IS NULL\n  ORDER BY created_at, id\n  LIMIT 1;\n  v_day_base := coalesce(v_day_base, s.price);\n\n  v_pct := round((v_band[1] + random() * (v_band[2] - v_band[1]))::numeric, 2);\n  v_new := jse_round_tick(s.price * (1 + v_pct / 100), cfg.price_tick);\n  v_lo := ceil(v_day_base * (1 - v_daily_cap / 100) / cfg.price_tick) * cfg.price_tick;\n  v_hi := floor(v_day_base * (1 + v_daily_cap / 100) / cfg.price_tick) * cfg.price_tick;\n  v_new := greatest(v_lo, least(v_hi, v_new));\n  IF v_new <= 0 THEN v_new := cfg.price_tick; END IF;\n  RETURN jse__apply_news_price(a, s, v_mood, v_pct, v_new,\n    coalesce(v_headline, initcap(replace(v_mood, '_', ' ')) || ' news on ' || s.name));\nEND $function$;\n\nINSERT INTO schema_migrations(version) VALUES ('014_big_bull_news_assessment');\n";var m21sql="-- 021: Lock the official staging baseline and restore it on every event reset.\n-- IPO listing_price intentionally remains editable for the new opening price supplied by Event Admin.\n-- The allotment price/amount and all base reference prices are restored from this frozen snapshot.\n\nUPDATE public.broker_roster_aliases\nSET broker_name='SUGADEV'\nWHERE broker_number=6 AND lower(broker_code)='arohan';\n\nUPDATE public.brokers\nSET name='SUGADEV'\nWHERE id=(SELECT internal_broker_id FROM public.broker_roster_aliases WHERE broker_number=6 AND lower(broker_code)='arohan')\n  AND name IS DISTINCT FROM 'SUGADEV';\n\nUPDATE public.app_users\nSET display_name='SUGADEV', updated_at=now()\nWHERE role='BROKER'\n  AND broker_id=(SELECT internal_broker_id FROM public.broker_roster_aliases WHERE broker_number=6 AND lower(broker_code)='arohan')\n  AND display_name IS DISTINCT FROM 'SUGADEV';\n\n-- Titan's current staging price becomes its new base price.\nUPDATE public.securities\nSET base_price=price, previous_price=price, index_base_price=price, updated_at=now()\nWHERE symbol='TITAN' AND kind='EQUITY' AND active;\n\nCREATE TABLE IF NOT EXISTS public.jse_locked_baseline (\n  id smallint PRIMARY KEY CHECK (id=1),\n  version integer NOT NULL DEFAULT 1,\n  snapshot jsonb NOT NULL,\n  locked_at timestamptz NOT NULL DEFAULT now(),\n  locked_by text NOT NULL DEFAULT 'STAGING BASELINE'\n);\n\nINSERT INTO public.jse_locked_baseline(id,version,snapshot,locked_by)\nVALUES (\n  1,1,\n  jsonb_build_object(\n    'teams', (SELECT coalesce(jsonb_agg(jsonb_build_object(\n      'id',id,'seq',seq,'code',code,'name',name,'section',section,'members',members,\n      'broker_id',broker_id,'active',active\n    ) ORDER BY seq),'[]'::jsonb) FROM public.teams),\n    'brokers', (SELECT coalesce(jsonb_agg(jsonb_build_object(\n      'id',id,'code',code,'name',name,'active',active,'contact',contact,'desk',desk\n    ) ORDER BY id),'[]'::jsonb) FROM public.brokers),\n    'broker_roster_aliases', (SELECT coalesce(jsonb_agg(jsonb_build_object(\n      'broker_number',broker_number,'broker_code',broker_code,'broker_name',broker_name,\n      'internal_broker_id',internal_broker_id\n    ) ORDER BY broker_number),'[]'::jsonb) FROM public.broker_roster_aliases),\n    'securities', (SELECT coalesce(jsonb_agg(jsonb_build_object(\n      'id',id,'kind',kind,'symbol',symbol,'name',name,'sector',sector,\n      'base_price',base_price,'lot_size',lot_size,'display_order',display_order,'active',active,\n      'ipo_code',ipo_code,'ipo_shares_offered',ipo_shares_offered,'ipo_lot_size',ipo_lot_size\n    ) ORDER BY id),'[]'::jsonb) FROM public.securities),\n    'ipo_allotments', (SELECT coalesce(jsonb_agg(jsonb_build_object(\n      'team_id',team_id,'security_id',security_id,'lots',lots,'quantity',quantity,\n      'price',price,'amount',amount,'batch_id',batch_id\n    ) ORDER BY id),'[]'::jsonb) FROM public.ipo_allotments WHERE reversed_at IS NULL AND quantity > 0)\n  ),\n  'LOCKED OFFICIAL ROSTER + INITIAL PRICES + IPO ALLOTMENTS'\n)\nON CONFLICT (id) DO NOTHING;\n\nCREATE OR REPLACE FUNCTION public.jse_locked_baseline_immutable()\nRETURNS trigger LANGUAGE plpgsql AS $function$\nBEGIN\n  RAISE EXCEPTION 'The staging baseline is locked. Request an explicit baseline update instead.';\nEND\n$function$;\n\nDROP TRIGGER IF EXISTS jse_locked_baseline_no_mutation ON public.jse_locked_baseline;\nCREATE TRIGGER jse_locked_baseline_no_mutation\nBEFORE UPDATE OR DELETE ON public.jse_locked_baseline\nFOR EACH ROW EXECUTE FUNCTION public.jse_locked_baseline_immutable();\n\nCREATE OR REPLACE FUNCTION public.jse_reset_event(a jsonb, p jsonb)\n RETURNS jsonb\n LANGUAGE plpgsql\nAS $function$\nDECLARE\n  cfg event_config%ROWTYPE; ev event_control%ROWTYPE;\n  v_base jsonb; v_allots jsonb; r jsonb; al ipo_allotments%ROWTYPE; v_n integer := 0; v_archived integer;\nBEGIN\n  PERFORM jse_require_role(a, 'ADMIN');\n  IF coalesce(p->>'confirm', '') <> 'RESET' THEN PERFORM jse_fail('CONFIRM_REQUIRED', 'Type RESET to confirm.', 400); END IF;\n  PERFORM jse_require_admin_password(a, p);\n  SELECT * INTO cfg FROM event_config WHERE id = 1;\n  SELECT * INTO ev FROM event_control WHERE id = 1 FOR UPDATE;\n  IF ev.status IN ('LIVE', 'SETTLEMENT_ONLY') THEN\n    PERFORM jse_fail('EVENT_RUNNING', 'Close the market before resetting (current status: ' || replace(ev.status, '_', ' ') || ').', 409);\n  END IF;\n  LOCK TABLE orders, settlements, holdings, teams, securities, loans, brokers, broker_roster_aliases IN EXCLUSIVE MODE;\n  SELECT snapshot INTO v_base FROM public.jse_locked_baseline WHERE id = 1;\n  IF v_base IS NULL THEN PERFORM jse_fail('BASELINE_MISSING', 'The locked starting baseline is missing; reset was blocked.', 500); END IF;\n  v_allots := coalesce(v_base->'ipo_allotments', '[]'::jsonb);\n\n  PERFORM set_config('jse.maintenance', 'on', true);\n  INSERT INTO audit_log_archive SELECT al2.*, now(), ev.reset_count + 1 FROM audit_log al2;\n  GET DIAGNOSTICS v_archived = ROW_COUNT;\n  TRUNCATE action_journal, broker_commissions, cash_ledger, institution_ledger, loan_transactions, risk_events, price_history,\n           market_news, order_events, settlements, holdings, institutional_holdings, ipo_allotments, trading_slips, instructions, orders, audit_log\n           RESTART IDENTITY;\n  PERFORM set_config('jse.maintenance', 'off', true);\n\n  -- Restore locked roster and broker mappings. Cash/P&L is reset separately below.\n  UPDATE teams t SET name = x.name, section = x.section, members = x.members,\n      broker_id = x.broker_id, active = x.active, updated_at = now()\n  FROM jsonb_to_recordset(v_base->'teams') AS x(id integer, name text, section text, members text, broker_id integer, active boolean)\n  WHERE t.id = x.id;\n  UPDATE brokers b SET name = x.name, active = x.active, contact = x.contact, desk = x.desk\n  FROM jsonb_to_recordset(v_base->'brokers') AS x(id integer, name text, active boolean, contact text, desk text)\n  WHERE b.id = x.id;\n  DELETE FROM broker_roster_aliases;\n  INSERT INTO broker_roster_aliases(broker_number, broker_code, broker_name, internal_broker_id)\n  SELECT x.broker_number, x.broker_code, x.broker_name, x.internal_broker_id\n  FROM jsonb_to_recordset(v_base->'broker_roster_aliases') AS x(\n    broker_number integer, broker_code text, broker_name text, internal_broker_id integer\n  );\n  -- Restore company identities/base values; retain listing_price for the next START.\n  UPDATE securities s SET kind = x.kind, symbol = x.symbol, name = x.name, sector = x.sector,\n      base_price = x.base_price, lot_size = x.lot_size, display_order = x.display_order,\n      active = x.active, ipo_code = x.ipo_code, ipo_shares_offered = x.ipo_shares_offered,\n      ipo_lot_size = x.ipo_lot_size, updated_at = now()\n  FROM jsonb_to_recordset(v_base->'securities') AS x(\n    id integer, kind text, symbol text, name text, sector text, base_price numeric,\n    lot_size integer, display_order integer, active boolean, ipo_code text,\n    ipo_shares_offered integer, ipo_lot_size integer\n  )\n  WHERE s.id = x.id;\n\n  UPDATE teams SET cash = cfg.initial_capital, realized_pnl = 0, brokerage_paid = 0, short_sell_attempts = 0,\n                   cash_shortfall_attempts = 0, insufficient_balance_rejections = 0, updated_at = now();\n  UPDATE loans SET original_principal = 0, principal_outstanding = 0, interest_outstanding = 0, interest_charged = 0,\n                   interest_paid = 0, principal_repaid = 0, draws = 0, status = 'NONE', updated_at = now();\n  INSERT INTO loans(team_id) SELECT id FROM teams ON CONFLICT (team_id) DO NOTHING;\n  UPDATE institutions SET cash = initial_cash, updated_at = now();\n  -- base / reference prices; IPOs back to the pre-market stage (saved listing prices are kept for the next START)\n  UPDATE securities SET price = base_price, previous_price = base_price, trade_count = 0, traded_quantity = 0, traded_value = 0,\n                        last_trade_at = NULL, listed_at = NULL, last_price_change_at = NULL,\n                        index_base_price = CASE WHEN kind = 'EQUITY' THEN base_price END, updated_at = now();\n  INSERT INTO cash_ledger(team_id, entry_type, credit, balance_after, note, actor_id, actor_name)\n  SELECT id, 'INITIAL_CAPITAL', cfg.initial_capital, cfg.initial_capital, 'Initial event capital', nullif(a->>'id', '')::integer, jse_actor_name(a) FROM teams;\n  INSERT INTO institution_ledger(institution_id, entry_type, credit, balance_after, note, actor_id, actor_name)\n  SELECT id, 'INITIAL_CAPITAL', initial_cash, initial_cash, 'Initial institutional cash', nullif(a->>'id', '')::integer, jse_actor_name(a) FROM institutions;\n\n  FOR r IN SELECT value FROM jsonb_array_elements(v_allots) LOOP\n    INSERT INTO ipo_allotments(team_id, security_id, lots, quantity, price, amount, batch_id, created_by, created_by_name)\n    VALUES ((r->>'team_id')::integer, (r->>'security_id')::integer, (r->>'lots')::integer, (r->>'quantity')::integer,\n            (r->>'price')::numeric, (r->>'amount')::numeric, r->>'batch_id', nullif(a->>'id', '')::integer, jse_actor_name(a))\n    RETURNING * INTO al;\n    PERFORM jse__apply_allotment(a, al);\n    v_n := v_n + 1;\n  END LOOP;\n\n  UPDATE event_control SET status = 'NOT_STARTED', started_at = NULL, paused_at = NULL, closed_at = NULL, finalized_at = NULL,\n         status_changed_at = now(), status_changed_by = jse_actor_name(a), reset_count = reset_count + 1, last_reset_at = now(),\n         market_updated_at = now() WHERE id = 1;\n  PERFORM jse_audit(a, 'EVENT_RESET', 'event', 'event_control', NULL, NULL, jsonb_build_object('status', ev.status),\n    jsonb_build_object('status', 'NOT_STARTED'),\n    jsonb_build_object('reset_no', ev.reset_count + 1, 'archived_audit_rows', v_archived, 'kept_ipo_allotments', v_n, 'baseline_restored', true,\n                       'team_names_locked', cfg.team_names_locked_at IS NOT NULL));\n  RETURN jsonb_build_object('success', true, 'status', 'NOT_STARTED', 'reset_no', ev.reset_count + 1, 'kept_ipo_allotments', v_n, 'archived_audit_rows', v_archived);\nEND $function$;\n\n\nCREATE OR REPLACE FUNCTION public.jse_admin_state(a jsonb, p jsonb)\n RETURNS jsonb\n LANGUAGE plpgsql\n STABLE\nAS $function$\nDECLARE v_idx jsonb := jse_cms_index();\nBEGIN\n  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');\n  RETURN jse_event_status() || jsonb_build_object(\n    'config_full', (SELECT to_jsonb(c) - 'min_cash_buffer' - 'participant_order_entry' - 'institutional_cash' - 'institution_overdraft' - 'institution_brokerage'\n                    FROM event_config c WHERE id = 1),\n    'stats', (SELECT jsonb_build_object('total_trade_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED'), 0),\n        'total_brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0),\n        'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),\n        'pending_orders', count(*) FILTER (WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),\n        'settled_orders', count(*) FILTER (WHERE status = 'BANK_SETTLED'),\n        'rejected_orders', count(*) FILTER (WHERE status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED')),\n        'stale_orders', count(*) FILTER (WHERE reject_code = 'PRICE_STALE'),\n        'slips', (SELECT count(*) FROM trading_slips),\n        'open_instructions', (SELECT count(*) FROM instructions WHERE status = 'OPEN'),\n        'institutional_orders', count(*) FILTER (WHERE account_type = 'INSTITUTION'),\n        'news_items', (SELECT count(*) FROM market_news WHERE reversed_at IS NULL),\n        'loans_outstanding', (SELECT coalesce(sum(principal_outstanding + interest_outstanding), 0) FROM loans),\n        'risk', (SELECT jsonb_build_object('short_sell', count(*) FILTER (WHERE kind = 'SHORT_SELL_ATTEMPT'),\n                   'cash_shortfall', count(*) FILTER (WHERE kind = 'CASH_SHORTFALL_ATTEMPT'),\n                   'insufficient_balance', count(*) FILTER (WHERE kind = 'INSUFFICIENT_BALANCE_REJECTION')) FROM risk_events)) FROM orders),\n    'market', jsonb_build_object('index', v_idx, 'breadth', jse_market()->'breadth'),\n    'consistency', (SELECT jsonb_build_object(\n        'equities_active', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active),\n        'index_equity_components', (v_idx->>'equity_components')::integer,\n        'market_stocks', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active),\n        'ipos', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active),\n        'ipos_listed', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NOT NULL),\n        'index_ipo_components', (v_idx->>'ipo_components')::integer,\n        'index_components', (v_idx->>'components')::integer,\n        'ok', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active) = (v_idx->>'equity_components')::integer\n              AND (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NOT NULL) = (v_idx->>'ipo_components')::integer)),\n    'journal', coalesce((SELECT jsonb_agg(jsonb_build_object('id', j.id, 'action', j.action, 'summary', j.summary, 'actor', j.actor_name, 'at', j.created_at,\n        'undone_at', j.undone_at, 'undone_by', j.undone_by, 'redone_at', j.redone_at, 'redone_by', j.redone_by,\n        'superseded', coalesce((j.payload->>'superseded')::boolean, false),\n        'state', CASE WHEN coalesce((j.payload->>'superseded')::boolean, false) THEN 'REDONE'\n                      WHEN j.undone_at IS NOT NULL AND (j.redone_at IS NULL OR j.redone_at < j.undone_at) THEN 'UNDONE' ELSE 'ACTIVE' END) ORDER BY j.id DESC)\n      FROM (SELECT * FROM action_journal ORDER BY id DESC) j), '[]'::jsonb),\n    'allotments', (SELECT jsonb_build_object('rows', count(*), 'teams', count(DISTINCT team_id), 'amount', coalesce(sum(amount), 0),\n        'by_ipo', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'name', s.name, 'teams', z.n, 'lots', z.lots, 'shares', z.q, 'amount', z.amt) ORDER BY s.display_order)\n                  FROM (SELECT security_id, count(*) n, sum(lots) lots, sum(quantity) q, sum(amount) amt FROM ipo_allotments WHERE reversed_at IS NULL GROUP BY security_id) z\n                  JOIN securities s ON s.id = z.security_id), '[]'::jsonb),\n        'list', coalesce((SELECT jsonb_agg(jsonb_build_object('team', t.code, 'team_name', t.name, 'ipo', s.symbol, 'ipo_code', s.ipo_code, 'lots', x.lots, 'shares', x.quantity, 'amount', x.amount) ORDER BY t.seq, s.display_order)\n                  FROM (SELECT * FROM ipo_allotments WHERE reversed_at IS NULL ORDER BY id LIMIT 1000) x JOIN teams t ON t.id = x.team_id JOIN securities s ON s.id = x.security_id), '[]'::jsonb))\n      FROM ipo_allotments WHERE reversed_at IS NULL),\n    'ipo_listing', jse_listing_state(a),\n    'ipo_admin', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'ipo_code', s.ipo_code, 'name', s.name, 'stage', jse_ipo_stage(s.id),\n        'price', s.base_price, 'listed', s.listed_at IS NOT NULL, 'offered', s.ipo_shares_offered,\n        'remaining', CASE WHEN s.ipo_shares_offered IS NULL THEN NULL ELSE s.ipo_shares_offered - coalesce((SELECT sum(quantity) FROM ipo_allotments al WHERE al.security_id = s.id AND al.reversed_at IS NULL), 0) END,\n        'applications', (SELECT count(*) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),\n        'applied_lots', (SELECT coalesce(sum(lots), 0) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),\n        'prospectus_fields', (SELECT (CASE WHEN pr.company_description IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.issue_details IS NOT NULL THEN 1 ELSE 0 END)\n              + (CASE WHEN pr.business_overview IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.financial_information IS NOT NULL THEN 1 ELSE 0 END)\n              + (CASE WHEN pr.risk_factors IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.use_of_proceeds IS NOT NULL THEN 1 ELSE 0 END)\n              + (CASE WHEN pr.promoters_management IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.other_information IS NOT NULL THEN 1 ELSE 0 END)\n              FROM ipo_prospectus pr WHERE pr.security_id = s.id),\n        'has_document', (SELECT document_data IS NOT NULL OR document_url IS NOT NULL FROM ipo_prospectus pr WHERE pr.security_id = s.id)) ORDER BY s.display_order)\n      FROM securities s WHERE s.kind = 'IPO' AND s.active), '[]'::jsonb),\n    'team_names', (SELECT jsonb_build_object('seed', team_name_seed, 'assigned_at', team_names_assigned_at, 'locked', team_names_locked_at IS NOT NULL,\n        'locked_at', team_names_locked_at, 'locked_by', team_names_locked_by, 'pool_size', (SELECT count(*) FROM team_name_pool WHERE active))\n      FROM event_config WHERE id = 1),\n    'brokers', (SELECT jsonb_agg(jsonb_build_object('code', b.code, 'display_code', coalesce(ba.broker_code, b.code), 'name', coalesce(ba.broker_name, b.name), 'contact', b.contact, 'desk', b.desk,\n        'teams', (SELECT count(*) FROM teams t WHERE t.broker_id = b.id AND t.active)) ORDER BY coalesce(ba.broker_number, 999), b.code)\n      FROM brokers b LEFT JOIN broker_roster_aliases ba ON ba.internal_broker_id = b.id),\n    'unassigned_teams', (SELECT count(*) FROM teams WHERE broker_id IS NULL),\n    'users', (SELECT jsonb_object_agg(role, n) FROM (SELECT role, count(*) n FROM app_users WHERE active GROUP BY role) u));\nEND $function$;\n\n\nINSERT INTO public.schema_migrations(version) VALUES ('021_locked_baseline_reset')\nON CONFLICT (version) DO NOTHING;\n";var _E=[["001_schema",$r],["001a_upgrades",Kr],["002_core",Vr],["003_ops",Xr],["004_reads",Jr],["005_exports",zr],["006_seed",Qr],["007_tuning",Zr],["008_v311",ei],["009_hatchable",ti],["010_safety",si],["011_roster_ipo",m11sql],["012_big_bull_special_account",m12special],["012_big_bull_admin",m12admin],["013_dalal_roster",m13sql],["014_big_bull_news_assessment",m14sql],["015_broker_sugadev",m015sql],["016_news_single_move_cap",m016sql],["017_portfolio_ipo_visibility",m017sql],["018_broker_assignments_and_counts",m018sql],["019_ipo_start_market_order",m019sql],["020_broker_sugadev_name",m020sql],["021_locked_baseline_reset",m021sql]],EE=new Set(["001a_upgrades","002_core","003_ops","004_reads","005_exports","007_tuning","008_v311","011_roster_ipo","012_big_bull_admin"]),b=class extends Error{constructor(s,a,r,i){super(r);this.status=s;this.code=a;this.extra=i}};function cE(){let t=process.env.DATABASE_URL||"postgres://postgres@127.0.0.1:5433/jse",e=new URL(t);process.env.DB_NAME&&(e.pathname="/"+process.env.DB_NAME);let s=e.searchParams.get("sslmode");return(s==="require"||s==="prefer"||s==="verify-ca")&&e.searchParams.set("sslmode","verify-full"),e.toString()}var Dt=null;function ri(){return Dt||(Dt=new ai.default.Pool({connectionString:cE(),max:Number(process.env.DB_POOL_MAX||8),idleTimeoutMillis:3e4,connectionTimeoutMillis:1e4,allowExitOnIdle:!1}),Dt.on("error",t=>console.warn("[db] idle client error:",t.message))),Dt}var lE=new Set(["40001","40P01","57P01","08006","08003","08000","53300"]);async function Se(t,e=[]){let s=0;for(;;)try{return await ri().query(t,e)}catch(a){if(s++,(lE.has(a?.code)||/Connection terminated|ECONNRESET|timeout exceeded when trying to connect/i.test(String(a?.message)))&&s<3){await new Promise(i=>setTimeout(i,120*s+Math.random()*120));continue}throw a}}async function O(t,e,s,a={}){if(!/^jse_[a-z0-9_]+$/.test(t))throw new Error("bad function name");try{let r;a.noActor?r=await Se(`SELECT ${t}($1::jsonb) AS r`,[JSON.stringify(s??{})]):s===void 0?r=await Se(`SELECT ${t}() AS r`):r=await Se(`SELECT ${t}($1::jsonb, $2::jsonb) AS r`,[JSON.stringify(e??{}),JSON.stringify(s??{})]);let i=r.rows[0]?.r;if(i&&i.success===!1)throw new b(Number(i.http)||400,i.code||"REQUEST_FAILED",i.error||"Request failed",i.errors?{errors:i.errors}:void 0);return i}catch(r){throw r instanceof b?r:r?.code==="JSE01"?new b(Number(r.hint)||400,r.detail||"REQUEST_FAILED",r.message):r?.code==="23505"?new b(409,"DUPLICATE","This action was already recorded (duplicate request blocked)."):r?.code==="23514"?new b(409,"RULE_VIOLATION","The request would break a financial rule (for example negative cash or holdings) and was blocked."):r?.code==="57014"?new b(503,"TIMEOUT","The database took too long to respond. Please retry."):r}}var yt=null;function ii(){return process.env.SKIP_MIGRATIONS==="1"?Promise.resolve():(yt||(yt=uE().catch(t=>{throw yt=null,t})),yt)}async function dE(t){let{createHash:e}=await import("node:crypto");return e("sha256").update(t).digest("hex").slice(0,16)}async function uE(){let t=await ri().connect();try{await t.query("BEGIN"),await t.query("SELECT pg_advisory_xact_lock(727272)"),await t.query("CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now(), checksum text)");let e=new Map((await t.query("SELECT version, checksum FROM schema_migrations")).rows.map(a=>[a.version,a.checksum])),s=[];for(let[a,r]of _E){let i=await dE(r),n=e.has(a);if(n&&(e.get(a)===i||!EE.has(a)))continue;let o=n?r.replace(/INSERT INTO schema_migrations\(version\) VALUES \('[^']+'\);/g,""):r;await t.query("SAVEPOINT m");try{await t.query(o)}catch(E){throw new Error(`migration ${a} failed: ${E.message}`)}await t.query("INSERT INTO schema_migrations(version, checksum) VALUES ($1, $2) ON CONFLICT (version) DO UPDATE SET checksum = EXCLUDED.checksum, applied_at = now()",[a,i]),await t.query("RELEASE SAVEPOINT m"),s.push(`${a} ${n?"re-applied":"applied"}`)}await t.query("COMMIT"),s.length&&console.log("[db] migrations: "+s.join(", "))}catch(e){try{await t.query("ROLLBACK")}catch{}throw e}finally{t.release()}}import{createPublicKey as NE,verify as pE}from"node:crypto";var oi="https://token.actions.githubusercontent.com",nt=null;async function ni(t=!1){if(!t&&nt&&Date.now()-nt.at<36e5)return nt.keys;let e=await fetch(oi+"/.well-known/jwks",{headers:{accept:"application/json"}});if(!e.ok)throw new Error("could not load GitHub signing keys ("+e.status+")");let s=await e.json();return nt={at:Date.now(),keys:s.keys||[]},nt.keys}var Ws=t=>Buffer.from(t.replace(/-/g,"+").replace(/_/g,"/"),"base64");async function _i(t,e){let s=t.split(".");if(s.length!==3)throw new Error("malformed token");let a=JSON.parse(Ws(s[0]).toString("utf8")),r=JSON.parse(Ws(s[1]).toString("utf8"));if(a.alg!=="RS256")throw new Error("unexpected algorithm");let i=(await ni()).find(_=>_.kid===a.kid);if(i||(i=(await ni(!0)).find(_=>_.kid===a.kid)),!i)throw new Error("unknown signing key");if(!pE("RSA-SHA256",Buffer.from(s[0]+"."+s[1]),NE({key:i,format:"jwk"}),Ws(s[2])))throw new Error("bad signature");let o=Math.floor(Date.now()/1e3);if(r.iss!==oi)throw new Error("wrong issuer");if(!(Array.isArray(r.aud)?r.aud:[r.aud]).includes(e.audience))throw new Error("wrong audience");if(typeof r.exp!="number"||r.exp<o-30)throw new Error("token expired");if(typeof r.nbf=="number"&&r.nbf>o+60)throw new Error("token not valid yet");if(r.repository!==e.repository)throw new Error("wrong repository");if(e.refs&&e.refs.length&&!e.refs.includes(r.ref))throw new Error("branch not allowed");return r}import{createRequire as TE}from"module";var mE=TE("/"),RE;try{RE=mE("worker_threads").Worker}catch{}var U=Uint8Array,ce=Uint16Array,Qs=Int32Array,Ct=new U([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Ft=new U([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),$s=new U([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Ni=function(t,e){for(var s=new ce(31),a=0;a<31;++a)s[a]=e+=1<<t[a-1];for(var r=new Qs(s[30]),a=1;a<30;++a)for(var i=s[a];i<s[a+1];++i)r[i]=i-s[a]<<5|a;return{b:s,r}},pi=Ni(Ct,2),Ti=pi.b,Ks=pi.r;Ti[28]=258,Ks[258]=28;var mi=Ni(Ft,0),hE=mi.b,Ei=mi.r,Vs=new ce(32768);for(L=0;L<32768;++L)Le=(L&43690)>>1|(L&21845)<<1,Le=(Le&52428)>>2|(Le&13107)<<2,Le=(Le&61680)>>4|(Le&3855)<<4,Vs[L]=((Le&65280)>>8|(Le&255)<<8)>>1;var Le,L,Re=function(t,e,s){for(var a=t.length,r=0,i=new ce(e);r<a;++r)t[r]&&++i[t[r]-1];var n=new ce(e);for(r=1;r<e;++r)n[r]=n[r-1]+i[r-1]<<1;var o;if(s){o=new ce(1<<e);var E=15-e;for(r=0;r<a;++r)if(t[r])for(var _=r<<4|t[r],c=e-t[r],l=n[t[r]-1]++<<c,d=l|(1<<c)-1;l<=d;++l)o[Vs[l]>>E]=_}else for(o=new ce(a),r=0;r<a;++r)t[r]&&(o[r]=Vs[n[t[r]-1]++]>>15-t[r]);return o},ge=new U(288);for(L=0;L<144;++L)ge[L]=8;var L;for(L=144;L<256;++L)ge[L]=9;var L;for(L=256;L<280;++L)ge[L]=7;var L;for(L=280;L<288;++L)ge[L]=8;var L,Et=new U(32);for(L=0;L<32;++L)Et[L]=5;var L,IE=Re(ge,9,0),OE=Re(ge,9,1),bE=Re(Et,5,0),LE=Re(Et,5,1),Bs=function(t){for(var e=t[0],s=1;s<t.length;++s)t[s]>e&&(e=t[s]);return e},Ne=function(t,e,s){var a=e/8|0;return(t[a]|t[a+1]<<8)>>(e&7)&s},Gs=function(t,e){var s=e/8|0;return(t[s]|t[s+1]<<8|t[s+2]<<16)>>(e&7)},Zs=function(t){return(t+7)/8|0},ct=function(t,e,s){return(e==null||e<0)&&(e=0),(s==null||s>t.length)&&(s=t.length),new U(t.subarray(e,s))};var vE=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],ee=function(t,e,s){var a=new Error(e||vE[t]);if(a.code=t,Error.captureStackTrace&&Error.captureStackTrace(a,ee),!s)throw a;return a},AE=function(t,e,s,a){var r=t.length,i=a?a.length:0;if(!r||e.f&&!e.l)return s||new U(0);var n=!s,o=n||e.i!=2,E=e.i;n&&(s=new U(r*3));var _=function(Ke){var Ve=s.length;if(Ke>Ve){var Ue=new U(Math.max(Ve*2,Ke));Ue.set(s),s=Ue}},c=e.f||0,l=e.p||0,d=e.b||0,u=e.l,h=e.d,I=e.m,S=e.n,P=r*8;do{if(!u){c=Ne(t,l,1);var B=Ne(t,l+1,3);if(l+=3,B)if(B==1)u=OE,h=LE,I=9,S=5;else if(B==2){var W=Ne(t,l,31)+257,A=Ne(t,l+10,15)+4,m=W+Ne(t,l+5,31)+1;l+=14;for(var T=new U(m),K=new U(19),G=0;G<A;++G)K[$s[G]]=Ne(t,l+G*3,7);l+=A*3;for(var z=Bs(K),fe=(1<<z)-1,ne=Re(K,z,1),G=0;G<m;){var se=ne[Ne(t,l,fe)];l+=se&15;var D=se>>4;if(D<16)T[G++]=D;else{var V=0,M=0;for(D==16?(M=3+Ne(t,l,3),l+=2,V=T[G-1]):D==17?(M=3+Ne(t,l,7),l+=3):D==18&&(M=11+Ne(t,l,127),l+=7);M--;)T[G++]=V}}var ae=T.subarray(0,W),X=T.subarray(W);I=Bs(ae),S=Bs(X),u=Re(ae,I,1),h=Re(X,S,1)}else ee(1);else{var D=Zs(l)+4,y=t[D-4]|t[D-3]<<8,H=D+y;if(H>r){E&&ee(0);break}o&&_(d+y),s.set(t.subarray(D,H),d),e.b=d+=y,e.p=l=H*8,e.f=c;continue}if(l>P){E&&ee(0);break}}o&&_(d+131072);for(var $e=(1<<I)-1,le=(1<<S)-1,Oe=l;;Oe=l){var V=u[Gs(t,l)&$e],oe=V>>4;if(l+=V&15,l>P){E&&ee(0);break}if(V||ee(2),oe<256)s[d++]=oe;else if(oe==256){Oe=l,u=null;break}else{var _e=oe-254;if(oe>264){var G=oe-257,w=Ct[G];_e=Ne(t,l,(1<<w)-1)+Ti[G],l+=w}var Te=h[Gs(t,l)&le],Fe=Te>>4;Te||ee(3),l+=Te&15;var X=hE[Fe];if(Fe>3){var w=Ft[Fe];X+=Gs(t,l)&(1<<w)-1,l+=w}if(l>P){E&&ee(0);break}o&&_(d+131072);var je=d+_e;if(d<X){var Nt=i-X,pt=Math.min(X,je);for(Nt+d<0&&ee(3);d<pt;++d)s[d]=a[Nt+d]}for(;d<je;++d)s[d]=s[d-X]}}e.l=u,e.p=Oe,e.b=d,e.f=c,u&&(c=1,e.m=I,e.d=h,e.n=S)}while(!c);return d!=s.length&&n?ct(s,0,d):s.subarray(0,d)},ve=function(t,e,s){s<<=e&7;var a=e/8|0;t[a]|=s,t[a+1]|=s>>8},ot=function(t,e,s){s<<=e&7;var a=e/8|0;t[a]|=s,t[a+1]|=s>>8,t[a+2]|=s>>16},qs=function(t,e){for(var s=[],a=0;a<t.length;++a)t[a]&&s.push({s:a,f:t[a]});var r=s.length,i=s.slice();if(!r)return{t:hi,l:0};if(r==1){var n=new U(s[0].s+1);return n[s[0].s]=1,{t:n,l:1}}s.sort(function(H,W){return H.f-W.f}),s.push({s:-1,f:25001});var o=s[0],E=s[1],_=0,c=1,l=2;for(s[0]={s:-1,f:o.f+E.f,l:o,r:E};c!=r-1;)o=s[s[_].f<s[l].f?_++:l++],E=s[_!=c&&s[_].f<s[l].f?_++:l++],s[c++]={s:-1,f:o.f+E.f,l:o,r:E};for(var d=i[0].s,a=1;a<r;++a)i[a].s>d&&(d=i[a].s);var u=new ce(d+1),h=Xs(s[c-1],u,0);if(h>e){var a=0,I=0,S=h-e,P=1<<S;for(i.sort(function(W,A){return u[A.s]-u[W.s]||W.f-A.f});a<r;++a){var B=i[a].s;if(u[B]>e)I+=P-(1<<h-u[B]),u[B]=e;else break}for(I>>=S;I>0;){var D=i[a].s;u[D]<e?I-=1<<e-u[D]++-1:++a}for(;a>=0&&I;--a){var y=i[a].s;u[y]==e&&(--u[y],++I)}h=e}return{t:new U(u),l:h}},Xs=function(t,e,s){return t.s==-1?Math.max(Xs(t.l,e,s+1),Xs(t.r,e,s+1)):e[t.s]=s},ci=function(t){for(var e=t.length;e&&!t[--e];);for(var s=new ce(++e),a=0,r=t[0],i=1,n=function(E){s[a++]=E},o=1;o<=e;++o)if(t[o]==r&&o!=e)++i;else{if(!r&&i>2){for(;i>138;i-=138)n(32754);i>2&&(n(i>10?i-11<<5|28690:i-3<<5|12305),i=0)}else if(i>3){for(n(r),--i;i>6;i-=6)n(8304);i>2&&(n(i-3<<5|8208),i=0)}for(;i--;)n(r);i=1,r=t[o]}return{c:s.subarray(0,a),n:e}},_t=function(t,e){for(var s=0,a=0;a<e.length;++a)s+=t[a]*e[a];return s},Ri=function(t,e,s){var a=s.length,r=Zs(e+2);t[r]=a&255,t[r+1]=a>>8,t[r+2]=t[r]^255,t[r+3]=t[r+1]^255;for(var i=0;i<a;++i)t[r+i+4]=s[i];return(r+4+a)*8},li=function(t,e,s,a,r,i,n,o,E,_,c){ve(e,c++,s),++r[256];for(var l=qs(r,15),d=l.t,u=l.l,h=qs(i,15),I=h.t,S=h.l,P=ci(d),B=P.c,D=P.n,y=ci(I),H=y.c,W=y.n,A=new ce(19),m=0;m<B.length;++m)++A[B[m]&31];for(var m=0;m<H.length;++m)++A[H[m]&31];for(var T=qs(A,7),K=T.t,G=T.l,z=19;z>4&&!K[$s[z-1]];--z);var fe=_+5<<3,ne=_t(r,ge)+_t(i,Et)+n,se=_t(r,d)+_t(i,I)+n+14+3*z+_t(A,K)+2*A[16]+3*A[17]+7*A[18];if(E>=0&&fe<=ne&&fe<=se)return Ri(e,c,t.subarray(E,E+_));var V,M,ae,X;if(ve(e,c,1+(se<ne)),c+=2,se<ne){V=Re(d,u,0),M=d,ae=Re(I,S,0),X=I;var $e=Re(K,G,0);ve(e,c,D-257),ve(e,c+5,W-1),ve(e,c+10,z-4),c+=14;for(var m=0;m<z;++m)ve(e,c+3*m,K[$s[m]]);c+=3*z;for(var le=[B,H],Oe=0;Oe<2;++Oe)for(var oe=le[Oe],m=0;m<oe.length;++m){var _e=oe[m]&31;ve(e,c,$e[_e]),c+=K[_e],_e>15&&(ve(e,c,oe[m]>>5&127),c+=oe[m]>>12)}}else V=IE,M=ge,ae=bE,X=Et;for(var m=0;m<o;++m){var w=a[m];if(w>255){var _e=w>>18&31;ot(e,c,V[_e+257]),c+=M[_e+257],_e>7&&(ve(e,c,w>>23&31),c+=Ct[_e]);var Te=w&31;ot(e,c,ae[Te]),c+=X[Te],Te>3&&(ot(e,c,w>>5&8191),c+=Ft[Te])}else ot(e,c,V[w]),c+=M[w]}return ot(e,c,V[256]),c+M[256]},fE=new Qs([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),hi=new U(0),SE=function(t,e,s,a,r,i){var n=i.z||t.length,o=new U(a+n+5*(1+Math.ceil(n/7e3))+r),E=o.subarray(a,o.length-r),_=i.l,c=(i.r||0)&7;if(e){c&&(E[0]=i.r>>3);for(var l=fE[e-1],d=l>>13,u=l&8191,h=(1<<s)-1,I=i.p||new ce(32768),S=i.h||new ce(h+1),P=Math.ceil(s/3),B=2*P,D=function(Ht){return(t[Ht]^t[Ht+1]<<P^t[Ht+2]<<B)&h},y=new Qs(25e3),H=new ce(288),W=new ce(32),A=0,m=0,T=i.i||0,K=0,G=i.w||0,z=0;T+2<n;++T){var fe=D(T),ne=T&32767,se=S[fe];if(I[ne]=se,S[fe]=ne,G<=T){var V=n-T;if((A>7e3||K>24576)&&(V>423||!_)){c=li(t,E,0,y,H,W,m,K,z,T-z,c),K=A=m=0,z=T;for(var M=0;M<286;++M)H[M]=0;for(var M=0;M<30;++M)W[M]=0}var ae=2,X=0,$e=u,le=ne-se&32767;if(V>2&&fe==D(T-le))for(var Oe=Math.min(d,V)-1,oe=Math.min(32767,T),_e=Math.min(258,V);le<=oe&&--$e&&ne!=se;){if(t[T+ae]==t[T+ae-le]){for(var w=0;w<_e&&t[T+w]==t[T+w-le];++w);if(w>ae){if(ae=w,X=le,w>Oe)break;for(var Te=Math.min(le,w-2),Fe=0,M=0;M<Te;++M){var je=T-le+M&32767,Nt=I[je],pt=je-Nt&32767;pt>Fe&&(Fe=pt,se=je)}}}ne=se,se=I[ne],le+=ne-se&32767}if(X){y[K++]=268435456|Ks[ae]<<18|Ei[X];var Ke=Ks[ae]&31,Ve=Ei[X]&31;m+=Ct[Ke]+Ft[Ve],++H[257+Ke],++W[Ve],G=T+ae,++A}else y[K++]=t[T],++H[t[T]]}}for(T=Math.max(T,G);T<n;++T)y[K++]=t[T],++H[t[T]];c=li(t,E,_,y,H,W,m,K,z,T-z,c),_||(i.r=c&7|E[c/8|0]<<3,c-=7,i.h=S,i.p=I,i.i=T,i.w=G)}else{for(var T=i.w||0;T<n+_;T+=65535){var Ue=T+65535;Ue>=n&&(E[c/8|0]=_,Ue=n),c=Ri(E,c+1,t.subarray(T,Ue))}i.i=n}return ct(o,0,a+Zs(c)+r)},gE=function(){for(var t=new Int32Array(256),e=0;e<256;++e){for(var s=e,a=9;--a;)s=(s&1&&-306674912)^s>>>1;t[e]=s}return t}(),DE=function(){var t=-1;return{p:function(e){for(var s=t,a=0;a<e.length;++a)s=gE[s&255^e[a]]^s>>>8;t=s},d:function(){return~t}}};var yE=function(t,e,s,a,r){if(!r&&(r={l:1},e.dictionary)){var i=e.dictionary.subarray(-32768),n=new U(i.length+t.length);n.set(i),n.set(t,i.length),t=n,r.w=i.length}return SE(t,e.level==null?6:e.level,e.mem==null?r.l?Math.ceil(Math.max(8,Math.min(13,Math.log(t.length)))*1.5):20:12+e.mem,s,a,r)},Ii=function(t,e){var s={};for(var a in t)s[a]=t[a];for(var a in e)s[a]=e[a];return s};var me=function(t,e){return t[e]|t[e+1]<<8},pe=function(t,e){return(t[e]|t[e+1]<<8|t[e+2]<<16|t[e+3]<<24)>>>0},Ys=function(t,e){return pe(t,e)+pe(t,e+4)*4294967296},J=function(t,e,s){for(;s;++e)t[e]=s,s>>>=8};function CE(t,e){return yE(t,e||{},0,0)}function FE(t,e){return AE(t,{i:2},e&&e.out,e&&e.dictionary)}var Oi=function(t,e,s,a){for(var r in t){var i=t[r],n=e+r,o=a;Array.isArray(i)&&(o=Ii(a,i[1]),i=i[0]),i instanceof U?s[n]=[i,o]:(s[n+="/"]=[new U(0),o],Oi(i,n,s,a))}},di=typeof TextEncoder<"u"&&new TextEncoder,Js=typeof TextDecoder<"u"&&new TextDecoder,jE=0;try{Js.decode(hi,{stream:!0}),jE=1}catch{}var UE=function(t){for(var e="",s=0;;){var a=t[s++],r=(a>127)+(a>223)+(a>239);if(s+r>t.length)return{s:e,r:ct(t,s-1)};r?r==3?(a=((a&15)<<18|(t[s++]&63)<<12|(t[s++]&63)<<6|t[s++]&63)-65536,e+=String.fromCharCode(55296|a>>10,56320|a&1023)):r&1?e+=String.fromCharCode((a&31)<<6|t[s++]&63):e+=String.fromCharCode((a&15)<<12|(t[s++]&63)<<6|t[s++]&63):e+=String.fromCharCode(a)}};function he(t,e){if(e){for(var s=new U(t.length),a=0;a<t.length;++a)s[a]=t.charCodeAt(a);return s}if(di)return di.encode(t);for(var r=t.length,i=new U(t.length+(t.length>>1)),n=0,o=function(c){i[n++]=c},a=0;a<r;++a){if(n+5>i.length){var E=new U(n+8+(r-a<<1));E.set(i),i=E}var _=t.charCodeAt(a);_<128||e?o(_):_<2048?(o(192|_>>6),o(128|_&63)):_>55295&&_<57344?(_=65536+(_&1047552)|t.charCodeAt(++a)&1023,o(240|_>>18),o(128|_>>12&63),o(128|_>>6&63),o(128|_&63)):(o(224|_>>12),o(128|_>>6&63),o(128|_&63))}return ct(i,0,n)}function ea(t,e){if(e){for(var s="",a=0;a<t.length;a+=16384)s+=String.fromCharCode.apply(null,t.subarray(a,a+16384));return s}else{if(Js)return Js.decode(t);var r=UE(t),i=r.s,s=r.r;return s.length&&ee(8),i}}var PE=function(t,e){return e+30+me(t,e+26)+me(t,e+28)},HE=function(t,e,s){var a=me(t,e+28),r=ea(t.subarray(e+46,e+46+a),!(me(t,e+8)&2048)),i=e+46+a,n=pe(t,e+20),o=s&&n==4294967295?ME(t,i):[n,pe(t,e+24),pe(t,e+42)],E=o[0],_=o[1],c=o[2];return[me(t,e+10),E,_,r,i+me(t,e+30)+me(t,e+32),c]},ME=function(t,e){for(;me(t,e)!=1;e+=4+me(t,e+2));return[Ys(t,e+12),Ys(t,e+4),Ys(t,e+20)]},zs=function(t){var e=0;if(t)for(var s in t){var a=t[s].length;a>65535&&ee(9),e+=a+4}return e},ui=function(t,e,s,a,r,i,n,o){var E=a.length,_=s.extra,c=o&&o.length,l=zs(_);J(t,e,n!=null?33639248:67324752),e+=4,n!=null&&(t[e++]=20,t[e++]=s.os),t[e]=20,e+=2,t[e++]=s.flag<<1|(i<0&&8),t[e++]=r&&8,t[e++]=s.compression&255,t[e++]=s.compression>>8;var d=new Date(s.mtime==null?Date.now():s.mtime),u=d.getFullYear()-1980;if((u<0||u>119)&&ee(10),J(t,e,u<<25|d.getMonth()+1<<21|d.getDate()<<16|d.getHours()<<11|d.getMinutes()<<5|d.getSeconds()>>1),e+=4,i!=-1&&(J(t,e,s.crc),J(t,e+4,i<0?-i-2:i),J(t,e+8,s.size)),J(t,e+12,E),J(t,e+14,l),e+=16,n!=null&&(J(t,e,c),J(t,e+6,s.attrs),J(t,e+10,n),e+=14),t.set(a,e),e+=E,l)for(var h in _){var I=_[h],S=I.length;J(t,e,+h),J(t,e+2,S),t.set(I,e+4),e+=4+S}return c&&(t.set(o,e),e+=c),e},wE=function(t,e,s,a,r){J(t,e,101010256),J(t,e+8,s),J(t,e+10,s),J(t,e+12,a),J(t,e+16,r)};function bi(t,e){e||(e={});var s={},a=[];Oi(t,"",s,e);var r=0,i=0;for(var n in s){var o=s[n],E=o[0],_=o[1],c=_.level==0?0:8,l=he(n),d=l.length,u=_.comment,h=u&&he(u),I=h&&h.length,S=zs(_.extra);d>65535&&ee(11);var P=c?CE(E,_):E,B=P.length,D=DE();D.p(E),a.push(Ii(_,{size:E.length,crc:D.d(),c:P,f:l,m:h,u:d!=n.length||h&&u.length!=I,o:r,compression:c})),r+=30+d+S+B,i+=76+2*(d+S)+(I||0)+B}for(var y=new U(i+22),H=r,W=i-r,A=0;A<a.length;++A){var l=a[A];ui(y,l.o,l,l.f,l.u,l.c.length);var m=30+l.f.length+zs(l.extra);y.set(l.c,l.o+m),ui(y,r,l,l.f,l.u,l.c.length,l.o,l.m),r+=16+m+(l.m?l.m.length:0)}return wE(y,r,a.length,W,H),y}function Li(t,e){for(var s={},a=t.length-22;pe(t,a)!=101010256;--a)(!a||t.length-a>65558)&&ee(13);var r=me(t,a+8);if(!r)return{};var i=pe(t,a+16),n=i==4294967295||r==65535;if(n){var o=pe(t,a-12);n=pe(t,o)==101075792,n&&(r=pe(t,o+32),i=pe(t,o+48))}for(var E=e&&e.filter,_=0;_<r;++_){var c=HE(t,i,n),l=c[0],d=c[1],u=c[2],h=c[3],I=c[4],S=c[5],P=PE(t,S);i=I,(!E||E({name:h,size:d,originalSize:u,compression:l}))&&(l?l==8?s[h]=FE(t.subarray(P,P+d),{out:new U(u)}):ee(14,"unknown compression type "+l):s[h]=ct(t,P,P+d))}return s}var sa=t=>t.replace(/[&<>"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[e]).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,"");function ta(t){let e="";for(t++;t>0;t=Math.floor((t-1)/26))e=String.fromCharCode(65+(t-1)%26)+e;return e}var fi=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;function Si(t){let e=new Date(t);return isNaN(e.getTime())?t:new Date(e.getTime()+5.5*3600*1e3).toISOString().replace("T"," ").slice(0,19)}function vi(t,e,s){if(e==null||e==="")return"";if(typeof e=="boolean")return`<c r="${t}" t="b"${s?' s="1"':""}><v>${e?1:0}</v></c>`;if(typeof e=="number"&&isFinite(e)){let r=s?1:Number.isInteger(e)?3:2;return`<c r="${t}" s="${r}"><v>${e}</v></c>`}let a=typeof e=="string"?e:JSON.stringify(e);return!s&&fi.test(a)&&(a=Si(a)),a.length>32e3&&(a=a.slice(0,32e3)+"\u2026"),`<c r="${t}" t="inlineStr"${s?' s="1"':""}><is><t xml:space="preserve">${sa(a)}</t></is></c>`}function kE(t){let e=t.columns.map(n=>Math.min(60,Math.max(10,n.length+2)));for(let n of t.rows.slice(0,200))n.forEach((o,E)=>{let _=o==null?0:String(o).length;E<e.length&&(e[E]=Math.min(60,Math.max(e[E],_+2)))});let s=e.map((n,o)=>`<col min="${o+1}" max="${o+1}" width="${n}" customWidth="1"/>`).join(""),a=[];a.push(`<row r="1">${t.columns.map((n,o)=>vi(ta(o)+"1",n,!0)).join("")}</row>`),t.rows.forEach((n,o)=>{let E=o+2;a.push(`<row r="${E}">${n.map((_,c)=>vi(ta(c)+E,_,!1)).join("")}</row>`)});let r=ta(Math.max(0,t.columns.length-1)),i=Math.max(1,t.rows.length+1);return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/><cols>${s}</cols><sheetData>${a.join("")}</sheetData>
${t.rows.length?`<autoFilter ref="A1:${r}${i}"/>`:""}
</worksheet>`}function xE(t,e){let s=t.replace(/[\[\]:*?\/\\]/g," ").slice(0,31).trim()||"Sheet",a=2;for(;e.has(s.toLowerCase());)s=s.slice(0,28)+" "+a++;return e.add(s.toLowerCase()),s}function gi(t,e="JSE Report"){let s=new Set,a=t.map(i=>xE(i.name,s)),r={};return r["[Content_Types].xml"]=he(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
${t.map((i,n)=>`<Override PartName="/xl/worksheets/sheet${n+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join(`
`)}
</Types>`),r["_rels/.rels"]=he(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`),r["docProps/core.xml"]=he(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${sa(e)}</dc:title><dc:creator>JAIN STOCK EXCHANGE</dc:creator>
<dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0,19)}Z</dcterms:created>
</cp:coreProperties>`),r["xl/workbook.xml"]=he(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${a.map((i,n)=>`<sheet name="${sa(i)}" sheetId="${n+1}" r:id="rId${n+1}"/>`).join("")}</sheets>
</workbook>`),r["xl/_rels/workbook.xml.rels"]=he(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${t.map((i,n)=>`<Relationship Id="rId${n+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${n+1}.xml"/>`).join(`
`)}
<Relationship Id="rId${t.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`),r["xl/styles.xml"]=he(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
</styleSheet>`),t.forEach((i,n)=>{r[`xl/worksheets/sheet${n+1}.xml`]=he(kE(i))}),bi(r,{level:6})}function lt(t,e){let s=a=>{if(a==null)return"";let r=typeof a=="string"?a:typeof a=="object"?JSON.stringify(a):String(a);return typeof a=="string"&&fi.test(r)&&(r=Si(r)),/^[=+\-@]/.test(r)&&typeof a=="string"&&(r="'"+r),/[",\n\r]/.test(r)?'"'+r.replace(/"/g,'""')+'"':r};return"\uFEFF"+[t.map(s).join(","),...e.map(a=>a.map(s).join(","))].join(`\r
`)+`\r
`}var Di=t=>t.replace(/&(lt|gt|amp|quot|apos|#\d+|#x[0-9a-fA-F]+);/g,(e,s)=>s==="lt"?"<":s==="gt"?">":s==="amp"?"&":s==="quot"?'"':s==="apos"?"'":s[1]==="x"?String.fromCodePoint(parseInt(s.slice(2),16)):String.fromCodePoint(parseInt(s.slice(1),10)));function Ai(t){let e="",s=/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t(?:\s[^>]*)?\/>/g,a;for(;a=s.exec(t);)e+=a[1]?Di(a[1]):"";return e}function WE(t){let e=(/^[A-Z]+/.exec(t)||["A"])[0],s=0;for(let a of e)s=s*26+(a.charCodeAt(0)-64);return s-1}function yi(t){let e;try{e=Li(t)}catch{throw new Error("The file is not a valid .xlsx workbook.")}let s=u=>e[u]?ea(e[u]):"",a="xl/worksheets/sheet1.xml",r=s("xl/workbook.xml"),i=s("xl/_rels/workbook.xml.rels"),n=/<sheet\b[^>]*\br:id="([^"]+)"/.exec(r);if(n&&i){let u=new RegExp('<Relationship\\b[^>]*Id="'+n[1]+'"[^>]*Target="([^"]+)"').exec(i)||new RegExp('<Relationship\\b[^>]*Target="([^"]+)"[^>]*Id="'+n[1]+'"').exec(i);u&&(a=u[1].startsWith("/")?u[1].slice(1):"xl/"+u[1].replace(/^\.\//,""))}let o=s(a);if(!o)throw new Error("The workbook has no readable worksheet.");let E=[],_=s("xl/sharedStrings.xml");if(_){let u=/<si>([\s\S]*?)<\/si>/g,h;for(;h=u.exec(_);)E.push(Ai(h[1]))}let c=[],l=/<row\b[^>]*\/>|<row\b[^>]*>([\s\S]*?)<\/row>/g,d;for(;d=l.exec(o);){let u=[],h=d[1]||"",I=/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g,S,P=0;for(;S=I.exec(h);){let B=S[1]||"",D=S[2]||"",y=/\br="([A-Z]+)\d+"/.exec(B),H=y?WE(y[1]):P;P=H+1;let W=(/\bt="([^"]+)"/.exec(B)||[])[1]||"n",A=/<v>([\s\S]*?)<\/v>/.exec(D),m="";for(W==="s"?m=A?E[Number(A[1])]??"":"":W==="inlineStr"?m=Ai(D):W==="b"?m=A&&A[1]==="1"?"TRUE":"FALSE":m=A?Di(A[1]):"";u.length<H;)u.push("");u[H]=m.trim()}c.push(u)}return c}function aa(t){let e=[],s=[],a="",r=!1,i=t.replace(/^\uFEFF/,"");for(let n=0;n<i.length;n++){let o=i[n];r?o==='"'&&i[n+1]==='"'?(a+='"',n++):o==='"'?r=!1:a+=o:o==='"'?r=!0:o===","?(s.push(a.trim()),a=""):o===`
`||o==="\r"?(o==="\r"&&i[n+1]===`
`&&n++,s.push(a.trim()),e.push(s),s=[],a=""):a+=o}return(a.length||s.length)&&(s.push(a.trim()),e.push(s)),e.filter(n=>n.some(o=>o!==""))}var na="3.14.0",YE=Date.now(),oa=["ADMIN","EXCHANGE","BANK","BROKER","PIT_MANAGER","INSTITUTIONAL","PARTICIPANT","VIEWER"];function _a(t){return BE("sha256").update(t).digest("hex")}function $E(t){if(!t)return null;if((process.env.CORS_ORIGINS||"").split(",").map(s=>s.trim()).filter(Boolean).includes(t))return t;try{let s=new URL(t),a=s.hostname;if(a==="localhost"||a==="127.0.0.1"||s.protocol==="https:"&&(a==="jain-stock-exchange.pages.dev"||a.endsWith(".jain-stock-exchange.pages.dev")||a==="jse-live.pages.dev"||a.endsWith(".jse-live.pages.dev")))return t}catch{}return null}function Ye(t){let e=$E(t.origin),s={vary:"Origin, Accept-Encoding"};return e&&(s["access-control-allow-origin"]=e,s["access-control-allow-methods"]="GET, POST, OPTIONS",s["access-control-allow-headers"]="Authorization, Content-Type, X-Request-Id",s["access-control-expose-headers"]="ETag, X-JSE-Version, X-Request-Id, Content-Disposition, Date",s["access-control-max-age"]="7200"),s}function KE(t){return/\bgzip\b/.test(t.headers.get("accept-encoding")||"")}function Fi(t){let e=JSON.stringify(t);return{body:e,etag:'W/"'+_a(e).slice(0,24)+'"'}}function q(t,e,s,a={},r=0){let i={"content-type":"application/json; charset=utf-8","x-jse-version":na,"x-request-id":t.reqId,"cache-control":r>0?`public, max-age=${r}, must-revalidate`:e===200&&t.method==="GET"?"private, no-cache":"no-store",etag:s.etag,...Ye(t),...a};return r===0&&(i.vary=(i.vary?i.vary+", ":"")+"Authorization"),e===200&&t.method==="GET"&&t.req.headers.get("if-none-match")===s.etag?(delete i["content-type"],new Response(null,{status:304,headers:i})):s.body.length>1024&&KE(t.req)?(s.gz||(s.gz=qE(s.body,{level:5})),i["content-encoding"]="gzip",new Response(s.gz,{status:e,headers:i})):new Response(s.body,{status:e,headers:i})}var te=(t,e,s=200,a=0)=>q(t,s,Fi(e),{},a);function VE(t,e){if(e instanceof b)return te(t,{success:!1,error:e.message,code:e.code,...e.extra||{}},e.status);let s=e;console.error(`[api] ${t.reqId} ${t.method} ${t.url.pathname} failed:`,s?.code||"",s?.message||s);let a=/ECONNREFUSED|ENOTFOUND|Connection terminated|timeout|too many|remaining connection/i.test(String(s?.message));return te(t,{success:!1,code:a?"SERVICE_UNAVAILABLE":"SERVER_ERROR",ref:t.reqId,error:a?"The trading service is busy or reconnecting. Please retry in a moment.":"Something went wrong while processing this request. Please retry; if it keeps failing, tell the event desk (ref "+t.reqId+")."},a?503:500)}var De=new Map;async function Y(t,e,s){let a=Date.now(),r=De.get(t);if(r?.value&&a-r.at<r.ttl)return r.value;if(r?.pending)return r.pending;let i=r||{at:0,ttl:e};if(i.ttl=e,i.pending=s().then(n=>(i.value=Fi(n),i.at=Date.now(),i.pending=void 0,i.value)).catch(n=>{if(i.pending=void 0,!(n instanceof b)&&i.value&&Date.now()-i.at<3e4)return i.value;throw n}),De.set(t,i),De.size>2e3)for(let[n,o]of De)!o.pending&&a-o.at>6e4&&De.delete(n);return i.pending}function Ci(t){if(!t){De.clear();return}for(let e of[...De.keys()])t.some(s=>e.startsWith(s))&&De.delete(e)}var Ae=new Map;async function XE(t){if(!t||t.length<32||t.length>128)return null;let e=_a(t),s=Ae.get(e);if(s&&Date.now()-s.at<3e4)return s.user;let r=(await Se("SELECT jse_session($1) AS u",[e])).rows[0]?.u||null;if(Ae.set(e,{user:r,at:Date.now()}),Ae.size>5e3)for(let[i,n]of Ae)Date.now()-n.at>12e4&&Ae.delete(i);return r}function g(t){let e=t.user;return{id:e?.id??null,username:e?.username??"anonymous",name:e?.name??null,email:e?.email??null,role:e?.role??null,team_id:e?.team_id??null,broker_id:e?.broker_id??null,institution_id:e?.institution_id??null,session:e?.session??null,session_kind:e?.session_kind??null,ip:t.ip,ua:t.ua}}function p(t,...e){if(!t.user)throw new b(401,"UNAUTHENTICATED","Please sign in to continue.");if(e.length&&!e.includes(t.user.role))throw new b(403,"FORBIDDEN",`Your role (${t.user.role.replace(/_/g," ")}) cannot do this.`);return t.user}var Ge=new Map;function qe(t,e,s){let a=Date.now(),r=Ge.get(t)||{tokens:s,at:a};return r.tokens=Math.min(s,r.tokens+(a-r.at)/1e3*e),r.at=a,r.tokens<1?(Ge.set(t,r),!1):(r.tokens-=1,Ge.set(t,r),Ge.size>2e4&&Ge.clear(),!0)}var Ut=new Map,v=(t,e)=>Ut.set("GET "+t,{h:e}),C=(t,e,s)=>Ut.set("POST "+t,{h:e,maxBody:s}),Ie=(t,e)=>(t.url.searchParams.get(e)||"").trim();function Pt(t,e){let s={};for(let a of e){let r=Ie(t,a);r&&(s[a]=r)}return s}function JE(t,e,s){let a=Ge.get(t);return a?Math.min(s,a.tokens+(Date.now()-a.at)/1e3*e)>=1:!0}var jt={perSecond:.05,burst:8};async function x(t,e,s,a){if(!qe("w:"+(t.user?.id??t.ip),15,40))throw new b(429,"TOO_MANY_REQUESTS","Too many actions in a short time. Please wait a moment.");let r=t.user?"adminpw-fail:"+t.user.id:"";if(r&&s&&typeof s=="object"&&"admin_password"in s&&!JE(r,jt.perSecond,jt.burst))throw new b(429,"TOO_MANY_ATTEMPTS","Too many incorrect administrator passwords. Wait a minute and try again.");try{let i=await O(e,g(t),s);return Ci(a),te(t,i)}catch(i){throw i instanceof b&&i.code==="PRICE_STALE"&&Ci(a),r&&i instanceof b&&i.code==="ADMIN_PASSWORD_INVALID"&&qe(r,jt.perSecond,jt.burst),i}}var dt=["trk:","staff:","pd:","q:","bd:","ins:","slips:","pub:status","admin:","audit:","inst:"];v("/api/health",async t=>{let e=Date.now(),s="ok";try{await Se("SELECT 1")}catch(a){s="error: "+String(a?.message).slice(0,120)}return te(t,{success:s==="ok",service:"JAIN STOCK EXCHANGE API",version:na,db:s,db_ms:Date.now()-e,uptime_s:Math.round((Date.now()-YE)/1e3),node:process.version,time:new Date().toISOString()},s==="ok"?200:503)});v("/api/market",async t=>q(t,200,await Y("pub:market",900,()=>O("jse_market",null)),{},1));v("/api/event-status",async t=>q(t,200,await Y("pub:status",900,()=>O("jse_event_status",null)),{},1));v("/api/market-news",async t=>{let e=Math.min(200,Math.max(1,Number(Ie(t,"limit"))||30));return q(t,200,await Y("pub:news:"+e,1500,()=>O("jse_news_list",null,{limit:e},{noActor:!0})),{},1)});v("/api/cms50",async t=>{let e=JSON.parse((await Y("pub:market",900,()=>O("jse_market",null))).body);return te(t,{success:!0,status:e.status,...e.index,market_stock_count:e.stocks.length,ipo_count:e.ipos.length})});C("/api/login",async t=>{let e=String(t.body?.username||"").trim(),s=String(t.body?.password||"");if(!qe("login-ip:"+t.ip,5,150)||!qe("login-user:"+e.toLowerCase(),.2,12))throw new b(429,"TOO_MANY_ATTEMPTS","Too many sign-in attempts. Wait a minute and try again.");if(!e||!s)throw new b(400,"MISSING_CREDENTIALS","Enter your username and password.");let a=await O("jse_login",null,{username:e,password:s,ip:t.ip,ua:t.ua},{noActor:!0});return te(t,a)});C("/api/logout",async t=>{if(t.token){let e=_a(t.token);await Se("SELECT jse_logout($1)",[e]),Ae.delete(e)}return te(t,{success:!0})});v("/api/me",async t=>t.user?te(t,{success:!0,authenticated:!0,user:t.user}):te(t,{success:!0,authenticated:!1,user:null}));C("/api/change-password",async t=>{if(p(t),!qe("pw:"+t.user.id,.2,6))throw new b(429,"TOO_MANY_ATTEMPTS","Too many attempts. Wait a minute and try again.");let e=await O("jse_change_password",g(t),t.body||{});return Ae.clear(),te(t,e)});C("/api/ci-login",async t=>{let e=process.env.CI_OIDC_REPOSITORY;if(!e)throw new b(404,"NOT_FOUND","Unknown API endpoint: /api/ci-login");if(!qe("ci-login:"+t.ip,10,300))throw new b(429,"TOO_MANY_ATTEMPTS","Too many sign-in attempts.");let s;try{s=await _i(String(t.body?.token||""),{repository:e,audience:process.env.CI_OIDC_AUDIENCE||"jse-staging",refs:(process.env.CI_OIDC_REFS||"").split(",").map(r=>r.trim()).filter(Boolean)})}catch(r){throw new b(401,"INVALID_CI_TOKEN","CI token rejected: "+r.message)}let a=await O("jse_ci_session",null,{username:String(t.body?.username||""),ip:t.ip,ua:t.ua,subject:s.sub,run_id:s.run_id,workflow:s.workflow},{noActor:!0});return te(t,a)});v("/api/portfolios",async t=>(p(t,"ADMIN","VIEWER"),q(t,200,await Y("staff:portfolios",1800,()=>O("jse_portfolios",g(t),{})))));v("/api/portfolio-details",async t=>{let e=p(t,"ADMIN","VIEWER","BROKER","PARTICIPANT"),s=(e.role==="PARTICIPANT"?e.team:Ie(t,"team"))||"";if(!s)throw new b(400,"TEAM_REQUIRED","Choose a team.");let a=e.role==="PARTICIPANT"?"p"+e.id:e.role==="BROKER"?"b"+e.broker_id:"staff";return q(t,200,await Y("pd:"+s.toUpperCase()+":"+a,1500,()=>O("jse_portfolio_detail",g(t),{team:s})))});function zE(t){return t.role==="PARTICIPANT"?"p"+t.team_id:t.role==="BROKER"?"b"+t.broker_id:t.role==="INSTITUTIONAL"?"i"+t.institution_id:"s"}var ji=async t=>{let e=p(t,...oa),s=Pt(t,["team","status","side","kind","account","q","page","page_size"]);return q(t,200,await Y("trk:"+zE(e)+":"+JSON.stringify(s),1200,()=>O("jse_tracking",g(t),s)))};v("/api/tracking",ji);v("/api/orders",ji);v("/api/order",async t=>(p(t,...oa),te(t,await O("jse_order_detail",g(t),{order_id:Ie(t,"id")||void 0,order_no:Ie(t,"order_no")||void 0,slip_no:Ie(t,"slip_no")||void 0}))));C("/api/orders",async t=>{p(t,...oa);let e=t.body||{};return Array.isArray(e.legs)?x(t,"jse_place_pair",e,dt):x(t,"jse_place_order",e,dt)});v("/api/broker-desk",async t=>{let e=p(t,"BROKER","PIT_MANAGER","ADMIN","VIEWER"),s=e.role==="BROKER"?String(e.broker||""):e.role==="PIT_MANAGER"?"ALL":Ie(t,"broker");return q(t,200,await Y("bd:"+(e.role==="BROKER"?"own"+e.broker_id:s||"first"),1200,()=>O("jse_broker_desk",g(t),s?{broker:s}:{})))});v("/api/exchange",async t=>(p(t,"ADMIN","EXCHANGE","VIEWER"),q(t,200,await Y("q:exchange",900,()=>O("jse_exchange_queue",g(t),{})))));C("/api/exchange",async t=>(p(t,"ADMIN","EXCHANGE"),x(t,"jse_exchange_decide",t.body||{},dt)));v("/api/bank",async t=>(p(t,"ADMIN","BANK","VIEWER"),q(t,200,await Y("q:bank",900,()=>O("jse_bank_queue",g(t),{})))));C("/api/bank",async t=>{p(t,"ADMIN","BANK");let e=t.body||{},s=String(e.action||"SETTLE").toUpperCase(),a=s==="SETTLE"||s==="APPROVE"?"jse_bank_settle":s==="REJECT"?"jse_bank_reject":s==="CLAIM"||s==="RELEASE"?"jse_bank_claim":"";if(!a)throw new b(400,"INVALID_ACTION","Use SETTLE, REJECT, CLAIM or RELEASE.");return x(t,a,{...e,release:s==="RELEASE"},s==="CLAIM"||s==="RELEASE"?["q:bank"]:dt.concat(["cash:","q:loans"]))});v("/api/loan",async t=>(p(t,"ADMIN","BANK","VIEWER"),q(t,200,await Y("q:loans",1500,()=>O("jse_loans",g(t),{})))));C("/api/loan",async t=>(p(t,"ADMIN","BANK"),x(t,"jse_loan_action",t.body||{},["q:","staff:","pd:","cash:","bd:"])));v("/api/loan-requests",async t=>(p(t,"ADMIN","BANK","VIEWER","BROKER","PIT_MANAGER","PARTICIPANT"),te(t,await O("jse_loan_requests",g(t),{}))));C("/api/loan-requests",async t=>{let e=t.body||{};return String(e.action||"").toUpperCase()==="REQUEST"?(p(t,"ADMIN","BANK","BROKER","PIT_MANAGER","PARTICIPANT"),x(t,"jse_loan_request",e,["q:","bd:"])):(p(t,"ADMIN","BANK"),x(t,"jse_loan_decide",e,["q:","staff:","pd:","cash:","bd:"]))});C("/api/rename",async t=>(p(t,"ADMIN"),x(t,"jse_rename_entity",t.body||{},["q:","staff:","inst:","admin:","pub:"])));v("/api/cash",async t=>{let e=p(t,"ADMIN","BANK","VIEWER","PARTICIPANT"),s=Pt(t,["team","type","q","page","page_size"]);return q(t,200,await Y("cash:"+(e.role==="PARTICIPANT"?e.team_id:"s")+":"+JSON.stringify(s),1500,()=>O("jse_cash",g(t),s)))});v("/api/audit",async t=>{p(t,"ADMIN","VIEWER");let e=Pt(t,["action","team","role","risk","group","q","page","page_size"]);return q(t,200,await Y("audit:"+JSON.stringify(e),1500,()=>O("jse_audit_log",g(t),e)))});v("/api/commissions",async t=>{let e=p(t,"ADMIN","BROKER","VIEWER"),s=Pt(t,["broker","page","page_size"]);return q(t,200,await Y("staff:commissions:"+(e.role==="BROKER"?"b"+e.broker_id:"s")+":"+JSON.stringify(s),2e3,()=>O("jse_commissions",g(t),s)))});v("/api/institutional-portfolio",async t=>{let e=p(t,"ADMIN","INSTITUTIONAL","VIEWER"),s=e.role==="INSTITUTIONAL"?"":Ie(t,"institution_id");return q(t,200,await Y("inst:"+(s||e.institution_id||"default"),1500,()=>O("jse_institutional",g(t),s?{institution_id:s}:{})))});C("/api/institutional-order",async t=>(p(t,"ADMIN","INSTITUTIONAL"),x(t,"jse_place_institutional_order",t.body||{},dt.concat(["inst:"]))));C("/api/market-news",async t=>(p(t,"ADMIN","INSTITUTIONAL"),x(t,"jse_market_news",t.body||{})));v("/api/admin-state",async t=>{let e=p(t,"ADMIN","VIEWER");return q(t,200,await Y("admin:state:"+e.role,1500,()=>O("jse_admin_state",g(t),{})))});v("/api/insights",async t=>(p(t,"ADMIN","VIEWER"),q(t,200,await Y("staff:insights",2500,()=>O("jse_insights",null)))));C("/api/ipo-listing",async t=>(p(t,"ADMIN"),x(t,"jse_ipo_listing",t.body||{})));C("/api/event",async t=>(p(t,"ADMIN"),x(t,"jse_event_action",t.body||{})));C("/api/reset-event",async t=>(p(t,"ADMIN"),x(t,"jse_reset_event",t.body||{})));C("/api/undo-redo",async t=>(p(t,"ADMIN"),x(t,"jse_undo_redo",t.body||{})));C("/api/reject-open-orders",async t=>(p(t,"ADMIN"),x(t,"jse_reject_open_orders",t.body||{})));C("/api/ipo-allotments",async t=>{p(t,"ADMIN");let e=t.body||{};return x(t,e.clear?"jse_ipo_allot_clear":"jse_ipo_allot",e)});C("/api/ipo-admin",async t=>(p(t,"ADMIN"),x(t,"jse_ipo_admin_tool",t.body||{},["admin:","staff:","pub:"])));C("/api/big-bull",async t=>(p(t,"ADMIN"),x(t,"jse_big_bull_admin",t.body||{},["admin:","staff:","pub:"])));C("/api/teams",async t=>(p(t,"ADMIN"),x(t,"jse_update_teams",t.body||{})));C("/api/brokers",async t=>(p(t,"ADMIN"),x(t,"jse_update_brokers",t.body||{})));C("/api/config",async t=>(p(t,"ADMIN"),x(t,"jse_update_config",t.body||{})));v("/api/team-names",async t=>(p(t,"ADMIN","VIEWER"),q(t,200,await Y("admin:team-names",2e3,()=>O("jse_team_names",g(t),{action:"STATE"})))));C("/api/team-names",async t=>{p(t,"ADMIN");let e=await x(t,"jse_team_names",t.body||{});return Ae.clear(),e});v("/api/users",async t=>(p(t,"ADMIN"),te(t,await O("jse_admin_users",g(t),{action:"LIST"}))));C("/api/users",async t=>{p(t,"ADMIN");let e=await x(t,"jse_admin_users",t.body||{},[]);return Ae.clear(),e});var QE={roster_assignments:{fn:"jse_import_roster_assignments",required:["team_number","team_code","broker_number","broker_code","broker_name"],map:{"team number":"team_number","team no":"team_number","team code":"team_code","broker number":"broker_number","broker no":"broker_number","broker code":"broker_code","broker name":"broker_name"}},companies:{fn:"jse_import_companies",required:["name","ticker","base_price"],map:{"company name":"name",name:"name",company:"name",ticker:"ticker",symbol:"ticker","base price":"base_price",base_price:"base_price",price:"base_price"}},teams:{fn:"jse_update_teams",required:["team"],map:{team:"team","team code":"team","team name":"name",name:"name",section:"section",broker:"broker","broker code":"broker",members:"members","participant members":"members"}},brokers:{fn:"jse_update_brokers",required:["broker"],map:{"broker code":"broker",broker:"broker",code:"broker","broker name":"name",name:"name",contact:"contact","broker contact":"contact",desk:"desk","broker desk":"desk"}},allotments:{fn:"jse_ipo_allot",required:["team","ipo","lots"],map:{team:"team","team code":"team",ipo:"ipo","ipo code":"ipo",symbol:"ipo",lots:"lots",shares:"shares",quantity:"shares",amount:"amount"}}};C("/api/import",async t=>{p(t,"ADMIN");let e=t.body||{},s=QE[String(e.kind||"")];if(!s)throw new b(400,"INVALID_IMPORT","Choose what to import: roster assignments, companies, teams, brokers or allotments.");let a;try{if(typeof e.csv_text=="string")a=aa(e.csv_text);else{let E=Buffer.from(String(e.data_base64||""),"base64");if(!E.length)throw new Error("The file is empty.");a=/\.csv$/i.test(String(e.filename||""))?aa(E.toString("utf8")):yi(new Uint8Array(E))}}catch(E){throw new b(400,"UNREADABLE_FILE",E.message||"The file could not be read.")}let r=a.findIndex(E=>E.some(_=>s.map[_.trim().toLowerCase()]));if(r<0)throw new b(400,"MISSING_HEADERS","The first row must contain the column names ("+Object.keys(s.map).slice(0,5).join(", ")+").");let i=a[r].map(E=>s.map[E.trim().toLowerCase()]||""),n=s.required.filter(E=>!i.includes(E));if(n.length)throw new b(400,"MISSING_HEADERS","Missing column(s): "+n.join(", ")+".");let o=a.slice(r+1).filter(E=>E.some(_=>_!=="")).map(E=>{let _={};return i.forEach((c,l)=>{c&&E[l]!==void 0&&E[l]!==""&&(_[c]=E[l])}),_});if(!o.length)throw new b(400,"NO_ROWS","The file has no data rows.");if(o.length>(String(e.kind)==="roster_assignments"?1e4:2e3))throw new b(400,"TOO_MANY_ROWS",String(e.kind)==="roster_assignments"?"At most 10,000 roster rows per upload; split a larger file into validated batches.":"At most 2,000 rows per import.");return x(t,s.fn,{rows:o,admin_password:e.admin_password,dry_run:!!e.dry_run,replace:!!e.replace,batch_id:e.filename?String(e.filename).slice(0,60):void 0})},3e6);v("/api/reports",async t=>(p(t,"ADMIN","VIEWER"),q(t,200,await Y("staff:reports",3e3,()=>O("jse_reports",g(t),{})))));var ra=null;async function Ui(){return ra||(ra=(await Se("SELECT jse_export_sheets() AS s")).rows[0].s),ra}function ut(){let t=new Date(Date.now()+198e5).toISOString();return t.slice(0,10)+"_"+t.slice(11,16).replace(":","")}v("/api/export",async t=>{p(t,"ADMIN","VIEWER");let e=Ie(t,"sheet")||"networth",s=(Ie(t,"format")||"csv").toLowerCase(),a=await O("jse_export",g(t),{sheet:e});if(s==="json")return te(t,a);let r=lt(a.columns,a.rows);return new Response(r,{status:200,headers:{"content-type":"text/csv; charset=utf-8","content-disposition":`attachment; filename="JSE_${e}_${ut()}.csv"`,"cache-control":"no-store",...Ye(t)}})});v("/api/export-event-excel",async t=>{p(t,"ADMIN","VIEWER");let e=[];for(let[a,r]of await Ui()){let i=await O("jse_export",g(t),{sheet:a});e.push({name:r,columns:i.columns,rows:i.rows})}let s=gi(e,"JAIN STOCK EXCHANGE \u2014 Final Event Report");return await O("jse_audit_note",g(t),{action:"EXPORT_EVENT_EXCEL",sheets:e.length}).catch(()=>null),new Response(s,{status:200,headers:{"content-type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","content-disposition":`attachment; filename="JSE_Final_Event_Report_${ut()}.xlsx"`,"cache-control":"no-store",...Ye(t)}})});var ia=[["winner","WINNER & RUNNER-UP"],["networth","NET WORTH & P/L"],["trades","ALL TRANSACTIONS (SETTLED TRADES)"],["orders","ALL ORDERS (INCLUDING REJECTED)"],["ledger","CASH LEDGER"],["prices","PRICE CHANGES"],["news","MARKET NEWS"],["audit","AUDIT LOG"]];v("/api/export-event-csv",async t=>{p(t,"ADMIN","VIEWER");let e=await O("jse_event_status",null).catch(()=>null),s=[lt(["JAIN STOCK EXCHANGE \u2014 FINAL EVENT CSV"],[["Event: "+(e?.event_name||"DALAL STREET 2026")],["Status: "+String(e?.status||"").replace(/_/g," ")],["Generated (IST): "+ut().replace("_"," ").replace(/(\d\d)(\d\d)$/,"$1:$2")],["Sections: "+ia.map(([,r])=>r).join(" | ")]])];for(let[r,i]of ia){let n=await O("jse_export",g(t),{sheet:r});s.push(lt([i+" ("+n.rows.length+" rows)"],[])+lt(n.columns,n.rows))}let a="\uFEFF"+s.map(r=>r.replace(/\ufeff/g,"")).join(`\r
`);return await O("jse_audit_note",g(t),{action:"EXPORT_EVENT_CSV",sheets:ia.length}).catch(()=>null),new Response(a,{status:200,headers:{"content-type":"text/csv; charset=utf-8","content-disposition":`attachment; filename="JSE_Final_Event_${ut()}.csv"`,"cache-control":"no-store",...Ye(t)}})});v("/api/export-event-json",async t=>{p(t,"ADMIN","VIEWER");let e={};for(let[r,i]of await Ui()){let n=await O("jse_export",g(t),{sheet:r});e[r]={title:i,columns:n.columns,rows:n.rows}}let s=await O("jse_event_status",null),a=JSON.stringify({success:!0,service:"JAIN STOCK EXCHANGE",version:na,generated_at:new Date().toISOString(),event:s,sheets:e});return await O("jse_audit_note",g(t),{action:"EXPORT_EVENT_JSON",sheets:Object.keys(e).length}).catch(()=>null),new Response(a,{status:200,headers:{"content-type":"application/json; charset=utf-8","content-disposition":`attachment; filename="JSE_Final_Event_${ut()}.json"`,"cache-control":"no-store",...Ye(t)}})});async function ZE(t,e=2e6){if(Number(t.headers.get("content-length")||0)>e)throw new b(413,"TOO_LARGE","The request is too large.");let a=await t.text();if(a.length>e)throw new b(413,"TOO_LARGE","The request is too large.");if(!a.trim())return{};try{return JSON.parse(a)}catch{throw new b(400,"INVALID_JSON","The request body is not valid JSON.")}}function ec(t){let e=t.headers.get("x-forwarded-for");return(t.headers.get("cf-connecting-ip")||(e?e.split(",")[0].trim():"")||t.headers.get("x-real-ip")||"").slice(0,64)}async function tc(t){let e=new URL(t.url),s={req:t,url:e,method:t.method.toUpperCase(),ip:ec(t),ua:(t.headers.get("user-agent")||"").slice(0,300),origin:t.headers.get("origin"),token:null,user:null,body:null,started:Date.now(),reqId:(t.headers.get("x-request-id")||GE()).slice(0,36)};if(s.method==="OPTIONS")return new Response(null,{status:204,headers:Ye(s)});let a=e.pathname.replace(/\/+$/,"")||"/";a.startsWith("/api")||(a="/api"+(a==="/"?"/health":a));try{let r=Ut.get(s.method+" "+a);if(!r){let n=Ut.has((s.method==="GET"?"POST ":"GET ")+a);throw new b(n?405:404,n?"METHOD_NOT_ALLOWED":"NOT_FOUND",n?"Method not allowed.":"Unknown API endpoint: "+a)}await ii();let i=t.headers.get("authorization")||"";return s.token=i.toLowerCase().startsWith("bearer ")?i.slice(7).trim():null,s.user=await XE(s.token),s.method==="POST"&&(s.body=await ZE(t,r.maxBody)),await r.h(s)}catch(r){return VE(s,r)}}var vl={fetch:tc};export{na as VERSION,vl as default,tc as handle};
