importScripts('cube-vendor.js','engine.js');
onmessage=e=>{try{CubeCoach.checkValid(e.data,Cube);const stages=CubeCoach.solve(e.data,n=>postMessage({progress:n}));postMessage({stages});}catch(err){postMessage({error:err.message});}};
