import{createRequire as __jseCR}from'module';const require=__jseCR(String(import.meta.url).startsWith('file:')?import.meta.url:'file:///tmp/jse.mjs');
var ln=Object.create;var Ea=Object.defineProperty;var dn=Object.getOwnPropertyDescriptor;var un=Object.getOwnPropertyNames;var Nn=Object.getPrototypeOf,pn=Object.prototype.hasOwnProperty;var W=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,s)=>(typeof require<"u"?require:t)[s]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var v=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var Tn=(e,t,s,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of un(t))!pn.call(e,i)&&i!==s&&Ea(e,i,{get:()=>t[i],enumerable:!(a=dn(t,i))||a.enumerable});return e};var mn=(e,t,s)=>(s=e!=null?ln(Nn(e)):{},Tn(t||!e||!e.__esModule?Ea(s,"default",{value:e,enumerable:!0}):s,e));var kt=v(ca=>{"use strict";ca.parse=function(e,t){return new Mt(e,t).parse()};var Mt=class e{constructor(t,s){this.source=t,this.transform=s||Rn,this.position=0,this.entries=[],this.recorded=[],this.dimension=0}isEof(){return this.position>=this.source.length}nextCharacter(){var t=this.source[this.position++];return t==="\\"?{value:this.source[this.position++],escaped:!0}:{value:t,escaped:!1}}record(t){this.recorded.push(t)}newEntry(t){var s;(this.recorded.length>0||t)&&(s=this.recorded.join(""),s==="NULL"&&!t&&(s=null),s!==null&&(s=this.transform(s)),this.entries.push(s),this.recorded=[])}consumeDimensions(){if(this.source[0]==="[")for(;!this.isEof();){var t=this.nextCharacter();if(t.value==="=")break}}parse(t){var s,a,i;for(this.consumeDimensions();!this.isEof();)if(s=this.nextCharacter(),s.value==="{"&&!i)this.dimension++,this.dimension>1&&(a=new e(this.source.substr(this.position-1),this.transform),this.entries.push(a.parse(!0)),this.position+=a.position-2);else if(s.value==="}"&&!i){if(this.dimension--,!this.dimension&&(this.newEntry(),t))return this.entries}else s.value==='"'&&!s.escaped?(i&&this.newEntry(!0),i=!i):s.value===","&&!i?this.newEntry():this.record(s.value);if(this.dimension!==0)throw new Error("array dimension not balanced");return this.entries}};function Rn(e){return e}});var wt=v((nl,la)=>{var vn=kt();la.exports={create:function(e,t){return{parse:function(){return vn.parse(e,t)}}}}});var Na=v((ol,ua)=>{"use strict";var bn=/(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/,In=/^(\d{1,})-(\d{2})-(\d{2})( BC)?$/,On=/([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/,Ln=/^-?infinity$/;ua.exports=function(t){if(Ln.test(t))return Number(t.replace("i","I"));var s=bn.exec(t);if(!s)return hn(t)||null;var a=!!s[8],i=parseInt(s[1],10);a&&(i=da(i));var r=parseInt(s[2],10)-1,n=s[3],o=parseInt(s[4],10),E=parseInt(s[5],10),_=parseInt(s[6],10),c=s[7];c=c?1e3*parseFloat(c):0;var l,d=An(t);return d!=null?(l=new Date(Date.UTC(i,r,n,o,E,_,c)),Wt(i)&&l.setUTCFullYear(i),d!==0&&l.setTime(l.getTime()-d)):(l=new Date(i,r,n,o,E,_,c),Wt(i)&&l.setFullYear(i)),l};function hn(e){var t=In.exec(e);if(t){var s=parseInt(t[1],10),a=!!t[4];a&&(s=da(s));var i=parseInt(t[2],10)-1,r=t[3],n=new Date(s,i,r);return Wt(s)&&n.setFullYear(s),n}}function An(e){if(e.endsWith("+00"))return 0;var t=On.exec(e.split(" ")[1]);if(t){var s=t[1];if(s==="Z")return 0;var a=s==="-"?-1:1,i=parseInt(t[2],10)*3600+parseInt(t[3]||0,10)*60+parseInt(t[4]||0,10);return i*a*1e3}}function da(e){return-(e-1)}function Wt(e){return e>=0&&e<100}});var Ta=v((_l,pa)=>{pa.exports=fn;var Sn=Object.prototype.hasOwnProperty;function fn(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var a in s)Sn.call(s,a)&&(e[a]=s[a])}return e}});var va=v((El,Ra)=>{"use strict";var gn=Ta();Ra.exports=Pe;function Pe(e){if(!(this instanceof Pe))return new Pe(e);gn(this,Wn(e))}var Dn=["seconds","minutes","hours","days","months","years"];Pe.prototype.toPostgres=function(){var e=Dn.filter(this.hasOwnProperty,this);return this.milliseconds&&e.indexOf("seconds")<0&&e.push("seconds"),e.length===0?"0":e.map(function(t){var s=this[t]||0;return t==="seconds"&&this.milliseconds&&(s=(s+this.milliseconds/1e3).toFixed(6).replace(/\.?0+$/,"")),s+" "+t},this).join(" ")};var Fn={years:"Y",months:"M",days:"D",hours:"H",minutes:"M",seconds:"S"},yn=["years","months","days"],jn=["hours","minutes","seconds"];Pe.prototype.toISOString=Pe.prototype.toISO=function(){var e=yn.map(s,this).join(""),t=jn.map(s,this).join("");return"P"+e+"T"+t;function s(a){var i=this[a]||0;return a==="seconds"&&this.milliseconds&&(i=(i+this.milliseconds/1e3).toFixed(6).replace(/0+$/,"")),i+Fn[a]}};var xt="([+-]?\\d+)",Cn=xt+"\\s+years?",Un=xt+"\\s+mons?",Hn=xt+"\\s+days?",Pn="([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?",Mn=new RegExp([Cn,Un,Hn,Pn].map(function(e){return"("+e+")?"}).join("\\s*")),ma={years:2,months:4,days:6,hours:9,minutes:10,seconds:11,milliseconds:12},kn=["hours","minutes","seconds","milliseconds"];function wn(e){var t=e+"000000".slice(e.length);return parseInt(t,10)/1e3}function Wn(e){if(!e)return{};var t=Mn.exec(e),s=t[8]==="-";return Object.keys(ma).reduce(function(a,i){var r=ma[i],n=t[r];return!n||(n=i==="milliseconds"?wn(n):parseInt(n,10),!n)||(s&&~kn.indexOf(i)&&(n*=-1),a[i]=n),a},{})}});var Oa=v((cl,Ia)=>{"use strict";var ba=Buffer.from||Buffer;Ia.exports=function(t){if(/^\\x/.test(t))return ba(t.substr(2),"hex");for(var s="",a=0;a<t.length;)if(t[a]!=="\\")s+=t[a],++a;else if(/[0-7]{3}/.test(t.substr(a+1,3)))s+=String.fromCharCode(parseInt(t.substr(a+1,3),8)),a+=4;else{for(var i=1;a+i<t.length&&t[a+i]==="\\";)i++;for(var r=0;r<Math.floor(i/2);++r)s+="\\";a+=Math.floor(i/2)*2}return ba(s,"binary")}});var Da=v((ll,ga)=>{var Je=kt(),ze=wt(),Tt=Na(),ha=va(),Aa=Oa();function mt(e){return function(s){return s===null?s:e(s)}}function Sa(e){return e===null?e:e==="TRUE"||e==="t"||e==="true"||e==="y"||e==="yes"||e==="on"||e==="1"}function xn(e){return e?Je.parse(e,Sa):null}function Bn(e){return parseInt(e,10)}function Bt(e){return e?Je.parse(e,mt(Bn)):null}function Gn(e){return e?Je.parse(e,mt(function(t){return fa(t).trim()})):null}var qn=function(e){if(!e)return null;var t=ze.create(e,function(s){return s!==null&&(s=Vt(s)),s});return t.parse()},Gt=function(e){if(!e)return null;var t=ze.create(e,function(s){return s!==null&&(s=parseFloat(s)),s});return t.parse()},de=function(e){if(!e)return null;var t=ze.create(e);return t.parse()},qt=function(e){if(!e)return null;var t=ze.create(e,function(s){return s!==null&&(s=Tt(s)),s});return t.parse()},$n=function(e){if(!e)return null;var t=ze.create(e,function(s){return s!==null&&(s=ha(s)),s});return t.parse()},Vn=function(e){return e?Je.parse(e,mt(Aa)):null},$t=function(e){return parseInt(e,10)},fa=function(e){var t=String(e);return/^\d+$/.test(t)?t:e},La=function(e){return e?Je.parse(e,mt(JSON.parse)):null},Vt=function(e){return e[0]!=="("?null:(e=e.substring(1,e.length-1).split(","),{x:parseFloat(e[0]),y:parseFloat(e[1])})},Yn=function(e){if(e[0]!=="<"&&e[1]!=="(")return null;for(var t="(",s="",a=!1,i=2;i<e.length-1;i++){if(a||(t+=e[i]),e[i]===")"){a=!0;continue}else if(!a)continue;e[i]!==","&&(s+=e[i])}var r=Vt(t);return r.radius=parseFloat(s),r},Kn=function(e){e(20,fa),e(21,$t),e(23,$t),e(26,$t),e(700,parseFloat),e(701,parseFloat),e(16,Sa),e(1082,Tt),e(1114,Tt),e(1184,Tt),e(600,Vt),e(651,de),e(718,Yn),e(1e3,xn),e(1001,Vn),e(1005,Bt),e(1007,Bt),e(1028,Bt),e(1016,Gn),e(1017,qn),e(1021,Gt),e(1022,Gt),e(1231,Gt),e(1014,de),e(1015,de),e(1008,de),e(1009,de),e(1040,de),e(1041,de),e(1115,qt),e(1182,qt),e(1185,qt),e(1186,ha),e(1187,$n),e(17,Aa),e(114,JSON.parse.bind(JSON)),e(3802,JSON.parse.bind(JSON)),e(199,La),e(3807,La),e(3907,de),e(2951,de),e(791,de),e(1183,de),e(1270,de)};ga.exports={init:Kn}});var ya=v((dl,Fa)=>{"use strict";var ie=1e6;function Xn(e){var t=e.readInt32BE(0),s=e.readUInt32BE(4),a="";t<0&&(t=~t+(s===0),s=~s+1>>>0,a="-");var i="",r,n,o,E,_,c;{if(r=t%ie,t=t/ie>>>0,n=4294967296*r+s,s=n/ie>>>0,o=""+(n-ie*s),s===0&&t===0)return a+o+i;for(E="",_=6-o.length,c=0;c<_;c++)E+="0";i=E+o+i}{if(r=t%ie,t=t/ie>>>0,n=4294967296*r+s,s=n/ie>>>0,o=""+(n-ie*s),s===0&&t===0)return a+o+i;for(E="",_=6-o.length,c=0;c<_;c++)E+="0";i=E+o+i}{if(r=t%ie,t=t/ie>>>0,n=4294967296*r+s,s=n/ie>>>0,o=""+(n-ie*s),s===0&&t===0)return a+o+i;for(E="",_=6-o.length,c=0;c<_;c++)E+="0";i=E+o+i}return r=t%ie,n=4294967296*r+s,o=""+n%ie,a+o+i}Fa.exports=Xn});var Pa=v((ul,Ha)=>{var Jn=ya(),C=function(e,t,s,a,i){s=s||0,a=a||!1,i=i||function(u,b,I){return u*Math.pow(2,I)+b};var r=s>>3,n=function(u){return a?~u&255:u},o=255,E=8-s%8;t<E&&(o=255<<8-t&255,E=t),s&&(o=o>>s%8);var _=0;s%8+t>=8&&(_=i(0,n(e[r])&o,E));for(var c=t+s>>3,l=r+1;l<c;l++)_=i(_,n(e[l]),8);var d=(t+s)%8;return d>0&&(_=i(_,n(e[c])>>8-d,d)),_},Ua=function(e,t,s){var a=Math.pow(2,s-1)-1,i=C(e,1),r=C(e,s,1);if(r===0)return 0;var n=1,o=function(_,c,l){_===0&&(_=1);for(var d=1;d<=l;d++)n/=2,(c&1<<l-d)>0&&(_+=n);return _},E=C(e,t,s+1,!1,o);return r==Math.pow(2,s+1)-1?E===0?i===0?1/0:-1/0:NaN:(i===0?1:-1)*Math.pow(2,r-a)*E},zn=function(e){return C(e,1)==1?-1*(C(e,15,1,!0)+1):C(e,15,1)},ja=function(e){return C(e,1)==1?-1*(C(e,31,1,!0)+1):C(e,31,1)},Qn=function(e){return Ua(e,23,8)},Zn=function(e){return Ua(e,52,11)},eo=function(e){var t=C(e,16,32);if(t==49152)return NaN;for(var s=Math.pow(1e4,C(e,16,16)),a=0,i=[],r=C(e,16),n=0;n<r;n++)a+=C(e,16,64+16*n)*s,s/=1e4;var o=Math.pow(10,C(e,16,48));return(t===0?1:-1)*Math.round(a*o)/o},Ca=function(e,t){var s=C(t,1),a=C(t,63,1),i=new Date((s===0?1:-1)*a/1e3+9466848e5);return e||i.setTime(i.getTime()+i.getTimezoneOffset()*6e4),i.usec=a%1e3,i.getMicroSeconds=function(){return this.usec},i.setMicroSeconds=function(r){this.usec=r},i.getUTCMicroSeconds=function(){return this.usec},i},Qe=function(e){for(var t=C(e,32),s=C(e,32,32),a=C(e,32,64),i=96,r=[],n=0;n<t;n++)r[n]=C(e,32,i),i+=32,i+=32;var o=function(_){var c=C(e,32,i);if(i+=32,c==4294967295)return null;var l;if(_==23||_==20)return l=C(e,c*8,i),i+=c*8,l;if(_==25)return l=e.toString(this.encoding,i>>3,(i+=c<<3)>>3),l;console.log("ERROR: ElementType not implemented: "+_)},E=function(_,c){var l=[],d;if(_.length>1){var u=_.shift();for(d=0;d<u;d++)l[d]=E(_,c);_.unshift(u)}else for(d=0;d<_[0];d++)l[d]=o(c);return l};return E(r,a)},to=function(e){return e.toString("utf8")},so=function(e){return e===null?null:C(e,8)>0},ao=function(e){e(20,Jn),e(21,zn),e(23,ja),e(26,ja),e(1700,eo),e(700,Qn),e(701,Zn),e(16,so),e(1114,Ca.bind(null,!1)),e(1184,Ca.bind(null,!0)),e(1e3,Qe),e(1007,Qe),e(1016,Qe),e(1008,Qe),e(1009,Qe),e(25,to)};Ha.exports={init:ao}});var ka=v((Nl,Ma)=>{Ma.exports={BOOL:16,BYTEA:17,CHAR:18,INT8:20,INT2:21,INT4:23,REGPROC:24,TEXT:25,OID:26,TID:27,XID:28,CID:29,JSON:114,XML:142,PG_NODE_TREE:194,SMGR:210,PATH:602,POLYGON:604,CIDR:650,FLOAT4:700,FLOAT8:701,ABSTIME:702,RELTIME:703,TINTERVAL:704,CIRCLE:718,MACADDR8:774,MONEY:790,MACADDR:829,INET:869,ACLITEM:1033,BPCHAR:1042,VARCHAR:1043,DATE:1082,TIME:1083,TIMESTAMP:1114,TIMESTAMPTZ:1184,INTERVAL:1186,TIMETZ:1266,BIT:1560,VARBIT:1562,NUMERIC:1700,REFCURSOR:1790,REGPROCEDURE:2202,REGOPER:2203,REGOPERATOR:2204,REGCLASS:2205,REGTYPE:2206,UUID:2950,TXID_SNAPSHOT:2970,PG_LSN:3220,PG_NDISTINCT:3361,PG_DEPENDENCIES:3402,TSVECTOR:3614,TSQUERY:3615,GTSVECTOR:3642,REGCONFIG:3734,REGDICTIONARY:3769,JSONB:3802,REGNAMESPACE:4089,REGROLE:4096}});var tt=v(et=>{var io=Da(),ro=Pa(),no=wt(),oo=ka();et.getTypeParser=_o;et.setTypeParser=Eo;et.arrayParser=no;et.builtins=oo;var Ze={text:{},binary:{}};function wa(e){return String(e)}function _o(e,t){return t=t||"text",Ze[t]&&Ze[t][e]||wa}function Eo(e,t,s){typeof t=="function"&&(s=t,t="text"),Ze[t][e]=s}io.init(function(e,t){Ze.text[e]=t});ro.init(function(e,t){Ze.binary[e]=t})});var st=v((Tl,Yt)=>{"use strict";Yt.exports={host:"localhost",user:process.platform==="win32"?process.env.USERNAME:process.env.USER,database:void 0,password:null,connectionString:void 0,port:5432,rows:0,binary:!1,max:10,idleTimeoutMillis:3e4,client_encoding:"",ssl:!1,application_name:void 0,fallback_application_name:void 0,options:void 0,parseInputDatesAsUTC:!1,statement_timeout:!1,lock_timeout:!1,idle_in_transaction_session_timeout:!1,query_timeout:!1,connect_timeout:0,keepalives:1,keepalives_idle:0};var Me=tt(),co=Me.getTypeParser(20,"text"),lo=Me.getTypeParser(1016,"text");Yt.exports.__defineSetter__("parseInt8",function(e){Me.setTypeParser(20,"text",e?Me.getTypeParser(23,"text"):co),Me.setTypeParser(1016,"text",e?Me.getTypeParser(1007,"text"):lo)})});var at=v((ml,xa)=>{"use strict";var uo=st();function No(e){var t=e.replace(/\\/g,"\\\\").replace(/"/g,'\\"');return'"'+t+'"'}function Wa(e){for(var t="{",s=0;s<e.length;s++)if(s>0&&(t=t+","),e[s]===null||typeof e[s]>"u")t=t+"NULL";else if(Array.isArray(e[s]))t=t+Wa(e[s]);else if(ArrayBuffer.isView(e[s])){var a=e[s];if(!(a instanceof Buffer)){var i=Buffer.from(a.buffer,a.byteOffset,a.byteLength);i.length===a.byteLength?a=i:a=i.slice(a.byteOffset,a.byteOffset+a.byteLength)}t+="\\\\x"+a.toString("hex")}else t+=No(Rt(e[s]));return t=t+"}",t}var Rt=function(e,t){if(e==null)return null;if(e instanceof Buffer)return e;if(ArrayBuffer.isView(e)){var s=Buffer.from(e.buffer,e.byteOffset,e.byteLength);return s.length===e.byteLength?s:s.slice(e.byteOffset,e.byteOffset+e.byteLength)}return e instanceof Date?uo.parseInputDatesAsUTC?mo(e):To(e):Array.isArray(e)?Wa(e):typeof e=="object"?po(e,t):e.toString()};function po(e,t){if(e&&typeof e.toPostgres=="function"){if(t=t||[],t.indexOf(e)!==-1)throw new Error('circular reference detected while preparing "'+e+'" for query');return t.push(e),Rt(e.toPostgres(Rt),t)}return JSON.stringify(e)}function Z(e,t){for(e=""+e;e.length<t;)e="0"+e;return e}function To(e){var t=-e.getTimezoneOffset(),s=e.getFullYear(),a=s<1;a&&(s=Math.abs(s)+1);var i=Z(s,4)+"-"+Z(e.getMonth()+1,2)+"-"+Z(e.getDate(),2)+"T"+Z(e.getHours(),2)+":"+Z(e.getMinutes(),2)+":"+Z(e.getSeconds(),2)+"."+Z(e.getMilliseconds(),3);return t<0?(i+="-",t*=-1):i+="+",i+=Z(Math.floor(t/60),2)+":"+Z(t%60,2),a&&(i+=" BC"),i}function mo(e){var t=e.getUTCFullYear(),s=t<1;s&&(t=Math.abs(t)+1);var a=Z(t,4)+"-"+Z(e.getUTCMonth()+1,2)+"-"+Z(e.getUTCDate(),2)+"T"+Z(e.getUTCHours(),2)+":"+Z(e.getUTCMinutes(),2)+":"+Z(e.getUTCSeconds(),2)+"."+Z(e.getUTCMilliseconds(),3);return a+="+00:00",s&&(a+=" BC"),a}function Ro(e,t,s){return e=typeof e=="string"?{text:e}:e,t&&(typeof t=="function"?e.callback=t:e.values=t),s&&(e.callback=s),e}var vo=function(e){return'"'+e.replace(/"/g,'""')+'"'},bo=function(e){for(var t=!1,s="'",a=0;a<e.length;a++){var i=e[a];i==="'"?s+=i+i:i==="\\"?(s+=i+i,t=!0):s+=i}return s+="'",t===!0&&(s=" E"+s),s};xa.exports={prepareValue:function(t){return Rt(t)},normalizeQueryConfig:Ro,escapeIdentifier:vo,escapeLiteral:bo}});var Ga=v((Rl,Ba)=>{"use strict";var it=W("crypto");function Kt(e){return it.createHash("md5").update(e,"utf-8").digest("hex")}function Io(e,t,s){var a=Kt(t+e),i=Kt(Buffer.concat([Buffer.from(a),s]));return"md5"+i}function Oo(e){return it.createHash("sha256").update(e).digest()}function Lo(e,t){return it.createHmac("sha256",e).update(t).digest()}async function ho(e,t,s){return it.pbkdf2Sync(e,t,s,32,"sha256")}Ba.exports={postgresMd5PasswordHash:Io,randomBytes:it.randomBytes,deriveKey:ho,sha256:Oo,hmacSha256:Lo,md5:Kt}});var Ya=v((vl,Va)=>{var qa=W("crypto");Va.exports={postgresMd5PasswordHash:So,randomBytes:Ao,deriveKey:Do,sha256:fo,hmacSha256:go,md5:Xt};var $a=qa.webcrypto||globalThis.crypto,ke=$a.subtle,Jt=new TextEncoder;function Ao(e){return $a.getRandomValues(Buffer.alloc(e))}async function Xt(e){try{return qa.createHash("md5").update(e,"utf-8").digest("hex")}catch{let s=typeof e=="string"?Jt.encode(e):e,a=await ke.digest("MD5",s);return Array.from(new Uint8Array(a)).map(i=>i.toString(16).padStart(2,"0")).join("")}}async function So(e,t,s){var a=await Xt(t+e),i=await Xt(Buffer.concat([Buffer.from(a),s]));return"md5"+i}async function fo(e){return await ke.digest("SHA-256",e)}async function go(e,t){let s=await ke.importKey("raw",e,{name:"HMAC",hash:"SHA-256"},!1,["sign"]);return await ke.sign("HMAC",s,Jt.encode(t))}async function Do(e,t,s){let a=await ke.importKey("raw",Jt.encode(e),"PBKDF2",!1,["deriveBits"]),i={name:"PBKDF2",hash:"SHA-256",salt:t,iterations:s};return await ke.deriveBits(i,a,32*8,["deriveBits"])}});var Qt=v((bl,zt)=>{"use strict";var Fo=parseInt(process.versions&&process.versions.node&&process.versions.node.split(".")[0])<15;Fo?zt.exports=Ga():zt.exports=Ya()});var za=v((Il,Ja)=>{"use strict";var Fe=Qt();function yo(e){if(e.indexOf("SCRAM-SHA-256")===-1)throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");let t=Fe.randomBytes(18).toString("base64");return{mechanism:"SCRAM-SHA-256",clientNonce:t,response:"n,,n=*,r="+t,message:"SASLInitialResponse"}}async function jo(e,t,s){if(e.message!=="SASLInitialResponse")throw new Error("SASL: Last message was not SASLInitialResponse");if(typeof t!="string")throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");if(t==="")throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string");if(typeof s!="string")throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");let a=Ho(s);if(a.nonce.startsWith(e.clientNonce)){if(a.nonce.length===e.clientNonce.length)throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");var i="n=*,r="+e.clientNonce,r="r="+a.nonce+",s="+a.salt+",i="+a.iteration,n="c=biws,r="+a.nonce,o=i+","+r+","+n,E=Buffer.from(a.salt,"base64"),_=await Fe.deriveKey(t,E,a.iteration),c=await Fe.hmacSha256(_,"Client Key"),l=await Fe.sha256(c),d=await Fe.hmacSha256(l,o),u=Mo(Buffer.from(c),Buffer.from(d)).toString("base64"),b=await Fe.hmacSha256(_,"Server Key"),I=await Fe.hmacSha256(b,o);e.message="SASLResponse",e.serverSignature=Buffer.from(I).toString("base64"),e.response=n+",p="+u}function Co(e,t){if(e.message!=="SASLResponse")throw new Error("SASL: Last message was not SASLResponse");if(typeof t!="string")throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");let{serverSignature:s}=Po(t);if(s!==e.serverSignature)throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match")}function Uo(e){if(typeof e!="string")throw new TypeError("SASL: text must be a string");return e.split("").map((t,s)=>e.charCodeAt(s)).every(t=>t>=33&&t<=43||t>=45&&t<=126)}function Ka(e){return/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(e)}function Xa(e){if(typeof e!="string")throw new TypeError("SASL: attribute pairs text must be a string");return new Map(e.split(",").map(t=>{if(!/^.=/.test(t))throw new Error("SASL: Invalid attribute pair entry");let s=t[0],a=t.substring(2);return[s,a]}))}function Ho(e){let t=Xa(e),s=t.get("r");if(s){if(!Uo(s))throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");let a=t.get("s");if(a){if(!Ka(a))throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");let i=t.get("i");if(i){if(!/^[1-9][0-9]*$/.test(i))throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count")}else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");let r=parseInt(i,10);return{nonce:s,salt:a,iteration:r}}function Po(e){let s=Xa(e).get("v");if(s){if(!Ka(s))throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64")}else throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");return{serverSignature:s}}function Mo(e,t){if(!Buffer.isBuffer(e))throw new TypeError("first argument must be a Buffer");if(!Buffer.isBuffer(t))throw new TypeError("second argument must be a Buffer");if(e.length!==t.length)throw new Error("Buffer lengths must match");if(e.length===0)throw new Error("Buffers cannot be empty");return Buffer.from(e.map((s,a)=>e[a]^t[a]))}Ja.exports={startSession:yo,continueSession:jo,finalizeSession:Co}});var Zt=v((Ol,Qa)=>{"use strict";var ko=tt();function vt(e){this._types=e||ko,this.text={},this.binary={}}vt.prototype.getOverrides=function(e){switch(e){case"text":return this.text;case"binary":return this.binary;default:return{}}};vt.prototype.setTypeParser=function(e,t,s){typeof t=="function"&&(s=t,t="text"),this.getOverrides(t)[e]=s};vt.prototype.getTypeParser=function(e,t){return t=t||"text",this.getOverrides(t)[e]||this._types.getTypeParser(e,t)};Qa.exports=vt});var ti=v((Ll,ei)=>{"use strict";function we(e,t={}){if(e.charAt(0)==="/"){let E=e.split(" ");return{host:E[0],database:E[1]}}let s=Object.create(null),a,i=!1;/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(e)&&(e=encodeURI(e).replace(/%25(\d\d)/g,"%$1"));try{try{a=new URL(e,"postgres://base")}catch{a=new URL(e.replace("@/","@___DUMMY___/"),"postgres://base"),i=!0}}catch(E){throw E.input&&(E.input="*****REDACTED*****"),E}for(let E of a.searchParams.entries())s[E[0]]=E[1];if(s.user=s.user||decodeURIComponent(a.username),s.password=s.password||decodeURIComponent(a.password),a.protocol=="socket:")return s.host=decodeURI(a.pathname),s.database=a.searchParams.get("db"),s.client_encoding=a.searchParams.get("encoding"),s;let r=(i?"":a.hostname).replace(/^\[(.+)\]$/,"$1");s.host?r&&/^%2f/i.test(r)&&(a.pathname=r+a.pathname):s.host=decodeURIComponent(r),s.port||(s.port=a.port);let n=a.pathname.slice(1)||null;s.database=n?decodeURI(n):null,(s.ssl==="true"||s.ssl==="1")&&(s.ssl=!0),s.ssl==="0"&&(s.ssl=!1),(s.sslcert||s.sslkey||s.sslrootcert||s.sslmode)&&(s.ssl={}),s.sslnegotiation==="direct"&&s.ssl===void 0&&(s.ssl=!0);let o=s.sslcert||s.sslkey||s.sslrootcert?W("fs"):null;if(s.sslcert&&(s.ssl.cert=o.readFileSync(s.sslcert).toString()),s.sslkey&&(s.ssl.key=o.readFileSync(s.sslkey).toString()),s.sslrootcert&&(s.ssl.ca=o.readFileSync(s.sslrootcert).toString()),t.useLibpqCompat&&s.uselibpqcompat)throw new Error("Both useLibpqCompat and uselibpqcompat are set. Please use only one of them.");if(s.uselibpqcompat==="true"||t.useLibpqCompat)switch(s.sslmode){case"disable":{s.ssl=!1;break}case"prefer":{s.ssl.rejectUnauthorized=!1;break}case"require":{s.sslrootcert?s.ssl.checkServerIdentity=function(){}:s.ssl.rejectUnauthorized=!1;break}case"verify-ca":{if(!s.ssl.ca)throw new Error("SECURITY WARNING: Using sslmode=verify-ca requires specifying a CA with sslrootcert. If a public CA is used, verify-ca allows connections to a server that somebody else may have registered with the CA, making you vulnerable to Man-in-the-Middle attacks. Either specify a custom CA certificate with sslrootcert parameter or use sslmode=verify-full for proper security.");s.ssl.checkServerIdentity=function(){};break}case"verify-full":break}else switch(s.sslmode){case"disable":{s.ssl=!1;break}case"prefer":case"require":case"verify-ca":case"verify-full":{s.sslmode!=="verify-full"&&es(s.sslmode);break}case"no-verify":{s.ssl.rejectUnauthorized=!1;break}}return s}function wo(e){return Object.entries(e).reduce((s,[a,i])=>(i!=null&&(s[a]=i),s),Object.create(null))}function Za(e){return Object.entries(e).reduce((s,[a,i])=>{if(a==="ssl"){let r=i;typeof r=="boolean"&&(s[a]=r),typeof r=="object"&&(s[a]=wo(r))}else if(i!=null)if(a==="port"){if(i!==""){let r=parseInt(i,10);if(isNaN(r))throw new Error(`Invalid ${a}: ${i}`);s[a]=r}}else s[a]=i;return s},Object.create(null))}function Wo(e){return Za(we(e))}function es(e){!es.warned&&typeof process<"u"&&process.emitWarning&&(es.warned=!0,process.emitWarning(`SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=${e}'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.`))}ei.exports=we;we.parse=we;we.toClientConfig=Za;we.parseIntoClientConfig=Wo});var ss=v((hl,ii)=>{"use strict";var xo=W("dns"),ai=st(),si=ti().parse,ee=function(e,t,s){return s===void 0?s=process.env["PG"+e.toUpperCase()]:s===!1||(s=process.env[s]),t[e]||s||ai[e]},Bo=function(){switch(process.env.PGSSLMODE){case"disable":return!1;case"prefer":case"require":case"verify-ca":case"verify-full":return!0;case"no-verify":return{rejectUnauthorized:!1}}return ai.ssl},We=function(e){return"'"+(""+e).replace(/\\/g,"\\\\").replace(/'/g,"\\'")+"'"},ue=function(e,t,s){var a=t[s];a!=null&&e.push(s+"="+We(a))},ts=class{constructor(t){t=typeof t=="string"?si(t):t||{},t.connectionString&&(t=Object.assign({},t,si(t.connectionString))),this.user=ee("user",t),this.database=ee("database",t),this.database===void 0&&(this.database=this.user),this.port=parseInt(ee("port",t),10),this.host=ee("host",t),Object.defineProperty(this,"password",{configurable:!0,enumerable:!1,writable:!0,value:ee("password",t)}),this.binary=ee("binary",t),this.options=ee("options",t),this.ssl=typeof t.ssl>"u"?Bo():t.ssl,typeof this.ssl=="string"&&this.ssl==="true"&&(this.ssl=!0),this.ssl==="no-verify"&&(this.ssl={rejectUnauthorized:!1}),this.ssl&&this.ssl.key&&Object.defineProperty(this.ssl,"key",{enumerable:!1}),this.client_encoding=ee("client_encoding",t),this.replication=ee("replication",t),this.isDomainSocket=!(this.host||"").indexOf("/"),this.application_name=ee("application_name",t,"PGAPPNAME"),this.fallback_application_name=ee("fallback_application_name",t,!1),this.statement_timeout=ee("statement_timeout",t,!1),this.lock_timeout=ee("lock_timeout",t,!1),this.idle_in_transaction_session_timeout=ee("idle_in_transaction_session_timeout",t,!1),this.query_timeout=ee("query_timeout",t,!1),t.connectionTimeoutMillis===void 0?this.connect_timeout=process.env.PGCONNECT_TIMEOUT||0:this.connect_timeout=Math.floor(t.connectionTimeoutMillis/1e3),t.keepAlive===!1?this.keepalives=0:t.keepAlive===!0&&(this.keepalives=1),typeof t.keepAliveInitialDelayMillis=="number"&&(this.keepalives_idle=Math.floor(t.keepAliveInitialDelayMillis/1e3))}getLibpqConnectionString(t){var s=[];ue(s,this,"user"),ue(s,this,"password"),ue(s,this,"port"),ue(s,this,"application_name"),ue(s,this,"fallback_application_name"),ue(s,this,"connect_timeout"),ue(s,this,"options");var a=typeof this.ssl=="object"?this.ssl:this.ssl?{sslmode:this.ssl}:{};if(ue(s,a,"sslmode"),ue(s,a,"sslca"),ue(s,a,"sslkey"),ue(s,a,"sslcert"),ue(s,a,"sslrootcert"),this.database&&s.push("dbname="+We(this.database)),this.replication&&s.push("replication="+We(this.replication)),this.host&&s.push("host="+We(this.host)),this.isDomainSocket)return t(null,s.join(" "));this.client_encoding&&s.push("client_encoding="+We(this.client_encoding)),xo.lookup(this.host,function(i,r){return i?t(i,null):(s.push("hostaddr="+We(r)),t(null,s.join(" ")))})}};ii.exports=ts});var oi=v((Al,ni)=>{"use strict";var Go=tt(),ri=/^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/,as=class{constructor(t,s){this.command=null,this.rowCount=null,this.oid=null,this.rows=[],this.fields=[],this._parsers=void 0,this._types=s,this.RowCtor=null,this.rowAsArray=t==="array",this.rowAsArray&&(this.parseRow=this._parseRowAsArray),this._prebuiltEmptyResultObject=null}addCommandComplete(t){var s;t.text?s=ri.exec(t.text):s=ri.exec(t.command),s&&(this.command=s[1],s[3]?(this.oid=parseInt(s[2],10),this.rowCount=parseInt(s[3],10)):s[2]&&(this.rowCount=parseInt(s[2],10)))}_parseRowAsArray(t){for(var s=new Array(t.length),a=0,i=t.length;a<i;a++){var r=t[a];r!==null?s[a]=this._parsers[a](r):s[a]=null}return s}parseRow(t){for(var s={...this._prebuiltEmptyResultObject},a=0,i=t.length;a<i;a++){var r=t[a],n=this.fields[a].name;r!==null?s[n]=this._parsers[a](r):s[n]=null}return s}addRow(t){this.rows.push(t)}addFields(t){this.fields=t,this.fields.length&&(this._parsers=new Array(t.length));for(var s={},a=0;a<t.length;a++){var i=t[a];s[i.name]=null,this._types?this._parsers[a]=this._types.getTypeParser(i.dataTypeID,i.format||"text"):this._parsers[a]=Go.getTypeParser(i.dataTypeID,i.format||"text")}this._prebuiltEmptyResultObject={...s}}};ni.exports=as});var li=v((Sl,ci)=>{"use strict";var{EventEmitter:qo}=W("events"),_i=oi(),Ei=at(),is=class extends qo{constructor(t,s,a){super(),t=Ei.normalizeQueryConfig(t,s,a),this.text=t.text,this.values=t.values,this.rows=t.rows,this.types=t.types,this.name=t.name,this.queryMode=t.queryMode,this.binary=t.binary,this.portal=t.portal||"",this.callback=t.callback,this._rowMode=t.rowMode,process.domain&&t.callback&&(this.callback=process.domain.bind(t.callback)),this._result=new _i(this._rowMode,this.types),this._results=this._result,this._canceledDueToError=!1}requiresPreparation(){return this.queryMode==="extended"||this.name||this.rows?!0:!this.text||!this.values?!1:this.values.length>0}_checkForMultirow(){this._result.command&&(Array.isArray(this._results)||(this._results=[this._result]),this._result=new _i(this._rowMode,this._result._types),this._results.push(this._result))}handleRowDescription(t){this._checkForMultirow(),this._result.addFields(t.fields),this._accumulateRows=this.callback||!this.listeners("row").length}handleDataRow(t){let s;if(!this._canceledDueToError){try{s=this._result.parseRow(t.fields)}catch(a){this._canceledDueToError=a;return}this.emit("row",s,this._result),this._accumulateRows&&this._result.addRow(s)}}handleCommandComplete(t,s){this._checkForMultirow(),this._result.addCommandComplete(t),this.rows&&s.sync()}handleEmptyQuery(t){this.rows&&t.sync()}handleError(t,s){if(this._canceledDueToError&&(t=this._canceledDueToError,this._canceledDueToError=!1),this.callback)return this.callback(t);this.emit("error",t)}handleReadyForQuery(t){if(this._canceledDueToError)return this.handleError(this._canceledDueToError,t);if(this.callback)try{this.callback(null,this._results)}catch(s){process.nextTick(()=>{throw s})}this.emit("end",this._results)}submit(t){if(typeof this.text!="string"&&typeof this.name!="string")return new Error("A query must have either text or a name. Supplying neither is unsupported.");let s=t.parsedStatements[this.name];return this.text&&s&&this.text!==s?new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`):this.values&&!Array.isArray(this.values)?new Error("Query values must be an array"):(this.requiresPreparation()?this.prepare(t):t.query(this.text),null)}hasBeenParsed(t){return this.name&&t.parsedStatements[this.name]}handlePortalSuspended(t){this._getRows(t,this.rows)}_getRows(t,s){t.execute({portal:this.portal,rows:s}),s?t.flush():t.sync()}prepare(t){this.hasBeenParsed(t)||t.parse({text:this.text,name:this.name,types:this.types});try{t.bind({portal:this.portal,statement:this.name,values:this.values,binary:this.binary,valueMapper:Ei.prepareValue})}catch(s){this.handleError(s,t);return}t.describe({type:"P",name:this.portal||""}),this._getRows(t,this.rows)}handleCopyInResponse(t){t.sendCopyFail("No source stream defined")}handleCopyData(t,s){}};ci.exports=is});var vs=v(p=>{"use strict";Object.defineProperty(p,"__esModule",{value:!0});p.NoticeMessage=p.DataRowMessage=p.CommandCompleteMessage=p.ReadyForQueryMessage=p.NotificationResponseMessage=p.BackendKeyDataMessage=p.AuthenticationMD5Password=p.ParameterStatusMessage=p.ParameterDescriptionMessage=p.RowDescriptionMessage=p.Field=p.CopyResponse=p.CopyDataMessage=p.DatabaseError=p.copyDone=p.emptyQuery=p.replicationStart=p.portalSuspended=p.noData=p.closeComplete=p.bindComplete=p.parseComplete=void 0;p.parseComplete={name:"parseComplete",length:5};p.bindComplete={name:"bindComplete",length:5};p.closeComplete={name:"closeComplete",length:5};p.noData={name:"noData",length:5};p.portalSuspended={name:"portalSuspended",length:5};p.replicationStart={name:"replicationStart",length:4};p.emptyQuery={name:"emptyQuery",length:4};p.copyDone={name:"copyDone",length:4};var rs=class extends Error{constructor(t,s,a){super(t),this.length=s,this.name=a}};p.DatabaseError=rs;var ns=class{constructor(t,s){this.length=t,this.chunk=s,this.name="copyData"}};p.CopyDataMessage=ns;var os=class{constructor(t,s,a,i){this.length=t,this.name=s,this.binary=a,this.columnTypes=new Array(i)}};p.CopyResponse=os;var _s=class{constructor(t,s,a,i,r,n,o){this.name=t,this.tableID=s,this.columnID=a,this.dataTypeID=i,this.dataTypeSize=r,this.dataTypeModifier=n,this.format=o}};p.Field=_s;var Es=class{constructor(t,s){this.length=t,this.fieldCount=s,this.name="rowDescription",this.fields=new Array(this.fieldCount)}};p.RowDescriptionMessage=Es;var cs=class{constructor(t,s){this.length=t,this.parameterCount=s,this.name="parameterDescription",this.dataTypeIDs=new Array(this.parameterCount)}};p.ParameterDescriptionMessage=cs;var ls=class{constructor(t,s,a){this.length=t,this.parameterName=s,this.parameterValue=a,this.name="parameterStatus"}};p.ParameterStatusMessage=ls;var ds=class{constructor(t,s){this.length=t,this.salt=s,this.name="authenticationMD5Password"}};p.AuthenticationMD5Password=ds;var us=class{constructor(t,s,a){this.length=t,this.processID=s,this.secretKey=a,this.name="backendKeyData"}};p.BackendKeyDataMessage=us;var Ns=class{constructor(t,s,a,i){this.length=t,this.processId=s,this.channel=a,this.payload=i,this.name="notification"}};p.NotificationResponseMessage=Ns;var ps=class{constructor(t,s){this.length=t,this.status=s,this.name="readyForQuery"}};p.ReadyForQueryMessage=ps;var Ts=class{constructor(t,s){this.length=t,this.text=s,this.name="commandComplete"}};p.CommandCompleteMessage=Ts;var ms=class{constructor(t,s){this.length=t,this.fields=s,this.name="dataRow",this.fieldCount=s.length}};p.DataRowMessage=ms;var Rs=class{constructor(t,s){this.length=t,this.message=s,this.name="notice"}};p.NoticeMessage=Rs});var di=v(bt=>{"use strict";Object.defineProperty(bt,"__esModule",{value:!0});bt.Writer=void 0;var bs=class{constructor(t=256){this.size=t,this.offset=5,this.headerPosition=0,this.buffer=Buffer.allocUnsafe(t)}ensure(t){if(this.buffer.length-this.offset<t){let a=this.buffer,i=a.length+(a.length>>1)+t;this.buffer=Buffer.allocUnsafe(i),a.copy(this.buffer,0,0,this.offset)}}addInt32(t){return this.ensure(4),this.buffer[this.offset++]=t>>>24&255,this.buffer[this.offset++]=t>>>16&255,this.buffer[this.offset++]=t>>>8&255,this.buffer[this.offset++]=t>>>0&255,this}addInt16(t){return this.ensure(2),this.buffer[this.offset++]=t>>>8&255,this.buffer[this.offset++]=t>>>0&255,this}addCString(t){if(!t)this.ensure(1);else{let s=Buffer.byteLength(t);this.ensure(s+1),this.buffer.write(t,this.offset,"utf-8"),this.offset+=s}return this.buffer[this.offset++]=0,this}addString(t=""){let s=Buffer.byteLength(t);return this.ensure(s),this.buffer.write(t,this.offset),this.offset+=s,this}addInt32PrefixedString(t){let s=Buffer.byteLength(t);this.ensure(4+s);let a=this.buffer,i=this.offset;return a[i++]=s>>>24&255,a[i++]=s>>>16&255,a[i++]=s>>>8&255,a[i++]=s>>>0&255,a.write(t,i,"utf-8"),this.offset=i+s,this}add(t){return this.ensure(t.length),t.copy(this.buffer,this.offset),this.offset+=t.length,this}reserveUnsafe(t){let s=this.offset;return this.ensure(t),this.offset+=t,s}join(t){if(t){this.buffer[this.headerPosition]=t;let s=this.offset-(this.headerPosition+1);this.buffer.writeInt32BE(s,this.headerPosition+1)}return this.buffer.slice(t?0:5,this.offset)}flush(t){let s=this.join(t);return this.offset=5,this.headerPosition=0,this.buffer=Buffer.allocUnsafe(this.size),s}clear(){this.offset=5,this.headerPosition=0}};bt.Writer=bs});var pi=v(Ot=>{"use strict";Object.defineProperty(Ot,"__esModule",{value:!0});Ot.serialize=void 0;var ui=di(),D=new ui.Writer,$o=e=>{D.addInt16(3).addInt16(0);for(let a of Object.keys(e))D.addCString(a).addCString(e[a]);D.addCString("client_encoding").addCString("UTF8");let t=D.addCString("").flush(),s=t.length+4;return new ui.Writer().addInt32(s).add(t).flush()},Vo=()=>{let e=Buffer.allocUnsafe(8);return e.writeInt32BE(8,0),e.writeInt32BE(80877103,4),e},Yo=e=>D.addCString(e).flush(112),Ko=function(e,t){return D.addCString(e).addInt32PrefixedString(t),D.flush(112)},Xo=function(e){return D.addString(e).flush(112)},Jo=e=>D.addCString(e).flush(81),Ni=[],zo=e=>{let t=e.name||"";t.length>63&&(console.error("Warning! Postgres only supports 63 characters for query names."),console.error("You supplied %s (%s)",t,t.length),console.error("This can cause conflicts and silent errors executing queries"));let s=e.types||Ni,a=s.length,i=D.addCString(t).addCString(e.text).addInt16(a);for(let r=0;r<a;r++)i.addInt32(s[r]);return D.flush(80)},Qo=function(e,t,s){let a=e.length;for(let i=0;i<a;i++){let r=t?t(e[i],i):e[i],n=0;r==null?D.addInt32(-1):r instanceof Buffer?(n=1,D.addInt32(r.length),D.add(r)):D.addInt32PrefixedString(r);let o=D.buffer;o[s++]=0,o[s++]=n}},Zo=(e={})=>{let t=e.portal||"",s=e.statement||"",a=e.binary||!1,i=e.values||Ni,r=i.length;D.addCString(t).addCString(s),D.addInt16(r);let n=D.reserveUnsafe(r*2);D.addInt16(r);try{Qo(i,e.valueMapper,n)}catch(o){throw D.clear(),o}return D.addInt16(1),D.addInt16(a?1:0),D.flush(66)},e_=Buffer.from([69,0,0,0,9,0,0,0,0,0]),t_=e=>{if(!e||!e.portal&&!e.rows)return e_;let t=e.portal||"",s=e.rows||0,a=Buffer.byteLength(t),i=4+a+1+4,r=Buffer.allocUnsafe(1+i);return r[0]=69,r.writeInt32BE(i,1),r.write(t,5,"utf-8"),r[a+5]=0,r.writeUInt32BE(s,r.length-4),r},s_=(e,t)=>{let s=Buffer.allocUnsafe(16);return s.writeInt32BE(16,0),s.writeInt16BE(1234,4),s.writeInt16BE(5678,6),s.writeInt32BE(e,8),s.writeInt32BE(t,12),s},Is=(e,t)=>{let a=4+Buffer.byteLength(t)+1,i=Buffer.allocUnsafe(1+a);return i[0]=e,i.writeInt32BE(a,1),i.write(t,5,"utf-8"),i[a]=0,i},a_=D.addCString("P").flush(68),i_=D.addCString("S").flush(68),r_=e=>e.name?Is(68,`${e.type}${e.name||""}`):e.type==="P"?a_:i_,n_=e=>{let t=`${e.type}${e.name||""}`;return Is(67,t)},o_=e=>D.add(e).flush(100),__=e=>Is(102,e),It=e=>Buffer.from([e,0,0,0,4]),E_=It(72),c_=It(83),l_=It(88),d_=It(99),u_={startup:$o,password:Yo,requestSsl:Vo,sendSASLInitialResponseMessage:Ko,sendSCRAMClientFinalMessage:Xo,query:Jo,parse:zo,bind:Zo,execute:t_,describe:r_,close:n_,flush:()=>E_,sync:()=>c_,end:()=>l_,copyData:o_,copyDone:()=>d_,copyFail:__,cancel:s_};Ot.serialize=u_});var Ti=v(Lt=>{"use strict";Object.defineProperty(Lt,"__esModule",{value:!0});Lt.BufferReader=void 0;var Os=class{constructor(t=0){this.offset=t,this.buffer=Buffer.allocUnsafe(0),this.encoding="utf-8"}setBuffer(t,s){this.offset=t,this.buffer=s}int16(){let t=this.buffer.readInt16BE(this.offset);return this.offset+=2,t}byte(){let t=this.buffer[this.offset];return this.offset++,t}int32(){let t=this.buffer.readInt32BE(this.offset);return this.offset+=4,t}uint32(){let t=this.buffer.readUInt32BE(this.offset);return this.offset+=4,t}string(t){let s=this.buffer.toString(this.encoding,this.offset,this.offset+t);return this.offset+=t,s}cstring(){let t=this.offset,s=t;for(;this.buffer[s++];);return this.offset=s,this.buffer.toString(this.encoding,t,s-1)}bytes(t){let s=this.buffer.slice(this.offset,this.offset+t);return this.offset+=t,s}};Lt.BufferReader=Os});var bi=v(ht=>{"use strict";Object.defineProperty(ht,"__esModule",{value:!0});ht.Parser=void 0;var U=vs(),N_=Ti(),hs=1,p_=4,mi=hs+p_,Ee=-1,Ls=Buffer.allocUnsafe(0),As=class{constructor(t){if(this.buffer=Ls,this.bufferLength=0,this.bufferOffset=0,this.reader=new N_.BufferReader,t?.mode==="binary")throw new Error("Binary mode not supported yet");this.mode=t?.mode||"text"}parse(t,s){this.mergeBuffer(t);let a=this.bufferOffset+this.bufferLength,i=this.bufferOffset;for(;i+mi<=a;){let r=this.buffer[i],n=this.buffer.readUInt32BE(i+hs),o=hs+n;if(o+i<=a){let E=this.handlePacket(i+mi,r,n,this.buffer);s(E),i+=o}else break}i===a?(this.buffer=Ls,this.bufferLength=0,this.bufferOffset=0):(this.bufferLength=a-i,this.bufferOffset=i)}mergeBuffer(t){if(this.bufferLength>0){let s=this.bufferLength+t.byteLength;if(s+this.bufferOffset>this.buffer.byteLength){let i;if(s<=this.buffer.byteLength&&this.bufferOffset>=this.bufferLength)i=this.buffer;else{let r=this.buffer.byteLength*2;for(;s>=r;)r*=2;i=Buffer.allocUnsafe(r)}this.buffer.copy(i,0,this.bufferOffset,this.bufferOffset+this.bufferLength),this.buffer=i,this.bufferOffset=0}t.copy(this.buffer,this.bufferOffset+this.bufferLength),this.bufferLength=s}else this.buffer=t,this.bufferOffset=0,this.bufferLength=t.byteLength}handlePacket(t,s,a,i){let{reader:r}=this;r.setBuffer(t,i);let n;switch(s){case 50:n=U.bindComplete;break;case 49:n=U.parseComplete;break;case 51:n=U.closeComplete;break;case 110:n=U.noData;break;case 115:n=U.portalSuspended;break;case 99:n=U.copyDone;break;case 87:n=U.replicationStart;break;case 73:n=U.emptyQuery;break;case 68:n=A_(r);break;case 67:n=m_(r);break;case 90:n=T_(r);break;case 65:n=I_(r);break;case 82:n=g_(r,a);break;case 83:n=S_(r);break;case 75:n=f_(r);break;case 69:n=Ri(r,"error");break;case 78:n=Ri(r,"notice");break;case 84:n=O_(r);break;case 116:n=h_(r);break;case 71:n=v_(r);break;case 72:n=b_(r);break;case 100:n=R_(r,a);break;default:return new U.DatabaseError("received invalid response: "+s.toString(16),a,"error")}return r.setBuffer(0,Ls),n.length=a,n}};ht.Parser=As;var T_=e=>{let t=e.string(1);return new U.ReadyForQueryMessage(Ee,t)},m_=e=>{let t=e.cstring();return new U.CommandCompleteMessage(Ee,t)},R_=(e,t)=>{let s=e.bytes(t-4);return new U.CopyDataMessage(Ee,s)},v_=e=>vi(e,"copyInResponse"),b_=e=>vi(e,"copyOutResponse"),vi=(e,t)=>{let s=e.byte()!==0,a=e.int16(),i=new U.CopyResponse(Ee,t,s,a);for(let r=0;r<a;r++)i.columnTypes[r]=e.int16();return i},I_=e=>{let t=e.int32(),s=e.cstring(),a=e.cstring();return new U.NotificationResponseMessage(Ee,t,s,a)},O_=e=>{let t=e.int16(),s=new U.RowDescriptionMessage(Ee,t);for(let a=0;a<t;a++)s.fields[a]=L_(e);return s},L_=e=>{let t=e.cstring(),s=e.uint32(),a=e.int16(),i=e.uint32(),r=e.int16(),n=e.int32(),o=e.int16()===0?"text":"binary";return new U.Field(t,s,a,i,r,n,o)},h_=e=>{let t=e.int16(),s=new U.ParameterDescriptionMessage(Ee,t);for(let a=0;a<t;a++)s.dataTypeIDs[a]=e.uint32();return s},A_=e=>{let t=e.int16(),s=new Array(t);for(let a=0;a<t;a++){let i=e.int32();s[a]=i===-1?null:e.string(i)}return new U.DataRowMessage(Ee,s)},S_=e=>{let t=e.cstring(),s=e.cstring();return new U.ParameterStatusMessage(Ee,t,s)},f_=e=>{let t=e.int32(),s=e.int32();return new U.BackendKeyDataMessage(Ee,t,s)},g_=(e,t)=>{let s=e.int32(),a={name:"authenticationOk",length:t};switch(s){case 0:break;case 3:a.length===8&&(a.name="authenticationCleartextPassword");break;case 5:if(a.length===12){a.name="authenticationMD5Password";let i=e.bytes(4);return new U.AuthenticationMD5Password(Ee,i)}break;case 10:{a.name="authenticationSASL",a.mechanisms=[];let i;do i=e.cstring(),i&&a.mechanisms.push(i);while(i)}break;case 11:a.name="authenticationSASLContinue",a.data=e.string(t-8);break;case 12:a.name="authenticationSASLFinal",a.data=e.string(t-8);break;default:throw new Error("Unknown authenticationOk message type "+s)}return a},Ri=(e,t)=>{let s={},a=e.string(1);for(;a!=="\0";)s[a]=e.cstring(),a=e.string(1);let i=s.M,r=t==="notice"?new U.NoticeMessage(Ee,i):new U.DatabaseError(i,Ee,t);return r.severity=s.S,r.code=s.C,r.detail=s.D,r.hint=s.H,r.position=s.P,r.internalPosition=s.p,r.internalQuery=s.q,r.where=s.W,r.schema=s.s,r.table=s.t,r.column=s.c,r.dataType=s.d,r.constraint=s.n,r.file=s.F,r.line=s.L,r.routine=s.R,r}});var Ss=v(ye=>{"use strict";Object.defineProperty(ye,"__esModule",{value:!0});ye.DatabaseError=ye.serialize=void 0;ye.parse=j_;var D_=vs();Object.defineProperty(ye,"DatabaseError",{enumerable:!0,get:function(){return D_.DatabaseError}});var F_=pi();Object.defineProperty(ye,"serialize",{enumerable:!0,get:function(){return F_.serialize}});var y_=bi();function j_(e,t){let s=new y_.Parser;return e.on("data",a=>s.parse(a,t)),new Promise(a=>e.on("end",()=>a()))}});var Ii=v(fs=>{"use strict";Object.defineProperty(fs,"__esModule",{value:!0});fs.default={}});var Li=v((Ul,Oi)=>{var{getStream:C_,getSecureStream:U_}=k_();Oi.exports={getStream:C_,getSecureStream:U_};function H_(){function e(s){let a=W("net");return new a.Socket}function t(s){var a=W("tls");return a.connect(s)}return{getStream:e,getSecureStream:t}}function P_(){function e(s){let{CloudflareSocket:a}=Ii();return new a(s)}function t(s){return s.socket.startTls(s),s.socket}return{getStream:e,getSecureStream:t}}function M_(){if(typeof navigator=="object"&&navigator!==null&&typeof navigator.userAgent=="string")return navigator.userAgent==="Cloudflare-Workers";if(typeof Response=="function"){let e=new Response(null,{cf:{thing:!0}});if(typeof e.cf=="object"&&e.cf!==null&&e.cf.thing)return!0}return!1}function k_(){return M_()?P_():H_()}});var Ds=v((Hl,hi)=>{"use strict";var w_=W("events").EventEmitter,{parse:W_,serialize:Y}=Ss(),{getStream:x_,getSecureStream:B_}=Li(),G_=Y.flush(),q_=Y.sync(),$_=Y.end(),gs=class extends w_{constructor(t){super(),t=t||{},this.stream=t.stream||x_(t.ssl),typeof this.stream=="function"&&(this.stream=this.stream(t)),this._keepAlive=t.keepAlive,this._keepAliveInitialDelayMillis=t.keepAliveInitialDelayMillis,this.lastBuffer=!1,this.parsedStatements={},this.ssl=t.ssl||!1,this._ending=!1,this._emitMessage=!1;var s=this;this.on("newListener",function(a){a==="message"&&(s._emitMessage=!0)})}connect(t,s){var a=this;this._connecting=!0,this.stream.setNoDelay(!0),this.stream.connect(t,s),this.stream.once("connect",function(){a._keepAlive&&a.stream.setKeepAlive(!0,a._keepAliveInitialDelayMillis),a.emit("connect")});let i=function(r){a._ending&&(r.code==="ECONNRESET"||r.code==="EPIPE")||a.emit("error",r)};if(this.stream.on("error",i),this.stream.on("close",function(){a.emit("end")}),!this.ssl)return this.attachListeners(this.stream);this.stream.once("data",function(r){var n=r.toString("utf8");switch(n){case"S":break;case"N":return a.stream.end(),a.emit("error",new Error("The server does not support SSL connections"));default:return a.stream.end(),a.emit("error",new Error("There was an error establishing an SSL connection"))}let o={socket:a.stream};a.ssl!==!0&&(Object.assign(o,a.ssl),"key"in a.ssl&&(o.key=a.ssl.key));var E=W("net");E.isIP&&E.isIP(s)===0&&(o.servername=s);try{a.stream=B_(o)}catch(_){return a.emit("error",_)}a.attachListeners(a.stream),a.stream.on("error",i),a.emit("sslconnect")})}attachListeners(t){W_(t,s=>{var a=s.name==="error"?"errorMessage":s.name;this._emitMessage&&this.emit("message",s),this.emit(a,s)})}requestSsl(){this.stream.write(Y.requestSsl())}startup(t){this.stream.write(Y.startup(t))}cancel(t,s){this._send(Y.cancel(t,s))}password(t){this._send(Y.password(t))}sendSASLInitialResponseMessage(t,s){this._send(Y.sendSASLInitialResponseMessage(t,s))}sendSCRAMClientFinalMessage(t){this._send(Y.sendSCRAMClientFinalMessage(t))}_send(t){return this.stream.writable?this.stream.write(t):!1}query(t){this._send(Y.query(t))}parse(t){this._send(Y.parse(t))}bind(t){this._send(Y.bind(t))}execute(t){this._send(Y.execute(t))}flush(){this.stream.writable&&this.stream.write(G_)}sync(){this._ending=!0,this._send(q_)}ref(){this.stream.ref()}unref(){this.stream.unref()}end(){if(this._ending=!0,!this._connecting||!this.stream.writable){this.stream.end();return}return this.stream.write($_,()=>{this.stream.end()})}close(t){this._send(Y.close(t))}describe(t){this._send(Y.describe(t))}sendCopyFromChunk(t){this._send(Y.copyData(t))}endCopyFrom(){this._send(Y.copyDone())}sendCopyFail(t){this._send(Y.copyFail(t))}};hi.exports=gs});var fi=v((Pl,Le)=>{"use strict";var Ai=W("path"),V_=W("stream").Stream,Y_=W("readline").createInterface,Si=W("util"),K_=5432,At=process.platform==="win32",rt=process.stderr,X_=56,J_=7,z_=61440,Q_=32768;function Z_(e){return(e&z_)==Q_}var xe=["host","port","database","user","password"],Fs=xe.length,eE=xe[Fs-1];function ys(){var e=rt instanceof V_&&rt.writable===!0;if(e){var t=Array.prototype.slice.call(arguments).concat(`
`);rt.write(Si.format.apply(Si,t))}}Object.defineProperty(Le.exports,"isWin",{get:function(){return At},set:function(e){At=e}});Le.exports.warnTo=function(e){var t=rt;return rt=e,t};Le.exports.getFileName=function(e){var t=e||process.env,s=t.PGPASSFILE||(At?Ai.join(t.APPDATA||"./","postgresql","pgpass.conf"):Ai.join(t.HOME||"./",".pgpass"));return s};Le.exports.usePgPass=function(e,t){return Object.prototype.hasOwnProperty.call(process.env,"PGPASSWORD")?!1:At?!0:(t=t||"<unkn>",Z_(e.mode)?e.mode&(X_|J_)?(ys('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less',t),!1):!0:(ys('WARNING: password file "%s" is not a plain file',t),!1))};var tE=Le.exports.match=function(e,t){return xe.slice(0,-1).reduce(function(s,a,i){return i==1&&Number(e[a]||K_)===Number(t[a])?s&&!0:s&&(t[a]==="*"||t[a]===e[a])},!0)};Le.exports.getPassword=function(e,t,s){var a,i=!1,r=Y_({input:t,crlfDelay:1/0});function n(c){i=!0,t.destroy(),s(c)}function o(c){var l=sE(c);l&&aE(l)&&tE(e,l)&&(a=l[eE],r.close())}var E=function(){i||n(a)},_=function(c){i||(ys("WARNING: error on reading file: %s",c),n(void 0))};t.on("error",_),r.on("line",o).on("close",E).on("error",_)};var sE=Le.exports.parseLine=function(e){if(e.length<11||e.match(/^\s+#/))return null;for(var t="",s="",a=0,i=0,r=0,n={},o=!1,E=function(c,l,d){var u=e.substring(l,d);Object.hasOwnProperty.call(process.env,"PGPASS_NO_DEESCAPE")||(u=u.replace(/\\([:\\])/g,"$1")),n[xe[c]]=u},_=0;_<e.length-1;_+=1){if(t=e.charAt(_+1),s=e.charAt(_),o=a==Fs-1,o){E(a,i);break}_>=0&&t==":"&&s!=="\\"&&(E(a,i,_+1),i=_+2,a+=1)}return n=Object.keys(n).length===Fs?n:null,n},aE=Le.exports.isValidEntry=function(e){for(var t={0:function(n){return n.length>0},1:function(n){return n==="*"?!0:(n=Number(n),isFinite(n)&&n>0&&n<9007199254740992&&Math.floor(n)===n)},2:function(n){return n.length>0},3:function(n){return n.length>0},4:function(n){return n.length>0}},s=0;s<xe.length;s+=1){var a=t[s],i=e[xe[s]]||"",r=a(i);if(!r)return!1}return!0}});var Di=v((kl,js)=>{"use strict";var Ml=W("path"),gi=W("fs"),St=fi();js.exports=function(e,t){var s=St.getFileName();gi.stat(s,function(a,i){if(a||!St.usePgPass(i,s))return t(void 0);var r=gi.createReadStream(s);St.getPassword(e,r,t)})};js.exports.warnTo=St.warnTo});var Ci=v((wl,ji)=>{"use strict";var iE=W("events").EventEmitter,Fi=at(),Cs=za(),rE=Zt(),nE=ss(),yi=li(),oE=st(),_E=Ds(),EE=Qt(),ft=class extends iE{constructor(t){super(),this.connectionParameters=new nE(t),this.user=this.connectionParameters.user,this.database=this.connectionParameters.database,this.port=this.connectionParameters.port,this.host=this.connectionParameters.host,Object.defineProperty(this,"password",{configurable:!0,enumerable:!1,writable:!0,value:this.connectionParameters.password}),this.replication=this.connectionParameters.replication;var s=t||{};this._Promise=s.Promise||global.Promise,this._types=new rE(s.types),this._ending=!1,this._ended=!1,this._connecting=!1,this._connected=!1,this._connectionError=!1,this._queryable=!0,this.connection=s.connection||new _E({stream:s.stream,ssl:this.connectionParameters.ssl,keepAlive:s.keepAlive||!1,keepAliveInitialDelayMillis:s.keepAliveInitialDelayMillis||0,encoding:this.connectionParameters.client_encoding||"utf8"}),this.queryQueue=[],this.binary=s.binary||oE.binary,this.processID=null,this.secretKey=null,this.ssl=this.connectionParameters.ssl||!1,this.ssl&&this.ssl.key&&Object.defineProperty(this.ssl,"key",{enumerable:!1}),this._connectionTimeoutMillis=s.connectionTimeoutMillis||0}_errorAllQueries(t){let s=a=>{process.nextTick(()=>{a.handleError(t,this.connection)})};this.activeQuery&&(s(this.activeQuery),this.activeQuery=null),this.queryQueue.forEach(s),this.queryQueue.length=0}_connect(t){var s=this,a=this.connection;if(this._connectionCallback=t,this._connecting||this._connected){let i=new Error("Client has already been connected. You cannot reuse a client.");process.nextTick(()=>{t(i)});return}this._connecting=!0,this._connectionTimeoutMillis>0&&(this.connectionTimeoutHandle=setTimeout(()=>{a._ending=!0,a.stream.destroy(new Error("timeout expired"))},this._connectionTimeoutMillis)),this.host&&this.host.indexOf("/")===0?a.connect(this.host+"/.s.PGSQL."+this.port):a.connect(this.port,this.host),a.on("connect",function(){s.ssl?a.requestSsl():a.startup(s.getStartupConf())}),a.on("sslconnect",function(){a.startup(s.getStartupConf())}),this._attachListeners(a),a.once("end",()=>{let i=this._ending?new Error("Connection terminated"):new Error("Connection terminated unexpectedly");clearTimeout(this.connectionTimeoutHandle),this._errorAllQueries(i),this._ended=!0,this._ending||(this._connecting&&!this._connectionError?this._connectionCallback?this._connectionCallback(i):this._handleErrorEvent(i):this._connectionError||this._handleErrorEvent(i)),process.nextTick(()=>{this.emit("end")})})}connect(t){if(t){this._connect(t);return}return new this._Promise((s,a)=>{this._connect(i=>{i?a(i):s()})})}_attachListeners(t){t.on("authenticationCleartextPassword",this._handleAuthCleartextPassword.bind(this)),t.on("authenticationMD5Password",this._handleAuthMD5Password.bind(this)),t.on("authenticationSASL",this._handleAuthSASL.bind(this)),t.on("authenticationSASLContinue",this._handleAuthSASLContinue.bind(this)),t.on("authenticationSASLFinal",this._handleAuthSASLFinal.bind(this)),t.on("backendKeyData",this._handleBackendKeyData.bind(this)),t.on("error",this._handleErrorEvent.bind(this)),t.on("errorMessage",this._handleErrorMessage.bind(this)),t.on("readyForQuery",this._handleReadyForQuery.bind(this)),t.on("notice",this._handleNotice.bind(this)),t.on("rowDescription",this._handleRowDescription.bind(this)),t.on("dataRow",this._handleDataRow.bind(this)),t.on("portalSuspended",this._handlePortalSuspended.bind(this)),t.on("emptyQuery",this._handleEmptyQuery.bind(this)),t.on("commandComplete",this._handleCommandComplete.bind(this)),t.on("parseComplete",this._handleParseComplete.bind(this)),t.on("copyInResponse",this._handleCopyInResponse.bind(this)),t.on("copyData",this._handleCopyData.bind(this)),t.on("notification",this._handleNotification.bind(this))}_checkPgPass(t){let s=this.connection;if(typeof this.password=="function")this._Promise.resolve().then(()=>this.password()).then(a=>{if(a!==void 0){if(typeof a!="string"){s.emit("error",new TypeError("Password must be a string"));return}this.connectionParameters.password=this.password=a}else this.connectionParameters.password=this.password=null;t()}).catch(a=>{s.emit("error",a)});else if(this.password!==null)t();else try{Di()(this.connectionParameters,i=>{i!==void 0&&(this.connectionParameters.password=this.password=i),t()})}catch(a){this.emit("error",a)}}_handleAuthCleartextPassword(t){this._checkPgPass(()=>{this.connection.password(this.password)})}_handleAuthMD5Password(t){this._checkPgPass(async()=>{try{let s=await EE.postgresMd5PasswordHash(this.user,this.password,t.salt);this.connection.password(s)}catch(s){this.emit("error",s)}})}_handleAuthSASL(t){this._checkPgPass(()=>{try{this.saslSession=Cs.startSession(t.mechanisms),this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism,this.saslSession.response)}catch(s){this.connection.emit("error",s)}})}async _handleAuthSASLContinue(t){try{await Cs.continueSession(this.saslSession,this.password,t.data),this.connection.sendSCRAMClientFinalMessage(this.saslSession.response)}catch(s){this.connection.emit("error",s)}}_handleAuthSASLFinal(t){try{Cs.finalizeSession(this.saslSession,t.data),this.saslSession=null}catch(s){this.connection.emit("error",s)}}_handleBackendKeyData(t){this.processID=t.processID,this.secretKey=t.secretKey}_handleReadyForQuery(t){this._connecting&&(this._connecting=!1,this._connected=!0,clearTimeout(this.connectionTimeoutHandle),this._connectionCallback&&(this._connectionCallback(null,this),this._connectionCallback=null),this.emit("connect"));let{activeQuery:s}=this;this.activeQuery=null,this.readyForQuery=!0,s&&s.handleReadyForQuery(this.connection),this._pulseQueryQueue()}_handleErrorWhileConnecting(t){if(!this._connectionError){if(this._connectionError=!0,clearTimeout(this.connectionTimeoutHandle),this._connectionCallback)return this._connectionCallback(t);this.emit("error",t)}}_handleErrorEvent(t){if(this._connecting)return this._handleErrorWhileConnecting(t);this._queryable=!1,this._errorAllQueries(t),this.emit("error",t)}_handleErrorMessage(t){if(this._connecting)return this._handleErrorWhileConnecting(t);let s=this.activeQuery;if(!s){this._handleErrorEvent(t);return}this.activeQuery=null,s.handleError(t,this.connection)}_handleRowDescription(t){this.activeQuery.handleRowDescription(t)}_handleDataRow(t){this.activeQuery.handleDataRow(t)}_handlePortalSuspended(t){this.activeQuery.handlePortalSuspended(this.connection)}_handleEmptyQuery(t){this.activeQuery.handleEmptyQuery(this.connection)}_handleCommandComplete(t){if(this.activeQuery==null){let s=new Error("Received unexpected commandComplete message from backend.");this._handleErrorEvent(s);return}this.activeQuery.handleCommandComplete(t,this.connection)}_handleParseComplete(){if(this.activeQuery==null){let t=new Error("Received unexpected parseComplete message from backend.");this._handleErrorEvent(t);return}this.activeQuery.name&&(this.connection.parsedStatements[this.activeQuery.name]=this.activeQuery.text)}_handleCopyInResponse(t){this.activeQuery.handleCopyInResponse(this.connection)}_handleCopyData(t){this.activeQuery.handleCopyData(t,this.connection)}_handleNotification(t){this.emit("notification",t)}_handleNotice(t){this.emit("notice",t)}getStartupConf(){var t=this.connectionParameters,s={user:t.user,database:t.database},a=t.application_name||t.fallback_application_name;return a&&(s.application_name=a),t.replication&&(s.replication=""+t.replication),t.statement_timeout&&(s.statement_timeout=String(parseInt(t.statement_timeout,10))),t.lock_timeout&&(s.lock_timeout=String(parseInt(t.lock_timeout,10))),t.idle_in_transaction_session_timeout&&(s.idle_in_transaction_session_timeout=String(parseInt(t.idle_in_transaction_session_timeout,10))),t.options&&(s.options=t.options),s}cancel(t,s){if(t.activeQuery===s){var a=this.connection;this.host&&this.host.indexOf("/")===0?a.connect(this.host+"/.s.PGSQL."+this.port):a.connect(this.port,this.host),a.on("connect",function(){a.cancel(t.processID,t.secretKey)})}else t.queryQueue.indexOf(s)!==-1&&t.queryQueue.splice(t.queryQueue.indexOf(s),1)}setTypeParser(t,s,a){return this._types.setTypeParser(t,s,a)}getTypeParser(t,s){return this._types.getTypeParser(t,s)}escapeIdentifier(t){return Fi.escapeIdentifier(t)}escapeLiteral(t){return Fi.escapeLiteral(t)}_pulseQueryQueue(){if(this.readyForQuery===!0)if(this.activeQuery=this.queryQueue.shift(),this.activeQuery){this.readyForQuery=!1,this.hasExecuted=!0;let t=this.activeQuery.submit(this.connection);t&&process.nextTick(()=>{this.activeQuery.handleError(t,this.connection),this.readyForQuery=!0,this._pulseQueryQueue()})}else this.hasExecuted&&(this.activeQuery=null,this.emit("drain"))}query(t,s,a){var i,r,n,o,E;if(t==null)throw new TypeError("Client was passed a null or undefined query");return typeof t.submit=="function"?(n=t.query_timeout||this.connectionParameters.query_timeout,r=i=t,typeof s=="function"&&(i.callback=i.callback||s)):(n=t.query_timeout||this.connectionParameters.query_timeout,i=new yi(t,s,a),i.callback||(r=new this._Promise((_,c)=>{i.callback=(l,d)=>l?c(l):_(d)}).catch(_=>{throw Error.captureStackTrace(_),_}))),n&&(E=i.callback,o=setTimeout(()=>{var _=new Error("Query read timeout");process.nextTick(()=>{i.handleError(_,this.connection)}),E(_),i.callback=()=>{};var c=this.queryQueue.indexOf(i);c>-1&&this.queryQueue.splice(c,1),this._pulseQueryQueue()},n),i.callback=(_,c)=>{clearTimeout(o),E(_,c)}),this.binary&&!i.binary&&(i.binary=!0),i._result&&!i._result._types&&(i._result._types=this._types),this._queryable?this._ending?(process.nextTick(()=>{i.handleError(new Error("Client was closed and is not queryable"),this.connection)}),r):(this.queryQueue.push(i),this._pulseQueryQueue(),r):(process.nextTick(()=>{i.handleError(new Error("Client has encountered a connection error and is not queryable"),this.connection)}),r)}ref(){this.connection.ref()}unref(){this.connection.unref()}end(t){if(this._ending=!0,!this.connection._connecting||this._ended)if(t)t();else return this._Promise.resolve();if(this.activeQuery||!this._queryable?this.connection.stream.destroy():this.connection.end(),t)this.connection.once("end",t);else return new this._Promise(s=>{this.connection.once("end",s)})}};ft.Query=yi;ji.exports=ft});var Pi=v((Wl,Hi)=>{"use strict";var cE=W("events").EventEmitter,Us=function(){},Ui=(e,t)=>{let s=e.findIndex(t);return s===-1?void 0:e.splice(s,1)[0]},Hs=class{constructor(t,s,a){this.client=t,this.idleListener=s,this.timeoutId=a}},Be=class{constructor(t){this.callback=t}};function lE(){throw new Error("Release called on client which has already been released to the pool.")}function gt(e,t){if(t)return{callback:t,result:void 0};let s,a,i=function(n,o){n?s(n):a(o)},r=new e(function(n,o){a=n,s=o}).catch(n=>{throw Error.captureStackTrace(n),n});return{callback:i,result:r}}function dE(e,t){return function s(a){a.client=t,t.removeListener("error",s),t.on("error",()=>{e.log("additional client error after disconnection due to error",a)}),e._remove(t),e.emit("error",a,t)}}var Ps=class extends cE{constructor(t,s){super(),this.options=Object.assign({},t),t!=null&&"password"in t&&Object.defineProperty(this.options,"password",{configurable:!0,enumerable:!1,writable:!0,value:t.password}),t!=null&&t.ssl&&t.ssl.key&&Object.defineProperty(this.options.ssl,"key",{enumerable:!1}),this.options.max=this.options.max||this.options.poolSize||10,this.options.min=this.options.min||0,this.options.maxUses=this.options.maxUses||1/0,this.options.allowExitOnIdle=this.options.allowExitOnIdle||!1,this.options.maxLifetimeSeconds=this.options.maxLifetimeSeconds||0,this.log=this.options.log||function(){},this.Client=this.options.Client||s||Ms().Client,this.Promise=this.options.Promise||global.Promise,typeof this.options.idleTimeoutMillis>"u"&&(this.options.idleTimeoutMillis=1e4),this._clients=[],this._idle=[],this._expired=new WeakSet,this._pendingQueue=[],this._endCallback=void 0,this.ending=!1,this.ended=!1}_promiseTry(t){let s=this.Promise;return typeof s.try=="function"?s.try(t):new s(a=>a(t()))}_isFull(){return this._clients.length>=this.options.max}_isAboveMin(){return this._clients.length>this.options.min}_pulseQueue(){if(this.log("pulse queue"),this.ended){this.log("pulse queue ended");return}if(this.ending){this.log("pulse queue on ending"),this._idle.length&&this._idle.slice().map(s=>{this._remove(s.client)}),this._clients.length||(this.ended=!0,this._endCallback());return}if(!this._pendingQueue.length){this.log("no queued requests");return}if(!this._idle.length&&this._isFull())return;let t=this._pendingQueue.shift();if(this._idle.length){let s=this._idle.pop();clearTimeout(s.timeoutId);let a=s.client;a.ref&&a.ref();let i=s.idleListener;return this._acquireClient(a,t,i,!1)}if(!this._isFull())return this.newClient(t);throw new Error("unexpected condition")}_remove(t,s){let a=Ui(this._idle,r=>r.client===t);a!==void 0&&clearTimeout(a.timeoutId),this._clients=this._clients.filter(r=>r!==t);let i=this;t.end(()=>{i.emit("remove",t),typeof s=="function"&&s()})}connect(t){if(this.ending){let i=new Error("Cannot use a pool after calling end on the pool");return t?t(i):this.Promise.reject(i)}let s=gt(this.Promise,t),a=s.result;if(this._isFull()||this._idle.length){if(this._idle.length&&process.nextTick(()=>this._pulseQueue()),!this.options.connectionTimeoutMillis)return this._pendingQueue.push(new Be(s.callback)),a;let i=(o,E,_)=>{clearTimeout(n),s.callback(o,E,_)},r=new Be(i),n=setTimeout(()=>{Ui(this._pendingQueue,o=>o.callback===i),r.timedOut=!0,s.callback(new Error("timeout exceeded when trying to connect"))},this.options.connectionTimeoutMillis);return n.unref&&n.unref(),this._pendingQueue.push(r),a}return this.newClient(new Be(s.callback)),a}newClient(t){let s=new this.Client(this.options);this._clients.push(s);let a=dE(this,s);this.log("checking client timeout");let i,r=!1;this.options.connectionTimeoutMillis&&(i=setTimeout(()=>{s.connection?(this.log("ending client due to timeout"),r=!0,s.connection.stream.destroy()):s.isConnected()||(this.log("ending client due to timeout"),r=!0,s.end())},this.options.connectionTimeoutMillis)),this.log("connecting new client"),s.connect(n=>{if(i&&clearTimeout(i),s.on("error",a),n)this.log("client failed to connect",n),this._clients=this._clients.filter(o=>o!==s),r&&(n=new Error("Connection terminated due to connection timeout",{cause:n})),this._pulseQueue(),t.timedOut||t.callback(n,void 0,Us);else{if(this.log("new client connected"),this.options.onConnect){this._promiseTry(()=>this.options.onConnect(s)).then(()=>{this._afterConnect(s,t,a)},o=>{this._clients=this._clients.filter(E=>E!==s),s.end(()=>{this._pulseQueue(),t.timedOut||t.callback(o,void 0,Us)})});return}return this._afterConnect(s,t,a)}})}_afterConnect(t,s,a){if(this.options.maxLifetimeSeconds!==0){let i=setTimeout(()=>{this.log("ending client due to expired lifetime"),this._expired.add(t),this._idle.findIndex(n=>n.client===t)!==-1&&this._acquireClient(t,new Be((n,o,E)=>E()),a,!1)},this.options.maxLifetimeSeconds*1e3);i.unref(),t.once("end",()=>clearTimeout(i))}return this._acquireClient(t,s,a,!0)}_acquireClient(t,s,a,i){i&&this.emit("connect",t),this.emit("acquire",t),t.release=this._releaseOnce(t,a),t.removeListener("error",a),s.timedOut?i&&this.options.verify?this.options.verify(t,t.release):t.release():i&&this.options.verify?this.options.verify(t,r=>{if(r)return t.release(r),s.callback(r,void 0,Us);s.callback(void 0,t,t.release)}):s.callback(void 0,t,t.release)}_releaseOnce(t,s){let a=!1;return i=>{a&&lE(),a=!0,this._release(t,s,i)}}_release(t,s,a){if(t.on("error",s),t._poolUseCount=(t._poolUseCount||0)+1,this.emit("release",a,t),a||this.ending||!t._queryable||t._ending||t._poolUseCount>=this.options.maxUses)return t._poolUseCount>=this.options.maxUses&&this.log("remove expended client"),this._remove(t,this._pulseQueue.bind(this));if(this._expired.has(t))return this.log("remove expired client"),this._expired.delete(t),this._remove(t,this._pulseQueue.bind(this));let r;this.options.idleTimeoutMillis&&this._isAboveMin()&&(r=setTimeout(()=>{this._isAboveMin()&&(this.log("remove idle client"),this._remove(t,this._pulseQueue.bind(this)))},this.options.idleTimeoutMillis),this.options.allowExitOnIdle&&r.unref()),this.options.allowExitOnIdle&&t.unref(),this._idle.push(new Hs(t,s,r)),this._pulseQueue()}query(t,s,a){if(typeof t=="function"){let r=gt(this.Promise,t);return setImmediate(function(){return r.callback(new Error("Passing a function as the first parameter to pool.query is not supported"))}),r.result}typeof s=="function"&&(a=s,s=void 0);let i=gt(this.Promise,a);return a=i.callback,this.connect((r,n)=>{if(r)return a(r);let o=!1,E=_=>{o||(o=!0,n.release(_),a(_))};n.once("error",E),this.log("dispatching query");try{n.query(t,s,(_,c)=>{if(this.log("query dispatched"),n.removeListener("error",E),!o)return o=!0,n.release(_),_?a(_):a(void 0,c)})}catch(_){return n.release(_),a(_)}}),i.result}end(t){if(this.log("ending"),this.ending){let a=new Error("Called end on pool more than once");return t?t(a):this.Promise.reject(a)}this.ending=!0;let s=gt(this.Promise,t);return this._endCallback=s.callback,this._pulseQueue(),s.result}get waitingCount(){return this._pendingQueue.length}get idleCount(){return this._idle.length}get expiredCount(){return this._clients.reduce((t,s)=>t+(this._expired.has(s)?1:0),0)}get totalCount(){return this._clients.length}};Hi.exports=Ps});var wi=v((xl,ki)=>{"use strict";var Mi=W("events").EventEmitter,uE=W("util"),ks=at(),Ge=ki.exports=function(e,t,s){Mi.call(this),e=ks.normalizeQueryConfig(e,t,s),this.text=e.text,this.values=e.values,this.name=e.name,this.queryMode=e.queryMode,this.callback=e.callback,this.state="new",this._arrayMode=e.rowMode==="array",this._emitRowEvents=!1,this.on("newListener",function(a){a==="row"&&(this._emitRowEvents=!0)}.bind(this))};uE.inherits(Ge,Mi);var NE={sqlState:"code",statementPosition:"position",messagePrimary:"message",context:"where",schemaName:"schema",tableName:"table",columnName:"column",dataTypeName:"dataType",constraintName:"constraint",sourceFile:"file",sourceLine:"line",sourceFunction:"routine"};Ge.prototype.handleError=function(e){var t=this.native.pq.resultErrorFields();if(t)for(var s in t){var a=NE[s]||s;e[a]=t[s]}this.callback?this.callback(e):this.emit("error",e),this.state="error"};Ge.prototype.then=function(e,t){return this._getPromise().then(e,t)};Ge.prototype.catch=function(e){return this._getPromise().catch(e)};Ge.prototype._getPromise=function(){return this._promise?this._promise:(this._promise=new Promise(function(e,t){this._once("end",e),this._once("error",t)}.bind(this)),this._promise)};Ge.prototype.submit=function(e){this.state="running";var t=this;this.native=e.native,e.native.arrayMode=this._arrayMode;var s=function(r,n,o){if(e.native.arrayMode=!1,setImmediate(function(){t.emit("_done")}),r)return t.handleError(r);t._emitRowEvents&&(o.length>1?n.forEach((E,_)=>{E.forEach(c=>{t.emit("row",c,o[_])})}):n.forEach(function(E){t.emit("row",E,o)})),t.state="end",t.emit("end",o),t.callback&&t.callback(null,o)};if(process.domain&&(s=process.domain.bind(s)),this.name){this.name.length>63&&(console.error("Warning! Postgres only supports 63 characters for query names."),console.error("You supplied %s (%s)",this.name,this.name.length),console.error("This can cause conflicts and silent errors executing queries"));var a=(this.values||[]).map(ks.prepareValue);if(e.namedQueries[this.name]){if(this.text&&e.namedQueries[this.name]!==this.text){let r=new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);return s(r)}return e.native.execute(this.name,a,s)}return e.native.prepare(this.name,this.text,a.length,function(r){return r?s(r):(e.namedQueries[t.name]=t.text,t.native.execute(t.name,a,s))})}else if(this.values){if(!Array.isArray(this.values)){let r=new Error("Query values must be an array");return s(r)}var i=this.values.map(ks.prepareValue);e.native.query(this.text,i,s)}else this.queryMode==="extended"?e.native.query(this.text,[],s):e.native.query(this.text,s)}});var qi=v((Bl,Gi)=>{"use strict";var Wi;try{Wi=W("pg-native")}catch(e){throw e}var pE=Zt(),xi=W("events").EventEmitter,TE=W("util"),mE=ss(),Bi=wi(),re=Gi.exports=function(e){xi.call(this),e=e||{},this._Promise=e.Promise||global.Promise,this._types=new pE(e.types),this.native=new Wi({types:this._types}),this._queryQueue=[],this._ending=!1,this._connecting=!1,this._connected=!1,this._queryable=!0;var t=this.connectionParameters=new mE(e);e.nativeConnectionString&&(t.nativeConnectionString=e.nativeConnectionString),this.user=t.user,Object.defineProperty(this,"password",{configurable:!0,enumerable:!1,writable:!0,value:t.password}),this.database=t.database,this.host=t.host,this.port=t.port,this.namedQueries={}};re.Query=Bi;TE.inherits(re,xi);re.prototype._errorAllQueries=function(e){let t=s=>{process.nextTick(()=>{s.native=this.native,s.handleError(e)})};this._hasActiveQuery()&&(t(this._activeQuery),this._activeQuery=null),this._queryQueue.forEach(t),this._queryQueue.length=0};re.prototype._connect=function(e){var t=this;if(this._connecting){process.nextTick(()=>e(new Error("Client has already been connected. You cannot reuse a client.")));return}this._connecting=!0,this.connectionParameters.getLibpqConnectionString(function(s,a){if(t.connectionParameters.nativeConnectionString&&(a=t.connectionParameters.nativeConnectionString),s)return e(s);t.native.connect(a,function(i){if(i)return t.native.end(),e(i);t._connected=!0,t.native.on("error",function(r){t._queryable=!1,t._errorAllQueries(r),t.emit("error",r)}),t.native.on("notification",function(r){t.emit("notification",{channel:r.relname,payload:r.extra})}),t.emit("connect"),t._pulseQueryQueue(!0),e()})})};re.prototype.connect=function(e){if(e){this._connect(e);return}return new this._Promise((t,s)=>{this._connect(a=>{a?s(a):t()})})};re.prototype.query=function(e,t,s){var a,i,r,n,o;if(e==null)throw new TypeError("Client was passed a null or undefined query");if(typeof e.submit=="function")r=e.query_timeout||this.connectionParameters.query_timeout,i=a=e,typeof t=="function"&&(e.callback=t);else if(r=e.query_timeout||this.connectionParameters.query_timeout,a=new Bi(e,t,s),!a.callback){let E,_;i=new this._Promise((c,l)=>{E=c,_=l}).catch(c=>{throw Error.captureStackTrace(c),c}),a.callback=(c,l)=>c?_(c):E(l)}return r&&(o=a.callback,n=setTimeout(()=>{var E=new Error("Query read timeout");process.nextTick(()=>{a.handleError(E,this.connection)}),o(E),a.callback=()=>{};var _=this._queryQueue.indexOf(a);_>-1&&this._queryQueue.splice(_,1),this._pulseQueryQueue()},r),a.callback=(E,_)=>{clearTimeout(n),o(E,_)}),this._queryable?this._ending?(a.native=this.native,process.nextTick(()=>{a.handleError(new Error("Client was closed and is not queryable"))}),i):(this._queryQueue.push(a),this._pulseQueryQueue(),i):(a.native=this.native,process.nextTick(()=>{a.handleError(new Error("Client has encountered a connection error and is not queryable"))}),i)};re.prototype.end=function(e){var t=this;this._ending=!0,this._connected||this.once("connect",this.end.bind(this,e));var s;return e||(s=new this._Promise(function(a,i){e=r=>r?i(r):a()})),this.native.end(function(){t._errorAllQueries(new Error("Connection terminated")),process.nextTick(()=>{t.emit("end"),e&&e()})}),s};re.prototype._hasActiveQuery=function(){return this._activeQuery&&this._activeQuery.state!=="error"&&this._activeQuery.state!=="end"};re.prototype._pulseQueryQueue=function(e){if(this._connected&&!this._hasActiveQuery()){var t=this._queryQueue.shift();if(!t){e||this.emit("drain");return}this._activeQuery=t,t.submit(this);var s=this;t.once("_done",function(){s._pulseQueryQueue()})}};re.prototype.cancel=function(e){this._activeQuery===e?this.native.cancel(function(){}):this._queryQueue.indexOf(e)!==-1&&this._queryQueue.splice(this._queryQueue.indexOf(e),1)};re.prototype.ref=function(){};re.prototype.unref=function(){};re.prototype.setTypeParser=function(e,t,s){return this._types.setTypeParser(e,t,s)};re.prototype.getTypeParser=function(e,t){return this._types.getTypeParser(e,t)}});var ws=v((Gl,$i)=>{"use strict";$i.exports=qi()});var Ms=v(($l,nt)=>{"use strict";var RE=Ci(),vE=st(),bE=Ds(),IE=Pi(),{DatabaseError:OE}=Ss(),{escapeIdentifier:LE,escapeLiteral:hE}=at(),AE=e=>class extends IE{constructor(s){super(s,e)}},Ws=function(e){this.defaults=vE,this.Client=e,this.Query=this.Client.Query,this.Pool=AE(this.Client),this._pools=[],this.Connection=bE,this.types=tt(),this.DatabaseError=OE,this.escapeIdentifier=LE,this.escapeLiteral=hE};typeof process.env.NODE_PG_FORCE_NATIVE<"u"?nt.exports=new Ws(ws()):(nt.exports=new Ws(RE),Object.defineProperty(nt.exports,"native",{configurable:!0,enumerable:!1,get(){var e=null;try{e=new Ws(ws())}catch(t){if(t.code!=="MODULE_NOT_FOUND")throw t}return Object.defineProperty(nt.exports,"native",{value:e}),e}}))});import{createHash as qc,randomUUID as $c}from"node:crypto";import{gzipSync as Vc}from"node:zlib";var jr=mn(Ms(),1);var Vi=`-- JAIN STOCK EXCHANGE (JSE) v272
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
`;var Yi=`-- JAIN STOCK EXCHANGE (JSE) v311
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
`;var Ki=`-- JAIN STOCK EXCHANGE (JSE) v311
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
-- Per-team initial capital, so BIG BULL can start at \u20B91 crore without changing normal teams.
ALTER TABLE teams ADD COLUMN IF NOT EXISTS initial_capital numeric(16,2);
UPDATE teams SET initial_capital=(SELECT initial_capital FROM event_config WHERE id=1) WHERE initial_capital IS NULL;
ALTER TABLE teams ALTER COLUMN initial_capital SET DEFAULT 2000000;
ALTER TABLE teams ALTER COLUMN initial_capital SET NOT NULL;

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
  IF v_qty % 50 <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' normal market trading uses multiples of 50 shares (50, 100, 150 \u2026).', 400);
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
  IF o.quantity <= 0 OR o.quantity % 50 <> 0 THEN
    RETURN jse__bank_reject(a, o, 'INVALID_LOT', 'Normal market trading requires a multiple of 50 shares.', '{}'::jsonb);
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
`;var Xi=`-- JAIN STOCK EXCHANGE (JSE) v3.13
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
  IF v_qty IS NULL OR v_qty <= 0 OR v_qty % 50 <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' normal market trading uses multiples of 50 shares.', 400);
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
    IF v_qty IS NULL OR v_qty <= 0 OR v_qty % 50 <> 0 THEN
      PERFORM jse_fail('INVALID_LOT', 'Normal market instructions must be a multiple of 50 shares.', 400);
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
`;var Ji=`-- JAIN STOCK EXCHANGE (JSE) v311
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
              coalesce(t.initial_capital, cfg.initial_capital) AS initial_capital, cfg.cash_rule_limit, ev.status AS event_status
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
`;var zi=`-- JAIN STOCK EXCHANGE (JSE) v311
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
`;var Qi=`-- JAIN STOCK EXCHANGE (JSE) v311
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
`;var Zi=`-- JAIN STOCK EXCHANGE (JSE) v311
-- 007_tuning.sql: safety timeouts for this database (re-applicable).
DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I SET statement_timeout = %L', current_database(), '20s');
  EXECUTE format('ALTER DATABASE %I SET idle_in_transaction_session_timeout = %L', current_database(), '60s');
  EXECUTE format('ALTER DATABASE %I SET lock_timeout = %L', current_database(), '10s');
END $$;
ANALYZE;
`;var er=`-- JAIN STOCK EXCHANGE (JSE) v311
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
`;var tr=`-- JAIN STOCK EXCHANGE (JSE) v3.13
-- 009_hatchable.sql: one-time data changes to match the live Hatchable application (applied once).
--   * Market News moves are priced to the paisa, as on Hatchable (e.g. \u20B91,714.55); base prices stay whole rupees.
UPDATE event_config SET price_tick = 0.01 WHERE id = 1 AND price_tick = 1;

--   * IPO shares on offer, as the live IPO master shows them (remaining = offered \u2212 allotted)
UPDATE securities SET ipo_shares_offered = v.q
FROM (VALUES ('VOLTRA', 100000), ('BLUEAI', 80000), ('SHREEB', 120000), ('AAROGYA', 60000)) AS v(sym, q)
WHERE securities.symbol = v.sym AND securities.kind = 'IPO' AND securities.ipo_shares_offered IS NULL;

INSERT INTO schema_migrations(version) VALUES ('009_hatchable');
`;var sr=`-- JAIN STOCK EXCHANGE (JSE) v3.14
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
`;var ar=`-- v272 targeted roster and IPO administration additions.
-- Additive only: preserve existing tables, data, routes and financial history.

ALTER TABLE securities ADD COLUMN IF NOT EXISTS ipo_lot_size integer NOT NULL DEFAULT 50 CHECK (ipo_lot_size > 0);

CREATE TABLE IF NOT EXISTS ipo_allotment_draws (
  id                 bigserial PRIMARY KEY,
  security_id        integer NOT NULL REFERENCES securities(id),
  status             text NOT NULL DEFAULT 'GENERATED'
                     CHECK (status IN ('GENERATED','VERIFIED','APPROVED','FINALIZED','CANCELLED')),
  available_shares   integer NOT NULL CHECK (available_shares >= 0),
  available_lots     integer NOT NULL CHECK (available_lots >= 0),
  requested_lots     integer NOT NULL DEFAULT 0 CHECK (requested_lots >= 0),
  subscription_ratio numeric(14,4),
  algorithm_version  text NOT NULL DEFAULT 'RANDOM_ROUND_ROBIN_V1',
  inventory_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_by       text,
  generated_at       timestamptz NOT NULL DEFAULT now(),
  verified_by        text,
  verified_at        timestamptz,
  approved_by        text,
  approved_at        timestamptz,
  finalized_by       text,
  finalized_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ipo_allotment_draws_security_idx ON ipo_allotment_draws(security_id, id DESC);

CREATE TABLE IF NOT EXISTS ipo_allotment_draw_items (
  id                 bigserial PRIMARY KEY,
  draw_id            bigint NOT NULL REFERENCES ipo_allotment_draws(id),
  application_id     bigint NOT NULL,
  team_id            integer NOT NULL REFERENCES teams(id),
  team_code          text NOT NULL,
  team_name          text NOT NULL,
  draw_position      integer NOT NULL CHECK (draw_position > 0),
  requested_lots     integer NOT NULL CHECK (requested_lots > 0),
  allotted_lots      integer NOT NULL DEFAULT 0 CHECK (allotted_lots >= 0 AND allotted_lots <= requested_lots),
  lot_size           integer NOT NULL CHECK (lot_size > 0),
  application_price  numeric(12,2) NOT NULL CHECK (application_price > 0),
  rounds             integer[] NOT NULL DEFAULT '{}',
  UNIQUE (draw_id, application_id),
  UNIQUE (draw_id, draw_position)
);
CREATE INDEX IF NOT EXISTS ipo_allotment_draw_items_order_idx ON ipo_allotment_draw_items(draw_id, draw_position);

-- Official Dalal Street broker aliases map the uploaded Broker Number/Code/Name to existing internal desks.
-- Internal BROKER-XX identifiers remain untouched, so logins and historical records are preserved.
CREATE TABLE IF NOT EXISTS broker_roster_aliases (
  broker_number       integer PRIMARY KEY CHECK (broker_number > 0),
  broker_code         text NOT NULL UNIQUE,
  broker_name         text NOT NULL,
  internal_broker_id  integer REFERENCES brokers(id)
);
INSERT INTO broker_roster_aliases(broker_number,broker_code,broker_name,internal_broker_id) VALUES
  (1,'Prajna','M Manoj',(SELECT id FROM brokers WHERE code='BROKER-09')),
  (2,'Ganita','Harsha G',(SELECT id FROM brokers WHERE code='BROKER-05')),
  (3,'Amrit','Nehaa',(SELECT id FROM brokers WHERE code='BROKER-04')),
  (4,'Vikas','Vikash',(SELECT id FROM brokers WHERE code='BROKER-01')),
  (5,'Yash','Gokul Krishna',(SELECT id FROM brokers WHERE code='BROKER-02')),
  (6,'Arohan','Aman',(SELECT id FROM brokers WHERE code='BROKER-06')),
  (7,'Madhava','Mayur G',(SELECT id FROM brokers WHERE code='BROKER-03')),
  (8,'Vidura','Bhavani Reddy',(SELECT id FROM brokers WHERE code='BROKER-07')),
  (9,'Kalidasa','Varun SB',(SELECT id FROM brokers WHERE code='BROKER-08')),
  (10,'Suvarna','Sujatha',(SELECT id FROM brokers WHERE code='BROKER-10'))
ON CONFLICT (broker_number) DO UPDATE SET
  broker_code=EXCLUDED.broker_code,
  broker_name=EXCLUDED.broker_name,
  internal_broker_id=coalesce(broker_roster_aliases.internal_broker_id,EXCLUDED.internal_broker_id);

-- Five-column roster importer. This only updates the canonical broker assignment on existing teams.
CREATE OR REPLACE FUNCTION jse_import_roster_assignments(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  r jsonb;
  x jsonb;
  v_i integer := 0;
  v_team_no integer;
  v_broker_no integer;
  v_team_code text;
  v_broker_code text;
  v_broker_name text;
  t teams%ROWTYPE;
  b brokers%ROWTYPE;
  v_alias broker_roster_aliases%ROWTYPE;
  v_plan jsonb := '[]'::jsonb;
  v_errors jsonb := '[]'::jsonb;
  v_changed integer := 0;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;
  -- Follow the existing team editor's policy: broker assignments can be changed without resetting team IDs or names.
  -- The import changes only teams.broker_id and never touches historical orders or financial records.
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN
    PERFORM jse_fail('NO_ROWS', 'No roster rows were supplied.', 400);
  END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    BEGIN v_team_no := nullif(trim(r->>'team_number'), '')::integer; EXCEPTION WHEN others THEN v_team_no := NULL; END;
    BEGIN v_broker_no := nullif(trim(r->>'broker_number'), '')::integer; EXCEPTION WHEN others THEN v_broker_no := NULL; END;
    v_team_code := upper(trim(coalesce(r->>'team_code', '')));
    v_broker_code := upper(trim(coalesce(r->>'broker_code', '')));
    v_broker_name := trim(coalesce(r->>'broker_name', ''));
    IF v_team_no IS NULL OR v_team_no <= 0 THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Team Number must be a positive whole number'); CONTINUE;
    END IF;
    IF v_broker_no IS NULL OR v_broker_no <= 0 THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Broker Number must be a positive whole number'); CONTINUE;
    END IF;
    IF v_team_code = '' OR v_broker_code = '' OR v_broker_name = '' THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Team Code, Broker Code and Broker Name are required'); CONTINUE;
    END IF;
    SELECT * INTO t FROM teams WHERE code = v_team_code;
    IF NOT FOUND THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown Team Code ' || v_team_code); CONTINUE;
    END IF;
    IF t.seq <> v_team_no THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Team Number ' || v_team_no || ' does not match ' || v_team_code || ' (registered number ' || t.seq || ')'); CONTINUE;
    END IF;
    SELECT * INTO v_alias FROM broker_roster_aliases
    WHERE broker_number=v_broker_no AND upper(broker_code)=v_broker_code AND lower(btrim(broker_name))=lower(btrim(v_broker_name));
    IF NOT FOUND THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Broker Number, Broker Code and Broker Name do not match the official broker roster'); CONTINUE;
    END IF;
    SELECT * INTO b FROM brokers WHERE id=v_alias.internal_broker_id AND active;
    IF NOT FOUND THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'The official broker ' || v_alias.broker_code || ' has no active internal broker desk mapping'); CONTINUE;
    END IF;
    v_plan := v_plan || jsonb_build_object('team_id', t.id, 'team_number', t.seq, 'team_code', t.code,
      'broker_id', b.id, 'broker_number', v_broker_no, 'broker_code', v_alias.broker_code, 'broker_name', v_alias.broker_name,
      'before_broker_id', t.broker_id,
      'before_broker_code', (SELECT broker_code FROM broker_roster_aliases WHERE internal_broker_id=t.broker_id LIMIT 1));
  END LOOP;

  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    IF (SELECT count(*) FROM jsonb_array_elements(v_plan) e WHERE e->>'team_code' = x->>'team_code') > 1 THEN
      v_errors := v_errors || jsonb_build_object('row', NULL, 'error', (x->>'team_code') || ' appears more than once in the file');
      EXIT;
    END IF;
  END LOOP;
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'ROSTER_ERRORS',
      'error', 'Nothing was saved. Fix the rows listed and import again.', 'errors', v_errors, 'http', 400);
  END IF;
  IF coalesce((p->>'dry_run')::boolean, false) THEN
    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_plan), 'preview', v_plan);
  END IF;

  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    UPDATE teams SET broker_id = (x->>'broker_id')::integer, updated_at = now()
    WHERE id = (x->>'team_id')::integer AND broker_id IS DISTINCT FROM (x->>'broker_id')::integer;
    IF FOUND THEN
      v_changed := v_changed + 1;
      PERFORM jse_audit(a, 'TEAM_BROKER_ASSIGNMENT_IMPORTED', 'team', x->>'team_code',
        (x->>'team_id')::integer, NULL,
        jsonb_build_object('broker_code', x->>'before_broker_code'),
        jsonb_build_object('broker_code', x->>'broker_code', 'broker_number', x->>'broker_number'),
        jsonb_build_object('import', true, 'team_number', x->>'team_number'));
    END IF;
  END LOOP;
  PERFORM jse_audit(a, 'ROSTER_ASSIGNMENTS_IMPORTED', 'team', NULL, NULL, NULL, NULL, NULL,
    jsonb_build_object('rows', jsonb_array_length(v_plan), 'changed', v_changed));
  RETURN jsonb_build_object('success', true, 'rows', jsonb_array_length(v_plan), 'updated', jsonb_array_length(v_plan), 'changed', v_changed);
END $$;

-- Company/base-price import. Ticker is the stable key; this deliberately does not change live prices.
CREATE OR REPLACE FUNCTION jse_import_companies(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  r jsonb;
  x jsonb;
  v_i integer := 0;
  v_status text;
  v_ticker text;
  v_name text;
  v_price numeric;
  s securities%ROWTYPE;
  v_plan jsonb := '[]'::jsonb;
  v_errors jsonb := '[]'::jsonb;
  v_changed integer := 0;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;
  SELECT status INTO v_status FROM event_control WHERE id=1;
  IF v_status <> 'NOT_STARTED' AND NOT coalesce((p->>'dry_run')::boolean, false) THEN
    PERFORM jse_fail('EVENT_STARTED', 'Company/base-price imports can be saved only before the event starts.', 409);
  END IF;
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM 1 FROM event_control WHERE id=1 FOR UPDATE; END IF;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN
    PERFORM jse_fail('NO_ROWS', 'No company rows were supplied.', 400);
  END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    v_ticker := upper(trim(coalesce(r->>'ticker', '')));
    v_name := trim(coalesce(r->>'name', ''));
    BEGIN v_price := (r->>'base_price')::numeric; EXCEPTION WHEN others THEN v_price := NULL; END;
    IF v_ticker = '' OR v_name = '' THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Company Name and Ticker are required'); CONTINUE;
    END IF;
    IF v_ticker !~ '^[A-Z0-9][A-Z0-9._-]{0,19}$' THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Ticker must use 1\u201320 letters, numbers, dots, underscores or hyphens'); CONTINUE;
    END IF;
    IF v_price IS NULL OR v_price <= 0 OR v_price <> trunc(v_price) THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Base Price must be a positive whole number'); CONTINUE;
    END IF;
    IF length(v_name) > 160 THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Company Name must be 160 characters or fewer'); CONTINUE;
    END IF;
    SELECT * INTO s FROM securities WHERE symbol = v_ticker;
    IF NOT FOUND THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Ticker ' || v_ticker || ' does not exist in the current securities list. Add it through the existing company/IPO setup first.'); CONTINUE;
    END IF;
    v_plan := v_plan || jsonb_build_object('id', s.id, 'ticker', s.symbol, 'name', v_name, 'base_price', v_price,
      'before_name', s.name, 'before_base_price', s.base_price, 'kind', s.kind);
  END LOOP;
  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    IF (SELECT count(*) FROM jsonb_array_elements(v_plan) e WHERE e->>'ticker' = x->>'ticker') > 1 THEN
      v_errors := v_errors || jsonb_build_object('row', NULL, 'error', (x->>'ticker') || ' appears more than once in the file');
      EXIT;
    END IF;
  END LOOP;
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'COMPANY_IMPORT_ERRORS',
      'error', 'Nothing was saved. Fix the rows listed and import again.', 'errors', v_errors, 'http', 400);
  END IF;
  IF coalesce((p->>'dry_run')::boolean, false) THEN
    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_plan), 'preview', v_plan);
  END IF;
  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    UPDATE securities SET name = x->>'name', base_price = (x->>'base_price')::numeric, updated_at = now()
    WHERE id = (x->>'id')::integer
      AND (name IS DISTINCT FROM x->>'name' OR base_price IS DISTINCT FROM (x->>'base_price')::numeric);
    IF FOUND THEN
      v_changed := v_changed + 1;
      PERFORM jse_audit(a, 'COMPANY_BASE_PRICE_IMPORTED', 'security', x->>'ticker', NULL, NULL,
        jsonb_build_object('name', x->>'before_name', 'base_price', x->>'before_base_price'),
        jsonb_build_object('name', x->>'name', 'base_price', x->>'base_price'),
        jsonb_build_object('kind', x->>'kind', 'live_price_unchanged', true));
    END IF;
  END LOOP;
  PERFORM jse_audit(a, 'COMPANY_BASE_PRICES_IMPORTED', 'security', NULL, NULL, NULL, NULL, NULL,
    jsonb_build_object('rows', jsonb_array_length(v_plan), 'changed', v_changed, 'live_prices_changed', false));
  RETURN jsonb_build_object('success', true, 'rows', jsonb_array_length(v_plan), 'updated', jsonb_array_length(v_plan), 'changed', v_changed);
END $$;

-- Admin-only IPO tool: persistent random draw, verification, approval, idempotent issuance, and issue-size editing.
CREATE OR REPLACE FUNCTION jse_ipo_admin_tool(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action',''), 'STATE'));
  v_ipo text := upper(trim(coalesce(p->>'ipo','')));
  v_status text;
  v_event_status text;
  s securities%ROWTYPE;
  d ipo_allotment_draws%ROWTYPE;
  ap ipo_applications%ROWTYPE;
  al ipo_allotments%ROWTYPE;
  x record;
  v_issued integer;
  v_remaining integer;
  v_available_lots integer;
  v_requested integer := 0;
  v_position integer := 0;
  v_round integer := 1;
  v_left integer := 0;
  v_progress boolean;
  v_count integer := 0;
  v_total_shares integer := 0;
  v_total_amount numeric := 0;
  v_new_size numeric;
  v_new_shares integer;
  v_unit text;
  v_reason text;
  v_draw_id bigint;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF v_action <> 'STATE' THEN PERFORM jse_require_admin_password(a, p); END IF;

  IF v_action = 'STATE' THEN
    IF v_ipo <> '' THEN
      SELECT * INTO s FROM securities WHERE kind = 'IPO' AND active AND (symbol = v_ipo OR ipo_code = v_ipo);
      IF NOT FOUND THEN PERFORM jse_fail('IPO_NOT_FOUND', 'Choose an existing IPO.', 404); END IF;
      SELECT * INTO d FROM ipo_allotment_draws WHERE security_id = s.id ORDER BY id DESC LIMIT 1;
    END IF;
    RETURN jsonb_build_object(
      'success', true,
      'ipos', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'symbol', sec.symbol, 'ipo_code', sec.ipo_code, 'name', sec.name, 'price', sec.base_price, 'live_price', sec.price,
        'lot_size', sec.ipo_lot_size, 'offered', sec.ipo_shares_offered,
        'issued', (SELECT coalesce(sum(ia.quantity),0) FROM ipo_allotments ia WHERE ia.security_id=sec.id AND ia.reversed_at IS NULL),
        'remaining', CASE WHEN sec.ipo_shares_offered IS NULL THEN NULL ELSE sec.ipo_shares_offered -
          (SELECT coalesce(sum(ia.quantity),0) FROM ipo_allotments ia WHERE ia.security_id=sec.id AND ia.reversed_at IS NULL) END,
        'applications', (SELECT count(*) FROM ipo_applications ia WHERE ia.security_id=sec.id AND ia.status='APPLIED'),
        'application_rows', (SELECT count(*) FROM ipo_applications ia WHERE ia.security_id=sec.id),
        'applied_lots', (SELECT coalesce(sum(ia.lots),0) FROM ipo_applications ia WHERE ia.security_id=sec.id AND ia.status='APPLIED'),
        'stage', jse_ipo_stage(sec.id),
        'latest_draw_status', (SELECT dd.status FROM ipo_allotment_draws dd WHERE dd.security_id=sec.id ORDER BY dd.id DESC LIMIT 1)
      ) ORDER BY sec.display_order, sec.id) FROM securities sec WHERE sec.kind='IPO' AND sec.active), '[]'::jsonb),
      'event_status', (SELECT status FROM event_control WHERE id=1),
      'ipo', CASE WHEN s.id IS NULL THEN NULL ELSE jsonb_build_object('symbol',s.symbol,'name',s.name,'lot_size',s.ipo_lot_size,
        'offered',s.ipo_shares_offered,'issued',(SELECT coalesce(sum(ia.quantity),0) FROM ipo_allotments ia WHERE ia.security_id=s.id AND ia.reversed_at IS NULL),
        'remaining',CASE WHEN s.ipo_shares_offered IS NULL THEN NULL ELSE s.ipo_shares_offered-(SELECT coalesce(sum(ia.quantity),0) FROM ipo_allotments ia WHERE ia.security_id=s.id AND ia.reversed_at IS NULL) END) END,
      'draw', CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d) END,
      'eligible_count', CASE WHEN s.id IS NULL THEN 0 ELSE (SELECT count(*) FROM ipo_applications ia
        WHERE ia.security_id=s.id AND ia.status='APPLIED' AND ia.lots BETWEEN 1 AND 10 AND ia.amount<=150000
          AND (SELECT coalesce(sum(ax.amount),0) FROM ipo_applications ax WHERE ax.team_id=ia.team_id AND ax.status='APPLIED')<=600000
          AND NOT EXISTS (SELECT 1 FROM ipo_allotments aa WHERE aa.team_id=ia.team_id AND aa.security_id=s.id AND aa.reversed_at IS NULL)) END,
      'rejected_count', CASE WHEN s.id IS NULL THEN 0 ELSE greatest(0,
        (SELECT count(*) FROM ipo_applications ia WHERE ia.security_id=s.id AND ia.status='APPLIED') -
        (SELECT count(*) FROM ipo_applications ia WHERE ia.security_id=s.id AND ia.status='APPLIED' AND ia.lots BETWEEN 1 AND 10 AND ia.amount<=150000
          AND (SELECT coalesce(sum(ax.amount),0) FROM ipo_applications ax WHERE ax.team_id=ia.team_id AND ax.status='APPLIED')<=600000
          AND NOT EXISTS (SELECT 1 FROM ipo_allotments aa WHERE aa.team_id=ia.team_id AND aa.security_id=s.id AND aa.reversed_at IS NULL))) END,
      'items', CASE WHEN d.id IS NULL THEN '[]'::jsonb ELSE coalesce((SELECT jsonb_agg(jsonb_build_object(
        'team',di.team_code,'team_name',di.team_name,'position',di.draw_position,'requested_lots',di.requested_lots,
        'allotted_lots',di.allotted_lots,'shares',di.allotted_lots*di.lot_size,'rounds',to_jsonb(di.rounds),
        'price',di.application_price,'amount',di.allotted_lots*di.lot_size*di.application_price)
        ORDER BY di.draw_position) FROM ipo_allotment_draw_items di WHERE di.draw_id=d.id), '[]'::jsonb) END
    );
  END IF;

  SELECT status INTO v_event_status FROM event_control WHERE id=1 FOR UPDATE;
  SELECT * INTO s FROM securities WHERE kind='IPO' AND active AND (symbol=v_ipo OR ipo_code=v_ipo) FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('IPO_NOT_FOUND', 'Choose an existing IPO.', 404); END IF;

  IF v_action = 'LOT_SIZE' THEN
    BEGIN v_new_size := (p->>'lot_size')::numeric; EXCEPTION WHEN others THEN v_new_size := NULL; END;
    v_reason := nullif(trim(coalesce(p->>'reason','')), '');
    IF v_new_size IS NULL OR v_new_size <= 0 OR v_new_size <> trunc(v_new_size) OR v_new_size > 2147483647 THEN
      PERFORM jse_fail('INVALID_IPO_LOT_SIZE', 'IPO lot size must be a positive whole number of shares.', 400);
    END IF;
    IF EXISTS (SELECT 1 FROM ipo_applications WHERE security_id=s.id)
       OR EXISTS (SELECT 1 FROM ipo_allotments WHERE security_id=s.id)
       OR EXISTS (SELECT 1 FROM ipo_allotment_draws WHERE security_id=s.id) THEN
      PERFORM jse_fail('IPO_LOT_SIZE_LOCKED', 'IPO lot size cannot change after applications, allotments or a draw exist for this IPO.', 409);
    END IF;
    PERFORM jse_audit(a, 'IPO_LOT_SIZE_CHANGED', 'security', s.symbol, NULL, NULL,
      jsonb_build_object('lot_size',s.lot_size),
      jsonb_build_object('lot_size',v_new_size::integer),
      jsonb_build_object('reason',v_reason,'trading_lot_size_unchanged',true));
    UPDATE securities SET lot_size=v_new_size::integer, updated_at=now() WHERE id=s.id;
    RETURN jsonb_build_object('success',true,'symbol',s.symbol,'old_lot_size',s.lot_size,'lot_size',v_new_size::integer,
      'trading_lot_size',50);
  END IF;

  IF v_event_status <> 'NOT_STARTED' THEN
    PERFORM jse_fail('EVENT_STARTED', 'IPO issue-size and allotment-draw changes are allowed only before the event starts.', 409);
  END IF;

  IF v_action = 'SIZE' THEN
    BEGIN v_new_size := (p->>'new_size')::numeric; EXCEPTION WHEN others THEN v_new_size := NULL; END;
    v_unit := upper(trim(coalesce(p->>'unit','SHARES')));
    v_reason := trim(coalesce(p->>'reason',''));
    IF v_new_size IS NULL OR v_new_size <= 0 OR v_new_size <> trunc(v_new_size) THEN
      PERFORM jse_fail('INVALID_ISSUE_SIZE', 'Issue size must be a positive whole number.', 400);
    END IF;
    IF v_unit NOT IN ('SHARES','LOTS') THEN PERFORM jse_fail('INVALID_UNIT', 'Choose Shares or Lots.', 400); END IF;
    IF v_unit='LOTS' THEN v_new_size := v_new_size * s.ipo_lot_size; END IF;
    IF v_new_size > 2147483647 THEN PERFORM jse_fail('ISSUE_SIZE_TOO_LARGE', 'Issue size exceeds the supported inventory range.', 400); END IF;
    v_new_shares := v_new_size::integer;
    SELECT coalesce(sum(quantity),0)::integer INTO v_issued FROM ipo_allotments WHERE security_id=s.id AND reversed_at IS NULL;
    SELECT * INTO d FROM ipo_allotment_draws WHERE security_id=s.id ORDER BY id DESC LIMIT 1;
    IF d.id IS NOT NULL AND d.status IN ('GENERATED','VERIFIED','APPROVED') THEN
      PERFORM jse_fail('DRAW_IN_PROGRESS', 'Issue size cannot change while a draw is generated, verified or approved. Finalize or resolve that draw first.', 409);
    END IF;
    IF v_new_shares < v_issued THEN
      PERFORM jse_fail('BELOW_ISSUED', 'Issue size cannot be lower than already allotted shares (' || v_issued || ').', 409);
    END IF;
    IF d.id IS NOT NULL AND d.status='FINALIZED' AND v_new_shares < coalesce(s.ipo_shares_offered,0) THEN
      PERFORM jse_fail('FINALIZED_ISSUE_SIZE', 'After final issuance, issue size may only be increased; it cannot be reduced.', 409);
    END IF;
    PERFORM jse_audit(a, 'IPO_ISSUE_SIZE_CHANGED', 'security', s.symbol, NULL, NULL,
      jsonb_build_object('offered_shares',s.ipo_shares_offered),
      jsonb_build_object('offered_shares',v_new_shares,'unit_entered',v_unit,'value_entered',p->>'new_size'),
      jsonb_build_object('reason',v_reason,'issued_shares',v_issued));
    UPDATE securities SET ipo_shares_offered=v_new_shares, updated_at=now() WHERE id=s.id;
    RETURN jsonb_build_object('success',true,'symbol',s.symbol,'old_size',s.ipo_shares_offered,'new_size',v_new_shares,'issued',v_issued,'remaining',v_new_shares-v_issued);
  END IF;

  IF v_action = 'DRAW' THEN
    IF s.ipo_shares_offered IS NULL OR s.ipo_shares_offered <= 0 THEN
      PERFORM jse_fail('ISSUE_SIZE_REQUIRED', 'Set the IPO issue size before generating allotment.', 409);
    END IF;
    IF (jse_ipo_window()->>'phase') IS DISTINCT FROM 'CLOSED' THEN
      PERFORM jse_fail('APPLICATIONS_NOT_CLOSED', 'Random allotment is available only after the IPO application window closes.', 409);
    END IF;
    SELECT * INTO d FROM ipo_allotment_draws WHERE security_id=s.id AND status<>'CANCELLED' ORDER BY id DESC LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('success',true,'replay',true,'draw_id',d.id,'status',d.status,
        'message','An existing saved draw was returned. The random order was not regenerated.');
    END IF;
    SELECT coalesce(sum(quantity),0)::integer INTO v_issued FROM ipo_allotments WHERE security_id=s.id AND reversed_at IS NULL;
    v_remaining := s.ipo_shares_offered - v_issued;
    IF v_remaining < 0 THEN PERFORM jse_fail('INVENTORY_MISMATCH', 'Issued shares exceed the configured IPO issue size.', 409); END IF;
    v_available_lots := floor(v_remaining::numeric / s.ipo_lot_size)::integer;
    INSERT INTO ipo_allotment_draws(security_id,status,available_shares,available_lots,generated_by,inventory_snapshot)
    VALUES(s.id,'GENERATED',v_remaining,v_available_lots,jse_actor_name(a),
      jsonb_build_object('offered_shares',s.ipo_shares_offered,'issued_shares',v_issued,'lot_size',s.ipo_lot_size,'base_price',s.base_price))
    RETURNING id INTO v_draw_id;
    FOR x IN
      SELECT ia.id AS application_id, ia.team_id, t.code AS team_code, t.name AS team_name,
        ia.lots AS requested_lots, ia.price AS application_price, s.ipo_lot_size
      FROM ipo_applications ia JOIN teams t ON t.id=ia.team_id
      WHERE ia.security_id=s.id AND ia.status='APPLIED'
        AND ia.lots BETWEEN 1 AND 10 AND ia.amount<=150000
        AND (SELECT coalesce(sum(ax.amount),0) FROM ipo_applications ax WHERE ax.team_id=ia.team_id AND ax.status='APPLIED')<=600000
        AND NOT EXISTS (SELECT 1 FROM ipo_allotments aa WHERE aa.team_id=ia.team_id AND aa.security_id=s.id AND aa.reversed_at IS NULL)
      ORDER BY gen_random_bytes(16)
    LOOP
      v_position := v_position + 1;
      v_requested := v_requested + x.requested_lots;
      INSERT INTO ipo_allotment_draw_items(draw_id,application_id,team_id,team_code,team_name,draw_position,
        requested_lots,allotted_lots,lot_size,application_price)
      VALUES(v_draw_id,x.application_id,x.team_id,x.team_code,x.team_name,v_position,x.requested_lots,0,x.lot_size,x.application_price);
    END LOOP;
    IF v_position=0 THEN
      DELETE FROM ipo_allotment_draws WHERE id=v_draw_id;
      PERFORM jse_fail('NO_ELIGIBLE_APPLICATIONS', 'No eligible, unallotted applications were found for this IPO.', 409);
    END IF;
    UPDATE ipo_allotment_draws SET requested_lots=v_requested,
      subscription_ratio=CASE WHEN v_available_lots>0 THEN round(v_requested::numeric/v_available_lots,4) ELSE NULL END
    WHERE id=v_draw_id;
    v_left := v_available_lots;
    v_round := 1;
    WHILE v_left>0 LOOP
      v_progress := false;
      FOR x IN SELECT id,requested_lots,allotted_lots FROM ipo_allotment_draw_items
               WHERE draw_id=v_draw_id AND allotted_lots<requested_lots ORDER BY draw_position LOOP
        UPDATE ipo_allotment_draw_items SET allotted_lots=allotted_lots+1, rounds=array_append(rounds,v_round)
        WHERE id=x.id;
        v_left := v_left-1;
        v_progress := true;
        EXIT WHEN v_left<=0;
      END LOOP;
      EXIT WHEN NOT v_progress;
      v_round := v_round+1;
    END LOOP;
    PERFORM jse_audit(a,'IPO_RANDOM_DRAW_GENERATED','ipo_allotment_draw',v_draw_id::text,NULL,NULL,NULL,NULL,
      jsonb_build_object('symbol',s.symbol,'eligible',v_position,'requested_lots',v_requested,'available_lots',v_available_lots,
        'subscription_ratio',CASE WHEN v_available_lots>0 THEN round(v_requested::numeric/v_available_lots,4) ELSE NULL END,
        'algorithm','RANDOM_ROUND_ROBIN_V1'));
    RETURN jsonb_build_object('success',true,'draw_id',v_draw_id,'status','GENERATED','eligible_count',v_position,
      'requested_lots',v_requested,'available_lots',v_available_lots,
      'subscription_ratio',CASE WHEN v_available_lots>0 THEN round(v_requested::numeric/v_available_lots,4) ELSE NULL END);
  END IF;

  SELECT * INTO d FROM ipo_allotment_draws WHERE security_id=s.id ORDER BY id DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('NO_DRAW', 'Generate the random draw first.', 409); END IF;

  IF v_action = 'VERIFY' THEN
    IF d.status <> 'GENERATED' THEN
      IF d.status IN ('VERIFIED','APPROVED','FINALIZED') THEN RETURN jsonb_build_object('success',true,'replay',true,'draw_id',d.id,'status',d.status); END IF;
      PERFORM jse_fail('INVALID_DRAW_STATUS','Only a generated draw can be verified.',409);
    END IF;
    SELECT coalesce(sum(quantity),0)::integer INTO v_issued FROM ipo_allotments WHERE security_id=s.id AND reversed_at IS NULL;
    v_remaining := coalesce(s.ipo_shares_offered,0)-v_issued;
    SELECT coalesce(sum(allotted_lots*lot_size),0)::integer, coalesce(sum(allotted_lots),0)::integer
      INTO v_total_shares,v_count FROM ipo_allotment_draw_items WHERE draw_id=d.id;
    IF v_remaining <> d.available_shares THEN PERFORM jse_fail('INVENTORY_CHANGED','IPO inventory changed after the draw. Do not approve this stale draw.',409); END IF;
    IF v_total_shares > d.available_shares OR EXISTS(SELECT 1 FROM ipo_allotment_draw_items WHERE draw_id=d.id AND (allotted_lots<0 OR allotted_lots>requested_lots)) THEN
      PERFORM jse_fail('ALLOTMENT_INVALID','The proposed allotment exceeds inventory or a request.',409);
    END IF;
    UPDATE ipo_allotment_draws SET status='VERIFIED',verified_by=jse_actor_name(a),verified_at=now() WHERE id=d.id;
    PERFORM jse_audit(a,'IPO_RANDOM_DRAW_VERIFIED','ipo_allotment_draw',d.id::text,NULL,NULL,
      jsonb_build_object('status','GENERATED'),jsonb_build_object('status','VERIFIED'),
      jsonb_build_object('allotted_lots',v_count,'allotted_shares',v_total_shares,'available_shares',d.available_shares));
    RETURN jsonb_build_object('success',true,'draw_id',d.id,'status','VERIFIED','allotted_lots',v_count,'allotted_shares',v_total_shares);
  ELSIF v_action = 'APPROVE' THEN
    IF d.status <> 'VERIFIED' THEN PERFORM jse_fail('NOT_VERIFIED','Verify the allotment before approval.',409); END IF;
    UPDATE ipo_allotment_draws SET status='APPROVED',approved_by=jse_actor_name(a),approved_at=now() WHERE id=d.id;
    PERFORM jse_audit(a,'IPO_RANDOM_DRAW_APPROVED','ipo_allotment_draw',d.id::text,NULL,NULL,
      jsonb_build_object('status','VERIFIED'),jsonb_build_object('status','APPROVED'),NULL);
    RETURN jsonb_build_object('success',true,'draw_id',d.id,'status','APPROVED');
  ELSIF v_action = 'FINALIZE' THEN
    IF d.status='FINALIZED' THEN RETURN jsonb_build_object('success',true,'replay',true,'draw_id',d.id,'status','FINALIZED'); END IF;
    IF d.status <> 'APPROVED' THEN PERFORM jse_fail('NOT_APPROVED','Approve the verified allotment before issuing shares.',409); END IF;
    SELECT coalesce(sum(quantity),0)::integer INTO v_issued FROM ipo_allotments WHERE security_id=s.id AND reversed_at IS NULL;
    v_remaining := coalesce(s.ipo_shares_offered,0)-v_issued;
    SELECT coalesce(sum(allotted_lots*lot_size),0)::integer INTO v_total_shares FROM ipo_allotment_draw_items WHERE draw_id=d.id;
    IF v_remaining <> d.available_shares OR v_total_shares>v_remaining THEN
      PERFORM jse_fail('INVENTORY_CHANGED','IPO inventory changed after approval. No shares were issued.',409);
    END IF;
    IF EXISTS(SELECT 1 FROM ipo_allotment_draw_items di JOIN ipo_allotments aa ON aa.team_id=di.team_id AND aa.security_id=s.id AND aa.reversed_at IS NULL WHERE di.draw_id=d.id AND di.allotted_lots>0) THEN
      PERFORM jse_fail('DUPLICATE_ALLOTMENT','An applicant already has an allotment for this IPO. No shares were issued.',409);
    END IF;
    FOR x IN SELECT di.team_id,di.allotted_lots,di.lot_size,di.application_price,t.cash,t.code
      FROM ipo_allotment_draw_items di JOIN teams t ON t.id=di.team_id
      WHERE di.draw_id=d.id AND di.allotted_lots>0 LOOP
      v_total_amount := v_total_amount + x.allotted_lots*x.lot_size*x.application_price;
      IF x.cash < x.allotted_lots*x.lot_size*x.application_price THEN
        PERFORM jse_fail('ALLOTMENT_CASH',x.code || ' does not have enough cash for the proposed allotment. No shares were issued.',409);
      END IF;
    END LOOP;
    FOR x IN SELECT di.* FROM ipo_allotment_draw_items di WHERE di.draw_id=d.id AND di.allotted_lots>0 ORDER BY di.draw_position LOOP
      INSERT INTO ipo_allotments(team_id,security_id,lots,quantity,price,amount,batch_id,created_by,created_by_name)
      VALUES(x.team_id,s.id,x.allotted_lots,x.allotted_lots*x.lot_size,x.application_price,
        x.allotted_lots*x.lot_size*x.application_price,'RANDOM-IPO-'||d.id,nullif(a->>'id','')::integer,jse_actor_name(a))
      RETURNING * INTO al;
      PERFORM jse__apply_allotment(a,al);
      v_count := v_count+1;
    END LOOP;
    UPDATE ipo_allotment_draws SET status='FINALIZED',finalized_by=jse_actor_name(a),finalized_at=now() WHERE id=d.id;
    PERFORM jse_audit(a,'IPO_RANDOM_DRAW_FINALIZED','ipo_allotment_draw',d.id::text,NULL,NULL,
      jsonb_build_object('status','APPROVED'),jsonb_build_object('status','FINALIZED'),
      jsonb_build_object('rows_issued',v_count,'shares_issued',v_total_shares,'amount_charged',v_total_amount));
    RETURN jsonb_build_object('success',true,'draw_id',d.id,'status','FINALIZED','rows_issued',v_count,
      'shares_issued',v_total_shares,'amount_charged',v_total_amount);
  END IF;

  PERFORM jse_fail('INVALID_ACTION','Use STATE, LOT_SIZE, SIZE, DRAW, VERIFY, APPROVE or FINALIZE.',400);
END $$;


-- IPO application and allotment lots are separate from regular share-trading lots.
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
  IF v_lots IS NULL OR v_lots <= 0 THEN PERFORM jse_fail('INVALID_LOTS', 'Apply for a whole number of lots (1 lot = ' || s.ipo_lot_size || ' shares).', 400); END IF;
  v_amount := v_lots * s.ipo_lot_size * s.base_price;
  SELECT coalesce(sum(amount), 0) INTO v_other FROM ipo_applications WHERE team_id = t.id AND status = 'APPLIED' AND security_id <> s.id;
  IF v_other + v_amount > t.cash THEN
    PERFORM jse_fail('APPLICATION_CASH', 'All IPO applications together (' || jse_inr((v_other + v_amount)) || ') cannot exceed the team''s cash (' || jse_inr(t.cash) || ').', 409);
  END IF;
  INSERT INTO ipo_applications(team_id, security_id, lots, quantity, price, amount, status, created_by_name, updated_by_name)
  VALUES (t.id, s.id, v_lots, v_lots * s.ipo_lot_size, s.base_price, v_amount, 'APPLIED', jse_actor_name(a), jse_actor_name(a))
  ON CONFLICT (team_id, security_id) DO UPDATE SET lots = EXCLUDED.lots, quantity = EXCLUDED.quantity, price = EXCLUDED.price,
    amount = EXCLUDED.amount, status = 'APPLIED', updated_at = now(), updated_by_name = EXCLUDED.updated_by_name
  RETURNING * INTO app;
  PERFORM jse_audit(a, 'IPO_APPLICATION_SUBMITTED', 'ipo_application', s.symbol, t.id, NULL, NULL,
    jsonb_build_object('lots', v_lots, 'shares', v_lots * s.ipo_lot_size, 'amount', v_amount), jsonb_build_object('issue_price', s.base_price));
  RETURN jsonb_build_object('success', true, 'status', 'APPLIED', 'application', to_jsonb(app) || jsonb_build_object('symbol', s.symbol));
END $$;

-- One prospectus record per IPO, managed by the administrator. Content is supplied by the organisers.

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
    v_shares := v_lots * v_sec.ipo_lot_size; v_amt := v_shares * v_sec.base_price;
    IF nullif(trim(coalesce(r->>'shares', '')), '') IS NOT NULL AND (r->>'shares')::numeric <> v_shares THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' / ' || v_sec.symbol || ': Shares ' || (r->>'shares') || ' \\u2260 ' || v_lots || ' lots \\xD7 ' || v_sec.ipo_lot_size || ' = ' || v_shares); CONTINUE;
    END IF;
    IF nullif(trim(coalesce(r->>'amount', '')), '') IS NOT NULL AND round((r->>'amount')::numeric, 2) <> v_amt THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' / ' || v_sec.symbol || ': Amount ' || (r->>'amount') || ' \\u2260 ' || v_shares || ' \\xD7 ' || jse_inr(v_sec.base_price) || ' = ' || jse_inr(v_amt)); CONTINUE;
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

CREATE OR REPLACE FUNCTION jse_ipo_page() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('success', true, 'event_name', cfg.event_name, 'event_start_at', cfg.event_start_at, 'window', jse_ipo_window(),
    'status', (SELECT status FROM event_control WHERE id = 1),
    'ipos', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'symbol', s.symbol, 'ipo_code', s.ipo_code, 'name', s.name, 'sector', s.sector,
        'issue_price', s.base_price, 'lot_size', s.ipo_lot_size, 'lot_value', s.ipo_lot_size * s.base_price,
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

-- Admin-only special controls for BIG BULL, a dedicated participant with its own capital baseline.
CREATE OR REPLACE FUNCTION jse_big_bull_admin(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action',''), 'STATE'));
  t teams%ROWTYPE; u app_users%ROWTYPE; b brokers%ROWTYPE;
  v_delta numeric; v_after numeric; v_capital numeric; v_reason text; v_active boolean;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF v_action <> 'STATE' THEN PERFORM jse_require_admin_password(a, p); END IF;
  SELECT * INTO t FROM teams WHERE code='TEAM-101' AND lower(name)='big bull' FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('BIG_BULL_NOT_FOUND', 'BIG BULL special participant team has not been provisioned.', 404); END IF;
  SELECT * INTO u FROM app_users WHERE lower(username)='bigbull' AND team_id=t.id;
  IF NOT FOUND THEN PERFORM jse_fail('BIG_BULL_USER_NOT_FOUND', 'BIGBULL participant login has not been provisioned.', 404); END IF;
  IF v_action = 'STATE' THEN
    RETURN jsonb_build_object('success',true,'team_code',t.code,'name',t.name,'cash',t.cash,'active',t.active AND u.active,
      'team_active',t.active,'user_active',u.active,'username',u.username,'display_name',u.display_name,
      'starting_capital',t.initial_capital,'broker',(SELECT code FROM brokers WHERE id=t.broker_id),
      'broker_name',(SELECT name FROM brokers WHERE id=t.broker_id),
      'brokers',coalesce((SELECT jsonb_agg(jsonb_build_object('code',code,'name',name) ORDER BY code) FROM brokers WHERE active),'[]'::jsonb),
      'holdings',coalesce((SELECT jsonb_agg(jsonb_build_object('symbol',s.symbol,'name',s.name,'quantity',h.quantity,'price',s.price,'market_value',h.quantity*s.price,'cost_basis',h.cost_basis,'trade_cost',h.trade_cost) ORDER BY s.symbol)
        FROM holdings h JOIN securities s ON s.id=h.security_id WHERE h.team_id=t.id AND h.quantity>0),'[]'::jsonb),
      'holdings_value',coalesce((SELECT sum(h.quantity*s.price) FROM holdings h JOIN securities s ON s.id=h.security_id WHERE h.team_id=t.id AND h.quantity>0),0),
      'net_worth',t.cash+coalesce((SELECT sum(h.quantity*s.price) FROM holdings h JOIN securities s ON s.id=h.security_id WHERE h.team_id=t.id AND h.quantity>0),0),
      'pnl',t.cash+coalesce((SELECT sum(h.quantity*s.price) FROM holdings h JOIN securities s ON s.id=h.security_id WHERE h.team_id=t.id AND h.quantity>0),0)-t.initial_capital,
      'orders_pending',(SELECT count(*) FROM orders o WHERE o.team_id=t.id AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
      'settled_trades',(SELECT count(*) FROM settlements st JOIN orders o ON o.id=st.order_id WHERE o.team_id=t.id AND st.reversed_at IS NULL));
  ELSIF v_action = 'CASH_ADJUST' THEN
    BEGIN v_delta := (p->>'delta')::numeric; EXCEPTION WHEN others THEN v_delta := NULL; END;
    v_reason := trim(coalesce(p->>'reason',''));
    IF v_delta IS NULL OR v_delta=0 THEN PERFORM jse_fail('INVALID_CASH_ADJUSTMENT','Enter a non-zero cash adjustment amount.',400); END IF;
    IF v_reason='' THEN PERFORM jse_fail('REASON_REQUIRED','Enter a reason for this financial adjustment.',400); END IF;
    v_after := t.cash+v_delta;
    IF v_after<0 THEN PERFORM jse_fail('NEGATIVE_CASH','BIG BULL cash cannot be negative.',409); END IF;
    IF v_delta<0 AND EXISTS(SELECT 1 FROM orders o WHERE o.team_id=t.id AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')) THEN
      PERFORM jse_fail('BIG_BULL_PENDING_ORDERS','Resolve BIG BULL pending orders before reducing its available cash.',409);
    END IF;
    UPDATE teams SET cash=v_after,updated_at=now() WHERE id=t.id;
    PERFORM jse_ledger(t.id,NULL,NULL,'ADJUSTMENT',greatest(-v_delta,0),greatest(v_delta,0),v_after,'BIG BULL cash adjustment: '||v_reason,a);
    PERFORM jse_audit(a,'BIG_BULL_CASH_ADJUSTED','team',t.code,t.id,NULL,jsonb_build_object('cash',t.cash),jsonb_build_object('cash',v_after),jsonb_build_object('delta',v_delta,'reason',v_reason));
    RETURN jsonb_build_object('success',true,'old_cash',t.cash,'new_cash',v_after,'delta',v_delta);
  ELSIF v_action = 'CAPITAL_SET' THEN
    BEGIN v_capital := (p->>'capital')::numeric; EXCEPTION WHEN others THEN v_capital := NULL; END;
    v_reason := trim(coalesce(p->>'reason',''));
    IF v_capital IS NULL OR v_capital<=0 OR v_capital>1000000000 THEN PERFORM jse_fail('INVALID_CAPITAL','Enter capital between \u20B91 and \u20B91,000,000,000.',400); END IF;
    IF v_reason='' THEN PERFORM jse_fail('REASON_REQUIRED','Enter a reason for the capital-baseline change.',400); END IF;
    PERFORM jse_audit(a,'BIG_BULL_CAPITAL_CHANGED','team',t.code,t.id,NULL,jsonb_build_object('initial_capital',t.initial_capital),jsonb_build_object('initial_capital',v_capital),jsonb_build_object('reason',v_reason));
    UPDATE teams SET initial_capital=v_capital,updated_at=now() WHERE id=t.id;
    RETURN jsonb_build_object('success',true,'old_capital',t.initial_capital,'capital',v_capital);
  ELSIF v_action = 'SET_BROKER' THEN
    SELECT * INTO b FROM brokers WHERE code=upper(trim(coalesce(p->>'broker',''))) AND active;
    IF NOT FOUND THEN PERFORM jse_fail('BROKER_NOT_FOUND','Choose an active broker.',404); END IF;
    PERFORM jse_audit(a,'BIG_BULL_BROKER_CHANGED','team',t.code,t.id,NULL,jsonb_build_object('broker',(SELECT code FROM brokers WHERE id=t.broker_id)),jsonb_build_object('broker',b.code),NULL);
    UPDATE teams SET broker_id=b.id,updated_at=now() WHERE id=t.id;
    RETURN jsonb_build_object('success',true,'broker',b.code,'broker_name',b.name);
  ELSIF v_action = 'SET_ACTIVE' THEN
    BEGIN v_active := (p->>'active')::boolean; EXCEPTION WHEN others THEN v_active := NULL; END;
    IF v_active IS NULL THEN PERFORM jse_fail('INVALID_ACTIVE','Choose whether BIG BULL should be enabled.',400); END IF;
    UPDATE teams SET active=v_active,updated_at=now() WHERE id=t.id;
    UPDATE app_users SET active=v_active,updated_at=now() WHERE id=u.id;
    IF NOT v_active THEN UPDATE sessions SET revoked_at=now() WHERE user_id=u.id AND revoked_at IS NULL; END IF;
    PERFORM jse_audit(a,CASE WHEN v_active THEN 'BIG_BULL_ENABLED' ELSE 'BIG_BULL_DISABLED' END,'team',t.code,t.id,NULL,jsonb_build_object('team_active',t.active,'user_active',u.active),jsonb_build_object('team_active',v_active,'user_active',v_active),NULL);
    RETURN jsonb_build_object('success',true,'active',v_active);
  END IF;
  PERFORM jse_fail('INVALID_ACTION','Use STATE, CASH_ADJUST, CAPITAL_SET, SET_BROKER or SET_ACTIVE.',400);
END $$;

CREATE OR REPLACE FUNCTION jse_import_dalal_roster(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE r jsonb; x jsonb; t teams%ROWTYPE; v_alias broker_roster_aliases%ROWTYPE;
  v_i integer:=0; v_input text; v_broker_code text; v_section text; v_members text;
  v_plan jsonb:='[]'::jsonb; v_errors jsonb:='[]'::jsonb; v_skipped jsonb:='[]'::jsonb; v_changed integer:=0;
BEGIN
  PERFORM jse_require_role(a,'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean,false) THEN PERFORM jse_require_admin_password(a,p); END IF;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows')=0 THEN PERFORM jse_fail('NO_ROWS','No roster rows were supplied.',400); END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i:=v_i+1; v_input:=trim(coalesce(r->>'team','')); v_broker_code:=trim(coalesce(r->>'broker_code',''));
    v_section:=trim(coalesce(r->>'section','')); v_members:=trim(coalesce(r->>'members',''));
    SELECT * INTO t FROM teams WHERE code=upper(v_input);
    IF NOT FOUND THEN SELECT * INTO t FROM teams WHERE lower(name)=lower(v_input); END IF;
    IF NOT FOUND THEN v_skipped:=v_skipped||jsonb_build_object('row',v_i,'team',v_input,'reason','No exact existing team name/code; code was not guessed.'); CONTINUE; END IF;
    IF EXISTS(SELECT 1 FROM jsonb_array_elements(v_plan) q WHERE q->>'code'=t.code) THEN v_errors:=v_errors||jsonb_build_object('row',v_i,'team',v_input,'error','Duplicate existing team row.'); CONTINUE; END IF;
    SELECT * INTO v_alias FROM broker_roster_aliases WHERE lower(broker_code)=lower(v_broker_code);
    IF NOT FOUND THEN v_errors:=v_errors||jsonb_build_object('row',v_i,'team',v_input,'error','Unknown official broker code: '||v_broker_code); CONTINUE; END IF;
    IF length(v_section)>120 OR length(v_members)>1000 THEN v_errors:=v_errors||jsonb_build_object('row',v_i,'team',v_input,'error','Section or participant text too long.'); CONTINUE; END IF;
    v_plan:=v_plan||jsonb_build_object('id',t.id,'code',t.code,'team_name',t.name,'section',nullif(v_section,''),'members',nullif(v_members,''),'broker_id',v_alias.internal_broker_id,
      'before',jsonb_build_object('section',t.section,'members',t.members,'broker_id',t.broker_id,'broker',(SELECT code FROM brokers WHERE id=t.broker_id)));
  END LOOP;
  IF jsonb_array_length(v_errors)>0 THEN RETURN jsonb_build_object('success',false,'code','ROSTER_ERRORS','error','Nothing saved; correct invalid rows first.','errors',v_errors,'http',400); END IF;
  IF jsonb_array_length(v_plan)=0 THEN PERFORM jse_fail('NO_MATCHING_TEAMS','No rows matched existing team names or codes.',400); END IF;
  IF coalesce((p->>'dry_run')::boolean,false) THEN RETURN jsonb_build_object('success',true,'dry_run',true,'matched',jsonb_array_length(v_plan),'skipped_count',jsonb_array_length(v_skipped),'skipped',v_skipped); END IF;
  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    UPDATE teams SET section=x->>'section',members=x->>'members',broker_id=(x->>'broker_id')::integer,updated_at=now() WHERE id=(x->>'id')::integer;
    IF (x->'before') IS DISTINCT FROM jsonb_build_object('section',x->>'section','members',x->>'members','broker_id',(x->>'broker_id')::integer,'broker',(SELECT code FROM brokers WHERE id=(x->>'broker_id')::integer)) THEN
      PERFORM jse_audit(a,'DALAL_ROSTER_IMPORTED','team',x->>'code',(x->>'id')::integer,NULL,x->'before',jsonb_build_object('team_name',x->>'team_name','section',x->>'section','members',x->>'members','broker',(SELECT code FROM brokers WHERE id=(x->>'broker_id')::integer)),jsonb_build_object('source','Dalal Street Teams spreadsheet'));
      v_changed:=v_changed+1;
    END IF;
  END LOOP;
  PERFORM jse_audit(a,'DALAL_ROSTER_UPLOAD','team',NULL,NULL,NULL,NULL,NULL,jsonb_build_object('matched',jsonb_array_length(v_plan),'changed',v_changed,'skipped',jsonb_array_length(v_skipped),'cash_or_history_changed',false));
  RETURN jsonb_build_object('success',true,'matched',jsonb_array_length(v_plan),'updated',v_changed,'skipped_count',jsonb_array_length(v_skipped),'skipped',v_skipped,'cash_or_history_changed',false);
END $$;
INSERT INTO schema_migrations(version) VALUES ('011_roster_ipo');
`;var ir=`-- BIG BULL special participant: Team 1 is a dedicated account with a hard \u20B91 crore cash ceiling.
-- Additive and idempotent. Existing cash, holdings, orders, and team/broker identifiers are preserved.
CREATE TABLE IF NOT EXISTS public.jse_special_accounts (
  team_id integer PRIMARY KEY REFERENCES public.teams(id),
  account_code text NOT NULL UNIQUE,
  display_name text NOT NULL,
  cash_limit numeric(14,2) NOT NULL CHECK (cash_limit >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.jse_special_accounts(team_id, account_code, display_name, cash_limit)
SELECT id, 'BIG-BULL', 'BIG BULL', 100000000.00 FROM public.teams WHERE code='TEAM-001'
ON CONFLICT (team_id) DO UPDATE SET account_code='BIG-BULL', display_name='BIG BULL', cash_limit=100000000.00, updated_at=now();

CREATE OR REPLACE FUNCTION public.jse_special_cash_limit_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_limit numeric;
BEGIN
  SELECT cash_limit INTO v_limit FROM public.jse_special_accounts WHERE team_id=NEW.id;
  IF FOUND AND NEW.cash > v_limit THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='BIG BULL cash limit is \u20B91,00,00,000.00; this balance change is blocked.';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS jse_special_cash_limit_guard_trg ON public.teams;
CREATE TRIGGER jse_special_cash_limit_guard_trg BEFORE INSERT OR UPDATE ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.jse_special_cash_limit_guard();

CREATE OR REPLACE FUNCTION public.jse_big_bull_admin(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action',''),'STATE'));
  t teams%ROWTYPE;
  b brokers%ROWTYPE;
  v_amount numeric(16,2);
  v_delta numeric(16,2);
  v_after numeric(16,2);
  v_reason text;
  v_name text;
  v_broker_code text;
  v_broker_id integer;
  v_section text;
  v_members text;
  v_active boolean;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT * INTO t FROM teams WHERE seq=1 AND code='TEAM-001' FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('BIG_BULL_NOT_FOUND','Team 1 special participant was not found.',404); END IF;
  SELECT * INTO b FROM brokers WHERE id=t.broker_id;

  IF v_action = 'STATE' THEN
    RETURN jsonb_build_object('success',true,'account',jsonb_build_object(
      'team_number',t.seq,'team_code',t.code,'display_name',t.name,'broker_number',b.id,'broker_code',b.code,
      'broker_name',b.name,'cash',t.cash,'cash_limit',100000000,'active',t.active,'section',t.section,'members',t.members));
  END IF;

  PERFORM jse_require_admin_password(a,p);
  v_reason := left(trim(coalesce(p->>'reason','')),300);
  IF v_reason='' THEN PERFORM jse_fail('REASON_REQUIRED','Enter a reason for the BIG BULL change.',400); END IF;

  IF v_action = 'UPDATE_ACCOUNT' THEN
    v_name := left(trim(coalesce(p->>'display_name','')),120);
    v_broker_code := upper(trim(coalesce(p->>'broker_code','')));
    v_section := left(trim(coalesce(p->>'section','')),120);
    v_members := left(trim(coalesce(p->>'members','')),1000);
    BEGIN v_active := (p->>'active')::boolean; EXCEPTION WHEN others THEN v_active := NULL; END;
    IF v_name='' THEN PERFORM jse_fail('NAME_REQUIRED','Enter the BIG BULL display name.',400); END IF;
    IF v_active IS NULL THEN PERFORM jse_fail('INVALID_ACTIVE','Choose an account status.',400); END IF;
    SELECT id INTO v_broker_id FROM brokers WHERE code=v_broker_code AND active;
    IF v_broker_id IS NULL THEN PERFORM jse_fail('BROKER_NOT_FOUND','Choose an existing active broker.',400); END IF;
    IF EXISTS (SELECT 1 FROM teams WHERE id<>t.id AND lower(name)=lower(v_name)) THEN
      PERFORM jse_fail('DUPLICATE_TEAM_NAME','That display name is already used by another team.',409);
    END IF;
    UPDATE teams SET name=v_name, broker_id=v_broker_id, section=nullif(v_section,''), members=nullif(v_members,''),
      active=v_active, updated_at=now() WHERE id=t.id;
    UPDATE app_users SET display_name=v_name, active=v_active, updated_at=now()
      WHERE role='PARTICIPANT' AND team_id=t.id;
    UPDATE public.jse_special_accounts SET display_name=v_name, updated_at=now() WHERE team_id=t.id;
    PERFORM jse_audit(a,'BIG_BULL_ACCOUNT_UPDATED','team',t.code,t.id,NULL,
      jsonb_build_object('name',t.name,'broker_code',b.code,'section',t.section,'members',t.members,'active',t.active),
      jsonb_build_object('name',v_name,'broker_code',v_broker_code,'section',nullif(v_section,''),'members',nullif(v_members,''),'active',v_active),
      jsonb_build_object('reason',v_reason));
  ELSIF v_action IN ('SET_BALANCE','ADJUST_CASH') THEN
    BEGIN v_amount := nullif(trim(p->>'amount'),'')::numeric; EXCEPTION WHEN others THEN v_amount := NULL; END;
    IF v_amount IS NULL OR v_amount<0 AND v_action='SET_BALANCE' THEN
      PERFORM jse_fail('INVALID_AMOUNT','Enter a balance from \u20B90 to \u20B91 crore.',400);
    END IF;
    IF v_action='ADJUST_CASH' AND v_amount=0 THEN PERFORM jse_fail('INVALID_AMOUNT','Enter a non-zero cash adjustment.',400); END IF;
    v_after := CASE WHEN v_action='SET_BALANCE' THEN v_amount ELSE t.cash+v_amount END;
    IF v_after<0 OR v_after>100000000 THEN
      PERFORM jse_fail('CASH_LIMIT','BIG BULL cash must stay between \u20B90 and \u20B91 crore.',400);
    END IF;
    v_delta := v_after-t.cash;
    IF v_delta<>0 THEN
      UPDATE teams SET cash=v_after, updated_at=now() WHERE id=t.id;
      INSERT INTO cash_ledger(team_id,entry_type,debit,credit,balance_after,note,actor_id,actor_name)
      VALUES(t.id,'ADJUSTMENT',greatest(-v_delta,0),greatest(v_delta,0),v_after,
        'BIG BULL admin '||lower(v_action)||': '||v_reason,nullif(a->>'id','')::integer,jse_actor_name(a));
      PERFORM jse_audit(a,CASE WHEN v_action='SET_BALANCE' THEN 'BIG_BULL_BALANCE_SET' ELSE 'BIG_BULL_CASH_ADJUSTED' END,
        'team',t.code,t.id,NULL,jsonb_build_object('cash',t.cash),jsonb_build_object('cash',v_after),
        jsonb_build_object('reason',v_reason,'amount',v_amount,'action',v_action));
    END IF;
  ELSE
    PERFORM jse_fail('INVALID_ACTION','Use STATE, UPDATE_ACCOUNT, SET_BALANCE or ADJUST_CASH.',400);
  END IF;

  SELECT * INTO t FROM teams WHERE id=t.id;
  SELECT * INTO b FROM brokers WHERE id=t.broker_id;
  RETURN jsonb_build_object('success',true,'cash',t.cash,'account',jsonb_build_object(
    'team_number',t.seq,'team_code',t.code,'display_name',t.name,'broker_number',b.id,'broker_code',b.code,
    'broker_name',b.name,'cash',t.cash,'cash_limit',100000000,'active',t.active,'section',t.section,'members',t.members));
END $function$;


CREATE OR REPLACE FUNCTION public.jse_broker_desk(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
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
    'brokers', CASE WHEN a->>'role' = 'BROKER' THEN NULL ELSE (SELECT jsonb_agg(jsonb_build_object('code', br.code, 'name', br.name, 'broker_number', coalesce(ra.broker_number,br.id), 'roster_code', coalesce(ra.broker_code,br.code), 'roster_name', coalesce(ra.broker_name,br.name)) ORDER BY coalesce(ra.broker_number,br.id)) FROM brokers br LEFT JOIN broker_roster_aliases ra ON ra.internal_broker_id=br.id) END,
    'rules', jsonb_build_object('brokerage_rate', cfg.brokerage_rate, 'max_order_value', cfg.max_order_value, 'min_order_value', cfg.min_order_value,
      'stock_lot_size', cfg.stock_lot_size, 'loan_max_principal', cfg.loan_max_principal, 'loan_interest_rate', cfg.loan_interest_rate,
      'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades),
    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('code', tm.code, 'seq', right(tm.code,3)::integer, 'name', CASE WHEN sa.account_code='BIG-BULL' THEN sa.display_name ELSE tm.name END, 'special_account', sa.account_code, 'cash_limit', sa.cash_limit, 'broker_number', coalesce(ra.broker_number, tm.broker_id), 'broker_code', coalesce(ra.broker_code, (SELECT code FROM brokers WHERE id=tm.broker_id)), 'broker_name', coalesce(ra.broker_name, (SELECT name FROM brokers WHERE id=tm.broker_id)), 'section', tm.section, 'members', tm.members,
        'cash', tm.cash, 'free_cash', jse_available_cash(tm.team_id, NULL), 'loan_room', jse_loan_room(tm.team_id),
        'holdings_value', tm.holdings_value, 'net_worth', tm.net_worth, 'settled_buys', tm.settled_buys, 'settled_sells', tm.settled_sells,
        'assessment_met', tm.assessment_met, 'loan_liability', tm.loan_liability, 'eligibility_status', tm.eligibility_status,
        'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'quantity', h.quantity,
              'available', (SELECT available FROM jse_available_qty(tm.team_id, s.id, NULL)), 'avg_price', round(h.trade_cost / nullif(h.quantity, 0), 2),
              'price', s.price, 'value', h.quantity * s.price, 'tradable', s.kind = 'EQUITY' OR s.listed_at IS NOT NULL) ORDER BY h.quantity * s.price DESC)
            FROM holdings h JOIN securities s ON s.id = h.security_id WHERE h.team_id = tm.team_id AND h.quantity > 0), '[]'::jsonb),
        'open_orders', (SELECT count(*) FROM orders o WHERE o.team_id = tm.team_id AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')))
        ORDER BY tm.seq)
      FROM jse_team_metrics tm LEFT JOIN jse_special_accounts sa ON sa.team_id=tm.team_id LEFT JOIN broker_roster_aliases ra ON ra.internal_broker_id=tm.broker_id WHERE (v_all OR tm.broker_id = b.id) AND tm.active), '[]'::jsonb),
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
END $function$;


CREATE OR REPLACE FUNCTION public.jse_institutional(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
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
    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('code', t.code, 'seq', t.seq, 'name', CASE WHEN sa.account_code='BIG-BULL' THEN sa.display_name ELSE t.name END, 'special_account', sa.account_code, 'broker', coalesce(ra.broker_code,b.code), 'broker_number', coalesce(ra.broker_number,b.id), 'broker_name', coalesce(ra.broker_name,b.name)) ORDER BY t.seq) FROM teams t LEFT JOIN brokers b ON b.id = t.broker_id LEFT JOIN jse_special_accounts sa ON sa.team_id=t.id LEFT JOIN broker_roster_aliases ra ON ra.internal_broker_id=t.broker_id WHERE t.active), '[]'::jsonb),
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
END $function$;


INSERT INTO schema_migrations(version) VALUES ('012_big_bull_special_account');
`;var rr=`-- BIG BULL special participant controls: Team 1 / Broker 11.
-- Additive and replayable. Existing balances and trade history are retained.
INSERT INTO brokers (code,name,active) VALUES ('BROKER-11','SIDDHARTH',true)
ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, active=true;

CREATE TABLE IF NOT EXISTS public.jse_special_accounts (
  team_id integer PRIMARY KEY REFERENCES teams(id),
  account_code text NOT NULL UNIQUE,
  display_name text NOT NULL,
  cash_limit numeric(16,2) NOT NULL DEFAULT 100000000 CHECK (cash_limit >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.jse_special_accounts(team_id,account_code,display_name,cash_limit)
SELECT id,'BIG-BULL','BIG BULL',100000000 FROM teams WHERE code='TEAM-001'
ON CONFLICT (account_code) DO UPDATE SET team_id=EXCLUDED.team_id,display_name=EXCLUDED.display_name,
  cash_limit=EXCLUDED.cash_limit,updated_at=now();

INSERT INTO team_name_pool (name,category,meaning,active)
SELECT 'BIG BULL','SPECIAL','Special participant; managed separately by the administrator',true
WHERE NOT EXISTS (SELECT 1 FROM team_name_pool WHERE lower(name)='big bull');

UPDATE teams
SET name='BIG BULL', broker_id=(SELECT id FROM brokers WHERE code='BROKER-11'), updated_at=now()
WHERE seq=1 AND code='TEAM-001'
  AND (name IS DISTINCT FROM 'BIG BULL' OR broker_id IS DISTINCT FROM (SELECT id FROM brokers WHERE code='BROKER-11'));

UPDATE app_users SET display_name='BIG BULL', updated_at=now()
WHERE role='PARTICIPANT' AND team_id=(SELECT id FROM teams WHERE seq=1 AND code='TEAM-001')
  AND display_name IS DISTINCT FROM 'BIG BULL';

-- Add sequence and broker identity to the order-desk team payload so dropdowns can show
-- 1-BIG BULL-11-SIDDHARTH without relying on hard-coded browser values.
DO $do$
DECLARE v_def text;
  v_old text := '''code'', tm.code, ''name'', tm.name, ''section'', tm.section, ''members'', tm.members';
  v_new text := '''code'', tm.code, ''seq'', right(tm.code,3)::integer, ''name'', CASE WHEN sa.account_code=''BIG-BULL'' THEN sa.display_name ELSE tm.name END, ''special_account'', sa.account_code, ''cash_limit'', sa.cash_limit, ''broker_number'', coalesce(ra.broker_number,tm.broker_id), ''broker_code'', coalesce(ra.broker_code,(SELECT code FROM brokers WHERE id=tm.broker_id)), ''broker_name'', coalesce(ra.broker_name,(SELECT name FROM brokers WHERE id=tm.broker_id)), ''section'', tm.section, ''members'', tm.members';
BEGIN
  SELECT pg_get_functiondef('jse_broker_desk(jsonb,jsonb)'::regprocedure) INTO v_def;
  IF position(v_old IN v_def) > 0 THEN
    v_def := replace(v_def, v_old, v_new);
    v_def := replace(v_def, 'FROM jse_team_metrics tm WHERE (v_all OR tm.broker_id = b.id) AND tm.active',
      'FROM jse_team_metrics tm LEFT JOIN jse_special_accounts sa ON sa.team_id=tm.team_id LEFT JOIN broker_roster_aliases ra ON ra.internal_broker_id=tm.broker_id WHERE (v_all OR tm.broker_id = b.id) AND tm.active');
  ELSIF position('broker_name' IN v_def) = 0 THEN
    RAISE EXCEPTION 'Could not patch broker-desk team payload';
  END IF;
  v_def := replace(v_def, 'WHERE (v_all OR tm.broker_id = b.id) AND tm.active ORDER BY tm.seq), ''[]''::jsonb)',
    'WHERE (v_all OR tm.broker_id = b.id) AND tm.active), ''[]''::jsonb)');
  EXECUTE v_def;
END $do$;

CREATE OR REPLACE FUNCTION public.jse_big_bull_admin(a jsonb, p jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action',''),'STATE'));
  t teams%ROWTYPE;
  b brokers%ROWTYPE;
  v_amount numeric(16,2);
  v_delta numeric(16,2);
  v_after numeric(16,2);
  v_reason text;
  v_name text;
  v_broker_code text;
  v_broker_id integer;
  v_section text;
  v_members text;
  v_active boolean;
  v_cash_limit numeric(16,2);
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT * INTO t FROM teams WHERE seq=1 AND code='TEAM-001' FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('BIG_BULL_NOT_FOUND','Team 1 special participant was not found.',404); END IF;
  SELECT * INTO b FROM brokers WHERE id=t.broker_id;
  SELECT cash_limit INTO v_cash_limit FROM public.jse_special_accounts WHERE team_id=t.id AND account_code='BIG-BULL';
  v_cash_limit := coalesce(v_cash_limit,100000000);

  IF v_action = 'STATE' THEN
    RETURN jsonb_build_object('success',true,'account',jsonb_build_object(
      'team_number',t.seq,'team_code',t.code,'display_name',t.name,'broker_number',b.id,'broker_code',b.code,
      'broker_name',b.name,'cash',t.cash,'cash_limit',v_cash_limit,'active',t.active,'section',t.section,'members',t.members));
  END IF;

  PERFORM jse_require_admin_password(a,p);
  v_reason := left(trim(coalesce(p->>'reason','')),300);
  IF v_reason='' THEN PERFORM jse_fail('REASON_REQUIRED','Enter a reason for the BIG BULL change.',400); END IF;

  IF v_action = 'UPDATE_ACCOUNT' THEN
    v_name := left(trim(coalesce(p->>'display_name','')),120);
    v_broker_code := upper(trim(coalesce(p->>'broker_code','')));
    v_section := left(trim(coalesce(p->>'section','')),120);
    v_members := left(trim(coalesce(p->>'members','')),1000);
    BEGIN v_active := (p->>'active')::boolean; EXCEPTION WHEN others THEN v_active := NULL; END;
    IF v_name='' THEN PERFORM jse_fail('NAME_REQUIRED','Enter the BIG BULL display name.',400); END IF;
    IF v_active IS NULL THEN PERFORM jse_fail('INVALID_ACTIVE','Choose an account status.',400); END IF;
    SELECT id INTO v_broker_id FROM brokers WHERE code=v_broker_code AND active;
    IF v_broker_id IS NULL THEN PERFORM jse_fail('BROKER_NOT_FOUND','Choose an existing active broker.',400); END IF;
    IF EXISTS (SELECT 1 FROM teams WHERE id<>t.id AND lower(name)=lower(v_name)) THEN
      PERFORM jse_fail('DUPLICATE_TEAM_NAME','That display name is already used by another team.',409);
    END IF;
    UPDATE teams SET name=v_name, broker_id=v_broker_id, section=nullif(v_section,''), members=nullif(v_members,''),
      active=v_active, updated_at=now() WHERE id=t.id;
    UPDATE app_users SET display_name=v_name, active=v_active, updated_at=now()
      WHERE role='PARTICIPANT' AND team_id=t.id;
    UPDATE public.jse_special_accounts SET display_name=v_name, updated_at=now() WHERE team_id=t.id;
    PERFORM jse_audit(a,'BIG_BULL_ACCOUNT_UPDATED','team',t.code,t.id,NULL,
      jsonb_build_object('name',t.name,'broker_code',b.code,'section',t.section,'members',t.members,'active',t.active),
      jsonb_build_object('name',v_name,'broker_code',v_broker_code,'section',nullif(v_section,''),'members',nullif(v_members,''),'active',v_active),
      jsonb_build_object('reason',v_reason));
  ELSIF v_action IN ('SET_BALANCE','ADJUST_CASH') THEN
    BEGIN v_amount := nullif(trim(p->>'amount'),'')::numeric; EXCEPTION WHEN others THEN v_amount := NULL; END;
    IF v_amount IS NULL OR (v_amount<0 AND v_action='SET_BALANCE') THEN
      PERFORM jse_fail('INVALID_AMOUNT','Enter a balance from \u20B90 to \u20B91 crore.',400);
    END IF;
    IF v_action='ADJUST_CASH' AND v_amount=0 THEN PERFORM jse_fail('INVALID_AMOUNT','Enter a non-zero cash adjustment.',400); END IF;
    v_after := CASE WHEN v_action='SET_BALANCE' THEN v_amount ELSE t.cash+v_amount END;
    IF v_after<0 OR v_after>v_cash_limit THEN
      PERFORM jse_fail('CASH_LIMIT','BIG BULL cash must stay between \u20B90 and \u20B91 crore.',400);
    END IF;
    v_delta := v_after-t.cash;
    IF v_delta<>0 THEN
      UPDATE teams SET cash=v_after, updated_at=now() WHERE id=t.id;
      INSERT INTO cash_ledger(team_id,entry_type,debit,credit,balance_after,note,actor_id,actor_name)
      VALUES(t.id,'ADJUSTMENT',greatest(-v_delta,0),greatest(v_delta,0),v_after,
        'BIG BULL admin '||lower(v_action)||': '||v_reason,nullif(a->>'id','')::integer,jse_actor_name(a));
      PERFORM jse_audit(a,CASE WHEN v_action='SET_BALANCE' THEN 'BIG_BULL_BALANCE_SET' ELSE 'BIG_BULL_CASH_ADJUSTED' END,
        'team',t.code,t.id,NULL,jsonb_build_object('cash',t.cash),jsonb_build_object('cash',v_after),
        jsonb_build_object('reason',v_reason,'amount',v_amount,'action',v_action));
    END IF;
  ELSE
    PERFORM jse_fail('INVALID_ACTION','Use STATE, UPDATE_ACCOUNT, SET_BALANCE or ADJUST_CASH.',400);
  END IF;

  SELECT * INTO t FROM teams WHERE id=t.id;
  SELECT * INTO b FROM brokers WHERE id=t.broker_id;
  RETURN jsonb_build_object('success',true,'cash',t.cash,'account',jsonb_build_object(
    'team_number',t.seq,'team_code',t.code,'display_name',t.name,'broker_number',b.id,'broker_code',b.code,
    'broker_name',b.name,'cash',t.cash,'cash_limit',v_cash_limit,'active',t.active,'section',t.section,'members',t.members));
END $$;

INSERT INTO schema_migrations(version) VALUES ('012_big_bull_admin');
`;var nr=`-- One-time import of the official Dalal Street roster (73 teams) plus BIG BULL as Team 1.
-- Existing financial histories are preserved; only roster identity/assignment and active flags change.
INSERT INTO broker_roster_aliases(broker_number,broker_code,broker_name,internal_broker_id)
SELECT 11,'SIDDHARTH','SIDDHARTH',id FROM brokers WHERE code='BROKER-11'
ON CONFLICT (broker_number) DO UPDATE SET broker_code=EXCLUDED.broker_code,
 broker_name=EXCLUDED.broker_name,internal_broker_id=EXCLUDED.internal_broker_id;

WITH raw AS (
 SELECT line, ord FROM unnest(string_to_array($roster$Apala|Vidura|K + K|Krishnangshu Sarkar / Gourav V Rao
Dignaga|Vidura|D + A|Karanam Seebivamsikrishna / Shreya C
Kanada|Vidura|O + O|Juhi Moudekar / Sidharrth Rao
Kapila|Vidura|I + I|Swaroop Rao T / Rohit B
Khana|Vidura|J + J|Yuvaraj Suresh Bangera / Neeraj Kamath
Matanga|Vidura|O + O|Shraddha Yadav / Chinmay B Arya
Vagbhata|Vidura|C + M|Manisha Raj / Suhas vardhan
Artha|Yash|M + D|Likitesh / Lakshna. S
Dhriti|Yash|I + I|Jothish N / S S S Surya
Kosh|Yash|L + L|Bhoomika Venkatachala Bhat / Mitali Basavaraj Devagi
Mangala|Yash|F + F|Vishal Bhaskaran / A Tarakeshwar
Nishtha|Yash|E + E|Thamizh Selvan E / Sri viswanath
Nyaya|Yash|D + D|LIJIN LAKSHMANAN / Albin Sanjay P
Rajat|Yash|P + P|Greeshma R / Disha M
Valabhi|Yash|F + F|Aishwarya B M / Poorvitha
Koshya|Ganita|O + O|Drushya A / Supreeth Shekar S
Madhava|Ganita|N + N|Ajay M / PRANAV S R
Panini|Ganita|L + L|Arundhathy V Nambi / Aakash Darsan P M
Sangita|Ganita|P + P|Pasupathi R / R Megha
Sutra|Ganita|M + M|Joshiya J / Indhu Shree Raj Kumar
Virahanka|Ganita|N + M|Mohammed Riyaz / Arshiya Kausar
Yukti|Ganita|H + J|Koushik Gali / Kumar Vayur
Abhyasa|Prajna|R + R|Tanish Milind Salunkhe / John Tophy
Ghosha|Prajna|C + C|SHASWAT AGRAWAL / Mohammed Haseeb Ahmed
Jaya|Prajna|K + K|Shreya j hegde / Nidhi shetty
Jya|Prajna|N + N|Rion Dsouza / Suraj
Shree|Prajna|N + N|Rohan J / Abishek R
Utsaha|Prajna|M + M|K PRANAVI / DARUNIKA R
Viveka|Prajna|M + M|Aaditya Mehra / Madiya Mehraj
Bhamaha|Madhava|K + K|Muhammad Irfan / Kumaraguru
Kuttaka|Madhava|P + P|Kunj Punith Kumar Maru / Raunak Bajaj
Lopamudra|Madhava|K + B|Varun Nayak / Satvik B Bellad
Medha|Madhava|D + D|Pulagam hasini / Anusha dumpala
Nirukta|Madhava|Q + Q|Hem b davey / Ramcharan
Nivesh|Madhava|A + A|K S Monish Kumar / Guruprasad V
Vasubandhu|Madhava|K + L|Bhoomika GS / M.Madhu vandhan
Vyaya|Madhava|L + L|Yoga Shree R R / Janani Suresh
Avvaiyar|Amrit|P + P|Anusha V Bhat / VIJAY ANANTH J
Dhan|Amrit|D + D|Abhishek Nagori / Advaith R
Halayudha|Amrit|G + G|Lithin H Raju / Tarun P
Maitreyi|Amrit|P + P|Mohammad Saif / Anirudh Rao
Mithila|Amrit|D + D|Sourabh Toppo / Ramkrishna Kamlakar Rao
Nilakantha|Amrit|L + L|Sri Seshasaini G / Sadhana B
Tanka|Amrit|J + J|Nichhanametla Harshita / Prachi kashyap
Charaka|Arohan|J + J|Kartik Revankar / Payal manna
Kautilya|Arohan|F + F|Mohammed Farhan Ulla / Aviral Singh
Kriya|Arohan|K + K|Soham Organtiwar / Shikhar Sampann
Labhya|Arohan|N + G|Siddannagari Reddeppa Reddy Nandini / Tallapalle Sai Vyshnavi
Mudra|Arohan|H + H|Mohammed raza / Ashit singla
Nidhi|Arohan|F + F|Prajwal M Bharadwaj / Samyak Shrivastav
Sridhara|Arohan|G + G|Almeera S / Sugumaran
Akshaya|Suvarna|L + L|Devansh Srivastava / Shreya Shukla
Aryabhata|Suvarna|I + O|Swaroop mahadev pujari / Gayana N
Aryadeva|Suvarna|B + B|Aashish Reddy / Kailesh b
Dandin|Suvarna|Q + I|Manjunath Gaddad / Midhat Rahman
Sushruta|Suvarna|D + D|Arsha.P.R / Harini S M
Tantra|Suvarna|O + O|Mohammed Samadul Zain S / Shivam Periwal
Vastu|Suvarna|D + D|Shraddha Dey / Pamela Pramanick
Chandas|Kalidasa|M + M|Mohammed Riyaz K / Manisha Kumari
Kamandaka|Kalidasa|M + Q|Srishti sinha / Ashmeet kaur
Munjala|Kalidasa|A + A|Lokesh P / MALLAMMA BASAVARAJ NITALI
Sankalpa|Kalidasa|F + M|DAKSHATA C A / SURYAPRAKASH V
Shilpa|Kalidasa|L + L|Azwath Roshan / Rithika B
Vidura|Kalidasa|C + C|Tejas Thimmaiah / Tushar Biswas
Vriddhi|Kalidasa|J + J|Kiran prasaath / Balaji T
Jaimini|Vikas|N + N|Astha Jain / K M Prajwal
Labh|Vikas|L + L|Aditya raj / Abhijit Chakraborty
Neeti|Vikas|B + B|SESHATHRI BALAN G / Sasi Naga Kiran Godavarthi
Neetiya|Vikas|L + L|RAHUL TL / Shriharan RK T
Pingala|Vikas|E + E|Praveen / Rahul Kunar
Pramana|Vikas|K + K|Tanushka Rajesh Chugh / Prince Raj
Rupa|Vikas|F + J|Ashutosh Padhy / Swayam Sahu
Shiksha|Vikas|M + M|Samhita hegde / D ABHIRAMA SHASTRY$roster$, E'\\n')) WITH ORDINALITY AS x(line,ord)
 WHERE btrim(line)<>''
), roster AS (
 SELECT ord::integer+1 AS team_no, split_part(line,'|',1) AS name,
  split_part(line,'|',2) AS broker_code, split_part(line,'|',3) AS section,
  split_part(line,'|',4) AS members FROM raw
)
INSERT INTO team_name_pool(name,category,meaning,active)
SELECT r.name,'ROSTER','Official Dalal Street 2026 participant team',true
FROM roster r WHERE NOT EXISTS (SELECT 1 FROM team_name_pool p WHERE lower(p.name)=lower(r.name));

UPDATE teams SET name='__DALAL_ROSTER_TMP__' || seq, updated_at=now() WHERE seq BETWEEN 2 AND 100;

WITH raw AS (
 SELECT line, ord FROM unnest(string_to_array($roster$Apala|Vidura|K + K|Krishnangshu Sarkar / Gourav V Rao
Dignaga|Vidura|D + A|Karanam Seebivamsikrishna / Shreya C
Kanada|Vidura|O + O|Juhi Moudekar / Sidharrth Rao
Kapila|Vidura|I + I|Swaroop Rao T / Rohit B
Khana|Vidura|J + J|Yuvaraj Suresh Bangera / Neeraj Kamath
Matanga|Vidura|O + O|Shraddha Yadav / Chinmay B Arya
Vagbhata|Vidura|C + M|Manisha Raj / Suhas vardhan
Artha|Yash|M + D|Likitesh / Lakshna. S
Dhriti|Yash|I + I|Jothish N / S S S Surya
Kosh|Yash|L + L|Bhoomika Venkatachala Bhat / Mitali Basavaraj Devagi
Mangala|Yash|F + F|Vishal Bhaskaran / A Tarakeshwar
Nishtha|Yash|E + E|Thamizh Selvan E / Sri viswanath
Nyaya|Yash|D + D|LIJIN LAKSHMANAN / Albin Sanjay P
Rajat|Yash|P + P|Greeshma R / Disha M
Valabhi|Yash|F + F|Aishwarya B M / Poorvitha
Koshya|Ganita|O + O|Drushya A / Supreeth Shekar S
Madhava|Ganita|N + N|Ajay M / PRANAV S R
Panini|Ganita|L + L|Arundhathy V Nambi / Aakash Darsan P M
Sangita|Ganita|P + P|Pasupathi R / R Megha
Sutra|Ganita|M + M|Joshiya J / Indhu Shree Raj Kumar
Virahanka|Ganita|N + M|Mohammed Riyaz / Arshiya Kausar
Yukti|Ganita|H + J|Koushik Gali / Kumar Vayur
Abhyasa|Prajna|R + R|Tanish Milind Salunkhe / John Tophy
Ghosha|Prajna|C + C|SHASWAT AGRAWAL / Mohammed Haseeb Ahmed
Jaya|Prajna|K + K|Shreya j hegde / Nidhi shetty
Jya|Prajna|N + N|Rion Dsouza / Suraj
Shree|Prajna|N + N|Rohan J / Abishek R
Utsaha|Prajna|M + M|K PRANAVI / DARUNIKA R
Viveka|Prajna|M + M|Aaditya Mehra / Madiya Mehraj
Bhamaha|Madhava|K + K|Muhammad Irfan / Kumaraguru
Kuttaka|Madhava|P + P|Kunj Punith Kumar Maru / Raunak Bajaj
Lopamudra|Madhava|K + B|Varun Nayak / Satvik B Bellad
Medha|Madhava|D + D|Pulagam hasini / Anusha dumpala
Nirukta|Madhava|Q + Q|Hem b davey / Ramcharan
Nivesh|Madhava|A + A|K S Monish Kumar / Guruprasad V
Vasubandhu|Madhava|K + L|Bhoomika GS / M.Madhu vandhan
Vyaya|Madhava|L + L|Yoga Shree R R / Janani Suresh
Avvaiyar|Amrit|P + P|Anusha V Bhat / VIJAY ANANTH J
Dhan|Amrit|D + D|Abhishek Nagori / Advaith R
Halayudha|Amrit|G + G|Lithin H Raju / Tarun P
Maitreyi|Amrit|P + P|Mohammad Saif / Anirudh Rao
Mithila|Amrit|D + D|Sourabh Toppo / Ramkrishna Kamlakar Rao
Nilakantha|Amrit|L + L|Sri Seshasaini G / Sadhana B
Tanka|Amrit|J + J|Nichhanametla Harshita / Prachi kashyap
Charaka|Arohan|J + J|Kartik Revankar / Payal manna
Kautilya|Arohan|F + F|Mohammed Farhan Ulla / Aviral Singh
Kriya|Arohan|K + K|Soham Organtiwar / Shikhar Sampann
Labhya|Arohan|N + G|Siddannagari Reddeppa Reddy Nandini / Tallapalle Sai Vyshnavi
Mudra|Arohan|H + H|Mohammed raza / Ashit singla
Nidhi|Arohan|F + F|Prajwal M Bharadwaj / Samyak Shrivastav
Sridhara|Arohan|G + G|Almeera S / Sugumaran
Akshaya|Suvarna|L + L|Devansh Srivastava / Shreya Shukla
Aryabhata|Suvarna|I + O|Swaroop mahadev pujari / Gayana N
Aryadeva|Suvarna|B + B|Aashish Reddy / Kailesh b
Dandin|Suvarna|Q + I|Manjunath Gaddad / Midhat Rahman
Sushruta|Suvarna|D + D|Arsha.P.R / Harini S M
Tantra|Suvarna|O + O|Mohammed Samadul Zain S / Shivam Periwal
Vastu|Suvarna|D + D|Shraddha Dey / Pamela Pramanick
Chandas|Kalidasa|M + M|Mohammed Riyaz K / Manisha Kumari
Kamandaka|Kalidasa|M + Q|Srishti sinha / Ashmeet kaur
Munjala|Kalidasa|A + A|Lokesh P / MALLAMMA BASAVARAJ NITALI
Sankalpa|Kalidasa|F + M|DAKSHATA C A / SURYAPRAKASH V
Shilpa|Kalidasa|L + L|Azwath Roshan / Rithika B
Vidura|Kalidasa|C + C|Tejas Thimmaiah / Tushar Biswas
Vriddhi|Kalidasa|J + J|Kiran prasaath / Balaji T
Jaimini|Vikas|N + N|Astha Jain / K M Prajwal
Labh|Vikas|L + L|Aditya raj / Abhijit Chakraborty
Neeti|Vikas|B + B|SESHATHRI BALAN G / Sasi Naga Kiran Godavarthi
Neetiya|Vikas|L + L|RAHUL TL / Shriharan RK T
Pingala|Vikas|E + E|Praveen / Rahul Kunar
Pramana|Vikas|K + K|Tanushka Rajesh Chugh / Prince Raj
Rupa|Vikas|F + J|Ashutosh Padhy / Swayam Sahu
Shiksha|Vikas|M + M|Samhita hegde / D ABHIRAMA SHASTRY$roster$, E'\\n')) WITH ORDINALITY AS x(line,ord)
 WHERE btrim(line)<>''
), roster AS (
 SELECT ord::integer+1 AS team_no, split_part(line,'|',1) AS name,
  split_part(line,'|',2) AS broker_code, split_part(line,'|',3) AS section,
  split_part(line,'|',4) AS members FROM raw
)
UPDATE teams t SET name=r.name, section=r.section, members=r.members,
 broker_id=a.internal_broker_id, active=true, updated_at=now()
FROM roster r JOIN broker_roster_aliases a ON lower(a.broker_code)=lower(r.broker_code)
WHERE t.seq=r.team_no AND t.seq BETWEEN 2 AND 74;

UPDATE teams SET name='INACTIVE-PLACEHOLDER-' || seq, active=false, updated_at=now() WHERE seq BETWEEN 75 AND 100;
UPDATE teams SET name='BIG BULL', active=true, broker_id=(SELECT id FROM brokers WHERE code='BROKER-11'), updated_at=now()
WHERE seq=1 AND code='TEAM-001';
UPDATE app_users u SET display_name=t.name, active=t.active, updated_at=now()
FROM teams t WHERE u.team_id=t.id AND u.role='PARTICIPANT';
INSERT INTO audit_log(actor_username,actor_role,action,entity,entity_id,details)
VALUES ('roster-migration','ADMIN','OFFICIAL_DALAL_ROSTER_IMPORTED','roster',NULL,
 jsonb_build_object('official_teams',73,'special_participant','1-BIG BULL-11-SIDDHARTH',
 'broker_count',11,'active_team_numbers','1-74','inactive_placeholder_numbers','75-100',
 'financial_history_reset',false,'source','Dalal_Street_Teams(6).xlsx + Dalal_Street_Brokers(5).xlsx'));
INSERT INTO schema_migrations(version) VALUES ('013_dalal_roster');
`;var or=`-- 014: Correct BIG BULL cash ceiling, daily news price cap, and final cash eligibility.
-- Automated price changer configuration/logic is intentionally unchanged.

ALTER TABLE public.jse_special_accounts
  ALTER COLUMN cash_limit SET DEFAULT 10000000;
UPDATE public.jse_special_accounts
  SET cash_limit = 10000000, updated_at = now()
  WHERE account_code = 'BIG-BULL';
UPDATE public.event_config SET cash_rule_limit = 100000 WHERE id = 1;

CREATE OR REPLACE FUNCTION public.jse_special_cash_limit_guard()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE v_limit numeric;
BEGIN
  SELECT cash_limit INTO v_limit FROM public.jse_special_accounts WHERE team_id = NEW.id;
  IF FOUND AND NEW.cash > v_limit THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='BIG BULL cash limit is \u20B91,00,00,000.00; this balance change is blocked.';
  END IF;
  RETURN NEW;
END $function$;

-- Keep the admin function's fallback aligned with the stored \u20B91 crore limit.
DO $do$
DECLARE v_def text;
BEGIN
  SELECT pg_get_functiondef('public.jse_big_bull_admin(jsonb,jsonb)'::regprocedure) INTO v_def;
  IF position('coalesce(v_cash_limit,100000000)' IN v_def) > 0 THEN
    v_def := replace(v_def, 'coalesce(v_cash_limit,100000000)', 'coalesce(v_cash_limit,10000000)');
    EXECUTE v_def;
  END IF;
END $do$;

-- Only the Market News mood bands use the expanded +/-15% range.
CREATE OR REPLACE FUNCTION public.jse_mood_band(p_mood text)
RETURNS numeric[] LANGUAGE sql IMMUTABLE AS $function$
  SELECT CASE upper(replace(trim(p_mood), ' ', '_'))
    WHEN 'VERY_SEVERE'    THEN ARRAY[-15.00, -7.50]
    WHEN 'SEVERE'         THEN ARRAY[-7.49, -5.00]
    WHEN 'NEGATIVE'       THEN ARRAY[-4.99, -1.00]
    WHEN 'NORMAL'         THEN ARRAY[-0.99, 0.99]
    WHEN 'POSITIVE'       THEN ARRAY[1.00, 4.99]
    WHEN 'VERY_POSITIVE'  THEN ARRAY[5.00, 7.49]
    WHEN 'SUPER_POSITIVE' THEN ARRAY[7.50, 15.00]
  END::numeric[]
$function$;

-- A security's news-driven price is constrained to +/-15% of its first active news
-- baseline for the current India-local day. The automated price changer is not changed.
CREATE OR REPLACE FUNCTION public.jse_market_news(a jsonb, p jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  cfg event_config%ROWTYPE; v_status text; s securities%ROWTYPE;
  v_mood text := upper(replace(trim(coalesce(p->>'mood', p->>'severity', '')), ' ', '_'));
  v_headline text := nullif(left(trim(coalesce(p->>'headline', '')), 240), '');
  v_band numeric[]; v_pct numeric; v_new numeric; v_lo numeric; v_hi numeric;
  v_day_start timestamptz; v_day_base numeric; v_daily_cap constant numeric := 15;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL');
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

  v_day_start := date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';
  SELECT previous_price INTO v_day_base
  FROM market_news
  WHERE security_id = s.id
    AND created_at >= v_day_start
    AND created_at < v_day_start + interval '1 day'
    AND reversed_at IS NULL
  ORDER BY created_at, id
  LIMIT 1;
  v_day_base := coalesce(v_day_base, s.price);

  v_pct := round((v_band[1] + random() * (v_band[2] - v_band[1]))::numeric, 2);
  v_new := jse_round_tick(s.price * (1 + v_pct / 100), cfg.price_tick);
  v_lo := ceil(v_day_base * (1 - v_daily_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_hi := floor(v_day_base * (1 + v_daily_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_new := greatest(v_lo, least(v_hi, v_new));
  IF v_new <= 0 THEN v_new := cfg.price_tick; END IF;
  RETURN jse__apply_news_price(a, s, v_mood, v_pct, v_new,
    coalesce(v_headline, initcap(replace(v_mood, '_', ' ')) || ' news on ' || s.name));
END $function$;

INSERT INTO schema_migrations(version) VALUES ('014_big_bull_news_assessment');
`;var _r=`-- 015: Rename broker roster display name only; preserve broker number, code, assignments, and trade history.
UPDATE public.broker_roster_aliases
SET broker_name = 'SUGADEV'
WHERE broker_number = 6
  AND internal_broker_id = 6
  AND lower(broker_code) = 'arohan';
`;var Er=`-- 016: Limit each individual Market News move to +/-10%; retain the +/-15% daily cumulative cap.
CREATE OR REPLACE FUNCTION public.jse_mood_band(p_mood text)
RETURNS numeric[] LANGUAGE sql IMMUTABLE AS $function$
  SELECT CASE upper(replace(trim(p_mood), ' ', '_'))
    WHEN 'VERY_SEVERE'    THEN ARRAY[-10.00, -7.50]
    WHEN 'SEVERE'         THEN ARRAY[-7.49, -5.00]
    WHEN 'NEGATIVE'       THEN ARRAY[-4.99, -1.00]
    WHEN 'NORMAL'         THEN ARRAY[-0.99, 0.99]
    WHEN 'POSITIVE'       THEN ARRAY[1.00, 4.99]
    WHEN 'VERY_POSITIVE'  THEN ARRAY[5.00, 7.49]
    WHEN 'SUPER_POSITIVE' THEN ARRAY[7.50, 10.00]
  END::numeric[]
$function$;

INSERT INTO schema_migrations(version) VALUES ('016_news_single_move_cap');
`;var cr=`-- 017: Make per-team IPO allotments and official broker roster visible on the Portfolio list only.
-- Does not change Team-page/account-page UI or the existing portfolio-detail/account functions.

UPDATE public.broker_roster_aliases
SET broker_name = 'SUGADEV'
WHERE broker_number = 6
  AND lower(broker_code) = 'arohan';

CREATE OR REPLACE FUNCTION public.jse_portfolios(a jsonb, p jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $function$
DECLARE
  v_rows jsonb;
  v_status text;
  cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;

  SELECT jsonb_agg(
    r.m || jsonb_build_object(
      'rank', r.rank_overall,
      'rank_eligible', r.rank_eligible,
      'award', r.award,
      'roster_broker_code', COALESCE(ba.broker_code, r.m->>'broker'),
      'roster_broker_name', COALESCE(ba.broker_name, r.m->>'broker_name'),
      'ipo_allotments', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'symbol', sec.symbol,
          'name', sec.name,
          'lots', al.lots,
          'quantity', al.quantity,
          'price', al.price,
          'amount', al.amount
        ) ORDER BY sec.display_order, al.id)
        FROM public.ipo_allotments al
        JOIN public.securities sec ON sec.id = al.security_id
        WHERE al.team_id = (r.m->>'team_id')::integer
          AND al.reversed_at IS NULL
          AND al.quantity > 0
      ), '[]'::jsonb)
    ) ORDER BY (r.m->>'seq')::integer
  )
  INTO v_rows
  FROM public.jse_ranked_teams() r
  LEFT JOIN public.broker_roster_aliases ba
    ON ba.internal_broker_id = nullif(r.m->>'broker_id','')::integer;

  RETURN jsonb_build_object(
    'success', true,
    'event_status', v_status,
    'final', v_status IN ('CLOSED', 'FINALIZED'),
    'criterion', 'Net Worth = liquid cash + holdings \xD7 closing price (loans are not deducted). Winner = highest eligible Net Worth; Runner-Up = second highest. Ties go to the lower team code.',
    'eligibility_rule', 'Eligible = at least ' || cfg.min_buy_trades || ' settled BUY and ' || cfg.min_sell_trades || ' settled SELL listed-stock trades (IPO allotments do not count)' ||
      CASE WHEN cfg.loan_repayment_required THEN ' + loan fully repaid' ELSE '' END || ' + closing cash rule (base cash \u2264 ' || jse_inr(cfg.cash_rule_limit::bigint) || ', evaluated at close).',
    'initial_capital', cfg.initial_capital,
    'cash_rule_limit', cfg.cash_rule_limit,
    'min_buy_trades', cfg.min_buy_trades,
    'min_sell_trades', cfg.min_sell_trades,
    'loan_repayment_required', cfg.loan_repayment_required,
    'stats', (
      SELECT jsonb_build_object(
        'teams', count(*),
        'total_net_worth', sum(net_worth),
        'average_net_worth', round(avg(net_worth), 2),
        'highest_net_worth', max(net_worth),
        'lowest_net_worth', min(net_worth),
        'total_cash', sum(cash),
        'total_holdings', sum(holdings_value),
        'eligible', count(*) FILTER (WHERE eligible),
        'assessment_met', count(*) FILTER (WHERE assessment_met),
        'loans_unpaid', count(*) FILTER (WHERE NOT loan_repaid),
        'cash_rule_met', count(*) FILTER (WHERE cash_rule_met),
        'cash_rule_not_met', count(*) FILTER (WHERE NOT cash_rule_met),
        'profitable', count(*) FILTER (WHERE pnl > 0),
        'short_sell_attempts', sum(short_sell_attempts),
        'cash_shortfall_attempts', sum(cash_shortfall_attempts),
        'insufficient_balance_rejections', sum(insufficient_balance_rejections),
        'total_brokerage', sum(brokerage_paid),
        'loans_outstanding', sum(loan_principal + loan_interest)
      ) FROM public.jse_team_metrics WHERE active
    ),
    'winner', (
      SELECT m || jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award)
      FROM public.jse_ranked_teams() WHERE award = 'WINNER'
    ),
    'runner_up', (
      SELECT m || jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award)
      FROM public.jse_ranked_teams() WHERE award = 'RUNNER_UP'
    ),
    'teams', COALESCE(v_rows, '[]'::jsonb)
  );
END $function$;

INSERT INTO public.schema_migrations(version) VALUES ('017_portfolio_ipo_visibility');
`;var lr=`-- 018: Apply the official broker-to-team roster, show official broker labels,
-- and count active assigned teams (never inactive placeholders) in commission summaries.
-- Broker 6's official roster contact name is SUGADEV; Aman is no longer used.
UPDATE public.broker_roster_aliases SET broker_name = 'SUGADEV' WHERE broker_number = 6 AND lower(broker_code) = 'arohan';

WITH roster(team_name, broker_code) AS (VALUES
('Viveka','Prajna'),('Jya','Prajna'),('Ghosha','Prajna'),('Shree','Prajna'),('Jaya','Prajna'),('Utsaha','Prajna'),('Abhyasa','Prajna'),
('Panini','Ganita'),('Yukti','Ganita'),('Virahanka','Ganita'),('Sutra','Ganita'),('Koshya','Ganita'),('Madhava','Ganita'),('Sangita','Ganita'),
('Mithila','Amrit'),('Dhan','Amrit'),('Nilakantha','Amrit'),('Maitreyi','Amrit'),('Avvaiyar','Amrit'),('Tanka','Amrit'),('Halayudha','Amrit'),
('Pingala','Vikas'),('Pramana','Vikas'),('Labh','Vikas'),('Jaimini','Vikas'),('Neeti','Vikas'),('Rupa','Vikas'),('Neetiya','Vikas'),('Shiksha','Vikas'),
('Artha','Yash'),('Kosh','Yash'),('Nyaya','Yash'),('Nishtha','Yash'),('Rajat','Yash'),('Mangala','Yash'),('Valabhi','Yash'),('Dhriti','Yash'),
('Kautilya','Arohan'),('Nidhi','Arohan'),('Mudra','Arohan'),('Sridhara','Arohan'),('Labhya','Arohan'),('Charaka','Arohan'),('Kriya','Arohan'),
('Nivesh','Madhava'),('Vasubandhu','Madhava'),('Nirukta','Madhava'),('Medha','Madhava'),('Kuttaka','Madhava'),('Vyaya','Madhava'),('Lopamudra','Madhava'),('Bhamaha','Madhava'),
('Vagbhata','Vidura'),('Apala','Vidura'),('Khana','Vidura'),('Kanada','Vidura'),('Matanga','Vidura'),('Kapila','Vidura'),('Dignaga','Vidura'),
('Sankalpa','Kalidasa'),('Munjala','Kalidasa'),('Vriddhi','Kalidasa'),('Shilpa','Kalidasa'),('Chandas','Kalidasa'),('Kamandaka','Kalidasa'),('Tarka','Kalidasa'),
('Aryadeva','Suvarna'),('Vastu','Suvarna'),('Aryabhata','Suvarna'),('Akshaya','Suvarna'),('Dandin','Suvarna'),('Tantra','Suvarna'),('Sushruta','Suvarna')
)
UPDATE public.teams t
SET broker_id = ba.internal_broker_id, updated_at = now()
FROM roster r
JOIN public.broker_roster_aliases ba ON lower(trim(ba.broker_code)) = lower(trim(r.broker_code))
WHERE lower(trim(t.name)) = lower(trim(r.team_name))
  AND t.active AND t.seq <> 1
  AND t.broker_id IS DISTINCT FROM ba.internal_broker_id;

CREATE OR REPLACE FUNCTION public.jse_commissions(a jsonb, p jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $function$
DECLARE
  v_broker integer;
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(500, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 100)));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'VIEWER');
  IF a->>'role' = 'BROKER' THEN
    v_broker := nullif(a->>'broker_id', '')::integer;
  ELSIF coalesce(p->>'broker', '') <> '' THEN
    SELECT b.id INTO v_broker
    FROM brokers b LEFT JOIN broker_roster_aliases ba ON ba.internal_broker_id = b.id
    WHERE upper(b.code) = upper(trim(p->>'broker'))
       OR upper(ba.broker_code) = upper(trim(p->>'broker'))
    ORDER BY b.id LIMIT 1;
    v_broker := coalesce(v_broker, -1);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'rate', (SELECT brokerage_rate FROM event_config WHERE id = 1),
    'own_broker', CASE WHEN a->>'role' = 'BROKER' THEN (
      SELECT coalesce(ba.broker_code, b.code) FROM brokers b
      LEFT JOIN broker_roster_aliases ba ON ba.internal_broker_id = b.id
      WHERE b.id = v_broker
    ) END,
    'brokers', coalesce((
      SELECT jsonb_agg(x ORDER BY (x->>'rank')::integer)
      FROM (
        SELECT jsonb_build_object(
          'rank', row_number() OVER (ORDER BY coalesce(c.amount, 0) DESC, coalesce(ba.broker_number, 999), b.code),
          'broker', b.code,
          'broker_number', coalesce(ba.broker_number, 999),
          'display_code', coalesce(ba.broker_code, b.code),
          'name', coalesce(ba.broker_name, b.name),
          'teams', (SELECT count(*) FROM teams t WHERE t.broker_id = b.id AND t.active),
          'orders', coalesce(c.n, 0),
          'buy_orders', coalesce(c.nb, 0),
          'sell_orders', coalesce(c.ns, 0),
          'buy_volume', coalesce(c.bv, 0),
          'sell_volume', coalesce(c.sv, 0),
          'buy_quantity', coalesce(c.bq, 0),
          'sell_quantity', coalesce(c.sq, 0),
          'total_trade_value', coalesce(c.tv, 0),
          'brokerage_earned', coalesce(c.amount, 0),
          'pending_orders', (
            SELECT count(*) FROM orders o
            WHERE o.broker_id = b.id
              AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')
          )
        ) AS x
        FROM brokers b
        LEFT JOIN broker_roster_aliases ba ON ba.internal_broker_id = b.id
        LEFT JOIN (
          SELECT bc.broker_id, count(*) n,
            count(*) FILTER (WHERE bc.side = 'BUY') nb,
            count(*) FILTER (WHERE bc.side = 'SELL') ns,
            sum(bc.trade_value) FILTER (WHERE bc.side = 'BUY') bv,
            sum(bc.trade_value) FILTER (WHERE bc.side = 'SELL') sv,
            sum(o.quantity) FILTER (WHERE bc.side = 'BUY') bq,
            sum(o.quantity) FILTER (WHERE bc.side = 'SELL') sq,
            sum(bc.trade_value) tv, sum(bc.amount) amount
          FROM broker_commissions bc JOIN orders o ON o.id = bc.order_id
          WHERE bc.reversed_at IS NULL GROUP BY bc.broker_id
        ) c ON c.broker_id = b.id
        WHERE a->>'role' <> 'BROKER' OR b.id = v_broker
      ) q
    ), '[]'::jsonb),
    'transactions_total', (
      SELECT count(*) FROM broker_commissions bc
      WHERE v_broker IS NULL OR bc.broker_id = v_broker
    ),
    'page', v_page, 'page_size', v_size,
    'transactions', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'created_at', bc.created_at, 'broker', b.code,
        'broker_display_code', coalesce(ba.broker_code, b.code),
        'broker_name', coalesce(ba.broker_name, b.name),
        'order_no', o.order_no, 'account_type', o.account_type,
        'counterparty', CASE WHEN o.account_type = 'INSTITUTION' THEN 'Institutional investor' ELSE 'Market' END,
        'team', t.code, 'team_name', t.name, 'symbol', s.symbol, 'security', s.name,
        'side', bc.side, 'quantity', o.quantity, 'price', o.price,
        'trade_value', bc.trade_value, 'rate', bc.rate, 'amount', bc.amount,
        'status', CASE WHEN bc.reversed_at IS NULL THEN 'SETTLED' ELSE 'REVERSED' END,
        'reversed_at', bc.reversed_at
      ) ORDER BY bc.id DESC)
      FROM (
        SELECT * FROM broker_commissions
        WHERE v_broker IS NULL OR broker_id = v_broker
        ORDER BY id DESC LIMIT v_size OFFSET (v_page - 1) * v_size
      ) bc
      JOIN brokers b ON b.id = bc.broker_id
      LEFT JOIN broker_roster_aliases ba ON ba.internal_broker_id = b.id
      JOIN orders o ON o.id = bc.order_id JOIN teams t ON t.id = bc.team_id
      JOIN securities s ON s.id = o.security_id
    ), '[]'::jsonb),
    'totals', (
      SELECT jsonb_build_object('orders', count(*), 'trade_value', coalesce(sum(trade_value), 0), 'brokerage', coalesce(sum(amount), 0))
      FROM broker_commissions WHERE reversed_at IS NULL AND (v_broker IS NULL OR broker_id = v_broker)
    ),
    'reconciliation', (
      SELECT jsonb_build_object('commission_total', c.total, 'settled_brokerage_total', st.total, 'ok', c.total = st.total)
      FROM (
        SELECT coalesce(sum(amount), 0) total FROM broker_commissions
        WHERE reversed_at IS NULL AND (v_broker IS NULL OR broker_id = v_broker)
      ) c,
      (
        SELECT coalesce(sum(st0.brokerage), 0) total FROM settlements st0
        JOIN orders o0 ON o0.id = st0.order_id
        WHERE st0.reversed_at IS NULL AND o0.broker_id IS NOT NULL
          AND (v_broker IS NULL OR o0.broker_id = v_broker)
      ) st
    ),
    'institutional', (
      SELECT jsonb_build_object('orders', count(*), 'brokerage', coalesce(sum(bc.amount), 0))
      FROM broker_commissions bc JOIN orders o ON o.id = bc.order_id
      WHERE bc.reversed_at IS NULL AND o.account_type = 'INSTITUTION'
        AND (v_broker IS NULL OR bc.broker_id = v_broker)
    )
  );
END
$function$;

INSERT INTO public.schema_migrations(version) VALUES ('018_broker_assignments_and_counts');
`;var dr=`-- 019: IPOs must surface in the top market positions on Start Event;
-- IPO market colour remains measured against the original allotment/issue price.
CREATE OR REPLACE FUNCTION public.jse__list_ipo(a jsonb, p_id integer)
RETURNS jsonb LANGUAGE plpgsql AS $function$
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
  -- Give every IPO a fresh board timestamp even if its new listing price equals issue price.
  -- Board sorts by last_price_change_at, so all four IPOs surface at Start Event and later
  -- stock updates naturally take precedence.
  UPDATE securities
     SET listed_at = clock_timestamp(),
         index_base_price = v_price,
         last_price_change_at = clock_timestamp(),
         updated_at = now()
   WHERE id = s.id;
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
END $function$;

INSERT INTO public.schema_migrations(version) VALUES ('019_ipo_start_market_order');
`;var ur=`-- 020: Remove the outdated "Aman" broker contact display and keep the official Arohan code.
UPDATE public.broker_roster_aliases
SET broker_name = 'SUGADEV'
WHERE broker_number = 6
  AND lower(broker_code) = 'arohan'
  AND broker_name IS DISTINCT FROM 'SUGADEV';

UPDATE public.brokers
SET name = 'SUGADEV'
WHERE id = (SELECT internal_broker_id FROM public.broker_roster_aliases
           WHERE broker_number = 6 AND lower(broker_code) = 'arohan')
  AND name IS DISTINCT FROM 'SUGADEV';

UPDATE public.app_users
SET display_name = 'SUGADEV', updated_at = now()
WHERE role = 'BROKER'
  AND broker_id = (SELECT internal_broker_id FROM public.broker_roster_aliases
                   WHERE broker_number = 6 AND lower(broker_code) = 'arohan')
  AND display_name IS DISTINCT FROM 'SUGADEV';

INSERT INTO public.schema_migrations(version) VALUES ('020_broker_sugadev_name')
ON CONFLICT (version) DO NOTHING;
`;var Nr=`-- 021: Lock the official staging baseline and restore it on every event reset.
-- IPO listing_price intentionally remains editable for the new opening price supplied by Event Admin.
-- The allotment price/amount and all base reference prices are restored from this frozen snapshot.

UPDATE public.broker_roster_aliases
SET broker_name='SUGADEV'
WHERE broker_number=6 AND lower(broker_code)='arohan';

UPDATE public.brokers
SET name='SUGADEV'
WHERE id=(SELECT internal_broker_id FROM public.broker_roster_aliases WHERE broker_number=6 AND lower(broker_code)='arohan')
  AND name IS DISTINCT FROM 'SUGADEV';

UPDATE public.app_users
SET display_name='SUGADEV', updated_at=now()
WHERE role='BROKER'
  AND broker_id=(SELECT internal_broker_id FROM public.broker_roster_aliases WHERE broker_number=6 AND lower(broker_code)='arohan')
  AND display_name IS DISTINCT FROM 'SUGADEV';

-- Titan's current staging price becomes its new base price.
UPDATE public.securities
SET base_price=price, previous_price=price, index_base_price=price, updated_at=now()
WHERE symbol='TITAN' AND kind='EQUITY' AND active;

CREATE TABLE IF NOT EXISTS public.jse_locked_baseline (
  id smallint PRIMARY KEY CHECK (id=1),
  version integer NOT NULL DEFAULT 1,
  snapshot jsonb NOT NULL,
  locked_at timestamptz NOT NULL DEFAULT now(),
  locked_by text NOT NULL DEFAULT 'STAGING BASELINE'
);;

DROP TRIGGER IF EXISTS jse_locked_baseline_no_mutation ON public.jse_locked_baseline;

INSERT INTO public.jse_locked_baseline(id,version,snapshot,locked_by)
VALUES (
  1,1,
  jsonb_build_object(
    'teams', (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id',id,'seq',seq,'code',code,'name',name,'section',section,'members',members,
      'broker_id',broker_id,'active',active
    ) ORDER BY seq),'[]'::jsonb) FROM public.teams),
    'brokers', (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id',id,'code',code,'name',name,'active',active,'contact',contact,'desk',desk
    ) ORDER BY id),'[]'::jsonb) FROM public.brokers),
    'broker_roster_aliases', (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'broker_number',broker_number,'broker_code',broker_code,'broker_name',broker_name,
      'internal_broker_id',internal_broker_id
    ) ORDER BY broker_number),'[]'::jsonb) FROM public.broker_roster_aliases),
    'securities', (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id',id,'kind',kind,'symbol',symbol,'name',name,'sector',sector,
      'base_price',base_price,'lot_size',lot_size,'display_order',display_order,'active',active,
      'ipo_code',ipo_code,'ipo_shares_offered',ipo_shares_offered,'ipo_lot_size',ipo_lot_size
    ) ORDER BY id),'[]'::jsonb) FROM public.securities),
    'ipo_allotments', (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'team_id',team_id,'security_id',security_id,'lots',lots,'quantity',quantity,
      'price',price,'amount',amount,'batch_id',batch_id
    ) ORDER BY id),'[]'::jsonb) FROM public.ipo_allotments WHERE reversed_at IS NULL AND quantity > 0)
  ),
  'LOCKED OFFICIAL ROSTER + INITIAL PRICES + IPO ALLOTMENTS'
)
ON CONFLICT (id) DO NOTHING;

-- Save pre-allotment cash for every team, preserving BIG BULL's current \u20B91 crore starting balance.
UPDATE public.jse_locked_baseline b
SET snapshot = b.snapshot || jsonb_build_object(
  'team_starting_cash',
  (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'team_id', t.id,
      'cash', t.cash + coalesce(al.total_amount, 0)
    ) ORDER BY t.seq), '[]'::jsonb)
   FROM public.teams t
   LEFT JOIN (
     SELECT team_id, sum(amount) total_amount
     FROM public.ipo_allotments
     WHERE reversed_at IS NULL AND quantity > 0
     GROUP BY team_id
   ) al ON al.team_id = t.id)
)
WHERE b.id = 1 AND NOT (b.snapshot ? 'team_starting_cash');

CREATE OR REPLACE FUNCTION public.jse_locked_baseline_immutable()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
  RAISE EXCEPTION 'The staging baseline is locked. Request an explicit baseline update instead.';
END
$function$;

DROP TRIGGER IF EXISTS jse_locked_baseline_no_mutation ON public.jse_locked_baseline;
CREATE TRIGGER jse_locked_baseline_no_mutation
BEFORE UPDATE OR DELETE ON public.jse_locked_baseline
FOR EACH ROW EXECUTE FUNCTION public.jse_locked_baseline_immutable();

CREATE OR REPLACE FUNCTION public.jse_reset_event(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  cfg event_config%ROWTYPE; ev event_control%ROWTYPE;
  v_base jsonb; v_allots jsonb; r jsonb; al ipo_allotments%ROWTYPE; v_n integer := 0; v_archived integer;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF coalesce(p->>'confirm', '') <> 'RESET' THEN PERFORM jse_fail('CONFIRM_REQUIRED', 'Type RESET to confirm.', 400); END IF;
  PERFORM jse_require_admin_password(a, p);
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO ev FROM event_control WHERE id = 1 FOR UPDATE;
  IF ev.status IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_RUNNING', 'Close the market before resetting (current status: ' || replace(ev.status, '_', ' ') || ').', 409);
  END IF;
  LOCK TABLE orders, settlements, holdings, teams, securities, loans, brokers, broker_roster_aliases IN EXCLUSIVE MODE;
  SELECT snapshot INTO v_base FROM public.jse_locked_baseline WHERE id = 1;
  IF v_base IS NULL THEN PERFORM jse_fail('BASELINE_MISSING', 'The locked starting baseline is missing; reset was blocked.', 500); END IF;
  v_allots := coalesce(v_base->'ipo_allotments', '[]'::jsonb);

  PERFORM set_config('jse.maintenance', 'on', true);
  INSERT INTO audit_log_archive SELECT al2.*, now(), ev.reset_count + 1 FROM audit_log al2;
  GET DIAGNOSTICS v_archived = ROW_COUNT;
  TRUNCATE action_journal, broker_commissions, cash_ledger, institution_ledger, loan_transactions, risk_events, price_history,
           market_news, order_events, settlements, holdings, institutional_holdings, ipo_allotments, trading_slips, instructions, orders, audit_log
           RESTART IDENTITY;
  PERFORM set_config('jse.maintenance', 'off', true);

  -- Restore locked roster and broker mappings. Cash/P&L is reset separately below.
  UPDATE teams t SET name = x.name, section = x.section, members = x.members,
      broker_id = x.broker_id, active = x.active, updated_at = now()
  FROM jsonb_to_recordset(v_base->'teams') AS x(id integer, name text, section text, members text, broker_id integer, active boolean)
  WHERE t.id = x.id;
  UPDATE brokers b SET name = x.name, active = x.active, contact = x.contact, desk = x.desk
  FROM jsonb_to_recordset(v_base->'brokers') AS x(id integer, name text, active boolean, contact text, desk text)
  WHERE b.id = x.id;
  DELETE FROM broker_roster_aliases;
  INSERT INTO broker_roster_aliases(broker_number, broker_code, broker_name, internal_broker_id)
  SELECT x.broker_number, x.broker_code, x.broker_name, x.internal_broker_id
  FROM jsonb_to_recordset(v_base->'broker_roster_aliases') AS x(
    broker_number integer, broker_code text, broker_name text, internal_broker_id integer
  );
  -- Restore company identities/base values; retain listing_price for the next START.
  UPDATE securities s SET kind = x.kind, symbol = x.symbol, name = x.name, sector = x.sector,
      base_price = x.base_price, lot_size = x.lot_size, display_order = x.display_order,
      active = x.active, ipo_code = x.ipo_code, ipo_shares_offered = x.ipo_shares_offered,
      ipo_lot_size = x.ipo_lot_size, updated_at = now()
  FROM jsonb_to_recordset(v_base->'securities') AS x(
    id integer, kind text, symbol text, name text, sector text, base_price numeric,
    lot_size integer, display_order integer, active boolean, ipo_code text,
    ipo_shares_offered integer, ipo_lot_size integer
  )
  WHERE s.id = x.id;

  UPDATE teams t SET cash = coalesce(
      (SELECT (x.value->>'cash')::numeric
       FROM jsonb_array_elements(v_base->'team_starting_cash') AS x(value)
       WHERE (x.value->>'team_id')::integer = t.id),
      cfg.initial_capital
    ), realized_pnl = 0, brokerage_paid = 0, short_sell_attempts = 0,
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
  SELECT id, 'INITIAL_CAPITAL', cash, cash, 'Initial event capital', nullif(a->>'id', '')::integer, jse_actor_name(a) FROM teams;
  INSERT INTO institution_ledger(institution_id, entry_type, credit, balance_after, note, actor_id, actor_name)
  SELECT id, 'INITIAL_CAPITAL', initial_cash, initial_cash, 'Initial institutional cash', nullif(a->>'id', '')::integer, jse_actor_name(a) FROM institutions;

  FOR r IN SELECT value FROM jsonb_array_elements(v_allots) LOOP
    INSERT INTO ipo_allotments(team_id, security_id, lots, quantity, price, amount, batch_id, created_by, created_by_name)
    VALUES ((r->>'team_id')::integer, (r->>'security_id')::integer, (r->>'lots')::integer, (r->>'quantity')::integer,
            (r->>'price')::numeric, (r->>'amount')::numeric, r->>'batch_id', nullif(a->>'id', '')::integer, jse_actor_name(a))
    RETURNING * INTO al;
    PERFORM jse__apply_allotment(a, al);
    v_n := v_n + 1;
  END LOOP;

  UPDATE event_control SET status = 'NOT_STARTED', started_at = NULL, paused_at = NULL, closed_at = NULL, finalized_at = NULL,
         status_changed_at = now(), status_changed_by = jse_actor_name(a), reset_count = reset_count + 1, last_reset_at = now(),
         market_updated_at = now() WHERE id = 1;
  PERFORM jse_audit(a, 'EVENT_RESET', 'event', 'event_control', NULL, NULL, jsonb_build_object('status', ev.status),
    jsonb_build_object('status', 'NOT_STARTED'),
    jsonb_build_object('reset_no', ev.reset_count + 1, 'archived_audit_rows', v_archived, 'kept_ipo_allotments', v_n, 'baseline_restored', true,
                       'team_names_locked', cfg.team_names_locked_at IS NOT NULL));
  RETURN jsonb_build_object('success', true, 'status', 'NOT_STARTED', 'reset_no', ev.reset_count + 1, 'kept_ipo_allotments', v_n, 'archived_audit_rows', v_archived);
END $function$;

CREATE OR REPLACE FUNCTION public.jse_admin_state(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
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
      FROM (SELECT * FROM action_journal ORDER BY id DESC) j), '[]'::jsonb),
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
    'brokers', (SELECT jsonb_agg(jsonb_build_object('code', b.code, 'display_code', coalesce(ba.broker_code, b.code), 'name', coalesce(ba.broker_name, b.name), 'contact', b.contact, 'desk', b.desk,
        'teams', (SELECT count(*) FROM teams t WHERE t.broker_id = b.id AND t.active)) ORDER BY coalesce(ba.broker_number, 999), b.code)
      FROM brokers b LEFT JOIN broker_roster_aliases ba ON ba.internal_broker_id = b.id),
    'unassigned_teams', (SELECT count(*) FROM teams WHERE broker_id IS NULL),
    'users', (SELECT jsonb_object_agg(role, n) FROM (SELECT role, count(*) n FROM app_users WHERE active GROUP BY role) u));
END $function$;

INSERT INTO public.schema_migrations(version) VALUES ('021_locked_baseline_reset')
ON CONFLICT (version) DO NOTHING;
`;var pr=`-- 022: Refresh the immutable staging reset baseline to the currently approved data.
-- Preserves official roster assignments, Team 65's current IKS name (Tarka),
-- SUGADEV's broker display name, current base prices, and all uploaded positive IPO allotments.
-- IPO listing_price remains a separate start-event value supplied later by the administrator.

UPDATE public.securities
SET base_price = price,
    previous_price = price,
    index_base_price = price,
    updated_at = now()
WHERE symbol = 'TITAN' AND kind = 'EQUITY' AND active;

UPDATE public.broker_roster_aliases
SET broker_name = 'SUGADEV'
WHERE broker_number = 6 AND lower(broker_code) = 'arohan'
  AND broker_name IS DISTINCT FROM 'SUGADEV';

UPDATE public.brokers
SET name = 'SUGADEV'
WHERE id = (SELECT internal_broker_id FROM public.broker_roster_aliases
            WHERE broker_number = 6 AND lower(broker_code) = 'arohan')
  AND name IS DISTINCT FROM 'SUGADEV';

UPDATE public.app_users
SET display_name = 'SUGADEV', updated_at = now()
WHERE role = 'BROKER'
  AND broker_id = (SELECT internal_broker_id FROM public.broker_roster_aliases
                   WHERE broker_number = 6 AND lower(broker_code) = 'arohan')
  AND display_name IS DISTINCT FROM 'SUGADEV';

DROP TRIGGER IF EXISTS jse_locked_baseline_no_mutation ON public.jse_locked_baseline;

UPDATE public.jse_locked_baseline
SET version = 2,
    locked_at = now(),
    locked_by = 'LOCKED OFFICIAL STAGING BASELINE v2',
    snapshot = jsonb_build_object(
      'teams', (SELECT coalesce(jsonb_agg(jsonb_build_object(
        'id',id,'seq',seq,'code',code,'name',name,'section',section,'members',members,
        'broker_id',broker_id,'active',active
      ) ORDER BY seq),'[]'::jsonb) FROM public.teams),
      'brokers', (SELECT coalesce(jsonb_agg(jsonb_build_object(
        'id',id,'code',code,'name',name,'active',active,'contact',contact,'desk',desk
      ) ORDER BY id),'[]'::jsonb) FROM public.brokers),
      'broker_roster_aliases', (SELECT coalesce(jsonb_agg(jsonb_build_object(
        'broker_number',broker_number,'broker_code',broker_code,'broker_name',broker_name,
        'internal_broker_id',internal_broker_id
      ) ORDER BY broker_number),'[]'::jsonb) FROM public.broker_roster_aliases),
      'securities', (SELECT coalesce(jsonb_agg(jsonb_build_object(
        'id',id,'kind',kind,'symbol',symbol,'name',name,'sector',sector,
        'base_price',base_price,'lot_size',lot_size,'display_order',display_order,'active',active,
        'ipo_code',ipo_code,'ipo_shares_offered',ipo_shares_offered,'ipo_lot_size',ipo_lot_size
      ) ORDER BY id),'[]'::jsonb) FROM public.securities),
      'ipo_allotments', (SELECT coalesce(jsonb_agg(jsonb_build_object(
        'team_id',team_id,'security_id',security_id,'lots',lots,'quantity',quantity,
        'price',price,'amount',amount,'batch_id',batch_id
      ) ORDER BY id),'[]'::jsonb) FROM public.ipo_allotments WHERE reversed_at IS NULL AND quantity > 0),
      'team_starting_cash',
      (SELECT coalesce(jsonb_agg(jsonb_build_object(
          'team_id', t.id,
          'cash', t.cash + coalesce(al.total_amount, 0)
        ) ORDER BY t.seq), '[]'::jsonb)
       FROM public.teams t
       LEFT JOIN (
         SELECT team_id, sum(amount) total_amount
         FROM public.ipo_allotments
         WHERE reversed_at IS NULL AND quantity > 0
         GROUP BY team_id
       ) al ON al.team_id = t.id)
    )
WHERE id = 1;

DROP TRIGGER IF EXISTS jse_locked_baseline_no_mutation ON public.jse_locked_baseline;
CREATE TRIGGER jse_locked_baseline_no_mutation
BEFORE UPDATE OR DELETE ON public.jse_locked_baseline
FOR EACH ROW EXECUTE FUNCTION public.jse_locked_baseline_immutable();

INSERT INTO public.schema_migrations(version) VALUES ('022_locked_baseline_refresh')
ON CONFLICT (version) DO NOTHING;
`;var Tr=`-- 023: Prevent clearing or editing the locked baseline IPO allotments.
-- Event Reset is the only routine action that temporarily truncates and then restores these rows.
CREATE OR REPLACE FUNCTION public.jse_guard_locked_ipo_allotment()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_matches_baseline boolean;
BEGIN
  IF current_setting('jse.maintenance', true) = 'on' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.jse_locked_baseline b
    CROSS JOIN LATERAL jsonb_array_elements(coalesce(b.snapshot->'ipo_allotments','[]'::jsonb)) AS x(value)
    WHERE b.id = 1
      AND (x.value->>'team_id')::integer = OLD.team_id
      AND (x.value->>'security_id')::integer = OLD.security_id
      AND (x.value->>'lots')::integer = OLD.lots
      AND (x.value->>'quantity')::integer = OLD.quantity
      AND (x.value->>'price')::numeric = OLD.price
      AND (x.value->>'amount')::numeric = OLD.amount
      AND coalesce(x.value->>'batch_id','') = coalesce(OLD.batch_id,'')
  ) INTO v_matches_baseline;

  IF v_matches_baseline THEN
    RAISE EXCEPTION 'This IPO allotment is part of the locked baseline. Use Event Reset to restore it; update the baseline only through an explicit administrator change.';
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END
$function$;

DROP TRIGGER IF EXISTS jse_guard_locked_ipo_allotment ON public.ipo_allotments;
CREATE TRIGGER jse_guard_locked_ipo_allotment
BEFORE UPDATE OR DELETE ON public.ipo_allotments
FOR EACH ROW EXECUTE FUNCTION public.jse_guard_locked_ipo_allotment();

INSERT INTO public.schema_migrations(version) VALUES ('023_lock_baseline_ipo_allotments')
ON CONFLICT (version) DO NOTHING;
`;var mr=`-- 024: Keep the official broker roster editable from Event Admin without breaking the
-- internal broker desk identifiers used by accounts, orders, and historical trades.
CREATE OR REPLACE FUNCTION public.jse_update_brokers(a jsonb, p jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
  r jsonb;
  x jsonb;
  v_i integer := 0;
  v_plan jsonb := '[]'::jsonb;
  v_errors jsonb := '[]'::jsonb;
  v_input_code text;
  v_name text;
  b public.brokers%ROWTYPE;
  ali public.broker_roster_aliases%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN
    PERFORM jse_require_admin_password(a, p);
  END IF;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN
    PERFORM jse_fail('NO_ROWS', 'No broker rows were supplied.', 400);
  END IF;

  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    v_input_code := upper(trim(coalesce(r->>'broker', r->>'code', '')));
    SELECT br.* INTO b
      FROM public.brokers br
      LEFT JOIN public.broker_roster_aliases ba ON ba.internal_broker_id = br.id
     WHERE upper(br.code) = v_input_code OR upper(ba.broker_code) = v_input_code
     ORDER BY CASE WHEN upper(ba.broker_code) = v_input_code THEN 0 ELSE 1 END, br.id
     LIMIT 1;
    IF NOT FOUND THEN
      v_errors := v_errors || jsonb_build_object(
        'row', v_i, 'error', 'Unknown official broker code or internal broker code ' ||
        coalesce(nullif(v_input_code, ''), '(blank)')
      );
      CONTINUE;
    END IF;

    SELECT * INTO ali
      FROM public.broker_roster_aliases
     WHERE internal_broker_id = b.id
     ORDER BY broker_number
     LIMIT 1;

    v_name := coalesce(nullif(trim(r->>'name'), ''), ali.broker_name, b.name);
    IF length(v_name) > 120
       OR length(coalesce(r->>'contact', '')) > 200
       OR length(coalesce(r->>'desk', '')) > 120 THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', b.code || ': text too long');
      CONTINUE;
    END IF;

    v_plan := v_plan || jsonb_build_object(
      'id', b.id,
      'internal_code', b.code,
      'broker_number', ali.broker_number,
      'display_code', coalesce(ali.broker_code, b.code),
      'name', v_name,
      'contact', CASE WHEN r ? 'contact' THEN nullif(trim(r->>'contact'), '') ELSE b.contact END,
      'desk', CASE WHEN r ? 'desk' THEN nullif(trim(r->>'desk'), '') ELSE b.desk END,
      'before', jsonb_build_object(
        'name', coalesce(ali.broker_name, b.name),
        'internal_name', b.name,
        'contact', b.contact,
        'desk', b.desk
      )
    );
  END LOOP;

  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_plan) e
     GROUP BY e->>'id' HAVING count(*) > 1
  ) THEN
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', 'A broker code appears more than once in the file');
  END IF;

  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ROSTER_ERRORS',
      'error', 'Nothing was saved. Fix the rows listed and try again.',
      'errors', v_errors,
      'http', 400
    );
  END IF;

  IF coalesce((p->>'dry_run')::boolean, false) THEN
    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_plan), 'preview',
      (SELECT coalesce(jsonb_agg(jsonb_build_object(
        'broker_code', e->'display_code',
        'broker_number', e->'broker_number',
        'broker_name', e->'name',
        'internal_code', e->'internal_code'
      ) ORDER BY (e->>'broker_number')::integer NULLS LAST), '[]'::jsonb)
       FROM jsonb_array_elements(v_plan) e));
  END IF;

  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    UPDATE public.brokers
       SET name = x->>'name',
           contact = x->>'contact',
           desk = x->>'desk'
     WHERE id = (x->>'id')::integer;

    UPDATE public.broker_roster_aliases
       SET broker_name = x->>'name'
     WHERE internal_broker_id = (x->>'id')::integer
       AND broker_name IS DISTINCT FROM x->>'name';

    UPDATE public.app_users
       SET display_name = x->>'name', updated_at = now()
     WHERE role = 'BROKER'
       AND broker_id = (x->>'id')::integer
       AND display_name IS DISTINCT FROM x->>'name';

    IF (x->'before'->>'name') IS DISTINCT FROM x->>'name'
       OR (x->'before'->>'internal_name') IS DISTINCT FROM x->>'name'
       OR (x->'before'->>'contact') IS DISTINCT FROM x->>'contact'
       OR (x->'before'->>'desk') IS DISTINCT FROM x->>'desk' THEN
      PERFORM public.jse_audit(
        a, 'BROKER_UPDATED', 'broker', x->>'display_code',
        NULL, NULL, x->'before',
        jsonb_build_object(
          'name', x->>'name',
          'internal_name', x->>'name',
          'contact', x->>'contact',
          'desk', x->>'desk'
        ), NULL
      );
    END IF;
  END LOOP;

  PERFORM public.jse_audit(
    a, 'BROKERS_UPDATED', 'broker', NULL,
    NULL, NULL, NULL, NULL,
    jsonb_build_object('rows', jsonb_array_length(v_plan))
  );
  RETURN jsonb_build_object('success', true, 'updated', jsonb_array_length(v_plan));
END
$function$;
`;var Rr=`-- 025: Institutional orders have no maximum order-value cap. The institution itself has
-- unlimited cash and holdings; normal participant counterparty settlement rules remain intact.
CREATE OR REPLACE FUNCTION public.jse_place_institutional_order(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
  IF v_tv < cfg.min_order_value THEN
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
END $function$;
;
 
CREATE OR REPLACE FUNCTION public.jse__settle(a jsonb, p_order_id bigint, p_source text DEFAULT 'BANK'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
  IF v_tv < cfg.min_order_value OR (o.account_type <> 'INSTITUTION' AND v_tv > cfg.max_order_value) THEN
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
END $function$;
;
`;var vr=`-- 026: Show borrowed funds still held as cash in the Base Cash Left figure. Loan liability remains separately tracked.
CREATE OR REPLACE FUNCTION public.jse_portfolio_detail(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
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
      'base_money_left', greatest(0, (v_m->>'cash')::numeric - (v_m->>'profit_cash_exempt')::numeric),
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
END $function$;
;
`;var br=`-- 027: Only IPO SELL transactions may use quantities outside the standard lot size.
-- IPO sells still require a positive whole-share quantity, sufficient holdings, and the normal value/settlement rules.
DO $jse_migration$
DECLARE
  v_fn text;
  v_old text;
BEGIN
  v_fn := pg_get_functiondef('public.jse_place_order(jsonb,jsonb)'::regprocedure);
  v_old := $old$IF v_qty % v_sec.lot_size <> 0 THEN$old$;
  IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '027: expected lot check not found in jse_place_order'; END IF;
  v_fn := replace(v_fn, v_old, $new$IF v_qty % v_sec.lot_size <> 0 AND NOT (v_sec.kind = 'IPO' AND v_side = 'SELL') THEN$new$);
  EXECUTE v_fn;

  v_fn := pg_get_functiondef('public.jse_place_institutional_order(jsonb,jsonb)'::regprocedure);
  v_old := $old$IF v_qty IS NULL OR v_qty <= 0 OR v_qty % v_sec.lot_size <> 0 THEN$old$;
  IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '027: expected lot check not found in jse_place_institutional_order'; END IF;
  v_fn := replace(v_fn, v_old, $new$IF v_qty IS NULL OR v_qty <= 0 OR (v_qty % v_sec.lot_size <> 0 AND NOT (v_sec.kind = 'IPO' AND jse_team_side('INSTITUTION', v_side) = 'SELL')) THEN$new$);
  EXECUTE v_fn;

  v_fn := pg_get_functiondef('public.jse_instruction_action(jsonb,jsonb)'::regprocedure);
  v_old := $old$IF v_qty IS NULL OR v_qty <= 0 OR v_qty % s.lot_size <> 0 THEN$old$;
  IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '027: expected lot check not found in jse_instruction_action'; END IF;
  v_fn := replace(v_fn, v_old, $new$IF v_qty IS NULL OR v_qty <= 0 OR (v_qty % s.lot_size <> 0 AND NOT (s.kind = 'IPO' AND v_side = 'SELL')) THEN$new$);
  EXECUTE v_fn;

  v_fn := pg_get_functiondef('public.jse__settle(jsonb,bigint,text)'::regprocedure);
  v_old := $old$IF o.quantity <= 0 OR o.quantity % s.lot_size <> 0 THEN$old$;
  IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '027: expected lot check not found in jse__settle'; END IF;
  v_fn := replace(v_fn, v_old, $new$IF o.quantity <= 0 OR (o.quantity % s.lot_size <> 0 AND NOT (s.kind = 'IPO' AND jse_team_side(o.account_type, o.side) = 'SELL')) THEN$new$);
  EXECUTE v_fn;
END
$jse_migration$;
`;var Ir=`-- 028: Keep each company's Market News price within a permanent +/-15% band from its locked base price.
-- Hitting the band limits price movement in that direction; it does not disable BUY/SELL orders.
DO $jse_migration$
DECLARE
  v_fn text;
  v_old text;
  v_new text;
BEGIN
  v_fn := pg_get_functiondef('public.jse_market_news(jsonb,jsonb)'::regprocedure);

  v_old := $old$  v_day_start := date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';
  SELECT previous_price INTO v_day_base
  FROM market_news
  WHERE security_id = s.id
    AND created_at >= v_day_start
    AND created_at < v_day_start + interval '1 day'
    AND reversed_at IS NULL
  ORDER BY created_at, id
  LIMIT 1;
  v_day_base := coalesce(v_day_base, s.price);$old$;
  v_new := $new$  -- Always anchor the price band to the company's locked starting/base price, not a daily baseline.
  v_day_base := coalesce(s.base_price, s.price);$new$;

  IF position(v_old IN v_fn) > 0 THEN
    v_fn := replace(v_fn, v_old, v_new);
    v_fn := replace(v_fn, 'v_day_start timestamptz; v_day_base numeric;', 'v_band_base numeric;');
    v_fn := replace(v_fn, 'v_day_base', 'v_band_base');
  ELSIF position('v_band_base := coalesce(s.base_price, s.price);' IN v_fn) = 0 THEN
    RAISE EXCEPTION '028: expected Market News daily-baseline logic was not found';
  END IF;

  EXECUTE v_fn;
END
$jse_migration$;

INSERT INTO schema_migrations(version) VALUES ('028_company_base_price_band')
ON CONFLICT (version) DO NOTHING;
`;var Or=`-- 029: Permanently prohibit short selling. Exchange approval cannot override holdings checks.
DO $short_sell_fix$
DECLARE
  v_fn text;
  v_old text;
  v_new text;
BEGIN
  v_fn := pg_get_functiondef('public.jse_exchange_decide(jsonb,jsonb)'::regprocedure);
  v_old := $old$      IF o.quantity > v_avail.available THEN
        IF NOT v_confirm THEN
          RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_CONFIRM_REQUIRED', HINT = '409',
            MESSAGE = 'SHORT SELLING: the team can sell only ' || greatest(v_avail.available, 0) || ' shares (holding ' || v_avail.holding ||
                      '). Normal participant short selling is prohibited. Approve it explicitly only as an Exchange override \u2014 it is recorded as SHORT SELLING \u2014 EXCHANGE APPROVED and the Bank still rejects it unless the holding is sufficient at settlement.';
        END IF;
        UPDATE orders SET short_sell_flag = true, short_sell_approved = true WHERE id = o.id;
        PERFORM jse_risk(o.team_id, o.id, o.security_id, 'SHORT_SELL_ATTEMPT', 'EXCHANGE', jse_team_side(o.account_type, o.side), o.quantity, v_avail.holding, NULL, NULL, NULL);
        PERFORM jse_audit(a, 'SHORT_SELLING_APPROVED', 'order', o.order_no, o.team_id, o.id, NULL, NULL,
          jsonb_build_object('holding', v_avail.holding, 'quantity', o.quantity, 'open_sell_other', v_avail.open_sell, 'account_type', o.account_type));
      END IF;$old$;
  v_new := $new$      IF o.quantity > greatest(v_avail.available, 0) THEN
        RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELLING_NOT_ALLOWED', HINT = '409',
          MESSAGE = 'SHORT SELLING PROHIBITED: ' || coalesce((SELECT code FROM teams WHERE id = o.team_id), 'team') || ' cannot sell more shares than it owns. Available to sell: ' ||
                    greatest(v_avail.available, 0) || ' (holding ' || v_avail.holding || ', other open sell orders ' || v_avail.open_sell || '). Reject this order or reduce its quantity.';
      END IF;$new$;
  IF position(v_old IN v_fn) = 0 THEN
    RAISE EXCEPTION '029: expected Exchange short-selling override block not found';
  END IF;
  v_fn := replace(v_fn, v_old, v_new);
  v_fn := regexp_replace(v_fn, '  v_confirm boolean := [^;]*;' || chr(10), '');
  v_fn := replace(v_fn, '    -- The Exchange may explicitly approve it (recorded as SHORT SELLING \u2014 EXCHANGE APPROVED); the Bank still' || chr(10) ||
                  '    -- checks the holding at settlement. Institutions have no cash or holdings restriction.' || chr(10),
                  '    -- Short selling is prohibited at every stage; institutional accounts have no independent holdings.' || chr(10));
  IF position('SHORT SELLING \u2014 EXCHANGE APPROVED' IN v_fn) > 0 OR position('confirm_short_sell' IN v_fn) > 0 THEN
    RAISE EXCEPTION '029: Exchange override still present after replacement';
  END IF;
  EXECUTE v_fn;
END
$short_sell_fix$;
INSERT INTO schema_migrations(version) VALUES ('029_no_short_selling_override')
ON CONFLICT (version) DO NOTHING;
`;var Lr=`-- 030: owner-requested market-price, negotiated pair and award-eligibility corrections.
-- Apply through a prepared Neon migration after staging verification; do not run against live traffic.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS negotiated_trade boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION jse_inst_spread_pct() RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT 0.00::numeric $$;
CREATE OR REPLACE FUNCTION jse_inst_price(p_market numeric, p_inst_side text) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT round(p_market, 2) $$;

CREATE OR REPLACE FUNCTION jse_place_order(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE;
  v_status text;
  v_team teams%ROWTYPE;
  v_sec securities%ROWTYPE;
  v_ins instructions%ROWTYPE;
  v_side text := upper(trim(coalesce(p->>'side', '')));
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_qty integer; v_expected numeric; v_rate numeric; v_price numeric; v_negotiated_price numeric;
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
    v_negotiated_price := nullif(p->>'negotiated_price', '')::numeric;
  EXCEPTION WHEN others THEN
    PERFORM jse_fail('INVALID_NUMBER', 'Quantity must be a whole number of shares.', 400);
  END;
  IF v_qty IS NULL OR v_qty <= 0 THEN PERFORM jse_fail('INVALID_QUANTITY', 'Quantity must be a positive number of shares.', 400); END IF;
  IF v_qty % 50 <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' normal market trading uses multiples of 50 shares (50, 100, 150 \u2026).', 400);
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

  IF v_negotiated_price IS NOT NULL THEN
    IF a->>'role' NOT IN ('PIT_MANAGER','ADMIN') THEN PERFORM jse_fail('NEGOTIATED_PRICE_ROLE', 'Only a Pit Manager or Admin may record a negotiated team-to-team price.', 403); END IF;
    IF nullif(p->>'pair_ref','') IS NULL THEN PERFORM jse_fail('NEGOTIATED_PAIR_REQUIRED', 'A negotiated price must be submitted as a paired BUY/SELL trade between two different teams.', 400); END IF;
    IF v_negotiated_price <= 0 OR v_negotiated_price <> trunc(v_negotiated_price) THEN PERFORM jse_fail('INVALID_NEGOTIATED_PRICE', 'Negotiated price must be a positive whole number of rupees.', 400); END IF;
    v_price := v_negotiated_price;
  ELSE
    v_price := v_sec.price;
  END IF;
  v_rate := cfg.brokerage_rate;
  v_tv := round(v_qty * v_price, 2);
  v_brk := round(v_tv * v_rate, 2);
  v_amount := CASE WHEN v_side = 'BUY' THEN v_tv + v_brk ELSE v_tv - v_brk END;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between ' || jse_inr(cfg.min_order_value) || ' and ' || jse_inr(cfg.max_order_value) ||
      ' per order (this order: ' || jse_inr(v_tv) || ').', 400);
  END IF;

  -- P0 financial safety (v3.14): one team's orders are serialised by locking the team row, so two desks cannot sell the
  -- same shares or commit the same cash twice. Short selling and buying beyond free cash are refused here (and again at the Bank).
  PERFORM 1 FROM teams WHERE id = v_team.id FOR UPDATE;
  IF v_price <> trunc(v_price) THEN
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
                     settlement_amount, reference_price, status, negotiated_trade, short_sell_flag, cash_shortfall_flag, notes, pair_ref, idempotency_key,
                     instruction_id, created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'TEAM', v_team.id, v_team.broker_id, v_sec.id, v_side, v_qty, v_price, v_tv, v_brk, v_rate,
          v_amount, v_sec.price, 'EXCHANGE_PENDING', (v_negotiated_price IS NOT NULL), v_short, v_shortfall, left(p->>'notes', 300), left(p->>'pair_ref', 60), v_key,
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

CREATE OR REPLACE FUNCTION jse_place_pair(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  legs jsonb := p->'legs';
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_pair text; r1 jsonb; r2 jsonb; v_sym1 text; v_sym2 text; v_q1 integer; v_q2 integer; v_p1 numeric; v_p2 numeric;
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
  v_sym1 := coalesce(upper(trim(legs->0->>'symbol')), nullif(legs->0->>'security_id',''));
  v_sym2 := coalesce(upper(trim(legs->1->>'symbol')), nullif(legs->1->>'security_id',''));
  v_q1 := nullif(legs->0->>'quantity','')::integer; v_q2 := nullif(legs->1->>'quantity','')::integer;
  v_p1 := nullif(legs->0->>'negotiated_price','')::numeric; v_p2 := nullif(legs->1->>'negotiated_price','')::numeric;
  IF v_sym1 IS DISTINCT FROM v_sym2 OR v_q1 IS NULL OR v_q1 <> v_q2 THEN
    PERFORM jse_fail('INVALID_PAIR', 'Both sides of a negotiated trade must use the same security and share quantity.', 400);
  END IF;
  IF v_p1 IS DISTINCT FROM v_p2 THEN PERFORM jse_fail('INVALID_PAIR', 'Both sides must use the same agreed negotiated price.', 400); END IF;
  IF v_p1 IS NOT NULL AND a->>'role' NOT IN ('PIT_MANAGER','ADMIN') THEN PERFORM jse_fail('NEGOTIATED_PRICE_ROLE', 'Only a Pit Manager or Admin may record a negotiated price.', 403); END IF;
  v_pair := 'PAIR-' || upper(substr(md5(v_key), 1, 8));
  r1 := jse_place_order(a, (legs->0) || jsonb_build_object('pair_ref', v_pair, 'idempotency_key', v_key || ':0'));
  r2 := jse_place_order(a, (legs->1) || jsonb_build_object('pair_ref', v_pair, 'idempotency_key', v_key || ':1'));
  RETURN jsonb_build_object('success', true, 'pair_ref', v_pair, 'legs', jsonb_build_array(r1, r2));
END $$;

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
  v_pair_total integer := 0; v_pair_settled integer := 0;
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
  IF o.quantity <= 0 OR o.quantity % 50 <> 0 THEN
    RETURN jse__bank_reject(a, o, 'INVALID_LOT', 'Normal market trading requires a multiple of 50 shares.', '{}'::jsonb);
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

  -- A negotiated pair updates the public market price only after BOTH matched legs settle successfully.
  IF o.negotiated_trade AND o.pair_ref IS NOT NULL THEN
    SELECT count(*), count(*) FILTER (WHERE status = 'BANK_SETTLED')
      INTO v_pair_total, v_pair_settled
      FROM orders WHERE pair_ref = o.pair_ref AND negotiated_trade AND security_id = o.security_id AND price = o.price;
    IF v_pair_total = 2 AND v_pair_settled = 2 THEN
      PERFORM jse__set_price(a, s.id, o.price, 'NEGOTIATED_TRADE', NULL, s.price);
      UPDATE settlements SET price_after = o.price WHERE order_id IN (SELECT id FROM orders WHERE pair_ref = o.pair_ref AND negotiated_trade);
      s.price := o.price;
    END IF;
  END IF;

  PERFORM jse_order_event(o.id, 'BANK_SETTLED', o.status, 'BANK_SETTLED', a, NULL,
    jsonb_build_object('trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'cash_before', v_cash, 'cash_after', v_cash_after,
                       'loan_drawn', v_draw, 'loan_interest', v_interest));
  PERFORM jse_order_event(o.id, 'HOLDINGS_UPDATED', 'BANK_SETTLED', 'BANK_SETTLED', a,
    t.code || ' cash ' || jse_inr(v_cash) || ' \u2192 ' || jse_inr(v_cash_after) || '; ' || s.symbol || ' holding ' || v_hold || ' \u2192 ' || v_hold_after ||
    '; market price ' || CASE WHEN o.negotiated_trade AND v_pair_total = 2 AND v_pair_settled = 2 THEN 'updated to negotiated trade price ' ELSE 'unchanged at ' END || jse_inr(s.price),
    jsonb_build_object('holding_before', v_hold, 'holding_after', v_hold_after, 'market_price', s.price));
  PERFORM jse_audit(a, 'BANK_SETTLED', 'order', o.order_no, t.id, o.id,
    jsonb_build_object('status', o.status, 'cash', v_cash, 'holding', v_hold),
    jsonb_build_object('status', 'BANK_SETTLED', 'cash', v_cash_after, 'holding', v_hold_after),
    jsonb_build_object('account_type', o.account_type, 'side', o.side, 'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate,
                       'loan_drawn', v_draw, 'interest', v_interest, 'realized_pnl', v_realized, 'market_price', s.price, 'negotiated_trade', o.negotiated_trade, 'pair_ref', o.pair_ref, 'source', p_source));
  PERFORM jse_journal('BANK_SETTLE', v_settle_id, o.order_no || ' settled (' || o.side || ' ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ')',
                      jsonb_build_object('order_id', o.id, 'settlement_id', v_settle_id), a);

  RETURN jsonb_build_object('success', true, 'status', 'BANK_SETTLED', 'settlement_id', v_settle_id,
    'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'cash_before', v_cash, 'cash_after', v_cash_after,
    'loan_drawn', v_draw, 'loan_interest', v_interest, 'realized_pnl', v_realized,
    'holding_before', v_hold, 'holding_after', v_hold_after, 'market_price', s.price, 'order', jse_order_json(o.id));
END $$;

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
  IF v_qty IS NULL OR v_qty <= 0 OR v_qty % 50 <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' normal market trading uses multiples of 50 shares.', 400);
  END IF;
  -- expected_price = the prevailing MARKET price the desk saw (the institutional price is derived from it)
  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'PRICE_CHANGED', HINT = '409',
      MESSAGE = 'MARKET PRICE CHANGED: ' || v_sec.symbol || ' moved from ' || jse_inr(v_expected) || ' to ' || jse_inr(v_sec.price) ||
                ' (Market News). The institutional price is recalculated from the new market price \u2014 review and submit again.';
  END IF;
  v_team_side := jse_team_side('INSTITUTION', v_side);
  v_price := round(v_sec.price, 2);
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
    jsonb_build_object('price', v_price, 'market_price', v_sec.price, 'spread_pct', 0, 'trade_value', v_tv, 'brokerage', v_brk,
                       'institution', v_inst.code));
  PERFORM jse_audit(a, 'INSTITUTIONAL_ORDER_SUBMITTED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'EXCHANGE_PENDING', 'side', v_side, 'team_side', v_team_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_price),
    jsonb_build_object('account_type', 'INSTITUTION', 'institution', v_inst.code, 'counterparty', v_team.code, 'market_price', v_sec.price,
                       'spread_pct', 0, 'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'settlement_amount', v_amount,
                       'broker', (SELECT code FROM brokers WHERE id = v_team.broker_id)));
  RETURN jsonb_build_object('success', true, 'replayed', false, 'order', jse_order_json(v_id), 'warnings', v_warnings);
END $$;

CREATE OR REPLACE FUNCTION public.jse_market_news(a jsonb, p jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  cfg event_config%ROWTYPE; v_status text; s securities%ROWTYPE;
  v_mood text := upper(replace(trim(coalesce(p->>'mood', p->>'severity', '')), ' ', '_'));
  v_headline text := nullif(left(trim(coalesce(p->>'headline', '')), 240), '');
  v_band numeric[]; v_pct numeric; v_new numeric; v_lo numeric; v_hi numeric;
  v_day_start timestamptz; v_day_base numeric; v_daily_cap constant numeric := 15;
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

  v_day_start := date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';
  SELECT previous_price INTO v_day_base
  FROM market_news
  WHERE security_id = s.id
    AND created_at >= v_day_start
    AND created_at < v_day_start + interval '1 day'
    AND reversed_at IS NULL
  ORDER BY created_at, id
  LIMIT 1;
  v_day_base := coalesce(v_day_base, s.price);

  v_pct := round((v_band[1] + random() * (v_band[2] - v_band[1]))::numeric, 2);
  v_new := jse_round_tick(s.price * (1 + v_pct / 100), cfg.price_tick);
  v_lo := ceil(v_day_base * (1 - v_daily_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_hi := floor(v_day_base * (1 + v_daily_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_new := greatest(v_lo, least(v_hi, v_new));
  IF v_new <= 0 THEN v_new := cfg.price_tick; END IF;
  RETURN jse__apply_news_price(a, s, v_mood, v_pct, v_new,
    coalesce(v_headline, initcap(replace(v_mood, '_', ' ')) || ' news on ' || s.name));
END $function$;

CREATE OR REPLACE FUNCTION jse_event_action(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(p->>'action', ''));
  cfg event_config%ROWTYPE;
  v_cur text; v_to text; v_open integer; v_eligible integer; v_candidates integer; v_new_limit numeric; v_listed jsonb := '[]'::jsonb; v_one jsonb; r record; v_names jsonb;
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

    -- Only raise the closing-cash cap when at least two teams meet every other award criterion.
    SELECT count(*) INTO v_candidates FROM jse_team_metrics
      WHERE active AND assessment_met AND (NOT loan_repayment_required OR loan_repaid);
    SELECT count(*) INTO v_eligible FROM jse_team_metrics
      WHERE active AND assessment_met AND (NOT loan_repayment_required OR loan_repaid) AND cash_rule_met;
    IF v_eligible < 2 AND v_candidates >= 2 THEN
      SELECT max(base_cash_counted) INTO v_new_limit FROM (
        SELECT base_cash_counted FROM jse_team_metrics
        WHERE active AND assessment_met AND (NOT loan_repayment_required OR loan_repaid)
        ORDER BY base_cash_counted ASC, code ASC LIMIT 2
      ) eligible_candidates;
      IF v_new_limit IS NOT NULL AND v_new_limit > cfg.cash_rule_limit THEN
        UPDATE event_config SET cash_rule_limit = v_new_limit, updated_at = now() WHERE id = 1;
        PERFORM jse_audit(a, 'CLOSING_CASH_LIMIT_AUTO_RAISED', 'event_config', 'cash_rule_limit', NULL, NULL,
          jsonb_build_object('previous_limit', cfg.cash_rule_limit),
          jsonb_build_object('new_limit', v_new_limit, 'reason', 'At least two eligible awardees required'),
          jsonb_build_object('action', 'FINALIZE'));
        cfg.cash_rule_limit := v_new_limit;
      END IF;
      SELECT count(*) INTO v_eligible FROM jse_team_metrics
        WHERE active AND assessment_met AND (NOT loan_repayment_required OR loan_repaid) AND cash_rule_met;
    END IF;
    IF v_eligible < 2 THEN
      PERFORM jse_fail('NOT_ENOUGH_AWARDEES', 'Cannot finalize with fewer than two eligible teams. The closing-cash limit is raised only when cash is the sole barrier; teams must still meet settled BUY/SELL and loan rules.', 409);
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

INSERT INTO schema_migrations(version) VALUES ('030_negotiated_market_trades');
`;var hr=`-- 031: order accuracy, reconciliation and institutional inventory (21 Oct 2026).
-- Works on the LIVE function definitions (text patches that fail loudly if the expected code is not found) and adds
-- new objects only. Idempotent: safe to re-apply. Never changes cash, holdings, orders, settlements or ledger rows.

-- ---------------------------------------------------------------------------
-- A. Market News price band: permanent \xB115% from the company's locked base price (028 rule).
--    030 re-created jse_market_news with the older daily-baseline logic; restore the base-price anchor.
-- ---------------------------------------------------------------------------
DO $a$
DECLARE v_fn text; v_old text;
BEGIN
  v_fn := pg_get_functiondef('public.jse_market_news(jsonb,jsonb)'::regprocedure);
  v_old := $old$  v_day_start := date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';
  SELECT previous_price INTO v_day_base
  FROM market_news
  WHERE security_id = s.id
    AND created_at >= v_day_start
    AND created_at < v_day_start + interval '1 day'
    AND reversed_at IS NULL
  ORDER BY created_at, id
  LIMIT 1;
  v_day_base := coalesce(v_day_base, s.price);$old$;
  IF position(v_old IN v_fn) > 0 THEN
    v_fn := replace(v_fn, v_old, $new$  -- Always anchor the price band to the company's locked starting/base price, not a daily baseline.
  v_day_base := coalesce(s.base_price, s.price);$new$);
    v_fn := replace(v_fn, 'v_day_start timestamptz; v_day_base numeric;', 'v_band_base numeric;');
    v_fn := replace(v_fn, 'v_day_base', 'v_band_base');
    EXECUTE v_fn;
  ELSIF position('v_band_base := coalesce(s.base_price, s.price);' IN v_fn) = 0 THEN
    RAISE EXCEPTION '031-A: Market News band logic not recognised; not changed';
  END IF;
END $a$;

-- ---------------------------------------------------------------------------
-- B. Negotiated team-to-team price must be within \xB115% of the current market price (order price deviation limit).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_price_deviation_pct() RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT 15::numeric $$;

DO $b$
DECLARE v_fn text; v_old text := '    v_price := v_negotiated_price;';
BEGIN
  v_fn := pg_get_functiondef('public.jse_place_order(jsonb,jsonb)'::regprocedure);
  IF position('NEGOTIATED_PRICE_OUT_OF_BAND' IN v_fn) > 0 THEN RETURN; END IF;
  IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '031-B: negotiated price assignment not found in jse_place_order'; END IF;
  v_fn := replace(v_fn, v_old, v_old || $new$
    IF abs(v_negotiated_price - v_sec.price) > v_sec.price * jse_price_deviation_pct() / 100 THEN
      PERFORM jse_fail('NEGOTIATED_PRICE_OUT_OF_BAND', 'The agreed price ' || jse_inr(v_negotiated_price) || ' is more than ' || jse_price_deviation_pct() ||
        '% away from the current market price ' || jse_inr(v_sec.price) || ' of ' || v_sec.symbol || ' (allowed ' ||
        jse_inr(ceil(v_sec.price * (1 - jse_price_deviation_pct() / 100))) || ' \u2013 ' || jse_inr(floor(v_sec.price * (1 + jse_price_deviation_pct() / 100))) || ').', 409);
    END IF;$new$);
  EXECUTE v_fn;
END $b$;

-- ---------------------------------------------------------------------------
-- C. Institutional inventory (optional per company). No row = unlimited, as before.
--    Institution SELL (team buys) needs inventory; institution BUY (team sells) adds to it. Updated in the same
--    transaction as the settlement, so the trade and the inventory always succeed or fail together.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS institutional_inventory (
  security_id   integer PRIMARY KEY REFERENCES securities(id),
  quantity      integer NOT NULL CHECK (quantity >= 0),
  updated_by    text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION jse__inst_reserved(p_sec integer, p_exclude bigint DEFAULT NULL) RETURNS integer LANGUAGE sql STABLE AS $$
  SELECT coalesce(sum(quantity), 0)::integer FROM orders
  WHERE account_type = 'INSTITUTION' AND side = 'SELL' AND security_id = p_sec
    AND status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING') AND (p_exclude IS NULL OR id <> p_exclude)
$$;

CREATE OR REPLACE FUNCTION jse__inst_order_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE inv integer; v_sym text;
BEGIN
  IF NEW.account_type <> 'INSTITUTION' OR NEW.side <> 'SELL' THEN RETURN NEW; END IF;
  SELECT quantity INTO inv FROM institutional_inventory WHERE security_id = NEW.security_id FOR UPDATE;
  IF NOT FOUND THEN RETURN NEW; END IF;
  IF NEW.quantity > inv - jse__inst_reserved(NEW.security_id, NEW.id) THEN
    SELECT symbol INTO v_sym FROM securities WHERE id = NEW.security_id;
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'INSTITUTION_INVENTORY', HINT = '409',
      MESSAGE = 'The institutional investor has only ' || greatest(inv - jse__inst_reserved(NEW.security_id, NEW.id), 0) || ' ' || v_sym ||
                ' shares available to sell (inventory ' || inv || ', in open orders ' || jse__inst_reserved(NEW.security_id, NEW.id) || ').';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS jse_inst_order_guard_trg ON orders;
CREATE TRIGGER jse_inst_order_guard_trg BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION jse__inst_order_guard();

CREATE OR REPLACE FUNCTION jse__inst_settlement_inventory() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_delta integer; v_left integer; v_sym text;
BEGIN
  IF NEW.account_type IS DISTINCT FROM 'INSTITUTION' THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' AND NEW.reversed_at IS NULL THEN
    v_delta := CASE WHEN NEW.side = 'SELL' THEN -NEW.quantity ELSE NEW.quantity END;
  ELSIF TG_OP = 'UPDATE' AND OLD.reversed_at IS NULL AND NEW.reversed_at IS NOT NULL THEN
    v_delta := CASE WHEN NEW.side = 'SELL' THEN NEW.quantity ELSE -NEW.quantity END;      -- undo of a settlement
  ELSIF TG_OP = 'UPDATE' AND OLD.reversed_at IS NOT NULL AND NEW.reversed_at IS NULL THEN
    v_delta := CASE WHEN NEW.side = 'SELL' THEN -NEW.quantity ELSE NEW.quantity END;      -- redo
  ELSE RETURN NEW;
  END IF;
  UPDATE institutional_inventory SET quantity = quantity + v_delta, updated_at = now() WHERE security_id = NEW.security_id
  RETURNING quantity INTO v_left;
  IF FOUND AND v_left < 0 THEN
    SELECT symbol INTO v_sym FROM securities WHERE id = NEW.security_id;
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'INSTITUTION_INVENTORY', HINT = '409',
      MESSAGE = 'Settlement blocked: the institutional investor does not have enough ' || v_sym || ' shares.';
  END IF;
  RETURN NEW;
EXCEPTION WHEN check_violation THEN
  RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'INSTITUTION_INVENTORY', HINT = '409', MESSAGE = 'Settlement blocked: institutional inventory would become negative.';
END $$;
DROP TRIGGER IF EXISTS jse_inst_settlement_inventory_trg ON settlements;
CREATE TRIGGER jse_inst_settlement_inventory_trg AFTER INSERT OR UPDATE OF reversed_at ON settlements FOR EACH ROW EXECUTE FUNCTION jse__inst_settlement_inventory();

CREATE OR REPLACE FUNCTION jse_institution_inventory(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_action text := upper(coalesce(p->>'action', 'LIST')); s securities%ROWTYPE; v_qty numeric; v_old integer; v_res integer;
BEGIN
  IF v_action = 'LIST' THEN
    PERFORM jse_require_role(a, 'ADMIN', 'VIEWER', 'INSTITUTIONAL');
    RETURN jsonb_build_object('success', true, 'items', coalesce((
      SELECT jsonb_agg(jsonb_build_object('symbol', s2.symbol, 'name', s2.name, 'kind', s2.kind, 'configured', i.security_id IS NOT NULL, 'quantity', i.quantity,
        'reserved', jse__inst_reserved(s2.id), 'available', CASE WHEN i.security_id IS NOT NULL THEN i.quantity - jse__inst_reserved(s2.id) END,
        'updated_by', i.updated_by, 'updated_at', i.updated_at) ORDER BY s2.kind, s2.display_order, s2.symbol)
      FROM securities s2 LEFT JOIN institutional_inventory i ON i.security_id = s2.id WHERE s2.active), '[]'::jsonb));
  END IF;
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  SELECT * INTO s FROM securities WHERE symbol = upper(trim(coalesce(p->>'symbol', '')));
  IF NOT FOUND THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Choose a company.', 404); END IF;
  IF coalesce(trim(p->>'reason'), '') = '' THEN PERFORM jse_fail('REASON_REQUIRED', 'Give a reason for the change.', 400); END IF;
  SELECT quantity INTO v_old FROM institutional_inventory WHERE security_id = s.id FOR UPDATE;
  v_res := jse__inst_reserved(s.id);
  IF v_action = 'SET' THEN
    BEGIN v_qty := (p->>'quantity')::numeric; EXCEPTION WHEN others THEN v_qty := NULL; END;
    IF v_qty IS NULL OR v_qty < 0 OR v_qty <> trunc(v_qty) THEN PERFORM jse_fail('INVALID_QUANTITY', 'Quantity must be a whole number of shares (0 or more).', 400); END IF;
    IF v_qty < v_res THEN PERFORM jse_fail('BELOW_RESERVED', v_res || ' ' || s.symbol || ' shares are already in open institutional sell orders; the inventory cannot be lower.', 409); END IF;
    INSERT INTO institutional_inventory(security_id, quantity, updated_by) VALUES (s.id, v_qty, jse_actor_name(a))
    ON CONFLICT (security_id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_by = EXCLUDED.updated_by, updated_at = now();
  ELSIF v_action = 'UNLIMITED' THEN
    DELETE FROM institutional_inventory WHERE security_id = s.id;
  ELSE PERFORM jse_fail('INVALID_ACTION', 'Choose SET or UNLIMITED.', 400);
  END IF;
  PERFORM jse_audit(a, 'INSTITUTION_INVENTORY_' || v_action, 'security', s.symbol, NULL, NULL, jsonb_build_object('quantity', v_old),
    jsonb_build_object('quantity', CASE WHEN v_action = 'SET' THEN v_qty END), jsonb_build_object('reason', p->>'reason', 'reserved', v_res));
  RETURN jsonb_build_object('success', true, 'symbol', s.symbol, 'quantity', CASE WHEN v_action = 'SET' THEN v_qty END,
    'message', s.symbol || ': institutional inventory ' || CASE WHEN v_action = 'SET' THEN 'set to ' || v_qty::integer || ' shares' ELSE 'unlimited' END || '.');
END $$;

-- ---------------------------------------------------------------------------
-- D. Reconciliation (read-only) and a controlled correction for ledger gaps.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_reconcile(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v jsonb := '[]'::jsonb; v_status text;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  -- orders missing references
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'MISSING_REFERENCE', 'order', o.order_no, 'team', t.code,
      'issue', 'Order is missing its ' || concat_ws(', ', CASE WHEN o.team_id IS NULL THEN 'team' END, CASE WHEN o.security_id IS NULL THEN 'security' END,
                                                        CASE WHEN o.account_type = 'TEAM' AND o.broker_id IS NULL THEN 'broker' END),
      'expected', 'team, security and broker set', 'recorded', NULL, 'recommendation', 'Investigate the order; do not settle it until the reference is fixed.'))
    FROM orders o LEFT JOIN teams t ON t.id = o.team_id WHERE o.team_id IS NULL OR o.security_id IS NULL OR (o.account_type = 'TEAM' AND o.broker_id IS NULL)), '[]'::jsonb);
  -- order broker differs from the team's broker
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'BROKER_MISMATCH', 'order', o.order_no, 'team', t.code, 'issue', 'Order broker differs from the team''s current broker',
      'expected', (SELECT code FROM brokers WHERE id = t.broker_id), 'recorded', (SELECT code FROM brokers WHERE id = o.broker_id),
      'recommendation', 'Usually caused by a later broker reassignment; commissions follow the order''s broker. Confirm with the broker roster.'))
    FROM orders o JOIN teams t ON t.id = o.team_id WHERE o.account_type = 'TEAM' AND o.broker_id IS DISTINCT FROM t.broker_id), '[]'::jsonb);
  -- settled status vs settlement rows
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'SETTLED_WITHOUT_SETTLEMENT', 'order', o.order_no, 'team', t.code, 'issue', 'Order is BANK_SETTLED but has no active settlement',
      'expected', '1 settlement', 'recorded', '0', 'recommendation', 'Review with the Bank; correct the status or re-settle through the Bank desk.'))
    FROM orders o JOIN teams t ON t.id = o.team_id WHERE o.status = 'BANK_SETTLED' AND NOT EXISTS (SELECT 1 FROM settlements s WHERE s.order_id = o.id AND s.reversed_at IS NULL)), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'SETTLEMENT_STATUS', 'order', o.order_no, 'team', t.code, 'issue', 'Active settlement but order status is ' || o.status,
      'expected', 'BANK_SETTLED', 'recorded', o.status, 'recommendation', 'Review the order event history.'))
    FROM settlements s JOIN orders o ON o.id = s.order_id JOIN teams t ON t.id = o.team_id WHERE s.reversed_at IS NULL AND o.status <> 'BANK_SETTLED'), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'DUPLICATE_SETTLEMENT', 'order', o.order_no, 'team', t.code, 'issue', x.n || ' active settlements for one order',
      'expected', '1', 'recorded', x.n::text, 'recommendation', 'Undo the extra settlement through Recovery \xB7 Undo with a reason.'))
    FROM (SELECT order_id, count(*) n FROM settlements WHERE reversed_at IS NULL GROUP BY 1 HAVING count(*) > 1) x JOIN orders o ON o.id = x.order_id JOIN teams t ON t.id = o.team_id), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'SETTLEMENT_ORDER_MISMATCH', 'order', o.order_no, 'team', t.code, 'issue', 'Settlement team, security or quantity differs from the order',
      'expected', o.team_id || '/' || o.security_id || '/' || o.quantity, 'recorded', s.team_id || '/' || s.security_id || '/' || s.quantity, 'recommendation', 'Investigate before any correction.'))
    FROM settlements s JOIN orders o ON o.id = s.order_id JOIN teams t ON t.id = o.team_id
    WHERE s.reversed_at IS NULL AND (s.team_id <> o.team_id OR s.security_id <> o.security_id OR s.quantity <> o.quantity)), '[]'::jsonb);
  -- values
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'TRADE_VALUE', 'order', o.order_no, 'team', t.code, 'issue', 'Trade value \u2260 quantity \xD7 execution price',
      'expected', round(s.quantity * s.price, 2), 'recorded', s.trade_value, 'recommendation', 'Investigate; do not edit history without a compensating correction.'))
    FROM settlements s JOIN orders o ON o.id = s.order_id JOIN teams t ON t.id = o.team_id WHERE s.reversed_at IS NULL AND abs(s.trade_value - round(s.quantity * s.price, 2)) > 0.01), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'BROKERAGE', 'order', o.order_no, 'team', t.code, 'issue', 'Brokerage \u2260 trade value \xD7 the order''s brokerage rate',
      'expected', round(s.trade_value * coalesce(o.brokerage_rate, 0.005), 2), 'recorded', s.brokerage, 'recommendation', 'Compensating ledger correction after review.'))
    FROM settlements s JOIN orders o ON o.id = s.order_id JOIN teams t ON t.id = o.team_id
    WHERE s.reversed_at IS NULL AND abs(s.brokerage - round(s.trade_value * coalesce(o.brokerage_rate, 0.005), 2)) > 0.01), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'SETTLEMENT_WITHOUT_LEDGER', 'order', o.order_no, 'team', t.code, 'issue', 'Settlement has no cash-ledger entry',
      'expected', '\u22651 ledger row', 'recorded', '0', 'recommendation', 'Post a ledger-only correction after confirming the cash balance.'))
    FROM settlements s JOIN orders o ON o.id = s.order_id JOIN teams t ON t.id = o.team_id
    WHERE s.reversed_at IS NULL AND NOT EXISTS (SELECT 1 FROM cash_ledger c WHERE c.settlement_id = s.id)), '[]'::jsonb);
  -- balances
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'CASH_VS_LEDGER', 'order', NULL, 'team', t.code, 'issue', 'Team cash \u2260 sum of its cash-ledger credits \u2212 debits',
      'expected', x.ledger, 'recorded', t.cash, 'difference', t.cash - x.ledger,
      'recommendation', 'If the balance itself is right (e.g. an approved special-account top-up), record the missing movement with a ledger-only correction.'))
    FROM teams t JOIN (SELECT team_id, sum(credit) - sum(debit) ledger FROM cash_ledger GROUP BY 1) x ON x.team_id = t.id WHERE abs(t.cash - x.ledger) > 0.01), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'NEGATIVE_BALANCE', 'order', NULL, 'team', t.code, 'issue', 'Negative cash', 'expected', '\u2265 0', 'recorded', t.cash,
      'recommendation', 'Investigate immediately.')) FROM teams t WHERE t.cash < 0), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'HOLDING_VS_TRADES', 'order', NULL, 'team', t.code, 'issue', s.symbol || ' holding \u2260 settled trades + IPO allotments',
      'expected', z.flows, 'recorded', z.hq, 'recommendation', 'Investigate the security''s settlements for this team.'))
    FROM (SELECT h.team_id, h.security_id, h.quantity hq,
            coalesce((SELECT sum(CASE WHEN jse_team_side(st.account_type, st.side) = 'BUY' THEN st.quantity ELSE -st.quantity END) FROM settlements st
                      WHERE st.team_id = h.team_id AND st.security_id = h.security_id AND st.reversed_at IS NULL), 0)
          + coalesce((SELECT sum(quantity) FROM ipo_allotments al WHERE al.team_id = h.team_id AND al.security_id = h.security_id AND al.reversed_at IS NULL), 0) flows
          FROM (SELECT team_id, security_id, quantity FROM holdings
                UNION SELECT DISTINCT team_id, security_id, 0 FROM settlements WHERE reversed_at IS NULL
                  AND NOT EXISTS (SELECT 1 FROM holdings h2 WHERE h2.team_id = settlements.team_id AND h2.security_id = settlements.security_id)) h) z
    JOIN teams t ON t.id = z.team_id JOIN securities s ON s.id = z.security_id WHERE z.hq <> z.flows), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'NEGATIVE_HOLDING', 'order', NULL, 'team', t.code, 'issue', s.symbol || ' holding is negative', 'expected', '\u2265 0', 'recorded', h.quantity,
      'recommendation', 'Investigate immediately.')) FROM holdings h JOIN teams t ON t.id = h.team_id JOIN securities s ON s.id = h.security_id WHERE h.quantity < 0), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'NEGATIVE_INSTITUTION_INVENTORY', 'order', NULL, 'team', NULL, 'issue', s.symbol || ' institutional inventory is negative',
      'expected', '\u2265 0', 'recorded', i.quantity, 'recommendation', 'Set the inventory in Event Admin.')) FROM institutional_inventory i JOIN securities s ON s.id = i.security_id WHERE i.quantity < 0), '[]'::jsonb);
  -- statuses
  IF v_status IN ('CLOSED', 'FINALIZED') THEN
    v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'OPEN_AFTER_CLOSE', 'order', o.order_no, 'team', t.code, 'issue', 'Order still ' || o.status || ' after the market closed',
        'expected', 'settled or rejected', 'recorded', o.status, 'recommendation', 'Event Admin \u2192 Reject open orders (with a reason), or settle it if it was approved before the close.'))
      FROM orders o JOIN teams t ON t.id = o.team_id WHERE o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')), '[]'::jsonb);
  END IF;
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'PARTICIPANT_ACCOUNT', 'order', NULL, 'team', u.username, 'issue', 'Participant login is not linked to a team',
      'expected', 'team set', 'recorded', NULL, 'recommendation', 'Edit or disable the account.')) FROM app_users u WHERE u.role = 'PARTICIPANT' AND u.team_id IS NULL), '[]'::jsonb);
  RETURN jsonb_build_object('success', true, 'checked_at', now(), 'event_status', v_status, 'issues', v,
    'summary', jsonb_build_object('orders', (SELECT count(*) FROM orders), 'settlements', (SELECT count(*) FROM settlements WHERE reversed_at IS NULL),
      'ledger_rows', (SELECT count(*) FROM cash_ledger), 'teams', (SELECT count(*) FROM teams), 'issues', jsonb_array_length(v)),
    'checks', jsonb_build_array('MISSING_REFERENCE','BROKER_MISMATCH','SETTLED_WITHOUT_SETTLEMENT','SETTLEMENT_STATUS','DUPLICATE_SETTLEMENT','SETTLEMENT_ORDER_MISMATCH',
      'TRADE_VALUE','BROKERAGE','SETTLEMENT_WITHOUT_LEDGER','CASH_VS_LEDGER','NEGATIVE_BALANCE','HOLDING_VS_TRADES','NEGATIVE_HOLDING','NEGATIVE_INSTITUTION_INVENTORY',
      'OPEN_AFTER_CLOSE','PARTICIPANT_ACCOUNT'));
END $$;

-- Ledger-only correction: records a missing cash movement so the ledger explains the balance. Never changes cash.
CREATE OR REPLACE FUNCTION jse_reconcile_correct(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE t teams%ROWTYPE; v_ledger numeric; v_gap numeric; v_kind text := upper(coalesce(p->>'kind', ''));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  IF v_kind <> 'LEDGER_GAP' THEN PERFORM jse_fail('INVALID_KIND', 'Only ledger-gap corrections are supported here; other issues need a review and the normal desk workflow.', 400); END IF;
  IF coalesce(trim(p->>'reason'), '') = '' THEN PERFORM jse_fail('REASON_REQUIRED', 'Give the reason and the approval behind this correction.', 400); END IF;
  SELECT * INTO t FROM teams WHERE code = upper(trim(coalesce(p->>'team', ''))) FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Team not found.', 404); END IF;
  SELECT coalesce(sum(credit) - sum(debit), 0) INTO v_ledger FROM cash_ledger WHERE team_id = t.id;
  v_gap := round(t.cash - v_ledger, 2);
  IF abs(v_gap) < 0.01 THEN PERFORM jse_fail('NOTHING_TO_CORRECT', t.code || ' cash already matches its ledger.', 409); END IF;
  IF nullif(p->>'expected_gap', '') IS NOT NULL AND round((p->>'expected_gap')::numeric, 2) <> v_gap THEN
    PERFORM jse_fail('GAP_CHANGED', 'The difference is now ' || jse_inr(v_gap) || '; reload and review again.', 409);
  END IF;
  PERFORM jse_ledger(t.id, NULL, NULL, 'ADJUSTMENT', greatest(-v_gap, 0), greatest(v_gap, 0), t.cash,
    'Reconciliation (ledger only, cash unchanged): ' || left(trim(p->>'reason'), 240), a);
  PERFORM jse_audit(a, 'RECONCILIATION_LEDGER_CORRECTION', 'team', t.code, t.id, NULL, jsonb_build_object('ledger_sum', v_ledger, 'cash', t.cash),
    jsonb_build_object('ledger_sum', t.cash, 'cash', t.cash), jsonb_build_object('gap', v_gap, 'reason', p->>'reason'));
  RETURN jsonb_build_object('success', true, 'team', t.code, 'gap', v_gap,
    'message', t.code || ': ledger correction of ' || jse_inr(abs(v_gap)) || ' recorded (cash unchanged at ' || jse_inr(t.cash) || ').');
END $$;

INSERT INTO schema_migrations(version) VALUES ('031_order_accuracy') ON CONFLICT DO NOTHING;
`;var Ar=`-- 032: open orders stay valid while their price is within \xB115% of the current market price.
-- A Market News move closes (PRICE_STALE) only the orders whose price is now more than 15% away; the Exchange and the Bank
-- apply the same test. The execution price is always the order's own recorded price \u2014 never silently changed.
-- Text patches on the live functions; idempotent; no data changes.
CREATE OR REPLACE FUNCTION jse_price_out_of_band(p_order_price numeric, p_market numeric) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT p_market IS NULL OR p_market <= 0 OR abs(p_order_price - p_market) > p_market * jse_price_deviation_pct() / 100
$$;

DO $p$
DECLARE v_fn text; r record;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('public.jse__stale_orders(jsonb,integer,numeric,text)', 'AND coalesce(reference_price, price) <> p_new_price', 'AND jse_price_out_of_band(price, p_new_price)'),
    ('public.jse_exchange_decide(jsonb,jsonb)', 'coalesce(o.reference_price, o.price) <> (SELECT price FROM securities WHERE id = o.security_id)', 'jse_price_out_of_band(o.price, (SELECT price FROM securities WHERE id = o.security_id))'),
    ('public.jse__settle(jsonb,bigint,text)', 'IF coalesce(o.reference_price, o.price) <> s.price AND p_source = ''BANK'' THEN', 'IF jse_price_out_of_band(o.price, s.price) AND p_source = ''BANK'' THEN'),
    ('public.jse_pit_action(jsonb,jsonb)', 'IF coalesce(o.reference_price, o.price) <> s.price THEN', 'IF jse_price_out_of_band(o.price, s.price) THEN')
  ) AS x(fn, old, new) LOOP
    IF to_regprocedure(r.fn) IS NULL THEN CONTINUE; END IF;
    v_fn := pg_get_functiondef(r.fn::regprocedure);
    IF position(r.new IN v_fn) > 0 THEN CONTINUE; END IF;
    IF position(r.old IN v_fn) = 0 THEN RAISE EXCEPTION '032: expected stale check not found in %', r.fn; END IF;
    EXECUTE replace(v_fn, r.old, r.new);
  END LOOP;
END $p$;

INSERT INTO schema_migrations(version) VALUES ('032_price_band_orders') ON CONFLICT DO NOTHING;
`;var Sr=`-- 033: admin control-plane settings, configurable regular lots/order quantity and configurable price spread/band.
-- Additive only: preserves existing cash, holdings, orders, settlements, ledgers, price history and audit rows.
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS allow_short_selling boolean NOT NULL DEFAULT false;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS institutional_spread_pct numeric(6,2) NOT NULL DEFAULT 0;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS max_order_quantity integer NOT NULL DEFAULT 250000;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS max_order_price_deviation_pct numeric(6,2) NOT NULL DEFAULT 15;

DO $constraints$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='event_config_institutional_spread_range') THEN
    ALTER TABLE event_config ADD CONSTRAINT event_config_institutional_spread_range CHECK (institutional_spread_pct >= 0 AND institutional_spread_pct <= 10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='event_config_max_order_quantity_positive') THEN
    ALTER TABLE event_config ADD CONSTRAINT event_config_max_order_quantity_positive CHECK (max_order_quantity > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='event_config_order_deviation_range') THEN
    ALTER TABLE event_config ADD CONSTRAINT event_config_order_deviation_range CHECK (max_order_price_deviation_pct > 0 AND max_order_price_deviation_pct <= 15);
  END IF;
END
$constraints$;

CREATE OR REPLACE FUNCTION jse_inst_spread_pct() RETURNS numeric
LANGUAGE sql STABLE AS $$
  SELECT institutional_spread_pct FROM event_config WHERE id=1
$$;

CREATE OR REPLACE FUNCTION jse_inst_price(p_market numeric, p_inst_side text) RETURNS numeric
LANGUAGE sql STABLE AS $$
  SELECT round(p_market * (1 + CASE WHEN p_inst_side='SELL' THEN 1 ELSE -1 END * jse_inst_spread_pct() / 100), 2)
$$;

CREATE OR REPLACE FUNCTION jse_price_deviation_pct() RETURNS numeric
LANGUAGE sql STABLE AS $$
  SELECT max_order_price_deviation_pct FROM event_config WHERE id=1
$$;

CREATE OR REPLACE FUNCTION jse_price_out_of_band(p_order_price numeric, p_market numeric) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT p_market IS NULL OR p_market <= 0
      OR abs(p_order_price-p_market) > p_market * jse_price_deviation_pct() / 100
$$;

-- A real short-selling configuration key exists, but turning it ON is refused until
-- short liability, collateral, covering, valuation, reconciliation and undo/redo are implemented.
-- The engine still has a non-negative holdings constraint and must not silently bypass it.
CREATE OR REPLACE FUNCTION jse_update_config(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  before jsonb; after jsonb; v_status text; cfg event_config%ROWTYPE;
  v_brk numeric; v_loan numeric; v_start timestamptz; v_max numeric; v_min numeric; v_move numeric;
  v_lot integer; v_qty integer; v_company numeric; v_spread numeric; v_deviation numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  SELECT status INTO v_status FROM event_control WHERE id=1;
  SELECT * INTO cfg FROM event_config WHERE id=1;
  SELECT to_jsonb(c)-'updated_at' INTO before FROM event_config c WHERE id=1;
  BEGIN
    v_brk := coalesce(nullif(p->>'brokerage_rate_pct','')::numeric/100, nullif(p->>'brokerage_rate','')::numeric);
    v_loan := coalesce(nullif(p->>'loan_interest_rate_pct','')::numeric/100, nullif(p->>'loan_interest_rate','')::numeric);
    v_start := nullif(p->>'event_start_at','')::timestamptz;
    v_max := nullif(p->>'max_order_value','')::numeric;
    v_min := nullif(p->>'min_order_value','')::numeric;
    v_move := nullif(p->>'max_price_move_pct','')::numeric;
    v_lot := nullif(p->>'stock_lot_size','')::integer;
    v_qty := nullif(p->>'max_order_quantity','')::integer;
    v_company := nullif(p->>'max_company_pct','')::numeric;
    v_spread := nullif(p->>'institutional_spread_pct','')::numeric;
    v_deviation := nullif(p->>'max_order_price_deviation_pct','')::numeric;
  EXCEPTION WHEN others THEN
    PERFORM jse_fail('INVALID_CONFIG','One of the values is not a valid number or date.',400);
  END;

  IF v_status<>'NOT_STARTED' AND (
      (p ? 'initial_capital' AND nullif(p->>'initial_capital','')::numeric IS DISTINCT FROM cfg.initial_capital)
   OR (p ? 'institutional_cash' AND nullif(p->>'institutional_cash','')::numeric IS DISTINCT FROM cfg.institutional_cash)
   OR (p ? 'stock_lot_size' AND nullif(p->>'stock_lot_size','')::integer IS DISTINCT FROM cfg.stock_lot_size)
  ) THEN
    PERFORM jse_fail('EVENT_STARTED','Starting capital and regular trading lot size can only be changed before the event starts; reset only after reviewing event implications.',409);
  END IF;
  IF v_brk IS NOT NULL AND (v_brk<0 OR v_brk>=1) THEN PERFORM jse_fail('INVALID_CONFIG','Brokerage must be between 0% and 100%.',400); END IF;
  IF v_loan IS NOT NULL AND (v_loan<0 OR v_loan>=1) THEN PERFORM jse_fail('INVALID_CONFIG','Loan interest must be between 0% and 100%.',400); END IF;
  IF v_move IS NOT NULL AND (v_move<=0 OR v_move>10) THEN PERFORM jse_fail('INVALID_CONFIG','Maximum Market News movement must be above 0% and at most 10%.',400); END IF;
  IF coalesce(v_min,cfg.min_order_value)>=coalesce(v_max,cfg.max_order_value) THEN PERFORM jse_fail('INVALID_CONFIG','Minimum order value must be lower than the maximum order value.',400); END IF;
  IF v_lot IS NOT NULL AND v_lot<=0 THEN PERFORM jse_fail('INVALID_CONFIG','Regular trading lot size must be a positive whole number.',400); END IF;
  IF v_qty IS NOT NULL AND v_qty<=0 THEN PERFORM jse_fail('INVALID_CONFIG','Maximum order quantity must be a positive whole number.',400); END IF;
  IF v_company IS NOT NULL AND (v_company<0 OR v_company>100) THEN PERFORM jse_fail('INVALID_CONFIG','Maximum company exposure must be between 0% and 100%; 0 disables this cap.',400); END IF;
  IF v_spread IS NOT NULL AND (v_spread<0 OR v_spread>10) THEN PERFORM jse_fail('INVALID_CONFIG','Institutional spread must be between 0% and 10%.',400); END IF;
  IF v_deviation IS NOT NULL AND (v_deviation<=0 OR v_deviation>15) THEN PERFORM jse_fail('INVALID_CONFIG','Maximum order price deviation must be above 0% and at most 15%.',400); END IF;
  IF coalesce((p->>'allow_short_selling')::boolean,false) THEN
    PERFORM jse_fail('SHORT_SELLING_UNAVAILABLE','Allow Short Selling cannot be enabled yet: participant holdings must remain non-negative, and the current system does not have a short-liability, collateral, covering and reversal ledger. Keep the setting OFF.',409);
  END IF;

  UPDATE event_config SET
    event_name = coalesce(nullif(trim(p->>'event_name'),''),event_name),
    event_start_at = coalesce(v_start,event_start_at),
    initial_capital = coalesce(nullif(p->>'initial_capital','')::numeric,initial_capital),
    institutional_cash = coalesce(nullif(p->>'institutional_cash','')::numeric,institutional_cash),
    brokerage_rate = coalesce(v_brk,brokerage_rate),
    stock_lot_size = coalesce(v_lot,stock_lot_size),
    max_order_quantity = coalesce(v_qty,max_order_quantity),
    max_order_price_deviation_pct = coalesce(v_deviation,max_order_price_deviation_pct),
    institutional_spread_pct = coalesce(v_spread,institutional_spread_pct),
    max_company_pct = coalesce(v_company,max_company_pct),
    max_price_move_pct = coalesce(v_move,max_price_move_pct),
    min_order_value = coalesce(v_min,min_order_value),
    max_order_value = coalesce(v_max,max_order_value),
    loan_max_principal = coalesce(nullif(p->>'loan_max_principal','')::numeric,loan_max_principal),
    loan_interest_rate = coalesce(v_loan,loan_interest_rate),
    cash_rule_limit = coalesce(nullif(p->>'cash_rule_limit','')::numeric,cash_rule_limit),
    min_buy_trades = coalesce(nullif(p->>'min_buy_trades','')::integer,min_buy_trades),
    min_sell_trades = coalesce(nullif(p->>'min_sell_trades','')::integer,min_sell_trades),
    ipo_application_hours = coalesce(nullif(p->>'ipo_application_hours','')::numeric,ipo_application_hours),
    loans_enabled = coalesce((p->>'loans_enabled')::boolean,loans_enabled),
    auto_loan_on_settlement = coalesce((p->>'auto_loan_on_settlement')::boolean,auto_loan_on_settlement),
    loan_repayment_required = coalesce((p->>'loan_repayment_required')::boolean,loan_repayment_required),
    institution_overdraft = coalesce((p->>'institution_overdraft')::boolean,institution_overdraft),
    institution_brokerage = coalesce((p->>'institution_brokerage')::boolean,institution_brokerage),
    auto_list_ipos = coalesce((p->>'auto_list_ipos')::boolean,auto_list_ipos),
    allow_short_selling = false,
    min_cash_buffer = 0,
    participant_order_entry = false,
    updated_at = now(), updated_by = jse_actor_name(a)
  WHERE id=1;

  IF p ? 'institutional_cash' AND nullif(p->>'institutional_cash','') IS NOT NULL THEN
    UPDATE institutions SET initial_cash=(p->>'institutional_cash')::numeric;
  END IF;
  SELECT to_jsonb(c)-'updated_at' INTO after FROM event_config c WHERE id=1;
  PERFORM jse_audit(a,'CONFIGURATION_UPDATED','event_config','1',NULL,NULL,before,after,
    jsonb_build_object('changed',(SELECT coalesce(jsonb_agg(k),'[]'::jsonb) FROM jsonb_object_keys(after) k WHERE after->k IS DISTINCT FROM before->k AND k<>'updated_by')));
  RETURN jsonb_build_object('success',true,'config',after);
EXCEPTION WHEN check_violation OR invalid_text_representation OR numeric_value_out_of_range OR invalid_datetime_format THEN
  PERFORM jse_fail('INVALID_CONFIG','One of the values is not valid.',400);
  RETURN NULL;
END $$;

-- Replace the four hard-coded 50-share validations with the centrally configured regular lot,
-- then enforce the maximum share quantity before any reservation/order insert or settlement mutation.
DO $lot_guardrails$
DECLARE
  v_fn text;
  v_old text;
  v_new text;
BEGIN
  -- Broker/Pit order creation
  v_fn := pg_get_functiondef('public.jse_place_order(jsonb,jsonb)'::regprocedure);
  IF position('v_qty % (SELECT stock_lot_size FROM event_config WHERE id=1)' IN v_fn)=0 THEN
    IF position('v_qty % 50 <> 0' IN v_fn)=0 THEN RAISE EXCEPTION '033: regular lot validation anchor not found in jse_place_order'; END IF;
    v_fn := replace(v_fn,'v_qty % 50 <> 0','v_qty % (SELECT stock_lot_size FROM event_config WHERE id=1) <> 0');
    v_fn := replace(v_fn,'normal market trading uses multiples of 50 shares (50, 100, 150 \u2026).','normal market trading must be a multiple of the configured regular lot size.');
  END IF;
  IF position('ORDER_QUANTITY_LIMIT' IN v_fn)=0 THEN
    v_old := '  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN';
    v_new := '  IF v_qty > (SELECT max_order_quantity FROM event_config WHERE id=1) THEN PERFORM jse_fail(''ORDER_QUANTITY_LIMIT'',''Order exceeds the configured maximum share quantity per order.'',400); END IF;' || chr(10) || v_old;
    IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '033: quantity limit anchor not found in jse_place_order'; END IF;
    v_fn := replace(v_fn,v_old,v_new);
  END IF;
  EXECUTE v_fn;

  -- Institutional orders
  v_fn := pg_get_functiondef('public.jse_place_institutional_order(jsonb,jsonb)'::regprocedure);
  IF position('v_qty % (SELECT stock_lot_size FROM event_config WHERE id=1)' IN v_fn)=0 THEN
    IF position('v_qty % 50 <> 0' IN v_fn)=0 THEN RAISE EXCEPTION '033: regular lot validation anchor not found in jse_place_institutional_order'; END IF;
    v_fn := replace(v_fn,'v_qty % 50 <> 0','v_qty % (SELECT stock_lot_size FROM event_config WHERE id=1) <> 0');
    v_fn := replace(v_fn,'normal market trading uses multiples of 50 shares.','normal market trading must be a multiple of the configured regular lot size.');
  END IF;
  IF position('ORDER_QUANTITY_LIMIT' IN v_fn)=0 THEN
    v_old := '  -- expected_price = the prevailing MARKET price the desk saw (the institutional price is derived from it)';
    v_new := '  IF v_qty > (SELECT max_order_quantity FROM event_config WHERE id=1) THEN PERFORM jse_fail(''ORDER_QUANTITY_LIMIT'',''Order exceeds the configured maximum share quantity per order.'',400); END IF;' || chr(10) || v_old;
    IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '033: quantity limit anchor not found in jse_place_institutional_order'; END IF;
    v_fn := replace(v_fn,v_old,v_new);
  END IF;
  EXECUTE v_fn;

  -- Participant instructions use the same configured regular lot as the eventual order.
  -- Flexible IPO allotment lots do not change the lot for later market trades.
  v_fn := pg_get_functiondef('public.jse_instruction_action(jsonb,jsonb)'::regprocedure);
  IF position('v_qty % (SELECT stock_lot_size FROM event_config WHERE id=1)' IN v_fn)=0 THEN
    v_old := 'v_qty % s.lot_size <> 0 AND NOT (s.kind = ''IPO'' AND v_side = ''SELL'')';
    v_new := 'v_qty % (SELECT stock_lot_size FROM event_config WHERE id=1) <> 0';
    IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '033: regular lot validation anchor not found in jse_instruction_action'; END IF;
    v_fn := replace(v_fn,v_old,v_new);
    v_fn := replace(v_fn,'Quantity must be a multiple of '' || s.lot_size || '' shares.','Quantity must be a multiple of '' || (SELECT stock_lot_size FROM event_config WHERE id=1) || '' shares.');
  END IF;
  IF position('ORDER_QUANTITY_LIMIT' IN v_fn)=0 THEN
    v_old := '    SELECT count(*) INTO v_open FROM instructions WHERE team_id = t.id AND status = ''OPEN'';';
    v_new := '    IF v_qty > (SELECT max_order_quantity FROM event_config WHERE id=1) THEN PERFORM jse_fail(''ORDER_QUANTITY_LIMIT'',''Instruction exceeds the configured maximum share quantity per order.'',400); END IF;' || chr(10) || v_old;
    IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '033: quantity limit anchor not found in jse_instruction_action'; END IF;
    v_fn := replace(v_fn,v_old,v_new);
  END IF;
  EXECUTE v_fn;

  -- Bank settlement independently re-validates the same lot and maximum quantity.
  v_fn := pg_get_functiondef('public.jse__settle(jsonb,bigint,text)'::regprocedure);
  IF position('o.quantity % (SELECT stock_lot_size FROM event_config WHERE id=1)' IN v_fn)=0 THEN
    IF position('o.quantity % 50 <> 0' IN v_fn)=0 THEN RAISE EXCEPTION '033: regular lot validation anchor not found in jse__settle'; END IF;
    v_fn := replace(v_fn,'o.quantity % 50 <> 0','o.quantity % (SELECT stock_lot_size FROM event_config WHERE id=1) <> 0');
    v_fn := replace(v_fn,'Normal market trading requires a multiple of 50 shares.','Regular trading quantity must be a multiple of the configured lot size.');
  END IF;
  IF position('ORDER_QUANTITY_LIMIT' IN v_fn)=0 THEN
    v_old := '  IF o.price <= 0 THEN';
    v_new := '  IF o.quantity > (SELECT max_order_quantity FROM event_config WHERE id=1) THEN RETURN jse__bank_reject(a,o,''ORDER_QUANTITY_LIMIT'',''Order exceeds the configured maximum share quantity per order.'',''{}''::jsonb); END IF;' || chr(10) || v_old;
    IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '033: quantity limit anchor not found in jse__settle'; END IF;
    v_fn := replace(v_fn,v_old,v_new);
  END IF;
  EXECUTE v_fn;
END
$lot_guardrails$;

INSERT INTO schema_migrations(version) VALUES ('033_admin_control_plane') ON CONFLICT DO NOTHING;
`;var fr=`-- 034: execution is at the explicit order-ticket price; market moves never reject an order as PRICE_STALE.
-- Keep reference_price for audit/analytics, but do not use it as a submission or settlement veto.
-- The two desks send price (execution price) and expected_price (market reference snapshot).
DO $migration$
DECLARE
  v_fn text;
  v_old text;
  v_new text;
  r record;
BEGIN
  v_fn := pg_get_functiondef('public.jse_place_order(jsonb,jsonb)'::regprocedure);
  v_old := $old$  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'PRICE_CHANGED', HINT = '409',
      MESSAGE = 'MARKET PRICE CHANGED: ' || v_sec.symbol || ' moved from ' || jse_inr(v_expected) || ' to ' || jse_inr(v_sec.price) ||
                ' (Market News). The order was not submitted \u2014 review the new value with the participant and submit again.';
  END IF;$old$;
  v_new := $new$  NULL;$new$;
  IF position(v_new IN v_fn) = 0 THEN
    IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '034: expected jse_place_order price guard not found'; END IF;
    v_fn := replace(v_fn, v_old, v_new);
  END IF;
  v_old := $old$  ELSE
    v_price := v_sec.price;
  END IF;$old$;
  v_new := $new$  ELSE
    v_price := coalesce(nullif(p->>'price', '')::numeric, v_expected, v_sec.price);
  END IF;$new$;
  IF position(v_new IN v_fn) = 0 THEN
    IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '034: expected jse_place_order price assignment not found'; END IF;
    v_fn := replace(v_fn, v_old, v_new);
  END IF;
  v_old := $old$  v_rate := cfg.brokerage_rate;$old$;
  v_new := $new$  IF v_price IS NULL OR v_price <= 0 OR v_price <> trunc(v_price) THEN
    PERFORM jse_fail('INVALID_PRICE', 'Execution price must be a positive whole number of rupees.', 400);
  END IF;
  v_rate := cfg.brokerage_rate;$new$;
  IF position(v_new IN v_fn) = 0 THEN
    IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '034: expected jse_place_order price validation point not found'; END IF;
    v_fn := replace(v_fn, v_old, v_new);
  END IF;
  EXECUTE v_fn;

  v_fn := pg_get_functiondef('public.jse_place_institutional_order(jsonb,jsonb)'::regprocedure);
  v_old := $old$  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'PRICE_CHANGED', HINT = '409',
      MESSAGE = 'MARKET PRICE CHANGED: ' || v_sec.symbol || ' moved from ' || jse_inr(v_expected) || ' to ' || jse_inr(v_sec.price) ||
                ' (Market News). The institutional price is recalculated from the new market price \u2014 review and submit again.';
  END IF;$old$;
  v_new := $new$  NULL;$new$;
  IF position(v_new IN v_fn) = 0 THEN
    IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '034: expected institutional price guard not found'; END IF;
    v_fn := replace(v_fn, v_old, v_new);
  END IF;
  v_old := $old$  v_price := round(v_sec.price, 2);$old$;
  v_new := $new$  v_price := coalesce(nullif(p->>'price', '')::numeric, round(v_sec.price, 2));$new$;
  IF position(v_new IN v_fn) = 0 THEN
    IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '034: expected institutional price assignment not found'; END IF;
    v_fn := replace(v_fn, v_old, v_new);
  END IF;
  v_old := $old$  v_tv := round(v_qty * v_price, 2);$old$;
  v_new := $new$  IF v_price IS NULL OR v_price <= 0 OR v_price <> trunc(v_price) THEN
    PERFORM jse_fail('INVALID_PRICE', 'Execution price must be a positive whole number of rupees.', 400);
  END IF;
  v_tv := round(v_qty * v_price, 2);$new$;
  IF position(v_new IN v_fn) = 0 THEN
    IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '034: expected institutional price validation point not found'; END IF;
    v_fn := replace(v_fn, v_old, v_new);
  END IF;
  EXECUTE v_fn;

  FOR r IN SELECT * FROM (VALUES
    ('public.jse__stale_orders(jsonb,integer,numeric,text)', 'AND jse_price_out_of_band(price, p_new_price)', 'AND /* PRICE_STALE_DISABLED */ false'),
    ('public.jse_exchange_decide(jsonb,jsonb)', 'jse_price_out_of_band(o.price, (SELECT price FROM securities WHERE id = o.security_id))', '/* PRICE_STALE_DISABLED */ false'),
    ('public.jse__settle(jsonb,bigint,text)', 'IF jse_price_out_of_band(o.price, s.price) AND p_source = ''BANK'' THEN', 'IF /* PRICE_STALE_DISABLED */ false THEN'),
    ('public.jse_pit_action(jsonb,jsonb)', 'IF jse_price_out_of_band(o.price, s.price) THEN', 'IF /* PRICE_STALE_DISABLED */ false THEN')
  ) AS x(fn, old, new)
  LOOP
    IF to_regprocedure(r.fn) IS NULL THEN CONTINUE; END IF;
    v_fn := pg_get_functiondef(r.fn::regprocedure);
    IF position(r.old IN v_fn) = 0 THEN
      IF position(r.new IN v_fn) > 0 THEN CONTINUE; END IF;
      RAISE EXCEPTION '034: expected stale-price check not found in %', r.fn;
    END IF;
    EXECUTE replace(v_fn, r.old, r.new);
  END LOOP;
END
$migration$;

INSERT INTO schema_migrations(version) VALUES ('034_entered_price_execution') ON CONFLICT DO NOTHING;
`;var gr=`-- 035: Multi-event registry, per-event state snapshots and database-enforced desk controls.
ALTER TABLE public.event_control
  ADD COLUMN IF NOT EXISTS order_intake_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pit_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS exchange_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS bank_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS instructions_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS market_news_open boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.jse_events (
  id bigserial PRIMARY KEY,
  event_key text NOT NULL UNIQUE DEFAULT ('EVT-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10))),
  event_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED','LIVE','SETTLEMENT_ONLY','CLOSED','FINALIZED')),
  is_active boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  baseline_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  state_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_activated_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS jse_events_one_active_idx ON public.jse_events(is_active) WHERE is_active;
CREATE UNIQUE INDEX IF NOT EXISTS jse_events_name_ci_idx ON public.jse_events(lower(event_name));
CREATE INDEX IF NOT EXISTS jse_events_updated_idx ON public.jse_events(updated_at DESC);

-- Ledger/append-only triggers can be bypassed only inside an explicit atomic event-restore transaction.
CREATE OR REPLACE FUNCTION public.jse_forbid_mutation()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
  IF current_setting('jse.maintenance', true) = 'on' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    IF TG_OP = 'UPDATE' THEN RETURN NEW; END IF;
    RETURN NULL;
  END IF;
  RAISE EXCEPTION '% is append-only; correction must use the audited reversal / event maintenance workflow.', TG_TABLE_NAME;
END
$function$;

-- Event snapshots include cyclic order/instruction/settlement references. Keep FKs valid, but defer checks to COMMIT.
DO $deferred_fks$
DECLARE r record;
BEGIN
  FOR r IN SELECT conrelid::regclass AS tab, conname FROM pg_constraint
    WHERE contype='f' AND connamespace='public'::regnamespace AND NOT condeferrable
  LOOP
    EXECUTE format('ALTER TABLE %s ALTER CONSTRAINT %I DEFERRABLE INITIALLY DEFERRED',r.tab,r.conname);
  END LOOP;
END
$deferred_fks$;

CREATE OR REPLACE FUNCTION public.jse__capture_event_snapshot()
RETURNS jsonb LANGUAGE plpgsql STABLE AS $function$
DECLARE r record; v_rows jsonb; v_snapshot jsonb := '{}'::jsonb;
BEGIN
  FOR r IN SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
      AND table_name NOT IN ('schema_migrations','jse_locked_baseline','jse_events','sessions','audit_log_archive')
    ORDER BY table_name
  LOOP
    IF r.table_name='app_users' THEN
      EXECUTE 'SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.id), ''[]''::jsonb) FROM public.app_users x WHERE x.role <> ''ADMIN''' INTO v_rows;
    ELSE
      EXECUTE format('SELECT coalesce(jsonb_agg(to_jsonb(x)), ''[]''::jsonb) FROM public.%I x',r.table_name) INTO v_rows;
    END IF;
    v_snapshot := v_snapshot || jsonb_build_object(r.table_name,coalesce(v_rows,'[]'::jsonb));
  END LOOP;
  RETURN v_snapshot;
END
$function$;

CREATE OR REPLACE FUNCTION public.jse__capture_event_baseline()
RETURNS jsonb LANGUAGE sql STABLE AS $function$
 SELECT jsonb_build_object(
  'teams',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',t.id,'seq',t.seq,'code',t.code,'name',t.name,'section',t.section,'members',t.members,'broker_id',t.broker_id,'active',t.active) ORDER BY t.seq),'[]'::jsonb) FROM public.teams t),
  'brokers',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',b.id,'code',b.code,'name',b.name,'active',b.active,'contact',b.contact,'desk',b.desk) ORDER BY b.id),'[]'::jsonb) FROM public.brokers b),
  'broker_roster_aliases',(SELECT coalesce(jsonb_agg(jsonb_build_object('broker_number',a.broker_number,'broker_code',a.broker_code,'broker_name',a.broker_name,'internal_broker_id',a.internal_broker_id) ORDER BY a.broker_number),'[]'::jsonb) FROM public.broker_roster_aliases a),
  'securities',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',s.id,'kind',s.kind,'symbol',s.symbol,'name',s.name,'sector',s.sector,'base_price',s.base_price,'lot_size',s.lot_size,'display_order',s.display_order,'active',s.active,'ipo_code',s.ipo_code,'ipo_shares_offered',s.ipo_shares_offered,'ipo_lot_size',s.ipo_lot_size) ORDER BY s.id),'[]'::jsonb) FROM public.securities s),
  'ipo_allotments',(SELECT coalesce(jsonb_agg(jsonb_build_object('team_id',al.team_id,'security_id',al.security_id,'lots',al.lots,'quantity',al.quantity,'price',al.price,'amount',al.amount,'batch_id',al.batch_id) ORDER BY al.id),'[]'::jsonb) FROM public.ipo_allotments al WHERE al.reversed_at IS NULL AND al.quantity>0),
  'team_starting_cash',(SELECT coalesce(jsonb_agg(jsonb_build_object('team_id',t.id,'cash',t.cash+coalesce(al.total_amount,0)) ORDER BY t.seq),'[]'::jsonb)
    FROM public.teams t LEFT JOIN (SELECT team_id,sum(amount) total_amount FROM public.ipo_allotments WHERE reversed_at IS NULL AND quantity>0 GROUP BY team_id) al ON al.team_id=t.id)
 )
$function$;

CREATE OR REPLACE FUNCTION public.jse__event_metrics()
RETURNS jsonb LANGUAGE sql STABLE AS $function$
 SELECT jsonb_build_object(
  'teams',(SELECT count(*) FROM public.teams WHERE active),'brokers',(SELECT count(*) FROM public.brokers WHERE active),
  'stocks',(SELECT count(*) FROM public.securities WHERE active AND kind='EQUITY'),'ipos',(SELECT count(*) FROM public.securities WHERE active AND kind='IPO'),
  'orders',(SELECT count(*) FROM public.orders),
  'pending_orders',(SELECT count(*) FROM public.orders WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
  'settled_orders',(SELECT count(*) FROM public.orders WHERE status='BANK_SETTLED'),
  'rejected_orders',(SELECT count(*) FROM public.orders WHERE status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED')),
  'news_items',(SELECT count(*) FROM public.market_news WHERE reversed_at IS NULL),
  'trade_value',(SELECT coalesce(sum(trade_value),0) FROM public.orders WHERE status='BANK_SETTLED')
 )
$function$;

-- Each event resets to its own baseline. The official global baseline remains unchanged as fallback.
DO $patch_reset$
DECLARE v_fn text; v_old text; v_new text;
BEGIN
 v_fn:=pg_get_functiondef('public.jse_reset_event(jsonb,jsonb)'::regprocedure);
 v_old:=$old$  SELECT snapshot INTO v_base FROM public.jse_locked_baseline WHERE id = 1;$old$;
 v_new:=$new$  SELECT coalesce((SELECT baseline_snapshot FROM public.jse_events WHERE is_active LIMIT 1),
                                (SELECT snapshot FROM public.jse_locked_baseline WHERE id = 1)) INTO v_base;$new$;
 IF position(v_new IN v_fn)=0 THEN
   IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '035: reset baseline selection point not found'; END IF;
   v_fn:=replace(v_fn,v_old,v_new);
 END IF;
 v_old:=$old$         status_changed_at = now(), status_changed_by = jse_actor_name(a), reset_count = reset_count + 1, last_reset_at = now(),
         market_updated_at = now() WHERE id = 1;$old$;
 v_new:=$new$         status_changed_at = now(), status_changed_by = jse_actor_name(a), reset_count = reset_count + 1, last_reset_at = now(),
         market_updated_at = now(), order_intake_open = true, pit_open = true, exchange_open = true, bank_open = true,
         instructions_open = true, market_news_open = true WHERE id = 1;$new$;
 IF position(v_new IN v_fn)=0 THEN
   IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '035: reset control defaults point not found'; END IF;
   v_fn:=replace(v_fn,v_old,v_new);
 END IF;
 EXECUTE v_fn;
END
$patch_reset$;

-- These triggers enforce derived-state rules during normal trades. Only explicit event
-- snapshot replay bypasses them, so restoration doesn't double-apply settlement side effects.
CREATE OR REPLACE FUNCTION public.jse__inst_order_guard()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE inv integer; v_sym text;
BEGIN
  IF current_setting('jse.maintenance',true)='on' THEN RETURN NEW; END IF;
  IF NEW.account_type <> 'INSTITUTION' OR NEW.side <> 'SELL' THEN RETURN NEW; END IF;
  SELECT quantity INTO inv FROM public.institutional_inventory WHERE security_id=NEW.security_id FOR UPDATE;
  IF NOT FOUND THEN RETURN NEW; END IF;
  IF NEW.quantity > inv - public.jse__inst_reserved(NEW.security_id,NEW.id) THEN
    SELECT symbol INTO v_sym FROM public.securities WHERE id=NEW.security_id;
    RAISE EXCEPTION USING ERRCODE='JSE01',DETAIL='INSTITUTION_INVENTORY',HINT='409',
      MESSAGE='The institutional investor has only ' || greatest(inv-public.jse__inst_reserved(NEW.security_id,NEW.id),0) || ' ' || v_sym ||
              ' shares available to sell (inventory ' || inv || ', in open orders ' || public.jse__inst_reserved(NEW.security_id,NEW.id) || ').';
  END IF;
  RETURN NEW;
END
$function$;

CREATE OR REPLACE FUNCTION public.jse__inst_settlement_inventory()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE v_delta integer; v_left integer; v_sym text;
BEGIN
  IF current_setting('jse.maintenance',true)='on' THEN RETURN NEW; END IF;
  IF NEW.account_type IS DISTINCT FROM 'INSTITUTION' THEN RETURN NEW; END IF;
  IF TG_OP='INSERT' AND NEW.reversed_at IS NULL THEN
    v_delta:=CASE WHEN NEW.side='SELL' THEN -NEW.quantity ELSE NEW.quantity END;
  ELSIF TG_OP='UPDATE' AND OLD.reversed_at IS NULL AND NEW.reversed_at IS NOT NULL THEN
    v_delta:=CASE WHEN NEW.side='SELL' THEN NEW.quantity ELSE -NEW.quantity END;
  ELSIF TG_OP='UPDATE' AND OLD.reversed_at IS NOT NULL AND NEW.reversed_at IS NULL THEN
    v_delta:=CASE WHEN NEW.side='SELL' THEN -NEW.quantity ELSE NEW.quantity END;
  ELSE RETURN NEW;
  END IF;
  UPDATE public.institutional_inventory SET quantity=quantity+v_delta,updated_at=now() WHERE security_id=NEW.security_id
    RETURNING quantity INTO v_left;
  IF FOUND AND v_left<0 THEN
    SELECT symbol INTO v_sym FROM public.securities WHERE id=NEW.security_id;
    RAISE EXCEPTION USING ERRCODE='JSE01',DETAIL='INSTITUTION_INVENTORY',HINT='409',
      MESSAGE='Settlement blocked: the institutional investor does not have enough ' || v_sym || ' shares.';
  END IF;
  RETURN NEW;
EXCEPTION WHEN check_violation THEN
  RAISE EXCEPTION USING ERRCODE='JSE01',DETAIL='INSTITUTION_INVENTORY',HINT='409',
    MESSAGE='Settlement blocked: institutional inventory would become negative.';
END
$function$;

CREATE OR REPLACE FUNCTION public.jse_special_cash_limit_guard()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE v_limit numeric;
BEGIN
  IF current_setting('jse.maintenance',true)='on' THEN RETURN NEW; END IF;
  SELECT cash_limit INTO v_limit FROM public.jse_special_accounts WHERE team_id=NEW.id;
  IF FOUND AND NEW.cash>v_limit THEN
    RAISE EXCEPTION USING ERRCODE='23514',MESSAGE='BIG BULL cash limit is \u20B91,00,00,000.00; this balance change is blocked.';
  END IF;
  RETURN NEW;
END
$function$;

CREATE OR REPLACE FUNCTION public.jse__restore_event_snapshot(p_snapshot jsonb)
RETURNS void LANGUAGE plpgsql AS $function$
DECLARE r record; v_cols text; v_max bigint; v_seq text; v_data jsonb;
BEGIN
 IF p_snapshot IS NULL OR jsonb_typeof(p_snapshot)<>'object' THEN
   PERFORM jse_fail('EVENT_SNAPSHOT_INVALID','The saved event snapshot is missing or invalid. Nothing was switched.',500);
 END IF;
 PERFORM set_config('jse.maintenance','on',true);
 SET CONSTRAINTS ALL DEFERRED;
DELETE FROM public.sessions WHERE user_id IN (SELECT id FROM public.app_users WHERE role<>'ADMIN');
 FOR r IN SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'
   AND table_name NOT IN ('schema_migrations','jse_locked_baseline','jse_events','sessions','audit_log_archive') ORDER BY table_name
 LOOP
   IF r.table_name='app_users' THEN DELETE FROM public.app_users WHERE role<>'ADMIN';
   ELSE EXECUTE format('DELETE FROM public.%I',r.table_name); END IF;
 END LOOP;

 FOR r IN SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'
   AND table_name NOT IN ('schema_migrations','jse_locked_baseline','jse_events','sessions','audit_log_archive') ORDER BY table_name
 LOOP
   v_data:=p_snapshot->r.table_name;
   IF v_data IS NULL OR jsonb_typeof(v_data)<>'array' OR jsonb_array_length(v_data)=0 THEN CONTINUE; END IF;
   SELECT string_agg(format('%I',c.column_name),', ' ORDER BY c.ordinal_position) INTO v_cols
   FROM information_schema.columns c WHERE c.table_schema='public' AND c.table_name=r.table_name AND c.is_generated<>'ALWAYS'
     AND ((v_data->0) ? c.column_name);
   IF v_cols IS NULL THEN CONTINUE; END IF;
   EXECUTE format('INSERT INTO public.%I (%s) SELECT %s FROM jsonb_populate_recordset(NULL::public.%I,$1)',r.table_name,v_cols,v_cols,r.table_name) USING v_data;
 END LOOP;
FOR r IN SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' AND column_default LIKE 'nextval(%'
   AND table_name NOT IN ('schema_migrations','jse_events','jse_locked_baseline','sessions','audit_log_archive')
 LOOP
   v_seq:=pg_get_serial_sequence(format('public.%I',r.table_name),r.column_name);
   IF v_seq IS NOT NULL THEN
     EXECUTE format('SELECT max(%I)::bigint FROM public.%I',r.column_name,r.table_name) INTO v_max;
     IF v_max IS NULL THEN PERFORM setval(v_seq,1,false); ELSE PERFORM setval(v_seq,v_max,true); END IF;
   END IF;
 END LOOP;
 PERFORM set_config('jse.maintenance','off',true);
END
$function$;

CREATE OR REPLACE FUNCTION public.jse_event_controls(a jsonb,p jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE v_action text:=upper(coalesce(p->>'action','STATE')); v_before jsonb; v_after jsonb;
BEGIN
 IF v_action='STATE' THEN
   PERFORM jse_require_role(a,'ADMIN','VIEWER');
   RETURN jsonb_build_object('success',true,'status',(SELECT status FROM public.event_control WHERE id=1),
    'gates',(SELECT jsonb_build_object('order_intake_open',order_intake_open,'pit_open',pit_open,'exchange_open',exchange_open,
      'bank_open',bank_open,'instructions_open',instructions_open,'market_news_open',market_news_open) FROM public.event_control WHERE id=1));
 END IF;
 PERFORM jse_require_role(a,'ADMIN'); PERFORM jse_require_admin_password(a,p);
 SELECT jsonb_build_object('order_intake_open',order_intake_open,'pit_open',pit_open,'exchange_open',exchange_open,
   'bank_open',bank_open,'instructions_open',instructions_open,'market_news_open',market_news_open)
 INTO v_before FROM public.event_control WHERE id=1 FOR UPDATE;
 IF v_action='LOCK_ALL' THEN
   UPDATE public.event_control SET order_intake_open=false,pit_open=false,exchange_open=false,bank_open=false,instructions_open=false,market_news_open=false WHERE id=1;
 ELSIF v_action='OPEN_ALL' THEN
   UPDATE public.event_control SET order_intake_open=true,pit_open=true,exchange_open=true,bank_open=true,instructions_open=true,market_news_open=true WHERE id=1;
 ELSIF v_action='SET' THEN
   IF NOT (p?'order_intake_open' OR p?'pit_open' OR p?'exchange_open' OR p?'bank_open' OR p?'instructions_open' OR p?'market_news_open') THEN
     PERFORM jse_fail('NO_CONTROL_CHANGE','Select at least one operating control to change.',400);
   END IF;
   UPDATE public.event_control SET
    order_intake_open=CASE WHEN p?'order_intake_open' THEN (p->>'order_intake_open')::boolean ELSE order_intake_open END,
    pit_open=CASE WHEN p?'pit_open' THEN (p->>'pit_open')::boolean ELSE pit_open END,
    exchange_open=CASE WHEN p?'exchange_open' THEN (p->>'exchange_open')::boolean ELSE exchange_open END,
    bank_open=CASE WHEN p?'bank_open' THEN (p->>'bank_open')::boolean ELSE bank_open END,
    instructions_open=CASE WHEN p?'instructions_open' THEN (p->>'instructions_open')::boolean ELSE instructions_open END,
    market_news_open=CASE WHEN p?'market_news_open' THEN (p->>'market_news_open')::boolean ELSE market_news_open END
   WHERE id=1;
 ELSE PERFORM jse_fail('INVALID_ACTION','Use STATE, SET, LOCK_ALL or OPEN_ALL.',400);
 END IF;
 SELECT jsonb_build_object('order_intake_open',order_intake_open,'pit_open',pit_open,'exchange_open',exchange_open,
   'bank_open',bank_open,'instructions_open',instructions_open,'market_news_open',market_news_open)
 INTO v_after FROM public.event_control WHERE id=1;
 PERFORM jse_audit(a,'EVENT_DESK_CONTROLS_UPDATED','event','event_control',NULL,NULL,v_before,v_after,jsonb_build_object('action',v_action));
 RETURN jsonb_build_object('success',true,'action',v_action,'gates',v_after,'status',(SELECT status FROM public.event_control WHERE id=1));
END
$function$;

CREATE OR REPLACE FUNCTION public.jse_event_registry_action(a jsonb,p jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
 v_action text:=upper(coalesce(p->>'action','STATE'));
 v_name text:=nullif(left(trim(coalesce(p->>'event_name','')),120),'');
 v_description text:=left(trim(coalesce(p->>'description','')),500);
 v_active public.jse_events%ROWTYPE; v_target public.jse_events%ROWTYPE;
 v_new_id bigint; v_base jsonb; v_status text; v_snapshot jsonb; v_summary jsonb;
BEGIN
 IF v_action='STATE' THEN
   PERFORM jse_require_role(a,'ADMIN','VIEWER');
   SELECT * INTO v_active FROM public.jse_events WHERE is_active LIMIT 1;
   RETURN jsonb_build_object('success',true,'active_event_id',v_active.id,
    'events',coalesce((SELECT jsonb_agg(jsonb_build_object(
     'id',e.id,'event_key',e.event_key,'event_name',e.event_name,'description',e.description,
     'status',CASE WHEN e.is_active THEN (SELECT status FROM public.event_control WHERE id=1) ELSE e.status END,
     'active',e.is_active,'archived',e.archived_at IS NOT NULL,'created_at',e.created_at,'updated_at',e.updated_at,
     'last_activated_at',e.last_activated_at,'summary',CASE WHEN e.is_active THEN public.jse__event_metrics() ELSE e.summary END)
     ORDER BY e.is_active DESC,e.updated_at DESC,e.id DESC) FROM public.jse_events e),'[]'::jsonb));
 END IF;
 PERFORM jse_require_role(a,'ADMIN'); PERFORM jse_require_admin_password(a,p);
 PERFORM pg_advisory_xact_lock(hashtextextended('jse-event-registry',0));
 SELECT * INTO v_active FROM public.jse_events WHERE is_active FOR UPDATE;
 IF NOT FOUND THEN PERFORM jse_fail('EVENT_REGISTRY_MISSING','Event registry is not initialized.',500); END IF;
 SELECT status INTO v_status FROM public.event_control WHERE id=1 FOR UPDATE;

 IF v_action='CREATE' THEN
   IF v_name IS NULL OR length(v_name)<2 THEN PERFORM jse_fail('EVENT_NAME_REQUIRED','Enter an event name (at least 2 characters).',400); END IF;
   IF EXISTS(SELECT 1 FROM public.jse_events WHERE lower(event_name)=lower(v_name)) THEN PERFORM jse_fail('EVENT_NAME_EXISTS','An event with this name already exists. Choose a unique event name.',409); END IF;
   IF v_status IN ('LIVE','SETTLEMENT_ONLY') THEN PERFORM jse_fail('EVENT_RUNNING','Close the current event before creating another event so its live workflow can be saved safely.',409); END IF;
   v_snapshot:=public.jse__capture_event_snapshot(); v_summary:=public.jse__event_metrics();
   UPDATE public.jse_events SET state_snapshot=v_snapshot,status=v_status,summary=v_summary,updated_at=now() WHERE id=v_active.id;
   v_base:=v_active.baseline_snapshot;
   PERFORM public.jse_reset_event(a,jsonb_build_object('confirm','RESET','keep_allotments',true,'admin_password',p->>'admin_password'));
   UPDATE public.event_config SET event_name=v_name,team_names_assigned_at=NULL,team_names_locked_at=NULL,team_names_locked_by=NULL,
     team_name_seed='JSE-'||upper(regexp_replace(v_name,'[^A-Za-z0-9]+','-','g')),updated_at=now(),updated_by=jse_actor_name(a) WHERE id=1;
   UPDATE public.jse_events SET is_active=false WHERE is_active;
   INSERT INTO public.jse_events(event_name,description,status,is_active,baseline_snapshot,state_snapshot,summary,last_activated_at)
     VALUES(v_name,v_description,'NOT_STARTED',true,v_base,public.jse__capture_event_snapshot(),public.jse__event_metrics(),now()) RETURNING id INTO v_new_id;
   PERFORM jse_audit(a,'EVENT_CREATED','event',v_new_id::text,NULL,NULL,NULL,
     jsonb_build_object('event_name',v_name,'description',v_description),jsonb_build_object('template_event_id',v_active.id,'created_from_baseline',true));
   UPDATE public.jse_events SET state_snapshot=public.jse__capture_event_snapshot(),summary=public.jse__event_metrics(),updated_at=now() WHERE id=v_new_id;
   RETURN jsonb_build_object('success',true,'action','CREATE','event_id',v_new_id,'event_name',v_name,'status','NOT_STARTED',
     'message','New event created from this event\u2019s saved baseline. The previous event is saved and can be selected later.');
 ELSIF v_action='ACTIVATE' THEN
   BEGIN v_new_id:=nullif(p->>'event_id','')::bigint; EXCEPTION WHEN others THEN PERFORM jse_fail('EVENT_REQUIRED','Select a saved event.',400); END;
   SELECT * INTO v_target FROM public.jse_events WHERE id=v_new_id AND archived_at IS NULL FOR UPDATE;
   IF NOT FOUND THEN PERFORM jse_fail('EVENT_NOT_FOUND','That event does not exist or is archived.',404); END IF;
   IF v_target.id=v_active.id THEN RETURN jsonb_build_object('success',true,'action','ACTIVATE','event_id',v_active.id,'event_name',v_active.event_name,'unchanged',true); END IF;
   IF v_status IN ('LIVE','SETTLEMENT_ONLY') THEN PERFORM jse_fail('EVENT_RUNNING','Close the current event before switching so it can be saved consistently.',409); END IF;
   IF v_target.status IN ('LIVE','SETTLEMENT_ONLY') THEN PERFORM jse_fail('TARGET_EVENT_RUNNING','The saved event was last running. Close it before switching away next time; select a closed event to continue.',409); END IF;
   UPDATE public.jse_events SET state_snapshot=public.jse__capture_event_snapshot(),status=v_status,summary=public.jse__event_metrics(),updated_at=now(),is_active=false WHERE id=v_active.id;
   PERFORM public.jse__restore_event_snapshot(v_target.state_snapshot);
   UPDATE public.jse_events SET is_active=true,last_activated_at=now(),updated_at=now(),status=(SELECT status FROM public.event_control WHERE id=1),
     summary=public.jse__event_metrics() WHERE id=v_target.id;
   PERFORM jse_audit(a,'EVENT_SWITCHED','event',v_target.id::text,NULL,NULL,jsonb_build_object('from_event_id',v_active.id,'from_event_name',v_active.event_name),
     jsonb_build_object('to_event_id',v_target.id,'to_event_name',v_target.event_name),NULL);
   UPDATE public.jse_events SET state_snapshot=public.jse__capture_event_snapshot(),summary=public.jse__event_metrics(),updated_at=now() WHERE id=v_target.id;
   RETURN jsonb_build_object('success',true,'action','ACTIVATE','event_id',v_target.id,'event_name',v_target.event_name,
     'status',(SELECT status FROM public.event_control WHERE id=1),'message','The selected event is now active. Admin desks are showing its saved state.');
 ELSIF v_action='RENAME' THEN
   BEGIN v_new_id:=coalesce(nullif(p->>'event_id','')::bigint,v_active.id); EXCEPTION WHEN others THEN PERFORM jse_fail('EVENT_REQUIRED','Select an event to rename.',400); END;
   IF v_name IS NULL OR length(v_name)<2 THEN PERFORM jse_fail('EVENT_NAME_REQUIRED','Enter an event name (at least 2 characters).',400); END IF;
   IF EXISTS(SELECT 1 FROM public.jse_events WHERE lower(event_name)=lower(v_name) AND id<>v_new_id) THEN PERFORM jse_fail('EVENT_NAME_EXISTS','Another saved event already uses that name.',409); END IF;
   SELECT * INTO v_target FROM public.jse_events WHERE id=v_new_id FOR UPDATE;
   IF NOT FOUND THEN PERFORM jse_fail('EVENT_NOT_FOUND','The selected event was not found.',404); END IF;
   UPDATE public.jse_events SET event_name=v_name,description=coalesce(nullif(v_description,''),description),updated_at=now() WHERE id=v_new_id;
   IF v_target.is_active THEN
     UPDATE public.event_config SET event_name=v_name,updated_at=now(),updated_by=jse_actor_name(a) WHERE id=1;
     UPDATE public.jse_events SET state_snapshot=public.jse__capture_event_snapshot() WHERE id=v_new_id;
   ELSE
     -- Keep the saved event's config name aligned so activation doesn't restore an old label.
     UPDATE public.jse_events
       SET state_snapshot=jsonb_set(state_snapshot, '{event_config,0,event_name}', to_jsonb(v_name), true)
       WHERE id=v_new_id AND jsonb_typeof(state_snapshot->'event_config')='array'
         AND jsonb_array_length(state_snapshot->'event_config')>0;
   END IF;
   PERFORM jse_audit(a,'EVENT_RENAMED','event',v_new_id::text,NULL,NULL,jsonb_build_object('event_name',v_target.event_name),jsonb_build_object('event_name',v_name),NULL);
   RETURN jsonb_build_object('success',true,'action','RENAME','event_id',v_new_id,'event_name',v_name);
 ELSIF v_action='SAVE_BASELINE' THEN
   IF v_status<>'NOT_STARTED' THEN PERFORM jse_fail('BASELINE_ONLY_BEFORE_START','Save the event baseline before starting. Close and reset first if a new baseline is required.',409); END IF;
   v_base:=public.jse__capture_event_baseline();
   UPDATE public.jse_events SET baseline_snapshot=v_base,state_snapshot=public.jse__capture_event_snapshot(),summary=public.jse__event_metrics(),updated_at=now() WHERE id=v_active.id;
   PERFORM jse_audit(a,'EVENT_BASELINE_SAVED','event',v_active.id::text,NULL,NULL,NULL,NULL,
     jsonb_build_object('teams',(SELECT count(*) FROM public.teams WHERE active),'securities',(SELECT count(*) FROM public.securities WHERE active),
       'ipo_allotments',jsonb_array_length(coalesce(v_base->'ipo_allotments','[]'::jsonb))));
   UPDATE public.jse_events SET state_snapshot=public.jse__capture_event_snapshot(),updated_at=now() WHERE id=v_active.id;
   RETURN jsonb_build_object('success',true,'action','SAVE_BASELINE','event_id',v_active.id,'message','This event\u2019s roster, companies, starting cash and IPO allotments are now its reset baseline.');
 ELSIF v_action='ARCHIVE' THEN
   BEGIN v_new_id:=nullif(p->>'event_id','')::bigint; EXCEPTION WHEN others THEN PERFORM jse_fail('EVENT_REQUIRED','Select an event to archive.',400); END;
   SELECT * INTO v_target FROM public.jse_events WHERE id=v_new_id FOR UPDATE;
   IF NOT FOUND THEN PERFORM jse_fail('EVENT_NOT_FOUND','The selected event was not found.',404); END IF;
   IF v_target.is_active THEN PERFORM jse_fail('ACTIVE_EVENT','Switch to another event before archiving this one.',409); END IF;
   IF v_target.status IN ('LIVE','SETTLEMENT_ONLY') THEN PERFORM jse_fail('EVENT_RUNNING','Close the event before archiving it.',409); END IF;
   UPDATE public.jse_events SET archived_at=now(),updated_at=now() WHERE id=v_new_id;
   RETURN jsonb_build_object('success',true,'action','ARCHIVE','event_id',v_new_id);
 ELSIF v_action='RESTORE_ARCHIVED' THEN
   BEGIN v_new_id:=nullif(p->>'event_id','')::bigint; EXCEPTION WHEN others THEN PERFORM jse_fail('EVENT_REQUIRED','Select an event to restore.',400); END;
   UPDATE public.jse_events SET archived_at=NULL,updated_at=now() WHERE id=v_new_id AND archived_at IS NOT NULL;
   IF NOT FOUND THEN PERFORM jse_fail('EVENT_NOT_ARCHIVED','That event is not archived or does not exist.',404); END IF;
   RETURN jsonb_build_object('success',true,'action','RESTORE_ARCHIVED','event_id',v_new_id);
 ELSE PERFORM jse_fail('INVALID_ACTION','Use STATE, CREATE, ACTIVATE, RENAME, SAVE_BASELINE, ARCHIVE or RESTORE_ARCHIVED.',400);
 END IF;
END
$function$;

-- Database-side desk gates. UI locks are helpful, but these checks are authoritative.
DO $patch_gates$
DECLARE r record; v_fn text;
BEGIN
 FOR r IN SELECT * FROM (VALUES
  ('public.jse_place_order(jsonb,jsonb)',
   $old$  IF v_status <> 'LIVE' THEN
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;$old$,
   $new$  IF v_status <> 'LIVE' THEN
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  IF NOT (SELECT order_intake_open FROM public.event_control WHERE id=1) THEN
    PERFORM jse_fail('ORDER_INTAKE_CLOSED','New order intake is closed by the event administrator.',409);
  END IF;$new$),
  ('public.jse_place_institutional_order(jsonb,jsonb)',
   $old$  IF v_status <> 'LIVE' THEN
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;$old$,
   $new$  IF v_status <> 'LIVE' THEN
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  IF NOT (SELECT order_intake_open FROM public.event_control WHERE id=1) THEN
    PERFORM jse_fail('ORDER_INTAKE_CLOSED','New order intake is closed by the event administrator.',409);
  END IF;$new$),
  ('public.jse_instruction_action(jsonb,jsonb)',
   $old$    IF v_status <> 'LIVE' THEN PERFORM jse_fail('EVENT_NOT_LIVE', 'Instructions can be sent while the market is LIVE.', 409); END IF;$old$,
   $new$    IF v_status <> 'LIVE' THEN PERFORM jse_fail('EVENT_NOT_LIVE', 'Instructions can be sent while the market is LIVE.', 409); END IF;
    IF NOT (SELECT instructions_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('INSTRUCTIONS_CLOSED','Participant instructions are closed by the event administrator.',409); END IF;$new$),
  ('public.jse_pit_action(jsonb,jsonb)',
   $old$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'The Pit Manager can execute orders only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;$old$,
   $new$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'The Pit Manager can execute orders only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  IF NOT (SELECT pit_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('PIT_CLOSED','Pit Manager operations are closed by the event administrator.',409); END IF;$new$),
  ('public.jse_exchange_decide(jsonb,jsonb)',
   $old$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Exchange actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;$old$,
   $new$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Exchange actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  IF NOT (SELECT exchange_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('EXCHANGE_CLOSED','Exchange desk is closed by the event administrator.',409); END IF;$new$),
  ('public.jse_bank_reject(jsonb,jsonb)',
   $old$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;$old$,
   $new$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  IF NOT (SELECT bank_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('BANK_CLOSED','Bank desk is closed by the event administrator.',409); END IF;$new$),
  ('public.jse_bank_settle(jsonb,jsonb)',
   $old$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank settlement is allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;$old$,
   $new$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank settlement is allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  IF NOT (SELECT bank_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('BANK_CLOSED','Bank settlement is closed by the event administrator.',409); END IF;$new$),
  ('public.jse_market_news(jsonb,jsonb)',
   $old$  IF v_status NOT IN ('NOT_STARTED', 'LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_CLOSED', 'Market News is not allowed after the market has closed.', 409);
  END IF;$old$,
   $new$  IF v_status NOT IN ('NOT_STARTED', 'LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_CLOSED', 'Market News is not allowed after the market has closed.', 409);
  END IF;
  IF NOT (SELECT market_news_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('MARKET_NEWS_CLOSED','Market News publishing is closed by the event administrator.',409); END IF;$new$)
 ) AS x(fn,old_text,new_text)
 LOOP
   IF to_regprocedure(r.fn) IS NULL THEN CONTINUE; END IF;
   v_fn:=pg_get_functiondef(r.fn::regprocedure);
   IF position(r.new_text IN v_fn)>0 THEN CONTINUE; END IF;
   IF position(r.old_text IN v_fn)=0 THEN RAISE EXCEPTION '035: gate insertion point not found in %',r.fn; END IF;
   EXECUTE replace(v_fn,r.old_text,r.new_text);
 END LOOP;
 v_fn:=pg_get_functiondef('public.jse_bank_claim(jsonb,jsonb)'::regprocedure);
 IF position('BANK_CLOSED' IN v_fn)=0 THEN
   v_fn:=replace(v_fn,$old$  PERFORM jse_require_role(a, 'ADMIN', 'BANK');$old$,
    $new$  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  IF NOT (SELECT bank_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('BANK_CLOSED','Bank desk is closed by the event administrator.',409); END IF;$new$);
   EXECUTE v_fn;
 END IF;
 v_fn:=pg_get_functiondef('public.jse__settle(jsonb,bigint,text)'::regprocedure);
 IF position('BANK_CLOSED' IN v_fn)=0 THEN
   v_fn:=replace(v_fn,$old$BEGIN
  SELECT * INTO cfg FROM event_config WHERE id = 1;$old$,
    $new$BEGIN
  IF p_source='BANK' AND NOT (SELECT bank_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('BANK_CLOSED','Bank settlement is closed by the event administrator.',409); END IF;
  SELECT * INTO cfg FROM event_config WHERE id = 1;$new$);
   EXECUTE v_fn;
 END IF;
 v_fn:=pg_get_functiondef('public.jse_loan_action(jsonb,jsonb)'::regprocedure);
 IF position('BANK_CLOSED' IN v_fn)=0 THEN
   v_fn:=replace(v_fn,$old$  PERFORM jse_require_role(a, 'ADMIN', 'BANK');$old$,
    $new$  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  IF NOT (SELECT bank_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('BANK_CLOSED','Bank desk is closed by the event administrator.',409); END IF;$new$);
   EXECUTE v_fn;
 END IF;
 v_fn:=pg_get_functiondef('public.jse_loan_decide(jsonb,jsonb)'::regprocedure);
 IF position('BANK_CLOSED' IN v_fn)=0 THEN
   v_fn:=replace(v_fn,$old$  PERFORM jse_require_role(a, 'ADMIN', 'BANK');$old$,
    $new$  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  IF NOT (SELECT bank_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('BANK_CLOSED','Bank loan decisions are closed by the event administrator.',409); END IF;$new$);
   EXECUTE v_fn;
 END IF;
END
$patch_gates$;

-- Seed existing live state once. No current event tables or rows are reset by this migration.
DO $seed_event_registry$
DECLARE v_name text; v_status text; v_baseline jsonb; v_snapshot jsonb;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.jse_events) THEN
   SELECT event_name INTO v_name FROM public.event_config WHERE id=1;
   SELECT status INTO v_status FROM public.event_control WHERE id=1;
   SELECT snapshot INTO v_baseline FROM public.jse_locked_baseline WHERE id=1;
   IF v_baseline IS NULL THEN v_baseline:=public.jse__capture_event_baseline(); END IF;
   v_snapshot:=public.jse__capture_event_snapshot();
   INSERT INTO public.jse_events(event_name,description,status,is_active,baseline_snapshot,state_snapshot,summary,last_activated_at)
     VALUES(coalesce(nullif(v_name,''),'JAIN STOCK EXCHANGE EVENT'),'Imported existing JSE state',coalesce(v_status,'NOT_STARTED'),true,
       v_baseline,v_snapshot,public.jse__event_metrics(),now());
 END IF;
END
$seed_event_registry$;

INSERT INTO public.schema_migrations(version) VALUES ('035_multi_event_admin') ON CONFLICT (version) DO NOTHING;
`;var Dr=`-- 036: event-specific administrator pricing-method selector.
-- This stores the single selected method per saved event; no per-method parameter panels are required.
ALTER TABLE public.jse_events
  ADD COLUMN IF NOT EXISTS pricing_method text NOT NULL DEFAULT 'NEWS_DRIVEN';

DO $pricing_method_constraint$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.jse_events'::regclass AND conname='jse_events_pricing_method_check'
  ) THEN
    ALTER TABLE public.jse_events
      ADD CONSTRAINT jse_events_pricing_method_check
      CHECK (pricing_method IN (
        'MANUAL','NEWS_DRIVEN','MOMENTUM','MEAN_REVERSION','SUPPLY_DEMAND',
        'SECTOR_INDEX','VOLATILITY','HYBRID','SCENARIO'
      ));
  END IF;
END
$pricing_method_constraint$;

CREATE OR REPLACE FUNCTION public.jse_pricing_method(a jsonb, p jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  v_action text := upper(coalesce(p->>'action','STATE'));
  v_method text := upper(trim(coalesce(p->>'method','')));
  v_event public.jse_events%ROWTYPE;
  v_before text;
BEGIN
  IF v_action='STATE' THEN
    PERFORM jse_require_role(a,'ADMIN','VIEWER');
    SELECT * INTO v_event FROM public.jse_events WHERE is_active LIMIT 1;
    RETURN jsonb_build_object(
      'success',true,
      'event_id',v_event.id,
      'event_name',v_event.event_name,
      'method',coalesce(v_event.pricing_method,'NEWS_DRIVEN')
    );
  END IF;

  IF v_action NOT IN ('SET','APPLY') THEN
    PERFORM jse_fail('INVALID_ACTION','Use STATE or SET to manage the pricing method.',400);
  END IF;
  PERFORM jse_require_role(a,'ADMIN');
  PERFORM jse_require_admin_password(a,p);
  IF v_method NOT IN (
    'MANUAL','NEWS_DRIVEN','MOMENTUM','MEAN_REVERSION','SUPPLY_DEMAND',
    'SECTOR_INDEX','VOLATILITY','HYBRID','SCENARIO'
  ) THEN
    PERFORM jse_fail('INVALID_PRICING_METHOD','Choose one of the available pricing methods.',400);
  END IF;

  SELECT * INTO v_event FROM public.jse_events WHERE is_active LIMIT 1 FOR UPDATE;
  IF v_event.id IS NULL THEN
    PERFORM jse_fail('ACTIVE_EVENT_REQUIRED','Create or activate an event before selecting its pricing method.',409);
  END IF;
  v_before := coalesce(v_event.pricing_method,'NEWS_DRIVEN');
  IF v_before <> v_method THEN
    UPDATE public.jse_events SET pricing_method=v_method,updated_at=now() WHERE id=v_event.id;
    PERFORM public.jse_audit(
      a,'PRICING_METHOD_CHANGED','event',v_event.id::text,NULL,NULL,NULL,
      jsonb_build_object('pricing_method',v_before),
      jsonb_build_object('pricing_method',v_method,'event_name',v_event.event_name)
    );
  END IF;
  RETURN jsonb_build_object(
    'success',true,'event_id',v_event.id,'event_name',v_event.event_name,
    'previous_method',v_before,'method',v_method,
    'changed',(v_before<>v_method),
    'message',CASE WHEN v_before=v_method THEN 'This pricing method is already selected.' ELSE 'Pricing method selection saved for this event.' END
  );
END
$function$;

INSERT INTO public.schema_migrations(version)
VALUES ('036_pricing_method_selector')
ON CONFLICT (version) DO NOTHING;
`;var Fr=`-- 037: advanced event-scoped pricing configuration and automatic price engine.
-- Enables/disables pricing methods per event and calculates post-trade quote movement without
-- rejecting or rewriting existing orders at a stale quote. All changes are journal/audit visible.

ALTER TABLE public.jse_events
  ADD COLUMN IF NOT EXISTS pricing_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pricing_config jsonb NOT NULL DEFAULT
    '{
      "enabled_methods":{"MANUAL":true,"NEWS_DRIVEN":true,"MOMENTUM":true,"MEAN_REVERSION":true,"SUPPLY_DEMAND":true,"SECTOR_INDEX":true,"VOLATILITY":true,"HYBRID":true,"SCENARIO":true},
      "apply_on_trades":true,
      "apply_on_news":true,
      "max_move_per_trade_pct":0.75,
      "momentum_lookback":5,
      "mean_reversion_strength":0.12,
      "supply_demand_strength":0.75,
      "sector_link_strength":0.35,
      "volatility_multiplier":0.45,
      "scenario":"SIDEWAYS",
      "hybrid_weights":{"NEWS_DRIVEN":40,"MOMENTUM":20,"MEAN_REVERSION":15,"SUPPLY_DEMAND":15,"SECTOR_INDEX":5,"VOLATILITY":5,"SCENARIO":0}
    }'::jsonb;

-- Keep price-history source validation strict while permitting the new pricing engine's recorded sources.
DO $price_history_sources$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO v_def
  FROM pg_constraint
  WHERE conrelid='public.price_history'::regclass AND conname='price_history_source_check';
  IF v_def IS NULL OR position('AUTO_MOMENTUM' IN v_def)=0 OR position('ADMIN_MANUAL_PRICE' IN v_def)=0 THEN
    ALTER TABLE public.price_history DROP CONSTRAINT IF EXISTS price_history_source_check;
    ALTER TABLE public.price_history ADD CONSTRAINT price_history_source_check CHECK (
      source = ANY (ARRAY[
        'TRADE','MARKET_NEWS','RESET','UNDO','REDO','ADMIN','LISTING',
        'ADMIN_MANUAL_PRICE','AUTO_MANUAL','AUTO_NEWS_DRIVEN','AUTO_MOMENTUM',
        'AUTO_MEAN_REVERSION','AUTO_SUPPLY_DEMAND','AUTO_SECTOR_INDEX',
        'AUTO_VOLATILITY','AUTO_HYBRID','AUTO_SCENARIO','AUTO_SECTOR_LINK'
      ]::text[])
    );
  END IF;
END
$price_history_sources$;

UPDATE public.jse_events
SET pricing_config = '{
  "enabled_methods":{"MANUAL":true,"NEWS_DRIVEN":true,"MOMENTUM":true,"MEAN_REVERSION":true,"SUPPLY_DEMAND":true,"SECTOR_INDEX":true,"VOLATILITY":true,"HYBRID":true,"SCENARIO":true},
  "apply_on_trades":true,"apply_on_news":true,"max_move_per_trade_pct":0.75,
  "momentum_lookback":5,"mean_reversion_strength":0.12,"supply_demand_strength":0.75,
  "sector_link_strength":0.35,"volatility_multiplier":0.45,"scenario":"SIDEWAYS",
  "hybrid_weights":{"NEWS_DRIVEN":40,"MOMENTUM":20,"MEAN_REVERSION":15,"SUPPLY_DEMAND":15,"SECTOR_INDEX":5,"VOLATILITY":5,"SCENARIO":0}
}'::jsonb
WHERE pricing_config IS NULL OR pricing_config='{}'::jsonb;

CREATE OR REPLACE FUNCTION public.jse__record_news_no_price(
  a jsonb, s public.securities, p_mood text, p_requested numeric, p_headline text
) RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  v_news bigint;
  v_headline text := coalesce(p_headline, initcap(replace(p_mood,'_',' ')) || ' news on ' || s.name);
BEGIN
  INSERT INTO public.market_news(
    security_id,mood,headline,requested_pct,applied_pct,previous_price,new_price,prior_previous,created_by,created_by_name
  ) VALUES (
    s.id,p_mood,v_headline,coalesce(p_requested,0),0,s.price,s.price,s.previous_price,
    nullif(a->>'id','')::integer,public.jse_actor_name(a)
  ) RETURNING id INTO v_news;

  PERFORM public.jse_audit(
    a,'MARKET_NEWS_RECORDED_NO_PRICE','security',s.symbol,NULL,NULL,
    jsonb_build_object('price',s.price),
    jsonb_build_object('price',s.price),
    jsonb_build_object('news_id',v_news,'company',s.name,'symbol',s.symbol,'headline',v_headline,
      'severity',p_mood,'price_change',false,'reason','Current pricing configuration suppresses news-driven price changes')
  );
  PERFORM public.jse_journal(
    'MARKET_NEWS',v_news,
    s.symbol || ' ' || replace(p_mood,'_',' ') || ' news recorded \xB7 no price change',
    jsonb_build_object('news_id',v_news,'security_id',s.id,'price_change',false),a
  );
  RETURN jsonb_build_object(
    'success',true,'news_id',v_news,'symbol',s.symbol,'name',s.name,'mood',p_mood,'headline',v_headline,
    'requested_pct',coalesce(p_requested,0),'applied_pct',0,'previous_price',s.price,'new_price',s.price,
    'stale_orders',0,'price_changed',false,'source','MARKET_NEWS_NO_PRICE'
  );
END
$function$;

CREATE OR REPLACE FUNCTION public.jse__apply_news_price(
  a jsonb,s public.securities,p_mood text,p_req numeric,p_new numeric,p_headline text
) RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  v_news bigint;
  v_applied numeric;
  v_headline text:=coalesce(p_headline,initcap(replace(p_mood,'_',' '))||' news on '||s.name);
BEGIN
  IF p_new IS NULL OR p_new<=0 THEN RAISE EXCEPTION 'Invalid news-driven price for %',s.symbol; END IF;
  v_applied:=public.jse_pct(p_new,s.price);
  INSERT INTO public.market_news(
    security_id,mood,headline,requested_pct,applied_pct,previous_price,new_price,prior_previous,created_by,created_by_name
  ) VALUES (
    s.id,p_mood,v_headline,p_req,v_applied,s.price,p_new,s.previous_price,
    nullif(a->>'id','')::integer,public.jse_actor_name(a)
  ) RETURNING id INTO v_news;

  UPDATE public.securities
    SET previous_price=s.price,price=p_new,updated_at=now(),
        last_price_change_at=CASE WHEN p_new<>s.price THEN clock_timestamp() ELSE last_price_change_at END
    WHERE id=s.id;
  IF p_new<>s.price THEN
    INSERT INTO public.price_history(security_id,previous_price,new_price,change_pct,source,news_id)
      VALUES(s.id,s.price,p_new,v_applied,'MARKET_NEWS',v_news);
  END IF;
  UPDATE public.event_control SET market_updated_at=now() WHERE id=1;
  PERFORM public.jse_audit(
    a,'MARKET_NEWS_PRICE_MOVE','security',s.symbol,NULL,NULL,
    jsonb_build_object('price',s.price,'previous_price',s.previous_price),
    jsonb_build_object('price',p_new,'previous_price',s.price),
    jsonb_build_object('company',s.name,'symbol',s.symbol,'headline',v_headline,'severity',p_mood,
      'requested_pct',p_req,'applied_pct',v_applied,'previous_price',s.price,'new_price',p_new,
      'news_id',v_news,'stale_orders_rejected',0,'source','MARKET_NEWS')
  );
  PERFORM public.jse_journal(
    'MARKET_NEWS',v_news,
    s.symbol||' '||replace(p_mood,'_',' ')||' '||CASE WHEN v_applied>0 THEN '+' ELSE '' END||
      to_char(v_applied,'FM990.00')||'% ('||public.jse_inr(s.price)||' \u2192 '||public.jse_inr(p_new)||')',
    jsonb_build_object('news_id',v_news,'security_id',s.id,'stale_orders_rejected',0),a
  );
  RETURN jsonb_build_object('success',true,'news_id',v_news,'symbol',s.symbol,'name',s.name,'mood',p_mood,
    'headline',v_headline,'requested_pct',p_req,'applied_pct',v_applied,'previous_price',s.price,
    'new_price',p_new,'stale_orders',0,'price_changed',(p_new<>s.price),'source','MARKET_NEWS');
END
$function$;

CREATE OR REPLACE FUNCTION public.jse__pricing_signal(
  p_security integer,
  p_side text DEFAULT NULL,
  p_quantity integer DEFAULT 0,
  p_news_pct numeric DEFAULT NULL
) RETURNS numeric LANGUAGE plpgsql STABLE AS $function$
DECLARE
  v_event public.jse_events%ROWTYPE;
  s public.securities%ROWTYPE;
  v_method text;
  v_cfg jsonb;
  v_enabled jsonb;
  v_weights jsonb;
  v_ref numeric;
  v_move_cap numeric := 3;
  v_event_cap numeric := 10;
  v_lookback integer;
  v_momentum numeric := 0;
  v_reversion numeric := 0;
  v_supply numeric := 0;
  v_sector numeric := 0;
  v_market numeric := 0;
  v_volatility numeric := 0;
  v_news numeric := 0;
  v_scenario numeric := 0;
  v_pressure numeric := 0;
  v_sign numeric := 0;
  v_signal numeric := 0;
  v_sum_weight numeric := 0;
  v_weight numeric;
  v_strength numeric;
BEGIN
  SELECT * INTO v_event FROM public.jse_events WHERE is_active LIMIT 1;
  IF v_event.id IS NULL THEN RETURN 0; END IF;
  v_method := coalesce(v_event.pricing_method,'NEWS_DRIVEN');
  v_cfg := coalesce(v_event.pricing_config,'{}'::jsonb);
  v_enabled := coalesce(v_cfg->'enabled_methods','{}'::jsonb);
  v_weights := coalesce(v_cfg->'hybrid_weights','{}'::jsonb);
  IF NOT coalesce((v_enabled->>v_method)::boolean,true) THEN RETURN 0; END IF;
  IF v_method='MANUAL' THEN RETURN 0; END IF;

  SELECT * INTO s FROM public.securities WHERE id=p_security;
  IF NOT FOUND OR s.price IS NULL OR s.price<=0 THEN RETURN 0; END IF;
  v_ref := greatest(0.01,coalesce(s.base_price,s.index_base_price,s.price));
  SELECT coalesce(max_price_move_pct,10) INTO v_event_cap FROM public.event_config WHERE id=1;
  v_move_cap := CASE WHEN p_news_pct IS NOT NULL
    THEN least(10,greatest(0.05,coalesce(v_event_cap,10)))
    ELSE least(10,greatest(0.05,coalesce(nullif(v_cfg->>'max_move_per_trade_pct','')::numeric,0.75))) END;
  v_lookback := least(20,greatest(2,coalesce(nullif(v_cfg->>'momentum_lookback','')::integer,5)));
  v_sign := CASE upper(coalesce(p_side,'')) WHEN 'BUY' THEN 1 WHEN 'SELL' THEN -1 ELSE sign(coalesce(p_news_pct,0)) END;

  SELECT coalesce(avg(change_pct),0),coalesce(stddev_samp(change_pct),0)
    INTO v_momentum,v_volatility
  FROM (
    SELECT change_pct FROM public.price_history
    WHERE security_id=s.id AND change_pct IS NOT NULL
    ORDER BY created_at DESC,id DESC LIMIT v_lookback
  ) recent;
  v_momentum := greatest(-3,least(3,v_momentum));
  v_volatility := least(4,greatest(0,v_volatility));

  v_reversion := ((v_ref-s.price)*100/nullif(v_ref,0))
    * least(0.50,greatest(0,coalesce(nullif(v_cfg->>'mean_reversion_strength','')::numeric,0.12)));
  v_reversion := greatest(-v_move_cap,least(v_move_cap,v_reversion));

  IF p_quantity>0 THEN
    v_pressure := least(1.0,p_quantity::numeric/greatest(
      coalesce(s.traded_quantity::numeric/nullif(s.trade_count,0),p_quantity::numeric)*2,100.0
    ));
  END IF;
  v_supply := v_sign * v_pressure
    * least(3,greatest(0,coalesce(nullif(v_cfg->>'supply_demand_strength','')::numeric,0.75)));

  SELECT coalesce(avg((price-coalesce(base_price,index_base_price,price))*100/
           nullif(coalesce(base_price,index_base_price,price),0)),0)
    INTO v_sector
  FROM public.securities
  WHERE active AND id<>s.id AND sector IS NOT NULL AND sector=s.sector
    AND (kind='EQUITY' OR listed_at IS NOT NULL);

  SELECT coalesce(avg((price-coalesce(base_price,index_base_price,price))*100/
           nullif(coalesce(base_price,index_base_price,price),0)),0)
    INTO v_market
  FROM public.securities
  WHERE active AND (kind='EQUITY' OR listed_at IS NOT NULL);

  SELECT coalesce(avg(applied_pct),0) INTO v_news
  FROM (
    SELECT applied_pct FROM public.market_news
    WHERE security_id=s.id AND reversed_at IS NULL
    ORDER BY created_at DESC,id DESC LIMIT 5
  ) news_recent;
  v_news := coalesce(p_news_pct,v_news);
  v_scenario := CASE upper(coalesce(v_cfg->>'scenario','SIDEWAYS'))
    WHEN 'BULL' THEN 0.30
    WHEN 'RALLY' THEN 0.65
    WHEN 'BEAR' THEN -0.30
    WHEN 'CRASH' THEN -0.85
    ELSE 0
  END;

  IF v_method='NEWS_DRIVEN' THEN
    v_signal := coalesce(p_news_pct,0);
  ELSIF v_method='MOMENTUM' THEN
    v_signal := v_momentum * 0.65 + v_sign * v_pressure * 0.55;
  ELSIF v_method='MEAN_REVERSION' THEN
    v_signal := v_reversion + v_sign * v_pressure * 0.10;
  ELSIF v_method='SUPPLY_DEMAND' THEN
    v_signal := v_supply;
  ELSIF v_method='SECTOR_INDEX' THEN
    v_signal := v_sector * 0.40 + v_market * 0.20 + v_sign * v_pressure * 0.15;
  ELSIF v_method='VOLATILITY' THEN
    v_signal := v_sign * greatest(0.15,v_volatility)
      * least(3,greatest(0,coalesce(nullif(v_cfg->>'volatility_multiplier','')::numeric,0.45)));
  ELSIF v_method='SCENARIO' THEN
    v_signal := v_scenario + v_sign * v_pressure * 0.10;
  ELSIF v_method='HYBRID' THEN
    IF coalesce((v_enabled->>'NEWS_DRIVEN')::boolean,true) AND coalesce(nullif(v_weights->>'NEWS_DRIVEN','')::numeric,40)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'NEWS_DRIVEN','')::numeric,40);
      v_signal:=v_signal+v_news*v_weight; v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF coalesce((v_enabled->>'MOMENTUM')::boolean,true) AND coalesce(nullif(v_weights->>'MOMENTUM','')::numeric,20)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'MOMENTUM','')::numeric,20);
      v_signal:=v_signal+(v_momentum*0.65+v_sign*v_pressure*0.55)*v_weight; v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF coalesce((v_enabled->>'MEAN_REVERSION')::boolean,true) AND coalesce(nullif(v_weights->>'MEAN_REVERSION','')::numeric,15)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'MEAN_REVERSION','')::numeric,15);
      v_signal:=v_signal+(v_reversion+v_sign*v_pressure*0.10)*v_weight; v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF coalesce((v_enabled->>'SUPPLY_DEMAND')::boolean,true) AND coalesce(nullif(v_weights->>'SUPPLY_DEMAND','')::numeric,15)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'SUPPLY_DEMAND','')::numeric,15);
      v_signal:=v_signal+v_supply*v_weight; v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF coalesce((v_enabled->>'SECTOR_INDEX')::boolean,true) AND coalesce(nullif(v_weights->>'SECTOR_INDEX','')::numeric,5)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'SECTOR_INDEX','')::numeric,5);
      v_signal:=v_signal+(v_sector*0.40+v_market*0.20+v_sign*v_pressure*0.15)*v_weight; v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF coalesce((v_enabled->>'VOLATILITY')::boolean,true) AND coalesce(nullif(v_weights->>'VOLATILITY','')::numeric,5)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'VOLATILITY','')::numeric,5);
      v_signal:=v_signal+(v_sign*greatest(0.15,v_volatility)
        *least(3,greatest(0,coalesce(nullif(v_cfg->>'volatility_multiplier','')::numeric,0.45))))*v_weight;
      v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF coalesce((v_enabled->>'SCENARIO')::boolean,true) AND coalesce(nullif(v_weights->>'SCENARIO','')::numeric,0)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'SCENARIO','')::numeric,0);
      v_signal:=v_signal+(v_scenario+v_sign*v_pressure*0.10)*v_weight; v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF v_sum_weight>0 THEN v_signal:=v_signal/v_sum_weight; ELSE v_signal:=0; END IF;
  END IF;

  RETURN greatest(-v_move_cap,least(v_move_cap,coalesce(v_signal,0)));
END
$function$;

CREATE OR REPLACE FUNCTION public.jse__auto_price_after_trade(
  a jsonb,p_security integer,p_side text,p_quantity integer,p_trade_value numeric,p_order_id bigint,p_settlement_id bigint
) RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  e public.jse_events%ROWTYPE;
  cfg public.event_config%ROWTYPE;
  s public.securities%ROWTYPE;
  peer public.securities%ROWTYPE;
  v_pct numeric;
  v_new numeric;
  v_floor numeric;
  v_ceiling numeric;
  v_peer_new numeric;
  v_peer_cap numeric;
  v_tick numeric;
  v_applied numeric;
  v_link numeric;
  v_changed integer:=0;
BEGIN
  SELECT * INTO e FROM public.jse_events WHERE is_active LIMIT 1;
  IF e.id IS NULL OR NOT e.pricing_enabled THEN RETURN jsonb_build_object('changed',false,'reason','ENGINE_DISABLED'); END IF;
  IF NOT coalesce((e.pricing_config->>'apply_on_trades')::boolean,true) THEN RETURN jsonb_build_object('changed',false,'reason','TRADE_AUTOPRICE_DISABLED'); END IF;
  IF NOT coalesce((e.pricing_config->'enabled_methods'->>e.pricing_method)::boolean,true) THEN
    RETURN jsonb_build_object('changed',false,'reason','METHOD_DISABLED');
  END IF;
  IF e.pricing_method IN ('MANUAL','NEWS_DRIVEN') THEN
    RETURN jsonb_build_object('changed',false,'reason','METHOD_IS_NOT_TRADE_DRIVEN');
  END IF;
  SELECT * INTO cfg FROM public.event_config WHERE id=1;
  SELECT * INTO s FROM public.securities WHERE id=p_security FOR UPDATE;
  IF NOT FOUND OR NOT s.active OR s.price<=0 THEN RETURN jsonb_build_object('changed',false,'reason','SECURITY_UNAVAILABLE'); END IF;

  v_pct := public.jse__pricing_signal(s.id,p_side,p_quantity,NULL);
  v_pct := greatest(-least(cfg.max_price_move_pct,coalesce(nullif(e.pricing_config->>'max_move_per_trade_pct','')::numeric,0.75)),
                    least(least(cfg.max_price_move_pct,coalesce(nullif(e.pricing_config->>'max_move_per_trade_pct','')::numeric,0.75)),v_pct));
  v_tick:=greatest(0.01,coalesce(cfg.price_tick,1));
  v_floor:=ceil(coalesce(s.base_price,s.price)*(1-cfg.max_price_move_pct/100)/v_tick)*v_tick;
  v_ceiling:=floor(coalesce(s.base_price,s.price)*(1+cfg.max_price_move_pct/100)/v_tick)*v_tick;
  v_new:=public.jse_round_tick(s.price*(1+v_pct/100),v_tick);
  v_new:=greatest(v_floor,least(v_ceiling,v_new));
  IF v_new<=0 OR v_new=s.price THEN RETURN jsonb_build_object('changed',false,'reason','NO_EFFECT','price',s.price); END IF;

  v_applied:=public.jse_pct(v_new,s.price);
  UPDATE public.securities SET previous_price=price,price=v_new,updated_at=now(),last_price_change_at=clock_timestamp()
    WHERE id=s.id;
  INSERT INTO public.price_history(security_id,previous_price,new_price,change_pct,source,order_id,settlement_id)
    VALUES(s.id,s.price,v_new,v_applied,'AUTO_'||e.pricing_method,p_order_id,p_settlement_id);
  UPDATE public.event_control SET market_updated_at=now() WHERE id=1;
  PERFORM public.jse_audit(
    a,'AUTO_PRICE_MOVE','security',s.symbol,NULL,p_order_id,
    jsonb_build_object('price',s.price),
    jsonb_build_object('price',v_new),
    jsonb_build_object('method',e.pricing_method,'side',p_side,'quantity',p_quantity,'trade_value',p_trade_value,
      'change_pct',v_applied,'settlement_id',p_settlement_id,'stale_orders_rejected',0)
  );
  v_changed:=v_changed+1;

  -- Sector/index-linked mode also reprices peers using a bounded fraction of the leader's move.
  IF e.pricing_method='SECTOR_INDEX' AND nullif(trim(coalesce(s.sector,'')),'') IS NOT NULL THEN
    v_link:=least(0.75,greatest(0,coalesce(nullif(e.pricing_config->>'sector_link_strength','')::numeric,0.35)));
    FOR peer IN
      SELECT * FROM public.securities
      WHERE id<>s.id AND active AND sector=s.sector AND base_price>0
        AND (kind='EQUITY' OR listed_at IS NOT NULL)
      ORDER BY id
      FOR UPDATE
    LOOP
      v_peer_cap:=least(cfg.max_price_move_pct,coalesce(nullif(e.pricing_config->>'max_move_per_trade_pct','')::numeric,0.75));
      v_peer_new:=public.jse_round_tick(peer.price*(1+v_applied*v_link/100),v_tick);
      v_peer_new:=greatest(
        ceil(peer.base_price*(1-cfg.max_price_move_pct/100)/v_tick)*v_tick,
        least(floor(peer.base_price*(1+cfg.max_price_move_pct/100)/v_tick)*v_tick,v_peer_new)
      );
      IF v_peer_new IS NOT NULL AND v_peer_new>0 AND v_peer_new<>peer.price THEN
        UPDATE public.securities SET previous_price=price,price=v_peer_new,updated_at=now(),last_price_change_at=clock_timestamp()
          WHERE id=peer.id;
        INSERT INTO public.price_history(security_id,previous_price,new_price,change_pct,source,order_id,settlement_id)
          VALUES(peer.id,peer.price,v_peer_new,public.jse_pct(v_peer_new,peer.price),'AUTO_SECTOR_LINK',p_order_id,p_settlement_id);
        PERFORM public.jse_audit(
          a,'AUTO_SECTOR_LINK_MOVE','security',peer.symbol,NULL,p_order_id,
          jsonb_build_object('price',peer.price),
          jsonb_build_object('price',v_peer_new),
          jsonb_build_object('source_symbol',s.symbol,'sector',s.sector,'correlation',v_link,'settlement_id',p_settlement_id,'stale_orders_rejected',0)
        );
        v_changed:=v_changed+1;
      END IF;
    END LOOP;
  END IF;
  RETURN jsonb_build_object('changed',v_changed>0,'change_count',v_changed,'method',e.pricing_method,
    'symbol',s.symbol,'previous_price',s.price,'new_price',v_new,'applied_pct',v_applied,'stale_orders_rejected',0);
END
$function$;

CREATE OR REPLACE FUNCTION public.jse_pricing_method(a jsonb,p jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  v_action text:=upper(coalesce(p->>'action','STATE'));
  v_method text:=upper(trim(coalesce(p->>'method','')));
  v_enabled boolean;
  v_config jsonb;
  v_before jsonb;
  v_after jsonb;
  v_event public.jse_events%ROWTYPE;
  v_cfg public.event_config%ROWTYPE;
  v_max numeric;
  v_weight_sum numeric;
BEGIN
  IF v_action='STATE' THEN
    PERFORM public.jse_require_role(a,'ADMIN','VIEWER');
    SELECT * INTO v_event FROM public.jse_events WHERE is_active LIMIT 1;
    RETURN jsonb_build_object('success',true,'event_id',v_event.id,'event_name',v_event.event_name,
      'method',coalesce(v_event.pricing_method,'NEWS_DRIVEN'),'pricing_enabled',coalesce(v_event.pricing_enabled,true),
      'config',coalesce(v_event.pricing_config,'{}'::jsonb));
  END IF;
  IF v_action NOT IN ('SET','CONFIGURE','APPLY') THEN
    PERFORM public.jse_fail('INVALID_ACTION','Use STATE, SET or CONFIGURE.',400);
  END IF;
  PERFORM public.jse_require_role(a,'ADMIN');
  PERFORM public.jse_require_admin_password(a,p);
  SELECT * INTO v_event FROM public.jse_events WHERE is_active LIMIT 1 FOR UPDATE;
  IF v_event.id IS NULL THEN PERFORM public.jse_fail('ACTIVE_EVENT_REQUIRED','Activate an event before configuring pricing.',409); END IF;
  SELECT * INTO v_cfg FROM public.event_config WHERE id=1;

  v_method:=coalesce(nullif(v_method,''),v_event.pricing_method,'NEWS_DRIVEN');
  IF v_method NOT IN ('MANUAL','NEWS_DRIVEN','MOMENTUM','MEAN_REVERSION','SUPPLY_DEMAND','SECTOR_INDEX','VOLATILITY','HYBRID','SCENARIO') THEN
    PERFORM public.jse_fail('INVALID_PRICING_METHOD','Select one of the nine available pricing methods.',400);
  END IF;
  v_enabled:=coalesce((p->>'pricing_enabled')::boolean,v_event.pricing_enabled,true);
  v_config:=coalesce(p->'config',v_event.pricing_config,'{}'::jsonb);
  IF jsonb_typeof(v_config)<>'object' THEN PERFORM public.jse_fail('INVALID_PRICING_CONFIG','Pricing configuration must be an object.',400); END IF;
  v_config:='{
      "enabled_methods":{"MANUAL":true,"NEWS_DRIVEN":true,"MOMENTUM":true,"MEAN_REVERSION":true,"SUPPLY_DEMAND":true,"SECTOR_INDEX":true,"VOLATILITY":true,"HYBRID":true,"SCENARIO":true},
      "apply_on_trades":true,"apply_on_news":true,"max_move_per_trade_pct":0.75,
      "momentum_lookback":5,"mean_reversion_strength":0.12,"supply_demand_strength":0.75,
      "sector_link_strength":0.35,"volatility_multiplier":0.45,"scenario":"SIDEWAYS",
      "hybrid_weights":{"NEWS_DRIVEN":40,"MOMENTUM":20,"MEAN_REVERSION":15,"SUPPLY_DEMAND":15,"SECTOR_INDEX":5,"VOLATILITY":5,"SCENARIO":0}
    }'::jsonb || v_config;
  v_config:=jsonb_set(v_config,'{enabled_methods}',
    '{
      "MANUAL":true,"NEWS_DRIVEN":true,"MOMENTUM":true,"MEAN_REVERSION":true,"SUPPLY_DEMAND":true,
      "SECTOR_INDEX":true,"VOLATILITY":true,"HYBRID":true,"SCENARIO":true
    }'::jsonb || coalesce(v_config->'enabled_methods','{}'::jsonb),true);
  v_config:=jsonb_set(v_config,'{hybrid_weights}',
    '{"NEWS_DRIVEN":40,"MOMENTUM":20,"MEAN_REVERSION":15,"SUPPLY_DEMAND":15,"SECTOR_INDEX":5,"VOLATILITY":5,"SCENARIO":0}'::jsonb || coalesce(v_config->'hybrid_weights','{}'::jsonb),true);
  IF NOT coalesce((v_config->'enabled_methods'->>v_method)::boolean,true) THEN
    PERFORM public.jse_fail('PRICING_METHOD_DISABLED','Enable the selected method before applying it.',409);
  END IF;

  BEGIN
    v_max:=coalesce(nullif(v_config->>'max_move_per_trade_pct','')::numeric,0.75);
    IF v_max<0.05 OR v_max>least(10,v_cfg.max_price_move_pct) THEN
      PERFORM public.jse_fail('INVALID_PRICING_CONFIG','Per-trade movement must be at least 0.05% and no higher than the market movement cap.',400);
    END IF;
    IF coalesce(nullif(v_config->>'momentum_lookback','')::integer,5) NOT BETWEEN 2 AND 20 THEN
      PERFORM public.jse_fail('INVALID_PRICING_CONFIG','Momentum lookback must be from 2 to 20 price changes.',400);
    END IF;
    IF coalesce(nullif(v_config->>'mean_reversion_strength','')::numeric,0.12) NOT BETWEEN 0 AND 0.5
      OR coalesce(nullif(v_config->>'supply_demand_strength','')::numeric,0.75) NOT BETWEEN 0 AND 3
      OR coalesce(nullif(v_config->>'sector_link_strength','')::numeric,0.35) NOT BETWEEN 0 AND 0.75
      OR coalesce(nullif(v_config->>'volatility_multiplier','')::numeric,0.45) NOT BETWEEN 0 AND 3 THEN
      PERFORM public.jse_fail('INVALID_PRICING_CONFIG','One of the pricing strategy strengths is outside its allowed range.',400);
    END IF;
    IF upper(coalesce(v_config->>'scenario','SIDEWAYS')) NOT IN ('SIDEWAYS','BULL','BEAR','CRASH','RALLY') THEN
      PERFORM public.jse_fail('INVALID_SCENARIO','Choose Sideways, Bull, Bear, Crash or Rally.',400);
    END IF;
    SELECT sum(value::numeric) INTO v_weight_sum FROM jsonb_each_text(v_config->'hybrid_weights') x(key,value);
    IF coalesce(v_weight_sum,0)<=0 THEN PERFORM public.jse_fail('INVALID_HYBRID_WEIGHTS','Hybrid needs at least one positive component weight.',400); END IF;
  EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN
    PERFORM public.jse_fail('INVALID_PRICING_CONFIG','Pricing settings contain an invalid number.',400);
  END;

  SELECT to_jsonb(e)-'updated_at' INTO v_before FROM public.jse_events e WHERE id=v_event.id;
  IF v_action='SET' THEN
    v_after:=jsonb_build_object('pricing_method',v_method);
    UPDATE public.jse_events SET pricing_method=v_method,updated_at=now() WHERE id=v_event.id;
  ELSE
    UPDATE public.jse_events SET pricing_method=v_method,pricing_enabled=v_enabled,pricing_config=v_config,updated_at=now()
      WHERE id=v_event.id;
    SELECT to_jsonb(e)-'updated_at' INTO v_after FROM public.jse_events e WHERE id=v_event.id;
  END IF;
  IF v_before IS DISTINCT FROM v_after THEN
    PERFORM public.jse_audit(a,'PRICING_CONTROL_UPDATED','event',v_event.id::text,NULL,NULL,v_before,v_after,
      jsonb_build_object('event_name',v_event.event_name,'method',v_method,'pricing_enabled',v_enabled));
  END IF;
  RETURN jsonb_build_object('success',true,'event_id',v_event.id,'event_name',v_event.event_name,
    'method',v_method,'pricing_enabled',v_enabled,'config',v_config,'message','Pricing control saved for this event.');
END
$function$;

CREATE OR REPLACE FUNCTION public.jse_manual_set_market_price(a jsonb,p jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  v_symbol text:=upper(trim(coalesce(p->>'symbol','')));
  v_security integer;
  v_price numeric;
  s public.securities%ROWTYPE;
  v_cfg public.event_config%ROWTYPE;
  v_event public.jse_events%ROWTYPE;
  v_floor numeric;
  v_ceiling numeric;
  v_tick numeric;
BEGIN
  PERFORM public.jse_require_role(a,'ADMIN');
  PERFORM public.jse_require_admin_password(a,p);
  BEGIN
    v_security:=nullif(p->>'security_id','')::integer;
    v_price:=nullif(p->>'price','')::numeric;
  EXCEPTION WHEN others THEN
    PERFORM public.jse_fail('INVALID_MANUAL_PRICE','Select a security and enter a whole-number price.',400);
  END;
  IF v_price IS NULL OR v_price<=0 OR v_price<>trunc(v_price) THEN
    PERFORM public.jse_fail('INVALID_MANUAL_PRICE','Share price must be a positive whole number without decimals.',400);
  END IF;
  SELECT * INTO v_event FROM public.jse_events WHERE is_active LIMIT 1 FOR UPDATE;
  IF v_event.id IS NULL THEN PERFORM public.jse_fail('ACTIVE_EVENT_REQUIRED','Activate an event before setting its price.',409); END IF;
  IF v_event.pricing_method<>'MANUAL' THEN
    PERFORM public.jse_fail('MANUAL_MODE_REQUIRED','Select Manual pricing as the active method before setting a share price.',409);
  END IF;
  SELECT * INTO v_cfg FROM public.event_config WHERE id=1;
  SELECT * INTO s FROM public.securities
    WHERE (v_security IS NOT NULL AND id=v_security) OR (v_symbol<>'' AND symbol=v_symbol)
    FOR UPDATE;
  IF NOT FOUND THEN PERFORM public.jse_fail('SECURITY_NOT_FOUND','Select a valid security.',404); END IF;
  IF NOT s.active OR (s.kind='IPO' AND s.listed_at IS NULL) THEN
    PERFORM public.jse_fail('SECURITY_NOT_TRADABLE','Only active and listed securities can be manually repriced.',409);
  END IF;
  v_tick:=greatest(0.01,coalesce(v_cfg.price_tick,1));
  v_floor:=ceil(coalesce(s.base_price,s.price)*(1-v_cfg.max_price_move_pct/100)/v_tick)*v_tick;
  v_ceiling:=floor(coalesce(s.base_price,s.price)*(1+v_cfg.max_price_move_pct/100)/v_tick)*v_tick;
  IF v_price<v_floor OR v_price>v_ceiling THEN
    PERFORM public.jse_fail('MANUAL_PRICE_OUT_OF_BAND','Price must stay inside the configured base-price movement band ('||
      round(v_floor)::text||' to '||round(v_ceiling)::text||').',409);
  END IF;
  IF v_price=s.price THEN
    RETURN jsonb_build_object('success',true,'symbol',s.symbol,'name',s.name,'previous_price',s.price,'new_price',s.price,
      'changed',false,'stale_orders_rejected',0,'message','The share price is already at that value.');
  END IF;
  UPDATE public.securities SET previous_price=price,price=v_price,updated_at=now(),last_price_change_at=clock_timestamp()
    WHERE id=s.id;
  INSERT INTO public.price_history(security_id,previous_price,new_price,change_pct,source)
    VALUES(s.id,s.price,v_price,public.jse_pct(v_price,s.price),'ADMIN_MANUAL_PRICE');
  UPDATE public.event_control SET market_updated_at=now() WHERE id=1;
  PERFORM public.jse_audit(a,'MANUAL_PRICE_CHANGED','security',s.symbol,NULL,NULL,
    jsonb_build_object('price',s.price),jsonb_build_object('price',v_price),
    jsonb_build_object('event_name',v_event.event_name,'movement_pct',public.jse_pct(v_price,s.price),'stale_orders_rejected',0));
  RETURN jsonb_build_object('success',true,'symbol',s.symbol,'name',s.name,'previous_price',s.price,'new_price',v_price,
    'changed',true,'stale_orders_rejected',0,'message',s.symbol||' price updated to '||round(v_price)::text||'. Pending orders were not rejected.');
END
$function$;

-- Integrate automatic repricing into completed trades. Price discovery changes the next quote only;
-- the settled transaction keeps its original entered execution price and no open orders are rejected.
-- Remove the stale-quote rejection branch: an order settles at its accepted entered price.
-- Price discovery always changes the next quote, never re-prices or rejects existing orders.
DO $patch_entered_price$
DECLARE
  v_fn text;
  v_start integer;
  v_end integer;
  v_marker text := '  IF jse_price_out_of_band(o.price, s.price) AND p_source = ''BANK'' THEN';
  v_end_marker text := '  IF NOT t.active THEN';
BEGIN
  v_fn:=pg_get_functiondef('public.jse__settle(jsonb,bigint,text)'::regprocedure);
  v_start:=position(v_marker IN v_fn);
  v_end:=position(v_end_marker IN v_fn);
  IF v_start=0 AND position('PRICE_STALE' IN v_fn)=0 THEN RETURN; END IF;
  IF v_start=0 OR v_end<=v_start THEN
    IF position('PRICE_STALE' IN v_fn)=0 THEN RETURN; END IF;
    RAISE EXCEPTION '037: unable to safely locate the settlement stale-price rejection block';
  END IF;
  v_fn:=substr(v_fn,1,v_start-1)||
    '  -- Accepted order price is authoritative; a later quote change does not reject this trade.'||chr(10)||'  '||
    substr(v_fn,v_end);
  EXECUTE v_fn;
END
$patch_entered_price$;

DO $patch_settlement$
DECLARE
  v_fn text;
  v_old text := $old$  -- trade statistics only: settlement never changes the market price (Market News is the only price engine)
  UPDATE securities SET trade_count = trade_count + 1, traded_quantity = traded_quantity + o.quantity, traded_value = traded_value + v_tv,
         last_trade_at = now() WHERE id = s.id;$old$;
  v_new text := $new$  -- record trading activity, then let the active event's selected model move the next market quote.
  UPDATE securities SET trade_count = trade_count + 1, traded_quantity = traded_quantity + o.quantity, traded_value = traded_value + v_tv,
         last_trade_at = now() WHERE id = s.id;
  PERFORM public.jse__auto_price_after_trade(
    a,s.id,CASE WHEN v_team_buys THEN 'BUY' ELSE 'SELL' END,o.quantity,v_tv,o.id,v_settle_id
  );$new$;
BEGIN
  v_fn:=pg_get_functiondef('public.jse__settle(jsonb,bigint,text)'::regprocedure);
  IF position('jse__auto_price_after_trade' IN v_fn)>0 THEN RETURN; END IF;
  IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '037: could not find safe settlement price-discovery insertion point'; END IF;
  EXECUTE replace(v_fn,v_old,v_new);
END
$patch_settlement$;

-- Route Market News through the selected strategy. Non-news strategies still record the news item,
-- but don't silently apply the news-driven price model in parallel.
DO $patch_market_news$
DECLARE
  v_fn text;
  v_old text;
  v_new text;
  v_decl_old text := 'v_band_base numeric; v_daily_cap constant numeric := 15;';
  v_decl_new text := 'v_band_base numeric; v_daily_cap numeric; v_method text; v_pricing_enabled boolean; v_pricing_config jsonb;';
  v_cfg_old text := '  SELECT * INTO cfg FROM event_config WHERE id = 1;';
  v_cfg_new text := '  SELECT * INTO cfg FROM event_config WHERE id = 1;
  v_daily_cap := least(15::numeric, cfg.max_price_move_pct);';
BEGIN
  v_fn:=pg_get_functiondef('public.jse_market_news(jsonb,jsonb)'::regprocedure);
  IF position('jse__record_news_no_price' IN v_fn)>0 THEN RETURN; END IF;
  IF position(v_decl_old IN v_fn)=0 THEN RAISE EXCEPTION '037: Market News declaration patch anchor not found'; END IF;
  v_fn:=replace(v_fn,v_decl_old,v_decl_new);
  IF position(v_cfg_old IN v_fn)=0 THEN RAISE EXCEPTION '037: Market News config patch anchor not found'; END IF;
  v_fn:=replace(v_fn,v_cfg_old,v_cfg_new);
  v_old := $old$  RETURN jse__apply_news_price(a, s, v_mood, v_pct, v_new,
    coalesce(v_headline, initcap(replace(v_mood, '_', ' ')) || ' news on ' || s.name));$old$;
  v_new := $new$  SELECT pricing_method,pricing_enabled,pricing_config
    INTO v_method,v_pricing_enabled,v_pricing_config
    FROM public.jse_events WHERE is_active LIMIT 1;
  IF coalesce(v_method,'NEWS_DRIVEN') NOT IN ('NEWS_DRIVEN','HYBRID')
     OR NOT coalesce(v_pricing_enabled,true)
     OR NOT coalesce((v_pricing_config->>'apply_on_news')::boolean,true)
     OR NOT coalesce((v_pricing_config->'enabled_methods'->>coalesce(v_method,'NEWS_DRIVEN'))::boolean,true) THEN
    RETURN public.jse__record_news_no_price(a,s,v_mood,v_pct,
      coalesce(v_headline,initcap(replace(v_mood,'_',' '))||' news on '||s.name));
  END IF;
  IF v_method='HYBRID' THEN
    v_pct:=public.jse__pricing_signal(s.id,NULL,0,v_pct);
    v_new:=public.jse_round_tick(s.price*(1+v_pct/100),cfg.price_tick);
    v_new:=greatest(v_lo,least(v_hi,v_new));
  END IF;
  RETURN public.jse__apply_news_price(a, s, v_mood, v_pct, v_new,
    coalesce(v_headline, initcap(replace(v_mood, '_', ' ')) || ' news on ' || s.name));$new$;
  IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '037: Market News return patch anchor not found'; END IF;
  EXECUTE replace(v_fn,v_old,v_new);
END
$patch_market_news$;

INSERT INTO public.schema_migrations(version) VALUES ('037_advanced_pricing_engine')
ON CONFLICT (version) DO NOTHING;
`;var yr=[["001_schema",Vi],["001a_upgrades",Yi],["002_core",Ki],["003_ops",Xi],["004_reads",Ji],["005_exports",zi],["006_seed",Qi],["007_tuning",Zi],["008_v311",er],["009_hatchable",tr],["010_safety",sr],["011_roster_ipo",ar],["012_big_bull_special_account",ir],["012_big_bull_admin",rr],["013_dalal_roster",nr],["014_big_bull_news_assessment",or],["015_broker_sugadev",_r],["016_news_single_move_cap",Er],["017_portfolio_ipo_visibility",cr],["018_broker_assignments_and_counts",lr],["019_ipo_start_market_order",dr],["020_broker_sugadev_name",ur],["021_locked_baseline_reset",Nr],["022_locked_baseline_refresh",pr],["023_lock_baseline_ipo_allotments",Tr],["024_broker_admin_page_repair",mr],["025_institutional_unlimited_order_value",Rr],["026_loan_cash_in_base_money",vr],["027_ipo_flexible_sell_quantity",br],["028_company_base_price_band",Ir],["029_no_short_selling_override",Or],["030_negotiated_market_trades",Lr],["031_order_accuracy",hr],["032_price_band_orders",Ar],["033_admin_control_plane",Sr],["034_entered_price_execution",fr],["035_multi_event_admin",gr],["036_pricing_method_selector",Dr],["037_advanced_pricing_engine",Fr]],lc=new Set(["035_multi_event_admin","036_pricing_method_selector","037_advanced_pricing_engine","001a_upgrades","002_core","003_ops","004_reads","005_exports","007_tuning","008_v311","011_roster_ipo","012_big_bull_admin","021_locked_baseline_reset","024_broker_admin_page_repair","025_institutional_unlimited_order_value","026_loan_cash_in_base_money","028_company_base_price_band","031_order_accuracy","032_price_band_orders"]),O=class extends Error{constructor(s,a,i,r){super(i);this.status=s;this.code=a;this.extra=r}};function dc(){let e=process.env.DATABASE_URL||"postgres://postgres@127.0.0.1:5433/jse",t=new URL(e);process.env.DB_NAME&&(t.pathname="/"+process.env.DB_NAME);let s=t.searchParams.get("sslmode");return(s==="require"||s==="prefer"||s==="verify-ca")&&t.searchParams.set("sslmode","verify-full"),t.toString()}var Dt=null;function Cr(){return Dt||(Dt=new jr.default.Pool({connectionString:dc(),max:Number(process.env.DB_POOL_MAX||8),idleTimeoutMillis:3e4,connectionTimeoutMillis:1e4,allowExitOnIdle:!1}),Dt.on("error",e=>console.warn("[db] idle client error:",e.message))),Dt}var uc=new Set(["40001","40P01","57P01","08006","08003","08000","53300"]);async function he(e,t=[]){let s=0;for(;;)try{return await Cr().query(e,t)}catch(a){if(s++,(uc.has(a?.code)||/Connection terminated|ECONNRESET|timeout exceeded when trying to connect/i.test(String(a?.message)))&&s<3){await new Promise(r=>setTimeout(r,120*s+Math.random()*120));continue}throw a}}async function T(e,t,s,a={}){if(!/^jse_[a-z0-9_]+$/.test(e))throw new Error("bad function name");try{let i;a.noActor?i=await he(`SELECT ${e}($1::jsonb) AS r`,[JSON.stringify(s??{})]):s===void 0?i=await he(`SELECT ${e}() AS r`):i=await he(`SELECT ${e}($1::jsonb, $2::jsonb) AS r`,[JSON.stringify(t??{}),JSON.stringify(s??{})]);let r=i.rows[0]?.r;if(r&&r.success===!1)throw new O(Number(r.http)||400,r.code||"REQUEST_FAILED",r.error||"Request failed",r.errors?{errors:r.errors}:void 0);return r}catch(i){throw i instanceof O?i:i?.code==="JSE01"?new O(Number(i.hint)||400,i.detail||"REQUEST_FAILED",i.message):i?.code==="23505"?new O(409,"DUPLICATE","This action was already recorded (duplicate request blocked)."):i?.code==="23514"?new O(409,"RULE_VIOLATION","The request would break a financial rule (for example negative cash or holdings) and was blocked."):i?.code==="57014"?new O(503,"TIMEOUT","The database took too long to respond. Please retry."):i}}var Ft=null;function Ur(){return process.env.SKIP_MIGRATIONS==="1"?Promise.resolve():(Ft||(Ft=pc().catch(e=>{throw Ft=null,e})),Ft)}async function Nc(e){let{createHash:t}=await import("node:crypto");return t("sha256").update(e).digest("hex").slice(0,16)}async function pc(){let e=await Cr().connect();try{await e.query("BEGIN"),await e.query("SELECT pg_advisory_xact_lock(727272)"),await e.query("CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now(), checksum text)");let t=new Map((await e.query("SELECT version, checksum FROM schema_migrations")).rows.map(r=>[r.version,r.checksum])),s=[],a=t.has("029_no_short_selling_override")||t.has("030_negotiated_market_trades"),i=yr.findIndex(([r])=>r==="030_negotiated_market_trades");for(let[r,[n,o]]of yr.entries()){if(a&&r<=i)continue;let E=await Nc(o),_=t.has(n);if(_&&(t.get(n)===E||!lc.has(n)))continue;let c=_?o.replace(/INSERT INTO schema_migrations\(version\) VALUES \('[^']+'\);/g,""):o;await e.query("SAVEPOINT m");try{await e.query(c)}catch(l){throw new Error(`migration ${n} failed: ${l.message}`)}await e.query("INSERT INTO schema_migrations(version, checksum) VALUES ($1, $2) ON CONFLICT (version) DO UPDATE SET checksum = EXCLUDED.checksum, applied_at = now()",[n,E]),await e.query("RELEASE SAVEPOINT m"),s.push(`${n} ${_?"re-applied":"applied"}`)}await e.query("COMMIT"),s.length&&console.log("[db] migrations: "+s.join(", "))}catch(t){try{await e.query("ROLLBACK")}catch{}throw t}finally{e.release()}}import{createPublicKey as Tc,verify as mc}from"node:crypto";var Pr="https://token.actions.githubusercontent.com",ot=null;async function Hr(e=!1){if(!e&&ot&&Date.now()-ot.at<36e5)return ot.keys;let t=await fetch(Pr+"/.well-known/jwks",{headers:{accept:"application/json"}});if(!t.ok)throw new Error("could not load GitHub signing keys ("+t.status+")");let s=await t.json();return ot={at:Date.now(),keys:s.keys||[]},ot.keys}var xs=e=>Buffer.from(e.replace(/-/g,"+").replace(/_/g,"/"),"base64");async function Mr(e,t){let s=e.split(".");if(s.length!==3)throw new Error("malformed token");let a=JSON.parse(xs(s[0]).toString("utf8")),i=JSON.parse(xs(s[1]).toString("utf8"));if(a.alg!=="RS256")throw new Error("unexpected algorithm");let r=(await Hr()).find(_=>_.kid===a.kid);if(r||(r=(await Hr(!0)).find(_=>_.kid===a.kid)),!r)throw new Error("unknown signing key");if(!mc("RSA-SHA256",Buffer.from(s[0]+"."+s[1]),Tc({key:r,format:"jwk"}),xs(s[2])))throw new Error("bad signature");let o=Math.floor(Date.now()/1e3);if(i.iss!==Pr)throw new Error("wrong issuer");if(!(Array.isArray(i.aud)?i.aud:[i.aud]).includes(t.audience))throw new Error("wrong audience");if(typeof i.exp!="number"||i.exp<o-30)throw new Error("token expired");if(typeof i.nbf=="number"&&i.nbf>o+60)throw new Error("token not valid yet");if(i.repository!==t.repository)throw new Error("wrong repository");if(t.refs&&t.refs.length&&!t.refs.includes(i.ref))throw new Error("branch not allowed");return i}import{createRequire as Rc}from"module";var vc=Rc("/"),bc;try{bc=vc("worker_threads").Worker}catch{}var H=Uint8Array,ce=Uint16Array,Qs=Int32Array,yt=new H([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),jt=new H([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),Vs=new H([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Gr=function(e,t){for(var s=new ce(31),a=0;a<31;++a)s[a]=t+=1<<e[a-1];for(var i=new Qs(s[30]),a=1;a<30;++a)for(var r=s[a];r<s[a+1];++r)i[r]=r-s[a]<<5|a;return{b:s,r:i}},qr=Gr(yt,2),$r=qr.b,Ys=qr.r;$r[28]=258,Ys[258]=28;var Vr=Gr(jt,0),Ic=Vr.b,kr=Vr.r,Ks=new ce(32768);for(A=0;A<32768;++A)Ae=(A&43690)>>1|(A&21845)<<1,Ae=(Ae&52428)>>2|(Ae&13107)<<2,Ae=(Ae&61680)>>4|(Ae&3855)<<4,Ks[A]=((Ae&65280)>>8|(Ae&255)<<8)>>1;var Ae,A,ve=function(e,t,s){for(var a=e.length,i=0,r=new ce(t);i<a;++i)e[i]&&++r[e[i]-1];var n=new ce(t);for(i=1;i<t;++i)n[i]=n[i-1]+r[i-1]<<1;var o;if(s){o=new ce(1<<t);var E=15-t;for(i=0;i<a;++i)if(e[i])for(var _=i<<4|e[i],c=t-e[i],l=n[e[i]-1]++<<c,d=l|(1<<c)-1;l<=d;++l)o[Ks[l]>>E]=_}else for(o=new ce(a),i=0;i<a;++i)e[i]&&(o[i]=Ks[n[e[i]-1]++]>>15-e[i]);return o},ge=new H(288);for(A=0;A<144;++A)ge[A]=8;var A;for(A=144;A<256;++A)ge[A]=9;var A;for(A=256;A<280;++A)ge[A]=7;var A;for(A=280;A<288;++A)ge[A]=8;var A,ct=new H(32);for(A=0;A<32;++A)ct[A]=5;var A,Oc=ve(ge,9,0),Lc=ve(ge,9,1),hc=ve(ct,5,0),Ac=ve(ct,5,1),Bs=function(e){for(var t=e[0],s=1;s<e.length;++s)e[s]>t&&(t=e[s]);return t},pe=function(e,t,s){var a=t/8|0;return(e[a]|e[a+1]<<8)>>(t&7)&s},Gs=function(e,t){var s=t/8|0;return(e[s]|e[s+1]<<8|e[s+2]<<16)>>(t&7)},Zs=function(e){return(e+7)/8|0},lt=function(e,t,s){return(t==null||t<0)&&(t=0),(s==null||s>e.length)&&(s=e.length),new H(e.subarray(t,s))};var Sc=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],te=function(e,t,s){var a=new Error(t||Sc[e]);if(a.code=e,Error.captureStackTrace&&Error.captureStackTrace(a,te),!s)throw a;return a},fc=function(e,t,s,a){var i=e.length,r=a?a.length:0;if(!i||t.f&&!t.l)return s||new H(0);var n=!s,o=n||t.i!=2,E=t.i;n&&(s=new H(i*3));var _=function(Ke){var Xe=s.length;if(Ke>Xe){var He=new H(Math.max(Xe*2,Ke));He.set(s),s=He}},c=t.f||0,l=t.p||0,d=t.b||0,u=t.l,b=t.d,I=t.m,F=t.n,P=i*8;do{if(!u){c=pe(e,l,1);var G=pe(e,l+1,3);if(l+=3,G)if(G==1)u=Lc,b=Ac,I=9,F=5;else if(G==2){var x=pe(e,l,31)+257,g=pe(e,l+10,15)+4,R=x+pe(e,l+5,31)+1;l+=14;for(var m=new H(R),K=new H(19),q=0;q<g;++q)K[Vs[q]]=pe(e,l+q*3,7);l+=g*3;for(var Q=Bs(K),fe=(1<<Q)-1,ne=ve(K,Q,1),q=0;q<R;){var se=ne[pe(e,l,fe)];l+=se&15;var y=se>>4;if(y<16)m[q++]=y;else{var X=0,k=0;for(y==16?(k=3+pe(e,l,3),l+=2,X=m[q-1]):y==17?(k=3+pe(e,l,7),l+=3):y==18&&(k=11+pe(e,l,127),l+=7);k--;)m[q++]=X}}var ae=m.subarray(0,x),J=m.subarray(x);I=Bs(ae),F=Bs(J),u=ve(ae,I,1),b=ve(J,F,1)}else te(1);else{var y=Zs(l)+4,j=e[y-4]|e[y-3]<<8,M=y+j;if(M>i){E&&te(0);break}o&&_(d+j),s.set(e.subarray(y,M),d),t.b=d+=j,t.p=l=M*8,t.f=c;continue}if(l>P){E&&te(0);break}}o&&_(d+131072);for(var Ye=(1<<I)-1,le=(1<<F)-1,Oe=l;;Oe=l){var X=u[Gs(e,l)&Ye],oe=X>>4;if(l+=X&15,l>P){E&&te(0);break}if(X||te(2),oe<256)s[d++]=oe;else if(oe==256){Oe=l,u=null;break}else{var _e=oe-254;if(oe>264){var q=oe-257,w=yt[q];_e=pe(e,l,(1<<w)-1)+$r[q],l+=w}var me=b[Gs(e,l)&le],Ce=me>>4;me||te(3),l+=me&15;var J=Ic[Ce];if(Ce>3){var w=jt[Ce];J+=Gs(e,l)&(1<<w)-1,l+=w}if(l>P){E&&te(0);break}o&&_(d+131072);var Ue=d+_e;if(d<J){var Nt=r-J,pt=Math.min(J,Ue);for(Nt+d<0&&te(3);d<pt;++d)s[d]=a[Nt+d]}for(;d<Ue;++d)s[d]=s[d-J]}}t.l=u,t.p=Oe,t.b=d,t.f=c,u&&(c=1,t.m=I,t.d=b,t.n=F)}while(!c);return d!=s.length&&n?lt(s,0,d):s.subarray(0,d)},Se=function(e,t,s){s<<=t&7;var a=t/8|0;e[a]|=s,e[a+1]|=s>>8},_t=function(e,t,s){s<<=t&7;var a=t/8|0;e[a]|=s,e[a+1]|=s>>8,e[a+2]|=s>>16},qs=function(e,t){for(var s=[],a=0;a<e.length;++a)e[a]&&s.push({s:a,f:e[a]});var i=s.length,r=s.slice();if(!i)return{t:Kr,l:0};if(i==1){var n=new H(s[0].s+1);return n[s[0].s]=1,{t:n,l:1}}s.sort(function(M,x){return M.f-x.f}),s.push({s:-1,f:25001});var o=s[0],E=s[1],_=0,c=1,l=2;for(s[0]={s:-1,f:o.f+E.f,l:o,r:E};c!=i-1;)o=s[s[_].f<s[l].f?_++:l++],E=s[_!=c&&s[_].f<s[l].f?_++:l++],s[c++]={s:-1,f:o.f+E.f,l:o,r:E};for(var d=r[0].s,a=1;a<i;++a)r[a].s>d&&(d=r[a].s);var u=new ce(d+1),b=Xs(s[c-1],u,0);if(b>t){var a=0,I=0,F=b-t,P=1<<F;for(r.sort(function(x,g){return u[g.s]-u[x.s]||x.f-g.f});a<i;++a){var G=r[a].s;if(u[G]>t)I+=P-(1<<b-u[G]),u[G]=t;else break}for(I>>=F;I>0;){var y=r[a].s;u[y]<t?I-=1<<t-u[y]++-1:++a}for(;a>=0&&I;--a){var j=r[a].s;u[j]==t&&(--u[j],++I)}b=t}return{t:new H(u),l:b}},Xs=function(e,t,s){return e.s==-1?Math.max(Xs(e.l,t,s+1),Xs(e.r,t,s+1)):t[e.s]=s},wr=function(e){for(var t=e.length;t&&!e[--t];);for(var s=new ce(++t),a=0,i=e[0],r=1,n=function(E){s[a++]=E},o=1;o<=t;++o)if(e[o]==i&&o!=t)++r;else{if(!i&&r>2){for(;r>138;r-=138)n(32754);r>2&&(n(r>10?r-11<<5|28690:r-3<<5|12305),r=0)}else if(r>3){for(n(i),--r;r>6;r-=6)n(8304);r>2&&(n(r-3<<5|8208),r=0)}for(;r--;)n(i);r=1,i=e[o]}return{c:s.subarray(0,a),n:t}},Et=function(e,t){for(var s=0,a=0;a<t.length;++a)s+=e[a]*t[a];return s},Yr=function(e,t,s){var a=s.length,i=Zs(t+2);e[i]=a&255,e[i+1]=a>>8,e[i+2]=e[i]^255,e[i+3]=e[i+1]^255;for(var r=0;r<a;++r)e[i+r+4]=s[r];return(i+4+a)*8},Wr=function(e,t,s,a,i,r,n,o,E,_,c){Se(t,c++,s),++i[256];for(var l=qs(i,15),d=l.t,u=l.l,b=qs(r,15),I=b.t,F=b.l,P=wr(d),G=P.c,y=P.n,j=wr(I),M=j.c,x=j.n,g=new ce(19),R=0;R<G.length;++R)++g[G[R]&31];for(var R=0;R<M.length;++R)++g[M[R]&31];for(var m=qs(g,7),K=m.t,q=m.l,Q=19;Q>4&&!K[Vs[Q-1]];--Q);var fe=_+5<<3,ne=Et(i,ge)+Et(r,ct)+n,se=Et(i,d)+Et(r,I)+n+14+3*Q+Et(g,K)+2*g[16]+3*g[17]+7*g[18];if(E>=0&&fe<=ne&&fe<=se)return Yr(t,c,e.subarray(E,E+_));var X,k,ae,J;if(Se(t,c,1+(se<ne)),c+=2,se<ne){X=ve(d,u,0),k=d,ae=ve(I,F,0),J=I;var Ye=ve(K,q,0);Se(t,c,y-257),Se(t,c+5,x-1),Se(t,c+10,Q-4),c+=14;for(var R=0;R<Q;++R)Se(t,c+3*R,K[Vs[R]]);c+=3*Q;for(var le=[G,M],Oe=0;Oe<2;++Oe)for(var oe=le[Oe],R=0;R<oe.length;++R){var _e=oe[R]&31;Se(t,c,Ye[_e]),c+=K[_e],_e>15&&(Se(t,c,oe[R]>>5&127),c+=oe[R]>>12)}}else X=Oc,k=ge,ae=hc,J=ct;for(var R=0;R<o;++R){var w=a[R];if(w>255){var _e=w>>18&31;_t(t,c,X[_e+257]),c+=k[_e+257],_e>7&&(Se(t,c,w>>23&31),c+=yt[_e]);var me=w&31;_t(t,c,ae[me]),c+=J[me],me>3&&(_t(t,c,w>>5&8191),c+=jt[me])}else _t(t,c,X[w]),c+=k[w]}return _t(t,c,X[256]),c+k[256]},gc=new Qs([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),Kr=new H(0),Dc=function(e,t,s,a,i,r){var n=r.z||e.length,o=new H(a+n+5*(1+Math.ceil(n/7e3))+i),E=o.subarray(a,o.length-i),_=r.l,c=(r.r||0)&7;if(t){c&&(E[0]=r.r>>3);for(var l=gc[t-1],d=l>>13,u=l&8191,b=(1<<s)-1,I=r.p||new ce(32768),F=r.h||new ce(b+1),P=Math.ceil(s/3),G=2*P,y=function(Pt){return(e[Pt]^e[Pt+1]<<P^e[Pt+2]<<G)&b},j=new Qs(25e3),M=new ce(288),x=new ce(32),g=0,R=0,m=r.i||0,K=0,q=r.w||0,Q=0;m+2<n;++m){var fe=y(m),ne=m&32767,se=F[fe];if(I[ne]=se,F[fe]=ne,q<=m){var X=n-m;if((g>7e3||K>24576)&&(X>423||!_)){c=Wr(e,E,0,j,M,x,R,K,Q,m-Q,c),K=g=R=0,Q=m;for(var k=0;k<286;++k)M[k]=0;for(var k=0;k<30;++k)x[k]=0}var ae=2,J=0,Ye=u,le=ne-se&32767;if(X>2&&fe==y(m-le))for(var Oe=Math.min(d,X)-1,oe=Math.min(32767,m),_e=Math.min(258,X);le<=oe&&--Ye&&ne!=se;){if(e[m+ae]==e[m+ae-le]){for(var w=0;w<_e&&e[m+w]==e[m+w-le];++w);if(w>ae){if(ae=w,J=le,w>Oe)break;for(var me=Math.min(le,w-2),Ce=0,k=0;k<me;++k){var Ue=m-le+k&32767,Nt=I[Ue],pt=Ue-Nt&32767;pt>Ce&&(Ce=pt,se=Ue)}}}ne=se,se=I[ne],le+=ne-se&32767}if(J){j[K++]=268435456|Ys[ae]<<18|kr[J];var Ke=Ys[ae]&31,Xe=kr[J]&31;R+=yt[Ke]+jt[Xe],++M[257+Ke],++x[Xe],q=m+ae,++g}else j[K++]=e[m],++M[e[m]]}}for(m=Math.max(m,q);m<n;++m)j[K++]=e[m],++M[e[m]];c=Wr(e,E,_,j,M,x,R,K,Q,m-Q,c),_||(r.r=c&7|E[c/8|0]<<3,c-=7,r.h=F,r.p=I,r.i=m,r.w=q)}else{for(var m=r.w||0;m<n+_;m+=65535){var He=m+65535;He>=n&&(E[c/8|0]=_,He=n),c=Yr(E,c+1,e.subarray(m,He))}r.i=n}return lt(o,0,a+Zs(c)+i)},Fc=function(){for(var e=new Int32Array(256),t=0;t<256;++t){for(var s=t,a=9;--a;)s=(s&1&&-306674912)^s>>>1;e[t]=s}return e}(),yc=function(){var e=-1;return{p:function(t){for(var s=e,a=0;a<t.length;++a)s=Fc[s&255^t[a]]^s>>>8;e=s},d:function(){return~e}}};var jc=function(e,t,s,a,i){if(!i&&(i={l:1},t.dictionary)){var r=t.dictionary.subarray(-32768),n=new H(r.length+e.length);n.set(r),n.set(e,r.length),e=n,i.w=r.length}return Dc(e,t.level==null?6:t.level,t.mem==null?i.l?Math.ceil(Math.max(8,Math.min(13,Math.log(e.length)))*1.5):20:12+t.mem,s,a,i)},Xr=function(e,t){var s={};for(var a in e)s[a]=e[a];for(var a in t)s[a]=t[a];return s};var Re=function(e,t){return e[t]|e[t+1]<<8},Te=function(e,t){return(e[t]|e[t+1]<<8|e[t+2]<<16|e[t+3]<<24)>>>0},$s=function(e,t){return Te(e,t)+Te(e,t+4)*4294967296},z=function(e,t,s){for(;s;++t)e[t]=s,s>>>=8};function Cc(e,t){return jc(e,t||{},0,0)}function Uc(e,t){return fc(e,{i:2},t&&t.out,t&&t.dictionary)}var Jr=function(e,t,s,a){for(var i in e){var r=e[i],n=t+i,o=a;Array.isArray(r)&&(o=Xr(a,r[1]),r=r[0]),r instanceof H?s[n]=[r,o]:(s[n+="/"]=[new H(0),o],Jr(r,n,s,a))}},xr=typeof TextEncoder<"u"&&new TextEncoder,Js=typeof TextDecoder<"u"&&new TextDecoder,Hc=0;try{Js.decode(Kr,{stream:!0}),Hc=1}catch{}var Pc=function(e){for(var t="",s=0;;){var a=e[s++],i=(a>127)+(a>223)+(a>239);if(s+i>e.length)return{s:t,r:lt(e,s-1)};i?i==3?(a=((a&15)<<18|(e[s++]&63)<<12|(e[s++]&63)<<6|e[s++]&63)-65536,t+=String.fromCharCode(55296|a>>10,56320|a&1023)):i&1?t+=String.fromCharCode((a&31)<<6|e[s++]&63):t+=String.fromCharCode((a&15)<<12|(e[s++]&63)<<6|e[s++]&63):t+=String.fromCharCode(a)}};function be(e,t){if(t){for(var s=new H(e.length),a=0;a<e.length;++a)s[a]=e.charCodeAt(a);return s}if(xr)return xr.encode(e);for(var i=e.length,r=new H(e.length+(e.length>>1)),n=0,o=function(c){r[n++]=c},a=0;a<i;++a){if(n+5>r.length){var E=new H(n+8+(i-a<<1));E.set(r),r=E}var _=e.charCodeAt(a);_<128||t?o(_):_<2048?(o(192|_>>6),o(128|_&63)):_>55295&&_<57344?(_=65536+(_&1047552)|e.charCodeAt(++a)&1023,o(240|_>>18),o(128|_>>12&63),o(128|_>>6&63),o(128|_&63)):(o(224|_>>12),o(128|_>>6&63),o(128|_&63))}return lt(r,0,n)}function ea(e,t){if(t){for(var s="",a=0;a<e.length;a+=16384)s+=String.fromCharCode.apply(null,e.subarray(a,a+16384));return s}else{if(Js)return Js.decode(e);var i=Pc(e),r=i.s,s=i.r;return s.length&&te(8),r}}var Mc=function(e,t){return t+30+Re(e,t+26)+Re(e,t+28)},kc=function(e,t,s){var a=Re(e,t+28),i=ea(e.subarray(t+46,t+46+a),!(Re(e,t+8)&2048)),r=t+46+a,n=Te(e,t+20),o=s&&n==4294967295?wc(e,r):[n,Te(e,t+24),Te(e,t+42)],E=o[0],_=o[1],c=o[2];return[Re(e,t+10),E,_,i,r+Re(e,t+30)+Re(e,t+32),c]},wc=function(e,t){for(;Re(e,t)!=1;t+=4+Re(e,t+2));return[$s(e,t+12),$s(e,t+4),$s(e,t+20)]},zs=function(e){var t=0;if(e)for(var s in e){var a=e[s].length;a>65535&&te(9),t+=a+4}return t},Br=function(e,t,s,a,i,r,n,o){var E=a.length,_=s.extra,c=o&&o.length,l=zs(_);z(e,t,n!=null?33639248:67324752),t+=4,n!=null&&(e[t++]=20,e[t++]=s.os),e[t]=20,t+=2,e[t++]=s.flag<<1|(r<0&&8),e[t++]=i&&8,e[t++]=s.compression&255,e[t++]=s.compression>>8;var d=new Date(s.mtime==null?Date.now():s.mtime),u=d.getFullYear()-1980;if((u<0||u>119)&&te(10),z(e,t,u<<25|d.getMonth()+1<<21|d.getDate()<<16|d.getHours()<<11|d.getMinutes()<<5|d.getSeconds()>>1),t+=4,r!=-1&&(z(e,t,s.crc),z(e,t+4,r<0?-r-2:r),z(e,t+8,s.size)),z(e,t+12,E),z(e,t+14,l),t+=16,n!=null&&(z(e,t,c),z(e,t+6,s.attrs),z(e,t+10,n),t+=14),e.set(a,t),t+=E,l)for(var b in _){var I=_[b],F=I.length;z(e,t,+b),z(e,t+2,F),e.set(I,t+4),t+=4+F}return c&&(e.set(o,t),t+=c),t},Wc=function(e,t,s,a,i){z(e,t,101010256),z(e,t+8,s),z(e,t+10,s),z(e,t+12,a),z(e,t+16,i)};function zr(e,t){t||(t={});var s={},a=[];Jr(e,"",s,t);var i=0,r=0;for(var n in s){var o=s[n],E=o[0],_=o[1],c=_.level==0?0:8,l=be(n),d=l.length,u=_.comment,b=u&&be(u),I=b&&b.length,F=zs(_.extra);d>65535&&te(11);var P=c?Cc(E,_):E,G=P.length,y=yc();y.p(E),a.push(Xr(_,{size:E.length,crc:y.d(),c:P,f:l,m:b,u:d!=n.length||b&&u.length!=I,o:i,compression:c})),i+=30+d+F+G,r+=76+2*(d+F)+(I||0)+G}for(var j=new H(r+22),M=i,x=r-i,g=0;g<a.length;++g){var l=a[g];Br(j,l.o,l,l.f,l.u,l.c.length);var R=30+l.f.length+zs(l.extra);j.set(l.c,l.o+R),Br(j,i,l,l.f,l.u,l.c.length,l.o,l.m),i+=16+R+(l.m?l.m.length:0)}return Wc(j,i,a.length,x,M),j}function Qr(e,t){for(var s={},a=e.length-22;Te(e,a)!=101010256;--a)(!a||e.length-a>65558)&&te(13);var i=Re(e,a+8);if(!i)return{};var r=Te(e,a+16),n=r==4294967295||i==65535;if(n){var o=Te(e,a-12);n=Te(e,o)==101075792,n&&(i=Te(e,o+32),r=Te(e,o+48))}for(var E=t&&t.filter,_=0;_<i;++_){var c=kc(e,r,n),l=c[0],d=c[1],u=c[2],b=c[3],I=c[4],F=c[5],P=Mc(e,F);r=I,(!E||E({name:b,size:d,originalSize:u,compression:l}))&&(l?l==8?s[b]=Uc(e.subarray(P,P+d),{out:new H(u)}):te(14,"unknown compression type "+l):s[b]=lt(e,P,P+d))}return s}var sa=e=>e.replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,"");function ta(e){let t="";for(e++;e>0;e=Math.floor((e-1)/26))t=String.fromCharCode(65+(e-1)%26)+t;return t}var tn=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;function sn(e){let t=new Date(e);return isNaN(t.getTime())?e:new Date(t.getTime()+5.5*3600*1e3).toISOString().replace("T"," ").slice(0,19)}function Zr(e,t,s){if(t==null||t==="")return"";if(typeof t=="boolean")return`<c r="${e}" t="b"${s?' s="1"':""}><v>${t?1:0}</v></c>`;if(typeof t=="number"&&isFinite(t)){let i=s?1:Number.isInteger(t)?3:2;return`<c r="${e}" s="${i}"><v>${t}</v></c>`}let a=typeof t=="string"?t:JSON.stringify(t);return!s&&tn.test(a)&&(a=sn(a)),a.length>32e3&&(a=a.slice(0,32e3)+"\u2026"),`<c r="${e}" t="inlineStr"${s?' s="1"':""}><is><t xml:space="preserve">${sa(a)}</t></is></c>`}function xc(e){let t=e.columns.map(n=>Math.min(60,Math.max(10,n.length+2)));for(let n of e.rows.slice(0,200))n.forEach((o,E)=>{let _=o==null?0:String(o).length;E<t.length&&(t[E]=Math.min(60,Math.max(t[E],_+2)))});let s=t.map((n,o)=>`<col min="${o+1}" max="${o+1}" width="${n}" customWidth="1"/>`).join(""),a=[];a.push(`<row r="1">${e.columns.map((n,o)=>Zr(ta(o)+"1",n,!0)).join("")}</row>`),e.rows.forEach((n,o)=>{let E=o+2;a.push(`<row r="${E}">${n.map((_,c)=>Zr(ta(c)+E,_,!1)).join("")}</row>`)});let i=ta(Math.max(0,e.columns.length-1)),r=Math.max(1,e.rows.length+1);return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/><cols>${s}</cols><sheetData>${a.join("")}</sheetData>
${e.rows.length?`<autoFilter ref="A1:${i}${r}"/>`:""}
</worksheet>`}function Bc(e,t){let s=e.replace(/[\[\]:*?\/\\]/g," ").slice(0,31).trim()||"Sheet",a=2;for(;t.has(s.toLowerCase());)s=s.slice(0,28)+" "+a++;return t.add(s.toLowerCase()),s}function an(e,t="JSE Report"){let s=new Set,a=e.map(r=>Bc(r.name,s)),i={};return i["[Content_Types].xml"]=be(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
${e.map((r,n)=>`<Override PartName="/xl/worksheets/sheet${n+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join(`
`)}
</Types>`),i["_rels/.rels"]=be(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`),i["docProps/core.xml"]=be(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${sa(t)}</dc:title><dc:creator>JAIN STOCK EXCHANGE</dc:creator>
<dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0,19)}Z</dcterms:created>
</cp:coreProperties>`),i["xl/workbook.xml"]=be(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${a.map((r,n)=>`<sheet name="${sa(r)}" sheetId="${n+1}" r:id="rId${n+1}"/>`).join("")}</sheets>
</workbook>`),i["xl/_rels/workbook.xml.rels"]=be(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${e.map((r,n)=>`<Relationship Id="rId${n+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${n+1}.xml"/>`).join(`
`)}
<Relationship Id="rId${e.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`),i["xl/styles.xml"]=be(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
</styleSheet>`),e.forEach((r,n)=>{i[`xl/worksheets/sheet${n+1}.xml`]=be(xc(r))}),zr(i,{level:6})}function dt(e,t){let s=a=>{if(a==null)return"";let i=typeof a=="string"?a:typeof a=="object"?JSON.stringify(a):String(a);return typeof a=="string"&&tn.test(i)&&(i=sn(i)),/^[=+\-@]/.test(i)&&typeof a=="string"&&(i="'"+i),/[",\n\r]/.test(i)?'"'+i.replace(/"/g,'""')+'"':i};return"\uFEFF"+[e.map(s).join(","),...t.map(a=>a.map(s).join(","))].join(`\r
`)+`\r
`}var rn=e=>e.replace(/&(lt|gt|amp|quot|apos|#\d+|#x[0-9a-fA-F]+);/g,(t,s)=>s==="lt"?"<":s==="gt"?">":s==="amp"?"&":s==="quot"?'"':s==="apos"?"'":s[1]==="x"?String.fromCodePoint(parseInt(s.slice(2),16)):String.fromCodePoint(parseInt(s.slice(1),10)));function en(e){let t="",s=/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t(?:\s[^>]*)?\/>/g,a;for(;a=s.exec(e);)t+=a[1]?rn(a[1]):"";return t}function Gc(e){let t=(/^[A-Z]+/.exec(e)||["A"])[0],s=0;for(let a of t)s=s*26+(a.charCodeAt(0)-64);return s-1}function nn(e){let t;try{t=Qr(e)}catch{throw new Error("The file is not a valid .xlsx workbook.")}let s=u=>t[u]?ea(t[u]):"",a="xl/worksheets/sheet1.xml",i=s("xl/workbook.xml"),r=s("xl/_rels/workbook.xml.rels"),n=/<sheet\b[^>]*\br:id="([^"]+)"/.exec(i);if(n&&r){let u=new RegExp('<Relationship\\b[^>]*Id="'+n[1]+'"[^>]*Target="([^"]+)"').exec(r)||new RegExp('<Relationship\\b[^>]*Target="([^"]+)"[^>]*Id="'+n[1]+'"').exec(r);u&&(a=u[1].startsWith("/")?u[1].slice(1):"xl/"+u[1].replace(/^\.\//,""))}let o=s(a);if(!o)throw new Error("The workbook has no readable worksheet.");let E=[],_=s("xl/sharedStrings.xml");if(_){let u=/<si>([\s\S]*?)<\/si>/g,b;for(;b=u.exec(_);)E.push(en(b[1]))}let c=[],l=/<row\b[^>]*\/>|<row\b[^>]*>([\s\S]*?)<\/row>/g,d;for(;d=l.exec(o);){let u=[],b=d[1]||"",I=/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g,F,P=0;for(;F=I.exec(b);){let G=F[1]||"",y=F[2]||"",j=/\br="([A-Z]+)\d+"/.exec(G),M=j?Gc(j[1]):P;P=M+1;let x=(/\bt="([^"]+)"/.exec(G)||[])[1]||"n",g=/<v>([\s\S]*?)<\/v>/.exec(y),R="";for(x==="s"?R=g?E[Number(g[1])]??"":"":x==="inlineStr"?R=en(y):x==="b"?R=g&&g[1]==="1"?"TRUE":"FALSE":R=g?rn(g[1]):"";u.length<M;)u.push("");u[M]=R.trim()}c.push(u)}return c}function aa(e){let t=[],s=[],a="",i=!1,r=e.replace(/^\uFEFF/,"");for(let n=0;n<r.length;n++){let o=r[n];i?o==='"'&&r[n+1]==='"'?(a+='"',n++):o==='"'?i=!1:a+=o:o==='"'?i=!0:o===","?(s.push(a.trim()),a=""):o===`
`||o==="\r"?(o==="\r"&&r[n+1]===`
`&&n++,s.push(a.trim()),t.push(s),s=[],a=""):a+=o}return(a.length||s.length)&&(s.push(a.trim()),t.push(s)),t.filter(n=>n.some(o=>o!==""))}var na="3.14.0",Yc=Date.now(),oa=["ADMIN","EXCHANGE","BANK","BROKER","PIT_MANAGER","INSTITUTIONAL","PARTICIPANT","VIEWER"];function _a(e){return qc("sha256").update(e).digest("hex")}function Kc(e){if(!e)return null;if((process.env.CORS_ORIGINS||"").split(",").map(s=>s.trim()).filter(Boolean).includes(e))return e;try{let s=new URL(e),a=s.hostname;if(a==="localhost"||a==="127.0.0.1"||s.protocol==="https:"&&(a==="jain-stock-exchange.pages.dev"||a.endsWith(".jain-stock-exchange.pages.dev")||a==="jse-live.pages.dev"||a.endsWith(".jse-live.pages.dev")))return e}catch{}return null}function Ve(e){let t=Kc(e.origin),s={vary:"Origin, Accept-Encoding"};return t&&(s["access-control-allow-origin"]=t,s["access-control-allow-methods"]="GET, POST, OPTIONS",s["access-control-allow-headers"]="Authorization, Content-Type, X-Request-Id",s["access-control-expose-headers"]="ETag, X-JSE-Version, X-Request-Id, Content-Disposition, Date",s["access-control-max-age"]="7200"),s}function Xc(e){return/\bgzip\b/.test(e.headers.get("accept-encoding")||"")}function _n(e){let t=JSON.stringify(e);return{body:t,etag:'W/"'+_a(t).slice(0,24)+'"'}}function $(e,t,s,a={},i=0){let r={"content-type":"application/json; charset=utf-8","x-jse-version":na,"x-request-id":e.reqId,"cache-control":i>0?`public, max-age=${i}, must-revalidate`:t===200&&e.method==="GET"?"private, no-cache":"no-store",etag:s.etag,...Ve(e),...a};return i===0&&(r.vary=(r.vary?r.vary+", ":"")+"Authorization"),t===200&&e.method==="GET"&&e.req.headers.get("if-none-match")===s.etag?(delete r["content-type"],new Response(null,{status:304,headers:r})):s.body.length>1024&&Xc(e.req)?(s.gz||(s.gz=Vc(s.body,{level:5})),r["content-encoding"]="gzip",new Response(s.gz,{status:t,headers:r})):new Response(s.body,{status:t,headers:r})}var B=(e,t,s=200,a=0)=>$(e,s,_n(t),{},a);function Jc(e,t){if(t instanceof O)return B(e,{success:!1,error:t.message,code:t.code,...t.extra||{}},t.status);let s=t;console.error(`[api] ${e.reqId} ${e.method} ${e.url.pathname} failed:`,s?.code||"",s?.message||s);let a=/ECONNREFUSED|ENOTFOUND|Connection terminated|timeout|too many|remaining connection/i.test(String(s?.message));return B(e,{success:!1,code:a?"SERVICE_UNAVAILABLE":"SERVER_ERROR",ref:e.reqId,error:a?"The trading service is busy or reconnecting. Please retry in a moment.":"Something went wrong while processing this request. Please retry; if it keeps failing, tell the event desk (ref "+e.reqId+")."},a?503:500)}var De=new Map;async function V(e,t,s){let a=Date.now(),i=De.get(e);if(i?.value&&a-i.at<i.ttl)return i.value;if(i?.pending)return i.pending;let r=i||{at:0,ttl:t};if(r.ttl=t,r.pending=s().then(n=>(r.value=_n(n),r.at=Date.now(),r.pending=void 0,r.value)).catch(n=>{if(r.pending=void 0,!(n instanceof O)&&r.value&&Date.now()-r.at<3e4)return r.value;throw n}),De.set(e,r),De.size>2e3)for(let[n,o]of De)!o.pending&&a-o.at>6e4&&De.delete(n);return r.pending}function on(e){if(!e){De.clear();return}for(let t of[...De.keys()])e.some(s=>t.startsWith(s))&&De.delete(t)}var Ie=new Map;async function zc(e){if(!e||e.length<32||e.length>128)return null;let t=_a(e),s=Ie.get(t);if(s&&Date.now()-s.at<3e4)return s.user;let i=(await he("SELECT jse_session($1) AS u",[t])).rows[0]?.u||null;if(Ie.set(t,{user:i,at:Date.now()}),Ie.size>5e3)for(let[r,n]of Ie)Date.now()-n.at>12e4&&Ie.delete(r);return i}function S(e){let t=e.user;return{id:t?.id??null,username:t?.username??"anonymous",name:t?.name??null,email:t?.email??null,role:t?.role??null,team_id:t?.team_id??null,broker_id:t?.broker_id??null,institution_id:t?.institution_id??null,session:t?.session??null,session_kind:t?.session_kind??null,ip:e.ip,ua:e.ua}}function N(e,...t){if(!e.user)throw new O(401,"UNAUTHENTICATED","Please sign in to continue.");if(t.length&&!t.includes(e.user.role))throw new O(403,"FORBIDDEN",`Your role (${e.user.role.replace(/_/g," ")}) cannot do this.`);return e.user}var qe=new Map;function $e(e,t,s){let a=Date.now(),i=qe.get(e)||{tokens:s,at:a};return i.tokens=Math.min(s,i.tokens+(a-i.at)/1e3*t),i.at=a,i.tokens<1?(qe.set(e,i),!1):(i.tokens-=1,qe.set(e,i),qe.size>2e4&&qe.clear(),!0)}var Ut=new Map,L=(e,t)=>Ut.set("GET "+e,{h:t}),h=(e,t,s)=>Ut.set("POST "+e,{h:t,maxBody:s}),Ne=(e,t)=>(e.url.searchParams.get(t)||"").trim();function Ht(e,t){let s={};for(let a of t){let i=Ne(e,a);i&&(s[a]=i)}return s}function Qc(e,t,s){let a=qe.get(e);return a?Math.min(s,a.tokens+(Date.now()-a.at)/1e3*t)>=1:!0}var Ct={perSecond:.05,burst:8};async function f(e,t,s,a){if(!$e("w:"+(e.user?.id??e.ip),15,40))throw new O(429,"TOO_MANY_REQUESTS","Too many actions in a short time. Please wait a moment.");let i=e.user?"adminpw-fail:"+e.user.id:"";if(i&&s&&typeof s=="object"&&"admin_password"in s&&!Qc(i,Ct.perSecond,Ct.burst))throw new O(429,"TOO_MANY_ATTEMPTS","Too many incorrect administrator passwords. Wait a minute and try again.");try{let r=await T(t,S(e),s);return on(a),B(e,r)}catch(r){throw r instanceof O&&r.code==="PRICE_STALE"&&on(a),i&&r instanceof O&&r.code==="ADMIN_PASSWORD_INVALID"&&$e(i,Ct.perSecond,Ct.burst),r}}var je=["trk:","staff:","pd:","q:","bd:","ins:","slips:","pub:status","admin:","audit:","inst:"];L("/api/health",async e=>{let t=Date.now(),s="ok";try{await he("SELECT 1")}catch(a){s="error: "+String(a?.message).slice(0,120)}return B(e,{success:s==="ok",service:"JAIN STOCK EXCHANGE API",version:na,db:s,db_ms:Date.now()-t,uptime_s:Math.round((Date.now()-Yc)/1e3),node:process.version,time:new Date().toISOString()},s==="ok"?200:503)});L("/api/market",async e=>$(e,200,await V("pub:market",900,()=>T("jse_market",null)),{},1));L("/api/event-status",async e=>$(e,200,await V("pub:status",900,()=>T("jse_event_status",null)),{},1));L("/api/market-news",async e=>{let t=Math.min(200,Math.max(1,Number(Ne(e,"limit"))||30));return $(e,200,await V("pub:news:"+t,1500,()=>T("jse_news_list",null,{limit:t},{noActor:!0})),{},1)});L("/api/cms50",async e=>{let t=JSON.parse((await V("pub:market",900,()=>T("jse_market",null))).body);return B(e,{success:!0,status:t.status,...t.index,market_stock_count:t.stocks.length,ipo_count:t.ipos.length})});h("/api/login",async e=>{let t=String(e.body?.username||"").trim(),s=String(e.body?.password||"");if(!$e("login-ip:"+e.ip,5,150)||!$e("login-user:"+t.toLowerCase(),.2,12))throw new O(429,"TOO_MANY_ATTEMPTS","Too many sign-in attempts. Wait a minute and try again.");if(!t||!s)throw new O(400,"MISSING_CREDENTIALS","Enter your username and password.");let a=await T("jse_login",null,{username:t,password:s,ip:e.ip,ua:e.ua},{noActor:!0});return B(e,a)});h("/api/logout",async e=>{if(e.token){let t=_a(e.token);await he("SELECT jse_logout($1)",[t]),Ie.delete(t)}return B(e,{success:!0})});L("/api/me",async e=>e.user?B(e,{success:!0,authenticated:!0,user:e.user}):B(e,{success:!0,authenticated:!1,user:null}));h("/api/change-password",async e=>{if(N(e),!$e("pw:"+e.user.id,.2,6))throw new O(429,"TOO_MANY_ATTEMPTS","Too many attempts. Wait a minute and try again.");let t=await T("jse_change_password",S(e),e.body||{});return Ie.clear(),B(e,t)});h("/api/ci-login",async e=>{let t=process.env.CI_OIDC_REPOSITORY;if(!t)throw new O(404,"NOT_FOUND","Unknown API endpoint: /api/ci-login");if(!$e("ci-login:"+e.ip,10,300))throw new O(429,"TOO_MANY_ATTEMPTS","Too many sign-in attempts.");let s;try{s=await Mr(String(e.body?.token||""),{repository:t,audience:process.env.CI_OIDC_AUDIENCE||"jse-staging",refs:(process.env.CI_OIDC_REFS||"").split(",").map(i=>i.trim()).filter(Boolean)})}catch(i){throw new O(401,"INVALID_CI_TOKEN","CI token rejected: "+i.message)}let a=await T("jse_ci_session",null,{username:String(e.body?.username||""),ip:e.ip,ua:e.ua,subject:s.sub,run_id:s.run_id,workflow:s.workflow},{noActor:!0});return B(e,a)});L("/api/portfolios",async e=>(N(e,"ADMIN","VIEWER"),$(e,200,await V("staff:portfolios",1800,()=>T("jse_portfolios",S(e),{})))));L("/api/portfolio-details",async e=>{let t=N(e,"ADMIN","VIEWER","BROKER","PARTICIPANT"),s=(t.role==="PARTICIPANT"?t.team:Ne(e,"team"))||"";if(!s)throw new O(400,"TEAM_REQUIRED","Choose a team.");let a=t.role==="PARTICIPANT"?"p"+t.id:t.role==="BROKER"?"b"+t.broker_id:"staff";return $(e,200,await V("pd:"+s.toUpperCase()+":"+a,1500,()=>T("jse_portfolio_detail",S(e),{team:s})))});function Zc(e){return e.role==="PARTICIPANT"?"p"+e.team_id:e.role==="BROKER"?"b"+e.broker_id:e.role==="INSTITUTIONAL"?"i"+e.institution_id:"s"}var En=async e=>{let t=N(e,...oa),s=Ht(e,["team","status","side","kind","account","q","page","page_size"]);return $(e,200,await V("trk:"+Zc(t)+":"+JSON.stringify(s),1200,()=>T("jse_tracking",S(e),s)))};L("/api/tracking",En);L("/api/orders",En);L("/api/order",async e=>(N(e,...oa),B(e,await T("jse_order_detail",S(e),{order_id:Ne(e,"id")||void 0,order_no:Ne(e,"order_no")||void 0,slip_no:Ne(e,"slip_no")||void 0}))));h("/api/orders",async e=>{N(e,...oa);let t=e.body||{};return Array.isArray(t.legs)?f(e,"jse_place_pair",t,je):f(e,"jse_place_order",t,je)});L("/api/broker-desk",async e=>{let t=N(e,"BROKER","PIT_MANAGER","ADMIN","VIEWER"),s=t.role==="BROKER"?String(t.broker||""):t.role==="PIT_MANAGER"?"ALL":Ne(e,"broker");return $(e,200,await V("bd:"+(t.role==="BROKER"?"own"+t.broker_id:s||"first"),1200,()=>T("jse_broker_desk",S(e),s?{broker:s}:{})))});L("/api/exchange",async e=>(N(e,"ADMIN","EXCHANGE","VIEWER"),$(e,200,await V("q:exchange",900,()=>T("jse_exchange_queue",S(e),{})))));h("/api/exchange",async e=>(N(e,"ADMIN","EXCHANGE"),f(e,"jse_exchange_decide",e.body||{},je)));L("/api/bank",async e=>(N(e,"ADMIN","BANK","VIEWER"),$(e,200,await V("q:bank",900,()=>T("jse_bank_queue",S(e),{})))));h("/api/bank",async e=>{N(e,"ADMIN","BANK");let t=e.body||{},s=String(t.action||"SETTLE").toUpperCase(),a=s==="SETTLE"||s==="APPROVE"?"jse_bank_settle":s==="REJECT"?"jse_bank_reject":s==="CLAIM"||s==="RELEASE"?"jse_bank_claim":"";if(!a)throw new O(400,"INVALID_ACTION","Use SETTLE, REJECT, CLAIM or RELEASE.");return f(e,a,{...t,release:s==="RELEASE"},s==="CLAIM"||s==="RELEASE"?["q:bank"]:je.concat(["cash:","q:loans"]))});L("/api/loan",async e=>(N(e,"ADMIN","BANK","VIEWER"),$(e,200,await V("q:loans",1500,()=>T("jse_loans",S(e),{})))));h("/api/loan",async e=>(N(e,"ADMIN","BANK"),f(e,"jse_loan_action",e.body||{},["q:","staff:","pd:","cash:","bd:"])));L("/api/loan-requests",async e=>(N(e,"ADMIN","BANK","VIEWER","BROKER","PIT_MANAGER","PARTICIPANT"),B(e,await T("jse_loan_requests",S(e),{}))));h("/api/loan-requests",async e=>{let t=e.body||{};return String(t.action||"").toUpperCase()==="REQUEST"?(N(e,"ADMIN","BANK","BROKER","PIT_MANAGER","PARTICIPANT"),f(e,"jse_loan_request",t,["q:","bd:"])):(N(e,"ADMIN","BANK"),f(e,"jse_loan_decide",t,["q:","staff:","pd:","cash:","bd:"]))});h("/api/rename",async e=>(N(e,"ADMIN"),f(e,"jse_rename_entity",e.body||{},["q:","staff:","inst:","admin:","pub:"])));L("/api/reconcile",async e=>(N(e,"ADMIN","VIEWER"),B(e,await T("jse_reconcile",S(e),{}))));h("/api/reconcile",async e=>(N(e,"ADMIN"),f(e,"jse_reconcile_correct",e.body||{},["cash:","pd:","staff:","admin:"])));L("/api/institution-inventory",async e=>(N(e,"ADMIN","VIEWER","INSTITUTIONAL"),B(e,await T("jse_institution_inventory",S(e),{action:"LIST"}))));h("/api/institution-inventory",async e=>(N(e,"ADMIN"),f(e,"jse_institution_inventory",e.body||{},["inst:","admin:"])));L("/api/cash",async e=>{let t=N(e,"ADMIN","BANK","VIEWER","PARTICIPANT"),s=Ht(e,["team","type","q","page","page_size"]);return $(e,200,await V("cash:"+(t.role==="PARTICIPANT"?t.team_id:"s")+":"+JSON.stringify(s),1500,()=>T("jse_cash",S(e),s)))});L("/api/audit",async e=>{N(e,"ADMIN","VIEWER");let t=Ht(e,["action","team","role","risk","group","q","page","page_size"]);return $(e,200,await V("audit:"+JSON.stringify(t),1500,()=>T("jse_audit_log",S(e),t)))});L("/api/commissions",async e=>{let t=N(e,"ADMIN","BROKER","VIEWER"),s=Ht(e,["broker","page","page_size"]);return $(e,200,await V("staff:commissions:"+(t.role==="BROKER"?"b"+t.broker_id:"s")+":"+JSON.stringify(s),2e3,()=>T("jse_commissions",S(e),s)))});L("/api/institutional-portfolio",async e=>{let t=N(e,"ADMIN","INSTITUTIONAL","VIEWER"),s=t.role==="INSTITUTIONAL"?"":Ne(e,"institution_id");return $(e,200,await V("inst:"+(s||t.institution_id||"default"),1500,()=>T("jse_institutional",S(e),s?{institution_id:s}:{})))});h("/api/institutional-order",async e=>(N(e,"ADMIN","INSTITUTIONAL"),f(e,"jse_place_institutional_order",e.body||{},je.concat(["inst:"]))));h("/api/market-news",async e=>(N(e,"ADMIN","INSTITUTIONAL"),f(e,"jse_market_news",e.body||{},je.concat(["pub:market","pub:news:"]))));L("/api/events",async e=>(N(e,"ADMIN","VIEWER"),B(e,await T("jse_event_registry_action",S(e),{action:"STATE"}))));h("/api/events",async e=>{N(e,"ADMIN");let t=await f(e,"jse_event_registry_action",e.body||{});return["ACTIVATE","CREATE"].includes(String(e.body?.action||"").toUpperCase())&&Ie.clear(),t});L("/api/event-controls",async e=>(N(e,"ADMIN","VIEWER"),B(e,await T("jse_event_controls",S(e),{action:"STATE"}))));h("/api/event-controls",async e=>(N(e,"ADMIN"),f(e,"jse_event_controls",e.body||{})));L("/api/pricing-method",async e=>(N(e,"ADMIN","VIEWER"),B(e,await T("jse_pricing_method",S(e),{action:"STATE"}))));h("/api/pricing-method",async e=>(N(e,"ADMIN"),f(e,"jse_pricing_method",e.body||{})));h("/api/manual-price",async e=>(N(e,"ADMIN"),f(e,"jse_manual_set_market_price",e.body||{},je.concat(["pub:market","pub:news:"]))));L("/api/admin-state",async e=>{let t=N(e,"ADMIN","VIEWER");return $(e,200,await V("admin:state:"+t.role,1500,()=>T("jse_admin_state",S(e),{})))});L("/api/admin-analytics",async e=>{N(e,"ADMIN","VIEWER");let t=(Ne(e,"symbol")||"").trim().toUpperCase().slice(0,24),s=Number(Ne(e,"range_hours")||720),a=[1,6,24,72,168,720].includes(s)?s:24,i=["WITH args AS (SELECT $1::text AS symbol,$2::integer AS hours,now()-($2::text||' hours')::interval AS since_at),","stock_list AS (SELECT s.id,s.symbol,s.name,s.price,coalesce(s.index_base_price,s.base_price) AS base_price,coalesce(s.sector,'Other') AS sector,s.kind,s.listed_at,s.display_order,s.traded_value FROM securities s WHERE s.active AND (s.kind='EQUITY' OR s.listed_at IS NOT NULL)),","picked AS (SELECT sl.id,sl.symbol,sl.name,sl.price FROM stock_list sl CROSS JOIN args a WHERE (a.symbol<>'' AND sl.symbol=a.symbol) OR (a.symbol='' AND sl.symbol=(SELECT symbol FROM stock_list ORDER BY traded_value DESC NULLS LAST,display_order,symbol LIMIT 1)) ORDER BY CASE WHEN sl.symbol=a.symbol THEN 0 ELSE 1 END LIMIT 1),","price_data AS (SELECT coalesce(jsonb_agg(x ORDER BY x.at),'[]'::jsonb) AS data,count(*)::bigint AS n FROM (SELECT ph.created_at AS at,ph.created_at,ph.previous_price,ph.new_price,ph.change_pct,ph.source FROM price_history ph JOIN picked p ON p.id=ph.security_id CROSS JOIN args a WHERE ph.created_at>=a.since_at ORDER BY ph.created_at DESC,ph.id DESC LIMIT 300) x),","index_events AS (SELECT DISTINCT date_trunc('minute',ph.created_at) AS at FROM price_history ph CROSS JOIN args a WHERE ph.created_at>=a.since_at ORDER BY date_trunc('minute',ph.created_at) DESC LIMIT 120),","index_points AS (SELECT e.at,(SELECT coalesce(sum(coalesce((SELECT ph2.new_price FROM price_history ph2 WHERE ph2.security_id=ss.id AND ph2.created_at<=e.at ORDER BY ph2.created_at DESC,ph2.id DESC LIMIT 1),coalesce(ss.index_base_price,ss.base_price))),0) FROM securities ss WHERE ss.active AND (ss.kind='EQUITY' OR ss.listed_at<=e.at))::numeric(18,2) AS index_value FROM index_events e),","portfolio_raw AS (SELECT ss.symbol AS label,sum(h.quantity*ss.price)::numeric(18,2) AS value FROM holdings h JOIN securities ss ON ss.id=h.security_id JOIN teams t ON t.id=h.team_id WHERE t.active AND h.quantity>0 AND (ss.kind='EQUITY' OR ss.listed_at IS NOT NULL) GROUP BY ss.symbol UNION ALL SELECT 'Participant cash',coalesce(sum(t.cash),0)::numeric(18,2) FROM teams t WHERE t.active),","portfolio_ranked AS (SELECT label,value,row_number() OVER(ORDER BY value DESC) AS rn FROM portfolio_raw WHERE value>0),","risk_rows AS (SELECT CASE kind WHEN 'SHORT_SELL_ATTEMPT' THEN 'Short-selling attempts' WHEN 'CASH_SHORTFALL_ATTEMPT' THEN 'Cash shortfalls' WHEN 'INSUFFICIENT_BALANCE_REJECTION' THEN 'Insufficient balance' ELSE kind END AS label,count(*)::bigint AS value FROM risk_events GROUP BY 1 UNION ALL SELECT 'Stale-price rejections',count(*)::bigint FROM orders WHERE reject_code='PRICE_STALE' OR reject_reason ILIKE '%PRICE STALE%' UNION ALL SELECT 'Company exposure rejections',count(*)::bigint FROM orders WHERE reject_code='COMPANY_LIMIT' OR reject_reason ILIKE '%company limit%'),","cashflow_rows AS (SELECT date_trunc('hour',cl.created_at) AS at,sum(cl.credit-cl.debit)::numeric(18,2) AS net_flow FROM cash_ledger cl CROSS JOIN args a WHERE cl.created_at>=a.since_at GROUP BY 1),","settlement_rows AS (SELECT date_trunc('hour',coalesce(o.bank_at,o.updated_at,o.created_at)) AS at,count(*) FILTER(WHERE o.status='BANK_SETTLED')::bigint AS settled,count(*) FILTER(WHERE o.status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED'))::bigint AS rejected FROM orders o CROSS JOIN args a WHERE coalesce(o.bank_at,o.updated_at,o.created_at)>=a.since_at GROUP BY 1),","broker_rows AS (SELECT b.code AS broker,b.name,coalesce(c.total,0)::numeric(18,2) AS commissions,coalesce(c.n,0)::bigint AS settled_orders FROM brokers b LEFT JOIN (SELECT broker_id,sum(amount) AS total,count(*) AS n FROM broker_commissions WHERE reversed_at IS NULL GROUP BY broker_id) c ON c.broker_id=b.id WHERE b.active),","sector_rows AS (SELECT coalesce(sector,'Other') AS sector,round(avg((price-coalesce(index_base_price,base_price))*100/nullif(coalesce(index_base_price,base_price),0)),2) AS avg_change_pct,sum(traded_value)::numeric(18,2) AS traded_value,count(*)::bigint AS securities FROM securities WHERE active AND (kind='EQUITY' OR listed_at IS NOT NULL) GROUP BY coalesce(sector,'Other')),","news_rows AS (SELECT s.symbol,s.name,replace(n.mood,'_',' ') AS mood,n.headline,n.requested_pct,round((n.new_price-n.previous_price)*100/nullif(n.previous_price,0),2) AS actual_pct,n.previous_price,n.new_price,n.reversed_at IS NOT NULL AS reversed,n.created_at FROM (SELECT * FROM market_news ORDER BY created_at DESC,id DESC LIMIT 15) n JOIN securities s ON s.id=n.security_id)","SELECT jsonb_build_object('success',true,'generated_at',now(),'selected_symbol',(SELECT symbol FROM picked),'stocks',(SELECT coalesce(jsonb_agg(jsonb_build_object('symbol',symbol,'name',name) ORDER BY display_order,symbol),'[]'::jsonb) FROM stock_list),'price_history',(SELECT data FROM price_data),'index_history',(SELECT coalesce(jsonb_agg(jsonb_build_object('at',at,'index_value',index_value) ORDER BY at),'[]'::jsonb) FROM index_points),'order_status',(SELECT coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value) ORDER BY value DESC),'[]'::jsonb) FROM (SELECT CASE WHEN status='PIT_PENDING' THEN 'Pit pending' WHEN status='EXCHANGE_PENDING' THEN 'Exchange pending' WHEN status IN ('EXCHANGE_APPROVED','BANK_PENDING') THEN 'Bank pending' WHEN status='BANK_SETTLED' THEN 'Settled' WHEN status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED') THEN 'Rejected' ELSE 'Other / closed' END AS label,count(*)::bigint AS value FROM orders GROUP BY 1) q),'breadth',(SELECT jsonb_build_object('advances',count(*) FILTER(WHERE price>base_price),'declines',count(*) FILTER(WHERE price<base_price),'unchanged',count(*) FILTER(WHERE price=base_price)) FROM stock_list),'portfolio',(SELECT coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value) ORDER BY value DESC),'[]'::jsonb) FROM (SELECT label,value FROM portfolio_ranked WHERE rn<=8 UNION ALL SELECT 'Other securities',sum(value) FROM portfolio_ranked WHERE rn>8 HAVING sum(value)>0) q),'risk',(SELECT coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value) ORDER BY value DESC),'[]'::jsonb) FROM risk_rows WHERE value>0),'cashflow',(SELECT coalesce(jsonb_agg(jsonb_build_object('at',at,'net_flow',net_flow) ORDER BY at),'[]'::jsonb) FROM cashflow_rows),'settlement_trend',(SELECT coalesce(jsonb_agg(jsonb_build_object('at',at,'settled',settled,'rejected',rejected) ORDER BY at),'[]'::jsonb) FROM settlement_rows),'brokers',(SELECT coalesce(jsonb_agg(to_jsonb(b) ORDER BY commissions DESC),'[]'::jsonb) FROM broker_rows b),'sectors',(SELECT coalesce(jsonb_agg(to_jsonb(z) ORDER BY avg_change_pct DESC),'[]'::jsonb) FROM sector_rows z),'participant_performance',(SELECT coalesce(jsonb_agg(jsonb_build_object('team',code,'name',name,'broker',broker,'cash',cash,'holdings_value',holdings_value,'net_worth',net_worth,'pnl',pnl,'realized_pnl',realized_pnl,'unrealized_pnl',unrealized_pnl,'buys',settled_buys,'sells',settled_sells,'loan_liability',loan_liability) ORDER BY net_worth DESC),'[]'::jsonb) FROM (SELECT * FROM jse_team_metrics WHERE active ORDER BY net_worth DESC LIMIT 12) t),'news',(SELECT coalesce(jsonb_agg(to_jsonb(n) ORDER BY created_at DESC),'[]'::jsonb) FROM news_rows n),'summary',jsonb_build_object('active_teams',(SELECT count(*) FROM teams WHERE active),'price_history_points',(SELECT n FROM price_data))) AS data"].join(" "),r=await he(i,[t,a]);return B(e,r.rows[0]?.data||{success:!1,error:"Analytics snapshot unavailable."})});L("/api/insights",async e=>(N(e,"ADMIN","VIEWER"),$(e,200,await V("staff:insights",2500,()=>T("jse_insights",null)))));h("/api/ipo-listing",async e=>(N(e,"ADMIN"),f(e,"jse_ipo_listing",e.body||{})));h("/api/event",async e=>(N(e,"ADMIN"),f(e,"jse_event_action",e.body||{})));h("/api/reset-event",async e=>(N(e,"ADMIN"),f(e,"jse_reset_event",e.body||{})));h("/api/undo-redo",async e=>(N(e,"ADMIN"),f(e,"jse_undo_redo",e.body||{})));h("/api/reject-open-orders",async e=>(N(e,"ADMIN"),f(e,"jse_reject_open_orders",e.body||{})));h("/api/ipo-allotments",async e=>{N(e,"ADMIN");let t=e.body||{};return f(e,t.clear?"jse_ipo_allot_clear":"jse_ipo_allot",t)});h("/api/ipo-admin",async e=>(N(e,"ADMIN"),f(e,"jse_ipo_admin_tool",e.body||{},["admin:","staff:","pub:"])));h("/api/big-bull",async e=>(N(e,"ADMIN"),f(e,"jse_big_bull_admin",e.body||{},["admin:","staff:","pub:"])));h("/api/teams",async e=>(N(e,"ADMIN"),f(e,"jse_update_teams",e.body||{})));h("/api/brokers",async e=>(N(e,"ADMIN"),f(e,"jse_update_brokers",e.body||{})));h("/api/config",async e=>(N(e,"ADMIN"),f(e,"jse_update_config",e.body||{})));L("/api/team-names",async e=>(N(e,"ADMIN","VIEWER"),$(e,200,await V("admin:team-names",2e3,()=>T("jse_team_names",S(e),{action:"STATE"})))));h("/api/team-names",async e=>{N(e,"ADMIN");let t=await f(e,"jse_team_names",e.body||{});return Ie.clear(),t});L("/api/users",async e=>(N(e,"ADMIN"),B(e,await T("jse_admin_users",S(e),{action:"LIST"}))));h("/api/users",async e=>{N(e,"ADMIN");let t=await f(e,"jse_admin_users",e.body||{},[]);return Ie.clear(),t});var el={roster_assignments:{fn:"jse_import_roster_assignments",required:["team_number","team_code","broker_number","broker_code","broker_name"],map:{"team number":"team_number","team no":"team_number","team code":"team_code","broker number":"broker_number","broker no":"broker_number","broker code":"broker_code","broker name":"broker_name"}},dalal_roster:{fn:"jse_import_dalal_roster",required:["team","broker_code"],map:{"team name":"team","team code":"team","broker code":"broker_code","section combination":"section_combination","section 1":"section1","section 2":"section2","participant 1":"participant1","contact number 1":"phone1","usn 1":"usn1","email 1":"email1","participant 2":"participant2","contact number 2":"phone2","usn 2":"usn2","email 2":"email2"}},companies:{fn:"jse_import_companies",required:["name","ticker","base_price"],map:{"company name":"name",name:"name",company:"name",ticker:"ticker",symbol:"ticker","base price":"base_price",base_price:"base_price",price:"base_price"}},teams:{fn:"jse_update_teams",required:["team"],map:{team:"team","team code":"team","team name":"name",name:"name",section:"section",broker:"broker","broker code":"broker",members:"members","participant members":"members"}},brokers:{fn:"jse_update_brokers",required:["broker"],map:{"broker code":"broker",broker:"broker",code:"broker","broker name":"name",name:"name",contact:"contact","broker contact":"contact",desk:"desk","broker desk":"desk"}},allotments:{fn:"jse_ipo_allot",required:["team","ipo","lots"],map:{team:"team","team code":"team",ipo:"ipo","ipo code":"ipo",symbol:"ipo",lots:"lots",shares:"shares",quantity:"shares",amount:"amount"}}};h("/api/import",async e=>{N(e,"ADMIN");let t=e.body||{},s=el[String(t.kind||"")];if(!s)throw new O(400,"INVALID_IMPORT","Choose what to import: roster assignments, companies, teams, brokers or allotments.");let a;try{if(typeof t.csv_text=="string")a=aa(t.csv_text);else{let E=Buffer.from(String(t.data_base64||""),"base64");if(!E.length)throw new Error("The file is empty.");a=/\.csv$/i.test(String(t.filename||""))?aa(E.toString("utf8")):nn(new Uint8Array(E))}}catch(E){throw new O(400,"UNREADABLE_FILE",E.message||"The file could not be read.")}let i=a.findIndex(E=>E.some(_=>s.map[_.trim().toLowerCase()]));if(i<0)throw new O(400,"MISSING_HEADERS","The first row must contain the column names ("+Object.keys(s.map).slice(0,5).join(", ")+").");let r=a[i].map(E=>s.map[E.trim().toLowerCase()]||""),n=s.required.filter(E=>!r.includes(E));if(n.length)throw new O(400,"MISSING_HEADERS","Missing column(s): "+n.join(", ")+".");let o=a.slice(i+1).filter(E=>E.some(_=>_!=="")).map(E=>{let _={};return r.forEach((c,l)=>{c&&E[l]!==void 0&&E[l]!==""&&(_[c]=E[l])}),_});if(!o.length)throw new O(400,"NO_ROWS","The file has no data rows.");if(String(t.kind)==="dalal_roster"){let E=_=>String(_??"").trim();o=o.map(_=>{let c=E(_.section_combination)||[E(_.section1),E(_.section2)].filter(Boolean).join(" + "),l=d=>[E(_["participant"+d]),E(_["usn"+d])?"USN: "+E(_["usn"+d]):"",E(_["phone"+d])?"Mobile: "+E(_["phone"+d]):"",E(_["email"+d])?"Email: "+E(_["email"+d]):""].filter(Boolean).join(" | ");return{team:E(_.team),broker_code:E(_.broker_code),section:c,members:[l("1"),l("2")].filter(Boolean).join(" ; ")}})}if(o.length>(String(t.kind)==="roster_assignments"?1e4:2e3))throw new O(400,"TOO_MANY_ROWS",String(t.kind)==="roster_assignments"?"At most 10,000 roster rows per upload; split a larger file into validated batches.":"At most 2,000 rows per import.");return f(e,s.fn,{rows:o,admin_password:t.admin_password,dry_run:!!t.dry_run,replace:!!t.replace,batch_id:t.filename?String(t.filename).slice(0,60):void 0})},3e6);L("/api/reports",async e=>(N(e,"ADMIN","VIEWER"),$(e,200,await V("staff:reports",3e3,()=>T("jse_reports",S(e),{})))));var ia=null;async function cn(){return ia||(ia=(await he("SELECT jse_export_sheets() AS s")).rows[0].s),ia}function ut(){let e=new Date(Date.now()+198e5).toISOString();return e.slice(0,10)+"_"+e.slice(11,16).replace(":","")}L("/api/export",async e=>{N(e,"ADMIN","VIEWER");let t=Ne(e,"sheet")||"networth",s=(Ne(e,"format")||"csv").toLowerCase(),a=await T("jse_export",S(e),{sheet:t});if(s==="json")return B(e,a);let i=dt(a.columns,a.rows);return new Response(i,{status:200,headers:{"content-type":"text/csv; charset=utf-8","content-disposition":`attachment; filename="JSE_${t}_${ut()}.csv"`,"cache-control":"no-store",...Ve(e)}})});L("/api/export-event-excel",async e=>{N(e,"ADMIN","VIEWER");let t=[];for(let[a,i]of await cn()){let r=await T("jse_export",S(e),{sheet:a});t.push({name:i,columns:r.columns,rows:r.rows})}let s=an(t,"JAIN STOCK EXCHANGE \u2014 Final Event Report");return await T("jse_audit_note",S(e),{action:"EXPORT_EVENT_EXCEL",sheets:t.length}).catch(()=>null),new Response(s,{status:200,headers:{"content-type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","content-disposition":`attachment; filename="JSE_Final_Event_Report_${ut()}.xlsx"`,"cache-control":"no-store",...Ve(e)}})});var ra=[["winner","WINNER & RUNNER-UP"],["networth","NET WORTH & P/L"],["trades","ALL TRANSACTIONS (SETTLED TRADES)"],["orders","ALL ORDERS (INCLUDING REJECTED)"],["ledger","CASH LEDGER"],["prices","PRICE CHANGES"],["news","MARKET NEWS"],["audit","AUDIT LOG"]];L("/api/export-event-csv",async e=>{N(e,"ADMIN","VIEWER");let t=await T("jse_event_status",null).catch(()=>null),s=[dt(["JAIN STOCK EXCHANGE \u2014 FINAL EVENT CSV"],[["Event: "+(t?.event_name||"DALAL STREET 2026")],["Status: "+String(t?.status||"").replace(/_/g," ")],["Generated (IST): "+ut().replace("_"," ").replace(/(\d\d)(\d\d)$/,"$1:$2")],["Sections: "+ra.map(([,i])=>i).join(" | ")]])];for(let[i,r]of ra){let n=await T("jse_export",S(e),{sheet:i});s.push(dt([r+" ("+n.rows.length+" rows)"],[])+dt(n.columns,n.rows))}let a="\uFEFF"+s.map(i=>i.replace(/\ufeff/g,"")).join(`\r
`);return await T("jse_audit_note",S(e),{action:"EXPORT_EVENT_CSV",sheets:ra.length}).catch(()=>null),new Response(a,{status:200,headers:{"content-type":"text/csv; charset=utf-8","content-disposition":`attachment; filename="JSE_Final_Event_${ut()}.csv"`,"cache-control":"no-store",...Ve(e)}})});L("/api/export-event-json",async e=>{N(e,"ADMIN","VIEWER");let t={};for(let[i,r]of await cn()){let n=await T("jse_export",S(e),{sheet:i});t[i]={title:r,columns:n.columns,rows:n.rows}}let s=await T("jse_event_status",null),a=JSON.stringify({success:!0,service:"JAIN STOCK EXCHANGE",version:na,generated_at:new Date().toISOString(),event:s,sheets:t});return await T("jse_audit_note",S(e),{action:"EXPORT_EVENT_JSON",sheets:Object.keys(t).length}).catch(()=>null),new Response(a,{status:200,headers:{"content-type":"application/json; charset=utf-8","content-disposition":`attachment; filename="JSE_Final_Event_${ut()}.json"`,"cache-control":"no-store",...Ve(e)}})});async function tl(e,t=2e6){if(Number(e.headers.get("content-length")||0)>t)throw new O(413,"TOO_LARGE","The request is too large.");let a=await e.text();if(a.length>t)throw new O(413,"TOO_LARGE","The request is too large.");if(!a.trim())return{};try{return JSON.parse(a)}catch{throw new O(400,"INVALID_JSON","The request body is not valid JSON.")}}function sl(e){let t=e.headers.get("x-forwarded-for");return(e.headers.get("cf-connecting-ip")||(t?t.split(",")[0].trim():"")||e.headers.get("x-real-ip")||"").slice(0,64)}async function al(e){let t=new URL(e.url),s={req:e,url:t,method:e.method.toUpperCase(),ip:sl(e),ua:(e.headers.get("user-agent")||"").slice(0,300),origin:e.headers.get("origin"),token:null,user:null,body:null,started:Date.now(),reqId:(e.headers.get("x-request-id")||$c()).slice(0,36)};if(s.method==="OPTIONS")return new Response(null,{status:204,headers:Ve(s)});let a=t.pathname.replace(/\/+$/,"")||"/";a.startsWith("/api")||(a="/api"+(a==="/"?"/health":a));try{let i=Ut.get(s.method+" "+a);if(!i){let n=Ut.has((s.method==="GET"?"POST ":"GET ")+a);throw new O(n?405:404,n?"METHOD_NOT_ALLOWED":"NOT_FOUND",n?"Method not allowed.":"Unknown API endpoint: "+a)}await Ur();let r=e.headers.get("authorization")||"";return s.token=r.toLowerCase().startsWith("bearer ")?r.slice(7).trim():null,s.user=await zc(s.token),s.method==="POST"&&(s.body=await tl(e,i.maxBody)),await i.h(s)}catch(i){return Jc(s,i)}}var gu={fetch:al};export{na as VERSION,gu as default,al as handle};
