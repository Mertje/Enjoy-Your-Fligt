const form = document.querySelector("#login");

form.onsubmit = async (e) => {
  e.preventDefault();
  const password = document.querySelector("#password").value;
  const username = document.querySelector("#username").value;

  try {
    const logged = await fetch(`${window.location.origin}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: password,
        username: username,
      }),
    });

    const loggedJson = await logged.json();
    document.cookie = `token=${loggedJson.user_token}`;
    window.location.replace("/admin/index");
  } catch (err) {
    window.alert("Er is iets fout gegaan, probeer het opnieuw.");
  }
};
