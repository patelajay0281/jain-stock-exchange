import{createRequire as __jseCR}from'module';const require=__jseCR(String(import.meta.url).startsWith('file:')?import.meta.url:'file:///tmp/jse.mjs');
var dn=Object.create;var Bs=Object.defineProperty;var Nn=Object.getOwnPropertyDescriptor;var pn=Object.getOwnPropertyNames;var hn=Object.getPrototypeOf,Tn=Object.prototype.hasOwnProperty;var S=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,s)=>(typeof require<"u"?require:e)[s]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var N=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var mn=(t,e,s,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of pn(e))!Tn.call(t,i)&&i!==s&&Bs(t,i,{get:()=>e[i],enumerable:!(r=Nn(e,i))||r.enumerable});return t};var Rn=(t,e,s)=>(s=t!=null?dn(hn(t)):{},mn(e||!t||!t.__esModule?Bs(s,"default",{value:t,enumerable:!0}):s,t));var It=N(qs=>{"use strict";qs.parse=function(t,e){return new vt(t,e).parse()};var vt=class t{constructor(e,s){this.source=e,this.transform=s||fn,this.position=0,this.entries=[],this.recorded=[],this.dimension=0}isEof(){return this.position>=this.source.length}nextCharacter(){var e=this.source[this.position++];return e==="\\"?{value:this.source[this.position++],escaped:!0}:{value:e,escaped:!1}}record(e){this.recorded.push(e)}newEntry(e){var s;(this.recorded.length>0||e)&&(s=this.recorded.join(""),s==="NULL"&&!e&&(s=null),s!==null&&(s=this.transform(s)),this.entries.push(s),this.recorded=[])}consumeDimensions(){if(this.source[0]==="[")for(;!this.isEof();){var e=this.nextCharacter();if(e.value==="=")break}}parse(e){var s,r,i;for(this.consumeDimensions();!this.isEof();)if(s=this.nextCharacter(),s.value==="{"&&!i)this.dimension++,this.dimension>1&&(r=new t(this.source.substr(this.position-1),this.transform),this.entries.push(r.parse(!0)),this.position+=r.position-2);else if(s.value==="}"&&!i){if(this.dimension--,!this.dimension&&(this.newEntry(),e))return this.entries}else s.value==='"'&&!s.escaped?(i&&this.newEntry(!0),i=!i):s.value===","&&!i?this.newEntry():this.record(s.value);if(this.dimension!==0)throw new Error("array dimension not balanced");return this.entries}};function fn(t){return t}});var Ot=N((Oc,Ws)=>{var vn=It();Ws.exports={create:function(t,e){return{parse:function(){return vn.parse(t,e)}}}}});var Ys=N((bc,$s)=>{"use strict";var In=/(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/,On=/^(\d{1,})-(\d{2})-(\d{2})( BC)?$/,bn=/([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/,Ln=/^-?infinity$/;$s.exports=function(e){if(Ln.test(e))return Number(e.replace("i","I"));var s=In.exec(e);if(!s)return An(e)||null;var r=!!s[8],i=parseInt(s[1],10);r&&(i=Gs(i));var n=parseInt(s[2],10)-1,a=s[3],o=parseInt(s[4],10),E=parseInt(s[5],10),_=parseInt(s[6],10),c=s[7];c=c?1e3*parseFloat(c):0;var l,u=gn(e);return u!=null?(l=new Date(Date.UTC(i,n,a,o,E,_,c)),bt(i)&&l.setUTCFullYear(i),u!==0&&l.setTime(l.getTime()-u)):(l=new Date(i,n,a,o,E,_,c),bt(i)&&l.setFullYear(i)),l};function An(t){var e=On.exec(t);if(e){var s=parseInt(e[1],10),r=!!e[4];r&&(s=Gs(s));var i=parseInt(e[2],10)-1,n=e[3],a=new Date(s,i,n);return bt(s)&&a.setFullYear(s),a}}function gn(t){if(t.endsWith("+00"))return 0;var e=bn.exec(t.split(" ")[1]);if(e){var s=e[1];if(s==="Z")return 0;var r=s==="-"?-1:1,i=parseInt(e[2],10)*3600+parseInt(e[3]||0,10)*60+parseInt(e[4]||0,10);return i*r*1e3}}function Gs(t){return-(t-1)}function bt(t){return t>=0&&t<100}});var Vs=N((Lc,Ks)=>{Ks.exports=yn;var Sn=Object.prototype.hasOwnProperty;function yn(t){for(var e=1;e<arguments.length;e++){var s=arguments[e];for(var r in s)Sn.call(s,r)&&(t[r]=s[r])}return t}});var Js=N((Ac,Xs)=>{"use strict";var Cn=Vs();Xs.exports=Ae;function Ae(t){if(!(this instanceof Ae))return new Ae(t);Cn(this,qn(t))}var Dn=["seconds","minutes","hours","days","months","years"];Ae.prototype.toPostgres=function(){var t=Dn.filter(this.hasOwnProperty,this);return this.milliseconds&&t.indexOf("seconds")<0&&t.push("seconds"),t.length===0?"0":t.map(function(e){var s=this[e]||0;return e==="seconds"&&this.milliseconds&&(s=(s+this.milliseconds/1e3).toFixed(6).replace(/\.?0+$/,"")),s+" "+e},this).join(" ")};var Fn={years:"Y",months:"M",days:"D",hours:"H",minutes:"M",seconds:"S"},Un=["years","months","days"],jn=["hours","minutes","seconds"];Ae.prototype.toISOString=Ae.prototype.toISO=function(){var t=Un.map(s,this).join(""),e=jn.map(s,this).join("");return"P"+t+"T"+e;function s(r){var i=this[r]||0;return r==="seconds"&&this.milliseconds&&(i=(i+this.milliseconds/1e3).toFixed(6).replace(/0+$/,"")),i+Fn[r]}};var Lt="([+-]?\\d+)",wn=Lt+"\\s+years?",Pn=Lt+"\\s+mons?",Hn=Lt+"\\s+days?",Mn="([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?",kn=new RegExp([wn,Pn,Hn,Mn].map(function(t){return"("+t+")?"}).join("\\s*")),zs={years:2,months:4,days:6,hours:9,minutes:10,seconds:11,milliseconds:12},xn=["hours","minutes","seconds","milliseconds"];function Bn(t){var e=t+"000000".slice(t.length);return parseInt(e,10)/1e3}function qn(t){if(!t)return{};var e=kn.exec(t),s=e[8]==="-";return Object.keys(zs).reduce(function(r,i){var n=zs[i],a=e[n];return!a||(a=i==="milliseconds"?Bn(a):parseInt(a,10),!a)||(s&&~xn.indexOf(i)&&(a*=-1),r[i]=a),r},{})}});var er=N((gc,Zs)=>{"use strict";var Qs=Buffer.from||Buffer;Zs.exports=function(e){if(/^\\x/.test(e))return Qs(e.substr(2),"hex");for(var s="",r=0;r<e.length;)if(e[r]!=="\\")s+=e[r],++r;else if(/[0-7]{3}/.test(e.substr(r+1,3)))s+=String.fromCharCode(parseInt(e.substr(r+1,3),8)),r+=4;else{for(var i=1;r+i<e.length&&e[r+i]==="\\";)i++;for(var n=0;n<Math.floor(i/2);++n)s+="\\";r+=Math.floor(i/2)*2}return Qs(s,"binary")}});var or=N((Sc,ar)=>{var we=It(),Pe=Ot(),Qe=Ys(),sr=Js(),rr=er();function Ze(t){return function(s){return s===null?s:t(s)}}function ir(t){return t===null?t:t==="TRUE"||t==="t"||t==="true"||t==="y"||t==="yes"||t==="on"||t==="1"}function Wn(t){return t?we.parse(t,ir):null}function Gn(t){return parseInt(t,10)}function At(t){return t?we.parse(t,Ze(Gn)):null}function $n(t){return t?we.parse(t,Ze(function(e){return nr(e).trim()})):null}var Yn=function(t){if(!t)return null;var e=Pe.create(t,function(s){return s!==null&&(s=Ct(s)),s});return e.parse()},gt=function(t){if(!t)return null;var e=Pe.create(t,function(s){return s!==null&&(s=parseFloat(s)),s});return e.parse()},ee=function(t){if(!t)return null;var e=Pe.create(t);return e.parse()},St=function(t){if(!t)return null;var e=Pe.create(t,function(s){return s!==null&&(s=Qe(s)),s});return e.parse()},Kn=function(t){if(!t)return null;var e=Pe.create(t,function(s){return s!==null&&(s=sr(s)),s});return e.parse()},Vn=function(t){return t?we.parse(t,Ze(rr)):null},yt=function(t){return parseInt(t,10)},nr=function(t){var e=String(t);return/^\d+$/.test(e)?e:t},tr=function(t){return t?we.parse(t,Ze(JSON.parse)):null},Ct=function(t){return t[0]!=="("?null:(t=t.substring(1,t.length-1).split(","),{x:parseFloat(t[0]),y:parseFloat(t[1])})},zn=function(t){if(t[0]!=="<"&&t[1]!=="(")return null;for(var e="(",s="",r=!1,i=2;i<t.length-1;i++){if(r||(e+=t[i]),t[i]===")"){r=!0;continue}else if(!r)continue;t[i]!==","&&(s+=t[i])}var n=Ct(e);return n.radius=parseFloat(s),n},Xn=function(t){t(20,nr),t(21,yt),t(23,yt),t(26,yt),t(700,parseFloat),t(701,parseFloat),t(16,ir),t(1082,Qe),t(1114,Qe),t(1184,Qe),t(600,Ct),t(651,ee),t(718,zn),t(1e3,Wn),t(1001,Vn),t(1005,At),t(1007,At),t(1028,At),t(1016,$n),t(1017,Yn),t(1021,gt),t(1022,gt),t(1231,gt),t(1014,ee),t(1015,ee),t(1008,ee),t(1009,ee),t(1040,ee),t(1041,ee),t(1115,St),t(1182,St),t(1185,St),t(1186,sr),t(1187,Kn),t(17,rr),t(114,JSON.parse.bind(JSON)),t(3802,JSON.parse.bind(JSON)),t(199,tr),t(3807,tr),t(3907,ee),t(2951,ee),t(791,ee),t(1183,ee),t(1270,ee)};ar.exports={init:Xn}});var cr=N((yc,_r)=>{"use strict";var Y=1e6;function Jn(t){var e=t.readInt32BE(0),s=t.readUInt32BE(4),r="";e<0&&(e=~e+(s===0),s=~s+1>>>0,r="-");var i="",n,a,o,E,_,c;{if(n=e%Y,e=e/Y>>>0,a=4294967296*n+s,s=a/Y>>>0,o=""+(a-Y*s),s===0&&e===0)return r+o+i;for(E="",_=6-o.length,c=0;c<_;c++)E+="0";i=E+o+i}{if(n=e%Y,e=e/Y>>>0,a=4294967296*n+s,s=a/Y>>>0,o=""+(a-Y*s),s===0&&e===0)return r+o+i;for(E="",_=6-o.length,c=0;c<_;c++)E+="0";i=E+o+i}{if(n=e%Y,e=e/Y>>>0,a=4294967296*n+s,s=a/Y>>>0,o=""+(a-Y*s),s===0&&e===0)return r+o+i;for(E="",_=6-o.length,c=0;c<_;c++)E+="0";i=E+o+i}return n=e%Y,a=4294967296*n+s,o=""+a%Y,r+o+i}_r.exports=Jn});var Nr=N((Cc,dr)=>{var Qn=cr(),A=function(t,e,s,r,i){s=s||0,r=r||!1,i=i||function(p,L,I){return p*Math.pow(2,I)+L};var n=s>>3,a=function(p){return r?~p&255:p},o=255,E=8-s%8;e<E&&(o=255<<8-e&255,E=e),s&&(o=o>>s%8);var _=0;s%8+e>=8&&(_=i(0,a(t[n])&o,E));for(var c=e+s>>3,l=n+1;l<c;l++)_=i(_,a(t[l]),8);var u=(e+s)%8;return u>0&&(_=i(_,a(t[c])>>8-u,u)),_},ur=function(t,e,s){var r=Math.pow(2,s-1)-1,i=A(t,1),n=A(t,s,1);if(n===0)return 0;var a=1,o=function(_,c,l){_===0&&(_=1);for(var u=1;u<=l;u++)a/=2,(c&1<<l-u)>0&&(_+=a);return _},E=A(t,e,s+1,!1,o);return n==Math.pow(2,s+1)-1?E===0?i===0?1/0:-1/0:NaN:(i===0?1:-1)*Math.pow(2,n-r)*E},Zn=function(t){return A(t,1)==1?-1*(A(t,15,1,!0)+1):A(t,15,1)},Er=function(t){return A(t,1)==1?-1*(A(t,31,1,!0)+1):A(t,31,1)},ea=function(t){return ur(t,23,8)},ta=function(t){return ur(t,52,11)},sa=function(t){var e=A(t,16,32);if(e==49152)return NaN;for(var s=Math.pow(1e4,A(t,16,16)),r=0,i=[],n=A(t,16),a=0;a<n;a++)r+=A(t,16,64+16*a)*s,s/=1e4;var o=Math.pow(10,A(t,16,48));return(e===0?1:-1)*Math.round(r*o)/o},lr=function(t,e){var s=A(e,1),r=A(e,63,1),i=new Date((s===0?1:-1)*r/1e3+9466848e5);return t||i.setTime(i.getTime()+i.getTimezoneOffset()*6e4),i.usec=r%1e3,i.getMicroSeconds=function(){return this.usec},i.setMicroSeconds=function(n){this.usec=n},i.getUTCMicroSeconds=function(){return this.usec},i},He=function(t){for(var e=A(t,32),s=A(t,32,32),r=A(t,32,64),i=96,n=[],a=0;a<e;a++)n[a]=A(t,32,i),i+=32,i+=32;var o=function(_){var c=A(t,32,i);if(i+=32,c==4294967295)return null;var l;if(_==23||_==20)return l=A(t,c*8,i),i+=c*8,l;if(_==25)return l=t.toString(this.encoding,i>>3,(i+=c<<3)>>3),l;console.log("ERROR: ElementType not implemented: "+_)},E=function(_,c){var l=[],u;if(_.length>1){var p=_.shift();for(u=0;u<p;u++)l[u]=E(_,c);_.unshift(p)}else for(u=0;u<_[0];u++)l[u]=o(c);return l};return E(n,r)},ra=function(t){return t.toString("utf8")},ia=function(t){return t===null?null:A(t,8)>0},na=function(t){t(20,Qn),t(21,Zn),t(23,Er),t(26,Er),t(1700,sa),t(700,ea),t(701,ta),t(16,ia),t(1114,lr.bind(null,!1)),t(1184,lr.bind(null,!0)),t(1e3,He),t(1007,He),t(1016,He),t(1008,He),t(1009,He),t(25,ra)};dr.exports={init:na}});var hr=N((Dc,pr)=>{pr.exports={BOOL:16,BYTEA:17,CHAR:18,INT8:20,INT2:21,INT4:23,REGPROC:24,TEXT:25,OID:26,TID:27,XID:28,CID:29,JSON:114,XML:142,PG_NODE_TREE:194,SMGR:210,PATH:602,POLYGON:604,CIDR:650,FLOAT4:700,FLOAT8:701,ABSTIME:702,RELTIME:703,TINTERVAL:704,CIRCLE:718,MACADDR8:774,MONEY:790,MACADDR:829,INET:869,ACLITEM:1033,BPCHAR:1042,VARCHAR:1043,DATE:1082,TIME:1083,TIMESTAMP:1114,TIMESTAMPTZ:1184,INTERVAL:1186,TIMETZ:1266,BIT:1560,VARBIT:1562,NUMERIC:1700,REFCURSOR:1790,REGPROCEDURE:2202,REGOPER:2203,REGOPERATOR:2204,REGCLASS:2205,REGTYPE:2206,UUID:2950,TXID_SNAPSHOT:2970,PG_LSN:3220,PG_NDISTINCT:3361,PG_DEPENDENCIES:3402,TSVECTOR:3614,TSQUERY:3615,GTSVECTOR:3642,REGCONFIG:3734,REGDICTIONARY:3769,JSONB:3802,REGNAMESPACE:4089,REGROLE:4096}});var xe=N(ke=>{var aa=or(),oa=Nr(),_a=Ot(),ca=hr();ke.getTypeParser=Ea;ke.setTypeParser=la;ke.arrayParser=_a;ke.builtins=ca;var Me={text:{},binary:{}};function Tr(t){return String(t)}function Ea(t,e){return e=e||"text",Me[e]&&Me[e][t]||Tr}function la(t,e,s){typeof e=="function"&&(s=e,e="text"),Me[e][t]=s}aa.init(function(t,e){Me.text[t]=e});oa.init(function(t,e){Me.binary[t]=e})});var Be=N((Uc,Dt)=>{"use strict";Dt.exports={host:"localhost",user:process.platform==="win32"?process.env.USERNAME:process.env.USER,database:void 0,password:null,connectionString:void 0,port:5432,rows:0,binary:!1,max:10,idleTimeoutMillis:3e4,client_encoding:"",ssl:!1,application_name:void 0,fallback_application_name:void 0,options:void 0,parseInputDatesAsUTC:!1,statement_timeout:!1,lock_timeout:!1,idle_in_transaction_session_timeout:!1,query_timeout:!1,connect_timeout:0,keepalives:1,keepalives_idle:0};var ge=xe(),ua=ge.getTypeParser(20,"text"),da=ge.getTypeParser(1016,"text");Dt.exports.__defineSetter__("parseInt8",function(t){ge.setTypeParser(20,"text",t?ge.getTypeParser(23,"text"):ua),ge.setTypeParser(1016,"text",t?ge.getTypeParser(1007,"text"):da)})});var qe=N((jc,Rr)=>{"use strict";var Na=Be();function pa(t){var e=t.replace(/\\/g,"\\\\").replace(/"/g,'\\"');return'"'+e+'"'}function mr(t){for(var e="{",s=0;s<t.length;s++)if(s>0&&(e=e+","),t[s]===null||typeof t[s]>"u")e=e+"NULL";else if(Array.isArray(t[s]))e=e+mr(t[s]);else if(ArrayBuffer.isView(t[s])){var r=t[s];if(!(r instanceof Buffer)){var i=Buffer.from(r.buffer,r.byteOffset,r.byteLength);i.length===r.byteLength?r=i:r=i.slice(r.byteOffset,r.byteOffset+r.byteLength)}e+="\\\\x"+r.toString("hex")}else e+=pa(et(t[s]));return e=e+"}",e}var et=function(t,e){if(t==null)return null;if(t instanceof Buffer)return t;if(ArrayBuffer.isView(t)){var s=Buffer.from(t.buffer,t.byteOffset,t.byteLength);return s.length===t.byteLength?s:s.slice(t.byteOffset,t.byteOffset+t.byteLength)}return t instanceof Date?Na.parseInputDatesAsUTC?ma(t):Ta(t):Array.isArray(t)?mr(t):typeof t=="object"?ha(t,e):t.toString()};function ha(t,e){if(t&&typeof t.toPostgres=="function"){if(e=e||[],e.indexOf(t)!==-1)throw new Error('circular reference detected while preparing "'+t+'" for query');return e.push(t),et(t.toPostgres(et),e)}return JSON.stringify(t)}function x(t,e){for(t=""+t;t.length<e;)t="0"+t;return t}function Ta(t){var e=-t.getTimezoneOffset(),s=t.getFullYear(),r=s<1;r&&(s=Math.abs(s)+1);var i=x(s,4)+"-"+x(t.getMonth()+1,2)+"-"+x(t.getDate(),2)+"T"+x(t.getHours(),2)+":"+x(t.getMinutes(),2)+":"+x(t.getSeconds(),2)+"."+x(t.getMilliseconds(),3);return e<0?(i+="-",e*=-1):i+="+",i+=x(Math.floor(e/60),2)+":"+x(e%60,2),r&&(i+=" BC"),i}function ma(t){var e=t.getUTCFullYear(),s=e<1;s&&(e=Math.abs(e)+1);var r=x(e,4)+"-"+x(t.getUTCMonth()+1,2)+"-"+x(t.getUTCDate(),2)+"T"+x(t.getUTCHours(),2)+":"+x(t.getUTCMinutes(),2)+":"+x(t.getUTCSeconds(),2)+"."+x(t.getUTCMilliseconds(),3);return r+="+00:00",s&&(r+=" BC"),r}function Ra(t,e,s){return t=typeof t=="string"?{text:t}:t,e&&(typeof e=="function"?t.callback=e:t.values=e),s&&(t.callback=s),t}var fa=function(t){return'"'+t.replace(/"/g,'""')+'"'},va=function(t){for(var e=!1,s="'",r=0;r<t.length;r++){var i=t[r];i==="'"?s+=i+i:i==="\\"?(s+=i+i,e=!0):s+=i}return s+="'",e===!0&&(s=" E"+s),s};Rr.exports={prepareValue:function(e){return et(e)},normalizeQueryConfig:Ra,escapeIdentifier:fa,escapeLiteral:va}});var vr=N((wc,fr)=>{"use strict";var We=S("crypto");function Ft(t){return We.createHash("md5").update(t,"utf-8").digest("hex")}function Ia(t,e,s){var r=Ft(e+t),i=Ft(Buffer.concat([Buffer.from(r),s]));return"md5"+i}function Oa(t){return We.createHash("sha256").update(t).digest()}function ba(t,e){return We.createHmac("sha256",t).update(e).digest()}async function La(t,e,s){return We.pbkdf2Sync(t,e,s,32,"sha256")}fr.exports={postgresMd5PasswordHash:Ia,randomBytes:We.randomBytes,deriveKey:La,sha256:Oa,hmacSha256:ba,md5:Ft}});var Lr=N((Pc,br)=>{var Ir=S("crypto");br.exports={postgresMd5PasswordHash:ga,randomBytes:Aa,deriveKey:Ca,sha256:Sa,hmacSha256:ya,md5:Ut};var Or=Ir.webcrypto||globalThis.crypto,Se=Or.subtle,jt=new TextEncoder;function Aa(t){return Or.getRandomValues(Buffer.alloc(t))}async function Ut(t){try{return Ir.createHash("md5").update(t,"utf-8").digest("hex")}catch{let s=typeof t=="string"?jt.encode(t):t,r=await Se.digest("MD5",s);return Array.from(new Uint8Array(r)).map(i=>i.toString(16).padStart(2,"0")).join("")}}async function ga(t,e,s){var r=await Ut(e+t),i=await Ut(Buffer.concat([Buffer.from(r),s]));return"md5"+i}async function Sa(t){return await Se.digest("SHA-256",t)}async function ya(t,e){let s=await Se.importKey("raw",t,{name:"HMAC",hash:"SHA-256"},!1,["sign"]);return await Se.sign("HMAC",s,jt.encode(e))}async function Ca(t,e,s){let r=await Se.importKey("raw",jt.encode(t),"PBKDF2",!1,["deriveBits"]),i={name:"PBKDF2",hash:"SHA-256",salt:e,iterations:s};return await Se.deriveBits(i,r,32*8,["deriveBits"])}});var Pt=N((Hc,wt)=>{"use strict";var Da=parseInt(process.versions&&process.versions.node&&process.versions.node.split(".")[0])<15;Da?wt.exports=vr():wt.exports=Lr()});var yr=N((Mc,Sr)=>{"use strict";var me=Pt();function Fa(t){if(t.indexOf("SCRAM-SHA-256")===-1)throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");let e=me.randomBytes(18).toString("base64");return{mechanism:"SCRAM-SHA-256",clientNonce:e,response:"n,,n=*,r="+e,message:"SASLInitialResponse"}}async function Ua(t,e,s){if(t.message!=="SASLInitialResponse")throw new Error("SASL: Last message was not SASLInitialResponse");if(typeof e!="string")throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");if(e==="")throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string");if(typeof s!="string")throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");let r=Pa(s);if(r.nonce.startsWith(t.clientNonce)){if(r.nonce.length===t.clientNonce.length)throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");var i="n=*,r="+t.clientNonce,n="r="+r.nonce+",s="+r.salt+",i="+r.iteration,a="c=biws,r="+r.nonce,o=i+","+n+","+a,E=Buffer.from(r.salt,"base64"),_=await me.deriveKey(e,E,r.iteration),c=await me.hmacSha256(_,"Client Key"),l=await me.sha256(c),u=await me.hmacSha256(l,o),p=Ma(Buffer.from(c),Buffer.from(u)).toString("base64"),L=await me.hmacSha256(_,"Server Key"),I=await me.hmacSha256(L,o);t.message="SASLResponse",t.serverSignature=Buffer.from(I).toString("base64"),t.response=a+",p="+p}function ja(t,e){if(t.message!=="SASLResponse")throw new Error("SASL: Last message was not SASLResponse");if(typeof e!="string")throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");let{serverSignature:s}=Ha(e);if(s!==t.serverSignature)throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match")}function wa(t){if(typeof t!="string")throw new TypeError("SASL: text must be a string");return t.split("").map((e,s)=>t.charCodeAt(s)).every(e=>e>=33&&e<=43||e>=45&&e<=126)}function Ar(t){return/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(t)}function gr(t){if(typeof t!="string")throw new TypeError("SASL: attribute pairs text must be a string");return new Map(t.split(",").map(e=>{if(!/^.=/.test(e))throw new Error("SASL: Invalid attribute pair entry");let s=e[0],r=e.substring(2);return[s,r]}))}function Pa(t){let e=gr(t),s=e.get("r");if(s){if(!wa(s))throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");let r=e.get("s");if(r){if(!Ar(r))throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");let i=e.get("i");if(i){if(!/^[1-9][0-9]*$/.test(i))throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");let n=parseInt(i,10);return{nonce:s,salt:r,iteration:n}}function Ha(t){let s=gr(t).get("v");if(s){if(!Ar(s))throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64")}else throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");return{serverSignature:s}}function Ma(t,e){if(!Buffer.isBuffer(t))throw new TypeError("first argument must be a Buffer");if(!Buffer.isBuffer(e))throw new TypeError("second argument must be a Buffer");if(t.length!==e.length)throw new Error("Buffer lengths must match");if(t.length===0)throw new Error("Buffers cannot be empty");return Buffer.from(t.map((s,r)=>t[r]^e[r]))}Sr.exports={startSession:Fa,continueSession:Ua,finalizeSession:ja}});var Ht=N((kc,Cr)=>{"use strict";var ka=xe();function tt(t){this._types=t||ka,this.text={},this.binary={}}tt.prototype.getOverrides=function(t){switch(t){case"text":return this.text;case"binary":return this.binary;default:return{}}};tt.prototype.setTypeParser=function(t,e,s){typeof e=="function"&&(s=e,e="text"),this.getOverrides(e)[t]=s};tt.prototype.getTypeParser=function(t,e){return e=e||"text",this.getOverrides(e)[t]||this._types.getTypeParser(t,e)};Cr.exports=tt});var Ur=N((xc,Fr)=>{"use strict";function ye(t,e={}){if(t.charAt(0)==="/"){let E=t.split(" ");return{host:E[0],database:E[1]}}let s=Object.create(null),r,i=!1;/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(t)&&(t=encodeURI(t).replace(/%25(\d\d)/g,"%$1"));try{try{r=new URL(t,"postgres://base")}catch{r=new URL(t.replace("@/","@___DUMMY___/"),"postgres://base"),i=!0}}catch(E){throw E.input&&(E.input="*****REDACTED*****"),E}for(let E of r.searchParams.entries())s[E[0]]=E[1];if(s.user=s.user||decodeURIComponent(r.username),s.password=s.password||decodeURIComponent(r.password),r.protocol=="socket:")return s.host=decodeURI(r.pathname),s.database=r.searchParams.get("db"),s.client_encoding=r.searchParams.get("encoding"),s;let n=(i?"":r.hostname).replace(/^\[(.+)\]$/,"$1");s.host?n&&/^%2f/i.test(n)&&(r.pathname=n+r.pathname):s.host=decodeURIComponent(n),s.port||(s.port=r.port);let a=r.pathname.slice(1)||null;s.database=a?decodeURI(a):null,(s.ssl==="true"||s.ssl==="1")&&(s.ssl=!0),s.ssl==="0"&&(s.ssl=!1),(s.sslcert||s.sslkey||s.sslrootcert||s.sslmode)&&(s.ssl={}),s.sslnegotiation==="direct"&&s.ssl===void 0&&(s.ssl=!0);let o=s.sslcert||s.sslkey||s.sslrootcert?S("fs"):null;if(s.sslcert&&(s.ssl.cert=o.readFileSync(s.sslcert).toString()),s.sslkey&&(s.ssl.key=o.readFileSync(s.sslkey).toString()),s.sslrootcert&&(s.ssl.ca=o.readFileSync(s.sslrootcert).toString()),e.useLibpqCompat&&s.uselibpqcompat)throw new Error("Both useLibpqCompat and uselibpqcompat are set. Please use only one of them.");if(s.uselibpqcompat==="true"||e.useLibpqCompat)switch(s.sslmode){case"disable":{s.ssl=!1;break}case"prefer":{s.ssl.rejectUnauthorized=!1;break}case"require":{s.sslrootcert?s.ssl.checkServerIdentity=function(){}:s.ssl.rejectUnauthorized=!1;break}case"verify-ca":{if(!s.ssl.ca)throw new Error("SECURITY WARNING: Using sslmode=verify-ca requires specifying a CA with sslrootcert. If a public CA is used, verify-ca allows connections to a server that somebody else may have registered with the CA, making you vulnerable to Man-in-the-Middle attacks. Either specify a custom CA certificate with sslrootcert parameter or use sslmode=verify-full for proper security.");s.ssl.checkServerIdentity=function(){};break}case"verify-full":break}else switch(s.sslmode){case"disable":{s.ssl=!1;break}case"prefer":case"require":case"verify-ca":case"verify-full":{s.sslmode!=="verify-full"&&Mt(s.sslmode);break}case"no-verify":{s.ssl.rejectUnauthorized=!1;break}}return s}function xa(t){return Object.entries(t).reduce((s,[r,i])=>(i!=null&&(s[r]=i),s),Object.create(null))}function Dr(t){return Object.entries(t).reduce((s,[r,i])=>{if(r==="ssl"){let n=i;typeof n=="boolean"&&(s[r]=n),typeof n=="object"&&(s[r]=xa(n))}else if(i!=null)if(r==="port"){if(i!==""){let n=parseInt(i,10);if(isNaN(n))throw new Error(`Invalid ${r}: ${i}`);s[r]=n}}else s[r]=i;return s},Object.create(null))}function Ba(t){return Dr(ye(t))}function Mt(t){!Mt.warned&&typeof process<"u"&&process.emitWarning&&(Mt.warned=!0,process.emitWarning(`SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=${t}'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.`))}Fr.exports=ye;ye.parse=ye;ye.toClientConfig=Dr;ye.parseIntoClientConfig=Ba});var xt=N((Bc,Pr)=>{"use strict";var qa=S("dns"),wr=Be(),jr=Ur().parse,q=function(t,e,s){return s===void 0?s=process.env["PG"+t.toUpperCase()]:s===!1||(s=process.env[s]),e[t]||s||wr[t]},Wa=function(){switch(process.env.PGSSLMODE){case"disable":return!1;case"prefer":case"require":case"verify-ca":case"verify-full":return!0;case"no-verify":return{rejectUnauthorized:!1}}return wr.ssl},Ce=function(t){return"'"+(""+t).replace(/\\/g,"\\\\").replace(/'/g,"\\'")+"'"},te=function(t,e,s){var r=e[s];r!=null&&t.push(s+"="+Ce(r))},kt=class{constructor(e){e=typeof e=="string"?jr(e):e||{},e.connectionString&&(e=Object.assign({},e,jr(e.connectionString))),this.user=q("user",e),this.database=q("database",e),this.database===void 0&&(this.database=this.user),this.port=parseInt(q("port",e),10),this.host=q("host",e),Object.defineProperty(this,"password",{configurable:!0,enumerable:!1,writable:!0,value:q("password",e)}),this.binary=q("binary",e),this.options=q("options",e),this.ssl=typeof e.ssl>"u"?Wa():e.ssl,typeof this.ssl=="string"&&this.ssl==="true"&&(this.ssl=!0),this.ssl==="no-verify"&&(this.ssl={rejectUnauthorized:!1}),this.ssl&&this.ssl.key&&Object.defineProperty(this.ssl,"key",{enumerable:!1}),this.client_encoding=q("client_encoding",e),this.replication=q("replication",e),this.isDomainSocket=!(this.host||"").indexOf("/"),this.application_name=q("application_name",e,"PGAPPNAME"),this.fallback_application_name=q("fallback_application_name",e,!1),this.statement_timeout=q("statement_timeout",e,!1),this.lock_timeout=q("lock_timeout",e,!1),this.idle_in_transaction_session_timeout=q("idle_in_transaction_session_timeout",e,!1),this.query_timeout=q("query_timeout",e,!1),e.connectionTimeoutMillis===void 0?this.connect_timeout=process.env.PGCONNECT_TIMEOUT||0:this.connect_timeout=Math.floor(e.connectionTimeoutMillis/1e3),e.keepAlive===!1?this.keepalives=0:e.keepAlive===!0&&(this.keepalives=1),typeof e.keepAliveInitialDelayMillis=="number"&&(this.keepalives_idle=Math.floor(e.keepAliveInitialDelayMillis/1e3))}getLibpqConnectionString(e){var s=[];te(s,this,"user"),te(s,this,"password"),te(s,this,"port"),te(s,this,"application_name"),te(s,this,"fallback_application_name"),te(s,this,"connect_timeout"),te(s,this,"options");var r=typeof this.ssl=="object"?this.ssl:this.ssl?{sslmode:this.ssl}:{};if(te(s,r,"sslmode"),te(s,r,"sslca"),te(s,r,"sslkey"),te(s,r,"sslcert"),te(s,r,"sslrootcert"),this.database&&s.push("dbname="+Ce(this.database)),this.replication&&s.push("replication="+Ce(this.replication)),this.host&&s.push("host="+Ce(this.host)),this.isDomainSocket)return e(null,s.join(" "));this.client_encoding&&s.push("client_encoding="+Ce(this.client_encoding)),qa.lookup(this.host,function(i,n){return i?e(i,null):(s.push("hostaddr="+Ce(n)),e(null,s.join(" ")))})}};Pr.exports=kt});var kr=N((qc,Mr)=>{"use strict";var Ga=xe(),Hr=/^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/,Bt=class{constructor(e,s){this.command=null,this.rowCount=null,this.oid=null,this.rows=[],this.fields=[],this._parsers=void 0,this._types=s,this.RowCtor=null,this.rowAsArray=e==="array",this.rowAsArray&&(this.parseRow=this._parseRowAsArray),this._prebuiltEmptyResultObject=null}addCommandComplete(e){var s;e.text?s=Hr.exec(e.text):s=Hr.exec(e.command),s&&(this.command=s[1],s[3]?(this.oid=parseInt(s[2],10),this.rowCount=parseInt(s[3],10)):s[2]&&(this.rowCount=parseInt(s[2],10)))}_parseRowAsArray(e){for(var s=new Array(e.length),r=0,i=e.length;r<i;r++){var n=e[r];n!==null?s[r]=this._parsers[r](n):s[r]=null}return s}parseRow(e){for(var s={...this._prebuiltEmptyResultObject},r=0,i=e.length;r<i;r++){var n=e[r],a=this.fields[r].name;n!==null?s[a]=this._parsers[r](n):s[a]=null}return s}addRow(e){this.rows.push(e)}addFields(e){this.fields=e,this.fields.length&&(this._parsers=new Array(e.length));for(var s={},r=0;r<e.length;r++){var i=e[r];s[i.name]=null,this._types?this._parsers[r]=this._types.getTypeParser(i.dataTypeID,i.format||"text"):this._parsers[r]=Ga.getTypeParser(i.dataTypeID,i.format||"text")}this._prebuiltEmptyResultObject={...s}}};Mr.exports=Bt});var Wr=N((Wc,qr)=>{"use strict";var{EventEmitter:$a}=S("events"),xr=kr(),Br=qe(),qt=class extends $a{constructor(e,s,r){super(),e=Br.normalizeQueryConfig(e,s,r),this.text=e.text,this.values=e.values,this.rows=e.rows,this.types=e.types,this.name=e.name,this.queryMode=e.queryMode,this.binary=e.binary,this.portal=e.portal||"",this.callback=e.callback,this._rowMode=e.rowMode,process.domain&&e.callback&&(this.callback=process.domain.bind(e.callback)),this._result=new xr(this._rowMode,this.types),this._results=this._result,this._canceledDueToError=!1}requiresPreparation(){return this.queryMode==="extended"||this.name||this.rows?!0:!this.text||!this.values?!1:this.values.length>0}_checkForMultirow(){this._result.command&&(Array.isArray(this._results)||(this._results=[this._result]),this._result=new xr(this._rowMode,this._result._types),this._results.push(this._result))}handleRowDescription(e){this._checkForMultirow(),this._result.addFields(e.fields),this._accumulateRows=this.callback||!this.listeners("row").length}handleDataRow(e){let s;if(!this._canceledDueToError){try{s=this._result.parseRow(e.fields)}catch(r){this._canceledDueToError=r;return}this.emit("row",s,this._result),this._accumulateRows&&this._result.addRow(s)}}handleCommandComplete(e,s){this._checkForMultirow(),this._result.addCommandComplete(e),this.rows&&s.sync()}handleEmptyQuery(e){this.rows&&e.sync()}handleError(e,s){if(this._canceledDueToError&&(e=this._canceledDueToError,this._canceledDueToError=!1),this.callback)return this.callback(e);this.emit("error",e)}handleReadyForQuery(e){if(this._canceledDueToError)return this.handleError(this._canceledDueToError,e);if(this.callback)try{this.callback(null,this._results)}catch(s){process.nextTick(()=>{throw s})}this.emit("end",this._results)}submit(e){if(typeof this.text!="string"&&typeof this.name!="string")return new Error("A query must have either text or a name. Supplying neither is unsupported.");let s=e.parsedStatements[this.name];return this.text&&s&&this.text!==s?new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`):this.values&&!Array.isArray(this.values)?new Error("Query values must be an array"):(this.requiresPreparation()?this.prepare(e):e.query(this.text),null)}hasBeenParsed(e){return this.name&&e.parsedStatements[this.name]}handlePortalSuspended(e){this._getRows(e,this.rows)}_getRows(e,s){e.execute({portal:this.portal,rows:s}),s?e.flush():e.sync()}prepare(e){this.hasBeenParsed(e)||e.parse({text:this.text,name:this.name,types:this.types});try{e.bind({portal:this.portal,statement:this.name,values:this.values,binary:this.binary,valueMapper:Br.prepareValue})}catch(s){this.handleError(s,e);return}e.describe({type:"P",name:this.portal||""}),this._getRows(e,this.rows)}handleCopyInResponse(e){e.sendCopyFail("No source stream defined")}handleCopyData(e,s){}};qr.exports=qt});var rs=N(d=>{"use strict";Object.defineProperty(d,"__esModule",{value:!0});d.NoticeMessage=d.DataRowMessage=d.CommandCompleteMessage=d.ReadyForQueryMessage=d.NotificationResponseMessage=d.BackendKeyDataMessage=d.AuthenticationMD5Password=d.ParameterStatusMessage=d.ParameterDescriptionMessage=d.RowDescriptionMessage=d.Field=d.CopyResponse=d.CopyDataMessage=d.DatabaseError=d.copyDone=d.emptyQuery=d.replicationStart=d.portalSuspended=d.noData=d.closeComplete=d.bindComplete=d.parseComplete=void 0;d.parseComplete={name:"parseComplete",length:5};d.bindComplete={name:"bindComplete",length:5};d.closeComplete={name:"closeComplete",length:5};d.noData={name:"noData",length:5};d.portalSuspended={name:"portalSuspended",length:5};d.replicationStart={name:"replicationStart",length:4};d.emptyQuery={name:"emptyQuery",length:4};d.copyDone={name:"copyDone",length:4};var Wt=class extends Error{constructor(e,s,r){super(e),this.length=s,this.name=r}};d.DatabaseError=Wt;var Gt=class{constructor(e,s){this.length=e,this.chunk=s,this.name="copyData"}};d.CopyDataMessage=Gt;var $t=class{constructor(e,s,r,i){this.length=e,this.name=s,this.binary=r,this.columnTypes=new Array(i)}};d.CopyResponse=$t;var Yt=class{constructor(e,s,r,i,n,a,o){this.name=e,this.tableID=s,this.columnID=r,this.dataTypeID=i,this.dataTypeSize=n,this.dataTypeModifier=a,this.format=o}};d.Field=Yt;var Kt=class{constructor(e,s){this.length=e,this.fieldCount=s,this.name="rowDescription",this.fields=new Array(this.fieldCount)}};d.RowDescriptionMessage=Kt;var Vt=class{constructor(e,s){this.length=e,this.parameterCount=s,this.name="parameterDescription",this.dataTypeIDs=new Array(this.parameterCount)}};d.ParameterDescriptionMessage=Vt;var zt=class{constructor(e,s,r){this.length=e,this.parameterName=s,this.parameterValue=r,this.name="parameterStatus"}};d.ParameterStatusMessage=zt;var Xt=class{constructor(e,s){this.length=e,this.salt=s,this.name="authenticationMD5Password"}};d.AuthenticationMD5Password=Xt;var Jt=class{constructor(e,s,r){this.length=e,this.processID=s,this.secretKey=r,this.name="backendKeyData"}};d.BackendKeyDataMessage=Jt;var Qt=class{constructor(e,s,r,i){this.length=e,this.processId=s,this.channel=r,this.payload=i,this.name="notification"}};d.NotificationResponseMessage=Qt;var Zt=class{constructor(e,s){this.length=e,this.status=s,this.name="readyForQuery"}};d.ReadyForQueryMessage=Zt;var es=class{constructor(e,s){this.length=e,this.text=s,this.name="commandComplete"}};d.CommandCompleteMessage=es;var ts=class{constructor(e,s){this.length=e,this.fields=s,this.name="dataRow",this.fieldCount=s.length}};d.DataRowMessage=ts;var ss=class{constructor(e,s){this.length=e,this.message=s,this.name="notice"}};d.NoticeMessage=ss});var Gr=N(st=>{"use strict";Object.defineProperty(st,"__esModule",{value:!0});st.Writer=void 0;var is=class{constructor(e=256){this.size=e,this.offset=5,this.headerPosition=0,this.buffer=Buffer.allocUnsafe(e)}ensure(e){if(this.buffer.length-this.offset<e){let r=this.buffer,i=r.length+(r.length>>1)+e;this.buffer=Buffer.allocUnsafe(i),r.copy(this.buffer,0,0,this.offset)}}addInt32(e){return this.ensure(4),this.buffer[this.offset++]=e>>>24&255,this.buffer[this.offset++]=e>>>16&255,this.buffer[this.offset++]=e>>>8&255,this.buffer[this.offset++]=e>>>0&255,this}addInt16(e){return this.ensure(2),this.buffer[this.offset++]=e>>>8&255,this.buffer[this.offset++]=e>>>0&255,this}addCString(e){if(!e)this.ensure(1);else{let s=Buffer.byteLength(e);this.ensure(s+1),this.buffer.write(e,this.offset,"utf-8"),this.offset+=s}return this.buffer[this.offset++]=0,this}addString(e=""){let s=Buffer.byteLength(e);return this.ensure(s),this.buffer.write(e,this.offset),this.offset+=s,this}addInt32PrefixedString(e){let s=Buffer.byteLength(e);this.ensure(4+s);let r=this.buffer,i=this.offset;return r[i++]=s>>>24&255,r[i++]=s>>>16&255,r[i++]=s>>>8&255,r[i++]=s>>>0&255,r.write(e,i,"utf-8"),this.offset=i+s,this}add(e){return this.ensure(e.length),e.copy(this.buffer,this.offset),this.offset+=e.length,this}reserveUnsafe(e){let s=this.offset;return this.ensure(e),this.offset+=e,s}join(e){if(e){this.buffer[this.headerPosition]=e;let s=this.offset-(this.headerPosition+1);this.buffer.writeInt32BE(s,this.headerPosition+1)}return this.buffer.slice(e?0:5,this.offset)}flush(e){let s=this.join(e);return this.offset=5,this.headerPosition=0,this.buffer=Buffer.allocUnsafe(this.size),s}clear(){this.offset=5,this.headerPosition=0}};st.Writer=is});var Kr=N(it=>{"use strict";Object.defineProperty(it,"__esModule",{value:!0});it.serialize=void 0;var $r=Gr(),v=new $r.Writer,Ya=t=>{v.addInt16(3).addInt16(0);for(let r of Object.keys(t))v.addCString(r).addCString(t[r]);v.addCString("client_encoding").addCString("UTF8");let e=v.addCString("").flush(),s=e.length+4;return new $r.Writer().addInt32(s).add(e).flush()},Ka=()=>{let t=Buffer.allocUnsafe(8);return t.writeInt32BE(8,0),t.writeInt32BE(80877103,4),t},Va=t=>v.addCString(t).flush(112),za=function(t,e){return v.addCString(t).addInt32PrefixedString(e),v.flush(112)},Xa=function(t){return v.addString(t).flush(112)},Ja=t=>v.addCString(t).flush(81),Yr=[],Qa=t=>{let e=t.name||"";e.length>63&&(console.error("Warning! Postgres only supports 63 characters for query names."),console.error("You supplied %s (%s)",e,e.length),console.error("This can cause conflicts and silent errors executing queries"));let s=t.types||Yr,r=s.length,i=v.addCString(e).addCString(t.text).addInt16(r);for(let n=0;n<r;n++)i.addInt32(s[n]);return v.flush(80)},Za=function(t,e,s){let r=t.length;for(let i=0;i<r;i++){let n=e?e(t[i],i):t[i],a=0;n==null?v.addInt32(-1):n instanceof Buffer?(a=1,v.addInt32(n.length),v.add(n)):v.addInt32PrefixedString(n);let o=v.buffer;o[s++]=0,o[s++]=a}},eo=(t={})=>{let e=t.portal||"",s=t.statement||"",r=t.binary||!1,i=t.values||Yr,n=i.length;v.addCString(e).addCString(s),v.addInt16(n);let a=v.reserveUnsafe(n*2);v.addInt16(n);try{Za(i,t.valueMapper,a)}catch(o){throw v.clear(),o}return v.addInt16(1),v.addInt16(r?1:0),v.flush(66)},to=Buffer.from([69,0,0,0,9,0,0,0,0,0]),so=t=>{if(!t||!t.portal&&!t.rows)return to;let e=t.portal||"",s=t.rows||0,r=Buffer.byteLength(e),i=4+r+1+4,n=Buffer.allocUnsafe(1+i);return n[0]=69,n.writeInt32BE(i,1),n.write(e,5,"utf-8"),n[r+5]=0,n.writeUInt32BE(s,n.length-4),n},ro=(t,e)=>{let s=Buffer.allocUnsafe(16);return s.writeInt32BE(16,0),s.writeInt16BE(1234,4),s.writeInt16BE(5678,6),s.writeInt32BE(t,8),s.writeInt32BE(e,12),s},ns=(t,e)=>{let r=4+Buffer.byteLength(e)+1,i=Buffer.allocUnsafe(1+r);return i[0]=t,i.writeInt32BE(r,1),i.write(e,5,"utf-8"),i[r]=0,i},io=v.addCString("P").flush(68),no=v.addCString("S").flush(68),ao=t=>t.name?ns(68,`${t.type}${t.name||""}`):t.type==="P"?io:no,oo=t=>{let e=`${t.type}${t.name||""}`;return ns(67,e)},_o=t=>v.add(t).flush(100),co=t=>ns(102,t),rt=t=>Buffer.from([t,0,0,0,4]),Eo=rt(72),lo=rt(83),uo=rt(88),No=rt(99),po={startup:Ya,password:Va,requestSsl:Ka,sendSASLInitialResponseMessage:za,sendSCRAMClientFinalMessage:Xa,query:Ja,parse:Qa,bind:eo,execute:so,describe:ao,close:oo,flush:()=>Eo,sync:()=>lo,end:()=>uo,copyData:_o,copyDone:()=>No,copyFail:co,cancel:ro};it.serialize=po});var Vr=N(nt=>{"use strict";Object.defineProperty(nt,"__esModule",{value:!0});nt.BufferReader=void 0;var as=class{constructor(e=0){this.offset=e,this.buffer=Buffer.allocUnsafe(0),this.encoding="utf-8"}setBuffer(e,s){this.offset=e,this.buffer=s}int16(){let e=this.buffer.readInt16BE(this.offset);return this.offset+=2,e}byte(){let e=this.buffer[this.offset];return this.offset++,e}int32(){let e=this.buffer.readInt32BE(this.offset);return this.offset+=4,e}uint32(){let e=this.buffer.readUInt32BE(this.offset);return this.offset+=4,e}string(e){let s=this.buffer.toString(this.encoding,this.offset,this.offset+e);return this.offset+=e,s}cstring(){let e=this.offset,s=e;for(;this.buffer[s++];);return this.offset=s,this.buffer.toString(this.encoding,e,s-1)}bytes(e){let s=this.buffer.slice(this.offset,this.offset+e);return this.offset+=e,s}};nt.BufferReader=as});var Qr=N(at=>{"use strict";Object.defineProperty(at,"__esModule",{value:!0});at.Parser=void 0;var g=rs(),ho=Vr(),_s=1,To=4,zr=_s+To,J=-1,os=Buffer.allocUnsafe(0),cs=class{constructor(e){if(this.buffer=os,this.bufferLength=0,this.bufferOffset=0,this.reader=new ho.BufferReader,e?.mode==="binary")throw new Error("Binary mode not supported yet");this.mode=e?.mode||"text"}parse(e,s){this.mergeBuffer(e);let r=this.bufferOffset+this.bufferLength,i=this.bufferOffset;for(;i+zr<=r;){let n=this.buffer[i],a=this.buffer.readUInt32BE(i+_s),o=_s+a;if(o+i<=r){let E=this.handlePacket(i+zr,n,a,this.buffer);s(E),i+=o}else break}i===r?(this.buffer=os,this.bufferLength=0,this.bufferOffset=0):(this.bufferLength=r-i,this.bufferOffset=i)}mergeBuffer(e){if(this.bufferLength>0){let s=this.bufferLength+e.byteLength;if(s+this.bufferOffset>this.buffer.byteLength){let i;if(s<=this.buffer.byteLength&&this.bufferOffset>=this.bufferLength)i=this.buffer;else{let n=this.buffer.byteLength*2;for(;s>=n;)n*=2;i=Buffer.allocUnsafe(n)}this.buffer.copy(i,0,this.bufferOffset,this.bufferOffset+this.bufferLength),this.buffer=i,this.bufferOffset=0}e.copy(this.buffer,this.bufferOffset+this.bufferLength),this.bufferLength=s}else this.buffer=e,this.bufferOffset=0,this.bufferLength=e.byteLength}handlePacket(e,s,r,i){let{reader:n}=this;n.setBuffer(e,i);let a;switch(s){case 50:a=g.bindComplete;break;case 49:a=g.parseComplete;break;case 51:a=g.closeComplete;break;case 110:a=g.noData;break;case 115:a=g.portalSuspended;break;case 99:a=g.copyDone;break;case 87:a=g.replicationStart;break;case 73:a=g.emptyQuery;break;case 68:a=go(n);break;case 67:a=Ro(n);break;case 90:a=mo(n);break;case 65:a=Oo(n);break;case 82:a=Co(n,r);break;case 83:a=So(n);break;case 75:a=yo(n);break;case 69:a=Xr(n,"error");break;case 78:a=Xr(n,"notice");break;case 84:a=bo(n);break;case 116:a=Ao(n);break;case 71:a=vo(n);break;case 72:a=Io(n);break;case 100:a=fo(n,r);break;default:return new g.DatabaseError("received invalid response: "+s.toString(16),r,"error")}return n.setBuffer(0,os),a.length=r,a}};at.Parser=cs;var mo=t=>{let e=t.string(1);return new g.ReadyForQueryMessage(J,e)},Ro=t=>{let e=t.cstring();return new g.CommandCompleteMessage(J,e)},fo=(t,e)=>{let s=t.bytes(e-4);return new g.CopyDataMessage(J,s)},vo=t=>Jr(t,"copyInResponse"),Io=t=>Jr(t,"copyOutResponse"),Jr=(t,e)=>{let s=t.byte()!==0,r=t.int16(),i=new g.CopyResponse(J,e,s,r);for(let n=0;n<r;n++)i.columnTypes[n]=t.int16();return i},Oo=t=>{let e=t.int32(),s=t.cstring(),r=t.cstring();return new g.NotificationResponseMessage(J,e,s,r)},bo=t=>{let e=t.int16(),s=new g.RowDescriptionMessage(J,e);for(let r=0;r<e;r++)s.fields[r]=Lo(t);return s},Lo=t=>{let e=t.cstring(),s=t.uint32(),r=t.int16(),i=t.uint32(),n=t.int16(),a=t.int32(),o=t.int16()===0?"text":"binary";return new g.Field(e,s,r,i,n,a,o)},Ao=t=>{let e=t.int16(),s=new g.ParameterDescriptionMessage(J,e);for(let r=0;r<e;r++)s.dataTypeIDs[r]=t.uint32();return s},go=t=>{let e=t.int16(),s=new Array(e);for(let r=0;r<e;r++){let i=t.int32();s[r]=i===-1?null:t.string(i)}return new g.DataRowMessage(J,s)},So=t=>{let e=t.cstring(),s=t.cstring();return new g.ParameterStatusMessage(J,e,s)},yo=t=>{let e=t.int32(),s=t.int32();return new g.BackendKeyDataMessage(J,e,s)},Co=(t,e)=>{let s=t.int32(),r={name:"authenticationOk",length:e};switch(s){case 0:break;case 3:r.length===8&&(r.name="authenticationCleartextPassword");break;case 5:if(r.length===12){r.name="authenticationMD5Password";let i=t.bytes(4);return new g.AuthenticationMD5Password(J,i)}break;case 10:{r.name="authenticationSASL",r.mechanisms=[];let i;do i=t.cstring(),i&&r.mechanisms.push(i);while(i)}break;case 11:r.name="authenticationSASLContinue",r.data=t.string(e-8);break;case 12:r.name="authenticationSASLFinal",r.data=t.string(e-8);break;default:throw new Error("Unknown authenticationOk message type "+s)}return r},Xr=(t,e)=>{let s={},r=t.string(1);for(;r!=="\0";)s[r]=t.cstring(),r=t.string(1);let i=s.M,n=e==="notice"?new g.NoticeMessage(J,i):new g.DatabaseError(i,J,e);return n.severity=s.S,n.code=s.C,n.detail=s.D,n.hint=s.H,n.position=s.P,n.internalPosition=s.p,n.internalQuery=s.q,n.where=s.W,n.schema=s.s,n.table=s.t,n.column=s.c,n.dataType=s.d,n.constraint=s.n,n.file=s.F,n.line=s.L,n.routine=s.R,n}});var Es=N(Re=>{"use strict";Object.defineProperty(Re,"__esModule",{value:!0});Re.DatabaseError=Re.serialize=void 0;Re.parse=jo;var Do=rs();Object.defineProperty(Re,"DatabaseError",{enumerable:!0,get:function(){return Do.DatabaseError}});var Fo=Kr();Object.defineProperty(Re,"serialize",{enumerable:!0,get:function(){return Fo.serialize}});var Uo=Qr();function jo(t,e){let s=new Uo.Parser;return t.on("data",r=>s.parse(r,e)),new Promise(r=>t.on("end",()=>r()))}});var Zr=N(ls=>{"use strict";Object.defineProperty(ls,"__esModule",{value:!0});ls.default={}});var ti=N((Jc,ei)=>{var{getStream:wo,getSecureStream:Po}=xo();ei.exports={getStream:wo,getSecureStream:Po};function Ho(){function t(s){let r=S("net");return new r.Socket}function e(s){var r=S("tls");return r.connect(s)}return{getStream:t,getSecureStream:e}}function Mo(){function t(s){let{CloudflareSocket:r}=Zr();return new r(s)}function e(s){return s.socket.startTls(s),s.socket}return{getStream:t,getSecureStream:e}}function ko(){if(typeof navigator=="object"&&navigator!==null&&typeof navigator.userAgent=="string")return navigator.userAgent==="Cloudflare-Workers";if(typeof Response=="function"){let t=new Response(null,{cf:{thing:!0}});if(typeof t.cf=="object"&&t.cf!==null&&t.cf.thing)return!0}return!1}function xo(){return ko()?Mo():Ho()}});var ds=N((Qc,si)=>{"use strict";var Bo=S("events").EventEmitter,{parse:qo,serialize:F}=Es(),{getStream:Wo,getSecureStream:Go}=ti(),$o=F.flush(),Yo=F.sync(),Ko=F.end(),us=class extends Bo{constructor(e){super(),e=e||{},this.stream=e.stream||Wo(e.ssl),typeof this.stream=="function"&&(this.stream=this.stream(e)),this._keepAlive=e.keepAlive,this._keepAliveInitialDelayMillis=e.keepAliveInitialDelayMillis,this.lastBuffer=!1,this.parsedStatements={},this.ssl=e.ssl||!1,this._ending=!1,this._emitMessage=!1;var s=this;this.on("newListener",function(r){r==="message"&&(s._emitMessage=!0)})}connect(e,s){var r=this;this._connecting=!0,this.stream.setNoDelay(!0),this.stream.connect(e,s),this.stream.once("connect",function(){r._keepAlive&&r.stream.setKeepAlive(!0,r._keepAliveInitialDelayMillis),r.emit("connect")});let i=function(n){r._ending&&(n.code==="ECONNRESET"||n.code==="EPIPE")||r.emit("error",n)};if(this.stream.on("error",i),this.stream.on("close",function(){r.emit("end")}),!this.ssl)return this.attachListeners(this.stream);this.stream.once("data",function(n){var a=n.toString("utf8");switch(a){case"S":break;case"N":return r.stream.end(),r.emit("error",new Error("The server does not support SSL connections"));default:return r.stream.end(),r.emit("error",new Error("There was an error establishing an SSL connection"))}let o={socket:r.stream};r.ssl!==!0&&(Object.assign(o,r.ssl),"key"in r.ssl&&(o.key=r.ssl.key));var E=S("net");E.isIP&&E.isIP(s)===0&&(o.servername=s);try{r.stream=Go(o)}catch(_){return r.emit("error",_)}r.attachListeners(r.stream),r.stream.on("error",i),r.emit("sslconnect")})}attachListeners(e){qo(e,s=>{var r=s.name==="error"?"errorMessage":s.name;this._emitMessage&&this.emit("message",s),this.emit(r,s)})}requestSsl(){this.stream.write(F.requestSsl())}startup(e){this.stream.write(F.startup(e))}cancel(e,s){this._send(F.cancel(e,s))}password(e){this._send(F.password(e))}sendSASLInitialResponseMessage(e,s){this._send(F.sendSASLInitialResponseMessage(e,s))}sendSCRAMClientFinalMessage(e){this._send(F.sendSCRAMClientFinalMessage(e))}_send(e){return this.stream.writable?this.stream.write(e):!1}query(e){this._send(F.query(e))}parse(e){this._send(F.parse(e))}bind(e){this._send(F.bind(e))}execute(e){this._send(F.execute(e))}flush(){this.stream.writable&&this.stream.write($o)}sync(){this._ending=!0,this._send(Yo)}ref(){this.stream.ref()}unref(){this.stream.unref()}end(){if(this._ending=!0,!this._connecting||!this.stream.writable){this.stream.end();return}return this.stream.write(Ko,()=>{this.stream.end()})}close(e){this._send(F.close(e))}describe(e){this._send(F.describe(e))}sendCopyFromChunk(e){this._send(F.copyData(e))}endCopyFrom(){this._send(F.copyDone())}sendCopyFail(e){this._send(F.copyFail(e))}};si.exports=us});var ni=N((Zc,ue)=>{"use strict";var ri=S("path"),Vo=S("stream").Stream,zo=S("readline").createInterface,ii=S("util"),Xo=5432,ot=process.platform==="win32",Ge=process.stderr,Jo=56,Qo=7,Zo=61440,e_=32768;function t_(t){return(t&Zo)==e_}var De=["host","port","database","user","password"],Ns=De.length,s_=De[Ns-1];function ps(){var t=Ge instanceof Vo&&Ge.writable===!0;if(t){var e=Array.prototype.slice.call(arguments).concat(`
`);Ge.write(ii.format.apply(ii,e))}}Object.defineProperty(ue.exports,"isWin",{get:function(){return ot},set:function(t){ot=t}});ue.exports.warnTo=function(t){var e=Ge;return Ge=t,e};ue.exports.getFileName=function(t){var e=t||process.env,s=e.PGPASSFILE||(ot?ri.join(e.APPDATA||"./","postgresql","pgpass.conf"):ri.join(e.HOME||"./",".pgpass"));return s};ue.exports.usePgPass=function(t,e){return Object.prototype.hasOwnProperty.call(process.env,"PGPASSWORD")?!1:ot?!0:(e=e||"<unkn>",t_(t.mode)?t.mode&(Jo|Qo)?(ps('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less',e),!1):!0:(ps('WARNING: password file "%s" is not a plain file',e),!1))};var r_=ue.exports.match=function(t,e){return De.slice(0,-1).reduce(function(s,r,i){return i==1&&Number(t[r]||Xo)===Number(e[r])?s&&!0:s&&(e[r]==="*"||e[r]===t[r])},!0)};ue.exports.getPassword=function(t,e,s){var r,i=!1,n=zo({input:e,crlfDelay:1/0});function a(c){i=!0,e.destroy(),s(c)}function o(c){var l=i_(c);l&&n_(l)&&r_(t,l)&&(r=l[s_],n.close())}var E=function(){i||a(r)},_=function(c){i||(ps("WARNING: error on reading file: %s",c),a(void 0))};e.on("error",_),n.on("line",o).on("close",E).on("error",_)};var i_=ue.exports.parseLine=function(t){if(t.length<11||t.match(/^\s+#/))return null;for(var e="",s="",r=0,i=0,n=0,a={},o=!1,E=function(c,l,u){var p=t.substring(l,u);Object.hasOwnProperty.call(process.env,"PGPASS_NO_DEESCAPE")||(p=p.replace(/\\([:\\])/g,"$1")),a[De[c]]=p},_=0;_<t.length-1;_+=1){if(e=t.charAt(_+1),s=t.charAt(_),o=r==Ns-1,o){E(r,i);break}_>=0&&e==":"&&s!=="\\"&&(E(r,i,_+1),i=_+2,r+=1)}return a=Object.keys(a).length===Ns?a:null,a},n_=ue.exports.isValidEntry=function(t){for(var e={0:function(a){return a.length>0},1:function(a){return a==="*"?!0:(a=Number(a),isFinite(a)&&a>0&&a<9007199254740992&&Math.floor(a)===a)},2:function(a){return a.length>0},3:function(a){return a.length>0},4:function(a){return a.length>0}},s=0;s<De.length;s+=1){var r=e[s],i=t[De[s]]||"",n=r(i);if(!n)return!1}return!0}});var oi=N((tE,hs)=>{"use strict";var eE=S("path"),ai=S("fs"),_t=ni();hs.exports=function(t,e){var s=_t.getFileName();ai.stat(s,function(r,i){if(r||!_t.usePgPass(i,s))return e(void 0);var n=ai.createReadStream(s);_t.getPassword(t,n,e)})};hs.exports.warnTo=_t.warnTo});var li=N((sE,Ei)=>{"use strict";var a_=S("events").EventEmitter,_i=qe(),Ts=yr(),o_=Ht(),__=xt(),ci=Wr(),c_=Be(),E_=ds(),l_=Pt(),ct=class extends a_{constructor(e){super(),this.connectionParameters=new __(e),this.user=this.connectionParameters.user,this.database=this.connectionParameters.database,this.port=this.connectionParameters.port,this.host=this.connectionParameters.host,Object.defineProperty(this,"password",{configurable:!0,enumerable:!1,writable:!0,value:this.connectionParameters.password}),this.replication=this.connectionParameters.replication;var s=e||{};this._Promise=s.Promise||global.Promise,this._types=new o_(s.types),this._ending=!1,this._ended=!1,this._connecting=!1,this._connected=!1,this._connectionError=!1,this._queryable=!0,this.connection=s.connection||new E_({stream:s.stream,ssl:this.connectionParameters.ssl,keepAlive:s.keepAlive||!1,keepAliveInitialDelayMillis:s.keepAliveInitialDelayMillis||0,encoding:this.connectionParameters.client_encoding||"utf8"}),this.queryQueue=[],this.binary=s.binary||c_.binary,this.processID=null,this.secretKey=null,this.ssl=this.connectionParameters.ssl||!1,this.ssl&&this.ssl.key&&Object.defineProperty(this.ssl,"key",{enumerable:!1}),this._connectionTimeoutMillis=s.connectionTimeoutMillis||0}_errorAllQueries(e){let s=r=>{process.nextTick(()=>{r.handleError(e,this.connection)})};this.activeQuery&&(s(this.activeQuery),this.activeQuery=null),this.queryQueue.forEach(s),this.queryQueue.length=0}_connect(e){var s=this,r=this.connection;if(this._connectionCallback=e,this._connecting||this._connected){let i=new Error("Client has already been connected. You cannot reuse a client.");process.nextTick(()=>{e(i)});return}this._connecting=!0,this._connectionTimeoutMillis>0&&(this.connectionTimeoutHandle=setTimeout(()=>{r._ending=!0,r.stream.destroy(new Error("timeout expired"))},this._connectionTimeoutMillis)),this.host&&this.host.indexOf("/")===0?r.connect(this.host+"/.s.PGSQL."+this.port):r.connect(this.port,this.host),r.on("connect",function(){s.ssl?r.requestSsl():r.startup(s.getStartupConf())}),r.on("sslconnect",function(){r.startup(s.getStartupConf())}),this._attachListeners(r),r.once("end",()=>{let i=this._ending?new Error("Connection terminated"):new Error("Connection terminated unexpectedly");clearTimeout(this.connectionTimeoutHandle),this._errorAllQueries(i),this._ended=!0,this._ending||(this._connecting&&!this._connectionError?this._connectionCallback?this._connectionCallback(i):this._handleErrorEvent(i):this._connectionError||this._handleErrorEvent(i)),process.nextTick(()=>{this.emit("end")})})}connect(e){if(e){this._connect(e);return}return new this._Promise((s,r)=>{this._connect(i=>{i?r(i):s()})})}_attachListeners(e){e.on("authenticationCleartextPassword",this._handleAuthCleartextPassword.bind(this)),e.on("authenticationMD5Password",this._handleAuthMD5Password.bind(this)),e.on("authenticationSASL",this._handleAuthSASL.bind(this)),e.on("authenticationSASLContinue",this._handleAuthSASLContinue.bind(this)),e.on("authenticationSASLFinal",this._handleAuthSASLFinal.bind(this)),e.on("backendKeyData",this._handleBackendKeyData.bind(this)),e.on("error",this._handleErrorEvent.bind(this)),e.on("errorMessage",this._handleErrorMessage.bind(this)),e.on("readyForQuery",this._handleReadyForQuery.bind(this)),e.on("notice",this._handleNotice.bind(this)),e.on("rowDescription",this._handleRowDescription.bind(this)),e.on("dataRow",this._handleDataRow.bind(this)),e.on("portalSuspended",this._handlePortalSuspended.bind(this)),e.on("emptyQuery",this._handleEmptyQuery.bind(this)),e.on("commandComplete",this._handleCommandComplete.bind(this)),e.on("parseComplete",this._handleParseComplete.bind(this)),e.on("copyInResponse",this._handleCopyInResponse.bind(this)),e.on("copyData",this._handleCopyData.bind(this)),e.on("notification",this._handleNotification.bind(this))}_checkPgPass(e){let s=this.connection;if(typeof this.password=="function")this._Promise.resolve().then(()=>this.password()).then(r=>{if(r!==void 0){if(typeof r!="string"){s.emit("error",new TypeError("Password must be a string"));return}this.connectionParameters.password=this.password=r}else this.connectionParameters.password=this.password=null;e()}).catch(r=>{s.emit("error",r)});else if(this.password!==null)e();else try{oi()(this.connectionParameters,i=>{i!==void 0&&(this.connectionParameters.password=this.password=i),e()})}catch(r){this.emit("error",r)}}_handleAuthCleartextPassword(e){this._checkPgPass(()=>{this.connection.password(this.password)})}_handleAuthMD5Password(e){this._checkPgPass(async()=>{try{let s=await l_.postgresMd5PasswordHash(this.user,this.password,e.salt);this.connection.password(s)}catch(s){this.emit("error",s)}})}_handleAuthSASL(e){this._checkPgPass(()=>{try{this.saslSession=Ts.startSession(e.mechanisms),this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism,this.saslSession.response)}catch(s){this.connection.emit("error",s)}})}async _handleAuthSASLContinue(e){try{await Ts.continueSession(this.saslSession,this.password,e.data),this.connection.sendSCRAMClientFinalMessage(this.saslSession.response)}catch(s){this.connection.emit("error",s)}}_handleAuthSASLFinal(e){try{Ts.finalizeSession(this.saslSession,e.data),this.saslSession=null}catch(s){this.connection.emit("error",s)}}_handleBackendKeyData(e){this.processID=e.processID,this.secretKey=e.secretKey}_handleReadyForQuery(e){this._connecting&&(this._connecting=!1,this._connected=!0,clearTimeout(this.connectionTimeoutHandle),this._connectionCallback&&(this._connectionCallback(null,this),this._connectionCallback=null),this.emit("connect"));let{activeQuery:s}=this;this.activeQuery=null,this.readyForQuery=!0,s&&s.handleReadyForQuery(this.connection),this._pulseQueryQueue()}_handleErrorWhileConnecting(e){if(!this._connectionError){if(this._connectionError=!0,clearTimeout(this.connectionTimeoutHandle),this._connectionCallback)return this._connectionCallback(e);this.emit("error",e)}}_handleErrorEvent(e){if(this._connecting)return this._handleErrorWhileConnecting(e);this._queryable=!1,this._errorAllQueries(e),this.emit("error",e)}_handleErrorMessage(e){if(this._connecting)return this._handleErrorWhileConnecting(e);let s=this.activeQuery;if(!s){this._handleErrorEvent(e);return}this.activeQuery=null,s.handleError(e,this.connection)}_handleRowDescription(e){this.activeQuery.handleRowDescription(e)}_handleDataRow(e){this.activeQuery.handleDataRow(e)}_handlePortalSuspended(e){this.activeQuery.handlePortalSuspended(this.connection)}_handleEmptyQuery(e){this.activeQuery.handleEmptyQuery(this.connection)}_handleCommandComplete(e){if(this.activeQuery==null){let s=new Error("Received unexpected commandComplete message from backend.");this._handleErrorEvent(s);return}this.activeQuery.handleCommandComplete(e,this.connection)}_handleParseComplete(){if(this.activeQuery==null){let e=new Error("Received unexpected parseComplete message from backend.");this._handleErrorEvent(e);return}this.activeQuery.name&&(this.connection.parsedStatements[this.activeQuery.name]=this.activeQuery.text)}_handleCopyInResponse(e){this.activeQuery.handleCopyInResponse(this.connection)}_handleCopyData(e){this.activeQuery.handleCopyData(e,this.connection)}_handleNotification(e){this.emit("notification",e)}_handleNotice(e){this.emit("notice",e)}getStartupConf(){var e=this.connectionParameters,s={user:e.user,database:e.database},r=e.application_name||e.fallback_application_name;return r&&(s.application_name=r),e.replication&&(s.replication=""+e.replication),e.statement_timeout&&(s.statement_timeout=String(parseInt(e.statement_timeout,10))),e.lock_timeout&&(s.lock_timeout=String(parseInt(e.lock_timeout,10))),e.idle_in_transaction_session_timeout&&(s.idle_in_transaction_session_timeout=String(parseInt(e.idle_in_transaction_session_timeout,10))),e.options&&(s.options=e.options),s}cancel(e,s){if(e.activeQuery===s){var r=this.connection;this.host&&this.host.indexOf("/")===0?r.connect(this.host+"/.s.PGSQL."+this.port):r.connect(this.port,this.host),r.on("connect",function(){r.cancel(e.processID,e.secretKey)})}else e.queryQueue.indexOf(s)!==-1&&e.queryQueue.splice(e.queryQueue.indexOf(s),1)}setTypeParser(e,s,r){return this._types.setTypeParser(e,s,r)}getTypeParser(e,s){return this._types.getTypeParser(e,s)}escapeIdentifier(e){return _i.escapeIdentifier(e)}escapeLiteral(e){return _i.escapeLiteral(e)}_pulseQueryQueue(){if(this.readyForQuery===!0)if(this.activeQuery=this.queryQueue.shift(),this.activeQuery){this.readyForQuery=!1,this.hasExecuted=!0;let e=this.activeQuery.submit(this.connection);e&&process.nextTick(()=>{this.activeQuery.handleError(e,this.connection),this.readyForQuery=!0,this._pulseQueryQueue()})}else this.hasExecuted&&(this.activeQuery=null,this.emit("drain"))}query(e,s,r){var i,n,a,o,E;if(e==null)throw new TypeError("Client was passed a null or undefined query");return typeof e.submit=="function"?(a=e.query_timeout||this.connectionParameters.query_timeout,n=i=e,typeof s=="function"&&(i.callback=i.callback||s)):(a=e.query_timeout||this.connectionParameters.query_timeout,i=new ci(e,s,r),i.callback||(n=new this._Promise((_,c)=>{i.callback=(l,u)=>l?c(l):_(u)}).catch(_=>{throw Error.captureStackTrace(_),_}))),a&&(E=i.callback,o=setTimeout(()=>{var _=new Error("Query read timeout");process.nextTick(()=>{i.handleError(_,this.connection)}),E(_),i.callback=()=>{};var c=this.queryQueue.indexOf(i);c>-1&&this.queryQueue.splice(c,1),this._pulseQueryQueue()},a),i.callback=(_,c)=>{clearTimeout(o),E(_,c)}),this.binary&&!i.binary&&(i.binary=!0),i._result&&!i._result._types&&(i._result._types=this._types),this._queryable?this._ending?(process.nextTick(()=>{i.handleError(new Error("Client was closed and is not queryable"),this.connection)}),n):(this.queryQueue.push(i),this._pulseQueryQueue(),n):(process.nextTick(()=>{i.handleError(new Error("Client has encountered a connection error and is not queryable"),this.connection)}),n)}ref(){this.connection.ref()}unref(){this.connection.unref()}end(e){if(this._ending=!0,!this.connection._connecting||this._ended)if(e)e();else return this._Promise.resolve();if(this.activeQuery||!this._queryable?this.connection.stream.destroy():this.connection.end(),e)this.connection.once("end",e);else return new this._Promise(s=>{this.connection.once("end",s)})}};ct.Query=ci;Ei.exports=ct});var Ni=N((rE,di)=>{"use strict";var u_=S("events").EventEmitter,ms=function(){},ui=(t,e)=>{let s=t.findIndex(e);return s===-1?void 0:t.splice(s,1)[0]},Rs=class{constructor(e,s,r){this.client=e,this.idleListener=s,this.timeoutId=r}},Fe=class{constructor(e){this.callback=e}};function d_(){throw new Error("Release called on client which has already been released to the pool.")}function Et(t,e){if(e)return{callback:e,result:void 0};let s,r,i=function(a,o){a?s(a):r(o)},n=new t(function(a,o){r=a,s=o}).catch(a=>{throw Error.captureStackTrace(a),a});return{callback:i,result:n}}function N_(t,e){return function s(r){r.client=e,e.removeListener("error",s),e.on("error",()=>{t.log("additional client error after disconnection due to error",r)}),t._remove(e),t.emit("error",r,e)}}var fs=class extends u_{constructor(e,s){super(),this.options=Object.assign({},e),e!=null&&"password"in e&&Object.defineProperty(this.options,"password",{configurable:!0,enumerable:!1,writable:!0,value:e.password}),e!=null&&e.ssl&&e.ssl.key&&Object.defineProperty(this.options.ssl,"key",{enumerable:!1}),this.options.max=this.options.max||this.options.poolSize||10,this.options.min=this.options.min||0,this.options.maxUses=this.options.maxUses||1/0,this.options.allowExitOnIdle=this.options.allowExitOnIdle||!1,this.options.maxLifetimeSeconds=this.options.maxLifetimeSeconds||0,this.log=this.options.log||function(){},this.Client=this.options.Client||s||vs().Client,this.Promise=this.options.Promise||global.Promise,typeof this.options.idleTimeoutMillis>"u"&&(this.options.idleTimeoutMillis=1e4),this._clients=[],this._idle=[],this._expired=new WeakSet,this._pendingQueue=[],this._endCallback=void 0,this.ending=!1,this.ended=!1}_promiseTry(e){let s=this.Promise;return typeof s.try=="function"?s.try(e):new s(r=>r(e()))}_isFull(){return this._clients.length>=this.options.max}_isAboveMin(){return this._clients.length>this.options.min}_pulseQueue(){if(this.log("pulse queue"),this.ended){this.log("pulse queue ended");return}if(this.ending){this.log("pulse queue on ending"),this._idle.length&&this._idle.slice().map(s=>{this._remove(s.client)}),this._clients.length||(this.ended=!0,this._endCallback());return}if(!this._pendingQueue.length){this.log("no queued requests");return}if(!this._idle.length&&this._isFull())return;let e=this._pendingQueue.shift();if(this._idle.length){let s=this._idle.pop();clearTimeout(s.timeoutId);let r=s.client;r.ref&&r.ref();let i=s.idleListener;return this._acquireClient(r,e,i,!1)}if(!this._isFull())return this.newClient(e);throw new Error("unexpected condition")}_remove(e,s){let r=ui(this._idle,n=>n.client===e);r!==void 0&&clearTimeout(r.timeoutId),this._clients=this._clients.filter(n=>n!==e);let i=this;e.end(()=>{i.emit("remove",e),typeof s=="function"&&s()})}connect(e){if(this.ending){let i=new Error("Cannot use a pool after calling end on the pool");return e?e(i):this.Promise.reject(i)}let s=Et(this.Promise,e),r=s.result;if(this._isFull()||this._idle.length){if(this._idle.length&&process.nextTick(()=>this._pulseQueue()),!this.options.connectionTimeoutMillis)return this._pendingQueue.push(new Fe(s.callback)),r;let i=(o,E,_)=>{clearTimeout(a),s.callback(o,E,_)},n=new Fe(i),a=setTimeout(()=>{ui(this._pendingQueue,o=>o.callback===i),n.timedOut=!0,s.callback(new Error("timeout exceeded when trying to connect"))},this.options.connectionTimeoutMillis);return a.unref&&a.unref(),this._pendingQueue.push(n),r}return this.newClient(new Fe(s.callback)),r}newClient(e){let s=new this.Client(this.options);this._clients.push(s);let r=N_(this,s);this.log("checking client timeout");let i,n=!1;this.options.connectionTimeoutMillis&&(i=setTimeout(()=>{s.connection?(this.log("ending client due to timeout"),n=!0,s.connection.stream.destroy()):s.isConnected()||(this.log("ending client due to timeout"),n=!0,s.end())},this.options.connectionTimeoutMillis)),this.log("connecting new client"),s.connect(a=>{if(i&&clearTimeout(i),s.on("error",r),a)this.log("client failed to connect",a),this._clients=this._clients.filter(o=>o!==s),n&&(a=new Error("Connection terminated due to connection timeout",{cause:a})),this._pulseQueue(),e.timedOut||e.callback(a,void 0,ms);else{if(this.log("new client connected"),this.options.onConnect){this._promiseTry(()=>this.options.onConnect(s)).then(()=>{this._afterConnect(s,e,r)},o=>{this._clients=this._clients.filter(E=>E!==s),s.end(()=>{this._pulseQueue(),e.timedOut||e.callback(o,void 0,ms)})});return}return this._afterConnect(s,e,r)}})}_afterConnect(e,s,r){if(this.options.maxLifetimeSeconds!==0){let i=setTimeout(()=>{this.log("ending client due to expired lifetime"),this._expired.add(e),this._idle.findIndex(a=>a.client===e)!==-1&&this._acquireClient(e,new Fe((a,o,E)=>E()),r,!1)},this.options.maxLifetimeSeconds*1e3);i.unref(),e.once("end",()=>clearTimeout(i))}return this._acquireClient(e,s,r,!0)}_acquireClient(e,s,r,i){i&&this.emit("connect",e),this.emit("acquire",e),e.release=this._releaseOnce(e,r),e.removeListener("error",r),s.timedOut?i&&this.options.verify?this.options.verify(e,e.release):e.release():i&&this.options.verify?this.options.verify(e,n=>{if(n)return e.release(n),s.callback(n,void 0,ms);s.callback(void 0,e,e.release)}):s.callback(void 0,e,e.release)}_releaseOnce(e,s){let r=!1;return i=>{r&&d_(),r=!0,this._release(e,s,i)}}_release(e,s,r){if(e.on("error",s),e._poolUseCount=(e._poolUseCount||0)+1,this.emit("release",r,e),r||this.ending||!e._queryable||e._ending||e._poolUseCount>=this.options.maxUses)return e._poolUseCount>=this.options.maxUses&&this.log("remove expended client"),this._remove(e,this._pulseQueue.bind(this));if(this._expired.has(e))return this.log("remove expired client"),this._expired.delete(e),this._remove(e,this._pulseQueue.bind(this));let n;this.options.idleTimeoutMillis&&this._isAboveMin()&&(n=setTimeout(()=>{this._isAboveMin()&&(this.log("remove idle client"),this._remove(e,this._pulseQueue.bind(this)))},this.options.idleTimeoutMillis),this.options.allowExitOnIdle&&n.unref()),this.options.allowExitOnIdle&&e.unref(),this._idle.push(new Rs(e,s,n)),this._pulseQueue()}query(e,s,r){if(typeof e=="function"){let n=Et(this.Promise,e);return setImmediate(function(){return n.callback(new Error("Passing a function as the first parameter to pool.query is not supported"))}),n.result}typeof s=="function"&&(r=s,s=void 0);let i=Et(this.Promise,r);return r=i.callback,this.connect((n,a)=>{if(n)return r(n);let o=!1,E=_=>{o||(o=!0,a.release(_),r(_))};a.once("error",E),this.log("dispatching query");try{a.query(e,s,(_,c)=>{if(this.log("query dispatched"),a.removeListener("error",E),!o)return o=!0,a.release(_),_?r(_):r(void 0,c)})}catch(_){return a.release(_),r(_)}}),i.result}end(e){if(this.log("ending"),this.ending){let r=new Error("Called end on pool more than once");return e?e(r):this.Promise.reject(r)}this.ending=!0;let s=Et(this.Promise,e);return this._endCallback=s.callback,this._pulseQueue(),s.result}get waitingCount(){return this._pendingQueue.length}get idleCount(){return this._idle.length}get expiredCount(){return this._clients.reduce((e,s)=>e+(this._expired.has(s)?1:0),0)}get totalCount(){return this._clients.length}};di.exports=fs});var Ti=N((iE,hi)=>{"use strict";var pi=S("events").EventEmitter,p_=S("util"),Is=qe(),Ue=hi.exports=function(t,e,s){pi.call(this),t=Is.normalizeQueryConfig(t,e,s),this.text=t.text,this.values=t.values,this.name=t.name,this.queryMode=t.queryMode,this.callback=t.callback,this.state="new",this._arrayMode=t.rowMode==="array",this._emitRowEvents=!1,this.on("newListener",function(r){r==="row"&&(this._emitRowEvents=!0)}.bind(this))};p_.inherits(Ue,pi);var h_={sqlState:"code",statementPosition:"position",messagePrimary:"message",context:"where",schemaName:"schema",tableName:"table",columnName:"column",dataTypeName:"dataType",constraintName:"constraint",sourceFile:"file",sourceLine:"line",sourceFunction:"routine"};Ue.prototype.handleError=function(t){var e=this.native.pq.resultErrorFields();if(e)for(var s in e){var r=h_[s]||s;t[r]=e[s]}this.callback?this.callback(t):this.emit("error",t),this.state="error"};Ue.prototype.then=function(t,e){return this._getPromise().then(t,e)};Ue.prototype.catch=function(t){return this._getPromise().catch(t)};Ue.prototype._getPromise=function(){return this._promise?this._promise:(this._promise=new Promise(function(t,e){this._once("end",t),this._once("error",e)}.bind(this)),this._promise)};Ue.prototype.submit=function(t){this.state="running";var e=this;this.native=t.native,t.native.arrayMode=this._arrayMode;var s=function(n,a,o){if(t.native.arrayMode=!1,setImmediate(function(){e.emit("_done")}),n)return e.handleError(n);e._emitRowEvents&&(o.length>1?a.forEach((E,_)=>{E.forEach(c=>{e.emit("row",c,o[_])})}):a.forEach(function(E){e.emit("row",E,o)})),e.state="end",e.emit("end",o),e.callback&&e.callback(null,o)};if(process.domain&&(s=process.domain.bind(s)),this.name){this.name.length>63&&(console.error("Warning! Postgres only supports 63 characters for query names."),console.error("You supplied %s (%s)",this.name,this.name.length),console.error("This can cause conflicts and silent errors executing queries"));var r=(this.values||[]).map(Is.prepareValue);if(t.namedQueries[this.name]){if(this.text&&t.namedQueries[this.name]!==this.text){let n=new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);return s(n)}return t.native.execute(this.name,r,s)}return t.native.prepare(this.name,this.text,r.length,function(n){return n?s(n):(t.namedQueries[e.name]=e.text,e.native.execute(e.name,r,s))})}else if(this.values){if(!Array.isArray(this.values)){let n=new Error("Query values must be an array");return s(n)}var i=this.values.map(Is.prepareValue);t.native.query(this.text,i,s)}else this.queryMode==="extended"?t.native.query(this.text,[],s):t.native.query(this.text,s)}});var Ii=N((nE,vi)=>{"use strict";var mi;try{mi=S("pg-native")}catch(t){throw t}var T_=Ht(),Ri=S("events").EventEmitter,m_=S("util"),R_=xt(),fi=Ti(),K=vi.exports=function(t){Ri.call(this),t=t||{},this._Promise=t.Promise||global.Promise,this._types=new T_(t.types),this.native=new mi({types:this._types}),this._queryQueue=[],this._ending=!1,this._connecting=!1,this._connected=!1,this._queryable=!0;var e=this.connectionParameters=new R_(t);t.nativeConnectionString&&(e.nativeConnectionString=t.nativeConnectionString),this.user=e.user,Object.defineProperty(this,"password",{configurable:!0,enumerable:!1,writable:!0,value:e.password}),this.database=e.database,this.host=e.host,this.port=e.port,this.namedQueries={}};K.Query=fi;m_.inherits(K,Ri);K.prototype._errorAllQueries=function(t){let e=s=>{process.nextTick(()=>{s.native=this.native,s.handleError(t)})};this._hasActiveQuery()&&(e(this._activeQuery),this._activeQuery=null),this._queryQueue.forEach(e),this._queryQueue.length=0};K.prototype._connect=function(t){var e=this;if(this._connecting){process.nextTick(()=>t(new Error("Client has already been connected. You cannot reuse a client.")));return}this._connecting=!0,this.connectionParameters.getLibpqConnectionString(function(s,r){if(e.connectionParameters.nativeConnectionString&&(r=e.connectionParameters.nativeConnectionString),s)return t(s);e.native.connect(r,function(i){if(i)return e.native.end(),t(i);e._connected=!0,e.native.on("error",function(n){e._queryable=!1,e._errorAllQueries(n),e.emit("error",n)}),e.native.on("notification",function(n){e.emit("notification",{channel:n.relname,payload:n.extra})}),e.emit("connect"),e._pulseQueryQueue(!0),t()})})};K.prototype.connect=function(t){if(t){this._connect(t);return}return new this._Promise((e,s)=>{this._connect(r=>{r?s(r):e()})})};K.prototype.query=function(t,e,s){var r,i,n,a,o;if(t==null)throw new TypeError("Client was passed a null or undefined query");if(typeof t.submit=="function")n=t.query_timeout||this.connectionParameters.query_timeout,i=r=t,typeof e=="function"&&(t.callback=e);else if(n=t.query_timeout||this.connectionParameters.query_timeout,r=new fi(t,e,s),!r.callback){let E,_;i=new this._Promise((c,l)=>{E=c,_=l}).catch(c=>{throw Error.captureStackTrace(c),c}),r.callback=(c,l)=>c?_(c):E(l)}return n&&(o=r.callback,a=setTimeout(()=>{var E=new Error("Query read timeout");process.nextTick(()=>{r.handleError(E,this.connection)}),o(E),r.callback=()=>{};var _=this._queryQueue.indexOf(r);_>-1&&this._queryQueue.splice(_,1),this._pulseQueryQueue()},n),r.callback=(E,_)=>{clearTimeout(a),o(E,_)}),this._queryable?this._ending?(r.native=this.native,process.nextTick(()=>{r.handleError(new Error("Client was closed and is not queryable"))}),i):(this._queryQueue.push(r),this._pulseQueryQueue(),i):(r.native=this.native,process.nextTick(()=>{r.handleError(new Error("Client has encountered a connection error and is not queryable"))}),i)};K.prototype.end=function(t){var e=this;this._ending=!0,this._connected||this.once("connect",this.end.bind(this,t));var s;return t||(s=new this._Promise(function(r,i){t=n=>n?i(n):r()})),this.native.end(function(){e._errorAllQueries(new Error("Connection terminated")),process.nextTick(()=>{e.emit("end"),t&&t()})}),s};K.prototype._hasActiveQuery=function(){return this._activeQuery&&this._activeQuery.state!=="error"&&this._activeQuery.state!=="end"};K.prototype._pulseQueryQueue=function(t){if(this._connected&&!this._hasActiveQuery()){var e=this._queryQueue.shift();if(!e){t||this.emit("drain");return}this._activeQuery=e,e.submit(this);var s=this;e.once("_done",function(){s._pulseQueryQueue()})}};K.prototype.cancel=function(t){this._activeQuery===t?this.native.cancel(function(){}):this._queryQueue.indexOf(t)!==-1&&this._queryQueue.splice(this._queryQueue.indexOf(t),1)};K.prototype.ref=function(){};K.prototype.unref=function(){};K.prototype.setTypeParser=function(t,e,s){return this._types.setTypeParser(t,e,s)};K.prototype.getTypeParser=function(t,e){return this._types.getTypeParser(t,e)}});var Os=N((aE,Oi)=>{"use strict";Oi.exports=Ii()});var vs=N((_E,$e)=>{"use strict";var f_=li(),v_=Be(),I_=ds(),O_=Ni(),{DatabaseError:b_}=Es(),{escapeIdentifier:L_,escapeLiteral:A_}=qe(),g_=t=>class extends O_{constructor(s){super(s,t)}},bs=function(t){this.defaults=v_,this.Client=t,this.Query=this.Client.Query,this.Pool=g_(this.Client),this._pools=[],this.Connection=I_,this.types=xe(),this.DatabaseError=b_,this.escapeIdentifier=L_,this.escapeLiteral=A_};typeof process.env.NODE_PG_FORCE_NATIVE<"u"?$e.exports=new bs(Os()):($e.exports=new bs(f_),Object.defineProperty($e.exports,"native",{configurable:!0,enumerable:!1,get(){var t=null;try{t=new bs(Os())}catch(e){if(e.code!=="MODULE_NOT_FOUND")throw e}return Object.defineProperty($e.exports,"native",{value:t}),t}}))});import{createHash as _c,randomUUID as cc}from"node:crypto";import{gzipSync as Ec}from"node:zlib";var Fi=Rn(vs(),1);var bi=`-- JAIN STOCK EXCHANGE (JSE) v272
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
`;var Li=`-- JAIN STOCK EXCHANGE (JSE) v272
-- 001a_upgrades.sql: additive schema changes applied right after 001_schema.
-- Every statement is idempotent, so the file is safe to re-run on existing databases.

-- IPO listing: confidential listing price saved by the Controller, applied at listing time
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

-- list IPOs automatically when the Controller presses START EVENT
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS auto_list_ipos boolean NOT NULL DEFAULT true;

-- price history source LISTING = the IPO listing-day price
ALTER TABLE price_history DROP CONSTRAINT IF EXISTS price_history_source_check;
ALTER TABLE price_history ADD CONSTRAINT price_history_source_check
  CHECK (source IN ('TRADE','MARKET_NEWS','RESET','UNDO','REDO','ADMIN','LISTING'));

-- undo/redo journal: IPO_LISTING entries
ALTER TABLE action_journal DROP CONSTRAINT IF EXISTS action_journal_action_check;
ALTER TABLE action_journal ADD CONSTRAINT action_journal_action_check
  CHECK (action IN ('EXCHANGE_DECISION','BANK_SETTLE','BANK_REJECT','MARKET_NEWS','EVENT_STATUS','IPO_LISTING'));

INSERT INTO schema_migrations(version) VALUES ('001a_upgrades');
`;var Ai=`-- JAIN STOCK EXCHANGE (JSE) v272
-- 002_core.sql: helpers, authentication, order creation, Exchange and Bank settlement.
-- Every money-changing step runs inside one database transaction (one function call)
-- with row locks taken in a fixed order: order -> security -> team -> loan -> holding -> institution.

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

CREATE OR REPLACE FUNCTION jse_actor_name(a jsonb) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(nullif(a->>'username', ''), nullif(a->>'name', ''), 'system')
$$;

CREATE OR REPLACE FUNCTION jse_round_tick(p numeric, p_tick numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT round(p / p_tick) * p_tick
$$;

CREATE OR REPLACE FUNCTION jse_pct(p_new numeric, p_old numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN coalesce(p_old, 0) = 0 THEN 0 ELSE round((p_new - p_old) * 100 / p_old, 4) END
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
               AND status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')
               AND (p_exclude_order IS NULL OR id <> p_exclude_order))
  SELECT h.q, s.q, h.q - s.q FROM h, s
$$;

-- Cash the team still has free: cash minus the full amount of its other open BUY orders.
CREATE OR REPLACE FUNCTION jse_available_cash(p_team integer, p_exclude_order bigint DEFAULT NULL)
RETURNS numeric LANGUAGE sql STABLE AS $$
  SELECT (SELECT cash FROM teams WHERE id = p_team) - coalesce((
    SELECT sum(settlement_amount) FROM orders
    WHERE team_id = p_team AND side = 'BUY' AND account_type = 'TEAM'
      AND status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')
      AND (p_exclude_order IS NULL OR id <> p_exclude_order)), 0)
$$;

CREATE OR REPLACE FUNCTION jse_order_json(p_id bigint) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object(
    'id', o.id, 'order_no', o.order_no, 'account_type', o.account_type,
    'team', t.code, 'team_name', t.name, 'broker', b.code,
    'institution', i.code,
    'security_id', s.id, 'symbol', s.symbol, 'security', s.name, 'kind', s.kind,
    'side', o.side, 'quantity', o.quantity, 'price', o.price,
    'trade_value', o.trade_value, 'brokerage', o.brokerage, 'settlement_amount', o.settlement_amount,
    'reference_price', o.reference_price, 'status', o.status,
    'short_sell_flag', o.short_sell_flag, 'cash_shortfall_flag', o.cash_shortfall_flag,
    'reject_code', o.reject_code, 'reject_reason', o.reject_reason,
    'created_by', o.created_by_name, 'created_at', o.created_at,
    'exchange_by', o.exchange_by_name, 'exchange_at', o.exchange_at,
    'bank_by', o.bank_by_name, 'bank_at', o.bank_at, 'pair_ref', o.pair_ref, 'notes', o.notes)
  FROM orders o
  JOIN teams t ON t.id = o.team_id
  JOIN securities s ON s.id = o.security_id
  LEFT JOIN brokers b ON b.id = o.broker_id
  LEFT JOIN institutions i ON i.id = o.institution_id
  WHERE o.id = p_id
$$;

-- ---------------------------------------------------------------------------
-- Authentication (bcrypt via pgcrypto; opaque random session tokens, stored hashed)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_user_json(u app_users) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('id', u.id, 'username', u.username, 'name', u.display_name, 'email', u.email, 'role', u.role,
    'team_id', u.team_id, 'team', (SELECT code FROM teams WHERE id = u.team_id),
    'broker_id', u.broker_id, 'broker', (SELECT code FROM brokers WHERE id = u.broker_id),
    'institution_id', u.institution_id, 'institution', (SELECT code FROM institutions WHERE id = u.institution_id),
    'must_change_password', u.must_change_password)
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
  INSERT INTO sessions(token_hash, user_id, expires_at, ip, user_agent)
  VALUES (encode(digest(v_token, 'sha256'), 'hex'), u.id, now() + make_interval(hours => greatest(1, least(v_hours, 72))), p->>'ip', left(p->>'ua', 300));
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
  RETURN jse_user_json(u) || jsonb_build_object('session', s.id::text, 'expires_at', s.expires_at);
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
  INSERT INTO sessions(token_hash, user_id, expires_at, ip, user_agent)
  VALUES (encode(digest(v_token, 'sha256'), 'hex'), u.id, now() + interval '6 hours', p->>'ip', left('CI ' || coalesce(p->>'subject', ''), 300));
  a := jsonb_build_object('id', u.id, 'username', u.username, 'role', u.role, 'ip', p->>'ip', 'ua', p->>'ua');
  PERFORM jse_audit(a, 'CI_LOGIN', 'user', u.id::text, u.team_id, NULL, NULL, NULL,
                    jsonb_build_object('subject', p->>'subject', 'run_id', p->>'run_id', 'workflow', p->>'workflow'));
  RETURN jsonb_build_object('success', true, 'token', v_token, 'user', jse_user_json(u));
END $$;

-- ---------------------------------------------------------------------------
-- Order creation (participant / broker desk). No cash, holding or price change here.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_place_order(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE;
  v_status text;
  v_team teams%ROWTYPE;
  v_sec securities%ROWTYPE;
  v_side text := upper(trim(coalesce(p->>'side', '')));
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_qty integer;
  v_price numeric;
  v_tv numeric; v_brk numeric; v_amount numeric;
  v_id bigint; v_no text;
  v_existing bigint;
  v_avail record;
  v_free_cash numeric;
  v_short boolean := false; v_shortfall boolean := false;
  v_warnings jsonb := '[]'::jsonb;
  v_band numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'PARTICIPANT');
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
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || v_status || ').', 409);
  END IF;

  SELECT * INTO v_team FROM teams
  WHERE (p ? 'team' AND code = upper(trim(p->>'team'))) OR (p ? 'team_id' AND id = nullif(p->>'team_id', '')::integer);
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Select a valid participant team.', 404); END IF;
  IF NOT v_team.active THEN PERFORM jse_fail('TEAM_INACTIVE', 'Team ' || v_team.code || ' is not active.', 409); END IF;
  IF a->>'role' = 'PARTICIPANT' THEN
    IF NOT cfg.participant_order_entry THEN
      PERFORM jse_fail('PARTICIPANT_ENTRY_DISABLED', 'Orders are entered by the broker desk. Please give your slip to your broker.', 403);
    END IF;
    IF (a->>'team_id')::integer IS DISTINCT FROM v_team.id THEN
      PERFORM jse_fail('FORBIDDEN', 'You can place orders only for your own team.', 403);
    END IF;
  END IF;

  SELECT * INTO v_sec FROM securities
  WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')));
  IF NOT FOUND OR NOT v_sec.active THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a valid stock or IPO.', 404); END IF;

  IF v_side NOT IN ('BUY', 'SELL') THEN PERFORM jse_fail('INVALID_SIDE', 'Choose BUY or SELL.', 400); END IF;

  BEGIN
    v_qty := (p->>'quantity')::integer;
    v_price := (p->>'price')::numeric;
  EXCEPTION WHEN others THEN
    PERFORM jse_fail('INVALID_NUMBER', 'Quantity and price must be numbers.', 400);
  END;
  IF v_qty IS NULL OR v_qty <= 0 THEN PERFORM jse_fail('INVALID_QUANTITY', 'Quantity must be a positive number of shares.', 400); END IF;
  IF v_qty % v_sec.lot_size <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' trades in multiples of ' || v_sec.lot_size || ' shares (e.g. ' || v_sec.lot_size || ', ' || (2 * v_sec.lot_size) || ', ' || (3 * v_sec.lot_size) || ').', 400);
  END IF;
  IF v_price IS NULL OR v_price <= 0 THEN PERFORM jse_fail('INVALID_PRICE', 'Price must be greater than zero.', 400); END IF;
  IF v_price % cfg.price_tick <> 0 THEN
    PERFORM jse_fail('INVALID_PRICE_TICK', 'Price must be in steps of \u20B9' || trim(to_char(cfg.price_tick, 'FM999990.00')) || '.', 400);
  END IF;
  v_band := v_sec.price * cfg.max_price_move_pct / 100;
  IF abs(v_price - v_sec.price) > v_band THEN
    PERFORM jse_fail('PRICE_LIMIT', 'Price must stay within ' || cfg.max_price_move_pct || '% of the market price \u20B9' || v_sec.price ||
      ' (allowed \u20B9' || ceil((v_sec.price - v_band) / cfg.price_tick) * cfg.price_tick || ' to \u20B9' || floor((v_sec.price + v_band) / cfg.price_tick) * cfg.price_tick || ').', 400);
  END IF;

  v_tv := round(v_qty * v_price, 2);
  v_brk := round(v_tv * cfg.brokerage_rate, 2);
  v_amount := CASE WHEN v_side = 'BUY' THEN v_tv + v_brk ELSE v_tv - v_brk END;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between \u20B9' || cfg.min_order_value || ' and \u20B9' || cfg.max_order_value || ' (this order: \u20B9' || v_tv || ').', 400);
  END IF;

  -- risk checks (recorded, not blocking)
  IF v_side = 'SELL' THEN
    SELECT * INTO v_avail FROM jse_available_qty(v_team.id, v_sec.id, NULL);
    IF v_qty > v_avail.available THEN
      v_short := true;
      v_warnings := v_warnings || jsonb_build_object('code', 'SHORT_SELL', 'message',
        'Short selling is not allowed: ' || v_team.code || ' can sell only ' || greatest(v_avail.available, 0) || ' ' || v_sec.symbol ||
        ' shares (holding ' || v_avail.holding || ', already in open sell orders ' || v_avail.open_sell || '). The attempt has been recorded.');
    END IF;
  ELSE
    v_free_cash := jse_available_cash(v_team.id, NULL);
    IF v_amount > v_free_cash THEN
      v_shortfall := true;
      v_warnings := v_warnings || jsonb_build_object('code', 'CASH_SHORTFALL', 'message',
        'Cash shortfall: this BUY needs \u20B9' || v_amount || ' but ' || v_team.code || ' has \u20B9' || greatest(v_free_cash, 0) ||
        ' available. The attempt has been recorded; the Bank will decide at settlement.');
    END IF;
  END IF;

  v_id := nextval(pg_get_serial_sequence('orders', 'id'));
  v_no := 'ORD-' || lpad(v_id::text, 6, '0');
  INSERT INTO orders(id, order_no, account_type, team_id, broker_id, security_id, side, quantity, price, trade_value, brokerage,
                     settlement_amount, reference_price, status, short_sell_flag, cash_shortfall_flag, notes, pair_ref, idempotency_key,
                     created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'TEAM', v_team.id, v_team.broker_id, v_sec.id, v_side, v_qty, v_price, v_tv, v_brk,
          v_amount, v_sec.price, 'EXCHANGE_PENDING', v_short, v_shortfall, left(p->>'notes', 300), left(p->>'pair_ref', 60), v_key,
          nullif(a->>'id', '')::integer, jse_actor_name(a), a->>'role');

  PERFORM jse_order_event(v_id, 'ORDER_CREATED', NULL, 'EXCHANGE_PENDING', a, NULL,
    jsonb_build_object('reference_price', v_sec.price, 'trade_value', v_tv, 'brokerage', v_brk));
  PERFORM jse_audit(a, 'ORDER_CREATED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'EXCHANGE_PENDING', 'side', v_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_price),
    jsonb_build_object('trade_value', v_tv, 'brokerage', v_brk, 'settlement_amount', v_amount, 'reference_price', v_sec.price));

  IF v_short THEN
    PERFORM jse_risk(v_team.id, v_id, v_sec.id, 'SHORT_SELL_ATTEMPT', 'ORDER', v_side, v_qty, v_avail.holding, NULL, NULL,
                     'Open sell orders: ' || v_avail.open_sell);
    PERFORM jse_audit(a, 'SHORT_SELLING_ATTEMPT', 'order', v_no, v_team.id, v_id, NULL, NULL,
      jsonb_build_object('quantity', v_qty, 'holding', v_avail.holding, 'open_sell', v_avail.open_sell, 'stage', 'ORDER'));
  END IF;
  IF v_shortfall THEN
    PERFORM jse_risk(v_team.id, v_id, v_sec.id, 'CASH_SHORTFALL_ATTEMPT', 'ORDER', v_side, v_qty, NULL, v_amount, greatest(v_free_cash, 0), NULL);
    PERFORM jse_audit(a, 'CASH_SHORTFALL_ATTEMPT', 'order', v_no, v_team.id, v_id, NULL, NULL,
      jsonb_build_object('required', v_amount, 'available', v_free_cash, 'stage', 'ORDER'));
  END IF;

  RETURN jsonb_build_object('success', true, 'replayed', false, 'order', jse_order_json(v_id), 'warnings', v_warnings);
END $$;

-- ---------------------------------------------------------------------------
-- Exchange approval / rejection. Never changes cash, holdings or prices.
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
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Exchange actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || v_status || ').', 409);
  END IF;
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status <> 'EXCHANGE_PENDING' THEN
    PERFORM jse_fail('ORDER_NOT_PENDING', o.order_no || ' is no longer pending at the Exchange (status: ' || o.status || ').', 409);
  END IF;

  IF v_action = 'APPROVE' THEN
    IF o.account_type = 'TEAM' AND o.side = 'SELL' THEN
      SELECT * INTO v_avail FROM jse_available_qty(o.team_id, o.security_id, o.id);
      IF o.quantity > v_avail.available THEN
        IF NOT v_confirm THEN
          RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_CONFIRM_REQUIRED', HINT = '409',
            MESSAGE = 'Short-selling warning: the team can sell only ' || greatest(v_avail.available, 0) || ' shares (holding ' || v_avail.holding ||
                      '). Confirm to forward it anyway \u2014 the Bank will reject it unless holdings are sufficient.';
        END IF;
        UPDATE orders SET short_sell_flag = true, short_sell_approved = true WHERE id = o.id;
        PERFORM jse_risk(o.team_id, o.id, o.security_id, 'SHORT_SELL_ATTEMPT', 'EXCHANGE', o.side, o.quantity, v_avail.holding, NULL, NULL, NULL);
        PERFORM jse_audit(a, 'SHORT_SELLING_APPROVED', 'order', o.order_no, o.team_id, o.id, NULL, NULL,
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
         reject_reason = CASE WHEN v_to = 'EXCHANGE_REJECTED' THEN coalesce(v_reason, 'Rejected by Exchange') ELSE NULL END,
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
    PERFORM jse_fail('NOT_AWAITING_BANK', o.order_no || ' is not waiting for the Bank (status: ' || o.status || ').', 409);
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
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || v_status || ').', 409);
  END IF;
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status = 'BANK_SETTLED' THEN PERFORM jse_fail('ALREADY_SETTLED', o.order_no || ' is already settled and cannot be rejected.', 409); END IF;
  IF o.status NOT IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN
    PERFORM jse_fail('NOT_AWAITING_BANK', o.order_no || ' is not waiting for the Bank (status: ' || o.status || ').', 409);
  END IF;
  RETURN jse__bank_reject(a, o, 'BANK_REJECTED_BY_OPERATOR', coalesce(v_reason, 'Rejected by Bank'), '{}'::jsonb);
END $$;

-- ---------------------------------------------------------------------------
-- Bank settlement: the only place where a trade changes cash, holdings and price.
-- Idempotent: an order can have at most one active settlement (unique index) and
-- the status transition happens under the order row lock.
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
  v_tv numeric; v_brk numeric; v_req numeric; v_band numeric;
  v_cash numeric; v_cash_after numeric;
  v_draw numeric := 0; v_interest numeric := 0; v_room numeric;
  v_cost_moved numeric := 0; v_tcost_moved numeric := 0; v_icost_moved numeric := 0;
  v_realized numeric := 0;
  v_inst_before numeric; v_inst_after numeric;
  v_settle_id bigint;
  v_price_before numeric; v_prev_before numeric;
  v_bal numeric;
  v_team_delta numeric;
  v_hold_after integer;
  v_note text;
BEGIN
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO o FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status = 'BANK_SETTLED' OR EXISTS (SELECT 1 FROM settlements WHERE order_id = o.id AND reversed_at IS NULL) THEN
    PERFORM jse_fail('ALREADY_SETTLED', o.order_no || ' has already been settled. Duplicate settlement blocked.', 409);
  END IF;
  IF o.status NOT IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN
    PERFORM jse_fail('NOT_AWAITING_BANK', o.order_no || ' is not waiting for the Bank (status: ' || o.status || ').', 409);
  END IF;
  IF o.status = 'BANK_PENDING' AND o.bank_claimed_by IS NOT NULL AND o.bank_claimed_by IS DISTINCT FROM nullif(a->>'id', '')::integer
     AND o.bank_claimed_at > now() - interval '2 minutes' AND p_source = 'BANK' THEN
    PERFORM jse_fail('ALREADY_CLAIMED', o.order_no || ' is being verified by ' || coalesce(o.bank_claimed_name, 'another bank operator') || '.', 409);
  END IF;

  -- lock order: security -> team -> loan -> holdings -> institution
  SELECT * INTO s FROM securities WHERE id = o.security_id FOR UPDATE;
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

  -- independent re-validation (never trust Exchange alone)
  IF NOT t.active THEN RETURN jse__bank_reject(a, o, 'TEAM_INACTIVE', 'Team ' || t.code || ' is not active.', '{}'::jsonb); END IF;
  IF NOT s.active THEN RETURN jse__bank_reject(a, o, 'SECURITY_INACTIVE', s.symbol || ' is not tradable.', '{}'::jsonb); END IF;
  IF o.quantity <= 0 OR o.quantity % s.lot_size <> 0 THEN
    RETURN jse__bank_reject(a, o, 'INVALID_LOT', 'Quantity must be a multiple of ' || s.lot_size || '.', '{}'::jsonb);
  END IF;
  IF o.price <= 0 OR o.price % cfg.price_tick <> 0 THEN
    RETURN jse__bank_reject(a, o, 'INVALID_PRICE', 'Invalid order price.', '{}'::jsonb);
  END IF;
  v_band := s.price * cfg.max_price_move_pct / 100;
  IF abs(o.price - s.price) > v_band THEN
    RETURN jse__bank_reject(a, o, 'PRICE_LIMIT', 'Stale order: price \u20B9' || o.price || ' is more than ' || cfg.max_price_move_pct ||
      '% away from the current market price \u20B9' || s.price || '.', jsonb_build_object('market_price', s.price, 'order_price', o.price));
  END IF;
  v_tv := round(o.quantity * o.price, 2);
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    RETURN jse__bank_reject(a, o, 'ORDER_VALUE_LIMIT', 'Order value \u20B9' || v_tv || ' is outside the allowed \u20B9' || cfg.min_order_value || ' to \u20B9' || cfg.max_order_value || '.', '{}'::jsonb);
  END IF;
  IF o.account_type = 'TEAM' OR cfg.institution_brokerage THEN
    v_brk := round(v_tv * cfg.brokerage_rate, 2);
  ELSE
    v_brk := 0;
  END IF;

  v_cash := t.cash;
  v_price_before := s.price;
  v_prev_before := s.previous_price;

  -- Which side of the trade is the participant team on?
  --   TEAM order: team side = order side.
  --   INSTITUTION order: the counterparty team takes the opposite side.
  IF (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL') THEN
    -- team BUYS
    IF o.account_type = 'INSTITUTION' AND v_ihold < o.quantity THEN
      RETURN jse__bank_reject(a, o, 'INSTITUTION_INSUFFICIENT_HOLDINGS', 'The institution holds only ' || v_ihold || ' ' || s.symbol || ' shares.',
        jsonb_build_object('holding', v_ihold, 'quantity', o.quantity));
    END IF;
    v_req := v_tv + v_brk;
    IF v_cash - v_req < cfg.min_cash_buffer THEN
      v_room := greatest(0, cfg.loan_max_principal - ln.original_principal);
      v_draw := v_req + cfg.min_cash_buffer - v_cash;
      IF NOT (cfg.loans_enabled AND cfg.auto_loan_on_settlement) OR v_draw > v_room THEN
        IF o.account_type = 'TEAM' THEN
          PERFORM jse_risk(t.id, o.id, s.id, 'INSUFFICIENT_BALANCE_REJECTION', 'BANK', o.side, o.quantity, v_hold, v_req, v_cash,
                           'Loan room \u20B9' || CASE WHEN cfg.loans_enabled THEN v_room ELSE 0 END);
          PERFORM jse_audit(a, 'INSUFFICIENT_BALANCE_REJECTED', 'order', o.order_no, t.id, o.id, NULL, NULL,
            jsonb_build_object('required', v_req, 'cash', v_cash, 'min_cash_buffer', cfg.min_cash_buffer,
                               'loan_room', CASE WHEN cfg.loans_enabled THEN v_room ELSE 0 END));
        END IF;
        RETURN jse__bank_reject(a, o, 'INSUFFICIENT_BALANCE',
          'Insufficient balance: \u20B9' || v_req || ' is needed but ' || t.code || ' has \u20B9' || v_cash ||
          CASE WHEN cfg.loans_enabled AND cfg.auto_loan_on_settlement THEN ' plus \u20B9' || v_room || ' of loan room' ELSE '' END ||
          ' and must keep \u20B9' || cfg.min_cash_buffer || ' in cash.',
          jsonb_build_object('required', v_req, 'cash', v_cash, 'loan_room', v_room, 'min_cash_buffer', cfg.min_cash_buffer));
      END IF;
      v_interest := round(v_draw * cfg.loan_interest_rate, 2);
    END IF;
  ELSE
    -- team SELLS
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
          0, v_cash, v_cash, v_hold, v_hold, v_price_before, o.price, v_prev_before,
          nullif(a->>'id', '')::integer, jse_actor_name(a))
  RETURNING id INTO v_settle_id;

  v_bal := v_cash;
  IF (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL') THEN
    IF v_draw > 0 THEN
      v_bal := v_bal + v_draw;
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'LOAN_DRAW', 0, v_draw, v_bal,
        'Automatic loan draw so cash stays at the \u20B9' || cfg.min_cash_buffer || ' minimum (interest \u20B9' || v_interest || ')', a);
      UPDATE loans SET original_principal = original_principal + v_draw, principal_outstanding = principal_outstanding + v_draw,
             interest_outstanding = interest_outstanding + v_interest, interest_charged = interest_charged + v_interest,
             draws = draws + 1, status = 'OUTSTANDING', updated_at = now()
      WHERE team_id = t.id;
      INSERT INTO loan_transactions(team_id, kind, amount, order_id, settlement_id, automatic, note, actor_id, actor_name)
      VALUES (t.id, 'DRAW', v_draw, o.id, v_settle_id, true, 'Automatic draw at settlement of ' || o.order_no, nullif(a->>'id', '')::integer, jse_actor_name(a)),
             (t.id, 'INTEREST_CHARGE', v_interest, o.id, v_settle_id, true, round(cfg.loan_interest_rate * 100, 2) || '% interest on draw', nullif(a->>'id', '')::integer, jse_actor_name(a));
      PERFORM jse_audit(a, 'LOAN_DRAW', 'loan', t.code, t.id, o.id, NULL, NULL,
        jsonb_build_object('amount', v_draw, 'interest', v_interest, 'automatic', true, 'order_no', o.order_no));
    END IF;
    v_bal := v_bal - v_tv;
    v_note := CASE WHEN o.account_type = 'INSTITUTION' THEN 'Bought ' || o.quantity || ' ' || s.symbol || ' @ \u20B9' || o.price || ' from ' || inst.code
                   ELSE 'Bought ' || o.quantity || ' ' || s.symbol || ' @ \u20B9' || o.price END;
    PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BUY', v_tv, 0, v_bal, v_note, a);
    IF v_brk > 0 THEN
      v_bal := v_bal - v_brk;
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BROKERAGE', v_brk, 0, v_bal, 'Brokerage ' || round(cfg.brokerage_rate * 100, 3) || '% on ' || o.order_no, a);
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
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BROKERAGE', v_brk, 0, v_bal, 'Brokerage ' || round(cfg.brokerage_rate * 100, 3) || '% on ' || o.order_no, a);
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
    VALUES (o.id, v_settle_id, o.broker_id, t.id, o.side, v_tv, cfg.brokerage_rate, v_brk);
  END IF;

  -- trade price becomes the market price (bank settlement is the only trade-side price source)
  IF o.price <> s.price THEN
    UPDATE securities SET previous_price = price, price = o.price, updated_at = now() WHERE id = s.id;
    INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source, order_id, settlement_id)
    VALUES (s.id, s.price, o.price, jse_pct(o.price, s.price), 'TRADE', o.id, v_settle_id);
  END IF;
  UPDATE securities SET trade_count = trade_count + 1, traded_quantity = traded_quantity + o.quantity, traded_value = traded_value + v_tv,
         last_trade_at = now() WHERE id = s.id;

  UPDATE settlements SET brokerage = v_brk, team_cash_delta = v_team_delta, team_cash_after = v_cash_after, holding_after = v_hold_after,
         cost_moved = v_cost_moved, trade_cost_moved = v_tcost_moved, inst_cost_moved = v_icost_moved, realized_pnl = v_realized,
         loan_drawn = v_draw, loan_interest = v_interest, institution_cash_before = v_inst_before, institution_cash_after = v_inst_after
  WHERE id = v_settle_id;

  UPDATE orders SET status = 'BANK_SETTLED', trade_value = v_tv, brokerage = v_brk,
         settlement_amount = CASE WHEN (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL') THEN v_tv + v_brk ELSE v_tv - v_brk END,
         bank_by = nullif(a->>'id', '')::integer, bank_by_name = jse_actor_name(a), bank_at = now(),
         bank_claimed_by = NULL, bank_claimed_name = NULL, bank_claimed_at = NULL,
         reject_code = NULL, reject_reason = NULL, updated_at = now()
  WHERE id = o.id;

  PERFORM jse_order_event(o.id, 'BANK_SETTLED', o.status, 'BANK_SETTLED', a, NULL,
    jsonb_build_object('trade_value', v_tv, 'brokerage', v_brk, 'cash_before', v_cash, 'cash_after', v_cash_after,
                       'loan_drawn', v_draw, 'price_before', v_price_before, 'price_after', o.price));
  PERFORM jse_order_event(o.id, 'MARKET_UPDATED', 'BANK_SETTLED', 'BANK_SETTLED', a,
    s.symbol || ' \u20B9' || v_price_before || ' \u2192 \u20B9' || o.price || '; cash \u20B9' || v_cash || ' \u2192 \u20B9' || v_cash_after, NULL);
  PERFORM jse_audit(a, 'BANK_SETTLED', 'order', o.order_no, t.id, o.id,
    jsonb_build_object('status', o.status, 'cash', v_cash, 'holding', v_hold, 'price', v_price_before),
    jsonb_build_object('status', 'BANK_SETTLED', 'cash', v_cash_after, 'holding', v_hold_after, 'price', o.price),
    jsonb_build_object('account_type', o.account_type, 'side', o.side, 'trade_value', v_tv, 'brokerage', v_brk,
                       'loan_drawn', v_draw, 'interest', v_interest, 'realized_pnl', v_realized, 'source', p_source));
  PERFORM jse_journal('BANK_SETTLE', v_settle_id, o.order_no || ' settled (' || o.side || ' ' || o.quantity || ' ' || s.symbol || ' @ \u20B9' || o.price || ')',
                      jsonb_build_object('order_id', o.id, 'settlement_id', v_settle_id), a);

  RETURN jsonb_build_object('success', true, 'status', 'BANK_SETTLED', 'settlement_id', v_settle_id,
    'trade_value', v_tv, 'brokerage', v_brk, 'cash_before', v_cash, 'cash_after', v_cash_after,
    'loan_drawn', v_draw, 'loan_interest', v_interest, 'realized_pnl', v_realized,
    'price_before', v_price_before, 'price_after', o.price, 'order', jse_order_json(o.id));
END $$;

CREATE OR REPLACE FUNCTION jse_bank_settle(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_status text;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank settlement is allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || v_status || ').', 409);
  END IF;
  RETURN jse__settle(a, nullif(p->>'order_id', '')::bigint, 'BANK');
END $$;

-- Paired buyer/seller ticket: two linked orders created atomically (both or neither)
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
`;var gi=`-- JAIN STOCK EXCHANGE (JSE) v272
-- 003_ops.sql: institutional orders, loans, market news, event control, reset,
-- IPO allotments, undo / redo and administration.

-- ---------------------------------------------------------------------------
-- Institutional order (admin-controlled; counterparty participant team required)
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
  v_qty integer; v_price numeric; v_tv numeric; v_brk numeric := 0; v_band numeric;
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
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || v_status || ').', 409);
  END IF;
  SELECT * INTO v_inst FROM institutions
  WHERE id = coalesce(nullif(p->>'institution_id', '')::integer, nullif(a->>'institution_id', '')::integer, (SELECT min(id) FROM institutions));
  IF NOT FOUND THEN PERFORM jse_fail('INSTITUTION_NOT_FOUND', 'Institutional account not found.', 404); END IF;
  SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(p->>'counterparty_team', p->>'team', '')));
  IF NOT FOUND THEN PERFORM jse_fail('COUNTERPARTY_REQUIRED', 'Select the counterparty participant team.', 400); END IF;
  SELECT * INTO v_sec FROM securities
  WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')));
  IF NOT FOUND OR NOT v_sec.active THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a valid stock or IPO.', 404); END IF;
  IF v_side NOT IN ('BUY', 'SELL') THEN PERFORM jse_fail('INVALID_SIDE', 'Choose BUY or SELL.', 400); END IF;
  BEGIN
    v_qty := (p->>'quantity')::integer; v_price := (p->>'price')::numeric;
  EXCEPTION WHEN others THEN PERFORM jse_fail('INVALID_NUMBER', 'Quantity and price must be numbers.', 400);
  END;
  IF v_qty IS NULL OR v_qty <= 0 OR v_qty % v_sec.lot_size <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' trades in multiples of ' || v_sec.lot_size || ' shares.', 400);
  END IF;
  IF v_price IS NULL OR v_price <= 0 OR v_price % cfg.price_tick <> 0 THEN PERFORM jse_fail('INVALID_PRICE', 'Enter a valid whole-rupee price.', 400); END IF;
  v_band := v_sec.price * cfg.max_price_move_pct / 100;
  IF abs(v_price - v_sec.price) > v_band THEN
    PERFORM jse_fail('PRICE_LIMIT', 'Price must stay within ' || cfg.max_price_move_pct || '% of the market price \u20B9' || v_sec.price || '.', 400);
  END IF;
  v_tv := round(v_qty * v_price, 2);
  IF cfg.institution_brokerage THEN v_brk := round(v_tv * cfg.brokerage_rate, 2); END IF;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between \u20B9' || cfg.min_order_value || ' and \u20B9' || cfg.max_order_value || '.', 400);
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
                     settlement_amount, reference_price, status, notes, idempotency_key, created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'INSTITUTION', v_team.id, v_inst.id, NULL, v_sec.id, v_side, v_qty, v_price, v_tv, v_brk,
          CASE WHEN v_side = 'SELL' THEN v_tv + v_brk ELSE v_tv - v_brk END, v_sec.price, 'EXCHANGE_PENDING', left(p->>'notes', 300), v_key,
          nullif(a->>'id', '')::integer, jse_actor_name(a), a->>'role');
  PERFORM jse_order_event(v_id, 'ORDER_CREATED', NULL, 'EXCHANGE_PENDING', a, 'Institutional order; counterparty ' || v_team.code,
    jsonb_build_object('reference_price', v_sec.price, 'trade_value', v_tv));
  PERFORM jse_audit(a, 'ORDER_CREATED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'EXCHANGE_PENDING', 'side', v_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_price),
    jsonb_build_object('account_type', 'INSTITUTION', 'institution', v_inst.code, 'counterparty', v_team.code, 'trade_value', v_tv));
  RETURN jsonb_build_object('success', true, 'replayed', false, 'order', jse_order_json(v_id), 'warnings', v_warnings);
END $$;

-- ---------------------------------------------------------------------------
-- Loans: explicit draw (only at / below the minimum cash buffer) and repayment
-- (interest first, never below the minimum cash buffer).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_loan_action(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE; v_status text;
  t teams%ROWTYPE; ln loans%ROWTYPE;
  v_action text := upper(coalesce(p->>'action', ''));
  v_amount numeric;
  v_interest numeric; v_int_pay numeric; v_prin_pay numeric; v_bal numeric; v_room numeric; v_max numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Loan actions are allowed only while the event is LIVE or SETTLEMENT ONLY.', 409);
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
    IF t.cash > cfg.min_cash_buffer THEN
      PERFORM jse_fail('OWN_MONEY_FIRST', 'Use your own money first: a loan can be drawn only when cash is \u20B9' || cfg.min_cash_buffer ||
        ' or less (' || t.code || ' has \u20B9' || t.cash || ').', 409);
    END IF;
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
    PERFORM jse_ledger(t.id, NULL, NULL, 'LOAN_DRAW', 0, v_amount, v_bal, 'Loan draw (interest \u20B9' || v_interest || ')', a);
    INSERT INTO loan_transactions(team_id, kind, amount, automatic, note, actor_id, actor_name)
    VALUES (t.id, 'DRAW', v_amount, false, 'Loan draw', nullif(a->>'id', '')::integer, jse_actor_name(a)),
           (t.id, 'INTEREST_CHARGE', v_interest, false, round(cfg.loan_interest_rate * 100, 2) || '% interest on draw', nullif(a->>'id', '')::integer, jse_actor_name(a));
    PERFORM jse_audit(a, 'LOAN_DRAW', 'loan', t.code, t.id, NULL, jsonb_build_object('cash', t.cash, 'principal', ln.principal_outstanding),
      jsonb_build_object('cash', v_bal, 'principal', ln.principal_outstanding + v_amount), jsonb_build_object('amount', v_amount, 'interest', v_interest));
    RETURN jsonb_build_object('success', true, 'action', 'DRAW', 'team', t.code, 'amount', v_amount, 'interest_charged', v_interest, 'cash', v_bal,
                              'loan', (SELECT to_jsonb(l) FROM loans l WHERE l.team_id = t.id));
  ELSIF v_action = 'REPAY' THEN
    IF ln.principal_outstanding + ln.interest_outstanding <= 0 THEN PERFORM jse_fail('NO_LOAN', t.code || ' has no outstanding loan.', 409); END IF;
    IF v_amount > ln.principal_outstanding + ln.interest_outstanding THEN
      PERFORM jse_fail('REPAYMENT_EXCEEDS_DUE', 'Repayment is more than the amount due (\u20B9' || (ln.principal_outstanding + ln.interest_outstanding) || ').', 409);
    END IF;
    v_max := greatest(0, t.cash - cfg.min_cash_buffer);
    IF v_amount > v_max THEN
      PERFORM jse_fail('REPAYMENT_CASH_LIMIT', 'Repayment cannot take cash below \u20B9' || cfg.min_cash_buffer || '. Maximum now: \u20B9' || v_max || '.', 409);
    END IF;
    v_int_pay := least(v_amount, ln.interest_outstanding);
    v_prin_pay := least(v_amount - v_int_pay, ln.principal_outstanding);
    v_bal := t.cash;
    IF v_int_pay > 0 THEN
      v_bal := v_bal - v_int_pay;
      PERFORM jse_ledger(t.id, NULL, NULL, 'INTEREST', v_int_pay, 0, v_bal, 'Loan interest repaid (interest is repaid first)', a);
      INSERT INTO loan_transactions(team_id, kind, amount, note, actor_id, actor_name)
      VALUES (t.id, 'INTEREST_REPAYMENT', v_int_pay, 'Interest repayment', nullif(a->>'id', '')::integer, jse_actor_name(a));
    END IF;
    IF v_prin_pay > 0 THEN
      v_bal := v_bal - v_prin_pay;
      PERFORM jse_ledger(t.id, NULL, NULL, 'LOAN_REPAYMENT', v_prin_pay, 0, v_bal, 'Loan principal repaid', a);
      INSERT INTO loan_transactions(team_id, kind, amount, note, actor_id, actor_name)
      VALUES (t.id, 'PRINCIPAL_REPAYMENT', v_prin_pay, 'Principal repayment', nullif(a->>'id', '')::integer, jse_actor_name(a));
    END IF;
    UPDATE teams SET cash = v_bal, updated_at = now() WHERE id = t.id;
    UPDATE loans SET interest_outstanding = interest_outstanding - v_int_pay, principal_outstanding = principal_outstanding - v_prin_pay,
           interest_paid = interest_paid + v_int_pay, principal_repaid = principal_repaid + v_prin_pay,
           status = CASE WHEN interest_outstanding - v_int_pay = 0 AND principal_outstanding - v_prin_pay = 0 THEN 'REPAID' ELSE 'OUTSTANDING' END,
           updated_at = now() WHERE team_id = t.id;
    PERFORM jse_audit(a, 'LOAN_REPAYMENT', 'loan', t.code, t.id, NULL, jsonb_build_object('cash', t.cash),
      jsonb_build_object('cash', v_bal), jsonb_build_object('amount', v_amount, 'interest_paid', v_int_pay, 'principal_paid', v_prin_pay));
    RETURN jsonb_build_object('success', true, 'action', 'REPAY', 'team', t.code, 'amount', v_amount, 'interest_paid', v_int_pay,
                              'principal_paid', v_prin_pay, 'cash', v_bal, 'loan', (SELECT to_jsonb(l) FROM loans l WHERE l.team_id = t.id));
  END IF;
  PERFORM jse_fail('INVALID_ACTION', 'Use DRAW or REPAY.', 400);
  RETURN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Market News automatic price engine (admin only)
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
DECLARE v_news bigint; v_applied numeric;
BEGIN
  v_applied := jse_pct(p_new, s.price);
  INSERT INTO market_news(security_id, mood, headline, requested_pct, applied_pct, previous_price, new_price, prior_previous, created_by, created_by_name)
  VALUES (s.id, p_mood, p_headline, p_req, v_applied, s.price, p_new, s.previous_price, nullif(a->>'id', '')::integer, jse_actor_name(a))
  RETURNING id INTO v_news;
  UPDATE securities SET previous_price = price, price = p_new, updated_at = now() WHERE id = s.id;
  INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source, news_id)
  VALUES (s.id, s.price, p_new, v_applied, 'MARKET_NEWS', v_news);
  PERFORM jse_audit(a, 'MARKET_NEWS_PRICE_MOVE', 'security', s.symbol, NULL, NULL,
    jsonb_build_object('price', s.price, 'previous_price', s.previous_price), jsonb_build_object('price', p_new, 'previous_price', s.price),
    jsonb_build_object('mood', p_mood, 'requested_pct', p_req, 'applied_pct', v_applied, 'headline', p_headline, 'news_id', v_news, 'source', 'MARKET_NEWS'));
  PERFORM jse_journal('MARKET_NEWS', v_news, s.symbol || ' ' || replace(p_mood, '_', ' ') || ' ' || to_char(v_applied, 'SG990.00') || '% (\u20B9' || s.price || ' \u2192 \u20B9' || p_new || ')',
                      jsonb_build_object('news_id', v_news, 'security_id', s.id), a);
  RETURN jsonb_build_object('success', true, 'news_id', v_news, 'symbol', s.symbol, 'name', s.name, 'mood', p_mood, 'headline', p_headline,
    'requested_pct', p_req, 'applied_pct', v_applied, 'previous_price', s.price, 'new_price', p_new, 'source', 'MARKET_NEWS');
END $$;

CREATE OR REPLACE FUNCTION jse_market_news(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE; v_status text; s securities%ROWTYPE;
  v_mood text := upper(replace(trim(coalesce(p->>'mood', '')), ' ', '_'));
  v_band numeric[]; v_pct numeric; v_new numeric; v_lo numeric; v_hi numeric; v_cap numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('NOT_STARTED', 'LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_CLOSED', 'Market News is not allowed after the market has closed.', 409);
  END IF;
  v_band := jse_mood_band(v_mood);
  IF v_band IS NULL THEN PERFORM jse_fail('INVALID_MOOD', 'Choose a market mood.', 400); END IF;
  SELECT * INTO s FROM securities WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')));
  IF NOT FOUND THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a company.', 404); END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('jse-news:' || s.id, 0));
  SELECT * INTO s FROM securities WHERE id = s.id FOR UPDATE;
  v_pct := round((v_band[1] + random() * (v_band[2] - v_band[1]))::numeric, 2);
  v_new := jse_round_tick(s.price * (1 + v_pct / 100), cfg.price_tick);
  -- never exceed the \xB110% single-move cap after rounding to the price tick
  v_cap := least(cfg.max_price_move_pct, 10);
  v_lo := ceil(s.price * (1 - v_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_hi := floor(s.price * (1 + v_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_new := greatest(v_lo, least(v_hi, v_new));
  IF v_new <= 0 THEN v_new := cfg.price_tick; END IF;
  RETURN jse__apply_news_price(a, s, v_mood, v_pct, v_new, 'Automatic ' || replace(v_mood, '_', ' ') || ' market impact');
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
  v_cur text; v_to text; v_open integer; v_listed jsonb := '[]'::jsonb; v_one jsonb; r record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT status INTO v_cur FROM event_control WHERE id = 1 FOR UPDATE;
  v_to := CASE v_action
    WHEN 'START'    THEN CASE WHEN v_cur = 'NOT_STARTED' THEN 'LIVE' END
    WHEN 'PAUSE'    THEN CASE WHEN v_cur = 'LIVE' THEN 'SETTLEMENT_ONLY' END
    WHEN 'RESUME'   THEN CASE WHEN v_cur = 'SETTLEMENT_ONLY' THEN 'LIVE' END
    WHEN 'CLOSE'    THEN CASE WHEN v_cur IN ('LIVE', 'SETTLEMENT_ONLY') THEN 'CLOSED' END
    WHEN 'REOPEN'   THEN CASE WHEN v_cur = 'CLOSED' THEN 'LIVE' END
    WHEN 'FINALIZE' THEN CASE WHEN v_cur = 'CLOSED' THEN 'FINALIZED' END
  END;
  IF v_action NOT IN ('START', 'PAUSE', 'RESUME', 'CLOSE', 'REOPEN', 'FINALIZE') THEN
    PERFORM jse_fail('INVALID_ACTION', 'Unknown event action.', 400);
  END IF;
  IF v_to IS NULL THEN
    PERFORM jse_fail('INVALID_TRANSITION', v_action || ' is not possible while the event is ' || v_cur || '.', 409);
  END IF;
  IF v_action = 'FINALIZE' THEN
    SELECT count(*) INTO v_open FROM orders WHERE status IN ('EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING');
    IF v_open > 0 THEN
      PERFORM jse_fail('OPEN_ORDERS', 'Cannot finalize while ' || v_open || ' order(s) are still waiting at the Exchange or Bank. Settle or reject them first.', 409);
    END IF;
  END IF;
  -- IPOs with a saved listing price open at that price when the market starts
  IF v_action = 'START' AND (SELECT auto_list_ipos FROM event_config WHERE id = 1) THEN
    FOR r IN SELECT id FROM securities WHERE kind = 'IPO' AND active AND listing_price IS NOT NULL AND listed_at IS NULL ORDER BY display_order, id LOOP
      v_one := jse__list_ipo(a, r.id);
      IF v_one IS NOT NULL THEN v_listed := v_listed || jsonb_build_array(v_one); END IF;
    END LOOP;
  END IF;
  RETURN jse__set_status(a, v_to, true,
    CASE v_action WHEN 'START' THEN 'EVENT_START' WHEN 'PAUSE' THEN 'EVENT_PAUSE' WHEN 'RESUME' THEN 'EVENT_RESUME'
                  WHEN 'CLOSE' THEN 'EVENT_CLOSE' WHEN 'REOPEN' THEN 'EVENT_REOPEN' ELSE 'EVENT_FINALIZE' END)
    || jsonb_build_object('listed', v_listed);
END $$;

-- Rejects every order still waiting at the Exchange or Bank (used at close).
CREATE OR REPLACE FUNCTION jse_reject_open_orders(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE o orders%ROWTYPE; v_n integer := 0; v_reason text := coalesce(nullif(trim(p->>'reason'), ''), 'Market closed before settlement');
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  FOR o IN SELECT * FROM orders WHERE status IN ('EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING') ORDER BY id FOR UPDATE LOOP
    UPDATE orders SET status = CASE WHEN o.status = 'EXCHANGE_PENDING' THEN 'EXCHANGE_REJECTED' ELSE 'BANK_REJECTED' END,
           reject_code = 'MARKET_CLOSED', reject_reason = v_reason, updated_at = now(),
           exchange_at = CASE WHEN o.status = 'EXCHANGE_PENDING' THEN now() ELSE exchange_at END,
           exchange_by_name = CASE WHEN o.status = 'EXCHANGE_PENDING' THEN jse_actor_name(a) ELSE exchange_by_name END,
           bank_at = CASE WHEN o.status <> 'EXCHANGE_PENDING' THEN now() ELSE bank_at END,
           bank_by_name = CASE WHEN o.status <> 'EXCHANGE_PENDING' THEN jse_actor_name(a) ELSE bank_by_name END
    WHERE id = o.id;
    PERFORM jse_order_event(o.id, CASE WHEN o.status = 'EXCHANGE_PENDING' THEN 'EXCHANGE_REJECTED' ELSE 'BANK_REJECTED' END, o.status,
      CASE WHEN o.status = 'EXCHANGE_PENDING' THEN 'EXCHANGE_REJECTED' ELSE 'BANK_REJECTED' END, a, v_reason, NULL);
    PERFORM jse_audit(a, CASE WHEN o.status = 'EXCHANGE_PENDING' THEN 'EXCHANGE_REJECTED' ELSE 'BANK_REJECTED' END, 'order', o.order_no,
      o.team_id, o.id, jsonb_build_object('status', o.status), NULL, jsonb_build_object('code', 'MARKET_CLOSED', 'bulk', true));
    v_n := v_n + 1;
  END LOOP;
  RETURN jsonb_build_object('success', true, 'rejected', v_n);
END $$;

-- ---------------------------------------------------------------------------
-- IPO allotments (bulk load before START; no brokerage, no price change)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__apply_allotment(a jsonb, p_allot ipo_allotments) RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_bal numeric; v_sym text;
BEGIN
  SELECT symbol INTO v_sym FROM securities WHERE id = p_allot.security_id;
  UPDATE teams SET cash = cash - p_allot.amount, updated_at = now() WHERE id = p_allot.team_id RETURNING cash INTO v_bal;
  IF v_bal < 0 THEN PERFORM jse_fail('ALLOTMENT_CASH', 'Allotment exceeds the team''s cash.', 409); END IF;
  PERFORM jse_ledger(p_allot.team_id, NULL, NULL, 'IPO_ALLOTMENT', p_allot.amount, 0, v_bal,
    'IPO allotment: ' || p_allot.lots || ' lot(s) = ' || p_allot.quantity || ' ' || v_sym || ' @ \u20B9' || p_allot.price || ' (no brokerage)', a);
  INSERT INTO holdings(team_id, security_id, quantity, cost_basis, trade_cost) VALUES (p_allot.team_id, p_allot.security_id, p_allot.quantity, p_allot.amount, p_allot.amount)
  ON CONFLICT (team_id, security_id) DO UPDATE SET quantity = holdings.quantity + EXCLUDED.quantity,
    cost_basis = holdings.cost_basis + EXCLUDED.cost_basis, trade_cost = holdings.trade_cost + EXCLUDED.trade_cost, updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION jse_ipo_allot(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_status text; r jsonb; v_errors jsonb := '[]'::jsonb; v_rows jsonb := '[]'::jsonb;
  v_team teams%ROWTYPE; v_sec securities%ROWTYPE; v_lots integer; v_i integer := 0;
  v_replace boolean := coalesce((p->>'replace')::boolean, false);
  v_batch text := coalesce(nullif(p->>'batch_id', ''), to_char(now(), 'YYYYMMDD-HH24MISS'));
  v_need jsonb := '{}'::jsonb; v_total numeric := 0; v_count integer := 0;
  al ipo_allotments%ROWTYPE; x record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR UPDATE;
  IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'IPO allotments can be loaded only before the event starts.', 409); END IF;
  IF jsonb_typeof(p->'rows') <> 'array' OR jsonb_array_length(p->'rows') = 0 THEN PERFORM jse_fail('NO_ROWS', 'No allotment rows were supplied.', 400); END IF;

  -- validation pass (nothing is written unless every row is valid)
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(r->>'team', '')));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown team ' || coalesce(r->>'team', '(blank)')); CONTINUE; END IF;
    SELECT * INTO v_sec FROM securities WHERE kind = 'IPO' AND (symbol = upper(trim(coalesce(r->>'ipo', r->>'symbol', ''))) OR upper(name) = upper(trim(coalesce(r->>'ipo', r->>'symbol', ''))));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown IPO ' || coalesce(r->>'ipo', r->>'symbol', '(blank)')); CONTINUE; END IF;
    BEGIN v_lots := (r->>'lots')::integer; EXCEPTION WHEN others THEN v_lots := NULL; END;
    IF v_lots IS NULL OR v_lots < 0 THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Lots must be a whole number'); CONTINUE; END IF;
    IF v_lots = 0 THEN CONTINUE; END IF;
    IF NOT v_replace AND EXISTS (SELECT 1 FROM ipo_allotments WHERE team_id = v_team.id AND security_id = v_sec.id AND reversed_at IS NULL) THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' already has a ' || v_sec.symbol || ' allotment (tick "replace" to overwrite)'); CONTINUE;
    END IF;
    v_rows := v_rows || jsonb_build_object('team_id', v_team.id, 'team', v_team.code, 'security_id', v_sec.id, 'symbol', v_sec.symbol,
                                           'lots', v_lots, 'quantity', v_lots * v_sec.lot_size, 'price', v_sec.base_price,
                                           'amount', v_lots * v_sec.lot_size * v_sec.base_price);
  END LOOP;
  -- duplicates inside the file
  FOR x IN SELECT e->>'team' AS team, e->>'symbol' AS symbol, count(*) AS n FROM jsonb_array_elements(v_rows) e GROUP BY 1, 2 HAVING count(*) > 1 LOOP
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', x.team || ' / ' || x.symbol || ' appears ' || x.n || ' times in the file');
  END LOOP;
  -- cash check per team (after reversing allotments that will be replaced)
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
-- IPO listing. The Controller saves a confidential listing price for each IPO before the event.
-- Listing moves the IPO from its issue price to the listing price (source LISTING), either with
-- "List IPOs now" or automatically at START EVENT. Only the administrator sees saved prices.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__list_ipo(a jsonb, p_id integer) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE s securities%ROWTYPE; v_pct numeric;
BEGIN
  SELECT * INTO s FROM securities WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR s.kind <> 'IPO' OR s.listing_price IS NULL OR s.listed_at IS NOT NULL THEN RETURN NULL; END IF;
  IF s.trade_count > 0 OR s.price <> s.base_price
     OR EXISTS (SELECT 1 FROM market_news n WHERE n.security_id = s.id AND n.reversed_at IS NULL) THEN
    PERFORM jse_fail('IPO_ALREADY_MOVED', s.symbol || ' has already traded or moved on Market News; it can no longer be listed.', 409);
  END IF;
  v_pct := jse_pct(s.listing_price, s.price);
  UPDATE securities SET previous_price = price, price = listing_price, listed_at = now(), updated_at = now() WHERE id = s.id;
  INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source) VALUES (s.id, s.price, s.listing_price, v_pct, 'LISTING');
  PERFORM jse_audit(a, 'IPO_LISTED', 'security', s.symbol, NULL, NULL,
    jsonb_build_object('price', s.price, 'previous_price', s.previous_price),
    jsonb_build_object('price', s.listing_price, 'previous_price', s.price),
    jsonb_build_object('issue_price', s.base_price, 'listing_price', s.listing_price, 'change_pct', round(v_pct, 2), 'source', 'LISTING'));
  PERFORM jse_journal('IPO_LISTING', s.id,
    s.symbol || ' listed at \u20B9' || s.listing_price || ' (issue \u20B9' || s.base_price || ', ' || to_char(round(v_pct, 2), 'SG990.00') || '%)',
    jsonb_build_object('security_id', s.id, 'from_price', s.price, 'from_previous', s.previous_price, 'listing_price', s.listing_price), a);
  RETURN jsonb_build_object('symbol', s.symbol, 'name', s.name, 'issue_price', s.base_price, 'listing_price', s.listing_price,
                            'change_pct', round(v_pct, 2));
END $$;

-- Listing status of every IPO; the saved price is visible only to administrators until the IPO lists.
CREATE OR REPLACE FUNCTION jse_listing_state(a jsonb) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'symbol', s.symbol, 'name', s.name, 'issue_price', s.base_price, 'price', s.price,
           'listing_saved', s.listing_price IS NOT NULL,
           'listing_price', CASE WHEN a->>'role' = 'ADMIN' OR s.listed_at IS NOT NULL THEN s.listing_price END,
           'gain_pct', CASE WHEN (a->>'role' = 'ADMIN' OR s.listed_at IS NOT NULL) AND s.listing_price IS NOT NULL
                            THEN round(jse_pct(s.listing_price, s.base_price), 2) END,
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
        v_rows := v_rows || jsonb_build_object('id', s.id, 'symbol', s.symbol, 'price', NULL);   -- blank = no listing price
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
             WHERE kind = 'IPO' AND active AND listing_price IS NOT NULL AND listed_at IS NULL
               AND (jsonb_typeof(p->'symbols') IS DISTINCT FROM 'array'
                    OR symbol IN (SELECT upper(trim(v)) FROM jsonb_array_elements_text(p->'symbols') v))
             ORDER BY display_order, id LOOP
      v_one := jse__list_ipo(a, s.id);
      IF v_one IS NOT NULL THEN v_out := v_out || jsonb_build_array(v_one); END IF;
    END LOOP;
    IF jsonb_array_length(v_out) = 0 THEN
      PERFORM jse_fail('NOTHING_TO_LIST', 'No saved listing price is waiting to be applied.', 409);
    END IF;
    UPDATE event_control SET market_updated_at = now() WHERE id = 1;
    RETURN jsonb_build_object('success', true, 'listed', v_out, 'listing', jse_listing_state(a));
  END IF;
  PERFORM jse_fail('INVALID_ACTION', 'Use SET, CLEAR or APPLY.', 400);
  RETURN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Reset: clean starting state. Audit history is archived, not lost.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_reset_event(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE; ev event_control%ROWTYPE;
  v_keep boolean := coalesce((p->>'keep_allotments')::boolean, true);
  v_allots jsonb; r jsonb; al ipo_allotments%ROWTYPE; v_n integer := 0; v_archived integer;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF coalesce(p->>'confirm', '') <> 'RESET' THEN PERFORM jse_fail('CONFIRM_REQUIRED', 'Type RESET to confirm.', 400); END IF;
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO ev FROM event_control WHERE id = 1 FOR UPDATE;
  IF ev.status IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_RUNNING', 'Close the market before resetting (current status: ' || ev.status || ').', 409);
  END IF;
  -- lock everything that is about to be rewritten
  LOCK TABLE orders, settlements, holdings, teams, securities, loans IN EXCLUSIVE MODE;
  SELECT coalesce(jsonb_agg(jsonb_build_object('team_id', team_id, 'security_id', security_id, 'lots', lots, 'quantity', quantity,
                                               'price', price, 'amount', amount, 'batch_id', batch_id) ORDER BY id), '[]'::jsonb)
  INTO v_allots FROM ipo_allotments WHERE reversed_at IS NULL;

  PERFORM set_config('jse.maintenance', 'on', true);
  INSERT INTO audit_log_archive SELECT al2.*, now(), ev.reset_count + 1 FROM audit_log al2;
  GET DIAGNOSTICS v_archived = ROW_COUNT;
  TRUNCATE action_journal, broker_commissions, cash_ledger, institution_ledger, loan_transactions, risk_events, price_history,
           market_news, order_events, settlements, holdings, institutional_holdings, ipo_allotments, orders, audit_log;
  PERFORM set_config('jse.maintenance', 'off', true);

  UPDATE teams SET cash = cfg.initial_capital, realized_pnl = 0, brokerage_paid = 0, short_sell_attempts = 0,
                   cash_shortfall_attempts = 0, insufficient_balance_rejections = 0, updated_at = now();
  UPDATE loans SET original_principal = 0, principal_outstanding = 0, interest_outstanding = 0, interest_charged = 0,
                   interest_paid = 0, principal_repaid = 0, draws = 0, status = 'NONE', updated_at = now();
  INSERT INTO loans(team_id) SELECT id FROM teams ON CONFLICT (team_id) DO NOTHING;
  UPDATE institutions SET cash = initial_cash, updated_at = now();
  -- saved IPO listing prices are kept (they list again at the next START); the listing itself is undone
  UPDATE securities SET price = base_price, previous_price = base_price, trade_count = 0, traded_quantity = 0, traded_value = 0,
                        last_trade_at = NULL, listed_at = NULL, updated_at = now();
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
         status_changed_at = now(), status_changed_by = jse_actor_name(a), reset_count = reset_count + 1, last_reset_at = now() WHERE id = 1;
  PERFORM jse_audit(a, 'RESET_EVENT', 'event', 'event_control', NULL, NULL, jsonb_build_object('status', ev.status),
    jsonb_build_object('status', 'NOT_STARTED'),
    jsonb_build_object('reset_no', ev.reset_count + 1, 'archived_audit_rows', v_archived, 'kept_ipo_allotments', v_n, 'keep_allotments', v_keep));
  RETURN jsonb_build_object('success', true, 'status', 'NOT_STARTED', 'reset_no', ev.reset_count + 1, 'kept_ipo_allotments', v_n, 'archived_audit_rows', v_archived);
END $$;

-- ---------------------------------------------------------------------------
-- Undo / redo of journaled actions where it is safe to do so
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__undo_settlement(a jsonb, p_settle bigint) RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  st settlements%ROWTYPE; o orders%ROWTYPE; s securities%ROWTYPE; t teams%ROWTYPE; ln loans%ROWTYPE; inst institutions%ROWTYPE;
  v_bal numeric; v_last_price bigint; v_restore numeric; v_restore_prev numeric; v_team_buys boolean;
BEGIN
  SELECT * INTO st FROM settlements WHERE id = p_settle FOR UPDATE;
  IF NOT FOUND OR st.reversed_at IS NOT NULL THEN RETURN 'This settlement is already reversed.'; END IF;
  SELECT * INTO o FROM orders WHERE id = st.order_id FOR UPDATE;
  SELECT * INTO s FROM securities WHERE id = st.security_id FOR UPDATE;
  SELECT * INTO t FROM teams WHERE id = st.team_id FOR UPDATE;
  SELECT * INTO ln FROM loans WHERE team_id = st.team_id FOR UPDATE;
  IF st.institution_id IS NOT NULL THEN SELECT * INTO inst FROM institutions WHERE id = st.institution_id FOR UPDATE; END IF;

  IF EXISTS (SELECT 1 FROM settlements x WHERE x.security_id = st.security_id AND x.id > st.id AND x.reversed_at IS NULL)
     OR EXISTS (SELECT 1 FROM market_news n WHERE n.security_id = st.security_id AND n.created_at > st.settled_at AND n.reversed_at IS NULL) THEN
    RETURN 'Later trades or news already changed ' || s.symbol || '. Undo the later actions first.';
  END IF;
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
    VALUES (t.id, 'REVERSAL', st.loan_drawn, o.id, st.id, 'Automatic draw reversed (undo)', nullif(a->>'id', '')::integer, jse_actor_name(a));
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
  -- restore the price that was in force before this trade
  IF s.price <> st.price_before OR s.previous_price <> st.previous_price_before THEN
    UPDATE securities SET price = st.price_before, previous_price = st.previous_price_before, updated_at = now() WHERE id = s.id;
    IF s.price <> st.price_before THEN
      INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source, order_id, settlement_id)
      VALUES (s.id, s.price, st.price_before, jse_pct(st.price_before, s.price), 'UNDO', o.id, st.id);
    END IF;
  END IF;
  UPDATE securities SET trade_count = greatest(0, trade_count - 1), traded_quantity = greatest(0, traded_quantity - st.quantity),
         traded_value = greatest(0, traded_value - st.trade_value) WHERE id = s.id;
  UPDATE settlements SET reversed_at = now(), reversed_by_name = jse_actor_name(a) WHERE id = st.id;
  UPDATE orders SET status = 'EXCHANGE_APPROVED', bank_by = NULL, bank_by_name = NULL, bank_at = NULL, updated_at = now() WHERE id = o.id;
  PERFORM jse_order_event(o.id, 'UNDO_SETTLEMENT', 'BANK_SETTLED', 'EXCHANGE_APPROVED', a, 'Settlement reversed by administrator', NULL);
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
      UPDATE securities SET price = n.previous_price, previous_price = n.prior_previous, updated_at = now() WHERE id = s.id;
      INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source, news_id)
      VALUES (s.id, s.price, n.previous_price, jse_pct(n.previous_price, s.price), 'UNDO', n.id);
      UPDATE market_news SET reversed_at = now() WHERE id = n.id;
    ELSE
      IF n.reversed_at IS NULL THEN PERFORM jse_fail('NOT_UNDONE', 'That news impact is still active.', 409); END IF;
      IF s.price <> n.previous_price THEN PERFORM jse_fail('UNSAFE_REDO', s.symbol || ' has moved since; re-publish the news instead.', 409); END IF;
      UPDATE securities SET previous_price = price, price = n.new_price, updated_at = now() WHERE id = s.id;
      INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source, news_id)
      VALUES (s.id, s.price, n.new_price, jse_pct(n.new_price, s.price), 'REDO', n.id);
      UPDATE market_news SET reversed_at = NULL, created_at = now() WHERE id = n.id;
    END IF;
  ELSIF j.action = 'IPO_LISTING' THEN
    SELECT * INTO s FROM securities WHERE id = (j.payload->>'security_id')::integer FOR UPDATE;
    IF v_action = 'UNDO' THEN
      IF s.listed_at IS NULL THEN PERFORM jse_fail('ALREADY_UNDONE', s.symbol || ' is not listed.', 409); END IF;
      IF s.price <> (j.payload->>'listing_price')::numeric OR s.trade_count > 0
         OR EXISTS (SELECT 1 FROM price_history ph WHERE ph.security_id = s.id AND ph.created_at > s.listed_at) THEN
        PERFORM jse_fail('UNSAFE_UNDO', s.symbol || ' has traded or moved since listing. Undo the later actions first.', 409);
      END IF;
      UPDATE securities SET price = (j.payload->>'from_price')::numeric, previous_price = (j.payload->>'from_previous')::numeric,
             listed_at = NULL, updated_at = now() WHERE id = s.id;
      INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source)
      VALUES (s.id, s.price, (j.payload->>'from_price')::numeric, jse_pct((j.payload->>'from_price')::numeric, s.price), 'UNDO');
    ELSE
      IF s.listed_at IS NOT NULL THEN PERFORM jse_fail('NOT_UNDONE', s.symbol || ' is already listed.', 409); END IF;
      IF s.price <> (j.payload->>'from_price')::numeric OR s.trade_count > 0 THEN
        PERFORM jse_fail('UNSAFE_REDO', s.symbol || ' has moved since; save the listing price and list it again instead.', 409);
      END IF;
      UPDATE securities SET previous_price = price, price = (j.payload->>'listing_price')::numeric, listed_at = now(), updated_at = now() WHERE id = s.id;
      INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source)
      VALUES (s.id, s.price, (j.payload->>'listing_price')::numeric, jse_pct((j.payload->>'listing_price')::numeric, s.price), 'REDO');
    END IF;
  ELSIF j.action = 'EVENT_STATUS' THEN
    v_from := j.payload->>'from'; v_to := j.payload->>'to';
    IF v_action = 'UNDO' THEN
      IF v_cur <> v_to THEN PERFORM jse_fail('UNSAFE_UNDO', 'The event status has changed since (' || v_cur || ').', 409); END IF;
      IF v_from = 'NOT_STARTED' AND EXISTS (SELECT 1 FROM orders) THEN PERFORM jse_fail('UNSAFE_UNDO', 'Orders already exist; use RESET instead.', 409); END IF;
      PERFORM jse__set_status(a, v_from, false, 'EVENT_STATUS_UNDO');
    ELSE
      IF v_cur <> v_from THEN PERFORM jse_fail('UNSAFE_REDO', 'The event status has changed since (' || v_cur || ').', 409); END IF;
      IF v_to = 'FINALIZED' AND EXISTS (SELECT 1 FROM orders WHERE status IN ('EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING')) THEN
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
-- Administration: configuration, teams, users
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_update_config(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE before jsonb; after jsonb; v_status text;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  SELECT to_jsonb(c) INTO before FROM event_config c WHERE id = 1;
  IF v_status <> 'NOT_STARTED' AND (p ? 'initial_capital' OR p ? 'institutional_cash') THEN
    PERFORM jse_fail('EVENT_STARTED', 'Starting capital can only be changed before the event starts (then RESET).', 409);
  END IF;
  UPDATE event_config SET
    event_name              = coalesce(nullif(p->>'event_name', ''), event_name),
    initial_capital         = coalesce((p->>'initial_capital')::numeric, initial_capital),
    institutional_cash      = coalesce((p->>'institutional_cash')::numeric, institutional_cash),
    brokerage_rate          = coalesce((p->>'brokerage_rate')::numeric, brokerage_rate),
    max_price_move_pct      = coalesce((p->>'max_price_move_pct')::numeric, max_price_move_pct),
    min_order_value         = coalesce((p->>'min_order_value')::numeric, min_order_value),
    max_order_value         = coalesce((p->>'max_order_value')::numeric, max_order_value),
    loan_max_principal      = coalesce((p->>'loan_max_principal')::numeric, loan_max_principal),
    loan_interest_rate      = coalesce((p->>'loan_interest_rate')::numeric, loan_interest_rate),
    min_cash_buffer         = coalesce((p->>'min_cash_buffer')::numeric, min_cash_buffer),
    cash_rule_limit         = coalesce((p->>'cash_rule_limit')::numeric, cash_rule_limit),
    loans_enabled           = coalesce((p->>'loans_enabled')::boolean, loans_enabled),
    auto_loan_on_settlement = coalesce((p->>'auto_loan_on_settlement')::boolean, auto_loan_on_settlement),
    participant_order_entry = coalesce((p->>'participant_order_entry')::boolean, participant_order_entry),
    institution_overdraft   = coalesce((p->>'institution_overdraft')::boolean, institution_overdraft),
    auto_list_ipos          = coalesce((p->>'auto_list_ipos')::boolean, auto_list_ipos),
    updated_at = now(), updated_by = jse_actor_name(a)
  WHERE id = 1;
  IF p ? 'institutional_cash' THEN UPDATE institutions SET initial_cash = (p->>'institutional_cash')::numeric; END IF;
  SELECT to_jsonb(c) INTO after FROM event_config c WHERE id = 1;
  PERFORM jse_audit(a, 'CONFIG_UPDATED', 'event_config', '1', NULL, NULL, before, after, NULL);
  RETURN jsonb_build_object('success', true, 'config', after);
EXCEPTION WHEN check_violation OR invalid_text_representation THEN
  PERFORM jse_fail('INVALID_CONFIG', 'One of the values is not valid.', 400);
  RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION jse_update_teams(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE r jsonb; v_n integer := 0; v_errors jsonb := '[]'::jsonb; v_broker integer; v_team teams%ROWTYPE; v_i integer := 0;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  FOR r IN SELECT value FROM jsonb_array_elements(coalesce(p->'rows', '[]'::jsonb)) LOOP
    v_i := v_i + 1;
    SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(r->>'team', '')));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown team ' || coalesce(r->>'team', '')); CONTINUE; END IF;
    v_broker := NULL;
    IF coalesce(r->>'broker', '') <> '' THEN
      SELECT id INTO v_broker FROM brokers WHERE code = upper(trim(r->>'broker')) OR upper(name) = upper(trim(r->>'broker'));
      IF v_broker IS NULL THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown broker ' || (r->>'broker')); CONTINUE; END IF;
    END IF;
    UPDATE teams SET name = coalesce(nullif(trim(r->>'name'), ''), name), section = coalesce(nullif(trim(r->>'section'), ''), section),
           members = coalesce(nullif(trim(r->>'members'), ''), members), broker_id = coalesce(v_broker, broker_id),
           active = coalesce((r->>'active')::boolean, active), updated_at = now()
    WHERE id = v_team.id;
    v_n := v_n + 1;
  END LOOP;
  IF v_n > 0 THEN PERFORM jse_audit(a, 'TEAMS_UPDATED', 'team', NULL, NULL, NULL, NULL, NULL, jsonb_build_object('rows', v_n)); END IF;
  RETURN jsonb_build_object('success', jsonb_array_length(v_errors) = 0, 'updated', v_n, 'errors', v_errors);
END $$;

CREATE OR REPLACE FUNCTION jse_update_brokers(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE r jsonb; v_n integer := 0;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  FOR r IN SELECT value FROM jsonb_array_elements(coalesce(p->'rows', '[]'::jsonb)) LOOP
    UPDATE brokers SET name = coalesce(nullif(trim(r->>'name'), ''), name) WHERE code = upper(trim(coalesce(r->>'broker', r->>'code', '')));
    IF FOUND THEN v_n := v_n + 1; END IF;
  END LOOP;
  PERFORM jse_audit(a, 'BROKERS_UPDATED', 'broker', NULL, NULL, NULL, NULL, NULL, jsonb_build_object('rows', v_n));
  RETURN jsonb_build_object('success', true, 'updated', v_n);
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
                                          'team', t.code, 'active', u2.active, 'last_login_at', u2.last_login_at,
                                          'must_change_password', u2.must_change_password) ORDER BY u2.role, u2.username)
      FROM app_users u2 LEFT JOIN teams t ON t.id = u2.team_id), '[]'::jsonb));
  ELSIF v_action = 'RESET_PASSWORD' THEN
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

-- Free-form audit entries for administrative read actions (exports)
CREATE OR REPLACE FUNCTION jse_audit_note(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_action text := upper(coalesce(p->>'action', ''));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  IF v_action NOT IN ('EXPORT_EVENT_EXCEL', 'EXPORT_CSV', 'CREDENTIALS_ISSUED') THEN PERFORM jse_fail('INVALID_ACTION', 'Unknown audit note.', 400); END IF;
  PERFORM jse_audit(a, v_action, 'export', NULL, NULL, NULL, NULL, NULL, p - 'action');
  RETURN jsonb_build_object('success', true);
END $$;

INSERT INTO schema_migrations(version) VALUES ('003_ops');
`;var Si=`-- JAIN STOCK EXCHANGE (JSE) v272
-- 004_reads.sql: read models used by the API (market, portfolios, tracking, queues,
-- ledgers, audit, commissions, intelligence, institutional, admin state, exports).

-- ---------------------------------------------------------------------------
-- Team metrics: Net Worth = liquid cash + \u03A3(quantity \xD7 current price). Loans are NOT deducted.
-- \u20B950K closing cash rule: profit cash (realised trading profit still held as cash) is exempt;
-- the rest of the cash ("base cash counted") must be at most cash_rule_limit at close.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW jse_team_metrics AS
WITH cfg AS (SELECT * FROM event_config WHERE id = 1),
     ev  AS (SELECT status FROM event_control WHERE id = 1),
     hv  AS (SELECT h.team_id, sum(h.quantity * s.price) AS holdings_value, sum(h.cost_basis) AS cost_basis,
                    count(*) FILTER (WHERE h.quantity > 0) AS positions
             FROM holdings h JOIN securities s ON s.id = h.security_id GROUP BY h.team_id),
     base AS (
       SELECT t.id AS team_id, t.code, t.seq, t.name, t.section, t.members, t.active, b.id AS broker_id, b.code AS broker, b.name AS broker_name,
              t.cash, coalesce(hv.holdings_value, 0)::numeric(18,2) AS holdings_value, coalesce(hv.cost_basis, 0) AS cost_basis,
              coalesce(hv.positions, 0) AS positions, t.realized_pnl, t.brokerage_paid,
              t.short_sell_attempts, t.cash_shortfall_attempts, t.insufficient_balance_rejections,
              coalesce(l.original_principal, 0) AS loan_original, coalesce(l.principal_outstanding, 0) AS loan_principal,
              coalesce(l.interest_outstanding, 0) AS loan_interest, coalesce(l.interest_charged, 0) AS loan_interest_charged,
              coalesce(l.interest_paid, 0) AS loan_interest_paid, coalesce(l.principal_repaid, 0) AS loan_principal_repaid,
              coalesce(l.status, 'NONE') AS loan_status,
              greatest(0, least(t.cash, t.realized_pnl)) AS profit_cash_exempt,
              cfg.initial_capital, cfg.cash_rule_limit, ev.status AS event_status
       FROM teams t CROSS JOIN cfg CROSS JOIN ev
       LEFT JOIN brokers b ON b.id = t.broker_id
       LEFT JOIN hv ON hv.team_id = t.id
       LEFT JOIN loans l ON l.team_id = t.id)
SELECT base.*,
       (cash + holdings_value)::numeric(18,2) AS net_worth,
       (cash + holdings_value - initial_capital)::numeric(18,2) AS pnl,
       round((cash + holdings_value - initial_capital) * 100 / initial_capital, 4) AS return_pct,
       (holdings_value - cost_basis)::numeric(18,2) AS unrealized_pnl,
       (cash - profit_cash_exempt)::numeric(18,2) AS base_cash_counted,
       (cash - profit_cash_exempt) <= cash_rule_limit AS cash_rule_met,
       CASE WHEN event_status IN ('CLOSED', 'FINALIZED')
            THEN CASE WHEN (cash - profit_cash_exempt) <= cash_rule_limit THEN 'SATISFIED' ELSE 'NOT_SATISFIED' END
            ELSE 'PROVISIONAL' END AS cash_rule_status,
       CASE WHEN event_status IN ('CLOSED', 'FINALIZED')
            THEN CASE WHEN (cash - profit_cash_exempt) <= cash_rule_limit THEN 'ELIGIBLE' ELSE 'LOCKED' END
            ELSE 'PROVISIONAL' END AS portfolio_access,
       CASE WHEN event_status IN ('CLOSED', 'FINALIZED') THEN (cash - profit_cash_exempt) <= cash_rule_limit ELSE true END AS in_winner_pool,
       (loan_principal + loan_interest)::numeric(18,2) AS loan_liability
FROM base;

-- Ranked metrics with the official winner (highest Net Worth in the pool; tie -> team code ascending)
CREATE OR REPLACE FUNCTION jse_ranked_teams() RETURNS TABLE(m jsonb, rank_overall integer, rank_pool integer, is_winner boolean)
LANGUAGE sql STABLE AS $$
  WITH r AS (
    SELECT tm.*,
           row_number() OVER (ORDER BY net_worth DESC, code ASC)::integer AS rk,
           CASE WHEN in_winner_pool THEN row_number() OVER (PARTITION BY in_winner_pool ORDER BY net_worth DESC, code ASC)::integer END AS rkp
    FROM jse_team_metrics tm WHERE tm.active)
  SELECT to_jsonb(r) - 'initial_capital' - 'cash_rule_limit' - 'event_status', rk, rkp, coalesce(rkp = 1, false) FROM r
$$;

-- ---------------------------------------------------------------------------
-- Market (public)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_security_json(s securities) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('id', s.id, 'symbol', s.symbol, 'name', s.name, 'kind', s.kind, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
    'price', s.price, 'previous_price', s.previous_price, 'base_price', s.base_price,
    'change', s.price - s.previous_price, 'change_pct', round(jse_pct(s.price, s.previous_price), 2),
    'day_change_pct', round(jse_pct(s.price, s.base_price), 2), 'lot_size', s.lot_size,
    'trade_count', s.trade_count, 'traded_value', s.traded_value, 'last_trade_at', s.last_trade_at, 'updated_at', s.updated_at,
    'listed', CASE WHEN s.kind = 'IPO' THEN s.listed_at IS NOT NULL END, 'listed_at', s.listed_at)
$$;

CREATE OR REPLACE FUNCTION jse_market() RETURNS jsonb LANGUAGE sql STABLE AS $$
  WITH ev AS (SELECT * FROM event_control WHERE id = 1),
       cfg AS (SELECT * FROM event_config WHERE id = 1),
       s AS (SELECT * FROM securities WHERE active),
       idx AS (SELECT coalesce(sum(price), 0) AS v, coalesce(sum(base_price), 0) AS b, coalesce(sum(previous_price), 0) AS p FROM s)
  SELECT jsonb_build_object(
    'success', true,
    'status', ev.status, 'status_changed_at', ev.status_changed_at, 'server_time', now(),
    'event_name', cfg.event_name,
    'index', jsonb_build_object('name', 'CMS INDEX', 'value', idx.v, 'base_value', idx.b, 'change', idx.v - idx.b,
                                'change_pct', CASE WHEN idx.b = 0 THEN 0 ELSE round((idx.v - idx.b) * 100 / idx.b, 2) END),
    'breadth', (SELECT jsonb_build_object('advances', count(*) FILTER (WHERE price > base_price), 'declines', count(*) FILTER (WHERE price < base_price),
                                          'unchanged', count(*) FILTER (WHERE price = base_price)) FROM s),
    'updated_at', (SELECT max(updated_at) FROM s),
    'price_band_pct', cfg.max_price_move_pct, 'price_tick', cfg.price_tick,
    'ipos', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY x.display_order, x.id) FROM s x WHERE x.kind = 'IPO'), '[]'::jsonb),
    'stocks', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY x.display_order, x.id) FROM s x WHERE x.kind = 'EQUITY'), '[]'::jsonb))
  FROM ev, cfg, idx
$$;

CREATE OR REPLACE FUNCTION jse_event_status() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('success', true, 'status', ev.status, 'status_changed_at', ev.status_changed_at, 'started_at', ev.started_at,
    'index', (SELECT jsonb_build_object('value', sum(price), 'base_value', sum(base_price),
              'change_pct', CASE WHEN sum(base_price) = 0 THEN 0 ELSE round((sum(price) - sum(base_price)) * 100 / sum(base_price), 2) END)
              FROM securities WHERE active),
    'closed_at', ev.closed_at, 'finalized_at', ev.finalized_at, 'reset_count', ev.reset_count, 'server_time', now(),
    'event_name', cfg.event_name,
    'config', jsonb_build_object('initial_capital', cfg.initial_capital, 'institutional_cash', cfg.institutional_cash,
      'brokerage_rate', cfg.brokerage_rate, 'stock_lot_size', cfg.stock_lot_size, 'ipo_lot_size', cfg.ipo_lot_size, 'price_tick', cfg.price_tick,
      'min_order_value', cfg.min_order_value, 'max_order_value', cfg.max_order_value, 'max_price_move_pct', cfg.max_price_move_pct,
      'loan_max_principal', cfg.loan_max_principal, 'loan_interest_rate', cfg.loan_interest_rate, 'min_cash_buffer', cfg.min_cash_buffer,
      'cash_rule_limit', cfg.cash_rule_limit, 'loans_enabled', cfg.loans_enabled, 'auto_loan_on_settlement', cfg.auto_loan_on_settlement,
      'participant_order_entry', cfg.participant_order_entry, 'institution_overdraft', cfg.institution_overdraft),
    'counts', (SELECT jsonb_build_object(
      'teams', (SELECT count(*) FROM teams WHERE active), 'stocks', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active),
      'ipos', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active), 'brokers', (SELECT count(*) FROM brokers WHERE active),
      'exchange_pending', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
      'bank_pending', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING')),
      'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
      'rejected', count(*) FILTER (WHERE status IN ('EXCHANGE_REJECTED', 'BANK_REJECTED')),
      'orders', count(*)) FROM orders))
  FROM event_control ev, event_config cfg WHERE ev.id = 1 AND cfg.id = 1
$$;

-- ---------------------------------------------------------------------------
-- Participant portfolios (all teams) and detail
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_portfolios(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_rows jsonb; v_status text; cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'INSTITUTIONAL', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  SELECT jsonb_agg(m || jsonb_build_object('rank', rank_overall, 'rank_in_pool', rank_pool, 'winner', is_winner) ORDER BY (m->>'seq')::integer)
  INTO v_rows FROM jse_ranked_teams();
  RETURN jsonb_build_object('success', true, 'event_status', v_status,
    'criterion', 'Winner = highest Net Worth (liquid cash + market value of holdings). Loans are not deducted. Ties go to the lower team code.',
    'pool_rule', CASE WHEN v_status IN ('CLOSED', 'FINALIZED') THEN 'Winner pool: teams that satisfy the \u20B9' || cfg.cash_rule_limit || ' closing cash rule'
                      ELSE 'Winner pool: all teams (provisional while the market is open)' END,
    'initial_capital', cfg.initial_capital, 'cash_rule_limit', cfg.cash_rule_limit,
    'stats', (SELECT jsonb_build_object('teams', count(*), 'total_net_worth', sum(net_worth), 'average_net_worth', round(avg(net_worth), 2),
              'highest_net_worth', max(net_worth), 'lowest_net_worth', min(net_worth), 'total_cash', sum(cash), 'total_holdings', sum(holdings_value),
              'cash_rule_met', count(*) FILTER (WHERE cash_rule_met), 'cash_rule_not_met', count(*) FILTER (WHERE NOT cash_rule_met),
              'profitable', count(*) FILTER (WHERE pnl > 0), 'short_sell_attempts', sum(short_sell_attempts),
              'cash_shortfall_attempts', sum(cash_shortfall_attempts), 'insufficient_balance_rejections', sum(insufficient_balance_rejections),
              'total_brokerage', sum(brokerage_paid), 'loans_outstanding', sum(loan_principal + loan_interest))
              FROM jse_team_metrics WHERE active),
    'winner', (SELECT m || jsonb_build_object('rank', rank_overall) FROM jse_ranked_teams() WHERE is_winner LIMIT 1),
    'teams', coalesce(v_rows, '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION jse_portfolio_detail(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE t teams%ROWTYPE; v_m jsonb; cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'INSTITUTIONAL', 'VIEWER', 'PARTICIPANT');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO t FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')));
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Team not found.', 404); END IF;
  IF a->>'role' = 'PARTICIPANT' AND (a->>'team_id')::integer IS DISTINCT FROM t.id THEN
    PERFORM jse_fail('FORBIDDEN', 'You can view only your own team.', 403);
  END IF;
  SELECT m || jsonb_build_object('rank', rank_overall, 'rank_in_pool', rank_pool, 'winner', is_winner) INTO v_m
  FROM jse_ranked_teams() WHERE (m->>'team_id')::integer = t.id;
  RETURN jsonb_build_object('success', true, 'team', v_m,
    'starting_capital', cfg.initial_capital, 'cash_limit', cfg.cash_rule_limit, 'min_cash_buffer', cfg.min_cash_buffer,
    'loan_limit', cfg.loan_max_principal, 'loan_rate', cfg.loan_interest_rate,
    'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'security', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'quantity', h.quantity, 'avg_price', round(h.trade_cost / nullif(h.quantity, 0), 2), 'cost_basis', round(h.cost_basis, 2),
        'current_price', s.price, 'market_value', h.quantity * s.price, 'unrealized_pnl', round(h.quantity * s.price - h.cost_basis, 2),
        'change_pct', round(jse_pct(s.price, s.previous_price), 2)) ORDER BY h.quantity * s.price DESC)
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
    'ipo_allotments', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'lots', al.lots, 'quantity', al.quantity, 'price', al.price, 'amount', al.amount))
      FROM ipo_allotments al JOIN securities s ON s.id = al.security_id WHERE al.team_id = t.id AND al.reversed_at IS NULL), '[]'::jsonb),
    'loan', (SELECT jsonb_build_object('original_principal', l.original_principal, 'current_principal', l.principal_outstanding,
        'interest', l.interest_outstanding, 'interest_charged', l.interest_charged, 'interest_paid', l.interest_paid,
        'principal_repaid', l.principal_repaid, 'total_liability', l.principal_outstanding + l.interest_outstanding,
        'remaining_limit', greatest(0, cfg.loan_max_principal - l.original_principal), 'draws', l.draws,
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
    'recent_ledger', coalesce((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'type', c.entry_type, 'debit', c.debit, 'credit', c.credit,
        'balance_after', c.balance_after, 'note', c.note, 'order_no', o.order_no, 'created_at', c.created_at) ORDER BY c.id DESC)
      FROM (SELECT * FROM cash_ledger WHERE team_id = t.id ORDER BY id DESC LIMIT 25) c LEFT JOIN orders o ON o.id = c.order_id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Order tracking (filters + KPIs + pagination) and single-order workflow
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_tracking(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_team integer; v_status text := nullif(upper(trim(coalesce(p->>'status', ''))), '');
  v_side text := nullif(upper(trim(coalesce(p->>'side', ''))), '');
  v_kind text := nullif(upper(trim(coalesce(p->>'kind', ''))), '');
  v_acct text := nullif(upper(trim(coalesce(p->>'account', ''))), '');
  v_q text := nullif(trim(coalesce(p->>'q', '')), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(200, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 50)));
  v_res jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'INSTITUTIONAL', 'VIEWER', 'PARTICIPANT');
  IF a->>'role' = 'PARTICIPANT' THEN
    v_team := (a->>'team_id')::integer;
  ELSIF coalesce(p->>'team', '') <> '' THEN
    SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team'));
    IF v_team IS NULL THEN v_team := -1; END IF;
  END IF;
  IF v_status = 'OPEN' THEN v_status := NULL; END IF;

  WITH f AS (
    SELECT o.*, s.symbol, s.name AS security_name, s.kind, t.code AS team_code, t.name AS team_name, b.code AS broker_code, i.code AS institution_code
    FROM orders o JOIN securities s ON s.id = o.security_id JOIN teams t ON t.id = o.team_id
    LEFT JOIN brokers b ON b.id = o.broker_id LEFT JOIN institutions i ON i.id = o.institution_id
    WHERE (v_team IS NULL OR o.team_id = v_team)
      AND (v_status IS NULL OR o.status = v_status OR (v_status = 'REJECTED' AND o.status IN ('EXCHANGE_REJECTED', 'BANK_REJECTED'))
           OR (v_status = 'PENDING' AND o.status IN ('EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING')))
      AND (v_side IS NULL OR o.side = v_side)
      AND (v_kind IS NULL OR s.kind = v_kind OR (v_kind = 'STOCK' AND s.kind = 'EQUITY'))
      AND (v_acct IS NULL OR o.account_type = v_acct)
      AND (v_q IS NULL OR o.order_no ILIKE '%' || v_q || '%' OR t.code ILIKE '%' || v_q || '%' OR s.symbol ILIKE '%' || v_q || '%'
           OR s.name ILIKE '%' || v_q || '%' OR coalesce(b.code, '') ILIKE '%' || v_q || '%'))
  SELECT jsonb_build_object('success', true,
    'kpis', (SELECT jsonb_build_object('orders', count(*),
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
        'team_name', x.team_name, 'broker', x.broker_code, 'institution', x.institution_code, 'symbol', x.symbol, 'security', x.security_name,
        'kind', x.kind, 'side', x.side, 'quantity', x.quantity, 'price', x.price, 'trade_value', x.trade_value, 'brokerage', x.brokerage,
        'settlement_amount', x.settlement_amount, 'status', x.status, 'reject_code', x.reject_code, 'reject_reason', x.reject_reason,
        'short_sell_flag', x.short_sell_flag, 'cash_shortfall_flag', x.cash_shortfall_flag, 'created_by', x.created_by_name,
        'created_at', x.created_at, 'exchange_by', x.exchange_by_name, 'exchange_at', x.exchange_at, 'bank_by', x.bank_by_name,
        'bank_at', x.bank_at, 'updated_at', x.updated_at) ORDER BY x.updated_at DESC, x.id DESC)
      FROM (SELECT * FROM f ORDER BY f.updated_at DESC, f.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) x), '[]'::jsonb))
  INTO v_res;
  RETURN v_res;
END $$;

CREATE OR REPLACE FUNCTION jse_order_detail(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE o orders%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'INSTITUTIONAL', 'VIEWER', 'PARTICIPANT');
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint OR order_no = upper(trim(coalesce(p->>'order_no', '')));
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF a->>'role' = 'PARTICIPANT' AND (a->>'team_id')::integer IS DISTINCT FROM o.team_id THEN PERFORM jse_fail('FORBIDDEN', 'Not your order.', 403); END IF;
  RETURN jsonb_build_object('success', true, 'order', jse_order_json(o.id),
    'events', coalesce((SELECT jsonb_agg(jsonb_build_object('event', e.event, 'from', e.from_status, 'to', e.to_status, 'actor', e.actor_name,
        'role', e.actor_role, 'note', e.note, 'data', e.data, 'at', e.created_at) ORDER BY e.id) FROM order_events e WHERE e.order_id = o.id), '[]'::jsonb),
    'settlement', (SELECT to_jsonb(st) FROM settlements st WHERE st.order_id = o.id AND st.reversed_at IS NULL),
    'risk', coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.id) FROM risk_events r WHERE r.order_id = o.id), '[]'::jsonb),
    'audit', coalesce((SELECT jsonb_agg(jsonb_build_object('action', al.action, 'actor', al.actor_username, 'role', al.actor_role,
        'details', al.details, 'at', al.created_at) ORDER BY al.id) FROM audit_log al WHERE al.order_id = o.id), '[]'::jsonb));
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
        'market_price', s.price, 'price_diff_pct', round(jse_pct(o.price, s.price), 2),
        'short_sell_risk', (o.account_type = 'TEAM' AND o.side = 'SELL' AND o.quantity > av.available),
        'cash_risk', (o.account_type = 'TEAM' AND o.side = 'BUY' AND o.settlement_amount > jse_available_cash(o.team_id, o.id)),
        'age_seconds', extract(epoch FROM now() - o.created_at)::integer) AS j
      FROM orders o JOIN securities s ON s.id = o.security_id
      CROSS JOIN LATERAL jse_available_qty(o.team_id, o.security_id, o.id) av
      WHERE o.status = 'EXCHANGE_PENDING' ORDER BY o.id LIMIT 300) q), '[]'::jsonb),
    'recent', coalesce((SELECT jsonb_agg(jse_order_json(x.id) ORDER BY x.exchange_at DESC) FROM (
      SELECT id, exchange_at FROM orders WHERE exchange_at IS NOT NULL ORDER BY exchange_at DESC LIMIT 25) x), '[]'::jsonb),
    'counts', (SELECT jsonb_build_object('pending', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
       'approved_today', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING', 'BANK_SETTLED', 'BANK_REJECTED') AND exchange_at IS NOT NULL),
       'rejected', count(*) FILTER (WHERE status = 'EXCHANGE_REJECTED')) FROM orders));
END $$;

CREATE OR REPLACE FUNCTION jse_bank_queue(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  RETURN jsonb_build_object('success', true, 'min_cash_buffer', cfg.min_cash_buffer, 'loan_limit', cfg.loan_max_principal,
    'pending', coalesce((SELECT jsonb_agg(q.j ORDER BY q.id) FROM (
      SELECT o.id, jse_order_json(o.id) || jsonb_build_object(
        'claimed_by', o.bank_claimed_name, 'claimed_at', o.bank_claimed_at,
        'team_side', CASE WHEN (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL') THEN 'BUY' ELSE 'SELL' END,
        'cash', t.cash, 'holding', coalesce(h.quantity, 0), 'market_price', s.price,
        'price_ok', abs(o.price - s.price) <= s.price * cfg.max_price_move_pct / 100,
        'required', CASE WHEN (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL')
                         THEN round(o.quantity * o.price, 2) + CASE WHEN o.account_type = 'TEAM' OR cfg.institution_brokerage THEN round(o.quantity * o.price * cfg.brokerage_rate, 2) ELSE 0 END END,
        'loan_room', greatest(0, cfg.loan_max_principal - coalesce(l.original_principal, 0)),
        'institution_holding', CASE WHEN o.account_type = 'INSTITUTION' THEN coalesce(ih.quantity, 0) END,
        'age_seconds', extract(epoch FROM now() - coalesce(o.exchange_at, o.created_at))::integer) AS j
      FROM orders o JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
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
  RETURN jsonb_build_object('success', true, 'limit', cfg.loan_max_principal, 'rate', cfg.loan_interest_rate, 'min_cash_buffer', cfg.min_cash_buffer,
    'loans', coalesce((SELECT jsonb_agg(jsonb_build_object('team', t.code, 'cash', t.cash, 'original_principal', l.original_principal,
        'principal', l.principal_outstanding, 'interest', l.interest_outstanding, 'liability', l.principal_outstanding + l.interest_outstanding,
        'remaining_limit', greatest(0, cfg.loan_max_principal - l.original_principal), 'status', l.status,
        'can_draw', cfg.loans_enabled AND t.cash <= cfg.min_cash_buffer AND l.original_principal < cfg.loan_max_principal,
        'max_repay', least(l.principal_outstanding + l.interest_outstanding, greatest(0, t.cash - cfg.min_cash_buffer))) ORDER BY t.seq)
      FROM teams t JOIN loans l ON l.team_id = t.id WHERE l.status <> 'NONE' OR t.cash <= cfg.min_cash_buffer), '[]'::jsonb));
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
  PERFORM jse_require_role(a, 'ADMIN', 'BANK', 'VIEWER', 'PARTICIPANT', 'EXCHANGE');
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
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'created_at', c.created_at, 'team', t.code, 'order_no', o.order_no,
        'type', c.entry_type, 'debit', c.debit, 'credit', c.credit, 'balance_after', c.balance_after, 'note', c.note, 'actor', c.actor_name) ORDER BY c.id DESC)
      FROM (SELECT * FROM cash_ledger c0 WHERE (v_team IS NULL OR c0.team_id = v_team) AND (v_type IS NULL OR c0.entry_type = v_type)
              AND (v_q IS NULL OR c0.note ILIKE '%' || v_q || '%')
            ORDER BY c0.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) c
      JOIN teams t ON t.id = c.team_id LEFT JOIN orders o ON o.id = c.order_id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_audit_log(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_action text := nullif(upper(trim(coalesce(p->>'action', ''))), '');
  v_team integer; v_q text := nullif(trim(coalesce(p->>'q', '')), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(500, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 100)));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER', 'EXCHANGE', 'BANK');
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
-- Broker commission (ranked)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_commissions(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'VIEWER', 'INSTITUTIONAL');
  RETURN jsonb_build_object('success', true, 'rate', (SELECT brokerage_rate FROM event_config WHERE id = 1),
    'brokers', coalesce((SELECT jsonb_agg(x ORDER BY (x->>'rank')::integer) FROM (
      SELECT jsonb_build_object('rank', row_number() OVER (ORDER BY coalesce(c.amount, 0) DESC, b.code), 'broker', b.code, 'name', b.name,
        'teams', (SELECT count(*) FROM teams t WHERE t.broker_id = b.id),
        'orders', coalesce(c.n, 0), 'buy_orders', coalesce(c.nb, 0), 'sell_orders', coalesce(c.ns, 0),
        'buy_volume', coalesce(c.bv, 0), 'sell_volume', coalesce(c.sv, 0), 'buy_quantity', coalesce(c.bq, 0), 'sell_quantity', coalesce(c.sq, 0),
        'total_trade_value', coalesce(c.tv, 0), 'brokerage_earned', coalesce(c.amount, 0),
        'pending_orders', (SELECT count(*) FROM orders o WHERE o.broker_id = b.id AND o.status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING'))) AS x
      FROM brokers b LEFT JOIN (
        SELECT bc.broker_id, count(*) n, count(*) FILTER (WHERE bc.side = 'BUY') nb, count(*) FILTER (WHERE bc.side = 'SELL') ns,
               sum(bc.trade_value) FILTER (WHERE bc.side = 'BUY') bv, sum(bc.trade_value) FILTER (WHERE bc.side = 'SELL') sv,
               sum(o.quantity) FILTER (WHERE bc.side = 'BUY') bq, sum(o.quantity) FILTER (WHERE bc.side = 'SELL') sq,
               sum(bc.trade_value) tv, sum(bc.amount) amount
        FROM broker_commissions bc JOIN orders o ON o.id = bc.order_id WHERE bc.reversed_at IS NULL GROUP BY bc.broker_id) c ON c.broker_id = b.id) q), '[]'::jsonb),
    'totals', (SELECT jsonb_build_object('orders', count(*), 'trade_value', coalesce(sum(trade_value), 0), 'brokerage', coalesce(sum(amount), 0))
               FROM broker_commissions WHERE reversed_at IS NULL));
END $$;

-- ---------------------------------------------------------------------------
-- Market news list (public) and Market Intelligence (public)
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

CREATE OR REPLACE FUNCTION jse_insights() RETURNS jsonb LANGUAGE sql STABLE AS $$
  WITH s AS (SELECT * FROM securities WHERE active),
       ev AS (SELECT status FROM event_control WHERE id = 1),
       rk AS (SELECT * FROM jse_ranked_teams()),
       tm AS (SELECT * FROM jse_team_metrics WHERE active)
  SELECT jsonb_build_object('success', true, 'status', ev.status, 'server_time', now(),
    'index', (SELECT jse_market()->'index'),
    'breadth', (SELECT jsonb_build_object('advances', count(*) FILTER (WHERE price > base_price), 'declines', count(*) FILTER (WHERE price < base_price),
               'unchanged', count(*) FILTER (WHERE price = base_price)) FROM s),
    'top_gainers', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY jse_pct(x.price, x.base_price) DESC) FROM (SELECT * FROM s WHERE price > base_price ORDER BY jse_pct(price, base_price) DESC LIMIT 5) x), '[]'::jsonb),
    'top_losers', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY jse_pct(x.price, x.base_price)) FROM (SELECT * FROM s WHERE price < base_price ORDER BY jse_pct(price, base_price) LIMIT 5) x), '[]'::jsonb),
    'most_traded', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY x.traded_value DESC) FROM (SELECT * FROM s WHERE trade_count > 0 ORDER BY traded_value DESC LIMIT 8) x), '[]'::jsonb),
    'net_worth', (SELECT jsonb_build_object('highest', max(net_worth), 'average', round(avg(net_worth), 2), 'lowest', min(net_worth),
                  'total', sum(net_worth), 'teams', count(*)) FROM tm),
    'totals', (SELECT jsonb_build_object('trade_value', coalesce(sum(trade_value), 0), 'brokerage', coalesce(sum(brokerage), 0), 'trades', count(*),
                  'institutional_trades', count(*) FILTER (WHERE account_type = 'INSTITUTION'))
               FROM settlements WHERE reversed_at IS NULL),
    'orders', (SELECT jsonb_build_object('total', count(*), 'pending', count(*) FILTER (WHERE status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
                  'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'), 'rejected', count(*) FILTER (WHERE status IN ('EXCHANGE_REJECTED','BANK_REJECTED'))) FROM orders),
    'winner_pool', CASE WHEN ev.status IN ('CLOSED', 'FINALIZED') THEN 'Teams satisfying the closing cash rule' ELSE 'All teams (provisional)' END,
    'winner', (SELECT jsonb_build_object('team', m->>'code', 'name', m->>'name', 'net_worth', (m->>'net_worth')::numeric,
                  'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2)) FROM rk WHERE is_winner LIMIT 1),
    'leaderboard', coalesce((SELECT jsonb_agg(jsonb_build_object('rank', rank_pool, 'team', m->>'code', 'name', m->>'name', 'net_worth', (m->>'net_worth')::numeric,
                  'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2), 'cash_rule_met', (m->>'cash_rule_met')::boolean) ORDER BY rank_pool)
                  FROM rk WHERE rank_pool IS NOT NULL AND rank_pool <= 10), '[]'::jsonb),
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
              'price_before', st.price_before, 'account_type', st.account_type, 'at', st.settled_at) ORDER BY st.settled_at DESC)
              FROM (SELECT * FROM settlements WHERE reversed_at IS NULL ORDER BY id DESC LIMIT 12) st JOIN securities s2 ON s2.id = st.security_id), '[]'::jsonb))
  FROM ev
$$;

-- ---------------------------------------------------------------------------
-- Institutional desk
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_institutional(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE i institutions%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL', 'VIEWER');
  SELECT * INTO i FROM institutions WHERE id = coalesce(nullif(p->>'institution_id', '')::integer, nullif(a->>'institution_id', '')::integer, (SELECT min(id) FROM institutions));
  IF NOT FOUND THEN PERFORM jse_fail('INSTITUTION_NOT_FOUND', 'Institutional account not found.', 404); END IF;
  RETURN jsonb_build_object('success', true,
    'institutions', (SELECT jsonb_agg(jsonb_build_object('id', x.id, 'code', x.code, 'name', x.name) ORDER BY x.id) FROM institutions x),
    'account', jsonb_build_object('id', i.id, 'code', i.code, 'name', i.name, 'initial_cash', i.initial_cash, 'cash', i.cash,
       'holdings_value', coalesce((SELECT sum(ih.quantity * s.price) FROM institutional_holdings ih JOIN securities s ON s.id = ih.security_id WHERE ih.institution_id = i.id), 0),
       'net_worth', i.cash + coalesce((SELECT sum(ih.quantity * s.price) FROM institutional_holdings ih JOIN securities s ON s.id = ih.security_id WHERE ih.institution_id = i.id), 0),
       'pnl', i.cash + coalesce((SELECT sum(ih.quantity * s.price) FROM institutional_holdings ih JOIN securities s ON s.id = ih.security_id WHERE ih.institution_id = i.id), 0) - i.initial_cash),
    'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'security', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'quantity', ih.quantity, 'avg_price', round(ih.cost_basis / nullif(ih.quantity, 0), 2), 'current_price', s.price,
        'market_value', ih.quantity * s.price, 'unrealized_pnl', round(ih.quantity * s.price - ih.cost_basis, 2)) ORDER BY ih.quantity * s.price DESC)
      FROM institutional_holdings ih JOIN securities s ON s.id = ih.security_id WHERE ih.institution_id = i.id AND ih.quantity > 0), '[]'::jsonb),
    'orders', coalesce((SELECT jsonb_agg(jse_order_json(o.id) ORDER BY o.id DESC) FROM (SELECT id FROM orders WHERE institution_id = i.id ORDER BY id DESC LIMIT 60) o), '[]'::jsonb),
    'stats', (SELECT jsonb_build_object('orders', count(*), 'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
       'pending', count(*) FILTER (WHERE status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
       'bought_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'BUY'), 0),
       'sold_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'SELL'), 0)) FROM orders WHERE institution_id = i.id),
    'ledger', coalesce((SELECT jsonb_agg(jsonb_build_object('type', l.entry_type, 'debit', l.debit, 'credit', l.credit, 'balance_after', l.balance_after,
        'note', l.note, 'at', l.created_at) ORDER BY l.id DESC) FROM (SELECT * FROM institution_ledger WHERE institution_id = i.id ORDER BY id DESC LIMIT 30) l), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Event admin dashboard state
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_admin_state(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jse_event_status() || jsonb_build_object(
    'config_full', (SELECT to_jsonb(c) FROM event_config c WHERE id = 1),
    'stats', (SELECT jsonb_build_object('total_trade_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'total_brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'pending_orders', count(*) FILTER (WHERE status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
        'settled_orders', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
        'rejected_orders', count(*) FILTER (WHERE status IN ('EXCHANGE_REJECTED','BANK_REJECTED')),
        'institutional_orders', count(*) FILTER (WHERE account_type = 'INSTITUTION'),
        'news_items', (SELECT count(*) FROM market_news WHERE reversed_at IS NULL),
        'loans_outstanding', (SELECT coalesce(sum(principal_outstanding + interest_outstanding), 0) FROM loans),
        'risk', (SELECT jsonb_build_object('short_sell', count(*) FILTER (WHERE kind = 'SHORT_SELL_ATTEMPT'),
                   'cash_shortfall', count(*) FILTER (WHERE kind = 'CASH_SHORTFALL_ATTEMPT'),
                   'insufficient_balance', count(*) FILTER (WHERE kind = 'INSUFFICIENT_BALANCE_REJECTION')) FROM risk_events)) FROM orders),
    'market', (SELECT jsonb_build_object('index', jse_market()->'index', 'breadth', jse_market()->'breadth')),
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
    'brokers', (SELECT jsonb_agg(jsonb_build_object('code', code, 'name', name) ORDER BY code) FROM brokers),
    'users', (SELECT jsonb_object_agg(role, n) FROM (SELECT role, count(*) n FROM app_users WHERE active GROUP BY role) u));
END $$;

-- ---------------------------------------------------------------------------
-- Certificates / final report
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_certificates(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jsonb_build_object('success', true, 'event_name', (SELECT event_name FROM event_config WHERE id = 1),
    'status', (SELECT status FROM event_control WHERE id = 1), 'generated_at', now(),
    'ranking', coalesce((SELECT jsonb_agg(jsonb_build_object('rank', rank_overall, 'rank_in_pool', rank_pool, 'winner', is_winner, 'team', m->>'code',
        'name', m->>'name', 'section', m->>'section', 'members', m->>'members', 'broker', m->>'broker', 'net_worth', (m->>'net_worth')::numeric,
        'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2), 'cash_rule_met', (m->>'cash_rule_met')::boolean,
        'cash_rule_status', m->>'cash_rule_status') ORDER BY coalesce(rank_pool, 100000 + rank_overall))
      FROM jse_ranked_teams()), '[]'::jsonb),
    'top_brokers', (SELECT jse_commissions(a, '{}'::jsonb)->'brokers'));
END $$;

CREATE OR REPLACE FUNCTION jse_reports(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jsonb_build_object('success', true, 'generated_at', now(),
    'event', jse_event_status(),
    'portfolios', jse_portfolios(a, '{}'::jsonb) - 'teams',
    'commissions', jse_commissions(a, '{}'::jsonb),
    'insights', jse_insights(),
    'reconciliation', jse_cash(a, '{"page_size":10}'::jsonb)->'reconciliation');
END $$;

INSERT INTO schema_migrations(version) VALUES ('004_reads');
`;var yi=`-- JAIN STOCK EXCHANGE (JSE) v272
-- 005_exports.sql: one function per export sheet; rows are returned as arrays for compact transfer.

CREATE OR REPLACE FUNCTION jse_export_sheets() RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT '[
    ["winner","Winner"],["teams","Team Details"],["participants","Participant Details"],["brokers","Broker Details"],
    ["cash","Cash"],["holdings","Holdings"],["sold_stocks","Sold Stocks"],["sold_ipos","Sold IPOs"],
    ["networth","Net Worth & PL"],["loans","Loans & Interest"],["cash_rule","Cash Rule"],
    ["short_sell","Short Selling Attempts"],["cash_shortfall","Cash Shortfall Attempts"],["insufficient_balance","Insufficient Balance Rejections"],
    ["orders","Order Tracking"],["rejected","Rejected Orders"],["trades","Trade History"],["ledger","Cash Ledger"],
    ["commission","Broker Commission"],["institutional","Institutional Investors"],["news","Market News"],
    ["prices","Price History"],["audit","Audit Logs"]]'::jsonb
$$;

CREATE OR REPLACE FUNCTION jse_export(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_sheet text := lower(coalesce(p->>'sheet', '')); v_cols jsonb; v_rows jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  IF v_sheet = 'winner' THEN
    v_cols := '["Rank (winner pool)","Overall rank","Team","Team name","Broker","Liquid Cash","Holdings Value","Net Worth","P/L","Return %","\u20B950K Rule","Cash Rule Status","Winner"]';
    SELECT jsonb_agg(jsonb_build_array(rank_pool, rank_overall, m->>'code', m->>'name', m->>'broker', (m->>'cash')::numeric, (m->>'holdings_value')::numeric,
             (m->>'net_worth')::numeric, (m->>'pnl')::numeric, round((m->>'return_pct')::numeric, 2),
             CASE WHEN (m->>'cash_rule_met')::boolean THEN 'SATISFIED' ELSE 'NOT SATISFIED' END, m->>'cash_rule_status', CASE WHEN is_winner THEN 'WINNER' ELSE '' END)
           ORDER BY coalesce(rank_pool, 100000 + rank_overall)) INTO v_rows FROM jse_ranked_teams();
  ELSIF v_sheet = 'teams' THEN
    v_cols := '["Team","Team name","Section","Members","Broker","Broker name","Active"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, t.name, t.section, t.members, b.code, b.name, t.active) ORDER BY t.seq) INTO v_rows
    FROM teams t LEFT JOIN brokers b ON b.id = t.broker_id;
  ELSIF v_sheet = 'participants' THEN
    v_cols := '["Team","Team name","Section","Members","Login","Login active","Last login"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, t.name, t.section, t.members, u.username, u.active, u.last_login_at) ORDER BY t.seq) INTO v_rows
    FROM teams t LEFT JOIN app_users u ON u.team_id = t.id AND u.role = 'PARTICIPANT';
  ELSIF v_sheet = 'brokers' THEN
    v_cols := '["Rank","Broker","Name","Teams","Orders","Buy orders","Sell orders","Buy value","Sell value","Total trade value","Brokerage earned"]';
    SELECT jsonb_agg(jsonb_build_array((x->>'rank')::integer, x->>'broker', x->>'name', (x->>'teams')::integer, (x->>'orders')::integer, (x->>'buy_orders')::integer,
             (x->>'sell_orders')::integer, (x->>'buy_volume')::numeric, (x->>'sell_volume')::numeric, (x->>'total_trade_value')::numeric, (x->>'brokerage_earned')::numeric)
           ORDER BY (x->>'rank')::integer) INTO v_rows FROM jsonb_array_elements(jse_commissions(a, '{}'::jsonb)->'brokers') x;
  ELSIF v_sheet = 'cash' THEN
    v_cols := '["Team","Liquid Cash","Realised P/L","Profit Cash Exempt","Base Cash Counted","Cash Limit","\u20B950K Rule","Loan Liability"]';
    SELECT jsonb_agg(jsonb_build_array(code, cash, realized_pnl, profit_cash_exempt, base_cash_counted, cash_rule_limit,
             CASE WHEN cash_rule_met THEN 'SATISFIED' ELSE 'NOT SATISFIED' END, loan_liability) ORDER BY seq) INTO v_rows FROM jse_team_metrics;
  ELSIF v_sheet = 'holdings' THEN
    v_cols := '["Team","Security","Name","Type","Quantity","Average Price","Cost incl. brokerage","Current Price","Market Value","Unrealised P/L"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, s.symbol, s.name, CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, h.quantity,
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
    v_cols := '["Rank","Team","Team name","Broker","Liquid Cash","Holdings Value","Net Worth","P/L","Return %","Realised P/L","Unrealised P/L","Brokerage Paid","Loan Original","Loan Principal","Interest Outstanding","Interest Paid","\u20B950K Rule","Portfolio Access","Short Sell Attempts","Cash Shortfall Attempts","Insufficient Balance Rejections"]';
    SELECT jsonb_agg(jsonb_build_array(rank_overall, m->>'code', m->>'name', m->>'broker', (m->>'cash')::numeric, (m->>'holdings_value')::numeric,
             (m->>'net_worth')::numeric, (m->>'pnl')::numeric, round((m->>'return_pct')::numeric, 2), (m->>'realized_pnl')::numeric,
             (m->>'unrealized_pnl')::numeric, (m->>'brokerage_paid')::numeric, (m->>'loan_original')::numeric, (m->>'loan_principal')::numeric,
             (m->>'loan_interest')::numeric, (m->>'loan_interest_paid')::numeric,
             CASE WHEN (m->>'cash_rule_met')::boolean THEN 'SATISFIED' ELSE 'NOT SATISFIED' END, m->>'portfolio_access',
             (m->>'short_sell_attempts')::integer, (m->>'cash_shortfall_attempts')::integer, (m->>'insufficient_balance_rejections')::integer)
           ORDER BY rank_overall) INTO v_rows FROM jse_ranked_teams();
  ELSIF v_sheet = 'loans' THEN
    v_cols := '["Team","Original Principal","Current Principal","Interest Outstanding","Interest Charged","Interest Paid","Principal Repaid","Total Liability","Draws","Status"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, l.original_principal, l.principal_outstanding, l.interest_outstanding, l.interest_charged, l.interest_paid,
             l.principal_repaid, l.principal_outstanding + l.interest_outstanding, l.draws, l.status) ORDER BY t.seq) INTO v_rows
    FROM loans l JOIN teams t ON t.id = l.team_id;
  ELSIF v_sheet = 'cash_rule' THEN
    v_cols := '["Team","Liquid Cash","Profit Cash Exempt","Base Cash Counted","Cash Limit","\u20B950K Rule","Cash Rule Status","Portfolio Access","In Winner Pool"]';
    SELECT jsonb_agg(jsonb_build_array(code, cash, profit_cash_exempt, base_cash_counted, cash_rule_limit,
             CASE WHEN cash_rule_met THEN 'SATISFIED' ELSE 'NOT SATISFIED' END, cash_rule_status, portfolio_access, in_winner_pool) ORDER BY seq) INTO v_rows
    FROM jse_team_metrics;
  ELSIF v_sheet IN ('short_sell', 'cash_shortfall', 'insufficient_balance') THEN
    v_cols := '["Timestamp","Team","Order ID","Security","Side","Quantity","Holding Before","Required Cash","Available Cash","Shortage","Stage","Order Status","Note"]';
    SELECT jsonb_agg(jsonb_build_array(r.created_at, t.code, o.order_no, s.symbol, r.side, r.quantity, r.holding_before, r.required_amount, r.available_cash,
             r.shortage, r.stage, o.status, r.note) ORDER BY r.created_at) INTO v_rows
    FROM risk_events r JOIN teams t ON t.id = r.team_id LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN securities s ON s.id = r.security_id
    WHERE r.kind = CASE v_sheet WHEN 'short_sell' THEN 'SHORT_SELL_ATTEMPT' WHEN 'cash_shortfall' THEN 'CASH_SHORTFALL_ATTEMPT' ELSE 'INSUFFICIENT_BALANCE_REJECTION' END;
  ELSIF v_sheet IN ('orders', 'rejected') THEN
    v_cols := '["Order ID","Account","Team","Broker","Institution","Security","Type","Side","Quantity","Price","Trade Value","Brokerage","Settlement Amount","Status","Reject Code","Reject Reason","Short Sell Flag","Cash Shortfall Flag","Created By","Created At","Exchange By","Exchange At","Bank By","Bank At"]';
    SELECT jsonb_agg(jsonb_build_array(o.order_no, o.account_type, t.code, b.code, i.code, s.symbol, CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, o.side,
             o.quantity, o.price, o.trade_value, o.brokerage, o.settlement_amount, o.status, o.reject_code, o.reject_reason, o.short_sell_flag,
             o.cash_shortfall_flag, o.created_by_name, o.created_at, o.exchange_by_name, o.exchange_at, o.bank_by_name, o.bank_at) ORDER BY o.id) INTO v_rows
    FROM orders o JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id LEFT JOIN brokers b ON b.id = o.broker_id
    LEFT JOIN institutions i ON i.id = o.institution_id
    WHERE v_sheet = 'orders' OR o.status IN ('EXCHANGE_REJECTED', 'BANK_REJECTED');
  ELSIF v_sheet = 'trades' THEN
    v_cols := '["Settled At","Order ID","Account","Team","Institution","Security","Side","Quantity","Price","Trade Value","Brokerage","Team Cash Before","Team Cash After","Loan Drawn","Price Before","Price After","Realised P/L","Settled By"]';
    SELECT jsonb_agg(jsonb_build_array(st.settled_at, o.order_no, st.account_type, t.code, i.code, s.symbol, st.side, st.quantity, st.price, st.trade_value,
             st.brokerage, st.team_cash_before, st.team_cash_after, st.loan_drawn, st.price_before, st.price_after, st.realized_pnl, st.settled_by_name) ORDER BY st.id) INTO v_rows
    FROM settlements st JOIN orders o ON o.id = st.order_id JOIN teams t ON t.id = st.team_id JOIN securities s ON s.id = st.security_id
    LEFT JOIN institutions i ON i.id = st.institution_id WHERE st.reversed_at IS NULL;
  ELSIF v_sheet = 'ledger' THEN
    v_cols := '["Timestamp","Team","Order ID","Type","Debit","Credit","Balance After","Notes","Actor"]';
    SELECT jsonb_agg(jsonb_build_array(c.created_at, t.code, o.order_no, c.entry_type, c.debit, c.credit, c.balance_after, c.note, c.actor_name) ORDER BY c.id) INTO v_rows
    FROM cash_ledger c JOIN teams t ON t.id = c.team_id LEFT JOIN orders o ON o.id = c.order_id;
  ELSIF v_sheet = 'commission' THEN
    v_cols := '["Timestamp","Broker","Team","Order ID","Side","Trade Value","Rate","Commission"]';
    SELECT jsonb_agg(jsonb_build_array(bc.created_at, b.code, t.code, o.order_no, bc.side, bc.trade_value, bc.rate, bc.amount) ORDER BY bc.id) INTO v_rows
    FROM broker_commissions bc JOIN brokers b ON b.id = bc.broker_id JOIN teams t ON t.id = bc.team_id JOIN orders o ON o.id = bc.order_id WHERE bc.reversed_at IS NULL;
  ELSIF v_sheet = 'institutional' THEN
    v_cols := '["Order ID","Institution","Counterparty Team","Security","Side","Quantity","Price","Trade Value","Status","Reject Reason","Created At","Bank At"]';
    SELECT jsonb_agg(jsonb_build_array(o.order_no, i.code, t.code, s.symbol, o.side, o.quantity, o.price, o.trade_value, o.status, o.reject_reason, o.created_at, o.bank_at) ORDER BY o.id) INTO v_rows
    FROM orders o JOIN institutions i ON i.id = o.institution_id JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id;
  ELSIF v_sheet = 'news' THEN
    v_cols := '["Timestamp","Security","Mood","Headline","Requested %","Applied %","Previous Price","New Price","Reversed","Published By"]';
    SELECT jsonb_agg(jsonb_build_array(n.created_at, s.symbol, replace(n.mood, '_', ' '), n.headline, n.requested_pct, round(n.applied_pct, 2), n.previous_price,
             n.new_price, n.reversed_at IS NOT NULL, n.created_by_name) ORDER BY n.id) INTO v_rows
    FROM market_news n JOIN securities s ON s.id = n.security_id;
  ELSIF v_sheet = 'prices' THEN
    v_cols := '["Timestamp","Security","Source","Previous Price","New Price","Change %","Order ID","News ID"]';
    SELECT jsonb_agg(jsonb_build_array(ph.created_at, s.symbol, ph.source, ph.previous_price, ph.new_price, round(ph.change_pct, 2), o.order_no, ph.news_id) ORDER BY ph.id) INTO v_rows
    FROM price_history ph JOIN securities s ON s.id = ph.security_id LEFT JOIN orders o ON o.id = ph.order_id;
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
`;var Ci=`-- JAIN STOCK EXCHANGE (JSE) v272
-- 006_seed.sql: event configuration, 10 brokers, 100 teams, 50 stocks, 4 IPOs, the institutional
-- account and staff / participant accounts. Idempotent. Accounts start with random unknown passwords;
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

INSERT INTO securities(kind, symbol, name, sector, base_price, price, previous_price, lot_size, display_order) VALUES
  ('IPO', 'VOLTRA',  'Voltra Motors',        'Electric Vehicles', 890, 890, 890, 50, 1),
  ('IPO', 'BLUEAI',  'Blue Orbit AI',        'Technology',        780, 780, 780, 50, 2),
  ('IPO', 'SHREEB',  'Shreebuild Infra',     'Infrastructure',    620, 620, 620, 50, 3),
  ('IPO', 'AAROGYA', 'Aarogya Lifesciences', 'Healthcare',        710, 710, 710, 50, 4)
ON CONFLICT (symbol) DO NOTHING;

INSERT INTO securities(kind, symbol, name, base_price, price, previous_price, lot_size, display_order)
SELECT 'EQUITY', v.sym, v.nm, v.px, v.px, v.px, 50, v.ord FROM (VALUES
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

INSERT INTO app_users(username, display_name, role, broker_id, password_hash)
SELECT 'PIT-' || lpad(n::text, 2, '0'), 'Pit Manager / Broker Desk ' || lpad(n::text, 2, '0'), 'BROKER',
       (SELECT id FROM brokers WHERE code = 'BROKER-' || lpad(n::text, 2, '0')), crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6))
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
`;var Di=`-- JAIN STOCK EXCHANGE (JSE) v272
-- 007_tuning.sql: safety timeouts for this database (re-applicable).
DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I SET statement_timeout = %L', current_database(), '20s');
  EXECUTE format('ALTER DATABASE %I SET idle_in_transaction_session_timeout = %L', current_database(), '60s');
  EXECUTE format('ALTER DATABASE %I SET lock_timeout = %L', current_database(), '10s');
END $$;
ANALYZE;
`;var P_=[["001_schema",bi],["001a_upgrades",Li],["002_core",Ai],["003_ops",gi],["004_reads",Si],["005_exports",yi],["006_seed",Ci],["007_tuning",Di]],H_=new Set(["001a_upgrades","002_core","003_ops","004_reads","005_exports","007_tuning"]),O=class extends Error{constructor(s,r,i,n){super(i);this.status=s;this.code=r;this.extra=n}};function M_(){let t=process.env.DATABASE_URL||"postgres://postgres@127.0.0.1:5433/jse",e=new URL(t);return process.env.DB_NAME&&(e.pathname="/"+process.env.DB_NAME),e.toString()}var lt=null;function Ui(){return lt||(lt=new Fi.default.Pool({connectionString:M_(),max:Number(process.env.DB_POOL_MAX||8),idleTimeoutMillis:3e4,connectionTimeoutMillis:1e4,allowExitOnIdle:!1}),lt.on("error",t=>console.warn("[db] idle client error:",t.message))),lt}var k_=new Set(["40001","40P01","57P01","08006","08003","08000","53300"]);async function fe(t,e=[]){let s=0;for(;;)try{return await Ui().query(t,e)}catch(r){if(s++,(k_.has(r?.code)||/Connection terminated|ECONNRESET|timeout exceeded when trying to connect/i.test(String(r?.message)))&&s<3){await new Promise(n=>setTimeout(n,120*s+Math.random()*120));continue}throw r}}async function f(t,e,s,r={}){if(!/^jse_[a-z0-9_]+$/.test(t))throw new Error("bad function name");try{let i;r.noActor?i=await fe(`SELECT ${t}($1::jsonb) AS r`,[JSON.stringify(s??{})]):s===void 0?i=await fe(`SELECT ${t}() AS r`):i=await fe(`SELECT ${t}($1::jsonb, $2::jsonb) AS r`,[JSON.stringify(e??{}),JSON.stringify(s??{})]);let n=i.rows[0]?.r;if(n&&n.success===!1)throw new O(Number(n.http)||400,n.code||"REQUEST_FAILED",n.error||"Request failed",n.errors?{errors:n.errors}:void 0);return n}catch(i){throw i instanceof O?i:i?.code==="JSE01"?new O(Number(i.hint)||400,i.detail||"REQUEST_FAILED",i.message):i?.code==="23505"?new O(409,"DUPLICATE","This action was already recorded (duplicate request blocked)."):i?.code==="23514"?new O(409,"RULE_VIOLATION","The request would break a financial rule (for example negative cash or holdings) and was blocked."):i?.code==="57014"?new O(503,"TIMEOUT","The database took too long to respond. Please retry."):i}}var ut=null;function ji(){return process.env.SKIP_MIGRATIONS==="1"?Promise.resolve():(ut||(ut=B_().catch(t=>{throw ut=null,t})),ut)}async function x_(t){let{createHash:e}=await import("node:crypto");return e("sha256").update(t).digest("hex").slice(0,16)}async function B_(){let t=await Ui().connect();try{await t.query("BEGIN"),await t.query("SELECT pg_advisory_xact_lock(727272)"),await t.query("CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now(), checksum text)");let e=new Map((await t.query("SELECT version, checksum FROM schema_migrations")).rows.map(r=>[r.version,r.checksum])),s=[];for(let[r,i]of P_){let n=await x_(i),a=e.has(r);if(a&&(e.get(r)===n||!H_.has(r)))continue;let o=a?i.replace(/INSERT INTO schema_migrations\(version\) VALUES \('[^']+'\);/g,""):i;await t.query("SAVEPOINT m");try{await t.query(o)}catch(E){throw new Error(`migration ${r} failed: ${E.message}`)}await t.query("INSERT INTO schema_migrations(version, checksum) VALUES ($1, $2) ON CONFLICT (version) DO UPDATE SET checksum = EXCLUDED.checksum, applied_at = now()",[r,n]),await t.query("RELEASE SAVEPOINT m"),s.push(`${r} ${a?"re-applied":"applied"}`)}await t.query("COMMIT"),s.length&&console.log("[db] migrations: "+s.join(", "))}catch(e){try{await t.query("ROLLBACK")}catch{}throw e}finally{t.release()}}import{createPublicKey as q_,verify as W_}from"node:crypto";var Pi="https://token.actions.githubusercontent.com",Ye=null;async function wi(t=!1){if(!t&&Ye&&Date.now()-Ye.at<36e5)return Ye.keys;let e=await fetch(Pi+"/.well-known/jwks",{headers:{accept:"application/json"}});if(!e.ok)throw new Error("could not load GitHub signing keys ("+e.status+")");let s=await e.json();return Ye={at:Date.now(),keys:s.keys||[]},Ye.keys}var Ls=t=>Buffer.from(t.replace(/-/g,"+").replace(/_/g,"/"),"base64");async function Hi(t,e){let s=t.split(".");if(s.length!==3)throw new Error("malformed token");let r=JSON.parse(Ls(s[0]).toString("utf8")),i=JSON.parse(Ls(s[1]).toString("utf8"));if(r.alg!=="RS256")throw new Error("unexpected algorithm");let n=(await wi()).find(_=>_.kid===r.kid);if(n||(n=(await wi(!0)).find(_=>_.kid===r.kid)),!n)throw new Error("unknown signing key");if(!W_("RSA-SHA256",Buffer.from(s[0]+"."+s[1]),q_({key:n,format:"jwk"}),Ls(s[2])))throw new Error("bad signature");let o=Math.floor(Date.now()/1e3);if(i.iss!==Pi)throw new Error("wrong issuer");if(!(Array.isArray(i.aud)?i.aud:[i.aud]).includes(e.audience))throw new Error("wrong audience");if(typeof i.exp!="number"||i.exp<o-30)throw new Error("token expired");if(typeof i.nbf=="number"&&i.nbf>o+60)throw new Error("token not valid yet");if(i.repository!==e.repository)throw new Error("wrong repository");if(e.refs&&e.refs.length&&!e.refs.includes(i.ref))throw new Error("branch not allowed");return i}import{createRequire as G_}from"module";var $_=G_("/"),Y_;try{Y_=$_("worker_threads").Worker}catch{}var M=Uint8Array,Q=Uint16Array,Ds=Int32Array,Fs=new M([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Us=new M([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),Mi=new M([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Gi=function(t,e){for(var s=new Q(31),r=0;r<31;++r)s[r]=e+=1<<t[r-1];for(var i=new Ds(s[30]),r=1;r<30;++r)for(var n=s[r];n<s[r+1];++n)i[n]=n-s[r]<<5|r;return{b:s,r:i}},$i=Gi(Fs,2),K_=$i.b,gs=$i.r;K_[28]=258,gs[258]=28;var Yi=Gi(Us,0),yE=Yi.b,ki=Yi.r,Ss=new Q(32768);for(m=0;m<32768;++m)de=(m&43690)>>1|(m&21845)<<1,de=(de&52428)>>2|(de&13107)<<2,de=(de&61680)>>4|(de&3855)<<4,Ss[m]=((de&65280)>>8|(de&255)<<8)>>1;var de,m,ze=function(t,e,s){for(var r=t.length,i=0,n=new Q(e);i<r;++i)t[i]&&++n[t[i]-1];var a=new Q(e);for(i=1;i<e;++i)a[i]=a[i-1]+n[i-1]<<1;var o;if(s){o=new Q(1<<e);var E=15-e;for(i=0;i<r;++i)if(t[i])for(var _=i<<4|t[i],c=e-t[i],l=a[t[i]-1]++<<c,u=l|(1<<c)-1;l<=u;++l)o[Ss[l]>>E]=_}else for(o=new Q(r),i=0;i<r;++i)t[i]&&(o[i]=Ss[a[t[i]-1]++]>>15-t[i]);return o},ve=new M(288);for(m=0;m<144;++m)ve[m]=8;var m;for(m=144;m<256;++m)ve[m]=9;var m;for(m=256;m<280;++m)ve[m]=7;var m;for(m=280;m<288;++m)ve[m]=8;var m,dt=new M(32);for(m=0;m<32;++m)dt[m]=5;var m,V_=ze(ve,9,0);var z_=ze(dt,5,0);var Ki=function(t){return(t+7)/8|0},Vi=function(t,e,s){return(e==null||e<0)&&(e=0),(s==null||s>t.length)&&(s=t.length),new M(t.subarray(e,s))};var X_=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],Nt=function(t,e,s){var r=new Error(e||X_[t]);if(r.code=t,Error.captureStackTrace&&Error.captureStackTrace(r,Nt),!s)throw r;return r};var Ne=function(t,e,s){s<<=e&7;var r=e/8|0;t[r]|=s,t[r+1]|=s>>8},Ke=function(t,e,s){s<<=e&7;var r=e/8|0;t[r]|=s,t[r+1]|=s>>8,t[r+2]|=s>>16},As=function(t,e){for(var s=[],r=0;r<t.length;++r)t[r]&&s.push({s:r,f:t[r]});var i=s.length,n=s.slice();if(!i)return{t:Xi,l:0};if(i==1){var a=new M(s[0].s+1);return a[s[0].s]=1,{t:a,l:1}}s.sort(function($,V){return $.f-V.f}),s.push({s:-1,f:25001});var o=s[0],E=s[1],_=0,c=1,l=2;for(s[0]={s:-1,f:o.f+E.f,l:o,r:E};c!=i-1;)o=s[s[_].f<s[l].f?_++:l++],E=s[_!=c&&s[_].f<s[l].f?_++:l++],s[c++]={s:-1,f:o.f+E.f,l:o,r:E};for(var u=n[0].s,r=1;r<i;++r)n[r].s>u&&(u=n[r].s);var p=new Q(u+1),L=ys(s[c-1],p,0);if(L>e){var r=0,I=0,G=L-e,ne=1<<G;for(n.sort(function(V,D){return p[D.s]-p[V.s]||V.f-D.f});r<i;++r){var Z=n[r].s;if(p[Z]>e)I+=ne-(1<<L-p[Z]),p[Z]=e;else break}for(I>>=G;I>0;){var ae=n[r].s;p[ae]<e?I-=1<<e-p[ae]++-1:++r}for(;r>=0&&I;--r){var w=n[r].s;p[w]==e&&(--p[w],++I)}L=e}return{t:new M(p),l:L}},ys=function(t,e,s){return t.s==-1?Math.max(ys(t.l,e,s+1),ys(t.r,e,s+1)):e[t.s]=s},xi=function(t){for(var e=t.length;e&&!t[--e];);for(var s=new Q(++e),r=0,i=t[0],n=1,a=function(E){s[r++]=E},o=1;o<=e;++o)if(t[o]==i&&o!=e)++n;else{if(!i&&n>2){for(;n>138;n-=138)a(32754);n>2&&(a(n>10?n-11<<5|28690:n-3<<5|12305),n=0)}else if(n>3){for(a(i),--n;n>6;n-=6)a(8304);n>2&&(a(n-3<<5|8208),n=0)}for(;n--;)a(i);n=1,i=t[o]}return{c:s.subarray(0,r),n:e}},Ve=function(t,e){for(var s=0,r=0;r<e.length;++r)s+=t[r]*e[r];return s},zi=function(t,e,s){var r=s.length,i=Ki(e+2);t[i]=r&255,t[i+1]=r>>8,t[i+2]=t[i]^255,t[i+3]=t[i+1]^255;for(var n=0;n<r;++n)t[i+n+4]=s[n];return(i+4+r)*8},Bi=function(t,e,s,r,i,n,a,o,E,_,c){Ne(e,c++,s),++i[256];for(var l=As(i,15),u=l.t,p=l.l,L=As(n,15),I=L.t,G=L.l,ne=xi(u),Z=ne.c,ae=ne.n,w=xi(I),$=w.c,V=w.n,D=new Q(19),R=0;R<Z.length;++R)++D[Z[R]&31];for(var R=0;R<$.length;++R)++D[$[R]&31];for(var h=As(D,7),z=h.t,Ie=h.l,X=19;X>4&&!z[Mi[X-1]];--X);var Oe=_+5<<3,se=Ve(i,ve)+Ve(n,dt)+a,re=Ve(i,u)+Ve(n,I)+a+14+3*X+Ve(D,z)+2*D[16]+3*D[17]+7*D[18];if(E>=0&&Oe<=se&&Oe<=re)return zi(e,c,t.subarray(E,E+_));var oe,P,ie,pe;if(Ne(e,c,1+(re<se)),c+=2,re<se){oe=ze(u,p,0),P=u,ie=ze(I,G,0),pe=I;var Tt=ze(z,Ie,0);Ne(e,c,ae-257),Ne(e,c+5,V-1),Ne(e,c+10,X-4),c+=14;for(var R=0;R<X;++R)Ne(e,c+3*R,z[Mi[R]]);c+=3*X;for(var _e=[Z,$],je=0;je<2;++je)for(var be=_e[je],R=0;R<be.length;++R){var ce=be[R]&31;Ne(e,c,Tt[ce]),c+=z[ce],ce>15&&(Ne(e,c,be[R]>>5&127),c+=be[R]>>12)}}else oe=V_,P=ve,ie=z_,pe=dt;for(var R=0;R<o;++R){var k=r[R];if(k>255){var ce=k>>18&31;Ke(e,c,oe[ce+257]),c+=P[ce+257],ce>7&&(Ne(e,c,k>>23&31),c+=Fs[ce]);var Le=k&31;Ke(e,c,ie[Le]),c+=pe[Le],Le>3&&(Ke(e,c,k>>5&8191),c+=Us[Le])}else Ke(e,c,oe[k]),c+=P[k]}return Ke(e,c,oe[256]),c+P[256]},J_=new Ds([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),Xi=new M(0),Q_=function(t,e,s,r,i,n){var a=n.z||t.length,o=new M(r+a+5*(1+Math.ceil(a/7e3))+i),E=o.subarray(r,o.length-i),_=n.l,c=(n.r||0)&7;if(e){c&&(E[0]=n.r>>3);for(var l=J_[e-1],u=l>>13,p=l&8191,L=(1<<s)-1,I=n.p||new Q(32768),G=n.h||new Q(L+1),ne=Math.ceil(s/3),Z=2*ne,ae=function(ft){return(t[ft]^t[ft+1]<<ne^t[ft+2]<<Z)&L},w=new Ds(25e3),$=new Q(288),V=new Q(32),D=0,R=0,h=n.i||0,z=0,Ie=n.w||0,X=0;h+2<a;++h){var Oe=ae(h),se=h&32767,re=G[Oe];if(I[se]=re,G[Oe]=se,Ie<=h){var oe=a-h;if((D>7e3||z>24576)&&(oe>423||!_)){c=Bi(t,E,0,w,$,V,R,z,X,h-X,c),z=D=R=0,X=h;for(var P=0;P<286;++P)$[P]=0;for(var P=0;P<30;++P)V[P]=0}var ie=2,pe=0,Tt=p,_e=se-re&32767;if(oe>2&&Oe==ae(h-_e))for(var je=Math.min(u,oe)-1,be=Math.min(32767,h),ce=Math.min(258,oe);_e<=be&&--Tt&&se!=re;){if(t[h+ie]==t[h+ie-_e]){for(var k=0;k<ce&&t[h+k]==t[h+k-_e];++k);if(k>ie){if(ie=k,pe=_e,k>je)break;for(var Le=Math.min(_e,k-2),Hs=0,P=0;P<Le;++P){var mt=h-_e+P&32767,un=I[mt],Ms=mt-un&32767;Ms>Hs&&(Hs=Ms,re=mt)}}}se=re,re=I[se],_e+=se-re&32767}if(pe){w[z++]=268435456|gs[ie]<<18|ki[pe];var ks=gs[ie]&31,xs=ki[pe]&31;R+=Fs[ks]+Us[xs],++$[257+ks],++V[xs],Ie=h+ie,++D}else w[z++]=t[h],++$[t[h]]}}for(h=Math.max(h,Ie);h<a;++h)w[z++]=t[h],++$[t[h]];c=Bi(t,E,_,w,$,V,R,z,X,h-X,c),_||(n.r=c&7|E[c/8|0]<<3,c-=7,n.h=G,n.p=I,n.i=h,n.w=Ie)}else{for(var h=n.w||0;h<a+_;h+=65535){var Rt=h+65535;Rt>=a&&(E[c/8|0]=_,Rt=a),c=zi(E,c+1,t.subarray(h,Rt))}n.i=a}return Vi(o,0,r+Ki(c)+i)},Z_=function(){for(var t=new Int32Array(256),e=0;e<256;++e){for(var s=e,r=9;--r;)s=(s&1&&-306674912)^s>>>1;t[e]=s}return t}(),ec=function(){var t=-1;return{p:function(e){for(var s=t,r=0;r<e.length;++r)s=Z_[s&255^e[r]]^s>>>8;t=s},d:function(){return~t}}};var tc=function(t,e,s,r,i){if(!i&&(i={l:1},e.dictionary)){var n=e.dictionary.subarray(-32768),a=new M(n.length+t.length);a.set(n),a.set(t,n.length),t=a,i.w=n.length}return Q_(t,e.level==null?6:e.level,e.mem==null?i.l?Math.ceil(Math.max(8,Math.min(13,Math.log(t.length)))*1.5):20:12+e.mem,s,r,i)},Ji=function(t,e){var s={};for(var r in t)s[r]=t[r];for(var r in e)s[r]=e[r];return s};var H=function(t,e,s){for(;s;++e)t[e]=s,s>>>=8};function sc(t,e){return tc(t,e||{},0,0)}var Qi=function(t,e,s,r){for(var i in t){var n=t[i],a=e+i,o=r;Array.isArray(n)&&(o=Ji(r,n[1]),n=n[0]),n instanceof M?s[a]=[n,o]:(s[a+="/"]=[new M(0),o],Qi(n,a,s,r))}},qi=typeof TextEncoder<"u"&&new TextEncoder,rc=typeof TextDecoder<"u"&&new TextDecoder,ic=0;try{rc.decode(Xi,{stream:!0}),ic=1}catch{}function Ee(t,e){if(e){for(var s=new M(t.length),r=0;r<t.length;++r)s[r]=t.charCodeAt(r);return s}if(qi)return qi.encode(t);for(var i=t.length,n=new M(t.length+(t.length>>1)),a=0,o=function(c){n[a++]=c},r=0;r<i;++r){if(a+5>n.length){var E=new M(a+8+(i-r<<1));E.set(n),n=E}var _=t.charCodeAt(r);_<128||e?o(_):_<2048?(o(192|_>>6),o(128|_&63)):_>55295&&_<57344?(_=65536+(_&1047552)|t.charCodeAt(++r)&1023,o(240|_>>18),o(128|_>>12&63),o(128|_>>6&63),o(128|_&63)):(o(224|_>>12),o(128|_>>6&63),o(128|_&63))}return Vi(n,0,a)}var Cs=function(t){var e=0;if(t)for(var s in t){var r=t[s].length;r>65535&&Nt(9),e+=r+4}return e},Wi=function(t,e,s,r,i,n,a,o){var E=r.length,_=s.extra,c=o&&o.length,l=Cs(_);H(t,e,a!=null?33639248:67324752),e+=4,a!=null&&(t[e++]=20,t[e++]=s.os),t[e]=20,e+=2,t[e++]=s.flag<<1|(n<0&&8),t[e++]=i&&8,t[e++]=s.compression&255,t[e++]=s.compression>>8;var u=new Date(s.mtime==null?Date.now():s.mtime),p=u.getFullYear()-1980;if((p<0||p>119)&&Nt(10),H(t,e,p<<25|u.getMonth()+1<<21|u.getDate()<<16|u.getHours()<<11|u.getMinutes()<<5|u.getSeconds()>>1),e+=4,n!=-1&&(H(t,e,s.crc),H(t,e+4,n<0?-n-2:n),H(t,e+8,s.size)),H(t,e+12,E),H(t,e+14,l),e+=16,a!=null&&(H(t,e,c),H(t,e+6,s.attrs),H(t,e+10,a),e+=14),t.set(r,e),e+=E,l)for(var L in _){var I=_[L],G=I.length;H(t,e,+L),H(t,e+2,G),t.set(I,e+4),e+=4+G}return c&&(t.set(o,e),e+=c),e},nc=function(t,e,s,r,i){H(t,e,101010256),H(t,e+8,s),H(t,e+10,s),H(t,e+12,r),H(t,e+16,i)};function Zi(t,e){e||(e={});var s={},r=[];Qi(t,"",s,e);var i=0,n=0;for(var a in s){var o=s[a],E=o[0],_=o[1],c=_.level==0?0:8,l=Ee(a),u=l.length,p=_.comment,L=p&&Ee(p),I=L&&L.length,G=Cs(_.extra);u>65535&&Nt(11);var ne=c?sc(E,_):E,Z=ne.length,ae=ec();ae.p(E),r.push(Ji(_,{size:E.length,crc:ae.d(),c:ne,f:l,m:L,u:u!=a.length||L&&p.length!=I,o:i,compression:c})),i+=30+u+G+Z,n+=76+2*(u+G)+(I||0)+Z}for(var w=new M(n+22),$=i,V=n-i,D=0;D<r.length;++D){var l=r[D];Wi(w,l.o,l,l.f,l.u,l.c.length);var R=30+l.f.length+Cs(l.extra);w.set(l.c,l.o+R),Wi(w,i,l,l.f,l.u,l.c.length,l.o,l.m),i+=16+R+(l.m?l.m.length:0)}return nc(w,i,r.length,V,$),w}var ws=t=>t.replace(/[&<>"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[e]).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,"");function js(t){let e="";for(t++;t>0;t=Math.floor((t-1)/26))e=String.fromCharCode(65+(t-1)%26)+e;return e}var tn=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;function sn(t){let e=new Date(t);return isNaN(e.getTime())?t:new Date(e.getTime()+5.5*3600*1e3).toISOString().replace("T"," ").slice(0,19)}function en(t,e,s){if(e==null||e==="")return"";if(typeof e=="boolean")return`<c r="${t}" t="b"${s?' s="1"':""}><v>${e?1:0}</v></c>`;if(typeof e=="number"&&isFinite(e)){let i=s?1:Number.isInteger(e)?3:2;return`<c r="${t}" s="${i}"><v>${e}</v></c>`}let r=typeof e=="string"?e:JSON.stringify(e);return!s&&tn.test(r)&&(r=sn(r)),r.length>32e3&&(r=r.slice(0,32e3)+"\u2026"),`<c r="${t}" t="inlineStr"${s?' s="1"':""}><is><t xml:space="preserve">${ws(r)}</t></is></c>`}function ac(t){let e=t.columns.map(a=>Math.min(60,Math.max(10,a.length+2)));for(let a of t.rows.slice(0,200))a.forEach((o,E)=>{let _=o==null?0:String(o).length;E<e.length&&(e[E]=Math.min(60,Math.max(e[E],_+2)))});let s=e.map((a,o)=>`<col min="${o+1}" max="${o+1}" width="${a}" customWidth="1"/>`).join(""),r=[];r.push(`<row r="1">${t.columns.map((a,o)=>en(js(o)+"1",a,!0)).join("")}</row>`),t.rows.forEach((a,o)=>{let E=o+2;r.push(`<row r="${E}">${a.map((_,c)=>en(js(c)+E,_,!1)).join("")}</row>`)});let i=js(Math.max(0,t.columns.length-1)),n=Math.max(1,t.rows.length+1);return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/><cols>${s}</cols><sheetData>${r.join("")}</sheetData>
${t.rows.length?`<autoFilter ref="A1:${i}${n}"/>`:""}
</worksheet>`}function oc(t,e){let s=t.replace(/[\[\]:*?\/\\]/g," ").slice(0,31).trim()||"Sheet",r=2;for(;e.has(s.toLowerCase());)s=s.slice(0,28)+" "+r++;return e.add(s.toLowerCase()),s}function rn(t,e="JSE Report"){let s=new Set,r=t.map(n=>oc(n.name,s)),i={};return i["[Content_Types].xml"]=Ee(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
${t.map((n,a)=>`<Override PartName="/xl/worksheets/sheet${a+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join(`
`)}
</Types>`),i["_rels/.rels"]=Ee(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`),i["docProps/core.xml"]=Ee(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${ws(e)}</dc:title><dc:creator>JAIN STOCK EXCHANGE</dc:creator>
<dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0,19)}Z</dcterms:created>
</cp:coreProperties>`),i["xl/workbook.xml"]=Ee(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${r.map((n,a)=>`<sheet name="${ws(n)}" sheetId="${a+1}" r:id="rId${a+1}"/>`).join("")}</sheets>
</workbook>`),i["xl/_rels/workbook.xml.rels"]=Ee(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${t.map((n,a)=>`<Relationship Id="rId${a+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${a+1}.xml"/>`).join(`
`)}
<Relationship Id="rId${t.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`),i["xl/styles.xml"]=Ee(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
</styleSheet>`),t.forEach((n,a)=>{i[`xl/worksheets/sheet${a+1}.xml`]=Ee(ac(n))}),Zi(i,{level:6})}function nn(t,e){let s=r=>{if(r==null)return"";let i=typeof r=="string"?r:typeof r=="object"?JSON.stringify(r):String(r);return typeof r=="string"&&tn.test(i)&&(i=sn(i)),/^[=+\-@]/.test(i)&&typeof r=="string"&&(i="'"+i),/[",\n\r]/.test(i)?'"'+i.replace(/"/g,'""')+'"':i};return"\uFEFF"+[t.map(s).join(","),...e.map(r=>r.map(s).join(","))].join(`\r
`)+`\r
`}var an="2.72.0",lc=Date.now(),on=["ADMIN","EXCHANGE","BANK","BROKER","INSTITUTIONAL","VIEWER"];function Ps(t){return _c("sha256").update(t).digest("hex")}function uc(t){if(!t)return null;if((process.env.CORS_ORIGINS||"").split(",").map(s=>s.trim()).filter(Boolean).includes(t))return t;try{let s=new URL(t),r=s.hostname;if(r==="localhost"||r==="127.0.0.1"||s.protocol==="https:"&&(r==="jain-stock-exchange.pages.dev"||r.endsWith(".jain-stock-exchange.pages.dev")||r==="jse-live.pages.dev"||r.endsWith(".jse-live.pages.dev")))return t}catch{}return null}function ht(t){let e=uc(t.origin),s={vary:"Origin, Accept-Encoding"};return e&&(s["access-control-allow-origin"]=e,s["access-control-allow-methods"]="GET, POST, OPTIONS",s["access-control-allow-headers"]="Authorization, Content-Type, X-Request-Id",s["access-control-expose-headers"]="ETag, X-JSE-Version, X-Request-Id, Content-Disposition",s["access-control-max-age"]="7200"),s}function dc(t){return/\bgzip\b/.test(t.headers.get("accept-encoding")||"")}function _n(t){let e=JSON.stringify(t);return{body:e,etag:'W/"'+Ps(e).slice(0,24)+'"'}}function U(t,e,s,r={},i=0){let n={"content-type":"application/json; charset=utf-8","x-jse-version":an,"x-request-id":t.reqId,"cache-control":i>0?`public, max-age=${i}, must-revalidate`:"no-store",etag:s.etag,...ht(t),...r};return e===200&&t.method==="GET"&&t.req.headers.get("if-none-match")===s.etag?(delete n["content-type"],new Response(null,{status:304,headers:n})):s.body.length>1024&&dc(t.req)?(s.gz||(s.gz=Ec(s.body,{level:5})),n["content-encoding"]="gzip",new Response(s.gz,{status:e,headers:n})):new Response(s.body,{status:e,headers:n})}var B=(t,e,s=200,r=0)=>U(t,s,_n(e),{},r);function Nc(t,e){if(e instanceof O)return B(t,{success:!1,error:e.message,code:e.code,...e.extra||{}},e.status);let s=e;console.error(`[api] ${t.reqId} ${t.method} ${t.url.pathname} failed:`,s?.code||"",s?.message||s);let r=/ECONNREFUSED|ENOTFOUND|Connection terminated|timeout|too many|remaining connection/i.test(String(s?.message));return B(t,{success:!1,code:r?"SERVICE_UNAVAILABLE":"SERVER_ERROR",ref:t.reqId,error:r?"The trading service is busy or reconnecting. Please retry in a moment.":"Something went wrong while processing this request. Please retry; if it keeps failing, tell the event desk (ref "+t.reqId+")."},r?503:500)}var he=new Map;async function j(t,e,s){let r=Date.now(),i=he.get(t);if(i?.value&&r-i.at<i.ttl)return i.value;if(i?.pending)return i.pending;let n=i||{at:0,ttl:e};if(n.ttl=e,n.pending=s().then(a=>(n.value=_n(a),n.at=Date.now(),n.pending=void 0,n.value)).catch(a=>{if(n.pending=void 0,n.value&&Date.now()-n.at<3e4)return n.value;throw a}),he.set(t,n),he.size>2e3)for(let[a,o]of he)!o.pending&&r-o.at>6e4&&he.delete(a);return n.pending}function cn(t){if(!t){he.clear();return}for(let e of[...he.keys()])t.some(s=>e.startsWith(s))&&he.delete(e)}var Te=new Map;async function pc(t){if(!t||t.length<32||t.length>128)return null;let e=Ps(t),s=Te.get(e);if(s&&Date.now()-s.at<3e4)return s.user;let i=(await fe("SELECT jse_session($1) AS u",[e])).rows[0]?.u||null;if(Te.set(e,{user:i,at:Date.now()}),Te.size>5e3)for(let[n,a]of Te)Date.now()-a.at>12e4&&Te.delete(n);return i}function y(t){let e=t.user;return{id:e?.id??null,username:e?.username??"anonymous",name:e?.name??null,email:e?.email??null,role:e?.role??null,team_id:e?.team_id??null,broker_id:e?.broker_id??null,institution_id:e?.institution_id??null,session:e?.session??null,ip:t.ip,ua:t.ua}}function T(t,...e){if(!t.user)throw new O(401,"UNAUTHENTICATED","Please sign in to continue.");if(e.length&&!e.includes(t.user.role))throw new O(403,"FORBIDDEN",`Your role (${t.user.role}) cannot do this.`);return t.user}var Xe=new Map;function Je(t,e,s){let r=Date.now(),i=Xe.get(t)||{tokens:s,at:r};return i.tokens=Math.min(s,i.tokens+(r-i.at)/1e3*e),i.at=r,i.tokens<1?(Xe.set(t,i),!1):(i.tokens-=1,Xe.set(t,i),Xe.size>2e4&&Xe.clear(),!0)}var pt=new Map,b=(t,e)=>pt.set("GET "+t,e),C=(t,e)=>pt.set("POST "+t,e),le=(t,e)=>(t.url.searchParams.get(e)||"").trim();async function W(t,e,s,r){if(!Je("w:"+(t.user?.id??t.ip),15,40))throw new O(429,"TOO_MANY_REQUESTS","Too many actions in a short time. Please wait a moment.");let i=await f(e,y(t),s);return cn(r),B(t,i)}b("/api/health",async t=>{let e=Date.now(),s="ok";try{await fe("SELECT 1")}catch(r){s="error: "+String(r?.message).slice(0,120)}return B(t,{success:s==="ok",service:"JAIN STOCK EXCHANGE API",version:an,db:s,db_ms:Date.now()-e,uptime_s:Math.round((Date.now()-lc)/1e3),node:process.version,time:new Date().toISOString()},s==="ok"?200:503)});b("/api/market",async t=>U(t,200,await j("pub:market",900,()=>f("jse_market",null)),{},1));b("/api/event-status",async t=>U(t,200,await j("pub:status",900,()=>f("jse_event_status",null)),{},1));b("/api/insights",async t=>U(t,200,await j("pub:insights",2500,()=>f("jse_insights",null)),{},2));b("/api/market-news",async t=>{let e=Math.min(200,Math.max(1,Number(le(t,"limit"))||30));return U(t,200,await j("pub:news:"+e,1500,()=>f("jse_news_list",null,{limit:e},{noActor:!0})),{},1)});b("/api/cms50",async t=>{let e=JSON.parse((await j("pub:market",900,()=>f("jse_market",null))).body);return B(t,{success:!0,name:"CMS INDEX",status:e.status,...e.index,stock_count:e.stocks.length,ipo_count:e.ipos.length})});C("/api/login",async t=>{let e=String(t.body?.username||"").trim(),s=String(t.body?.password||"");if(!Je("login-ip:"+t.ip,5,150)||!Je("login-user:"+e.toLowerCase(),.2,12))throw new O(429,"TOO_MANY_ATTEMPTS","Too many sign-in attempts. Wait a minute and try again.");if(!e||!s)throw new O(400,"MISSING_CREDENTIALS","Enter your username and password.");let r=await f("jse_login",null,{username:e,password:s,ip:t.ip,ua:t.ua},{noActor:!0});return B(t,r)});C("/api/logout",async t=>{if(t.token){let e=Ps(t.token);await fe("SELECT jse_logout($1)",[e]),Te.delete(e)}return B(t,{success:!0})});b("/api/me",async t=>t.user?B(t,{success:!0,authenticated:!0,user:t.user}):B(t,{success:!0,authenticated:!1,user:null}));C("/api/change-password",async t=>{if(T(t),!Je("pw:"+t.user.id,.2,6))throw new O(429,"TOO_MANY_ATTEMPTS","Too many attempts. Wait a minute and try again.");let e=await f("jse_change_password",y(t),t.body||{});return Te.clear(),B(t,e)});C("/api/ci-login",async t=>{let e=process.env.CI_OIDC_REPOSITORY;if(!e)throw new O(404,"NOT_FOUND","Unknown API endpoint: /api/ci-login");if(!Je("ci-login:"+t.ip,10,300))throw new O(429,"TOO_MANY_ATTEMPTS","Too many sign-in attempts.");let s;try{s=await Hi(String(t.body?.token||""),{repository:e,audience:process.env.CI_OIDC_AUDIENCE||"jse-staging",refs:(process.env.CI_OIDC_REFS||"").split(",").map(i=>i.trim()).filter(Boolean)})}catch(i){throw new O(401,"INVALID_CI_TOKEN","CI token rejected: "+i.message)}let r=await f("jse_ci_session",null,{username:String(t.body?.username||""),ip:t.ip,ua:t.ua,subject:s.sub,run_id:s.run_id,workflow:s.workflow},{noActor:!0});return B(t,r)});b("/api/portfolios",async t=>(T(t,...on),U(t,200,await j("staff:portfolios",1800,()=>f("jse_portfolios",y(t),{})))));b("/api/portfolio-details",async t=>{let e=T(t),s=(e.role==="PARTICIPANT"?e.team:le(t,"team"))||"";if(!s)throw new O(400,"TEAM_REQUIRED","Choose a team.");return U(t,200,await j("pd:"+s.toUpperCase()+":"+(e.role==="PARTICIPANT"?e.id:"staff"),1500,()=>f("jse_portfolio_detail",y(t),{team:s})))});function hc(t){let e={};for(let s of["team","status","side","kind","account","q","page","page_size"]){let r=le(t,s);r&&(e[s]=r)}return e}var En=async t=>{let e=T(t),s=hc(t),r="trk:"+(e.role==="PARTICIPANT"?"p"+e.team_id:"s")+":"+JSON.stringify(s);return U(t,200,await j(r,1200,()=>f("jse_tracking",y(t),s)))};b("/api/tracking",En);b("/api/orders",En);b("/api/order",async t=>(T(t),B(t,await f("jse_order_detail",y(t),{order_id:le(t,"id")||void 0,order_no:le(t,"order_no")||void 0}))));C("/api/orders",async t=>{T(t,"ADMIN","BROKER","PARTICIPANT");let e=t.body||{};return Array.isArray(e.legs)?W(t,"jse_place_pair",e,["trk:","staff:","pd:","q:"]):W(t,"jse_place_order",e,["trk:","staff:","pd:","q:"])});b("/api/exchange",async t=>(T(t,"ADMIN","EXCHANGE","VIEWER"),U(t,200,await j("q:exchange",900,()=>f("jse_exchange_queue",y(t),{})))));C("/api/exchange",async t=>(T(t,"ADMIN","EXCHANGE"),W(t,"jse_exchange_decide",t.body||{},["q:","trk:","staff:","pd:","pub:status"])));b("/api/bank",async t=>(T(t,"ADMIN","BANK","VIEWER"),U(t,200,await j("q:bank",900,()=>f("jse_bank_queue",y(t),{})))));C("/api/bank",async t=>{T(t,"ADMIN","BANK");let e=t.body||{},s=String(e.action||"SETTLE").toUpperCase(),r=s==="SETTLE"||s==="APPROVE"?"jse_bank_settle":s==="REJECT"?"jse_bank_reject":s==="CLAIM"||s==="RELEASE"?"jse_bank_claim":"";if(!r)throw new O(400,"INVALID_ACTION","Use SETTLE, REJECT, CLAIM or RELEASE.");return W(t,r,{...e,release:s==="RELEASE"},s==="CLAIM"||s==="RELEASE"?["q:bank"]:void 0)});b("/api/loan",async t=>(T(t,"ADMIN","BANK","VIEWER"),U(t,200,await j("q:loans",1500,()=>f("jse_loans",y(t),{})))));C("/api/loan",async t=>(T(t,"ADMIN","BANK"),W(t,"jse_loan_action",t.body||{})));b("/api/cash",async t=>{let e=T(t,"ADMIN","BANK","VIEWER","PARTICIPANT","EXCHANGE"),s={};for(let r of["team","type","q","page","page_size"]){let i=le(t,r);i&&(s[r]=i)}return U(t,200,await j("cash:"+(e.role==="PARTICIPANT"?e.team_id:"s")+":"+JSON.stringify(s),1500,()=>f("jse_cash",y(t),s)))});b("/api/audit",async t=>{T(t,"ADMIN","VIEWER","EXCHANGE","BANK");let e={};for(let s of["action","team","q","page","page_size"]){let r=le(t,s);r&&(e[s]=r)}return U(t,200,await j("audit:"+JSON.stringify(e),1500,()=>f("jse_audit_log",y(t),e)))});b("/api/commissions",async t=>(T(t,...on),U(t,200,await j("staff:commissions",2e3,()=>f("jse_commissions",y(t),{})))));b("/api/institutional-portfolio",async t=>{T(t,"ADMIN","INSTITUTIONAL","VIEWER");let e=le(t,"institution_id");return U(t,200,await j("inst:"+(e||t.user?.institution_id||"default"),1500,()=>f("jse_institutional",y(t),e?{institution_id:e}:{})))});C("/api/institutional-order",async t=>(T(t,"ADMIN","INSTITUTIONAL"),W(t,"jse_place_institutional_order",t.body||{},["inst:","trk:","q:","staff:"])));C("/api/market-news",async t=>(T(t,"ADMIN"),W(t,"jse_market_news",t.body||{})));b("/api/admin-state",async t=>{let e=T(t,"ADMIN","VIEWER");return U(t,200,await j("admin:state:"+e.role,1500,()=>f("jse_admin_state",y(t),{})))});C("/api/ipo-listing",async t=>(T(t,"ADMIN"),W(t,"jse_ipo_listing",t.body||{})));C("/api/event",async t=>(T(t,"ADMIN"),W(t,"jse_event_action",t.body||{})));C("/api/reset-event",async t=>{T(t,"ADMIN");let e=await f("jse_reset_event",y(t),t.body||{});return cn(),B(t,e)});C("/api/undo-redo",async t=>(T(t,"ADMIN"),W(t,"jse_undo_redo",t.body||{})));C("/api/reject-open-orders",async t=>(T(t,"ADMIN"),W(t,"jse_reject_open_orders",t.body||{})));C("/api/ipo-allotments",async t=>{T(t,"ADMIN");let e=t.body||{};return W(t,e.clear?"jse_ipo_allot_clear":"jse_ipo_allot",e)});C("/api/teams",async t=>(T(t,"ADMIN"),W(t,"jse_update_teams",t.body||{})));C("/api/brokers",async t=>(T(t,"ADMIN"),W(t,"jse_update_brokers",t.body||{})));C("/api/config",async t=>(T(t,"ADMIN"),W(t,"jse_update_config",t.body||{})));b("/api/users",async t=>(T(t,"ADMIN"),B(t,await f("jse_admin_users",y(t),{action:"LIST"}))));C("/api/users",async t=>{T(t,"ADMIN");let e=await f("jse_admin_users",y(t),t.body||{});return Te.clear(),B(t,e)});b("/api/reports",async t=>(T(t,"ADMIN","VIEWER"),U(t,200,await j("staff:reports",3e3,()=>f("jse_reports",y(t),{})))));b("/api/certificates",async t=>(T(t,"ADMIN","VIEWER"),U(t,200,await j("staff:certificates",3e3,()=>f("jse_certificates",y(t),{})))));var Tc=[["winner","Winner"],["teams","Team Details"],["participants","Participant Details"],["brokers","Broker Details"],["cash","Cash"],["holdings","Holdings"],["sold_stocks","Sold Stocks"],["sold_ipos","Sold IPOs"],["networth","Net Worth & PL"],["loans","Loans & Interest"],["cash_rule","Cash Rule"],["short_sell","Short Selling Attempts"],["cash_shortfall","Cash Shortfall Attempts"],["insufficient_balance","Insufficient Balance Rejections"],["orders","Order Tracking"],["rejected","Rejected Orders"],["trades","Trade History"],["ledger","Cash Ledger"],["commission","Broker Commission"],["institutional","Institutional Investors"],["news","Market News"],["prices","Price History"],["audit","Audit Logs"]];function ln(){let t=new Date(Date.now()+198e5).toISOString();return t.slice(0,10)+"_"+t.slice(11,16).replace(":","")}b("/api/export",async t=>{T(t,"ADMIN","VIEWER");let e=le(t,"sheet")||"networth",s=(le(t,"format")||"csv").toLowerCase(),r=await f("jse_export",y(t),{sheet:e});if(s==="json")return B(t,r);let i=nn(r.columns,r.rows);return new Response(i,{status:200,headers:{"content-type":"text/csv; charset=utf-8","content-disposition":`attachment; filename="JSE_${e}_${ln()}.csv"`,"cache-control":"no-store",...ht(t)}})});b("/api/export-event-excel",async t=>{T(t,"ADMIN","VIEWER");let e=[];for(let[r,i]of Tc){let n=await f("jse_export",y(t),{sheet:r});e.push({name:i,columns:n.columns,rows:n.rows})}let s=rn(e,"JAIN STOCK EXCHANGE \u2014 Final Event Report");return await f("jse_audit_note",y(t),{action:"EXPORT_EVENT_EXCEL",sheets:e.length}).catch(()=>null),new Response(s,{status:200,headers:{"content-type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","content-disposition":`attachment; filename="JSE_Final_Event_Report_${ln()}.xlsx"`,"cache-control":"no-store",...ht(t)}})});async function mc(t){if(Number(t.headers.get("content-length")||0)>2e6)throw new O(413,"TOO_LARGE","The request is too large.");let s=await t.text();if(s.length>2e6)throw new O(413,"TOO_LARGE","The request is too large.");if(!s.trim())return{};try{return JSON.parse(s)}catch{throw new O(400,"INVALID_JSON","The request body is not valid JSON.")}}function Rc(t){let e=t.headers.get("x-forwarded-for");return(t.headers.get("cf-connecting-ip")||(e?e.split(",")[0].trim():"")||t.headers.get("x-real-ip")||"").slice(0,64)}async function fc(t){let e=new URL(t.url),s={req:t,url:e,method:t.method.toUpperCase(),ip:Rc(t),ua:(t.headers.get("user-agent")||"").slice(0,300),origin:t.headers.get("origin"),token:null,user:null,body:null,started:Date.now(),reqId:(t.headers.get("x-request-id")||cc()).slice(0,36)};if(s.method==="OPTIONS")return new Response(null,{status:204,headers:ht(s)});let r=e.pathname.replace(/\/+$/,"")||"/";r.startsWith("/api")||(r="/api"+(r==="/"?"/health":r));try{let i=pt.get(s.method+" "+r);if(!i){let a=pt.has((s.method==="GET"?"POST ":"GET ")+r);throw new O(a?405:404,a?"METHOD_NOT_ALLOWED":"NOT_FOUND",a?"Method not allowed.":"Unknown API endpoint: "+r)}await ji();let n=t.headers.get("authorization")||"";return s.token=n.toLowerCase().startsWith("bearer ")?n.slice(7).trim():null,s.user=await pc(s.token),s.method==="POST"&&(s.body=await mc(t)),await i(s)}catch(i){return Nc(s,i)}}var ME={fetch:fc};export{an as VERSION,ME as default,fc as handle};
