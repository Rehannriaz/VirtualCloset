document.getElementById("confirm-password").addEventListener('input', passMatch);

function passMatch() {
    const pass = document.getElementById("password");
    const confpass = document.getElementById("confirm-password");
    const holder = document.getElementById('confirm-password').parentElement;
    const existingParag = document.getElementById('errorMSG');
    const submitBtn = document.querySelector('button[type="submit"]');
  
    if (pass.value === confpass.value) {
      if (existingParag) {
        holder.removeChild(existingParag);
      }
      submitBtn.disabled = false;
    } else {
      if (!existingParag) {
        const parag = document.createElement('p');
        parag.id = "errorMSG";
        parag.textContent = "Passwords Do not match";
        holder.append(parag);
      }
      submitBtn.disabled = true;
    }
  }
  
