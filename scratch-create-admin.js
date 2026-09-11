const key = 'AIzaSyClRmtIEAy2kz9N_72QvP3D4-iruXEpHhs';
fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + key, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'ssdd747346@gmail.com', password: 'SOnu12@@', returnSecureToken: true })
})
.then(r => r.json())
.then(data => {
  if (data.error && data.error.message === 'EMAIL_EXISTS') {
    console.log('User already exists, changing password instead...');
    // We can't change password without the token easily unless we login, 
    // let's try logging in. If it fails, maybe we can't reset it from here easily.
  }
  console.log(data);
});
