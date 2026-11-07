/* Picture-led beginner cases. Gray stickers deliberately stand for ANY color. */
(function(root){'use strict';
const T=(root.KubiI18n||require('./i18n.js')).t;
const E=typeof CubeCoach!=='undefined'?CubeCoach:require('./engine.js');
const ALG={corner:"R U R' U'",right:"U R U' R' U' F' U F",left:"U' L' U L U F U' F'",cross:"F R U R' U' F'",edges:"R U R' U R U2 R'",homes:"U R U' L' U R' U' L",twist:"R' D' R D"};
const blank=()=>Array(54).fill('?');
function state(pairs,centers=[4]){const a=blank();for(const i of centers)a[i]=E.SOLVED[i];for(const [k,v]of Object.entries(pairs))a[+k]=v;return a.join('');}
function mask(s,ids){const a=blank();for(const i of ids)a[i]=s[i];return a.join('');}
const centers=[4,13,22,31,40,49],whiteCross=[28,30,31,32,34];
function inverseDemo(alg,ids){return mask(E.apply(E.SOLVED,E.inverse(alg)),ids);}
function goal(n){let ids=[];let s=E.SOLVED;if(n===0)return state({1:'D',3:'D',5:'D',7:'D'});if(n===1)ids=[...whiteCross,...centers,25,16,43,52];if(n===2)ids=E.STICKERS.filter(x=>x.p[1]===-1||centers.includes(x.index)).map(x=>x.index);if(n===3)ids=E.STICKERS.filter(x=>x.p[1]<1||centers.includes(x.index)).map(x=>x.index);if(n===4)ids=[1,3,4,5,7];if(n===5)ids=[1,3,4,5,7,10,13,19,22,37,40,46,49];if(n===6){s=state({8:'F',9:'U',20:'R',4:'U',13:'R',22:'F',2:'U',11:'B',45:'R',0:'L',36:'U',47:'B',6:'F',18:'L',38:'U'});return s;}if(n===7)return E.SOLVED;return mask(s,ids);}
const missions=[
{name:T("פרח"),icon:'✿',voice:T("נחפש חלק עם שני צבעים, שאחד מהם לבן. נביא ארבעה לבנים מסביב לצהוב."),eye:[3,7,5]},
{name:T("פלוס לבן"),icon:'✚',voice:T("נחפש עלה לבן, שהצבע בצד שלו מתאים לצבע האמצע שמתחתיו."),eye:[4,-5,6]},
{name:T("פינות"),icon:'◈',voice:T("נחפש פינה לבנה למעלה. שני הצבעים האחרים שלה צריכים להתאים לשני האמצעים של הבית שמתחתיה."),eye:[4,-4,6]},
{name:T("חגורה"),icon:'▰',voice:T("נחפש חלק עם שני צבעים, בלי צהוב. נתאים את הצבע הקדמי לאמצע. הצבע שלמעלה אומר לנו לאיזה צד ללכת."),eye:[4,2,6]},
{name:T("פלוס צהוב"),icon:'✚',voice:T("נסתכל מלמעלה. איזו צורה רואים? הפינות לא חשובות עכשיו."),eye:[0,9,.01]},
{name:T("אותו צבע"),icon:'≋',voice:T("נסתכל על הצבעים בצד של הפלוס הצהוב. כמה מהם מתאימים לאמצעים?"),eye:[4,4,6]},
{name:T("בתים"),icon:'⌂',voice:T("פינה נמצאת בבית שלה כששלושת הצבעים שלה מתאימים לשלושת האמצעים מסביבה. הצהוב עוד לא חייב להיות למעלה."),eye:[4,4,6]},
{name:T("קסם אחרון"),icon:'★',voice:T("עכשיו לא מסובבים את כל הקובייה. נטפל בארבע הפינות, אחת אחרי השנייה. מסיימים כל קבוצה של ארבע תנועות, גם אם למטה נראה מבולגן."),eye:[4,3,6]}
];
const daisyCases=[
{id:'daisy-right',label:T("כאן"),aria:T("לבן בצד הקדמי, באמצע מימין"),start:state({23:'D'}),highlight:[23,12],free:5,moves:['R']},
{id:'daisy-left',label:T("כאן"),aria:T("לבן בצד הקדמי, באמצע משמאל"),start:state({21:'D'}),highlight:[21,41],free:3,moves:["L'"]},
{id:'daisy-down',label:T("מתחת"),aria:T("לבן פונה למטה, בקצה הקרוב אליך"),start:state({28:'D'}),highlight:[28,25],eye:[4,-5,6],free:7,moves:['F','F']},
{id:'daisy-low',label:T("כאן"),aria:T("לבן בצד הקדמי, באמצע השורה התחתונה"),start:state({25:'D'}),highlight:[25,28],free:7,moves:["F'"],then:'daisy-right'},
{id:'daisy-high',label:T("כאן"),aria:T("לבן בצד הקדמי, באמצע השורה העליונה"),start:state({19:'D'}),highlight:[19,7],moves:['F'],then:'daisy-right'}
];
const cornerCases=[
{id:'corner-up',label:T("למעלה"),aria:T("פינה לבנה למעלה; הלבן פונה למעלה"),start:state({8:'D',9:'F',20:'R'},centers),highlight:[8,9,20],links:[[9,22],[20,13]],moves:E.tokens(ALG.corner)},
{id:'corner-right',label:T("בצד"),aria:T("פינה לבנה למעלה; הלבן פונה ימינה"),start:state({8:'R',9:'D',20:'F'},centers),highlight:[8,9,20],links:[[8,13],[20,22]],moves:E.tokens(ALG.corner)},
{id:'corner-front',label:T("מולי"),aria:T("פינה לבנה למעלה; הלבן פונה אליך"),start:state({8:'F',9:'R',20:'D'},centers),highlight:[8,9,20],links:[[8,22],[9,13]],moves:E.tokens(ALG.corner)},
{id:'corner-stuck',label:T("תקועה"),aria:T("פינה לבנה בשכבה התחתונה, אבל לא בבית הנכון"),start:state({29:'F',26:'D',15:'R'},centers),highlight:[29,26,15],eye:[4,-2,6],moves:E.tokens(ALG.corner),eject:true}
];
const middleCases=[
{id:'middle-right',label:T("ימינה"),aria:T("הצבע הקדמי מתאים לאמצע, והצבע העליון מתאים לצד ימין"),start:state({7:'R',19:'F'},centers),highlight:[7,19],links:[[19,22],[7,13]],moves:E.tokens(ALG.right)},
{id:'middle-left',label:T("שמאלה"),aria:T("הצבע הקדמי מתאים לאמצע, והצבע העליון מתאים לצד שמאל"),start:state({7:'L',19:'F'},centers),highlight:[7,19],links:[[19,22],[7,40]],eye:[-4,3,6],moves:E.tokens(ALG.left)},
{id:'middle-stuck',label:T("תקוע"),aria:T("אין חלק בלי צהוב למעלה, אבל החגורה עדיין לא פתורה; החלק הלא נכון מימין מלפנים"),start:state({23:'R',12:'F',7:'U',19:'F'},centers),highlight:[23,12],moves:E.tokens(ALG.right),eject:true}
];
const yellowCases=[
{id:'yellow-dot',label:T("נקודה"),aria:T("רק נקודה צהובה באמצע; מתעלמים מהפינות"),start:state({}),highlight:[4],face:'U',moves:E.tokens(ALG.cross)},
{id:'yellow-elbow',label:T("פינה"),aria:T("צורת ריש צהובה, למעלה ומשמאל בתמונה"),start:state({1:'U',3:'U'}),highlight:[1,3,4],face:'U',moves:E.tokens(ALG.cross)},
{id:'yellow-line',label:T("קו"),aria:T("קו צהוב אופקי משמאל לימין"),start:state({3:'U',5:'U'}),highlight:[3,4,5],face:'U',moves:E.tokens(ALG.cross)}
];
const edgeCases=[
{id:'edges-adjacent',label:T("שכנים"),aria:T("שני זוגות מתאימים: מאחור ומימין"),start:state({1:'U',3:'U',5:'U',7:'U',10:'R',46:'B',19:'L',37:'F'},centers),highlight:[10,13,46,49],eye:[6,4,-5],moves:E.tokens(ALG.edges)},
{id:'edges-opposite',label:T("ממול"),aria:T("שני זוגות מתאימים זה מול זה"),start:state({1:'U',3:'U',5:'U',7:'U',19:'F',46:'B',10:'L',37:'R'},centers),highlight:[19,22,46,49],moves:E.tokens(ALG.edges)},
{id:'edges-align',label:T("לחפש"),aria:T("פחות משני זוגות מתאימים; מסובבים רק את השכבה העליונה ובודקים שוב"),start:state({1:'U',3:'U',5:'U',7:'U',19:'R',10:'B',46:'L',37:'F'},centers),moves:['U']}
];
const homeCases=[
{id:'homes-one',label:T("מצאתי"),aria:T("פינה אחת בבית הנכון; מחזיקים אותה מלפנים ומימין"),start:mask(goal(6),[8,9,20,...centers]),highlight:[8,9,20],moves:E.tokens(ALG.homes)},
{id:'homes-none',label:T("אין"),aria:T("אף פינה אינה בבית הנכון"),start:state({8:'B',9:'U',20:'L',4:'U',13:'R',22:'F'},centers),highlight:[8,9,20],moves:E.tokens(ALG.homes)}
];
const crossCases=[
{id:'white-match',label:T("אותו צבע"),aria:T("עלה לבן למעלה, והמדבקה שמתחתיו מתאימה לאמצע הקדמי"),start:state({7:'D',19:'F'},centers),highlight:[7,19,22],links:[[19,22]],moves:['F','F']},
{id:'white-find',label:T("לחפש"),aria:T("מסובבים את העליונה עד שצבע הצד של עלה לבן מתאים לאמצע שמתחתיו"),start:state({7:'D',19:'R'},centers),highlight:[7,19,22],moves:['U']}
];
const all=[daisyCases,crossCases,cornerCases,middleCases,yellowCases,edgeCases,homeCases,[]];
function getCase(id){return all.flat().find(c=>c.id===id);}
function expand(moves){return E.tokens(moves).flatMap(m=>m.endsWith('2')?[m[0],m[0]]:[m]);}
function quarterMove(m){return {face:m[0],clockwise:!m.endsWith("'")};}
function cameraBetween(from,to,t){const len=8;const spherical=v=>[Math.atan2(v[0],v[2]),Math.atan2(v[1],Math.hypot(v[0],v[2]))];let [a,b]=spherical(from),[c,d]=spherical(to);let delta=((c-a+Math.PI*3)%(Math.PI*2))-Math.PI;let yaw=a+delta*t,pitch=b+(d-b)*t;return [len*Math.sin(yaw)*Math.cos(pitch),len*Math.sin(pitch),len*Math.cos(yaw)*Math.cos(pitch)];}
const api={ALG,missions,all,getCase,goal,state,mask,blank,expand,cameraBetween,centers,quarterMove};root.CubeLessons=api;if(typeof module!=='undefined')module.exports=api;
})(typeof self!=='undefined'?self:globalThis);
