const apiBase = '';

function setUserInfo(user){
  const nameEl = document.getElementById('username');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginForm = document.getElementById('loginForm');
  const loginHeader = document.getElementById('loginHeader');
  if(user){
    nameEl.textContent = user.name;
    logoutBtn.style.display = 'inline-block';
    loginForm.style.display = 'none';
    loginHeader.style.display = 'none';
  } else {
    nameEl.textContent = '';
    logoutBtn.style.display = 'none';
    loginForm.style.display = 'block';
    loginHeader.style.display = 'block';
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
          <small class="event-meta">ID: ${ev.id}</small>
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

document.getElementById('createEventForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const title = document.getElementById('eventName').value;
  const description = document.getElementById('eventDescription').value;
  const date = document.getElementById('eventDate').value;
  const location = document.getElementById('eventLocation').value;
  const token = getToken();
  if(!token){
    alert('You must be logged in to create an event');
    return;
  }
  else{
    try{
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, date, location })
      });
      if(res.ok){
        alert('Event created successfully');
        document.getElementById('createEventForm').reset();
      }
      if(!res.ok){
        const err = await res.json().catch(()=>({message:'Unknown error'}));
        throw new Error(err.message || 'Failed to create event');
      }
    }
    catch(err){
      alert(err.message);
    }
  }
});

document.getElementById('deleteEventBtn').addEventListener('click', async (e)=>{
  e.preventDefault();
  const eventId = document.getElementById('deleteEventId').value;
  const token = getToken();
  if(!token){
    alert('You must be logged in to delete an event');
    return;
  }
  try{
    const res = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if(res.ok){
      alert('Event deleted successfully');
      document.getElementById('deleteEventId').value = '';
    }
    if(!res.ok){
      const err = await res.json().catch(()=>({message:'Unknown error'}));
      throw new Error(err.message || 'Failed to delete event');
    }
  }
  catch(err){
    alert(err.message);
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