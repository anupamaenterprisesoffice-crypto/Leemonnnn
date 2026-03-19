// 🔥 YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyApLpqXTnuPsT5rdDG04jLMlW-a0ERkbpM",
  authDomain: "stockgameultra.firebaseapp.com",
  databaseURL: "https://stockgameultra-default-rtdb.firebaseio.com",
  projectId: "stockgameultra",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser = null;

// LOGIN
function login(){
  let u=user.value;
  let p=pass.value;

  db.ref("users/"+u).once("value", snap=>{
    if(!snap.exists()){
      db.ref("users/"+u).set({
        password:p,
        balance:1000,
        banned:false
      });
    }

    db.ref("users/"+u).once("value", s=>{
      let data=s.val();

      if(data.banned){
        alert("You are banned");
        return;
      }

      if(data.password!==p){
        alert("Wrong password");
        return;
      }

      currentUser=u;

      loginDiv.style.display="none";
      app.style.display="block";

      if(u==="Virat" || u==="YUG1ADMIN"){
        adminPanel.style.display="block";
      }

      loadData();
    });
  });
}

// LOAD DATA
function loadData(){
  db.ref("users/"+currentUser).on("value", s=>{
    bal.innerText=s.val().balance;
  });

  db.ref("users").on("value", snap=>{
    let arr=[];
    snap.forEach(s=>{
      arr.push({name:s.key,balance:s.val().balance});
    });

    arr.sort((a,b)=>b.balance-a.balance);

    leaderboard.innerHTML=arr.slice(0,10).map((u,i)=>
      `<p>#${i+1} ${u.name} - ${u.balance}</p>`
    ).join("");
  });

  db.ref("chat").limitToLast(20).on("value", snap=>{
    let html="";
    snap.forEach(s=>{
      let d=s.val();
      html+=`<p><b>${d.user}:</b> ${d.text}</p>`;
    });
    chat.innerHTML=html;
  });
}

// TRADE
function buy(){
  let amt=Number(amount.value);
  db.ref("users/"+currentUser+"/balance")
    .transaction(b=>b+amt);
}

function sell(){
  let amt=Number(amount.value);
  db.ref("users/"+currentUser+"/balance")
    .transaction(b=>b-amt);
}

// SEND MONEY
function sendMoney(){
  let to=toUser.value;
  let amt=Number(sendAmt.value);

  db.ref("users/"+currentUser).once("value", s=>{
    if(s.val().balance<amt){
      alert("No money");
      return;
    }

    db.ref("users/"+currentUser+"/balance")
      .transaction(b=>b-amt);

    db.ref("users/"+to+"/balance")
      .transaction(b=>(b||0)+amt);
  });
}

// CHAT
function sendChat(){
  db.ref("chat").push({
    user:currentUser,
    text:msg.value
  });
  msg.value="";
}

// ADMIN BAN
function ban(){
  let u=banUser.value;

  if(u==="Virat"){
    alert("Cannot ban owner");
    return;
  }

  db.ref("users/"+u+"/banned").set(true);
}

// SIMPLE CANDLE CHART
let ctx=document.getElementById("chart").getContext("2d");

function drawChart(){
  ctx.clearRect(0,0,300,150);

  for(let i=0;i<20;i++){
    let open=Math.random()*100;
    let close=Math.random()*100;

    ctx.fillStyle=close>open?"green":"red";
    ctx.fillRect(i*15,150-close,10,Math.abs(close-open));
  }
}

setInterval(drawChart,2000);