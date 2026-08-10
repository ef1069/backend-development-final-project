const apiBase = '';

function setUserInfo(user){
  const nameEl = document.getElementById('userName');
  const logoutBtn = document.getElementById('logoutBtn');
  if(user){
    nameEl.textContent = user.name || user.email;
    logoutBtn.style.display = 'inline-block';
  } else {
    nameEl.textContent = '';
    logoutBtn.style.display = 'none';
  }
}

function getToken(){
  return localStorage.getItem('token');
} 

async function login(email, password){
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email, password })
  });

  if(!res.ok) throw new Error('Login failed');
  return res.json();
}

async function fetchEvents(){
  const token = getToken();
  const res = await fetch('/api/events', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if(!res.ok){
    const err = await res.json().catch(()=>({message:'Unknown error'}));
    throw new Error(err.message || 'Failed to fetch events');
  }
  return res.json();
}

document.getElementById('loginForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try{
    const data = await login(email,password);
    localStorage.setItem('token', data.token);
    setUserInfo(data.user);
    alert('Logged in');
  }catch(err){
    alert(err.message);
  }
});

document.getElementById('fetchEvents').addEventListener('click', async ()=>{
  const eventsEl = document.getElementById('events');
  eventsEl.innerHTML = 'Loading...';
  try{
    const data = await fetchEvents();
    eventsEl.innerHTML = '';
    (data.events || []).forEach(ev=>{
      const div = document.createElement('div');
      div.className = 'card event-card';
      div.innerHTML = `
        <div class="event-header">
          <strong class="event-title">${ev.title}</strong>
          <small class="event-meta">${ev.date || ''}${ev.location ? ' @ ' + ev.location : ''}</small>
        </div>
        <div class="event-description">${ev.description || ''}</div>
      `;
      eventsEl.appendChild(div);
    });
  }catch(err){
    eventsEl.innerHTML = `<div style="color:red">${err.message}</div>`;
  }
});

document.getElementById('logoutBtn').addEventListener('click', ()=>{
  localStorage.removeItem('token');
  setUserInfo(null);
});

// initialize
const storedToken = getToken();
if(storedToken){
  // Optionally, you could decode token to show user name if encoded
  setUserInfo({ name: 'You' });
}