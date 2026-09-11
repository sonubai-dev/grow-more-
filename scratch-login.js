const key = 'AIzaSyClRmtIEAy2kz9N_72QvP3D4-iruXEpHhs';
fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + key, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'ssdd747346@gmail.com', password: 'SOnu12@@', returnSecureToken: true })
})
.then(r => r.json())
.then(console.log);
