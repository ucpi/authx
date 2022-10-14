const axios=require("axios").default;
const Web3=require("web3");
const ethers=require("ethers");
const abi=require("./abi.json");
const web3 = new Web3('https://api.s0.ps.hmny.io');
const contract_address="0xdC092Ea4D6e83B303ff731ACdC6f4Bf3764Fb803";
const contract = new web3.eth.Contract(abi, contract_address);
async function nodecount(){
    var v;
await contract.methods
.nodecount()
.call()
.then((c)=>{
  v=c;
}); 
return v;
}
async function nodenameat(x){
  var naam;
var nodecoun=await nodecount();
    contract.methods
    .nodeatindex(x)
    .call()
    .then((c)=>{
      naam=c;
    });
    return naam;
}   
async function noderpc(index){
var rc;
await contract.methods
    .nodes(index)
    .call()
    .then((c)=>{
     rc=c[2];
    });
return rc;
} 
   
async function allnoderpc(){
  var no=await nodecount();
  //console.log(no);
  for(var x=0;x<no;x++){
    var rpc=await noderpc(x);
    console.log(rpc);
   }
}

async function getproof(aud,jwt){
  var no=await nodecount();
  let rpcurl=[];
  let jwtsign=[];
  var signedwhois=[];
  var signedjwthash=[]
  for(var x=0;x<no;x++){
    var rpc=await noderpc(x);
    rpcurl.push(rpc+"/verify?jwt="+jwt+"&aud="+aud);
  }
  axios.all(rpcurl.map((endpoint) => axios.get(endpoint))).then(
      axios.spread((...allData) => {
        console.log({ allData });
        for(var i=0;i<no;i++){
         var res=allData[i].data;
         var rres=res.split("$");
          signedjwthash.push(rres[0]);
          signedwhois.push(rres[1]);
        }

      })
      // var fullres=data.split("$");
      // jwtsign.push(fullres[0]);
      // whoissign.push(whoissign[0]);
      
    
  );

 return jwtsign[0];
}
async function metamask(){
  const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
  const account = accounts[0];
  console.log(account);
}
async function init(jwthash){
  const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      contract_address,
      abi,
      signer
    );
    contract.authrlogin(jwthash).then((e) => {
      return e.hash;
    });
}
async function autologin(aud,jwt){
  const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      contract_address,
      abi,
      signer
    );
    const jwthash = Web3.utils.sha3(jwt);
    contract.authrlogin(jwthash).then((e) => {
      getproof(aud,jwt).then(e=>{
        return e;
      })
    });
}
module.exports.nodecount=nodecount;
module.exports.nodenameat=nodenameat;
module.exports.noderpc=noderpc;
module.exports.allnoderpc=allnoderpc;
module.exports.init=init;
module.exports.metamask=metamask;
module.exports.getproof=getproof;
module.exports.autologin=autologin;