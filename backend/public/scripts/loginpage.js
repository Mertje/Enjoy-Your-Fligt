const login = document.querySelector("#login");

login.onsubmit = async (e) => {
  e.preventDefault();
  const user = document.querySelector("#numberFlight");
  if (!user.value) {
    return window.alert("FOUT: Ontbrekend ticketnummer");
  }
  try {
    const dataJson = await fetch(`${window.location.origin}/login/${user.value}`, { method: "post" });
    const data = await dataJson.json();
    console.log(data);

    if (dataJson.status !== 200) {
      return window.alert("Er ging iets mis, probeer het opnieuw: " + data.error);
    }
    user.value = "";
    document.cookie = `token=${data.user_token}`;
    document.cookie = `username=${data.user_name}`;

    window.location.replace("/index");
  } catch (error) {
    window.alert("interne fout: " + error);
  }
};
