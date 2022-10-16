import axios from "axios";
import Web3, { utils } from "web3";
import {ethers, providers, Contract } from "ethers";
import abi from "./abi.json";
const web3 = new Web3('https://api.s0.ps.hmny.io');
const contract_address="0x8B6E9383Cf9DDEe4F049a395C2FB4dedCBA50157";
const contract = new web3.eth.Contract(abi, contract_address);
export async function nodecount(){
    var v;
await contract.methods
.nodecount()
.call()
.then((c)=>{
  v=c;
}); 
return v;
}
export async function nodenameat(x){
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
export async function noderpc(index){
var rc;
await contract.methods
    .nodes(index)
    .call()
    .then((c)=>{
     rc=c[2];
    });
return rc;
} 
   
export async function allnoderpc(){
  var no=await nodecount();
  //console.log(no);
  for(var x=0;x<no;x++){
    var rpc=await noderpc(x);
    console.log(rpc);
   }
}

export async function getproof(aud,jwt){
  var no=await nodecount();
  let rpcurl=[];
  let jwtsign=[];
  var signedwhois=[];
  var signedjwthash=[];
  var whoish;
  var jwth=utils.sha3(jwt);
  console.log(jwt);
  console.log(jwth);
  console.log(axios);
  console.log(Web3);
  axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${jwt}`)
  .then(function (resp) {
    whoish=utils.sha3(resp.data.email);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });
 
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
     
        axios.post('http://localhost:4000/putproof', {
          jwthash: jwth,
          whoishash:whoish,
          sijhash:signedjwthash,
          siwhash:signedwhois,
          jwth:jwth,
        })
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
      })
    
  );

 return jwtsign[0];
}
export async function metamask(){
  const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
  const account = accounts[0];
  console.log(account);
}
export async function init(jwthash,scaddress){
  const provider = new providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new Contract(
      contract_address,
      abi,
      signer
    );
    contract.authxlogin(jwthash,scaddress).then((e) => {
      return e.hash;
    });
}
export async function autologin(aud,jwt,scaddress){
  const provider = new providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new Contract(
      contract_address,
      abi,
      signer
    );
    const jwthash = utils.sha3(jwt);
    contract.authxlogin(jwthash,scaddress).then((e) => {
      getproof(aud,jwt).then(e=>{
        return e;
      })
    });
}
// const _nodecount = nodecount;
// export { _nodecount as nodecount };
// const _nodenameat = nodenameat;
// export { _nodenameat as nodenameat };
// const _noderpc = noderpc;
// export { _noderpc as noderpc };
// const _allnoderpc = allnoderpc;
// export { _allnoderpc as allnoderpc };
// const _init = init;
// export { _init as init };
// const _metamask = metamask;
// export { _metamask as metamask };
// const _getproof = getproof;
// export { _getproof as getproof };
// const _autologin = autologin;
// export { _autologin as autologin };