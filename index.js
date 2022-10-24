import axios from "axios";
import Web3, { utils } from "web3";
import {ethers, providers, Contract } from "ethers";
import abi from "./abi.json";
import { io } from "socket.io-client";
const web3 = new Web3('https://api.s0.ps.hmny.io');
const contract_address="0xC6D2C5E62729eA64a6611705616323c0372A2686";
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

export async function getproof(aud,jwt,tracker){
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
  var st;
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
     
        axios.post('https://www.ucpi.ml/putproof', {
          jwthash: jwth,
          whoishash:whoish,
          sijhash:signedjwthash,
          siwhash:signedwhois,
          jwth:jwth,
        })
        .then(function (response) {
          console.log(response);
          sendnoti(tracker,"true");
         // window.close();
        
        })
        .catch(function (error) 
        {
          sendnoti(tracker,"false");
          console.log(error);
         // window.close();
        });
      })
    
  );
return "success";
}
export async function metamask(){
  const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
  const account = accounts[0];
  console.log(account);
}
export async function init(jwthash,scaddress){
  var x;
  const provider = new providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new Contract(
      contract_address,
      abi,
      signer
    );
    contract.authxlogin(jwthash,scaddress).then((e) => {
       console.log(e);
    x=e;
    });
    return x;
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
        console.log(e);
      return e;
      })
    
    });
}
export async function authxlogin(sc_address,tracker){
  const random=Math.floor(Math.random()*(999999999 - 2 + 1)) + 2;
  const room=".jl"+random.toString();
  const socket=io.connect("http://localhost:4000");
  socket.emit('join', {ido:room});
  sessionStorage.setItem("authxstatToken",room);
 window.open("http://localhost:3000/authx/"+sc_address+"/"+tracker,"Authx","fullscreen=yes");
}
export function sendnoti(receiver,status){
  const socket=io.connect("http://localhost:4000");
  socket.emit('join', {ido:receiver,isadmin:status});
}
// export function load(){
//   document.getElementById("authx").style.display = "none";
//   document.getElementById("content").style.display = "block";
// }
// export function signin(){
//   document.getElementById("authx").style.display = "block";
//   document.getElementById("content").style.display="none";
// }
export function start(){
  const random=Math.random()*420;
  const room=".jl"+toString(random);
  sessionStorage.setItem("authxstatToken",room);
  const socket=io.connect("http://localhost:4000");
  socket.emit('join', {ido:"prnjl"});
}
export function notify(){
   const socket=io.connect("http://localhost:4000");
  // socket.emit('join', {ido:sessionStorage.getItem("authxstatToken")});  
socket.on("new_msg", function(data) {
    // alert(data.msg);
    console.log("line 182",data.msg);
    if(data.msg=="success"){
      console.log(data.msg);
      sessionStorage.setItem("authx",true);
      location.reload();
      socket.close();
    }
    else if(data.msg=="failed"){
      console.log(data.msg);
      sessionStorage.setItem("authx",false);
      location.reload();
      socket.close();
    }
});
}
export function loadauthx(){
  const random=Math.floor(Math.random()*(999999999 - 2 + 1)) + 2;
  const room=".jl"+random.toString();
  const socket=io.connect("http://localhost:4000");
  socket.emit('join', {ido:room});
  sessionStorage.setItem("authxstatToken",room);
  return room;
}
export var isloginauthx=sessionStorage.getItem("authxstatToken");
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
